# TASK-0021 — iteração Engineer 4/4 com exceção de sequência OWNER

Papel Art. 6: **Engineer**, `gpt-5.6-terra/high`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`. Uma única iteração 4/4; histórico 3/4 intacto,
um escritor global. Declare papel. Este overlay prevalece somente na
dependência RED e no tratamento da fixture; todo escopo e proibições não
conflitantes de `TASK-0021-V3.md`, D1, C4 e C4-OD continuam vinculantes.

## Leitura fechada

Leia integralmente `AGENTS.md`, `CODESTYLE.md`,
`.devai/pin/constitution.md`, `docs/meta/agents/engineer-backend.md`,
`work/rounds/R-0007/prompts/TASK-0021-V3.md`,
`work/rounds/R-0007/plan.md`,
`work/rounds/R-0007/contracts/CTG-0001.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-OD.md`,
`docs/framework/contracts/manual/rait-priority-intake.commands.openapi.json`,
`docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md`,
`docs/meta/adr/ADR-0025-rait-operation-clock-composition.md`,
`work/rounds/R-0007/reports/TASK-0020-C4-OD-V3-CHECKPOINT-6.md`,
`backend/domains/shared/src/policy.spec.ts`,
`backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`,
`backend/domains/inf/rait-case/src/handwritten/rait-case-commands.controller.ts`,
`backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`,
`backend/domains/inf/rait-case/src/handwritten/rait-operation-clock.ts`.

## OWNER: exceção estrita de sequência

TASK-0020 ficou checkpoint 6/6: policy 120 coletados/7 RED por admin e
wildcards; E2E 98 coletados/47 RED por HTTP real, mas 44 cenários novos
param em 404 porque POST `/v1/inf/rait/cases` ainda não está ligado. OWNER
autorizou despachar este Engineer **sem reclassificar** o 404 como prova de
403/400/vínculo e sem declarar TASK-0020 concluída. Os sensores ficam
congelados nos SHA-256:

- `backend/domains/shared/src/policy.spec.ts`:
  `3fdf45f47051797ecd26f82f5e2ece9d28a8fe24dcd6fe27ea7eb5429cba9179`
- `backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`:
  `149d4be08a2e526b8cefb48f1df480c70bf5ff907076a4cf7d34d6d99418801c`

Comece pela exceção `inf:rait-case:protocol` em `policy.ts` antes de
admin/permission shortcuts, e pela rota/controller/serviço POST protocol
conforme OpenAPI manual. A autoridade do ator vem exclusivamente de
RequestContext; vínculo secretary é validado dinamicamente no tenant,
instância e unidade; payload não pode fornecer ator/tenant/rank/assessment.
Qualifique prioridade pelo SQL oficial no mesmo ato/transação, com um Clock
snapshot e timezone IANA do tenant; `protocolled_at`/`id` imutáveis.
Então avance o restante do GREEN C4-OD dentro da allowlist antiga. A presença
do provider Clock e o perfil seed fresh revisado não equivalem a wiring
completo. Não edite testes, blueprint, DDL, gerados ou a seed20: o split
fresh/legacy já foi revisado e seed20 preserva história. Se uma correção
exigir path fora da allowlist de `TASK-0021-V3.md`, STOP e reporte.

Execute em sequência enxuta: teste filtrado policy, E2E protocol/rota,
unit C4, runtime DB, E2E completo, typecheck de rait-case/app,
`pnpm verify:decorators`, Prettier dos arquivos tocados e `git diff --check`.
Use `DETRAN_TEST_DATABASE_URL=postgresql://aarusso@localhost/detran_r7_ctg1_a2`
e aplicação no mesmo banco com papel efetivo `role_app_backend` por URL
explícita; não imprima credenciais. Zero testes, falta de URL, 404 remanescente
ou erro de infraestrutura não é GREEN. Reporte comandos/contagens, hashes
dos sensores antes/depois, arquivos alterados, gaps e status honesto.
Sem commit/push/PR/merge, sibling, record ou `.devai`.
