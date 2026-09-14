# R-0011 — frente `dashboard-backend` (WP-D1…D3 do DASHBOARD: projeções, estado próprio, ciclo do alerta, deveres, frescor, exportação e contratos)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro GPT-5.6 Sol
(prompt em `prompts/00-maestro.md`). Reviewer: Opus 5 via `tools/orchestra/bridge.sh claude`.
**Depende de:** `rait-backend` (R-0007) e `teat-backend` (R-0008) em `main` (eventos de origem);
`dash-roles` (R-0003) já em `main` desde a onda 1.
**Janelas previstas:** 3.

## Metas

1. **Modelo** (WP-D1): `BP-DASH-MONITOR-001` (namespace `dashboard`): estado próprio `alert`
   ([WF-DASH-001], `track: extinction|irregularity`, severidade, indicador, objeto opaco por camada,
   dono, `governing_clock`, `next_milestone_at`, trilha imutável), `duty` (14 linhas), `duty_cycle`
   ([WF-DASH-002]), `indicator` (42, **seed a partir de [APP-DASHBOARD] §Catálogo** — adiado de WP-D0),
   `indicator_config`, `bi_panel`, `generated_report`, `export_log`, `source`, `transparency_audit`,
   `dataset`; refs `alert_state_ref`, `duty_state_ref`, `freshness_state_ref`, `severity_ref`,
   `layer_ref`, `classification_ref`, `block_ref`; projeções `prescription_risk`, `production`,
   `integration_health`, `crashes`, `pec_deadlines`, `teat_measures`, `portal_service_metrics`,
   `duty_evidence`, `source_freshness` em `*.projection.ts` (eventos de origem declarados,
   idempotentes em `event.id`, versionadas). DDL **`80-dashboard.sql`** (o build pack cita `50`,
   ocupado por `50-ch-telehealth.sql`; corrigir). Timers `owner='dashboard'` (SLA de ACK por
   severidade 24h/8h/2h úteis/imediato; marcos 50/75/90 %; viradas dos 14 deveres; piso de 60 dias
   para 309/314) com `calendar-2026.json`. **Gate novo `verify:domain-boundaries`** (ADR-0020):
   `tools/verify-domain-boundaries.ts` — nenhuma leitura de `inf.*`, `est.*`, `ch.*`, `portal.*`
   fora de `*.projection.ts` — ligado a `pnpm check`. Fixtures: um alerta por estado e trilha, um
   ciclo por estado, fontes nos quatro estados de frescor, exportação pendente.
2. **Ciclo do alerta, deveres, frescor e exportação** (WP-D2, `dashboard-route-contract.md` §2–§5):
   detector (evento → `DETECTADO`; fallback periódico com degradação do selo), classificador
   determinístico, notificador pela cadeia do app de origem (+ AUDITOR em `CRITICO_EXTINCAO`, H.54),
   SLA de ACK, verificação por evidência de origem, `CRITICO_EXTINCAO → INCIDENTE_REGISTRADO`
   (espelho de [WF-RAIT-002] §4.1); ciclo de dever com `ATRASADO`; frescor (heartbeat
   `source.heartbeat` a cada latência/2; ocultar após 3× — H.54); exportação com as cinco regras de
   [RN-DASH-172], supressão primária e secundária ([RN-DASH-161], `dashboard.cell_threshold=10`),
   limite 5.000 linhas com aprovação nominal, finalidades (6, H.54); relatórios por job com marca
   d'água; SSE `/v1/dashboard/stream`. Camadas: `dashboardLayerFor` de R-0003 usado nas rotas (N3 sempre 403).
3. **Contratos** (WP-D3): `BP-DASH-MONITOR-001.commands.openapi.json`; schema dos eventos
   publicados (§6) em `docs/framework/schemas/dashboard-events.schema.json`; **contratos de dado
   por app** como propostas em `docs/framework/contracts/dashboard-feeds/{pec,teat,portal,adapter}.md`
   (`{indicador_id, caso_id, estado_anterior, estado_novo, timestamp, base_legal}`); exemplos com fixtures.
