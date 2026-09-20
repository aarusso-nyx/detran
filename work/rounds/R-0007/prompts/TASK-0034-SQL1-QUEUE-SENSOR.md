# TASK-0034 — sensor independente de ordenação legal

Papel Art. 6: **Inspector**. Modelo `gpt-5.6-sol/high`. Worktree `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch `orchestra/rait-backend`. Declare o papel. Limite 1/1, escritor único, lock `MOD-rait-case-tests`. Dependência: prompt-review corretivo PASS e TASK-0027 GREEN. Não conectar DB nem alterar produto.

## Leitura fechada

Leia integralmente `AGENTS.md`, `CODESTYLE.md`, `.devai/pin/constitution.md`, `docs/meta/agents/inspector-tests.md`, `work/rounds/R-0007/plan.md`, `work/rounds/R-0007/contracts/CTG-0001.md`, `work/rounds/R-0007/contracts/CTG-0001-C4.md`, a seção final SQL review1 de `work/rounds/R-0007/contracts/CTG-0001-C4-OD.md`, a seção correspondente de `work/rounds/R-0007/reports/CTG-0001-C4-OD-PLAN.md`, `work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v3-review-sql-1.json`, `work/rounds/R-0007/prompts/C4-OD-V3-INDEX.md`, `backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`, `backend/domains/inf/rait-case/tests/unit/rait-case-command-contract.spec.ts`, `backend/domains/inf/rait-case/vitest.config.ts` e `backend/domains/inf/rait-case/package.json`. CTG base, C4 complemento, adendo SQL1 final prevalece apenas nos três achados SQL1.

## Allowlist e prova

Editar somente `backend/domains/inf/rait-case/tests/unit/rait-case-command-contract.spec.ts`. Reusar `caseRuntime` e `runtime.queries` para executar o claim-next real, capturar sua consulta e exigir `CASE` explícito `level_2=2`, `level_1=1`, `ELSE 0`, `DESC`, desempate `protocolled_at ASC, id ASC`. `NULL` e string legada desconhecida recebem rank defensivo 0, sem torná-las elegíveis. Exigir RED contratual reproduzido no código atual, não erro de coleta/infra; congelar SHA antes de TASK-0035. Quando viável no ensaio autorizado futuro, executar no PostgreSQL a consulta real capturada, não somente uma expressão falsa em fixture. Prova integral de risco/elegibilidade segue em TASK-0020/0021.

Comando: `DETRAN_TEST_TIER=unit pnpm --filter @detran/inf-rait-case exec vitest run --config vitest.config.ts --passWithNoTests=false tests/unit/rait-case-command-contract.spec.ts` → coleta positiva e RED específico. `pnpm exec prettier --ignore-path /dev/null --check backend/domains/inf/rait-case/tests/unit/rait-case-command-contract.spec.ts` → PASS. Falha de tipo/build por Clock ausente é BLOCKED nesse gate, não corrigir fora desta allowlist. Entrega: papel, contagens, comandos/resultados, SHA congelado, referência SQL1-F3, blocker. Sem commit/push/PR/merge, sibling, record ou .devai.
