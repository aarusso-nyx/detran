---
id: ARCH-RAIT-FIXTURES
title: Fixtures canônicas do RAIT — personas, tenant, casos por estado, sessões, relógios e calendário
status: draft
apps: [rait, teat]
updated: 2026-09-16
---

# Fixtures canônicas

Dataset único para testes de todos os tiers e para o desenvolvimento do console. Vive em três
formas sincronizadas: SQL idempotente (`backend/database/seed/*.sql`, aplicado por
`backend/database/seed.sh` depois de `apply.sh`), JSON para o frontend e testes unitários
(`./fixtures/rait-fixtures.json`) e o calendário de referência (`./fixtures/calendar-2026.json`).
"Hoje" das fixtures é **2026-09-14** (segunda-feira); fuso `America/Manaus`.

Regras: ids fixos e legíveis (`00000000-0000-7000-8000-<prefixo><nnnn>`); um registro por
estado/persona; nada de dados reais; testes que precisam de variação derivam da fixture com
`override` nomeado. Alterar uma fixture é mudança de contrato de teste (PR próprio).

## 1. Tenant e personas

Tenant `00000000-0000-7000-8000-00000000a001` (`am-fixtures`). Usuários
`00000000-0000-4000-8000-0000b000NNNN`; membros de pool `…-000021000NNN`.

| NN  | Pessoa         | Papel                        | Membro de pool (id …2100NNNN) | Uso típico                              |
| --- | -------------- | ---------------------------- | ----------------------------- | --------------------------------------- |
| 01  | Ana Lima       | `rait-analyst`               | 0001 (defesa, analista)       | puxar próximo, triagem, minuta          |
| 02  | Bruno Souza    | `rait-analyst`               | 0002                          | diligência aberta (caso 08)             |
| 03  | Carla Mendes   | `rait-analyst`               | 0003                          | minuta pronta (caso 09)                 |
| 04  | Diego Farias   | `rait-coordinator` + analyst | 0004 (coordenador)            | escala, reatribuição, qualidade         |
| 05  | Elisa Rocha    | `rait-secretary`             | 0005 (defesa), 0015 (JARI)    | intake, remessa, sorteio, ata           |
| 06  | Fábio Nogueira | `rait-signing-authority`     | —                             | decidir defesa (caso 09)                |
| 07  | Gabriela Prado | `rait-central-authority`     | —                             | provimento a avaliar (caso 13)          |
| 08  | Heitor Braga   | `rait-rapporteur` (JARI)     | 0008                          | relator dos casos 11, 18                |
| 09  | Iara Castro    | `rait-rapporteur` (JARI)     | 0009                          | impedida no caso 11; relatora do 12, 19 |
| 10  | João Freitas   | `rait-rapporteur` (JARI)     | 0010 (`ADVERTIDO`, 2 atrasos) | suplente; teste de advertência          |
| 11  | Karina Duarte  | `rait-chair` (JARI)          | 0011 (presidente)             | pauta, sessão, ata, jeton               |
| 12  | Lucas Amorim   | `rait-manager`               | —                             | radar, incidentes, turmas               |
| 13  | Marta Vieira   | `rait-hr`                    | —                             | mandatos                                |
| 14  | Nilo Barros    | `rait-finance`               | —                             | financeiro                              |
| 15  | Olívia Ramos   | `AUDITOR`                    | —                             | trilha, exportações                     |
| 16  | Paulo Teixeira | `agency-admin`               | —                             | parâmetros, calendário                  |
| 17  | Quitéria Alves | `integration-operator`       | —                             | integrações                             |
| 18  | Rafael Cunha   | `rait-chair` (CETRAN)        | 0018 (presidente)             | sessão CETRAN aberta                    |
| 19  | Sônia Queiroz  | `rait-rapporteur` (CETRAN)   | 0019                          | relatora do caso 17                     |
| 20  | Tiago Melo     | `rait-rapporteur` (CETRAN)   | 0020                          | quorum CETRAN                           |

Pools: `…20000001` defesa_previa (`pull`), `…20000002` JARI-AM (`round_robin`), `…20000003`
CETRAN-AM (`round_robin`). Mandatos dos colegiados: 2025-01-01 a 2026-12-31.

## 2. AITs e catálogo normativo

Catálogo `…e0000001` com dois enquadramentos: `…e1000001` (CTB art. 218 II, velocidade, grave) e
`…e1000002` (art. 181 XVII, estacionamento, média, sem abordagem). Vinte AITs
`…f000NNNN` (`AM-2026-0000NN`), todos `INTEGRADO`, ímpares com abordagem (velocidade), pares sem.

