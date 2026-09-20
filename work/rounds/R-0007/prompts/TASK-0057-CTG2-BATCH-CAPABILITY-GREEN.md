# TASK-0057 — fechar capability específica da ata

Papel Art. 6: Engineer, Terra/high, uma tentativa. Leia `AGENTS.md`,
`CODESTYLE.md`, `docs/meta/agents/engineer-backend.md`, contrato CTG-0002 §9,
`work/rounds/R-0007/reports/CTG-0002-BATCH-TRUST-CONTRACT.md`,
`backend/domains/shared/src/documents/document-trust.http-adapter.ts`,
`backend/domains/shared/src/documents/document-trust-batch-capability.spec.ts`
e `backend/domains/shared/src/documents/document-trust-batch.spec.ts`.

Corrija apenas o adapter da TASK-0055: antes de verificar a ata, cheque
`/health` autenticado e exija `batchDistributionMinutes`, `padesLt`, `tsa`
e ao menos uma fonte OCSP/CRL. Não exija `withdrawalEvidence` nessa operação,
nem afrouxe a exigência anterior para retirada/decisão. Capability parcial,
false, indisponível ou resposta de erro bloqueia a verificação. Preserve o
restante do contrato, inclusive fail-closed e espécie dedicada.

Allowlist: `backend/domains/shared/src/documents/document-trust.http-adapter.ts`
e `work/rounds/R-0007/tasks/TASK-0057.json`. Proibido editar qualquer sensor,
interface, outro código, blueprint/DDL, banco/seed, record ou repositórios
irmãos. Valide os sensores de capability (9 coletados) e batch (11), a
regressão documental (19), typecheck shared, Prettier e diff-check. Confirme
SHA-256 do sensor TASK-0056. Não alegue cripto de produção nem CTG2 GREEN.
