# ADRs

**Authority:** Architect (Constitution Article 6).

Architecture decision records for the detran monorepo. The founding ADRs
(0001–0004) encode the owner-confirmed Decisions Ledger of 2026-08-23 and are
binding; supersede only by a new ADR.

Status is read from each ADR file and normalized (Accepted | Proposed | Superseded) by the rule
of [ADR-0035](ADR-0035-adr-numbering-policy.md); `pnpm verify:state-index` enforces this table,
`DESIGN-DECISIONS.md` and §Aliases. "Vigência" names the later ADR that replaces part of a
decision; `—` means no partial-validity note is recorded.

| ADR                                                                    | Título                                                                                  | Status   | Vigência                                                                         |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| [ADR-0001](ADR-0001-domain-first-layout.md)                            | Domain-first monorepo layout                                                            | Accepted | —                                                                                |
| [ADR-0002](ADR-0002-unified-backend-modular-monolith.md)               | Unified backend as a modular monolith                                                   | Accepted | —                                                                                |
| [ADR-0003](ADR-0003-senatran-adapter-sole-boundary.md)                 | senatran-adapter as the sole national-API boundary                                      | Accepted | —                                                                                |
| [ADR-0004](ADR-0004-migration-policy.md)                               | Migration policy: fresh layout, module-by-module port, origin freeze                    | Accepted | —                                                                                |
| [ADR-0005](ADR-0005-unified-backend-kernel.md)                         | Unified backend kernel contract                                                         | Accepted | —                                                                                |
| [ADR-0006](ADR-0006-detran-ui-kit.md)                                  | Shared DETRAN Angular UI kit over STYNX                                                 | Accepted | parcial → [ADR-0015](ADR-0015-stynx-1-3-1-angular-22-and-rait-role-catalogue.md) |
| [ADR-0007](ADR-0007-regenerable-blueprints.md)                         | Blueprint output is regenerable-only                                                    | Accepted | —                                                                                |
| [ADR-0008](ADR-0008-senatran-port-provider-and-feature-flags.md)       | SENATRAN port, provider and feature-flag design                                         | Accepted | —                                                                                |
| [ADR-0009](ADR-0009-generated-openapi-contracts.md)                    | API contracts generated from blueprints                                                 | Accepted | —                                                                                |
| [ADR-0010](ADR-0010-canonical-business-legal-knowledge-base.md)        | Canonical business and legal knowledge base                                             | Accepted | —                                                                                |
| [ADR-0011](ADR-0011-phase-6-documentation-publication.md)              | Phase 6 documentation and publication capability                                        | Accepted | —                                                                                |
| [ADR-0012](ADR-0012-pec-kernel-and-integration-mapping.md)             | PEC auth, audit and integration mapping                                                 | Accepted | —                                                                                |
| [ADR-0013](ADR-0013-pec-parity-closure-contract.md)                    | PEC parity closure contract                                                             | Accepted | —                                                                                |
| [ADR-0014](ADR-0014-infraction-lifecycle-state-machine.md)             | WF-INF-003 is the canonical infraction lifecycle state machine                          | Accepted | —                                                                                |
| [ADR-0015](ADR-0015-stynx-1-3-1-angular-22-and-rait-role-catalogue.md) | STYNX 1.3.1 / Angular 22 target; RAIT role family and persisted lifecycle vocabulary    | Accepted | parcial → [ADR-0028](ADR-0028-devai-1-5-2-attested-local-rc.md)                  |
| [ADR-0016](ADR-0016-infraction-and-notification-boundary.md)           | Infraction aggregate and notification module own the legal state                        | Accepted | —                                                                                |
| [ADR-0017](ADR-0017-collection-payment-and-refund-boundary.md)         | Collection module owns payment documents, payments, refunds and debt hand-off           | Accepted | —                                                                                |
| [ADR-0018](ADR-0018-documents-and-signature-substrate.md)              | Documents rendered and signed by the STYNX substrate, templated by domains              | Accepted | —                                                                                |
| [ADR-0019](ADR-0019-citizen-identity-and-request-lifecycle.md)         | Portal domain: identity levels, request lifecycle, inbox, ombudsman                     | Accepted | —                                                                                |
| [ADR-0020](ADR-0020-read-models-and-projections.md)                    | Cross-app reads through owned projections fed by domain events                          | Accepted | —                                                                                |
| [ADR-0021](ADR-0021-shared-parameter-store.md)                         | One shared, versioned parameter store (`ops.parameter`) for calibrations                | Accepted | —                                                                                |
| [ADR-0022](ADR-0022-orchestra-execution-model.md)                      | Execution of the implementation backlog by dedicated agent orchestras                   | Accepted | —                                                                                |
| [ADR-0023](ADR-0023-minimum-ops-agency-context.md)                     | Minimum `ops/agency` institutional context (unit, jurisdiction, competence)             | Accepted | —                                                                                |
| [ADR-0024](ADR-0024-govbr-federation-via-cognito.md)                   | gov.br federated through Cognito: signature levels as a claim, CPF as subject           | Accepted | —                                                                                |
| [ADR-0025](ADR-0025-rait-operation-clock-composition.md)               | Explicit production Clock provider and one temporal snapshot per RAIT operation         | Accepted | —                                                                                |
| [ADR-0026](ADR-0026-r0007-owner-review-waiver-and-model-routing.md)    | R-0007 Owner delivery waiver for SQL2 legacy-queue finding and economical model routing | Accepted | —                                                                                |
| [ADR-0027](ADR-0027-rait-session-minutes-signers.md)                   | RAIT session minutes signers                                                            | Accepted | —                                                                                |
| [ADR-0028](ADR-0028-devai-1-5-2-attested-local-rc.md)                  | Adopt DEVAI 1.5.6 for attested local RC evidence                                        | Accepted | —                                                                                |
| [ADR-0029](ADR-0029-teat-bootstrap-freshness-and-offline-authority.md) | TEAT bootstrap online freshness and independent offline authority                       | Accepted | —                                                                                |
| [ADR-0030](ADR-0030-teat-ait-aggregate-validation-baseline.md)         | TEAT AIT aggregate-validation baseline                                                  | Accepted | —                                                                                |
| [ADR-0031](ADR-0031-teat-expired-normative-package-offline-warning.md) | Expired TEAT normative package remains a warning under E2                               | Accepted | —                                                                                |
| [ADR-0032](ADR-0032-teat-e2-and-ait-execution-owner-profile.md)        | TEAT E2 and AIT execution profile selected by the Owner                                 | Accepted | —                                                                                |
| [ADR-0033](ADR-0033-teat-ui-workflow-homologation-scope.md)            | R-0013 entrega homologação de UI e workflows TEAT                                       | Accepted | —                                                                                |
| [ADR-0034](ADR-0034-pec-web-frontend.md)                               | PEC gets a web frontend: consoles in `apps/pec/web`, candidate surfaces in the Portal   | Accepted | —                                                                                |
| [ADR-0035](ADR-0035-adr-numbering-policy.md)                           | Política de numeração de ADRs                                                           | Accepted | —                                                                                |
| [ADR-0036](ADR-0036-ops-field-operations-port.md)                      | Field-operations port scope and offline-sync deferral                                   | Accepted | —                                                                                |
| [ADR-0037](ADR-0037-rait-legal-priority-owner-policy.md)               | RAIT legal-priority Owner policy (legal validation pending before delivery)             | Accepted | —                                                                                |
| [ADR-0038](ADR-0038-provisionamento-operacional-offline.md)            | Operational offline provisioning                                                        | Accepted | —                                                                                |
| [ADR-0039](ADR-0039-platform-latest.md)                                | DEVAI 2.2.0 / Constitution 1.0.2 and STYNX 1.5.3 adoption                               | Accepted | —                                                                                |

