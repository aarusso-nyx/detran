# PORTAL — owner decisions (2026-08-28)

**Source of truth:** `detran-refs` @ `52e00a8`, `transversal/portal/rules/RN-PORTAL-128.md`,
`RN-PORTAL-116.md`, `RN-PORTAL-113.md`, `RN-PORTAL-126.md`, `transversal/portal/use-cases/
UC-PORTAL-015.md`, `UC-PORTAL-012.md`. Forward-looking — `portal` is still an empty placeholder
domain in this monorepo (2 files, no implementation).

## DT-026 — 40%-discount waiver instrument (`RN-PORTAL-128`, `UC-PORTAL-015`)

CTB art.284 §1º lets a fine be paid at 60% (40% discount) only if the infractor waives defense and
appeal — normally captured via an SNE declaration field. The Owner decided the PORTAL captures
this **independently of SNE adherence**: a **digital waiver term, signed by the citizen inside the
PORTAL itself**, displayed at a two-step confirmation (per `RN-PORTAL-128`'s existing five
presentation duties). This resolves the evidentiary gap (there's no SNE-equivalent declaration
field outside SNE) but does **not** settle the signature level required — that's `RN-PORTAL-101` /
DT-051, still open.

## DT-027 — CRLV-e vs. a fine under suspensive appeal (`RN-PORTAL-116`, `UC-PORTAL-012`)

Res. CONTRAN 809/2020 art.4º blocks CRLV-e issuance on unpaid debts; CTB art.286 lets a fine be
appealed without payment, with automatic suspensive effect. The Owner confirmed the systematic
reading: a fine whose enforceability is suspended by a timely appeal is **not treated as a debt**
for CRLV-e purposes and must **not block issuance**. This is a product decision, not a formal
legal opinion — flag it as such if a future parecer disagrees.

## DT-028 — accessibility standard (`RN-PORTAL-113`)

LBI art.63 requires accessibility as an obligation of result, without naming a technical standard.
The Owner confirmed **formally declaring WCAG 2.1 AA + eMAG 3.1** as the adopted conformance
standard — cheap, reduces exposure to an eventual MP/ACP claim that "reasonable practices" weren't
met.

## DT-031 — card-installment payment module authorization (`RN-PORTAL-126`, `UC-PORTAL-015`)

Res. CONTRAN 918/2022 art.27 §§1º-2º requires the state órgão to obtain authorization from the
federal órgão máximo before offering card-installment payment, plus separate credentialing of the
processing companies (§§4º/15) — **neither act has been located** in the corpus. Rather than block
all development on this administrative confirmation, the Owner decided to **proceed with the
module assuming authorization exists**, while the confirmation is pursued in parallel as an
institutional ask (tracked as DT-072 in `detran-refs`). **If that confirmation comes back
negative, this module needs to be disabled/reverted** — this is a consciously accepted risk, not a
closed question. Don't remove the authorization-gate check from the design; just don't block
development behind it.
