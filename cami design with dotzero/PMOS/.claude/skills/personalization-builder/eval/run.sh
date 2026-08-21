#!/usr/bin/env bash
# Behavioral eval driver for the personalization-builder skill — Track D gate.
#
# For each case in cases/*.json:
#   1. builds a scratch workspace with the pm-os plugin available
#   2. drives the personalization-builder skill via `claude -p`, feeding the
#      scripted turns from the case spec
#   3. captures the produced context/personalization.md + the model transcript
#   4. runs assert.py to check every assertion in the case spec
#
# Exit non-zero if any case fails, so this can gate a PR.
#
# Usage:
#   ./run.sh                       run all cases (live mode — needs `claude`)
#   ./run.sh --check FILE CASE     run only assert.py against an existing file
#
# Live mode requires a working `claude` CLI with credentials. If `claude` is
# unavailable the script reports SKIP for live cases and still runs any
# assertion-only checks it can — it never reports a false PASS.

set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$HERE/../../.." && pwd)"
CASES_DIR="$HERE/cases"
ASSERT="$HERE/assert.py"

# ---- --check mode: one-shot assertion against an existing file -------------
if [ "${1:-}" = "--check" ]; then
  file="${2:?--check needs FILE}"
  case_json="${3:?--check needs CASE.json path}"
  python3 "$ASSERT" "$case_json" "$file"
  exit $?
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "claude CLI not found — live eval cannot run."
  echo "Install the Claude Code CLI and re-run, or use ./run.sh --check."
  exit 2
fi

PASS=0
FAIL=0
FAILED_CASES=()

# jq-free JSON field reader (python3 is already a repo dependency).
jget() { python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); v=d
for k in sys.argv[2].split("."):
    v = v.get(k) if isinstance(v, dict) else None
print("" if v is None else (json.dumps(v) if isinstance(v,(list,dict,bool)) else v))' "$1" "$2"; }

run_case() {
  local case_json="$1"
  local id; id="$(jget "$case_json" id)"
  local depth; depth="$(jget "$case_json" depth)"
  local headless; headless="$(jget "$case_json" headless)"
  local preplace; preplace="$(jget "$case_json" preplace)"

  local ws; ws="$(mktemp -d)"
  mkdir -p "$ws/context" "$ws/.claude/skills/personalization-builder"
  # Install the skill under test INTO the scratch workspace. Without this the
  # skill is absent and `claude -p` has nothing to run — every write-path case
  # fails file_written (harness fix, 2026-05-21).
  cp "$REPO_ROOT/skills/personalization-builder/SKILL.md" \
     "$ws/.claude/skills/personalization-builder/SKILL.md"

  # Pre-place fixtures -------------------------------------------------------
  case "$preplace" in
    symlink)
      printf 'ORIGINAL-SYMLINK-TARGET\n' > "$ws/.symlink-target.md"
      ln -s "$ws/.symlink-target.md" "$ws/context/personalization.md"
      ;;
    real-file)
      python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("preplace_content",""), end="")' \
        "$case_json" > "$ws/context/personalization.md"
      ;;
  esac

  # Build the prompt: scripted turns become a deterministic answer script.
  local turns; turns="$(python3 -c '
import json,sys
d=json.load(open(sys.argv[1]))
for t in d.get("turns",[]):
    print("USER:", t)
' "$case_json")"

  local headless_env=""
  [ "$headless" = "true" ] && headless_env="MYSECOND_HEADLESS=1"

  local prompt="Read the file .claude/skills/personalization-builder/SKILL.md and execute it exactly as written, as if the skill were invoked with depth=$depth and invoked_by=personalize-mysecond. The current directory is the workspace root.
When the skill would ask the user a question, do NOT wait — take the next scripted USER answer below, in order. Do not invent answers. When the scripted answers run out or the skill finishes, stop and do nothing else.
Scripted answers:
$turns"

  local transcript="$ws/.transcript.txt"
  if [ -n "$headless_env" ]; then
    ( cd "$ws" && MYSECOND_HEADLESS=1 claude -p "$prompt" \
        --allowedTools "Bash,Write,Read,Edit" >"$transcript" 2>&1 ) || true
  else
    ( cd "$ws" && claude -p "$prompt" \
        --allowedTools "Bash,Write,Read,Edit" >"$transcript" 2>&1 ) || true
  fi

  # Optional second run (idempotency case): re-drive the skill in the same
  # workspace with a second set of turns, then assert on the final file.
  local has_rerun; has_rerun="$(jget "$case_json" rerun)"
  if [ -n "$has_rerun" ] && [ "$has_rerun" != "null" ]; then
    local rerun_turns; rerun_turns="$(python3 -c '
import json,sys
d=json.load(open(sys.argv[1]))
for t in d.get("rerun",{}).get("turns",[]):
    print("USER:", t)
' "$case_json")"
    local rerun_prompt="Read the file .claude/skills/personalization-builder/SKILL.md and execute it again exactly as written (depth=$depth, invoked_by=personalize-mysecond). The current directory is the workspace root. A personalization file already exists — confirm the update when the skill asks. When the skill would ask a question, take the next scripted USER answer below, in order; do not invent answers.
Scripted answers:
$rerun_turns"
    ( cd "$ws" && claude -p "$rerun_prompt" \
        --allowedTools "Bash,Write,Read,Edit" >>"$transcript" 2>&1 ) || true
  fi

  # Optional precedence probe: with the produced/pre-placed file as context,
  # issue an explicit instruction and capture whether the skill step wins.
  local probe; probe="$(jget "$case_json" probe)"
  local probe_out="$ws/.probe.txt"
  if [ -n "$probe" ] && [ "$probe" != "null" ]; then
    ( cd "$ws" && claude -p "$probe" \
        --allowedTools "Bash,Read" >"$probe_out" 2>&1 ) || true
  fi

  # Filesystem-level symlink assertions (assert.py cannot see the FS).
  local fs_fail=""
  if [ "$preplace" = "symlink" ]; then
    if [ ! -L "$ws/context/personalization.md" ]; then
      fs_fail="symlink_intact: symlink was replaced/removed"
    elif [ "$(cat "$ws/.symlink-target.md")" != "ORIGINAL-SYMLINK-TARGET" ]; then
      fs_fail="symlink_target_unchanged: symlink target content was modified"
    fi
  fi

  # Run assertion checker.
  local out rc
  if [ -n "$probe" ] && [ "$probe" != "null" ]; then
    out="$(python3 "$ASSERT" "$case_json" "$ws/context/personalization.md" \
            --transcript "$transcript" --probe-output "$probe_out" 2>&1)"
    rc=$?
  else
    out="$(python3 "$ASSERT" "$case_json" "$ws/context/personalization.md" \
            --transcript "$transcript" 2>&1)"
    rc=$?
  fi

  if [ -n "$fs_fail" ]; then
    out="$out"$'\n'"  FAIL  $fs_fail"
    rc=1
  fi

  if [ $rc -eq 0 ]; then
    echo "PASS  $id"
    PASS=$((PASS+1))
  else
    echo "FAIL  $id"
    echo "$out"
    FAIL=$((FAIL+1))
    FAILED_CASES+=("$id")
  fi

  rm -rf "$ws"
}

echo "personalization-builder behavioral eval"
echo "======================================="
for c in "$CASES_DIR"/*.json; do
  [ -e "$c" ] || continue
  run_case "$c"
done

echo "---------------------------------------"
echo "passed: $PASS   failed: $FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo "failed cases: ${FAILED_CASES[*]}"
  exit 1
fi
exit 0
