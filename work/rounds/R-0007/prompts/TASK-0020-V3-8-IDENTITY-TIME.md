# TASK-0020 — continuação Inspector 8/8, identidade local e tempo

Papel Art. 6: Inspector, `gpt-5.6-terra/high`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`. Uma iteração 8/8 sem resetar 7/7. Um escritor
global. OWNER autorizou este ciclo delimitado após checkpoint TASK-0021
5/5; não autoriza relaxar gates nem editar produto.

Leia `AGENTS.md`, `CODESTYLE.md`, `.devai/pin/constitution.md`,
`docs/meta/agents/inspector-tests.md`,
`work/rounds/R-0007/prompts/TASK-0020-V3-7-FIXTURE.md`,
`work/rounds/R-0007/reports/TASK-0020-C4-OD-V3-CHECKPOINT-7.md`,
`work/rounds/R-0007/reports/TASK-0021-C4-OD-V3-CHECKPOINT-5.md`,
`backend/app/src/detran-runtime.ts`,
`backend/app/src/detran-runtime.spec.ts`,
`backend/app/tests/shared/rait-case-command.fixture.ts`,
`backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`,
`docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md` e
`docs/meta/adr/ADR-0025-rait-operation-clock-composition.md`.

Allowlist EXATA de escrita:

- `backend/app/src/detran-runtime.spec.ts`
- `backend/app/tests/shared/rait-case-command.fixture.ts`
- `backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`

Objetivo único: escrever prova RED do ator local/test por request no
`DetranLocalTokenVerifier` (mudar `DETRAN_LOCAL_ACTOR_ID` entre duas
verificações deve mudar principal.id, sem afetar a negação fora de perfis
locais), e corrigir somente as datas de escala/slot da fixture para que
positivos `decide` e `claim-next` testem disponibilidade vigente sob o
Clock de operação. Prefira Clock fixo no ensaio quando possível; se usar
datas relativas ao instante da operação, documente a derivação, fuso e
limites. Não converter negativos em positivos, não reduzir asserções, não
desabilitar trigger, não mudar dados legais históricos de protocolo, não
mascarar o 403 de roles. Preserve os cinco hashes congelados 7/7 exceto
os dois arquivos E2E/fixture autorizados; seus novos hashes devem ser
registrados. Os dois unit specs Clock e policy spec são leitura imutável.

Execute unit de `detran-runtime.spec.ts`, E2E dirigido `decide`/`claim-next`
e E2E completo com banco dedicado `detran_r7_ctg1_a2`, owner URL
`postgresql://aarusso@localhost/detran_r7_ctg1_a2` e app com papel efetivo
`role_app_backend`. Coleta zero ou URL/papel errado é BLOCKED. Reporte
RED real de produto versus fixture/infra, contagens e hashes; typecheck app,
Prettier e `git diff --check`. Não editar produto, DDL, seed, contrato,
gerados, outros sensores, record, `.devai` ou sibling. Sem commit/push/PR/merge.
Pare ao fim da iteração, mesmo se restar RED.
