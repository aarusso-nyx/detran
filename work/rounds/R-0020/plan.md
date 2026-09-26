# R-0020 — frente `devai-sensors` (ação 5 da C-0002: sensores DEVAI com o máximo de PASS)

**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner.** Planejada em 2026-09-26
pelo Architect a partir de `work/campaigns/C-0002-consolidacao.md` (§2 fase B, §3.2, §4, §5) e da
inspeção somente leitura de 2026-09-25 (relatório (e), `work/campaigns/C-0002-inspecao-2026-09-25/e-devai.md`, versionado com
a campanha; os fatos usados estão transcritos abaixo). Maestro **Opus 5.5** (Claude Code); reviewer **Sol 6**
(Codex CLI) pela ponte `tools/orchestra/bridge.sh codex`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/devai-sensors`, branch `orchestra/devai-sensors`.
**Concorrência:** fase B. **Abre após o merge de R-0018** (`index-state`: destino de `law/adr` por OD-R18-001, gate
`verify:state-index`, `.gitignore` de `reports/`, índices) **e de R-0019**
(`law-corpus`: `law/invariants`, `law/trace.json`, `law/schemas`, `adopter-policy`). R-0017 corre
em paralelo; se ainda não tiver `closure` quando o CTG-0003 chegar, o seal de R-0017 fica para o
último CTG ou para a primeira rodada seguinte (registrar em §Concorrência). Esta rodada precede as
rodadas de código (C-0002 §3.2); R-0021 pode correr em paralelo (abre após R-0017): os locks desta
rodada (CI, `.devai/config`, `law/register`, `record/`, método da orquestra) são partilhados por
merge, e cada rodada que abrir depois do CTG-0005 já nasce com os gates novos.
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

| Tarefa    | Papel                | Perfil              | Modelo/esforço   | Lock                                                                | Depende de                   | Entrega                                                                                                                                                                                                                                                                              |
| --------- | -------------------- | ------------------- | ---------------- | ------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-0001 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r20-contract-baseline`                                         | —                            | `contracts/CTG-0001.md`: métricas exatas, comandos, formato de `baseline.json`, critérios C-01-nn                                                                                                                                                                                    |
| TASK-0002 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-devai-tools-tests`                                             | TASK-0001                    | `tools/devai/tests/baseline.test.mjs` (fixtures de jsonl/cadeia, tarefas válidas e inválidas, commits mistos)                                                                                                                                                                        |
| TASK-0003 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-devai-tools`, `MOD-root-package-json`                          | TASK-0002                    | `tools/devai/baseline.mjs` (somente leitura) + scripts `devai:baseline` e `devai:test`; `baseline.json`/`baseline.md` da abertura                                                                                                                                                    |
| TASK-0004 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r20-contract-chain`                                            | merge CTG-0001               | `contracts/CTG-0002.md`: payload das entradas de correção por rodada, regra do gate de âncoras, `.gitattributes`, decisão sobre a cadeia legada, texto da issue upstream                                                                                                             |
| TASK-0005 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-devai-tools-tests`                                             | TASK-0004                    | testes de `verify:proof-anchors` (linha órfã, âncora duplicada, correção declarada)                                                                                                                                                                                                  |
| TASK-0006 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-devai-tools`, `MOD-root-package-json`, `MOD-gitattributes`     | TASK-0005                    | `tools/devai/verify-proof-anchors.mjs`, script, `pnpm check`; `.gitattributes`; entradas de correção gravadas **pelo maestro** com `evidence record`                                                                                                                                 |
| TASK-0007 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r20-contract-seal`, `MOD-law-register`                         | merge CTG-0002               | `contracts/CTG-0003.md` + `law/register/DECISIONS.md` (OD-R20-001); mapa rodada → PC → `merged_as` → gates → plan/prompt; tabela de normalização campo a campo; forma do índice de rodadas (OD-R20-002); ensaio de `round seal` em clone descartável para as 17 rodadas              |
| TASK-0008 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-devai-tools-tests`                                             | TASK-0007                    | testes de `normalize-tasks` (idempotência, nenhuma informação perdida) e de `verify:round-tasks`                                                                                                                                                                                     |
| TASK-0009 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-devai-tools`, `MOD-round-tasks`, `MOD-orchestra-task-template` | TASK-0008                    | `tools/devai/normalize-tasks.mjs` aplicado a R-0003…R-0019; `task.template.json`; `verify:round-tasks`; 0 tarefas inválidas                                                                                                                                                          |
| TASK-0010 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-round-records`                                                 | TASK-0009                    | `work/rounds/R-nnnn/record.md` para as rodadas com PC; R-0001/R-0002 ficam como exceção pré-método (a mesma declarada por R-0018 em `work/rounds/README.md`), sem seal                                                                                                               |
| TASK-0011 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r20-contract-sensors`                                          | merge CTG-0003               | `contracts/CTG-0004.md`: kind → comando do repo → célula; o que fica N/A e por quê; persistência de leituras; adapter pós-merge; **adenda A1** (meta de PASS) para decisão do Owner                                                                                                  |
| TASK-0012 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-devai-tools-tests`                                             | TASK-0011                    | testes do wrapper de sensores (leitura válida contra `sensor-reading.schema.json`, falha vira `fail`, nunca `pass`)                                                                                                                                                                  |
| TASK-0013 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-devai-tools`, `MOD-devai-config`, `MOD-root-package-json`      | TASK-0012                    | `tools/devai/sense.mjs` + script `devai:sense`; binding do adapter pós-merge; primeiras leituras gravadas pelo maestro; scorecard ≥ piso A1                                                                                                                                          |
| TASK-0014 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r20-contract-ci`, `MOD-law-adr`                                | merge CTG-0004               | `law/policy/adr-validation.json` se ausente (coerente com OD-R18-001) e ADR v2 de gates de CI em `law/adr` (`check --only adrs` ok); `contracts/CTG-0005.md` (jobs, ordem, `--since-ref`, corpo de PR); proposta de `forbidden-action-authorizations.json` (11 recibos) para o Owner |
| TASK-0015 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-ci`, `MOD-pr-template`, `MOD-forbidden-receipts`               | TASK-0014 + recibos do Owner | `.github/workflows/ci.yml`; `.github/pull_request_template.md`; `law/policy/forbidden-action-authorizations.json` (conteúdo do Owner, commit segregado)                                                                                                                              |
| TASK-0016 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r20-contract-authority`, `MOD-law-adr`                         | merge CTG-0005               | ADR proposta orquestra × DEVAI; ADR proposta Constituição 1.0.1; `contracts/CTG-0006.md` (política de hooks por caminho e papel, `adapter_config`, convenção de autoria)                                                                                                             |
| TASK-0017 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-devai-config`, `MOD-claude-settings`, `MOD-git-hooks`          | TASK-0016                    | `.devai/config/project.json` via `devai init bind`/`init apply` (nunca à mão); `.claude/settings.json`; hook `pre-push`; `doctor` verde                                                                                                                                              |
| TASK-0018 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-orchestra-method`, `MOD-docs`                                  | TASK-0017                    | `maestro-prompt.template.md` (seal, sensores, trailer, commit por papel), `orchestra/README.md`, `.gitignore` (Art. 41, se R-0018 não corrigiu), `backlog.md`, `waves.md` §Histórico                                                                                                 |

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

## Bloqueios

## Triagem

## Retomada

## Leitura
