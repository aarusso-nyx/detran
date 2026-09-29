Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão final do prompt Inspector TASK-0012, ciclo 4

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `work/rounds/R-0020/reviews/prompt-review-TASK-0012-3.json`, `work/rounds/R-0020/prompts/TASK-0012.md`, `work/rounds/R-0020/tasks/TASK-0012.json`, a entrada TASK-0012 de `work/rounds/R-0020/compositions.json`, e os JSONs instalados `node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json` e `sense-presets.json`. O ciclo 3 deu PASS com um low: o filtro `effect=read` vale somente para `sweep`. A linha de presets agora declara expressamente que `baseline` e `governed` incluem `build` (`local-write`) e `unit_test` (`harness-write`) e não devem ser filtrados.

SHA-256 do prompt `a42f57ba3a1193535a446b9c600f9eaba3782bf33e291e210ae659231685eda4`, ID `PC-a42f57ba3a119353`. Confirme a correção, o vínculo de composição e a aptidão do despacho de testes RED. Informe apenas achados acionáveis que realmente bloqueiem a fronteira ou a coerência; este é o último ciclo permitido. Não revise a entrega nem autorize merge.

Responda JSON estrito:
{"mode":"prompt-review","round":"R-0020","task_id":"TASK-0012","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
