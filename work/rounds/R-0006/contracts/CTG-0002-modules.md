# CTG-0002-modules — organização, financeiro, integração e fachada de documentos (WP-A, grupo CTG-0002)

**Rodada:** R-0006, frente `rait-model`. **Autor:** Architect (TASK-0005).
**Consumidores:** Inspector (TASK-0006, escreve os testes e as fixtures novas de
`backend/database/seed/`), Engineer (TASK-0007, wiring dos três módulos, port bancário com mock e
a fachada de documentos em `@detran/shared`), R-0007 (comandos que implementam as máquinas da §b).

Este contrato fecha o que os três blueprints novos decidem e **especifica** a fachada de documentos
que o Engineer transcreve (Art. 10: Architect especifica, Engineer escreve). Nada aqui é reaberto:
o Inspector transcreve as listas em testes e fixtures, o Engineer e o R-0007 transcrevem as
máquinas em comandos. Fontes: ADR-0017 (inteira); ADR-0018 §Decision 1–4; ADR-0020 §Decision 1–3;
ADR-0021 §Decision 1, 3 e 6; [UC-RAIT-022], [UC-RAIT-025], [UC-RAIT-029], [UC-RAIT-030],
[UC-RAIT-031], [UC-RAIT-032], [UC-RAIT-033], [UC-RAIT-034], [UC-RAIT-035], [UC-RAIT-036],
[UC-RAIT-038], [UC-RAIT-042], [UC-RAIT-043]; [WF-RAIT-002] §4 e §7; [WF-RAIT-004] §3, §7 e §8;
`docs/framework/arch/rait-error-catalog.md` §3.9–§3.11;
`docs/framework/arch/parameter-catalogue.md` seção RAIT;
`docs/framework/arch/rait-events-sse-contract.md` §2.5;
`docs/framework/arch/rait-fixtures.md` §1 e §8;
`backend/database/ddl/14-inf-lifecycle-vocabulary.sql` (bloco `infraction_payment_tier_ref`);
`backend/database/ddl/04-integration-storage.sql` (`integration.outbox`);
`docs/meta/knowledge-base/steering.md` §H itens 45, 53, 54 e 57; decisões do maestro M2, M5, M6,
M9–M12 e M16 (`work/rounds/R-0006/plan.md`); precedente de forma
`work/rounds/R-0006/contracts/CTG-0001.md` e `CTG-0002-deltas.md`.

Como nos contratos anteriores, as matrizes vão em blocos de texto monoespaçado, e não em tabelas
Markdown, para que o arquivo seja estável sob `prettier --check` sem depender do alinhamento de
células.

Entregáveis desta tarefa: `docs/framework/blueprints/BP-INF-RAIT-ORG-001.json`,
`BP-INF-COLLECTION-001.json`, `BP-INF-RAIT-INTEGRATION-001.json` (todos `module.version = 1.0.0`),
a árvore gerada (`backend/domains/inf/{rait-org,collection,rait-integration}/src/**`,
`backend/database/ddl/{39-inf-rait-org,57-inf-collection,58-inf-rait-integration}.sql`,
`docs/framework/contracts/BP-INF-{RAIT-ORG,COLLECTION,RAIT-INTEGRATION}-001.openapi.json`) e este
contrato.

Regras comuns (do gerador, `tools/blueprints/generate.mjs`): toda entidade recebe `id uuid default
gen_random_uuid()`, `tenant_id uuid not null`, `created_at timestamptz default now() not null` e
`updated_at timestamptz` nulo; RLS por `auth.create_rls_policy` e gatilhos de tenant por
`auth.install_tenant_triggers()`; índice simples automático em cada coluna `*_id` que não abre um
índice declarado. `tenant_id` nunca aparece em payload (CODESTYLE §Backend). Parâmetros vivem em
`ops.parameter` (ADR-0021 §Decision 1 e 6) e **nunca** em coluna de valor: nenhuma coluna abaixo
guarda `5`, `3`, `100`, `IPCA-E`, `false`, o valor do jeton ou o teto mensal. Não existe
`rait_parameter` (ADR-0021 §Decision 6).

Três notas de fronteira valem para todo o contrato:

1. **Ordem lexicográfica dos DDL** (`apply.sh` lê `ddl/*.sql`): 39 vem depois de 34 (`rait_case`,
   `rait_decision`), 35 (`rait_pool`, `rait_pool_member`, `rait_clock`) e 36 (`rait_session`,
   `rait_minutes`), então as FKs da organização para essas tabelas são reais — não é o caso do M5.
   57 vem depois de 38 (`inf.infraction`) e de 14 (`infraction_payment_tier_ref`,
   `infraction_state_ref`), então as FKs do financeiro também são reais. 58 não tem FK alguma.
2. **`module.dependencies`** segue o prompt da tarefa: `BP-INF-RAIT-ORG-001` declara só
   `@detran/inf-rait-worklist` e `BP-INF-COLLECTION-001` só `@detran/inf-infraction`. As FKs da
   organização para os DDL 34 e 36 são de banco e **não** geram `import` TypeScript (o código
   gerado só conhece as próprias entidades), por isso `@detran/inf-rait-case` e
   `@detran/inf-rait-session` não entram como dependência de pacote.
3. **Nada fala com SENATRAN aqui** (ADR-0003, AC-RAIT-029-1) e **nada escreve na
   `integration.outbox`** a partir de `rait-integration`: a projeção da outbox por sistema é do
   consumidor (`dashboard.integration_health`, ADR-0020 §Decision 2) e nasce em WP-P (M10).

## a. Entidades e colunas — tipo, nulidade/default, FK/check, fonte

### a.1 `inf.rait_holiday` (DDL 39, BP-INF-RAIT-ORG-001 v1.0.0)

Feriado ou ponto facultativo do calendário do órgão. Porta de calendário do motor de prazos.

```text
coluna       tipo          nulo/default   FK / check                                       fonte
-----------  ------------  -------------  -----------------------------------------------  ----------------------------
name         varchar(120)  not null       —                                                UC-RAIT-043 fluxo 1 (calendário)
holiday_on   date          not null       —                                                WF-RAIT-002 §7; RN-RAIT-005
scope        varchar(20)   not null       ck in ('nacional','estadual','municipal')        WF-RAIT-002 §7 (Owner A.6:
                                                                                           nacional + estadual AM);
                                                                                           rait-fixtures.md §6
optional     boolean       false          —                                                UC-RAIT-043 fluxo 1 (ponto
                                                                                           facultativo);
                                                                                           deadline.optional_day_policy
```

Índices: `ux_inf_rait_holiday_date_scope` único em `(tenant_id, holiday_on, scope)` — é o par exato
de `RAIT.CALENDAR_OVERLAP` (catálogo §3.9, `context: date`); `ix_inf_rait_holiday_date` em
`(tenant_id, holiday_on)` é o predicado de leitura do motor.

Duas decisões registradas: (1) **não há coluna de município.** A unicidade fixada é
`(tenant_id, holiday_on, scope)`, que já proíbe dois feriados municipais na mesma data — uma
dimensão de município tornaria o índice diferente e nenhuma fonte pede calendário de outro
município além do da sede (`rait-fixtures.md` §6: municipais de Manaus). Se o órgão passar a
operar circunscrições com calendários próprios, o índice muda em v1.1.0 (ver §e, OD proposta).
(2) `optional` não decide efeito: o que o ponto facultativo faz com o vencimento é o parâmetro
`deadline.optional_day_policy` (`business_day_for_citizen`, `ops.parameter`), não uma coluna.

### a.2 `inf.rait_suspension_act` (DDL 39)

Ato motivado de suspensão de prazo por força maior. Único ato que o motor de prazos aceita como
causa de suspensão.

```text
coluna                 tipo          nulo/default   FK / check                                  fonte
---------------------  ------------  -------------  ------------------------------------------  ---------------------------
reason                 text          not null       —                                           UC-RAIT-022 fluxo 1 (fundamento)
legal_basis            text          nulo           —                                           CTB art. 290-A (regulamento
                                                                                                não localizado: UC-RAIT-022
                                                                                                §Pré-condições)
starts_on              date          not null       —                                           UC-RAIT-022 fluxo 1 (termo inicial)
ends_on                date          not null       ck ends_on >= starts_on                     UC-RAIT-022 fluxo 1 (termo final)
timer_codes            jsonb         '[]'::jsonb    ck jsonb_typeof(timer_codes) = 'array'      UC-RAIT-022 fluxo 1-2
                                                                                                (timers alcançados)
evidence_document_id   uuid          not null       — (sem tabela de documento; ADR-0018)       UC-RAIT-022 §Pré-condições;
                                                                                                RAIT.SUSPENSION_EVIDENCE_REQUIRED
signed_by              uuid          not null       —                                           UC-RAIT-022 (ato assinado)
signed_at              timestamptz   now()          —                                           UC-RAIT-022 fluxo 3 (auditoria)
state                  varchar(20)   'vigente'      ck in ('vigente','revogado','encerrado')    M12 (derivado do UC; §b.1)
reviewed_at            timestamptz   nulo           ck reviewed_at is null or                   UC-RAIT-022 fluxo 3 (revisão
reviewed_by            uuid          nulo              reviewed_by is not null                  obrigatória ao gestor e ao LEGAL)
revoked_at             timestamptz   nulo           ck state <> 'revogado' or (revoked_at        UC-RAIT-022 fluxo 2a
revoked_reason         text          nulo              is not null and revoked_reason is
                                                      not null)
```

Índices: `ix_inf_rait_suspension_act_period` em `(tenant_id, starts_on, ends_on)`;
`ix_inf_rait_suspension_act_state` em `(tenant_id, state)`.

Quatro decisões registradas: (1) **`evidence_document_id` é `not null` no DDL** — a prova de força
maior é condição de existência do ato (UC-RAIT-022 §Pré-condições), e
`RAIT.SUSPENSION_EVIDENCE_REQUIRED` (catálogo §3.9) é a mesma regra na borda do comando. (2)
**`timer_codes` é `jsonb` de array e não tem FK:** os códigos são de `inf.infraction_timer_ref`,
mas um array JSON não aceita FK; a validação de conjunto e a recusa de suspender prazo de extinção
(`RAIT.SUSPENSION_LEGAL_TIMER`, catálogo §3.9, e a lista de quatro de `rait-deadline-engine.md` §2
registrada em `CTG-0001.md` §9 item 4) são guarda de comando. (3) **Os casos e timers alcançados
apontam para o ato, não o contrário:** `inf.infraction_timer.suspended_by_act_id` (DDL 38) e
`inf.rait_deadline.suspended_by_act_id` (DDL 34) já existem e carregam a relação, sem FK por M5
(o DDL 39 é posterior aos dois). AC-RAIT-022-2 (o ato é rastreável caso a caso) é satisfeito por
essas colunas mais o histórico de vencimentos do motor. (4) **Não há coluna de `suspended_days`
aqui:** o efeito por timer é de `infraction_timer.suspended_days` (CTG-0001 §1.2).

### a.3 `inf.rait_jeton_sheet` (DDL 39)

Folha de remuneração por sessão, uma por período e órgão colegiado.

```text
coluna            tipo          nulo/default   FK / check                                       fonte
----------------  ------------  -------------  -----------------------------------------------  --------------------------
judging_body      varchar(10)   not null       ck in ('jari','cetran')                          UC-RAIT-036 (colegiados);
                                                                                                mesmo conjunto de
                                                                                                rait_session.judging_body
period_start      date          not null       —                                                UC-RAIT-036 fluxo 1 (período)
period_end        date          not null       ck period_end >= period_start                    idem
state             varchar(20)   'gerada'       ck in ('gerada','conferida','homologada',        M12 (derivado do UC; §b.2)
                                               'enviada')
generated_at      timestamptz   now()          —                                                UC-RAIT-036 fluxo 3
generated_by      uuid          nulo           —                                                idem
reviewed_at       timestamptz   nulo           ck state = 'gerada' or (reviewed_at is not       UC-RAIT-036 fluxo 3
reviewed_by       uuid          nulo              null and reviewed_by is not null)             ("secretaria confere")
homologated_at    timestamptz   nulo           ck state not in ('homologada','enviada') or      UC-RAIT-036 fluxo 3
homologated_by    uuid          nulo              (homologated_at is not null and               ("presidente homologa");
                                                  homologated_by is not null)                   RAIT.JETON_ALREADY_APPROVED
sent_at           timestamptz   nulo           ck state <> 'enviada' or sent_at is not null     UC-RAIT-036 fluxo 4
document_id       uuid          nulo           — (fachada de documentos, ADR-0018)              UC-RAIT-036 fluxo 4
                                                                                                ("arquivo assinado")
source_pending    boolean       true           —                                                parameter-catalogue:
                                                                                                rait.jeton.value = proposta;
                                                                                                steering H.54/H.57
```

Índices: `ux_inf_rait_jeton_sheet_period` único em `(tenant_id, judging_body, period_start)`;
`ix_inf_rait_jeton_sheet_state` em `(tenant_id, state)`.

Três decisões registradas: (1) **a folha não guarda valor.** Nem total, nem valor por sessão: o
valor é `rait.jeton.value` e o teto é `rait.jeton.monthly_cap`, ambos `proposta` e
`source_pending` no catálogo (steering H.54 e H.57: "jeton segue pendente de fonte"); o total é a
soma das linhas. (2) **`source_pending` é coluna da folha e da linha** porque
`RAIT.PARAMETER_SOURCE_PENDING` (catálogo §3.9, `context: key`) precisa ser decidido no momento da
geração, não no da leitura: enquanto o parâmetro for `proposta`, a folha nasce com
`source_pending = true` e AC-RAIT-036-3 ("parâmetro sem fonte bloqueia") é o comando recusando
gravar valores. (3) **retificação (fluxo 3a) não é estado novo:** é a transição
`homologada → conferida` com nova homologação; o histórico fica na trilha de auditoria
(`audit.enabled = true` no blueprint), sem coluna de versão — criar `version` aqui seria valor sem
fonte.

