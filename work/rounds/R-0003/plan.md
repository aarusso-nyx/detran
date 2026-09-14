# R-0003 — frente `dash-roles` (WP-D0 do DASHBOARD)

**Status:** fechada em 2026-09-14 como `PC-0001`, após entrega aceita e mesclada pelo PR #32
(`cf8f475eaf1951fa2ebb3c42d24f725c6581ea0e`) e observação pós-merge. Reviewer: GPT-5.6 Terra
via `tools/orchestra/bridge.sh codex`.

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

| Tarefa    | Papel          | Perfil              | Modelo/esforço | Lock                                      | Depende de | Entrega                                                                                                       |
| --------- | -------------- | ------------------- | -------------- | ----------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect      | architect-blueprint | Opus / alto    | `MOD-shared-roles`, `MOD-ddl-05`          | —          | contrato executável de regras/camadas; DDL `05-role-catalog.sql` (restrição idempotente + duas linhas)        |
| TASK-0002 | Inspector      | inspector-tests     | Sonnet / médio | `MOD-shared-policy-spec`, `MOD-role-gate` | TASK-0001  | `policy.spec.ts` e `check-role-catalog.ts` estendidos; falha esperada apenas pela implementação ainda ausente |
| TASK-0003 | Engineer       | engineer-backend    | Sonnet / médio | `MOD-shared-roles`, `MOD-shared-policy`   | TASK-0002  | `roles.ts`, `policy.ts` (regras + camadas); testes e gate verdes                                              |
| TASK-0004 | Owner delegado | transcriber-docs    | Sonnet / baixo | `MOD-docs-arch`, `MOD-dashboard-readme`   | TASK-0003  | build pack §WP-D0 executado, README alinhado a blocos/camadas, `decision-closure-plan.md`, `backlog.md`       |

CTG-0001 = TASK-0001…0003, em ordem estrita. TASK-0004 é simples e só inicia após o CTG.
Não há paralelismo útil nesta frente porque todas as tarefas estão encadeadas.

## Critérios de aceitação (comandos → resultado)

- `pnpm --filter @detran/shared test` → todos os testes passam, incluindo os novos.
- `pnpm verify:role-catalog` → `check-role-catalog: OK (36 roles, 10 RAIT)` (ou contagem equivalente com a família DASHBOARD listada).
- `pnpm verify:rls-ddl` → OK (tabela de catálogo é referência sem tenant).
- `DB_NAME=detran_r3 bash backend/database/apply.sh --full` em banco limpo → `apply.sh: done`; `psql -c "select count(*) from auth.role_catalog"` → 36.
- `pnpm check` → verde.
- `pnpm backend:test:unit` → verde; é o tier indicado para o WP-D0, que altera somente catálogo
  compartilhado, política e DDL, sem rotas de integração/e2e.
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

## Triagem

- TASK-0001 checkpoint: `sensor-error` — Prettier não infere parser para `.sql`; o DDL já é
  ignorado pelo gate e foi inspecionado separadamente. Reexecutar Prettier somente nos Markdown e
  manter `pnpm format:check` como sensor canônico.
- TASK-0001 checkpoint: `sensor-error` — a ponte grava o JSON do reviewer sem a formatação do
  repositório; normalizados os dois JSONs com Prettier e recalculados os `output_sha256` nos
  registros da ponte antes de reexecutar o gate.
- CTG-0001 checkpoint após TASK-0003: `reference-gap` — o contrato incluiu `AUDITOR`/`DPO` no
  conjunto derivado de `export:create`, mas simultaneamente fixa auditor/DPO como somente leitura;
  o teste confirmou a contradição em `dashboard:export:create`. Retorno à tríade, iteração 2, sem
  alterar o princípio canônico: auditor e DPO permanecem read-only.
- Delivery review ciclo 1: `reference-gap` — reviewer `FAIL` identificou ampliação não autorizada
  de `dashboard:alert:read` para `integration-operator`. A última iteração da tríade removeu a
  inferência no contrato, codificou o negativo no teste e retirou somente esse grant da política.
  Gates completos voltaram a verde; delivery review ciclo 2: `PASS`, sem findings.

## Retomada

- Concluídas: TASK-0001…TASK-0004, dois ciclos de prompt review, dois ciclos de delivery review,
  evidência CTG-0001, conciliação com `origin/main`, PR #32, CI e merge.
- Último veredito: delivery review ciclo 2 `PASS`, sem findings.
- Observação pós-merge: `EV-c02e644fc87284b3` no SHA
  `cf8f475eaf1951fa2ebb3c42d24f725c6581ea0e`; não promotora.
- Fechamento: `PC-0001`; resta integrar por PR os artefatos pós-merge, porque `main` é protegido e
  eles não podiam fazer parte do PR de entrega já integrado.

## Leitura

Leitura concluída pelo maestro Architect sobre `7b1e5526e5f8b1f8082709b8fca380e594a5ec4d`
(`origin/main` confirmado no mesmo commit antes da abertura da worktree):

- `AGENTS.md`; `CODESTYLE.md`; `docs/meta/agents/README.md`.
- `docs/meta/agents/orchestra/README.md`; `model-ladder.md`; `waves.md`.
- `docs/framework/arch/dashboard-build-pack.md` inteiro.
- Definições do WP-D0: `dashboard-route-contract.md` §1–§4;
  `dashboard-frontends.md` §3; `dashboard-error-catalog.md` §3;
  `docs/framework/product/shared/actors.md` §Papéis granulares DASHBOARD;
  `RN-DASH-170.md`; `RN-DASH-171.md`.
- `docs/framework/arch/parameter-catalogue.md` inteiro;
  `docs/meta/knowledge-base/decision-closure-plan.md` inteiro;
  `docs/meta/knowledge-base/steering.md` §H.
- `docs/meta/agents/{architect-blueprint,engineer-backend,engineer-frontend,inspector-tests,transcriber-docs}.md`.
- `work/rounds/R-0003/plan.md`; templates `task.template.json`,
  `worker-prompt.template.md`, `reviewer-prompt.template.md`; superfícies atuais
  `roles.ts`, `policy.ts`, `policy.spec.ts`, `05-role-catalog.sql`,
  `check-role-catalog.ts` e comandos existentes em `package.json`.
