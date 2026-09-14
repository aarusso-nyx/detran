# R-0004 — frente `param-store` (ADR-0021; parte de parâmetros do WP-A do RAIT)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro GPT-5.6 Sol
(prompt em `prompts/00-maestro.md`). Reviewer: Opus 5 via `tools/orchestra/bridge.sh claude`.

## Metas

1. Blueprint `docs/framework/blueprints/BP-OPS-PARAMETER-001.json` (namespace `ops`, entidade
   `Parameter` → tabela `ops.parameter` com as colunas da ADR-0021 §Decision 1, índice único em
   `(tenant_id, coalesce(traffic_agency_id), surface, key, effective_from)`, checks de `status`,
   `scope`, `surface`), `ddlFile` `15-ops-parameter.sql`; módulo gerado `backend/domains/ops/parameter`
   montado no `AppModule`.
2. `ParameterService` manuscrito (`handwrittenProviders`): `get(key, { agencyId?, on?, required? })`
   com resolução surface → agency → tenant → default do catálogo; erro `PARAMETER_SOURCE_PENDING`
   quando `required` e `source_pending`; `PARAMETER_LEGAL_READONLY` no `update` de linha legal;
   cache por tenant invalidado por evento `PARAMETRO_ALTERADO`; comando `PUT parameters/{key}`
   (nova versão com `reason`, `decision_ref`, `effective_from`; `PARAMETER_EFFECTIVE_DATE_PAST`).
3. Gerador de seed `tools/parameters/generate-seed.mjs`: lê `docs/framework/arch/parameter-catalogue.md`
   e emite `backend/database/seed/05-parameters.sql` (uma linha por chave, `status`, `source_pending`,
   `legal_readonly`, `decision_ref`); `seed.sh` atualizado; gate `verify:parameter-catalogue`
   (chaves usadas em código ⊆ catálogo; `decision_ref` existentes em `decision-closure-plan.md`,
   `open-decisions-rait.md` ou steering §H; nenhuma linha `legal_readonly` editável) adicionado a
   `pnpm check`.
4. Flags booleanas: `detranFeatureFlagSet()` em `backend/app/src/detran-runtime.ts` passa a ser
   alimentado pelo mesmo catálogo (linhas marcadas **F**), mantendo `teat.speed_meters`.
5. `inf.normative_agency_parameter` vira view de compatibilidade sobre `ops.parameter`
   (`surface='shared'`) no DDL 30 (idempotente); `BP-INF-NORMATIVE-001` mantém a entidade até o
   módulo ser regenerado sem ela (registrar como pendência se não couber).
6. ADR-0021 → `Accepted` com data e PR; `rait-build-pack.md` WP-A §parâmetros marcado;
   `rait-deadline-engine.md` já cita `ops.parameter`.

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                       | Depende de           | Entrega                                                                                                                                |
| --------- | ------------ | ------------------- | -------------- | ------------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect    | architect-blueprint | Terra / alto   | `MOD-bp-ops-parameter`, `MOD-ddl-15`       | —                    | blueprint + DDL + contrato do comando `PUT parameters/{key}` + tabela de erros + critérios                                             |
| TASK-0002 | Inspector    | inspector-tests     | Luna / médio   | `MOD-ops-parameter-tests`                  | TASK-0001            | testes: resolução surface→agency→tenant→default, `required` + `source_pending`, `legal_readonly`, vigência, RLS da tabela (integração) |
| TASK-0003 | Engineer     | engineer-backend    | Luna / médio   | `MOD-ops-parameter`, `MOD-app-module`      | TASK-0002            | módulo gerado + `ParameterService` + comando; `AppModule`; testes verdes                                                               |
| TASK-0004 | Architect    | architect-blueprint | Terra / médio  | `MOD-tools-parameters`, `MOD-package-json` | TASK-0001            | `generate-seed.mjs`, `verify:parameter-catalogue`, `seed.sh`, scripts em `package.json`                                                |
| TASK-0005 | Engineer     | engineer-backend    | Luna / baixo   | `MOD-app-runtime`, `MOD-ddl-30`            | TASK-0003, TASK-0004 | flags do catálogo em `detran-runtime.ts`; view de compatibilidade no DDL 30                                                            |
| TASK-0006 | Owner deleg. | transcriber-docs    | Luna / baixo   | `MOD-docs`                                 | TASK-0005            | ADR-0021 Accepted, build pack, backlog, `parameter-catalogue.md` §Regras (gate ativo)                                                  |

CTG-0001 = TASK-0001…0003; CTG-0002 = TASK-0004 (+ TASK-0005 como Engineer). TASK-0006 simples.

## Critérios de aceitação (comandos → resultado)

- `pnpm blueprints:check` e `pnpm contracts:check` → sincronizados.
- `pnpm --filter @detran/ops-parameter test:unit` → verde; `DETRAN_TEST_TIER=integration` com
  `DB_NAME=detran_r4 bash backend/database/apply.sh --full` → verde.
- `bash backend/database/seed.sh` em banco limpo → idempotente (duas execuções sem erro);
  `select count(*) from ops.parameter` = número de linhas do catálogo.
- `pnpm verify:parameter-catalogue` → OK; falha simulada (chave inexistente em código) → exit 1.
- `pnpm verify:rls-ddl` → OK (tabela com `tenant_id`, RLS forçada, trigger).
- `pnpm backend:rls-smoke` → OK (contagem de tabelas inf/ch inalterada; `ops.parameter` coberta).
- `pnpm check` → verde; `node tools/docs/kb/check.mjs` → 521/446.

## Mapa entregável → definições

| Entregável       | Definição                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| tabela e serviço | `docs/meta/adr/ADR-0021-shared-parameter-store.md` §Decision 1–3, 6, 7                                                          |
| catálogo (seed)  | `docs/framework/arch/parameter-catalogue.md` (85 linhas; 74 `vigente`)                                                          |
| erros            | `docs/framework/arch/rait-error-catalog.md` (`RAIT.PARAMETER_*`), `boat-error-catalog.md`, `dashboard-error-catalog.md`         |
| edição por papel | `UC-RAIT-043` (agency-admin, motivo, vigência, versões); `permissionGuard('<surface>:parameter:update')`                        |
| padrão de módulo | `BP-INF-AIT-001` (handwrittenProviders/moduleImports, ADR-0007 adendo), `backend/domains/inf/ait/src/ait-lifecycle.provider.ts` |
| motor de prazos  | `docs/framework/arch/rait-deadline-engine.md` §Entradas                                                                         |

## Riscos

- Lock em `policy.ts` (regras `ops:parameter:*` e `<surface>:parameter:update`) compartilhado com
  `dash-roles`: coordenar a ordem de merge (dash-roles primeiro).
- Parsing do catálogo Markdown: o gerador deve falhar alto em linha malformada; preferir tabela
  com colunas fixas e teste de snapshot do seed.
- A view de compatibilidade só é válida enquanto o módulo normativo gerado não escrever na tabela
  antiga; verificar `NormativeAgencyParameterRepository` (CRUD gerado) antes de trocar por view — se
  escrever, adiar a view para a regeneração (registrar em §Bloqueios).

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
