# Revisão focal de escalada — TASK-0009

Você é o reviewer Auditor da família oposta para a orquestra ops-agency, rodada R-0005. Trabalhe
somente em leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/ops-agency`. Responda
apenas com um objeto JSON RFC 8259 estrito, sem Markdown, texto anterior ou posterior e sem
caracteres de crase dentro de valores string.

Leia `docs/meta/agents/orchestra/reviewer-prompt.template.md` em modo `delivery-review`, depois
`work/rounds/R-0005/reviews/delivery-review-task-0009-2.json`,
`work/rounds/R-0005/reports/TASK-0009.md`, WP-T1 de
`docs/framework/arch/teat-build-pack.md` e §2 de
`docs/framework/arch/teat-route-contract.md`.

Inspecione o diff atual apenas dos seis documentos TASK-0009:

    git diff HEAD -- docs/framework/arch/teat-build-pack.md docs/framework/arch/teat-route-contract.md docs/framework/blueprints/README.md backend/domains/ops/README.md docs/meta/knowledge-base/decision-closure-plan.md docs/meta/knowledge-base/backlog.md

Confirme o fechamento do único high e dos dois lows do ciclo 2: FIELD não declara CHECKs
inexistentes; datas 2026-09-14/2026-09-15 são coerentes; superfícies handwritten 10/5/5 estão
preservadas e pacotes `@detran/*` nomeados. Procure somente regressões materiais novas. Checkpoint
independente final: `format:check` PASS, KB 521/446 PASS, publish 201 PASS, `git diff --check` PASS.

Use exatamente as chaves `mode`, `round`, `verdict`, `findings`, `notes`. `mode` deve ser
`delivery-review`, `round` deve ser `R-0005`; verdict é `PASS`, `REVIEW` ou `FAIL`. Cada finding
tem `severity`, `item`, `file`, `line`, `claim`, `fix`. PASS exige zero highs.
