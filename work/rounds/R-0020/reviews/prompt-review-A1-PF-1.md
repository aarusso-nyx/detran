Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão de adenda e prompts A1-PF, ciclo 1

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `work/rounds/R-0020/AUTHORIZATION-A1-PREFLIGHT-2026-09-29.md`, `work/rounds/R-0020/contracts/CTG-0004-A1-policy-preflight.md`, `work/rounds/R-0020/reports/RGR-TASK-0013-sensor-kind-schema.md`, `work/rounds/R-0020/prompts/TASK-0029.md`, `work/rounds/R-0020/prompts/TASK-0030.md`, ambos os JSONs TASK, suas entradas em `compositions.json`, `work/rounds/R-0020/plan.md` M14 e topologia CTG-0004, as três fontes DEVAI instaladas registry/presets/schema e `package.json` para a posição da cadeia `check`. Confira hashes/PCs e validade da decomposição: TASK-0029 deve caracterizar o verificador antes de TASK-0030; TASK-0030 pode implementar o preflight, mas não retomar TASK-0013 nem modificar DEVAI. Confirme que as populações/tier sets/ordem e os quatro kinds ausentes estão corretos na fonte instalada, que o teste não se torna falsamente RED após pin futuro, e que o FAIL real permanece gate sem enfraquecimento. A1-1/A1-2 e A1-3=B ficam intactos.

Não execute sensor, `--write`, instalação nem edite arquivos. Isto é prompt-review, não revisão de entrega ou autorização de PR/merge.

Responda JSON estrito:
{"mode":"prompt-review","round":"R-0020","group":"CTG-0004-A1-PF","cycle":1,"verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
