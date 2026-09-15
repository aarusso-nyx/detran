# Revisão focal final — CTG-0002

Você é o reviewer Auditor da família oposta para ops-agency, R-0005. Trabalhe somente em leitura
na worktree `/Volumes/Thiamat II/stech/detran-worktrees/ops-agency`. Responda somente com JSON RFC
8259 estrito. O primeiro byte deve ser `{` e o último `}`; nenhuma fence Markdown.

Leia `docs/meta/agents/orchestra/reviewer-prompt.template.md` e aplique integralmente a rubrica de
delivery-review. Depois leia:

- `work/rounds/R-0005/reviews/delivery-review-ctg-0002-escalation.json`;
- `work/rounds/R-0005/reports/TASK-0006.md` e `TASK-0007.md`;
- `docs/framework/product/domains/inf/teat/rules/RN-TEAT-005.md`;
- `docs/framework/product/domains/inf/teat/rules/RN-TEAT-131.md`;
- `docs/framework/product/domains/inf/teat/rules/RN-TEAT-134.md`;
- `docs/framework/product/domains/inf/teat/workflows/WF-TEAT-005.md`;
- `backend/domains/inf/alcohol/src/alcohol-lifecycle.service.ts`;
- `backend/domains/inf/alcohol/src/alcohol-lifecycle.service.spec.ts`.

Inspecione o diff focal completo com:

    git diff HEAD -- backend/domains/inf/alcohol/src/alcohol-lifecycle.service.ts backend/domains/inf/alcohol/src/alcohol-lifecycle.service.spec.ts work/rounds/R-0005/reports/TASK-0006.md work/rounds/R-0005/reports/TASK-0007.md

O review anterior confirmou fechados todos os cinco highs históricos, mas encontrou um novo high:
recordRefusal tinha default refusal e também gravava outcome refusal para technical_impossibility.
O Inspector então observou 2 falhas e 3 testes verdes antes da correção. O candidato agora exige
kind em tipo e runtime, falha antes da transação quando ausente, persiste o kind literal e usa o
próprio ramo como outcome. O unit do pacote passou 5/5 e o typecheck passou. No estado final,
`backend:test:ci` passou integralmente no banco `detran_r5` com pools app/reader sob
`role_app_backend`, e `pnpm check` passou integralmente. Uma tentativa anterior de
`backend:test:ci` sem as variáveis do banco isolado observou somente tabelas ausentes no banco
padrão e foi classificada como sensor-error; nenhum código ou teste foi alterado por ela.

Confirme especificamente que o high foi fechado sem nova classificação punitiva e que nenhum dos
cinco highs históricos foi reaberto pelo delta focal. Os lows já emitidos permanecem roteados e
não devem virar high sem nova violação vinculante. Não revise CTG-0003.

Saída com chaves `mode`, `round`, `verdict`, `findings`, `notes`; mode `delivery-review`, round
`R-0005`. Cada finding contém `severity`, `item`, `file`, `line`, `claim`, `fix`. PASS exige zero
highs.
