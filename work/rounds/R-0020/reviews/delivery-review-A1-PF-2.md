Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão dirigida da entrega A1-PF, ciclo 2

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional, somente leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `work/rounds/R-0020/reviews/delivery-review-A1-PF-1.json`, `work/rounds/R-0020/contracts/CTG-0004-A1-policy-preflight.md`, `tools/devai/tests/sensor-policy.test.mjs` (commit Inspector `00255d1e`), `tools/devai/verify-sensor-policy.mjs` e `package.json`. Revise apenas as quatro observações low do ciclo 1: invocação da CLI via symlink sem falso verde; diagnóstico `SENSOR_KIND_NOT_IN_SCHEMA` com `registryPath` e `presets`; overrides de fixtures exigindo trio completo e flags com `--`; reforço das assertions e dos casos de borda Inspector. Verifique se a remediação preserva o contrato e não toca TASK-0013 ou fontes DEVAI.

O maestro repetiu 23/23 testes PASS, zero skip/todo; Prettier específico PASS; `pnpm verify:sensor-policy` real exit 1 com somente quatro kinds RGR, `registry.entries[52..55]`, `presets:["sweep"]`, counts 4/12/20/49. Não execute sensores, `devai sense run|record`, `--write`, `--publish`, instalação nem Git com escrita. Esta revisão não autoriza PR nem conclui CTG-0004.

Responda JSON estrito:
{"mode":"delivery-review","round":"R-0020","group":"CTG-0004-A1-PF","cycle":2,"verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
