Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão da ordem dos presets, TASK-0012 ciclo 3

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `work/rounds/R-0020/reviews/prompt-review-TASK-0012-2.json`, `work/rounds/R-0020/prompts/TASK-0012.md`, `work/rounds/R-0020/tasks/TASK-0012.json`, a entrada TASK-0012 de `work/rounds/R-0020/compositions.json`, e os arquivos instalados `node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json` e `sense-presets.json`. O ciclo 2 deu PASS com um low: a ordem das listas `baseline`/`governed` difere da ordem do registry. O novo prompt pede conjunto exato para esses dois, marca a ordem `source_pending` e exige ordem do registry apenas no `sweep` de 49 `read`.

SHA-256 do prompt `d2a2d9e0b4b88247858fe584ed9b692def784f49a9540ad33913ed645ff6b1bf`, ID `PC-d2a2d9e0b4b88247`. Confirme a correção, o vínculo de composição e se o worker Inspector pode ser despachado somente para testes RED. Não revise a entrega nem autorize merge.

Responda JSON estrito:
{"mode":"prompt-review","round":"R-0020","task_id":"TASK-0012","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
