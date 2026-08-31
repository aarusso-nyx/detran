---
id: PORTING-CHECKLIST
title: Checklist de absorção — origem × base de conhecimento × monorepo
status: draft
apps: [teat, rait, boat, pec, portal, dashboard]
sources: []
updated: 2026-08-31
---

Inspeção de três vias, feita em 2026-08-31, para dar consciência situacional do porte e servir de
checklist de progresso. Cada linha responde à mesma pergunta em três lugares:

| Coluna           | O que significa                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| **(a) Origem**   | existe nos repositórios-fonte `teat`, `pec`, `senatran` — código e schema reais                               |
| **(b) KB**       | existe neste repositório como especificação consumível: caso de uso e/ou workflow dedicado, não apenas menção |
| **(c) Monorepo** | existe em `aarusso-nyx/detran` como schema, módulo e contrato                                                 |

**Legenda:** ✅ completo · ◐ parcial · ✗ ausente · — não se aplica (não há origem)

**Como reconferir os números.** Tabelas por schema: `grep -ohiE 'create table (if not exists )?[a-z_]+\.[a-z_]+' <ddl>/*.sql`.
Pacotes de domínio: `ls domain/` em `teat` e `pec`, `ls backend/domains/*/` em `detran`.

## Placar

| Origem                | Unidade                | Total | Absorvido  | Situação                                                  |
| --------------------- | ---------------------- | ----- | ---------- | --------------------------------------------------------- |
| **teat**              | tabelas                | 79    | 49         | ◐ 62% — falta offline, agency, auditgov, crash, reporting |
| **pec**               | tabelas (schema `pec`) | 30    | 0          | ✗ domínio `ch` vazio                                      |
| **senatran**          | domínios               | 14    | 14         | ✅ 100%, paridade exata                                   |
| **novo (sem origem)** | RAIT · speed           | —     | 24 tabelas | ✅ construído a partir da KB                              |
| **frontends**         | apps                   | 8     | 0          | ✗ todos são stubs de 1 arquivo                            |

---

## A. Domínio `inf` — infrações (origem: teat; app novo: RAIT)

| Módulo / feature                                | (a) Origem         | (b) KB                                               | (c) Monorepo                                                    | Próxima ação                                                                                  |
| ----------------------------------------------- | ------------------ | ---------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Ciclo de vida do AIT                            | ✅ `ait` 7 tabelas | ✅ UC-TEAT-001/002/004/006/011, WF-TEAT-001          | ✅ `inf/ait` 7 tabelas, BP-INF-AIT-001                          | —                                                                                             |
| Alcoolemia                                      | ✅ `alcohol` 6     | ✅ UC-TEAT-007, WF-TEAT-005                          | ✅ `inf/alcohol` 6                                              | —                                                                                             |
| Medidas administrativas                         | ✅ `measures` 9    | ✅ UC-TEAT-008/009, WF-TEAT-004                      | ✅ `inf/measures` 9                                             | —                                                                                             |
| Catálogo normativo                              | ✅ `normative` 6   | ✅ WF-TEAT-003                                       | ✅ `inf/normative` 6                                            | —                                                                                             |
| **Sincronização offline + faixas de numeração** | ✅ `offline` 6     | ✅ UC-TEAT-005/012, WF-TEAT-002                      | ✗ **nenhuma tabela**                                            | **maior lacuna do `inf`** — é o que torna o talão utilizável em campo                         |
| **Agência / circunscrição / convênio**          | ✅ `agency` 8      | ◐ só regra ([RN-TEAT-104], [RN-TEAT-143]), sem UC/WF | ✗                                                               | decidir: porta, ou resolve por `auth`/tenancy do kernel                                       |
| **Auditoria de governança** (export, incidente) | ✅ `auditgov` 3    | ✗                                                    | ✗ (kernel tem `audit.events`, conceito distinto)                | decidir escopo — export de dados e incidente de segurança não são a trilha de auditoria comum |
| Integração / lotes                              | ✅ `integration` 5 | ◐ referências dispersas                              | ◐ `integration.outbox` + `senatran-adapter` (desenho diferente) | confirmar que o novo desenho substitui, e registrar a decisão                                 |
| Medidor de velocidade acoplado                  | — sem origem       | ✅ UC-TEAT-013                                       | ✅ `inf/speed` 3, BP-INF-SPEED-001                              | levantar parque de medidores (DT-063)                                                         |
| **RAIT — recursos administrativos**             | — app novo         | ✅ 12 UC, 3 WF, 43 RN, IU-RAIT-001                   | ✅ `rait-case` 9 · `rait-worklist` 6 · `rait-session` 6         | frontend; runtime `@stynx-nyx/worklist` não publicado                                         |

## B. Domínio `ops` — operação de campo (origem: teat, transversal)

