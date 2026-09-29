Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão do prompt Engineer TASK-0013, ciclo 2

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `work/rounds/R-0020/reviews/prompt-review-TASK-0013-1.json`, `work/rounds/R-0020/prompts/TASK-0013.md`, `work/rounds/R-0020/tasks/TASK-0013.json`, a entrada TASK-0013 de `work/rounds/R-0020/compositions.json`, `work/rounds/R-0020/contracts/CTG-0004.md`, `tools/devai/tests/sense.test.mjs`, `package.json` e `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/sensor-reading.schema.json`. O ciclo 1 deu PASS com quatro lows. A revisão atual: torna `pnpm check` global explícito; exige argv fonteado dos comandos de repo; impede `sense record` e consentimento implícito no script; usa o schema pinado sem nova dependência e exige confidence pelo contrato.

SHA-256 do prompt `19aa18951a1987df10fe1cb5d4142e5e4b643d7d15ede7a1d624a99f7eb3a350`, `PC-19aa18951a1987df`. Confirme resolução dos quatro lows, fronteira, testes RED→GREEN e composição. Diga se o Engineer pode ser despachado para implementação sem executar sensores protegidos. Não revise a entrega nem autorize merge.

Responda JSON estrito:
{"mode":"prompt-review","round":"R-0020","task_id":"TASK-0013","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
