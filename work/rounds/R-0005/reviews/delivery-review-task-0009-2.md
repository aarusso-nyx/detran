# Revisão de entrega ciclo 2 — TASK-0009

Você é o reviewer Auditor da família oposta para a orquestra ops-agency, rodada R-0005. Trabalhe
somente em leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/ops-agency`. Responda
apenas com um objeto JSON RFC 8259 estrito, sem Markdown, texto anterior ou posterior e sem
caracteres de crase dentro de valores string.

Leia `docs/meta/agents/orchestra/reviewer-prompt.template.md` e aplique integralmente o modo
`delivery-review`; depois leia, nesta ordem: WP-T1 de `docs/framework/arch/teat-build-pack.md`,
`work/rounds/R-0005/plan.md`, `work/rounds/R-0005/prompts/TASK-0009.md`,
`work/rounds/R-0005/reports/TASK-0009.md`, e o veredito anterior
`work/rounds/R-0005/reviews/delivery-review-task-0009.json`.

Inspecione o diff completo dos seis documentos com:

    git diff HEAD -- docs/framework/arch/teat-build-pack.md docs/framework/arch/teat-route-contract.md docs/framework/blueprints/README.md backend/domains/ops/README.md docs/meta/knowledge-base/decision-closure-plan.md docs/meta/knowledge-base/backlog.md

Confirme individualmente o fechamento dos dois highs e dos cinco lows do ciclo 1, e procure
regressões novas. O checkpoint independente repetiu: `format:check` PASS; `docs:kb:check` PASS
521/446; `docs:kb:publish-check` PASS 201 com raw/internal excluído; `git diff --check` PASS.
Não revise tracking, observação Auditor ou produto já integrado.

Use exatamente as chaves `mode`, `round`, `verdict`, `findings`, `notes`. `mode` deve ser
`delivery-review`, `round` deve ser `R-0005`; verdict é `PASS`, `REVIEW` ou `FAIL`. Cada finding
tem `severity`, `item`, `file`, `line`, `claim`, `fix`. PASS exige zero highs.
