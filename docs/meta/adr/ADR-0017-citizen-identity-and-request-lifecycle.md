# ADR-0017: A `portal` domain owns citizen identity levels, the common request lifecycle, the citizen inbox and ombudsman, and delegates every decision

## Status

Accepted on 2026-09-13 by Owner decision (steering G.37), on the Architect's proposal of the same date. Realises the Phase 4
line of `BUILD-PLAN.md` (`domains/portal`, gov.br federation) and the model of `APP-PORTAL`
("orchestrator of a shop window, never a system of record").

## Context

The PORTAL corpus is complete at product level (four workflows, 20 use cases, 28 rules, 27
screens) and explicit about what it must not do: judge merit, register vehicles or drivers,
duplicate national data. It needs, however, its own persistence for what only it knows: the
citizen's identity level per act (`WF-PORTAL-002`, Decreto 10.543/2020), the lifecycle of a
request from identification to evaluation (`WF-PORTAL-001`, 28 services), the inbox with
proof of acknowledgement and channel preferences (`WF-PORTAL-003`), ombudsman manifestations,
evaluations and LGPD subject requests (`WF-PORTAL-004`, `UC-PORTAL-016…019`). No backend
module, blueprint, DDL or API exists for any of it. STYNX provides `@stynx-nyx/auth`
(Cognito exchange), `sessions`, `preferences` (tenant-and-subject scoped, ETag writes),
`privacy` (PII registry, export/erasure endpoints, ROPA) and `notifications` (in-app channel).

## Decision

1. **Identity is a federation, levels are data.** Citizens authenticate through Cognito
   federated to gov.br OIDC (`CIDADAO` role, ADR-0005). `domains/portal/identity`
   (`BP-PORTAL-IDENTITY-001`) stores only what gov.br does not: `portal.subject` (CPF hash,
   gov.br level observed, verified at), `portal.representation` (procurador ↔ represented,
   instrument document, validity, scope), and the **act → required level matrix** as data
   (`portal.act_level_policy`), so the state ordinance (DT-050) changes a row, not code.
   Elevation of level (`UC-PORTAL-019`) is a redirect to gov.br plus a resume token; no
   credential is ever stored.
2. **One request lifecycle for every service.** `domains/portal/requests`
   (`BP-PORTAL-REQUESTS-001`) implements `WF-PORTAL-001` as the single machine
   (`IDENTIFICADO → ELEGIVEL → COMPOSTO → ASSINADO → PROTOCOLADO → EM_ANDAMENTO → CONCLUIDO
→ AVALIADO`, plus `INDEFERIDO_ELEGIBILIDADE`, `CANCELADO`). A request carries `service_key`
   from the 28-service catalogue and a **delegation**: the target domain command it becomes
   (`inf:rait-case:protocol`, `inf:infraction:indicate-driver`, `inf:collection:issue`, a
   national read through the adapter, or a PEC/BOAT command). The target's protocol number
   and events are mirrored back into the request; the request never holds the decision.
3. **Inbox is a projection plus acknowledgement facts.** `domains/portal/inbox` stores
   `portal.inbox_item` (kind: `SNE`, `PROCESSO`, `OUVIDORIA`, `SISTEMA`; source event id;
   read at) and `portal.acknowledgement_evidence` (what the citizen saw and when, signed hash),
   and feeds `NOTIFICACAO_CIENCIA` to the notification module (ADR-0014) for SNE items. Channel
   preferences use `@stynx-nyx/preferences`; delivery uses `@stynx-nyx/notifications`.
4. **Ombudsman, evaluation and LGPD.** `domains/portal/citizen-service` owns
   `portal.manifestation` (Lei 13.460 kinds, deadlines, answer), `portal.evaluation` (per
   concluded request) and the Carta de Serviços entries as data of the service catalogue;
   subject-rights requests use `@stynx-nyx/privacy` endpoints, with the PII registry
   populated by every `inf`/`portal` module through `@PiiColumn`.
5. **Payment, notices, decisions and national data are never stored here**: they come from
   read models (ADR-0018) and adapter ports; the PORTAL API exposes citizen-shaped resources
   (`/v1/portal/*`) with no internal state token (`RN-PORTAL-112`, vocabulary rule of
   `rait-web-frontend.md` §10.5).

### Ownership table

| Fact                                 | Writer                    | Readers                 | Events                                    | Substrate                  |
| ------------------------------------ | ------------------------- | ----------------------- | ----------------------------------------- | -------------------------- |
| subject, level, representation       | `portal/identity`         | requests, inf commands  | `NIVEL_ASSINATURA_ELEVADO`                | auth, sessions             |
| act → level matrix                   | `portal/identity` (admin) | requests                | —                                         | —                          |
| request lifecycle and delegation     | `portal/requests`         | PORTAL, DASHBOARD       | `SOLICITACAO_*`                           | outbox, flow (optional)    |
| inbox item, acknowledgement evidence | `portal/inbox`            | notification (ADR-0014) | `NOTIFICACAO_CIENCIA` (SNE), `INBOX_LIDO` | notifications, preferences |
| manifestation, evaluation, Carta     | `portal/citizen-service`  | PORTAL, DASHBOARD       | `MANIFESTACAO_*`, `AVALIACAO_REGISTRADA`  | jobs (deadlines), privacy  |
| citizen PII exports/erasures         | STYNX privacy             | DPO                     | —                                         | privacy, storage           |

## Consequences

- Four blueprints under a new `portal` namespace (schema `portal`, RLS as everywhere); a
  PORTAL API and error catalogue mirroring the RAIT ones; `apps/portal/web` specification at
  the RAIT level (modules, routes, components) as the next documentation step.
- `UC-PORTAL-001…004` become delegations to `inf:rait-case:protocol` and
  `inf:infraction:indicate-driver`; `UC-PORTAL-015` to `inf:collection:issue`; `UC-PORTAL-010…014`
  to adapter reads and read models.
- `@stynx-nyx/flow` may drive the request graph; the decision to use it is deferred to WP-A of
  the portal (evaluate against the fixed eight-state machine).
- Premises carried: DT-050 (state ordinance on signature levels), DT-066 (Lei 14.129 adoption),
  DT-051 (ombudsman level), `RN-PORTAL-113` (WCAG/eMAG declaration), `RN-PORTAL-116`
  (CRLV-e with suspended enforceability).
