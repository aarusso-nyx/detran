# TASK-0032 — sensores independentes DDL05

Papel Art. 6: **Inspector**. Modelo `gpt-5.6-sol/high`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`. Declare o papel. Exige prompt-review PASS e contrato
TASK-0031 concluído; um escritor global, lock `MOD-role-catalog-ddl`, limite
1/1. Sem DB apply, seed ou conexão nesta tarefa.

## Leitura fechada e precedência

Leia integralmente: `AGENTS.md`, `CODESTYLE.md`,
`.devai/pin/constitution.md`, `docs/meta/agents/inspector-tests.md`,
`docs/framework/arch/rait-test-strategy.md`,
`docs/framework/arch/rait-fixtures.md`, `work/rounds/R-0007/plan.md`,
`work/rounds/R-0007/reports/TASK-0029-V3-DDL05-REFERENCE-GAP.md`,
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-DDL05-CYCLE.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-OD-V3-DDL05-IDEMPOTENCE.md`,
`backend/database/ddl/05-role-catalog.sql`,
`backend/database/ddl/14-inf-lifecycle-vocabulary.sql`,
`backend/domains/shared/src/roles.ts`, `tools/check-role-catalog.ts`,
`backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`,
`backend/domains/inf/rait-case/package.json`, `package.json`,
`tools/parameters/tests/generator.test.mjs`. O contrato TASK0031 especifica
somente idempotência DDL05; não altera política DDL14 ou sensor0028.

## Única allowlist de escrita

- `backend/database/tests/ddl05-role-catalog.test.mjs`
- `backend/database/tests/ddl05-role-catalog.integration.test.mjs`

O primeiro arquivo é teste Node estático independente: verificar chave
`ON CONFLICT`, sete SETs canônicos, guarda `IS DISTINCT FROM` null-safe sobre
exatamente esses sete campos e exclusão de `created_at`/`updated_at` da causa,
preservação do catálogo de 36 keys, nenhum skip/todo. RED real no DDL05
pré-correção por falta de guarda, não por arquivo/infra ausente; congelar SHA.
Não codificar só uma string de resultado ou aceitar qualquer WHERE decorativo.

O segundo arquivo é sensor PostgreSQL **futuro**, com URL/admin e banco
`detran_r7_ctg1_a2` explícitos, `BEGIN`/`ROLLBACK` garantido em `finally`,
testando linha canônica igual (timestamp/row intactos), divergente (campos
restaurados e timestamp muda), repetição estável e inserção de chave ausente
quando fixture sem FK permitir. Se fixture de ausência não puder ser criada
sem romper FK, registrar limitação objetiva no teste/relatório, não inventar
PASS. Não usar NULL em colunas NOT NULL; cobrir null-safe estaticamente. Não
executar este arquivo nesta fase; ausência de URL não vira skip/PASS.

Aceite agora: `node --test backend/database/tests/ddl05-role-catalog.test.mjs`
→ coleta positiva, RED contratual preciso; `node --check` de ambos os arquivos
e `pnpm exec prettier --ignore-path /dev/null --check` → PASS. Não conectar
DB, editar DDL, checker, roles, seed, sensor0028, work/, record/ ou .devai/.
Entrega: nomes/contagem PASS/FAIL, hashes dos dois sensores, resultado RED,
DB pendente e limitações. Sem git commit/push/PR/merge.
