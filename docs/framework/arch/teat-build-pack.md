---
id: ARCH-TEAT-BUILD-PACK
title: Pacote de construção do TEAT — definições e pacotes de trabalho para a orquestra de agentes (backend unificado, mobile e web)
status: draft
apps: [teat]
updated: 2026-09-13
---

# Pacote de construção do TEAT

Índice das definições que amparam a orquestra na construção do TEAT sobre o backend unificado:
modelo de dados, rotas, payloads, telas, formulários e hierarquia. Segue as regras comuns do
`rait-build-pack.md` §0 (substrato STYNX 1.3.1 / Angular 22, governança DEVAI, geração por
blueprint, contratos, fronteira nacional, convenções de payload) e os manuais de
`docs/meta/agents/`. Fontes: [APP-TEAT], [WF-TEAT-001]…[005], [UC-TEAT-001]…[013],
[RN-TEAT-001]…[144], [JRN-TEAT-001]…[006], [IU-TEAT-001]; `teat-frontends.md`,
`teat-route-contract.md`, `teat-error-catalog.md`; matriz de paridade e contratos do repositório
de origem (`../teat`, somente leitura); ADR-0015, ADR-0016 (o TEAT só emite `AIT_INTEGRADO`),
ADR-0018 (impressão e assinatura via substrato), ADR-0020 (projeções).

## 1. Estado de partida (verificado em 2026-09-13)

| Item                                                        | Situação                                                                                                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blueprints `inf` (ait, normative, measures, alcohol, speed) | gerados; contratos OpenAPI CRUD publicados; `speed` sem módulo                                                                                          |
| Comandos do AIT                                             | `AitLifecycleService` + `AitCommandsController` escritos (12 rotas), **não montados** no `AitModule`                                                    |
| Operações de campo (`ops`)                                  | DDL manual (`13-ops-field-operations.sql`, sem CHECK/FK), 3 controladores parciais (20 rotas), corpos sem DTO                                           |
| Numeração, sincronização, bootstrap                         | inexistentes aqui; política já prevista (`ops:numbering-reservation`, `ops:sync-batch`, `ops:sync-conflict`)                                            |
| Frontends                                                   | só README; inventário oficial (67 + 56 telas) no repositório de origem                                                                                  |
| Defeitos conhecidos                                         | prefixo de rota gerado (`v1/inf/aitaits`), entidades de auditoria do `ops` erradas, política sem rota e rota sem política (`teat-route-contract.md` §9) |

## 2. Pacotes de trabalho

### WP-T0 — Correções de base (Engineer; Architect revisa) — antes de tudo

**Executado em 2026-09-13** (branch `fix/wp-t0-base-defects`): (1) junção de rotas já corrigida em `main`; (2) `AitModule` monta `AitCommandsController` e `AitLifecycleService` via `handwrittenControllers`/`handwrittenProviders` do blueprint (provedor de fábrica `AIT_LIFECYCLE_PROVIDER`), com `NormativeModule` importado e exportando `NormativeLifecycleService` — o gerador ganhou `moduleImports`/`moduleExports`; (3) entidades de auditoria do `ops` alinhadas às tabelas `ops.ops_*`; (4) política: `ops:homologation:read`, `ops:application-version:read` (com rotas `GET`), `inf:speed-*` (superfície CRUD, módulo atrás da flag), `ops:evidence:complete-upload|validate` removidas até o WP-T2, `est:crash-record` reconciliado (H.39, corpus BOAT); (5) WP-0 mergeado. Além do previsto: os oito módulos `inf` passaram a ser montados no `AppModule` e um e2e HTTP cobre `POST /v1/inf/ait/aits/{id}/finalize`. Pendente para WP-T1/T2: módulos Nest para `ops/*`, comandos de medidas e alcoolemia montados, entidades do item 6.

