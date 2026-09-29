Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão cruzada do RGR TASK-0013

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `work/rounds/R-0020/reports/RGR-TASK-0013-sensor-kind-schema.md`, `work/rounds/R-0020/reports/TASK-0013.md`, `work/rounds/R-0020/contracts/CTG-0004.md`, `tools/devai/tests/sense.test.mjs`, `tools/devai/sense.mjs`, `package.json` e as fontes instaladas `node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json`, `sense-presets.json`, `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/sensor-reading.schema.json`. Confira por comparação determinística se os quatro kinds citados estão em registry/preset mas faltam no enum, se o arquivo parcial contorna essa restrição, e se a disposição `rgr_pending` sem commit de entrega é coerente com o contrato, a Constituição pinada e A1-3=B. Verifique também os links upstream informados; se a ferramenta de rede estiver indisponível, indique essa limitação sem inferir o conteúdo remoto.

Esta é revisão de diagnóstico, não delivery-review. Nenhum resultado autoriza omitir os kinds, afrouxar schema, registrar leitura real, abrir PR ou mesclar CTG-0004. Aponte afirmações inexatas e correções concretas. Não execute nenhum sensor ou comando com `--write`.

Responda JSON estrito:
{"mode":"rgr-review","round":"R-0020","task_id":"TASK-0013","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
