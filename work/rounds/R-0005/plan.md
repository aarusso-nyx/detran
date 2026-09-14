# R-0005 — frente `ops-agency` (WP-T1 do TEAT: modelo de dados de `ops/*` e deltas dos blueprints `inf`)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro GPT-5.6 Sol
(prompt em `prompts/00-maestro.md`). Reviewer: Opus 5 via `tools/orchestra/bridge.sh claude`.
**Depende de:** nenhuma frente — decisão do Owner em 2026-09-14: abre em paralelo à onda 1 (R-0003 em curso,
R-0004 pausada); só `origin/main` ≥ 80d705a. Pontos de rebase com R-0004: `AppModule` e `BP-INF-NORMATIVE-001`.
**Janelas previstas:** 2 (CTG-0001/0002 na primeira; CTG-0003 e docs na segunda).

## Metas

1. **`ops/agency` mínimo** (steering H.40, OD-T02/OD-013): blueprint `BP-OPS-AGENCY-001`
   (namespace `ops`; entidades `agency_unit`, `agency_jurisdiction` (circunscrição),
   `agency_competence`; sem convênios), DDL gerado `13-ops-agency.sql` (antes de
   `13-ops-field-operations.sql` na ordem lexicográfica do `apply.sh`), ADR curta (número livre
   seguinte em `docs/meta/adr/README.md`; previsto ADR-0023) registrando o corte "mínimo agora,
   `agency-context` completo depois".
2. **Substituição do DDL manual do `ops`** por blueprints (teat-build-pack WP-T1):
   `BP-OPS-FIELD-001` (`agent_profile`, `operational_device`, `device_event`, `homologation`,
   `application_version`, `operation`, `team`, `team_agent`, `patrol_vehicle`,
   `measurement_instrument`, `shift` com check de estado, `approach`, `session_handoff`; CHECKs e
   FKs que o DDL manual não tem; `ddlFile` mantém `13-ops-field-operations.sql`),
   `BP-OPS-SNAPSHOTS-001` (`person`, `person_document`, `vehicle`, `vehicle_snapshot`,
   `external_query`; DDL `16-ops-snapshots.sql`), `BP-OPS-EVIDENCE-001` (`evidence` com enum de
   status, `evidence_link`, `custody_event`, `probative_package` + item,
   `evidence_access_request` [RN-TEAT-142], `storage_intent`; DDL `17-ops-evidence.sql`),
   `BP-OPS-OFFLINE-SYNC-001` (`ait_numbering_range`, `numbering_reservation`,
   `numbering_consumption`, `sync_batch`, `sync_queue_item` com `idempotency_key` único por
   tenant, `sync_receipt`, `sync_conflict`; DDL `18-ops-offline-sync.sql`). Os módulos manuscritos
   atuais `backend/domains/ops/{core,evidence-custody,operations,snapshots}` migram para módulos
   gerados; `field-operations.controller.ts` e afins entram como `handwrittenControllers` do
   blueprint dono (padrão de `BP-INF-AIT-001`). `BP-OPS-PROVISIONING-001` fica para R-0013 (WP-T5).
3. **Deltas dos blueprints `inf`** (v1.1.0): `BP-INF-AIT-001` (`ait_ait.current_status` com check
   = tokens de [WF-TEAT-001]; `ait_cancel_request` + `ait_cancel_request_event`;
   `ait_ait.version`; `speed_measurement_id?`), `BP-INF-NORMATIVE-001`
   (`normative_metrological_table`; `normative_framing.approach_class` `caso_1|caso_2|caso_3`,
   `required_fields`, `required_instrument`, `points_label`; `document_template.document_kind`,
   `signature_policy` — ADR-0018), `BP-INF-MEASURES-001` (`administrative_term.withdrawal_deadline_at`
   - `ctb_deadline_at` (OD-T05), `signer_name`, `field_details_json`, `source_*`; checks de estado
     [WF-TEAT-004] e de prazo ≤30/≤15), `BP-INF-ALCOHOL-001` (`alcohol_procedure.*` da origem,
     `alcohol_test.considered_mg_l` + `max_error_mg_l`, `alcohol_refusal.kind`,
     `psychomotor_sign.sign_group/status/method`). `AitLifecycleService` passa a usar os tokens
     canônicos (hoje `draft/issued/…`).