4. Documentação: `dashboard-build-pack.md` §WP-D1…D3 executados (DDL 80; seed dos 42 movido de D0
   para D1); ADR-0020 "Implementação: PR #n"; `dashboard-route-contract.md` §7/§8 atualizados; backlog.

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                                                 | Depende de           | Entrega                                                                                                                                                           |
| --------- | ------------ | ------------------- | -------------- | ------------------------------------------------------------------------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect    | architect-blueprint | Terra / alto   | `MOD-bp-dash-monitor`, `MOD-ddl-80`, `MOD-ddl-14`                                    | —                    | blueprint, refs, projeções (assinatura de cada `*.projection.ts`), timers; desenho de `verify:domain-boundaries`; critérios                                       |
| TASK-0002 | Inspector    | inspector-tests     | Luna / médio   | `MOD-dashboard-tests`, `MOD-tools-boundaries-tests`                                  | TASK-0001            | testes: matriz [WF-DASH-001/002/003], "nenhuma rota altera domínio", camada (N3 403), supressão secundária, replay de projeção, RLS, seeds; caso negativo do gate |
| TASK-0003 | Engineer     | engineer-backend    | Luna / médio   | `MOD-dashboard-module`, `MOD-app-module`, `MOD-tools-boundaries`, `MOD-package-json` | TASK-0002            | módulo gerado, seed dos 42 indicadores, `verify-domain-boundaries.ts` em `pnpm check`; testes verdes                                                              |
| TASK-0004 | Inspector    | inspector-tests     | Terra / alto   | `MOD-dashboard-cycle-tests`                                                          | TASK-0001            | testes do detector/classificador/SLA/escalonamento (e2e), deveres, frescor, exportação (5 regras), relatórios                                                     |
| TASK-0005 | Engineer     | engineer-backend    | Terra / médio  | `MOD-dashboard-handwritten`, `MOD-shared-policy`                                     | TASK-0003, TASK-0004 | serviços do ciclo, notificador, exportação, SSE, rotas §2–§5; testes verdes                                                                                       |
| TASK-0006 | Engineer     | engineer-backend    | Luna / baixo   | `MOD-contracts-commands`, `MOD-schemas`, `MOD-contracts-feeds`                       | TASK-0005            | contrato de comandos, schema de eventos, quatro propostas de feed; `contracts:check`/`contracts:clients`                                                          |
| TASK-0007 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-docs`                                                                           | TASK-0006            | build pack (DDL 80, seed em D1), ADR-0020, route contract §7/§8, backlog                                                                                          |

CTG-0001 = 0001…0003; CTG-0002 = 0004…0006. Um PR por CTG.

## Critérios de aceitação (comandos → resultado)

- `pnpm blueprints:check`, `pnpm contracts:check`, `pnpm contracts:clients` → OK.
- `pnpm verify:rls-ddl`, `pnpm verify:lifecycle-vocabulary` (refs `dashboard.*`), `pnpm verify:decorators` → OK.
- `pnpm verify:domain-boundaries` → OK; leitura direta de `inf.*` fora de `*.projection.ts` inserida
  de propósito → exit 1 (teste do gate).
- `DB_NAME=detran_r11 DB_PASSWORD=postgres bash backend/database/apply.sh --full` + `seed.sh` duas vezes → OK;
  `select count(*) from dashboard.indicator` = 42.
- `pnpm --filter @detran/dashboard-monitor test:unit|test:integration|test:e2e` → verdes; `pnpm --filter @detran/shared test` → `policy.spec.ts` cobre `dashboard:*` usados pelas rotas.
- `pnpm backend:test:ci`, `pnpm check` → verdes; `node tools/docs/kb/check.mjs` → baseline vigente inalterado.

## Mapa entregável → definições

| Entregável | Definição                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| modelo     | `dashboard-build-pack.md` §WP-D1; ADR-0020; [WF-DASH-001…003]; [APP-DASHBOARD] §Catálogo; origem `BP-BI-REPORTING-001`                                       |
| ciclo      | `dashboard-route-contract.md` §2–§5; `dashboard-error-catalog.md`; `rait-deadline-engine.md`; [WF-RAIT-002] §4.1                                             |
| camadas    | [RN-DASH-170]/[RN-DASH-171]; `policy.ts` `dashboardLayerFor` (R-0003)                                                                                        |
| exportação | [RN-DASH-172]; [RN-DASH-161]; steering H.54 (OD-D04…D09, D11, D13); OD-D02 (`dashboard.cell_threshold=10`)                                                   |
| eventos    | `dashboard-route-contract.md` §6–§7; `rait-events-sse-contract.md`; `boat-route-contract.md` §7; `teat-route-contract.md` §8; `portal-route-contract.md` §10 |
| parâmetros | `parameter-catalogue.md` (`dashboard.*`)                                                                                                                     |

## Riscos

- Feeds de PEC/TEAT/PORTAL sem contrato: as projeções correspondentes nascem com fonte
  `DESCONECTADA` e IND-DASH-173 catalogado sem fonte (OD-D12); nada inventado.
- `verify:domain-boundaries` é gate novo em `pnpm check`: rodar sobre o repositório inteiro antes
  de ligar, e corrigir as violações existentes no mesmo PR (nunca lista de exceções silenciosa).
- Lock `packages/ui` não é tocado; `apps/dashboard/web` é R-0016.

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
