# R-0020 — frente `devai-sensors` (ação 5 da C-0002: sensores DEVAI com o máximo de PASS)

**Status:** **ativa — autorizada pelo Owner em 2026-09-27.** Planejada em 2026-09-26
pelo Architect a partir de `work/campaigns/C-0002-consolidacao.md` (§2 fase B, §3.2, §4, §5) e da
inspeção somente leitura de 2026-09-25 (relatório (e), `work/campaigns/C-0002-inspecao-2026-09-25/e-devai.md`, versionado com
a campanha; os fatos usados estão transcritos abaixo). Maestro **Sol 6** (Codex); reviewer **Opus 5.5**
(Claude Code) pela ponte `tools/orchestra/bridge.sh claude`. Worktree deste host:
`/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`.

## Concorrência

Fase B. **Abre após o merge de R-0018** (`index-state`: destino de `law/adr` por OD-R18-001, gate
`verify:state-index`, `.gitignore` de `reports/`, índices) **e de R-0019**
(`law-corpus`: `law/invariants`, `law/trace.json`, `law/schemas`, `adopter-policy`). Esta rodada precede as
rodadas de código (C-0002 §3.2); R-0021 pode correr em paralelo (abre após R-0017): os locks desta
rodada (CI, `.devai/config`, `law/register`, `record/`, método da orquestra) são partilhados por
merge, e cada rodada que abrir depois do CTG-0005 já nasce com os gates novos.
**Bootstrap de 2026-09-27:** `origin/main` em `c848723c`; R-0018 fechada como PC-0015 (PR #131)
e R-0019 como PC-0016 (PR #140), com os CTGs e observações posteriores em `main` (PRs #132,
#137–#142). R-0017 permanece aberta: somente CTG-0001 foi mesclado (PR #133); CTG-0002/0003
aguardam OD-R17-001/002/003. Nenhum PR de outra frente estava aberto na consulta do bootstrap.
CTG-0001→0002→0003→0004→0005→0006 são seriais, com base no merge do CTG anterior, sem base
empilhada neste momento. CTG-0001/0002 podem ser desenvolvidos e mesclados após seus gates.
CTG-0003 sela R-0003…R-0016, R-0018 e R-0019; o selo de R-0017 fica para o último CTG se a
rodada fechar a tempo, ou registrado para a primeira rodada seguinte. `package.json`, o registro
canônico de ODs, `docs/dev` e possivelmente `.github/workflows/ci.yml` (`stack-smoke`) são locks
partilhados com R-0017; integrar `main` por merge e não editar em simultâneo com PR aberto dessa
rodada. R-0021 partilha CI, `.devai/config`, `record/` e o método quando abrir.
**Atualização 2026-09-27 20:53 UTC (histórica):** R-0017 abriu o PR #143 (`orchestra/local-stack`, CTG-0002), então aberto, com `package.json`, registro de ODs e `record/proofs/` no diff. A TASK-0003 aguardou esse lock.
**Retomada 2026-09-28 02:41 UTC:** `origin/main` está em `8e7c5832` (PR #148). R-0017 fechou com PC-0018 corretivo append-only e foi selada no PR #147; a observação pós-merge entrou no PR #148. PC-0017 e seus quatro `fail` históricos permanecem preservados. PRs #143–#145 também foram mesclados. A branch R-0020 nunca foi publicada; o trabalho local foi preservado em stash, a branch foi rebaseada sobre `origin/main` e o stash reaplicado. A colisão no registro de ODs foi resolvida mantendo as decisões finais da R-0017 e a seção proposta da R-0020. Não há PR aberto da R-0017; o lock da TASK-0003 está livre. O PR #146 do Owner permanece aberto e toca `work/campaigns/C-0002-consolidacao.md`, mas não os caminhos da TASK-0003. CTG-0001→0006 seguem seriais; CTG-0003 sela R-0003…R-0016, R-0018 e R-0019. R-0017 já está selada e não será reemitida. R-0017 também trouxe `law/register/DECISIONS.md` e `tools/devai/render-rounds-index.mjs`; TASK-0007 deve inspecionar e estender esses artefatos sem sobrescrevê-los. OD-R20-001/002 continuam pendentes para o restante do escopo.

**Atualização 2026-09-28 03:47 UTC:** PR #149 da R-0021 foi mesclado como `3d96eeb8`, com checks verdes; o lock partilhado do registro de ODs foi liberado. Antes da publicação do primeiro CTG, integrar esse `main` na branch ainda não publicada e preservar as duas seções do registro. O PR #146 do Owner continua como lock futuro da campanha.

**Janelas previstas:** 2 (C-0002 §3), recalibradas no bootstrap; o escopo tem 6 CTGs.

## Decisões do Owner (2026-09-26)

- **OD-R20-003 = (A), controle de autoria por caminho.** Os commits segregados levam as identidades
  `DEVAI Architect|Owner|Machine` conforme o caminho tocado, e a autoridade é aplicada por caminho
  (hooks e `authority-policy`), não por recibo avulso. Os 11 achados históricos recebem recibo do
  Owner uma única vez, no CTG-0005.
- **OD-R20-005 = aceitar a Constituição 1.0.1.** A rodada executa `devai init bind --constitution`
  com pin 1.0.1 num commit segregado de autoria Owner. Atualiza `.devai/pin/constitution.md`,
  `CLAUDE.md` (via proposta de R-0018) e o destino de `law/policy/mutation-strength.json` conforme o
  Art. 18. Esta decisão substitui a restrição "sem `init bind --constitution --write` nesta rodada".

## Linha de base medida (2026-09-26, `a92ef731`, clone descartável, `devai` 1.5.6)

A medição oficial é a do CTG-0001 no HEAD de abertura; esta é a referência de planejamento.
Os números da tabela abaixo são medição **histórica** em `a92ef731`, anterior aos merges de
R-0018/R-0019; o CTG-0001 mede novamente o HEAD de abertura. A ADR-0022 hoje está **Accepted**
por OD-R18-002, sem reabrir essa decisão.

| Eixo                              | Medida                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Membros `devai check --only` (25) | **pass real:** `docs-governance` (com `--skip-publish-check`), `overrides`, `prompt-overlays`, `schemas` (5 bindings). **pass vazio:** `invariants`, `glossary`, `journeys`, `trace`, `sensor-integrity` (0 leituras). **FAIL:** `glob-guards` (0/35), `invariant-strategies` (população 0), `test-trace` (sem trace), `adrs` (resolução semântica não executada), `forbidden-actions` (11: 10 `FORBID-MUTATE-INVARIANTS`, 1 `FORBID-CI-WITHOUT-ADR` em `666dd63e`; 0 recibos), `docs-links` (1: `docs/site/vendor/image-size/Readme.md`), `action-coverage`, `action-effects` e `cli-reference` (membros de autoaplicação do DEVAI: exigem `law/policy/subprocess-effects.json`, `documentation-information-architecture.json` ou o catálogo de ações do próprio pacote). **REVIEW:** `ci-economy` (warn), `dependencies` (scanner indisponível). **Não executados:** `pr-compliance` (exige corpo de PR), `mutation` (N/A, delegado ao `bedel`), `blueprint`, `schema`, `translation` (exigem entrada) |
| Scorecard (`audit scorecard`)     | 45 células F1–F5 × T1–T9: **0 PASS / 43 UNKNOWN / 2 N/A**; 45 observações versionadas idênticas (35 MB), `previous_observation_digest_sha256: null`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Sensores                          | 0 `SensorReading` persistidos; `sense run spec_depth` → `review` (0 invariantes, 36 ADRs, 0 casos de uso); presets `baseline`/`governed` exigem `--write` (build/unit_test são `local-write`/`harness-write`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Rodadas                           | R-0003…R-0016 "active" no DEVAI; 14 PC (`PC-0001…0014`) válidos, todos com gates e critérios `pass`, todos com `D-1`/`D-2` inexistentes; 0 `record.md`, 0 `close-state.jsonl`, sem `law/register/`, sem `record/derived/indexes/rounds.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Cadeia                            | `record/proofs/chain.json` valid (89 registros); **49/106 linhas jsonl sem âncora**: R-0005 {9}, R-0007 {1–36, 38, 39}, R-0013 {4–10, 12–14}; merge `9ac6dd55` descartou âncoras 38/39 de R-0007; cadeia legada `.devai/state/evidence-chain.json` fora do CI                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Tarefas                           | 260 `work/rounds/*/tasks/TASK-*.json`: **143 inválidas** contra `task.schema.json` 2.0.0 (74 `target_invariants` não-INV, 50 `db_isolation`, 31 `coupled_task_group`, …); `.devai/state/tasks/` inexistente                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| PR e commits                      | 0/95 PRs com `Inv-Compliance:`; 59/95 declaram papel; 52/387 commits não-merge desde 2026-09-14 misturam F2 e F3; todo `actor_role` = `harness`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| CI e autoridade                   | CI chama só `evidence verify --scope chain` e `doctor`; `authority_enforcement: cli-only`, sem hooks, sem `.claude/settings.json`; Art. 6/7 citados trocados                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Método                            | orquestra (ADR-0022 _Proposed_) substitui `round plan/run`, `round gap`, `triage`, `round tracking` e `executor.prompt_composition_id`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

Fatos de runtime (lidos em `node_modules/@aarusso-nyx/devai/dist/runtime/index/release-host.js`):
`round seal` exige `work/rounds/R-nnnn/record.md` (`record-meta` + `declared_by`, `closed_by`,
`phase_closure`, `merged_as`, `gates`, `plan_path`, `orchestrator_prompt`), decisões resolvíveis em
`law/adr/<D>.md`, `law/register/<D>.md` ou `### <D>` em `law/register/DECISIONS.md`, e o PC citado em
`record/derived/indexes/rounds.md` — **o DEVAI 1.5.6 não tem escritor desse índice**.
`forbidden-actions` aceita commit em `law/`/`work/rounds/` com autor `DEVAI Architect`, `product/`
com `DEVAI Owner`, `record/` com `DEVAI Machine`, ou recibo `authorized_by: Owner` por commit em
`law/policy/forbidden-action-authorizations.json`; mudança de CI só passa com ADR v2 aceita em
`law/adr` cujo `affected_rules` cubra o caminho. `init apply architect --include hooks --hook
pre-push|pre-commit|post-merge` instala hooks; `init bind --host-adapter post-merge|github-actions`
liga o Auditor pós-merge; `project.json` aceita `host-integrated` com `adapter_config`.

## Linha de base oficial do CTG-0001 (em revisão)

O medidor da TASK-0003 foi executado em clone descartável limpo fixado no HEAD de abertura
`c848723c1ee9053233b7e08732c5b80bbe06d625`, depois da correção escalada do parser
`result.value`. `baseline.json` e `baseline.md` foram gerados pelo script, não editados à mão.
O clone permaneceu sem mudanças; a medição corrigida aguarda o segundo `pnpm check`
e o segundo `delivery-review` antes de ser aceita como entrega do CTG.

| Eixo                | Resultado observado na abertura                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Checks DEVAI        | 25 membros; 15 `ok: true`, 10 recusas/falhas brutas preservadas                                                         |
| Scorecard           | 45 células: 0 PASS, 43 UNKNOWN, 2 N/A                                                                                   |
| Sensores            | 59 kinds, 49 com efeito `read`; 0 leituras persistidas na abertura; `sense run spec_depth` tem `source_pending` próprio |
| Rodadas             | 17 enumeradas (R-0003…R-0019), 16 com PC; R-0017 estava sem closure no HEAD de abertura                                 |
| Provas              | 119 linhas jsonl inventariadas, 67 ancoradas, 52 órfãs observadas; validade da cadeia em campo separado                 |
| Tarefas             | 294 TASKs: 151 válidas, 143 inválidas, 0 ilegíveis                                                                      |
| PRs e commits F2/F3 | `source_pending` para corpos de PR e classificador canônico F2/F3; nenhum zero fabricado                                |

Os números pertencem ao SHA de abertura, anterior ao selo da R-0017. A
integração posterior em `main` não altera essa referência; a medição final usará
o HEAD integrado e comparará os oito eixos.

## Metas

1. **Linha de base medida e versionada** (CTG-0001): script somente leitura
   `tools/devai/baseline.mjs` que reproduz a tabela acima (25 membros, scorecard, sensores `read`,
   rodadas, âncoras jsonl × `chain.json`, validade de tarefas, trailers de PR, commits mistos) e
   grava `work/rounds/R-0020/baseline.json` + `baseline.md` no HEAD de abertura; rodado de novo no
   fim (`baseline-final.*`). Caracterização antes de toda mudança; regressão é FAIL.
2. **Cadeia reparada sem reescrever histórico** (CTG-0002): uma entrada de correção append-only por
   rodada afetada (`devai evidence record --kind generic`) que declara cada linha órfã (sequência,
   sha256 da linha) e a perda do merge `9ac6dd55`; gate `verify:proof-anchors` (cruza jsonl ×
   notas `proof_sequence`) no `pnpm check` e no CI; `.gitattributes` com `merge=binary` para
   `record/proofs/**` (conflito nunca resolvido por texto); cadeia legada verificada no CI ou
   `AGENTS.md` regra 4 corrigida (M-decisão); issue upstream no DEVAI para o cruzamento no verificador.
   Neste CTG, o gate entra por `pnpm check`; o passo explícito em `ci.yml` e eventual verificação da
   cadeia legada no CI pertencem ao CTG-0005, depois da ADR v2 aceita pelo Owner.
3. **Decisões registradas e rodadas seladas** (CTG-0003): `law/register/DECISIONS.md` conforme
   OD-R20-001; tarefas normalizadas (`tools/devai/normalize-tasks.mjs`, determinístico: refs não-INV
   → `tags` `ref:<id>`, INV do `law/trace.json` quando houver, enums corrigidos) e
   `task.template.json` corrigido; gate `verify:round-tasks` (cada `tasks/*.json` contra
   `law/schemas/task.schema.json` via `devai check --only schema`); `record.md` por rodada;
   `record/derived/indexes/rounds.md` conforme OD-R20-002; `devai round seal` em R-0003…R-0016 e R-0018…R-0019 com
   PC (R-0001/R-0002 pré-governança: registrados como tal, sem seal). Normalização **antes** do seal.
4. **Sensores ligados** (CTG-0004): leituras `SensorReading` persistidas por `devai sense record`
   para os kinds aplicáveis (presets `baseline` e `governed`; `read` do `sweep`), com os comandos do
   repositório; `triage classify` antes de remediar falha de sensor; Auditor pós-merge por
   `init bind --host-adapter` (M-decisão entre `post-merge` e `github-actions`) com observações
   encadeadas; destino dos 35 MB de `.devai/state/audit-observations/` (OD-R20-004).
5. **Gates DEVAI no CI** (CTG-0005): `law/policy/adr-validation.json` (se R-0018 não o tiver
   entregue) e ADR v2 aceita em `law/adr` com `affected_rules`
   `.github/workflows/ci.yml` — antes de tocar o CI; no job `evidence-gate`: `forbidden-actions
--since-ref <base>`, `glob-guards`, `adrs`, `invariants`, `invariant-strategies`, `glossary`,
   `journeys`, `trace`, `test-trace`, `schemas`, `sensor-integrity`, `docs-governance`,
   `ci-economy` (REVIEW registrado), `pr-compliance --pr-body-file` (trailer `Inv-Compliance:`),
   `verify:proof-anchors`, `verify:round-tasks`; recibos do Owner para os 11 achados históricos em
   `law/policy/forbidden-action-authorizations.json` (OD-R20-003); `.github/pull_request_template.md`
   com Art. 7 e `Inv-Compliance:`. Contextos obrigatórios da proteção de `main` são alterados **pelo
   Owner** (configuração de conta), com o pedido no PR.
6. **Autoridade por caminho e hooks** (CTG-0006): `project.json` `host-integrated` com
   `adapter_config` (hooks de Claude Code em `.claude/settings.json` recusando escrita fora da
   autoridade em `record/`, `.devai/`, `law/`, `product/`; equivalente documentado para Codex);
   hook `pre-push` por `init apply architect --include hooks`; convenção de autoria por caminho
   (OD-R20-003); papel por `--as-role` nas evidências; referências Art. 6/7/41 corrigidas
   (`.gitignore`, template de PR); regra "um commit por papel" no método.
7. **Orquestra × primitivas DEVAI** (CTG-0006): ADR proposta (Owner decide) que mapeia
   `AUTHORIZATION.md`, `tasks/`, `compositions.json` (`executor.prompt_composition_id`; o prefixo
   `PC-<16hex>` é do próprio `task.schema.json` e fica), `reviews/`, OD Markdown (`round gap`/RGR),
   issues (`round tracking`) e `budget.json` a primitivas DEVAI, e define o destino da ADR-0022
   (manter a ADR-0022 já aceita ou emendá-la por supersessão, sem reabrir seu aceite); `round seal` e sensores entram no
   `maestro-prompt.template.md` e em `orchestra/README.md`. Constituição 1.0.1 (NC-M6): **aceita pelo
   Owner** (OD-R20-005); `init bind --constitution` com pin 1.0.1 em commit segregado de autoria Owner.
8. **Meta de PASS** (adenda A1, antes do CTG-0004): a partir da linha de base do CTG-0001, o
   Architect fixa, com decisão do Owner, (i) o conjunto de membros `devai check` obrigatórios em CI
   (todos os aplicáveis ao adotante; os de autoaplicação ficam N/A com issue upstream, nunca
   silenciados) e (ii) o piso de células PASS do scorecard por substrato. Metas só sobem; nenhum
   gate existente é removido, afrouxado ou convertido em aviso.

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço           | Lock                                                                | Depende de                   | Entrega                                                                                                                                                                                                                                                                                                    |
| --------- | -------------------- | ------------------- | ------------------------ | ------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-baseline`                                         | —                            | `contracts/CTG-0001.md`: métricas exatas, comandos, formato de `baseline.json`, critérios C-01-nn                                                                                                                                                                                                          |
| TASK-0002 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`                                             | TASK-0001                    | `tools/devai/tests/baseline.test.mjs` (fixtures de jsonl/cadeia, tarefas válidas e inválidas, commits mistos)                                                                                                                                                                                              |
| TASK-0003 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-tools`, `MOD-root-package-json`                          | TASK-0002                    | `tools/devai/baseline.mjs` (somente leitura) + scripts `devai:baseline` e `devai:test`; baseline da abertura materializada **pelo maestro**                                                                                                                                                                |
| TASK-0004 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-chain`                                            | merge CTG-0001               | `contracts/CTG-0002.md`: payload das entradas de correção por rodada, regra do gate de âncoras, `.gitattributes`, decisão sobre a cadeia legada, texto da issue upstream                                                                                                                                   |
| TASK-0005 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`                                             | TASK-0004                    | testes de `verify:proof-anchors` (linha órfã, âncora duplicada, correção declarada)                                                                                                                                                                                                                        |
| TASK-0006 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-tools`, `MOD-root-package-json`, `MOD-gitattributes`     | TASK-0005                    | `tools/devai/verify-proof-anchors.mjs`, script, `pnpm check`; `.gitattributes`; entradas de correção gravadas **pelo maestro** com `evidence record`                                                                                                                                                       |
| TASK-0007 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-seal`, `MOD-law-register`                         | merge CTG-0002               | `contracts/CTG-0003.md` + `law/register/DECISIONS.md` (OD-R20-001); mapa rodada → PC → `merged_as` → gates → plan/prompt; tabela de normalização campo a campo; forma do índice de rodadas (OD-R20-002); roteiro do ensaio de `round seal` em clone descartável **pelo maestro** para as rodadas elegíveis |
| TASK-0008 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`                                             | TASK-0007                    | testes de `normalize-tasks` (idempotência, nenhuma informação perdida) e de `verify:round-tasks`                                                                                                                                                                                                           |
| TASK-0009 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-tools`, `MOD-round-tasks`, `MOD-orchestra-task-template` | TASK-0008                    | `tools/devai/normalize-tasks.mjs` e gate; aplicação a R-0003…R-0019 **pelo maestro**; `task.template.json`; 0 tarefas inválidas                                                                                                                                                                            |
| TASK-0010 | Architect (transcr.) | transcriber-docs    | `gpt-6-luna` / low       | `MOD-round-records`                                                 | TASK-0009                    | `work/rounds/R-nnnn/record.md` para as rodadas com PC; R-0001/R-0002 ficam como exceção pré-método (a mesma declarada por R-0018 em `work/rounds/README.md`), sem seal                                                                                                                                     |
| TASK-0011 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-sensors`                                          | merge CTG-0003               | `contracts/CTG-0004.md`: kind → comando do repo → célula; o que fica N/A e por quê; persistência de leituras; adapter pós-merge; **adenda A1** (meta de PASS) para decisão do Owner                                                                                                                        |
| TASK-0012 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`                                             | TASK-0011                    | testes do wrapper de sensores (leitura válida contra `sensor-reading.schema.json`, falha vira `fail`, nunca `pass`)                                                                                                                                                                                        |
| TASK-0013 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-tools`, `MOD-devai-config`, `MOD-root-package-json`      | TASK-0012                    | `tools/devai/sense.mjs` + script `devai:sense`; binding do adapter pós-merge; primeiras leituras gravadas pelo maestro; scorecard ≥ piso A1                                                                                                                                                                |
| TASK-0014 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-ci`, `MOD-law-adr`                                | merge CTG-0004               | `law/policy/adr-validation.json` se ausente (coerente com OD-R18-001) e ADR v2 de gates de CI em `law/adr` (`check --only adrs` ok); `contracts/CTG-0005.md` (jobs, ordem, `--since-ref`, corpo de PR); proposta de `forbidden-action-authorizations.json` (11 recibos) para o Owner                       |
| TASK-0015 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-ci`, `MOD-pr-template`                                         | TASK-0019 + recibos do Owner | `.github/workflows/ci.yml`; `.github/pull_request_template.md`; recibos aplicados **pelo maestro** em commit segregado de autoria Owner                                                                                                                                                                    |
| TASK-0016 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-authority`, `MOD-law-adr`                         | merge CTG-0005               | ADR proposta orquestra × DEVAI; ADR proposta Constituição 1.0.1; `contracts/CTG-0006.md` (política de hooks por caminho e papel, `adapter_config`, convenção de autoria)                                                                                                                                   |
| TASK-0017 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-config`, `MOD-claude-settings`, `MOD-git-hooks`          | TASK-0020                    | `.devai/config/project.json` via `devai init bind`/`init apply` **pelo maestro**; `.claude/settings.json`; hook `pre-push`; `doctor` verde                                                                                                                                                                 |
| TASK-0018 | Architect (transcr.) | transcriber-docs    | `gpt-6-luna` / low       | `MOD-orchestra-method`, `MOD-docs`                                  | TASK-0017                    | `maestro-prompt.template.md` (seal, sensores, trailer, commit por papel), `orchestra/README.md`, `.gitignore` (Art. 41, se R-0018 não corrigiu), `backlog.md`, `waves.md` §Histórico                                                                                                                       |
| TASK-0019 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`, `MOD-ci-tests`                             | TASK-0014                    | testes estruturais de CI e template de PR: passos obrigatórios presentes, nenhum `continue-on-error`, `Inv-Compliance:` e Art. 7                                                                                                                                                                           |
| TASK-0020 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`, `MOD-authority-hook-tests`                 | TASK-0016                    | testes de autorização por caminho e papel para `record/`, `.devai/`, `law/`, `product/`, inclusive o caso do maestro                                                                                                                                                                                       |

CTG-0001 = 0001 → 0002 → 0003; CTG-0002 = 0004 → 0005 → 0006; CTG-0003 = 0007 → 0008 → 0009 →
0010, depois `round seal` pelo maestro; CTG-0004 = 0011 → 0012 → 0013;
CTG-0005 = 0014 → 0019 → 0015; CTG-0006 = 0016 → 0020 → 0017 → 0018. Os ids 0019/0020
preservam os 18 ids já compostos na primeira revisão; a execução segue a ordem topológica aqui.
**Um PR por CTG**, em série (cada um depende do merge do anterior:
lock de `record/`, `package.json` e CI). Testes do Inspector com `node --test
tools/devai/tests/*.test.mjs` (script `devai:test`, criado na TASK-0003, padrão `parameters:test`).

**Checkpoints (maestro, Engineer):** (a) antes de qualquer `--write` do DEVAI, ensaio no clone
descartável e `git status --porcelain` limpo depois; (b) `evidence record` e `round seal` só pelo
maestro, nunca por worker; (c) após o CTG-0003, `devai round status --round R-nnnn` →
`closed` para cada rodada selada; (d) após TASK-0013, `devai audit scorecard --at <HEAD>` e
comparação com A1; (e) antes de TASK-0015, ADR v2 aceita pelo Owner e recibos históricos
autorizados/aplicados em commit segregado; (f) antes de TASK-0017, ensaio de `init bind
--constitution` 1.0.1 no clone descartável e aplicação pelo maestro em commit segregado de
autoria Owner; após `init bind|apply`, `devai doctor` deve mostrar todos `[✓]`; (g) no fechamento,
`record.md` e `closure.json` da R-0020 pelo maestro antes de `round seal`.

## Critérios de aceitação (comandos → resultado)

- `pnpm devai:baseline` → `baseline-final.json` sem regressão em nenhum eixo contra `baseline.json`
  (regressão = FAIL, não REVIEW).
- `pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human` → valid;
  `pnpm verify:proof-anchors` → 0 linhas sem âncora não declaradas; toda linha nova da rodada ancorada.
- `pnpm verify:round-tasks` → 0 inválidas em R-0003…R-0020.
- `pnpm exec devai round status --round R-nnnn --repo-root . --format json` → `location` fechada
  (`close-state.jsonl` presente) para toda rodada com PC de R-0003 a R-0019, e para R-0020 no fim.
- `pnpm exec devai check --only <m> --repo-root . --format json` → `ok: true` para todo membro
  obrigatório de A1 (no mínimo `forbidden-actions --since-ref <base do PR>`, `glob-guards`, `adrs`,
  `invariants`, `invariant-strategies`, `glossary`, `journeys`, `trace`, `test-trace`, `schemas`,
  `sensor-integrity` com `readings_scanned` > 0, `docs-governance`); `pr-compliance --pr-body-file`
  → ok nos PRs desta rodada.
- `pnpm exec devai audit scorecard --repo-root . --at <HEAD-40> --format json` → células PASS ≥ piso
  A1 e nenhuma célula antes PASS agora diferente de PASS.
- `pnpm exec devai doctor --repo-root . --format human` → todos `[✓]` em `host-integrated`.
- `pnpm devai:test`, `pnpm format:check`, `pnpm check` → verdes; CI do PR com os novos passos verdes.

## Comandos de aceitação por tarefa

- **TASK-0001:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0001.md` presente e limitada aos caminhos do prompt.
- **TASK-0002:** `pnpm format:check` → exit 0; entrega `tools/devai/tests/baseline.test.mjs` presente e limitada aos caminhos do prompt.
- **TASK-0003:** `pnpm devai:test` e `pnpm format:check` → exit 0; `pnpm devai:baseline --out-dir <tmp>` → saída completa sem escrita no repositório. O maestro materializa baseline.json/md e roda `pnpm check`.
- **TASK-0004:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0002.md` presente e limitada aos caminhos do prompt.
- **TASK-0005:** `pnpm format:check` → exit 0; entrega `tools/devai/tests/verify-proof-anchors.test.mjs` presente e limitada aos caminhos do prompt.
- **TASK-0006:** testes de âncoras e `pnpm format:check` → exit 0; gate real RED nas órfãs até as provas de correção pelo maestro; então `pnpm verify:proof-anchors` e `pnpm check` verdes.
- **TASK-0007:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0003.md e law/register/DECISIONS.md quando OD-R20-001/002 decididas` presente e limitada aos caminhos do prompt.
- **TASK-0008:** `pnpm format:check` → exit 0; entrega `tools/devai/tests/normalize-tasks.test.mjs e verify-round-tasks.test.mjs` presente e limitada aos caminhos do prompt.
- **TASK-0009:** testes de normalização e `pnpm format:check` → exit 0; gate real RED até aplicação do normalizador pelo maestro; então `pnpm verify:round-tasks` e `pnpm check` verdes.
- **TASK-0010:** `pnpm format:check` → exit 0; entrega `record.md por rodada com PC` presente e limitada aos caminhos do prompt.
- **TASK-0011:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0004.md e proposta A1` presente e limitada aos caminhos do prompt.
- **TASK-0012:** `pnpm format:check` → exit 0; entrega `tools/devai/tests/sense.test.mjs` presente e limitada aos caminhos do prompt.
- **TASK-0013:** `pnpm check` → exit 0; entrega `tools/devai/sense.mjs e script devai:sense; binding pelo maestro` presente e limitada aos caminhos do prompt.
- **TASK-0014:** `pnpm format:check` → exit 0; entrega `adr-validation.json, ADR v2 e contracts/CTG-0005.md` presente e limitada aos caminhos do prompt.
- **TASK-0015:** `pnpm check` → exit 0; `ci.yml` e `pull_request_template.md` presentes dentro da fronteira Engineer. Recibos são aplicados pelo maestro em commit Owner.
- **TASK-0016:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0006.md e ADRs propostas` presente e limitada aos caminhos do prompt.
- **TASK-0017:** `pnpm check` → exit 0; entrega `settings e hooks; bind/apply executados pelo maestro` presente e limitada aos caminhos do prompt.
- **TASK-0018:** `pnpm format:check` → exit 0; entrega `maestro-prompt.template.md, README.md, waves.md, backlog.md` presente e limitada aos caminhos do prompt.
- **TASK-0019:** `pnpm format:check` → exit 0; testes estruturais de CI e template presentes,
  com RED documentado antes da TASK-0015 e PASS obrigatório após a implementação.
- **TASK-0020:** `pnpm format:check` → exit 0; testes positivos e negativos de autoridade por
  caminho presentes, com RED documentado antes da TASK-0017 e PASS após implementação.

## Mapa entregável → definições

| Entregável        | Definição                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| linha de base     | esta seção; `node_modules/@aarusso-nyx/devai/dist/law/policy/{check-suites,sense-presets,sensor-registry}.json`                                                                                                     |
| cadeia            | `record/proofs/{chain.json,work/generic/*.jsonl}`; `.devai/state/evidence-chain.json`; `.devai/pin/constitution.md` Art. 6, 41                                                                                      |
| seal              | `record/proofs/compliance/closures/PC-0001…PC-0014.json`; `work/rounds/R-00{03…19}/{plan.md,prompts/00-maestro.md,AUTHORIZATION.md,closure.json}`; esquemas `record-meta`, `phase-closure`                          |
| tarefas           | `work/rounds/*/tasks/TASK-*.json`; `docs/meta/agents/orchestra/task.template.json`; `law/schemas/task.schema.json` (R-0019); `law/trace.json`                                                                       |
| sensores          | `sensor-registry.json` (59 kinds, célula por kind); `sensor-reading.schema.json`; `scorecard.schema.json`; `.devai/state/audit-observations/`                                                                       |
| CI                | `.github/workflows/{ci.yml,devai-local-rc-verify.yml}`; `law/adr/` (OD-R18-001); `adr-validation-policy.schema.json`, `adr-v2.schema.json`; `forbidden-actions.json`; `forbidden-action-authorizations.schema.json` |
| autoridade        | `.devai/config/{project,authority-policy}.json`; `project-config.schema.json`; `.claude/agents/*`; `.github/pull_request_template.md`                                                                               |
| orquestra × DEVAI | `docs/meta/adr/ADR-0022-orchestra-execution-model.md`; `docs/meta/agents/orchestra/*`; `tools/orchestra/*`; `task.schema.json`, `rgr.schema.json`, `round-tracking-activation.schema.json`                          |

## Riscos

- **Índice de rodadas sem escritor no DEVAI 1.5.6:** sem OD-R20-002 decidida, o seal não roda →
  checkpoint após CTG-0002; nunca escrever `record/` à mão.
- **`forbidden-actions` no CI sem recibos:** o histórico falha até o Owner assinar os recibos; o CI
  usa `--since-ref` da base do PR, e os 11 achados históricos só passam por recibo, nunca por
  exclusão de janela.
- **Membros de autoaplicação** (`action-coverage`, `action-effects`, `cli-reference`): falham por
  arquivos que só existem no repositório do DEVAI; ficam fora do CI como N/A com issue upstream
  registrada em A1 — não é afrouxamento porque nunca foram gate.
- **Hooks de host** podem bloquear o próprio maestro: ensaiar com papel declarado antes de ativar;
  `--no-verify` é ação proibida (`FORBID-NO-VERIFY`).
- **Concorrência com R-0021:** ambas podem tocar `package.json` e CI; integrar `origin/main` por
  merge antes de cada PR e reexecutar os gates; os gates novos valem para R-0021 a partir do merge
  do CTG-0005.
- **Escopo:** 6 CTGs em 2 janelas é apertado; a ordem dos CTGs é a prioridade — o que não couber
  vira checkpoint, não corte de critério.

## Lições aplicadas (C-0001 e método)

- Relatórios versionados (`.gitignore` corrigido por R-0018; conferir `find` × `git ls-files`).
- Critérios imutáveis: A1 é a única adenda prevista e só **fixa** a meta, com decisão do Owner;
  qualquer outra mudança é adenda numerada; critério substituído aparece como não cumprido.
- ODs no registro canônico no mesmo PR (seção da rodada em `open-decisions-rait.md`).
- Âncora da prova: esta rodada cria o gate que torna a regra mecânica; nenhuma rodada fecha ou é
  selada com linha órfã não declarada.
- Orçamento: `budget.json`; estouro → checkpoint.
- Caracterização antes de troca: `baseline.json` antes de qualquer mudança; `baseline-final.json`
  depois; divergência negativa é FAIL.
- Proibido reproduzir as substituições de R-0013/R-0014 e o waiver SQL2 de R-0007.

## Decisões do Owner a obter (registro canônico, seção R-0020)

- **OD-R20-001** — decisões dos 14 PC: (A) registrar `D-1` (autorização do Owner no
  `AUTHORIZATION.md` da rodada) e `D-2` (fechamento pelo maestro após merge com CI verde e PASS do
  reviewer) em `law/register/DECISIONS.md`, com anexo por rodada — sem novo PC; ou (B) novo
  `round close` por rodada com decisões `DII-nnnn` próprias (novos PC, os antigos ficam). Proposta: A.
- **OD-R20-002** — `record/derived/indexes/rounds.md`: (A) pedido upstream ao DEVAI e espera; ou
  (B) gerador local determinístico a partir de `record/proofs/compliance/closures/*.json`, commit
  segregado com recibo do Owner. Proposta: B com issue upstream.
- **OD-R20-003** — **decidida pelo Owner em 2026-09-26: (A).** Autoria por caminho: (A) identidades `DEVAI Architect|Owner|Machine` nos commits
  segregados; ou (B) autor humano e recibo do Owner por commit. Inclui os 11 recibos históricos.
- **OD-R20-004** — `.devai/state/audit-observations/` (35 MB): manter versionado ou só âncora na
  cadeia com artefato externo.
- **OD-R20-005** — **decidida pelo Owner em 2026-09-26: aceitar.** Constituição 1.0.1 (Art. 18: mutação fora de gate): aceitar (`init bind
--constitution`) ou recusar, e destino de `law/policy/mutation-strength.json`.
- **OD-R20-006** — ADR-0022 **já aceita** por OD-R18-002: manter a ADR aceita ou emendá-la por
  supersessão através da ADR orquestra × DEVAI; o aceite não é reaberto.
- **A1** — meta de PASS (Meta 8).

## Decisões do maestro

- **A2 — correção factual pela decisão Owner OD-R18-002:** ADR-0022 já está Accepted em `main`.
  A OD-R20-006 só decide manutenção ou supersessão; nenhum critério de aceitação foi trocado.
- **M4 — cobertura Inspector:** revisão cruzada 1 identificou ausência de testes precedentes nos
  CTGs 0005/0006. Acrescentadas TASK-0019/0020, mantendo os critérios e a ordem Architect →
  Inspector → Engineer; nenhum worker dessas tarefas foi disparado antes da revisão.
- **M5 — prompt-review:** Claude Code `claude-opus-5-5` pela ponte: ciclo 1 `REVIEW` (10 high,
  10 low), ciclo 2 `PASS` (0 high, 3 low). Corrigidas as três notas low de redação dos prompts
  TASK-0003/0015/0018 e alinhados locks/comandos de TASK-0019/0020; os critérios não mudaram.
  `db_isolation=database` permanece porque o schema 2.0.0 só aceita `database|cluster`.
- **M7 — lock R-0017 em `package.json`:** PR #143 estava aberto enquanto a TASK-0003 ficou pronta; o Inspector TASK-0002 concluiu. O lock foi liberado pelos merges #143–#148. A branch local, ainda não publicada, foi atualizada para `8e7c5832`; a TASK-0003 está liberada.
- **M8 — selo anterior e artefatos comuns:** R-0017 já está selada como PC-0018 em `main`; excluí-la da fila de `round seal` da R-0020 evita uma segunda emissão. O registro D-1/D-2 e o gerador de índice da R-0017 são precedente existente; TASK-0007 deve considerar os demais PC sem reabrir a decisão corretiva da R-0017.
- **M9 — escalada de TASK-0003:** duas tentativas do worker Codex Terra tiveram falhas de
  caracterização; um subagente Codex Sol 6 separado (Engineer) executou a escalada. O campo
  `executor` da TASK-0003 reflete o executor final; `prompt_composition_id` preserva o prompt
  original revisado, e os achados suplementares constam do relatório e da revisão. O runtime
  nativo de subagentes desta sessão não exporta transcrito bruto; os relatórios versionados
  preservam as mensagens observáveis e declaram essa limitação. Os `started_at` reconstruídos
  no `iteration_trail` são horários do primeiro efeito observável em arquivo, não horários
  exatos de despacho. `ended_at` permanece nulo porque o runtime não forneceu o horário exato
  de término; usar o início da tentativa seguinte como término inventaria uma precisão que
  não existe. `task.schema.json` limita `evidence_refs` a IDs `EV-*`, por isso os caminhos
  dos relatórios de tentativa constam aqui e em `reports/`, mas não naquele campo. Nenhuma
  execução de worker usou Git.
- **M10 — comparação de sensores com fonte pendente:** a comparação final de leituras
  persistidas expõe o seu próprio veredito e falha se uma leitura da abertura desaparecer.
  O eixo `sensors` e o resultado geral permanecem `REVIEW` enquanto
  `sense run spec_depth` estiver `source_pending`, pois a ação anuncia efeito
  `remote-write` e não foi executada pelo medidor somente leitura. O teste do Inspector
  verifica tanto a preservação quanto a remoção de uma leitura.
- **M11 — autorização suplementar do Owner em 2026-09-28:** o limite de ciclos de
  prompt-review e delivery-review por item dobra de 2 para 4; o orçamento de entrada
  por janela triplica de 750000 para 2250000, com checkpoint de 80% em 1800000.
  A janela 2 conserva o consumo estimado anterior de 600000. A decisão está em
  `AUTHORIZATION-RETAKE-2026-09-28.md` e não modifica gates nem a ordem serial.
- **M6 — teste de caracterização estável:** a tentativa 1 de TASK-0002 usou contagens vivas de
  tarefas inválidas; isso seria quebrado pelo CTG-0003. Classificação `sensor-error`; a
  clarificação C-01-T1 do contrato permite `--repo-root` temporário para fixtures e preserva
  todos os critérios C-01. O Inspector corrige o teste antes da implementação.

- **M1 — troca de famílias autorizada pelo Owner em 2026-09-27:** maestro e workers Codex;
  reviewer Claude Code pela ponte. Escada vigente e ids: Sol 6 `gpt-6-sol` (maestro, Architect
  e tarefas grandes), Terra `gpt-5.6-terra` (médio), Luna `gpt-6-luna` (pequeno), reviewer
  Opus 5.5 `claude-opus-5-5` (grande). `codex --help` e `claude --help` confirmam os parâmetros
  `--model`; os ids constam da confirmação executada em R-0018/R-0019 e de
  `model-ladder.md`. As CLIs locais são `codex-cli 0.157.1` e Claude Code 2.1.283.
- **M2 — worktree do host:** a correção do Owner substitui o caminho em `/Volumes/Thiamat II`;
  worktree gerenciada e limpa criada de `origin/main` em
  `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`.
- **M3 — scaffold:** ensaio isolado de `devai round plan --scaffold --write` retornou
  `ROUND_ALREADY_EXISTS` sem alterar arquivos rastreados: `plan.md` já existe em `main`.
  Não repetir a escrita na worktree.

## Bloqueios

- TASK-0001 tentativa 1: worker aguardou confirmação explícita de lock livre e não escreveu.
  Falha de despacho (`policy-issue`), não do contrato; relatório preservado em
  `reports/TASK-0001-attempt-1.md`. `gh pr list --state open` retornou `[]` antes do redespacho;
  TASK-0001 concluiu na tentativa 2, com contrato e `pnpm format:check` verdes.

## Triagem

- Bootstrap: `devai check --only adrs` retorna `ACTION_INVOCATION_REFUSED` porque
  `law/policy/adr-validation.json` não existe; TASK-0014 cria a política prevista no plano.
  Classificação: `reference-gap` do binding de adoção, sem alteração de gate.
- Bootstrap: `round plan --scaffold --write` no clone descartável
  `/tmp/r20-scaffold.5I8VY4` retornou `ROUND_ALREADY_EXISTS` (exit 2), sem escrita rastreada;
  scaffold já materializado no repositório. Classificação: `policy-issue` de invocação redundante.
- A leitura inicial sem `--since-ref` de `forbidden-actions` em `c848723c` enumerou 43 achados
  (31 commits únicos: 30 `FORBID-MUTATE-INVARIANTS`, 5 `FORBID-EXTERNAL-MESSAGES`, 4
  `FORBID-DROP-PROD`, 4 `FORBID-RM-RF`), contra os 11 do diagnóstico histórico em `a92ef731`.
  É medição de escopo diferente, não autorização para ampliar os recibos do Owner. CTG-0001
  caracteriza o conjunto; CTG-0005 exige triagem antes de qualquer novo recibo ou mudança de gate.
- TASK-0003 tentativa 1: a leitura do medidor revelou validação parcial de TASK e ausência de
  `round status`; classificação `sensor-error`. Tentativa 2 corrigiu essas rotas, mas o ensaio
  oficial em clone de `c848723c` revelou payload DEVAI aninhado em `result.value`: o medidor
  produziu 0 células e PC/estado nulos apesar de `audit scorecard` e `round status` retornarem
  `ok: true`. Classificação `sensor-error`; escalar à camada grande Codex antes de aceitar o CTG.

## Retomada

- **Checkpoint 2026-09-27 20:53 UTC, janela 1 (histórico):** pausa por lock upstream partilhado do PR #143. A branch R-0020 não tinha push, PR nem commits locais.
- **Retomada 2026-09-28 02:41 UTC, janela 2:** R-0017 completa e selada; `origin/main` em `8e7c5832`; branch R-0020 rebaseada antes do primeiro push, trabalho local reaplicado e conflito do registro de ODs resolvido. PR #146 do Owner toca a campanha e segue em observação como lock partilhado futuro. O bloqueio de TASK-0003 foi removido.
- **Concluídas até o primeiro delivery-review:** bootstrap, leitura, planejamento, 20 tarefas/prompts e composição PC; prompt-review ciclo 1 `REVIEW`, ciclo 2 `PASS` por Claude Opus 5.5; TASK-0001 Architect e TASK-0002 Inspector com teste RED; TASK-0003 Engineer implementada após duas tentativas Terra e escalada Sol 6. Baseline de abertura materializada no clone `c848723c`; `pnpm check` inicial PASS. Delivery-review CTG-0001 ciclo 1: `REVIEW`, cinco high e oito low.
- **Concluídas no segundo delivery-review:** PR #149 mesclado como `3d96eeb8` e integrado nesta branch antes do primeiro push; conflito do registro de ODs resolvido preservando R-0021 e R-0020. `pnpm check` terminou exit 0, `pnpm devai:test` repetido 18/18 PASS, `pnpm format:check` PASS, `devai:doctor` exit 0, cadeia válida em `0095e58c`. Baseline no clone de abertura reproduziu os mesmos bytes. Claude Opus 5.5 deu `PASS` no delivery-review ciclo 2, com três observações low. As observações de relatório e explicação de fonte foram corrigidas antes do commit; nenhuma correção high permanece. **Pendentes:** commits, ensaio e registro da evidência, PR/CI/merge do CTG-0001; TASK-0004…0020 seguem em série.
- **Evidência CTG-0001 2026-09-28 04:05 UTC:** commits separados `c3795b2d` (Architect), `9ead681e` (Inspector), `ffb25574` (Engineer), `a1f5ff14` (entrada de evidência Architect) e `3caa03b8` (prova DEVAI Machine). O `evidence record --write` foi ensaiado no clone descartável `/tmp/r20-ctg1-evidence.g9bx4k/repo`: apenas `record/proofs/chain.json` e `record/proofs/work/generic/R-0020.jsonl` mudaram, sequência 1 e cadeia válida. A execução na branch gerou a sequência 1; `evidence verify --scope chain` validou o head `99a7f6cc0b6545c95262a69985400bada2bf3a13efd0a96d66bc6b7f436b65ba`. Nenhum PR publicado ainda.
- **Checkpoint 2026-09-28 05:18 UTC, janela 2 (600000/750000):** PR #150 do CTG-0001 foi mesclado como `2a0f7ce2bb713499c53b673a5a2516041518db92`, após PASS do Claude Opus 5.5 e todos os checks obrigatórios verdes. O PR #146 do Owner entrou em `main` antes do merge final: integrou-se por merge `b881e75d`, sem tocar artefatos CTG-0001, e `pnpm check` local repetido terminou exit 0; o segundo CI do PR #150 também foi todo verde. `audit observe --at 2a0f7ce2… --round R-0020 --write` foi ensaiado em clone descartável e executado no SHA exato, gerando cinco artefatos e a cadeia válida no head `64d5e95b9831934596a0a8209d3e553d185fd2e9ee54dc47b4a12a60d7444951`; commit local `d4c3a3bb` (DEVAI Machine). **Ainda pendentes:** delivery-review da observação, seu PR e CI/merge; CTG-0002…0006 em série, evidências, meta A1 e ODs do Owner. A observação não está em `main`; o branch local está à frente do merge do PR #150.
- **Retomada 2026-09-28 05:27 UTC:** Owner autorizou quatro reviews por item e orçamento 2250000/1800000 na janela 2. `origin/main` segue em `2a0f7ce2`, branch local limpa à frente por `d4c3a3bb` e `e5500a9a`. PR #151 da R-0021 está aberto e toca `record/proofs/chain.json`; lock partilhado com a observação, integrar `main` por merge se ele mesclar primeiro, nunca resolver cadeia à mão. Primeiro concluir review e PR da observação, depois CTG-0002.
- **Delivery-review da observação, ciclo 1:** Claude Code `claude-opus-5-5` deu `PASS` para o commit `d4c3a3bb` e a autorização suplementar, com dois achados low. A frase operacional de orçamento foi alinhada a M11; os arquivos temporários do bridge desapareceram após a conclusão da chamada. O reviewer confirmou o SHA exato, os cinco hashes dos artefatos, a linha append-only seq. 115, cadeia válida e ausência de promoção de readiness. PR #151 da R-0021 segue como lock partilhado de `record/proofs/chain.json`.
- **Atualização do PR #152 após o merge concorrente #151:** R-0021 entrou em `main` como `69642874`; a branch integrou por merge `648e9795`, aceitando `record/proofs/chain.json` de `main` e verificando o head `68726d21`. A seq. 115 e o head `64d5e95b` acima são históricos da primeira execução; na cadeia corrente, seq. 115 pertence à R-0021. `audit observe --at 2a0f7ce2…` recusou repetição em HEAD novo com `AUDIT_OBSERVE_EXACT_HEAD_REQUIRED`. Os cinco artefatos mantiveram seus hashes; `evidence-CTG-0001-observation-reanchor.json` registra o evento original, a causa e os hashes. O `evidence record --kind generic --round R-0020 --write` foi ensaiado em `/tmp/r20-observation-reanchor.gBgBbD/repo` e executado na branch, criando `EV-23cb7d85e6e53c5f` (R-0020 seq. 2; cadeia seq. 117) e head válido `6f81515670216688e458681e32ed0d8b46bf94be90e7ab553f3fb53532ed6cf3`. A revisão Claude da reancoragem e `pnpm check` pós-integração estão em curso; depois é obrigatório novo CI antes do merge do #152.
- **Delivery-review da reancoragem:** Claude Code `claude-opus-5-5` deu `PASS` no primeiro ciclo válido, com três notas low: comitar esta atualização do plano, explicitar melhor o papel no payload de futuras declarações e incluir `readiness_promoting: false` em futuras reancoragens. A primeira chamada de revisão retornou PASS em JSON cercado por Markdown, que a ponte recusou; a segunda chamada produziu JSON válido e está preservada com o hash do prompt. Nenhuma nota altera a prova append-only já emitida.
- **Orçamento:** janela 1 fechou com 546521/750000 tokens de entrada estimada (72,9%) e 69772 de saída. A janela 2 retomou com 600000 tokens de entrada estimada; por M11 e `AUTHORIZATION-RETAKE-2026-09-28.md`, seu orçamento é 2250000 e o checkpoint é 1800000, contabilizados em `budget.json`.
- **Próximo passo:** obter PASS da revisão de reancoragem, concluir `pnpm check`, atualizar o PR #152 e mesclá-lo só com novo CI verde. O CTG-0002 tem contrato e testes concluídos, implementação do gate em andamento; a prova real aguarda o merge #152 e a decisão do Owner sobre a linha órfã R-0021 seq. 2. Antes de qualquer nova escrita governada, integrar `main` por merge no branch publicado e ensaiar no clone descartável.

## Leitura

- HEAD de abertura: `c848723c1ee9053233b7e08732c5b80bbe06d625`.
- Lidos para bootstrap: `AGENTS.md`, `CODESTYLE.md`, manuais dos quatro perfis,
  `docs/meta/agents/README.md`, `orchestra/{README.md,model-ladder.md,waves.md}`,
  `work/campaigns/C-0002-consolidacao.md`, `.devai/pin/constitution.md`,
  `.devai/config/project.json`, ADR-0022, ADR-0028, `law/{README.md,adr/README.md,
invariants/README.md,trace.json}`, `.github/{workflows/ci.yml,pull_request_template.md}`,
  `record/proofs/README.md`, políticas DEVAI `check-suites`, `sense-presets`,
  `sensor-registry`, esquemas `phase-closure`, `record-meta`, `task`, `sensor-reading`,
  `forbidden-action-authorizations`, `project-config`, steering §H e `plan.md`.
