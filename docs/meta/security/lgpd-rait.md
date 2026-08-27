# LGPD — RAIT (requirements handoff from detran-refs)

**Source of truth:** `aarusso-nyx/detran-refs` @ commit `28d3440`, files
`inf/rait/rules/RN-RAIT-133.md` through `RN-RAIT-138.md`, plus `refs/leis/REF-LEI-13709-2018.md`
(expanded LGPD legal-text reference) and `_meta/lgpd-assessment.md` (the transversal assessment
that produced this block). This document is a pointer and an actionable summary, not a copy — for
full legal citations and reasoning, read the source files in `detran-refs`.

**Status.** All six rules below are `draft` in `detran-refs` — written by a legal/BPO analysis
round, **not yet reviewed by a human lawyer**. Nothing here is settled law. Treat as
engineering-relevant findings to track and design around, not requirements to implement blindly.
Tracked in `detran-refs` `_meta/open-issues.md` as DT-052 (legal-validation, P1) and DT-126
(kb-consistency, done — the block itself is written).

## Grounded against the current schema

Checked `backend/database/ddl/34-inf-rait-case.sql` against the findings below:

- `inf.rait_party.role` already distinguishes `requerente` / `procurador` / `autoridade` as
  separate rows. RN-RAIT-135's finding ("the procurador is a distinct LGPD data subject, never
  treated as one") is structurally cheap to act on once validated — the schema already separates
  the party, only the LGPD treatment (legal basis, retention, access channel) is missing.
- Neither `inf.rait_case` nor `inf.rait_party` has a column for legal basis, retention/expiry, or
  PII classification. This confirms RN-RAIT-133 (legal basis never declared anywhere) and
  RN-RAIT-136 (retention never defined — no expiry, no purge path) are live gaps in the current
  schema, not stale findings from an earlier snapshot.
- No sensitive-data flag exists on whatever field carries the free-text "exposição de
  fatos e fundamentos" pleading (per `RN-RAIT-002`) — relevant to RN-RAIT-134 below.

## The six findings

1. **RN-RAIT-133 — legal basis for the requerente's data.** Proposed: LGPD art. 7º II/VI. Lowest
   controversy of the six — anchored directly in Res. CONTRAN 900/2022 art. 3º, which names the
   exact fields as mandatory content.
2. **RN-RAIT-134 — sensitive data can appear unprompted in the free-text pleading field.** Unlike
   BOAT/PEC (structured health/biometric fields), RAIT's core narrative field is unstructured — a
   citizen can volunteer health/disability information as part of their defense narrative without
   the system designing for it. Open design question: is a UI warning/instruction enough, or does
   this need active screening before the text is exposed in any non-case-instruction view (worklist,
   dashboards)? **Not decided** — flagged for product + legal input.
3. **RN-RAIT-135 — the procurador is a distinct data subject.** See schema note above. Open
   question: does the procurador need an independent access/correction channel, or is
   ad-hoc-petition-to-the-Encarregado sufficient? **Not decided.**
4. **RN-RAIT-136 — retention.** No source in the corpus fixes a retention period for a closed RAIT
   case. Working proposal: anchor identified-record retention to the 5-year prescrição quinquenal
   already modeled for the domain (Lei 9.873/1999 art. 1º, mirrored in `RN-RAIT-113`), then
   anonymize; keep only anonymized statistics beyond that (same two-layer pattern used to fix the
   equivalent BOAT gap, `RN-BOAT-125`). **Proposal, not validated** — a longer retention horizon
   tied to general administrative-document practice is plausible and wasn't researched this round.
5. **RN-RAIT-137 — data-subject rights boundary with PORTAL.** No new machinery needed — PORTAL's
   existing rights block (`RN-PORTAL-118`–`122`) already covers RAIT. What RAIT-side engineering
   needs to support: exposing subject-role per field (requerente / procurador / third party named
   in the pleading / authority) so PORTAL's masking-by-relationship logic works correctly, and a
   closed list of which case fields are "factual" (correctable without reopening the process) vs.
   "merit" (must go through the appeal process, not a correction request).
6. **RN-RAIT-138 — data sharing with JARI-AM/CETRAN-AM.** Open institutional question, not an
   engineering one yet: are JARI-AM/CETRAN-AM the same LGPD controller as DETRAN-AM, or a distinct
   one (which would put case-escalation transmissions under LGPD art. 26's inter-controller
   sharing regime)? Blocked on obtaining their regimento (`detran-refs` DT-060,
   institutional-ask). Provisional posture in the source rule: treat conservatively as
   inter-controller sharing until resolved.

## What this is not

Not a request to implement now. Items 2, 3, 4, and 6 explicitly leave a design decision open
pending legal or product validation in `detran-refs`. This handoff exists so engineering has
visibility before the schema stabilizes further — e.g., before adding more columns to
`inf.rait_case`/`inf.rait_party` that might need to be revisited once legal basis, retention, and
role-per-field are settled — not to trigger immediate implementation.

## Suggested next step

When this is picked up: read `RN-RAIT-133`–`138` directly in `detran-refs` for full legal
reasoning and citations. Track resolution of `detran-refs` `_meta/open-issues.md` DT-052 before
implementing anything from findings 2, 3, 4, or 6 above; finding 1 (legal basis) and the
structural half of finding 5 (role-per-field exposure) are lower-risk to start on since they don't
depend on an open decision.
