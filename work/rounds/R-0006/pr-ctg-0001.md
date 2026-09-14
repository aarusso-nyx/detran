## Papel (Constituição Art. 6)

Architect (blueprints, contrato, esquemas de evento — TASK-0001) → Inspector (testes e fixtures — TASK-0002) → Engineer (biblioteca, guardas, wiring — TASK-0003); maestro Fable 5.1 (Engineer no git e na evidência). Orquestra `rait-model`, rodada DEVAI `R-0006`, grupo acoplado CTG-0001.

## Pacote de trabalho e fontes

WP-A de `docs/framework/arch/rait-build-pack.md` (agregado da infração, notificação, motor de prazos). Fontes: ADR-0014 §Consequências, ADR-0016, ADR-0021 (parâmetros citados), [WF-INF-003] §1–§6, [WF-INF-002] §2 e §9, RN-RAIT-101…106, `rait-deadline-engine.md` §2–§7, `rait-events-sse-contract.md` §2.4, `rait-error-catalog.md` §3.9/§3.12, `14-inf-lifecycle-vocabulary.sql`. Reconciliação build pack × ADRs em `work/rounds/R-0006/plan.md` §Decisões (M1–M12). OD carregadas como premissa: OD-301, OD-303, OD-304, OD-305, OD-019.

## O que muda

- `BP-INF-INFRACTION-001` v1.1.0 (`inf/infraction`: `infraction`, `infraction_timer`, `infraction_event`; FKs para todas as tabelas de referência do DDL 14) e `BP-INF-NOTIFICATION-001` v1.1.0 (`inf/notification`: `notice`, `notice_acknowledgement`, `notice_delivery_attempt`); módulos gerados, DDL `38-inf-infraction.sql` e `59-inf-notification.sql`, contratos OpenAPI.
- `@detran/inf-deadlines` (`backend/domains/inf/deadlines`, manuscrito, ADR-0016 §2): `Clock`, `Calendar`, `TimerCatalog`, portas `TimerStore` e `DeadlineEvents` em memória, `createDeadlineEngine` (dias corridos/úteis/meses/anos, data impressa, suspensão com `TIMER_REPROGRAMADO`, prorrogação única de `T-DIL` com `RAIT.INQUIRY_EXTENSION_LIMIT`/`RAIT.DEADLINE_LEGAL_READONLY` e motivo retido, varredura idempotente com `TIMER_VENCIDO`, tempestividade), `DeadlineError`; 23 casos.
- `inf/infraction` manuscrito: espelho tipado das 46 linhas de `infraction_transition_ref`, `resolveTransition`/`assertTransition` (`RAIT.INFRACTION_STATE_INVALID`, `RAIT.INFRACTION_TERMINAL`, `RAIT.INFRACTION_CLOSED_NO_REVISION`), esquemas zod dos cinco eventos publicados; `inf/notification` manuscrito: `acknowledgementMark` por canal (RN-RAIT-104).
- Esquemas JSON em `docs/framework/schemas/events/` (cinco eventos de §2.4).
- Fixtures `30-fixtures-infraction.sql` (15 infrações, uma por estado; 91 timers; avisos, ciências, tentativas, eventos).
- Testes: 18 casos do motor (§7), matriz de 46 transições + negativos exaustivos, esquemas de evento, marcos de ciência, RLS/checks/FKs/unicidade (integration); sensor `inf-rls` 52 → 58 tabelas de tenant.
- Módulos **não** montados no `AppModule` nesta rodada (M13: a superfície HTTP entra em R-0007 com comandos e política); entidades append-only sem `update`/`delete`; scripts raiz (`build`, `backend:test:unit`, `backend:test:integration`); `zod ^4.6.5` entra no workspace.
- Sem rotas, sem job, sem acesso a banco em código manuscrito (R-0007).
- Infra (após o rebase sobre PR #37): `tools/parameters/generate-seed.mjs` emite o contexto de tenant no topo de `05-parameters.sql` (o seed de R-0004 abortava `seed.sh` com "Tenant context is required" e nenhuma fixture carregava); o job `backend-kernel` passa a executar `bash backend/database/seed.sh` após o reset (`rait-test-strategy.md` §7, WP-A) — os testes de integração das fixtures dependem disso.

## Verificação executada

- [x] `pnpm check`
- [x] `pnpm backend:test:ci` (+ `backend:rls-smoke`, `apply.sh --full` + `seed.sh` ×2 em banco limpo)
- [ ] `pnpm --filter @detran/rait-web test` (não se aplica: sem frontend)
- [x] `pnpm exec devai evidence record …` (referência abaixo)
- [x] nenhum arquivo gerado editado à mão; blueprint e gerados no mesmo PR

Revisão cruzada (GPT-5.6 Terra via `tools/orchestra/bridge.sh`): prompt-review-1 FAIL → corrigido → prompt-review-2 PASS; delivery-review-CTG-0001: **DELIVERY_VERDICT**. Evidência DEVAI: **EVIDENCE**.

## Questões abertas tocadas

OD-301 (T-PAR-3A/T-PRESC-5A vencem como alerta, H.46), OD-303 (`known_on` só auditoria), OD-304 (T-NA-IND alerta), OD-305 (NP não reinicia T-PRESC-5A), OD-019. Decisões do Owner nesta rodada: M14 (`reason` `suspensao`/`prorrogacao`, `suspensionActId` obrigatório e anulável, `aggregate.kind` `clock`), M15 (`Deadline.extensionReason`). Lacunas registradas em `work/rounds/R-0006/contracts/CTG-0001.md` §9 e `plan.md` §Bloqueios (não bloqueantes): `TIMER_REPROGRAMADO` ausente de `infraction_event_ref` (só outbox); entrada em `INSTANCIA_ENCERRADA` com `paid=true`; qualificadores por linha (22 × 25, 33 × 36); `acknowledgementMark` síncrona; `context` de `RAIT.INQUIRY_EXTENSION_LIMIT` (catálogo cita `inquiryId`).

## Fora do escopo / deixado explicitamente

Rotas, comandos, varredura agendada e persistência dos timers (R-0007, WP-B); migração de `rait_communication` para projeção e projeções por consumidor (WP-P, M10); fixture de NA por SNE com ciência ficta (contrato §7.3); edição de `14-inf-lifecycle-vocabulary.sql` (lock de `ops-agency`, M4); CTG-0002 (deltas v1.1.0 dos blueprints RAIT, organização, arrecadação, integração, fachada de documentos) na janela 2, PR próprio após `param-store` em `main`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
