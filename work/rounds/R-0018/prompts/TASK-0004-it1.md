# Iteração restrita 1 — `TASK-0004` (`transcriber-docs`) — Adendas A3 e A4

> Worker da orquestra `index-state`, rodada `R-0018`, worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Nunca execute `git` que escreva, nunca
> instale pacotes, nunca altere testes nem ferramentas. Declare na primeira linha: **Papel: Architect
> (transcrição)**.

Esta iteração vale como continuação de `work/rounds/R-0018/prompts/TASK-0004.md` (mesmas regras e
formato de entrega), restrita a dois itens.

## Leitura (lista fechada)

1. `work/rounds/R-0018/contracts/CTG-0001.md` §4 (item 3), §9 ("Nota de status em ADR aceita") e
   §Adendas (A3, A4)
2. `docs/meta/adr/ADR-0035-adr-numbering-policy.md`; `docs/meta/adr/ADR-0006-detran-ui-kit.md` (l. 1-10)

## Pode tocar

- `docs/meta/adr/ADR-0035-adr-numbering-policy.md` — somente o trecho do item 3 fixado pela A3.
- `docs/meta/adr/ADR-0006-detran-ui-kit.md` — somente acrescentar a linha literal do §9 logo após a
  l. 6 (A4). Nenhuma outra linha dessa ADR aceita muda.

## Tarefa

Aplicar A3 e A4 literalmente.

## Critérios de aceitação

- `pnpm docs:kb:check` → OK.
- `grep -c 'Angular and STYNX pins superseded by' docs/meta/adr/ADR-0006-detran-ui-kit.md` → 1;
  `git diff --stat -- docs/meta/adr/ADR-0006-detran-ui-kit.md` → 1 inserção, 0 remoções.
- `pnpm docs:check` → OK (as dependências de `docs/site` já foram instaladas pelo maestro).
- `node_modules/.bin/prettier --check docs/meta/adr/ADR-0035-adr-numbering-policy.md docs/meta/adr/ADR-0006-detran-ui-kit.md` → OK.
- `pnpm verify:state-index` → relate a saída (o achado C-01-15 de `DESIGN-DECISIONS.md:15` é resolvido
  em paralelo pelo TASK-0003 iteração 1; não o corrija).

Entrega: relatório no formato de `TASK-0004.md` §Entrega, com `Tarefa: TASK-0004 (iteração 1)`.
