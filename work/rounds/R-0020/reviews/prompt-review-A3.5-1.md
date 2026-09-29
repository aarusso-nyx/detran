Return exactly one JSON object. First character `{`, last character `}`. No Markdown fences or prose outside JSON.

# Revisão cruzada dos prompts TASK-0021/0022 — guarda PC-B

Você é Claude Code Opus 5.5, reviewer da outra família, Auditor constitucional. Somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`. Este é ciclo 1 de até 4 do **prompt-review** A3.5. `PASS` libera disparo dos workers em ordem Inspector→Engineer; não aplica PCs, TASKs históricas nem selos.

Leia `docs/meta/agents/orchestra/reviewer-prompt.template.md` (rubrica integral), `.devai/pin/constitution.md` Arts. 6/7/9/10, `work/rounds/R-0020/prompts/00-maestro.md` §§3–8, `plan.md` §Tarefas e §Retomada, `AUTHORIZATION-A3.2-A3.3-PARTIAL-2026-09-28.md` §§2B/3A, `contracts/CTG-0003-A3.5-archive-guard.md` SHA-256 `f874e0f318f472a33087adc3a91de4171e8adeadbe223792430c00004c0dd77f`, `reviews/A3.5-proposal-review-3.json`, `prompts/TASK-0021.md` SHA-256 `0be789e08aed2f7e66e91b78ff22014a4c0050e5188315c26cc030d01a58219b`, `prompts/TASK-0022.md` SHA-256 `11bfdaf94c7fd767fa0f4de77351dddbf38be455150aef32868fdbe8cdc6cba1`, `tasks/TASK-0021.json`, `tasks/TASK-0022.json` e suas entradas em `compositions.json`. Consulte scripts/testes citados nos prompts somente para verificar escopo e comandos. Não escreva arquivos.

Verifique a tríade refinada sem CTG/PR novo, IDS/PC/hashes, schema, lock e dependências, modelos, fontes fechadas, fronteiras de Art. 6, testes RED antes de Engineer, ausência de escrita histórica/DEVAI pelo worker, manifesto pré-migração GREEN sem antecipar PCs e comandos de aceitação executáveis. Em especial, identifique qualquer contradição entre `pre-migration` sem índice e testes de fail-closed, entre outputs de runner e permissão de escrita, e entre `pnpm check` e gate histórico de TASKs. Diga se os prompts bastam a workers sem contexto de conversa. Responda JSON estrito:

{"mode":"prompt-review","round":"R-0020","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}.
