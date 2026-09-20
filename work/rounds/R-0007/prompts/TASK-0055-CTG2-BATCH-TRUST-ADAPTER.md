# TASK-0055 — adapter de confiança da ata (CTG-0002)

Papel Art. 6: Engineer. Modelo Terra/high. Uma tentativa. Leia integralmente
`AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/engineer-backend.md`,
`work/rounds/R-0007/contracts/CTG-0002.md`,
`work/rounds/R-0007/reports/CTG-0002-BATCH-TRUST-CONTRACT.md`,
`backend/domains/shared/src/documents/document-trust.ts`,
`backend/domains/shared/src/documents/document-trust.http-adapter.ts`,
`backend/domains/shared/src/documents/document-trust-batch.spec.ts` e
`backend/domains/shared/src/documents/document-trust.spec.ts`.

Objetivo único: implementar operação tipada dedicada
`verifyBatchMinutesEvidence` no contrato público e no adapter HTTP. Não alargue
o verificador de `DECISAO_DEFESA`. O adapter deve exigir capacidade específica
do serviço, enviar tenant/lote/ref opaca/documento/hash de conteúdo/hash do
snapshot/signatário esperado, conferir todos os campos do recibo,
`PAdES-B-LT`, TSA validado e OCSP/CRL GOOD. Falha de configuração,
capacidade, HTTP, resposta parcial ou divergente deve fechar sem evidência
positiva; preserve os códigos RAIT do contrato. O adapter confia somente em
resposta autenticada do serviço documental que executa a criptografia; teste
com `fetch` fake não prova serviço real. Não invente assinatura local ou
aceite mera string não vazia como prova.

Allowlist de escrita: somente
`backend/domains/shared/src/documents/document-trust.ts`,
`backend/domains/shared/src/documents/document-trust.http-adapter.ts` e
`work/rounds/R-0007/tasks/TASK-0055.json`. Proibido editar sensores,
handwritten worklist, blueprint/DDL/gerados, banco/seed, package/lockfile,
decisões, record ou repositórios irmãos. Preserve bytes SHA-256 congelados do
sensor TASK-0053.

Valide `DETRAN_TEST_TIER=unit pnpm --filter @detran/shared exec vitest run
src/documents/document-trust-batch.spec.ts --passWithNoTests=false`,
`pnpm --filter @detran/shared typecheck`, regressão
`document-trust.spec.ts`, Prettier e `git diff --check`. Reporte contagem
coletada, PASS/RED/BLOCKED, hashes imutáveis e limite de prova (sem endpoint
de produção configurado). Não declare CTG-0002 ou approve-batch GREEN.
