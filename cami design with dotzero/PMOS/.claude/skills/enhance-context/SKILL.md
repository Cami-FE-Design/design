---
name: enhance-context
description: "Turn scattered docs into organized context. Extract insights from PRDs, research, and competitive intel to keep context files fresh. Use when: enhance context, update context, extract from documents."
allowed-tools: "Read, Write, Edit, Glob"
disable-model-invocation: true
category: cc
---

# Enhance Context

Stop manually updating context files. Drop your docs into input folders and let Claude extract the insights that matter—company updates, user pain points, competitive intel—and merge them into organized context files with full source attribution.

## When to Use This Skill

- You've added PRDs, pitch decks, or strategy docs to input folders
- You have user research or interview transcripts to process
- You've collected competitive intelligence you want to merge into context
- Your context files are stale and need updating from recent docs
- You want to bootstrap context from existing documentation

## What You'll Need

Documents in one or more of these folders:
- `/context/inputs/` — Company & product docs (PRDs, pitch decks, strategy docs)
- `/work/discovery/inputs/` — User research (interviews, surveys, usability tests)
- `/work/strategy/inputs/` — Competitive intel (battle cards, market analysis)

## Supported File Types

Claude can read:
- ✅ **Text**: .md, .txt
- ✅ **Documents**: .pdf (≤20 pages), .docx
- ✅ **Data**: .csv, .xlsx, .json
- ✅ **Images**: .png, .jpg

**Unsupported formats:**
- ❌ PowerPoint (.pptx) — Export as PDF first (File → Save As → PDF)
- ❌ Compressed (.zip, .tar) — Extract files first
- ❌ Audio/Video (.mp3, .mp4) — Transcribe to text first

## Process

### Step 1: Read Current Context

Read existing context files to understand what's already captured:
1. `/context/company.md`
2. `/context/product.md`
3. `/context/personas.md`
4. `/context/competitors.md`

### Step 2: Scan and Validate Input Folders

Scan all three input folders:
- `/context/inputs/`
- `/work/discovery/inputs/`
- `/work/strategy/inputs/`

For each file found:
1. Check file extension against supported formats
2. For PDFs: Check page count (warn if >20 pages)
3. Categorize as readable or unsupported

Report findings:
```
I found 12 files across 3 folders:

✅ Readable (10 files):
  - context/inputs/pitch-deck.pdf (8 pages)
  - context/inputs/product-roadmap.docx
  - work/discovery/inputs/interview-sarah.md
  - work/discovery/inputs/survey-results.csv
  - work/strategy/inputs/competitor-pricing.xlsx
  - [etc.]

⚠️ Needs attention (1 file):
  - context/inputs/analyst-report.pdf (87 pages)
    → Which pages should I read? (max 20 per request)

❌ Unsupported (1 file):
  - work/strategy/inputs/market-analysis.pptx
    → Export as PDF first (File → Save As → PDF)
```

Ask user:
- For large PDFs: "Which pages should I read from [filename]?"
- Overall: "Proceed with processing [N] readable files?"

### Step 3: Extract Insights by Category

For each readable file, extract relevant context based on folder location:

**From `/context/inputs/` files:**
- Company mission, values, positioning
- Product features, capabilities, differentiators
- Business metrics, goals, priorities
- Market size, opportunity, trends
- Customer logos, notable users

**From `/work/discovery/inputs/` files:**
- User jobs-to-be-done
- Pain points and frustrations
- Verbatim quotes
- Behavioral patterns
- Persona details (roles, goals, context)

**From `/work/strategy/inputs/` files:**
- Competitor strengths and weaknesses
- Competitive positioning
- Feature comparisons
- Win/loss reasons
- Market landscape

### Step 4: Show Extracted Insights

Present findings organized by target context file:

```markdown
## Insights to Add

### company.md
**From:** context/inputs/pitch-deck.pdf
- Mission: [extracted mission statement]
- Key customers: [customer logos found]
- Funding stage: Series B, $25M raised

**From:** context/inputs/q4-okrs.docx
- Q4 Goals: [3 key priorities]

### product.md
**From:** context/inputs/product-roadmap.docx
- Upcoming features: [list]
- Success metrics: [key metrics]

### personas.md
**From:** work/discovery/inputs/interview-sarah.md
- New persona identified: "Enterprise Buyer"
- Key frustrations: [list]
- Quote: "[verbatim quote]"

**From:** work/discovery/inputs/survey-results.csv
- Top pain points (by frequency): [ranked list]

### competitors.md
**From:** work/strategy/inputs/competitor-pricing.xlsx
- Competitor A: $99/mo (Professional tier)
- Competitor B: $49/mo (Standard tier)

**From:** work/strategy/inputs/win-loss-analysis.md
- Why we win: [themes from won deals]
- Why we lose: [themes from lost deals]
```

Ask: "Should I update these context files with these insights?"

### Step 5: Merge into Context Files

For each context file with new insights:

1. **Don't overwrite existing content**
2. **Check file size before and after** — each context file must stay within sizing targets (see below)
3. **Add new sections** clearly marked with source
4. **Use marker format** for traceability:

```markdown
## [Existing Section]
[Existing content...]

### Enhanced from [folder]/[filename] ([date])
- [New insight 1]
- [New insight 2]
```

Example:
```markdown
## Company Values
- Customer-first
- Move fast
- Be transparent

### Enhanced from context/inputs/pitch-deck.pdf (2026-02-05)
- Build in public
- Default to async
```

5. **Save each updated file**
6. **Report changes made**

### Step 6: Summary Report

Provide completion summary:

