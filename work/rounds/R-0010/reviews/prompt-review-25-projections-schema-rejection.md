# Revisão restrita — rejeição de schema nas projeções

Papel constitucional: **Auditor** (soft gate, Art. 18). Modo `prompt-review`,
rodada R-0010. Responda somente JSON válido. Examine apenas a correção do único
achado de `reviews/prompt-review-24-projections-schema-correction.json` e
contradições diretamente introduzidas.

Leia esse review, `contracts/boat-projections.md`, `prompts/TASK-0013.md`,
`tasks/TASK-0013.json`, as entradas TASK-0012…0014 de `compositions.json` e
`reports/TASK-0013-progress.md`.

Confirme que: (1) a rejeição tipada do par legado sem `schemaVersion`, sem
efeito/ledger, é RED legítimo da ausência de TASK-0014, entra na contagem e
deve ficar verde; (2) somente o ramo de sucesso desse par legado é pendência da
TASK-0007 fora do conjunto verde; (3) TASK-0013 manda retirar do E2E a asserção
inválida de que o produtor já emite `payload.schemaVersion`; (4) hashes, PC IDs
e status conferem. Um PASS libera somente a nova iteração Inspector TASK-0013;
TASK-0014 permanece bloqueada por seus predecessores e pelos locks R-0007.

Formato estrito:

{"mode":"prompt-review","round":"R-0010","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"work/rounds/R-0010/prompts/TASK-0013.md","line":1,"claim":"fato verificável","fix":"correção localizada"}],"notes":[]}
