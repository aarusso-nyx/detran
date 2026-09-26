# Iteração restrita 3 — `TASK-0003` (`engineer-backend`, escalada a Opus 5.5) — delivery-review-CTG-0001-2

> Worker da orquestra `index-state`, rodada `R-0018`, worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Nunca execute `git` que escreva, nunca
> instale pacotes, nunca altere testes. Declare na primeira linha: **Papel: Engineer**.

Continuação de `work/rounds/R-0018/prompts/TASK-0003.md`, restrita ao achado único de
`work/rounds/R-0018/reviews/delivery-review-CTG-0001-2.json`. Escalada de nível (método §6): a
iteração 2 corrigiu parcialmente o achado.

## Leitura (lista fechada)

1. `work/rounds/R-0018/reviews/delivery-review-CTG-0001.json` (achado 1) e
   `delivery-review-CTG-0001-2.json`
2. `work/rounds/R-0018/contracts/CTG-0001.md` §3.4, §6.5, §7.1, §7.2, §Adendas
3. `tools/docs/state-index/check.mjs`; os testes da iteração 3 em `tools/docs/state-index/tests/gate.test.mjs`

## Pode tocar

`tools/docs/state-index/check.mjs` — somente a validação de §Aliases.

## Tarefa

Validar **cada linha** de §Aliases (não só a primeira por stub): as quatro colunas contra o stub citado
e o alvo dele, para stubs de `docs/meta/adr` e (modo `migrated`) de `law/adr`; exigir **exatamente uma**
linha por stub (duplicata → achado); linha sem stub válido → achado. Ids de achado conforme o contrato
e os testes.

## Critérios de aceitação

- `pnpm test:state-index` → todos passam, 0 falhas.
- `pnpm verify:state-index` → `verify:state-index OK: …` (saída integral).
- `node_modules/.bin/prettier --check tools/docs/state-index` → OK.

Entrega: formato de `TASK-0003.md` §Entrega, `Tarefa: TASK-0003 (iteração 3)`.
