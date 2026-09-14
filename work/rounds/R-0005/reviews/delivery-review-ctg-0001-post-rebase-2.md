# Reviewer — validação focal pós-rebase ciclo 2 (`ops-agency`, R-0005, CTG-0001)

Papel constitucional: **Auditor**. Trabalhe somente em leitura na worktree
`/Volumes/Thiamat II/stech/detran-worktrees/ops-agency`. Responda somente com JSON RFC 8259
estrito, sem fences, crases ou comentários; primeiro byte `{`, último `}`.

## Objetivo fechado

Confirme o fechamento do único high de
`reviews/delivery-review-ctg-0001-post-rebase.json`: a sequência 1 permanece imutável e uma nova
sequência 2 foi anexada com os gates exatos do candidato rebased, incluindo o sensor-error da
primeira observação e a reexecução integral após `pnpm install --frozen-lockfile`.

Leia somente:

1. `reviews/delivery-review-ctg-0001-post-rebase.json` e seu bridge.
2. `work/rounds/R-0005/evidence-CTG-0001.json` e
   `work/rounds/R-0005/evidence-CTG-0001-post-rebase.json`.
3. `record/proofs/work/generic/R-0005.jsonl` e `record/proofs/chain.json`.
4. `docs/meta/adr/README.md`, `work/rounds/R-0005/plan.md` e
   `work/rounds/R-0005/budget.json`.
5. `git status --short` e `git diff` somente nos arquivos acima.

Use somente comandos read-only (`git diff`, `git status`, `rg`, `sed`, `jq`, `shasum`). Não rode
gates mutantes nem escreva arquivos.

## Evidência esperada

- O arquivo corretivo tem sha256
  `1c7bf54e901df79eaf93643bafc4d923f7bb4e9a02d65426ed9615f7d83dddec`.
- A cadeia verifica localmente e tem head
  `3fcaad0b59574810fd2e3a98954c72146ca99814dedb62de39ea7fbcfc94fcdb`.
- A sequência 2 declara base `34062b552a205b31b095a2594b7815959efc24ef`, candidato
  `0b8e9c4aa53c37ef67f01955bfb85969e5a36619`, os commits rebased e estes resultados:
  reset e smoke PASS; primeira tentativa backend como SENSOR_ERROR por links ausentes;
  `pnpm install --frozen-lockfile` PASS; reexecução backend PASS com parameter unit 57/57,
  parameter integration 1/1, app unit 54/54, app integration 11/11, app e2e 12/12 e demais suites;
  `pnpm check` PASS com parameters:test 17/17 e catálogo 87/18.
- A sequência 1 não foi editada; a sequência 2 declara explicitamente que corrige apenas a
  descrição dos resultados de gates.
- O low ADR-0021 foi reconciliado para Accepted; o reference-gap de Shift e o sensor-error estão
  registrados no plano; o orçamento do primeiro ciclo está fechado. Arquivos desta revisão ainda
  estarão não rastreados durante o gate e isso não é high.

`PASS` exige zero high. Preserve lows sem rebaixar severidade.

{
"mode": "delivery-review-post-rebase",
"round": "R-0005",
"verdict": "PASS | REVIEW | FAIL",
"findings": [
{
"severity": "high | low",
"item": 5,
"file": "path",
"line": 1,
"claim": "plain text",
"fix": "plain text"
}
],
"notes": ["plain text"]
}
