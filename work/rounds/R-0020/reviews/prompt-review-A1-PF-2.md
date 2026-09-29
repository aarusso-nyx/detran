Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão dirigida A1-PF, ciclo 2

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional, somente leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `reviews/prompt-review-A1-PF-1.json`, `contracts/CTG-0004-A1-policy-preflight.md`, `prompts/TASK-0029.md`, `prompts/TASK-0030.md`, `tasks/TASK-0029.json`, `tasks/TASK-0030.json` e as entradas 0029/0030 em `compositions.json`, todos sob `work/rounds/R-0020/`. Revise somente as três observações low do ciclo 1: fixture coerente usa união sem duplicata e negativo cobre enum duplicado; conjuntos tier e contagens 4/12/20/49 são ambos exigidos, com mudança de release tratada como revisão de contrato; relatório Engineer explicita `pnpm check`/CI RED enquanto o pin atual divergir. Confirme os novos hashes de prompt `2cbf05613ad33c746aaf3fdc863f1b1e23b780ab65875108f5ac8f2b0d7150a9` e `4d87c5225effffcff6b7e4ba9ec96e68777e1ce9cceab92dd376981368eac399` e seus PCs. Nenhuma entrega ou PR é autorizada por este prompt-review.

Responda JSON estrito:
{"mode":"prompt-review","round":"R-0020","group":"CTG-0004-A1-PF","cycle":2,"verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
