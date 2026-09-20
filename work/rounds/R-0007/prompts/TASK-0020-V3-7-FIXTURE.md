# TASK-0020 — continuação Inspector 7/7 autorizada pelo OWNER

Papel Art. 6: Inspector, `gpt-5.6-terra/high`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`. Uma iteração adicional 7/7 sem zerar 6/6.
Um escritor global. Sem commit, push, PR ou merge.

Leia `AGENTS.md`, `CODESTYLE.md`, `.devai/pin/constitution.md`,
`docs/meta/agents/inspector-tests.md`,
`work/rounds/R-0007/prompts/TASK-0020-V3.md`,
`work/rounds/R-0007/reports/TASK-0020-C4-OD-V3-CHECKPOINT-6.md`,
`work/rounds/R-0007/reports/TASK-0021-C4-OD-V3-CHECKPOINT-4.md`,
`docs/meta/adr/ADR-0025-rait-operation-clock-composition.md`,
`backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`,
`backend/app/tests/shared/rait-case-command.fixture.ts`, manual OpenAPI de
intake, DDL34 e os dois unit specs C4 abaixo. Contratos D1/C4/C4-OD continuam vinculantes. O OWNER
autorizou corrigir os dois defeitos de teste/fixture identificados, não
afrouxar contrato, cobertura ou testes.

Allowlist EXATA de escrita:

- `backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`
- `backend/app/tests/shared/rait-case-command.fixture.ts`
- `backend/domains/inf/rait-case/tests/unit/rait-case-command-contract.spec.ts`
- `backend/domains/inf/rait-case/tests/unit/rait-case-behavioral-matrix.spec.ts`

Objetivo: (1) `protocolBody()` gerar `protocol_number` único e válido com
comprimento máximo 40, mantendo os casos negativos e positivos; (2) preparar
cenários de admit e cronologia sem UPDATE de `protocolled_at` em caso já
existente, pois DDL proíbe mutação. Preservar a prova de fuso America/Manaus
na fronteira UTC e a imutabilidade; usar dados/SQL de fixture somente na
allowlist, sem desabilitar trigger ou contornar política de produto. Se o
cenário exigir mudança fora da allowlist, STOP e relate. Não editar produto,
policy, DDL, seed, blueprints, gerados, outros sensores, record ou `.devai`.

Reconcilie também os dois unit specs: instância direta e metadados de DI
devem passar a exigir o quinto provider `RaitOperationClock` explícito com
snapshot fixo, sem fallback nem redução de asserções. O serviço de produção
ainda possui fallback e será corrigido pelo Engineer seguinte; um RED
específico até lá é válido, não defeito do sensor.

Ambiente explícito: banco descartável `detran_r7_ctg1_a2`, owner URL
`postgresql://aarusso@localhost/detran_r7_ctg1_a2`; URL app deve exercer
`role_app_backend`, nunca usar admin como app. Não imprimir segredos.
Execute E2E direcionado aos positivos de protocol e binding admit, depois
E2E completo e unit C4 direcionado, todos com coleta não zero; classifique
GREEN/RED de produto versus fixture/infra. Typecheck app/rait-case,
Prettier, `git diff --check`. Congele SHA-256 dos arquivos alterados e confirme policy spec SHA
`3fdf45f47051797ecd26f82f5e2ece9d28a8fe24dcd6fe27ea7eb5429cba9179`
intacto. Entrega: mudanças, comandos/contagens/status, hashes, lacunas e
decisão de elegibilidade Engineer. Pare após esta iteração.
