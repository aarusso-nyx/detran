# Iteração restrita 2 — `TASK-0003` (`engineer-backend`) — delivery-review-CTG-0001

> Worker da orquestra `index-state`, rodada `R-0018`, worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Nunca execute `git` que escreva, nunca
> instale pacotes, nunca altere testes. Declare na primeira linha: **Papel: Engineer**.

Continuação de `work/rounds/R-0018/prompts/TASK-0003.md` (mesmas regras e formato de entrega),
restrita aos três achados de `work/rounds/R-0018/reviews/delivery-review-CTG-0001.json`.

## Leitura (lista fechada)

1. `work/rounds/R-0018/reviews/delivery-review-CTG-0001.json`
2. `work/rounds/R-0018/contracts/CTG-0001.md` §3.4, §6.5, §7.1–§7.3, §9.1, §9.2, §Adendas
3. `tools/docs/state-index/check.mjs`; os testes novos da iteração 2 do Inspector em
   `tools/docs/state-index/tests/gate.test.mjs`

## Pode tocar

`tools/docs/state-index/check.mjs` — somente o necessário para os três achados.

## Tarefa

1. §Aliases: validar as quatro colunas de **todas** as linhas (número antigo, redirecionamento,
   número novo, arquivo novo) contra os stubs e arquivos reais; linha obsoleta ou ID divergente →
   C-01-05.
2. Série `law/adr`: reconhecer a linha pela citação entre crases (§6.5) também nas verificações de
   status (C-01-15/16), de ID exibido, de alvo e de duplicação.
3. Modo `migrated`: exigir a linha do stub de `law/adr` em §Aliases e rejeitar linha remanescente da
   série nos índices (C-01-11).

## Critérios de aceitação

- `pnpm test:state-index` → todos os testes passam, 0 falhas.
- `pnpm verify:state-index` sobre a worktree → `verify:state-index OK: …` (relate a saída integral).
- `node_modules/.bin/prettier --check tools/docs/state-index` → OK.

Entrega: relatório no formato de `TASK-0003.md` §Entrega, com `Tarefa: TASK-0003 (iteração 2)`.
