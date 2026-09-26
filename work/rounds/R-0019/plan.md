# R-0019 — frente `law-corpus` (ação 2 da C-0002: corpus de `law/` e `product/` nos esquemas DEVAI)

**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner.** Planejada em 2026-09-26
pelo Architect a partir de `work/campaigns/C-0002-consolidacao.md` (§2 fase A, §4, §5) e da inspeção
somente leitura de 2026-09-25 (relatório (e), `work/campaigns/C-0002-inspecao-2026-09-25/e-devai.md`, versionado com a campanha; os
fatos usados estão transcritos abaixo). Maestro **Sol 6** (Codex CLI); reviewer **Opus 5.5** (Claude
Code) pela ponte `tools/orchestra/bridge.sh claude`. Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/law-corpus`, branch `orchestra/law-corpus`.
**Concorrência:** fase A, em paralelo a R-0017 (`local-stack`, lock `tools/` e `stack:*` de
`package.json`) e R-0018 (`index-state`, lock `docs/meta`, índices, `.gitignore`, **`law/adr/**`** e a
política de ADR). Nenhum upstream para abrir nem para mesclar. Locks partilhados: `package.json`
(esta rodada acrescenta `verify:law-corpus`/`law:test` e os liga a `pnpm check`; R-0017 acrescenta
`stack:*`) e `.prettierignore` (R-0017 e R-0018) → integrar `origin/main` por merge e reconciliar no mesmo commit;
seção da rodada em `docs/meta/knowledge-base/open-decisions-rait.md` (R-0018 também escreve) → idem.
**Fora do lock desta rodada:** `law/adr/**`, `law/policy/adr-validation.json` (R-0018/R-0020),
`law/register/**`, `law/policy/forbidden-action-authorizations.json`, `law/policy/sensor-notes/**`,
`.devai/config/project.json`, CI (R-0020). R-0020 abre só depois do merge desta.
**Janelas previstas:** 2.

## Linha de base medida (2026-09-26, `a92ef731`, clone descartável, `devai` 1.5.6)

| Membro (`devai check --only …`) / sensor      | Resultado                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------ |
| `glob-guards`                                 | **FAIL** — `SCHEMAS_DIR` `law/schemas/*.schema.json` 0/35                      |
| `invariant-strategies`                        | **FAIL** — `STRATEGY_POPULATION_ZERO`                                          |
| `test-trace`                                  | **FAIL** — `law/trace.json` ausente                                            |
| `invariants`, `glossary`, `journeys`, `trace` | pass **vazio** (`files_scanned: 0`)                                            |
| `schemas`                                     | pass (5 bindings de `.devai/config`; `law/policy/adopter-policy.json` ausente) |
| `sense run spec_depth` (read)                 | `review` — `SPEC_DEPTH_PARTIAL`: 0 invariantes, 36 ADRs, 0 casos de uso        |
| `audit scorecard`                             | 45 células: 0 PASS / 43 UNKNOWN / 2 N/A                                        |

Fatos de runtime que definem a forma do corpus (lidos em
`node_modules/@aarusso-nyx/devai/dist/runtime/index/{schemas,release-host.js}`):

- **Invariantes:** um arquivo `law/invariants/INV-<DOM>-NNN.json` por invariante, diretório plano,
  nome = id; id `^INV-[A-Z]+-[0-9]{3}$`; `domain` deve estar na taxonomia resolvida
  (`.devai/config/domains.json`: core `AUTH SEC PERF DATA API INFRA UI CORE`, framework
  `DEVAI HARNESS`, **client vazio**); `authority_docs.docs[].anchor` precisa ser o slug de um
  **cabeçalho Markdown** existente no `doc` (as fichas RN-* não têm cabeçalhos — só frontmatter e
  negrito); `invariant-strategies` exige ≥ 1 invariante `status: active`, `lifecycle` supported,
  severidade `constitutional|hard-fail|gate`, com `verification.strategy.primary`.
- **Trace:** `law/trace.json` (`trace.schema.json`) com **toda** invariante presente; cada
  `tests[].path` e cada `test_corpus[].path` deve ser arquivo `*.test|spec.(ts|mjs)` existente.
  `test-trace` descobre só `packages/**/tests/*.test.ts` e `tests/**` (hoje 0 arquivos), que então
  exigiriam o marcador `// Invariants: INV-…`.
- **Glossário:** `law/glossary/GE-NNN.json` (`glossary-entry`), termo único sem distinção de caixa,
  `related_invariants` resolvidos. **Jornadas:** `product/journeys/JNY-NNN.json` (`journey`),
  `related_invariants` e `acceptance_criteria[].measurable_via` resolvidos no catálogo INV.
  **Casos de uso:** `product/use-cases/*.json` (`use-cases.schema.json`: `roles` ≥ 1, `cases` ≥ 1),
  lidos por `spec_depth`, `inventory_coverage` e `spec_performance_targets`.
- **Domínios de cliente:** `law/policy/adopter-policy.json` (`adopter-policy.schema.json`,
  `domains.client`) ligado por `devai init bind --adopter-policy <path>` (grava
  `.devai/config/adopter-policy-binding.json`); nada em `.devai/config/*` é editado à mão.
- **`glob-guards`:** `SCHEMAS_DIR` exige ≥ 35 `law/schemas/*.schema.json`; a política de ADR v2
  (R-0018) fixa `record_schema: law/schemas/adr-v2.schema.json`. 58 dos 89 esquemas do pacote não
  estão no estilo prettier → cópia byte-idêntica exige entrada em `.prettierignore`.
- **Autoria por caminho (`forbidden-actions`, lido em R-0020):** commit que toca `law/` só passa com
  autor `DEVAI Architect`, `product/` com `DEVAI Owner`, ou com recibo do Owner por commit em
  `law/policy/forbidden-action-authorizations.json`. A convenção é decidida em R-0020 (OD); esta
  rodada **segrega commits por autoridade de caminho** para que qualquer das duas saídas funcione.

## Metas

1. **Invariantes** (`law/invariants/`, Architect): catálogo `INV-<DOM>-NNN.json` + `VERSION`,
   destilado — não copiado — das regras normativas centrais já decididas: fronteira SENATRAN
   (ADR-0003, `verify:senatran-boundary`), RLS/tenancy (`verify:rls-ddl`, `backend:rls-smoke`),
   matriz papel × ação (`backend/domains/shared/src/policy.ts` `DETRAN_POLICY_MATRIX`,
   `roles.ts`), ciclos de vida (`WF-INF-003`, `verify:lifecycle-vocabulary`), prazos
   (`RN-RAIT-005`), camadas do DASHBOARD (`RN-DASH-170/171`), idempotência/concorrência de comando.
   `statement` curto em CNL (MUST/MUST NOT) + `provenance` com os ids RN/WF/UC/ADR/OD de origem;
   `authority_docs` só com âncoras de cabeçalho verificadas; nenhum valor normativo novo
   (`source_pending` ou OD). **Piso:** ≥ 1 invariante `active` de severidade `gate`+ ligada a teste
   existente em cada domínio de cliente adotado e em `SEC`, `AUTH`, `DATA`; o resto pode nascer
   `draft`. O catálogo fechado (ids, severidade, testes) é fixado em `contracts/CTG-0001.md`.
2. **Trace** (`law/trace.json`): cada INV → testes `.spec.ts` existentes (ex.:
   `backend/app/tests/e2e/policy-routes.e2e.spec.ts`, `backend/domains/shared/src/policy.spec.ts`);
   `test_corpus` com digest de asserções. É a entrada dos sensores de R-0020 (`trace_resolution`,
   `test_invariant_alignment`, `harness_invariant_alignment`), do trailer `Inv-Compliance:`
   (`pr-compliance`) e de `target_invariants` das tarefas.
3. **Política** (`law/policy/`): `adopter-policy.json` só com `domains.client` (sem tocar
   `glob_guards`, `thresholds`, `scorecard_na`: nunca enfraquecer), ligado por `init bind`; `README.md`
   como índice das políticas vigentes (RC local, `mutation-strength.json`) e das fontes normativas de
   código (`policy.ts`, DDL RLS, fronteira SENATRAN) **por referência** — a matriz não é duplicada
   (R-0023 a converte em dados).
4. **Esquemas** (`law/schemas/`): cópia byte-idêntica do roster de
   `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/*.schema.json` da versão instalada
   (M3), com `law/schemas/manifest.json` (versão, sha256 por arquivo) e entrada em
   `.prettierignore`; `README.md` indexa os esquemas de domínio que **ficam** em
   `docs/framework/schemas/` (não movidos).
5. **Glossário** (`law/glossary/`, autoridade conjunta Owner+Architect — **proposta para aceite do
   Owner**): `GE-NNN.json` destilando `docs/framework/glossary/domain.md` (termo, definição curta,
   categoria, `provenance` com a linha/fonte REF-*), mais as siglas dos seis apps; expansões em
   conflito (BOAT, inspeção (g) C-20) e termos prometidos sem fonte (RENAVAM, CDT) viram OD, nunca
   texto inventado. `domain.md` permanece a vista humana; o gate prova paridade.
6. **Produto** (`product/`, autoridade Owner — **proposta para aceite do Owner**, `status: draft`):
   `journeys/JNY-NNN.json` (um por `JRN-*`, 40, `provenance` = id e caminho da JRN);
   `use-cases/<app>.json` (seis arquivos, 110 `UC-*` por id, título e papéis); `README.md` e
   `specification.md` como índice dos seis `APP.md` e de `docs/framework/blueprints/` (blueprints
   não são movidos).
7. **Gate novo** `verify:law-corpus` (`tools/law/verify.mjs`, testes `tools/law/tests/*.test.mjs`,
   script `law:test`), ligado a `pnpm check`: (a) `law/schemas` byte-idêntico ao pacote instalado e
   ao `manifest.json`; (b) todo id em `provenance`/`authority_docs` resolve a arquivo existente
   (RN/WF/UC/JRN/APP/ADR) ou a OD registrada; (c) paridade GE ↔ `domain.md` (termo a termo);
   (d) bijeção JRN-* ↔ JNY-* e UC-* ↔ `product/use-cases`; (e) nenhum README de `law/*` ou
   `product/` diz "intentionally empty"/"Generated by DEVAI v1.4.5" com conteúdo presente.
8. **Documentação:** READMEs de `law/{,invariants,policy,schemas,glossary}` e `product/`
   reescritos (autoridade pelo **Art. 6**, conteúdo, fonte, gate); ODs `OD-R19-nnn` na seção da rodada
   do registro canônico no mesmo PR; `backlog.md`; linha de `waves.md` §Histórico.

## Tarefas

| Tarefa    | Papel                                 | Perfil              | Modelo/esforço | Lock                                                      | Depende de                 | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------- | ------------------------------------- | ------------------- | -------------- | --------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect                             | architect-blueprint | Terra / alto   | `MOD-r19-contract-law`                                    | —                          | `contracts/CTG-0001.md`: domínios de cliente (M2); catálogo fechado de invariantes (id, domínio, tipo, severidade, status, statement CNL, `authority_docs` doc+âncora verificada por `grep '^#'`, `provenance`, `verification` e `strategy`, testes existentes); plano de `trace.json`; roster de `law/schemas` (M3); conteúdo de `adopter-policy.json`; regras (a)(b)(e) do gate; critérios C-01-nn; ODs `OD-R19-nnn` |
| TASK-0002 | Architect (transcr.)                  | transcriber-docs    | Luna / baixo   | `MOD-law-invariants`, `MOD-law-trace`                     | TASK-0001                  | `law/invariants/INV-*.json`, `law/invariants/VERSION`, `law/trace.json`, `law/invariants/README.md` — transcrição exata do contrato                                                                                                                                                                                                                                                                                    |
| TASK-0003 | Architect (transcr.)                  | transcriber-docs    | Luna / baixo   | `MOD-law-schemas`, `MOD-law-policy`, `MOD-prettierignore` | TASK-0001                  | `law/schemas/*.schema.json` (cópia `cp`, sem edição) + `manifest.json` + `README.md`; `law/policy/adopter-policy.json` + `README.md`; `law/README.md`; linha comentada em `.prettierignore`                                                                                                                                                                                                                            |
| TASK-0004 | Inspector                             | inspector-tests     | Luna / médio   | `MOD-law-gate-tests`                                      | TASK-0002, TASK-0003       | `tools/law/tests/verify.test.mjs` + fixtures: (a)(b)(e) positivos e negativos (byte alterado, sha divergente, âncora/id inexistente, README "intentionally empty")                                                                                                                                                                                                                                                     |
| TASK-0005 | Engineer                              | engineer-backend    | Terra / médio  | `MOD-law-gate`, `MOD-root-package-json`                   | TASK-0004 + checkpoint (a) | `tools/law/verify.mjs` (a)(b)(e); scripts `verify:law-corpus` e `law:test` em `package.json`, ligados a `pnpm check`; testes verdes                                                                                                                                                                                                                                                                                    |
| TASK-0006 | Architect                             | architect-blueprint | Terra / alto   | `MOD-r19-contract-product`                                | merge CTG-0001             | `contracts/CTG-0002.md`: catálogo GE (termo, definição destilada, categoria, `provenance`, `related_invariants`); mapa JRN → JNY (40) com passos, pré/pós-condições e AC extraídos da JRN; mapa UC → `use-cases/<app>.json` (110); índice `product/`; regras (c)(d) do gate; ODs para o Owner                                                                                                                          |
| TASK-0007 | Architect (transcr.)                  | transcriber-docs    | Luna / baixo   | `MOD-law-glossary`                                        | TASK-0006                  | `law/glossary/GE-*.json` + `README.md` (proposta conjunta, `status: draft`)                                                                                                                                                                                                                                                                                                                                            |
| TASK-0008 | Architect (transcr.) — proposta Owner | transcriber-docs    | Luna / baixo   | `MOD-product`                                             | TASK-0006                  | `product/journeys/JNY-*.json`, `product/use-cases/*.json`, `product/README.md`, `product/specification.md` (`status: draft`)                                                                                                                                                                                                                                                                                           |
| TASK-0009 | Inspector                             | inspector-tests     | Luna / médio   | `MOD-law-gate-tests`                                      | TASK-0007, TASK-0008       | testes de (c)(d): termo sem GE, GE sem termo, JRN sem JNY, UC órfão                                                                                                                                                                                                                                                                                                                                                    |
| TASK-0010 | Engineer                              | engineer-backend    | Terra / médio  | `MOD-law-gate`                                            | TASK-0009                  | `tools/law/verify.mjs` (c)(d); testes verdes                                                                                                                                                                                                                                                                                                                                                                           |
| TASK-0011 | Architect (transcr.)                  | transcriber-docs    | Luna / baixo   | `MOD-docs`                                                | TASK-0010                  | `docs/meta/knowledge-base/backlog.md`; `docs/meta/agents/orchestra/waves.md` §Histórico e `work/rounds/README.md` (só a linha R-0019)                                                                                                                                                                                                                                                                                  |

CTG-0001 (`law/` sem glossário) = 0001 → 0002 ∥ 0003 → 0004 → 0005; CTG-0002 (`law/glossary` +
`product/`, proposta ao Owner) = 0006 → 0007 ∥ 0008 → 0009 → 0010, nasce após o merge do CTG-0001
(os INV citados em `related_invariants` precisam existir); CTG-0003 = 0011. **Um PR por CTG.**

**Checkpoints (maestro, Engineer):** (a) após TASK-0003: `pnpm exec devai init bind --adopter-policy
law/policy/adopter-policy.json --repo-root . --as-role architect --write --format human`, depois
`devai doctor` e `devai check --only schemas`; o arquivo gerado
`.devai/config/adopter-policy-binding.json` e a taxonomia materializada entram num commit
`chore(devai)` próprio, nunca editados à mão. (b) após TASK-0002 e TASK-0008: os membros `devai check`
dos §Critérios, antes de liberar o Inspector. (c) após cada `git add`: `find <dir> -type f` ×
`git ls-files <dir>` (lição R-0016).

**Segregação de commits (M5):** CTG-0001 = commits só com `law/**` (sem `law/glossary`); um commit
à parte para `tools/law/**`, `package.json`, `.prettierignore`; um `chore(devai)` para o binding.
CTG-0002 = um commit só `product/**`, um só `law/glossary/**`, um para o gate. Nenhum commit mistura
`law/`, `product/`, `record/` e código.

## Critérios de aceitação (comandos → resultado)

Membros `devai check --only <m>` rodam em `pnpm exec devai check --only <m> --repo-root . --format json`;
`git status --porcelain` idêntico antes e depois (senão, rodar em clone descartável e registrar).

- `--only invariants` → `ok: true`, `files_scanned` = nº do catálogo de `contracts/CTG-0001.md`
  (> 0), sem `errors` (âncoras e domínios resolvidos).
- `--only invariant-strategies` → `status: pass`, `population` ≥ piso da Meta 1.
- `--only trace` → `ok: true`, `trace_invariants_count` = `files_scanned` de `invariants`.
- `--only test-trace` → `ok: true`.
- `--only glob-guards` → `ok: true` (`SCHEMAS_DIR` ≥ 35).
- `--only schemas` → `ok: true` com `law/policy/adopter-policy.json` em `checked`.
- `--only glossary` → `ok: true`, `files_scanned` = nº de GE do contrato (CTG-0002).
- `--only journeys` → `ok: true`, `files_scanned` = 40 (CTG-0002).
- `pnpm exec devai doctor --repo-root . --format human` → todos `[✓]` após o binding.
- `pnpm exec devai sense run spec_depth --repo-root . --format json` → `invariant_count` > 0 e
  `use_case_count` > 0 (CTG-0002); o status é registrado, não é gate desta rodada.
- `pnpm verify:law-corpus` → OK (regras (a)(b)(e) no CTG-0001; (a)–(e) no CTG-0002);
  `pnpm law:test` → verde.
- `pnpm format:check`, `pnpm docs:kb:check`, `pnpm docs:kb:publish-check` → OK;
  `pnpm check` → verde.
- `pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human` → valid, e
  cada linha nova de `record/proofs/work/generic/R-0019.jsonl` com âncora em `chain.json`.

## Mapa entregável → definições

| Entregável     | Definição                                                                                                                                                                                                                                                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| invariantes    | `docs/framework/product/**/rules/RN-*.md` (232); `docs/framework/product/shared/workflows/WF-INF-00{1,2,3}.md`; `backend/domains/shared/src/{policy,roles}.ts`; `docs/meta/adr/ADR-0001…0004` e seguintes; `tools/{check-rls-ddl,check-role-catalog,check-lifecycle-vocabulary,verify-senatran-boundary}.ts`; esquema `invariant.schema.json` |
| trace          | `backend/app/tests/{e2e,integration}/*.spec.ts`; `backend/domains/**/src/*.spec.ts`; `trace.schema.json`                                                                                                                                                                                                                                      |
| política       | `law/policy/{devai-local-rc-*.json,mutation-strength.json}`; `adopter-policy.schema.json`; `.devai/config/domains.json`                                                                                                                                                                                                                       |
| esquemas       | `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/`; `.devai/config/glob-guards.json`; `docs/framework/schemas/README.md`                                                                                                                                                                                                           |
| glossário      | `docs/framework/glossary/domain.md`; `docs/framework/arch/rait-i18n-glossary.md` (só referência); `glossary-entry.schema.json`                                                                                                                                                                                                                |
| jornadas/casos | `docs/framework/product/**/journeys/JRN-*.md` (40); `**/use-cases/UC-*.md` (110); `**/APP.md` (6); `journey.schema.json`, `use-cases.schema.json`                                                                                                                                                                                             |
| índice produto | `docs/framework/product/README.md`; `docs/framework/blueprints/README.md`                                                                                                                                                                                                                                                                     |

## Riscos

- **Âncora inexistente:** RN-* sem cabeçalho → `authority_docs` aponta para o cabeçalho do APP.md, WF
  ou ADR que contém a regra; o id RN vai em `provenance`. Nunca editar RN para criar âncora.
- **Invariante sem teste:** fica `draft`/`advisory`; não se escreve teste nesta rodada (lock de
  teste de backend é das rodadas de código). O piso da Meta 1 usa só testes já em `main`.
- **Duplicação:** `law/` guarda statement, severidade e rastreio; a regra por extenso continua na RN.
  Glossário e jornadas carregam `provenance`, e o gate prova paridade/bijeção.
- **Autoridade Owner:** CTG-0002 só mescla com aceite explícito do Owner no PR (comentário ou
  aprovação registrada em `AUTHORIZATION.md` §Emendas); sem aceite → checkpoint, CTG-0003 segue.
- **Drift de DEVAI:** `law/schemas` fica preso à versão instalada; atualização de DEVAI exige
  reexecutar a cópia (o gate (a) falha até isso).

## Lições aplicadas (C-0001 e método)

- Relatórios de worker em `reports/` **versionados** (`git add -f` até R-0018 corrigir o
  `.gitignore`); conferir `find` × `git ls-files` após cada `add`.
- **Critérios imutáveis:** mudança só por adenda numerada com decisão do Owner; critério substituído
  aparece no closure como não cumprido.
- **ODs no registro canônico** no mesmo PR (seção da rodada em `open-decisions-rait.md`); OD só em
  `contracts/` não conta.
- **Âncora da prova:** nenhuma rodada fecha com linha de prova sem âncora; `chain.json`/jsonl nunca
  resolvidos à mão (aceitar `main` e regravar pelo verbo).
- **Orçamento:** `budget.json` obrigatório; ao estourar, checkpoint e parada.
- Transcrição é ato de Architect (`transcriber-docs`); nenhum worker testa o próprio artefato.

## Decisões do maestro

_(vazio — preenchido no bootstrap: M1 ids de CLI de Sol 6/Terra/Luna/Opus 5.5 confirmados; M2
domínios de cliente — proposta: `INF`, `EST`, `CH`, `OPS`, `PORTAL`, `DASH`, alinhados a
`backend/domains/*`; M3 roster de `law/schemas` — proposta: roster completo do pacote instalado; M4
aceite do Owner no CTG-0002; M5 segregação de commits; M6 orçamento)_

## Bloqueios

## Triagem

## Retomada

## Leitura
