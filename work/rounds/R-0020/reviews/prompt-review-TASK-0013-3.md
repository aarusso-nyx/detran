Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão do prompt Engineer TASK-0013, ciclo 3

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `work/rounds/R-0020/reviews/prompt-review-TASK-0013-2.json`, `work/rounds/R-0020/prompts/TASK-0013.md`, `work/rounds/R-0020/tasks/TASK-0013.json`, a entrada TASK-0013 de `work/rounds/R-0020/compositions.json`, `package.json`, `work/rounds/R-0020/contracts/CTG-0004.md` e `tools/devai/tests/sense.test.mjs`. O ciclo 2 deu PASS com dois lows. A correção exige a lista completa, ordenada e sem duplicatas das etapas lint/build/test de `check`, jamais o script raiz `build` ou um app representativo; se a string `SensorReading.command` não representar a lista, a lacuna fica `source_pending`. Também define qualquer `sense run`/`sense record` real e kind não `read` como protegido e limita a validação do worker a testes com executor injetado e `pnpm devai:sense` sem parâmetros.

SHA-256 do prompt `e4dc8c527c1bc83078b21a855bc11c439958a8ad6c6a50385a89a5b8276b6eee`, ID `PC-e4dc8c527c1bc830`. Confirme resolução dos dois lows, vínculos e aptidão do despacho Engineer sem execução de sensores. Não revise entrega nem autorize merge.

Responda JSON estrito:
{"mode":"prompt-review","round":"R-0020","task_id":"TASK-0013","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
