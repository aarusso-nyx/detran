# Prompt-review 3 — atualização CTG-0003 (R-0020)

Você é Claude Code Opus 5.5, reviewer da outra família, papel Auditor. Trabalhe somente em leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`. Responda apenas JSON puro no formato do reviewer-prompt.template.md, sem cerca Markdown.

## Escopo deste ciclo

O ciclo 2 teve PASS nos prompts originais. Esta revisão é uma avaliação exaustiva apenas das alterações em `prompts/TASK-0007.md`…`TASK-0010.md` e de sua coerência com `contracts/CTG-0003.md`, `tasks/TASK-0007.json`…`TASK-0010.json` e `compositions.json`. Não reabra prompts que não mudaram. Verifique a suficiência das listas fechadas de leitura, autoridade por caminho, papéis, predecessores, decisões Owner, comandos existentes e a proibição de DEVAI `--write` por workers.

## Fontes obrigatórias

1. `docs/meta/agents/orchestra/reviewer-prompt.template.md` (rubrica, veredito e JSON de saída).
2. `work/rounds/R-0020/AUTHORIZATION.md` e `AUTHORIZATION-CTG3-2026-09-28.md`.
3. `work/rounds/R-0020/contracts/CTG-0003-R18-proposal.md` e `contracts/CTG-0003.md`.
4. `work/rounds/R-0020/plan.md` §§ tarefas, decisões e retomada.
5. Os quatro prompts e JSONs de tarefas alterados, `compositions.json` e `reports/TASK-0007.md`.

## Alterações a julgar

- R-0017 está selada e excluída da fila; R-0018 tem autorização específica para PC corretivo append-only, sem ID presumido.
- OD-R20-001=A e OD-R20-002=B autorizadas; a seção canônica de ODs e anexos D-1/D-2 foram atualizados.
- A escrita `round close`, `round seal`, índice e evidência pertence ao maestro; TASK-0008/0009/0010 são sequenciais e dependem do contrato.
- `prompt_composition_id` e SHA foram recompostos para TASK-0007…0010 após a edição.

## Saída

`{"mode":"prompt-review","round":"R-0020","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}`
