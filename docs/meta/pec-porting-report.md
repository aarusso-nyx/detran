# PEC porting report

Status: **NOT READY — all acceptance criteria are executable; external deployment evidence remains**

This report records the bounded PEC port from the legacy repository into the DETRAN monorepo. It
is evidence and gap accounting, not a waiver of an acceptance criterion or an assertion that the
legacy product has been reproduced file-for-file.

## Reproducible snapshot

| Item                     | Value                                                                    |
| ------------------------ | ------------------------------------------------------------------------ |
| Legacy origin            | Read-only sibling `../pec` at `cfa8af2ff5349708e686305c7eb0a60d6276f753` |
| DETRAN entry             | `4b02785`                                                                |
| Candidate before refresh | `a87d25ed585c256424eacd3748035c742d52d077`                               |
| Working branch           | `codex/pec-port-mapping`                                                 |
| Origin use               | Read-only comparison input; no code is imported at runtime               |

The source of truth remains the reviewed PEC blueprints and Owner decisions in this repository.
DEVAI remains the governance provider, STYNX remains the reusable platform substrate, and all
national-service access remains behind `packages/senatran-adapter`.

## Verdict against the requested definition of done

| Requirement                                                                         | Result                             | Evidence                                                                                  |
| ----------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| Account for all 30 legacy `pec` tables                                              | PASS                               | Table disposition below                                                                   |
| Record the target architecture before implementation                                | PASS                               | [ADR-0012](./adr/ADR-0012-pec-kernel-and-integration-mapping.md)                          |
| Repair all four named legacy defects                                                | PASS                               | Billing, validity, vocabulary and distinct Junta Especial tests                           |
| Keep build, typecheck, tests, contracts and boundary checks green                   | PASS                               | Gate evidence below                                                                       |
| Satisfy the approved executable-evidence replacement for raw spec count             | PASS                               | PEC-PARITY-001; all 611 origin paths dispositioned and 76/76 reviewed criteria executable |
| Preserve request-bound tenant/RLS enforcement and avoid runtime in-memory fallbacks | PASS for implemented request paths | RLS integration suite, persistent idempotency/rate limits, source scan                    |
| Use only legal candidate-facing vocabulary                                          | PASS for implemented paths         | `CONDICIONADO` is rejected; “apto com restrições” is emitted                              |
| Produce a final porting report                                                      | PASS                               | This document                                                                             |

The approved reconciliation removed the raw-file-count, Junta and retention-acceptance conflicts.
`AC-PEC-014-3` is now proved by the distinct fail-closed deletion disposition accepted by the
Owner; deletion itself remains disabled. Twelve behavioral origin specs remain deferred: four
SEFAZ specs and eight Dashboard/real-environment specs whose opt-in suites are defined but have no
enabled-run evidence. `PADES_LTA` also remains a deployment blocker. Under PEC-PARITY-001, the
only supportable overall verdict therefore remains **NOT READY**.

## Legacy table disposition

The legacy schema contains 30 `pec` tables. DETRAN uses singular names and splits some aggregates
more precisely; configuration and excluded workflows do not require one-for-one tables.

| Legacy table                 | DETRAN disposition                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| `patients`                   | `ch.patient`                                                                                |
| `appointments`               | `ch.appointment`, with `ch.appointment_assignment_draw` for impartial distribution evidence |
| `encounters`                 | `ch.encounter`                                                                              |
| `federal_exam_public_prices` | `ch.federal_exam_public_price`                                                              |
| `reports`                    | `ch.report`                                                                                 |
| `biometric_refs`             | `ch.biometric_reference`                                                                    |
| `biometric_checks`           | `ch.biometric_check`                                                                        |
| `biometric_exceptions`       | `ch.biometric_exception` plus `ch.biometric_finger_condition`                               |
| `exams_medical`              | `ch.medical_exam`                                                                           |
| `exams_psych`                | `ch.psychological_exam` plus `ch.psych_instrument`                                          |
| `report_addenda`             | `ch.report_addendum` plus `ch.report_addendum_approval`                                     |
| `documents`                  | `ch.clinical_document`                                                                      |
| `process_blocks`             | `ch.process_block` plus `ch.registration_block_notice`                                      |
| `process_parameters`         | Versioned tenant settings at `tenancy.tenant_settings.settings.ch.processParameters`        |
| `junta_cases`                | `ch.junta_case`                                                                             |
| `junta_reviews`              | `ch.junta_board`                                                                            |
| `junta_review_members`       | `ch.junta_board_member`                                                                     |
| `junta_decisions`            | `ch.junta_decision`, with formal `ch.junta_appeal`                                          |
| `restriction_codes`          | `ch.restriction_code`                                                                       |
| `psych_instruments`          | `ch.psych_instrument`                                                                       |
| `encounter_restrictions`     | `ch.encounter_restriction`                                                                  |
| `professional_schedules`     | `ch.professional_schedule`                                                                  |
| `clinical_control_events`    | `ch.clinical_control_event`                                                                 |
| `telehealth_sessions`        | `ch.telehealth_session`                                                                     |
| `billing_items`              | `ch.billing_item` and normalized `ch.billing_invoice_item`                                  |
| `billing_invoices`           | `ch.billing_invoice`                                                                        |
| `billing_divergences`        | `ch.billing_divergence`                                                                     |
| `inconsistencies`            | `ch.inconsistency`                                                                          |
| `complaints`                 | Deferred to the Portal-owned complaint boundary; no duplicate PEC table was introduced      |
| `operational_records`        | `ch.operational_record`                                                                     |

