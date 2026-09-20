# TASK-0020 — Inspector 12/13, último ciclo de fixtures C4

Papel Art. 6: Inspector `gpt-5.6-terra/high`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`. OWNER autorizou uma continuação 12/13 sem reset.
Um escritor; sem commit/push/PR/merge.

Leia `AGENTS.md`, `CODESTYLE.md`, `.devai/pin/constitution.md`,
`docs/meta/agents/inspector-tests.md`,
`work/rounds/R-0007/reports/TASK-0020-C4-OD-V3-CHECKPOINT-11.md`,
`work/rounds/R-0007/contracts/CTG-0001-C4-IDENTITY-BRIDGE.md`,
`backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`,
`backend/app/tests/shared/rait-case-command.fixture.ts`,
`backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts`,
`backend/database/ddl/19-rait-priority-enforce.sql` e
`docs/meta/adr/ADR-0024-rait-legal-priority-owner-policy.md`.

Allowlist EXATA de escrita:

- `backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`
- `backend/app/tests/shared/rait-case-command.fixture.ts`

Objetivo: corrigir somente as dez falhas de fixture/precondição classificadas
no checkpoint 11, preservando asserções e a história legal. Decisão:
`RAIT_AUTHORITY` autenticado deve ter o membro de autoridade coerente.
Bindings admit devem partir de estado/instância/escopo válidos, sem mutar
`protocolled_at` ou `id`, sem desabilitar triggers. Cetran requer membership
secretaria ativa no tenant/pool/instância/unidade exatos. Nos cinco cenários
timer/timezone, diagnostique o 400 do protocolo por corpo, resposta, SQL ou
pré-estado antes de corrigir; não conte a falha de setup como negativa PASS.
Não alterar datas de parâmetro legal, seed, DDL, produto ou `audit`.

O sensor de auditoria do protocolo deve permanecer RED específico (+2
observado versus +1 esperado) até Engineer corrigir o interceptor. Não
afrouxar igualdade de efeitos, eventos, imutabilidade, papéis ou HTTP.
Executar E2E dirigido a esses 10 cenários e depois E2E completo com
`DETRAN_TEST_TIER=e2e`, banco descartável `detran_r7_ctg1_a2`, owner
`postgresql://aarusso@localhost/detran_r7_ctg1_a2`, app e DATABASE URL
com papel efetivo `role_app_backend`. Zero coleta/URL ou role incorreto é
BLOCKED. Esperado: 10 fixtures passam, só auditoria permanece RED real;
se não, STOP e discrimine. Typecheck app, Prettier, diff check, SHA dos
dois sensores. Não escrever outros sensores, produto, record, `.devai` ou
sibling. Inspector 13/13 fará observação GREEN após Engineer.
