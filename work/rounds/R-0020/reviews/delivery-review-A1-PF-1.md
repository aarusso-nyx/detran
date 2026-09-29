Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão de entrega A1-PF, ciclo 1

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional, em modo somente leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Revise exclusivamente a adenda de preflight CTG-0004 A1-PF: `work/rounds/R-0020/AUTHORIZATION-A1-PREFLIGHT-2026-09-29.md`, `contracts/CTG-0004-A1-policy-preflight.md`, prompts e reports TASK-0029/0030, testes `tools/devai/tests/sensor-policy.test.mjs`, o arquivo novo `tools/devai/verify-sensor-policy.mjs` e as duas mudanças de `package.json` em `git diff` contra `f8ca8d3e`. O prompt-review A1-PF ciclo 2 já foi PASS. TASK-0013 e o wrapper estão pausados por RGR; esta revisão não os libera.

Resultados repetidos pelo maestro: 14/14 testes de fixture PASS, zero skip/todo; Prettier específico PASS; `pnpm verify:round-tasks` 322/322; `pnpm verify:sensor-policy` real exit 1 com somente quatro `SENSOR_KIND_NOT_IN_SCHEMA` na ordem `decision_record_integrity`, `decision_citation_resolution`, `archive_immutability`, `round_record_integrity`, counts 4/12/20/49. A versão instalada segue incompatível por desenho; `pnpm check`/CI permanecem RED até release e pin corrigidos. Não execute sensores, `devai sense run|record`, `--write`, `--publish`, instalação nem Git com escrita.

Verifique: interface pura e CLI read-only, falha fechada, determinismo dos erros, integridade de registry/presets/schema, tiers e populações, sweep/excluded completos e ordenados, detecção exata dos kinds fora do enum, posição do gate no `check`, autoria por caminho, escopo de arquivos e ausência de qualquer atalho que transforme o pin real em verde. Considere se os testes e código deixam uma lacuna material. A revisão é da entrega A1-PF, não é delivery-review do CTG-0004 completo nem autorização para abrir PR.

Responda JSON estrito:
{"mode":"delivery-review","round":"R-0020","group":"CTG-0004-A1-PF","cycle":1,"verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
