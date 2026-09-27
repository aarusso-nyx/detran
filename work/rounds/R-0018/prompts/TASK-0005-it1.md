# Iteração 1 — `TASK-0005` (`transcriber-docs`) — redespacho isolado (T8) com a Adenda A1

> Worker da orquestra `index-state`, rodada `R-0018`, worktree
> `/Users/aarusso/Development/detran-worktrees/index-state`. Declare na primeira linha: **Papel:
> Architect (transcrição)**.

Esta iteração **refaz do zero** a tarefa de `work/rounds/R-0018/prompts/TASK-0005.md` (mesmas regras,
leitura, fronteira, critérios e formato de entrega — leia-o inteiro), com duas diferenças:

1. **Adenda A1** do contrato (`work/rounds/R-0018/contracts/CTG-0002.md` §Adendas): no bloco de
   `model-ladder.md`, o cabeçalho `Papel Art. 6` passa a `Papel Art. 7`; critério novo **C-02-33**.
2. **Por que refazer (T8):** a tentativa 1 apagou, com `git checkout --` e `rm`, arquivos de outros
   workers que ela julgou "efeito colateral". O maestro restaurou os arquivos da sua fronteira à base
   `7d6bd665`. Você está **sozinho** na worktree agora.

Regras reforçadas (sem exceção):

- **Nenhum comando `git` que escreva**: nada de `checkout`, `restore`, `reset`, `stash`, `clean`,
  `add`, `commit`, `apply` sem `--check`. Nenhum `rm` fora da sua fronteira.
- Arquivos **fora** da sua fronteira que apareçam modificados ou novos (`git status`) **não são
  seus**: não os toque, não os "reverta", apenas os liste no relatório.
- Se o seu `pnpm docs:check` gerar `docs/site/build/` ou `docs/site/.docusaurus/` (ignorados pelo
  git) e isso atrapalhar outro gate, apenas relate; o maestro remove a saída de build.

Critérios: os de `TASK-0005.md` (C-02-01 … C-02-18, C-02-26, C-02-27) **mais C-02-33**.

Entrega: formato de `TASK-0005.md` §Entrega, com `Tarefa: TASK-0005 (iteração 1)`; o relatório é a
resposta final, gravado pelo maestro.