| Módulo / feature                        | (a) Origem       | (b) KB                                        | (c) Monorepo         | Próxima ação                                             |
| --------------------------------------- | ---------------- | --------------------------------------------- | -------------------- | -------------------------------------------------------- |
| Turno, equipe, dispositivo, homologação | ✅ `ops` 11      | ◐ pré-condições em UC-TEAT-001, [RN-TEAT-117] | ✅ `ops` 11 tabelas  | —                                                        |
| Cadeia de custódia de evidência         | ✅ `evidence` 5  | ✅ UC-TEAT-003, UC-TEAT-010                   | ✅ `ops` evidence 5  | —                                                        |
| Snapshots externos (consulta veicular)  | ✅ `snapshots` 5 | ◐ citado em UC-TEAT-002, sem UC próprio       | ✅ `ops` snapshots 5 | schema portado; a regra de uso ([RN-BOAT-107]) merece UC |

## C. Domínio `est` — sinistros (origem: teat `crash`; app: BOAT)

| Módulo / feature                | (a) Origem                         | (b) KB                                         | (c) Monorepo              | Próxima ação                                                                      |
| ------------------------------- | ---------------------------------- | ---------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------- |
| Registro de sinistro            | ✅ `crash_record`                  | ✅ UC-BOAT-001/005, WF-BOAT-001                | ✗ **`est` tem 0 tabelas** | Fase 5                                                                            |
| Veículos e pessoas envolvidas   | ✅ `crash_vehicle`, `crash_person` | ✅ UC-BOAT-002                                 | ✗                         | Fase 5                                                                            |
| Vítimas e dado de saúde         | ✅ `crash_victim`                  | ✅ UC-BOAT-003 + bloco LGPD [RN-BOAT-122..132] | ✗                         | **não implantar sem** base legal publicada (DT-047) e prazos de retenção (DT-049) |
| Croqui                          | ✅ `crash_sketch`                  | ✅ UC-BOAT-004                                 | ✗                         | Fase 5                                                                            |
| Condutas de cena 176/177/178    | ✗ (origem tinha só `evaded`)       | ✅ UC-BOAT-007, [RN-BOAT-114..117]             | ✗                         | **refinamento que a KB acrescenta à origem** — não portar o booleano              |
| Cascata de validação RENAEST    | ◐ via integração                   | ✅ WF-BOAT-003, UC-BOAT-009/011                | ✗                         | depende dos Manuais RENAEST (DT-061)                                              |
| Danos materiais e testemunhas   | ✗                                  | ✅ UC-BOAT-012                                 | ✗                         | novo, sem precedente na origem                                                    |
| Direitos do titular sobre o BAT | ✗                                  | ✗ **sem UC** — só [RN-BOAT-126] e tela W-05    | ✗                         | lacuna conhecida: candidato a UC-BOAT-013                                         |

## D. Domínio `ch` — habilitação (origem: pec) — **nada absorvido**

O `pec` tem 31 pacotes de domínio e 30 tabelas no schema `pec`. O domínio `ch` do monorepo está
vazio. A KB cobre o núcleo clínico; vários módulos da origem **não têm caso de uso**.

| Módulo / feature                                | (a) Origem                                          | (b) KB                                | (c) Monorepo | Próxima ação                                                                   |
| ----------------------------------------------- | --------------------------------------------------- | ------------------------------------- | ------------ | ------------------------------------------------------------------------------ |
| Encounter clínico                               | ✅ `encounters`                                     | ✅ UC-PEC-002, WF-PEC-001             | ✗            | Fase 6                                                                         |
| Exames médico e psicológico                     | ✅ `exams_medical`, `exams_psych`                   | ✅ UC-PEC-006, [RN-PEC-104]           | ✗            | Fase 6                                                                         |
| Laudo e assinatura PAdES                        | ✅ `reports`, `report_addenda`                      | ✅ UC-PEC-006/007                     | ✗            | Fase 6                                                                         |
| Juntas (3 instâncias)                           | ✅ `junta_*` 4 tabelas                              | ✅ UC-PEC-004/005/010                 | ✗            | **divergência conhecida**: o construído não implementa a 3ª instância (DT-025) |
| Biometria                                       | ✅ `biometric_*` 3                                  | ✅ UC-PEC-003, [RN-PEC-130/131]       | ✗            | Fase 6                                                                         |
| Agendamento                                     | ✅ `appointments`, `professional_schedules`         | ✅ WF-PEC-003                         | ✗            | Fase 6                                                                         |
| Transmissão RENACH                              | ✅ `renach_outbox/inbox/acks`                       | ✅ UC-PEC-009                         | ✗            | Fase 6                                                                         |
| Restrições / resultado                          | ✅ `encounter_restrictions`, `restriction_codes`    | ✅ UC-PEC-011                         | ✗            | Anexo XV não capturado                                                         |
| Distribuição entre clínicas                     | ✗ (escolha livre hoje)                              | ✅ UC-PEC-013, WF-PEC-004             | ✗            | **KB corrige a origem** — depende de DT-021                                    |
| Retenção de prontuário                          | ◐ `archive-runtime`                                 | ✅ UC-PEC-014                         | ✗            | depende de DT-023                                                              |
| Toxicológico periódico                          | ◐ `integration-toxicology`                          | ◐ UC-PEC-012 é **stub** por decisão   | ✗            | depende de DT-024                                                              |
| **Faturamento**                                 | ✅ `billing_*` 3                                    | ✗ **sem UC**                          | ✗            | **defeito conhecido** (DT-100): preço indexado errado — não portar como está   |
| **Telessaúde**                                  | ✅ `telehealth_sessions`                            | ✗ sem UC                              | ✗            | decidir escopo                                                                 |
| **Inconsistências / qualidade**                 | ✅ `inconsistencies`                                | ✗ sem UC                              | ✗            | decidir escopo                                                                 |
| **Reclamações**                                 | ✅ `complaints`                                     | ✗ sem UC (a ouvidoria vive no PORTAL) | ✗            | provável fusão com [UC-PORTAL-016]                                             |
| **Bloqueios de processo**                       | ✅ `process_blocks`                                 | ✗ sem UC                              | ✗            | citado em [RN-PEC-006]; falta modelagem                                        |
| **Credenciamento de clínicas/profissionais**    | ✅ `admin-clinics`, `admin-professionals`           | ◐ só tela R-05 de [IU-PEC-001]        | ✗            | alimenta o pool de UC-PEC-013                                                  |
| **Controles clínicos / registros operacionais** | ✅ `clinical_control_events`, `operational_records` | ✗ sem UC                              | ✗            | decidir escopo                                                                 |
| **Parâmetros e dados mestres**                  | ✅ `admin-*` 4 pacotes                              | ✗ sem UC                              | ✗            | provável kernel/config                                                         |

