# CTG-0002-deltas — deltas v1.1.0 de worklist, sessão e caso (WP-A, grupo CTG-0002)

**Rodada:** R-0006, frente `rait-model`. **Autor:** Architect (TASK-0004).
**Consumidores:** Architect (TASK-0005, blueprints de organização/financeiro/integração),
Inspector (TASK-0006, escreve os testes e as fixtures novas e ajustadas de
`backend/database/seed/20-fixtures-rait.sql`), Engineer (TASK-0007, wiring), R-0007 (comandos que
implementam as máquinas da §b).

Este contrato fecha o que os três deltas decidem. Nada aqui é reaberto pelas tarefas seguintes: o
Inspector transcreve as listas em testes e fixtures, o Engineer e o R-0007 transcrevem as máquinas
em comandos. Fontes: [WF-RAIT-004] §1–§10 (§9 é o vocabulário de estado); [WF-RAIT-003] (rito da
sessão, modalidade, convocação, vista, ata); [WF-RAIT-001] §Parametrização e §Estados;
[UC-RAIT-027] e [UC-RAIT-028]; `docs/meta/knowledge-base/steering.md` §H itens 47, 48, 54 e 57;
`docs/framework/arch/parameter-catalogue.md` seção RAIT; `docs/framework/arch/rait-error-catalog.md`
§3.4, §3.7 e §3.10; `docs/framework/arch/rait-fixtures.md` §1 e §3–§5 e §8;
`backend/database/seed/20-fixtures-rait.sql`; decisões do maestro M6, M7, M9 e M12
(`work/rounds/R-0006/plan.md`); precedente de forma `work/rounds/R-0006/contracts/CTG-0001.md`.

Como no CTG-0001, as matrizes vão em blocos de texto monoespaçado, e não em tabelas Markdown, para
que o arquivo seja estável sob `prettier --check` sem depender do alinhamento de células.

Entregáveis desta tarefa: `docs/framework/blueprints/BP-INF-RAIT-{WORKLIST,SESSION,CASE}-001.json`
em `module.version = 1.1.0`, a árvore gerada
(`backend/domains/inf/rait-{worklist,session,case}/src/**`,
`backend/database/ddl/{34-inf-rait-case,35-inf-rait-worklist,36-inf-rait-session}.sql`,
`docs/framework/contracts/BP-INF-RAIT-{WORKLIST,SESSION,CASE}-001.openapi.json`) e este contrato.

Regras comuns (do gerador, `tools/blueprints/generate.mjs`): toda entidade recebe `id uuid default
gen_random_uuid()`, `tenant_id uuid not null`, `created_at timestamptz default now() not null` e
`updated_at timestamptz` nulo; RLS por `auth.create_rls_policy` e gatilhos de tenant por
`auth.install_tenant_triggers()`; índice simples automático em cada coluna `*_id` que não abre um
índice declarado. `tenant_id` nunca aparece em payload (CODESTYLE §Backend). Parâmetros vivem em
`ops.parameter` (ADR-0021) e **nunca** em coluna de valor — nenhuma coluna abaixo guarda `45`, `60`,
`2 dias úteis`, `1` ou `true` de parâmetro.

## a. Entidades e colunas — tipo, nulidade/default, FK/check, fonte

### a.1 `inf.rait_unit` (DDL 35, novo — BP-INF-RAIT-WORKLIST-001 v1.1.0)

Unidade de julgamento (turma / JARI). Uma linha por turma; hoje uma única JARI-AM (steering B.9).

```text
coluna                  tipo          nulo/default      FK / check                                          fonte
----------------------  ------------  ----------------  --------------------------------------------------  --------------------------------
name                    varchar(80)   not null          —                                                   WF-RAIT-004 §7 (turma nomeada)
judging_body            varchar(10)   not null          ck in ('jari','cetran')                             mesmo conjunto de rait_session.judging_body
state                   varchar(30)   'TURMA_ATIVA'     ck in ('TURMA_ATIVA','TURMA_EM_CONSTITUICAO',       WF-RAIT-004 §9
                                                        'TURMA_SUSPENSA')
coordinator_member_id   uuid          nulo              sem FK (precedente rait_session.chair_member_id)    Res. 357 item 2.3; WF-RAIT-004 §7
```

Índices: `ux_inf_rait_unit_name` único em `(tenant_id, judging_body, name)`;
`ix_inf_rait_unit_state` em `(tenant_id, state)`.

Duas decisões registradas: (1) `state` default `'TURMA_ATIVA'` porque o diagrama do §7 entra em
`TURMA_ATIVA` (`[*] --> TURMA_ATIVA`), não em `TURMA_EM_CONSTITUICAO`; a turma em constituição é
criada pelo comando do gatilho de capacidade, que grava o estado explicitamente. (2) **não** há
check exigindo `coordinator_member_id` em `TURMA_ATIVA`: a Res. 357 item 2.3 só exige coordenador
quando houver **mais de uma** JARI, o que é uma condição entre linhas — a guarda é do comando
(`RAIT.UNIT_COORDINATOR_REQUIRED`, catálogo §3.10), não do DDL.

### a.2 `inf.rait_pool` (DDL 35, colunas novas)

```text
coluna            tipo          nulo/default      FK / check                                      fonte
----------------  ------------  ----------------  ----------------------------------------------  ------------------------------
unit_id           uuid          nulo              fk_inf_rait_pool_unit -> inf.rait_unit(id)      WF-RAIT-004 §10 (mais de uma JARI)
priority_policy   varchar(30)   'ordem_unica'     ck in ('ordem_unica')                           WF-RAIT-004 §2 e §10; RN-RAIT-141
```

`unit_id` é nulo por construção: as três fixtures canônicas de pool (`rait-fixtures.md` §1) não têm
turma e continuam carregando sem edição (§e). O índice único muda — ver §c.

`priority_policy` admite hoje **um** valor. A ordem de consumo é única em todo o RAIT
([WF-RAIT-004] §2, [RN-RAIT-141]: risco > prioridade legal > cronológica) e nenhum papel escolhe
fora dela sem motivo registrado (`RAIT.ORDER_OVERRIDE_FORBIDDEN`). Um segundo valor seria uma
política de fila que nenhuma fonte fixa: é `OD-*`, não invenção. As prioridades legais em si ficam
no parâmetro `rait.priority.legal_bases` e, por caso, em `rait_case.legal_priority` (§a.10).

### a.3 `inf.rait_pool_member` (DDL 35, colunas novas)

```text
coluna          tipo          nulo/default   FK / check   fonte
--------------  ------------  -------------  -----------  -----------------------------------------------
is_substitute   boolean       false          —            Res. 357 item 4.1.b.3; WF-RAIT-004 §1 e §10; RN-RAIT-142
jurisdiction    varchar(80)   nulo           —            CTB art. 281; WF-RAIT-004 §1 e §10; steering H.48
```

`jurisdiction` é texto livre **sem check**: a relação das 55 autoridades e suas circunscrições foi
pedida por carta ao DETRAN-AM e não existe no corpus (steering H.48, parâmetro
`rait.signing.schedule` com `source_pending`). Fixar um conjunto aqui seria inventar valor.

### a.4 `inf.rait_schedule` (DDL 35, novo)

Escala e plantão do membro por período.

```text
coluna           tipo          nulo/default   FK / check                                             fonte
---------------  ------------  -------------  -----------------------------------------------------  ----------------------------
pool_id          uuid          not null       fk_inf_rait_schedule_pool -> inf.rait_pool(id)         WF-RAIT-004 §3 (escala do pool)
member_id        uuid          not null       fk_inf_rait_schedule_member -> rait_pool_member(id)    WF-RAIT-004 §3 e §10
kind             varchar(30)   not null       ck in ('escala_semanal','plantao_risco',               WF-RAIT-004 §3, uma linha da
                                              'escala_assinatura','escala_balcao')                   tabela por token (M12)
period_start     date          not null       —                                                      WF-RAIT-004 §3 e §10 (período)
period_end       date          not null       ck period_end >= period_start                          idem
availability     varchar(30)   'DISPONIVEL'   ck in ('DISPONIVEL','EM_PLANTAO',                      WF-RAIT-004 §9
                                              'AUSENTE_PROGRAMADO')
wip_limit        integer       nulo           ck wip_limit is null or wip_limit >= 0                 WF-RAIT-004 §3 e §4.2
absence_reason   varchar(30)   nulo           ck nulo ou in ('ferias','licenca','curso',             WF-RAIT-004 §3 (rótulos do
                                              'sessao_externa')                                      diagrama de disponibilidade)
                                              ck availability <> 'AUSENTE_PROGRAMADO' or
                                              absence_reason is not null
published_at     timestamptz   nulo           —                                                      WF-RAIT-004 §3 ("publicados
published_by     uuid          nulo           —                                                       com antecedência e auditáveis")
```

`wip_limit` nulo significa "usa `rait.wip.limit`" (`ops.parameter`, ADR-0021): o número 45 **não**
entra no DDL nem em default. `0` é válido e é o efeito da ausência programada ([WF-RAIT-004] §3 e
§4.2: "ausência programada rebaixa o `WIP` a zero"). O alerta acima de 60 é
`rait.wip.alert` e vive no comando (`RAIT.ASSIGNMENT_WIP_LIMIT`, catálogo §3.4).

