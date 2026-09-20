# TASK-0074 — sensor de eventos passados como argumentos

Papel Art. 6: Inspector, Terra/high, uma tentativa. Estender somente o teste do
verificador de parâmetros para cobrir literais de evento passados a função ou
método cujo parâmetro se chama `eventType` ou `topic`, além dos objetos `type`
já cobertos. Preservar o literal de parâmetro desconhecido como único erro.

Allowlist: `tools/parameters/tests/generator.test.mjs`, este prompt e
`tasks/TASK-0074.json`. Primeiro comprovar RED nominal no teste de contexto;
Engineer corrige o verificador em TASK-0075.
