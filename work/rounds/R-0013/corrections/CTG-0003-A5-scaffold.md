# CTG-0003 A5 — Engineer compile-only scaffold

Papel constitucional: **Engineer**. Execute somente após a correção Architect A5 aceita. Não use
Git, não instale pacotes, não escreva testes, rotas, decorators, persistência ou comportamento real.

Leia `AGENTS.md`, `CODESTYLE.md`, o manual Engineer, `AUTHORIZATION.md` Amendment 1, `plan.md` A5,
ADR-0028, BP-OPS-PROVISIONING-001 e os gerados do pacote provisioning.

Pode criar somente os onze arquivos fixados em `module.handwritten*` sob
`backend/domains/ops/provisioning/src/handwritten/`. Eles devem exportar os símbolos/tipos públicos
necessários para typecheck, `ProvisioningController` sem decorators/rotas, token
`OPS_PROVISIONING_PROVIDER` e comandos que lançam um erro explícito e tipado de não implementado.
Não edite qualquer outro path.

Aceite:

- `pnpm --filter @detran/ops-provisioning typecheck` exit 0;
- `pnpm contracts:check` continua RED somente pelos mesmos oito `missing-route`;
- nenhum decorator HTTP, policy grant, acesso DB, mock permissivo, `ts-ignore`, skip/todo ou teste;
- relatório lista os onze paths e os resultados exatos.
