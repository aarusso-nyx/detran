# Delivery review — CTG-0001 — R-0004

Você é o reviewer independente **Fable 5.1**, família oposta ao maestro. Papel constitucional:
**Auditor** (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/param-store`. Não altere arquivos e responda apenas com
o JSON especificado abaixo.

## Leitura

1. `docs/meta/agents/orchestra/README.md` §4 e §5
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/rait-build-pack.md` somente WP-A e mapa entregável → definições
4. `docs/meta/adr/ADR-0021-shared-parameter-store.md`
5. `work/rounds/R-0004/plan.md`
6. `work/rounds/R-0004/reports/TASK-0001.md`, `TASK-0002.md`, `TASK-0003.md`
7. Os arquivos CTG-0001 listados abaixo e suas versões em `HEAD`, quando existentes. Use
   `git diff -- <paths>` somente para leitura; para arquivos novos, leia o conteúdo integral.

## Escopo CTG-0001

- `docs/framework/blueprints/BP-OPS-PARAMETER-001.json`
- `docs/framework/arch/ops-parameter-command-contract.md`
- `docs/framework/contracts/BP-OPS-PARAMETER-001.openapi.json`
- `backend/database/ddl/15-ops-parameter.sql`
- `backend/domains/ops/parameter/**`, exceto
  `src/generated/parameter-catalogue.ts` que pertence ao CTG-0002
- `backend/domains/shared/src/policy.ts`
- `backend/app/package.json`, `backend/app/src/app.module.ts`, `backend/app/vitest.config.ts`
- `tools/blueprints/generated-files.json`, `pnpm-lock.yaml`

## Evidência do maestro

- Unit ops-parameter: 49/49 PASS.
- Integração PostgreSQL/RLS ops-parameter: 1/1 PASS.
- App E2E após boot do módulo: 10/10 PASS; inf-ait E2E: 1/1 PASS.
- `pnpm check`, `pnpm build` e `pnpm backend:test:ci`: PASS.
- Banco isolado: `detran_r4_param_store`; runtime e testes apontados para a mesma base.
- Nenhum commit, push ou PR foi feito.

## Rubrica

Verifique: papel/fronteira; aderência integral ao ADR-0021/WP-A; nenhum valor/código de erro
inventado; test-first e grants positivo/negativos; RLS e tenant context fail-closed; SQL
parametrizado; versionamento/vigência/If-Match/idempotência; outbox na transação e cache após
sucesso; decorators; gerados não editados à mão; fronteira SENATRAN; gates não enfraquecidos;
entrega completa e parcimoniosa. Cite arquivo e linha em cada achado.

`PASS`: nenhum high. `REVIEW`: ao menos um high corrigível. `FAIL`: contradição de autoridade,
ADR ou Constituição.

## Saída

```json
{
  "mode": "delivery-review",
  "round": "R-0004",
  "coupled_task_group": "CTG-0001",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 1,
      "file": "path",
      "line": 1,
      "claim": "descrição verificável",
      "fix": "correção concreta"
    }
  ],
  "notes": []
}
```