Additional target tables support requirements absent or under-modeled in the legacy schema:
retention cases, holds and dispositions; episode exports; feedback requests; clinics and
professionals; and the explicit legal/audit records listed above. Every tenant-scoped table is
covered by RLS policy verification.

## Ported domain surface

The port implements 17 CH packages: billing, biometrics, clinical controls, clinical network,
clinical reports, encounters, exams, inconsistencies, operational controls, patients, process
blocks, restrictions, retention, scheduling, telehealth, juntas and toxicology. The runtime also provides durable,
tenant-scoped idempotency and rate-limit state, audited process parameters, authenticated RENACH
callbacks, and the SENATRAN adapter boundary.

Platform behavior is inherited rather than copied: authentication, request/database tenant
context, RBAC, audit substrate, health, storage and base persistence remain STYNX concerns.
Governance catalogs and generated checks remain DEVAI concerns.

## Acceptance coverage

The reviewed use cases contain exactly 76 acceptance criteria after the Owner-approved
`UC-PEC-012` design added six criteria. The repository has executable references for all 76.

| Use case   | Executable | Blocked | Status                                                                  |
| ---------- | ---------: | ------: | ----------------------------------------------------------------------- |
| UC-PEC-001 |        5/5 |       0 | Covered                                                                 |
| UC-PEC-002 |        5/5 |       0 | Covered                                                                 |
| UC-PEC-003 |        5/5 |       0 | Covered                                                                 |
| UC-PEC-004 |        5/5 |       0 | Covered                                                                 |
| UC-PEC-005 |        5/5 |       0 | Covered                                                                 |
| UC-PEC-006 |        9/9 |       0 | Covered                                                                 |
| UC-PEC-007 |        4/4 |       0 | Covered                                                                 |
| UC-PEC-008 |        5/5 |       0 | Covered                                                                 |
| UC-PEC-009 |        5/5 |       0 | Covered                                                                 |
| UC-PEC-010 |        5/5 |       0 | Covered                                                                 |
| UC-PEC-011 |        6/6 |       0 | Covered                                                                 |
| UC-PEC-012 |        6/6 |       0 | Covered under the Owner-approved event-driven design                    |
| UC-PEC-013 |        5/5 |       0 | Covered under Owner-selected P2 distribution                            |
| UC-PEC-014 |        6/6 |       0 | Negative deletion-control evidence accepted; execution remains disabled |

Machine-verifiable blocker details are in
[`pec-parity-blockers.json`](./pec-parity-blockers.json). The parity gate rejects missing,
duplicated or unreviewed acceptance IDs and verifies the complete origin test ledger.

## Legacy test disposition

The read-only origin contains **611** `.spec.ts` files, not 610. Every path is dispositioned in
[`pec-origin-test-disposition.csv`](./pec-origin-test-disposition.csv):

| Kind                              | Count | Interpretation                                                                                |
| --------------------------------- | ----: | --------------------------------------------------------------------------------------------- |
| DEVAI `it.todo` placeholders      |   374 | Superseded by installed DEVAI governance and `pnpm check`; not executable behavioral coverage |
| Generated metadata/trace wrappers |   122 | Superseded by deterministic blueprint and contract generation/drift checks                    |
| Behavioral specs                  |   115 | Individually mapped as ported, superseded, deferred or blocked in the ledger                  |

