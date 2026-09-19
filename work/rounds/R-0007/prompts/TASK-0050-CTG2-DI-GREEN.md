# TASK-0050 — segunda e última iteração: fechar DI e E2E CTG-0002

Papel Art. 6: Engineer, Terra/high. Continuação 2/2 da TASK-0050; preserve
histórico e contador. Leia AGENTS, manual Engineer, TASK-0008 checkpoint,
TASK-0047/0049/0050, blueprints já gerados e os três E2E production-path.

Falha única congelada:

`Nest can't resolve dependencies of the RaitSessionCommandService (Database,
RequestContext, ?, DocumentTrustVerifier)` no índice 2. As interfaces opcionais
`RaitCaseTransitionPort` e `DocumentTrustVerifier` foram apagadas em runtime.

Corrija somente `rait-session-command.service.ts` para que o serviço Nest tenha
como parâmetros de construtor apenas dependências concretas resolvíveis já
existentes. Use a classe pública `RaitCaseTransitionPort` agora exportada por
`@detran/inf-rait-case` e o `DocumentTrustHttpAdapter` concreto; ambos são
stateless e podem ser instanciados internamente, como já ocorre no worklist.
Preserve fail-closed, URL/token por ambiente, mesma transação do caso e todos os
comportamentos/erros existentes. Não acrescente fallback criptográfico nem
fake operacional.

Allowlist:

- `backend/domains/inf/rait-session/src/handwritten/rait-session-command.service.ts`;
- `work/rounds/R-0007/tasks/TASK-0050.json`.

Proibido alterar controller, testes, policy, trust compartilhado, blueprint,
DDL, gerados, generator, package/lock, banco/seed, record, corpus ou irmãos.

Gates obrigatórios:

- typechecks shared/case/session/app;
- shared completo, session unit completo e integrações session no banco
  dedicado com `DETRAN_TEST_DATABASE_URL`, `DETRAN_TEST_TIER=integration` e
  `role_app_backend`;
- três E2E production-path (worklist, session-agenda,
  deliberation-minutes) com `DETRAN_TEST_TIER=e2e`, DB dedicado e contagem
  positiva: 16/16 devem passar;
- `pnpm verify:decorators`, sensores de audit, Prettier do arquivo e
  `git diff --check`.

Se qualquer RED não for consequência direta desta correção, pare e reporte o
erro exato; não consuma autoridade de outro papel. Ao final registre
`iteration_count: 2`, status `completed`, comandos e contagens. Não declare a
CTG-0002 fechada: a observação independente e os gates amplos ainda pertencem
ao Maestro.
