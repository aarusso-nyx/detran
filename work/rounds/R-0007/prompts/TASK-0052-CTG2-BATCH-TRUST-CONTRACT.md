# TASK-0052 — contrato de confiança da ata de distribuição

Papel Art. 6: Architect, `gpt-5.6-sol`/medium. Uma iteração; worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`. Leia integralmente
`docs/meta/agents/architect-blueprint.md`. Esta tarefa é design delimitado,
não implementação nem antecipação de TASK-0008.

Leitura fechada: `AGENTS.md`, `CODESTYLE.md`,
`work/rounds/R-0007/contracts/CTG-0002.md`,
`work/rounds/R-0007/reports/CTG-0002-ROUTE-OWNERSHIP.md`,
`docs/framework/product/domains/inf/rait/workflows/WF-RAIT-004.md`,
`docs/framework/blueprints/BP-INF-RAIT-WORKLIST-001.json`,
`backend/database/ddl/35-inf-rait-worklist.sql`,
`backend/domains/shared/src/documents/document-trust.ts`,
`backend/domains/shared/src/documents/document-trust.http-adapter.ts`,
`backend/domains/shared/src/documents/document-trust.spec.ts`,
`backend/domains/inf/rait-worklist/src/handwritten/rait-worklist-command.service.ts`,
`backend/domains/inf/rait-worklist/tests/unit/rait-worklist-corrective.spec.ts`.

Pode editar apenas `work/rounds/R-0007/contracts/CTG-0002.md` e criar
`work/rounds/R-0007/reports/CTG-0002-BATCH-TRUST-CONTRACT.md`. Proibidos
blueprints, DDL, runtime, testes, política, plano/tarefas/budget, Git,
`record/**`, `.devai/**` e irmãos.

Defina contrato implementável para ata de distribuição homologada: estado
imutável controlado pelo servidor vinculando tenant, batch, semente/ordem e
snapshot reproduzível, `documentId` UUID, hash de conteúdo e signatário
presidente esperado; origem/verificação dessa manifestação; operação de
confiança específica `BATCH_DISTRIBUTION_MINUTES` com PAdES-B-LT, TSA,
certificado OCSP/CRL e correspondência exata; persistência atômica de
homologação só após verificação. Especifique campos/constraints/índices de
blueprint ou outra representação persistente canônica, sem inventar dado
jurídico nem aceitar `signedMinutesRef` como prova. Separe o que cabe aos
sensores Inspector, ao adapter Engineer e ao blueprint Architect; explicite
se a fonte exige uma decisão OWNER ainda não tomada. Preserve compatibilidade
com os 20 casos legados e RLS.

Valide Prettier dos dois artefatos, `pnpm contracts:check`, e reporte
impasses concretos. Não declarar approve-batch ou CTG-0002 GREEN.
