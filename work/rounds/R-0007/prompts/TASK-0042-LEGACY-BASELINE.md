# TASK-0042 — Inspector, baseline histórico de upgrade (ciclo final)

Papel Art. 6: Inspector `gpt-5.6-terra/high`. OWNER autorizou um único
ciclo final para fechar TASK-0022. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`. Um escritor; sem commit/push/PR/merge.

Leia `AGENTS.md`, `.devai/pin/constitution.md`,
`docs/meta/agents/inspector-tests.md`,
`work/rounds/R-0007/plan.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-OD.md` §§ upgrade,
`backend/database/apply.sh`, `backend/database/seed.sh`,
`backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`,
`backend/domains/inf/rait-case/tests/integration/rait-seed-profiles.integration.spec.ts`,
`backend/database/ddl/19-rait-priority-{pre,enforce,verify}.sql` e os cinco
arquivos históricos em `HEAD` (DDL05/34/35 e seed05/20).

Allowlist exata: novo diretório
`backend/database/tests/fixtures/rait-priority-upgrade/v1.1.0/` com cópias
literais dos cinco arquivos históricos e manifesto SHA-256; novo
`backend/database/tests/prepare-rait-priority-v1-baseline.mjs`; e somente
`backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`
para integrar o preparo e restauração. Nenhum produto, DDL atual, seed atual,
`apply.sh`, `seed.sh`, sensor de seed-profiles ou reviews pode ser alterado.

O harness deve preparar `detran_r7_ctg1_a2` como banco pré-V3 real, com
owner `postgres`, inventário/ordem fechados, snapshots versionados (nunca
`git show` em runtime), 20 casos legados e o marcador desconhecido **antes**
do enforce. Deve recusar DB/role/URL/flag ausentes, banco errado, conexões
concorrentes ou hash de fixture divergente. O teste não pode desligar trigger,
falsificar priority assessment, copiar DB scratch para o alvo, reduzir
asserções, mascarar falhas ou usar --full como prova de upgrade. Registrar
reconciliação explícita e delimitada do parâmetro legal de fixture antes do
snapshot; não rodar seed global para sobrescrever configuração ativa.

Como `backend:test:ci` executa E2E após integração, preservar uma restauração
fail-closed do banco dedicado após o snapshot fresh/upgrade; não destruir
evidência de falha, nem restaurar banco diferente. Um erro de restore é
BLOCKED, nunca PASS. O scratch `_seed_profiles` é autorizado pelo OWNER,
mas pertence ao seu teste existente e não deve ser criado aqui.

Nesta autoria: apenas testes estáticos, hash/prettier/typecheck/coleta. **Não
executar apply/seed/drop/create em banco** antes da revisão independente dos
novos bytes e do SQL Architect. Se o baseline histórico não puder ser criado
sem divergência de produto, pare, identifique a divergência; não substitua
por baseline sintético pré-enforce. Entregue paths, SHA, comando e status.
