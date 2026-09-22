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

## Decisões do maestro para o CTG-0002 (Architect, 2026-09-21, Emenda 2) — M15…M25

Fontes: `dashboard-route-contract.md` §1–§8; `dashboard-error-catalog.md`; [WF-DASH-001…003]; [RN-DASH-161/170/171/172];
[WF-RAIT-002] §4.1/§6; `rait-events-sse-contract.md` §1/§3; `parameter-catalogue.md` §DASHBOARD; H.54; `policy.ts`
bloco `DASHBOARD_RULES` (R-0003: 27 regras + 5 da origem — **cobre todos os recursos do route contract; o CTG-0002
não amplia `policy.ts`, só a prova**); padrões em `main`: `backend/app/src/portal-stream.{service,controller}.ts`
(SSE), `backend/app/src/boat-renaest-job.{service,providers}.ts` (job com `OnModuleInit`/`runDue(now)`),
`portal/citizen-service/src/handwritten/manifestations.controller.ts` (comando com `If-Match`/`Idempotency-Key`,
`@Resource/@Action/@Audit`, `DetranError`), `backend/app/tests/e2e/policy-routes.e2e.spec.ts` (presença e ausência).

- **M15 — Via M7/A3 (Emenda 2).** Relógio próprio: `DashboardClockService` (manuscrito, no pacote) usa
  `Calendar`/`Clock`/`InMemoryCalendar`/`FixedClock` de `@detran/inf-deadlines` **só como dependência de leitura**
  (`dependencies` + `testAliases` do blueprint; `backend/domains/inf/deadlines` nunca é editado) e
  `calendar-2026.json`; os timers vêm de `dashboard.timer_ref` (M7/A7) e são armados em entidade própria
  **`dashboard.timer`** (`owner_kind` ∈ {`alert`,`duty_cycle`,`source`}, `owner_id`, `code`, `started_at`,
  `due_at`, `status` ∈ {`ARMADO`,`VENCIDO`,`SATISFEITO`,`CANCELADO`}, `fired_at`, `version`). Vencimentos e viradas
  de período são executados por `DashboardClockSweeper.runDue(now)` (padrão `boat-renaest-job.service.ts`,
  registrado no `AppModule` pelo Engineer de superfície), idempotente por `(owner_kind, owner_id, code, started_at)`.
  Integração ao motor de prazos (`owner='dashboard'`) fica para depois de R-0007 CTG-0003 — **OD-D28**.
- **M16 — Blueprint 1.1.0, edição única (TASK-0012, Architect), regeneração única pelo maestro.** Acrescenta:
  entidades `Timer` (M15), `AccessLog` (`dashboard.access_log`, [RN-DASH-171]: `user_ref`, `user_role`, `at`,
  `resource`, `filters_json`, `layer`, `row_count`, `origin`, `purpose` nulo, `export_id` nulo — append-only) e
  `EscalationStep`? **não**: a cadeia é vocabulário (M18). `handwrittenControllers` com símbolos fixos:
  `DashboardAlertsController` (§2), `DashboardDutiesController` (§3), `DashboardCatalogController` (indicators,
  indicator-configs, bi-panels, generated-reports — §4), `DashboardSourcesController`, `DashboardExportsController`,
  `DashboardAuditController` (audit-trail, comparisons, transparency, kpis), `DashboardOpenDataController`
  (datasets, `/open-data/{dataset}`). `handwrittenProviders` fixos: `DASHBOARD_MONITOR_PROJECTORS` (existente),
  `DashboardClockService`, `DashboardClockSweeper`, `DashboardAlertService`, `DashboardDutyService`,
  `DashboardFreshnessService`, `DashboardNotifier`, `DashboardLayerGate`, `DashboardExportService`,
  `DashboardReportService`, `DashboardCatalogService`, `DashboardAuditService`, `DashboardOpenDataService`.
  `handwrittenExports`: `handwritten/index` (existente), `handwritten/cycle/index`, `handwritten/surface/index`
  (dois índices para dois Engineers, A13 vale em ambos). `dependencies`: + `@detran/inf-deadlines`,
  `@detran/dashboard-crashes` (leitura de 203/204/310 pela API pública do pacote de R-0010, nunca por
  `dashboard.crash_*` direto). `api.resources[*].operations` continuam `[]` (tudo manuscrito, como o Portal).
- **M17 — Rotas = route contract §2–§5, literalmente.** Prefixo `/v1/dashboard`; `@Resource('dashboard:<recurso>')`,
  `@Action('<ação>')`, `@Audit({ action: 'DASH_<VERBO>', entity: 'dashboard.<tabela>' })` em toda mutação
  (`verify:decorators`); `If-Match` obrigatório em comandos (428/412, `etagOf`), `Idempotency-Key` em criações
  (`exports`, `generated-reports`, `transparency/audits`); erros só `DetranError('DASH.<CODE>')` do catálogo;
  camada por `dashboardLayerFor(roles)`/`dashboardLayerAllows` de `@detran/shared` — **N3 nunca** (403
  `DASH.LAYER_N3_NEVER`); toda leitura N2 exige `X-Purpose` ∈ `dashboard.purposes_n2` (parâmetro via
  `@detran/ops-parameter`; ausente → 400 `DASH.PURPOSE_REQUIRED`, fora do catálogo → `DASH.PURPOSE_INVALID`) e grava
  `access_log` com finalidade; gestor de área em N2 de outro domínio → `DASH.DOMAIN_SCOPE_MISMATCH`. Toda resposta de
  leitura carrega `meta.freshness { state, asOf, acceptableLatency, source }`; bloco A com `INDISPONIVEL` → valor
  `null`. Nenhuma rota escreve fora de `dashboard.*` ([RN-DASH-101]; teste "nenhuma rota altera domínio" via gate +
  captura SQL).
