# R-0003 — frente `dash-roles` (WP-D0 do DASHBOARD)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro Fable 5.1
(prompt em `prompts/00-maestro.md`). Reviewer: GPT-5.6 Terra via `tools/orchestra/bridge.sh codex`.

## Metas

1. Papéis `dash-operator` e `dash-duty-owner` no catálogo canônico: `backend/domains/shared/src/roles.ts`
   (`DASHBOARD_ROLES`, incluídos em `DETRAN_ROLES` → 36), `backend/database/ddl/05-role-catalog.sql`
   (família `dashboard` na restrição e duas linhas seedadas), `tools/check-role-catalog.ts`
   (verifica também a família DASHBOARD em `shared/actors.md`, que já os documenta).
2. Regras de política `dashboard:*` em `policy.ts`, conforme `docs/framework/arch/dashboard-route-contract.md`
   §2–§4: `alert` (read, ack, treat, close, annotate), `incident` (read), `duty`/`duty-cycle`
   (read, start, prepare, submit, prove, archive), `indicator` (read), `indicator-config` (read,
   update; `publish` já existe), `bi-panel` (read; `publish` existe), `generated-report` (read;
   request/complete/fail existem), `source` (read), `export` (create, approve), `audit-trail`
   (read), `comparison` (read), `transparency-audit` (read, audit), `dataset` (read), `kpi` (read).
3. Camadas de acesso N0…N3 (`RN-DASH-170`) como função exportada de `policy.ts`:
   `dashboardLayerFor(roles)` → `N0|N1|N2` (N3 nunca) e `dashboardLayerAllows(roles, required)`;
   mapa papel → camada: `dash-operator` N1; `dash-duty-owner` N1; `technical-admin`,
   `integration-operator` N1 (sem conteúdo de domínio); gestores de área (`rait-manager`,
   `rait-coordinator`, `rait-chair`, `traffic-authority`, `GESTOR`) N2 do próprio domínio;
   `agency-admin`, `GESTOR_DETRAN`, `AUDITOR`, `DPO` N2 transversal; `bi-analyst` N1.
4. Testes em `policy.spec.ts` (34 → 36 papéis; regras acima; camadas; N3 sempre negado).
5. Documentação: `docs/framework/arch/dashboard-build-pack.md` §WP-D0 marcado executado;
   `decision-closure-plan.md` gate #2 fechado; backlog. **Fora desta rodada**: seed dos 42
   indicadores (`dashboard.indicator` só existe no WP-D1); atributo `decision_body` da Diretoria
   (WP-T2, rota de cancelamento).

## Tarefas (tríade por grupo acoplado)

| Tarefa    | Papel          | Perfil              | Modelo/esforço | Lock                                    | Depende de | Entrega                                                                                                                                                   |
| --------- | -------------- | ------------------- | -------------- | --------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect      | architect-blueprint | Opus / alto    | `MOD-shared-roles`, `MOD-ddl-05`        | —          | tabela de regras `dashboard:*` × papéis (fonte: contrato §2–§4), mapa papel→camada, critérios em comandos; DDL `05-role-catalog.sql` (restrição + linhas) |
| TASK-0002 | Inspector      | inspector-tests     | Sonnet / médio | `MOD-shared-policy-spec`                | TASK-0001  | `policy.spec.ts` estendido (36 papéis, regras, camadas, N3 negado); pode falhar até TASK-0003                                                             |
| TASK-0003 | Engineer       | engineer-backend    | Sonnet / médio | `MOD-shared-roles`, `MOD-shared-policy` | TASK-0002  | `roles.ts`, `policy.ts` (regras + camadas), `tools/check-role-catalog.ts`; testes verdes                                                                  |
| TASK-0004 | Owner delegado | transcriber-docs    | Sonnet / baixo | `MOD-docs-arch`                         | TASK-0003  | build pack §WP-D0 executado, `decision-closure-plan.md`, `backlog.md`                                                                                     |

CTG-0001 = TASK-0001…0003. TASK-0004 é simples.

## Critérios de aceitação (comandos → resultado)

- `pnpm --filter @detran/shared test` → todos os testes passam, incluindo os novos.
- `pnpm verify:role-catalog` → `check-role-catalog: OK (36 roles, 10 RAIT)` (ou contagem equivalente com a família DASHBOARD listada).
- `pnpm verify:rls-ddl` → OK (tabela de catálogo é referência sem tenant).
- `DB_NAME=detran_r3 bash backend/database/apply.sh --full` em banco limpo → `apply.sh: done`; `psql -c "select count(*) from auth.role_catalog"` → 36.
- `pnpm check` → verde.
- `node tools/docs/kb/check.mjs` → 521 artefatos, 446 tokens (nenhum documento de produto editado).

## Mapa entregável → definições

| Entregável           | Definição                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| papéis               | `docs/framework/product/shared/actors.md` §Papéis granulares DASHBOARD; steering H.38             |
| regras `dashboard:*` | `docs/framework/arch/dashboard-route-contract.md` §1–§4; `dashboard-frontends.md` §3              |
| camadas N0…N3        | `RN-DASH-170`, `RN-DASH-171`; `dashboard-frontends.md` §3                                         |
| erros                | `docs/framework/arch/dashboard-error-catalog.md` §3 (`DASH.LAYER_*`, `DASH.PURPOSE_*`)            |
| padrão de código     | `RAIT_*_RULES` em `policy.ts` (mesma forma: constantes de papéis + regras + `Object.fromEntries`) |

## Riscos

- `policy.ts` é lock compartilhado com `param-store` (R-0004): quem mesclar depois rebaseia; o
  conflito esperado é só na lista de importação/ordem das regras.
- A família `dashboard` na restrição do DDL exige recriação apenas em banco novo (`apply.sh --full`); em
  banco existente a restrição precisa de `ALTER TABLE ... DROP CONSTRAINT ... ADD CONSTRAINT`,
  a incluir no DDL de forma idempotente.

## Bloqueios

(nenhum)

## Retomada

(vazio — preenchido pelo maestro em `checkpoint`)

## Leitura

(preenchido pelo maestro: sha de `main`, arquivos lidos)