### a.4 `inf.rait_jeton_line` (DDL 39)

Uma linha por membro e sessão com ata assinada.

```text
coluna             tipo             nulo/default   FK / check                                     fonte
-----------------  ---------------  -------------  ---------------------------------------------  -------------------------
sheet_id           uuid             not null       fk_inf_rait_jeton_line_sheet ->                UC-RAIT-036 fluxo 3
                                                   inf.rait_jeton_sheet(id)
member_id          uuid             not null       fk_inf_rait_jeton_line_member ->               UC-RAIT-036 fluxo 1
                                                   inf.rait_pool_member(id)                       (por membro)
session_id         uuid             not null       fk_inf_rait_jeton_line_session ->              UC-RAIT-036 fluxo 1
                                                   inf.rait_session(id)                           (por sessão)
minutes_id         uuid             nulo           fk_inf_rait_jeton_line_minutes ->              UC-RAIT-036 §Pré-condições
                                                   inf.rait_minutes(id)                           (sessões em ATA_ASSINADA);
                                                                                                  RAIT.JETON_MINUTES_UNSIGNED
attendance_valid   boolean          false          —                                              UC-RAIT-036 fluxo 1
                                                                                                  (presença válida)
items_reported     integer          0              ck items_reported >= 0 and votes_cast >= 0     UC-RAIT-036 fluxo 1
votes_cast         integer          0                                                             (itens relatados, votos)
absence_kind       varchar(20)      nulo           ck nulo ou in ('justificada',                  UC-RAIT-036 fluxo 1
                                                   'injustificada')                               (faltas)
                                                   ck absence_kind is null or not
                                                      attendance_valid
remunerated        boolean          false          ck not remunerated or attendance_valid         UC-RAIT-036 fluxo 2 e 1a
over_cap           boolean          false          —                                              UC-RAIT-036 fluxo 2a;
                                                                                                  AC-RAIT-036-2 (excedentes)
unit_value         numeric(12,2)    nulo           ck (source_pending and unit_value is null      UC-RAIT-036 fluxo 2;
amount             numeric(12,2)    nulo              and amount is null) or (not                 rait.jeton.value proposta
source_pending     boolean          true              source_pending and unit_value is not
                                                      null and amount is not null)
```

Índices: `ux_inf_rait_jeton_line_member_session` único em
`(tenant_id, sheet_id, member_id, session_id)` — uma linha por membro e sessão na folha;
`ix_inf_rait_jeton_line_member` em `(tenant_id, member_id)`.

Duas decisões registradas: (1) **`minutes_id` é nulo e não substitui a guarda.** A ata assinada é
pré-condição da linha, mas o estado `ATA_ASSINADA` está em `inf.rait_session`/`inf.rait_minutes` e
a verificação atravessa tabelas: `RAIT.JETON_MINUTES_UNSIGNED` (catálogo §3.10,
`context: sessionIds[]`) é guarda de comando; a coluna é o ponteiro auditável de qual ata sustenta
a linha (AC-RAIT-036-1). (2) **O teto mensal não está no DDL:** `over_cap` marca o excedente que o
comando calculou com `rait.jeton.monthly_cap`; o número (benchmark 8 a 15, UC-RAIT-036 fluxo 2)
nunca entra em check nem em default.

### a.5 `inf.rait_incident` (DDL 39)

Incidente de prescrição operacional — a falha de processo do topo da escada de alertas.

```text
coluna              tipo          nulo/default   FK / check                                      fonte
------------------  ------------  -------------  ----------------------------------------------  ------------------------
incident_ref        varchar(80)   not null       ck incident_ref ~ '^INC-[0-9]{4}-[0-9]{4}$'     rait-fixtures.md §3
                                                                                                 (INC-2026-0007);
                                                                                                 rait_clock_alert.incident_ref
clock_id            uuid          nulo           fk_inf_rait_incident_clock ->                   WF-RAIT-002 §4.1 e §4.2
                                                 inf.rait_clock(id)
case_id             uuid          nulo           fk_inf_rait_incident_case -> inf.rait_case(id)  WF-RAIT-002 §4.1
                                                 ck clock_id is not null or case_id is not null
opened_at           timestamptz   now()          —                                               WF-RAIT-002 §4.1 (registro)
opened_by           uuid          nulo           —                                               idem
responsible_id      uuid          nulo           fk_inf_rait_incident_responsible ->             WF-RAIT-002 §4.1
                                                 inf.rait_pool_member(id)                        (apuração de causa)
cause_analysis      text          nulo           ck closed_at is null or (responsible_id is      WF-RAIT-002 §4.1
outcome             text          nulo              not null and cause_analysis is not null      (desfecho da apuração)
closed_at           timestamptz   nulo              and outcome is not null)
legal_notified_at   timestamptz   nulo           —                                               WF-RAIT-002 §4.1
                                                                                                 (comunicação ao LEGAL/
                                                                                                 auditoria)
```

Índices: `ux_inf_rait_incident_ref` único em `(tenant_id, incident_ref)` — o `incident_ref` é a
chave que `inf.rait_clock_alert.incident_ref` (DDL 35) cita em texto;
`ix_inf_rait_incident_open` em `(tenant_id, opened_at) where closed_at is null`.