Duas linhas da tabela do §3 **não** viraram `kind`: "Calendário de sessões" não é escala de membro
(é calendário do colegiado, `rait_holiday`/`rait_capacity_plan` em TASK-0005) e "Plantão de
suplência" tem entidade própria (§a.7). "Plantão de secretaria de sessão" ficou sem entidade nesta
tarefa — registrado em §g item 4.

### a.5 `inf.rait_schedule_slot` (DDL 35, novo)

Um dia coberto pela escala.

```text
coluna           tipo          nulo/default   FK / check                                                  fonte
---------------  ------------  -------------  ----------------------------------------------------------  ------------------------
schedule_id      uuid          not null       fk_inf_rait_schedule_slot_schedule -> rait_schedule(id)     WF-RAIT-004 §3
slot_on          date          not null       —                                                           WF-RAIT-004 §3 ("dias")
availability     varchar(30)   'DISPONIVEL'   ck in ('DISPONIVEL','EM_PLANTAO','AUSENTE_PROGRAMADO')      WF-RAIT-004 §9
absence_reason   varchar(30)   nulo           mesmos dois checks de a.4                                   WF-RAIT-004 §3
```

O grão é o **dia**, não o turno: `RAIT.SCHEDULE_NO_DUTY_MEMBER` (catálogo §3.4) informa `date`, e o
vocabulário de turno ("dias/turnos" no §3) não é fixado por nenhuma fonte da lista — é `OD-*` (§g
item 1), não invenção. O slot carrega a disponibilidade **efetiva do dia**; a linha de
`rait_schedule` carrega a do período (uma ausência de dois dias dentro de uma semana disponível é
dois slots `AUSENTE_PROGRAMADO` sob uma escala `DISPONIVEL`).

### a.6 `inf.rait_batch` e `inf.rait_batch_item` (DDL 35, novos)

Lote de sorteio de relator, com semente, ordem e ata.

```text
rait_batch
coluna                 tipo          nulo/default    FK / check                                              fonte
---------------------  ------------  --------------  ------------------------------------------------------  ------------------------
pool_id                uuid          not null        fk_inf_rait_batch_pool -> inf.rait_pool(id)             WF-RAIT-004 §5 passo 1
kind                   varchar(20)   'semanal'       ck in ('semanal','extraordinario')                      §5 passos 1 e 7
week_start             date          not null        —                                                       §5 passo 1 (lote semanal)
state                  varchar(20)   'LOTE_ABERTO'   ck in ('LOTE_ABERTO','LOTE_SORTEADO','LOTE_ACEITO')      §9
seed                   varchar(64)   nulo            ck state = 'LOTE_ABERTO' or seed is not null             §5 passo 4 (semente)
opened_at              timestamptz   now()           —                                                       §5 passo 1
opened_by              uuid          nulo            —                                                       §5 passo 1 (secretaria)
drawn_at               timestamptz   nulo            ck (state='LOTE_ABERTO' and drawn_at is null) or         §5 passo 4
                                                     (state in ('LOTE_SORTEADO','LOTE_ACEITO') and
                                                      drawn_at is not null)
accepted_at            timestamptz   nulo            ck (state='LOTE_ACEITO' and accepted_at is not null)     §5 passo 5
                                                     or (state<>'LOTE_ACEITO' and accepted_at is null)
minutes_document_id    uuid          nulo            sem FK — fachada de documentos (ADR-0018)                §5 passo 4 (ata do sorteio)
homologated_at         timestamptz   nulo            ck homologated_at is null or                             §5 passo 4; §Atores
homologated_by         uuid          nulo             homologated_by is not null                              (presidente homologa)
```

```text
rait_batch_item
coluna          tipo          nulo/default   FK / check                                                   fonte
--------------  ------------  -------------  -----------------------------------------------------------  ----------------------
batch_id        uuid          not null       fk_inf_rait_batch_item_batch -> inf.rait_batch(id)           §5 passo 4
case_id         uuid          not null       fk_inf_rait_batch_item_case -> inf.rait_case(id)             §5 passo 1
position        integer       not null       —                                                            §5 passo 4 (ordem)
member_id       uuid          nulo           fk_inf_rait_batch_item_member -> rait_pool_member(id)        §5 passo 4 (membro por caso)
claim_due_on    date          nulo           ck claim_due_on is null or member_id is not null             §5 passo 5 (T-CLAIM)
accepted_at     timestamptz   nulo           ck accepted_at is null or declined_at is null                §5 passo 5
declined_at     timestamptz   nulo           ck (declined_at is null and decline_kind is null) or         §5 passo 5
decline_kind    varchar(20)   nulo            (ambos não nulos); ck decline_kind is null or                §5 passo 5; Lei 9.784
                                              in ('impedimento','suspeicao')                               arts. 18-20
```

`claim_due_on` é a data de vencimento do `T-CLAIM` (`rait.timer.T-CLAIM` = 2 dias úteis,
`ops.parameter`) contada de `drawn_at` pelo calendário — a **duração** é parâmetro, a **data** é
dado. A redistribuição ao próximo da ordem (§5 passo 5) atualiza `member_id` e `claim_due_on` do
item e registra a declaração em `rait_impediment`; não há coluna de histórico de redistribuição, a
trilha é a linha de impedimento mais `rait_case_event`.

`inf.rait_case` é do DDL 34, anterior ao 35: a FK `fk_inf_rait_batch_item_case` é legítima
(precedente `fk_inf_rait_assignment_case`).

### a.7 `inf.rait_substitute_duty` (DDL 35, novo)

Plantão de suplência por sessão.

```text
coluna          tipo          nulo/default   FK / check                                                        fonte
--------------  ------------  -------------  ----------------------------------------------------------------  ----------------------
session_id      uuid          not null       sem FK — inf.rait_session nasce no DDL 36, posterior ao 35        WF-RAIT-004 §3
member_id       uuid          not null       fk_inf_rait_substitute_duty_member -> rait_pool_member(id)        §3; RN-RAIT-142
designated_at   timestamptz   now()          —                                                                 §3 ("por antecipação")
designated_by   uuid          nulo           —                                                                 §Atores (presidente/secretaria)
convened_at     timestamptz   nulo           —                                                                 §6 regra (a)
```

Não há check exigindo `is_substitute` do membro: é regra entre tabelas, guarda de comando
([RN-RAIT-142]; `RAIT.MEMBER_NOT_AVAILABLE` / `RAIT.BENCH_INSUFFICIENT`).

### a.8 `inf.rait_bench` (DDL 35, novo) — e por que a banca fica no worklist

```text
coluna            tipo          nulo/default        FK / check                                              fonte
----------------  ------------  ------------------  ------------------------------------------------------  --------------------
session_id        uuid          not null            sem FK — rait_session é do DDL 36                       WF-RAIT-004 §6
state             varchar(30)   'BANCA_PREVISTA'    ck in ('BANCA_PREVISTA','BANCA_CONFIRMADA',             §9
                                                    'BANCA_INSUFICIENTE')
confirmed_count   integer       0                   ck confirmed_count >= 0                                 §6 ("confirmações")
parity_observed   boolean       nulo                —                                                       §6 (paridade CETRAN)
confirmed_at      timestamptz   nulo                ck state <> 'BANCA_CONFIRMADA' or                       §6
                                                    confirmed_at is not null
insufficient_at   timestamptz   nulo                ck state <> 'BANCA_INSUFICIENTE' or                     §6
                                                    insufficient_at is not null
```

