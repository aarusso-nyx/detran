Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão do prompt Engineer TASK-0013

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `AGENTS.md`, `work/rounds/R-0020/prompts/00-maestro.md` §§4–9, `work/rounds/R-0020/plan.md` §Metas/Tarefas/Critérios/Decisões, `work/rounds/R-0020/contracts/CTG-0004.md`, `work/rounds/R-0020/reports/TASK-0012.md`, `tools/devai/tests/sense.test.mjs`, `work/rounds/R-0020/prompts/TASK-0013.md`, `work/rounds/R-0020/tasks/TASK-0013.json`, a entrada TASK-0013 em `work/rounds/R-0020/compositions.json`, `package.json` e os dois JSONs instalados `node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json` e `sense-presets.json`. Inspecione o diff do prompt/composição/TASK.

TASK-0012 produziu 14 REDs individuais por ausência de `sense.mjs`, com seam proposta `runSense({preset,round?,execute})`. A1-3=B mantém quatro PASS reais como gate de merge; A1-1/A1-2 pendentes. A rota corrigida do scorecard só está no `main` upstream, não em release publicada. O prompt novo permite implementar wrapper e script, mas proíbe execução protegida; a entrada CLI sem parâmetros é segura e o critério de leituras reais fica declarado não cumprido até as autorizações e a release. SHA-256 `16a6a08e10fe7e21eb3a4f49d2c03274fcd58559f2f852537de3d02ded23247d`, `PC-16a6a08e10fe7e21`.

Audite se isso preserva os critérios e gates, a ordem RED→GREEN, fronteiras de escrita, fonte suficiente e decisão A1. Diga se o Engineer pode ser despachado para a implementação independente, sem execução de sensores. Não revise a entrega nem autorize merge.

Responda JSON estrito:
{"mode":"prompt-review","round":"R-0020","task_id":"TASK-0013","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