## 3. Casos (`…1000NNNN`, protocolo `RAIT-2026-0000NN`) — um por estado

| NN  | Instância     | Estado                    | Responsável      | Particularidades                                                                        |
| --- | ------------- | ------------------------- | ---------------- | --------------------------------------------------------------------------------------- |
| 01  | defesa_previa | `PROTOCOLADO`             | —                | protocolado hoje, canal postal                                                          |
| 02  | defesa_previa | `TRIAGEM_ADMISSIBILIDADE` | —                | —                                                                                       |
| 03  | defesa_previa | `NAO_CONHECIDO`           | —                | intempestivo, `archived=true`, admissibilidade com tempestividade `false`               |
| 04  | defesa_previa | `ADMITIDO`                | —                | elegível para "puxar próximo"                                                           |
| 05  | jari          | `AGUARDANDO_REMESSA_JARI` | —                | efeito suspensivo; `T-REM10` vence 2026-09-18                                           |
| 06  | defesa_previa | `DISTRIBUIDO`             | Ana              | —                                                                                       |
| 07  | defesa_previa | `EM_INSTRUCAO`            | Ana              | trilha de eventos completa; relógio A `SEM_RISCO`                                       |
| 08  | defesa_previa | `DILIGENCIA`              | Bruno            | diligência ao órgão autuador, `T-DIL` (dias úteis) vence 2026-09-23                     |
| 09  | defesa_previa | `PRONTO_P_DECISAO`        | Carla            | aguarda assinatura de Fábio                                                             |
| 10  | defesa_previa | `DECIDIDO_AUTORIDADE`     | —                | decisão `indeferida` assinada PAdES por Fábio, ainda não comunicada                     |
| 11  | jari          | `PAUTADO`                 | Heitor           | item da sessão 02 com parecer `provimento`; Iara impedida                               |
| 12  | jari          | `JULGADO_SESSAO`          | Iara (concluído) | proclamado `provido` na sessão 03                                                       |
| 13  | jari          | `COMUNICADO`              | —                | `provido` publicado 2026-09-01 por SNE; `T-R2` vence 2026-10-01 (autoridade central)    |
| 14  | defesa_previa | `TRANSITADO`              | —                | indeferida, comunicada postal, transitada                                               |
| 15  | jari          | `REMETIDO_2A_INSTANCIA`   | —                | `negado` na sessão 03; origem do caso 17                                                |
| 16  | defesa_previa | `ENCERRADO_DESISTENCIA`   | —                | —                                                                                       |
| 17  | cetran        | `ADMITIDO`                | Sônia            | `origin_case_id` = 15; recebido pelo CETRAN 2026-08-20; `T-JUL-24M` até 2028-08-21      |
| 18  | jari          | `EM_INSTRUCAO`            | Heitor           | relógio B `CRITICO` (teto 2026-10-30), alertas N3 e CRÍTICO ao presidente; relógio C N1 |
| 19  | jari          | `EM_INSTRUCAO`            | Iara             | relógio B `PRESCRITO_OPERACIONAL` (teto 2026-09-01), incidente `INC-2026-0007`          |
| 20  | defesa_previa | `EM_INSTRUCAO`            | Ana              | relógio A `ALERTA_N2` (`T-DEC` 2026-12-28), alerta ao coordenador                       |

Todos os casos têm um requerente (`proprietario`, CPF fictício) e um documento `requerimento`.

## 4. Sessões (`…3000000N`) e itens de pauta (`…3100000N`)

| N   | Órgão  | Estado           | Data       | Conteúdo                                                                                                                                                |
| --- | ------ | ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | jari   | `FORMANDO_PAUTA` | 2026-09-24 | vazia (montagem de pauta)                                                                                                                               |
| 2   | jari   | `PAUTA_FECHADA`  | 2026-09-17 | item 1 = caso 11 (prioritário, parecer registrado)                                                                                                      |
| 3   | jari   | `ATA_ASSINADA`   | 2026-09-03 | itens: caso 12 (`provido`), caso 15 (`negado`); presenças Heitor, Iara, Karina (presidente), João ausente justificado; 4 votos; ata assinada por Karina |
| 4   | cetran | `SESSAO_ABERTA`  | 2026-09-14 | quorum 2/3 observado; Rafael preside; sem itens (teste de abertura e votação)                                                                           |

## 5. Relógios e alertas

