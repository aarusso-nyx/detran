# TASK-0056 — sensor de capacidade da ata

Papel Art. 6: Inspector. Terra/high, uma tentativa. Leia `AGENTS.md`,
`CODESTYLE.md`, `docs/meta/agents/inspector-tests.md`, contrato CTG-0002 §9,
`work/rounds/R-0007/reports/CTG-0002-BATCH-TRUST-CONTRACT.md`,
`backend/domains/shared/src/documents/document-trust.ts`,
`backend/domains/shared/src/documents/document-trust.http-adapter.ts` e
`backend/domains/shared/src/documents/document-trust-batch.spec.ts`.

Crie somente `backend/domains/shared/src/documents/document-trust-batch-capability.spec.ts`
e atualize somente `work/rounds/R-0007/tasks/TASK-0056.json`. Prove em teste
executável que `verifyBatchMinutesEvidence` exige health/capability explícita
`batchDistributionMinutes` (ou chave equivalente explicitamente documentada
no contrato), PAdES-B-LT, TSA e validação OCSP/CRL; ausente, false, resposta
parcial, erro HTTP ou serviço indisponível nunca geram recibo positivo. Teste
também capability válida seguida de recibo válido. Não crie exigência de
`withdrawalEvidence` para esta operação; capacidades são por espécie.

Não toque produção, sensores congelados, blueprint, DDL, banco, task de outro
ID ou repositórios irmãos. Valide RED focado com `--passWithNoTests=false`,
typecheck, Prettier e `git diff --check`. Congele SHA-256 e reporte testes
coletados/RED esperados, sem alegar verificação criptográfica real.
