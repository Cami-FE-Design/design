# \<ID\> — \<short name\>

**Feature:** [\<Feature\>](../../../../../../../cami-feature-docs/feature-mappings/\<stage\>/\<feature\>.md) · Group **\<letter\> · \<group name\>**
**Job:** … *(copy the guide row, word for word)*
**Done when:** … *(copy the guide row, word for word)*
**Actor:** Staff · Reception · Manager · Owner · Client · System
**Gate:** **Allow** · **Block** · **Record** · **?** *(exception only; blank means guide default)*
**Law:** …
**Last checked:** YYYY-MM-DD

> Spec only. What **should** happen. Build state lives in [validations/\<feature\>/\<ID\>.md](../../../../../../../cami-feature-docs/feature-mappings/\<stage\>/validations/\<feature\>/\<ID\>.md).

**File path:** `work/specs/use-cases/<stage>/<feature>/<ID>.md` · **Law cites from this depth:** `../../../../../../../cami-feature-docs/business-rules/01-product-invariants.md`

*Links below are written for that depth, so they do not resolve from this template's own location. They resolve once copied into place. Do not "fix" them here.*

---

## Starts when

| Trigger | Must already be true |
|---------|----------------------|
| … | … |

---

## Main path

| # | Actor does | System must | Law |
|---|------------|-------------|-----|
| 1 | … | … | … |
| 2 | … | … | … |
| 3 | … | … | … |

**Ends with:** … *(the state the object lands in, named from [03](../../../../cami-feature-docs/business-rules/03-state-machines.md))*

---

## Alternates

Each gets an ID so a validation can score it. **Path** = *Continue at N* · *End, job done another way* · *End, job not done*.

| ID | When | Then | Path | Law |
|----|------|------|------|-----|
| \<ID\>.a1 | … | … | … | … |
| \<ID\>.a2 | … | … | … | … |

---

## Must stay true

Cite, do not restate.

| Law | Says | Where it bites in this path |
|-----|------|------------------------------|
| INV-… | … | Step … |

---

## Done when, checkable

| # | Check | Fails if |
|---|-------|----------|
| 1 | … | … |
| 2 | … | … |

---

## Not this

| Not here | Lives in |
|----------|----------|
| … | … |

---

## Open decisions

| Decision | Blocks which step | Where |
|----------|-------------------|--------|
| … | … | … |

---

## Change log

| Date | Change |
|------|--------|
| YYYY-MM-DD | First write |