Ver tabela de casos (07, 17, 18, 19, 20). Os alertas `…2500000N` cobrem `ALERTA_N2`
(coordenador), `ALERTA_N3` e `CRITICO` (presidente) e `PRESCRITO_OPERACIONAL` (gestor, com
`incident_ref`).

## 6. Calendário de referência (`fixtures/calendar-2026.json`)

Feriados nacionais 2026, pontos facultativos, feriado estadual (05/09) e municipais de Manaus
(24/10, 08/12). É referência de teste; o calendário oficial é parâmetro do `agency-admin`
(`/admin/calendario`, WP-A cria `rait_holiday`).

## 7. Como usar

```bash
DB_NAME=detran_dev pnpm backend:db:reset          # DDL completo (00…60 + RLS)
bash backend/database/seed.sh                     # fixtures (idempotente)
```

Testes `integration`/`e2e` assumem a seed aplicada; testes `unit` e do frontend importam
`docs/framework/arch/fixtures/rait-fixtures.json`. Para tenant de isolamento em testes de RLS,
crie um segundo tenant efêmero com `randomUUID()` (padrão de `audit-persistence.integration.spec.ts`);
nunca altere o tenant das fixtures.

## 8. O que passou a existir (WP-A, R-0006) e o que ainda falta

Infração (agregado, `30-fixtures-infraction.sql`: `infraction`, `infraction_timer`,
`infraction_event`, avisos `inf.notice*`), escala/plantão/lote de sorteio/turma
(`20-fixtures-rait.sql`: `rait_schedule`/`rait_schedule_slot`, `rait_substitute_duty`,
`rait_batch`/`rait_batch_item`, `rait_unit`), organização (`40-fixtures-rait-org.sql`:
`rait_holiday`, `rait_suspension_act`, `rait_jeton_sheet`/`rait_jeton_line`, `rait_incident`,
`rait_quality_sample`, `rait_capacity_plan`, `rait_export`), financeiro
(`50-fixtures-collection.sql`: `collection_document`, `payment`, `refund_order`, `debt_handoff`)
e integração (`60-fixtures-rait-integration.sql`: `rait_reconciliation`) já têm fixture por
estado. Parâmetros versionados passaram a `ops.parameter` (ADR-0021, R-0004), fora do escopo de
fixtures por estado do RAIT. Fica fora: projeção da `integration.outbox` por sistema — deferida a
WP-P (ADR-0020, M10).

## 9. TEAT — campo, sincronização, evidência, medidas e alcoolemia (R-0008, `plan.md` M20)

Mesmo tenant `…a001`; órgão `traffic_agency_id` `00000000-0000-7000-8000-0000e2000001`, unidade
`agency_unit` `…e2100001`. Ids copiados de `backend/database/seed/25…28-fixtures-teat*.sql`;
nada abaixo é inventado — onde a fonte não fixa um valor, a própria seed marca `source_pending`
(comentado linha a linha nos arquivos).

**Agente.** `ops.ops_agent_profile` reaproveita, por constrição de M20 (a fixture de
`numbering_reservation.agent_id` já existia em R-0005), o mesmo id de usuário que o RAIT usa para
Ana Lima (`00000000-0000-4000-8000-0000b0000001`, `00-fixtures-core.sql`): `id = user_ref =
…b0000001`, matrícula `MAT-000001`, `functional_status='active'` — persona TEAT field-agent, não
uma pessoa nova. `…b0000002` (Bruno Souza) é o perfil `inactive` (bloqueador `AGENT_NOT_ACTIVE`).

**Dispositivos** (`ops.ops_operational_device`): `…e4000001` (só em `10-fixtures-inf-ait.sql`,
**sem** linha em `ops_operational_device` de propósito — caso negativo de
`TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH`), `…e4000002` `authorized` (app `1.0.0`), `…e4000003`
`blocked`, `…e4000004` `authorized` com `tamper_flag=true`.

**Homologação/versão** (`ops.ops_homologation`/`ops_application_version`): `…e2200001` vigente
(`laudo_valido_ate` 2029-12-31), `…e2200002` com laudo vencido (`laudo_valido_ate` 2025-12-31,
`status` ainda `active` — produz o aviso `HOMOLOGATION_RENEWAL_DUE`, H.55, nunca o bloqueador);
`…e2300001` = `1.0.0` `active`. Catálogo do bootstrap: equipe `…e2400001`, viatura `…e2500001`,
operação `…e2600001`, etilômetro `…e2700001` (`ops_measurement_instrument`, `approved`).