Ler: `tools/blueprints/generate.mjs`, `tools/contracts/generate-openapi.mjs`, `AitModule`,
`ops/*` controllers, `policy.ts`, `teat-route-contract.md` §9.
Produzir: (1) gerador emitindo `@Controller('v1/inf/ait/aits')` (join com barra) e teste de
regressão; regenerar todos os módulos; (2) `AitModule` registrando `AitLifecycleService` e
`AitCommandsController`; (3) `@Audit.entity` do `ops` alinhado às tabelas reais; (4) matriz de
política: adicionar `ops:homologation:read`, `ops:application-version:read`,
`inf:speed-*` (desligado por flag), remover ou implementar `ops:evidence:complete-upload|validate`
(implementar em WP-T2); (5) WP-0 (STYNX 1.3.1/Angular 22) se ainda não mergeado.
Gate: `pnpm check`, `backend:test:ci`, `verify:decorators`, rota `POST /v1/inf/ait/aits/{id}/finalize` respondendo em e2e.

### WP-T1 — Modelo de dados (Architect-blueprint → Engineer)

| Blueprint                                                         | Entidades / mudanças                                                                                                                                                                                                                                                                                                                             | Fonte                                                                  |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `BP-INF-AIT-001` v1.1.0                                           | `ait_ait.current_status` check = `WF-TEAT-001` (tokens canônicos, migrando os `draft/issued/…` do serviço); + `ait_cancel_request` (`kind`, `target_local_act_id`, `origin_status`, `addressed_to`, `status`, decisão), `ait_cancel_request_event`; `ait_ait.version` (`If-Match`); `speed_measurement_id?`                                      | [WF-TEAT-001], [UC-TEAT-011], origem                                   |
| `BP-INF-NORMATIVE-001` v1.1.0                                     | + `normative_metrological_table`; `normative_framing.approach_class` (`caso_1                                                                                                                                                                                                                                                                    | caso_2                                                                 | caso_3`), `required_fields`, `required_instrument`, `points_label`; `document_template.document_kind`/`signature_policy` (ADR-0018) | [RN-TEAT-108], [RN-TEAT-133], origem |
| `BP-INF-MEASURES-001` v1.1.0                                      | `administrative_term.withdrawal_deadline_at` + `ctb_deadline_at` (OD-T05), `signer_name`, `field_details_json`; `source_local_id`, `source_idempotency_key`, `source_payload_hash`; checks de estado (`WF-TEAT-004`) e de prazo (≤30/≤15)                                                                                                        | [RN-TEAT-124…128], origem                                              |
| `BP-INF-ALCOHOL-001` v1.1.0                                       | `alcohol_procedure`: `ait_local_id`, `sign_catalog_id/version`, `driver_*`, `vehicle_*`, `refused_procedures`, `witnesses_json`, `source_*`; `alcohol_test.considered_mg_l` + `max_error_mg_l` (par, check derivado); `alcohol_refusal.kind` (`refusal                                                                                           | technical_impossibility`); `psychomotor_sign.sign_group/status/method` | [RN-TEAT-133], [RN-TEAT-134], origem                                                                                                |
| `BP-OPS-FIELD-001` (novo, substitui o DDL manual)                 | `agent_profile`, `operational_device`, `device_event`, `homologation` (+ campos do laudo/SENATRAN), `application_version` (+ `altera_funcionalidade`), `operation`, `team`, `team_agent`, `patrol_vehicle`, `measurement_instrument`, `shift` (check de estado), `approach`, `session_handoff` (D-01); com CHECKs e FKs que o DDL manual não tem | origem `BP-MOBILE-OPERATIONS-001`, [RN-TEAT-003]                       |
| `BP-OPS-SNAPSHOTS-001` (novo)                                     | `person`, `person_document`, `vehicle`, `vehicle_snapshot`, `external_query`                                                                                                                                                                                                                                                                     | origem                                                                 |
| `BP-OPS-EVIDENCE-001` (novo)                                      | `evidence` (status enum), `evidence_link`, `custody_event`, `probative_package(+item)`, `evidence_access_request` (bodycam, [RN-TEAT-142]), `storage_intent`                                                                                                                                                                                     | origem, INV-EVIDENCE-001                                               |
| `BP-OPS-OFFLINE-SYNC-001` (novo, sobre `@stynx-nyx/offline-sync`) | `ait_numbering_range`, `numbering_reservation`, `numbering_consumption` (por número), `sync_batch`, `sync_queue_item` (`payload_json`, `idempotency_key` único por tenant), `sync_receipt`, `sync_conflict`                                                                                                                                      | origem, INV-OFFLINE-001, [WF-TEAT-002]                                 |
| `BP-OPS-PROVISIONING-001` (novo, WP-T5)                           | `device_key`, `offline_authorization_grant`, `provisioning_package`, `provisioning_receipt`, `device_revocation`                                                                                                                                                                                                                                 | plano P0–P6 da origem                                                  |

