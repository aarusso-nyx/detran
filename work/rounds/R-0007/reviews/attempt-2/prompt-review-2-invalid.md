# Tentativa técnica inválida — prompt-review 2

- A ponte `claude/opus` terminou com código 4 porque a resposta continha aspas não escapadas dentro
  do campo JSON `claim`; nenhum `prompt-review-2.json` válido foi produzido e nenhum veredito conta.
- O fragmento recuperável apontou que TASK-0015 não poderia fechar typecheck/build depois de editar
  dependências workspace sem que o pnpm atualizasse lockfile e links, operação proibida ao worker.
- Correção incorporada antes do retry técnico: PREP-WIRING exclusivo do maestro materializa as seis
  dependências workspace e faz commit separado antes de TASK-0015; o worker deixa de tocar o
  manifesto e recebe os links prontos.
