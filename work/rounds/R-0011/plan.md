# R-0011 — frente `dashboard-backend` (WP-D1…D3 do DASHBOARD: projeções, estado próprio, ciclo do alerta, deveres, frescor, exportação e contratos)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro GPT-5.6 Sol
(prompt em `prompts/00-maestro.md`). Reviewer: Opus 5 via `tools/orchestra/bridge.sh claude`.
**Concorrência:** abre já; merge por grupo acoplado — CTG-0001 (modelo, refs, projeções, seed dos 42, gate `verify:domain-boundaries`): nenhum upstream — projeções escritas contra os contratos de eventos já publicados (`rait-events-sse-contract.md`, `teat-route-contract.md` §8 e `docs/framework/schemas/events/` de R-0008, `boat-route-contract.md` §7, `portal-route-contract.md` §10) com fixtures. CTG-0002 (ciclo do alerta, deveres, frescor, exportação, SSE, contratos, e2e de escalonamento): `rait-backend` R-0007 (R-0008 já em `main`).
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

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                                                 | Depende de           | Entrega                                                                                                                                                           |
| --------- | -------------------- | ------------------- | -------------- | ------------------------------------------------------------------------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Terra / alto   | `MOD-bp-dash-monitor`, `MOD-ddl-80`, `MOD-ddl-14`                                    | —                    | blueprint, refs, projeções (assinatura de cada `*.projection.ts`), timers; desenho de `verify:domain-boundaries`; critérios                                       |
| TASK-0002 | Inspector            | inspector-tests     | Luna / médio   | `MOD-dashboard-tests`, `MOD-tools-boundaries-tests`                                  | TASK-0001            | testes: matriz [WF-DASH-001/002/003], "nenhuma rota altera domínio", camada (N3 403), supressão secundária, replay de projeção, RLS, seeds; caso negativo do gate |
| TASK-0003 | Engineer             | engineer-backend    | Luna / médio   | `MOD-dashboard-module`, `MOD-app-module`, `MOD-tools-boundaries`, `MOD-package-json` | TASK-0002            | módulo gerado, seed dos 42 indicadores, `verify-domain-boundaries.ts` em `pnpm check`; testes verdes                                                              |
| TASK-0004 | Inspector            | inspector-tests     | Terra / alto   | `MOD-dashboard-cycle-tests`                                                          | TASK-0001            | testes do detector/classificador/SLA/escalonamento (e2e), deveres, frescor, exportação (5 regras), relatórios                                                     |
| TASK-0005 | Engineer             | engineer-backend    | Terra / médio  | `MOD-dashboard-handwritten`, `MOD-shared-policy`                                     | TASK-0003, TASK-0004 | serviços do ciclo, notificador, exportação, SSE, rotas §2–§5; testes verdes                                                                                       |
| TASK-0006 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-contracts-commands`, `MOD-schemas`, `MOD-contracts-feeds`                       | TASK-0005            | contrato de comandos, schema de eventos (`docs/framework/schemas/events/`), quatro propostas de feed; gate completo no checkpoint do maestro                      |
| TASK-0008 | Inspector            | inspector-tests     | Luna / médio   | `MOD-contracts-check-tests`                                                          | TASK-0006            | testes em `tools/contracts/tests` para o catálogo `dashboard` por prefixo (`dashboard-error-catalog.md`) e correspondência bidirecional rota ⇔ operação           |
| TASK-0009 | Engineer             | engineer-backend    | Luna / médio   | `MOD-contracts-check`                                                                | TASK-0008            | `tools/contracts/check-commands.mjs` cobre raízes `dashboard/*` e o catálogo; satisfaz os testes do Inspector                                                     |
| TASK-0007 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-docs`                                                                           | TASK-0009            | build pack (DDL 80, seed em D1), ADR-0020, route contract §7/§8, backlog                                                                                          |

CTG-0001 = 0001…0003; CTG-0002 = 0004…0006 + 0008/0009 (TASK-0006 → 0008 → 0009 → 0007). Um PR por CTG.

**Checkpoint de dependências:** após TASK-0001 o maestro agrupa toda edição de blueprint e roda `pnpm blueprints:generate` uma vez; após TASK-0003 roda `pnpm install` (pacote `@detran/dashboard-monitor` novo), guarda o lockfile para o commit do grupo e libera TASK-0004; após TASK-0006 roda `pnpm contracts:clients` antes de TASK-0008; o Engineer de TASK-0005 inclui o pacote nos scripts `backend:test:*` da raiz e no alias do vitest do app. Banco da rodada: `detran_r11` em `env-detran-r11.sh`.

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

## Lições aplicadas (método §4.8–§4.18, `waves.md` §Histórico)

- Transcrição de fichas, contratos, i18n e docs é ato de **Architect** (`transcriber-docs`); tarefas assim aparecem como "Architect (transcr.)".
- Nenhum Engineer ou transcriber entrega o teste do próprio artefato: contratos → `contracts:test` pelo Inspector; fichas/i18n → teste tela ↔ ficha ↔ rota pelo Inspector.
- Ciclos de review a partir do segundo restritos aos itens corrigidos; contradições contrato × código resolvidas pelo Architect por adenda numerada em `plan.md` antes de redespachar.
- O CTG seguinte só começa a escrever depois do merge do anterior ou nasce em branch empilhado; nunca commits novos no branch de um PR aberto; integrar `main` por merge, nunca `--force`.
- Listas de leitura dos workers fechadas e completas (DDL gerado, blueprint, `seed.sh`, fixtures, specs de referência como `backend/app/tests/e2e/policy-routes.e2e.spec.ts`); lacuna aqui foi `reference-gap` em R-0010.
- M24: o Architect declara `module.handwritten*` com símbolos fixos no blueprint; Engineers nunca editam blueprints; `typecheck` vermelho entre as tarefas do CTG é esperado; toda edição de blueprint do CTG num único checkpoint de regeneração.
- Política prova presença **e** ausência: testes positivos para os papéis listados e negativos para todos os papéis canônicos omitidos; nenhum grant por analogia.
- e2e idempotente em banco persistente: `afterAll` limpa o que criou; `DB_NAME` explícito em `work/rounds/<R>/env-detran-rN.sh`.
- Pacote novo montado no `AppModule` entra em `backend/app/vitest.config.ts` (alias) e `backend/app/package.json`; fixtures novas passam por `bash backend/database/seed.sh` duas vezes e pelo job `backend-kernel`.
- Ao editar `parameter-catalogue.md`, rodar `pnpm parameters:generate`; specs sem literais de chave de parâmetro.
- Handoffs de R-0009 a confirmar no bootstrap em `docs/meta/knowledge-base/backlog.md` §Handoffs e `portal-build-pack.md` §4: OD-P18 (balcão da ouvidoria: transições do órgão da manifestação) — se roteado a esta rodada, vira grupo próprio; OD-P28 (eventos `NOTIFICACAO_*`/`PAGAMENTO_CONFIRMADO` sem produtor em `main`): projeções nascem com fonte `DESCONECTADA` até o produtor existir.
- Projeções consomem os schemas já publicados em `docs/framework/schemas/events/` (R-0008/R-0009) — reutilizar, nunca redefinir.

## Concorrência

(preenchido pelo maestro no bootstrap: upstreams já em `main`, grupos liberados para merge, grupos
em base empilhada e sobre qual branch)

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
