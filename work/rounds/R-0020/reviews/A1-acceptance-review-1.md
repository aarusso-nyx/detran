Return exactly one JSON object. First character `{`, last character `}`. No Markdown, narration or files written.

# R-0020 — revisão dirigida do registro A1-1/A1-2, ciclo 1

Você é Claude Code Opus 5.5, reviewer da outra família e Inspector constitucional, somente leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`.

O Owner respondeu às quatro perguntas discriminadas no chat: “Aceito a recomendação aos quatro items. Pode aceitar e registrar”. Revise a fidelidade do recibo Owner `work/rounds/R-0020/AUTHORIZATION-A1-1-A1-2-2026-09-29.md` (commit segregado `6c4bc3b5`), do delta ainda não commitado em `contracts/CTG-0004.md` e `plan.md`, perante `contracts/CTG-0004-A1-proposal.md` (SHA-256 `a8163f498ed784144750ccc71554e3a1e1adbfad2d7f38404d598049981b346b`) e `AUTHORIZATION-A1-3-2026-09-29.md`. Os quatro itens são: A1-1 piso/células; A1-2a 16 checks e condições; A1-2b consentimento condicional de `sense run --write --publish` no CI efêmero; A1-2c delegação distinta de `sense record --write` no mesmo job. Confirme autoria por caminho, ausência de presunção de correção upstream, preservação de A1-3=B e dos checkpoints históricos, sem reabrir a decisão do Owner.

Não execute sensores, `devai sense run|record`, `--write`, `--publish`, instalação nem Git com escrita. A revisão não autoriza PR, pin, sensing ou CI enquanto o preflight instalado falhar para quatro kinds.

Responda JSON estrito:
{"mode":"decision-review","round":"R-0020","group":"CTG-0004-A1-acceptance","cycle":1,"verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","file":"...","line":1,"claim":"...","fix":"..."}],"notes":[]}
