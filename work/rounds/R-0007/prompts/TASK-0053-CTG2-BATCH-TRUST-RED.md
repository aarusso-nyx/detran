# TASK-0053 — RED da manifestação e confiança da ata de lote

Papel Art. 6: Inspector, `gpt-5.6-terra`/high. Até duas iterações próprias,
sem reiniciar TASK-0045/0051/0046. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`. Leia integralmente
`docs/meta/agents/inspector-tests.md`.

Leitura fechada: `AGENTS.md`, `CODESTYLE.md`,
`work/rounds/R-0007/contracts/CTG-0002.md`,
`work/rounds/R-0007/reports/CTG-0002-BATCH-TRUST-CONTRACT.md`,
`work/rounds/R-0007/reports/CTG-0002-ROUTE-OWNERSHIP.md`,
`backend/domains/shared/src/documents/document-trust.ts`,
`backend/domains/shared/src/documents/document-trust.http-adapter.ts`,
`backend/domains/shared/src/documents/document-trust.spec.ts`,
`backend/domains/inf/rait-worklist/src/handwritten/rait-worklist-command.service.ts`,
`backend/domains/inf/rait-worklist/tests/unit/rait-worklist-corrective.spec.ts`,
`backend/database/ddl/35-inf-rait-worklist.sql`,
`docs/framework/blueprints/BP-INF-RAIT-WORKLIST-001.json`.

Pode criar apenas:
`backend/domains/shared/src/documents/document-trust-batch.spec.ts`,
`backend/domains/inf/rait-worklist/tests/unit/rait-batch-minutes-trust.spec.ts`,
`backend/domains/inf/rait-worklist/tests/integration/rait-batch-minutes-manifest.integration.spec.ts`.
Proibidos arquivos históricos de teste, runtime, adapter, blueprint, DDL,
gerados, política, plano/tarefas/budget, Git, DB reset, `record/**`,
`.devai/**` e irmãos. Um escritor global.

Escreva RED executável da operação `BATCH_DISTRIBUTION_MINUTES` e da
homologação: snapshot canônico/versionado e SHA-256, manifesto imutável
servidor-owned para tenant/lote/documento/hash/presidente; recibo PAdES-B-LT,
TSA e certificado OCSP/CRL validado; negativas por documento/hash/snapshot/
espécie/tenant/lote/signatário/seed/ordem/TSA/certificado/serviço ausente,
sem escrita/outbox/auditoria de sucesso. Prove idempotência/replay e corrida
contra versão/manifesto alterados. Sensor de DB exige FK/unique/RLS e
imutabilidade de manifesto, preservando linhas legadas. Não confunda
`signedMinutesRef` com documento UUID nem aceite eco JSON como prova
criptográfica local: o adapter deve conferir contrato de recibo do provedor.

Use fakes determinísticos da fronteira documental; testes de banco somente
em `detran_r7_ctg1_a2` com URLs owner/app explícitas e app role efetiva
`role_app_backend`, transações com rollback. Falta de URL, papel ou fixtures
é BLOCKED; zero testes não é PASS. Execute focados com
`--passWithNoTests=false`, typechecks e Prettier. Reporte contagens,
classificação RED, hashes e qualquer fonte insuficiente. Não enfraqueça
os sensores anteriores nem implemente código de produto.
