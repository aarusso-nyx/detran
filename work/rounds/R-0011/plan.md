# R-0011 — frente `dashboard-backend` (WP-D1…D3 do DASHBOARD: projeções, estado próprio, ciclo do alerta, deveres, frescor, exportação e contratos)

**Status:** planejado em 2026-09-14 pelo Architect; **aberta em 2026-09-21** pelo maestro Fable 5.1
(Claude Code, Opus 5 nesta sessão; `prompts/00-maestro.md`; `AUTHORIZATION.md`). Reviewer: GPT-5.6 Terra via
`tools/orchestra/bridge.sh codex` (troca de família Sol → Fable decidida pelo Owner em 2026-09-21).
Branch `orchestra/dashboard-backend` a partir de `origin/main` `08fb84e8` (PR #79), worktree
`.claude/worktrees/dashboard-backend-r0011-615f16` (isolado; substitui `detran-worktrees/dashboard-backend`).
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

## Decisões do maestro (Architect, 2026-09-21) — M1…M14

Valem como contrato para os workers; o Architect de TASK-0001 detalha colunas, índices e checks dentro
delas, nunca contra elas. Fontes: `dashboard-build-pack.md` §WP-D1, ADR-0020, [WF-DASH-001…003],
[RN-DASH-120], [RN-DASH-142], [RN-DASH-170], [APP-DASHBOARD] §Catálogo, `dashboard-route-contract.md`
§4/§6, steering H.38/H.54, `parameter-catalogue.md` §DASHBOARD, `BP-DASHBOARD-CRASHES-001` (R-0010).

- **M1 — Pacote e blueprint.** Um blueprint novo `docs/framework/blueprints/BP-DASH-MONITOR-001.json`
  (`module.name: "Monitor"`, `module.namespace: "dashboard"`, `module.version: "1.0.0"`,
  `module.ddlFile: "80-dashboard.sql"`, `module.owners: ["detran-dashboard"]`) gera o pacote
  `@detran/dashboard-monitor` em `backend/domains/dashboard/monitor`. Dependências do CTG-0001:
  `@detran/shared`, `@detran/ops-parameter` (mesmos `testAliases` de `BP-DASHBOARD-CRASHES-001`).
  `handwrittenExports: ["handwritten/index"]`; `handwrittenProviders` só com o símbolo fixo
  `DASHBOARD_MONITOR_PROJECTORS` (`handwritten/projectors`) — o Engineer cria os arquivos com esses
  nomes (método §4.13, M24 de R-0009). Nenhuma rota no CTG-0001: todo `api.resources[].operations`
  é `[]` (padrão de R-0010); rotas, política e `@Audit` chegam no CTG-0002 (edição única do blueprint
  por CTG, `module.version` 1.1.0).
- **M2 — `dashboard.crashes` já existe.** A projeção `crashes` é `BP-DASHBOARD-CRASHES-001`
  (`@detran/dashboard-crashes`, DDL `71-dashboard-crashes.sql`, R-0010, PR #71) — **não é
  redefinida** nem duplicada; `BP-DASH-MONITOR-001` a cita na `description` e os indicadores 203/204/310
  apontam para `projection = 'dashboard.crashes'`. As oito projeções restantes de §6 do contrato de
  rotas vivem em `@detran/dashboard-monitor`.
- **M3 — Vocabulário em DDL manuscrito `19-dashboard-lifecycle-vocabulary.sql`** (Architect; faixa
  `1x`, tabelas globais sem `tenant_id` e sem RLS, padrão de `19-est-lifecycle-vocabulary.sql`;
  `ON CONFLICT (code) DO UPDATE`): `dashboard.alert_state_ref` (os 10 estados de [WF-DASH-001]:
  `DETECTADO`, `CLASSIFICADO`, `NOTIFICADO`, `RECONHECIDO`, `EM_TRATAMENTO`, `VERIFICADO`, `ENCERRADO`,
  `ESCALONADO`, `CRITICO_EXTINCAO`, `INCIDENTE_REGISTRADO`), `dashboard.alert_transition_ref`
  (`from_state, to_state, trigger, actor, track, rule_ref` — uma linha por linha da tabela
  "Transições e gatilhos" de [WF-DASH-001]), `dashboard.duty_state_ref` (8 estados de [WF-DASH-002]:
  `JANELA_ABERTA`, `EM_APURACAO`, `PREPARADO`, `SUBMETIDO_PUBLICADO`, `COMPROVADO`, `ARQUIVADO`,
  `ATRASADO`, `NAO_CUMPRIDO`), `dashboard.duty_transition_ref`, `dashboard.freshness_state_ref`
  (4 estados de [WF-DASH-003]: `FRESCO`, `ATRASADO`, `INDISPONIVEL`, `DESATUALIZADO_MARCADO`;
  "oculto" é estratégia de UI, não estado), `dashboard.severity_ref` (`N1`, `N2`, `N3`, `CRITICO`),
  `dashboard.layer_ref` (`N0`…`N3`, [RN-DASH-170]), `dashboard.classification_ref` (`P1`, `P2`, `P3`,
  [RN-DASH-142]), `dashboard.block_ref` (`A`…`D` com `kind`: `legal-ceiling`, `dever-periodico`,
  `sla-operacional`, `saude-tecnica`) e `dashboard.timer_ref` (M7). Os dois DDL novos entram na lista
  `ordinary` de `backend/database/apply.sh` (linha 29) na posição lexicográfica.
- **M4 — Estado próprio (entidades do blueprint, todas com `tenant_id`, RLS pelo gerador).**
  `alert` (indicador, `track` ∈ {`extinction`,`irregularity`}, `state`, `severity`, `block`,
  `source_app`, objeto opaco por camada = `object_kind` + `object_ref` + `object_layer` ∈ `layer_ref`,
  `owner_role` + `owner_ref`, `governing_clock` ∈ {`A`,`B`,`C`,`D`} nulo ([RN-DASH-131]),
  `next_milestone_at`, `ceiling_on`, carimbos por transição, `ack_channel` ∈ {`origin`,`manual`},
  `escalation_level`, `incident_ref`, `version`); `alert_trail` (`applicationAppendOnly: true`;
  `seq`, `from_state`, `to_state`, `actor_kind` ∈ {`system`,`user`,`timer`}, `note`,
  `root_cause_category` ∈ {`transport`,`acceptance`,`payload`} nulo, `event_id`); `duty` (catálogo
  dos deveres de [RN-DASH-120] por tenant: `code`, `line_no`, `title`, `source_ref`, `periodicity`,
  `deadline_rule` verbatim, `deadline_kind`, `consequence`, `scope` ∈ {`estadual`,`federal`,`historico`},
  `owner_role = 'dash-duty-owner'` (H.38), `owner_actor` verbatim, `indicator_code` nulo, `mvp` booleano
  = linhas 1, 2, 8, 9, 10, 11, 13, 14 de [RN-DASH-120] §Verificação 3 — ver A4); `duty_cycle`
  (`duty_code`, `period`, `state`, `deadline_on` nulo = "sem prazo definido" [RN-DASH-113],
  carimbos, `evidence_protocol`, `evidence_capture_uri`, `evidence_hash`, `draft_ref`, `version`;
  único em `(tenant_id, duty_code, period)`); `indicator` (42 linhas por tenant: `code`, `block`,
  `kind`, `name`, `question`, `source_app`, `source_ref` verbatim, `threshold_rule` verbatim,
  `owner_actor` verbatim, `expected_action` verbatim, `classification` **default `P3`** ([RN-DASH-142]
  §Verificação 1), `latency_band` por bloco ([WF-DASH-003]), `acceptable_latency_minutes` nulo
  (valor exato é `source_pending`, DT-030 aprovou só as faixas), `projection` (nome da projeção ou
  nulo), `connected` booleano (M5), `clock_code` nulo); `indicator_config`, `bi_panel`,
  `generated_report` (formas portadas de `BP-BI-REPORTING-001` da origem TEAT, com `tenant_id`, sem
  `traffic_agency_id`; `bi_panel.visibility_profile` ∈ `layer_ref` sem `N3`, `generated_report.status`
  ∈ {`processing`,`completed`,`failed`}, `file_hash`, marca d'água em CTG-0002); `export_log`
  (`scope`, `filters_json`, `format`, `layer`, `purpose` nulo, `rows`, `status` ∈
  {`registered`,`pending-approval`,`approved`,`rejected`}, `approved_by`, `watermark`, `suppressed_cells`);
  `source` (selo de frescor por fonte/painel: `source_key`, `app`, `state` ∈ `freshness_state_ref`,
  `last_seen_at`, `last_read_at`, `acceptable_latency_minutes` nulo, `heartbeat_contract` nulo,
  `stale_since`, `hidden` booleano); `transparency_audit` (ciclo mensal do IND-DASH-209: `period`,
  `checklist_json`, `result`, `audited_by`); `dataset` (sete requisitos de [RN-DASH-151] como colunas
  booleanas + `changelog_json`, `suppression_applied`); `monitor_projection_applied_event` (ledger
  único das projeções deste pacote, chave `(tenant_id, projection_name, event_id)`, padrão de
  `crash_projection_applied_event`); e as tabelas de projeção `prescription_risk`, `production`,
  `integration_health`, `pec_deadlines`, `teat_measures`, `portal_service_metrics`, `duty_evidence`
  (cada uma com `last_event_id`, `event_schema_version`, `aggregate_version`, chave natural única por
  célula). Nenhum dado pessoal, placa, nº de processo ou atributo de saúde em coluna alguma
  ([RN-DASH-170] N3): identificação de objeto só como `object_ref` opaco com `object_layer`.
- **M5 — Projeções (`*.projection.ts`, ADR-0020).** Nove projetores manuscritos em
  `backend/domains/dashboard/monitor/src/handwritten/projections/<nome>.projection.ts`:
  `prescription-risk`, `production`, `integration-health`, `pec-deadlines`, `teat-measures`,
  `portal-service-metrics`, `duty-evidence`, `source-freshness` (atualiza `dashboard.source`) — o nono
  (`crashes`) é o de R-0010 (M2). Contrato de cada arquivo: cabeçalho `// Source events: …`; `export
const consumedEvents = [...] as const` **não vazio, literal** (contrato do gate M6); `PROJECTION_NAME =
'dashboard.<nome>'`; `apply(event, ctx)` idempotente por `event.id` via o ledger de M4, dentro de
  uma transação, gravando `event_schema_version` e `aggregate_version`; replay a partir de
  `integration.outbox` (única leitura cruzada admitida). Eventos de origem **só do que está publicado**
  em `main`: `rait-events-sse-contract.md` §2 (`rait.*`, `inf.infraction.*`, `inf.timer.*`),
  `docs/framework/schemas/events/*.schema.json` (TEAT: `ait.*`, `measure.changed`, `alcohol.changed`,
  `sync.*`, `numbering.*`, `device.*`, `catalog/package.published`, `evidence.*`, `custody.event`,
  `probative-package.generated`), `boat-route-contract.md` §7 (`SINISTRO_*`), `portal-route-contract.md`
  §10 (`SOLICITACAO_*`, `MANIFESTACAO_*`, `AVALIACAO_REGISTRADA`, `NOTIFICACAO_*`,
  `PAGAMENTO_CONFIRMADO`). Tabela indicador → projeção → eventos → `connected` é entregável de
  TASK-0001 (§Mapa de projeções, em `work/rounds/R-0011/contracts/CTG-0001.md`); `connected = true`
  somente quando **existe produtor em `main`** do evento consumido (OD-P28, handoff de R-0009:
  `NOTIFICACAO_*`/`PAGAMENTO_CONFIRMADO` sem produtor → 208 e o que deles depende nascem
  `connected = false`); PEC não publica eventos (`pec_deadlines` nasce com `consumedEvents` do
  contrato proposto em WP-D3 e `connected = false`, 106/107/306…309); IND-DASH-173/medidores fora do
  catálogo (OD-D12: 42 = 11 + 9 + 14 + 8 de [APP-DASHBOARD] §Catálogo); adapter (403) sem telemetria
  publicada → `connected = false`. "Fonte desconectada" **não é estado novo**: é `indicator.connected =
false` + `source.state = 'INDISPONIVEL'` com `heartbeat_contract` nulo ([WF-DASH-003];
  `DASH.SOURCE_HEARTBEAT_UNDEFINED`).
- **M6 — Gate `verify:domain-boundaries`.** Generaliza **em vez de duplicar** o verificador que
  R-0010 deixou em `tools/domain-boundaries/verify.mjs` (só duas raízes e só eventos BOAT; não ligado a
  `pnpm check`): passa a varrer **`backend/domains/**`** inteiro (`src/**`, `.ts/.mjs`, exceto
  `tests/`, `*.spec.ts`, `vitest.config.ts`, `dist/`, `src/generated/`), detectando **acesso SQL**
  (`from|join|into|update|delete from` seguido de `<schema>.<tabela>`) a um schema de domínio
  (`inf`, `est`, `ch`, `portal`, `dashboard`) diferente do dono do arquivo (segmento após
  `domains/`). Admitidos: schemas de plataforma `ops.*` (parâmetros, agência) e `integration.*`
  (outbox, espelhos); tabelas de vocabulário global `*_ref` (DDL `1x`, sem tenant); leituras cruzadas
  **somente** em arquivos `*.projection.ts` que exportam `consumedEvents` literal não vazio. Dívidas
  conhecidas ficam numa lista **declarada e impressa** (nunca silenciosa), cada uma com `OD-*`:
  hoje uma — `backend/domains/ops/field/src/handwritten/shift-readiness.ts` lê
  `inf.normative_mobile_package` (OD-D15, handoff ao dono do TEAT; fora dos locks desta rodada).
  `backend/app/src` (raiz de composição, um deployable) fica fora do gate nesta rodada (OD-D16,
  backlog). Script `"verify:domain-boundaries": "node tools/domain-boundaries/verify.mjs"` entra em
  `pnpm check` logo após `verify:senatran-boundary`. O caminho `tools/verify-domain-boundaries.ts`
  do plano original cai (A2).
- **M7 — Timers sem tocar `@detran/inf-deadlines`.** R-0007 CTG-0003 (infração e timers) está
  ativo sobre o motor de prazos; esta rodada **não altera** `backend/domains/inf/deadlines`. No
  CTG-0001 os timers do DASHBOARD são vocabulário em `dashboard.timer_ref` (`owner = 'dashboard'`,
  `code`, `duration_value`, `duration_unit` ∈ {`horas_uteis`,`dias_corridos`,`percentual`,`imediato`,
  `data_fixa`,`mensal`,`anual`} (conjunto fechado por A7),
  `applies_to`, `status`, `legal_basis`/`decision_ref`): `T-DASH-ACK-N1` 24 h úteis, `T-DASH-ACK-N2`
  8 h úteis, `T-DASH-ACK-N3` 2 h úteis, `T-DASH-ACK-CRITICO` imediato (`dashboard.ack_sla`, DT-030);
  `T-DASH-MARCO-50/75/90` ([WF-DASH-001] matriz; [WF-RAIT-002] §4); `T-DASH-DUTY-<código>` para as
  viradas dos deveres com data ([WF-DASH-002] §Prazos: dia 20 → 201; mensal → 202 com
  `dashboard.duty.IND-202.deadline` proposta; 30 de abril → Pnatrans; 31/12 + preparação → 206/207,
  `dashboard.duty.annual_deadline`; mensal → 209, `dashboard.transparency.audit_period`);
  `T-DASH-PENDING-FLOOR` 60 dias (309/314, `dashboard.pending_age_floor_days`). Armar/vencer, marcos
  em `alert.next_milestone_at` e `calendar-2026.json` são CTG-0002 (extensão do motor se R-0007
  CTG-0003 expuser `owner`, senão relógio próprio do pacote usando só `Calendar`/`Clock` de
  `@detran/inf-deadlines` como dependência de leitura).
- **M8 — Fixtures em dois arquivos (fronteiras disjuntas).** `backend/database/seed/80-fixtures-dashboard-catalog.sql`
  (Engineer TASK-0003: 42 `indicator` + linhas de `duty` para o tenant de fixtures, `ON CONFLICT
(tenant_id, code) DO UPDATE`) e `81-fixtures-dashboard-state.sql` (Inspector TASK-0002: um `alert`
  por estado **e** por trilha onde a trilha admite o estado, com `alert_trail`; um `duty_cycle` por
  estado; quatro `source` nos quatro estados; um `export_log` `pending-approval`). Ambos entram em
  `backend/database/seed/seed.sh` (Engineer TASK-0003, ao fim da lista) e são provados por duas
  execuções. Tenant de fixtures `00000000-0000-7000-8000-00000000a001`; ids com prefixo
  `00000000-0000-7000-8000-000080…` (catálogo) e `…000081…` (estado); usuários de
  `00-fixtures-core.sql`.
- **M9 — Testes do CTG-0001 (Inspector).** Sem comandos ainda, o Inspector codifica: (a)
  vocabulário — `tools/check-lifecycle-vocabulary.ts` passa a comparar `19-dashboard-lifecycle-vocabulary.sql`
  com os tokens de [WF-DASH-001/002/003] (conjuntos fechados, mesmo padrão INF/EST); (b)
  `alert_transition_ref`/`duty_transition_ref` contêm exatamente as transições das tabelas dos
  workflows (integração); (c) RLS — leitura cruzada de tenant em cada tabela com `tenant_id` do
  pacote retorna vazio; (d) seeds — 42 indicadores, contagem de `duty` de A4, um alerta por estado e
  trilha, um ciclo por estado, 4 fontes, exportação pendente; `classification = 'P3'` em todos os 42;
  `connected` conforme o mapa de TASK-0001; (e) replay — cada projetor aplica as fixtures de evento
  duas vezes e o efeito é idêntico (ledger), versões gravadas, `consumedEvents` ⊆ catálogo publicado
  (schemas + contratos), erro tipado em evento fora de `consumedEvents`; (f) "nenhuma rota altera
  domínio" no CTG-0001 = o módulo gerado não registra controller algum e o pacote não exporta
  controller; (g) gate — casos positivo, negativo (violação inserida → exit 1), `*_ref` admitido,
  dívida declarada impressa, `.projection.ts` sem `consumedEvents` → exit 1 (TASK-0011, `node --test`).
  Camada N3/403, supressão secundária e matriz de comandos são CTG-0002 (TASK-0004).
- **M10 — Wiring do pacote novo** (método §4.10; Engineer TASK-0003): `MonitorModule` em
  `backend/app/src/app.module.ts`, dependência em `backend/app/package.json`, alias em
  `backend/app/vitest.config.ts`, `@detran/dashboard-monitor` em `build` e em
  `backend:test:unit|integration|e2e` de `package.json`. O maestro roda `pnpm install` após a
  regeneração (checkpoint 1) e guarda `pnpm-lock.yaml` para o commit do grupo antes de liberar
  Inspector e Engineers.
- **M11 — Regeneração única por CTG.** Toda edição de blueprint do CTG-0001 é de TASK-0001; o
  maestro roda `pnpm blueprints:generate` + `pnpm contracts:openapi` + `pnpm contracts:clients` uma vez
  (checkpoint 1) e commita blueprint + gerados juntos. Engineers nunca editam blueprints.
- **M12 — Banco da rodada.** `work/rounds/R-0011/env-detran-r11.sh` com `DB_NAME=detran_r11`;
  todo e2e/integração limpa no `afterAll` o que criou (método §4.16).
- **M13 — Parâmetros.** Nenhuma chave nova no CTG-0001; specs sem literais de chave
  (`verify:parameter-catalogue`); o valor exato de latência por painel é `source_pending` e a linha
  `dashboard.source.acceptable_latency_minutes` (proposta, `source_pending`, DT-030 faixas) é adicionada
  ao catálogo pela tarefa de documentação (TASK-0007) com `pnpm parameters:generate`.
- **M14 — CTG-0002 inalterado no escopo** (TASK-0004…0009 + 0007); seus prompts são escritos depois
  do merge do CTG-0001 (ou antes, se sobrar orçamento, mas nunca disparados antes do merge — método
  §4.18), sobre `origin/orchestra/rait-backend` se R-0007 CTG-0003 ainda não estiver em `main`.

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                                                             | Depende de           | Entrega                                                                                                                                                                                                       |
| --------- | -------------------- | ------------------- | -------------- | ------------------------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus / alto    | `MOD-bp-dash-monitor`, `MOD-ddl-19-dashboard`, `MOD-ddl-80`, `MOD-apply-sh`, `MOD-r11-contracts` | —                    | `BP-DASH-MONITOR-001.json`, `19-dashboard-lifecycle-vocabulary.sql`, `apply.sh`; `contracts/CTG-0001.md` (mapa indicador → projeção → eventos → `connected`, assinaturas dos 8 projetores, timers, critérios) |
| TASK-0002 | Inspector            | inspector-tests     | Sonnet / médio | `MOD-dashboard-monitor-tests`, `MOD-seed-81`                                                     | TASK-0001            | `backend/domains/dashboard/monitor/tests/**` (M9 a–f), fixtures de estado `81-fixtures-dashboard-state.sql`                                                                                                   |
| TASK-0011 | Inspector            | inspector-tests     | Sonnet / médio | `MOD-tools-boundaries-tests`, `MOD-check-lifecycle-vocabulary`                                   | TASK-0001            | `tools/domain-boundaries/tests/**` (M9 g) e extensão de `tools/check-lifecycle-vocabulary.ts` ao DASHBOARD                                                                                                    |
| TASK-0003 | Engineer             | engineer-backend    | Sonnet / médio | `MOD-tools-boundaries`, `MOD-package-json`, `MOD-app-module`, `MOD-seed-80`, `MOD-seed-sh`       | TASK-0011            | `verify.mjs` generalizado (M6) e ligado a `pnpm check`; wiring do pacote (M10); `80-fixtures-dashboard-catalog.sql` (42 + deveres) e `seed.sh`                                                                |
| TASK-0010 | Engineer             | engineer-backend    | Opus / médio   | `MOD-dashboard-monitor-handwritten`                                                              | TASK-0002            | `src/handwritten/**` do pacote: 8 projetores (M5), `projectors.ts`, `index.ts`; testes de TASK-0002 verdes                                                                                                    |
| TASK-0004 | Inspector            | inspector-tests     | Opus / alto    | `MOD-dashboard-cycle-tests`                                                                      | TASK-0001            | testes do detector/classificador/SLA/escalonamento (e2e), deveres, frescor, exportação (5 regras), relatórios, camada (N3 403), supressão secundária                                                          |
| TASK-0005 | Engineer             | engineer-backend    | Opus / médio   | `MOD-dashboard-handwritten`, `MOD-shared-policy`                                                 | TASK-0010, TASK-0004 | serviços do ciclo, notificador, exportação, SSE, rotas §2–§5; testes verdes                                                                                                                                   |
| TASK-0006 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-contracts-commands`, `MOD-schemas`, `MOD-contracts-feeds`                                   | TASK-0005            | contrato de comandos, schema de eventos (`docs/framework/schemas/events/`), quatro propostas de feed; gate completo no checkpoint do maestro                                                                  |
| TASK-0008 | Inspector            | inspector-tests     | Sonnet / médio | `MOD-contracts-check-tests`                                                                      | TASK-0006            | testes em `tools/contracts/tests` para o catálogo `dashboard` por prefixo (`dashboard-error-catalog.md`) e correspondência bidirecional rota ⇔ operação                                                       |
| TASK-0009 | Engineer             | engineer-backend    | Sonnet / médio | `MOD-contracts-check`                                                                            | TASK-0008            | `tools/contracts/check-commands.mjs` cobre raízes `dashboard/*` e o catálogo; satisfaz os testes do Inspector                                                                                                 |
| TASK-0007 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                                                                       | TASK-0009            | build pack (DDL 80, seed em D1), ADR-0020, route contract §7/§8, backlog, `waves.md` (troca de família), parâmetro `source_pending` (M13), OD-D14…D16                                                         |

CTG-0001 = 0001 → {0002 ∥ 0011} → {0010 ∥ 0003} (fronteiras disjuntas; no máximo três em paralelo); CTG-0002 = 0004…0006 + 0008/0009 (TASK-0006 → 0008 → 0009 → 0007). Um PR por CTG.

**Checkpoint de dependências:** checkpoint 1 = após TASK-0001 o maestro roda `pnpm blueprints:generate` + `pnpm contracts:openapi` + `pnpm contracts:clients` uma vez, `pnpm install` (pacote `@detran/dashboard-monitor` novo), guarda o lockfile para o commit do grupo e só então libera TASK-0002/0011; checkpoint 2 = após TASK-0003/0010, gates do grupo (§Critérios) e delivery-review; TASK-0004 só depois do merge do CTG-0001; após TASK-0006 roda `pnpm contracts:clients` antes de TASK-0008; o Engineer de TASK-0005 inclui o pacote nos scripts `backend:test:*` da raiz e no alias do vitest do app. Banco da rodada: `detran_r11` em `env-detran-r11.sh`.

## Critérios de aceitação (comandos → resultado)

- `pnpm blueprints:check`, `pnpm contracts:check`, `pnpm contracts:clients` → OK.
- `pnpm verify:rls-ddl`, `pnpm verify:lifecycle-vocabulary` (refs `dashboard.*`), `pnpm verify:decorators` → OK.
- `pnpm verify:domain-boundaries` → `domain boundaries verified (N files)` com a dívida OD-D15 impressa como aviso;
  `node --test tools/domain-boundaries/tests/*.test.mjs` → verde (inclui violação inserida de propósito → exit 1).
- `source work/rounds/R-0011/env-detran-r11.sh && bash backend/database/apply.sh` (sem `--full`: R-0007 restringiu
  `--full` a `detran_r7_ctg1_a2` com `DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED=1`; o banco `detran_r11` é criado
  uma vez com `create database` e o `apply.sh` incremental é idempotente) + `seed.sh` duas vezes → OK;
  `select count(*) from dashboard.indicator where tenant_id = '00000000-0000-7000-8000-00000000a001'` = 42;
  `select count(*) from dashboard.duty …` = contagem de A4; `select count(*) from dashboard.alert …` = uma linha por (estado, trilha) admitida.
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

Registro do bootstrap (2026-09-21, `origin/main` = `08fb84e8`, PR #79; `gh pr list --search orchestra/`):

- **Já em `main`**: R-0003 (dash-roles, PR #32: `dash-operator`/`dash-duty-owner`, `dashboard:*`,
  `dashboardLayerFor`), R-0004, R-0005, R-0006 (PRs #39/#43/#46: `@detran/inf-deadlines`,
  `inf.infraction.*`/`inf.timer.*`), R-0007 CTG-0001/0002 (PR #69: `rait.case.changed|admitted|received|withdrawn`,
  `rait.assignment.changed`, `DetranError`; **`rait.clock.flag-changed`, `rait.decision.published`,
  `rait.case.created` ainda sem produtor** — OD-D17, ver §Triagem), R-0008 (PRs #47…#52: eventos TEAT em
  `docs/framework/schemas/events/`), R-0009 (PRs #54/#56/#57: `portal.*` projeções, `check-commands.mjs`,
  `contracts:clients`, `policy-routes.e2e.spec.ts`), R-0010 (PRs #55/#71/#72: `BP-DASHBOARD-CRASHES-001`,
  `71-dashboard-crashes.sql`, `tools/domain-boundaries/verify.mjs`, `72-fixtures-boat-projections.sql`),
  R-0013 CTG-0001/0002 (PRs #70/#73), R-0014 (PRs #60…#67), R-0012 CTG-0001 (PR #79).
- **CTG-0001 — livre para merge**: nenhum upstream pendente; desenvolvido sobre `origin/main`.
- **CTG-0002 — preso a R-0007 CTG-0003** (infração e timers): `origin/orchestra/rait-backend` está em
  `a8d60d88` (fixes de CI/teste sobre CTG-0002; CTG-0003 ainda não publicado). Regra: se ao abrir o
  CTG-0002 o branch de R-0007 já expuser os eventos/`owner` do motor, desenvolver empilhado
  (`git merge --no-edit origin/orchestra/rait-backend`, nunca rebase após o push); senão, checkpoint ao
  fim do CTG-0001 e retomada na janela seguinte.
- **Frentes ativas em paralelo**: R-0007 `rait-backend` (Sol; locks `backend/domains/inf/rait-*`,
  `inf/deadlines`, `policy.ts` RAIT) — por isso M7 não toca o motor de prazos; R-0013 `teat-frontends`
  (Sol; `apps/teat/*`, `packages/ui`) — sem interseção; R-0012 `rait-web` (Fable; `apps/rait/web`,
  `packages/ui`) — sem interseção; **R-0016 `dashboard-console`** aberta em 2026-09-21 no mesmo HEAD
  (worktree `.claude/worktrees/dashboard-console-r0016-f15a49`, branch `orchestra/dashboard-console`;
  lock `apps/dashboard/web`) — depende do merge desta rodada para consumir `@detran/api-clients` do
  DASHBOARD; nenhum caminho comum (esta rodada não toca `apps/`).
- **Locks desta rodada**: `backend/domains/dashboard/**` (exceto `crashes`, lido e não editado),
  `docs/framework/blueprints/BP-DASH-MONITOR-001.json`, `backend/database/ddl/{19-dashboard-lifecycle-vocabulary,80-dashboard}.sql`,
  `backend/database/apply.sh` (lista `ordinary`), `backend/database/seed/{80,81}-fixtures-dashboard-*.sql` +
  `seed.sh`, `tools/domain-boundaries/**`, `tools/check-lifecycle-vocabulary.ts`, `package.json` (scripts),
  `backend/app/{src/app.module.ts,package.json,vitest.config.ts}` (wiring), `pnpm-lock.yaml`;
  `policy.ts` só no CTG-0002. `policy.ts` é lock de R-0007 (regras RAIT): no CTG-0002 esta rodada só
  acrescenta/ajusta o bloco `dashboard:*` (A12(a) de R-0014: regra transversal só no módulo dono).
- **Handoffs de R-0009 confirmados** (`backlog.md` §Handoffs, `portal-build-pack.md` §4): OD-P18 (balcão
  da ouvidoria) **não** é roteado a esta rodada — permanece no PORTAL; OD-P28 (eventos sem produtor)
  aplicado em M5 (`connected = false` até existir produtor).

## Adendas (Architect)

- **A1 (2026-09-21)** — `dashboard.crashes` é a projeção de R-0010 (`BP-DASHBOARD-CRASHES-001`); a meta 1
  cita "crashes" entre as projeções de `BP-DASH-MONITOR-001` por herança do build pack de 2026-09-13;
  vale M2 (reutilizar, nunca redefinir).
- **A2 (2026-09-21)** — o gate `verify:domain-boundaries` vive em `tools/domain-boundaries/verify.mjs`
  (R-0010, com `node --test` próprio), generalizado por M6; o caminho `tools/verify-domain-boundaries.ts`
  da meta 1 e da tabela original cai.
- **A3 (2026-09-21)** — timers do DASHBOARD no CTG-0001 são vocabulário (`dashboard.timer_ref`, M7); a meta 1
  ("no motor de prazos com `owner='dashboard'`") é cumprida no CTG-0002, depois de R-0007 CTG-0003, sem
  editar `@detran/inf-deadlines` nesta rodada.
- **A4 (2026-09-21)** — [RN-DASH-120] anuncia "quatorze linhas" e sua tabela traz **15** (1…14 + a linha
  `+` Pnatrans, "divulgação federal; o insumo é estadual"). `dashboard.duty` recebe as 15 linhas
  (`line_no` 1…14 e `code = 'DUTY-PNATRANS'` com `line_no` nulo, `scope = 'federal'`); a inconsistência
  vira **OD-D14** (build pack §5, TASK-0007). Nenhuma linha inventada, nenhuma omitida.
- **A5 (2026-09-21)** — fixtures divididas por papel (M8): catálogo (Engineer, 80) e estado (Inspector, 81),
  para que Inspector e Engineer nunca escrevam no mesmo arquivo.
- **A7 (2026-09-21, prompt-review-1 item 5)** — M7 fecha `dashboard.timer_ref.duration_unit` em sete
  tokens: `horas_uteis`, `dias_corridos`, `percentual`, `imediato` (SLA de ACK, marcos, piso) **e**
  `data_fixa`, `mensal`, `anual` (viradas de período dos deveres — [WF-DASH-002] §Prazos: "dia 20 do
  mês subsequente", "mensal", "30 de abril", "31/12 + preparação", "auditoria mensal"). A cadência
  textual verbatim vai em `applies_to`/`legal_basis`; o token só classifica a unidade. Nenhum outro
  valor é admitido.
- **A8 (2026-09-21, relatório TASK-0001 OD-D18)** — [WF-DASH-001] traz `ESCALONADO --> NOTIFICADO :
reinicia notificação no próximo nível da cadeia` no diagrama de estados (aprovado) e a omite na tabela
  "Transições e gatilhos". O diagrama é parte do workflow aprovado e sem a aresta `ESCALONADO` é terminal
  de fato, o que contradiz [WF-DASH-001] §Atores ("mantém a cadeia de escalonamento viva"). Decisão:
  `alert_transition_ref` inclui a linha `seq 65: ESCALONADO → NOTIFICADO, actor system, track both,
rule_ref 'WF-DASH-001 §Estados (diagrama)'`; OD-D18 permanece para TASK-0007 alinhar a tabela do corpus.
- **A9 (2026-09-21, checkpoint 1)** — o gerador emite controllers vazios mesmo com `operations: []` e o
  módulo os registra (igual a `crashes`); C-0001-06 do contrato ("nenhum controller registrado") contradizia
  o gerador (`sensor-error` do contrato). Redação nova em `contracts/CTG-0001.md` §6 e no prompt de TASK-0002
  item 5: nenhum controller com método de rota, `operations` todos `[]`, sem `*Controller` exportado, sem
  `*.controller.ts` manuscrito, OpenAPI gerado sem operações.
- **A6 (2026-09-21)** — CTG-0001 decomposto em 5 tarefas (0001; 0002 ∥ 0011; 0010 ∥ 0003) em vez de 3, para
  manter cada worker dentro de um lock e do orçamento de um Sonnet/Opus médio.

## Bloqueios

(nenhum)

## Triagem

(uma linha por falha de hard gate: `plant-bug | sensor-error | policy-issue | reference-gap`)

- 2026-09-21 TASK-0001 — `reference-gap` (OD-D17): §Concorrência afirmava `rait.clock.flag-changed` e
  `rait.decision.published` em `main` (PR #69) a partir do contrato publicado; o grep de produtores em
  `backend/domains/**/src` mostra só `rait.case.changed|admitted|received|withdrawn` e
  `rait.assignment.changed`. Efeito: IND-DASH-101…105 nascem `connected = false` até R-0007 CTG-0003
  (relógios/timers); bloco A no CTG-0001 = 2/11 conectados (108, 109). Sem retrabalho: M5 já previa a
  regra; a linha de §Concorrência foi corrigida.

## Retomada

**Checkpoint 1 — 2026-09-21, fim da janela 1 (≈68 % do orçamento; as duas tarefas seguintes ultrapassariam
os 80 %).** Estado:

- **Concluídas**: bootstrap (`4bfb11d4`), prompt-review 1 REVIEW → 2 PASS (`af3f5d87`), TASK-0001 (Architect,
  Opus; relatório em `reports/TASK-0001.md`; adendas A7, A8, A9), checkpoint 1 do maestro (regeneração única de
  `BP-DASH-MONITOR-001` → `backend/domains/dashboard/monitor`, `80-dashboard.sql`, `BP-DASH-MONITOR-001.openapi.json`,
  cliente gerado; `pnpm install` com lockfile; `blueprints:check`, `contracts:check`, `verify:rls-ddl`,
  `verify:decorators` verdes; `typecheck` do pacote vermelho só por `./handwritten/{index,projectors}.js` — M24;
  banco `detran_r11` criado, `apply.sh` incremental ×2 e `seed.sh` ×2 OK; 32 tabelas `dashboard.*`).
- **Em curso**: nenhuma.
- **Pendentes (CTG-0001)**: TASK-0002 ∥ TASK-0011 (Inspectors, Sonnet/médio; prompts `PC-…` em
  `compositions.json`, já com PASS do reviewer; TASK-0002 item 5 realinhado por A9 — recalcular `pc_id` antes do
  disparo) → depois TASK-0010 (Engineer, Opus) ∥ TASK-0003 (Engineer, Sonnet) → checkpoint 2 (gates do grupo,
  `pnpm check`, `backend:test:ci`) → `delivery-review-CTG-0001` → evidência → merge de `origin/main` → push →
  PR → CI → merge → `audit observe`. CTG-0002: prompts a compor após o merge (M14), preso a R-0007 CTG-0003.
- **Último veredito do reviewer**: `prompt-review-2.json` PASS (2026-09-21).
- **Próximos passos do maestro ao retomar**: `git fetch -q origin && git log --oneline HEAD..origin/main`
  (integrar por `git merge --no-edit origin/main` só se houver commits novos — o branch ainda **não** foi
  publicado, logo `git rebase origin/main` é admissível); `source work/rounds/R-0011/env-detran-r11.sh`;
  recalcular `pc_id` de TASK-0002 (`compositions.json`) e disparar TASK-0002 e TASK-0011 em paralelo com os
  prompts de `prompts/`; ao receber os relatórios, gravar `reports/TASK-000n.md`, marcar `status`, atualizar
  `budget.json`; depois TASK-0010 ∥ TASK-0003.
- **Lições desta janela** (para `waves.md` §Histórico via TASK-0007): (1) grep de **produtores** antes de
  afirmar que um evento contratado "está em `main`" (OD-D17); (2) `apply.sh --full` não é mais utilizável fora
  do ensaio de R-0007 — o banco da rodada nasce com `create database` + `apply.sh` incremental; (3) o gerador
  emite controllers vazios com `operations: []` — critérios "nenhuma rota" devem falar de métodos de rota, não
  de controllers (A9); (4) a divisão 0002 ∥ 0011 / 0010 ∥ 0003 mantém locks disjuntos a custo de dois
  prompts a mais — avaliar no fechamento.

## Leitura

HEAD de referência: `08fb84e8` (`origin/main`, PR #79); leitura do maestro em 2026-09-21, uma vez:
`AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/README.md`; `docs/meta/agents/orchestra/{README,model-ladder,waves}.md`;
`docs/framework/arch/dashboard-build-pack.md` (inteiro); ADR-0020; `dashboard-route-contract.md` (inteiro);
`dashboard-error-catalog.md` (índice de códigos); `parameter-catalogue.md` §DASHBOARD e §Namespaces i18n;
`decision-closure-plan.md` (linhas DASHBOARD, DT-029/030); `steering.md` §H (H.38, H.54);
manuais `architect-blueprint.md`, `engineer-backend.md`, `inspector-tests.md`, `transcriber-docs.md`;
[WF-DASH-001], [WF-DASH-002], [WF-DASH-003]; [APP-DASHBOARD] §Modelo operacional, §Catálogo (42 linhas),
§Decisões (DT-030), §Residual; [RN-DASH-113], [RN-DASH-120], [RN-DASH-142], [RN-DASH-161] §Verificação,
[RN-DASH-170], [RN-DASH-171], [RN-DASH-172]; `_intake/bpo-notes.md` §Owner decisions;
`rait-events-sse-contract.md` §1–§2; `boat-route-contract.md` §7, `teat-route-contract.md` §8,
`portal-route-contract.md` §10 (só os nomes de evento); `docs/framework/schemas/README.md`;
`docs/framework/blueprints/README.md` + `module-blueprint.schema.json` (chaves); `BP-DASHBOARD-CRASHES-001.json`;
`backend/domains/dashboard/crashes/src/handwritten/dashboard-crashes.projection.ts`;
`backend/domains/portal/projections/src/handwritten/process-timeline.projection.ts` (cabeçalho);
`tools/domain-boundaries/verify.mjs`; `tools/check-lifecycle-vocabulary.ts` (cabeçalho); `tools/check-rls-ddl.ts`
(cabeçalho); `backend/database/ddl/19-est-lifecycle-vocabulary.sql` (cabeçalho), `04-integration-storage.sql`
(outbox), `apply.sh` (lista `ordinary`), `seed/72-fixtures-boat-projections.sql`, `seed/00-fixtures-core.sql`
(tenant); `backend/domains/inf/deadlines/src/{types,timer-catalog}.ts` (cabeçalhos); `policy.ts` (bloco
`dashboard:*`); `backend/app/{src/app.module.ts,vitest.config.ts,package.json}` (linhas do `dashboard-crashes`);
`package.json` (scripts); origem `../teat/docs/framework/product/blueprints/BP-BI-REPORTING-001.json`
(entidades, somente leitura); templates `worker-prompt`, `reviewer-prompt`, `task.template.json`;
`work/rounds/R-0012/{plan.md,prompts/TASK-0001.md,budget.json,compositions.json}` (forma).
Varredura auxiliar: leituras SQL cruzadas em `backend/domains/**` e `backend/app/src` (base de M6).
