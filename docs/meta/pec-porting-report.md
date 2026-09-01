# PEC porting report

Status: **NOT READY — full parity has not been demonstrated**

This report records the bounded PEC port from the legacy repository into the DETRAN monorepo. It
is evidence and gap accounting, not a waiver of an acceptance criterion or an assertion that the
legacy product has been reproduced file-for-file.

## Reproducible snapshot

| Item                                     | Value                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| Legacy origin                            | Read-only sibling `../pec` at `cfa8af2ff5349708e686305c7eb0a60d6276f753` |
| DETRAN entry                             | `4b02785`                                                                |
| Implemented candidate before this report | `274968e91258de3205bf314f83b7e1b34d8bdbba`                               |
| Working branch                           | `codex/pec-port-mapping`                                                 |
| Origin use                               | Read-only comparison input; no code is imported at runtime               |

The source of truth remains the reviewed PEC blueprints and Owner decisions in this repository.
DEVAI remains the governance provider, STYNX remains the reusable platform substrate, and all
national-service access remains behind `packages/senatran-adapter`.

## Verdict against the requested definition of done

| Requirement                                                                         | Result                             | Evidence                                                                                                                                      |
| ----------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Account for all 30 legacy `pec` tables                                              | PASS                               | Table disposition below                                                                                                                       |
| Record the target architecture before implementation                                | PASS                               | [ADR-0011](./adr/ADR-0011-pec-kernel-and-integration-mapping.md)                                                                              |
| Repair all four named legacy defects                                                | **FAIL**                           | Three repaired; the distinct third-instance board is prohibited by DT-025                                                                     |
| Keep build, typecheck, tests, contracts and boundary checks green                   | PASS                               | Gate evidence below                                                                                                                           |
| Reach at least the legacy count of 611 spec files                                   | **FAIL**                           | The target has 48 spec files; count is not an honest proxy because 374 origin specs are `it.todo` placeholders and 122 are generated wrappers |
| Preserve request-bound tenant/RLS enforcement and avoid runtime in-memory fallbacks | PASS for implemented request paths | RLS integration suite, persistent idempotency/rate limits, source scan                                                                        |
| Use only legal candidate-facing vocabulary                                          | PASS for implemented paths         | `CONDICIONADO` is rejected; “apto com restrições” is emitted                                                                                  |
| Produce a final porting report                                                      | PASS                               | This document                                                                                                                                 |

Because two explicit completion requirements fail and additional runtime boundaries remain open,
the only supportable overall verdict is **NOT READY**.

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
| `junta_cases`                | Blocked: distinct Junta workflow is excluded by DT-025                                      |
| `junta_reviews`              | Blocked: distinct Junta workflow is excluded by DT-025                                      |
| `junta_review_members`       | Blocked: distinct Junta workflow is excluded by DT-025                                      |
| `junta_decisions`            | Blocked: distinct Junta workflow is excluded by DT-025                                      |
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

The port implements 15 CH packages: billing, biometrics, clinical controls, clinical network,
clinical reports, encounters, exams, inconsistencies, operational controls, patients, process
blocks, restrictions, retention, scheduling and telehealth. The runtime also provides durable,
tenant-scoped idempotency and rate-limit state, audited process parameters, authenticated RENACH
callbacks, and the SENATRAN adapter boundary.

Platform behavior is inherited rather than copied: authentication, request/database tenant
context, RBAC, audit substrate, health, storage and base persistence remain STYNX concerns.
Governance catalogs and generated checks remain DEVAI concerns.

## Acceptance coverage

The reviewed use cases contain exactly 70 acceptance criteria. The repository has executable
references for 54 and an explicit authority-backed blocker for the remaining 16.

| Use case   | Executable | Blocked | Status                                               |
| ---------- | ---------: | ------: | ---------------------------------------------------- |
| UC-PEC-001 |        5/5 |       0 | Covered                                              |
| UC-PEC-002 |        5/5 |       0 | Covered                                              |
| UC-PEC-003 |        5/5 |       0 | Covered                                              |
| UC-PEC-004 |        0/5 |       5 | DT-025 conflict                                      |
| UC-PEC-005 |        0/5 |       5 | DT-025 conflict                                      |
| UC-PEC-006 |        9/9 |       0 | Covered                                              |
| UC-PEC-007 |        4/4 |       0 | Covered                                              |
| UC-PEC-008 |        5/5 |       0 | Covered                                              |
| UC-PEC-009 |        5/5 |       0 | Covered                                              |
| UC-PEC-010 |        0/5 |       5 | DT-025 conflict                                      |
| UC-PEC-011 |        6/6 |       0 | Covered                                              |
| UC-PEC-012 |          0 |       0 | Stub; blocked on DT-024 design                       |
| UC-PEC-013 |        5/5 |       0 | Covered under Owner-selected P2 distribution         |
| UC-PEC-014 |        5/6 |       1 | Deletion execution prohibited by DT-023 prerequisite |

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

