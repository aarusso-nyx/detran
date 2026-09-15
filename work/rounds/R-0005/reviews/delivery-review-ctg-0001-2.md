# Reviewer — delivery-review cycle 2 (`ops-agency`, R-0005, CTG-0001)

Papel constitucional: **Auditor** (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em
leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/ops-agency` e julgue a entrega
remediada. Responda somente com JSON RFC 8259 estrito. O primeiro byte deve ser `{` e o último
deve ser `}`. Não use fences, crases, markdown, comentários ou quebras de linha dentro de strings;
escape aspas internas e valide o JSON antes de responder.

## Leitura fechada

1. `docs/meta/agents/orchestra/README.md` §4–§5 e `docs/meta/agents/README.md` §Regras comuns.
2. `docs/framework/arch/teat-build-pack.md`: WP-T1 e mapa entregável → definições.
3. `docs/framework/arch/teat-route-contract.md` §1 e §4.2–§4.5.
4. `work/rounds/R-0005/plan.md` e `contracts/CTG-0001.md`.
5. O review anterior recuperado em `reviews/delivery-review-ctg-0001.json`.
6. Relatórios de remediação `reports/TASK-0001-delivery-iteration-1.md`,
   `reports/TASK-0002-delivery-iteration-2.md` e `reports/TASK-0003-delivery-iteration-2.md`.
7. Todo o diff desde `d8fe83a96b0301d27015de5958507cdad4a06d75` e todos os arquivos não
   rastreados de `git status --short`.

Você pode executar somente comandos de leitura (`git diff`, `git status`, `rg`, `sed`, `jq`). Não
escreva arquivos nem execute gates mutantes.

## Highs anteriores que precisam estar fechados

1. `Evidence.location_geom geometry(Point,4674)` e seu GiST restaurados no blueprint/DDL.
2. As cinco geometrias FIELD e GiST de operational-device restaurados no blueprint/DDL.
3. `backend:rls-smoke` executado após reset e PASS.
4. `(tenant_id,hash_value)` de Evidence UNIQUE e duplicidade coberta com SQLSTATE 23505.
5. Os cinco blueprints têm `api` explícita sob `/v1/ops/{agency,field,snapshots,evidence,offline-sync}`,
   controllers/rotas e 5 OpenAPI gerados; e2e usa caminhos canônicos e exige 200.
6. ADR-0006 emendada: novos nomes, CRUD/persistência offline WP-T1, comandos handwritten
   posteriores e cobertura espacial obrigatória.

Confira que a emenda não contradiz a montagem atual: WP-T1 inclui os controllers CRUD gerados;
somente os comandos/protocolo handwritten ficam posteriores.

## Lows anteriores

- O e2e não pode mais passar em 403/500: oito leituras exigem 200 e o caso cross-tenant semeia
  outro tenant, consulta com o tenant local autorizado e exige resposta vazia.
- `backend/domains/ops/README.md` permanece explicitamente atribuído a TASK-0009, ainda queued e
  fora deste CTG; não trate isso como high de CTG-0001.
- Pacotes gerados ainda não têm specs locais; a cobertura desta fase é intencionalmente pelos
  testes app integration/e2e. Filtros unit entram quando WP-T2 criar specs locais.

## Gates independentes do maestro após remediação

- `DB_NAME=detran_r5 DB_PASSWORD=postgres pnpm backend:db:reset`: PASS.
- `DETRAN_TEST_DATABASE_URL=.../detran_r5 pnpm backend:rls-smoke`: PASS, incluindo isolamento,
  SRID-4674 e auditoria.
- `backend:test:ci` com owner em postgres e pools app/reader iniciados como
  `role_app_backend`: PASS; app integration 11/11, app e2e 12/12, demais pacotes verdes.
- `git diff --check && pnpm check`: PASS integral; blueprints, contratos, typecheck, UI, decorators,
  RLS, papéis, vocabulário, SENATRAN e PEC verdes.

## Rubrica e saída

Julgue itens 1, 4–11 e 13 do template `reviewer-prompt.template.md`. `PASS` exige zero high;
`REVIEW` indica high corrigível; `FAIL` indica contradição canônica. Preserve lows restantes como
notas.

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