**Turnos e handoff** (`ops.ops_shift`): `…e3000001` aberto no dispositivo `…e4000002` (é o
`shift_id` que as reservas de numeração abaixo apontam), `…e3000002` fechado. Handoff
`…e3100001`: agente sai do dispositivo com falha `…e4000003` para o `…e4000002` (AC-TEAT-012-4).

**Numeração** (`ops.ait_numbering_range`/`numbering_reservation`): faixa `…e5000001` (série `F`,
`2026000001…2026001000`); reservas `…e6000001` `reserved`, `…e6000002` `consumed`, `…e6000003`
`expired`, `…e6000004` `cancelled`. Consumo aplicado `…ec100001` (número `2026000002`, o da
reserva `…e6000002`) prova que um número aplicado nunca é reatribuído.

**Sincronização** (`ops.sync_batch`/`sync_queue_item`/`sync_receipt`/`sync_conflict`): lote
`…e8000001` (`device_batch_id='batch-001'`, `batch_sequence=1`, fixa `expectedSequence=2` para os
testes de replay/gap); item `…e9000001` aplicado (`idempotency_key='item-001'`, recibo
`…ea100001` `applied`); item `…e9000002` legado sem chave estável
(`legacy:<device_id>:<local_entity_id>`, nunca aplicado, `TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED`) e
alvo do conflito de concorrência `…eb100001` (`allowed_resolution_actions=['manual_review']`).

**AITs** (`inf.ait_ait`, `…f800NNNN`, `TEAT-NNN`): um AIT por token de `inf.ait_state_ref`
([WF-TEAT-001]) gerado a partir do AIT base `…f0000001` (`10-fixtures-inf-ait.sql`) — a seleção
pela tabela de referência faz a fixture falhar fechada se o vocabulário não estiver aplicado.

**Evidência/custódia** (`ops.evidence_evidence` e correlatas): `…ef000001` bodycam `validated`
(ligada ao AIT `INTEGRADO` `…f0000001` por `evidence_link` `…ef200001`, `role='bodycam'`); conteúdo
restrito por [RN-TEAT-142] a quem tiver `evidence_access_request` `delivered`. `…ef000002` foto
`pending_upload` (intenção `…ef100001`, vencida). `…ef000003` foto `uploaded` (intenção
`…ef100002`, vigente). `…ef000004` `quarantined`. Pedidos de acesso: `…ef400001` `requested`
(magistrado), `…ef400002` `approved` (ministério público, decidido por `…b0000006` Fábio
Nogueira), pronto para `deliver`.

**Medidas** (`inf.administrative_measure`, `…ed0000nn`): doze linhas, uma por token do check de
[WF-TEAT-004] (`RETIDO` … `LEILAO`), todas do AIT `…f0000001`, agente `…b0000001`, turno
`…e3000001`, dispositivo `…e4000002`; `measure_type` (`…ec000001`…`…ec000004`: retenção, remoção,
recolhimento de CNH, recolhimento de CRLV — rol do art. 269 `source_pending` além destas quatro,
OD-T44); `tow_provider`/`yard` um ativo e um inativo cada.

**Alcoolemia** (`inf.alcohol_procedure`, `…ee0000nn`): quinze linhas, uma por token de
[WF-TEAT-005] (`ABORDAGEM` … `SEM_AUTUACAO_ALCOOLEMIA`), `outcome=''` em todas (coluna `not
null`, nenhum token "sem desfecho" definido, CTG-0004 §14 item 13); encaminhamento
`…ee100001` já registrado para o caso `RESULTADO_CRIME` (`…ee000007`). Etilômetros
`inf.alcohol_breathalyzer`: `…ea000001` verificação vigente, `…ea000002` vencida. Tabela
metrológica `inf.normative_metrological_table` `…eb000001`: formato fixado em CTG-0004 §3.1,
limiares normativos ([RN-TEAT-133]), `tolerance` (valores de `max_error`) `source_pending` (Anexo
I da Res. CONTRAN 432 não capturado em `docs/reference`).

**Velocidade** (atrás de `teat.speed_meters`): medidor `inf.speed_meter` `…ef900001`, certificado
vigente `inf.speed_meter_certificate` `…efa00001` (a versão vencida é criada por `override` no
teste, nunca por segunda fixture).

Arquivos: `26-fixtures-teat-field.sql` (campo/turno/numeração/sincronização), reutiliza sem copiar
o que `25-fixtures-teat.sql` semeia (dispositivos, faixa, reservas, pacote normativo `…e7000001`);
`27-fixtures-teat-evidence.sql` (evidência/custódia/snapshots/catálogo normativo);
`28-fixtures-teat-measures-alcohol.sql` (medidas/alcoolemia/velocidade).