## E. Transversais — PORTAL e DASHBOARD (greenfield, sem origem)

| App       | (a) Origem                   | (b) KB                                          | (c) Monorepo        | Próxima ação                                           |
| --------- | ---------------------------- | ----------------------------------------------- | ------------------- | ------------------------------------------------------ |
| PORTAL    | —                            | ✅ 19 UC, 4 WF, 28 RN, IU-PORTAL-001 (27 telas) | ✗ `portal` vazio    | Fase 4; depende de gov.br e portaria estadual (DT-050) |
| DASHBOARD | ◐ `teat/reporting` 3 tabelas | ✅ 8 UC, 3 WF, 31 RN, IU-DASH-001 (9 painéis)   | ✗ `dashboard` vazio | camada derivada — construir depois das fontes          |

## F. Fronteira nacional — SENATRAN

| Item                      | (a) Origem     | (b) KB         | (c) Monorepo                               | Situação     |
| ------------------------- | -------------- | -------------- | ------------------------------------------ | ------------ |
| Mock nacional             | ✅ 14 domínios | ◐ referenciado | ✅ **14/14, paridade exata**               | ✅ concluído |
| Adapter (fronteira única) | —              | ✅ ADR-0003    | ✅ 6 portas, 114 ops, scanner de fronteira | ✅ concluído |

## G. Plataforma — runtime stynx

| Pacote                                         | Publicado? | Declarado em detran? | Consumidor previsto       |
| ---------------------------------------------- | ---------- | -------------------- | ------------------------- |
| `worklist`                                     | ✗          | ✗                    | RAIT — **espinha dorsal** |
| `jobs` · `outbox` · `notifications`            | ✗          | ✗                    | RAIT, PORTAL              |
| `mobile-runtime` · `offline-sync`              | ✗          | ✗                    | BOAT, TEAT mobile         |
| kernel (`auth`, `data`, `tenancy`, `audit`, …) | ✅         | ✅ 17 pacotes        | backend                   |

`STYNX_ENABLE_REGISTRY_PUBLISH=false` — **nenhum dos seis novos está declarado como dependência
em detran**. É o bloqueio P0 do registro de pendências (DT-001).

## H. Frontends

Os oito diretórios de `apps/` têm **1 arquivo cada** — são slots reservados, não aplicações.
`packages/ui` (@detran/ui) existe e está pronto para ser consumido.

---

## Ordem de absorção sugerida

1. **Desbloquear a plataforma** (DT-001) — sem os pacotes publicados, RAIT não sai do papel.
2. **Fechar o `inf`**: portar `offline` (6 tabelas) — sem sincronização e faixas de numeração o
   TEAT não opera em campo. Decidir `agency` e `auditgov`.
3. **Frontend do RAIT** — o backend está pronto e é o único que está.
4. **PORTAL** (Fase 4), **BOAT/est** (Fase 5), **PEC/ch** (Fase 6), **DASHBOARD** por último.
5. **Antes do PEC**, resolver os quatro defeitos conhecidos (DT-100..102, DT-025) — portar o
   faturamento como está seria portar o erro.

## Lacunas de especificação que este levantamento revelou

Módulos que existem na origem e **não têm caso de uso** na KB — é o inverso do que as seis rodadas
procuraram, e não havia sido medido:

- **pec**: faturamento, telessaúde, inconsistências, reclamações, bloqueios de processo, controles
  clínicos, registros operacionais, parâmetros e dados mestres
- **teat**: auditoria de governança (export de dados, incidente de segurança)
- **boat**: direitos do titular sobre o BAT ([RN-BOAT-126] sem UC)
