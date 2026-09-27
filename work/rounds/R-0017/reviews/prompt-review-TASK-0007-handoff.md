# Targeted prompt-review — TASK-0007 handoff

Papel: Auditor externo Claude Opus 5.5. Somente leitura em
`/Users/aarusso/.codex/worktrees/local-stack/detran`; nao escreva nem
execute `git`.

`reviews/prompt-review-CTG-0002-workers-final.json` aprovou TASK-0007
antes do handoff Inspector. Leia `prompts/TASK-0007.md`,
`reports/TASK-0005-escalation.md`, `tools/stack/contract.test.mjs`,
`contracts/CTG-0002.md`, `plan.md` §A4/A5/checkpoint,
`tasks/TASK-0007.json` e `compositions.json` sob `work/rounds/R-0017/`.
`reviews/prompt-review-TASK-0007-handoff.json` marcou REVIEW por um high:
`seed_database` ainda podia invocar `fresh` apesar do config novo.
`reviews/prompt-review-TASK-0007-handoff-2.json` aprovou o PC seguinte,
mas pediu rota CH via proxy e trilha do PC. O prompt final incorporou essas
notas, evidencia agregada e guarda do banco. Confira invocacao/config,
evidencia no `runSmoke`, matchers de fixture e personas.
Confirme que o prompt novo descreve sem conflito a factory
`createSefazMockServer({ host, port })`, o `runSmoke({ targets,
fetchImpl })`/report canonico, fixture CH idempotente no banco guardado e
separacao entre prova offline e checkpoint (b). Verifique fronteira de
escrita e PC `PC-f80aaf52cdbb9659` contra SHA. Aponte qualquer high que
impeca o Engineer de implementar os sensores sem tocar backend/testes ou
relaxar RLS/policy. `PASS` sem high; `REVIEW` com high corrigivel; `FAIL`
por conflito Owner/contrato.

Responda somente com JSON valido, primeiro caractere `{`, ultimo `}`,
sem Markdown ou prosa. Chaves `mode="prompt-review"`, `round="R-0017"`,
`verdict="PASS|REVIEW|FAIL"`, `findings` array de objetos com `severity`,
`item`, `file`, `line`, `claim`, `fix`, e `notes` array.
