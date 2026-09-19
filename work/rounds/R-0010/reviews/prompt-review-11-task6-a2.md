# Revisão restrita das correções de `prompt-review-10-task6-a2`

Papel Auditor; modo `prompt-review`; rodada R-0010. Leia
`reviews/prompt-review-10-task6-a2.json` e avalie **somente** o high e os
quatro lows desse veredito. Leia as correções em
`contracts/CTG-0002.md` §3/Adenda A-2,
`prompts/TASK-0006.md`, `tasks/TASK-0006.json`,
`prompts/TASK-0008.md`, `tasks/TASK-0008.json` e `compositions.json`.
Consulte `docs/framework/arch/boat-error-catalog.md` §3,
`work/rounds/R-0008/contracts/CTG-0002.md` §4.3/§4.4,
`docs/framework/contracts/BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`
nos dois enums do recibo e `backend/app/tests/e2e/teat-field-sync.e2e.spec.ts`
somente onde os achados apontam.

A correção Architect explicita que, **após montar o applier BOAT**, os códigos
BOAT de rejeição/conflito passam no recibo TEAT para `crash-record` e superam
apenas a linha de `validate` de R-0008; o fallback sem destino e os códigos
de envelope/integridade continuam TEAT. TASK-0008, ainda `queued`, atualizará
os dois enums sem remover valores TEAT. TASK-0006 está agora `queued` com
`iteration_count=1`; o Inspector só pode fortalecer o caso C-0002-44 indicado
e corrigir o comentário obsoleto, sem mudar o payload compartilhado ou outros
testes. Nenhum teste foi editado nem worker disparado.

Use a rubrica de
`docs/meta/agents/orchestra/reviewer-prompt.template.md`. Responda somente
um objeto JSON válido e compacto, sem Markdown, com `mode`, `round`,
`verdict`, `findings`, `notes`; primeiro byte `{`, último `}`. `PASS` sem high
remanescente; `REVIEW` para high local corrigível; `FAIL` para contradição
canônica, ADR, Owner, Constituição ou fronteira. Não levante achado novo sobre
texto não alterado, salvo `FAIL` e justificativa explícita.
