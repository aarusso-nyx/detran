Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão dirigida do registro A1-1/A1-2, ciclo 2

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional, somente leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

Leia `work/rounds/R-0020/reviews/A1-acceptance-review-1.json`, o recibo Owner `AUTHORIZATION-A1-1-A1-2-2026-09-29.md`, `contracts/CTG-0004.md` e o delta não commitado de `plan.md`. Revise só os três achados do ciclo 1: o consentimento A1-2b/c é limitado ao job efêmero de CI e não cobre sensing no repositório real pelo maestro; a tabela de efeito permitido condiciona ensaio/medição à release corrigida e ao pin governado; a frase histórica de TASK-0011 está datada como decisão posterior. Confirme que a correção não reabre o aceite A1-3=B, não torna execução prematura elegível e não altera a proposta fonte.

Não execute sensores, `devai sense run|record`, `--write`, `--publish`, instalação nem Git com escrita. Esta revisão não autoriza PR, pin, sensing ou CI enquanto o preflight instalado falhar.

Responda JSON estrito:
{"mode":"decision-review","round":"R-0020","group":"CTG-0004-A1-acceptance","cycle":2,"verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
