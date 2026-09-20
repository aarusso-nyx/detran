# Revisão restrita das correções de `prompt-review-9`

Papel: **Auditor** (soft gate, Constituição DEVAI Art. 18). Modo
`prompt-review`, rodada R-0010. Trabalhe somente em leitura. Responda
exclusivamente um objeto JSON válido e compacto, sem Markdown; primeiro byte
`{`, último byte `}`.

Leia `work/rounds/R-0010/reviews/prompt-review-9.json` e confira **somente**
as correções dos oito achados high e quatro low ali enumerados, nos prompts e
JSONs de TASK-0012…0020, no plano/CTG-0002 e em `compositions.json`. Pelo
template `docs/meta/agents/orchestra/reviewer-prompt.template.md`, não levante
achado novo sobre texto não alterado salvo `FAIL` por contradição canônica,
decisão do Owner, ADR, Constituição ou fronteira, com justificativa explícita
do porquê não foi apontado antes.

Há ainda uma retentativa **nova e limitada** de TASK-0006 sob a adenda A-2 do
CTG-0002: leia `prompts/TASK-0006.md`, `tasks/TASK-0006.json`,
`contracts/CTG-0002.md` §Adenda A-2 e o teste
`backend/app/tests/e2e/teat-field-sync.e2e.spec.ts` C-0002-44. A retentativa
foi revisada separadamente em `prompt-review-11-task6-a2.json` (`PASS`), e o
Inspector corrigiu o sensor com 26/26 E2E dirigidos verdes em banco isolado.
Considere o resultado apenas como contexto; a revisão aqui continua restrita
aos achados de TASK-0012…0020.

Fontes para as correções: ADR-0001, ADR-0018, ADR-0020; R-0009 PR #54
(`BP-PORTAL-PROJECTIONS-001`/DDL 65 pertencem à frente Portal e estão em
`origin/main` no SHA `1175f4f`; R-0010 só implementa projetor BOAT após merge
e lock livre); STYNX
`packages/pdf-a-vera-docker/README.md` e `packages/jobs/src/{jobs.scheduler,
jobs.registry,cron,types,backoff}.ts` somente leitura; `tools/blueprints/generate.mjs`
para arquivos gerados; `backend/app/vitest.config.ts` e scripts do app/raiz.
O PR #54 foi mesclado antes desta revisão. Não considere
validação PDF/A por stub, nem `runOnce` manual como job operacional.

Formato:

```json
{
  "mode": "prompt-review",
  "round": "R-0010",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 3,
      "file": "work/rounds/R-0010/prompts/TASK-0012.md",
      "line": 27,
      "claim": "fato verificável",
      "fix": "correção localizada"
    }
  ],
  "notes": []
}
```

`PASS` sem high remanescente; `REVIEW` para high local corrigível; `FAIL`
para contradição canônica, ADR, decisão do Owner, Constituição ou fronteira.
