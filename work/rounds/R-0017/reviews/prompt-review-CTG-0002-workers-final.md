# Confirmation prompt-review — CTG-0002 workers

Papel: Auditor externo Claude Opus 5.5. Somente leitura em
`/Users/aarusso/.codex/worktrees/local-stack/detran`; nao escreva nem
execute `git`.

`work/rounds/R-0017/reviews/prompt-review-CTG-0002-workers-3.json`
retornou PASS com dois achados medium. O maestro alterou apenas
`prompts/TASK-0005.md`, `prompts/TASK-0007.md`, `plan.md`, seus PCs em
`compositions.json` e campos de `tasks/TASK-0005.json` e
`tasks/TASK-0007.json`.

Confirme que os testes usam interfaces explicitas
`createSefazMockServer({ host, port })` e
`runSmoke({ targets, fetchImpl })` com portas efemeras sem mudar os defaults
CLI; que TASK-0007 pode preparar dados CH sinteticos idempotentes apenas em
`detran_local_stack`, sob guarda de nome, sem tocar o perfil RAIT; que as
seis rotas SEFAZ sao provadas pelo adapter real via `tsx`; e que o
checkpoint (b) inclui smoke negativo apos `stop`. Confira hashes/PCs finais:
TASK-0005 `PC-851f1436e42ea11c`, TASK-0006
`PC-95cc7a37908fe373`, TASK-0007 `PC-e47639d85c7a5c7f`. A decisao do
Owner e A4 permanecem imutaveis. Retorne `REVIEW` somente por novo high
que impeça despacho; notas medium/low nao bloqueiam.

Responda somente com um objeto JSON valido, primeiro caractere `{`, ultimo
`}`, sem Markdown ou prosa. Chaves `mode="prompt-review"`,
`round="R-0017"`, `verdict="PASS|REVIEW|FAIL"`, `findings` array de
objetos com `severity`, `item`, `file`, `line`, `claim`, `fix`, e `notes`
array. Escape aspas em strings.
