# Reviewer — delivery-review cycle 3 autorizado (`ops-agency`, R-0005, CTG-0001)

Papel constitucional: **Auditor** (soft gate, Constituição DEVAI Art. 18). O Owner autorizou
explicitamente esta terceira revisão excepcional em 2026-09-14. Trabalhe somente em leitura na
worktree `/Volumes/Thiamat II/stech/detran-worktrees/ops-agency` e julgue a entrega após a
escalada Architect Sol. Responda somente com JSON RFC 8259 estrito. O primeiro byte deve ser `{` e
o último deve ser `}`. Não use fences, crases, markdown, comentários ou quebras de linha dentro de
strings; escape aspas internas e valide o JSON antes de responder.

## Leitura fechada

1. `docs/meta/agents/orchestra/README.md` §4–§5 e `docs/meta/agents/README.md` §Regras comuns.
2. `docs/framework/arch/teat-build-pack.md`: WP-T1 e mapa entregável → definições.
3. `docs/framework/arch/teat-route-contract.md` §1 e §4.2–§4.5.
4. `work/rounds/R-0005/plan.md` e `contracts/CTG-0001.md`.
5. `reviews/delivery-review-ctg-0001.json` e
   `reviews/delivery-review-ctg-0001-2.json`.
6. `reports/TASK-0001-delivery-iteration-1.md`,
   `reports/TASK-0002-delivery-iteration-2.md`,
   `reports/TASK-0003-delivery-iteration-2.md` e
   `reports/CTG-0001-contract-escalation.md`.
7. Todo o diff desde `d8fe83a96b0301d27015de5958507cdad4a06d75` e todos os arquivos não
   rastreados de `git status --short`.

Você pode executar somente comandos de leitura (`git diff`, `git status`, `rg`, `sed`, `jq`). Não
escreva arquivos nem execute gates mutantes.

## Escopo decisivo desta terceira revisão

Confirme independentemente o fechamento dos dois highs e dois lows do ciclo 2:

1. Os quatro blueprints remediados usam `api.basePath` terminado em `/` e paths relativos; os 64
   paths OpenAPI não contêm `//`.
2. Todos os 32 recursos têm `resources[].resource` explícito; nenhuma operação OpenAPI tem tag
   nula.
3. As rotas fechadas são `agents`, `devices`, `numbering-ranges` e `receipts`, com recursos
   singulares `agent-profile`, `operational-device`, `numbering-range` e `sync-receipt`; os
   controllers, OpenAPI e o e2e concordam.
4. TASK-0001 e TASK-0002 possuem locks para blueprint, pacote gerado, DDL, OpenAPI e o manifesto
   compartilhado `MOD-blueprints-generated-manifest`.

Também confirme que as correções não regrediram os highs anteriormente fechados: geometrias
SRID-4674 e GiST de FIELD/EVIDENCE, UNIQUE `(tenant_id, hash_value)` de Evidence com teste 23505,
cinco APIs OPS montadas, e2e com respostas 200 e isolamento cross-tenant, ADR-0006 coerente com
CRUD gerado em WP-T1 e apenas comandos/protocolo handwritten adiados, RLS fail closed e nenhum
comportamento handwritten perdido.

## Gates independentes do maestro após a escalada

- `DB_NAME=detran_r5 DB_PASSWORD=postgres pnpm backend:db:reset`: PASS, `apply.sh: done`.
- `DETRAN_TEST_DATABASE_URL=.../detran_r5 pnpm backend:rls-smoke`: PASS, incluindo isolamento,
  OPS RLS, SRID-4674 e auditoria.
- `backend:test:ci` com owner em postgres e pools app/reader iniciados como `role_app_backend`:
  PASS; app unit 49/49, app integration 11/11, inf-ait integration 2/2, app e2e 12/12 e inf-ait
  e2e 1/1.
- `pnpm check`: PASS integral; format, bridge, KB, publish dry-run, blueprints, contratos,
  typecheck, UI, decorators, RLS, papéis, vocabulário, SENATRAN e PEC verdes.
- `git diff --check`: PASS. HEAD permanece
  `98fcf673f39d3179ddfa333932c2805e2f911f77`; nenhum commit ou push foi feito.

## Lows conscientemente fora deste CTG

- `backend/domains/ops/README.md` segue atribuído à TASK-0009, queued.
- Pacotes gerados ainda não têm specs locais; nesta fase a cobertura é pelos testes app
  integration/e2e. Filtros unit entram quando WP-T2 criar specs locais.

## Rubrica e saída

Julgue itens 1, 4–11 e 13 do template `reviewer-prompt.template.md`. `PASS` exige zero high;
`REVIEW` indica high corrigível; `FAIL` indica contradição canônica. Preserve lows restantes como
notas. Não rebaixe high a low para produzir PASS.

{
"mode": "delivery-review",
"round": "R-0005",
"verdict": "PASS | REVIEW | FAIL",
"findings": [
{
"severity": "high | low",
"item": 7,
"file": "path",
"line": 1,
"claim": "plain text",
"fix": "plain text"
}
],
"notes": ["plain text"]
}
