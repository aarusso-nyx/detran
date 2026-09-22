# CTG-0003 A5 — Architect correction

Papel constitucional: **Architect**. Execute somente esta correção na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/teat-frontends`. Não use Git, não instale pacotes, não
edite testes, policy ou `src/handwritten/**`.

## Leia

- `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/architect-blueprint.md`
- `work/rounds/R-0013/AUTHORIZATION.md` Amendment 1 e `plan.md` Adenda A5
- `docs/meta/adr/ADR-0028-provisionamento-operacional-offline.md`
- `docs/framework/contracts/BP-OPS-PROVISIONING-001.commands.openapi.json`
- `docs/framework/arch/teat-error-catalog.md`
- `backend/database/apply.sh`
- `work/rounds/R-0013/env-detran-r13.sh`

## Pode tocar

- `docs/meta/adr/ADR-0028-provisionamento-operacional-offline.md`
- `docs/framework/contracts/BP-OPS-PROVISIONING-001.commands.openapi.json`
- `packages/api-clients/src/generated/BP-OPS-PROVISIONING-001.commands.ts` somente por generator
- `packages/api-clients/src/index.ts` somente se o generator exigir ajuste
- `backend/database/apply.sh`
- `work/rounds/R-0013/env-detran-r13.sh`

## Correções exatas

1. Nos seis POST, declarar headers obrigatórios `If-Match` e `Idempotency-Key`; GET content/readiness
   não os exigem. Ausência/divergência de `If-Match` produz 428 `TEAT.IF_MATCH_REQUIRED` e 412
   `TEAT.VERSION_CONFLICT`; replay produz 409 `TEAT.IDEMPOTENCY_REPLAY`; sucesso expõe ETag.
2. Documentar na ADR o token comparado: challenge usa versão do dispositivo; registro usa ETag do
   challenge/dispositivo; emissão usa readiness do dispositivo; receipt usa versão do pacote;
   revoke/reconcile usam versão do grant. O ETag é obtido pela leitura/readiness ou resposta anterior;
   comparação decorativa é proibida.
3. Adicionar exatamente `21-ops-provisioning.sql` ao inventário ordinary de `apply.sh`.
4. Preservar o ramo histórico R7 e aceitar `--full` em `detran_r13` somente com
   `DETRAN_R13_FULL_AUTHORIZED=1`; qualquer outro banco/flag falha fechado. Exportar essa flag no
   env R13. Não aceitar nomes arbitrários.
5. Rodar generators de contrato/cliente e formatar somente arquivos tocados. Entregar relatório com
   paths e comandos; não tentar tornar `contracts:check` verde: os oito `missing-route` permanecem.
