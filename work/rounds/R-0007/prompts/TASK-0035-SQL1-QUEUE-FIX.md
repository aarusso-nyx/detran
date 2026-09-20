# TASK-0035 — correção delimitada da ordenação legal

Papel Art. 6: **Engineer**. Modelo `gpt-5.6-sol/high`. Worktree `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch `orchestra/rait-backend`. Declare o papel. Limite 1/1, escritor único, lock `MOD-rait-case`. Dependência: TASK-0034 RED legítimo e SHA congelado, prompt-review corretivo PASS. Não antecipar TASK-0021 4/4 nem adquirir lock compartilhado R-0010.

## Leitura fechada

Leia integralmente `AGENTS.md`, `CODESTYLE.md`, `.devai/pin/constitution.md`, `docs/meta/agents/engineer-backend.md` (se este nome diferir, STOP e comunique; não buscar manual alternativo silenciosamente), `work/rounds/R-0007/plan.md`, `work/rounds/R-0007/contracts/CTG-0001.md`, `work/rounds/R-0007/contracts/CTG-0001-C4.md`, a seção final SQL review1 de `work/rounds/R-0007/contracts/CTG-0001-C4-OD.md`, seção correspondente de `work/rounds/R-0007/reports/CTG-0001-C4-OD-PLAN.md`, `work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v3-review-sql-1.json`, `work/rounds/R-0007/prompts/C4-OD-V3-INDEX.md`, `backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`, `backend/domains/inf/rait-case/tests/unit/rait-case-command-contract.spec.ts`, `backend/domains/inf/rait-case/vitest.config.ts`, `backend/domains/inf/rait-case/package.json`. CTG base, C4 complemento, adendo SQL1 prevalece apenas no achado SQL1-F3.

## Allowlist e prova

Editar somente `backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`, e apenas o `ORDER BY` do claim-next. Substituir ordenação lexical por `CASE` que atribui 2 a `level_2`, 1 a `level_1`, 0 a demais valores, `DESC`, e mantém `protocolled_at ASC, id ASC`. Não alterar filtros, tenant, locks, transação, DTOs, Clock, outros comandos ou testes. Se o menor reparo demandar outro path, STOP reference-gap.

Rodar `DETRAN_TEST_TIER=unit pnpm --filter @detran/inf-rait-case exec vitest run --config vitest.config.ts --passWithNoTests=false tests/unit/rait-case-command-contract.spec.ts` → coleta positiva e GREEN do sensor congelado, SHA inalterado. `pnpm exec prettier --ignore-path /dev/null --check backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts` e `git diff --check -- backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts` → PASS. Relatar typecheck/build impedidos pelo Clock ausente, sem alegar PASS de runtime. Entrega: papel, hash sensor antes/depois, diff e comandos/resultados, SQL1-F3. Sem DB, geração, commit/push/PR/merge, sibling, record ou .devai.
