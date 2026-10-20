# Registro de decisões de rodadas

**Autoridade:** Owner para a declaração; Architect para o fechamento após os gates. Este registro vincula os IDs `D-*` usados nos PCs e nos arquivos de rodada. Correções posteriores são append-only: a decisão original e seu recibo permanecem rastreáveis. Os anexos de R-0003…R-0016, R-0018 e R-0019 aplicam OD-R20-001=A, autorizada em `work/rounds/R-0020/AUTHORIZATION-CTG3-2026-09-28.md`; preservam os PC históricos. Cada anexo vincula a autorização e o fechamento da própria rodada. Nenhum anexo equivale a `round seal` concluído.

### D-1

**Declaração da rodada — Owner.** A autorização específica do Owner para cada rodada fica no seu `AUTHORIZATION.md` e no respectivo anexo. D-1 não amplia o escopo de nenhum prompt ou decisão local.

### D-2

**Fechamento da rodada — Architect.** Cada anexo aponta para o `closure.json` e o PC da própria rodada, que registram `merged_as`, gates e critérios. Para R-0017, o fluxo de merge, CI verde e PASS da outra família vem de `work/rounds/R-0017/prompts/00-maestro.md` §9; a correção preserva o PC anterior e declara `supersedes`.

## Anexo de R-0017

