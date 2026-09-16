# ADR-0024: gov.br federated through Cognito — signature levels as a signed claim, CPF as the business subject

## Status

Accepted on 2026-09-16 by Owner decision (steering H.50, H.49, H.51) on the Architect's proposal.
Realises ADR-0019 §1 and `portal-build-pack.md` WP-P0; implemented by R-0009 CTG-0001
(`work/rounds/R-0009/contracts/CTG-0001.md` §2–§5).

## Context

ADR-0019 requires citizens to authenticate through Cognito federated to gov.br, with the
electronic-signature level (`RN-PORTAL-101`: `simples`, `avancada`, `qualificada`) decided per
act and never per account colour. The origin portal used a Cognito pool without gov.br and a
`custom:teat_assurance_level` claim (`portal-route-contract.md` §11). The state ordinance
(PN DETRAN-AM 001/2025 art. 1º and 3º) admits gov.br "nível comprovado (ouro)", e-Notariado
and ICP-Brasil for defences, appeals, driver indication and powers of attorney; the Decreto
10.543/2020 art. 4º admits advanced signatures more broadly. OD-P02 asked how bronze, prata
and ouro map onto the three levels; OD-P01/H.49 asked whether the CETRAN-AM appeal follows
the same rule. No institutional gov.br OIDC client credentials exist yet (OD-P15).

## Decision

1. **Federation, no stored credentials.** gov.br is an OIDC identity provider federated into
   the citizen Cognito user pool (`@stynx-nyx/auth` `CognitoTokenVerifier`, unchanged). The
   backend never sees a gov.br password or token; it verifies the pool's JWT only.
2. **Seal → level is mapped in the IdP** (pool attribute mapping) and travels as a signed
   claim: bronze → `simples`; **prata or ouro → `avancada`** (H.50); e-Notariado / ICP-Brasil
   certificate → `qualificada`. **Risk registered (H.50):** PN DETRAN-AM 001/2025 art. 1º
   names only the ouro level, so an act signed with prata is challengeable until the agency
   issues an ordinance admitting prata; the request is in the letter to DETRAN-AM. OD-P02 is
   closed by H.50 with this risk. The CETRAN-AM appeal follows the same rule (H.49,
   `portal.cetran_appeal_level`).
3. **CPF is the business subject.** The claim `cpf` (11 digits) is the citizen's `sub` for
   every `portal.*` table (`portal.subject.cpf_hash`); the Cognito group `CIDADAO` is the only
   Portal role (`roles.ts`, ADR-0005). Representation (procurador) is a data attribute
   (`portal.representation`, `WF-PORTAL-002`), never a group.
4. **Fail-closed guard.** `PortalCitizenGuard` (`@detran/portal-identity`) rejects any
   principal whose `assurance_level` is absent or outside the three tokens, or whose `cpf` is
   absent or malformed, with 403 `PORTAL.ASSURANCE_NOT_VERIFIED`; it never degrades to
   `simples`. A principal without `CIDADAO` gets 403 `PORTAL.IDENTITY_NOT_CITIZEN`. Global
   admin permission `*` does not bypass the guard: it is identity, not policy.
5. **Act → level is data.** `portal.act_level_policy` holds one row per act with
   `minimum_assurance`, `legal_basis` and `decision_ref` (Decreto 10.543/2020 art. 4º;
   PN 001/2025; H.49/H.50/H.51). `assertActLevel` compares `simples < avancada < qualificada`
   and raises 403 `PORTAL.ASSURANCE_INSUFFICIENT`; a row demanding `qualificada` is a defect
   (500 `PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED`, `RN-PORTAL-101`); a missing row never
   releases the act. Ombudsman manifestation requires no level (`none`, H.51).
6. **Profiles.** `local-sandbox`/`test` simulate the IdP: `DetranLocalTokenVerifier` copies
   `DETRAN_LOCAL_ASSURANCE_LEVEL` and `DETRAN_LOCAL_CPF` into `principal.claims`; absent
   variables mean absent claims and the guard closes. In Cognito profiles the claim names are
   `STYNX_COGNITO_ASSURANCE_CLAIM` (default `custom:assurance_level`) and
   `STYNX_COGNITO_CPF_CLAIM` (default `custom:cpf`), read by `portalIdentityClaims`.

## Consequences

- OD-P15: institutional gov.br OIDC client credentials and the pool attribute mapping are
  `source_pending`; homologation with the real IdP is R-0014 WP-P6. Until then only the
  simulated IdP of the local profiles exists; nothing in `detran-runtime.ts` talks to gov.br.
- OD-P02 is revised: closed by H.50 with the prata risk recorded here, not reopened by code.
- Level elevation (`UC-PORTAL-019`) is a redirect to gov.br plus a `resumeToken`; the backend
  stores nothing beyond the token (CTG-0002 route `POST assurance/elevations`).
- `RN-PORTAL-118`: the holder sees the CPF from the claim; `portal.subject` stores only its
  hash and the observed levels. `RN-PORTAL-101` verification (c) becomes a runtime invariant.
- A future ordinance admitting prata, or one rejecting it, changes `portal.act_level_policy`
  rows and the IdP mapping — not this decision.

## References

- Steering H.49, H.50, H.51; OD-P01, OD-P02, OD-P06, OD-P15.
- ADR-0005 (`CIDADAO`), ADR-0019 §1, `portal-build-pack.md` WP-P0, `portal-route-contract.md`
  §1.3 and §11, `portal-error-catalog.md` §1.
- `RN-PORTAL-101`, `RN-PORTAL-118`, `UC-PORTAL-019`, `WF-PORTAL-002`,
  [REF-DETRANAM-PORTARIA-NORMATIVA-001-2025], Decreto 10.543/2020 art. 4º e 5º.