Também: os prazos de `WF-TEAT-004`/`005` (`T-REG30`, `T-REG15`, `T-NOTIF10`, `T-DEPOSITO6M`, `T-CNH5D`, `T-SNE2027`) entram em `inf.infraction_timer_ref` com `owner='medida'`; `14-inf-lifecycle-vocabulary.sql` ganha `inf.ait_state_ref` (tokens de `WF-TEAT-001`) e
`verify:lifecycle-vocabulary` passa a cobrir o AIT; fixtures em `backend/database/seed/` (um AIT
por estado, uma reserva por estado, um pacote publicado, um dispositivo por postura).
Gate: `blueprints:check`, `contracts:check`, `verify:rls-ddl`, `verify:lifecycle-vocabulary`,
`backend:db:reset` + `seed.sh` limpo.

### WP-T2 — Rotas e comandos (Engineer-backend)

Ler: `teat-route-contract.md` (todas as seções), `teat-error-catalog.md`, DTOs da origem.
Produzir, em `src/handwritten/` de cada módulo: comandos do AIT completos (incl. `concurrency-review`,
`cancel-requests`), bootstrap e turno (`/v1/ops/mobile-bootstrap`, `sessions/handoff`), numeração
e sincronização (`/v1/ops/offline-sync/*`, aplicação transacional por `entity_type`, recibos,
conflitos, detecção de concorrência), evidência (intenção → upload → conclusão, acesso a bodycam),
snapshots (consultas via adapter), normativo (gerar/publicar/validar/retirar pacote, conteúdo
assinado), medidas e alcoolemia (comandos com cálculo do valor considerado pela tabela
metrológica), SSE `/v1/ops/stream`, projeção de integrações. `RaitError` vira `DetranError`
compartilhado com prefixo por app.
Gate: matriz de política 100% coberta por rotas e vice-versa (teste novo `policy-routes.spec.ts`),
`verify:decorators`, `backend:test:ci`, testes de sincronização (ACK perdido, retry, lote
parcial, sequência repetida/gap, conflito, integridade), `verify:senatran-boundary`.

### WP-T3 — Payloads e contratos (Transcriber-docs / Engineer)

`docs/framework/contracts/BP-INF-AIT-001.commands.openapi.json` e equivalentes para normative,
measures, alcohol, ops-field, ops-offline-sync, ops-evidence, ops-snapshots, ops-bootstrap: um
`operationId` por comando, schemas dos DTOs (preservando os nomes da origem), respostas 4xx com
`code` enumerado do catálogo, headers `If-Match`/`Idempotency-Key`/`ETag`, exemplos com ids das
fixtures; schema JSON do lote de sincronização atualizado (`device_batch_id`, `batch_sequence`) em
`docs/framework/schemas/teat-offline-sync-batch.schema.json`; schema do pacote normativo mobile e
do bootstrap. Gate: `contracts:check` estendido; `openapi-typescript` gera clientes sem erro.

### WP-T4 — Telas, formulários e i18n (Transcriber-docs → Engineer-frontend)

Portar a matriz oficial para `docs/framework/product/domains/inf/teat/screens/`: uma ficha
`IU-TEAT-<screenId>.md` por tela (70 mobile + 56 web, sinistros marcados BOAT), com objetivo,
papel, dados (bootstrap/pacote/API), layout, componentes de `teat-frontends.md` §6, ações e
comandos, estados vazio/erro/offline, atalhos, ergonomia e critérios `AC-TEAT-*`;
`apps/teat/mobile/src/app/forms/*.schema.ts` para os formulários da §8; `i18n/teat.pt-BR.json`
(estados de `WF-TEAT-001…005`, bloqueadores do bootstrap, códigos de erro, rótulos das 126 telas);
`transitions.ts` com as 576 transições. Gate: `docs:kb:check`, teste que cada tela da matriz tem
ficha e rota; revisão do Owner.