- **M18 — Ciclo do alerta.** Guarda de transição lê `dashboard.alert_transition_ref` (13 linhas, A8) e valida
  `track`/ator; comandos `ack` (`channel` ∈ {`origin`,`manual`}; `manual` exige `note` → `DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED`;
  `onBehalfOf` só `dash-operator`), `treating`, `close` (só `irregularity` e a partir de `VERIFICADO`; extinção →
  `DASH.ALERT_EXTINCTION_NOT_CLOSABLE`), `root-cause` (`category` ∈ {`transport`,`acceptance`,`payload`}); transições de
  sistema por `DashboardAlertService`: **detector** — `detect(cell)` chamado pelo runner de replay após cada
  `applied` das projeções (evento → `DETECTADO`) e pelo sweeper (fallback periódico, que degrada o selo — M20);
  indicador `INDISPONIVEL`/`DESATUALIZADO_MARCADO` nunca gera `DETECTADO` (`DASH.ALERT_SOURCE_STALE` em comandos);
  **classificador** determinístico: `track` pelo `block.kind` (`legal-ceiling` → `extinction`), severidade pelo marco
  (`T-DASH-MARCO-50/75/90` → N1/N2/N3; teto → `CRITICO`); **notificador**: grava `alert_trail` + evento
  `dashboard.alert.changed` (`domainEvent` `ALERTA_DETECTADO|ALERTA_ESCALONADO|ALERTA_RECONHECIDO|ALERTA_ENCERRADO|INCIDENTE_REGISTRADO`)
  na outbox com `recipientRole` da cadeia; a **cadeia de escalonamento** é vocabulário
  `dashboard.escalation_chain_ref` (DDL 19, Architect: `source_app`, `level`, `role`, `source_ref`) transcrita de
  [WF-RAIT-002] §6 para `rait`; apps sem cadeia publicada → um nível (`owner_role`) marcado `source_pending`
  (OD-D29); `CRITICO_EXTINCAO` notifica toda a cadeia + `AUDITOR` (H.54, `dashboard.critical_extinction.notify_legal`);
  SLA de ACK arma `T-DASH-ACK-<sev>` (horas úteis pelo `Calendar`); vencido → `ESCALONADO` → `NOTIFICADO` no nível
  seguinte (A8); `EM_TRATAMENTO → VERIFICADO` só por evidência de origem (projeção fora da faixa), nunca por
  comando; `CRITICO_EXTINCAO → INCIDENTE_REGISTRADO` automático com `incident_ref` (espelho de [WF-RAIT-002] §4.1:
  registro em `alert_trail`, `GET alerts/{id}/incident`).
- **M19 — Deveres.** Sweeper abre `JANELA_ABERTA` na virada (periodicidade de `duty.deadline_kind`/`timer_ref`:
  mensal, anual, `data_fixa`), marca `ATRASADO` na data-limite sem avanço e `NAO_CUMPRIDO` quando o período seguinte
  abre sem cumprimento; deveres sem prazo (204/205/208, [RN-DASH-113]) nunca recebem `deadline_on`
  (`DASH.DUTY_NO_LEGAL_DEADLINE`); comandos §3 com `DASH.DUTY_*`; `prove` exige `evidence.hash` (`DASH.DUTY_EVIDENCE_REQUIRED`);
  `DEVER_JANELA_ABERTA|DEVER_ATRASADO|DEVER_COMPROVADO` em `dashboard.duty.changed` (consumido por `duty_evidence`).
- **M20 — Frescor.** `DashboardFreshnessService` + sweeper: `source.state` por `last_seen_at` × `acceptable_latency_minutes`
  (nulo → nunca `FRESCO`, `DASH.SOURCE_HEARTBEAT_UNDEFINED`); `ATRASADO` além da latência; `INDISPONIVEL` sem
  heartbeat por `dashboard.heartbeat_divisor` × latência; blocos B/C/D → `DESATUALIZADO_MARCADO` e `hidden` após
  `dashboard.stale_hide_multiplier` × latência (H.54); bloco A → oculto (valor `null`); `dashboard.source.freshness`
  na outbox; `GET sources`.
- **M21 — Exportação ([RN-DASH-172] cinco regras + [RN-DASH-161]).** `POST exports`: camada herdada (recorte acima
  da camada → `DASH.EXPORT_LAYER_EXCEEDED`; N3 → `DASH.EXPORT_N3_FORBIDDEN`), formato aberto (`csv`/`json`; outro →
  `DASH.EXPORT_FORMAT_NOT_OPEN`), N2 exige finalidade, supressão primária (`< dashboard.cell_threshold`) e
  secundária (segunda menor célula) com aviso `DASH.CELL_SUPPRESSED`, marca d'água (órgão, camada, usuário,
  data-hora, recorte) no cabeçalho do arquivo e em `export_log.watermark`, `rows > dashboard.export.approval_rows` →
  202 `pending-approval` (`DASH.EXPORT_VOLUME_APPROVAL_REQUIRED`) e `POST exports/{id}/approve` só `agency-admin`;
  `EXPORTACAO_REGISTRADA` na outbox; `access_log` reforçado.
