# Revisão restrita de CTG-0001 — correções do ciclo válido 1

Papel: Auditor (soft gate), modo `delivery-review`, rodada `R-0010`, frente
`boat-backend`. Trabalhe somente em leitura nesta worktree. Leia
`work/rounds/R-0010/reviews/delivery-review-CTG-0001-cycle-2.json` e avalie
**somente** as correções dos seis achados `high` e as notas `low` causadas pelas
mesmas mudanças, conforme §5 do método. O primeiro ciclo válido foi exaustivo.

Arquivos de correção para conferir:

- `backend/app/tests/e2e/policy-routes.e2e.spec.ts` e
  `backend/app/tests/e2e/boat-crash-commands.e2e.spec.ts`: os REDs de WP-B2
  mudaram para CTG-0002 sem alterar suas expectativas; o gate bidirecional
  lista explicitamente as ações EST efetivamente montadas neste corte. O
  controller provisório de `start` saiu do blueprint e da árvore manuscrita.
- `backend/domains/shared/src/policy.ts` e `policy.spec.ts`: mapeamento dos
  papéis de leitura BOAT, `crash-link` incluído, matrizes exaustivas e remoção
  das duplicatas EST do bloco TEAT.
- `docs/framework/product/domains/est/boat/use-cases/INDEX.md`: status
  sincronizados com os frontmatters de UC-BOAT-001…013.
- `docs/framework/blueprints/BP-EST-CRASH-001.json`, DDL gerado 70,
  OpenAPI/clientes, `backend/database/seed/70-fixtures-est-crash.sql` e
  `backend/domains/est/crash/tests/integration/boat-contract.integration.spec.ts`:
  chave natural única, tipo de retificação e check do espelho nacional.
- `work/rounds/R-0010/contracts/CTG-0001.md` adendas A-2/A-3 e
  `work/rounds/R-0010/reports/TASK-0001.md`…`TASK-0004.md`: corte e decisões
  explicitados.

Validação independente até aqui: `@detran/shared test` 186 PASS,
`@detran/est-crash test:unit` 1 PASS, integração 21 PASS, typecheck PASS,
`policy-routes.e2e.spec.ts` 4 PASS; `apply.sh --full` e `seed.sh` duas vezes
PASS em `detran_r10`. O `pnpm check` integral será repetido antes do commit.

Responda somente um objeto JSON válido, compacto, sem Markdown. Primeiro byte
`{`, último `}`. Chaves: `mode`=`delivery-review`, `round`=`R-0010`,
`verdict`=`PASS|REVIEW|FAIL`, `findings` como array de objetos
`{severity,item,file,line,claim,fix}`, `notes` como array. `PASS` se nenhum
`high` remanescer; `REVIEW` para `high` corrigível; `FAIL` só para
contradição canônica/ADR/Constituição ou violação de fronteira de escrita.
