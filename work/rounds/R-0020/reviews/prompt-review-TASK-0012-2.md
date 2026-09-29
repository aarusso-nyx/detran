Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão do prompt Inspector TASK-0012, ciclo 2

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `work/rounds/R-0020/reviews/prompt-review-TASK-0012-1.json`, `work/rounds/R-0020/prompts/TASK-0012.md`, `work/rounds/R-0020/tasks/TASK-0012.json`, a entrada TASK-0012 de `work/rounds/R-0020/compositions.json`, `work/rounds/R-0020/contracts/CTG-0004.md` e os dois JSONs instalados em `node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json` e `sense-presets.json`. O ciclo 1 deu REVIEW por interface do wrapper não definida e quatro lows. A correção autoriza o Inspector a propor um ponto de injeção dentro do teste, com parâmetros não fonteados `source_pending`, import dinâmico por caso para RED individual, fontes de registry/presets, casos de repetibilidade/status/confidence e runner `node:test`. O RED é aceito só nesta tarefa, sem `skip`/`todo` e sem executar `pnpm check` como seu gate.

SHA-256 do prompt `b129416e00b1ac34d02f76ffddf2fd24242c9bf10df1d976f146819fb8f98469`, ID `PC-b129416e00b1ac34`. Confirme resolução de cada achado, fronteira e composição. Diga se o worker Inspector pode ser despachado para escrever somente testes RED; não revise entrega nem autorize merge.

Responda JSON estrito:
{"mode":"prompt-review","round":"R-0020","task_id":"TASK-0012","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