- **M22 — Relatórios, catálogo, painéis (origem, OD-D13).** `generated-reports` request/complete/fail com
  `file_hash` e marca d'água; `indicator-configs` PATCH/publish (`DASH.INDICATOR_*`; 401/402/403/406 sem limiar →
  `DASH.INDICATOR_THRESHOLD_NOT_CALIBRATED`; latência fora da faixa do bloco → `DASH.INDICATOR_LATENCY_INVALID`),
  `bi-panels` (`visibility_profile` ≠ N3), `IndicatorConfigChanged`/`ReportRequested`/`ReportGenerated` na outbox;
  `transparency/checklist` + `POST transparency/audits` (mensal, `dashboard.transparency.audit_period`); `GET kpis`
  (cobertura, MTTA, MTTR, % deveres no prazo, frescor médio — calculados das tabelas próprias); `GET comparisons`
  com supressão de célula e `DASH.RANKING_OF_PERSONS_FORBIDDEN`; `GET audit-trail` (`access_log` + `alert_trail`,
  sem conteúdo sensível); `datasets`/`open-data` só pré-agregados com supressão ([RN-DASH-151] sete requisitos →
  `DASH.DATASET_REQUIREMENTS_UNMET`; filtro livre → `DASH.OPEN_DATA_PARAMETERIZED_FORBIDDEN`); P-09 →
  `DASH.PANEL_BLOCKED_BY_DECISION` até DT-029 (já respondido: limiar 10 — o painel abre com supressão).
- **M23 — SSE `GET /v1/dashboard/stream`** em `backend/app/src/dashboard-stream.{service,controller}.ts` (padrão
  `portal-stream`; Engineer de superfície): eventos `alert.changed`, `alert.escalated`, `duty.changed`,
  `source.freshness`, `integration.health`; política `dashboard:alert:read`; filtro por camada/papel **no SQL**;
  `Last-Event-ID` com janela de 24 h (204 além), heartbeat 20 s, 5 conexões por usuário (429), payload ≤ 8 KB;
  fallback de polling 30 s é do cliente (documentado).
- **M24 — Contratos (WP-D3).** TASK-0006 transcreve `BP-DASH-MONITOR-001.commands.openapi.json` dos controllers
  (um `operationId` `dashboard<Recurso><Verbo>` por rota; 4xx com `code` do catálogo; exemplos com ids das fixtures),
  um schema por `type` publicado em `docs/framework/schemas/events/` (`dashboard.alert.changed`, `dashboard.duty.changed`,
  `dashboard.source.freshness`, `dashboard.export.registered`, `dashboard.report.changed`,
  `dashboard.indicator-config.changed`) e as quatro propostas `docs/framework/contracts/dashboard-feeds/{pec,teat,portal,adapter}.md`
  (`{indicador_id, caso_id, estado_anterior, estado_novo, timestamp, base_legal}` + `pec.deadline.changed`,
  `source.heartbeat`, ACK OD-D05); TASK-0008/0009 estendem `tools/contracts` (raízes `dashboard/*`, catálogo `DASH.`
  por prefixo, rota ⇔ operação bidirecional); `pnpm contracts:clients` pelo maestro antes de TASK-0008.