### WP-T5 — Provisionamento offline e dispositivo (Architect → Engineer; ADR própria)

ADR "Provisionamento operacional offline" (chave do dispositivo no Keystore, grant
`OfflineOperationalGrantV1`, pacote assinado por KMS, envelope cifrado, revogação por época,
reconciliação obrigatória), blueprint `BP-OPS-PROVISIONING-001`, rotas `/v1/ops/provisioning/*`
(desafio, registro de chave, emissão, download, recibo, prontidão, revogação, reconciliação),
integração do `ReadinessGate`. Fases P0–P6 e matriz de prova da origem valem como plano. Gate:
pacote copiado/alterado/expirado/revogado rejeitado em teste; sem chave privada no servidor.

### WP-T6 — Frontends (Engineer-frontend)

`apps/teat/mobile` (Capacitor via `@stynx-nyx/mobile-runtime`; `FieldShell`, `ReadinessGate`,
`LocalActStore`, `SyncWorker`, `NormativePackageService`, `BodycamIndicator`; 8 módulos; 70 rotas;
formulários do WP-T4; impressora via porta com `FixturePrinter` nos testes) e `apps/teat/web`
(`@detran/ui`; 12 módulos; 56 + 4 rotas novas). Gate: testes de roteamento por papel, matriz de
576 transições verde, TestBed dos compartilhados, `ng build` mobile e web, `pnpm check`.

## 3. Ordem e paralelismo

```text
WP-T0 ──► WP-T1 ──► WP-T2 ──► WP-T3 ──┐
              └──► WP-T4 (fichas, i18n, schemas) ──┼──► WP-T6 ──► integração (SSE, impressora real, provisionamento)
                         WP-T5 (ADR + provisionamento) ─┘
```

WP-T4 corre em paralelo a WP-T1/T2; WP-T5 pode correr após WP-T1; WP-T6 só começa com WP-T3
publicado. Sonnet para WP-T3 e WP-T4; Opus/Terra para WP-T1, WP-T2, WP-T5.

## 4. Questões abertas do TEAT (registrar em `open-decisions-rait.md` §F ou em arquivo próprio)

| ID     | Questão                                                                                                                                                        | Premissa adotada                                                                                                                                                                                                        | Decisor                         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| OD-T01 | Papel RBAC da Diretoria de Fiscalização (`teat-fiscalization-board`) ou `traffic-authority` em nível superior                                                  | mapeado a `traffic-authority` com atributo `decision_body`; rota exige `addressed_to` — **H.39**: atributo                                                                                                              | Owner                           |
| OD-T02 | Portar `agency-context` (órgãos, unidades, convênios, competências, circunscrições) como módulo `ops/agency` ou reaproveitar `auth.tenants`/`tenancy` do STYNX | módulo `ops/agency` mínimo (unidade, competência, circunscrição) em ADR própria — **H.40**: `ops/agency` mínimo                                                                                                         | Architect/Owner                 |
| OD-T03 | Janela de "mesmo intervalo" da detecção de concorrência                                                                                                        | parâmetro `sync.concurrency_window_minutes`, sem valor exibido — DT-016: Owner pediu histórico de incidentes antes de calibrar (2026-08-28) → `source_pending`                                                          | Owner (AC-TEAT-012-5)           |
| OD-T04 | Comportamento com homologação SENATRAN caducada (bloquear lavratura? avisar?)                                                                                  | bloqueia (`HOMOLOGATION_RENEWAL_DUE`), com parâmetro de tolerância zero — **H.55**: só avisar e registrar                                                                                                               | Owner / LEGAL                   |
| OD-T05 | Dois prazos de retirada no termo (Res. 1.025 art. 14 §1º × CTB 271 §10)                                                                                        | dois campos, ambos impressos                                                                                                                                                                                            | LEGAL                           |
| OD-T06 | Regime de `no_approach_reason` (texto livre × classificação por enquadramento)                                                                                 | classificação ([RN-TEAT-108]); justificativa só no Caso 3 — **H.54** vigente                                                                                                                                            | Owner (reconciliar UC-TEAT-002) |
| OD-T07 | Reserva expirada: devolução de números e transição `ATIVA → ESGOTADA`                                                                                          | números não consumidos voltam a `disponivel` na reconciliação; faixa esgota quando `next_number > end_number` — **H.54** vigente                                                                                        | Owner                           |
| OD-T08 | Bodycam: retenção e regime de acesso (DT-014)                                                                                                                  | onda futura; chrome e metadados desde já — **DT-014 respondido**: onda futura; retenção segue aberta → `teat.bodycam.retention_days` `source_pending` (CSAD, DT-049)                                                    | Owner                           |
| OD-T09 | Guarda monitorada (DT-015) e medidores acoplados (UC-TEAT-013)                                                                                                 | fora do MVP; rotas registradas e desligadas por flag — **DT-015 e DT-063 respondidos**: guarda monitorada adiada até homologação; medidores não usados hoje → flags `teat.monitored_custody`, `teat.speed_meters` = off | Owner                           |
| OD-T10 | Sivec como integração                                                                                                                                          | não; candidata                                                                                                                                                                                                          | Owner                           |
| OD-T11 | Legitimidade do agente (uniforme, exercício regular, viatura caracterizada) como validação                                                                     | não modelada; checkbox de declaração no `open-shift`                                                                                                                                                                    | Owner / LEGAL                   |
| OD-T12 | Recolhimento do documento de habilitação (conflito MBFT × CTB × Res. 432)                                                                                      | posição de [RN-TEAT-129] com divergência visível                                                                                                                                                                        | LEGAL                           |

