# Prompt do reviewer — prompt-review-1 (R-0020 devai-sensors)

Você é o reviewer da **outra família**, Claude Code com **Opus 5.5**. Papel constitucional: **Auditor**, soft gate. Trabalhe somente em leitura na worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`. Responda **somente JSON puro**, sem cercas Markdown nem texto antes/depois. Esta é a primeira revisão: seja exaustivo e liste todos os achados de uma vez.

## Contexto mínimo, nesta ordem

1. `docs/meta/agents/orchestra/README.md` §§4–5 e `docs/meta/agents/README.md` §Regras comuns.
2. `work/campaigns/C-0002-consolidacao.md` §§2, 4–5 (ação 5, R-0020).
3. `work/rounds/R-0020/AUTHORIZATION.md`: troca do Owner, maestro/workers Codex, você Claude Opus 5.5; OD-R20-003=(A), OD-R20-005=aceita.
4. `work/rounds/R-0020/plan.md`, anexado integralmente.
5. `work/rounds/R-0020/prompts/TASK-0001.md`…`TASK-0018.md`, anexados integralmente; `tasks/*.json` e `compositions.json` disponíveis na worktree.

## Rubrica verificável

1. Papel e autoridade por caminho (Art. 6/7/10), inclusive escrita em `work/rounds`, `law/`, CI e recibos Owner.
2. Leitura fechada suficiente para cada worker; não exigir busca livre no repositório.
3. Fronteiras de escrita, locks, dependências e um CTG por vez na mesma worktree.
4. Comandos de aceitação existentes e resultado esperado; testes Inspector podem ser RED até Engineer, mas nunca enfraquecidos.
5. Nada inventado; OD-R20-001/002/004/006 e A1 permanecem para decisão do Owner; OD-R20-003/005 e campanha já decididas não são reabertas.
6. Tríade Architect→Inspector→Engineer e autoria segregada.
7. Nenhum `git` ou `devai --write` por worker; provas só por verbos e pelo maestro; histórico append-only.
8. Contrato, testes, implementação e sensor coerentes; nenhuma leitura falha vira PASS.
9. Metas e gates da rodada não são retirados nem viram aviso.
10. Modelo e esforço conforme escada Codex vigente: Sol 6 para Architect e tarefas grandes, Terra médio, Luna pequeno; reviewer Opus 5.5.
11. Todos os 18 JSONs validam `task.schema.json` 2.0.0; composição SHA/PC corresponde exatamente ao prompt final; confira amostra e dependências.
12. ADR v2 aceita antes de CI, recibos históricos como ato do Owner; Constituição 1.0.1 via maestro em commit de autoria Owner.
13. Critério substituído, se houver, não pode ser contado como PASS; apontar qualquer contradição com o plano ou a autorização.

**PASS** se nenhum achado high. **REVIEW** se achado high corrigível sem mudar critério. **FAIL** se plano ou prompt contradiz Constituição, ADR, fonte ou decisão Owner, ou viola fronteira de escrita. Cite arquivo e linha exata; no primeiro ciclo, liste todos os achados. Não faça mudanças.

## Saída JSON pura

{"mode":"prompt-review","round":"R-0020","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"work/rounds/R-0020/prompts/TASK-0001.md","line":1,"claim":"...","fix":"..."}],"notes":[]}

## Material anexado

### work/rounds/R-0020/plan.md

```markdown
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
(`law-corpus`: `law/invariants`, `law/trace.json`, `law/schemas`, `adopter-policy`). R-0017 corre
em paralelo; se ainda não tiver `closure` quando o CTG-0003 chegar, o seal de R-0017 fica para o
último CTG ou para a primeira rodada seguinte (registrar em §Concorrência). Esta rodada precede as
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
3. **Decisões registradas e rodadas seladas** (CTG-0003): `law/register/DECISIONS.md` conforme
   OD-R20-001; tarefas normalizadas (`tools/devai/normalize-tasks.mjs`, determinístico: refs não-INV
   → `tags` `ref:<id>`, INV do `law/trace.json` quando houver, enums corrigidos) e
   `task.template.json` corrigido; gate `verify:round-tasks` (cada `tasks/*.json` contra
   `law/schemas/task.schema.json` via `devai check --only schema`); `record.md` por rodada;
   `record/derived/indexes/rounds.md` conforme OD-R20-002; `devai round seal` em R-0003…R-0019 com
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
   (aceitar, emendar por supersessão ou rejeitar); `round seal` e sensores entram no
   `maestro-prompt.template.md` e em `orchestra/README.md`. Constituição 1.0.1 (NC-M6): **aceita pelo
   Owner** (OD-R20-005); `init bind --constitution` com pin 1.0.1 em commit segregado de autoria Owner.
8. **Meta de PASS** (adenda A1, antes do CTG-0004): a partir da linha de base do CTG-0001, o
   Architect fixa, com decisão do Owner, (i) o conjunto de membros `devai check` obrigatórios em CI
   (todos os aplicáveis ao adotante; os de autoaplicação ficam N/A com issue upstream, nunca
   silenciados) e (ii) o piso de células PASS do scorecard por substrato. Metas só sobem; nenhum
   gate existente é removido, afrouxado ou convertido em aviso.

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço           | Lock                                                                | Depende de                   | Entrega                                                                                                                                                                                                                                                                              |
| --------- | -------------------- | ------------------- | ------------------------ | ------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-0001 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-baseline`                                         | —                            | `contracts/CTG-0001.md`: métricas exatas, comandos, formato de `baseline.json`, critérios C-01-nn                                                                                                                                                                                    |
| TASK-0002 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`                                             | TASK-0001                    | `tools/devai/tests/baseline.test.mjs` (fixtures de jsonl/cadeia, tarefas válidas e inválidas, commits mistos)                                                                                                                                                                        |
| TASK-0003 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-tools`, `MOD-root-package-json`                          | TASK-0002                    | `tools/devai/baseline.mjs` (somente leitura) + scripts `devai:baseline` e `devai:test`; `baseline.json`/`baseline.md` da abertura                                                                                                                                                    |
| TASK-0004 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-chain`                                            | merge CTG-0001               | `contracts/CTG-0002.md`: payload das entradas de correção por rodada, regra do gate de âncoras, `.gitattributes`, decisão sobre a cadeia legada, texto da issue upstream                                                                                                             |
| TASK-0005 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`                                             | TASK-0004                    | testes de `verify:proof-anchors` (linha órfã, âncora duplicada, correção declarada)                                                                                                                                                                                                  |
| TASK-0006 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-tools`, `MOD-root-package-json`, `MOD-gitattributes`     | TASK-0005                    | `tools/devai/verify-proof-anchors.mjs`, script, `pnpm check`; `.gitattributes`; entradas de correção gravadas **pelo maestro** com `evidence record`                                                                                                                                 |
| TASK-0007 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-seal`, `MOD-law-register`                         | merge CTG-0002               | `contracts/CTG-0003.md` + `law/register/DECISIONS.md` (OD-R20-001); mapa rodada → PC → `merged_as` → gates → plan/prompt; tabela de normalização campo a campo; forma do índice de rodadas (OD-R20-002); ensaio de `round seal` em clone descartável para as 17 rodadas              |
| TASK-0008 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`                                             | TASK-0007                    | testes de `normalize-tasks` (idempotência, nenhuma informação perdida) e de `verify:round-tasks`                                                                                                                                                                                     |
| TASK-0009 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-tools`, `MOD-round-tasks`, `MOD-orchestra-task-template` | TASK-0008                    | `tools/devai/normalize-tasks.mjs` aplicado a R-0003…R-0019; `task.template.json`; `verify:round-tasks`; 0 tarefas inválidas                                                                                                                                                          |
| TASK-0010 | Architect (transcr.) | transcriber-docs    | `gpt-6-luna` / low       | `MOD-round-records`                                                 | TASK-0009                    | `work/rounds/R-nnnn/record.md` para as rodadas com PC; R-0001/R-0002 ficam como exceção pré-método (a mesma declarada por R-0018 em `work/rounds/README.md`), sem seal                                                                                                               |
| TASK-0011 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-sensors`                                          | merge CTG-0003               | `contracts/CTG-0004.md`: kind → comando do repo → célula; o que fica N/A e por quê; persistência de leituras; adapter pós-merge; **adenda A1** (meta de PASS) para decisão do Owner                                                                                                  |
| TASK-0012 | Inspector            | inspector-tests     | `gpt-5.6-terra` / medium | `MOD-devai-tools-tests`                                             | TASK-0011                    | testes do wrapper de sensores (leitura válida contra `sensor-reading.schema.json`, falha vira `fail`, nunca `pass`)                                                                                                                                                                  |
| TASK-0013 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-tools`, `MOD-devai-config`, `MOD-root-package-json`      | TASK-0012                    | `tools/devai/sense.mjs` + script `devai:sense`; binding do adapter pós-merge; primeiras leituras gravadas pelo maestro; scorecard ≥ piso A1                                                                                                                                          |
| TASK-0014 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-ci`, `MOD-law-adr`                                | merge CTG-0004               | `law/policy/adr-validation.json` se ausente (coerente com OD-R18-001) e ADR v2 de gates de CI em `law/adr` (`check --only adrs` ok); `contracts/CTG-0005.md` (jobs, ordem, `--since-ref`, corpo de PR); proposta de `forbidden-action-authorizations.json` (11 recibos) para o Owner |
| TASK-0015 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-ci`, `MOD-pr-template`, `MOD-forbidden-receipts`               | TASK-0014 + recibos do Owner | `.github/workflows/ci.yml`; `.github/pull_request_template.md`; `law/policy/forbidden-action-authorizations.json` (conteúdo do Owner, commit segregado)                                                                                                                              |
| TASK-0016 | Architect            | architect-blueprint | `gpt-6-sol` / high       | `MOD-r20-contract-authority`, `MOD-law-adr`                         | merge CTG-0005               | ADR proposta orquestra × DEVAI; ADR proposta Constituição 1.0.1; `contracts/CTG-0006.md` (política de hooks por caminho e papel, `adapter_config`, convenção de autoria)                                                                                                             |
| TASK-0017 | Engineer             | engineer-backend    | `gpt-5.6-terra` / medium | `MOD-devai-config`, `MOD-claude-settings`, `MOD-git-hooks`          | TASK-0016                    | `.devai/config/project.json` via `devai init bind`/`init apply` (nunca à mão); `.claude/settings.json`; hook `pre-push`; `doctor` verde                                                                                                                                              |
| TASK-0018 | Architect (transcr.) | transcriber-docs    | `gpt-6-luna` / low       | `MOD-orchestra-method`, `MOD-docs`                                  | TASK-0017                    | `maestro-prompt.template.md` (seal, sensores, trailer, commit por papel), `orchestra/README.md`, `.gitignore` (Art. 41, se R-0018 não corrigiu), `backlog.md`, `waves.md` §Histórico                                                                                                 |

CTG-0001 = 0001 → 0002 → 0003; CTG-0002 = 0004 → 0005 → 0006; CTG-0003 = 0007 → 0008 → 0009 →
0010, depois `round seal` pelo maestro; CTG-0004 = 0011 → 0012 → 0013; CTG-0005 = 0014 → 0015;
CTG-0006 = 0016 → 0017 → 0018. **Um PR por CTG**, em série (cada um depende do merge do anterior:
lock de `record/`, `package.json` e CI). Testes do Inspector com `node --test
tools/devai/tests/*.test.mjs` (script `devai:test`, criado na TASK-0003, padrão `parameters:test`).

**Checkpoints (maestro, Engineer):** (a) antes de qualquer `--write` do DEVAI, ensaio no clone
descartável e `git status --porcelain` limpo depois; (b) `evidence record` e `round seal` só pelo
maestro, nunca por worker; (c) após o CTG-0003, `devai round status --round R-nnnn` →
`closed` para cada rodada selada; (d) após TASK-0013, `devai audit scorecard --at <HEAD>` e
comparação com A1.

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
- **TASK-0003:** `pnpm check` → exit 0; entrega `tools/devai/baseline.mjs, scripts devai:baseline/devai:test, baseline.json/md` presente e limitada aos caminhos do prompt.
- **TASK-0004:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0002.md` presente e limitada aos caminhos do prompt.
- **TASK-0005:** `pnpm format:check` → exit 0; entrega `tools/devai/tests/verify-proof-anchors.test.mjs` presente e limitada aos caminhos do prompt.
- **TASK-0006:** `pnpm check` → exit 0; entrega `verify-proof-anchors.mjs, package.json, .gitattributes` presente e limitada aos caminhos do prompt.
- **TASK-0007:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0003.md e law/register/DECISIONS.md quando OD-R20-001/002 decididas` presente e limitada aos caminhos do prompt.
- **TASK-0008:** `pnpm format:check` → exit 0; entrega `tools/devai/tests/normalize-tasks.test.mjs e verify-round-tasks.test.mjs` presente e limitada aos caminhos do prompt.
- **TASK-0009:** `pnpm check` → exit 0; entrega `normalize-tasks.mjs, verify-round-tasks.mjs, tasks históricas e template` presente e limitada aos caminhos do prompt.
- **TASK-0010:** `pnpm format:check` → exit 0; entrega `record.md por rodada com PC` presente e limitada aos caminhos do prompt.
- **TASK-0011:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0004.md e proposta A1` presente e limitada aos caminhos do prompt.
- **TASK-0012:** `pnpm format:check` → exit 0; entrega `tools/devai/tests/sense.test.mjs` presente e limitada aos caminhos do prompt.
- **TASK-0013:** `pnpm check` → exit 0; entrega `tools/devai/sense.mjs e script devai:sense; binding pelo maestro` presente e limitada aos caminhos do prompt.
- **TASK-0014:** `pnpm format:check` → exit 0; entrega `adr-validation.json, ADR v2 e contracts/CTG-0005.md` presente e limitada aos caminhos do prompt.
- **TASK-0015:** `pnpm check` → exit 0; entrega `ci.yml, pull_request_template.md e recibos aprovados` presente e limitada aos caminhos do prompt.
- **TASK-0016:** `pnpm format:check` → exit 0; entrega `contracts/CTG-0006.md e ADRs propostas` presente e limitada aos caminhos do prompt.
- **TASK-0017:** `pnpm check` → exit 0; entrega `settings e hooks; bind/apply executados pelo maestro` presente e limitada aos caminhos do prompt.
- **TASK-0018:** `pnpm format:check` → exit 0; entrega `maestro-prompt.template.md, README.md, waves.md, backlog.md` presente e limitada aos caminhos do prompt.

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
- **OD-R20-006** — ADR-0022: aceitar, superar pela ADR orquestra × DEVAI ou rejeitar.
- **A1** — meta de PASS (Meta 8).

## Decisões do maestro

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

## Triagem

- Bootstrap: `devai check --only adrs` retorna `ACTION_INVOCATION_REFUSED` porque
  `law/policy/adr-validation.json` não existe; TASK-0014 cria a política prevista no plano.
  Classificação: `reference-gap` do binding de adoção, sem alteração de gate.
- Bootstrap: `round plan --scaffold --write` no clone descartável
  `/tmp/r20-scaffold.5I8VY4` retornou `ROUND_ALREADY_EXISTS` (exit 2), sem escrita rastreada;
  scaffold já materializado no repositório. Classificação: `policy-issue` de invocação redundante.

## Retomada

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
```

### work/rounds/R-0020/prompts/TASK-0001.md

````markdown
# Prompt de worker — `TASK-0001` (`architect-blueprint`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect**. Declare na primeira linha da resposta. Modelo `gpt-6-sol`, esforço `high`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Definir contrato da linha de base**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/architect-blueprint.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `node_modules/@aarusso-nyx/devai/dist/law/policy/check-suites.json`
7. `node_modules/@aarusso-nyx/devai/dist/law/policy/sense-presets.json`
8. `node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json`
9. `record/proofs/chain.json`
10. `law/schemas/task.schema.json`

## Pode tocar

- `work/rounds/R-0020/contracts/CTG-0001.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Definir contrato da linha de base. Entregar contracts/CTG-0001.md. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: contracts/CTG-0001.md. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0001; predecessor nenhum. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Métricas C1: 25 membros de check, scorecard 45 células, SensorReading persistidas, closures, linha jsonl × chain, validade de TASK, trailers PR, commits mistos. Medir HEAD exato antes de mudar código; saída JSON e Markdown determinística.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `contracts/CTG-0001.md` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect
Tarefa: TASK-0001
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
```
````

````

### work/rounds/R-0020/prompts/TASK-0002.md

```markdown
# Prompt de worker — `TASK-0002` (`inspector-tests`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Inspector**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Testar o medidor da linha de base**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/inspector-tests.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0001.md`
7. `law/schemas/task.schema.json`
8. `record/proofs/chain.json`
9. `work/rounds/R-0020/reports/TASK-0001.md`

## Pode tocar

- `tools/devai/tests/baseline.test.mjs`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Testar o medidor da linha de base. Entregar tools/devai/tests/baseline.test.mjs. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: tools/devai/tests/baseline.test.mjs. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0001; predecessor TASK-0001. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Testes de caracterização: linha sem âncora, linha declarada, tarefa válida/inválida e commit que mistura F2/F3. Testes podem ficar RED antes do Engineer; não reduza asserções.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `tools/devai/tests/baseline.test.mjs` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `node --test tools/devai/tests/baseline.test.mjs` → testes executam; RED de caracterização é documentado e só vira PASS após a tarefa Engineer.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Inspector
Tarefa: TASK-0002
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0003.md

```markdown
# Prompt de worker — `TASK-0003` (`engineer-backend`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Engineer**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Implementar e medir linha de base**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/engineer-backend.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0001.md`
7. `tools/devai/tests/baseline.test.mjs`
8. `package.json`
9. `work/rounds/R-0020/reports/TASK-0002.md`

## Pode tocar

- `tools/devai/baseline.mjs`
- `package.json`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Implementar e medir linha de base. Entregar tools/devai/baseline.mjs, scripts devai:baseline/devai:test, baseline.json/md. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: tools/devai/baseline.mjs, scripts devai:baseline/devai:test, baseline.json/md. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0001; predecessor TASK-0002. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Script somente leitura. Não altere a referência para obter PASS; o maestro executa o script e materializa baseline.json/md sob autoria Architect; esses artefatos registram o HEAD de abertura e cada eixo observado, inclusive falhas preexistentes.

## Critérios de aceitação

- `pnpm check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `tools/devai/baseline.mjs, scripts devai:baseline/devai:test, baseline.json/md` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `pnpm devai:baseline` → baseline.json/md gerados para o HEAD de abertura, com resultado completo e reproduzível.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Engineer
Tarefa: TASK-0003
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0004.md

```markdown
# Prompt de worker — `TASK-0004` (`architect-blueprint`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect**. Declare na primeira linha da resposta. Modelo `gpt-6-sol`, esforço `high`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Definir reparo da cadeia e gate de âncoras**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/architect-blueprint.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `record/proofs/chain.json`
7. `record/proofs/README.md`
8. `.devai/pin/constitution.md`
9. `.devai/state/evidence-chain.json`
10. `work/rounds/R-0020/reports/TASK-0003.md`

## Pode tocar

- `work/rounds/R-0020/contracts/CTG-0002.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Definir reparo da cadeia e gate de âncoras. Entregar contracts/CTG-0002.md. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: contracts/CTG-0002.md. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0002; predecessor TASK-0003. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0005, R-0007 e R-0013 contêm linhas órfãs históricas. Correção é nova prova declaratória, nunca edição de jsonl/chain. Gate deve rejeitar órfã não declarada e âncora duplicada.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `contracts/CTG-0002.md` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect
Tarefa: TASK-0004
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0005.md

```markdown
# Prompt de worker — `TASK-0005` (`inspector-tests`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Inspector**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Testar verificação de âncoras**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/inspector-tests.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0002.md`
7. `record/proofs/chain.json`
8. `work/rounds/R-0020/reports/TASK-0004.md`

## Pode tocar

- `tools/devai/tests/verify-proof-anchors.test.mjs`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Testar verificação de âncoras. Entregar tools/devai/tests/verify-proof-anchors.test.mjs. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: tools/devai/tests/verify-proof-anchors.test.mjs. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0002; predecessor TASK-0004. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0005, R-0007 e R-0013 contêm linhas órfãs históricas. Correção é nova prova declaratória, nunca edição de jsonl/chain. Gate deve rejeitar órfã não declarada e âncora duplicada.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `tools/devai/tests/verify-proof-anchors.test.mjs` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `node --test tools/devai/tests/verify-proof-anchors.test.mjs` → testes executam; RED de caracterização é documentado e só vira PASS após a tarefa Engineer.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Inspector
Tarefa: TASK-0005
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0006.md

```markdown
# Prompt de worker — `TASK-0006` (`engineer-backend`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Engineer**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Implementar gate de âncoras**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/engineer-backend.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0002.md`
7. `tools/devai/tests/verify-proof-anchors.test.mjs`
8. `record/proofs/chain.json`
9. `work/rounds/R-0020/reports/TASK-0005.md`

## Pode tocar

- `tools/devai/verify-proof-anchors.mjs`
- `package.json`
- `.gitattributes`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Implementar gate de âncoras. Entregar verify-proof-anchors.mjs, package.json, .gitattributes. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: verify-proof-anchors.mjs, package.json, .gitattributes. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0002; predecessor TASK-0005. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0005, R-0007 e R-0013 contêm linhas órfãs históricas. Correção é nova prova declaratória, nunca edição de jsonl/chain. Gate deve rejeitar órfã não declarada e âncora duplicada.

## Critérios de aceitação

- `pnpm check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `verify-proof-anchors.mjs, package.json, .gitattributes` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `pnpm verify:proof-anchors` → 0 linhas órfãs não declaradas; maestro grava as provas por `devai evidence record`.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Engineer
Tarefa: TASK-0006
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0007.md

```markdown
# Prompt de worker — `TASK-0007` (`architect-blueprint`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect**. Declare na primeira linha da resposta. Modelo `gpt-6-sol`, esforço `high`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Definir decisões e selo das rodadas**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/architect-blueprint.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `law/schemas/task.schema.json`
7. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/phase-closure.schema.json`
8. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/record-meta.schema.json`
9. `work/rounds/README.md`
10. `work/rounds/R-0020/reports/TASK-0006.md`

## Pode tocar

- `work/rounds/R-0020/contracts/CTG-0003.md`
- `law/register/DECISIONS.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Definir decisões e selo das rodadas. Entregar contracts/CTG-0003.md e law/register/DECISIONS.md quando OD-R20-001/002 decididas. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: contracts/CTG-0003.md e law/register/DECISIONS.md quando OD-R20-001/002 decididas. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0003; predecessor TASK-0006. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0003…R-0016, R-0018 e R-0019 possuem PC; R-0017 só entra após closure em main. R-0001/R-0002 são pré-método. Normalização de TASK precede seal; `record/` só pelo verbo DEVAI e pelo maestro.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `contracts/CTG-0003.md e law/register/DECISIONS.md quando OD-R20-001/002 decididas` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect
Tarefa: TASK-0007
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0008.md

```markdown
# Prompt de worker — `TASK-0008` (`inspector-tests`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Inspector**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Testar normalização e validade das tarefas**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/inspector-tests.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0003.md`
7. `law/schemas/task.schema.json`
8. `docs/meta/agents/orchestra/task.template.json`
9. `work/rounds/R-0020/reports/TASK-0007.md`

## Pode tocar

- `tools/devai/tests/normalize-tasks.test.mjs`
- `tools/devai/tests/verify-round-tasks.test.mjs`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Testar normalização e validade das tarefas. Entregar tools/devai/tests/normalize-tasks.test.mjs e verify-round-tasks.test.mjs. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: tools/devai/tests/normalize-tasks.test.mjs e verify-round-tasks.test.mjs. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0003; predecessor TASK-0007. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0003…R-0016, R-0018 e R-0019 possuem PC; R-0017 só entra após closure em main. R-0001/R-0002 são pré-método. Normalização de TASK precede seal; `record/` só pelo verbo DEVAI e pelo maestro.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `tools/devai/tests/normalize-tasks.test.mjs e verify-round-tasks.test.mjs` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `node --test tools/devai/tests/normalize-tasks.test.mjs` → testes executam; RED de caracterização é documentado e só vira PASS após a tarefa Engineer.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Inspector
Tarefa: TASK-0008
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0009.md

```markdown
# Prompt de worker — `TASK-0009` (`engineer-backend`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Engineer**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Normalizar tarefas e criar gate**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/engineer-backend.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0003.md`
7. `tools/devai/tests/normalize-tasks.test.mjs`
8. `tools/devai/tests/verify-round-tasks.test.mjs`
9. `law/schemas/task.schema.json`
10. `law/trace.json`
11. `work/rounds/R-0020/reports/TASK-0008.md`

## Pode tocar

- `tools/devai/normalize-tasks.mjs`
- `tools/devai/verify-round-tasks.mjs`
- `docs/meta/agents/orchestra/task.template.json`
- `package.json`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Normalizar tarefas e criar gate. Entregar normalize-tasks.mjs, verify-round-tasks.mjs, tasks históricas e template. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: normalize-tasks.mjs, verify-round-tasks.mjs, tasks históricas e template. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0003; predecessor TASK-0008. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0003…R-0016, R-0018 e R-0019 possuem PC; R-0017 só entra após closure em main. R-0001/R-0002 são pré-método. Normalização de TASK precede seal; o worker entrega o normalizador e o gate, e o maestro aplica a normalização nos arquivos históricos sob autoria Architect. `record/` só pelo verbo DEVAI e pelo maestro.

## Critérios de aceitação

- `pnpm check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `normalize-tasks.mjs, verify-round-tasks.mjs, tasks históricas e template` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `pnpm verify:round-tasks` → 0 TASK inválidas de R-0003…R-0020.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Engineer
Tarefa: TASK-0009
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0010.md

```markdown
# Prompt de worker — `TASK-0010` (`transcriber-docs`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect (transcrição)**. Declare na primeira linha da resposta. Modelo `gpt-6-luna`, esforço `low`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Transcrever records das rodadas fechadas**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/transcriber-docs.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0003.md`
7. `work/rounds/README.md`
8. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/record-meta.schema.json`
9. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/phase-closure.schema.json`
10. `work/rounds/R-0020/reports/TASK-0009.md`

## Pode tocar

- `work/rounds/R-0003/record.md`
- `work/rounds/R-0004/record.md`
- `work/rounds/R-0005/record.md`
- `work/rounds/R-0006/record.md`
- `work/rounds/R-0007/record.md`
- `work/rounds/R-0008/record.md`
- `work/rounds/R-0009/record.md`
- `work/rounds/R-0010/record.md`
- `work/rounds/R-0011/record.md`
- `work/rounds/R-0012/record.md`
- `work/rounds/R-0013/record.md`
- `work/rounds/R-0014/record.md`
- `work/rounds/R-0015/record.md`
- `work/rounds/R-0016/record.md`
- `work/rounds/R-0018/record.md`
- `work/rounds/R-0019/record.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Transcrever records das rodadas fechadas. Entregar record.md por rodada com PC. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: record.md por rodada com PC. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0003; predecessor TASK-0009. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- R-0003…R-0016, R-0018 e R-0019 possuem PC; R-0017 só entra após closure em main. R-0001/R-0002 são pré-método. Normalização de TASK precede seal; `record/` só pelo verbo DEVAI e pelo maestro.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `record.md por rodada com PC` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect (transcrição)
Tarefa: TASK-0010
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0011.md

```markdown
# Prompt de worker — `TASK-0011` (`architect-blueprint`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect**. Declare na primeira linha da resposta. Modelo `gpt-6-sol`, esforço `high`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Definir sensores e adenda A1**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/architect-blueprint.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json`
7. `node_modules/@aarusso-nyx/devai/dist/law/policy/sense-presets.json`
8. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/sensor-reading.schema.json`
9. `work/rounds/R-0020/baseline.json`
10. `work/rounds/R-0020/reports/TASK-0010.md`

## Pode tocar

- `work/rounds/R-0020/contracts/CTG-0004.md`
- `work/rounds/R-0020/plan.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Definir sensores e adenda A1. Entregar contracts/CTG-0004.md e proposta A1. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: contracts/CTG-0004.md e proposta A1. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0004; predecessor TASK-0010. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- SensorReading deve obedecer ao esquema DEVAI; falha de comando nunca vira PASS. A1 define piso de PASS por substrato após decisão do Owner; não invente piso.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `contracts/CTG-0004.md e proposta A1` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect
Tarefa: TASK-0011
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0012.md

```markdown
# Prompt de worker — `TASK-0012` (`inspector-tests`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Inspector**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Testar wrapper de sensores**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/inspector-tests.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0004.md`
7. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/sensor-reading.schema.json`
8. `work/rounds/R-0020/reports/TASK-0011.md`

## Pode tocar

- `tools/devai/tests/sense.test.mjs`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Testar wrapper de sensores. Entregar tools/devai/tests/sense.test.mjs. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: tools/devai/tests/sense.test.mjs. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0004; predecessor TASK-0011. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- SensorReading deve obedecer ao esquema DEVAI; falha de comando nunca vira PASS. A1 define piso de PASS por substrato após decisão do Owner; não invente piso.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `tools/devai/tests/sense.test.mjs` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `node --test tools/devai/tests/sense.test.mjs` → testes executam; RED de caracterização é documentado e só vira PASS após a tarefa Engineer.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Inspector
Tarefa: TASK-0012
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0013.md

```markdown
# Prompt de worker — `TASK-0013` (`engineer-backend`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Engineer**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Implementar wrapper de sensores**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/engineer-backend.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0004.md`
7. `tools/devai/tests/sense.test.mjs`
8. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/sensor-reading.schema.json`
9. `work/rounds/R-0020/reports/TASK-0012.md`

## Pode tocar

- `tools/devai/sense.mjs`
- `package.json`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Implementar wrapper de sensores. Entregar tools/devai/sense.mjs e script devai:sense; binding pelo maestro. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: tools/devai/sense.mjs e script devai:sense; binding pelo maestro. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0004; predecessor TASK-0012. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- SensorReading deve obedecer ao esquema DEVAI; falha de comando nunca vira PASS. A1 define piso de PASS por substrato após decisão do Owner; não invente piso.

## Critérios de aceitação

- `pnpm check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `tools/devai/sense.mjs e script devai:sense; binding pelo maestro` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `pnpm devai:sense` → leituras válidas, sem converter falha em PASS; o maestro persiste via `devai sense record`.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Engineer
Tarefa: TASK-0013
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0014.md

```markdown
# Prompt de worker — `TASK-0014` (`architect-blueprint`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect**. Declare na primeira linha da resposta. Modelo `gpt-6-sol`, esforço `high`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Definir gates CI e ADR v2**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/architect-blueprint.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `law/adr/README.md`
7. `law/schemas/adr-v2.schema.json`
8. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/forbidden-action-authorizations.schema.json`
9. `.github/workflows/ci.yml`
10. `work/rounds/R-0020/reports/TASK-0013.md`

## Pode tocar

- `law/policy/adr-validation.json`
- `law/adr/ADR-0002-devai-ci-gates.md`
- `work/rounds/R-0020/contracts/CTG-0005.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Definir gates CI e ADR v2. Entregar adr-validation.json, ADR v2 e contracts/CTG-0005.md. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: adr-validation.json, ADR v2 e contracts/CTG-0005.md. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0005; predecessor TASK-0013. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Prepare a ADR v2 com affected_rules cobrindo ci.yml. O Owner precisa aceitá-la antes de qualquer mudança de CI; não marque Accepted por inferência. Os 11 achados históricos exigem recibos do Owner; nunca silencie forbidden-actions. O corpo de PR terá Inv-Compliance:.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `adr-validation.json, ADR v2 e contracts/CTG-0005.md` → arquivo(s) presente(s), sem alteração fora da fronteira.
- `pnpm exec devai check --only adrs --repo-root . --format json` → ok=true após a política e ADR.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect
Tarefa: TASK-0014
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0015.md

```markdown
# Prompt de worker — `TASK-0015` (`engineer-backend`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Engineer**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Ligar gates DEVAI no CI**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/engineer-backend.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0005.md`
7. `law/adr/ADR-0002-devai-ci-gates.md`
8. `.github/workflows/ci.yml`
9. `.github/pull_request_template.md`
10. `work/rounds/R-0020/reports/TASK-0014.md`

## Pode tocar

- `.github/workflows/ci.yml`
- `.github/pull_request_template.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Ligar gates DEVAI no CI. Entregar ci.yml e pull_request_template.md; os recibos históricos são ato do Owner, aplicado pelo maestro em commit segregado após autorização. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: ci.yml, pull_request_template.md e recibos aprovados. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0005; predecessor TASK-0014. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- ADR v2 aceita, com affected_rules cobrindo ci.yml, precede mudança de CI. Os 11 achados históricos exigem recibos do Owner; nunca silencie forbidden-actions. O corpo de PR terá Inv-Compliance:.

## Critérios de aceitação

- `pnpm check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `ci.yml, pull_request_template.md e recibos aprovados` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Engineer
Tarefa: TASK-0015
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0016.md

```markdown
# Prompt de worker — `TASK-0016` (`architect-blueprint`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect**. Declare na primeira linha da resposta. Modelo `gpt-6-sol`, esforço `high`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Definir autoridade por caminho e método**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/architect-blueprint.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `docs/meta/adr/ADR-0022-orchestra-execution-model.md`
7. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/project-config.schema.json`
8. `.devai/config/project.json`
9. `work/rounds/R-0020/reports/TASK-0015.md`

## Pode tocar

- `work/rounds/R-0020/contracts/CTG-0006.md`
- `law/adr/ADR-0003-orchestra-devai.md`
- `law/adr/ADR-0004-constitution-1-0-1.md`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Definir autoridade por caminho e método. Entregar contracts/CTG-0006.md e ADRs propostas. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: contracts/CTG-0006.md e ADRs propostas. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0006; predecessor TASK-0015. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Host-integrated e hooks devem aplicar autoridade por caminho. A Constituição 1.0.1 foi aceita, mas init bind/apply é operação exclusiva do maestro após ensaio em clone; ADR-0022 já foi aceita em R-0018.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `contracts/CTG-0006.md e ADRs propostas` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect
Tarefa: TASK-0016
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0017.md

```markdown
# Prompt de worker — `TASK-0017` (`engineer-backend`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Engineer**. Declare na primeira linha da resposta. Modelo `gpt-5.6-terra`, esforço `medium`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Implementar hooks de autoridade**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/engineer-backend.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0006.md`
7. `.devai/config/project.json`
8. `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/project-config.schema.json`
9. `work/rounds/R-0020/reports/TASK-0016.md`

## Pode tocar

- `.claude/settings.json`
- `tools/devai/authority-hook.mjs`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Implementar hooks de autoridade. Entregar settings e hooks; bind/apply executados pelo maestro. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: settings e hooks; bind/apply executados pelo maestro. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0006; predecessor TASK-0016. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Host-integrated e hooks devem aplicar autoridade por caminho. A Constituição 1.0.1 foi aceita, mas init bind/apply é operação exclusiva do maestro após ensaio em clone; ADR-0022 já foi aceita em R-0018.

## Critérios de aceitação

- `pnpm check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `settings e hooks; bind/apply executados pelo maestro` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Engineer
Tarefa: TASK-0017
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/prompts/TASK-0018.md

```markdown
# Prompt de worker — `TASK-0018` (`transcriber-docs`)

> Orquestra `devai-sensors`, rodada `R-0020`, worktree `/Users/aarusso/.codex/worktrees/devai-sensors/detran`, branch `orchestra/devai-sensors`. Execute uma tarefa; você não conhece a conversa do maestro.

## Papel

Papel constitucional: **Architect (transcrição)**. Declare na primeira linha da resposta. Modelo `gpt-6-luna`, esforço `low`.

## Contexto da frente

A campanha C-0002, ação 5, liga sensores DEVAI com máximo PASS. R-0018/0019 fecharam e estão em main; R-0017 só mesclou CTG-0001. A rodada usa seis CTGs seriais e um PR por CTG. Esta tarefa: **Transcrever método e histórico**.

## Leitura obrigatória (lista fechada, nesta ordem)

1. `docs/meta/agents/transcriber-docs.md`
2. `AGENTS.md`
3. `CODESTYLE.md`
4. `work/rounds/R-0020/AUTHORIZATION.md`
5. `work/rounds/R-0020/plan.md`
6. `work/rounds/R-0020/contracts/CTG-0006.md`
7. `docs/meta/agents/orchestra/model-ladder.md`
8. `work/rounds/R-0020/reports/TASK-0017.md`

## Pode tocar

- `docs/meta/agents/orchestra/maestro-prompt.template.md`
- `docs/meta/agents/orchestra/README.md`
- `docs/meta/agents/orchestra/waves.md`
- `docs/meta/knowledge-base/backlog.md`
- `.gitignore`

## Não pode tocar

- Qualquer caminho não listado em Pode tocar, inclusive `record/`, `.devai/`, `docs/framework/product/`, arquivos gerados e testes que não pertençam a esta tarefa.
- Nenhum comando Git, instalação de pacote, push, PR, `devai ... --write` ou edição para fazer gate passar. O maestro faz essas operações.
- Nenhum caminho de `package.json`, `docs/dev`, registro de ODs ou CI enquanto houver PR concorrente da R-0017 no mesmo lock.

## Tarefa

Transcrever método e histórico. Entregar maestro-prompt.template.md, README.md, waves.md, backlog.md. Faça somente a parte de sua autoridade; se a decisão ou um lock impedir a entrega, registre o bloqueio e pare.

## Definições que valem como contrato

- Escopo fechado: maestro-prompt.template.md, README.md, waves.md, backlog.md. A descrição da TASK e o contrato do CTG são vinculantes; nenhuma decisão do Owner é presumida.
- Sequência: CTG-0006; predecessor TASK-0017. Só comece quando o maestro confirmar dependência e lock livres.
- O plano da R-0020 fixa critérios imutáveis. OD-R20-003 = (A) e OD-R20-005 = aceita; OD-R20-001/002/004/006 e A1 exigem decisão explícita antes do efeito correspondente.
- Art. 6 rege autoria por caminho; Art. 7 rege papéis; Art. 41 exige prova append-only. Nunca altere `record/`, execute `devai ... --write`, instale pacotes ou faça Git: são operações do maestro.
- Não edite caminhos de R-0017 enquanto um PR dessa rodada os tiver em disputa; informe o lock no relatório. Sem valor normativo inventado: registre `source_pending` ou OD.
- Host-integrated e hooks devem aplicar autoridade por caminho. A Constituição 1.0.1 foi aceita, mas init bind/apply é operação exclusiva do maestro após ensaio em clone; ADR-0022 já foi aceita em R-0018.

## Critérios de aceitação

- `pnpm format:check` → exit 0 nos arquivos que esta tarefa pode tocar.
- Entrega declarada em `maestro-prompt.template.md, README.md, waves.md, backlog.md` → arquivo(s) presente(s), sem alteração fora da fronteira.

## Regras que não admitem exceção

1. Use só as fontes da lista fechada e as definições acima. Não procure o repositório inteiro.
2. Não invente prazos, estados, papéis, erros ou pisos: use `source_pending` ou OD.
3. Preserve testes, gates e artefatos gerados. Formate apenas seus arquivos com `node_modules/.bin/prettier --write`.
4. Não toque na cadeia de evidências; reporte ao maestro qualquer comando que precise gravar prova.
5. Se houver contradição entre contrato e critério, pare e reporte RGR para adenda do Architect.

## Entrega (somente este relatório Markdown)

```markdown
Papel: Architect (transcrição)
Tarefa: TASK-0018
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <ou nenhum>
````

````

### work/rounds/R-0020/compositions.json

```json
[
  {
    "task_id": "TASK-0001",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0001.md",
    "sha256": "a2fc3ca74fedef570619b26deac6a2a7bfbdefef1f925ef4def42e4337f56621",
    "pc_id": "PC-a2fc3ca74fedef57",
    "model": "gpt-6-sol",
    "effort": "high"
  },
  {
    "task_id": "TASK-0002",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0002.md",
    "sha256": "c5626b1ba77dea2cf626af3b58efee4dc97e7980b3433da317219ea974fcf3d2",
    "pc_id": "PC-c5626b1ba77dea2c",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0003",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0003.md",
    "sha256": "da9a17698f91eb3ba9514b914fed0c00c435fda8e86ca24a05b4749ab489a701",
    "pc_id": "PC-da9a17698f91eb3b",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0004",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0004.md",
    "sha256": "ae17823ad34adfd808ee0be37bd55915e60e91177bb9344ac5f2f7050a06dd56",
    "pc_id": "PC-ae17823ad34adfd8",
    "model": "gpt-6-sol",
    "effort": "high"
  },
  {
    "task_id": "TASK-0005",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0005.md",
    "sha256": "e91f74be81d7964ba19f6b8acf850cca1b4fe56ee19e688373dd37cbd81b9467",
    "pc_id": "PC-e91f74be81d7964b",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0006",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0006.md",
    "sha256": "1aa1d8cb5e77ea2061be48108d1cd7933e284afe1b725ecc324d71386e6dbaf4",
    "pc_id": "PC-1aa1d8cb5e77ea20",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0007",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0007.md",
    "sha256": "ddb5289f2bb7e1626ef692edcd0d56107e3808492196c1faf2e251ac9235f9db",
    "pc_id": "PC-ddb5289f2bb7e162",
    "model": "gpt-6-sol",
    "effort": "high"
  },
  {
    "task_id": "TASK-0008",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0008.md",
    "sha256": "6b049410d5e4027f57b2a67fefac7b424bd0d3909d568cd56478679065d0ad37",
    "pc_id": "PC-6b049410d5e4027f",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0009",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0009.md",
    "sha256": "727530c7ce2838c0ebc9d7bd8ed6e45ca6f12a2457c0ce0ec8a9eb3098c037b4",
    "pc_id": "PC-727530c7ce2838c0",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0010",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0010.md",
    "sha256": "955a2ea4b5c2cad927a71fbf548a00d63c85621a442ad11e96353a68db576b47",
    "pc_id": "PC-955a2ea4b5c2cad9",
    "model": "gpt-6-luna",
    "effort": "low"
  },
  {
    "task_id": "TASK-0011",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0011.md",
    "sha256": "a61510997eb97132448507b37df8438537a641caefcd1693dc7630c341136c65",
    "pc_id": "PC-a61510997eb97132",
    "model": "gpt-6-sol",
    "effort": "high"
  },
  {
    "task_id": "TASK-0012",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0012.md",
    "sha256": "31bfd4f7b81eb9b49d95bc5556d7fcbcbac60648ec09a42fd667137e734573a6",
    "pc_id": "PC-31bfd4f7b81eb9b4",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0013",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0013.md",
    "sha256": "71e15dc8ad9c404760408fccaa801a4ac11fb7d0b32d85a23e5f864b430dd7d6",
    "pc_id": "PC-71e15dc8ad9c4047",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0014",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0014.md",
    "sha256": "ea7420ab57031cba286c0a1ed5cc2f0bcc469726c3b61c23c07bfe73f2c437d1",
    "pc_id": "PC-ea7420ab57031cba",
    "model": "gpt-6-sol",
    "effort": "high"
  },
  {
    "task_id": "TASK-0015",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0015.md",
    "sha256": "988b843f3416f42437c9623b96e7bcc647913373acf795ee6b31a90e79291102",
    "pc_id": "PC-988b843f3416f424",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0016",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0016.md",
    "sha256": "05aed1445e1d418d99b5fb2438fc46c8f0a8ea82fc7e81d3d9552f3f46e12dd1",
    "pc_id": "PC-05aed1445e1d418d",
    "model": "gpt-6-sol",
    "effort": "high"
  },
  {
    "task_id": "TASK-0017",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0017.md",
    "sha256": "a675e53aeeb599507a01f40e75776794cad75e131cd281a114ddd02187da6982",
    "pc_id": "PC-a675e53aeeb59950",
    "model": "gpt-5.6-terra",
    "effort": "medium"
  },
  {
    "task_id": "TASK-0018",
    "prompt_path": "work/rounds/R-0020/prompts/TASK-0018.md",
    "sha256": "727f80e8ca24815d91d0058b25b208a1beffa49a3f8a23323f94b56902feae91",
    "pc_id": "PC-727f80e8ca24815d",
    "model": "gpt-6-luna",
    "effort": "low"
  }
]

````
