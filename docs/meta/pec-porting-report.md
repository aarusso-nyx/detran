# PEC porting report

Status: **READY — DETRAN's repository PEC stack is a proved superset of the inspected PEC origin**

This report records the bounded PEC port from the legacy repository into the DETRAN monorepo. It
is evidence and gap accounting, not a waiver of an acceptance criterion or an assertion that the
legacy product has been reproduced file-for-file.

## Reproducible snapshot

| Item                     | Value                                                                     |
| ------------------------ | ------------------------------------------------------------------------- |
| Legacy origin            | Read-only sibling `../pec` at `cfa8af2ff5349708e686305c7eb0a60d6276f753`  |
| DETRAN current-main base | `46477771b02c8b51294e6bfa0f9461277f8cc5df`                                |
| Verified implementation  | `f79160af0ebfa62241e63a40590bde084c8acfbb` plus this evidence-only update |
| Working branch           | `codex/pec-port-mapping`                                                  |
| Origin use               | Read-only comparison input; no code is imported at runtime                |

The source of truth remains the reviewed PEC blueprints and Owner decisions in this repository.
DEVAI remains the governance provider, STYNX remains the reusable platform substrate, and all
national-service access remains behind `packages/senatran-adapter`.

## Verdict against the requested definition of done

| Requirement                                                                          | Result | Evidence                                                                                  |
| ------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------- |
| Account for all 50 active legacy tables across `pec`, `auth`, `integration`, `audit` | PASS   | ADR-0012 and `pec-origin-superset.json`                                                   |
| Account for all 32 package directories (31 features plus `shared`)                   | PASS   | Machine-verified package disposition in `pec-origin-superset.json`                        |
| Record the target architecture before implementation                                 | PASS   | [ADR-0012](./adr/ADR-0012-pec-kernel-and-integration-mapping.md)                          |
| Repair all four named legacy defects                                                 | PASS   | Billing, validity, vocabulary and distinct Junta Especial tests                           |
| Keep build, typecheck, tests, contracts and boundary checks green                    | PASS   | Gate evidence below                                                                       |
| Satisfy the approved executable-evidence replacement for raw spec count              | PASS   | PEC-PARITY-001; all 611 origin paths dispositioned and 76/76 reviewed criteria executable |
| Preserve request-bound tenant/RLS enforcement and avoid runtime in-memory fallbacks  | PASS   | RLS integration suite, persistent idempotency/rate limits, source scan                    |
| Use only legal candidate-facing vocabulary                                           | PASS   | `CONDICIONADO` is rejected; “apto com restrições” is emitted                              |
| Transfer/disposition PEC's remaining issue and PR                                    | PASS   | PEC #11 → DETRAN #25; PEC #35 superseded because DETRAN has no such action dependency     |
| Produce a final porting report                                                       | PASS   | This document                                                                             |

The approved reconciliation removed the raw-file-count, Junta and retention-acceptance conflicts.
`AC-PEC-014-3` is proved by the distinct fail-closed deletion disposition accepted by the Owner;
deletion remains disabled until a real PAdES-LTA provider proves preservation. This is the
approved product behavior, not missing repository parity. All 115 behavioral origin specs now
have a ported target disposition. Conditional real/in-house suites remain conditional exactly as
environment tests must; a skipped run is never presented as real-provider evidence.

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
| `complaints`                 | `portal.complaint`, under the reviewed Portal/Ouvidoria boundary                            |
| `operational_records`        | `ch.operational_record`                                                                     |

Additional target tables support requirements absent or under-modeled in the legacy schema:
retention cases, holds and dispositions; episode exports; feedback requests; clinics and
professionals; and the explicit legal/audit records listed above. Every tenant-scoped table is
covered by RLS policy verification.

## Ported domain surface

The port implements 17 CH packages: billing, biometrics, clinical controls, clinical network,
clinical reports, encounters, exams, inconsistencies, operational controls, patients, process
blocks, restrictions, retention, scheduling, telehealth, juntas and toxicology. It additionally
implements Portal-owned complaints, the full SEFAZ payment adapter, kernel user/Cognito
administration and audit query/export. The runtime also provides durable,
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

Across all three kinds, the disposition totals are 80 ported mappings, 531 superseded artifacts,
no deferred tests and no blocked tests. These counts describe legacy-file disposition; they are
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

## External deployment prerequisites

- **Retention execution:** `AC-PEC-014-3` is accepted through the executable distinct `BLOCKED`
  disposition and no-delete proof. DT-023 prohibits actual deletion until a real PAdES-LTA
  provider demonstrates long-term preservation; a mock is not provider evidence. This guard is
  the completed requirement.
- **Session deployment:** the approved STYNX Redis/RSA/JWKS, strong-factor and single-session
  contract is implemented and fails startup closed. A real Redis deployment and secret-backed key
  set remain environment inputs rather than repository evidence.
- **Trust integrations:** production PAdES-LTA/TSA validation, including operational certificate
  chain and revocation behavior, has not been demonstrated against a real provider.
- **SEFAZ:** all six origin adapter operations and four behavioral specs are ported. Real mode is
  fail-closed and still needs the official endpoint, credential/certificate scheme and named
  homologation authority supplied by the deployment.
- **Dashboard and real environment:** the three report/query behaviors are provided by the CH
  clinical-report read models and the Dashboard in-house suite. Five real-environment contracts
  remain opt-in suites for PostGIS/RLS, Cognito, OpenAPI and clinical-trust deployment evidence.
  Their conditional execution is preserved, not counted as a green real-provider run.
- **Product ownership boundaries:** complaints are implemented under Portal/Ouvidoria and BI
  presentation remains Dashboard-owned; neither is duplicated as a CH aggregate.

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

Green engineering gates prove repository parity only; they do not manufacture external-provider
or production-environment evidence.

## Repository completion and deployment boundary

All 76 acceptance criteria, 32 package directories, 50 active tables and 611 origin specs are
accounted with no deferred or blocked source behavior. The provider search terms, wire contracts,
mock cases and in-house inputs are recorded in
[`pec-external-environment-contract.md`](./pec-external-environment-contract.md). Production
enablement still requires the named external credentials/environments, and deletion remains
disabled until PAdES-LTA preservation is proved. Those conditions do not reduce the established
repository-superset verdict.
