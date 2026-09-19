# ADRs

**Authority:** Architect (Constitution Article 6).

Architecture decision records for the detran monorepo. The founding ADRs
(0001–0004) encode the owner-confirmed Decisions Ledger of 2026-08-23 and are
binding; supersede only by a new ADR.

| ADR                                                                    | Title                                                                                      |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [ADR-0001](ADR-0001-domain-first-layout.md)                            | Domain-first monorepo layout                                                               |
| [ADR-0002](ADR-0002-unified-backend-modular-monolith.md)               | Unified backend as a modular monolith                                                      |
| [ADR-0003](ADR-0003-senatran-adapter-sole-boundary.md)                 | senatran-adapter as the sole national-API boundary                                         |
| [ADR-0004](ADR-0004-migration-policy.md)                               | Migration policy: fresh layout, module-by-module port, origin freeze                       |
| [ADR-0005](ADR-0005-unified-backend-kernel.md)                         | Unified backend kernel contract                                                            |
| [ADR-0006](ADR-0006-detran-ui-kit.md)                                  | Shared DETRAN Angular UI kit over STYNX                                                    |
| [ADR-0007](ADR-0007-regenerable-blueprints.md)                         | Blueprint output is regenerable-only                                                       |
| [ADR-0008](ADR-0008-senatran-port-provider-and-feature-flags.md)       | SENATRAN port, provider and feature-flag design                                            |
| [ADR-0009](ADR-0009-generated-openapi-contracts.md)                    | API contracts generated from blueprints                                                    |
| [ADR-0010](ADR-0010-canonical-business-legal-knowledge-base.md)        | Canonical business and legal knowledge base                                                |
| [ADR-0011](ADR-0011-phase-6-documentation-publication.md)              | Phase 6 documentation and publication capability                                           |
| [ADR-0012](ADR-0012-pec-kernel-and-integration-mapping.md)             | PEC auth, audit and integration mapping                                                    |
| [ADR-0013](ADR-0013-pec-parity-closure-contract.md)                    | PEC parity closure contract                                                                |
| [ADR-0014](ADR-0014-infraction-lifecycle-state-machine.md)             | WF-INF-003 is the canonical infraction lifecycle state machine                             |
| [ADR-0015](ADR-0015-stynx-1-3-1-angular-22-and-rait-role-catalogue.md) | STYNX 1.3.1 / Angular 22 target; RAIT role family and persisted lifecycle vocabulary       |
| [ADR-0016](ADR-0016-infraction-and-notification-boundary.md)           | Infraction aggregate and notification module own the legal state                           |
| [ADR-0017](ADR-0017-collection-payment-and-refund-boundary.md)         | Collection module owns payment documents, payments, refunds and debt hand-off              |
| [ADR-0018](ADR-0018-documents-and-signature-substrate.md)              | Documents rendered and signed by the STYNX substrate, templated by domains                 |
| [ADR-0019](ADR-0019-citizen-identity-and-request-lifecycle.md)         | Portal domain: identity levels, request lifecycle, inbox, ombudsman                        |
| [ADR-0020](ADR-0020-read-models-and-projections.md)                    | Cross-app reads through owned projections fed by domain events                             |
| [ADR-0021](ADR-0021-shared-parameter-store.md)                         | One shared, versioned parameter store (`ops.parameter`) for calibrations (Accepted)        |
| [ADR-0022](ADR-0022-orchestra-execution-model.md)                      | Execution of the implementation backlog by dedicated agent orchestras (Proposed)           |
| [ADR-0023](ADR-0023-minimum-ops-agency-context.md)                     | Minimum `ops/agency` institutional context (unit, jurisdiction, competence)                |
| [ADR-0024](ADR-0024-rait-legal-priority-owner-policy.md)               | RAIT legal-priority Owner policy (Accepted; legal validation pending before delivery)      |
| [ADR-0025](ADR-0025-rait-operation-clock-composition.md)               | Explicit production Clock provider and one temporal snapshot per RAIT operation (Accepted) |
| [ADR-0026](ADR-0026-r0007-owner-review-waiver-and-model-routing.md)    | R-0007 Owner delivery waiver for SQL2 legacy-queue finding and economical model routing    |

ADR-0012 and ADR-0013 were taken by the PEC port while the infractions definition round was open on its branch; the infractions ADRs were renumbered 0014…0021 on merge (2026-09-13).
