# TASK-0023 — registro normalizado da continuação V3 consumida

Papel Article 6: Architect. Executor separado: `gpt-6-astra/medium`. Worktree `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch `orchestra/rait-backend`, HEAD inicial `df1e1769941e527a07b6db7550aee84068f3a872`. A continuação 2/2 foi despachada por mensagem de subagente na sessão do Maestro; este arquivo registra seus termos para revisão, mas **não afirma ser o byte stream original da chamada**. O registro real é a chamada da sessão. Não despachar novamente: limite 2/2 consumido.

Leitura exigida: `AGENTS.md`, `CODESTYLE.md`, `.devai/pin/constitution.md`, `docs/meta/agents/architect-blueprint.md`, `work/rounds/R-0007/contracts/CTG-0001.md`, `work/rounds/R-0007/contracts/CTG-0001-C4.md`, `work/rounds/R-0007/contracts/CTG-0001-C4-OD.md`, `work/rounds/R-0007/reports/CTG-0001-C4-BINDINGS.md`, `work/rounds/R-0007/reports/CTG-0001-C4-OD-PLAN.md`, `work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v2-sol-1.json`, `backend/domains/shared/src/roles.ts`, `backend/domains/shared/src/policy.ts`, `backend/database/apply.sh`, `backend/database/ddl/20-rls-policies.sql` e `backend/database/ddl/34-inf-rait-case.sql`.

Allowlist exclusiva da continuação:

- `work/rounds/R-0007/contracts/CTG-0001-C4.md`
- `work/rounds/R-0007/contracts/CTG-0001-C4-OD.md`
- `work/rounds/R-0007/reports/CTG-0001-C4-BINDINGS.md`
- `work/rounds/R-0007/reports/CTG-0001-C4-OD-PLAN.md`

Objetivo: reconciliar oito findings V2 com precedência V3, SQL manual em três `ddl/19` e `apply.sh` transacional, papéis separados para parâmetro, gate independente pós-0023, matriz nominal de protocol com 36 papéis, guard da política antes dos atalhos admin/permission, comandos futuros e preservação dos 14 comandos, seis providers, 90/17 e `protocolled_at`/`id` imutáveis. O resultado foi documentação somente, sem código/SQL/DB/geração ou tarefa de implementação. Prettier passou nos quatro documentos; compatibilidade SQL segue estática até ensaio PostgreSQL. O próximo gate é a revisão independente do candidato V3 com hashes congelados.
