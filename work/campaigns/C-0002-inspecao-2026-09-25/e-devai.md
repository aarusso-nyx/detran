# Inspeção (e): aplicação da governança DEVAI no repositório detran

- **Papel declarado:** Auditor (Constituição DEVAI 1.0.0, Art. 7: papéis humanos; Art. 33: Auditor como estimador de estado). A avaliação foi somente-leitura.
- **Data:** 2026-09-25
- **HEAD inspecionado:** `a92ef731` (merge do PR #117, que fecha R-0015 como PC-0014)
- **Pacote instalado:** `@aarusso-nyx/devai@1.5.6`, com o pin da Constituição em 1.0.0 (`.devai/pin/constitution.md`)

> Correção de premissa. O enunciado e o `CLAUDE.md` citam DEVAI **1.4.5**. O repositório, porém, está em **1.5.6**: `package.json`, `.devai/config/project.json` (`devai_version`), `AGENTS.md`, `README.md` e ADR-0028 dizem 1.5.6, e o CLI instalado responde `devai/1.5.6`. A avaliação foi feita contra o 1.5.6 instalado. Onde o 1.4.5 ainda aparece, isso é tratado como drift documental (NC-B1).

---

## 1. Resumo executivo

O DEVAI está **instalado e vinculado corretamente**. O pin da Constituição confere com o digest declarado. `devai doctor` passa nas 13 verificações. As duas cadeias de evidência verificam, e o CI tem um evidence-gate fail-closed de verdade, com uma rota de RC atestado localmente que é tecnicamente sofisticada. **O uso do DEVAI como mecanismo de controle formal, porém, é raso.** Na prática o repositório roda sobre uma camada própria de orquestração, a "orquestra" (ADR-0022, que ainda está _Proposed_). Nessa camada, rounds, tarefas, composições de prompt, revisões, orçamentos e autorizações são artefatos manuais em `work/rounds/`. O DEVAI entra só em alguns pontos: `evidence record`, `audit observe`, `round close --input` e `evidence verify` / `doctor` no CI.

Principais conclusões:

1. **O ciclo de vida dos rounds nunca é concluído formalmente.** Os 14 rounds com PC emitido (R-0003…R-0016) continuam **"active"** para o DEVAI. Não há `close-state.jsonl`, `record.md`, ledger `record/derived/indexes/rounds.md` nem registro de decisões. `devai round seal` nunca foi executado e hoje nem teria como passar. Todas as 14 closures usam as decisões genéricas `D-1`/`D-2`, que não existem em lugar nenhum.
2. **A cadeia de evidência está íntegra mas incompleta.** De 106 linhas de prova em `record/proofs/work/generic/*.jsonl`, **49 não têm âncora** em `record/proofs/chain.json`: R-0007 tem 38, R-0013 tem 10 e R-0005 tem 1. O merge `9ac6dd55` descartou as âncoras das sequências 38 e 39 de R-0007. O verificador do DEVAI não cruza linhas com âncoras e declara a cadeia "valid".
3. **Sensores e scorecard estão inoperantes.** As 45 observações de auditoria versionadas (35 MB em `.devai/state/audit-observations/`) dão, **todas**, 0 PASS / 43 UNKNOWN / 2 N/A. Nenhum `SensorReading` foi emitido (Art. 32), e o `pnpm check` corre fora do sistema de sensores. O DEVAI nunca estabeleceu prontidão (readiness).
4. **As primitivas de especificação do DEVAI estão vazias.** `law/invariants`, `law/schemas`, `law/glossary` e `product/` estão vazios. `target_invariants` das tarefas cita WF-/RN-/ADR-/OD- em vez de `INV-*`. O trailer `Inv-Compliance:` aparece em 0 de 95 PRs. `devai check --only invariants` "passa" sobre um conjunto vazio, com 0 arquivos lidos.
5. **O CI invoca só 2 dos cerca de 25 checks canônicos.** Rodados numa cópia descartável, `forbidden-actions`, `glob-guards` e `adrs` dão **FAIL**, e `ci-economy` e `docs-governance` dão REVIEW.
6. **As tarefas não seguem o esquema DEVAI.** 143 dos 260 `tasks/TASK-*.json` são **inválidos** contra `task.schema.json` 2.0.0, embora `work/rounds/README.md` afirme conformidade. Nenhuma tarefa está registrada em `.devai/state/tasks`, então `round run`, `round gap` e `triage` nunca foram usados.

Pontos fortes: pin e materialização de política íntegros, evidence-gate fail-closed sem filtros de caminho, proteção de branch com `enforce_admins`, attested local RC via `devai check --rc` com tag protegida e verificador fixado, as 14 phase-closures `PC-0001…PC-0014` válidas contra o esquema, e a disciplina de PR com template de papel.

**Veredicto:** conformidade **parcial**. A aplicação é correta na camada de binding e evidência, mas **não chega a ser um fluxo formalmente fechado**: rounds, tarefas, invariantes, sensores e decisões ficam fora do controle do DEVAI.

---

## 2. Metodologia

1. **Leitura das fontes.** Li `AGENTS.md`, `CLAUDE.md`, `CONSTITUTION.md` (legado 0.3.0), `README.md`, `BUILD-PLAN.md`, `DESIGN-DECISIONS.md`, `.devai/` inteiro (config, pin, state), `law/`, `docs/framework/` (incluindo `schemas/`), `work/rounds/R-0001…R-0016`, `work/audit`, `record/`, `.github/workflows/*`, `.github/pull_request_template.md`, `.claude/agents/*`, `test-tasks.json`, `tools/ci/*` e `docs/meta/adr/*`. `docs/work/devai` **não existe**, embora o `.gitignore` o libere.
2. **Estudo do pacote DEVAI 1.5.6** (`node_modules/@aarusso-nyx/devai/dist`):
   - árvore de comandos (`--help --all`) e política `law/policy/*` (check-suites, sensor-registry, action-registry, forbidden-actions etc.);
   - recipes (`devai-round`, `devai-verify` …);
   - os 89 esquemas embutidos, extraídos para o scratchpad;
   - código de `round close`, `round seal`, `round status` e `authorizationIsActive`, e do cálculo de PC.
3. **Comandos DEVAI de efeito `read`**, rodados no repositório e com `git status` idêntico antes e depois:
   - `devai doctor --format human` → OK, 13/13;
   - `devai evidence verify --scope chain --show-head`, na cadeia governada e na legada;
   - `devai round status` e `devai round assess` para R-0001, R-0003, R-0010, R-0015 e R-0016.
4. **Checks `devai check --only <m>`** (efeito declarado `read`), rodados num **clone descartável** no scratchpad com `node_modules` por symlink. O repositório não foi tocado. Membros: `ci-economy`, `adrs`, `invariants`, `trace`, `glossary`, `schemas`, `forbidden-actions`, `glob-guards`, `sensor-integrity`, `docs-governance`.
5. **Validação de esquemas** com o `ajv` do próprio DEVAI, usando os esquemas embutidos: tarefas, phase-closures, rascunhos `closure.json` e `.devai/config/*`.
6. **Análise do histórico:** `git log` da cadeia (92 commits a tocam), âncoras por commit, propriedade append-only na história _first-parent_ de `main`, mistura de papéis por commit, `gh api` da proteção de `main`, corpos de PR (`gh pr list`) e `gh issue list --state all`.

---

## 3. Inventário: capacidades do DEVAI 1.5.6 × uso no repositório

Legenda: **Usado** = em uso efetivo e correto; **Parcial** = usado com lacunas ou desvios; **Não usado** = disponível e sem uso; **Contornado** = substituído por artefato manual.

| Domínio / primitiva DEVAI                                      | O que oferece                                                            | Uso no detran                                                                                                                                                                                                                                                                                       | Situação                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `init bind --constitution` / pin                               | Cópia vendorizada, pin de SHA-256, materialização de política            | `.devai/pin/constitution.md` com sha `3f0e2ddc…2542` igual a `project.json`. `.devai/config/{domains,forbidden-actions,glob-guards,scorecard-na,subprocess-effects,thresholds}.json` byte-idênticos ao pacote. `authority-policy.json` materializado por `init bind` em 2026-09-22 (role architect) | **Usado**                                   |
| Drift de Constituição (Art. 36)                                | Pacote 1.5.6 traz Constituição **1.0.1**                                 | Pin mantido em 1.0.0 (ADR-0028 §1); `law/policy/mutation-strength.json` difere do pacote                                                                                                                                                                                                            | **Parcial** (NC-M6)                         |
| `doctor`                                                       | 13 verificações de postura                                               | Rodado no job `foundation` do CI (bloqueante); OK local                                                                                                                                                                                                                                             | **Usado**                                   |
| `evidence record` (generic)                                    | Registro append-only com hash e linha de prova por round                 | 57 registros `evidence.record.generic`, 106 linhas jsonl                                                                                                                                                                                                                                            | **Parcial** (49 linhas sem âncora, NC-A2)   |
| `evidence verify --scope chain`                                | Verificação da cadeia                                                    | CI `evidence-gate` na cadeia governada; a cadeia legada **não** é verificada no CI                                                                                                                                                                                                                  | **Parcial**                                 |
| `evidence verify --scope local`, `collect`, `redact`, `render` | Manifesto local, coleta, redação, visões                                 | —                                                                                                                                                                                                                                                                                                   | **Não usado**                               |
| `audit observe`                                                | Inventário, scorecard, assessment e backlog por SHA exato                | 32 registros `audit.observe`; 45 diretórios versionados (35 MB)                                                                                                                                                                                                                                     | **Parcial** (conteúdo vazio, NC-A3)         |
| `audit scorecard`                                              | Scorecard determinístico sem persistência                                | —                                                                                                                                                                                                                                                                                                   | **Não usado**                               |
| `sense run/record/inventory/migrate`                           | Sensores normalizados (type_check, lint, test …) e `SensorReading`       | Nenhum; gates por `pnpm check` e scripts `tools/verify-*`                                                                                                                                                                                                                                           | **Contornado**                              |
| `triage classify`                                              | Classificação de falhas antes da remediação (Art. 15)                    | —                                                                                                                                                                                                                                                                                                   | **Não usado**                               |
| `round plan` / `round run`                                     | Planejamento canônico e execução de tarefas registradas                  | `plan.md` e `prompts/` manuais; tarefas **não** registradas em `.devai/state/tasks`                                                                                                                                                                                                                 | **Contornado**                              |
| `round status` / `round assess`                                | Estado canônico                                                          | Rounds fechados aparecem "active" com 0 tarefas                                                                                                                                                                                                                                                     | **Parcial** (NC-A1)                         |
| `round gap create/resolve` (RGR, Art. 22)                      | Registro de lacunas de referência                                        | Lacunas vão para `open-decisions-*.md` e issues OD-                                                                                                                                                                                                                                                 | **Contornado**                              |
| `round close --input`                                          | Emite phase-closure `PC-nnnn`                                            | 14 PCs válidos (`record/proofs/compliance/closures/`)                                                                                                                                                                                                                                               | **Usado** (com decisões placeholder, NC-A1) |
| `round seal`                                                   | `close-state.jsonl`: fecha o ciclo (exige `record.md`, ledger, decisões) | Nunca executado; pré-condições inexistentes                                                                                                                                                                                                                                                         | **Não usado** (NC-A1)                       |
| `round close --post-merge-receipt`                             | Auditor pós-merge automático (Art. 34)                                   | —                                                                                                                                                                                                                                                                                                   | **Não usado**                               |
| `round tracking` (github-issues)                               | Projeção de governança em issues                                         | `governance_tracking` ausente; 27 issues criadas à mão                                                                                                                                                                                                                                              | **Não usado**                               |
| `check --suite` / `--rc` / task ledger                         | Ledger de tarefas content-addressed                                      | `test-tasks.json` + `tools/ci/prepare-local-rc.mjs` (`devai check --rc --run --as-role inspector --write`)                                                                                                                                                                                          | **Usado** (só o nó `backend-kernel`)        |
| Attested local RC (ADR-CI-ECONOMY)                             | Tag protegida `devai-local-evidence/<tree>`, verificador fixado          | `ci.yml` + `devai-local-rc-verify.yml` (verificador 1.5.4 fixado por tarball e ref)                                                                                                                                                                                                                 | **Usado**                                   |
| `check --only ci-economy`                                      | Regras de economia de CI                                                 | Não está no CI; REVIEW (2 avisos)                                                                                                                                                                                                                                                                   | **Não usado**                               |
| `check --only forbidden-actions`                               | Histórico contra ações proibidas + recibos                               | Não está no CI; **FAIL** (11 achados, 0 recibos)                                                                                                                                                                                                                                                    | **Não usado**                               |
| `check --only glob-guards`                                     | Guardas de população                                                     | Não está no CI; **FAIL** (`law/schemas/*.schema.json` 0/35)                                                                                                                                                                                                                                         | **Não usado**                               |
| `check --only adrs`                                            | Supersessão e validação de ADRs                                          | Não está no CI; **FAIL** (`law/policy/adr-validation.json` ausente, 0 ADRs lidos)                                                                                                                                                                                                                   | **Não usado**                               |
| `check --only invariants/trace/test-trace/glossary/journeys`   | Setpoints (Art. 11), trace (Art. 13)                                     | Passam vacuamente (0 arquivos)                                                                                                                                                                                                                                                                      | **Não usado**                               |
| `check --only pr-compliance`                                   | Trailer `Inv-Compliance:`                                                | 0/95 PRs com trailer; não está no CI                                                                                                                                                                                                                                                                | **Não usado**                               |
| `check --only mutation` / soft gate                            | Mutação e LLM-judge (Art. 18)                                            | `law/policy/mutation-strength.json` existe e não é consumido                                                                                                                                                                                                                                        | **Não usado**                               |
| `release *`                                                    | Ciclo de release certificado                                             | Sem release                                                                                                                                                                                                                                                                                         | N/A                                         |
| Esquema `task.schema.json` 2.0.0                               | Tarefas                                                                  | 260 JSON: **143 inválidos**                                                                                                                                                                                                                                                                         | **Parcial** (NC-M3)                         |
| Esquema `phase-closure`                                        | Closures                                                                 | 14/14 PC válidos; rascunhos `closure.json` corretamente sem `id`                                                                                                                                                                                                                                    | **Usado**                                   |
| Composição de prompts (Art. 37)                                | `prompt_composition_id` no executor da tarefa                            | `compositions.json` manual com ids `PC-<16hex>`, que colidem com o namespace de phase-closure                                                                                                                                                                                                       | **Contornado**                              |
| Autoridade por caminho (Art. 6)                                | Runtime recusa escrita fora de autoridade; adapter de host               | `authority_enforcement: cli-only`; sem hooks, sem `.claude/settings.json`                                                                                                                                                                                                                           | **Parcial** (NC-M4)                         |
| Papéis (Art. 7) / `--as-role`                                  | Sessão de autoridade                                                     | `--as-role` usado em `round close` e `check --rc`; PR template com papel (59/95 PRs)                                                                                                                                                                                                                | **Parcial**                                 |
| Recipes (`devai-round`, `devai-verify` …)                      | Skills para agentes                                                      | Substituídas por `docs/meta/agents/orchestra/*` e `.claude/agents/*`                                                                                                                                                                                                                                | **Contornado**                              |

Resumo da matriz: de cerca de 30 capacidades relevantes, **6 são usadas integralmente**, **8 parcialmente**, **10 não são usadas** e **5 são contornadas** por artefatos manuais.

---

## 4. Achados com evidência

### 4.1 Pin e integridade da Constituição: conforme

- `shasum -a 256 .devai/pin/constitution.md` dá `3f0e2ddc45d0f4102eda34776700d8da7a1e56aab30c6ab43cc6ee6dbe972542`, igual a `project.json.constitution.sha256`. `doctor` registra `constitution-binding ✓`.
- `law/constitution.md` e `.devai/constitution.md` são ponteiros. `CONSTITUTION.md` na raiz é o legado 0.3.0, rotulado como histórico em `law/constitution.md`.
- **Drift:** o pacote 1.5.6 traz `dist/law/constitution.md` **1.0.1**, sha `ff8c4f09…`. A diferença está no Art. 18: a mutação passa a ser "optional external hardening … must never execute in CI or gate". Pelo Art. 36 isso é propriedade pontuável de F5. ADR-0028 decidiu manter 1.0.0, mas foi escrita antes de o 1.0.1 ser avaliado.

### 4.2 Cadeia de evidência

- A cadeia governada `record/proofs/chain.json` é **valid**, head `035497d5…59a`, 89 registros: 57 `evidence.record.generic` e 32 `audit.observe`. A legada `.devai/state/evidence-chain.json` também é **valid**, head `891d04f3…dfda`, sem alterações desde `dfbe0a1b` (2026-08-31).
- Na história _first-parent_ de `main`, a cadeia é append-only: 63 transições, 0 violações de prefixo.
- **Linhas de prova sem âncora na cadeia** (sequências jsonl comparadas com as notas `proof_sequence` da cadeia):

  | Round  | Linhas jsonl | Âncoras na cadeia | Sem âncora   |
  | ------ | ------------ | ----------------- | ------------ |
  | R-0005 | 10           | 1–8, 10           | 9            |
  | R-0007 | 42           | 37, 40, 41, 42    | 1–36, 38, 39 |
  | R-0013 | 15           | 1, 2, 3, 11, 15   | 4–10, 12–14  |

- **Âncoras apagadas em merge:** o merge `9ac6dd55` ("merge: reconcile R-0012 before CTG-0003/0004 closure") resolveu `chain.json` à mão. A cadeia do pai `103d7310` tinha as âncoras R-0007 {37, 38, 39}; o resultado ficou com {37, 40}. Commits como `f1bae6de` ("re-record … on the merged chain") e `61dd29c2` ("reanchor R-0015") mostram que regravar é prática recorrente. Pelo Art. 6, `record/` é "machine only" e "a human edit under `record/` is an authority violation". Pelo Art. 41, "correction is a new appended record, never a change".
- O verificador não cruza as linhas jsonl com as âncoras, então a lacuna passa despercebida pelo gate do CI.
- **Registros sem papel próprio:** todos os 89 registros têm `actor_role: "harness"`. O papel humano fica só em `payload.role`, texto livre e inconsistente: em R-0007 aparecem `architect`, `Architect`, `architect-maestro`, `inspector`, `Inspector` e 15 sem papel. R-0001 e R-0002 não têm papel.
- **Caminhos locais absolutos** em `context.repo_root` (por exemplo `/Volumes/Thiamat II/stech/detran-worktrees/...`, `.claude/worktrees/...`): expõem o layout da estação e não são portáveis.
- `AGENTS.md` regra 4 afirma que as duas cadeias são "CI-verified". O CI (`ci.yml`, passo "Verify the DEVAI proof chain") verifica só a governada.

### 4.3 Rounds e closures

- `devai round status --round R-0015` responde `{"location":"active","tasks":{"count":0}}`. O mesmo vale para R-0003, R-0010 e R-0016. R-0001 dá `TASK_ROUND_INACTIVE`, porque não tem `AUTHORIZATION.md`.
- O código do DEVAI (`authorizationIsActive`) trata um round como ativo enquanto `AUTHORIZATION.md` contiver `status: active` + `GRANTED` e não existir `close-state.jsonl`. Todos os `AUTHORIZATION.md` seguem `status: active` / `GRANTED` (exemplo: `work/rounds/R-0015/AUTHORIZATION.md`).
- `round seal` exige:
  - `work/rounds/R-nnnn/record.md` válido contra `record-meta`;
  - decisões em `law/adr/<D>.md` ou `law/register/DECISIONS.md`;
  - `record/derived/indexes/rounds.md` contendo o PC.

  **Nenhum desses artefatos existe.** Na prática, nenhum round está fechado segundo o DEVAI.

- As 14 closures `PC-0001…PC-0014` são válidas contra o esquema. Todas trazem `declaring_decision: "D-1"` e `closing_decision: "D-2"`, identificadores que não correspondem a nenhuma decisão registrada; `grep` só os encontra nas próprias closures.
- Mapeamento PC → round: 0001→R-0003, 0002→R-0004, 0003→R-0005, 0004→R-0006, 0005→R-0008, 0006→R-0009, 0007→R-0014, 0008→R-0010, 0009→R-0011, 0010→R-0012, **0011→R-0007** (commit `6d970d3f`, com prefixo `docs(rait)` e não `chore(round)`), 0012→R-0016, 0013→R-0013, 0014→R-0015.
- O closure de R-0015 afirma que PR #107 e PR #116 foram integrados "only after all seven required checks passed". A proteção de `main` exige **5** contextos: `evidence-gate`, `foundation`, `senatran-mock`, `senatran-mock-tests` e `verified-local-rc`. `backend-kernel` e `boat-documents-real` não são obrigatórios.
- `work/rounds/README.md` lista R-0007…R-0016 como "planned", embora todos estejam fechados por PC. R-0002 só existe como `record/proofs/work/generic/R-0002.jsonl`, sem pasta.

### 4.4 Tarefas e esquemas

- `work/rounds/README.md` diz: "`tasks/TASK-nnnn.json` — tasks in the DEVAI `task.schema.json` (2.0.0)". A validação dá **117 OK / 143 FAIL** em 260 tarefas:

  | Erro                                                   | Ocorrências |
  | ------------------------------------------------------ | ----------- |
  | `target_invariants` fora do padrão `^INV-`             | 74          |
  | `db_isolation` fora de {database, cluster}             | 50          |
  | `coupled_task_group` fora do padrão                    | 31          |
  | `title` inválido                                       | 12          |
  | `coupled_pipeline_position` inválido                   | 10          |
  | `executor` incompleto                                  | 8           |
  | `upstream_task_id`, `iteration_trail.started_at`, `id` | 6 cada      |

  Rounds 100% inválidos: R-0003, R-0005, R-0006, R-0015 e R-0016, entre outros.

- `.devai/state/tasks/` não existe: o DEVAI não conhece nenhuma tarefa, e `round run`, `round gap` e o task ledger por round não podem operar.
- `target_invariants` cita `WF-RAIT…`, `RN-DASH…`, `ADR-0007`, `OD-D01`, `contract CTG-0001 §5.2` e até texto livre (`rait-deadline`).
- `docs/framework/schemas/` guarda 6 esquemas de domínio (teat, boat, portal), que não são esquemas DEVAI. `law/schemas/` está vazio, e o glob-guard `SCHEMAS_DIR` exige no mínimo 35.
- `.devai/config/*.json` valida contra os esquemas (project-config, forbidden-actions, glob-guards, authority-policy, subprocess-effects, scorecard-na).

### 4.5 Sensores, scorecard e auditoria

- As 45 observações em `.devai/state/audit-observations/<sha>/` (primeira em 2026-09-14, última `50626da5` em 2026-09-24) têm scorecard idêntico: `{"N/A": 2, "UNKNOWN": 43}`. O `assessment.json` diz literalmente: "0/45 cells passing … correctness sensors … aren't emitting SensorReadings yet".
- Em todas, `previous_observation_digest_sha256` é `null`: as observações não se encadeiam.
- `backlog.json` está vazio. O backlog real está em `docs/meta/knowledge-base/backlog.md` (Markdown) e em issues, o que contraria o Art. 35 (backlog como única fila) e o Art. 38 (JSON como canon).
- São 45 observações contra cerca de 116 merges. O Art. 34 prevê o Auditor "automatically after every merge … as a post-merge hook". Aqui a execução é manual e irregular, e o resultado é versionado no git (35 MB, com `inventory.json` de cerca de 37 mil linhas por observação).
- `.gitignore` justifica rastrear `evidence-chain.json` citando "Article 32 hash chain". Na Constituição 1.0.0, o Art. 32 é _Sensor adapter uniformity_; evidência é o **Art. 41**.

### 4.6 CI e gates

- `ci.yml` invoca o DEVAI **duas vezes**: `devai evidence verify --scope chain` (job `evidence-gate`) e `devai doctor` (job `foundation`). O desenho fail-closed está correto:
  - `foundation` falha se o gate não passou;
  - não há `paths`/`paths-ignore`;
  - mudanças em superfícies protegidas (`.github/*`, `.devai/config/*`, `law/policy/*`, `package.json`, `pnpm-lock.yaml`, `tools/ci/*`) forçam o fallback remoto.
- Os comentários de `ci.yml` ainda dizem "DETRAN now pins @aarusso-nyx/devai 1.4.5".
- `devai-local-rc-verify.yml` fixa o verificador em **1.5.4** (tarball e ref `v1.5.4`), enquanto o repositório usa 1.5.6. Isso é intencional segundo ADR-0028 ("promotes that corrected 1.5.4 verifier"), mas não está declarado em `project.json`.
- O check obrigatório `verified-local-rc` tem dois emissores com o mesmo app (github-actions, id 15368): o verificador atestado e o job de fallback `backend-kernel-full`. A proteção de branch, portanto, não distingue "atestado local" de "executado remotamente". É aceitável como política, mas o nome é enganoso.
- Checks canônicos ausentes do CI, com resultado da execução local somente-leitura:
  - `forbidden-actions`: **FAIL**, 11 achados na janela padrão. Quase todos são `FORBID-MUTATE-INVARIANTS` por `git add record/` nos próprios commits de evidência, mais `FORBID-CI-WITHOUT-ADR` no merge `666dd63e`. Não existe `law/policy/forbidden-action-authorizations.json`, logo há 0 recibos.
  - `glob-guards`: **FAIL**.
  - `adrs`: **FAIL**.
  - `ci-economy`: REVIEW (sem filtros de caminho, o que aqui é deliberado; Postgres em serviço).
  - `docs-governance`: REVIEW (o branch `gh-pages` não existe).
  - `pr-compliance`: nunca aplicado.
- Hooks: nenhum hook git ativo (`.git/hooks` só com amostras, sem `core.hooksPath`) e nenhum `.claude/settings.json`. Como `authority_enforcement.mode = "cli-only"`, nada impede edições fora de autoridade feitas por editores ou agentes. O Art. 6 exige um adapter de host declarado ou que essa fronteira seja reportada; o doctor aceita porque o modo está declarado.

### 4.7 Papéis (Art. 7/8) e separação (Art. 10)

- `AGENTS.md` (l. 50) e `CLAUDE.md` (l. 23) mandam declarar o papel "from Constitution Article 6". Na 1.0.0, o Art. 6 é a autoridade por caminho; os papéis estão no **Art. 7**. O template de PR repete "Constituição Art. 6".
- Commits: 0 de 642 trazem uma declaração de papel no corpo. PRs: 59 de 95 merged declaram papel pelo template.
- Desde 2026-09-14, **52 de 387 commits** não-merge misturam código F2 (`backend/`, `apps/`, `packages/`) com testes F3 (por exemplo `8656ea61`, `bff3a16d`, `3080f5b8`). O Art. 10 proíbe que um papel altere, na mesma iteração, a referência e o atuador. Parte disso é integração de CTG (tríade acoplada, Art. 24), mas sem registro de papel por commit não dá para verificar.
- As closures listam vários papéis por batch (R-0015 CTG-0002: Architect, Inspector, Engineer, Auditor). Todos os commits têm o mesmo autor humano, e a separação vem só de declaração em prompt, sem sessão de autoridade (`--authority-session`).

### 4.8 Segunda camada de governança ("orquestra")

- `docs/meta/agents/orchestra/*` (maestro, worker, reviewer, model-ladder, waves), `tools/orchestra/{bridge,worker}.sh` e, por round, `AUTHORIZATION.md`, `budget.json`, `compositions.json`, `reviews/*.json`, `reports/`, `route-manifest.md` e `env-detran-rN.sh` formam um processo paralelo. Ele define autorização, composição de prompt, revisão cross-family e orçamento, e o DEVAI não modela nem verifica nenhuma dessas etapas.
- A ADR-0022, que o institui, está **"Proposed"** desde 2026-09-14, e ainda assim governou 14 rounds.
- Os ids `PC-<16hex>` de `compositions.json` colidem com o namespace `PC-nnnn` de phase-closure.
- Isso fica perto do "second governance framework" que `AGENTS.md` e `CLAUDE.md` proíbem. A orquestra se declara subordinada ao DEVAI, mas substitui primitivas que ele já oferece: `round plan/run`, `round gap`, `triage`, `prompt_composition_id` do executor e `round tracking`.

### 4.9 Registro de decisões e ADRs

- Há dois registros. `law/adr/` (território do DEVAI) tem **1** ADR: `ADR-0001-devai-1.4.5-stynx-1.1.1-adoption.md`, cujo número colide com `docs/meta/adr/ADR-0001-domain-first-layout.md`. `docs/meta/adr/` tem 36, com **números duplicados**: 0006 (×2), 0024 (×2) e 0028 (×2). `project.json` não declara `docs.ia.path_overrides` para que o DEVAI enxergue `docs/meta/adr`.
- `DESIGN-DECISIONS.md` indexa até a ADR-0022, sem 0023…0033. Marca a ADR-0021 como "Proposed", mas o arquivo diz "Accepted on 2026-09-14".
- ADR-0028 (arquivo `…devai-1-5-2…`) foi reescrita no lugar em 1.5.2 → 1.5.3 → 1.5.4 → 1.5.5 → 1.5.6 (commits `6f597ae5`, `1f323d56`, `17d54734`, `92d0b338`). Uma ADR aceita deveria ser superada, e não emendada in-place.
- `product/` (autoridade Owner pelo Art. 6) está vazio: a especificação de negócio mora em `docs/framework/product/`, que é caminho de autoridade Architect.

### 4.10 GitHub Issues

- 27 issues no total (19 abertas), das quais 11 perguntas OD e 8 frentes de produção. Não há vínculo com o DEVAI: `governance_tracking` está ausente e nenhum round passou por `round tracking enable`. As issues são criadas e fechadas à mão, por exemplo #96–#126, abertas no fechamento de R-0013/R-0015/R-0016.

---

## 5. Não-conformidades por severidade

### Alta

| ID        | Não-conformidade                                                                                                                                                                                                                                                          | Evidência                                                                                                                                                       | Artigos                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **NC-A1** | O ciclo de vida dos rounds não é fechado formalmente. 14 rounds seguem "active" no DEVAI, com `AUTHORIZATION.md` `status: active`/`GRANTED` e sem `close-state.jsonl`, `record.md`, ledger ou registro de decisões. As closures citam decisões inexistentes (`D-1`/`D-2`) | `devai round status --round R-0015` → `location: active`; `record/proofs/compliance/closures/PC-*.json`; ausência de `law/register/`, `record/derived/indexes/` | 3, 35, 41                      |
| **NC-A2** | A cadeia de evidência está incompleta: 49/106 linhas de prova sem âncora, âncoras descartadas em merge manual e prática de "re-record/reanchor". O verificador não detecta                                                                                                | R-0007 {1–36, 38, 39}, R-0013 {4–10, 12–14}, R-0005 {9}; merge `9ac6dd55` (37, 38, 39 → 37, 40)                                                                 | 6 (`record/` machine-only), 41 |
| **NC-A3** | Sensores e scorecard inoperantes: 45/45 observações com 0 PASS e 43 UNKNOWN. Nenhum `SensorReading`; a prontidão nunca é estabelecida pelo DEVAI, e os gates reais ficam fora do sistema de sensores                                                                      | `.devai/state/audit-observations/*/scorecard.json`                                                                                                              | 29, 32, 33, 39                 |

### Média

| ID        | Não-conformidade                                                                                                                                                                                                              | Evidência                                                                      | Artigos                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------- |
| **NC-M1** | Invariantes (setpoints) não existem. `target_invariants` não usa `INV-*`, não há trailer `Inv-Compliance`, e `check --only invariants` passa sobre um conjunto vazio                                                          | `law/invariants/` vazio; 74 violações de padrão; 0/95 PRs                      | 11, 13                                  |
| **NC-M2** | O substrato `law/` está vazio e as ADRs estão fora do caminho canônico. Há números de ADR duplicados, índice desatualizado e `product/` vazio                                                                                 | `glob-guards` FAIL (0/35), `adrs` FAIL, ADR-0006/0024/0028 ×2, ADR-0001 ×2     | 6, 9                                    |
| **NC-M3** | 143/260 tarefas inválidas contra `task.schema.json` 2.0.0 apesar da afirmação de conformidade; nenhuma tarefa registrada no DEVAI                                                                                             | validação ajv; ausência de `.devai/state/tasks`                                | 35, 38                                  |
| **NC-M4** | Autoridade e papéis não são aplicados mecanicamente: `cli-only`, sem hooks; 52 commits misturam F2 e F3; papel em texto livre nas provas; `actor_role` sempre `harness`; o artigo dos papéis é citado com o número errado     | `project.json`, `git log`, `payload.role`                                      | 6, 7, 10                                |
| **NC-M5** | A orquestra funciona como camada de governança paralela, com ADR-0022 ainda _Proposed_. `compositions.json`, `budget.json`, `AUTHORIZATION.md` e `reviews` são manuais e substituem primitivas DEVAI; há colisão de ids `PC-` | `docs/meta/agents/orchestra/`, `work/rounds/*/compositions.json`               | 35, 37; AGENTS.md "no second framework" |
| **NC-M6** | Drift de Constituição sem decisão explícita: o pacote traz 1.0.1 e o pin segue em 1.0.0, com a política de mutação divergente                                                                                                 | `dist/law/constitution.md` 1.0.1; `law/policy/mutation-strength.json` ≠ pacote | 36, 40                                  |
| **NC-M7** | O CI usa 2 de cerca de 25 checks canônicos. `forbidden-actions`, `glob-guards` e `adrs` falhariam; a cadeia legada não é verificada no CI, contrariando `AGENTS.md`                                                           | execução local no clone                                                        | 17                                      |
| **NC-M8** | Auditoria sem cadência pós-merge e sem encadeamento (`previous_observation_digest_sha256: null`), com 35 MB de estado derivado versionado                                                                                     | 45 observações vs. cerca de 116 merges                                         | 33, 34                                  |

### Baixa

| ID        | Não-conformidade                                                                                                                                                                                                                                                 | Evidência                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **NC-B1** | Drift documental de versão: `CLAUDE.md` e comentários de `ci.yml` citam 1.4.5; `work/rounds/README.md` diz "DEVAI 1.4.5"; os READMEs gerados dizem "Generated by DEVAI v1.4.5"; ADR-0015 cita 1.4.5; o nome do arquivo da ADR-0028 diz 1-5-2 e o conteúdo, 1.5.6 | `grep`                                                                           |
| **NC-B2** | Referências a artigos erradas: "Article 32 hash chain" (`.gitignore`), quando o correto é o Art. 41; "Article 6 role", quando é o Art. 7                                                                                                                         | `.gitignore`, `AGENTS.md:50`, `CLAUDE.md:23`, `.github/pull_request_template.md` |
| **NC-B3** | Estado dos rounds desatualizado no README (R-0007…R-0016 "planned"); R-0002 sem pasta; R-0001 sem autorização nem closure; PC-0011 fechado com commit `docs(rait)`                                                                                               | `work/rounds/README.md`                                                          |
| **NC-B4** | Caminhos absolutos da estação de trabalho gravados na cadeia (`/Volumes/Thiamat II/...`)                                                                                                                                                                         | `record/proofs/chain.json`                                                       |
| **NC-B5** | O closure de R-0015 afirma "seven required checks", mas a proteção exige 5; o check `verified-local-rc` tem dois emissores (atestado e fallback) sob o mesmo app                                                                                                 | `gh api …/protection`; `ci.yml` l. 231–252                                       |
| **NC-B6** | ADR-0028 emendada in-place a cada versão, em vez de ser superada                                                                                                                                                                                                 | `git log -- docs/meta/adr/ADR-0028-*`                                            |
| **NC-B7** | `docs/work/devai` liberado no `.gitignore` mas inexistente; `work/audit/` só com o placeholder, ou seja, o Auditor nunca depositou relatórios no caminho designado                                                                                               | `.gitignore`, `work/audit/README.md`                                             |

---

## 6. Recomendações

Em ordem de prioridade. Onde cabe, o papel responsável vem entre colchetes.

1. **Fechar formalmente os rounds** [Architect, com decisão do Owner]:
   - criar `law/register/DECISIONS.md` com decisões reais de abertura e fechamento por round, trocando os placeholders `D-1`/`D-2`;
   - gerar `record.md` por round com `devai round plan` e o esquema `record-meta`, e o ledger `record/derived/indexes/rounds.md` pelo subsistema de regeneração, sem edição manual;
   - executar `devai round seal --round R-nnnn` em R-0003…R-0016;
   - passar os `AUTHORIZATION.md` encerrados para `status: closed`;
   - daqui em diante, fazer de `round seal` o último passo obrigatório do método da orquestra.
2. **Reparar e blindar a cadeia de evidência** [Architect]:
   - registrar, com `devai evidence record`, uma entrada de correção append-only que declare as 49 linhas sem âncora (R-0005/9, R-0007/1–36, 38, 39, R-0013/4–10, 12–14) e a perda no merge `9ac6dd55`;
   - proibir a resolução manual de conflitos em `record/proofs/chain.json`: rebase sobre `main` e regravação pelo verbo, com um custom merge driver que falhe;
   - pedir upstream (ou implementar como check local somente-leitura no CI) a verificação cruzada jsonl ↔ âncoras.
3. **Ligar os sensores** [Inspector]:
   - envolver `pnpm check`, `typecheck`, `lint` e as suítes em `devai sense run --kind …`, com emissão e persistência de `SensorReading` por `devai sense record`;
   - só então o scorecard sai de UNKNOWN;
   - usar `devai triage classify` antes de remediar falhas.
4. **Criar os invariantes** [Architect]:
   - migrar as regras normativas centrais (RLS, fronteira SENATRAN, ciclo de vida WF-INF-003, prazos) para `law/invariants/INV-<DOM>-NNN`;
   - fazer `target_invariants` referenciá-los;
   - exigir `Inv-Compliance:` no template de PR, com `devai check --only pr-compliance` no CI.
5. **Pôr o CI no nível dos checks canônicos** [Architect, que tem a autoridade sobre CI]:
   - adicionar ao `evidence-gate`: `devai check --only forbidden-actions --since-ref <base>`, com `law/policy/forbidden-action-authorizations.json` declarando os recibos dos commits de evidência; `--only glob-guards`; `--only adrs`, depois de criar `law/policy/adr-validation.json`; `--only ci-economy`; e `evidence verify` também sobre a cadeia legada, ou então corrigir `AGENTS.md`;
   - fazer isso numa ADR única, para não disparar `FORBID-CI-WITHOUT-ADR`.
6. **Unificar o registro de ADRs** [Architect]:
   - declarar `docs.ia.path_overrides` ou mover as ADRs para `law/adr`;
   - renumerar os duplicados (0006, 0024, 0028) com ADR de supersessão;
   - regenerar `DESIGN-DECISIONS.md` a partir do diretório;
   - aceitar formalmente ou rejeitar a ADR-0022.
7. **Reduzir a camada paralela** [Architect]:
   - registrar as tarefas no DEVAI (`.devai/state/tasks` pelo spawn do round) e corrigir o gerador de `task.template.json` para produzir tarefas válidas (enums `db_isolation`, `coupled_task_group`, `executor`);
   - levar `compositions.json` para `executor.prompt_composition_id` e renomear o prefixo para eliminar a colisão com `PC-nnnn`;
   - trocar as listas OD- em Markdown por `devai round gap create` (RGR) e ativar `round tracking` para projetá-las nas issues.
8. **Aplicar a autoridade** [Architect]:
   - declarar `authority_enforcement: host-integrated` com adapter para Claude Code/Codex (hooks PreToolUse bloqueando escrita em `record/`, `.devai/`, `law/` fora do papel);
   - gravar o papel humano canônico (`--as-role` / `--authority-session`) nas evidências, e não em `payload.role` livre;
   - corrigir as referências a artigos (papéis = Art. 7, evidência = Art. 41).
9. **Automatizar a auditoria pós-merge** [Auditor e Architect]:
   - usar `round close --post-merge-receipt` ou um job pós-merge com `devai audit observe`;
   - avaliar se `.devai/state/audit-observations/` precisa mesmo ser versionado (35 MB), ou se basta a âncora na cadeia com o artefato publicado como evidência externa.
10. **Decidir sobre a Constituição 1.0.1** [Architect com o Owner]: escrever uma ADR que aceite (`devai init bind --constitution --write`) ou recuse o 1.0.1, tratando a mudança do Art. 18 (mutação fora de gate) e o destino de `law/policy/mutation-strength.json`.
11. **Higiene documental** [Architect]: atualizar `CLAUDE.md`, os comentários de `ci.yml`, `work/rounds/README.md` e os READMEs "Generated by v1.4.5" (reexecutando `init apply`); corrigir o texto "seven required checks" nas closures; remover os caminhos absolutos das próximas evidências, rodando a partir de um `repo_root` relativo, se o CLI permitir.

### Oportunidades de eficiência

- Trocar `pnpm check`, uma cadeia serial de mais de 45 comandos, pelo task ledger content-addressed (`devai check --affected --base <sha> --run`), que reaproveita resultados por hash. O `test-tasks.json` hoje declara um só nó (`backend-kernel`).
- Reduzir o custo dos rounds: R-0007 sozinho soma 18 MB em `work/rounds/` (revisões e inputs). Um `evidence render` a partir dos registros canônicos substituiria boa parte dos relatórios manuais.
- A rota de attested local RC já funciona (4 tags remotas). Vale estender `local_only_nodes` às suítes caras de frontend.

---

_Execução somente-leitura: `git status --porcelain` ficou idêntico antes e depois das verificações. Os checks `devai check --only …` rodaram num clone descartável no scratchpad da sessão. Nenhum arquivo versionado foi alterado._