4. **Vocabulário e timers**: `14-inf-lifecycle-vocabulary.sql` ganha `inf.ait_state_ref`
   ([WF-TEAT-001]) e `tools/check-lifecycle-vocabulary.ts` passa a cobrir o AIT; prazos
   `T-REG30`, `T-REG15`, `T-NOTIF10`, `T-DEPOSITO6M`, `T-CNH5D`, `T-SNE2027` em
   `inf.infraction_timer_ref` com `owner='medida'` (a tabela nasce em R-0006 se ainda não existir:
   neste caso, registrar em §Bloqueios e entregar os timers como seed pendente).
5. **Fixtures** em `backend/database/seed/`: um AIT por estado, uma reserva por estado, um pacote
   normativo publicado, um dispositivo por postura; `seed.sh` idempotente.
6. Documentação: `teat-build-pack.md` §WP-T1 marcado executado; `docs/framework/blueprints/README.md`;
   `backend/domains/ops/README.md`; `decision-closure-plan.md` gate #3 fechado; backlog.

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                                                                | Depende de           | Entrega                                                                                                                                     |
| --------- | ------------ | ------------------- | -------------- | --------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect    | architect-blueprint | Terra / alto   | `MOD-bp-ops-agency`, `MOD-adr`                                                                      | —                    | `BP-OPS-AGENCY-001`, ADR curta, critérios                                                                                                   |
| TASK-0002 | Architect    | architect-blueprint | Terra / alto   | `MOD-bp-ops-field`, `MOD-bp-ops-snapshots`, `MOD-bp-ops-evidence`, `MOD-bp-ops-offline-sync`        | —                    | quatro blueprints `ops`, mapa "tabela manual → entidade gerada", lista de controladores a migrar                                            |
| TASK-0003 | Inspector    | inspector-tests     | Luna / médio   | `MOD-ops-tests`                                                                                     | TASK-0001, TASK-0002 | testes: CHECKs/FKs por tabela (integração), RLS (`verify:rls-ddl` + `backend:rls-smoke`), unicidade de `idempotency_key`, estado de `shift` |
| TASK-0004 | Engineer     | engineer-backend    | Luna / médio   | `MOD-ops-modules`, `MOD-app-module`                                                                 | TASK-0003            | `pnpm blueprints:generate`; migração dos módulos manuscritos para gerados + `handwrittenControllers`; `AppModule`; testes verdes            |
| TASK-0005 | Architect    | architect-blueprint | Terra / alto   | `MOD-bp-inf-ait`, `MOD-bp-inf-normative`, `MOD-bp-inf-measures`, `MOD-bp-inf-alcohol`, `MOD-ddl-14` | TASK-0002            | deltas v1.1.0 dos quatro blueprints; `inf.ait_state_ref`; timers `owner='medida'`; critérios                                                |
| TASK-0006 | Inspector    | inspector-tests     | Luna / médio   | `MOD-inf-tests`                                                                                     | TASK-0005            | testes: checks de estado/prazo, `verify:lifecycle-vocabulary` cobrindo AIT, `AitLifecycleService` com tokens canônicos                      |
| TASK-0007 | Engineer     | engineer-backend    | Luna / médio   | `MOD-inf-modules`, `MOD-tools-vocabulary`                                                           | TASK-0006            | regeneração `inf`, `AitLifecycleService` migrado, `check-lifecycle-vocabulary.ts`; testes verdes                                            |
| TASK-0008 | Engineer     | engineer-backend    | Luna / baixo   | `MOD-seed`                                                                                          | TASK-0004, TASK-0007 | fixtures TEAT em `backend/database/seed/`; `seed.sh` duas execuções sem erro                                                                |
| TASK-0009 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-docs`                                                                                          | TASK-0008            | build pack, READMEs, `decision-closure-plan.md`, backlog                                                                                    |

CTG-0001 = TASK-0001…0004 (ops); CTG-0002 = TASK-0005…0007 (inf); CTG-0003 = TASK-0008. TASK-0009 simples.
Um PR por CTG (a frente é grande); CTG-0001 mescla primeiro.

## Critérios de aceitação (comandos → resultado)

- `pnpm blueprints:check` e `pnpm contracts:check` → sincronizados após `pnpm blueprints:generate`
  (formatar o blueprint com prettier **antes** de regenerar: o cabeçalho leva o sha256 do blueprint).
- `pnpm verify:rls-ddl` → OK; `pnpm backend:rls-smoke` → OK (contagem de tabelas com tenant sobe;
  atualizar a lista esperada em `backend/app/tests/*inf-rls*` se ela enumerar tabelas).
- `pnpm verify:lifecycle-vocabulary` → OK, cobrindo `inf.ait_state_ref`.
- `DB_NAME=detran_r5 DB_PASSWORD=postgres bash backend/database/apply.sh --full` → `apply.sh: done`;
  `bash backend/database/seed.sh` duas vezes → sem erro.
- `pnpm --filter @detran/inf-ait test:unit` e `pnpm --filter @detran/inf-ait test:integration`
  (com `DETRAN_TEST_DATABASE_URL`) → verdes; idem para os pacotes `ops` gerados (nomes definidos
  pelos blueprints, ex.: `@detran/ops-field`).
- `pnpm backend:test:ci` → verde; `pnpm check` → verde; `node tools/docs/kb/check.mjs` → 521/446.

## Mapa entregável → definições

| Entregável       | Definição                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `ops/agency`     | steering H.40; `decision-closure-plan.md` §1 item 3; [RN-TEAT-003]; `teat-route-contract.md` (bootstrap)                                   |
| blueprints `ops` | `teat-build-pack.md` §WP-T1 (tabela); origem `../teat` `BP-MOBILE-OPERATIONS-001` (somente leitura); INV-EVIDENCE-001, INV-OFFLINE-001     |
| deltas `inf`     | [WF-TEAT-001…005], [UC-TEAT-011], [RN-TEAT-108], [RN-TEAT-124…128], [RN-TEAT-133], [RN-TEAT-134]; OD-T05                                   |
| timers           | [WF-TEAT-004], [WF-TEAT-005]; `rait-deadline-engine.md` §Entradas; `parameter-catalogue.md` (`teat.*`)                                     |
| padrão de módulo | `BP-INF-AIT-001` (`handwrittenControllers`/`handwrittenProviders`/`moduleImports`), ADR-0007 adendo; `docs/framework/blueprints/README.md` |
| erros            | `teat-error-catalog.md`                                                                                                                    |

## Riscos

- `13-ops-field-operations.sql` manual é substituído por DDL gerado com o mesmo nome: em banco
  existente exige `DROP`/`ALTER` idempotente; em CI o banco é sempre limpo.
- Os módulos `ops/*` manuscritos têm testes próprios: migrar os testes junto, nunca apagar.
- `inf.infraction_timer_ref` pertence ao agregado da infração (R-0006, ADR-0014/0016). Se a
  tabela não existir ao executar a TASK-0005, os timers `owner='medida'` ficam como arquivo de seed
  pendente (`backend/database/seed/30-fixtures-teat-timers.sql`, aplicado só quando a tabela existir)
  e o fato entra em §Bloqueios para o maestro de R-0006.
- `policy.ts` **não** é tocado nesta frente (WP-T2 em R-0008); `roles.ts` idem.
- Abertura em paralelo à onda 1: `AppModule` (R-0004 monta `ops/parameter`) e `BP-INF-NORMATIVE-001`
  (R-0004 pode mexer nele pela view de compatibilidade) são os pontos de rebase; se R-0004 retomar na
  janela Sol, esta frente grava `checkpoint` ao fim do CTG-0001 e cede a janela.

## Bloqueios

(nenhum)

## Retomada

(vazio — preenchido pelo maestro em `checkpoint`)

## Leitura

(preenchido pelo maestro: sha de `main`, arquivos lidos)
