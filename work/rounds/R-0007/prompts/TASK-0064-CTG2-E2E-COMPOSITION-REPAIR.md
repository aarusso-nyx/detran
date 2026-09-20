# TASK-0064 — reparar sensor E2E de composição de deliberação/ata

Papel Art. 6: Inspector, Terra/high, limite 1/1. Leia AGENTS, manual Inspector,
CTG-0002, ADR-0027, TASK-0008/0049/0050 e os sensores unitários/policy já
verdes.

Classificação: sensor-error ambiental. O boot DI está verde. Três requisições
do E2E param antes do controller com `Distributed rate limit backend
unavailable`; a requisição forged com papel chair é corretamente negada pelo
policy guard, pois `minutes:create` pertence ao secretary. Nenhum desses quatro
resultados mede ownership/wiring do controller.

Altere somente
`backend/app/tests/e2e/rait-session-deliberation-minutes-production.e2e.spec.ts`:

- prove por introspecção do `ModulesContainer` que as cinco rotas têm exatamente
  um POST e que o owner é `RaitSessionCommandsController`;
- prove ausência de POST CRUD concorrente de vote/minutes e ausência de rota
  oral, sem despachar mutações através do rate-limit global;
- remova o assert HTTP forged redundante; preserve a prova correspondente no
  unit sensor TASK-0049, que exige 400 antes da transação para os cinco comandos;
- preserve boot do AppModule no banco dedicado e contagem positiva de testes.

Allowlist: o E2E acima e `work/rounds/R-0007/tasks/TASK-0064.json`. Proibido
produção, policy, outros testes, blueprint/DDL/gerados, config de plataforma,
package/lock, banco/seed, record, corpus ou irmãos.

Execute o E2E alterado, os outros dois E2E production-path, unit session completo,
policy TASK-0049, audit session, typechecks app/session, Prettier e diff-check.
Registre contagens/hashes. Não declare CTG-0002 fechado; o gate amplo e revisão
independente pertencem ao Maestro.
