# TASK-0054 — esquema da ata de distribuição (CTG-0002)

Papel Art. 6: Architect. Modelo Sol/medium. Execute somente esta tarefa,
uma tentativa. Leia integralmente `AGENTS.md`, `CODESTYLE.md`,
`docs/meta/agents/architect-blueprint.md`,
`work/rounds/R-0007/contracts/CTG-0002.md`,
`work/rounds/R-0007/reports/CTG-0002-BATCH-TRUST-CONTRACT.md`,
`work/rounds/R-0007/reports/CTG-0002-ROUTE-OWNERSHIP.md`,
`docs/framework/blueprints/BP-INF-RAIT-WORKLIST-001.json`,
`tools/blueprints/generate.mjs`, `backend/database/ddl/35-inf-rait-worklist.sql`
e os três sensores da TASK-0053. O contrato de confiança aditivo prevalece
para a ata; preserve as decisões originais de WF-RAIT-004.

Objetivo único: representação persistente aditiva, canônica e verificável do
snapshot imutável do sorteio, manifestação da ata e recibo de homologação. O
blueprint é a autoridade. Pode alterar somente:

- `docs/framework/blueprints/BP-INF-RAIT-WORKLIST-001.json`;
- `tools/blueprints/generate.mjs`, apenas se necessário para gerar constraints,
  RLS e trigger de imutabilidade a partir de propriedades explícitas;
- `tools/blueprints/generated-files.json`, somente pela geração oficial para
  registrar os novos derivados deste blueprint;
- saídas geradas oficiais desse blueprint em
  `backend/domains/inf/rait-worklist/src/{entities,dto,repositories,services,controllers}/`,
  `backend/domains/inf/rait-worklist/src/index.ts`,
  `backend/domains/inf/rait-worklist/src/rait-worklist.module.ts`,
  `backend/database/ddl/35-inf-rait-worklist.sql`,
  `docs/framework/contracts/BP-INF-RAIT-WORKLIST-001.openapi.json`;
- `work/rounds/R-0007/tasks/TASK-0054.json` para status, contagem e prova.

Não toque testes, handwritten, outros blueprints, DDL manual, banco/seed,
pacotes, lockfile, decisões, record ou repositórios irmãos. Não resetar banco.
Requer uma execução oficial de `pnpm blueprints:generate` e
`pnpm contracts:openapi`; pare se a geração modificar arquivos fora da
allowlist e reporte exatamente quais, sem descartá-los. Não edite gerados à
mão. O esquema deve satisfazer as constraints nominais do sensor SQL, RLS
forçada e imutabilidade em banco. Confirme que reaplicação do DDL não falha e
preserva legado antes de declarar GREEN; use exclusivamente o banco dedicado
`detran_r7_ctg1_a2` com conexão explícita, sem `--full`. Se a linguagem do
blueprint não suportar uma propriedade necessária, estenda-a minimamente e
prove geração reprodutível. Não reduza o sensor para acomodar o gerador.

Critérios: `pnpm blueprints:check`, `pnpm contracts:check`,
`pnpm --filter @detran/inf-rait-worklist typecheck`, sensor SQL focado com
`DETRAN_RUNTIME_PROFILE=test` e as URLs OWNER/APP explicitadas no contrato da
campanha, `git diff --check`. Reporte PASS/RED/BLOCKED por critério; ausência
de URL, papel errado ou zero testes é BLOCKED. Preserve os hashes de sensores
TASK-0053 e não confunda schema GREEN com verificação criptográfica GREEN.
