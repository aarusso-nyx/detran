# Iteração — `TASK-0011` (`transcriber-docs`) — fase 2 das linhas de fechamento

> Worker da orquestra `index-state`, rodada `R-0018`, worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Nunca execute `git` que escreva, nunca
> instale pacotes. Declare na primeira linha: **Papel: Architect (transcrição)**.

Continuação de `work/rounds/R-0018/prompts/TASK-0011.md` (mesmas regras e formato de entrega), agora
a **fase 2** do contrato `work/rounds/R-0018/contracts/CTG-0003.md` §5 (5.1, 5.2, 5.3), executada no
fechamento. O maestro já emitiu o closure (`record/proofs/compliance/closures/PC-*.json` com
`round_id` = `R-0018`) e os três CTGs estão mesclados em `main`.

## Leitura (lista fechada)

1. `work/rounds/R-0018/contracts/CTG-0003.md` §5 (inteiro)
2. As fontes indicadas nas tabelas de fontes do §5.1 e do §5.2, e só elas: `git log --first-parent
--format='%h %ad %s' --date=short origin/main` (leitura); `work/rounds/R-0018/tasks/*.json`;
   `ls work/rounds/R-0018/reviews/`; `work/rounds/R-0018/plan.md` §Bloqueios, §Triagem, §Decisões do
   maestro, §Adendas; `work/rounds/R-0018/budget.json`; o `PC-*.json` de `round_id` R-0018; a seção
   `## R-0018` de `docs/meta/knowledge-base/open-decisions-rait.md`
3. `work/rounds/R-0018/closure-facts.md` (fatos do fechamento medidos pelo maestro: PRs, merges, PC)

## Pode tocar

- `docs/meta/agents/orchestra/waves.md` — só os campos `` `source_pending (fechamento)` `` da linha R-0018
- `docs/meta/knowledge-base/backlog.md` — só os `` `source_pending (fechamento)` `` dos itens R-0018
- `work/rounds/README.md` — só a linha R-0018 (§5.3)

## Tarefa

Substituir cada `` `source_pending (fechamento)` `` pelo valor da fonte do §5.1/§5.2 e trocar a linha
R-0018 de `work/rounds/README.md` pela forma do §5.3, com os valores de `closure-facts.md`.

## Critérios de aceitação

- C-03-22: `git grep -n 'source_pending (fechamento)' -- docs/meta/agents/orchestra/waves.md docs/meta/knowledge-base/backlog.md work/rounds/README.md` → vazio.
- C-03-23 (parte do worker): `pnpm verify:state-index` → `OK` (a linha R-0018 "fechada" com o PC).
- `node_modules/.bin/prettier --check` nos três arquivos → OK; `pnpm docs:kb:check` → OK.

Entrega: formato de `TASK-0011.md` §Entrega, com `Tarefa: TASK-0011 (fase 2)`; o relatório é a
resposta final, gravado pelo maestro.
