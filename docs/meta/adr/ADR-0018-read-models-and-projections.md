# ADR-0018: Cross-app reads go through owned projections fed by domain events, never through another domain's tables

## Status

Accepted on 2026-09-13 by Owner decision (steering G.37), on the Architect's proposal of the same date. Completes ADR-0014…0017
and the events contract (`rait-events-sse-contract.md`).

## Context

PORTAL, DASHBOARD, the RAIT console (radar, integrations panel, production) and the
senatran-adapter all need aggregated or reshaped views of facts owned elsewhere: the citizen
needs "my fines, points and processes" without internal vocabulary; the dashboard needs
prescription risk, production and integration health; the integrations panel needs the
state of the outbox by system; the adapter needs the `SituacaoRenainf` mirror. Without a rule,
each consumer would query `inf.*` tables directly, coupling apps to internal schemas and
leaking tokens the citizen must never see (`RN-RAIT-134`, `RN-PORTAL-112`).

## Decision

1. **Every cross-app read is a projection** owned by the consumer's domain and rebuilt from
   events of the events contract. Projections are tables in the consumer's schema
   (`portal.*`, `dashboard.*`, `integration.*`), idempotent on `event.id`, replayable from the
   outbox, and versioned with the event `version`.
2. **Projection catalogue (initial)**

   | Projection                             | Owner         | Source events                                                                                     | Shape (citizen/operator-facing, no internal tokens where public)               |
   | -------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
   | `portal.infraction_view`               | portal        | `INFRACAO_ESTADO_ALTERADO`, `NOTIFICACAO_EXPEDIDA`, `NOTIFICACAO_CIENCIA`, `PAGAMENTO_CONFIRMADO` | situação em linguagem cidadã, próximos prazos, opções (defender/indicar/pagar) |
   | `portal.process_timeline`              | portal        | `RAIT_CASO_*`, `RAIT_DECISAO_PUBLICADA`, `rait.inquiry.changed`                                   | "com você" × "com o órgão" (`RN-PORTAL-112`)                                   |
   | `portal.points_view`                   | portal        | `PENALIDADE_DEFINITIVA`, RENACH read (adapter)                                                    | pontos definitivos × em disputa (`RN-RAIT-131`)                                |
   | `dashboard.prescription_risk`          | dashboard     | `RISCO_PRESCRICAO_ALTERADO`, `rait.clock.flag-changed`                                            | por relógio, pool, nível, unidade                                              |
   | `dashboard.production`                 | dashboard     | `rait.case.changed`, `rait.decision.published`, `rait.session.changed`                            | tempo por fase, SLA-30, taxa de provimento por enquadramento                   |
   | `dashboard.integration_health`         | dashboard     | outbox status, `UPSTREAM_*` errors                                                                | filas, falhas, recibos por sistema                                             |
   | `integration.renainf_mirror`           | adapter       | `INFRACAO_ESTADO_ALTERADO`                                                                        | `SituacaoRenainf` enviado, recibo, divergência (`UC-RAIT-029/031`)             |
   | `inf.rait_worklist_summary` (internal) | rait-worklist | `rait.assignment.changed`, `rait.clock.flag-changed`                                              | painel do turno T-01, bandeja T-06                                             |

3. **Rules.** A projection never writes back; a consumer that needs a decision issues a
   command to the owner. Public projections carry translated labels or opaque codes, never
   `inf` tokens. Rebuild is a job (`@stynx-nyx/jobs`) that replays the outbox window or a
   snapshot; the SSE stream (`/v1/inf/rait/stream`) is a live view of the same events, not a
   second source.
4. **Direct table reads across domains are forbidden** and checked: `verify:domain-boundaries`
   (new gate in WP-B) fails on SQL or repository code referencing another domain's schema
   outside `*.projection.ts` files that declare their source events.
5. **National reads** (CNH-e, CRLV-e, sinistro, exame) are adapter calls cached by the
   projection owner with the TTL the source allows; the projection records the read receipt.

## Consequences

- PORTAL and DASHBOARD get buildable data sources without waiting for query access to `inf`;
  RAIT's `integracoes` module reads `integration.renainf_mirror` and the outbox.
- Each projection is one small blueprint entity plus a projector (handwritten) with a replay
  test (`rait-test-strategy.md` §2 "Evento / SSE").
- The events contract becomes the domain-wide contract; ADR-0014…0017 append their events to
  it and the build pack gains WP-P (projections) after WP-B.
