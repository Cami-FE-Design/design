#!/usr/bin/env python3
"""Assertion checker for a produced context/personalization.md.

Usage:
    assert.py <case.json> <produced-personalization.md> [--probe-output FILE] [--transcript FILE]

Reads the `asserts` block from the case spec and checks each key against the
produced file (and, where relevant, the captured model transcript / probe
output). Exits 0 if every assertion holds, 1 otherwise, printing each failure.

This file is the single source of truth for what "the skill behaved
correctly" means — run.sh just drives the model and hands artifacts here.
"""
import json
import re
import sys

STABLE_HEADINGS = [
    "## Role",
    "## How I Like the Agent to Work",
    "## Output & Artifact Preferences",
    "## Vocabulary & Guardrails",
]

PLACEHOLDER = "NOT YET FILLED"


def read(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return None


def section_body(body, heading):
    """Return the text between `heading` and the next `## ` heading."""
    idx = body.find(heading)
    if idx == -1:
        return ""
    rest = body[idx + len(heading):]
    nxt = rest.find("\n## ")
    return rest if nxt == -1 else rest[:nxt]


def real_line_count(body):
    count = 0
    for line in body.splitlines():
        s = line.strip()
        if not s:
            continue
        if s.startswith("#") or s.startswith("<!--"):
            continue
        if re.match(r"\*\*[A-Za-z].*:\*\*", s):
            continue
        if PLACEHOLDER in s:
            continue
        count += 1
    return count


def main():
    if len(sys.argv) < 3:
        print("usage: assert.py <case.json> <personalization.md> "
              "[--probe-output FILE] [--transcript FILE]", file=sys.stderr)
        return 2

    case_path, file_path = sys.argv[1], sys.argv[2]
    probe_path = transcript_path = None
    args = sys.argv[3:]
    for i, a in enumerate(args):
        if a == "--probe-output" and i + 1 < len(args):
            probe_path = args[i + 1]
        if a == "--transcript" and i + 1 < len(args):
            transcript_path = args[i + 1]

    with open(case_path, "r", encoding="utf-8") as f:
        case = json.load(f)
    asserts = case.get("asserts", {})

    body = read(file_path)
    probe = read(probe_path) if probe_path else None
    transcript = read(transcript_path) if transcript_path else None

    failures = []

    def fail(msg):
        failures.append(msg)

    # --- file existence ---
    if asserts.get("file_written") is True and body is None:
        fail("file_written: expected personalization.md to exist, it does not")
    if asserts.get("file_written") is False and body is not None:
        fail("file_written: expected NO file, but one exists")

    have_body = body is not None

    # --- guardrails injection ---
    if have_body and "no_imperative_in_guardrails" in asserts:
        guard = section_body(body, "## Vocabulary & Guardrails").lower()
        for needle in asserts["no_imperative_in_guardrails"]:
            if needle.lower() in guard:
                fail(f"no_imperative_in_guardrails: injected string '{needle}' "
                     f"leaked into the Guardrails section")

    # --- stable headings present ---
    if have_body and asserts.get("headings_present"):
        for h in STABLE_HEADINGS:
            if h not in body:
                fail(f"headings_present: missing stable heading '{h}'")

    # --- headings unique (idempotency) ---
    if have_body and asserts.get("headings_unique"):
        for h in STABLE_HEADINGS:
            n = body.count(h)
            if n > 1:
                fail(f"headings_unique: heading '{h}' appears {n} times (duplicated)")

    if have_body and asserts.get("single_role_section"):
        n = body.count("## Role\n")
        if n != 1:
            fail(f"single_role_section: '## Role' appears {n} times, expected 1")

    # --- format version ---
    if have_body and "format_version" in asserts:
        want = str(asserts["format_version"])
        m = re.search(r"personalization_format_version:\*\*\s*([0-9.]+)", body)
        got = m.group(1) if m else None
        if got != want:
            fail(f"format_version: expected '{want}', got '{got}'")

    # --- all sections placeholder (headless) ---
    if have_body and asserts.get("all_sections_placeholder"):
        for h in STABLE_HEADINGS:
            sec = section_body(body, h)
            if PLACEHOLDER not in sec:
                fail(f"all_sections_placeholder: section '{h}' is not a "
                     f"placeholder — headless run should not have filled it")

    # --- max real lines (length cap) ---
    if have_body and "max_real_lines" in asserts:
        n = real_line_count(body)
        if n > asserts["max_real_lines"]:
            fail(f"max_real_lines: file has {n} real lines, cap is "
                 f"{asserts['max_real_lines']}")

    # --- transcript: no questions asked (headless) ---
    if asserts.get("no_questions_asked") and transcript is not None:
        # A headless run must not have asked the role/style questions.
        q_markers = ["what's your role", "terse outputs or full reasoning",
                     "any go-to frameworks"]
        low = transcript.lower()
        hit = [q for q in q_markers if q in low]
        if hit:
            fail(f"no_questions_asked: transcript shows the skill asked "
                 f"questions in a headless run: {hit}")

    # --- probe output (precedence) ---
    if "probe_output_contains" in asserts:
        if probe is None or asserts["probe_output_contains"] not in probe:
            fail(f"probe_output_contains: expected probe output to contain "
                 f"'{asserts['probe_output_contains']}'")
    if "probe_output_not_contains" in asserts:
        if probe is not None and asserts["probe_output_not_contains"] in probe:
            fail(f"probe_output_not_contains: probe output contains forbidden "
                 f"string '{asserts['probe_output_not_contains']}'")

    # --- generic output_contains (checks transcript) ---
    if "output_contains" in asserts and transcript is not None:
        if asserts["output_contains"].lower() not in transcript.lower():
            fail(f"output_contains: transcript missing expected string "
                 f"'{asserts['output_contains']}'")

    # symlink_intact / symlink_target_unchanged are checked by run.sh
    # (filesystem-level) and passed in via the case env; nothing to do here.

    if failures:
        for f in failures:
            print(f"  FAIL  {f}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
