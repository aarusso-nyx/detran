# Delivery review — CTG-0002 — R-0004

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
6. `work/rounds/R-0004/reports/TASK-0004.md`, `TASK-0005.md`, `TASK-0006.md`
7. Os arquivos CTG-0002 listados abaixo e suas versões em `HEAD`, quando existentes. Use
   `git diff -- <paths>` somente para leitura; para arquivos novos, leia o conteúdo integral.

## Escopo CTG-0002

- `docs/framework/arch/parameter-catalogue.md`
- `docs/meta/knowledge-base/open-issues.md`
- `tools/parameters/**`
- `backend/database/seed/05-parameters.sql`
- `backend/domains/ops/parameter/src/generated/parameter-catalogue.ts`
- `backend/app/src/generated/parameter-flags.ts`
- `backend/app/src/detran-runtime.ts`
- `backend/app/src/detran-feature-flags.spec.ts`
- `package.json`

## Evidência do maestro

- `pnpm parameters:test`: 15/15 PASS, sem skip/todo/bypass de CLI ausente.
- `pnpm verify:parameter-catalogue`: PASS, 87 entradas, 18 flags, 0 erros.
- App unit: 53/53 PASS; ops-parameter unit: 49/49 PASS; integração: 1/1 PASS.
- `pnpm check` inclui `parameters:test` e `verify:parameter-catalogue`: PASS.
- `pnpm build` inclui ops-parameter imediatamente antes do app: PASS.
- `pnpm backend:test:ci`: PASS, incluindo unit/integration/E2E.
- O único `H.55` órfão foi substituído por DT-110 existente, sem mudar default/status.
- Nenhum commit, push ou PR foi feito.

## Rubrica

Verifique: gramática das cinco tabelas; normalização limitada; tipos JSON; refs resolvidas sem
allowlist por ID; ranges compactos genéricos; geração atômica/determinística; escaping SQL e seed
idempotente; três paths gerados e hashes; verificador fail-closed de stale/uso; exclusões
tests/dist/node_modules; flags somente F; override canônico e alias legado; scripts agregados;
gerados não editados à mão; nenhum valor inventado; gates não enfraquecidos; aderência ao
ADR-0021/WP-A. Cite arquivo e linha em cada achado.

`PASS`: nenhum high. `REVIEW`: ao menos um high corrigível. `FAIL`: contradição de autoridade,
ADR ou Constituição.

## Saída

```json
{
  "mode": "delivery-review",
  "round": "R-0004",
  "coupled_task_group": "CTG-0002",
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
