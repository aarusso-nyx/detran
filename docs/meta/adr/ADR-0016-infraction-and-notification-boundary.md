# ADR-0016: The infraction aggregate and the notification module own the legal state of the infraction and of its notices

## Status

Accepted on 2026-09-13 by Owner decision (steering G.37), on the Architect's proposal of the same date. Implements the
consequence of ADR-0014 (the infraction aggregate needs its own blueprint) and closes the
ownership gap found on 2026-09-13: the "Notificar" sub-process of `WF-INF-002` §2 was reused
by TEAT, RAIT and PORTAL without a module owning it. Extends ADR-0003 and ADR-0005.

Implementação: PR #39 (R-0006, CTG-0001, 2026-09-14) — `BP-INF-INFRACTION-001`, `BP-INF-NOTIFICATION-001`,
`@detran/inf-deadlines` (library, §2), transition guards and event schemas; command surfaces, sweep job and
the `rait_communication` projection follow in R-0007 / WP-P.

## Context

Three applications touch the same legal facts. TEAT integrates the AIT and triggers the
first notice (NA); RAIT decides defences and appeals and communicates decisions; PORTAL shows
notices to the citizen, lets the owner indicate the driver and pay. Today the state of the
infraction lives only in Markdown (`WF-INF-003`) and in reference tables
(`inf.infraction_*_ref`, ADR-0015), the notice records live implicitly in `rait_communication`
for decisions and nowhere for NA/NP, and the fictitious SNE acknowledgement (30 days) is
computed by no one. Each app would otherwise re-implement the same clocks and the same channel
rules (`RN-RAIT-101…106`).

STYNX 1.3.1 provides `@stynx-nyx/notifications` (multi-channel delivery, templates,
preference-aware suppression, retryable delivery tracking), `@stynx-nyx/outbox`
(same-transaction enqueue, claim-and-dispatch, HMAC-verified inbound ACK) and
`@stynx-nyx/jobs` (Postgres-backed scheduler). The national channel (SNE) is reachable only
through `packages/senatran-adapter` (`SnePort`, ADR-0003/0008).

## Decision

1. **Two modules in the `inf` domain, not one per app.**
   - `domains/inf/infraction` (`BP-INF-INFRACTION-001`) is the **only writer** of the legal
     state of an infraction: `state`/`substate` (FK to `inf.infraction_state_ref`),
     `subject_kind`, `suspensive_effect`, `paid`/`payment_tier`, `points_registered`,
     `closure_motive`, `risk_flag`, its timers (`inf.infraction_timer`) and its events. It
     consumes `AIT_INTEGRADO`, `AIT_CANCELADO_POSFINAL`, `NOTIFICACAO_EXPEDIDA`,
     `NOTIFICACAO_CIENCIA`, `CONDUTOR_INDICADO`, `RAIT_*` and `PAGAMENTO_CONFIRMADO`
     (`rait-events-sse-contract.md` §2.4) and publishes `INFRACAO_ESTADO_ALTERADO`,
     `PENALIDADE_DEFINITIVA`, `RESTITUICAO_DEVIDA`, `TIMER_VENCIDO`, `RISCO_PRESCRICAO_ALTERADO`.
     Its transition table is `inf.infraction_transition_ref`; a command that is not a row there
     does not exist.
   - `domains/inf/notification` (`BP-INF-NOTIFICATION-001`) is the **only writer** of notices
     and acknowledgements: `inf.notice` (kind `NA|NP|DECISAO|DILIGENCIA|EDITAL`, addressee,
     channel FK `inf.notification_channel_ref`, `dispatched_at`, `printed_deadline_on`,
     `document_id`), `inf.notice_acknowledgement` (`effective_on`, `fictitious`, evidence:
     AR, SNE receipt, edital publication, signature) and `inf.notice_delivery_attempt`. It
     publishes `NOTIFICACAO_EXPEDIDA` and `NOTIFICACAO_CIENCIA`; it computes fictitious
     acknowledgement (`T-SNE-CIENCIA`) through the deadline engine; it never decides anything
     about the infraction.
