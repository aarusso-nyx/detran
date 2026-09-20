# TASK-0058 — reconciliar sensores CTG-0002

Papel Art. 6: Inspector, Terra/high, uma tentativa. Leia `AGENTS.md`,
`CODESTYLE.md`, `docs/meta/agents/inspector-tests.md`, CTG-0002 §§4 e 9,
`reports/CTG-0002-CLOSURE-PLAN-V2.md`, sensores TASK-0053/TASK-0056 e adapter.

Objetivo único: corrigir duas contradições de sensor sem relaxar nenhuma
guarda. (1) Em `document-trust-batch.spec.ts`, distinguir `/health` de
`/verify`: health deve devolver capability específica válida e verify o
recibo; acrescentar negativa se útil, sem duplicar TASK-0056. (2) Em
`rait-worklist-corrective.spec.ts`, linhas cuja matriz contratual não nomeia
evento (`create-schedule`, `approve-batch`) devem exigir `events: []` e nenhum
evento/outbox vazio; mutação e auditoria/idempotência continuam provadas.

Allowlist exclusiva: esses dois sensores e `tasks/TASK-0058.json`. Não toque
produção, outros sensores, blueprint/DDL/banco, tasks anteriores ou irmãos.
Execute testes focados com `--passWithNoTests=false`, typechecks, Prettier e
diff-check. Congele hashes e reporte contagens. RED de produção é esperado;
erro de coleta ou zero testes é BLOCKED.