Across all three kinds, the disposition totals are 54 ported mappings, 531 superseded artifacts,
17 deferred tests and 9 blocked tests. These counts describe legacy-file disposition; they are
not interchangeable with the 54 distinct acceptance criteria referenced by target tests.

The target intentionally does not create hundreds of placeholder files to satisfy a numeric
threshold. Its 48 spec files are supplemented by database integration, API/e2e, contract,
blueprint, RLS and boundary gates. This is stronger evidence, but it does not satisfy the literal
“at least 611 spec files” completion condition; that condition remains failed rather than silently
reinterpreted.

## Named defect disposition

| Legacy defect                                                                 | Result                                                                                                                          |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Billing price model not indexed as required                                   | Repaired: effective federal public-price versions require an annual IPCA reference and prevent overlapping validity periods     |
| Exam validity uses superseded 5/3-year tiers                                  | Repaired: medical validity is calculated as 10/5/3 years by age band, with a separately motivated reduced-validity path         |
| Candidate-facing `CONDICIONADO` vocabulary                                    | Repaired: the internal label is rejected and the legal “apto com restrições” label is used                                      |
| Third instance implemented as signer reassignment rather than a distinct body | **Not repaired**: UC-PEC-004/005/010 require the distinct body, while Owner decision DT-025 explicitly says not to implement it |

The additional origin defects were also evaluated. Encounters now have a reachable audited
`CANCELLED` transition (DT-104), and signing the first report no longer forces the encounter to
`SIGNED` before both required reports are signed (DT-105). DT-106 cannot be carried into the
target because the entire Junta composition/review model is excluded by DT-025; it remains part
of the same unresolved Owner conflict.

## Open boundaries

- **Junta Especial:** 15 acceptance criteria cannot be implemented without changing DT-025 or the
  reviewed use cases. This is a product-authority conflict, not an engineering omission that may
  be guessed around.
- **Retention execution:** AC-PEC-014-3 remains blocked because DT-023 prohibits deletion until
  PAdES-LTA or successive timestamp preservation exists.
- **Periodic toxicology:** DT-024 places it in scope, but UC-PEC-012 is still a stub and does not
  define the event, actor, driver-record effect or interaction with registration blocking.
- **Session parity:** STYNX session wiring still needs a demonstrated Redis deployment/signing-key
  contract and an approved reconciliation of single-session and strong-factor requirements.
- **Trust integrations:** production PAdES-LTA/TSA validation, including operational trust and
  revocation behavior, has not been demonstrated.
- **SEFAZ and real external tests:** adapters and configured external environments are not present;
  the ledger marks these tests deferred rather than pretending local mocks prove production
  integration.
- **Product ownership boundaries:** complaints remain Portal-owned and BI presentation remains
  Dashboard-owned unless an approved architecture decision moves them into CH.

## Verification evidence

The following commands passed together after the report and parity ledger were committed:

```text
pnpm check
pnpm backend:db:reset
pnpm backend:rls-smoke
pnpm backend:test:ci
pnpm build
```

The full check includes formatting, knowledge-base publication checks, blueprint and contract
drift checks, typechecking, UI tests/build, controller decorators, static RLS coverage, the
SENATRAN source and contract boundaries, and PEC parity accounting. The database integration
tests use independent clients to demonstrate shared durable idempotency/rate-limit state and
expiry behavior.

Green engineering gates do not resolve the Owner conflicts above.

## Decision required for full parity

Full parity requires explicit Owner action, at minimum:

1. reconcile DT-025 with UC-PEC-004/005/010 and the requested distinct third-instance body;
2. approve the missing UC-PEC-012 toxicology behavior;
3. decide whether the literal 611-file threshold is mandatory or replace it with an approved
   executable-coverage requirement; and
4. authorize/design the external trust and session prerequisites needed to close DT-023 and
   session parity.

Until those decisions and demonstrations exist, this port is materially advanced but **NOT
READY for a full-parity declaration**.