**Decisão exigida pela tarefa** ("`rait_bench.session_id` pode ter FK para `rait_session` só se a
banca ficar no blueprint de sessão; decida e justifique"): a banca fica em
**BP-INF-RAIT-WORKLIST-001** e `session_id` fica **sem FK**. Razões, em ordem de peso:

1. A banca é fato de **organização do trabalho**: nasce em [WF-RAIT-004] §6, do mesmo documento que
   escala (§3), lote (§5) e turma (§7), e seus insumos são do worklist — `rait_pool_member`
   (titular/suplente, `is_substitute`), `rait_schedule` (quem está escalado) e
   `rait_substitute_duty` (quem é o suplente de plantão, convocado primeiro pela regra (a)).
2. A direção de dependência entre módulos já é `rait-session → rait-worklist` (o blueprint de sessão
   declara `@detran/inf-rait-worklist` em `dependencies`). Pôr a banca na sessão obrigaria a sessão
   a nada novo, mas pôr as três entidades de suplência/banca na sessão empurraria
   `rait_substitute_duty` para lá também (ela é o insumo da regra (a)) e separaria a banca da
   escala que a alimenta; manter no worklist não cria dependência nova em nenhuma direção.
3. O preço — `session_id` sem FK — é o preço já pago duas vezes pelo mesmo motivo de ordem de DDL:
   `inf.rait_decision.session_id` (BP-INF-RAIT-CASE-001, DDL 34) e
   `inf.infraction_timer.suspended_by_act_id` (M5). A integridade referencial de `session_id` é
   verificada no comando, e o `ux_inf_rait_bench_session` garante uma banca por sessão.

`parity_observed` é **fato observado** na confirmação (houve paridade?), não a flag
`session.quorum.cetran_parity`: a flag diz se a paridade é **exigida** e vive em `ops.parameter`.
Nulo = paridade não avaliada (JARI, onde a Res. 357 não a exige).

### a.9 `inf.rait_assignment` e `inf.rait_impediment` (DDL 35, colunas novas)

```text
rait_assignment
coluna          tipo          nulo/default   FK / check                                            fonte
--------------  ------------  -------------  ----------------------------------------------------  ---------------------
claim_due_at    timestamptz   nulo           —                                                     WF-RAIT-004 §5 e §10 (T-CLAIM)
batch_id        uuid          nulo           fk_inf_rait_assignment_batch -> inf.rait_batch(id)    §10 (vínculo ao lote)
```

```text
rait_impediment
coluna         tipo           nulo/default      FK / check                                   fonte
-------------  -------------  ----------------  -------------------------------------------  -----------------------------
kind           varchar(20)    'impedimento'     ck in ('impedimento','suspeicao')            WF-RAIT-004 §10; Res. 357 5.1.c
legal_basis    varchar(160)   nulo              —                                            Lei 9.784 arts. 18-20 (§10)
decided_by     uuid           nulo              —                                            §10 (quem decidiu a declaração)
```

`claim_due_at` é `timestamptz` na atribuição (a tarefa fixa o nome `claim_due_at`) e `date` no item
do lote (`claim_due_on`): o prazo é contado em dias úteis, então a **data** é o dado do lote; a
atribuição guarda o instante em que o aceite expira para o membro já atribuído. A divergência de
sufixo é a da própria fonte (§10 diz `rait_assignment.claim_due_at`) e está registrada aqui para
não parecer erro de digitação.

`legal_basis` é `varchar(160)`, o mesmo tipo de `rait_clock.legal_basis`, e texto livre: o artigo
citado é redigido por quem declara (arts. 18 a 20 tratam de hipóteses diferentes).
`ux_inf_rait_impediment` **não** muda (§c).

### a.10 `inf.rait_case` (DDL 34, colunas novas — BP-INF-RAIT-CASE-001 v1.1.0)

```text
coluna           tipo          nulo/default   FK / check                                            fonte
---------------  ------------  -------------  ----------------------------------------------------  -----------------------------
legal_priority   varchar(30)   nulo           **sem check** (valores em rait.priority.legal_bases)  WF-RAIT-004 §2; OD-016, H.54
unit_id          uuid          nulo           sem FK — inf.rait_unit é do DDL 35, posterior ao 34   WF-RAIT-004 §7
version          integer       1              —                                                     ETag / If-Match (CODESTYLE)
```

`legal_priority` **não tem check** de propósito: as bases de prioridade legal são o parâmetro
`rait.priority.legal_bases` (`[{60+:1},{80+:2}]` + PcD, `vigente` por H.54, OD-016) e a fonte da
pessoa idosa segue pendente no corpus ([WF-RAIT-004] §2: "Estatuto da Pessoa Idosa art. 71, **fonte
pendente**"). Um check congelaria parâmetro em DDL, o que ADR-0021 proíbe. [WF-RAIT-004] §10 chama a
coluna de `priority_basis`; o nome que vale é o desta tarefa, `legal_priority`.

### a.11 `inf.rait_pending_content` (DDL 34, novo)

Pendência de conteúdo mínimo aberta no protocolo.

```text
coluna           tipo          nulo/default   FK / check                                                fonte
---------------  ------------  -------------  --------------------------------------------------------  -----------------------
case_id          uuid          not null       fk_inf_rait_pending_content_case -> inf.rait_case(id)     UC-RAIT-028 fluxo 1
missing_items    jsonb         not null       —                                                         UC-RAIT-028 fluxo 1
                                                                                                        ("lista os itens
                                                                                                        ausentes"); RN-RAIT-002
due_on           date          not null       —                                                         UC-RAIT-028 fluxo 1
                                                                                                        (prazo interno)
opened_at        timestamptz   now()          —                                                         UC-RAIT-028 fluxo 1
opened_by        uuid          not null       —                                                         UC-RAIT-028 (secretaria)
closed_at        timestamptz   nulo           ck (closed_at is null and outcome is null) or             UC-RAIT-028 fluxos 3 e 2a
outcome          varchar(20)   nulo            (ambos não nulos); ck outcome is null or                  idem (desfecho)
                                               in ('atendida','nao_atendida')
```

`due_on` guarda a **data**; o prazo interno ("proposta: 10 dias" no fluxo 1) não tem chave de
parâmetro no catálogo — registrado em §g item 2, não inventado como default.

**Atenção ao mapeamento de UC.** O prompt desta tarefa atribui `rait_pending_content` a
[UC-RAIT-027] e `rait_redirect` a [UC-RAIT-028]; os arquivos-fonte estão invertidos em relação a
isso: `UC-RAIT-028.md` é "saneia pendência de conteúdo mínimo" e `UC-RAIT-027.md` é "recebe recurso
destinado a outro órgão ou o redireciona". As `description` dos blueprints citam a UC que
**contém** a substância de cada entidade (028 para a pendência, 027 para o redirecionamento), como
manda a regra 7 do prompt ("`description` cita workflow/UC e seção"). A inversão está reportada.

### a.12 `inf.rait_redirect` (DDL 34, novo)

Redirecionamento de intake entre órgãos, nos dois sentidos.

```text
coluna                     tipo           nulo/default   FK / check                                       fonte
-------------------------  -------------  -------------  -----------------------------------------------  --------------------------
case_id                    uuid           nulo           fk_inf_rait_redirect_case -> inf.rait_case(id)   UC-RAIT-027 fluxos 2 e 3
                                                         ck direction <> 'entrada' or
                                                         case_id is not null
direction                  varchar(10)    not null       ck in ('entrada','saida')                        UC-RAIT-027 §Ator
                                                                                                          ("em ambos os sentidos")
reason                     varchar(30)    not null       ck in ('outro_orgao_autuador',                   UC-RAIT-027 fluxos 2 e 4
                                                         'orgao_incompetente')
protocol_number            varchar(40)    not null       —                                                Res. 900 art. 6º §2º
ait_number                 varchar(40)    nulo           —                                                UC-RAIT-027 fluxo 1
counterpart_agency         varchar(120)   not null       —                                                UC-RAIT-027 fluxo 1
counterpart_renainf_code   varchar(20)    nulo           —                                                UC-RAIT-027 fluxo 1
                                                                                                          (código RENAINF)
origin_protocolled_on      date           nulo           —                                                AC-RAIT-027-1; RN-RAIT-106
deadline_restored          boolean        false          —                                                AC-RAIT-027-2; RN-RAIT-109
receipt_document_id        uuid           nulo           sem FK — fachada de documentos (ADR-0018)         Res. 900 art. 6º §2º
redirected_at              timestamptz    now()          —                                                UC-RAIT-027 fluxo 2
redirected_by              uuid           not null       —                                                UC-RAIT-027 (secretaria)
```

`case_id` é nulo na saída: a peça de outro órgão autuador é protocolada e remetida **sem** gerar
caso aqui (fluxo 2); na entrada existe caso (fluxo 3), garantido pelo check. Os dois valores de
`reason` são os dois motivos do UC (fluxo 2: peça de outro órgão autuador; fluxo 4: órgão
incompetente por erro do cidadão, Lei 9.784 art. 63 §1º). O redirecionamento "de instância" que o
prompt menciona cai em `orgao_incompetente` — a mesma devolução de prazo do art. 63 §1º; um token
próprio não tem fonte.

### a.13 `inf.rait_draft` (DDL 34, novo)

Minuta de decisão versionada.

```text
coluna            tipo           nulo/default   FK / check                                           fonte
----------------  -------------  -------------  ---------------------------------------------------  -------------------------
case_id           uuid           not null       fk_inf_rait_draft_case -> inf.rait_case(id)          WF-RAIT-004 §4 passo 3
version           integer        not null       ck version >= 1                                      §4 passo 5 (versões)
author_id         uuid           not null       —                                                    §4 passo 3 (revisor redige)
document_id       uuid           nulo           sem FK — fachada de documentos (ADR-0018)            ADR-0018; §4 passo 5
content_hash      varchar(128)   not null       —                                                    precedente rait_document
status            varchar(20)    'rascunho'     ck in ('rascunho','submetida','devolvida',           M12 derivado do §4 passo 5
                                                'assinada')
submitted_at      timestamptz    nulo           ck status = 'rascunho' or submitted_at is not null   §4 passo 5 (vai à F-DP-5)
returned_at       timestamptz    nulo           ck status <> 'devolvida' or (returned_at is not      §4 passo 5 (devolve com
return_guidance   text           nulo            null and return_guidance is not null)                orientação)
return_count      integer        0              ck return_count <= 1                                 §4 passo 5 ("uma vez")
```

`status` é vocabulário de modelagem (M12): minúsculas, derivado do ciclo do §4 passo 5
(redige → vai à assinatura → pode voltar uma vez com orientação → é assinada). Não é token
canônico e a UI traduz rótulos por `rait.*`. `return_count <= 1` é a tradução literal do "(uma
vez)" do §4 passo 5, no mesmo formato de `ck_inf_rait_inquiry_single_extension`.

### a.14 `inf.rait_session`, `inf.rait_agenda_item`, `inf.rait_minutes` (DDL 36, colunas novas — BP-INF-RAIT-SESSION-001 v1.1.0)

```text
rait_session
coluna              tipo          nulo/default   FK / check                                          fonte
------------------  ------------  -------------  --------------------------------------------------  ---------------------------
modality            varchar(20)   'presencial'   ck in ('presencial','virtual','hibrida')            WF-RAIT-003 §Fundamento;
                                                                                                     WF-RAIT-004 §6 regra (d);
                                                                                                     OD-106 (H.54/H.57)
short_notice_ack    boolean       false          ck short_notice_ack_by is null or                   RAIT.AGENDA_SHORT_NOTICE
                                                 short_notice_ack                                    (catálogo §3.7); OD-102
```

```text
rait_agenda_item
coluna              tipo   nulo/default   FK / check                                                fonte
------------------  -----  -------------  --------------------------------------------------------  ------------------------
view_requested_by   uuid   nulo           ck (ambos nulos) or (ambos não nulos)                      Res. 901/2022 Anexo 11.1
view_due_on         date   nulo           (ck_inf_rait_agenda_item_view_complete)                    (WF-RAIT-004 §2.3);
                                                                                                    OD-103; RAIT.VIEW_DEADLINE_
                                                                                                    EXCEEDED (context dueOn)
```

```text
rait_minutes
coluna         tipo          nulo/default   FK / check                                     fonte
-------------  ------------  -------------  ---------------------------------------------  ----------------------------
published_at   timestamptz   nulo           ck published_at is null or                     WF-RAIT-004 §2.2 fila F-J-5;
                                            signed_at is not null                          RN-RAIT-103; RAIT.MINUTES_
                                                                                           SIGNERS_MISSING (§3.7)
```

`modality` sem acento (`hibrida`): o repositório não tem valor de enum acentuado em nenhum DDL
(`NAO_CONHECIDO`, `nao_provimento`, `particular_firma_autenticidade`) e CODESTYLE §Naming manda
copiar o token do domínio sem traduzir — a grafia ASCII é a convenção persistida, o rótulo
acentuado é i18n (`rait.*`). A habilitação da sessão virtual é a flag
`session.modality.virtual_enabled` (`ops.parameter`), não uma coluna.

`published_at` só existe depois de `signed_at`: a ata publicada é o marco de `T-R2`
([RN-RAIT-103]) e publicar sem assinatura é `RAIT.MINUTES_SIGNERS_MISSING`. A recusa de
republicação (`RAIT.MINUTES_ALREADY_PUBLISHED`) é guarda de comando.

## b. Máquinas de estado — estado, gatilho, guarda, fonte

Tokens **exatamente** os de [WF-RAIT-004] §9. Estas quatro máquinas são o que o Inspector testa
como check e unicidade (TASK-0006) e o que R-0007 implementa como comando. Nenhuma delas altera os
estados do caso ([WF-RAIT-001]), da sessão ([WF-RAIT-003]) ou da infração ([WF-INF-003]).

### b.1 Unidade de julgamento — `rait_unit.state`

```text
U0  [*] -> TURMA_ATIVA
    gatilho : cadastro da JARI-AM única
    guarda  : judging_body in ('jari','cetran'); é o default do DDL
    fonte   : WF-RAIT-004 §7 diagrama ([*] --> TURMA_ATIVA, steering B.9)

U1  TURMA_ATIVA -> TURMA_EM_CONSTITUICAO
    gatilho : gestor RAIT propõe nova JARI/turma
    guarda  : projeção do §8 indica fila > capacidade por 3 meses seguidos
              (rait.unit.queue_over_capacity_months, ops.parameter); nomeação pelo chefe do
              Executivo (Res. 357 item 6.2)
    erro    : RAIT.UNIT_TRIGGER_NOT_MET (422; context months, backlog, capacity)
    fonte   : WF-RAIT-004 §7 diagrama; §8 (gatilho de nova turma); catálogo §3.10

U2  TURMA_EM_CONSTITUICAO -> TURMA_ATIVA
    gatilho : membros nomeados
    guarda  : regimento cadastrado no CETRAN-AM (Res. 357 item 9.1.b) e coordenador designado
              (item 2.3) — coordinator_member_id não nulo quando há mais de uma turma
    erro    : RAIT.UNIT_COORDINATOR_REQUIRED (422; context unitId)
    fonte   : WF-RAIT-004 §7 diagrama; catálogo §3.10; RN-RAIT-139

U3  TURMA_ATIVA -> TURMA_SUSPENSA
    gatilho : perda de quorum estrutural
    guarda  : mandatos vencidos sem recondução (rait_pool_member.status MANDATO_ENCERRADO)
    fonte   : WF-RAIT-004 §7 diagrama; WF-RAIT-002 §5

U4  TURMA_SUSPENSA -> TURMA_ATIVA
    gatilho : recomposição
    guarda  : quorum estrutural restabelecido
    fonte   : WF-RAIT-004 §7 diagrama
```

### b.2 Lote de distribuição — `rait_batch.state`

```text
L0  [*] -> LOTE_ABERTO
    gatilho : secretaria abre o lote (semanal ou extraordinário)
    guarda  : casos recebidos desde o lote anterior (fila F-J-1), na ordem única do §2; um lote
              'semanal' por pool e semana (§c); lote 'extraordinario' só com caso ALERTA_N3/CRITICO
              recebido fora do ciclo
    erro    : RAIT.BATCH_STATE_INVALID (409); RAIT.ORDER_OVERRIDE_FORBIDDEN (403)
    fonte   : WF-RAIT-004 §5 passos 1 e 7; §9; catálogo §3.4

L1  LOTE_ABERTO -> LOTE_SORTEADO
    gatilho : round-robin com ordem inicial aleatorizada por lote e carga ponderada
    guarda  : elegíveis = ATIVO (WF-RAIT-002 §5) e DISPONIVEL/EM_PLANTAO (§3), titulares primeiro,
              suplentes só se o titular estiver AUSENTE_PROGRAMADO além do prazo do lote (passo 2);
              exclusão caso a caso de quem lavrou o AIT ou tem impedimento/suspeição (passo 3);
              prevenção: recurso ao CETRAN nunca a quem julgou na JARI (passo 6); seed e ordem
              gravadas (seed não nulo, position por item) e ata assinada pelo presidente
              (PAdES+TSA, steering A.8)
    erro    : RAIT.BATCH_NO_ELIGIBLE_MEMBERS (422); RAIT.MEMBER_NOT_AVAILABLE (422);
              RAIT.MEMBER_IMPEDED (422); RAIT.BATCH_SEED_TAMPERED (422)
    fonte   : WF-RAIT-004 §5 passos 2-4 e 6; RN-RAIT-140; RN-RAIT-141; RN-RAIT-142; catálogo §3.4

L2  LOTE_SORTEADO -> LOTE_SORTEADO (auto-laço)
    gatilho : ⏱ T-CLAIM vence sem aceite, ou relator declara impedimento/suspeição
    guarda  : redistribui ao próximo da ordem dentro do mesmo lote; novo claim_due_on = T-CLAIM
              (rait.timer.T-CLAIM, 2 dias úteis) do instante da redistribuição
    erro    : RAIT.BATCH_CLAIM_EXPIRED (409; context batchId, caseId, expiredAt)
    fonte   : WF-RAIT-004 §5 passo 5; §9 diagrama; catálogo §3.4

L3  LOTE_SORTEADO -> LOTE_ACEITO
    gatilho : todos os relatores aceitaram ou os impedimentos foram redistribuídos no lote
    guarda  : nenhum item sem member_id e sem accepted_at; accepted_at do lote não nulo
    fonte   : WF-RAIT-004 §5 passo 5; §9 diagrama

L4  LOTE_ACEITO -> [*]
    gatilho : casos passam a EM_INSTRUCAO com relator
    guarda  : rait_assignment ativo por caso (ux_inf_rait_assignment_active) com batch_id do lote;
              T-VOTO armado (rait.timer.T-VOTO)
    fonte   : WF-RAIT-004 §5 diagrama; §9
```

### b.3 Banca da sessão — `rait_bench.state`

```text
B0  [*] -> BANCA_PREVISTA
    gatilho : pauta fechada (rait_session PAUTA_FECHADA)
    guarda  : banca = titulares escalados (rait_schedule DISPONIVEL/EM_PLANTAO) + suplentes de
              plantão (rait_substitute_duty da sessão)
    fonte   : WF-RAIT-004 §6 diagrama; §3

B1  BANCA_PREVISTA -> BANCA_CONFIRMADA
    gatilho : confirmações de presença recebidas
    guarda  : confirmed_count >= rait_session.quorum_required; presidente ou suplente presente
              (rait_attendance.is_chair / is_chair_substitute); paridade observada no CETRAN
              (parity_observed = true quando session.quorum.cetran_parity está ligado); nenhum
              impedimento pendente; confirmed_at não nulo
    erro    : RAIT.SESSION_QUORUM_MISSING (422; context required, observed, parity)
    fonte   : WF-RAIT-004 §6 (quadro JARI/CETRAN e diagrama); Res. 357 item 8.2;
              Res. 901/2022 Anexo 12.2; catálogo §3.7

B2  BANCA_PREVISTA -> BANCA_INSUFICIENTE
    gatilho : ⏱ T-CONV (rait.timer.T-CONV, 5 dias úteis) vence
    guarda  : confirmed_count < quorum_required no fechamento de T-CONV; insufficient_at não nulo
    erro    : RAIT.BENCH_INSUFFICIENT (422; context confirmed, required)
    fonte   : WF-RAIT-004 §6 diagrama; catálogo §3.7; OD-102

B3  BANCA_INSUFICIENTE -> BANCA_PREVISTA
    gatilho : convocação dos suplentes de plantão ou remarcação dentro do calendário
    guarda  : suplente de plantão convocado antes de qualquer outro (regra (a); convened_at do
              rait_substitute_duty)
    fonte   : WF-RAIT-004 §6 diagrama e regra (a); RN-RAIT-142

B4  BANCA_INSUFICIENTE -> [*]
    gatilho : abertura sem quorum
    guarda  : sessão vai a SESSAO_ADIADA (WF-RAIT-003) com adjourned_reason; relógios seguem
              correndo (AC-RAIT-006-2)
    fonte   : WF-RAIT-004 §6 diagrama; WF-RAIT-003 §Quorum

B5  BANCA_CONFIRMADA -> [*]
    gatilho : sessão aberta
    guarda  : quorum reverificado item a item; membro impedido no item permanece na sessão e o
              quorum do item é recontado sem ele — abaixo da maioria o item sai de pauta, não a
              sessão (regra (b)); faltas injustificadas alimentam unjustified_absence_count
              (regra (c))
    erro    : RAIT.VOTE_MEMBER_IMPEDED (422); RAIT.SESSION_QUORUM_MISSING (422)
    fonte   : WF-RAIT-004 §6 regras (b) e (c); Res. 357 itens 5.1.c e 7.3; catálogo §3.7
```

### b.4 Disponibilidade do membro — `rait_schedule.availability` e `rait_schedule_slot.availability`

Ortogonal aos estados de accountability de [WF-RAIT-002] §5 (`rait_pool_member.status`), que
continuam valendo.

```text
D0  [*] -> DISPONIVEL
    gatilho : escala publicada inclui o membro no período
    guarda  : published_at não nulo; período não iniciado (RAIT.SCHEDULE_PERIOD_LOCKED, 409,
              context periodStart)
    fonte   : WF-RAIT-004 §3 diagrama e tabela; catálogo §3.4

D1  DISPONIVEL -> EM_PLANTAO
    gatilho : designado plantonista do período
    guarda  : um plantonista por dia útil do período (RAIT.SCHEDULE_NO_DUTY_MEMBER, 422,
              context date); kind = 'plantao_risco' no pool defesa_previa
    fonte   : WF-RAIT-004 §3 (plantão de risco); catálogo §3.4

D2  EM_PLANTAO -> DISPONIVEL
    gatilho : fim do plantão
    guarda  : —
    fonte   : WF-RAIT-004 §3 diagrama

D3  DISPONIVEL -> AUSENTE_PROGRAMADO
    gatilho : férias, licença, curso, sessão externa
    guarda  : absence_reason obrigatório (check); wip_limit rebaixado a zero e reatribuição do que
              vencer no período (§3 e §4.2)
    erro    : RAIT.MEMBER_NOT_AVAILABLE (422; context memberId, availability, status)
    fonte   : WF-RAIT-004 §3 diagrama e tabela; catálogo §3.4

D4  EM_PLANTAO -> AUSENTE_PROGRAMADO
    gatilho : ausência imprevista
    guarda  : plantão passa ao substituto — outro rait_schedule kind='plantao_risco' EM_PLANTAO no
              mesmo período
    fonte   : WF-RAIT-004 §3 diagrama

D5  AUSENTE_PROGRAMADO -> DISPONIVEL
    gatilho : retorno na data prevista
    guarda  : —
    fonte   : WF-RAIT-004 §3 diagrama

D6  AUSENTE_PROGRAMADO -> [*]
    gatilho : ausência vira AFASTADO_TEMP ou MANDATO_ENCERRADO
    guarda  : sai desta máquina e entra na de accountability (rait_pool_member.status,
              WF-RAIT-002 §5) — nenhuma coluna nova
    fonte   : WF-RAIT-004 §3 diagrama; WF-RAIT-002 §5
```

Elegibilidade para receber distribuição (§3 regra final e §5 passo 2, [RN-RAIT-141]): `ATIVO` em
[WF-RAIT-002] §5 **e** `DISPONIVEL`/`EM_PLANTAO` aqui **e** sem impedimento no caso. É guarda de
comando; as três condições estão em três tabelas e nenhum check as cobre.

## c. Regras de unicidade

```text
índice / regra                          escopo                                       o que garante e por quê
--------------------------------------  -------------------------------------------  --------------------------------------
ux_inf_rait_pool_instance               (tenant_id, instance) where unit_id is null  um pool por instância sem turma — as 3
  (ALTERADO: ganhou o where)                                                         fixtures canônicas (RAIT.POOL_
                                                                                     INSTANCE_DUPLICATE, catálogo §3.10)
ux_inf_rait_pool_instance_unit          (tenant_id, instance, unit_id)               um pool por instância e turma quando
  (NOVO)                                where unit_id is not null                    houver mais de uma JARI (§7, §10)
ux_inf_rait_unit_name                   (tenant_id, judging_body, name)              a ata do sorteio identifica a turma
                                                                                     pelo nome (§5 passo 4)
ux_inf_rait_schedule_member_period      (tenant_id, member_id, kind, period_start)   escala por membro e período; kind entra
                                                                                     porque o subcoordenador tem escala
                                                                                     semanal e plantão de risco na mesma
                                                                                     semana (§3)
ux_inf_rait_schedule_slot_day           (tenant_id, schedule_id, slot_on)            um slot por dia na escala
ux_inf_rait_batch_pool_week             (tenant_id, pool_id, week_start)             lote por pool e semana (§5 passo 1);
                                        where kind = 'semanal'                       parcial porque o lote extraordinário
                                                                                     é imediato e pode repetir na semana
                                                                                     (§5 passo 7)
ux_inf_rait_batch_item_case             (tenant_id, batch_id, case_id)               um caso uma vez por lote
ux_inf_rait_batch_item_position         (tenant_id, batch_id, position)              a ordem sorteada é uma permutação sem
                                                                                     empate (§5 passo 4)
ux_inf_rait_substitute_duty             (tenant_id, session_id, member_id)           um plantão de suplência por suplente e
                                                                                     sessão
ux_inf_rait_bench_session               (tenant_id, session_id)                      banca por sessão (§6)
ux_inf_rait_pending_content_open        (tenant_id, case_id) where closed_at is null  uma pendência aberta por caso —
                                                                                     exigência de uma só vez (RN-PORTAL-107,
                                                                                     UC-RAIT-028 fluxo 2a)
ux_inf_rait_redirect_protocol           (tenant_id, direction, protocol_number)      um registro por protocolo e sentido
                                                                                     (Res. 900 art. 6º §2º)
ux_inf_rait_draft_version               (tenant_id, case_id, version)                uma linha por versão da minuta
ux_inf_rait_impediment (INALTERADO)     (tenant_id, case_id, member_id)              uma declaração por membro e caso
                                                                                     (AC-RAIT-011-3) — `kind` NÃO entra: a
                                                                                     regra é uma declaração, não uma por
                                                                                     espécie
vista por membro e item                 NÃO é índice                                 view_requested_by é coluna do item, logo
                                                                                     um pedido por item por construção; o
                                                                                     teto por membro é o parâmetro
                                                                                     session.view_request.max_per_member
                                                                                     (=1, OD-103) e vive na guarda do
                                                                                     comando — congelá-lo num índice único
                                                                                     violaria ADR-0021
```

Índices de leitura novos (não únicos): `ix_inf_rait_unit_state`,
`ix_inf_rait_schedule_pool_period`, `ix_inf_rait_batch_state`, `ix_inf_rait_draft_status`,
`ix_inf_rait_redirect_case`, `ix_inf_rait_pending_content_due` (parcial em `closed_at is null`,
espelho de `ix_inf_rait_inquiry_open`).

## d. Notas de migração dos DDL 34–36 (por que não há `ALTER`)

1. **Regenerable-only.** Os três arquivos têm o cabeçalho `Generated from BP-… sha256:…` e são
   reescritos inteiros por `pnpm blueprints:generate`; `apply.sh --full` derruba e recria o banco
   (`DB_NAME=detran_r6b bash backend/database/apply.sh --full` nesta tarefa). ADR-0007 proíbe editar
   gerado, e DDL manual só existe nas faixas `0x`/`1x` (CODESTYLE §Backend). Logo não há migração
   `ALTER` a escrever — há a nota que segue.
2. **Ambiente já aplicado não migra sozinho.** Todo `create table`/`create index` é
   `if not exists`: num banco criado antes desta rodada, `inf.rait_pool` continua sem `unit_id` e
   `ux_inf_rait_pool_instance` continua **sem** o `where unit_id is null`. Não há caminho de
   atualização incremental — quem tiver banco de rodada anterior recria com `--full`. Nenhum
   ambiente com dado real existe (WP-A).
3. **Ordem de entidades dentro do DDL 35 mudou** para que as FKs sejam inline e válidas:
   `rait_unit` passou a ser a primeira tabela (antes de `rait_pool`, que agora referencia a unidade)
   e `rait_batch`/`rait_batch_item` vêm antes de `rait_assignment` (que agora referencia o lote). A
   ordem final é `rait_unit`, `rait_pool`, `rait_pool_member`, `rait_schedule`,
   `rait_schedule_slot`, `rait_batch`, `rait_batch_item`, `rait_assignment`, `rait_impediment`,
   `rait_substitute_duty`, `rait_bench`, `rait_clock`, `rait_clock_alert`.
4. **Ordem no DDL 34**: `rait_pending_content` e `rait_redirect` entram depois de `rait_document`
   (fase de intake) e `rait_draft` depois de `rait_inquiry` (fase de instrução); todas referenciam
   apenas `inf.rait_case`, que é a primeira tabela do arquivo.
5. **DDL 36 só ganha colunas e checks** — nenhuma tabela nova, nenhuma reordenação.
6. **Referências sem FK por ordem de DDL** (as três novas, somadas às duas que já existiam):
   `rait_case.unit_id` → `inf.rait_unit` (34 < 35), `rait_substitute_duty.session_id` e
   `rait_bench.session_id` → `inf.rait_session` (35 < 36). Precedentes:
   `rait_decision.session_id` e `infraction_timer.suspended_by_act_id` (M5). Integridade verificada
   no comando.
7. **Contagem de tabelas de tenant**: `pnpm verify:rls-ddl` sai de **141** para **151** (10 tabelas
   novas: 7 no worklist, 3 no caso). O teste
   `backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts` fixa a contagem de
   tabelas do schema `inf` (`MOD-inf-ait-rls-count` no plano) — é o Inspector de TASK-0006 que
   atualiza o número; esta tarefa não toca `tests/**`.
8. **`pnpm verify:lifecycle-vocabulary` não muda** (15 estados, 12 sub-estados, 18 timers): as
   quatro máquinas da §b são de membro, lote, banca e unidade — não de caso nem de infração —, e
   nenhuma linha de `14-inf-lifecycle-vocabulary.sql` foi tocada (M4).
9. **OpenAPI**: os dez recursos novos entram em
   `docs/framework/contracts/BP-INF-RAIT-{WORKLIST,CASE}-001.openapi.json` com os `path`
   `units`, `schedules`, `schedule-slots`, `batches`, `batch-items`, `substitute-duties`,
   `benches`, `pending-contents`, `redirects`, `drafts` sob `/v1/inf/rait/`, recursos de política
   `inf:rait-{unit,schedule,schedule-slot,batch,batch-item,substitute-duty,bench,pending-content,redirect,draft}`.
   As rotas geradas são leitura/escrita CRUD; os comandos de negócio (abrir lote, sortear, aceitar,
   confirmar banca, publicar escala) são de R-0007, e a política precisa negar a escrita direta até
   eles existirem — mesma ressalva do M13 para a infração.

## e. Ajustes de seed exigidos (para o Inspector, TASK-0006)

Tenant `00000000-0000-7000-8000-00000000a001` (`am-fixtures`), hoje = **2026-09-14** (segunda-feira).
As fixtures são escritas pelo Inspector (M6) em `backend/database/seed/20-fixtures-rait.sql`; esta
tarefa **não** editou o seed e verificou que ele carrega sem alteração
(`DB_NAME=detran_r6b bash backend/database/seed.sh` → `seed.sh: done`).

### e.1 Por que nenhum `insert` existente quebra

Toda coluna nova em tabela já seedada é nula ou tem default, e todos os `insert` do arquivo listam
colunas explicitamente:

```text
tabela               coluna nova            efeito no insert atual
-------------------  ---------------------  ----------------------------------------------------------
rait_pool            unit_id                nula — as 3 fixtures ficam sem turma
rait_pool            priority_policy        default 'ordem_unica'
rait_pool_member     is_substitute          default false
rait_pool_member     jurisdiction           nula
rait_assignment      claim_due_at           nula
rait_assignment      batch_id               nula
rait_impediment      kind                   default 'impedimento' (a fixture atual é impedimento)
rait_impediment      legal_basis            nula (o artigo já está no campo `basis` da fixture)
rait_impediment      decided_by             nula
rait_case            legal_priority         nula
rait_case            unit_id                nula
rait_case            version                default 1
rait_session         modality               default 'presencial'
rait_session         short_notice_ack       default false
rait_agenda_item     view_requested_by      nula
rait_agenda_item     view_due_on            nula
rait_minutes         published_at           nula
```

O único índice alterado é `ux_inf_rait_pool_instance`, que passou a ser parcial em
`unit_id is null` — as três fixtures têm `unit_id` nulo e continuam cobertas por ele.

### e.2 Ajustes pedidos nos `insert` existentes

```text
linha / fixture                          ajuste pedido                                       por quê
---------------------------------------  --------------------------------------------------  --------------------------
rait_pool_member …000021000010 (João)    acrescentar is_substitute = true                    rait-fixtures.md §1 já o
                                                                                             descreve como "suplente";
                                                                                             é o insumo de
                                                                                             rait_substitute_duty e do
                                                                                             §5 passo 2
rait_impediment …000023000001 (Iara,     acrescentar kind = 'impedimento' e legal_basis      a.9; Lei 9.784 arts. 18-20;
caso 11)                                 explícitos                                          torna o token visível ao
                                                                                             teste de check
rait_minutes …000034000001 (sessão 03)   acrescentar published_at (a ata está assinada)      a.14; publicação é o marco
                                                                                             de T-R2 (RN-RAIT-103) e o
                                                                                             caso 13 já tem T-R2 armado
rait_session …000030000002 (sessão 02)   nada obrigatório; se a pauta tiver sido fechada     RAIT.AGENDA_SHORT_NOTICE;
                                         com menos de T-CONV, marcar short_notice_ack com    OD-102
                                         short_notice_ack_by
rait_pool (3 linhas)                     NÃO alterar (unit_id segue nulo)                    preserva as 3 fixtures e a
                                                                                             JARI única (B.9); o índice
                                                                                             ux_inf_rait_pool_instance_
                                                                                             unit é exercitado por linha
                                                                                             efêmera dentro do teste,
                                                                                             não por fixture
rait_pool_member (jurisdiction)          deixar nula em todas                                nenhuma autoridade
                                                                                             signatária é membro de pool
                                                                                             nas fixtures e a relação das
                                                                                             55 circunscrições é pendente
                                                                                             (H.48) — §g item 3
```

### e.3 Prefixos de id das fixtures novas

Prefixos fixados pelo prompt desta tarefa, todos hexadecimais sob `00000000-0000-7000-8000-`:

```text
prefixo de id                          entidade                       alocação de NNNNN
-------------------------------------  -----------------------------  ---------------------------------
00000000-0000-7000-8000-0000220NNNNN   inf.rait_unit                  00001…00003 (um por estado)
00000000-0000-7000-8000-0000230NNNNN   inf.rait_schedule              00001…00003 (um por estado)
00000000-0000-7000-8000-0000230NNNNN   inf.rait_schedule_slot         10001…      (sub-faixa 1xxxx)
00000000-0000-7000-8000-0000240NNNNN   inf.rait_batch                 00001…00003 (um por estado)
00000000-0000-7000-8000-0000240NNNNN   inf.rait_batch_item            10001…      (sub-faixa 1xxxx)
00000000-0000-7000-8000-0000260NNNNN   inf.rait_substitute_duty       00001…
00000000-0000-7000-8000-0000270NNNNN   inf.rait_bench                 00001…00004 (3 estados + CETRAN)
00000000-0000-7000-8000-0000130NNNNN   inf.rait_pending_content       00001…00003 (um por desfecho)
00000000-0000-7000-8000-0000140NNNNN   inf.rait_redirect              00001…00002 (um por sentido)
00000000-0000-7000-8000-0000150NNNNN   inf.rait_draft                 00001…00004 (um por status)
```

Ids de pessoa/usuário **não** seguem esse prefixo: são `00000000-0000-4000-8000-0000b000NNNN`
(UUID versão 4, `rait-fixtures.md` §1) e aparecem nas tabelas da §e.4 como `…0000b000NNNN`; ids de
membro de pool são `00000000-0000-7000-8000-0000210NNNNN` e aparecem como `…000021000NNN`.

**Colisão a confirmar com o maestro.** Seis destes oito prefixos já pertencem a outras entidades em
`20-fixtures-rait.sql`: `0000130` = `rait_admissibility`, `0000140` = `rait_deadline`,
`0000150` = `rait_inquiry`, `0000220` = `rait_assignment`, `0000230` = `rait_impediment`,
`0000240` = `rait_clock`. Só `0000260` e `0000270` estavam livres. Não há erro de banco — a chave
primária é por tabela, e `inf.rait_unit …000022000001` conviverá com
`inf.rait_assignment …000022000001` —, mas quebra a leitura "um prefixo, uma entidade" que
`rait-fixtures.md` e o CTG-0001 §7 usam: num log ou numa falha de teste o id deixa de dizer que
tabela é. Os prefixos acima **valem como estão** (são os do prompt); se o maestro preferir prefixos
livres, as faixas disponíveis hoje são `0000190`, `0000260`…`0000290`, `0000350`…`0000390`.

**Mapa normativo dos prefixos (decisão M16 do maestro, 2026-09-14) — vale sobre a tabela e os exemplos acima.**
O Inspector (TASK-0006) escreve as fixtures com estes prefixos; onde os exemplos das seções e.4…e.12 usam
os prefixos antigos, aplique a substituição abaixo mantendo o sufixo `NNNNN`:

| Entidade                   | Prefixo antigo (exemplos) | Prefixo normativo |
| -------------------------- | ------------------------- | ----------------- |
| `inf.rait_unit`            | `0000220`                 | `0000260`         |
| `inf.rait_schedule`        | `0000230` (0xxxx)         | `0000270` (0xxxx) |
| `inf.rait_schedule_slot`   | `0000230` (1xxxx)         | `0000270` (1xxxx) |
| `inf.rait_batch`           | `0000240` (0xxxx)         | `0000280` (0xxxx) |
| `inf.rait_batch_item`      | `0000240` (1xxxx)         | `0000280` (1xxxx) |
| `inf.rait_substitute_duty` | `0000260`                 | `0000290`         |
| `inf.rait_bench`           | `0000270`                 | `0000350`         |
| `inf.rait_pending_content` | `0000130`                 | `0000360`         |
| `inf.rait_redirect`        | `0000140`                 | `0000370`         |
| `inf.rait_draft`           | `0000150`                 | `0000380`         |

Referências a entidades **já existentes** (`…000021…` membros, `…000023000001` impedimento da Iara,
`…000010…` casos, `…000030…` sessões) não mudam.

### e.4 Fixtures novas — uma por estado de cada máquina

```text
inf.rait_unit  (máquina b.1)
id                     state                   name                judging_body  coordinator_member_id
---------------------  ----------------------  ------------------  ------------  ---------------------
…000022000001          TURMA_ATIVA             JARI-AM             jari          …000021000011 (Karina)
…000022000002          TURMA_EM_CONSTITUICAO   JARI-AM 2a Turma    jari          null
…000022000003          TURMA_SUSPENSA          JARI-AM 3a Turma    jari          null
```

```text
inf.rait_schedule  (máquina b.4) — período 2026-09-14 a 2026-09-18 (semana corrente)
id             member_id              pool_id        kind              availability         wip_limit  absence_reason
-------------  ---------------------  -------------  ----------------  -------------------  ---------  --------------
…000023000001  …000021000001 (Ana)    …000020000001  escala_semanal    DISPONIVEL           null       null
…000023000002  …000021000004 (Diego)  …000020000001  plantao_risco     EM_PLANTAO           null       null
…000023000003  …000021000003 (Carla)  …000020000001  escala_semanal    AUSENTE_PROGRAMADO   0          ferias
```

`published_at` = `2026-09-11T12:00:00-04:00` e `published_by` = Diego (`…0000b0000004`) nas três
(§3: escala publicada com antecedência). `wip_limit` nulo nas duas primeiras significa "usa
`rait.wip.limit`"; `0` na terceira é o rebaixamento por ausência (§4.2) — nenhuma das duas grava 45.

```text
inf.rait_schedule_slot  (máquina b.4, grão dia)
id             schedule_id     slot_on      availability         absence_reason
-------------  --------------  -----------  -------------------  --------------
…000023010001  …000023000001   2026-09-14   DISPONIVEL           null
…000023010002  …000023000001   2026-09-15   DISPONIVEL           null
…000023010003  …000023000002   2026-09-14   EM_PLANTAO           null
…000023010004  …000023000003   2026-09-14   AUSENTE_PROGRAMADO   ferias
…000023010005  …000023000003   2026-09-15   AUSENTE_PROGRAMADO   ferias
```

```text
inf.rait_batch  (máquina b.2) — pool JARI …000020000002
id             kind            week_start   state           seed                  drawn_at     accepted_at
-------------  --------------  -----------  --------------  --------------------  -----------  -----------
…000024000001  semanal         2026-09-14   LOTE_ABERTO     null                  null         null
…000024000002  semanal         2026-09-07   LOTE_SORTEADO   16 bytes em hex       2026-09-09   null
…000024000003  semanal         2026-08-31   LOTE_ACEITO     16 bytes em hex       2026-09-02   2026-09-03
```

`minutes_document_id`, `homologated_at` e `homologated_by` nulos no lote 0001; nos lotes 0002 e 0003
`homologated_at` = o `drawn_at` e `homologated_by` = Karina (`…0000b0000011`, presidente).
`opened_by` = Elisa (`…0000b0000005`, secretaria) nos três.

```text
inf.rait_batch_item  (T-CLAIM = 2 dias úteis de drawn_at, calendar-2026.json)
id             batch_id        case_id                position  member_id              claim_due_on  aceite / recusa
-------------  --------------  ---------------------  --------  ---------------------  ------------  ----------------------------
…000024010001  …000024000001   …000010000018 (18)     1         null                   null          lote ainda aberto
…000024010002  …000024000002   …000010000019 (19)     1         …000021000009 (Iara)   2026-09-11    sem aceite (T-CLAIM vencido)
…000024010003  …000024000002   …000010000011 (11)     2         …000021000009 (Iara)   2026-09-11    declined_at 2026-09-10,
                                                                                                     decline_kind 'impedimento'
…000024010004  …000024000003   …000010000012 (12)     1         …000021000009 (Iara)   2026-09-04    accepted_at 2026-09-03
```

O item `…000024010003` é coerente com a fixture de impedimento que já existe (Iara impedida no caso
11, `…000023000001`) e com o relator efetivo do caso 11 ser Heitor: o lote sorteou Iara, ela
declarou impedimento e a redistribuição levou ao próximo da ordem. O item `…000024010002` cobre o
auto-laço L2 (T-CLAIM vencido sem aceite) sem que o lote saia de `LOTE_SORTEADO`.

```text
inf.rait_substitute_duty
id             session_id             member_id                    designated_at  convened_at
-------------  ---------------------  ---------------------------  -------------  -----------
…000026000001  …000030000002 (s. 02)  …000021000010 (João, sup.)   2026-09-08     2026-09-10
…000026000002  …000030000001 (s. 01)  …000021000010 (João, sup.)   2026-09-14     null
```

A primeira linha é o suplente designado por antecipação e **convocado** quando a banca da sessão 02
ficou insuficiente em `T-CONV` (regra (a) do §6); a segunda é o suplente já designado para a sessão
ordinária de 2026-09-24, ainda sem convocação.

```text
inf.rait_bench  (máquina b.3)
id             session_id             state                 confirmed_count  parity_observed  confirmed_at / insufficient_at
-------------  ---------------------  --------------------  ---------------  ---------------  ------------------------------
…000027000001  …000030000001 (s. 01)  BANCA_PREVISTA        0                null             —
…000027000002  …000030000003 (s. 03)  BANCA_CONFIRMADA      3                null             confirmed_at 2026-09-03
…000027000003  …000030000002 (s. 02)  BANCA_INSUFICIENTE    2                null             insufficient_at 2026-09-10
…000027000004  …000030000004 (s. 04)  BANCA_CONFIRMADA      3                true             confirmed_at 2026-09-14
```

`confirmed_count` da banca 0002 é o `quorum_observed` da sessão 03 e o da 0004 o da sessão 04
(CETRAN), a única com `parity_observed` (Res. 901/2022 Anexo 12.2, flag
`session.quorum.cetran_parity`). `parity_observed` nulo nas de JARI porque a Res. 357 não exige
paridade. A banca 0003 tem `confirmed_count = 2` contra `quorum_required = 3` da sessão 02 e
`insufficient_at = 2026-09-10`, que é o `T-CONV` (5 dias úteis, `rait.timer.T-CONV`) da sessão de
2026-09-17 — é o par exato de `RAIT.BENCH_INSUFFICIENT` (`confirmed`, `required`). A banca 0001 está
em `BANCA_PREVISTA` para a sessão 01, cuja pauta ainda está em formação: o diagrama do §6 põe a
banca em `BANCA_PREVISTA` **no** fechamento da pauta, e a fixture antecipa a composição prevista
(titulares escalados + suplente de plantão) sem nenhuma confirmação — é o estado inicial da máquina,
não uma violação de B0.

```text
inf.rait_pending_content  (UC-RAIT-028)
id             case_id                due_on       outcome        closed_at     missing_items
-------------  ---------------------  -----------  -------------  ------------  -------------------------
…000013000001  …000010000001 (01)     2026-09-24   null           null          ["copia_cnh"]
…000013000002  …000010000002 (02)     2026-09-18   atendida       2026-09-12    ["comprovante_endereco"]
…000013000003  …000010000003 (03)     2026-09-10   nao_atendida   2026-09-11    ["copia_cnh"]
```

A pendência aberta é a do caso 01 (protocolado hoje, canal postal); só uma por caso pode estar
aberta (`ux_inf_rait_pending_content_open`). A do caso 03 cobre o fluxo 2a (peça vai à triagem no
estado em que está; o não conhecimento foi por intempestividade, nunca por documento faltante).
`opened_by` = Elisa nas três.

```text
inf.rait_redirect  (UC-RAIT-027)
id             direction  reason                  case_id              deadline_restored  origin_protocolled_on
-------------  ---------  ----------------------  -------------------  -----------------  ---------------------
…000014000001  saida      outro_orgao_autuador    null                 false              null
…000014000002  entrada    orgao_incompetente      …000010000002 (02)   true               2026-09-02
```

Na saída, `protocol_number` = `RAIT-2026-R00001`, `ait_number` de outro órgão,
`counterpart_agency`/`counterpart_renainf_code` do órgão competente e `case_id` nulo (a peça não
gera caso aqui). Na entrada, o protocolo de origem de 2026-09-02 é o marco de tempestividade do
caso 02 (AC-RAIT-027-1) e `deadline_restored = true` registra a devolução de prazo
(AC-RAIT-027-2, [RN-RAIT-109]). `redirected_by` = Elisa nas duas.

```text
inf.rait_draft  (status da a.13)
id             case_id              version  status       author_id              return_count
-------------  -------------------  -------  -----------  ---------------------  ------------
…000015000001  …000010000007 (07)   1        rascunho     …0000b0000001 (Ana)    0
…000015000002  …000010000009 (09)   1        submetida    …0000b0000003 (Carla)  0
…000015000003  …000010000020 (20)   1        devolvida    …0000b0000001 (Ana)    1
…000015000004  …000010000010 (10)   1        assinada     …0000b0000003 (Carla)  0
```

`content_hash` = sha-256 fictício de 64 hex, como nas fixtures de `rait_document`; `document_id`
nulo (a fachada de documentos só nasce em TASK-0005/0007). A minuta `…000015000003` tem
`returned_at` e `return_guidance` preenchidos e `return_count = 1` — o teto do §4 passo 5. A
minuta `…000015000004` é a do caso 10, cuja decisão assinada já existe (`rait_decision
…000016000001`).

### e.5 O que o Inspector precisa cobrir além das fixtures

1. Os quatro conjuntos de check de estado (`ck_inf_rait_unit_state`, `ck_inf_rait_batch_state`,
   `ck_inf_rait_bench_state`, `ck_inf_rait_schedule_availability` e a variante do slot) — um teste
   por token e um token inválido por máquina.
2. Os checks de consistência do lote (`seed_required`, `draw_consistency`, `accept_consistency`) e
   do item (`decline_complete`, `outcome_exclusive`, `claim_needs_member`).
3. `ux_inf_rait_pool_instance_unit` e o novo `ux_inf_rait_pool_instance` parcial, com linhas
   efêmeras dentro do teste (padrão de `audit-persistence.integration.spec.ts`) — sem criar pool
   canônico novo.
4. `ux_inf_rait_batch_pool_week` (parcial): dois lotes `semanal` na mesma semana falham, dois
   `extraordinario` não.
5. `ux_inf_rait_pending_content_open` (parcial em `closed_at is null`).
6. RLS das 10 tabelas novas e a contagem de tabelas em
   `backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts`: o schema `inf` passa a
   ter **68** `create table` nos DDL (`grep -h 'create table if not exists inf\.'
backend/database/ddl/*.sql | wc -l`), 10 a mais que antes desta tarefa; no repositório inteiro,
   `pnpm verify:rls-ddl` vai de 141 para 151 tabelas de tenant. O número literal do `toHaveLength`
   é do Inspector (`MOD-inf-ait-rls-count`); esta tarefa não toca `tests/**`.
7. `ck_inf_rait_minutes_published_needs_signature` e
   `ck_inf_rait_session_short_notice_ack`.
8. `ck_inf_rait_draft_single_return` e `ck_inf_rait_agenda_item_view_complete`.

## f. Premissas `OD-*` carregadas

Todas `vigente` por steering H.54 e H.57 (Cédula 07 em bloco e Cédula 08: "premissas aprovadas agora
como vigentes"); os valores vivem em `ops.parameter` (ADR-0021), nunca em coluna.

```text
OD       premissa vigente usada como verdade                                  onde aparece neste contrato
-------  -------------------------------------------------------------------  -----------------------------------
OD-004   rait.wip.limit=45 e rait.wip.alert=60                                a.4 (wip_limit nulo = usa o
                                                                             parâmetro; 0 por ausência); b.4 D3
OD-005   rait.timer.T-CLAIM=2 dias úteis, T-VOTO=20 dias, T-CONV=5 dias       a.6 (claim_due_on); a.9
OD-112   úteis, T-ASS=5 dias úteis                                           (claim_due_at); b.2 L2; b.3 B2
OD-016   rait.priority.legal_bases = [{60+:1},{80+:2}] + PcD                  a.10 (legal_priority sem check);
                                                                             a.2 (priority_policy)
OD-008   rait.unit.queue_over_capacity_months=3                               b.1 U1 (gatilho de nova turma)
OD-101   session.calendar.ordinary_cadence=weekly                             a.6 (week_start, lote semanal);
                                                                             §c (lote por pool/semana)
OD-102   T-CONV mínimo e reconhecimento da convocação curta                   a.14 (short_notice_ack); b.3 B2
OD-103   session.view_request.enabled=true e max_per_member=1                 a.14 (view_requested_by/view_due_on);
                                                                             §c (sem índice único — ADR-0021)
OD-106   session.modality.virtual_enabled=true                                a.14 (modality)
OD-104   session.late_opinion.escalation (advertido → afastado temporário)     b.4 D6 (sai para a máquina de
                                                                             accountability de WF-RAIT-002 §5)
OD-204   session.quorum.cetran_parity=true                                    a.8 (parity_observed); b.3 B1
OD-013   roteamento por circunscrição + escala semanal mantido; relação das    a.3 (jurisdiction sem check);
H.48     55 autoridades pedida por carta; rait.signing.schedule pendente      e.2 (jurisdiction nula)
OD-019   rait.warning.same_machine=true (advertência do art. 267 na mesma      nenhuma coluna nova — registrado
         máquina)                                                             por completude
```

Nenhum valor de prazo, papel, estado, código de erro, rótulo ou parâmetro foi criado fora destas
fontes.

## g. Lacunas e decisões de modelagem reportadas (não editadas)

1. **Vocabulário de turno não existe.** [WF-RAIT-004] §3 diz "dias/turnos" e "8h-14h" para o
   balcão, mas não fixa tokens de turno. `rait_schedule_slot` ficou com grão de **dia**
   (`slot_on`), coerente com `RAIT.SCHEDULE_NO_DUTY_MEMBER`, que informa `date`. Decisão pedida:
   fixar o vocabulário de turno (e então `shift` entra em v1.2.0) ou aceitar o grão de dia.
2. **Prazo da pendência de conteúdo sem chave de parâmetro.** [UC-RAIT-028] fluxo 1 propõe 10 dias;
   `parameter-catalogue.md` não tem chave para ele (tem `rait.timer.T-DIL.default`, que é
   diligência). `rait_pending_content.due_on` guarda a data; o prazo não virou default. Decisão
   pedida: criar `rait.timer.T-PEND` (ou equivalente) no catálogo — rodada dona de
   `docs/framework/arch/**`.
3. **`jurisdiction` sem fixture.** Nenhuma autoridade signatária das fixtures é membro de pool
   (Fábio e Gabriela não têm linha em `rait_pool_member`, `rait-fixtures.md` §1), então a primeira
   fixture de circunscrição depende da relação pedida por carta (H.48) ou de um membro novo — o que
   a regra 5 do prompt proíbe criar aqui.
4. **"Plantão de secretaria de sessão" ficou sem entidade.** É a sétima linha da tabela do §3 e o
   prompt não a atribui a nenhuma entidade; `rait_schedule.kind` não a inclui porque é por sessão,
   não por período. Decisão pedida: modelar em TASK-0005 (organização) ou aceitar que a secretaria
   da sessão saia de `rait_attendance`.
5. **Inversão de UC no prompt.** `rait_pending_content` é [UC-RAIT-028] e `rait_redirect` é
   [UC-RAIT-027]; o prompt troca os dois. As `description` seguem os arquivos-fonte (a.11).
6. **Prefixos de fixture colidem com entidades existentes** em seis dos oito casos — §e.3. Sem
   efeito no banco, com efeito na legibilidade; faixas livres listadas lá.
7. **`rait_distribution_batch` × `rait_batch`.** [WF-RAIT-004] §10 propõe o nome
   `rait_distribution_batch` e `rait_session.bench_state` + `rait_attendance.on_call_substitute`;
   esta tarefa fixou `rait_batch`/`rait_batch_item` e as entidades próprias `rait_bench` e
   `rait_substitute_duty` (prompt de TASK-0004). O §10 do workflow é uma proposta ao Architect, e a
   divergência de nome fica registrada para que TASK-0008 não a leia como defeito.
8. **`ux_inf_rait_impediment` não distingue espécie.** Com `kind`, um membro que declarasse
   impedimento e depois suspeição no mesmo caso precisaria de duas linhas e o índice único as
   recusa. Mantido como está (AC-RAIT-011-3 fala de uma declaração por membro e caso); se a
   distinção passar a ser exigida, o índice muda em v1.2.0.