2. **The deadline engine is a library, not a service.** `rait-deadline-engine.md` ships as
   `@detran/inf-deadlines` (handwritten package under `backend/domains/inf/deadlines`), used
   by `infraction`, `notification` and `rait-case`; the sweep runs on `@stynx-nyx/jobs`.
3. **Channels are substrate.** Postal, e-mail, push and in-app delivery use
   `@stynx-nyx/notifications` with DETRAN templates rendered by the documents module
   (ADR-0018); SNE uses `SnePort` through the outbox (`@stynx-nyx/outbox`) and never a
   direct call. Edital is a document plus a publication record, not a delivery.
4. **What stays in the apps.** TEAT keeps the AIT technical machine (`WF-TEAT-001`) and only
   emits `AIT_INTEGRADO`/`AIT_CANCELADO_POSFINAL`; it does not print or send the NA. RAIT keeps
   the case machine and asks `notification` to send decisions (`rait_communication` becomes a
   projection of `inf.notice` for `kind=DECISAO`, migrated in WP-A). PORTAL shows notices and
   acknowledgements from the read model (ADR-0020) and registers the driver indication as a
   command of `infraction`, never writing state itself.
5. **RENAINF mirror** is a consumer of `INFRACAO_ESTADO_ALTERADO` inside the adapter worker
   (`SituacaoRenainf` mapping of `WF-INF-003` §8), owned by `packages/senatran-adapter`.

### Ownership table

| Fact                                   | Writer                     | Readers                                         | Events                                          | Substrate                     |
| -------------------------------------- | -------------------------- | ----------------------------------------------- | ----------------------------------------------- | ----------------------------- |
| infraction state, subject, effect      | `inf/infraction`           | RAIT, PORTAL, DASHBOARD, adapter                | `INFRACAO_ESTADO_ALTERADO`                      | outbox, jobs                  |
| infraction timers and risk flag        | `inf/infraction`           | RAIT radar, DASHBOARD                           | `TIMER_VENCIDO`, `RISCO_PRESCRICAO_ALTERADO`    | `@detran/inf-deadlines`, jobs |
| notice (NA/NP/decision/edital)         | `inf/notification`         | infraction, RAIT, PORTAL                        | `NOTIFICACAO_EXPEDIDA`                          | notifications, pdf, outbox    |
| acknowledgement (effective/fictitious) | `inf/notification`         | infraction (rearms `T-DEF`/`T-NP-VENC`), PORTAL | `NOTIFICACAO_CIENCIA`                           | jobs                          |
| driver indication                      | `inf/infraction` (command) | PORTAL (issuer), RENACH via adapter             | `CONDUTOR_INDICADO` (from PORTAL), state change | —                             |
| AIT technical lifecycle                | `inf/ait` (TEAT)           | infraction                                      | `AIT_INTEGRADO`, `AIT_CANCELADO_POSFINAL`       | offline-sync                  |

## Consequences

- Two new blueprints (WP-A) and two command surfaces (WP-B); `rait_communication` is
  migrated to a projection; `UC-RAIT-041` (expedir NP), `UC-PORTAL-004` (indicação) and the
  TEAT hand-off in `WF-TEAT-001` §Ponte are re-pointed to these modules.
- The fictitious acknowledgement, the printed-deadline validation
  (`RAIT.INFRACTION_NOTICE_DEADLINE_SHORT`) and the channel marks exist once.
- Open questions carried as explicit premises: OD-001 (authority appeal window and organ),
  OD-013 (signing-authority jurisdiction), OD-303/OD-304/OD-305 (non-flagrant counting,
  `T-NA-IND`, `T-PRESC-5A` interruption), OD-019 (written warning).
- Events, payloads and error codes are added to `rait-events-sse-contract.md` §2.4 and
  `rait-error-catalog.md` §3.12 before code.
