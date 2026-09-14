# R-0010 — frente `boat-backend` (WP-B0…B3 do BOAT: política, modelo `est/crash`, comandos, sincronização, RENAEST e contratos)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro GPT-5.6 Sol
(prompt em `prompts/00-maestro.md`). Reviewer: Opus 5 via `tools/orchestra/bridge.sh claude`.
**Depende de:** `ops-agency` (R-0005) e `teat-backend` (R-0008) em `main` (fila de sincronização e evidência).
**Janelas previstas:** 3.

## Metas

1. **Reconciliação e política** (WP-B0): `policy.ts` `est:crash-record:*` alinhado ao corpus
   (`attach-sketch` + `processing-operator`; `validate` = `processing-operator`, `traffic-authority`;
   novas ações `record-duty`, `add-damage`, `add-witness`, `link`, `record`, `complement`, `cancel`,
   `transmit`, `rectify`, `archive`, `subject-request`; leitura de `crash-victim` **com finalidade**);
   `docs/framework/product/domains/est/boat/use-cases/INDEX.md` com status reais (UC-012 não é stub);
   novo `UC-BOAT-013` (dever de resposta ao titular, W-05) — artefato novo: `artifactIdCount` do
   `import-manifest.json` sobe 521 → 522.
2. **Modelo** (WP-B1): `BP-EST-CRASH-001` (namespace `est`): `crash_record` (campos da origem +
   `severity` obrigatório, `location_reference`, `source_*`, `version`; checks de estado [WF-BOAT-001],
   `occurred_at <= recorded_at`, gravidade × vítimas no fechamento — função; derivação
   `est.severity.derivation=worst_victim`, H.43), `crash_vehicle` (sem `evaded`; `plate` PII com
   retenção por parâmetro), `crash_person` (+ `refused_data`; PII), `crash_victim` (`pii: sensitive-health`,
   retenção `est.retention.*` — H.45: 5/5/10 anos vigentes; acesso com finalidade), `crash_scene_duty`,
   `crash_damage`, `crash_witness`, `crash_sketch`, `crash_link` (`kind: ait|measure`, sem FK rígida),
   `crash_renaest_submission`, `crash_subject_request`; refs `est.crash_state_ref`, `crash_severity_ref`,
   `scene_duty_ref`, `crash_condition_ref` (valores do protótipo, `source_pending`, H.42),
   `damage_asset_kind_ref`; `verify:lifecycle-vocabulary` estendido ao `est`. DDL **`70-est-crash.sql`**
   (o build pack cita `40-est-crash.sql`, número já ocupado por `40-ch-clinical-network.sql`; corrigir
   o build pack). Timer `T-BOAT-TRANSM` (`est.renaest.transmit_period=monthly`, H.54) com `owner='sinistro'`.
   Fixtures: um registro por estado local, um por situação nacional, com/sem vítima, um com retificação.
3. **Comandos, sincronização e RENAEST** (WP-B2, `boat-route-contract.md` §3–§7): comandos em
   `src/handwritten/`; aplicador do item `crash-record` na sincronização do TEAT (transação única,
   independência recíproca); gate gravidade × vítimas; leitura de vítima com `purpose` e auditoria;
   `transmit`/`rectify` via outbox + `RenaestPort` com mapeamento campo a campo em
   `docs/framework/contracts/renaest-mapping.md` (campos "a confirmar" DT-061); espelho da situação
   nacional; job `T-BOAT-TRANSM`; relatório preliminar/BAT em PDF/A pela fachada de documentos
   (ADR-0018, R-0006); projeções `portal.crash_view` (projetor real), `dashboard.crashes` (limiar
   `dashboard.cell_threshold=10`), `integration.renaest_mirror`; SSE.
4. **Contratos** (WP-B3): `BP-EST-CRASH-001.commands.openapi.json`; `docs/framework/schemas/boat-crash-record-sync-item.schema.json`
   (payload canônico da fila); `renaest-mapping.md` como tabela.
