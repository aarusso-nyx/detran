# TASK-0021 — Engineer 7/7, auditoria do protocolo

Papel Art. 6: Engineer `gpt-5.6-terra/high`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
`orchestra/rait-backend`. OWNER autorizou uma continuação 7/7 sem reset,
um escritor e nenhuma revisão intermediária repetida. Sem commit/push/PR/merge.

Leia `AGENTS.md`, `CODESTYLE.md`, `.devai/pin/constitution.md`,
`docs/meta/agents/engineer-backend.md`,
`work/rounds/R-0007/reports/TASK-0020-C4-OD-V3-CHECKPOINT-11.md`,
`backend/app/src/rait-transactional-audit.interceptor.ts`,
`backend/app/src/rait-transactional-audit.interceptor.spec.ts`,
`backend/domains/inf/rait-case/src/handwritten/rait-case-command.service.ts` e
`backend/app/tests/e2e/rait-case-commands.e2e.spec.ts`.

Allowlist EXATA de escrita: somente
`backend/app/src/rait-transactional-audit.interceptor.ts`. A suíte E2E
congelada tem SHA-256
`2ceab4fb6f5fa4468fd6fd8ed3096a9455f7c467c7c57aef72ff7c655fd0a0fa`;
fixture compartilhada
`992c09b78e320b35f7391f7754f39fe739681b87eae557099a23d3bd886af519`.
Confirme esses hashes antes/depois. Inspector 12/13 obteve 10/10 dirigidos
e 97/98 E2E; único RED é protocolo com audit delta +2 em vez de +1.

Objetivo: excluir o handler concreto `protocol` do delegado genérico de audit
porque o serviço grava auditoria transacional própria. Preserve audit de
handlers não RAIT, rollback, outbox e igualdade de efeitos. Não alterar
serviço, controller, testes, fixtures, SQL, gerados ou governança. A correção
deve ser mínima e baseada em identidade de handler, não URL.

Rode teste unitário do interceptor, typecheck app, Prettier, diff check, e
E2E RAIT integral com `DETRAN_TEST_TIER=e2e` e banco dedicado descartável
`detran_r7_ctg1_a2`. Owner URL:
`postgresql://aarusso@localhost/detran_r7_ctg1_a2`; app/DATABASE URL com
papel efetivo `role_app_backend` (não superuser, sem BYPASSRLS). Zero
coleta, URL ausente ou papel incorreto é BLOCKED. Esperado: 98/98 GREEN,
audit delta +1, sensores congelados intactos. Se falhar, STOP, reporte o
erro exato e não amplie escopo. Entrega: papel, paths, comandos/resultados,
hashes e status.
