Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão do prompt Inspector TASK-0012

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional. Faça somente leitura em `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `AGENTS.md`, `work/rounds/R-0020/prompts/00-maestro.md` §§4–7, `work/rounds/R-0020/plan.md` §Tarefas/Decisões/Critérios, `work/rounds/R-0020/contracts/CTG-0004.md`, `work/rounds/R-0020/reports/TASK-0011.md`, `work/rounds/R-0020/prompts/TASK-0012.md`, `work/rounds/R-0020/tasks/TASK-0012.json` e a entrada TASK-0012 em `work/rounds/R-0020/compositions.json`. Inspecione o diff dos arquivos de prompt/composição/TASK.

TASK-0011 concluiu com contrato condicional: A1-3=B e quatro PASS reais são gate de merge; A1-1 e A1-2 pendentes; DEVAI 1.5.6 pinado e correção de scorecard ainda não publicada. O Inspector deve criar somente `tools/devai/tests/sense.test.mjs`, sem efeitos DEVAI `--write`, e caracterizar wrapper RED antes do Engineer. SHA-256 do prompt `1d73d9ced21e534d363cd159f4011f25f6536b838bb9770e2ad026d6097050bb`, ID `PC-1d73d9ced21e534d`.

Audite fronteira, dependência, exatidão factual, fontes fechadas, critérios e composição. Diga se há bloqueio para despachar o worker Inspector apenas para testes RED independentes das decisões e da release. Não revise a entrega nem autorize merge.

Responda JSON estrito:
{"mode":"prompt-review","round":"R-0020","task_id":"TASK-0012","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