5. Documentação: `boat-build-pack.md` §WP-B0…B3 executados (DDL 70); `decision-closure-plan.md` gate #5;
   backlog.

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                                           | Depende de           | Entrega                                                                                                                                                       |
| --------- | ------------ | ------------------- | -------------- | ------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-product-boat`, `MOD-kb-manifest`                                          | —                    | `use-cases/INDEX.md`, `UC-BOAT-013`, manifesto 522                                                                                                            |
| TASK-0002 | Architect    | architect-blueprint | Terra / alto   | `MOD-bp-est-crash`, `MOD-ddl-70`, `MOD-ddl-14`                                 | —                    | blueprint + refs + função de gravidade + timer; tabela de regras `est:*` × papéis; critérios                                                                  |
| TASK-0003 | Inspector    | inspector-tests     | Luna / médio   | `MOD-est-tests`, `MOD-shared-policy-spec`                                      | TASK-0002            | testes: `policy.spec.ts` (`est:*`), matriz [WF-BOAT-001]/[WF-BOAT-003], gravidade × vítimas, duplicidade por chave natural, terminal sem correção, RLS, seeds |
| TASK-0004 | Engineer     | engineer-backend    | Luna / médio   | `MOD-est-crash`, `MOD-shared-policy`, `MOD-app-module`, `MOD-tools-vocabulary` | TASK-0003            | módulo gerado, política, vocabulário, fixtures; testes verdes                                                                                                 |
| TASK-0005 | Architect    | architect-blueprint | Terra / alto   | `MOD-contracts-renaest-mapping`                                                | TASK-0002            | `renaest-mapping.md` campo a campo (contrato do mock; "a confirmar" onde depender dos Manuais)                                                                |
| TASK-0006 | Inspector    | inspector-tests     | Luna / médio   | `MOD-est-commands-tests`                                                       | TASK-0004, TASK-0005 | testes dos comandos, do aplicador de sincronização, do `RenaestPort` e2e no mock, das projeções (replay)                                                      |
| TASK-0007 | Engineer     | engineer-backend    | Terra / médio  | `MOD-est-handwritten`, `MOD-integration-outbox`                                | TASK-0006            | comandos, aplicador, transmissão/retificação, espelho, job, PDF/A, projeções, SSE; testes verdes                                                              |
| TASK-0008 | Engineer     | engineer-backend    | Luna / baixo   | `MOD-contracts-commands`, `MOD-schemas`                                        | TASK-0007            | contrato de comandos + schema da fila; `contracts:check`/`contracts:clients`                                                                                  |
| TASK-0009 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-docs`                                                                     | TASK-0008            | build pack (DDL 70), closure plan, backlog                                                                                                                    |

CTG-0001 = 0001…0004; CTG-0002 = 0005…0008. Um PR por CTG.

## Critérios de aceitação (comandos → resultado)

- `node tools/docs/kb/check.mjs` → 522 artefatos / 446 tokens após TASK-0001 (baseline atualizado
  no mesmo commit; qualquer outro número é erro).
- `pnpm blueprints:check`, `pnpm contracts:check`, `pnpm contracts:clients` → OK.
- `pnpm verify:rls-ddl`, `pnpm verify:lifecycle-vocabulary` (cobrindo `est.*_ref`), `pnpm verify:senatran-boundary`,
  `pnpm verify:decorators` → OK.
- `DB_NAME=detran_r10 DB_PASSWORD=postgres bash backend/database/apply.sh --full` + `seed.sh` duas vezes → OK.
- `pnpm --filter @detran/shared test` → `policy.spec.ts` cobre 100 % de `est:*`; `pnpm --filter @detran/est-crash test:unit|test:integration|test:e2e` → verdes.
- `pnpm senatran-adapter:test:ci` → verde (RENAEST no mock); `pnpm backend:test:ci`, `pnpm check` → verdes.

## Mapa entregável → definições

| Entregável | Definição                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| política   | `boat-build-pack.md` §WP-B0; steering H.39 (`est:crash-record` reconciliado em WP-T0); `policy.ts` `est:*`   |
| modelo     | `boat-build-pack.md` §WP-B1; origem `BP-CRASH-RECORDS-001`; [WF-BOAT-001…003]; [UC-BOAT-012]; H.42/H.43/H.45 |
| comandos   | `boat-route-contract.md` §3–§7; `boat-error-catalog.md`; `teat-route-contract.md` §4 (fila)                  |
| RENAEST    | `RenaestPort`/mock (`SinistroRequest`) em `packages/senatran-adapter`; OD-B08 (DT-061)                       |
| LGPD       | `lgpd-assessment.md`; steering H.44 (inventário art. 28 PN 002/2026); [REF-ANPD-GUIA-PODER-PUBLICO-2024]     |
| parâmetros | `parameter-catalogue.md` (`est.*`, `dashboard.cell_threshold`)                                               |

## Riscos

- `policy.ts` lock com `portal-backend` (R-0009): blocos distintos; rebase da segunda.
- `UC-BOAT-013` é edição de corpus de produto (papel Owner delegado): texto só a partir de W-05 e
  [RN-BOAT-*]; sem regra nova.
- Retenção `est.retention.*` vigente por H.45, bodycam pendente: eliminação opera com listagem, nunca automática.

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
