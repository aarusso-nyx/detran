# Targeted prompt-review — TASK-0007 retry 1

Papel: Auditor externo Claude Opus 5.5. Somente leitura em
`/Users/aarusso/.codex/worktrees/local-stack/detran`; nao escreva nem
execute git.

Leia `work/rounds/R-0017/prompts/TASK-0007-retry-1.md`,
`work/rounds/R-0017/reports/TASK-0007.md`,
`work/rounds/R-0017/contracts/CTG-0002.md` §C-02-04…06,
`tools/stack/smoke.mjs`, `tools/detran-stack.sh`,
`tools/stack/contract.test.mjs`, `work/rounds/R-0017/tasks/TASK-0007.json`
e `work/rounds/R-0017/compositions.json`. Confira PC
`PC-55e67869b9f48a41` contra SHA. A primeira revisao deste retry
(`reviews/prompt-review-TASK-0007-retry-1.json`) foi PASS, mas pediu
alinhamento STATE_DIR, evidencias de persona/IDs e Dashboard N1; confira
essas correcoes de forma direcionada. A segunda revisao
(`reviews/prompt-review-TASK-0007-retry-1-2.json`) foi PASS, mas mostrou
que o Dashboard live usa `items[].layer` e pediu campos de matcher
opcionais, tenant por header+fixture e precondicoes sem termos proibidos.
Confira somente essas correcoes. Julgue se a segunda tentativa pode
concluir a fixture CH, as tres sondas 503 reais, personas/restauracao,
preflight negativo e evidencia agregada sem tocar backend, testes ou seed
RAIT. Registre high para lacuna que tornaria o objetivo impossivel; nao
reabra as decisoes Owner nem o mock SEFAZ ja provado offline. PASS sem
high, REVIEW com high corrigivel, FAIL por conflito vinculante.

Responda somente com JSON valido, primeiro caractere `{`, ultimo `}`,
sem Markdown. Chaves `mode="prompt-review"`, `round="R-0017"`,
`verdict="PASS|REVIEW|FAIL"`, `findings` array de objetos com `severity`,
`item`, `file`, `line`, `claim`, `fix`, e `notes` array.
