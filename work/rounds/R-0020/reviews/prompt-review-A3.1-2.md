# Prompt-review A3.1 ciclo 2 — correções do ciclo 1

Você é Claude Code Opus 5.5, reviewer da outra família, papel Auditor, somente leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`. Responda apenas JSON puro. Avalie exclusivamente as correções dos achados em `work/rounds/R-0020/reviews/prompt-review-A3.1-1.json`; não reabra texto inalterado. Um achado novo só é admissível se for FAIL por contradição canônica ou fronteira e explicar por que não surgiu antes. Use rubrica e formato de `docs/meta/agents/orchestra/reviewer-prompt.template.md`.

Correções:

1. High item 4: `package.json` agora declara `verify:task-originals`; `prompts/TASK-0009.md` exige o script e exit 0 sobre a árvore real pós-migração; `contracts/CTG-0003-A3.md`, `contracts/CTG-0003.md` e `plan.md` o tornam gate separado e obrigatório antes de TASK-0010/seal. Está explícito que não entra implicitamente em `pnpm check`.
2. High item 6: `prompts/TASK-0008.md` lê `reports/A3-implementation-design.md`, scripts e testes atuais; o critério enumera falha parcial, arquivo com outra pendência intacto, idempotência, colisão de alias, sidecar ausente/órfão, par de tags exato, literal diferente de `none`, tags prospectivas e recusa de A3.2. O Inspector está caracterizando essas fixtures RED antes da implementação.
3. Low item 5: `prompts/TASK-0009.md` distingue INV não `INV-*` e aliases A3 já autorizados das classes específicas A3.2 ainda não autorizadas; R-0007 TASK-0079/0081 aguardam conferência Inspector e EX/PC.
4. Low item 2: Tarefa, escopo e entrega de `prompts/TASK-0008.md` citam os três arquivos de teste, todos na leitura fechada, mais os dois módulos existentes; `plan.md` e TASK JSON concordam.
5. Low item 4: `contracts/CTG-0003-A3.md` e `prompts/TASK-0009.md` fixam `reports/A3-migration-before-after.json` como relatório determinístico gerado pelo normalizador e lido pelo verificador. O Inspector recebeu a exigência para o fixture.
6. Os hashes de `prompts/TASK-0008.md` e `TASK-0009.md` foram recompostos em `compositions.json` e nos dois campos de cada TASK JSON. `AUTHORIZATION-A3.1-2026-09-28.md` e a allowlist não mudaram.

Fontes: `reviews/prompt-review-A3.1-1.json`, os caminhos citados acima, `work/rounds/R-0020/tasks/TASK-0008.json`/`TASK-0009.json`, `work/rounds/R-0020/compositions.json`, `work/rounds/R-0020/AUTHORIZATION-A3-2026-09-28.md`, `work/rounds/R-0020/AUTHORIZATION-A3.1-2026-09-28.md` e `law/schemas/task.schema.json`.

Saída: `{"mode":"prompt-review","round":"R-0020","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}`.
