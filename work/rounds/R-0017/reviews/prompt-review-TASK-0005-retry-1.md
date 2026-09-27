# Targeted prompt-review — TASK-0005 retry 1

Papel: Auditor externo Claude Opus 5.5. Somente leitura em
`/Users/aarusso/.codex/worktrees/local-stack/detran`; nao escreva nem
execute `git`.

Leia `work/rounds/R-0017/prompts/TASK-0005-retry-1.md`, o prompt original
`TASK-0005.md`, `reports/TASK-0005.md`, `contracts/CTG-0002.md` e os tres
testes tocados pelo primeiro worker. O prompt original recebeu PASS em
`reviews/prompt-review-CTG-0002-workers-final.json`; esta revisao e apenas
da triagem: porta efemera, DTOs/erros pelo adapter real, negativas do smoke
e `minutes_id` anulavel. Verifique papel Inspector, fronteira de escrita,
ausencia de enfraquecimento de testes e se as exigencias sao testaveis sem
producao presente. `PASS` sem high; `REVIEW` para high corrigivel; `FAIL`
para conflito com contrato/Owner.

Responda somente com JSON valido, primeiro caractere `{`, ultimo `}`, sem
Markdown ou prosa. Chaves `mode="prompt-review"`, `round="R-0017"`,
`verdict="PASS|REVIEW|FAIL"`, `findings` array de objetos com `severity`,
`item`, `file`, `line`, `claim`, `fix`, e `notes` array.