| Decisão | Ato e âncora                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1     | Owner autorizou em 2026-09-26 a ação 4 de C-0002 (`local-stack`) e `work/rounds/R-0017/prompts/00-maestro.md`; âncora `work/rounds/R-0017/AUTHORIZATION.md`. Integrações externas reais estão fora do escopo.                                                                                                                                                          |
| D-2     | Architect fechou após CTGs 0001/0002/0003 (PRs #133/#143/#144), revisão final PASS e cinco checks obrigatórios verdes. PC-0017 conserva quatro falhas históricas das adendas A4–A6. A correção append-only foi autorizada pelo Owner em `work/rounds/R-0017/SEAL-AUTHORIZATION.md`; o PC corretivo declara `supersedes: PC-0017` e não promove esses critérios a PASS. |

## Anexos das rodadas históricas para OD-R20-001=A

A referência a gates `pass` abaixo descreve o fechamento histórico, não um resultado de `round seal` da R-0020. O PC corretivo de R-0018 foi emitido como PC-0020 por `devai round close` após ensaio em clone; o selo continua pendente.

### Anexo de R-0003

- **D-1 — Owner:** `work/rounds/R-0003/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0003/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0003/closure.json` e `record/proofs/compliance/closures/PC-0001.json` registram o fechamento e o merge `cf8f475eaf1951fa2ebb3c42d24f725c6581ea0e`. Evidência própria no PC: gates `cross-family-delivery-review`, `github-ci`, `shared-tests`, `role-catalog`, `rls-ddl`, `repository-check` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0004

- **D-1 — Owner:** `work/rounds/R-0004/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0004/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0004/closure.json` e `record/proofs/compliance/closures/PC-0002.json` registram o fechamento e o merge `a7e5e93398dee6d3dd6a979d04dc5bd9e3b9d913`. Evidência própria no PC: gates `cross-family-delivery-review`, `github-ci`, `parameter-catalogue`, `backend-tests`, `repository-check` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0005

- **D-1 — Owner:** `work/rounds/R-0005/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0005/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0005/closure.json` e `record/proofs/compliance/closures/PC-0003.json` registram o fechamento e o merge `f432a0cd1ef3bc1005da24208b9e3fb58ac098d6`. Evidência própria no PC: gates `cross-family-delivery-review`, `github-ci`, `backend-and-database`, `documentation`, `repository-check` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0006

- **D-1 — Owner:** `work/rounds/R-0006/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0006/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0006/closure.json` e `record/proofs/compliance/closures/PC-0004.json` registram o fechamento e o merge `515a5e3da63e040ae9287719d9a735213a31e249`. Evidência própria no PC: gates `cross-family-delivery-review`, `github-ci`, `repository-check`, `backend-tests`, `database` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0007

- **D-1 — Owner:** `work/rounds/R-0007/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0007/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0007/closure.json` e `record/proofs/compliance/closures/PC-0011.json` registram o fechamento e o merge `b662f8af90fdd9d27be08ae49feec70ccd13aded`. Evidência própria no PC: gates `review-governance`, `github-ci`, `repository-and-contracts`, `database-and-backend`, `evidence-chain` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0008

- **D-1 — Owner:** `work/rounds/R-0008/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0008/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0008/closure.json` e `record/proofs/compliance/closures/PC-0005.json` registram o fechamento e o merge `3f8a817f4e716749420f716a9e5a83cc6b956d8e`. Evidência própria no PC: gates `cross-family-delivery-review`, `github-ci`, `repository-check`, `backend-tests`, `database` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0009

- **D-1 — Owner:** `work/rounds/R-0009/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0009/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0009/closure.json` e `record/proofs/compliance/closures/PC-0006.json` registram o fechamento e o merge `0940a201547ac92ac50d4d4a500544ceda1af559`. Evidência própria no PC: gates `cross-family-delivery-review`, `github-ci`, `repository-check`, `backend-tests`, `database` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0010

- **D-1 — Owner:** `work/rounds/R-0010/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0010/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0010/closure.json` e `record/proofs/compliance/closures/PC-0008.json` registram o fechamento e o merge `1c24657b784c519cd243a7e6925a33b460c760de`. Evidência própria no PC: gates `delivery-review`, `github-ci`, `repository-check`, `backend-and-database`, `documents-real` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0011

- **D-1 — Owner:** `work/rounds/R-0011/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0011/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0011/closure.json` e `record/proofs/compliance/closures/PC-0009.json` registram o fechamento e o merge `3bb94351a456f26c30aaa574998103cdd27e262c`. Evidência própria no PC: gates `delivery-review`, `github-ci`, `repository-check`, `backend-and-database` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0012

- **D-1 — Owner:** `work/rounds/R-0012/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0012/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0012/closure.json` e `record/proofs/compliance/closures/PC-0010.json` registram o fechamento e o merge `828331d49ef5fb5d6ec368aba8c3f2360863e610`. Evidência própria no PC: gates `cross-family-delivery-review`, `github-ci`, `pnpm-check`, `app-suite`, `knowledge-base`, `parameter-catalogue`, `evidence-chain` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0013

- **D-1 — Owner:** `work/rounds/R-0013/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0013/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0013/closure.json` e `record/proofs/compliance/closures/PC-0013.json` registram o fechamento e o merge `646c6c2897f1dff275ebe513dfa15f62d5a2befb`. Evidência própria no PC: gates `delivery-review`, `github-ci`, `pnpm-check`, `app-suite`, `evidence-chain` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0014

- **D-1 — Owner:** `work/rounds/R-0014/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0014/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0014/closure.json` e `record/proofs/compliance/closures/PC-0007.json` registram o fechamento e o merge `48d103fc36fa3b15a32e5dd5da11b6d729b3c596`. Evidência própria no PC: gates `cross-family-delivery-review`, `github-ci`, `repository-check`, `backend-tests`, `accessibility` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0015

- **D-1 — Owner:** `work/rounds/R-0015/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0015/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0015/closure.json` e `record/proofs/compliance/closures/PC-0014.json` registram o fechamento e o merge `50626da5967c703a035aff6ce469a3e59511648c`. Evidência própria no PC: gates `cross-family-delivery-review`, `github-ci`, `pnpm-check`, `app-suites`, `evidence-chain` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0016

- **D-1 — Owner:** `work/rounds/R-0016/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0016/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0016/closure.json` e `record/proofs/compliance/closures/PC-0012.json` registram o fechamento e o merge `973e78c3cf0902479754e311412fea1082a5c9d0`. Evidência própria no PC: gates `cross-family-delivery-review`, `github-ci`, `pnpm-check`, `app-suite`, `knowledge-base`, `parameter-catalogue`, `evidence-chain` com status `pass` e respectivos `validation_criteria`.

### Anexo de R-0018

- **D-1 — Owner:** `work/rounds/R-0018/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0018/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0018/closure.json` e `record/proofs/compliance/closures/PC-0015.json` registram o fechamento e o merge `4bd1d553478e1eb831353d30dd6769183c2b3990`. Evidência própria no PC: gates `cross-family-delivery-review`, `github-ci`, `pnpm-check`, `docs`, `evidence-chain` com status `pass` e respectivos `validation_criteria`.

PC-0015 mantém o critério literal `git check-ignore -v dist → ignored` como `fail`. A autorização corretiva específica está em `work/rounds/R-0020/AUTHORIZATION-CTG3-2026-09-28.md`, vinculada a `work/rounds/R-0020/contracts/CTG-0003-R18-proposal.md`. PC-0020 foi emitido por `devai round close` após ensaio em clone, declara `supersedes: PC-0015`, classifica o literal como `n/a` apenas na nova observação e registra C-02-21 como `pass` após medição exit 0 no candidato. O selo desta rodada não é afirmado.

### Anexo de R-0019

- **D-1 — Owner:** `work/rounds/R-0019/AUTHORIZATION.md` registra autorização do Owner para a execução ou o fechamento; o escopo permanece no `work/rounds/R-0019/prompts/00-maestro.md`.
- **D-2 — Architect:** `work/rounds/R-0019/closure.json` e `record/proofs/compliance/closures/PC-0016.json` registram o fechamento e o merge `673934fc0bb634403b2ae7cfc8abf250183c4777`. Evidência própria no PC: gates `cross-family-delivery-review`, `owner-acceptance`, `github-ci`, `pnpm-check`, `devai-members`, `evidence-chain`, `documentation` com status `pass` e respectivos `validation_criteria`.

## Nota append-only de 2026-09-28 — selos da R-0020 CTG-0003

Após os anexos acima, o maestro executou os 16 selos abaixo na R-0020. Esta nota atualiza o estado operacional sem reescrever as declarações históricas D-1/D-2 ou os PCs. Os selos são evidenciados por `close-state.jsonl` e pelo relatório `work/rounds/R-0020/reports/A3.6-round-seal-verification.json`; nenhum é afirmado como PASS do comando literal `devai round status`, que permanece `sensor-error` (DEVAI #175). R-0017 já estava selada por PC-0018 e não foi reemitida.

- `R-0003`: `work/rounds/R-0003/close-state.jsonl`.
- `R-0004`: `work/rounds/R-0004/close-state.jsonl`.
- `R-0005`: `work/rounds/R-0005/close-state.jsonl`.
- `R-0006`: `work/rounds/R-0006/close-state.jsonl`.
- `R-0007`: `work/rounds/R-0007/close-state.jsonl`.
- `R-0008`: `work/rounds/R-0008/close-state.jsonl`.
- `R-0009`: `work/rounds/R-0009/close-state.jsonl`.
- `R-0010`: `work/rounds/R-0010/close-state.jsonl`.
- `R-0011`: `work/rounds/R-0011/close-state.jsonl`.
- `R-0012`: `work/rounds/R-0012/close-state.jsonl`.
- `R-0013`: `work/rounds/R-0013/close-state.jsonl`.
- `R-0014`: `work/rounds/R-0014/close-state.jsonl`.
- `R-0015`: `work/rounds/R-0015/close-state.jsonl`.
- `R-0016`: `work/rounds/R-0016/close-state.jsonl`.
- `R-0018`: `work/rounds/R-0018/close-state.jsonl`.
- `R-0019`: `work/rounds/R-0019/close-state.jsonl`.

### Anexo de R-0033

- **D-1 — Owner:** `work/rounds/R-0033/AUTHORIZATION.md` registra abertura e B1/B2/B3;
  B4 autoriza expressamente merge e evidência/auditoria/fechamento pós-merge.
- **D-2 — Architect:** juízo de fechamento do escopo RAIT/JW-01 e Portal, ancorado
  em review Claude PASS, gates locais, cinco checks verdes e merge
  `b4d4d932bb49c58a5df20090a4d49d433a3c0599`. Runtime emitiu
  `record/proofs/compliance/closures/PC-0021.json` e o selo com status closed
  (`work/rounds/R-0033/record.md`, `close-state.jsonl`). Recibo/errata:
  `work/rounds/R-0033/reports/W3-post-merge.md`; insumos congelados preservados.

A observação exata `EV-18e9b5c6a93d228a` concluiu o verbo, com Overall YELLOW,
0/45 passing, 43 unknown e `readiness_promoting=false`; não se declara auditoria
qualitativamente verde. O fechamento não apaga limitações nem inicia outra rodada.

### Anexo de R-0036

- **D-1 — Owner:** abertura, extensões da avaliação e integração/atestação autorizadas,
  conforme `work/rounds/R-0036/AUTHORIZATION.md`; o escopo não inclui correções de produto.
- **D-2 — Architect:** fechamento da avaliação após PR #202 integrado em
  `6f07295b60a51022b9de1d3e3bdebd9bcd48c2b1`, CI principal 39273060556 aprovada e
  atestação independente 39285749403 aprovada com vínculo exact-commit. O resultado
  congelado continua FAIL; os 43 itens foram medidos e BL-0013 a BL-0023 permanecem
  abertos. Relatório e recibos: `work/rounds/R-0036/reports/closure-20261019/`.
  O PC e o selo são emitidos pelos verbos oficiais, sem reescrever as evidências
  históricas ou declarar prontidão do produto.

Recibos oficiais da R-0036: `round close` emitiu **PC-0022**, `round plan --declare`
materializou o registro fechado e `round seal` emitiu `close-state.jsonl`. Estado
confirmado por `round status`; recibos preservados em
`work/rounds/R-0036/reports/closure-20261019/`.

### Anexo de R-0037

- **D-1 — Owner:** C1 autorizado e PR #206 integrado com checks verdes, conforme `work/rounds/R-0037/AUTHORIZATION.md`.
- **D-2 — Architect:** fechamento autorizado após CI main 39323527480 success no merge 92be0db44f9cc111ec9369f2fb81c5f6bd1efa1c. Aceitação restrita a C1; scan global FAIL e BL-0013 aberto. Verificação em `work/rounds/R-0037/reports/post-integration/`. R-0036, thresholds e históricos preservados.

### Anexo de R-0038

- **D-1 — Owner:** autorização existente da campanha C2–C8, com esta rodada limitada a C2, registrada em `work/rounds/R-0038/AUTHORIZATION.md`. Não representa nova resposta humana.
- **D-2 — Architect:** juízo delegado de encerramento limitado a C2 após PR #208 integrado em `11eea2d7309a958d14d536ea7ced46124dfeed2e`, CI 39339090324 success e verificador exact-candidate success. Auditoria completa e reading nativo C2 registram zero vulnerabilidades; campos de dependências dos oito manifests e lock permanecem iguais na árvore de fechamento. Recomenda-se aceitar o encerramento e resolver BL-0013 pelo fluxo oficial após revisão independente PASS, sem declarar prontidão da main posterior. Evidências: `work/rounds/R-0038/reports/post-integration/`. PC e selo serão emitidos exclusivamente pelo runtime; R-0036/R-0037, thresholds e históricos permanecem intactos.
