Tarefa: TASK-0012 (iteração 3)

Atualizado exclusivamente `docs/framework/arch/portal-frontends.md` §10:

- Tabela consolidada para o estado ao fim de R-0014, com fontes por dependência.
- Domínio `portal` e projeções registrados como entregues em R-0009 (PC-0006).
- Pendências R-0007, gov.br, adapter/homologação, BOAT/PEC, Carta, push e decisões abertas corrigidas.
- OD-P102 alinhado à A12(a): regra só no `ErrorBoundary`; unificação futura continua pendente, sem duplicação.

Validações:

- `node tools/docs/kb/check.mjs` → OK
- `pnpm docs:kb:publish-check` → OK
- `node_modules/.bin/prettier --check docs/framework/arch/portal-frontends.md` → OK