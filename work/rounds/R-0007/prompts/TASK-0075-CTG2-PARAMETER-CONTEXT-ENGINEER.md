# TASK-0075 — corrigir classificação de argumento de evento

Papel Art. 6: Engineer tooling, Terra/high, uma tentativa. Em
`tools/parameters/verify.mjs`, coletar posições de parâmetros locais chamados
`type`, `eventType` ou `topic` em funções/métodos e excluir do catálogo somente
literais passados à posição correspondente de uma chamada local com o mesmo
nome. Preservar todos os demais diagnósticos e o fail-closed para parâmetros
desconhecidos.

Allowlist: o verificador, este prompt e `tasks/TASK-0075.json`. O teste da
TASK-0074 é congelado. Aceite: 26/26 parameter tests e
`verify:parameter-catalogue` no repositório real.
