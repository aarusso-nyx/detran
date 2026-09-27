# Targeted prompt-review — TASK-0005 escalation

Papel: Auditor externo Claude Opus 5.5. Somente leitura em
`/Users/aarusso/.codex/worktrees/local-stack/detran`; nao escreva nem
execute `git`.

Leia `work/rounds/R-0017/prompts/TASK-0005-escalation.md`, o relatorio
`reports/TASK-0005-retry-1.md`, `tools/stack/contract.test.mjs`, os tres
adapters CH e `tasks/TASK-0005.json`/`compositions.json`. O prompt original
e o retry 1 receberam prompt-review PASS; este ciclo confere somente os
erros dos sensores novos. O ciclo anterior
`reviews/prompt-review-TASK-0005-escalation-2.json` deu PASS e apontou
tres medium: forma Nest top-level do 503, rejeicao de fetch no backend
parado e sensores antigos esperadamente vermelhos. Todos entraram no
prompt; confirme somente esse delta, o PC novo `PC-40dc8eebaadeaba4` e regressoes.
Julgue se a escalada Terra/alto e fronteira de
escrita unica sao proporcionais; se corrigir mensagens CH, comparacao de
requestId, happy path duplicado e negativos mal injetados preserva todos
os sensores validos; e se o PC `PC-40dc8eebaadeaba4` bate com o arquivo.
`PASS` sem high, `REVIEW` com high corrigivel, `FAIL` por conflito de
contrato/Owner.

Responda somente com objeto JSON valido, primeiro caractere `{`, ultimo
`}`, sem Markdown ou prosa. Chaves `mode="prompt-review"`,
`round="R-0017"`, `verdict="PASS|REVIEW|FAIL"`, `findings` array de
objetos com `severity`, `item`, `file`, `line`, `claim`, `fix`, e `notes`
array.