```
✅ Context Enhancement Complete

Updated files:
- company.md (3 new insights from 2 sources)
- product.md (5 new insights from 1 source)
- personas.md (1 new persona, 8 quotes from 3 interviews)
- competitors.md (pricing data for 3 competitors)

Sources processed:
- 8 files from /context/inputs/
- 4 files from /work/discovery/inputs/
- 2 files from /work/strategy/inputs/

Next steps:
- Review updated context files
- Add more documents to input folders anytime
- Run this skill again to keep context fresh
```

## Output Format

### Extraction Quality Guidelines

**Be specific, not generic:**
- ✅ "Target market: B2B SaaS companies with 50-500 employees"
- ❌ "Target market: Small to medium businesses"

**Preserve user language:**
- ✅ Direct quotes in quotation marks
- ✅ Keep industry-specific terminology
- ❌ Don't paraphrase or simplify

**Include source attribution:**
- ✅ "From work/strategy/inputs/win-loss-q4.md"
- ✅ "Mentioned in 6 of 10 interviews"
- ❌ Don't claim insights without citing source

**Flag contradictions:**
- If different sources contradict, surface both
- Ask user which is accurate
- Don't silently choose one

## Merging Strategy

### What to Add
- New information not already captured
- More specific details than existing content
- Recent updates (dates, metrics, changes)
- User quotes and verbatims
- Data points (numbers, frequencies)

### What NOT to Overwrite
- User's manual edits
- Customized formatting
- Strategic framing decisions
- Content between `<!-- USER-MANAGED -->` markers

### Handling Conflicts

If new insight contradicts existing content:

1. **Don't silently overwrite**
2. **Surface the conflict:**
   ```markdown
   ### Conflict Detected
   **Existing:** "Target market: Enterprise (1000+ employees)"
   **New (from product-brief.pdf):** "Target market: Mid-market (100-1000 employees)"

   Which is accurate?
   ```
3. **Wait for user decision**
4. **Then update accordingly**

## Context File Sizing Constraints

Context files are loaded into Claude's context window when skills reference them. Every word is read on every skill run — so write for density, not length. You have room when you need it, but focused context produces better outputs than sprawling context.

Claude's 1M token context window means sizing is no longer a technical constraint — it's a quality and cost constraint. Dense, relevant files outperform long, comprehensive ones.

**Per-file targets:**

| File | Target Size | Notes |
|------|-------------|-------|
| company.md | 800–1,500 words | Mission, model, team structure, current initiatives, key metrics, stage |
| product.md | 500–1,200 words | Elevator pitch, full feature set, key metrics, tech stack, current roadmap |
| personas.md | 300–600 words **per persona** | Who, jobs to be done, pains, gains, tech comfort, real quotes, behavioral detail |
| competitors.md | 250–500 words **per competitor** | Positioning, pricing, target customer, feature comparison, when they win vs you |
| goals.md | 300–800 words | Current quarter's top 3–5 goals, OKRs with key results, success metrics, key dates |

**Total context set (all files combined):**
- **Target:** 3,000–8,000 words total
- **Hard max:** 12,000 words total

**The principle:** You have room — but every word is read on every skill run. Write for density, not length.

**When merging would exceed targets:**
1. Compress existing content first — tighten language, convert tables to bullets
2. Remove lower-priority detail (secondary personas get less space than primary, low-threat competitors get compressed)
3. If still over, ask user which sections to prioritize
4. Report final word counts in the summary

**In the summary report, always include:**
```
File sizes:
- company.md: [X] words (target: 800–1,500)
- product.md: [X] words (target: 500–1,200)
- personas.md: [X] words / [N] personas (target: 300–600 per persona)
- competitors.md: [X] words / [N] competitors (target: 250–500 per competitor)
- goals.md: [X] words (target: 300–800)
Total: [X] words (target: 3,000–8,000)
```

---

## Edge Cases

### Large PDFs (>20 pages)
- Ask which pages to read
- Suggest: "first 5 pages", "executive summary (pages 1-3)", "competitive section (pages 12-18)"
- Process multiple page ranges if user requests

### CSV/Excel Files
- Parse structured data
- Extract frequencies, rankings, categories
- Summarize patterns, don't list all rows
- For surveys: highlight top themes by frequency

### Image Files
- Extract visible text (if any)
- Describe diagrams, wireframes, charts
- Note competitive screenshots, pricing pages
- Use for visual context, not as primary source

### Empty Folders
- Report: "No files found in [folder]. Add documents to process."
- Don't error, just skip that folder

### All Files Unsupported
- Report: "No readable files found. Supported formats: .md, .txt, .pdf, .docx, .csv, .xlsx, .json, .png, .jpg"
- Suggest conversions for files found

## Tips for Best Results

1. **Name files descriptively** — Claude uses filenames to understand context
   - ✅ `interview-sarah-enterprise-pm-acme.md`
   - ❌ `notes-1.txt`

2. **Organize by folder** — Helps Claude route insights correctly
   - Company docs → `/context/inputs/`
   - User research → `/work/discovery/inputs/`
   - Competitor intel → `/work/strategy/inputs/`

3. **Run regularly** — Keep context fresh as you gather new docs
   - After user interviews
   - After competitive research
   - When strategy docs update

4. **Review before accepting** — Always check extracted insights for accuracy

5. **Export PowerPoints as PDF** — Claude can't read .pptx natively

## Framework Reference

This skill uses **Atomic Research** principles:
- Break docs into atomic insights
- Tag by source for traceability
- Synthesize patterns across sources
- Preserve original context

**Source:** Dovetail's Atomic Research methodology

## Privacy Note

Your documents stay local — nothing is uploaded. Claude processes them on your machine using the Read tool.