## 5. Inconsistências do corpus a reconciliar antes de WP-T4 (Transcriber-docs, PR próprio)

1. `use-cases/INDEX.md` marca UC-TEAT-001…012 como `draft` e omite UC-TEAT-013; os arquivos são `approved`/`reviewed`.
2. `APP.md` fala em 49 regras; há 50 (`RN-TEAT-001…006`, `101…144`).
3. `no_approach_reason`: UC-TEAT-002 (texto livre, fonte pendente) × [RN-TEAT-108]/AC-TEAT-002-1 (classificação Casos 1/2/3) — OD-T06.
4. `allows_no_approach` booleano (UC-TEAT-002) × enum de três valores (RN-TEAT-108).
5. Dois prazos de retirada não modelados (WF-TEAT-004 §pendências × AC-TEAT-009-8) — OD-T05.
6. Retenção com dois tetos (`T-REG30` × `T-REG15`): a UI precisa da hipótese que aplica cada um.
7. Numeração de passos quebrada em UC-TEAT-008 e UC-TEAT-009.
8. `SUSPEITO_CONCORRENCIA` sem prazo de apuração nem decurso — OD-T03.
9. Reserva expirada e `ATIVA → ESGOTADA` sem fonte — OD-T07.
10. Etilômetro sem certificado: "proposta" em WF-TEAT-005 × contrato em AC-TEAT-007-1 (adotado o bloqueio).
11. Testemunha e termo de sinais psicomotores exigidos por AC-TEAT-007-6/10 sem entidade própria (WP-T1 cobre com `witnesses_json` e `alcohol-signs-term`).
12. "68 telas" em JRN-TEAT-006 × 67 na matriz.

## 6. Mapa entregável → definições

| Entregável            | Definições                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| A (dados)             | WP-T1 desta página; blueprints existentes; DDL `13-ops-field-operations.sql` (a substituir); origem `BP-*.json`; `WF-TEAT-001…005` |
| B (rotas)             | `teat-route-contract.md`; `policy.ts` (`TEAT_RULES`, `OPS_SURFACE_RULES`); `AitCommandsController`                                 |
| C (payloads)          | DTOs da origem preservados em `teat-route-contract.md`; `rait-build-pack.md` §0; `teat-error-catalog.md`                           |
| D (telas)             | matriz de paridade (67/56), `teat-frontends.md` §4–§7, [IU-TEAT-001], jornadas [JRN-TEAT-001…006]                                  |
| E (formulários/gates) | `teat-frontends.md` §8; `WF-TEAT-001…005`; `RN-TEAT-*`; `teat-error-catalog.md`                                                    |
| F (hierarquia)        | `teat-frontends.md` §4–§6, §10; `rait-web-structure-diagrams.md` como modelo dos diagramas (a produzir para o TEAT em WP-T4)       |
