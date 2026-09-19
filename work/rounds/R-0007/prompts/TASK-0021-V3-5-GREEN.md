# TASK-0021 — continuação Engineer 5/5 autorizada pelo OWNER

Papel Art. 6: Engineer, `gpt-5.6-terra/high`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`; HEAD inicial
`df1e1769941e527a07b6db7550aee84068f3a872`. Uma iteração 5/5,
histórico 4/4 preservado. Um escritor global. Sem commit/push/PR/merge.

Leia `AGENTS.md`, `CODESTYLE.md`, `.devai/pin/constitution.md`,
`docs/meta/agents/engineer-backend.md`,
`work/rounds/R-0007/prompts/TASK-0021-V3.md`,
`work/rounds/R-0007/reports/TASK-0021-C4-OD-V3-CHECKPOINT-4.md`,
`work/rounds/R-0007/reports/TASK-0020-C4-OD-V3-CHECKPOINT-7.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-OD.md`,
`docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md`,
`docs/meta/adr/ADR-0025-rait-operation-clock-composition.md`,
manual OpenAPI intake, os cinco sensores congelados abaixo e os arquivos de
produto que forem tocados na allowlist antiga. Contratos D1/C4 não
conflitantes continuam vinculantes.

Esta autorização continua TASK-0021, não declara TASK-0020 PASS retrospectivo.
Inspector 7/7 consertou fixtures e recongelou sensores; unit C4 140/140
PASS, E2E 83/98 PASS e 15 RED. Positivos protocol/admit devolvem 403
`RAIT.FORBIDDEN_ACTION` apesar de app DB role `role_app_backend` e vínculo
secretary ativo; dois positivos devolvem `RAIT.DECISION_NOT_ON_DUTY` e
`RAIT.MEMBER_NOT_AVAILABLE`. Diagnostique origem exata (guard versus
RequestContext versus regra/fixture) antes de mudar produto. Não conceda
acesso por wildcard/admin nem enfraqueça vínculo. Se RED for fixture ou
requerer path fora da allowlist, STOP e relate; não altere testes.

Corrija obrigatoriamente `RaitCaseCommandService`: remover `@Optional()` e
`new RaitOperationClock()` fallback; exigir provider injetado de Clock e
falhar antes de escrita se ausente, conforme ADR-0025, com snapshot único
por operação. Preserve política de prioridade, atomicidade, RLS, ator do
contexto e imutabilidade. A allowlist de escrita é exatamente a de
`TASK-0021-V3.md` §Dependência e allowlist, **exceto seed20**; não escrever
testes, DDL, contratos, blueprint, gerados, record ou `.devai`.

Hashes de leitura congelados (não editar):

- `backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`:
  `fd8197987f011345397519a949a9280cec2cabcc3c902f25dc547842437d1974`
- `backend/app/tests/shared/rait-case-command.fixture.ts`:
  `6087b10b08f3dcafa5c6ba8b812f0172cf9056db5f46a891b7e1bfb4f1d3336e`
- `backend/domains/inf/rait-case/tests/unit/rait-case-command-contract.spec.ts`:
  `082d4bc2b1f713dc76dd9d838bc7b7a8d53284326204e8fb190848d27c852d66`
- `backend/domains/inf/rait-case/tests/unit/rait-case-behavioral-matrix.spec.ts`:
  `bc3684de5f9a777634c04496c7f283982302bd2ea6e9f8ec54f06a9899e2feeb`
- `backend/domains/shared/src/policy.spec.ts`:
  `3fdf45f47051797ecd26f82f5e2ece9d28a8fe24dcd6fe27ea7eb5429cba9179`

Use banco dedicado descartável `detran_r7_ctg1_a2`, owner URL
`postgresql://aarusso@localhost/detran_r7_ctg1_a2`, app URL com papel
efetivo `role_app_backend`, e variáveis explícitas da suíte. Zero testes,
ausência de URL, papel incorreto ou falha infra não é GREEN. Execute policy,
unit C4, E2E dirigido protocol/admit, E2E completo, typechecks rait-case/app,
`pnpm verify:decorators`, Prettier e `git diff --check`. Relate comandos,
contagens, arquivos/hashes de produto, hashes dos sensores preservados,
achado→correção→prova e lacunas. STOP ao fim de 5/5, sem declarar GREEN se
restar RED.
