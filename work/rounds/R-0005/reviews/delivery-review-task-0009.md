# Revisão de entrega — TASK-0009

Você é o reviewer Auditor da família oposta para a orquestra ops-agency, rodada R-0005. Trabalhe
somente em leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/ops-agency`. Responda
apenas com um objeto JSON RFC 8259 estrito, sem Markdown, texto anterior ou posterior e sem
caracteres de crase dentro de valores string.

## Leitura e rubrica vinculantes

Leia, nesta ordem:

1. `docs/meta/agents/orchestra/reviewer-prompt.template.md`, aplicando integralmente o modo
   `delivery-review` e seus 13 itens;
2. `docs/framework/arch/teat-build-pack.md`, somente WP-T1;
3. `work/rounds/R-0005/plan.md`, metas, bloqueios e estado terminal dos CTGs;
4. `work/rounds/R-0005/prompts/TASK-0009.md` e `work/rounds/R-0005/tasks/TASK-0009.json`;
5. `work/rounds/R-0005/reports/TASK-0009.md`;
6. os seis documentos modificados, pelo diff integral abaixo.

Inspecione o diff completo atual com:

    git diff HEAD -- docs/framework/arch/teat-build-pack.md docs/framework/arch/teat-route-contract.md docs/framework/blueprints/README.md backend/domains/ops/README.md docs/meta/knowledge-base/decision-closure-plan.md docs/meta/knowledge-base/backlog.md

O comando é o anexo integral por referência ao estado da worktree desta chamada. Não revise as
mutações de tracking, observação Auditor ou produto já integrado nos PRs #40/#41/#42.

## Fatos imutáveis a conferir

- CTG-0001: PR #40, merge `1c662f08ab3a7a61db754700dbe45fd91680de25`.
- CTG-0002: PR #41, merge `bb4797ab38cc4cf47d500e29b203925b29861057`; run
  `34922071820`, cinco jobs verdes.
- CTG-0003: PR #42, merge `30118fa749801d43e7b0b3238ed19b241c8b9114`; run
  `34923196682`, cinco jobs verdes; observação `EV-a6f9b7b940fd0b04`.
- Gates desta tarefa: `format:check` PASS; `docs:kb:check` PASS em 521/446;
  `docs:kb:publish-check` PASS em 201 arquivos com raw/internal excluído; `git diff --check` PASS.
- A revisão deve verificar especialmente se a documentação distingue modelo/CRUD WP-T1 de
  comandos WP-T2, não declara provisioning nem WP-T2+ concluídos, e mantém lacunas de vocabulário
  como pendentes. Verifique também consistência interna entre a linha de `shift.status` no build
  pack e a declaração `source_pending` nos demais documentos.

## Saída

Use exatamente as chaves `mode`, `round`, `verdict`, `findings`, `notes`. `mode` deve ser
`delivery-review`, `round` deve ser `R-0005`; verdict é `PASS`, `REVIEW` ou `FAIL`. Cada finding
tem `severity`, `item`, `file`, `line`, `claim`, `fix`. PASS exige zero highs.
