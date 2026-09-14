# TASK-0003 — iteração 2 após correção do contrato e sensor

Papel constitucional: **Engineer**. Obedeça integralmente ao prompt
`work/rounds/R-0003/prompts/TASK-0003.md`; nunca execute git nem altere testes.

O Architect e o Inspector corrigiram o único `reference-gap`: Auditor/DPO são N2 para leitura,
mas não podem criar exportação. Altere somente `backend/domains/shared/src/policy.ts` para remover
`AUDITOR` e `DPO` de `DASH_EXPORT_ROLES`/`dashboard:export:create`. Preserve todas as demais regras,
helpers, camadas e exports. Não toque em `roles.ts` nesta iteração.

Entregue o relatório fixo, identificando iteração 2 e comandos executados/bloqueados.
