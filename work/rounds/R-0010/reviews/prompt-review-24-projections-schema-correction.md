# Revisão restrita — schema e deduplicação das projeções

Papel constitucional: **Auditor** (soft gate, Art. 18). Modo `prompt-review`,
rodada R-0010. Responda somente JSON válido, primeiro byte `{`, último byte
`}`. Examine apenas a correção do único achado alto de
`reviews/prompt-review-23-projections-post-r0009-correction.json` e qualquer
contradição diretamente introduzida.

Leia `docs/meta/agents/orchestra/reviewer-prompt.template.md`,
`work/rounds/R-0010/reviews/prompt-review-23-projections-post-r0009-correction.json`,
`work/rounds/R-0010/contracts/boat-projections.md`,
`work/rounds/R-0010/prompts/TASK-0013.md`,
`work/rounds/R-0010/tasks/TASK-0013.json`, as entradas TASK-0012…0014 de
`work/rounds/R-0010/compositions.json` e
`work/rounds/R-0010/reports/TASK-0013-progress.md`.

Confirme que contrato e prompt separam dois cenários verificáveis:

1. duas linhas canônicas do mesmo fato, com `schemaVersion` suportado explícito,
   provam deduplicação por `(event.name, aggregate.id, aggregate.version)` com
   um único efeito e ledger;
2. o par legado tal como produzido hoje, sem `schemaVersion`, prova rejeição
   controlada sem efeito nem ledger, permanece pendência da TASK-0007 e fica
   fora dos REDs que a TASK-0014 deve tornar verdes.

Confira ainda os hashes, PC IDs e status da tríade. Um `PASS` libera somente a
nova iteração Inspector TASK-0013. TASK-0014 continua bloqueada pelos novos REDs
e pelos locks R-0007. `REVIEW` pede correção localizada; `FAIL` indica
contradição canônica ou RED inalcançável.

Formato estrito:

{"mode":"prompt-review","round":"R-0010","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"work/rounds/R-0010/contracts/boat-projections.md","line":1,"claim":"fato verificável","fix":"correção localizada"}],"notes":[]}
