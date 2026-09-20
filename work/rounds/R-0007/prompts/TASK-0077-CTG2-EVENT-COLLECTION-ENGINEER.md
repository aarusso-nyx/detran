# TASK-0077 — classificar push de events/audits

Papel Art. 6: Engineer tooling, Terra/high, uma tentativa. Excluir do catálogo
somente string literals que sejam argumentos diretos de `push` cujo receiver
imediato seja uma propriedade chamada `events` ou `audits`. Preservar toda a
inferência da TASK-0075 e o fail-closed dos demais contextos.

Allowlist: `tools/parameters/verify.mjs`, este prompt e
`tasks/TASK-0077.json`. Testes Inspector ficam congelados. Aceite: 26/26 e
verificação real do catálogo sem erros.
