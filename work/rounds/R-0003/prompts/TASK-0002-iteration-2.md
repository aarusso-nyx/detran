# TASK-0002 — iteração 2 após correção do Architect

Papel constitucional: **Inspector**. Obedeça integralmente ao prompt
`work/rounds/R-0003/prompts/TASK-0002.md`; nunca execute git.

O Architect corrigiu `work/rounds/R-0003/contracts/CTG-0001.md`: `DASH_EXPORT_ROLES` tem agora
12 papéis e exclui `AUDITOR`/`DPO`, porque RN-DASH-170 os define como somente leitura. Atualize
somente `backend/domains/shared/src/policy.spec.ts` para refletir a versão corrigida:

- remova `AUDITOR` e `DPO` do `DASH_EXPORT_ROLES` esperado;
- preserve a negativa já existente de `AUDITOR` em `dashboard:export:create`;
- acrescente a negativa explícita de `DPO` em `dashboard:export:create` e `export:approve`;
- não mude nenhum outro teste, gate ou caminho.

Não toque em `tools/check-role-catalog.ts` nesta iteração. Entregue o relatório fixo, identificando
iteração 2 e comandos executados/bloqueados.