- **M25 — Testes (Inspectors Opus/alto, dois locks).** TASK-0004 (`MOD-dashboard-cycle-tests`:
  `monitor/tests/{unit,integration,e2e}/cycle-*`): matriz completa de [WF-DASH-001/002/003] (toda transição
  permitida × negada por estado, trilha e ator), timers/SLA/escalonamento com `FixedClock` (`T-DASH-ACK-*` em horas
  úteis com `calendar-2026.json`), `CRITICO_EXTINCAO → INCIDENTE_REGISTRADO`, sweeper de deveres (virada, `ATRASADO`,
  `NAO_CUMPRIDO`), frescor (4 estados, `hidden`, bloco A `null`), notificador/cadeia, eventos publicados.
  TASK-0014 (`MOD-dashboard-surface-tests`: `monitor/tests/**/surface-*` + `backend/app/tests/e2e/dashboard-*.e2e.spec.ts`):
  política **presença e ausência** por rota para todos os papéis canônicos (`policy-routes.e2e.spec.ts` como forma),
  N3 403 sempre, `X-Purpose`, `If-Match`/`Idempotency-Key`, `meta.freshness`, exportação (cinco regras, supressão
  primária **e** secundária, 202/approve, marca d'água, formatos), relatórios, catálogo/painéis, `audit-trail`,
  `comparisons`, `datasets`/`open-data`, `kpis`, SSE (`Last-Event-ID`, heartbeat, filtro por camada, 429), "nenhuma
  rota altera domínio" (captura SQL: só `dashboard.*` e `integration.outbox`), `access_log`; e2e idempotente em
  `detran_r11` (`afterAll`).

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço                                                                         | Lock                                                                                             | Depende de | Entrega                                                                                                                                                                                                                                    |
| --------- | -------------------- | ------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-0001 | Architect            | architect-blueprint | Opus / alto                                                                            | `MOD-bp-dash-monitor`, `MOD-ddl-19-dashboard`, `MOD-ddl-80`, `MOD-apply-sh`, `MOD-r11-contracts` | —          | `BP-DASH-MONITOR-001.json`, `19-dashboard-lifecycle-vocabulary.sql`, `apply.sh`; `contracts/CTG-0001.md` (mapa indicador → projeção → eventos → `connected`, assinaturas dos 8 projetores, timers, critérios)                              |
| TASK-0002 | Inspector            | inspector-tests     | Sonnet / médio                                                                         | `MOD-dashboard-monitor-tests`, `MOD-seed-81`                                                     | TASK-0001  | `backend/domains/dashboard/monitor/tests/**` (M9 a–f), fixtures de estado `81-fixtures-dashboard-state.sql`                                                                                                                                |
| TASK-0011 | Inspector            | inspector-tests     | Sonnet / médio                                                                         | `MOD-tools-boundaries-tests`, `MOD-check-lifecycle-vocabulary`                                   | TASK-0001  | `tools/domain-boundaries/tests/**` (M9 g) e extensão de `tools/check-lifecycle-vocabulary.ts` ao DASHBOARD                                                                                                                                 |
| TASK-0003 | Engineer             | engineer-backend    | Sonnet / médio                                                                         | `MOD-tools-boundaries`, `MOD-package-json`, `MOD-app-module`, `MOD-seed-80`, `MOD-seed-sh`       | TASK-0011  | `verify.mjs` generalizado (M6) e ligado a `pnpm check`; wiring do pacote (M10); `80-fixtures-dashboard-catalog.sql` (42 + deveres) e `seed.sh`                                                                                             |
| TASK-0010 | Engineer             | engineer-backend    | Opus / médio                                                                           | `MOD-dashboard-monitor-handwritten`                                                              | TASK-0002  | `src/handwritten/**` do pacote: 8 projetores (M5), `projectors.ts`, `index.ts`; testes de TASK-0002 verdes                                                                                                                                 |
| TASK-0012 | Architect            | architect-blueprint | Opus / alto                                                                            | `MOD-bp-dash-monitor`, `MOD-ddl-19-dashboard`, `MOD-r11-contracts`                               | TASK-0001  | blueprint 1.1.0 (M16: `Timer`, `AccessLog`, símbolos fixos), `escalation_chain_ref` (M18), `contracts/CTG-0002.md` (rotas → comandos, guardas, matriz de política presença/ausência, camadas, exportação, timers, SSE, eventos, critérios) |
| TASK-0004 | Inspector            | inspector-tests     | Opus / alto                                                                            | `MOD-dashboard-cycle-tests`                                                                      | TASK-0012  | testes do ciclo (M25): matriz WF-DASH-001/002/003, timers/SLA/escalonamento, sweeper de deveres, frescor, notificador, eventos                                                                                                             |
| TASK-0014 | Inspector            | inspector-tests     | Opus / alto                                                                            | `MOD-dashboard-surface-tests`, `MOD-app-e2e-dashboard`                                           | TASK-0012  | testes de superfície (M25): política presença/ausência, N3, X-Purpose, If-Match, exportação, relatórios, audit-trail, open-data, kpis, SSE, "nenhuma rota altera domínio"                                                                  |
| TASK-0005 | Engineer             | engineer-backend    | Opus / médio                                                                           | `MOD-dashboard-cycle`                                                                            | TASK-0004  | `src/handwritten/cycle/**`: clock/sweeper, alerta, deveres, frescor, notificador; testes de TASK-0004 verdes                                                                                                                               |
| TASK-0013 | Engineer             | engineer-backend    | Opus / médio                                                                           | `MOD-dashboard-surface`, `MOD-app-stream`                                                        | TASK-0014  | `src/handwritten/surface/**` (7 controllers, layer gate, exportação, relatórios, catálogo, auditoria, open-data), SSE no app, sweeper no `AppModule`; testes de TASK-0014 verdes                                                           |
| TASK-0007 | Architect (transcr.) | transcriber-docs    | Sonnet / médio (exceção à escada: ≈65 linhas de OD e sete documentos; prompt-review-9) | `MOD-docs`                                                                                       | TASK-0009  | build pack (DDL 80, seed em D1), ADR-0020, route contract §7/§8, backlog, `waves.md` (troca de família), parâmetro `source_pending` (M13), OD-D14…D16                                                                                      |

CTG-0001 = 0001 → {0002 ∥ 0011} → {0010 ∥ 0003} (**mesclado**, PR #83); CTG-0002 = 0012 → checkpoint (regeneração única, `pnpm install`) → {0004 ∥ 0014} → {0005 ∥ 0013} → 0006 → 0008 → 0009 → 0007 (fronteiras disjuntas; no máximo três em paralelo). Um PR por CTG.

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

- 2026-09-21 checkpoint 2 — `sensor-error` (ambiente): `pnpm ci:backend-kernel:local` (ambiente RC protegido,
  Docker) terminou com 375 verdes e 7 falhas, todas _timeouts_ de 30 s encadeados em
  `backend/app/tests/e2e/portal-routes.e2e.spec.ts` (C-0002-75…81) a partir da primeira chamada ao mock SENATRAN;
  o mesmo spec local no `detran_r11` sem mock dá 9/10 (a única falha é `PORTAL.SNE_UPSTREAM_UNAVAILABLE`, esperada
  sem mock). O CTG-0001 não toca rotas do Portal (edições aditivas de export em `portal/projections`; `MonitorModule`
  sem rotas). Sinal autoritativo: job `backend-kernel` do PR #83 (com mock). Sem retrabalho de worker.

- 2026-09-21 PR #83 CI `backend-kernel` — `sensor-error` (inventário fechado): `rait-priority-upgrade.integration.spec.ts`
  (R-0007, lock `inf/rait-case`) fixa em 60 a lista `ordinary` de `apply.sh`; o CTG-0001 tem 62. Precedente R-0010
  (`8f02e914`: 57 → 60). Correção pelo Inspector (60 → 62, três linhas), desvio de lock registrado; os demais
  tiers do kernel passaram no CI. Recomendação ao método: o inventário fechado deveria derivar de `apply.sh` (o
  `prepare-rait-priority-v1-baseline.mjs` já o faz) em vez de um número literal.

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
- **A10 (2026-09-21, relatório TASK-0002)** — o `src/index.ts` gerado re-exporta os 20 controllers vazios por
  `export * from './controllers/<nome>.controller.js'` (igual a `crashes`); a sub-asserção de C-0001-06 "`src/index.ts`
  não exporta símbolo terminado em `Controller`" contradiz o gerador e **cai**. C-0001-06 fica: nenhum controller com
  método de rota, `operations` todos `[]`, OpenAPI sem `paths`, sem `*.controller.ts` manuscrito, sem
  `commands.openapi.json`.
- **A11 (2026-09-21, relatório TASK-0002 → OD-D26)** — `contracts/CTG-0001.md` §5.3 fixava `owner_role = 'ouvidor'`
  nos alertas da trilha `irregularity` (IND-DASH-301); `ouvidor` não é código de `05-role-catalog.sql`. H.38 (OD-D01):
  "ouvidor e financeiro recebem `dash-duty-owner`". Decisão: `owner_role = 'dash-duty-owner'` nessas fixtures;
  OD-D26 fecha por esta adenda (TASK-0007 registra). `owner_role` continua texto com código de papel do catálogo.
- **A12 (2026-09-21, relatório TASK-0003)** — o gate generalizado (M6; contrato §7.1.6: toda `*.projection.ts`
  declara `consumedEvents` literal, mesmo sem leitura cruzada — ADR-0020 §2 "projector … declaring its source
  events") expõe as cinco projeções do PORTAL (R-0009, `backend/domains/portal/projections/src/handwritten/
{crash-view,exam-view,points-view,process-timeline,infraction-view}.projection.ts`), que declaram os eventos só
  no cabeçalho `// Source events:` (e `PROCESS_TIMELINE_DOMAIN_EVENTS` num caso). Decisão: manter a regra e
  **corrigir no mesmo PR** (plano §Riscos: "nunca lista de exceções silenciosa"): cada arquivo ganha
  `export const consumedEvents = [...] as const` **transcrito do próprio cabeçalho** (tipos técnicos `type`, sem
  mudar comportamento); `infraction-view` continua a única a ler `inf.*` (já autorizada por R-0009 A5(a)).
  Desvio de lock registrado (edição aditiva em `portal/projections`, sem rodada ativa no PORTAL backend);
  `pnpm --filter @detran/portal-projections test:unit|test:integration` provam a ausência de regressão.
- **A13 (2026-09-21, iteração A12 de TASK-0003)** — vários `*.projection.ts` exportando o mesmo identificador
  `consumedEvents` colidem em `index.ts` via `export *` (TS2308). Regra: o `index.ts` de um pacote **nunca** faz
  `export *` de um arquivo `*.projection.ts`; reexporta por nome (`export { X, Y } from './x.projection.js'`) tudo o
  que já exportava **exceto** `consumedEvents`, que fica export local do módulo (o gate lê o arquivo, não o índice).
  Vale para `portal/projections/src/handwritten/index.ts` (A12) e para `dashboard/monitor/src/handwritten/index.ts`
  (TASK-0010; o contrato §4.3 dizia "export * dos oito arquivos" — substituído por esta adenda).
- **A14 (2026-09-21, relatório TASK-0010)** — `tools/parameters/verify.mjs --check-usage` (R-0004/R-0009 A7) trata
  os literais `rait.*`, `sync.*`, `dashboard.*` de `export const consumedEvents = [...] as const` como candidatos a
  chave de parâmetro; o gate M6 exige exatamente esse literal (12 flags em `dashboard/monitor`, 14 em
  `portal/projections`). Decisão: a declaração `consumedEvents` literal entra em `isSourceEventDeclaration`
  (mesmo tratamento já dado à propriedade `sourceEvents`) — não é exclusão por diretório nem allowlist de chave
  (método §4.17). Inspector (TASK-0011, iteração) escreve o caso em `tools/parameters/tests/verify-usage.test.mjs`
  antes; Engineer (TASK-0003, iteração) implementa. Desvio de lock registrado (`tools/parameters`, rodada fechada).
- **A15 (2026-09-21, relatório TASK-0010)** — o harness do Inspector (`tests/support/projectors-harness.ts`,
  `FakeDashboardTx.splitTopLevel`) não separa predicados por `and`, o que forçou os projetores a filtrar
  `tenant_id` em memória. Decisão: Inspector corrige o harness (iteração de TASK-0002); Engineer devolve
  `tenant_id = $1 and <chave>` ao SQL de leitura dos projetores (iteração de TASK-0010). RLS continua a última linha.
- **A16 (2026-09-21, relatório TASK-0010)** — `SOURCE_FRESHNESS_EVENT.data.sourceKey = 'rait.outbox'` colide com a
  linha semeada `…81000401`; o `afterAll` do replay apaga a linha do seed e `seeds.integration.spec.ts` fica vermelho
  na segunda execução consecutiva (método §4.16, idempotência). Decisão: a suíte de replay usa `source_key` próprio
  (namespace `0082…`) e limpa por `source_key`; nenhuma fixture de evento toca linha do seed 81.
- **A17 (2026-09-21, relatório TASK-0010)** — confirmações do Architect ao contrato §4.3/§4.1: (a) `stale_version`
  decidido pelo ledger e **só entre eventos do mesmo `event_type`** (agregados distintos numa mesma célula não se
  comparam; `dashboard.source` não tem `aggregate_version`); (b) `rait.case.received` (`body` ∈ jari|cetran) cria a
  célula do relógio B (início de T-JUL-24M); relógio B sem instância conhecida → `ignored: not_relevant`; (c)
  `rait.session.changed` fica em `consumedEvents` de `production` e é `not_relevant` até o CTG-0002 fixar a coluna
  (OD-D27, TASK-0007). O contrato ganha estas linhas por edição do maestro.
- **A18 (2026-09-21, Emenda 2)** — CTG-0002 aberto pela via M7/A3 por decisão do Owner; decomposto em 0012 →
  {0004 ∥ 0014} → {0005 ∥ 0013} → 0006 → 0008 → 0009 → 0007 (M15…M25). A tabela original (0004 → 0005 monolíticos)
  cai. OD-D28 (integração ao motor de prazos após R-0007 CTG-0003) e OD-D29 (cadeias de escalonamento dos apps
  sem publicação) registradas por TASK-0007.
- **A19 (2026-09-22, relatório TASK-0012)** — `zod` entra nas `dependencies` de `BP-DASH-MONITOR-001` 1.1.0 (M16 não o
  listava; os DTOs dos comandos são zod por CODESTYLE §Backend). As 28 OD propostas pelo Architect (OD-D30…D57, contrato
  §16) trazem cada uma a premissa adotada e não bloqueiam; TASK-0007 as registra.
- **A20 (2026-09-22, relatório TASK-0014)** — (a) o token do poller do SSE é `DASHBOARD_STREAM_POLLER` em
  `backend/app/src/dashboard-stream.service.ts` (analogia declarada com `PORTAL_STREAM_POLLER`; OD-D59 fechada); (b) as
  assinaturas de `suppress(rows, threshold)`, `cellThresholdOf(parameters)` e `watermarkOf({ agency, layer, userRef,
userRole, at, scope, filters, exportId })` são as que os specs `surface-suppression.spec.ts`/`surface-watermark.spec.ts`
  declaram — os specs do Inspector são o contrato executável de §14.2 (OD-D60 fechada); (c) `policy-routes.e2e.spec.ts`
  **não** ganha `dashboard` em `inScope`: `dashboard-policy.e2e.spec.ts` fecha rota ⇔ política nos dois sentidos com a
  mesma técnica (contrato §14.3 ajustado por esta adenda); (d) em C-0002-93, `core.idempotency_keys` (`@Idempotent()`)
  e `audit.write(...)` (`@Audit`) são escritas de plataforma admitidas, declaradas no spec (§1.3.1 lê-se com essa
  exceção); (e) forma do comando e2e filtrado: `pnpm --filter @detran/app test:e2e tests/e2e/dashboard-` (sem `--`);
  (f) OD-D58 (`DASH.ALERT_BUSINESS_ACT_FORBIDDEN` sem guard fixado) fica `it.todo` citando a OD até o Architect fixar a
  assinatura em CTG futuro — TASK-0007 registra D58…D60.
- **A21 (2026-09-22, relatório TASK-0004)** — as assinaturas que §14.1 não fixou (construtores de `DashboardNotifier`,
  `DashboardFreshnessService`, `deps` do `DashboardClockSweeper`, ordem de `assertAlertTransition`, `start/prepare/
submit/prove/archive` do dever, `PrepareDutyDto.deadlineOn`) são as de `tests/support/cycle-harness.ts` e dos specs
  `cycle-*` (contrato executável, como A20 b). Premissas do Inspector aceitas e registradas (TASK-0007): (1) C-28 sobre
  `DUTY-02 2026-06`; (2) "ciclo anterior" = período imediatamente anterior; (3) `close` por ator não `dash-operator` →
  403 `DASH.FORBIDDEN_ACTION`; `DASH.ALERT_CLOSE_WITHOUT_VERIFICATION` para todo não terminal ≠ `VERIFICADO`; (4)
  fontes `portal.outbox`/`dashboard` ausentes no seed 81 → a suíte as insere `FRESCO` (OD-D61: linha canônica no seed);
  (5) papéis `dash-*` só em `ctx.actor.roles` (OD-D62: personas no seed core); (7) segundo tenant sem catálogo
  `dashboard.*` (OD-D63); (9) sem trilha de dever — asserção sobre o evento; token de `ARQUIVADO` em OD-D33; (12) o
  detector considera alerta **terminal** já registrado para a mesma chave (um alerta por ciclo após dois `runDue`);
  (13) `topic` da outbox = `type` técnico. Prompt de TASK-0005 remete ao harness.
- **A22 (2026-09-22, relatório TASK-0005)** — (a) C-0001-06 (CTG-0001 §6, A9/A10) dizia "`src/handwritten/` não contém
  `*.controller.ts`": era verdade no CTG-0001 e contradiz M16/§14.2 no CTG-0002 (sete controllers manuscritos por
  desenho). A sub-asserção cai; `module-surface.spec.ts` passa a afirmar que os controllers **gerados** não têm método
  de rota e que todo controller manuscrito vive em `surface/**` (Inspector de TASK-0002, iteração restrita). (b) Os
  quatro defeitos de spec apontados pelo Engineer (helper `?? L` em C-36; default de `ifMatch` em C-09; `String(Date)`
  do driver `pg` em C-10/26/27 — comparar `localDateOf(row)`; limpeza da outbox em C-43) são corrigidos pelo Inspector
  de TASK-0004 em iteração restrita — nunca pelo Engineer. (c) As premissas OD-P1…P12 do Engineer (timer armado após a
  data-limite → `ATRASADO` na mesma transação; `stale_since` como selo; 404 = `DASH.TENANT_MISMATCH`; `owner_role` na
  criação; só `INCIDENTE_REGISTRADO` bloqueia recorrência — refina A21(12); cadeia desconhecida ≠ esgotada; tokens
  `DEVER_<estado>`; linha H.54 `level: null`; `last_read_at` no passo 4; `DASHBOARD_TIMER_DEFINITIONS`; assinaturas
  aditivas de §14.1; `TETO` com alerta aberto → reclassificação) são aceitas como leitura do contrato e registradas
  por TASK-0007 como OD-D64…D75.
- **A23 (2026-09-22, relatório TASK-0013)** — (a) `policy.ts` concede `'*'` a `GLOBAL_ADMIN_ROLES` (`ADMIN`,
  `GESTOR_DETRAN`, `SUPORTE`, `technical-admin`) por regra de plataforma (`isDetranActionAllowed`, kernel #1); o
  contrato §4.2 transcreveu só `DASHBOARD_RULES` e os listou como negados. Precedente: `policy-routes.e2e.spec.ts`
  (R-0008 CTG-0001 §7) trata `GLOBAL_ADMIN_ROLE_GRANTS` como concedidos em toda chave. Decisão: a matriz de
  `dashboard-policy.e2e.spec.ts` adota a mesma convenção (os quatro papéis são permitidos por plataforma em toda rota;
  as camadas continuam a barrar N3 e a exigir finalidade em N2 — [RN-DASH-170] é satisfeita pelas camadas, não pela
  política); `policy.ts` não muda (M17). **OD-D76** ao Owner: o DASHBOARD deve ser excluído do atalho de administrador
  global? (b) A20 (d) corrigida: as escritas de plataforma admitidas em C-0002-93 são `integration.idempotency_keys`
  (`@Idempotent()`) e `integration.rate_limit_windows` (`RateLimit` de `@Action`) — `core.idempotency_keys` não existe
  nesta versão do STYNX; `audit.write(...)` continua admitida. (c) OD-D61: as fontes `portal.outbox` e `dashboard`
  ausentes no seed 81 são inseridas **pela suíte de superfície** (`dashboard-e2e.support.ts`) e removidas no
  `afterAll`, como a suíte do ciclo já faz (A21 4) — o seed 81 não muda neste CTG; TASK-0007 registra a linha
  canônica proposta. (d) Premissas P1…P4 do Engineer (segunda instância dos serviços do ciclo no app por falta de
  `exports` no módulo gerado; `aggregate.version = 2` no `approve`; recorte `indicators` da exportação; discovery do
  sweep por `integration-operator` e desligado no perfil `test`) aceitas e registradas (OD-D77…D80).
- **A6 (2026-09-21)** — CTG-0001 decomposto em 5 tarefas (0001; 0002 ∥ 0011; 0010 ∥ 0003) em vez de 3, para
  manter cada worker dentro de um lock e do orçamento de um Sonnet/Opus médio.

## Bloqueios

(nenhum bloqueio aberto)

- 2026-09-21 prompt-review-3 **FAIL por estrutura corrigível** (4 achados: descrições de TASK-0004/0005 desatualizadas
  em relação a M16/M25; critério com `git diff`; `grep` sem caminho) — corrigido pelo maestro e reaberto em ciclo
  restrito (prompt-review-4), desvio registrado como em R-0008/R-0009 (§10 do método: FAIL de estrutura ≠ FAIL por
  contradição canônica).
- 2026-09-22 prompt-review-5 **FAIL por estrutura corrigível** (5 achados: cobertura C-0002-51…82 omitida em TASK-0014;
  comandos de aceitação sem os tiers integration/e2e) — corrigido pelo maestro; ciclo restrito prompt-review-6.

## Triagem

(uma linha por falha de hard gate: `plant-bug | sensor-error | policy-issue | reference-gap`)

- 2026-09-21 TASK-0001 — `reference-gap` (OD-D17): §Concorrência afirmava `rait.clock.flag-changed` e
  `rait.decision.published` em `main` (PR #69) a partir do contrato publicado; o grep de produtores em
  `backend/domains/**/src` mostra só `rait.case.changed|admitted|received|withdrawn` e
  `rait.assignment.changed`. Efeito: IND-DASH-101…105 nascem `connected = false` até R-0007 CTG-0003
  (relógios/timers); bloco A no CTG-0001 = 2/11 conectados (108, 109). Sem retrabalho: M5 já previa a
  regra; a linha de §Concorrência foi corrigida.

## Retomada

**Checkpoint 3 — 2026-09-21, fim da janela 1 estendida (Emenda 1 de `AUTHORIZATION.md`).** Estado:

- **CTG-0001 concluído e mesclado**: PR #83 → `main` `e0763c6c` (CI verde: backend-kernel, foundation, evidence-gate,
  senatran-mock(-tests), boat-documents-real, verified-local-rc); delivery-review 1 REVIEW → 2 PASS; evidência
  `record/proofs/work/generic/R-0011.jsonl` sequência 1; `audit observe` em `e0763c6c` (EV-569032faa59d0063,
  commit `acdd3635`). Tarefas 0001, 0002, 0003, 0010, 0011 `completed` (14 iterações restritas por A7…A17 e pelos
  achados do reviewer/CI). Branch `orchestra/dashboard-backend` publicado, agora = `main` + observação.
- **CTG-0002 preso** (TASK-0004…0009, 0007): R-0007 CTG-0003 (infração/timers, produtor de
  `rait.clock.flag-changed`) **não está** em `main` nem em `origin/orchestra/rait-backend` (`a8d60d88`: só
  correções de CI/teste sobre o CTG-0002). Regra do handoff: aguardar ou empilhar; nada a empilhar hoje.
- **Alternativa a decidir pelo Owner** (não decidida pelo maestro): abrir o CTG-0002 desde já pela via de M7/A3
  (relógio próprio do pacote usando só `Calendar`/`Clock` de `@detran/inf-deadlines` como dependência de leitura;
  detector escrito contra o contrato de `rait.clock.flag-changed` com fixtures, como `pec_deadlines`), deixando
  a integração ao motor de prazos para quando R-0007 CTG-0003 mesclar. Custo: parte do detector/escalonamento
  fica sem produtor real até lá (bloco A 2/11 conectados); benefício: deveres, frescor, exportação, relatórios,
  rotas §2–§5, política `dashboard:*`, SSE e contratos WP-D3 não dependem de R-0007.
- **Próximos passos ao retomar** (qualquer das vias): `git fetch -q origin && git merge --no-edit origin/main`
  (branch publicado — nunca rebase); `source work/rounds/R-0011/env-detran-r11.sh`; compor os prompts de
  TASK-0004 (Inspector, Opus/alto), TASK-0005 (Engineer, Opus/médio), TASK-0006/0008/0009/0007 com Architect explícito
  (contrato `contracts/CTG-0002.md`: rotas §2–§5 do route contract, política `dashboard:*` presença **e**
  ausência, camada N3 403, `X-Purpose`, cinco regras de RN-DASH-172, supressão secundária, timers M7, SSE
  `/v1/dashboard/stream`, blueprint 1.1.0 com `handwrittenControllers` de nome fixo — M24) → prompt-review →
  disparo. A tarefa de documentação (TASK-0007) registra a troca de família em `waves.md`, OD-D14…D27, o parâmetro
  `source_pending` (M13) e as lições abaixo.
- **Lições desta janela** (para `orchestra/README.md` §10 e `waves.md`): (1) grep de produtores antes de declarar
  upstream em `main` (OD-D17); (2) `apply.sh --full` restrito por R-0007 — banco da rodada por `create database` +
  incremental; (3) o gerador emite controllers vazios (A9/A10) — critérios "nenhuma rota" falam de métodos;
  (4) inventário fechado de DDL em `rait-priority-upgrade.integration.spec.ts` é literal (60 → 62): toda rodada
  com DDL novo o edita — derivar de `apply.sh`; (5) `export *` de vários `*.projection.ts` com `consumedEvents`
  colide (A13) — reexport nomeado; (6) gate de parâmetros × literais de evento (A14) — declaração `consumedEvents`
  reconhecida; (7) `ci:backend-kernel:local` exige branch publicado + ambiente RC protegido e, na máquina local,
  o mock SENATRAN encadeou timeouts no e2e do Portal — o CI é o sinal; (8) a divisão 0002 ∥ 0011 / 0010 ∥ 0003
  funcionou: 5 workers, zero conflito de escrita, 14 iterações restritas curtas (1–4 min) em vez de redespachos.

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