Três decisões registradas: (1) **`outcome` é texto livre sem check.** Nenhuma fonte fixa
vocabulário de desfecho de incidente ([WF-RAIT-002] §4.1 diz apenas "apuração de causa,
comunicação ao LEGAL/auditoria"); fixar tokens aqui seria inventar valor — mesmo tratamento de
`rait_pool_member.jurisdiction` (CTG-0002-deltas §a.3). (2) **Sem coluna de nível.** O incidente
existe porque o relógio chegou a `PRESCRITO_OPERACIONAL`; o nível é do alerta
(`rait_clock_alert.level`, que já exige `incident_ref` nesse nível) e duplicá-lo criaria duas
fontes para o mesmo fato. (3) **Sem FK de `rait_clock_alert.incident_ref` para esta tabela:** a
coluna é `varchar(80)` livre no DDL 35, que é anterior ao 39, e alterá-la é mudança do blueprint do
worklist — fica registrado em §e como OD proposta.

### a.6 `inf.rait_quality_sample` (DDL 39)

Item da amostra de qualidade das decisões do período.

```text
coluna               tipo          nulo/default   FK / check                                     fonte
-------------------  ------------  -------------  ---------------------------------------------  -------------------------
period_start         date          not null       —                                              UC-RAIT-025 §Pré-condições
period_end           date          not null       ck period_end >= period_start                  (decisões do período)
case_id              uuid          not null       fk_inf_rait_quality_sample_case ->             UC-RAIT-025 fluxo 1
                                                  inf.rait_case(id)
decision_id          uuid          nulo           fk_inf_rait_quality_sample_decision ->         UC-RAIT-025 fluxo 2
                                                  inf.rait_decision(id)
reviewer_member_id   uuid          nulo           fk_inf_rait_quality_sample_reviewer ->         UC-RAIT-025 fluxo 2
                                                  inf.rait_pool_member(id)                       (subcoordenador revisa)
sampled_at           timestamptz   now()          —                                              UC-RAIT-025 fluxo 1 (sorteio)
reviewed_at          timestamptz   nulo           ck finding_kind is null or reviewed_at is      UC-RAIT-025 fluxo 2
                                                     not null
finding_kind         varchar(20)   nulo           ck nulo ou in ('fundamento','prova',           UC-RAIT-025 fluxo 2
                                                  'coerencia','linguagem')                       (checklist; M12)
finding_note         text          nulo           —                                              UC-RAIT-025 fluxo 2
systemic             boolean       false          ck not systemic or finding_kind is not null    UC-RAIT-025 fluxo 3;
                                                                                                 AC-RAIT-025-2
```

Índices: `ux_inf_rait_quality_sample_case` único em `(tenant_id, period_start, case_id)` — um caso
entra uma vez na amostra do período; `ix_inf_rait_quality_sample_period` em
`(tenant_id, period_start, period_end)`.

Três decisões registradas: (1) **uma linha por decisão amostrada**, não uma linha por amostra: é a
leitura literal de "amostra de decisões revistas" e é o que permite o achado tipado por item
(fluxo 2) e o achado sistemático (fluxo 3). (2) **O percentual não é coluna:**
`rait.quality.sample_pct = 5` (`ops.parameter`, `vigente` por H.54) e o mínimo de 10/mês proposto
em [WF-RAIT-004] §2.1 F-DP-Q são do comando que sorteia. (3) **Os quatro tokens de `finding_kind`
são os quatro itens do checklist** do fluxo 2 ("fundamento, prova, coerência com decisões
similares, linguagem"), em minúsculas por M12; nenhum outro token foi criado, e o achado grave do
fluxo 2a não reabre decisão (Owner C.22), por isso não há token de reabertura.

### a.7 `inf.rait_capacity_plan` (DDL 39)

Plano de capacidade por pool e período, com o gatilho de nova turma.

```text
coluna                    tipo          nulo/default   FK / check                                fonte
------------------------  ------------  -------------  ----------------------------------------  --------------------------
pool_id                   uuid          not null       fk_inf_rait_capacity_plan_pool ->         WF-RAIT-004 §8 (capacidade
                                                       inf.rait_pool(id)                          por fila/pool)
period_start              date          not null       —                                         UC-RAIT-038 fluxo 1
period_end                date          not null       ck period_end >= period_start             (mês e trimestre)
arrival_estimate          integer       nulo           ck (arrival_estimate is null or            WF-RAIT-004 §8 (chegada λ)
capacity_estimate         integer       nulo              arrival_estimate >= 0) and              WF-RAIT-004 §8 (capacidade
queue_observed            integer       nulo              (capacity_estimate is null or            escalada)
months_over_capacity      integer       0                 capacity_estimate >= 0) and             WF-RAIT-004 §8 (fila) e
                                                          (queue_observed is null or               gatilho de nova turma
                                                          queue_observed >= 0) and
                                                          months_over_capacity >= 0
measures                  text          nulo           ck closed_at is null or measures is       UC-RAIT-038 fluxo 3;
reinforcement_requested   boolean       false             not null or reinforcement_requested    AC-RAIT-038-2
unit_proposed             boolean       false          —                                         UC-RAIT-038 fluxo 4;
                                                                                                 WF-RAIT-004 §7
registered_at             timestamptz   now()          —                                         UC-RAIT-038 fluxo 3
registered_by             uuid          nulo           —                                         idem
closed_at                 timestamptz   nulo           —                                         UC-RAIT-038 fluxo 3
                                                                                                 ("fecha o plano")
```

Índices: `ux_inf_rait_capacity_plan_pool_period` único em `(tenant_id, pool_id, period_start)`;
`ix_inf_rait_capacity_plan_period` em `(tenant_id, period_start, period_end)`.

Três decisões registradas: (1) **o limiar de meses não está no DDL.** `months_over_capacity` guarda
o observado; o limiar é `rait.unit.queue_over_capacity_months = 3` (`ops.parameter`, `vigente` por
H.54) e `RAIT.UNIT_TRIGGER_NOT_MET` (catálogo §3.10, `context: months, backlog, capacity`) é guarda
do comando que constitui a turma — o par `(months_over_capacity, queue_observed, capacity_estimate)`
é exatamente esse `context`. (2) **`ck_..._closed_needs_measure` é AC-RAIT-038-2 no DDL:** fechar o
plano exige medida registrada ou pedido de reforço. (3) **As três estimativas são nulas por
construção:** [WF-RAIT-004] §8 marca as fórmulas como hipóteses e o fluxo 1a admite plano sem série
de chegada; nenhum valor de referência (306, 309, 49, 60) entra em default.

### a.8 `inf.rait_export` (DDL 39)

Exportação de decisões e estatísticas com controle LGPD.

```text
coluna            tipo          nulo/default   FK / check                                       fonte
----------------  ------------  -------------  -----------------------------------------------  -------------------------
purpose           text          not null       —                                                UC-RAIT-042 fluxo 3;
                                                                                                 RAIT.EXPORT_PURPOSE_REQUIRED
scope             jsonb         '{}'::jsonb    —                                                UC-RAIT-042 fluxo 1 e
                                                                                                 AC-RAIT-042-2 (escopo)
requested_by      uuid          not null       —                                                AC-RAIT-042-2 (solicitante)
requested_at      timestamptz   now()          —                                                idem
row_count         integer       nulo           ck row_count is null or row_count >= 0           UC-RAIT-042 fluxo 3a;
                                                                                                 RAIT.EXPORT_DPO_APPROVAL_
                                                                                                 REQUIRED (context rowCount)
status            varchar(20)   'solicitada'   ck in ('solicitada','aguardando_dpo','gerada')   M12 (derivado do UC; §b.3)
dpo_approved_by   uuid          nulo           ck dpo_approved_at is null or                    UC-RAIT-042 fluxo 3a
dpo_approved_at   timestamptz   nulo              dpo_approved_by is not null                    (RN-RAIT-137)
generated_at      timestamptz   nulo           ck status <> 'gerada' or (generated_at is not    AC-RAIT-042-2 (exportação
document_id       uuid          nulo              null and content_hash is not null and          assinada e registrada com
content_hash      varchar(64)   nulo              document_id is not null)                       hash)
                                               ck content_hash is null or
                                                  content_hash ~ '^[0-9a-f]{64}$'
```

Índices: `ix_inf_rait_export_status` em `(tenant_id, status, requested_at)`.

Duas decisões registradas: (1) **`purpose` é `not null` no DDL** — a finalidade é condição de
existência (UC-RAIT-042 §Pré-condições e fluxo 3); `RAIT.EXPORT_PURPOSE_REQUIRED` (catálogo §3.11)
é a mesma regra no comando. (2) **O limiar do DPO não é coluna:**
`rait.export.dpo_threshold_rows = 100` (`ops.parameter`, `vigente` por H.54); o DDL só registra o
`row_count` e a aprovação, e o formato do `content_hash` segue o padrão de
`integration.delivery_attempt.request_sha256` (SHA-256 em 64 hex, ADR-0018 §Decision 4).

### a.9 `inf.collection_document` (DDL 57, BP-INF-COLLECTION-001 v1.0.0)

Documento próprio de arrecadação por faixa e fase. Único escritor: `inf/collection`
(ADR-0017 §Decision 1).

```text
coluna                   tipo            nulo/default   FK / check                                 fonte
-----------------------  --------------  -------------  -----------------------------------------  -------------------------
infraction_id            uuid            not null       fk_inf_collection_document_infraction ->   ADR-0017 §Decision 1
                                                        inf.infraction(id)
tier                     varchar(40)     not null       fk_inf_collection_document_tier ->         ADR-0017 §Decision 1;
                                                        inf.infraction_payment_tier_ref(code)      DDL 14 (6 faixas)
                                                        ck (6 códigos)
amount                   numeric(12,2)   not null       ck amount > 0                              UC-RAIT-032 fluxo 1-4;
                                                                                                   AC-RAIT-032-3 (2 casas
                                                                                                   truncadas)
barcode                  varchar(60)     nulo           ck barcode is not null or                  ADR-0017 §Decision 1
pix_reference            varchar(140)    nulo              pix_reference is not null               ("barcode or PIX")
valid_until              date            not null       —                                          AC-RAIT-032-1 (data-limite
                                                                                                   única = prazo de recurso)
issued_for_state         varchar(40)     not null       fk_inf_collection_document_state ->        ADR-0017 §Decision 1
                                                        inf.infraction_state_ref(code)             ("phase it was issued
                                                        ck (15 códigos)                            for"); RAIT.COLLECTION_
                                                                                                   PHASE_INVALID
status                   varchar(20)     'emitido'      ck in ('emitido','pago','vencido',         M12 (ADR-0017 §Decision 2
                                                        'invalidado')                              + UC-RAIT-032 fluxo 3-4;
                                                                                                   §b.4)
issued_at                timestamptz     now()          —                                          UC-RAIT-032 fluxo 1
issued_by                uuid            nulo           —                                          idem
document_id              uuid            nulo           — (fachada, ADR-0018 §Decision 1)          ADR-0017 tabela de
                                                                                                   ownership (pdf ADR-0018)
supersedes_document_id   uuid            nulo           fk_inf_collection_document_supersedes ->   UC-RAIT-032 fluxo 4
                                                        inf.collection_document(id)                (reemissão);
                                                                                                   ADR-0018 §Decision 4
invalidated_at           timestamptz     nulo           ck status <> 'invalidado' or               ADR-0017 §Decision 2
                                                           invalidated_at is not null              ("issue or invalidate")
```

Índices: `ux_inf_collection_document_active` único em `(tenant_id, infraction_id)
where status = 'emitido'` — um documento válido por infração (a reemissão do fluxo 4 exige
invalidar ou vencer o anterior); `ux_inf_collection_document_barcode` único em
`(tenant_id, barcode) where barcode is not null` — é a chave de casamento do retorno bancário
("nosso número", UC-RAIT-035 fluxo 1); `ix_inf_collection_document_due` em
`(tenant_id, valid_until) where status = 'emitido'` — predicado da varredura de vencimento.

Três decisões registradas: (1) **a faixa `desconto_40_fora_sne` existe no vocabulário e fica
desligada por flag.** Ela está em `inf.infraction_payment_tier_ref` (DDL 14) e portanto no check e
na FK; o desligamento é `collection.discount_40_outside_sne = false` (steering H.53, OD-003,
DT-012) e a guarda é **de comando (R-0007)**: emitir documento nessa faixa com a flag desligada é
recusa do comando, não check de DDL — um check fixo aqui congelaria a decisão do Owner em DDL, o
que ADR-0021 §Decision 4 proíbe (chaves booleanas são feature flags). `RAIT.COLLECTION_DISCOUNT_
SNE_ONLY` (catálogo §3.11) cobre o 60% sem adesão ao SNE. (2) **`issued_for_state` aceita os 15
estados** (mesmo conjunto da tabela de referência, regra 2 do manual do Architect); quais fases
podem receber documento (UC-RAIT-032 §Pré-condições: `NOTIFICADO_PENALIDADE` ou
`INSTANCIA_ENCERRADA`; fluxo 1a admite pagamento antecipado antes da NP) é
`RAIT.COLLECTION_PHASE_INVALID`, guarda de comando com `context: infractionState, tier`. (3)
**Juros não são coluna:** o valor com Selic + 1% entra em `amount` no documento reemitido
(fluxo 4), o marco é [RN-RAIT-128] e a memória de cálculo fica no documento renderizado — nenhuma
taxa entra no DDL.

### a.10 `inf.payment` (DDL 57)

Retorno bancário e sua conciliação. Nome sem prefixo `rait_` por M2 e ADR-0017 §Decision 1.

```text
coluna          tipo            nulo/default   FK / check                                     fonte
--------------  --------------  -------------  ---------------------------------------------  ---------------------------
document_id     uuid            nulo           fk_inf_payment_document ->                     ADR-0017 §Decision 1
                                               inf.collection_document(id)                     (matched document)
bank_reference  varchar(80)     not null       —                                              UC-RAIT-035 fluxo 1
                                                                                              (retorno bancário)
paid_on         date            not null       —                                              UC-RAIT-035 fluxo 1 (data)
amount          numeric(12,2)   not null       ck amount > 0                                  UC-RAIT-035 fluxo 1 (valor)
tier_applied    varchar(40)     nulo           fk_inf_payment_tier ->                         ADR-0017 §Decision 1
                                               inf.infraction_payment_tier_ref(code)           (tier actually applied)
                                               ck nulo ou (6 códigos)
                                               ck tier_applied is null or matched_at is
                                                  not null
received_at     timestamptz     now()          —                                              UC-RAIT-035 fluxo 1
matched_at      timestamptz     nulo           ck matched_at is null or document_id is        UC-RAIT-035 fluxo 1;
                                                  not null                                    RAIT.PAYMENT_UNMATCHED
reversed_at     timestamptz     nulo           ck reversed_at is null or matched_at is        ADR-0017 §Decision 2
                                                  not null                                    (PAGAMENTO_ESTORNADO)
```

Índices: `ux_inf_payment_bank_reference` único em `(tenant_id, bank_reference)` — idempotência do
retorno bancário (o mesmo arquivo reprocessado não duplica pagamento);
`ix_inf_payment_unmatched` em `(tenant_id, received_at) where matched_at is null` — é a fila de
`RAIT.PAYMENT_UNMATCHED` (catálogo §3.11, `context: paymentRef`).

Três decisões registradas: (1) **`document_id` é nulo por construção:** o retorno que não casa com
documento algum é um fato que precisa existir para ser conciliado (UC-RAIT-035 fluxo 1a e 1b;
`RAIT.PAYMENT_UNMATCHED`). (2) **Não há `infraction_id` aqui:** o vínculo com a infração é o
documento; duplicá-lo abriria duas fontes para o mesmo fato e permitiria pagamento apontando para
infração diferente da do documento. (3) **O pagamento não muda estado:** `paid` e `payment_tier`
são do agregado (`inf.infraction`, CTG-0001 §1.1) e mudam por evento
(`PAGAMENTO_CONFIRMADO` → [WF-INF-003] §2 linhas 12–16 e 29), conforme ADR-0017 §Decision 2 — este
módulo nunca escreve em `inf.infraction`.

### a.11 `inf.refund_order` (DDL 57)

Ordem de restituição corrigida.

```text
coluna             tipo            nulo/default   FK / check                                    fonte
-----------------  --------------  -------------  --------------------------------------------  ------------------------
infraction_id      uuid            not null       fk_inf_refund_order_infraction ->             UC-RAIT-033 §Pré-condições
                                                  inf.infraction(id)
payment_id         uuid            not null       fk_inf_refund_order_payment ->                UC-RAIT-033 fluxo 1
                                                  inf.payment(id)                               (valor pago e data)
reason             varchar(30)     not null       ck in ('decisao_favoravel','extincao',        UC-RAIT-033 §Pré-condições
                                                  'pagamento_duplicado','pagamento_a_maior')    e UC-RAIT-035 fluxo 1a/1b
                                                                                                (M12)
base_amount        numeric(12,2)   not null       ck base_amount > 0                            ADR-0017 §Decision 1
                                                                                                (base amount)
index_key          varchar(40)     not null       — (sem default)                               rait.refund.index = IPCA-E
                                                                                                (ops.parameter; DT-013);
                                                                                                AC-RAIT-033-2
updated_amount     numeric(12,2)   nulo           —                                             UC-RAIT-033 fluxo 2
bank_data_status   varchar(20)     'pendente'     ck in ('pendente','informado')                UC-RAIT-033 fluxo 3 e 3a
                                                                                                (M12)
status             varchar(20)     'aberta'       ck in ('aberta','ordenada','paga')            eventos RESTITUICAO_
                                                                                                ORDENADA/PAGA (contrato
                                                                                                de eventos §2.5); §b.5
opened_at          timestamptz     now()          —                                             UC-RAIT-033 fluxo 1
ordered_at         timestamptz     nulo           ck status = 'aberta' or ordered_at is         UC-RAIT-033 fluxo 3
                                                     not null
                                                  ck status = 'aberta' or
                                                     bank_data_status = 'informado'
paid_at            timestamptz     nulo           ck status <> 'paga' or paid_at is not null    UC-RAIT-033 fluxo 4
document_id        uuid            nulo           — (fachada; tipo ORDEM_RESTITUICAO)           ADR-0018 §Decision 2
```

Índices: `ux_inf_refund_order_payment` único em `(tenant_id, payment_id)` — um pagamento gera uma
ordem (a restituição do excedente do fluxo 1b é a ordem do pagamento em duplicidade);
`ix_inf_refund_order_status` em `(tenant_id, status, opened_at)`.

Três decisões registradas: (1) **`index_key` sem default.** O índice vigente é `IPCA-E`
(`rait.refund.index`, `ops.parameter`, DT-013/OD-015) e a coluna registra o que foi aplicado
(AC-RAIT-033-2: "vê valor pago, índice, período e valor atualizado"); pôr `'IPCA-E'` como default
gravaria parâmetro no DDL. `RAIT.REFUND_INDEX_PENDING` (catálogo §3.11, `context: parameterKey`) é
do comando. (2) **`ck_..._order_needs_bank_data` é o fluxo 3a no DDL:** sem dados bancários a ordem
existe e fica `aberta` com alerta (a obrigação não expira pelo silêncio), mas não passa a
`ordenada` — `RAIT.REFUND_BANK_DATA_MISSING` (catálogo §3.11) é a mesma regra no comando. (3) **A
abertura é automática:** AC-RAIT-033-1 (a restituição não depende de pedido) é o consumo de
`RESTITUICAO_DEVIDA` (ADR-0017 §Decision 2), não uma coluna; `RAIT.REFUND_NOT_DUE` recusa a ordem
sem esse evento.

### a.12 `inf.debt_handoff` (DDL 57)

Encaminhamento do crédito definitivo não pago à Fazenda e à dívida ativa.

```text
coluna                tipo          nulo/default   FK / check                                   fonte
--------------------  ------------  -------------  -------------------------------------------  ----------------------
infraction_id         uuid          not null       fk_inf_debt_handoff_infraction ->            ADR-0017 §Decision 1
                                                   inf.infraction(id)
fazenda_reference     varchar(80)   nulo           ck status <> 'reconhecido' or                ADR-0017 §Decision 1
                                                      (acknowledged_at is not null and           (Fazenda reference,
                                                      fazenda_reference is not null)             acknowledgement)
dossier_document_id   uuid          nulo           — (fachada, ADR-0018)                        AC-RAIT-034-2 (dossiê
                                                                                                acompanha o crédito)
status                varchar(20)   'preparado'    ck in ('preparado','enviado',                M12 (UC-RAIT-034 fluxo 3
                                                   'reconhecido','cancelado')                   e 2a; §b.6)
prepared_at           timestamptz   now()          —                                            UC-RAIT-034 fluxo 3
sent_at               timestamptz   nulo           ck status in ('preparado','cancelado') or    UC-RAIT-034 fluxo 3
                                                      sent_at is not null                       (transferência)
acknowledged_at       timestamptz   nulo           ck acknowledged_at is null or sent_at is     ADR-0017 §Decision 1
                                                      not null
cancel_reason         varchar(30)   nulo           ck nulo ou in ('pagamento')                  UC-RAIT-034 fluxo 2a
                                                   ck status <> 'cancelado' or
                                                      cancel_reason is not null
```

Índices: `ux_inf_debt_handoff_active` único em `(tenant_id, infraction_id)
where status <> 'cancelado'` — um encaminhamento ativo por infração;
`ix_inf_debt_handoff_status` em `(tenant_id, status, prepared_at)`.

Duas decisões registradas: (1) **o estado da infração não é checado no DDL.**
`RAIT.DEBT_HANDOFF_NOT_FINAL` (catálogo §3.11, `context: infractionState, suspensiveEffect`) é
guarda de comando: o handoff só existe depois de `INSTANCIA_ENCERRADA` com sub-estado
`PENDENTE_PAGAMENTO` e sem efeito suspensivo (UC-RAIT-034 §Pré-condições, AC-RAIT-034-1), e essa
leitura atravessa tabelas. (2) **`cancel_reason` tem um único token** (`pagamento`), que é a única
hipótese de cancelamento com fonte (fluxo 2a: pagamento durante a cobrança, nada vai à dívida
ativa) — precedente de check de um valor: `rait_pool.priority_policy` (CTG-0002-deltas §a.2). O
prazo de cobrança administrativa do fluxo 3 é **fonte pendente** no próprio UC e não virou coluna
nem default (ver §e).

### a.13 `inf.rait_reconciliation` (DDL 58, BP-INF-RAIT-INTEGRATION-001 v1.0.0)

Conciliação por sistema e janela — fato próprio do RAIT (ADR-0020 §Decision 1 e 2), **única**
entidade do módulo.

```text
coluna               tipo          nulo/default    FK / check                                  fonte
-------------------  ------------  --------------  ------------------------------------------  ---------------------
system               varchar(10)   not null        ck in ('renainf','renach','sne')            UC-RAIT-031 §Pré-condições
window_from          date          not null        —                                           UC-RAIT-031 fluxo 1
window_to            date          not null        ck window_to >= window_from                 (por sistema, idade)
requested_by         uuid          not null        —                                           UC-RAIT-031 fluxo 1
                                                                                               (operador de integração)
requested_at         timestamptz   now()           —                                           idem
status               varchar(20)   'solicitada'    ck in ('solicitada','conciliada',           M12 (UC-RAIT-031 fluxo 3
                                                   'escalada')                                 e 3a; §b.7)
divergences_count    integer       0               ck divergences_count >= 0                   UC-RAIT-029 fluxo 3;
                                                                                               RAIT.RECONCILIATION_
                                                                                               DIVERGENCE
report_document_id   uuid          nulo            ck status <> 'conciliada' or                AC-RAIT-031-2 (conciliação
                                                      divergences_count = 0 or                  registrada); ADR-0018
                                                      report_document_id is not null            §Decision 1
resolved_at          timestamptz   nulo            ck status = 'solicitada' or resolved_at     UC-RAIT-031 fluxo 3
                                                      is not null
```

Índices: `ux_inf_rait_reconciliation_window` único em
`(tenant_id, system, window_from, window_to)` — a mesma janela do mesmo sistema é conciliada uma
vez (AC-RAIT-031-1: retransmissão nunca duplica); `ix_inf_rait_reconciliation_status` em
`(tenant_id, status, requested_at)`.

Quatro decisões registradas: (1) **nenhuma projeção da `integration.outbox`.** O build pack punha
aqui uma projeção por sistema; ela é projeção do consumidor (ADR-0020 §Decision 1 e 2:
`dashboard.integration_health`, com os eventos de status do outbox e os erros `UPSTREAM_*`) e
nasce em WP-P (M10). (2) **Nenhuma FK entre schemas:** `integration.outbox`/`delivery_attempt`
(DDL 04) ficam sem referência; a leitura do outbox é da projeção, que só lê (ADR-0020 §Decision 3).
(3) **Nenhuma chamada nacional:** `renainf`, `renach` e `sne` são tokens de origem do fato; quem
fala com eles é `packages/senatran-adapter` (ADR-0003, AC-RAIT-029-1) e o espelho
`integration.renainf_mirror` é projeção do adapter (ADR-0020 §Decision 2). (4) **`system` não tem
tabela de referência:** os três tokens vêm do §Pré-condições de UC-RAIT-031 e do painel de
integrações; criar um `*_ref` para eles seria vocabulário novo fora de DDL 14, que M4 proíbe editar
nesta rodada.

## b. Máquinas de estado por entidade com estado

Sete entidades nascem com coluna de estado. Nenhum destes vocabulários é fixado por workflow: os
tokens são **decisão de modelagem do Architect** (M12), em minúsculas, derivados do UC ou da ADR
citada em cada máquina, e documentados aqui como tal — não são tokens canônicos como os de
[WF-INF-003] §1 ou [WF-RAIT-004] §9. Nenhuma destas máquinas altera o estado do caso
([WF-RAIT-001]), da sessão ([WF-RAIT-003]) ou da infração ([WF-INF-003]): dinheiro e integração
publicam evento e o agregado decide (ADR-0017 §Decision 2). Os `ck_*` correspondentes são o que o
Inspector testa (TASK-0006) e o que R-0007 implementa como comando.

### b.1 Ato de suspensão — `rait_suspension_act.state`

```text
S0  [*] -> vigente
    gatilho : autoridade ou presidente abre o ato (casos alcançados, prazo, termo inicial e final,
              fundamento, prova)
    guarda  : evidence_document_id não nulo (DDL) e signed_by não nulo; timer_codes sem prazo de
              extinção — T-DEC, T-JUL-24M, T-PRESC-5A e T-PAR-3A (rait-deadline-engine.md §2;
              CTG-0001.md §9 item 4); suspensão nunca é automática (AC-RAIT-022-1)
    erro    : RAIT.SUSPENSION_EVIDENCE_REQUIRED (422); RAIT.SUSPENSION_LEGAL_TIMER (422;
              context timerCode)
    efeito  : motor reprograma os vencimentos alcançados e grava suspended_by_act_id em
              inf.infraction_timer / inf.rait_deadline, preservando os valores originais
    fonte   : UC-RAIT-022 fluxo 1-2; catálogo §3.9; WF-RAIT-002 §7

S1  vigente -> vigente (auto-laço)
    gatilho : revisão obrigatória do gestor e do LEGAL conclui pela manutenção
    guarda  : reviewed_at e reviewed_by preenchidos (ck de par completo)
    fonte   : UC-RAIT-022 fluxo 3

S2  vigente -> revogado
    gatilho : ato revogado na revisão
    guarda  : revoked_at e revoked_reason não nulos (DDL); vencimentos originais restaurados, com
              registro
    fonte   : UC-RAIT-022 fluxo 2a

S3  vigente -> encerrado
    gatilho : ⏱ chega ends_on
    guarda  : os prazos retomam a contagem e o Portal exibe a nova data-limite
    fonte   : UC-RAIT-022 fluxo 4
```

### b.2 Folha de jeton — `rait_jeton_sheet.state`

```text
J0  [*] -> gerada
    gatilho : secretaria solicita a folha do período
    guarda  : sessões do período em ATA_ASSINADA (minutes_id por linha) e presenças, votos e
              relatorias consolidados por membro; regra de jeton parametrizada — com
              rait.jeton.value em 'proposta' a folha nasce com source_pending = true e sem valores
    erro    : RAIT.JETON_MINUTES_UNSIGNED (422; context sessionIds[]);
              RAIT.PARAMETER_SOURCE_PENDING (422; context key)
    fonte   : UC-RAIT-036 §Pré-condições, fluxo 1-3, AC-RAIT-036-1 e AC-RAIT-036-3; catálogo
              §3.9 e §3.10

J1  gerada -> conferida
    gatilho : secretaria confere a memória de cálculo
    guarda  : reviewed_at e reviewed_by preenchidos (DDL)
    fonte   : UC-RAIT-036 fluxo 3 ("secretaria confere")

J2  conferida -> homologada
    gatilho : presidente homologa
    guarda  : homologated_at e homologated_by preenchidos (DDL); reaprovação é recusada
    erro    : RAIT.JETON_ALREADY_APPROVED (409; context sheetId)
    fonte   : UC-RAIT-036 fluxo 3; catálogo §3.10

J3  homologada -> enviada
    gatilho : folha enviada ao RH/financeiro (integração ou arquivo assinado)
    guarda  : sent_at não nulo (DDL); document_id quando o envio é arquivo assinado
    fonte   : UC-RAIT-036 fluxo 4

J4  homologada -> conferida (retificação)
    gatilho : contestação do membro
    guarda  : nova homologação exigida (J2 de novo); histórico preservado pela trilha de auditoria
    fonte   : UC-RAIT-036 fluxo 3a
```

### b.3 Exportação — `rait_export.status`

```text
E0  [*] -> solicitada
    gatilho : auditor pede a exportação de decisões ou estatísticas
    guarda  : purpose não nulo (DDL) e escopo informado; dados pessoais de terceiros suprimidos
    erro    : RAIT.EXPORT_PURPOSE_REQUIRED (422)
    fonte   : UC-RAIT-042 §Pré-condições e fluxo 3; catálogo §3.11

E1  solicitada -> aguardando_dpo
    gatilho : contagem de linhas acima do limiar (rait.export.dpo_threshold_rows = 100,
              ops.parameter)
    guarda  : exportação nominal em massa exige finalidade e aprovação do DPO (RN-RAIT-137)
    erro    : RAIT.EXPORT_DPO_APPROVAL_REQUIRED (422; context rowCount, threshold)
    fonte   : UC-RAIT-042 fluxo 3a; catálogo §3.11

E2  aguardando_dpo -> gerada
    gatilho : DPO aprova
    guarda  : dpo_approved_by e dpo_approved_at preenchidos; generated_at, document_id e
              content_hash (SHA-256) gravados no selo (DDL)
    fonte   : UC-RAIT-042 fluxo 3a e AC-RAIT-042-2; ADR-0018 §Decision 4

E3  solicitada -> gerada
    gatilho : exportação abaixo do limiar, ou sem dado pessoal
    guarda  : mesmos requisitos de registro de E2 (finalidade, escopo, solicitante, hash)
    fonte   : UC-RAIT-042 fluxo 3 e AC-RAIT-042-2
```

Não há token de recusa: `RAIT.EXPORT_PURPOSE_REQUIRED` e `RAIT.EXPORT_DPO_APPROVAL_REQUIRED` são
erros do comando, e o auditor nunca edita (AC-RAIT-042-1). O caso anonimizado por retenção
(fluxo 1a) não é estado da exportação: é política de retenção
(`rait.retention.closed_case_years`, `ops.parameter`).

### b.4 Documento de arrecadação — `collection_document.status`

```text
D0  [*] -> emitido
    gatilho : expedição da NP (80% até a data-limite única), reconhecimento no SNE (60%),
              reemissão após o encerramento (original + juros), ou INFRACAO_ESTADO_ALTERADO que
              muda a fase
    guarda  : fase compatível (issued_for_state); tier existente em
              inf.infraction_payment_tier_ref; desconto de 60% só com adesão ao SNE; faixa
              desconto_40_fora_sne recusada enquanto collection.discount_40_outside_sne = false
              (steering H.53 — guarda de comando, R-0007); barcode ou pix_reference presente;
              valid_until = data-limite de recurso (AC-RAIT-032-1); um documento 'emitido' por
              infração (ux_inf_collection_document_active)
    erro    : RAIT.COLLECTION_PHASE_INVALID (422; context infractionState, tier);
              RAIT.COLLECTION_DISCOUNT_SNE_ONLY (422)
    evento  : DOCUMENTO_ARRECADACAO_EMITIDO (contrato de eventos §2.5)
    fonte   : UC-RAIT-032 fluxo 1-4; ADR-0017 §Decision 1 e 2; catálogo §3.11

D1  emitido -> pago
    gatilho : retorno bancário casado com o documento (inf.payment.matched_at)
    guarda  : nosso número, valor e data conferem; pagar não renuncia ao recurso
              (AC-RAIT-035-1)
    evento  : PAGAMENTO_CONFIRMADO — o agregado decide o efeito ([WF-INF-003] §2 linhas 12-16 e 29)
    fonte   : UC-RAIT-035 fluxo 1-3; ADR-0017 §Decision 2

D2  emitido -> vencido
    gatilho : ⏱ passa valid_until sem pagamento
    guarda  : sem recurso admitido pendente, o valor passa a original + juros a partir do marco de
              RN-RAIT-128; com recurso tempestivo pendente não há juros (AC-RAIT-032-2)
    fonte   : UC-RAIT-032 fluxo 3

D3  emitido -> invalidado
    gatilho : INFRACAO_ESTADO_ALTERADO incompatível com a fase de emissão (ex.: AIT_CANCELADO)
    guarda  : invalidated_at não nulo (DDL)
    fonte   : ADR-0017 §Decision 2 ("issue or invalidate documents by phase")

D4  vencido -> [*] (reemissão)
    gatilho : encerramento da instância
    guarda  : documento novo com tier integral_juros e supersedes_document_id apontando o anterior
              (ADR-0018 §Decision 4); Selic + 1% com duas casas truncadas (AC-RAIT-032-3)
    fonte   : UC-RAIT-032 fluxo 4
```

### b.5 Ordem de restituição — `refund_order.status`

```text
R0  [*] -> aberta
    gatilho : evento RESTITUICAO_DEVIDA (provimento ou extinção sobre infração com pagamento;
              pagamento a maior ou em duplicidade)
    guarda  : a ordem não depende de pedido do cidadão (AC-RAIT-033-1); base_amount = valor pago,
              index_key = índice aplicado (rait.refund.index)
    erro    : RAIT.REFUND_NOT_DUE (422; context infractionState, paid);
              RAIT.REFUND_INDEX_PENDING (422; context parameterKey)
    fonte   : UC-RAIT-033 fluxo 1-2; UC-RAIT-035 fluxo 1a e 1b; ADR-0017 §Decision 2; catálogo §3.11

R1  aberta -> aberta (auto-laço)
    gatilho : dados bancários ausentes
    guarda  : bank_data_status = 'pendente'; notificação ao titular pelo canal de ciência; a
              obrigação não expira pelo silêncio, fica pendente com alerta
    erro    : RAIT.REFUND_BANK_DATA_MISSING (422; context refundId)
    fonte   : UC-RAIT-033 fluxo 3a; catálogo §3.11

R2  aberta -> ordenada
    gatilho : ordem encaminhada à área financeira
    guarda  : bank_data_status = 'informado' e ordered_at não nulo (DDL); updated_amount calculado
              pelo índice, com período e índice visíveis (AC-RAIT-033-2)
    evento  : RESTITUICAO_ORDENADA (contrato de eventos §2.5)
    fonte   : UC-RAIT-033 fluxo 2-3

R3  ordenada -> paga
    gatilho : restituição paga
    guarda  : paid_at não nulo (DDL); o caso registra o evento e o Portal exibe "restituído"
    evento  : RESTITUICAO_PAGA (contrato de eventos §2.5)
    fonte   : UC-RAIT-033 fluxo 4
```

### b.6 Encaminhamento à Fazenda — `debt_handoff.status`

```text
H0  [*] -> preparado
    gatilho : multa definitiva não paga após o prazo de cobrança administrativa
    guarda  : infração em INSTANCIA_ENCERRADA com sub-estado PENDENTE_PAGAMENTO e sem efeito
              suspensivo; dossiê fiscal montado (AIT, NP, decisão, marcos); o prazo de cobrança
              administrativa é parâmetro do órgão com fonte pendente (UC-RAIT-034 fluxo 3)
    erro    : RAIT.DEBT_HANDOFF_NOT_FINAL (422; context infractionState, suspensiveEffect)
    fonte   : UC-RAIT-034 §Pré-condições e fluxo 1-3; AC-RAIT-034-1; catálogo §3.11

H1  preparado -> enviado
    gatilho : crédito transferido à dívida ativa com o dossiê
    guarda  : sent_at não nulo (DDL); dossier_document_id presente (AC-RAIT-034-2)
    evento  : COBRANCA_ENCAMINHADA (contrato de eventos §2.5)
    fonte   : UC-RAIT-034 fluxo 3

H2  enviado -> reconhecido
    gatilho : Fazenda acusa o recebimento
    guarda  : acknowledged_at e fazenda_reference não nulos (DDL)
    fonte   : ADR-0017 §Decision 1 (acknowledgement); UC-RAIT-034 fluxo 3

H3  preparado -> cancelado
    gatilho : pagamento durante a cobrança
    guarda  : cancel_reason = 'pagamento' (DDL); nada vai à dívida ativa e as restrições são
              liberadas (o sub-estado QUITADA é do agregado, não desta tabela)
    fonte   : UC-RAIT-034 fluxo 2a
```

### b.7 Conciliação — `rait_reconciliation.status`

```text
C0  [*] -> solicitada
    gatilho : divergência entre estado local e nacional detectada no espelho, ou abertura manual
              pelo operador de integração para uma janela
    guarda  : system em ('renainf','renach','sne'); janela válida (window_to >= window_from);
              nenhuma chamada nacional sai daqui (ADR-0003)
    erro    : RAIT.RECONCILIATION_DIVERGENCE (422; context local, remote);
              RAIT.RETRY_NOT_FAILED (409; context outboxId, status) na retransmissão;
              RAIT.UPSTREAM_RENAINF_UNAVAILABLE / _RENACH_ / _SNE_ (503) e
              RAIT.UPSTREAM_REJECTED (502) quando o adapter responde
    fonte   : UC-RAIT-029 fluxo 3; UC-RAIT-031 fluxo 1-2; catálogo §3.11

C1  solicitada -> conciliada
    gatilho : operador aplica a regra de precedência (o local é a fonte da decisão, o nacional é a
              fonte do registro) e registra
    guarda  : resolved_at não nulo; com divergences_count > 0, report_document_id obrigatório
              (DDL); mérito intocável (AC-RAIT-031-3)
    fonte   : UC-RAIT-031 fluxo 3 e AC-RAIT-031-2

C2  solicitada -> escalada
    gatilho : divergência que altera sujeito passivo ou pontuação, ou que depende de marco
              jurídico (ciência ficta do SNE não confirmada)
    guarda  : nunca conciliada automaticamente; vai ao gestor com o impacto nos prazos;
              resolved_at registra o momento do encaminhamento
    fonte   : UC-RAIT-031 fluxo 4 e 3a; RN-RAIT-124
```

UC-RAIT-030 (RENACH: penalidade e pontuação após o encerramento, estorno no cancelamento) **não
ganha entidade nesta rodada**: o cadastro e o estorno são publicação de evento do agregado
(`PENALIDADE_DEFINITIVA`) pelo adapter, e o indicador de "penalidades definitivas não cadastradas"
(fluxo 2a) é projeção do dashboard (ADR-0020 §Decision 2, WP-P). O que sobra do UC aqui é a
conciliação `system = 'renach'` de C0.

## c. Port bancário (para o Engineer, TASK-0007)

ADR-0017 §Decision 4: o banco é **adapter dentro do módulo** (`ports/bank`), mock-first como o
`senatran-adapter`, nunca chamado de app; cartão e parcelamento estão fora de escopo (DT-031),
então o port **não** tem verbo de autorização de cartão nem de parcela. A interface mínima é a dos
três fatos que o módulo escreve: registrar o documento na rede arrecadadora, consultar os retornos
de uma janela e ordenar a restituição.

Arquivos: `backend/domains/inf/collection/src/handwritten/ports/bank/bank.port.ts` (tipos e
interface), `.../bank/mock-bank.adapter.ts` (mock determinístico), `.../bank/index.ts`; exportados
por `src/handwritten/index.ts` e declarados em `module.handwrittenExports`/`handwrittenProviders`
quando o Engineer criar os arquivos — o bump do blueprint para v1.1.0 com esses campos é do
Architect (precedente `CTG-0001.md` §9 item 6).

```ts
export interface BankDocumentRegistration {
  readonly documentId: string;
  readonly infractionId: string;
  readonly tier: string; // código de inf.infraction_payment_tier_ref
  readonly amount: string; // decimal com 2 casas truncadas (AC-RAIT-032-3)
  readonly validUntil: string; // ISO 8601 date
}

export interface BankDocumentHandle {
  readonly documentId: string;
  readonly barcode: string | null;
  readonly pixReference: string | null;
  readonly registeredAt: string; // ISO 8601 date-time
}

export interface BankReturnWindow {
  readonly from: string; // ISO 8601 date
  readonly to: string; // ISO 8601 date
}

export interface BankReturnLine {
  readonly bankReference: string; // chave idempotente do retorno
  readonly barcode: string | null;
  readonly pixReference: string | null;
  readonly paidOn: string; // ISO 8601 date
  readonly amount: string; // decimal com 2 casas
}

export interface BankRefundInstruction {
  readonly refundOrderId: string;
  readonly amount: string; // updated_amount
  readonly indexKey: string; // index_key aplicado
}

export interface BankRefundReceipt {
  readonly refundOrderId: string;
  readonly bankReference: string;
  readonly orderedAt: string; // ISO 8601 date-time
}

export interface BankPort {
  registerDocument(
    registration: BankDocumentRegistration,
  ): Promise<BankDocumentHandle>;
  fetchReturns(window: BankReturnWindow): Promise<readonly BankReturnLine[]>;
  orderRefund(instruction: BankRefundInstruction): Promise<BankRefundReceipt>;
}
```

Comportamento exigido do mock determinístico (`MockBankPort`, sem I/O, sem `Date.now()` — `Clock`
injetado, CODESTYLE §TypeScript):

```text
1. registerDocument é idempotente por documentId: a mesma entrada devolve o mesmo
   BankDocumentHandle (mesmo barcode, mesmo pixReference, mesmo registeredAt do Clock injetado).
2. barcode e pixReference são derivados do documentId por função pura, sem aleatoriedade e sem
   contador global; nunca os dois nulos (espelha ck_inf_collection_document_reference_required).
   O layout real do documento próprio de arrecadação (FEBRABAN/órgão máximo, UC-RAIT-032 caput)
   não está no corpus: o mock usa um formato de teste declarado no próprio arquivo e o formato
   real é OD proposta (§e) — nenhum dígito verificador é inventado como se fosse o oficial.
3. fetchReturns devolve apenas as linhas que o teste semeou no mock, filtradas por
   paidOn dentro de [from, to] inclusive, em ordem estável (paidOn, bankReference); nunca inventa
   pagamento. Chamar duas vezes a mesma janela devolve a mesma lista (AC-RAIT-031-1, idempotência).
4. orderRefund é idempotente por refundOrderId e devolve bankReference derivado dele; a segunda
   chamada devolve o mesmo recibo, sem segunda ordem.
5. Nenhuma sequência aleatória, nenhuma leitura de rede e nenhum estado compartilhado entre
   instâncias: o mock é construído por teste (padrão dos dobrões de ADR-0018 §Decision 5 e do
   senatran-adapter mock).
6. O port nunca escreve em tabela: quem grava inf.collection_document, inf.payment e
   inf.refund_order é o comando, na mesma transação do outbox (CODESTYLE §Backend).
```

O port **não** cobre a Fazenda: `debt_handoff` tem porta própria ainda **pendente de fonte**
(ADR-0017 §tabela de ownership, "Fazenda port (pending source)"), então TASK-0007 não a cria — o
encaminhamento é gravado e o envio efetivo é OD (§e).

## d. Fixtures exigidas (para o Inspector, TASK-0006)

Tenant `00000000-0000-7000-8000-00000000a001` (`am-fixtures`), hoje = **2026-09-14** (segunda-feira),
fuso `America/Manaus`. As fixtures são escritas pelo Inspector (M6), em arquivos novos de
`backend/database/seed/` (`rait-fixtures.md` §8: "quando o blueprint existir, a fixture
correspondente entra no mesmo PR — uma por estado"); esta tarefa **não** editou o seed e verificou
que os cinco arquivos atuais carregam sem alteração
(`DB_NAME=detran_r6b bash backend/database/seed.sh` → `seed.sh: done`). Nenhuma persona nem tenant
novo (regra 5 do prompt): tudo se apoia nas 20 personas e nos 3 pools de `rait-fixtures.md` §1.

### d.1 Prefixos de id — verificados livres nos cinco arquivos de seed

Regra M16: uma entidade, um prefixo, em faixa livre. Os prefixos do prompt desta tarefa
(`0000e40`…`0000e90`) **não** foram usados: `0000e40` colide com `inf.normative_framing`
(`0000e00`…`0000e40` em `10-fixtures-inf-ait.sql`). Os prefixos abaixo foram conferidos contra
`backend/database/seed/{00-fixtures-core,05-parameters,10-fixtures-inf-ait,20-fixtures-rait,30-fixtures-infraction}.sql`
(os em uso hoje são `0000000`, `0000100`…`0000180`, `0000200`…`0000250`, `0000300`…`0000340`,
`0000b00`, `0000c00`, `0000d00`…`0000d50`, `0000e00`…`0000e40`, `0000f00`, `0000f10`) **e** contra
os dez prefixos normativos que `CTG-0002-deltas.md` §e.3 já reservou para TASK-0006
(`0000260`…`0000290`, `0000350`…`0000380`). Nenhum colide. Todos hexadecimais sob
`00000000-0000-7000-8000-`:

```text
prefixo de id                          entidade                       alocação de NNNNN
-------------------------------------  -----------------------------  ---------------------------------
00000000-0000-7000-8000-0000390NNNNN   inf.rait_holiday               00001…00004
00000000-0000-7000-8000-0000400NNNNN   inf.rait_suspension_act        00001…00003 (um por estado)
00000000-0000-7000-8000-0000400NNNNN   (ids de documento do ato)      10001…      (sub-faixa 1xxxx)
00000000-0000-7000-8000-0000410NNNNN   inf.rait_jeton_sheet           00001…00004 (um por estado)
00000000-0000-7000-8000-0000410NNNNN   inf.rait_jeton_line            10001…      (sub-faixa 1xxxx)
00000000-0000-7000-8000-0000420NNNNN   inf.rait_incident              00001…00002
00000000-0000-7000-8000-0000430NNNNN   inf.rait_quality_sample        00001…00003
00000000-0000-7000-8000-0000440NNNNN   inf.rait_capacity_plan         00001…00002
00000000-0000-7000-8000-0000450NNNNN   inf.rait_export                00001…00003 (um por estado)
00000000-0000-7000-8000-0000450NNNNN   (ids de documento da export.)  10001…      (sub-faixa 1xxxx)
00000000-0000-7000-8000-0000460NNNNN   inf.collection_document        00001…00005 (um por estado + reemissão)
00000000-0000-7000-8000-0000470NNNNN   inf.payment                    00001…00005
00000000-0000-7000-8000-0000480NNNNN   inf.refund_order               00001…00003 (um por estado)
00000000-0000-7000-8000-0000490NNNNN   inf.debt_handoff               00001…00002
00000000-0000-7000-8000-0000500NNNNN   inf.rait_reconciliation        00001…00003 (um por estado)
00000000-0000-7000-8000-0000500NNNNN   (ids de documento do relatório) 10001…     (sub-faixa 1xxxx)
```

Ids de pessoa/usuário continuam `00000000-0000-4000-8000-0000b000NNNN` (UUID v4,
`rait-fixtures.md` §1) e aparecem abaixo como `…0000b000NNNN`; membros de pool são
`…000021000NNN`; casos `…000010000NNN`; sessões `…000030000NNN`; ata da sessão 03
`…000034000001`; relógios `…000024000NNN`; infrações `…0000d000NNNN`.

**Ids de documento não têm tabela** (ADR-0018 §Decision 1: rendering e storage são substrato).
Onde a coluna é obrigatória (`rait_suspension_act.evidence_document_id`) ou faz parte do estado
(`rait_export.document_id`, `rait_reconciliation.report_document_id`), a fixture usa a sub-faixa
`1xxxx` do prefixo da própria entidade; onde é opcional (`rait_jeton_sheet.document_id`,
`collection_document.document_id`, `refund_order.document_id`,
`debt_handoff.dossier_document_id`), fica **nula**, como `rait_draft.document_id` em
`CTG-0002-deltas.md` §e.4.

### d.2 Organização (DDL 39)

```text
inf.rait_holiday
id             name                              holiday_on   scope       optional
-------------  --------------------------------  -----------  ----------  --------
…000039000001  rótulo de calendar-2026.json      2026-09-07   nacional    false
…000039000002  rótulo de calendar-2026.json      2026-09-05   estadual    false
…000039000003  rótulo de calendar-2026.json      2026-10-24   municipal   false
…000039000004  rótulo de calendar-2026.json      1º ponto     nacional    true
                                                 facultativo
```

Os rótulos e as datas saem de `docs/framework/arch/fixtures/calendar-2026.json` (feriados
nacionais, ponto facultativo, estadual 05/09 e municipais de Manaus 24/10 e 08/12,
`rait-fixtures.md` §6): o Inspector copia o `name` do arquivo em vez de escrever um novo. A
violação de `ux_inf_rait_holiday_date_scope` (`RAIT.CALENDAR_OVERLAP`) é exercitada com linha
efêmera dentro do teste, não com fixture.

```text
inf.rait_suspension_act  (máquina b.1)
id             state       starts_on    ends_on      timer_codes             evidence_document_id
-------------  ----------  -----------  -----------  ----------------------  --------------------
…000040000001  vigente     2026-09-10   2026-09-20   ["T-DEF","T-DIL"]       …000040010001
…000040000002  revogado    2026-08-03   2026-08-07   ["T-DEF"]               …000040010002
…000040000003  encerrado   2026-07-06   2026-07-10   ["T-DIL"]               …000040010003
```

`signed_by` = Fábio (`…0000b0000006`, `rait-signing-authority`) nos três, com `signed_at` no
primeiro dia útil de cada `starts_on`; `reason` cita a força maior do caso (texto da fixture) e
`legal_basis` = `CTB art. 290-A` com a nota de regulamento não localizado (UC-RAIT-022
§Pré-condições). O ato `…000040000002` tem `revoked_at` = 2026-08-05 e `revoked_reason`
preenchidos (fluxo 2a); o `…000040000003` tem `reviewed_at`/`reviewed_by` = Lucas
(`…0000b0000012`, `rait-manager`). **Nenhum** dos três lista `T-DEC`, `T-JUL-24M`, `T-PRESC-5A` ou
`T-PAR-3A`: é a recusa de `RAIT.SUSPENSION_LEGAL_TIMER`, que o Inspector exercita como guarda
(linha efêmera), não como fixture.

```text
inf.rait_jeton_sheet  (máquina b.2) — órgão jari
id             state        period_start  period_end   source_pending  document_id
-------------  -----------  ------------  -----------  --------------  -----------
…000041000001  gerada       2026-09-01    2026-09-30   true            null
…000041000002  conferida    2026-08-01    2026-08-31   true            null
…000041000003  homologada   2026-07-01    2026-07-31   true            null
…000041000004  enviada      2026-06-01    2026-06-30   true            null
```

`generated_by` = Elisa (`…0000b0000005`, secretaria) nas quatro; `reviewed_by` = Elisa nas três
últimas; `homologated_by` = Karina (`…0000b0000011`, presidente) nas duas últimas; `sent_at` só na
`…000041000004`. `period_start` distinto por folha porque `ux_inf_rait_jeton_sheet_period` é por
`(tenant_id, judging_body, period_start)`. Nenhuma folha tem valor: `source_pending = true` em
todas (`rait.jeton.value` = `proposta`).

```text
inf.rait_jeton_line  (folha …000041000001; sessão 03 …000030000003, ATA_ASSINADA, ata …000034000001)
id             member_id                 attendance_valid  items_reported  votes_cast  absence_kind   remunerated
-------------  ------------------------  ----------------  --------------  ----------  -------------  -----------
…000041010001  …000021000008 (Heitor)    true              1               1           null           true
…000041010002  …000021000009 (Iara)      true              0               1           null           true
…000041010003  …000021000011 (Karina)    true              0               1           null           true
…000041010004  …000021000010 (João)      false             0               0           justificada    false
```

As quatro linhas são a presença registrada da sessão 03 (`rait_attendance` `…000032000001` a
`…000032000004`: Heitor, Iara e Karina presentes, Karina na presidência, João ausente com falta
justificada) e `minutes_id` = `…000034000001` nas quatro. `unit_value`, `amount` nulos e
`source_pending = true` nas quatro (`ck_inf_rait_jeton_line_value_pending`). Três notas: (1) a
sessão 03 é a **única** em `ATA_ASSINADA` nas fixtures, então só a folha `…000041000001` tem
linhas; as outras três folhas existem para cobrir os estados da máquina b.2 e nenhum check exige
linha. (2) `remunerated = true` na linha da presidente registra apenas a presença válida — se a
regra local excluir o presidente (benchmark do DF em UC-RAIT-036 fluxo 2), a linha muda quando
OD-012/OD-207 fecharem; nenhum valor é gravado de todo modo. (3) `over_cap = true` (fluxo 2a) e o
par `not source_pending` com valores não nulos são exercitados com linhas efêmeras dentro do teste,
porque exigiriam teto mensal e valor — ambos pendentes de fonte.

```text
inf.rait_incident
id             incident_ref    clock_id                case_id                 closed_at
-------------  --------------  ----------------------  ----------------------  ----------
…000042000001  INC-2026-0007   …000024000005 (relógio  …000010000019 (caso 19) null
                               B PRESCRITO_OPERACIONAL)
…000042000002  INC-2026-0008   …000024000004 (relógio  …000010000018 (caso 18) 2026-09-12
                               B CRITICO)
```

O `…000042000001` é o incidente que a fixture existente de alerta já cita em texto
(`rait_clock_alert …000025000004`, `incident_ref = 'INC-2026-0007'`, `rait-fixtures.md` §3 linha
19): `responsible_id` = Lucas como membro? **não** — Lucas não é membro de pool, então
`responsible_id` fica **nulo** no incidente aberto (a coluna é FK para `rait_pool_member`) e
`legal_notified_at` = 2026-09-02. O `…000042000002` é o incidente fechado: `responsible_id` =
Karina (`…000021000011`, presidente e membro), `cause_analysis` e `outcome` preenchidos
(`ck_inf_rait_incident_closed_complete`) e `legal_notified_at` = 2026-09-10. Registro: o gestor
RAIT (Lucas) é quem [WF-RAIT-002] §4.1 escala, mas ele não tem linha em `rait_pool_member`
(`rait-fixtures.md` §1) — ver §e, OD proposta sobre `responsible_id`.

```text
inf.rait_quality_sample  (período 2026-09-01 a 2026-09-30)
id             case_id                 decision_id             reviewer_member_id      reviewed_at  finding_kind  systemic
-------------  ----------------------  ----------------------  ----------------------  -----------  ------------  --------
…000043000001  …000010000010 (caso 10) …000016000001           …000021000004 (Diego)   null         null          false
…000043000002  …000010000012 (caso 12) null                    …000021000004 (Diego)   2026-09-11   fundamento    false
…000043000003  …000010000013 (caso 13) null                    …000021000004 (Diego)   2026-09-11   prova         true
```

Diego é o coordenador/subcoordenador do pool `defesa_previa` (`…000021000004`,
`rait-fixtures.md` §1). A amostra `…000043000001` está sorteada e não revisada (fluxo 1); a
`…000043000003` é o achado sistemático que sai do RAIT ao TEAT e à JARI (fluxo 3, AC-RAIT-025-2).
`decision_id` só na primeira porque só o caso 10 tem `rait_decision` nas fixtures
(`…000016000001`).

```text
inf.rait_capacity_plan
id             pool_id                     period_start  period_end   months_over_capacity  closed_at    reinforcement  unit_proposed
-------------  --------------------------  ------------  -----------  --------------------  -----------  -------------  -------------
…000044000001  …000020000001 (defesa)      2026-09-01    2026-09-30   0                     null         false          false
…000044000002  …000020000002 (JARI-AM)     2026-08-01    2026-08-31   3                     2026-09-01   true           true
```

O plano `…000044000001` está aberto, com `arrival_estimate`, `capacity_estimate` e
`queue_observed` **nulos** (fluxo 1a: série de chegada insuficiente) e sem medida — é legal porque
`ck_inf_rait_capacity_plan_closed_needs_measure` só vale no fechamento. O `…000044000002` está
fechado com `measures` preenchido, `reinforcement_requested = true` e `unit_proposed = true`, e
`months_over_capacity = 3` é o observado que o comando compara com
`rait.unit.queue_over_capacity_months` (3, `ops.parameter`) — o número na coluna é contagem de
meses observada, não o parâmetro. `registered_by` = Diego (`…0000b0000004`) no primeiro e Lucas
(`…0000b0000012`) no segundo.

```text
inf.rait_export  (máquina b.3)
id             status           row_count  dpo_approved_at  generated_at  document_id      content_hash
-------------  ---------------  ---------  ---------------  ------------  ---------------  ------------
…000045000001  solicitada       null       null             null          null             null
…000045000002  aguardando_dpo   250        null             null          null             null
…000045000003  gerada           12         null             2026-09-11    …000045010001    64 hex
```

`requested_by` = Olívia (`…0000b0000015`, `AUDITOR`) nas três; `purpose` é o texto da finalidade
(obrigatório) e `scope` o recorte em JSON (período, unidade, membro — fluxo 1). A
`…000045000003` é o caminho E3 (12 linhas, abaixo de `rait.export.dpo_threshold_rows = 100`), com
`content_hash` = sha-256 fictício de 64 hex, como `rait_document.content_hash`. **Nenhuma fixture
tem `dpo_approved_by`**: nenhuma das 20 personas de `rait-fixtures.md` §1 tem o papel `DPO`
(a regra 5 proíbe criar persona nova) — ver §e, OD proposta; a transição E2 é exercitada com linha
efêmera.

### d.3 Financeiro (DDL 57)

```text
inf.collection_document  (máquina b.4)
id             infraction_id            tier             amount   valid_until  issued_for_state        status       supersedes
-------------  -----------------------  ---------------  -------  -----------  ----------------------  -----------  -------------
…000046000001  …0000d0000005 (infr. 05) desconto_80      200.00   2026-09-30   NOTIFICADO_PENALIDADE   emitido      null
…000046000002  …0000d0000015 (infr. 15) desconto_80      200.00   2026-08-31   NOTIFICADO_PENALIDADE   pago         null
…000046000003  …0000d0000009 (infr. 09) desconto_80      200.00   2026-08-15   NOTIFICADO_PENALIDADE   vencido      null
…000046000004  …0000d0000012 (infr. 12) desconto_80      200.00   2026-09-30   NOTIFICADO_PENALIDADE   invalidado   null
…000046000005  …0000d0000009 (infr. 09) integral_juros   250.00   2026-10-15   INSTANCIA_ENCERRADA     emitido      …000046000003
```

As cinco cobrem os quatro `status` e a reemissão (D4): a infração 09 (`INSTANCIA_ENCERRADA`,
sub-estado `PENDENTE_PAGAMENTO`) tem o documento de 80% vencido e o reemitido com
`integral_juros` apontando o anterior por `supersedes_document_id`; a 12 (`AIT_CANCELADO`) tem o
documento invalidado (`invalidated_at` = 2026-09-08, D3); a 15 (`CANCELADO_DEFINITIVO`, a única com
`paid = true` e `payment_tier = 'restituido'` em `30-fixtures-infraction.sql`) tem o documento
pago. `ux_inf_collection_document_active` continua respeitado: só a `…000046000001` e a
`…000046000005` estão `emitido`, e são de infrações diferentes. `barcode` de teste em todas (44
dígitos), `pix_reference` nulo, `issued_by` = Nilo (`…0000b0000014`, `rait-finance`),
`document_id` nulo.

**Os valores são dado de teste declarado.** Nenhum campo de valor de multa existe no corpus de
fixtures (`inf.normative_framing` tem `severity` e `penalty`, não valor; `inf.ait_ait` não tem
valor), então `200.00` e `250.00` são valores de teste coerentes entre si (80 % de 250,00 = 200,00),
com duas casas truncadas (AC-RAIT-032-3) — ver §e, OD proposta sobre o valor por gravidade.

```text
inf.payment
id             document_id       bank_reference     paid_on      amount   tier_applied  matched_at   reversed_at
-------------  ----------------  -----------------  -----------  -------  ------------  -----------  -----------
…000047000001  …000046000002     BR-2026-0000001    2026-08-20   200.00   desconto_80   2026-08-21   null
…000047000002  null              BR-2026-0000002    2026-09-10   100.00   null          null         null
…000047000003  …000046000001     BR-2026-0000003    2026-09-08   200.00   desconto_80   2026-09-09   2026-09-11
…000047000004  …000046000002     BR-2026-0000004    2026-08-22   200.00   desconto_80   2026-08-23   null
…000047000005  …000046000002     BR-2026-0000005    2026-08-25   250.00   desconto_80   2026-08-26   null
```

A `…000047000002` é o retorno sem documento — a fila de `RAIT.PAYMENT_UNMATCHED` e o par exato de
`ix_inf_payment_unmatched`. A `…000047000003` é o pagamento casado e depois estornado
(`PAGAMENTO_ESTORNADO`): o documento `…000046000001` permanece `emitido`, porque o estorno desfaz o
pagamento e o agregado é quem decide o efeito (ADR-0017 §Decision 2). As `…000047000004` e
`…000047000005` são o pagamento em duplicidade (UC-RAIT-035 fluxo 1b) e o pagamento a maior
(fluxo 1a) sobre o mesmo documento da infração 15 — é o que dá base às três ordens de restituição.
`ux_inf_payment_bank_reference` garante que reprocessar o arquivo não duplica.

```text
inf.refund_order  (máquina b.5)
id             infraction_id            payment_id      reason                base_amount  index_key  bank_data_status  status
-------------  -----------------------  --------------  --------------------  -----------  ---------  ----------------  --------
…000048000001  …0000d0000015 (infr. 15) …000047000001   decisao_favoravel     200.00       IPCA-E     informado         paga
…000048000002  …0000d0000015 (infr. 15) …000047000004   pagamento_duplicado   200.00       IPCA-E     informado         ordenada
…000048000003  …0000d0000015 (infr. 15) …000047000005   pagamento_a_maior     50.00        IPCA-E     pendente          aberta
```

A `…000048000001` tem `ordered_at` = 2026-09-02, `paid_at` = 2026-09-10 e `updated_amount`
calculado pelo índice; a `…000048000002` tem `ordered_at` e `updated_amount` e ainda não foi paga;
a `…000048000003` é a ordem presa por dados bancários (`RAIT.REFUND_BANK_DATA_MISSING`), com
`ordered_at` nulo — é a demonstração de `ck_inf_refund_order_order_needs_bank_data`.
`index_key = 'IPCA-E'` **na fixture** porque é o valor vigente de `rait.refund.index`
(`ops.parameter`, DT-013), não um default de coluna. O motivo `extincao` não tem fixture: nenhuma
infração extinta das fixtures tem pagamento (`30-fixtures-infraction.sql`: só a 15 tem
`paid = true`), então o quarto token é coberto por linha efêmera no teste do check.

```text
inf.debt_handoff  (máquina b.6)
id             infraction_id            status      sent_at      acknowledged_at  fazenda_reference  cancel_reason
-------------  -----------------------  ----------  -----------  ---------------  -----------------  -------------
…000049000001  …0000d0000009 (infr. 09) enviado     2026-09-09   null             null               null
…000049000002  …0000d0000009 (infr. 09) cancelado   null         null             null               pagamento
```

Só a infração 09 está em `INSTANCIA_ENCERRADA` com `PENDENTE_PAGAMENTO` nas fixtures, e
`ux_inf_debt_handoff_active` é parcial em `status <> 'cancelado'`: por isso há **um** handoff ativo
(`enviado`, com `dossier_document_id` nulo e `prepared_at` = 2026-09-08) e **um** cancelado
(fluxo 2a). Os estados `preparado` e `reconhecido` são exercitados por linha efêmera/atualização
dentro do teste. Ver §e, OD proposta: uma segunda infração em `INSTANCIA_ENCERRADA` nas fixtures do
agregado permitiria as quatro como fixture.

### d.4 Integração (DDL 58)

```text
inf.rait_reconciliation  (máquina b.7)
id             system     window_from  window_to    divergences_count  status        resolved_at  report_document_id
-------------  ---------  -----------  -----------  -----------------  ------------  -----------  ------------------
…000050000001  renainf    2026-09-01   2026-09-14   2                  solicitada    null         null
…000050000002  renach     2026-08-01   2026-08-31   1                  conciliada    2026-09-02   …000050010001
…000050000003  sne        2026-07-01   2026-07-31   3                  escalada      2026-08-05   null
```

`requested_by` = Quitéria (`…0000b0000017`, `integration-operator`) nas três. A `…000050000002`
tem `report_document_id` porque `ck_inf_rait_reconciliation_report_required` exige relatório na
conciliação com divergência; a `…000050000003` é a divergência escalada ao gestor (fluxo 3a e 4),
que não conclui a conciliação. As três janelas não se repetem por sistema
(`ux_inf_rait_reconciliation_window`).

### d.5 O que o Inspector precisa cobrir além das fixtures

1. Os sete conjuntos de check de estado (`ck_inf_rait_suspension_act_state`,
   `ck_inf_rait_jeton_sheet_state`, `ck_inf_rait_export_status`,
   `ck_inf_collection_document_status`, `ck_inf_refund_order_status`,
   `ck_inf_debt_handoff_status`, `ck_inf_rait_reconciliation_status`) — um teste por token e um
   token inválido por máquina.
2. Os checks de par completo e de consistência: revisão e homologação da folha
   (`review_complete`, `homologation_complete`, `sent_complete`), valor pendente da linha
   (`value_pending`, nos dois sentidos), selo da exportação (`generated_complete`,
   `content_hash_format`), invalidação do documento (`invalidated_complete`), casamento e estorno
   do pagamento (`match_needs_document`, `tier_needs_match`, `reversal_needs_match`), ordem de
   restituição (`order_needs_bank_data`, `ordered_complete`, `paid_complete`), handoff
   (`sent_complete`, `ack_complete`, `ack_after_sent`, `cancel_complete`), conciliação
   (`resolved_complete`, `report_required`, `window_order`) e incidente (`ref_format`, `target`,
   `closed_complete`).
3. Os índices únicos e parciais com linhas efêmeras dentro do teste (padrão de
   `audit-persistence.integration.spec.ts`, sem criar fixture canônica nova):
   `ux_inf_rait_holiday_date_scope`, `ux_inf_rait_jeton_sheet_period`,
   `ux_inf_rait_jeton_line_member_session`, `ux_inf_rait_incident_ref`,
   `ux_inf_rait_quality_sample_case`, `ux_inf_rait_capacity_plan_pool_period`,
   `ux_inf_collection_document_active` (parcial em `status = 'emitido'`),
   `ux_inf_collection_document_barcode` (parcial em `barcode is not null`),
   `ux_inf_payment_bank_reference`, `ux_inf_refund_order_payment`,
   `ux_inf_debt_handoff_active` (parcial em `status <> 'cancelado'`) e
   `ux_inf_rait_reconciliation_window`.
4. As FKs reais entre módulos: `collection_document` → `inf.infraction(id)` e
   `inf.infraction_payment_tier_ref(code)` e `inf.infraction_state_ref(code)`;
   `collection_document.supersedes_document_id` → a própria tabela; `payment` →
   `collection_document`; `refund_order` → `inf.infraction` e `inf.payment`; `debt_handoff` →
   `inf.infraction`; `rait_jeton_line` → `rait_jeton_sheet`, `rait_pool_member`,
   `inf.rait_session`, `inf.rait_minutes`; `rait_incident` → `inf.rait_clock`, `inf.rait_case`,
   `rait_pool_member`; `rait_quality_sample` → `inf.rait_case`, `inf.rait_decision`,
   `rait_pool_member`; `rait_capacity_plan` → `inf.rait_pool`. `rait_reconciliation` **não tem
   nenhuma FK** — e isso é o que o teste afirma (nada entre schemas, ADR-0020).
5. RLS das 13 tabelas novas e a contagem de tabelas em
   `backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts`: o schema `inf` passa a
   ter **81** `create table` nos DDL (`grep -h 'create table if not exists inf\.'
backend/database/ddl/*.sql | wc -l`), 13 a mais que antes desta tarefa (8 + 4 + 1); no repositório
   inteiro, `pnpm verify:rls-ddl` vai de 165 para **178** tabelas de tenant (medido). O número
   literal do `toHaveLength` é do Inspector (`MOD-inf-ait-rls-count`); esta tarefa não toca
   `tests/**`.
6. O teste de tipos da fachada de documentos (§f) — só tipos, sem implementação: a união
   `DocumentKind` com os 12 tokens, a forma de `SignaturePolicy`, a assinatura dos três métodos de
   `DocumentsFacade` e as três chaves de `DOCUMENT_ERROR_CODES`.

## e. Premissas `OD-*` carregadas, chaves de parâmetro e questões novas

### e.1 Premissas vigentes usadas como verdade

Todas `vigente` por steering H.53, H.54 e H.57 (Cédula 07 e Cédula 08: "premissas aprovadas agora
como vigentes"), exceto o jeton, que segue **pendente de fonte** no próprio H.54 e H.57. Os valores
vivem em `ops.parameter` (ADR-0021 §Decision 1 e 6), nunca em coluna.

```text
OD       premissa vigente usada como verdade                                   onde aparece neste contrato
-------  --------------------------------------------------------------------  ----------------------------------
OD-003   collection.discount_40_outside_sne=false — desconto de 40% fora do     a.9 (faixa no vocabulário,
DT-012   SNE desligado até adesão ao SNE ou parecer (H.53)                      desligada por flag); b.4 D0
H.53                                                                            (guarda de comando, R-0007)
OD-007   rait.quality.sample_pct=5                                              a.6 (nenhuma coluna guarda o
                                                                                percentual)
OD-008   rait.unit.queue_over_capacity_months=3                                 a.7 (months_over_capacity é o
                                                                                observado); RAIT.UNIT_TRIGGER_NOT_MET
OD-012   rait.jeton.value e rait.jeton.monthly_cap sem fonte (legislação e      a.3 e a.4 (source_pending, valores
OD-207   regimento do AM não localizados) — status 'proposta'                    nulos); b.2 J0; d.2
OD-015   rait.refund.index=IPCA-E (sem parecer fazendário formal)                a.11 (index_key sem default);
DT-013                                                                          b.5 R0/R2; d.3
OD-017   rait.export.dpo_threshold_rows=100                                      a.8 (row_count e aprovação do
                                                                                DPO); b.3 E1
OD-018   rait.retention.closed_case_years=5 (retenção e anonimização, H.45)      b.3 (caso anonimizado por
DT-049                                                                          retenção não é estado da exportação)
OD-019   rait.warning.same_machine=true                                          nenhuma coluna nova — registrado
                                                                                por completude (advertência não
                                                                                gera documento de arrecadação)
```

Chaves de parâmetro consumidas pelos três módulos, todas do catálogo
(`docs/framework/arch/parameter-catalogue.md` seção RAIT): `rait.quality.sample_pct`,
`rait.unit.queue_over_capacity_months`, `rait.export.dpo_threshold_rows`, `rait.jeton.value`
(`proposta`, `source_pending`), `rait.jeton.monthly_cap` (`proposta`, `source_pending`),
`rait.refund.index`, `collection.discount_40_outside_sne`, `deadline.optional_day_policy` e
`rait.retention.closed_case_years`. Nenhuma outra chave é criada por esta tarefa e **nenhuma**
aparece como default de coluna. `RAIT.PARAMETER_SOURCE_PENDING` (ADR-0021 §Decision 2) é o erro que
o comando do jeton levanta enquanto `rait.jeton.value` for `proposta`.

### e.2 Registros de divergência de fonte (não são decisões novas)

1. **Inversão de UC no prompt desta tarefa.** O prompt atribui `rait_quality_sample` a UC-RAIT-038
   e `rait_capacity_plan` a [WF-RAIT-004] §8; a amostra de qualidade é [UC-RAIT-025]
   ("revisa a qualidade das minutas por amostragem") e o plano de capacidade é [UC-RAIT-038]
   ("planeja a capacidade do período e solicita reforço"). As `description` dos blueprints e o §a
   seguem os arquivos-fonte — mesmo tratamento que `CTG-0002-deltas.md` §g.5 deu à troca de
   UC-RAIT-027/028.
2. **Prefixos de fixture do prompt.** `0000e40` (primeiro prefixo sugerido) colide com
   `inf.normative_framing` em `10-fixtures-inf-ait.sql`; por M16 esta tarefa alocou faixas livres
   verificadas (§d.1) e publicou a tabela final.
3. **`signature_policy` e a generalização de `normative_document_template`** não entram nesta
   rodada (Metas 6 do plano): a §f especifica os **tipos** da política como dado da fachada; a
   tabela é da frente dona de `inf/normative` (R-0008). ADR-0018 §Decision 3 continua sendo a
   fonte.
4. **UC-RAIT-030 sem entidade** (ver nota ao fim do §b): cadastro e estorno no RENACH são
   publicação de evento do agregado pelo adapter (ADR-0003), e o indicador de penalidades não
   cadastradas é projeção do dashboard (ADR-0020, WP-P).
5. **Sem projeção da `integration.outbox`** (M10, ADR-0020 §Decision 1 e 2): registrado em §a.13 e
   em §Fora de escopo do PR.

### e.3 `OD` propostas (perguntas, não decisões)

Nenhuma delas foi decidida aqui; todas vão ao maestro/Owner para entrar em
`docs/meta/knowledge-base/open-decisions-rait.md` (que esta tarefa não pode editar).

```text
#   pergunta                                                                    onde aparece
--  --------------------------------------------------------------------------  -------------------------
1   "Plantão de secretaria de sessão" ([WF-RAIT-004] §3, 7ª linha) continua      CTG-0002-deltas §g.4;
    sem entidade. A linha atribui o plantão à secretaria por sessão e o único    esta tarefa não a criou
    efeito que declara ("T-R2 só começa com a publicação") já está modelado em
    rait_minutes.published_at (CTG-0002-deltas §a.14): a linha não fixa coluna
    nem estado. Modelar rait_secretary_duty (entidade por sessão, irmã de
    rait_substitute_duty, no blueprint do worklist/DDL 35) ou aceitar que a
    secretaria da sessão saia de rait_attendance?
2   Níveis PAdES admitidos. ADR-0018 §Decision 3 nomeia só PAdES-B-LT (+ TSA)   §f (PadesLevel com um
    para decisões e atas; nenhum outro nível tem fonte no corpus. Fixar a        único membro)
    lista (B-B, B-T, B-LT, B-LTA) ou manter a união de um membro?
3   Níveis gov.br por ato. ADR-0018 §Decision 3 remete a [WF-PORTAL-002], fora  §f (govBrLevel: string |
    da lista fechada desta tarefa; nenhum catálogo fixa os tokens. Qual é o      null, source_pending)
    vocabulário (e onde ele vive: catálogo de parâmetros ou tabela)?
4   Layout do documento próprio de arrecadação (código de barras, dígito         a.9; §c item 2; d.3
    verificador, "nosso número"). [UC-RAIT-032] cita o documento estabelecido
    pelo órgão máximo executivo, que não está no corpus: o mock usa formato de
    teste declarado. Qual é o layout e onde ele vira parâmetro?
5   Valor da multa por gravidade. Nenhum campo de valor existe em                d.3 (valores de teste)
    inf.normative_framing nem em inf.ait_ait; as fixtures de arrecadação usam
    valores de teste. O valor entra no catálogo normativo (TEAT) ou em
    ops.parameter?
6   Prazo de cobrança administrativa antes do handoff. [UC-RAIT-034] fluxo 3 o   a.12; b.6 H0
    declara "parâmetro do órgão, fonte pendente" e não há chave no
    parameter-catalogue. Criar collection.debt_handoff_days (ou equivalente)?
7   Porta da Fazenda. ADR-0017 §tabela de ownership marca "Fazenda port          §c (fim); a.12
    (pending source)": o handoff é gravado, mas o envio efetivo não tem
    contrato. Qual integração (arquivo, API, ofício)?
8   FK de inf.rait_clock_alert.incident_ref para inf.rait_incident.incident_ref. a.5 decisão 3
    Hoje é varchar(80) livre no DDL 35 (anterior ao 39) e o vínculo é textual.
    Trocar por FK (v1.2.0 do worklist) ou manter texto?
9   Vocabulário de desfecho de incidente. [WF-RAIT-002] §4.1 não fixa tokens;    a.5 decisão 1
    outcome ficou text livre. Fixar o conjunto?
10  responsible_id do incidente é FK para rait_pool_member, mas o gestor RAIT    d.2 (fixture aberta com
    (Lucas, quem §4.1 escala) não é membro de pool nas fixtures. Ampliar o        responsible_id nulo)
    alvo (pessoa, não membro) ou aceitar membro?
11  Nenhuma persona das fixtures tem o papel DPO, exigido por [UC-RAIT-042]      d.2 (rait_export sem
    fluxo 3a. Acrescentar persona (fixtures são contrato de teste, PR próprio)   dpo_approved_by)
    ou manter a aprovação do DPO só em linha efêmera de teste?
12  Segunda infração em INSTANCIA_ENCERRADA nas fixtures do agregado             d.3 (dois handoffs)
    permitiria as quatro fixtures de debt_handoff (o índice parcial proíbe dois
    ativos na mesma infração). Pedir à frente do agregado ou manter dois?
13  Calendário por município/circunscrição. A unicidade fixada                   a.1 decisão 1
    (tenant_id, holiday_on, scope) impede dois feriados municipais na mesma
    data. Se o órgão passar a operar circunscrições com calendários próprios, o
    índice muda em v1.1.0 — confirmar que hoje o calendário é único (sede).
14  Subpath @detran/shared/documents. ADR-0018 §Decision 1 nomeia o import       §f (nota final)
    @detran/shared/documents, mas o package.json de @detran/shared só declara
    o export "."; acrescentar o subpath é mudança de package.json, fora da
    fronteira desta tarefa e da de TASK-0007. Manter o re-export pela raiz
    (@detran/shared) até que alguém possa editar o package.json?
```

## f. Especificação da fachada de documentos (ADR-0018 §Decision 1–4)

**Quem escreve:** Engineer (TASK-0007), em `backend/domains/shared/src/documents/`, nos arquivos
`document-kind.ts`, `signature-policy.ts`, `documents-facade.ts` e `index.ts`, mais o
`export * from './documents/index.js';` em `backend/domains/shared/src/index.ts`. Esta tarefa
**não** criou nenhum arquivo em `backend/domains/shared/` (Art. 10: o Architect especifica, o
Engineer escreve; a fronteira da tarefa exclui `backend/domains/shared/**`).

**O que é e o que não é.** É a assinatura da fachada fina que ADR-0018 §Decision 1 exige — só
tipos e interface, sem implementação, sem dependência nova (nem `@stynx-nyx/pdf`, nem
`@stynx-nyx/signature`, nem `@stynx-nyx/storage`: a montagem é do `backend/app` e nasce com os
comandos, R-0007). **Não** é a tabela `inf.signature_policy` (ADR-0018 §Decision 3), que é da
frente de `inf/normative` em R-0008 (Metas 6): aqui a política é apenas o **tipo** do dado que a
fachada lê. **Não** é adapter de provedor: domínio nenhum chama renderer ou provedor de assinatura.

Regras de forma (CODESTYLE §TypeScript): ESM com especificador `.js`, `strict`, sem `any`,
`import type` para tipo, `SCREAMING_SNAKE` só em token canônico e constante, nomes de arquivo
`lowercase-hyphenated`. Os 12 tokens de `DocumentKind` são canônicos (ADR-0018 §Decision 2) e
**não** são traduzidos nem abreviados.

### f.1 `document-kind.ts`

```ts
/** ADR-0018 Decision 2: um template versionado por tipo de documento. */
export const DOCUMENT_KINDS = [
  'AIT',
  'NA',
  'NP',
  'EDITAL',
  'DECISAO_DEFESA',
  'PARECER',
  'ATA',
  'ATA_SORTEIO',
  'DOCUMENTO_ARRECADACAO',
  'ORDEM_RESTITUICAO',
  'COMPROVANTE_PROTOCOLO',
  'CERTIDAO',
] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number];
```

Os doze, na ordem em que ADR-0018 §Decision 2 os lista, sem nenhum a mais: `AIT` e
`COMPROVANTE_PROTOCOLO` são do TEAT e do PORTAL, `NA`, `NP` e `EDITAL` da notificação,
`DECISAO_DEFESA`, `PARECER`, `ATA` e `ATA_SORTEIO` do RAIT, `DOCUMENTO_ARRECADACAO` e
`ORDEM_RESTITUICAO` de `inf/collection` (§a.9 e §a.11 deste contrato) e `CERTIDAO` do arquivo.

### f.2 `signature-policy.ts`

```ts
import type { DetranRole } from '../roles.js';
import type { DocumentKind } from './document-kind.js';

/**
 * ADR-0018 Decision 3: a única exigência de nível com fonte no corpus é
 * PAdES-B-LT + TSA para decisões e atas (steering A.8). Outros níveis são
 * OD proposta — a união cresce quando a decisão existir.
 */
export type PadesLevel = 'PAdES-B-LT';

/** Conformidade validada por @stynx-nyx/pdf-a (ADR-0018 Context). */
export type PdfaConformance = 'PDF/A-2b';

export interface SignerRequirement {
  readonly role: DetranRole;
  readonly minCount: number;
}

export interface SignaturePolicy {
  readonly kind: DocumentKind;
  readonly signers: readonly SignerRequirement[];
  readonly padesLevel: PadesLevel;
  readonly tsaRequired: boolean;
  readonly pdfaRequired: boolean;
  /**
   * Nível gov.br exigido do cidadão (ADR-0018 Decision 3, por WF-PORTAL-002).
   * O vocabulário de níveis é `source_pending` (OD proposta 3): tipado como
   * string até a decisão, nulo quando o ato não é de cidadão.
   */
  readonly govBrLevel: string | null;
}
```

Três notas: (1) **a política é dado, não código** (ADR-0018 §Decision 3): a fachada a **recebe**
(argumento ou provedor injetado), não a define — nenhuma constante com a política por tipo entra
aqui, porque a fonte é a tabela de R-0008. (2) `signers` usa `DetranRole` (`@detran/shared`
`roles.ts`), que é o catálogo de papéis do repositório — nenhum papel novo é criado. (3)
`minCount` existe porque a Res. 357 e os `UC-RAIT-016`/`UC-RAIT-020` falam de signatários por
papel (por exemplo, presidente e relator na ata), e não de um signatário por documento; nenhum
número entra aqui como default.

### f.3 `documents-facade.ts`

```ts
import type { DocumentKind } from './document-kind.js';
import type { PdfaConformance } from './signature-policy.js';
import type { DetranRole } from '../roles.js';

/** ADR-0018 Decision 4: documento armazenado é imutável. */
export interface RenderedDocument {
  readonly documentId: string;
  readonly kind: DocumentKind;
  readonly storageKey: string;
  /** SHA-256 em 64 hex (ADR-0018 Decision 4). */
  readonly contentHash: string;
  readonly pdfaConformance: PdfaConformance | null;
  readonly supersedesDocumentId: string | null;
}

export interface SignedDocument extends RenderedDocument {
  readonly signatureRef: string;
}

export interface SealedDocument extends SignedDocument {
  readonly pdfaConformance: PdfaConformance;
  readonly sealedAt: string;
}

export interface DocumentSigner {
  readonly role: DetranRole;
  readonly personId: string;
  /** Certificado apresentado; RAIT.SIGNATURE_CERT_MISMATCH quando não confere. */
  readonly certificateRef: string | null;
}

export interface DocumentsFacade {
  render(
    templateKey: string,
    data: Record<string, unknown>,
  ): Promise<RenderedDocument>;
  sign(documentId: string, signer: DocumentSigner): Promise<SignedDocument>;
  seal(documentId: string): Promise<SealedDocument>;
}

export const DOCUMENT_ERROR_CODES = {
  SIGNATURE_FAILED: 'RAIT.SIGNATURE_FAILED',
  SIGNATURE_CERT_MISMATCH: 'RAIT.SIGNATURE_CERT_MISMATCH',
  DOCUMENT_HASH_MISMATCH: 'RAIT.DOCUMENT_HASH_MISMATCH',
} as const;

export type DocumentErrorCode =
  (typeof DOCUMENT_ERROR_CODES)[keyof typeof DOCUMENT_ERROR_CODES];
```

Quatro notas: (1) **os três verbos são exatamente os de ADR-0018 §Decision 1** (`render`, `sign`,
`seal`), com a assinatura que a ADR escreve — nenhum verbo a mais (não há `validate`, `archive`
nem `revoke`). (2) **Os quatro campos de retorno são os de ADR-0018 §Decision 4**: `storage_key`,
`content_hash` (SHA-256), `signature_ref`, `pdfa_conformance`, mais `supersedes_document_id`, que
a mesma decisão exige para versões posteriores (é o par do
`collection_document.supersedes_document_id` do §a.9). `pdfaConformance` é nulo antes do selo e
obrigatório depois (`SealedDocument`). (3) **Tenant, auditoria e hash são da fachada**, não do
domínio (ADR-0018 §Decision 1: "a thin handwritten wrapper that adds tenant, audit and hashing"):
nenhum método recebe `tenantId` — ele vem do `RequestContext` (CODESTYLE §Backend). (4) **Os três
códigos de erro são levantados pela fachada** (ADR-0018 §Consequências) e os três **já existem** no
catálogo, fora das seções §3.9–§3.11 desta tarefa: `RAIT.SIGNATURE_FAILED` (502, `context`
`provider`, `reason`) e `RAIT.SIGNATURE_CERT_MISMATCH` (422) em `rait-error-catalog.md` §3.6, e
`RAIT.DOCUMENT_HASH_MISMATCH` (422, `context` `documentId`) em §3.5 — nenhum código novo nasce desta
especificação e a constante acima só os espelha em TypeScript.

### f.4 `index.ts` e alcance do import

```ts
export * from './document-kind.js';
export * from './signature-policy.js';
export * from './documents-facade.js';
```

`backend/domains/shared/src/index.ts` ganha `export * from './documents/index.js';`, de modo que os
domínios importam de `@detran/shared`. O subpath `@detran/shared/documents` que ADR-0018
§Decision 1 nomeia exige uma entrada `exports` no `package.json` de `@detran/shared`, que está fora
da fronteira desta tarefa e da de TASK-0007 (§e.3, OD proposta 14): até que exista, o import é pela
raiz do pacote, sem deep import (ADR-0001).

**Dobrões de teste** (ADR-0018 §Decision 5) são do Inspector e do Engineer nos tiers `unit` e
`integration` (`FixturePdfBackend`, `createMockSignatureBackend`); provedores reais só no tier
`real`. Nenhum deles entra nesta especificação, que é só tipo e interface.
