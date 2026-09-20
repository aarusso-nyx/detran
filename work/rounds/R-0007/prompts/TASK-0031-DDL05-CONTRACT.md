# TASK-0031 — contrato da idempotência DDL05

Papel Art. 6: **Architect**. Modelo `gpt-6-astra/medium`. Worktree exclusiva
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`; branch
`orchestra/rait-backend`. Declare o papel. Esta tarefa só é elegível após
prompt-review independente estruturado PASS do ciclo DDL05. Um escritor global;
lock `MOD-role-catalog-ddl`. Uma execução 1/1, sem retry implícito.

## Leitura fechada e precedência

Leia integralmente antes de escrever, nesta ordem: `AGENTS.md`, `CODESTYLE.md`,
`.devai/pin/constitution.md`, `docs/meta/agents/architect-blueprint.md`,
`work/rounds/R-0007/plan.md`,
`work/rounds/R-0007/reports/TASK-0029-V3-DDL05-REFERENCE-GAP.md`,
`work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-DDL05-CYCLE.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-OD.md`,
`backend/database/ddl/05-role-catalog.sql`,
`backend/database/ddl/14-inf-lifecycle-vocabulary.sql`,
`backend/domains/shared/src/roles.ts`, `tools/check-role-catalog.ts`,
`backend/domains/inf/rait-case/tests/integration/rait-priority-upgrade.integration.spec.ts`.
O OWNER autorizou só a correção delimitada DDL05; a seção final deste ciclo
prevalece sobre paths históricos em conflito. Não mudar valores de negócio.

## Única escrita permitida

- `work/rounds/R-0007/contracts/CTG-0001-C4-OD-V3-DDL05-IDEMPOTENCE.md`

Especifique invariantes e SQL esperado para `ON CONFLICT (key)`: os sete campos
canônicos (`family`, `name`, `description`, `apps`, `is_staff`, `source`,
`introduced_on`) continuam SET de `EXCLUDED`; UPDATE e `clock_timestamp()`
somente se ao menos um desses campos for distinto, usando comparação
null-safe. Não comparar timestamps como causa, não alterar `created_at`,
chaves, famílias, roles, valores ou outras DDLs. Defina provas separadas:
estática RED/GREEN agora; integração PostgreSQL sobre DB dedicado, transação
com rollback, **autoria agora mas execução PENDENTE** até revisão de SQL e
autorização de ensaio. Baseline DDL14 divergente bloqueia upgrade preservador;
não inferir política de sobrescrita. Explique por que Architect, não Engineer,
é o escritor do DDL manual 0x. Não redigir código/SQL nesta tarefa.

Aceite: contrato contém tabela caso igual/divergente/ausente/reapply e
resultado esperado para `updated_at`, enumeração dos sete campos, fronteira
de roles/DDL14/sensor congelado, comandos reais futuros e gatilhos STOP.
`pnpm exec prettier --ignore-path /dev/null --check` do arquivo → PASS.
Se fonte insuficiente, STOP com path/linha. Entrega: path, hash, comando,
resultado e gaps. Worker não edita `record/`, `.devai/`, produto, SQL, testes,
git commit/push/PR/merge. Maestro registra evidência.
