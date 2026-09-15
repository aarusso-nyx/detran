# Reviewer — delivery-review (`ops-agency`, R-0005, CTG-0001)

Papel constitucional: **Auditor** (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em
leitura na worktree `/Volumes/Thiamat II/stech/detran-worktrees/ops-agency`. Responda apenas com o
JSON do bloco Saída, sem markdown ou prosa antes/depois. A saída precisa ser JSON RFC 8259 estrito:
use aspas duplas ASCII em chaves e strings, escape qualquer aspa dupla interna, não use crases,
markdown, comentários ou quebras de linha dentro de strings, e valide o JSON antes de responder.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4–§5.
2. `docs/meta/agents/README.md` §Regras comuns.
3. `docs/framework/arch/teat-build-pack.md`: WP-T1 e o mapa entregável → definições.
4. `work/rounds/R-0005/plan.md`.
5. `work/rounds/R-0005/contracts/CTG-0001.md`.
6. `work/rounds/R-0005/reports/TASK-0001.md`, `TASK-0002.md`,
   `TASK-0002-iteration-1.md`, `TASK-0003.md`, `TASK-0003-iteration-1.md`,
   `TASK-0004-iteration-0.md` e `TASK-0004-iteration-2.md`.
7. O diff completo desde a base imutável `d8fe83a96b0301d27015de5958507cdad4a06d75` e todos os
   arquivos não rastreados listados por `git status --short`.

Você pode executar somente comandos de leitura (`git diff
d8fe83a96b0301d27015de5958507cdad4a06d75`, `git status --short`, `git diff --stat`, `rg`,
`sed`) para confirmar o material. Não escreva nenhum arquivo e não execute gates mutantes.

## Escopo da entrega

- Blueprints e saídas geradas: `BP-OPS-AGENCY-001`, `BP-OPS-FIELD-001`,
  `BP-OPS-SNAPSHOTS-001`, `BP-OPS-EVIDENCE-001`, `BP-OPS-OFFLINE-SYNC-001`; DDLs 13/16/17/18;
  pacotes `backend/domains/ops/{agency,field,snapshots,evidence,offline-sync}`; manifesto e OpenAPI.
- Código manuscrito preservado/migrado: controllers/providers FIELD, EVIDENCE e SNAPSHOTS; os
  pacotes legados `ops/operations` e `ops/evidence-custody` são removidos somente depois da
  migração; o módulo snapshots existente foi relocacionado no commit preparatório
  `98fcf673f39d3179ddfa333932c2805e2f911f77` antes da geração.
- Wiring: `backend/app/src/app.module.ts`, `backend/app/package.json`,
  `backend/app/vitest.config.ts`, `pnpm-lock.yaml` e remoção de RLS duplicado em DDL 20.
- Testes Inspector: `backend/app/tests/integration/ops-model.integration.spec.ts` e
  `backend/app/tests/e2e/ops-modules.e2e.spec.ts`.
- Arquitetura/governança: ADR-0023, índice de ADRs, contrato CTG-0001, tasks/prompts/reports/reviews
  e o checkpoint em `plan.md`. Os prompts TASK-0005…0009 existem, mas seus workers não foram
  iniciados e seu código não integra esta entrega.

## Resultado dos gates do maestro

- `pnpm blueprints:check`: PASS; árvore gerada corresponde aos blueprints.
- `pnpm contracts:check`: PASS; OpenAPI sincronizado.
- `pnpm typecheck`: PASS, 39 projetos aplicáveis.
- `pnpm verify:decorators`: PASS, 677 handlers.
- `pnpm verify:rls-ddl`: PASS, 148 tabelas tenant cobertas.
- `DB_NAME=detran_r5 DB_PASSWORD=postgres pnpm backend:db:reset`: PASS.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r5
DETRAN_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/detran_r5 pnpm
backend:test:ci`: PASS; integração app 10/10, e2e app 12/12 e demais pacotes verdes.
- `pnpm check`: PASS integral: formato, bridge, KB, blueprints, contratos, typecheck, UI e todos os
  `verify:*`.

## Iterações a verificar

- TASK-0002 iteração 1 apenas reordenou `ExternalQuery` antes de `VehicleSnapshot`, eliminando a
  FK futura sem mudar campos/semântica.
- TASK-0003 iteração 1 corrigiu uma fixture que inventava `entity_id`/`operation`; passou a usar os
  campos obrigatórios do blueprint (`agent_id`, `local_entity_id`, `created_locally_at`,
  `payload_hash`) e preservou a asserção UNIQUE `(tenant_id,idempotency_key)`/SQLSTATE 23505.
- O falso 503 de duas suítes preexistentes era configuração dividida: client de teste em
  `detran_r5`, pools do AppModule no banco padrão. Com `DATABASE_URL` e
  `DETRAN_TEST_DATABASE_URL` iguais, todo o gate passou sem alterar código ou testes.

## Rubrica

Julgue os itens 1, 4–11 e 13 do `reviewer-prompt.template.md`: papel; critérios executáveis;
nenhuma invenção; tríade e ordem dos testes; gates preservados; vocabulário; fronteira SENATRAN;
ADR/OD; entrega completa; autorizações positivas/negativas quando aplicáveis. Confirme em
particular que nenhum teste foi enfraquecido, nenhum gerado foi editado à mão, o RLS permanece
fail-closed, e os controllers manuscritos preservam o comportamento sem duplicidade.

Achado `high` corrigível → REVIEW; contradição canônica/Owner/ADR/Constituição → FAIL; sem achado
high → PASS. Achados não bloqueantes são `low`.

## Saída

```json
{
  "mode": "delivery-review",
  "round": "R-0005",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "path",
      "line": 1,
      "claim": "descrição verificável",
      "fix": "correção objetiva"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```
