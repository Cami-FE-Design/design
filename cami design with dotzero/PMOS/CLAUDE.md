<!-- mysecond-start -->
# mySecond PM OS — your company

This workspace has a mySecond PM OS installed for you at your company.

Context files are auto-loaded into Claude's context at session start via `@import`:

@context/company.md
@context/product.md
@context/personas.md
@context/competitors.md
@context/goals.md
@context/personalization.md
@context/knowledge/01-product-invariants.md
@context/knowledge/02-glossary.md
@context/knowledge/03-state-machines.md
@context/knowledge/04-decision-records.md
@context/knowledge/05-edge-case-catalog.md
@context/knowledge/06-money-composition-contract.md
@context/knowledge/README.md
@context/slite/business-process.md
@context/slite/data-migration.md
@context/slite/open-questions.md
@context/slite/roadmap-slite.md

Personalization preferences are defaults; when they conflict with a skill step or a team guardrail, follow the skill/guardrail.

To run a skill, type its name (e.g. `/prd-generator`); type `/` to see the menu of what is available, or open the mySecond app for the full catalog. Sync runs automatically on every SessionStart.

## File-Write Rule (load-bearing — sync depends on it)

When saving files in this workspace, ALWAYS use the `Write` tool (or `Edit` / `MultiEdit` for in-place updates). Never use bash heredoc (`cat > file <<EOF`), `echo > file`, `printf >`, `tee`, or any shell redirect to a project path. The PostToolUse sync hook only fires on `Write|Edit|MultiEdit` — bash file-writes silently skip artifact sync, so the file never reaches mySecond. A PreToolUse hook also enforces this; bash redirects to `context/`, `work/`, or `.claude/{skills,agents,workflows}/` will be blocked with a clear error.

## After Installation

After running `mysecond init`, the only next step for a new user is `/welcome`. Do not suggest `/enhance-context`, `/prd-generator`, or other skills before `/welcome` runs — no context files exist yet, and those skills depend on them. Stay quiet about skill discovery; let `/welcome` drive the first-run experience.

If summarizing the install confirmation, mention ONLY the three counts the cli printed in its success box (skills, sub-agents, workflows). Do NOT invent or add additional totals (e.g., "N skills synced from mysecond.ai") — those server-side numbers double-count internal entities and will mislead the user.
<!-- mysecond-end -->