Across all three kinds, the disposition totals are 68 ported mappings, 531 superseded artifacts,
12 deferred tests and no blocked tests. These counts describe legacy-file disposition; they are
not interchangeable with the 76 distinct acceptance criteria referenced by target tests.

The target intentionally does not create hundreds of placeholder files to satisfy a numeric
threshold. Its executable specs are supplemented by database integration, API/e2e, contract,
blueprint, RLS and boundary gates. PEC-PARITY-001 explicitly replaced the literal file-count
threshold with that evidence model; the parity verifier now binds all 76 reviewed criteria and all
611 origin paths.

## Named defect disposition

| Legacy defect                                                                 | Result                                                                                                                      |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Billing price model not indexed as required                                   | Repaired: effective federal public-price versions require an annual IPCA reference and prevent overlapping validity periods |
| Exam validity uses superseded 5/3-year tiers                                  | Repaired: medical validity is calculated as 10/5/3 years by age band, with a separately motivated reduced-validity path     |
| Candidate-facing `CONDICIONADO` vocabulary                                    | Repaired: the internal label is rejected and the legal “apto com restrições” label is used                                  |
| Third instance implemented as signer reassignment rather than a distinct body | Repaired: formal candidate appeal, CETRAN designation, distinct three-member Junta Especial, signed decision and exhaustion |

The additional origin defects were also evaluated. Encounters now have a reachable audited
`CANCELLED` transition (DT-104), signing the first report no longer forces the encounter to
`SIGNED` before both required reports are signed (DT-105), and DT-106 is repaired by reachable
`UNDER_REVIEW`/`AWAITING_COMPLEMENT` states plus persisted board membership.

## Open boundaries

- **Retention execution:** `AC-PEC-014-3` is accepted through the executable distinct `BLOCKED`
  disposition and no-delete proof. DT-023 still prohibits actual deletion until a real PAdES-LTA
  provider demonstrates long-term preservation; a mock is not provider evidence.
- **Session deployment:** the approved STYNX Redis/RSA/JWKS, strong-factor and single-session
  contract is implemented and fails startup closed. A real Redis deployment and secret-backed key
  set remain environment inputs rather than repository evidence.
- **Trust integrations:** production PAdES-LTA/TSA validation, including operational certificate
  chain and revocation behavior, has not been demonstrated against a real provider.
- **SEFAZ:** four origin specs remain deferred. Their operations, payloads, status vocabulary,
  retry behavior and mock cases are documented, but target ownership, credentials and homologation
  authority are unresolved.
- **Dashboard and real environment:** opt-in suites now define the three Dashboard-owned BI and
  five real-environment dispositions. They remain deferred until an enabled in-house run supplies
  database, Cognito/session, generated-API and real clinical-trust evidence.
- **Product ownership boundaries:** complaints remain Portal-owned and BI presentation remains
  Dashboard-owned unless an approved architecture decision moves them into CH.

## Verification evidence

The following commands passed together after the report and parity ledger were committed:

```text
pnpm check
pnpm backend:db:reset
pnpm backend:rls-smoke
pnpm backend:test:ci
pnpm backend:test:in-house # default run validates discovery and reports skipped without credentials
pnpm build
```

The full check includes formatting, knowledge-base publication checks, blueprint and contract
drift checks, typechecking, UI tests/build, controller decorators, static RLS coverage, the
SENATRAN source and contract boundaries, and PEC parity accounting. The database integration
tests use independent clients to demonstrate shared durable idempotency/rate-limit state and
expiry behavior.

Green engineering gates do not manufacture external-provider evidence or product authority for
the remaining boundaries.

## Remaining requirements for full parity

All 76 acceptance criteria are now executable under the Owner-approved interpretation. Full
deployment parity still requires real-provider PAdES-LTA evidence before deletion can be enabled,
an enabled run of the eight defined Dashboard/real-environment dispositions, and an authorized
target disposition for the four deferred SEFAZ specs. The provider search terms, wire contracts,
mock cases and in-house inputs are recorded in
[`pec-external-environment-contract.md`](./pec-external-environment-contract.md). No
repository-only change can honestly substitute for provider/environment evidence.