ADR-0012 and ADR-0013 were taken by the PEC port while the infractions definition round was open on its branch; the infractions ADRs were renumbered 0014…0021 on merge (2026-09-13).

## Série `law/adr`

Série DEVAI distinta, com prefixo `LAW-ADR-` nos índices (OD-R18-001, opção b).

| ADR                                                                   | Título                                    | Status   | Vigência                                                                                                                                |
| --------------------------------------------------------------------- | ----------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| LAW-ADR-0001 (`law/adr/ADR-0001-devai-1.4.5-stynx-1.1.1-adoption.md`) | Adopt DEVAI 1.4.5 and unified STYNX 1.1.1 | Accepted | parcial → [ADR-0015](ADR-0015-stynx-1-3-1-angular-22-and-rait-role-catalogue.md), [ADR-0028](ADR-0028-devai-1-5-2-attested-local-rc.md) |

## Aliases

Números renumerados pela [ADR-0035](ADR-0035-adr-numbering-policy.md). O arquivo antigo é um
redirecionamento sem conteúdo normativo; o conteúdo vive no arquivo novo, idêntico ao original
abaixo da nota de proveniência. Citações sem slug anteriores a R-0018 (código, blueprints,
gerados, corpus, rodadas históricas) não foram reescritas: leia-as por esta tabela. O valor
persistido `policyCode` `ADR-0024-2026-09-16` é um identificador de dado da política da ADR-0037,
não uma citação, e não muda.

| Número antigo | Redirecionamento                                                                                   | Número novo | Arquivo novo                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| ADR-0006      | [ADR-0006-ops-field-operations-port.md](ADR-0006-ops-field-operations-port.md)                     | ADR-0036    | [ADR-0036-ops-field-operations-port.md](ADR-0036-ops-field-operations-port.md)                     |
| ADR-0024      | [ADR-0024-rait-legal-priority-owner-policy.md](ADR-0024-rait-legal-priority-owner-policy.md)       | ADR-0037    | [ADR-0037-rait-legal-priority-owner-policy.md](ADR-0037-rait-legal-priority-owner-policy.md)       |
| ADR-0028      | [ADR-0028-provisionamento-operacional-offline.md](ADR-0028-provisionamento-operacional-offline.md) | ADR-0038    | [ADR-0038-provisionamento-operacional-offline.md](ADR-0038-provisionamento-operacional-offline.md) |
