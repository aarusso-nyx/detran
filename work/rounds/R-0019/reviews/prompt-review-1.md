# Prompt do reviewer — prompt-review-1 (R-0019 law-corpus)

Você é o reviewer da OUTRA família: Claude Opus 5.5. Papel: Auditor (soft gate). Trabalhe somente em leitura na worktree /Users/aarusso/.codex/worktrees/law-corpus/detran. Responda APENAS com JSON no formato da rubrica abaixo.

## Contexto mínimo (leia nesta ordem)

1. docs/meta/agents/orchestra/README.md §§4–5
2. docs/meta/agents/README.md §Regras comuns
3. work/campaigns/C-0002-consolidacao.md §§2, 4–5 (ação 2, R-0019)
4. work/rounds/R-0019/plan.md (anexo integral abaixo)
5. Os 11 prompts TASK-0001…TASK-0011 (anexos integrais abaixo)

## Rubrica

Julgue cada prompt exaustivamente: papel Art. 6 e autoridade por caminho; lista fechada de leitura suficiente; fronteiras de escrita e locks disjuntos; comandos que existem e resultado esperado; nenhum valor inventado; Architect→Inspector→Engineer; tokens canônicos; ODs no registro; parcimônia de modelo/esforço; cobertura positiva e negativa de política quando aplicável. O contrato Owner de product/ é proposta draft, com merge condicionado a aceite explícito. Verifique também 11 arquivos de tarefa com schema 2.0.0 já validados por Ajv, composição SHA/PC e dependências.

PASS se nenhum achado high; REVIEW se achado high corrigível no prompt sem mudar critério; FAIL se contradiz Constituição, ADR, fonte ou decisão Owner, ou viola fronteira. Cite arquivo e linha. No primeiro ciclo, liste todos os achados; no segundo, limite-se aos itens corrigidos.

## Saída — JSON puro

{"mode":"prompt-review","round":"R-0019","verdict":"PASS | REVIEW | FAIL","findings":[{"severity":"high | low","item":1,"file":"work/rounds/R-0019/prompts/TASK-0001.md","line":1,"claim":"...","fix":"..."}],"notes":[]}

## Material anexado

### work/rounds/R-0019/plan.md

```markdown
# R-0019 — frente `law-corpus` (ação 2 da C-0002: corpus de `law/` e `product/` nos esquemas DEVAI)

**Status:** ativa — autorização do Owner em `AUTHORIZATION.md` (2026-09-26). Planejada em 2026-09-26
pelo Architect a partir de `work/campaigns/C-0002-consolidacao.md` (§2 fase A, §4, §5) e da inspeção
somente leitura de 2026-09-25 (relatório (e), `work/campaigns/C-0002-inspecao-2026-09-25/e-devai.md`, versionado com a campanha; os
fatos usados estão transcritos abaixo). Maestro **Sol 6** (Codex CLI); reviewer **Opus 5.5** (Claude
Code) pela ponte `tools/orchestra/bridge.sh claude`. Worktree
`/Users/aarusso/.codex/worktrees/law-corpus/detran` (o volume planejado não está montado neste host), branch `orchestra/law-corpus`.
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

**Remeição no bootstrap:** `220a40202bf4ab17a5ce28b882ad96d60755842f` (`origin/main` na abertura); `de28867a5b1c0fb2a1fac9eb5a2520ed4b7f54e2` após o commit de autorização. `pnpm install --frozen-lockfile`, `pnpm check` e `devai doctor` passaram; `devai/1.5.6`. Os membros `glob-guards`, `invariant-strategies`, `test-trace`, `invariants`, `glossary`, `journeys`, `trace` e `schemas` mantêm os resultados da tabela, exceto que `sense run spec_depth` agora conta **37 ADRs** (antes 36), ainda com 0 invariantes e 0 casos de uso, status `review`. `round plan --scaffold` retornou `ROUND_ALREADY_EXISTS` porque `plan.md` e o prompt do maestro já foram versionados pela campanha; a rodada foi reutilizada. `audit scorecard` requer `--at` com SHA completo e não foi usado como gate de abertura.

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

**Por tarefa:** os `acceptance_commands` em `tasks/TASK-*.json` usam apenas scripts existentes no momento da execução. Para TASK-0001/0002/0003/0006/0007/0008/0011, `pnpm format:check` espera exit 0; TASK-0011 acrescenta `pnpm docs:kb:check` exit 0. Para TASK-0004/0009, os testes novos podem ficar RED até o Engineer correspondente, sem `skip` ou enfraquecimento; o maestro registra a saída de `node --test tools/law/tests/verify.test.mjs` ou `pnpm law:test`, respectivamente. Para TASK-0005/0010, `pnpm law:test`, `pnpm verify:law-corpus` e `pnpm check` devem todos retornar exit 0. Os contratos de TASK-0001/0006 exigem arquivo não vazio e os mapas/contagens fechados descritos na tabela de tarefas, além de formatação.

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

- **M1 — modelos confirmados:** `gpt-6-sol` (maestro, configuração local), `gpt-5.6-terra` (médio) e `gpt-6-luna` (pequeno) constam do catálogo local da Codex CLI; `claude-opus-5-5` foi resolvido pela CLI Claude em uma chamada de confirmação. A ponte usa `claude-opus-5-5`. Os ids não foram inferidos da escada antiga.
- **M2 — domínios de cliente:** proposta do contrato CTG-0001: `INF`, `EST`, `CH`, `OPS`, `PORTAL`, `DASH`; `SEC`, `AUTH`, `DATA` são domínios core. A escolha só se torna catálogo após o contrato Architect e o binding DEVAI.
- **M3 — roster de esquemas:** copiar o roster completo de `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/*.schema.json` da versão 1.5.6, com hash por arquivo; não alterar bytes das cópias.
- **M4 — aceite Owner:** autorização de abertura não constitui aceite do conteúdo de `product/` e `law/glossary/`. CTG-0002 permanece proposta até manifestação explícita do Owner sobre seu PR.
- **M5 — commits:** separar `law/`, `product/`, `record/` e código; o binding DEVAI terá commit próprio.
- **M6 — orçamento:** teto da janela de 5 h de aproximadamente 650 mil tokens de entrada estimados, checkpoint a 80% (520 mil). A autorização da rodada não remove esse corte.

## Concorrência

`origin/main` estava em `220a4020` no bootstrap, incluindo PR #127 (campanha C-0002) e PR #117 (`boat-mobile`). R-0017 (`orchestra/local-stack`) e R-0018 (`orchestra/index-state`) tinham worktrees locais, sem merge em `main` e sem PR da frente encontrado no inventário inicial. CTG-0001 não depende deles e pode avançar. CTG-0002 começa após merge de CTG-0001 e só mescla com aceite do Owner. CTG-0003 segue CTG-0002 ou seu checkpoint. Compartilham-se `package.json`, `.prettierignore` e seções próprias de índices/OD; antes de cada PR, integrar qualquer avanço de `origin/main` por merge normal após o primeiro push, reconciliar no mesmo commit e repetir gates.

## Bloqueios

## Triagem

## Retomada

## Leitura

Bootstrap `HEAD=de28867a5b1c0fb2a1fac9eb5a2520ed4b7f54e2`. Lidos na ordem exigida: `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`; `docs/meta/agents/orchestra/{README,model-ladder,waves}.md`; `work/campaigns/C-0002-consolidacao.md`; `.devai/pin/constitution.md` arts. 6, 7, 11–13 e 41; esquemas DEVAI 1.5.6 `invariant`, `trace`, `glossary-entry`, `journey`, `use-cases`, `adopter-policy`, `common-defs` (defs citadas); `docs/framework/product/README.md`, `docs/framework/glossary/domain.md`, `docs/framework/schemas/README.md`, `docs/framework/blueprints/README.md` e os seis `APP.md`; `docs/meta/knowledge-base/steering.md` §H; manuais `architect-blueprint`, `engineer-backend`, `inspector-tests`, `transcriber-docs`; este plano. Lidos também os templates de tarefa, worker e reviewer da orquestra para a decomposição. A lista fechada de fontes específicas de cada worker ficará no respectivo prompt.

Validação DEVAI: `task.schema.json` 2.0.0 compilado com o Ajv 8.20.0 do pacote `@aarusso-nyx/devai@1.5.6`; `TASK-0001`…`TASK-0011` = **11/11 PASS** após formatação. `target_invariants` está vazio até CTG-0001 publicar os IDs, e WF/RN/ADR/OD ficam como referências de prompt/contrato, não como falsos IDs INV. `compositions.json` registra o SHA-256 de cada prompt final e o PC derivado.
```

### work/rounds/R-0019/prompts/TASK-0001.md

````markdown
# Prompt de worker — TASK-0001 (architect-blueprint)

> Worker da frente law-corpus, rodada R-0019, na worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Execute uma tarefa. Nunca execute git, instale pacotes, edite gerados ou altere testes para passar. Relate bloqueio em vez de ampliar a fronteira.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual do perfil: `docs/meta/agents/architect-blueprint.md`; leia-o primeiro. Para arquivos `docs/` e `law/`, a transcrição é ato Architect. `product/` é proposta para aceite posterior do Owner.

## Contexto da frente

R-0019 executa a ação 2 da campanha C-0002: destila o corpus já publicado em `docs/framework/**` para artefatos DEVAI em `law/` e `product/`, sem modificar o corpus. CTG-0001 precede CTG-0002. Esta tarefa pertence a CTG-0001. O maestro é o único que usa git, liga a política DEVAI, executa gates de grupo, evidencia e abre PR.

## Leitura obrigatória (lista fechada; não leia além dela)

- `docs/meta/agents/architect-blueprint.md`
- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0019/plan.md`
- `docs/framework/product/domains/ch/pec/APP.md`
- `docs/framework/product/domains/est/boat/APP.md`
- `docs/framework/product/domains/inf/rait/APP.md`
- `docs/framework/product/domains/inf/teat/APP.md`
- `docs/framework/product/transversal/dashboard/APP.md`
- `docs/framework/product/transversal/portal/APP.md`
- `.devai/config/domains.json`
- `docs/meta/adr/ADR-0003-senatran-adapter-sole-boundary.md`
- `docs/meta/adr/ADR-0002-unified-backend-modular-monolith.md`
- `docs/framework/product/shared/workflows/WF-INF-003.md`
- `docs/framework/product/domains/inf/rait/rules/RN-RAIT-005.md`
- `docs/framework/product/transversal/dashboard/rules/RN-DASH-170.md`
- `docs/framework/product/transversal/dashboard/rules/RN-DASH-171.md`
- `backend/domains/shared/src/policy.ts`
- `backend/domains/shared/src/roles.ts`
- `backend/domains/shared/src/policy.spec.ts`
- `backend/app/tests/e2e/policy-routes.e2e.spec.ts`
- `tools/check-rls-ddl.ts`
- `tools/check-role-catalog.ts`
- `tools/check-lifecycle-vocabulary.ts`
- `tools/verify-senatran-boundary.ts`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/invariant.schema.json`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/trace.schema.json`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/adopter-policy.schema.json`

## Pode tocar

- `work/rounds/R-0019/contracts/CTG-0001.md`

## Não pode tocar

- Qualquer caminho não listado em "Pode tocar", inclusive `docs/framework/**`, `record/`, `.devai/`, `law/adr/**`, `law/register/**`, `law/policy/adr-validation.json`, `law/policy/forbidden-action-authorizations.json` e CI.
- Nenhum arquivo gerado; `law/schemas/*.schema.json` só pode ser copiado byte a byte na tarefa de schemas.
- Nenhum teste fora de tarefa Inspector; nenhum código de produção fora de tarefa Engineer.

## Tarefa

Escrever contracts/CTG-0001.md com catálogo fechado de invariantes, trace, roster de schemas, política de domínios e regras a/b/e do gate.

## Definições que valem como contrato

Fixar pelo menos um INV ativo, severidade readiness-bearing e teste já existente para cada domínio de cliente INF, EST, CH, OPS, PORTAL, DASH e para os domínios core SEC, AUTH, DATA. IDs INV-<DOMAIN>-NNN, CNL MUST/MUST NOT, proveniência RN/WF/ADR/OD, âncora como slug de cabeçalho real; nenhuma RN sem cabeçalho serve como autoridade_docs.anchor. Trace inclui cada INV e somente caminhos de teste existentes. test_corpus descreve todos os testes descobertos pelo DEVAI (atualmente zero), sem afirmar execução onde só há configuração. Os seis domínios de cliente são proposta M2, sujeita à verificação da taxonomia.

## Critérios de aceitação

- `test -s work/rounds/R-0019/contracts/CTG-0001.md` → contrato não vazio com C-01-nn, catálogo INV fechado e âncoras verificadas
- `pnpm format:check` → exit 0

Comandos finais de grupo e evidência cabem ao maestro. Onde o próximo papel ainda não entregou seu artefato, registre o RED esperado sem ajustar o critério.

## Regras sem exceção

1. Não invente valor normativo, papel, estado, prazo ou regra; use `source_pending` ou proponha `OD-R19-nnn` no relatório.
2. Preserve fronteiras de autoridade e não edite testes para fazê-los passar.
3. Não faça `git` de qualquer tipo. Não deixe processo `pnpm check` em segundo plano.
4. Formate somente arquivos autorais que tocou com `node_modules/.bin/prettier --write`; não reformate cópias byte-idênticas de schema.
5. Antes de terminar, cite cada arquivo e cada comando executado; nenhuma lacuna some do relatório.

## Entrega (somente este formato)

```markdown
Papel: Architect
Tarefa: TASK-0001
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL/RED esperado por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descrição>
```
````

````

### work/rounds/R-0019/prompts/TASK-0002.md

```markdown
# Prompt de worker — TASK-0002 (transcriber-docs)

> Worker da frente law-corpus, rodada R-0019, na worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Execute uma tarefa. Nunca execute git, instale pacotes, edite gerados ou altere testes para passar. Relate bloqueio em vez de ampliar a fronteira.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual do perfil: `docs/meta/agents/transcriber-docs.md`; leia-o primeiro. Para arquivos `docs/` e `law/`, a transcrição é ato Architect. `product/` é proposta para aceite posterior do Owner.

## Contexto da frente

R-0019 executa a ação 2 da campanha C-0002: destila o corpus já publicado em `docs/framework/**` para artefatos DEVAI em `law/` e `product/`, sem modificar o corpus. CTG-0001 precede CTG-0002. Esta tarefa pertence a CTG-0001. O maestro é o único que usa git, liga a política DEVAI, executa gates de grupo, evidencia e abre PR.

## Leitura obrigatória (lista fechada; não leia além dela)

- `docs/meta/agents/transcriber-docs.md`
- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0019/plan.md`
- `work/rounds/R-0019/contracts/CTG-0001.md`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/invariant.schema.json`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/trace.schema.json`
- `law/invariants/README.md`

## Pode tocar

- `law/invariants/INV-*.json`
- `law/invariants/VERSION`
- `law/trace.json`
- `law/invariants/README.md`

## Não pode tocar

- Qualquer caminho não listado em "Pode tocar", inclusive `docs/framework/**`, `record/`, `.devai/`, `law/adr/**`, `law/register/**`, `law/policy/adr-validation.json`, `law/policy/forbidden-action-authorizations.json` e CI.
- Nenhum arquivo gerado; `law/schemas/*.schema.json` só pode ser copiado byte a byte na tarefa de schemas.
- Nenhum teste fora de tarefa Inspector; nenhum código de produção fora de tarefa Engineer.

## Tarefa

Transcrever exatamente o contrato CTG-0001 em law/invariants/ e law/trace.json, sem criar regras novas.

## Definições que valem como contrato

Cada arquivo tem nome igual ao id INV; usar schemaVersion 1.0.0, domínio resolvido, strategy.primary para invariantes ativos e authority_docs.docs[].anchor real. law/trace.json referencia toda INV, testes existentes e seus hashes de asserção; nenhum teste novo. Não promover draft sem teste e fonte. Esta tarefa pode terminar antes do binding; o maestro executa os checks DEVAI após TASK-0003.

## Critérios de aceitação

- `pnpm exec devai check --only invariants --repo-root . --format json` → após binding, files_scanned igual ao contrato, sem erros
- `pnpm exec devai check --only trace --repo-root . --format json` → após binding, trace_invariants_count igual ao catálogo
- `pnpm format:check` → exit 0

Comandos finais de grupo e evidência cabem ao maestro. Onde o próximo papel ainda não entregou seu artefato, registre o RED esperado sem ajustar o critério.

## Regras sem exceção

1. Não invente valor normativo, papel, estado, prazo ou regra; use `source_pending` ou proponha `OD-R19-nnn` no relatório.
2. Preserve fronteiras de autoridade e não edite testes para fazê-los passar.
3. Não faça `git` de qualquer tipo. Não deixe processo `pnpm check` em segundo plano.
4. Formate somente arquivos autorais que tocou com `node_modules/.bin/prettier --write`; não reformate cópias byte-idênticas de schema.
5. Antes de terminar, cite cada arquivo e cada comando executado; nenhuma lacuna some do relatório.

## Entrega (somente este formato)

```markdown
Papel: Architect
Tarefa: TASK-0002
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL/RED esperado por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descrição>
````

````

### work/rounds/R-0019/prompts/TASK-0003.md

```markdown
# Prompt de worker — TASK-0003 (transcriber-docs)

> Worker da frente law-corpus, rodada R-0019, na worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Execute uma tarefa. Nunca execute git, instale pacotes, edite gerados ou altere testes para passar. Relate bloqueio em vez de ampliar a fronteira.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual do perfil: `docs/meta/agents/transcriber-docs.md`; leia-o primeiro. Para arquivos `docs/` e `law/`, a transcrição é ato Architect. `product/` é proposta para aceite posterior do Owner.

## Contexto da frente

R-0019 executa a ação 2 da campanha C-0002: destila o corpus já publicado em `docs/framework/**` para artefatos DEVAI em `law/` e `product/`, sem modificar o corpus. CTG-0001 precede CTG-0002. Esta tarefa pertence a CTG-0001. O maestro é o único que usa git, liga a política DEVAI, executa gates de grupo, evidencia e abre PR.

## Leitura obrigatória (lista fechada; não leia além dela)

- `docs/meta/agents/transcriber-docs.md`
- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0019/plan.md`
- `work/rounds/R-0019/contracts/CTG-0001.md`
- `law/policy/README.md`
- `law/schemas/README.md`
- `law/README.md`
- `docs/framework/schemas/README.md`
- `.devai/config/domains.json`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/adopter-policy.schema.json`
- `.prettierignore`

## Pode tocar

- `law/schemas/*.schema.json`
- `law/schemas/manifest.json`
- `law/schemas/README.md`
- `law/policy/adopter-policy.json`
- `law/policy/README.md`
- `law/README.md`
- `.prettierignore`

## Não pode tocar

- Qualquer caminho não listado em "Pode tocar", inclusive `docs/framework/**`, `record/`, `.devai/`, `law/adr/**`, `law/register/**`, `law/policy/adr-validation.json`, `law/policy/forbidden-action-authorizations.json` e CI.
- Nenhum arquivo gerado; `law/schemas/*.schema.json` só pode ser copiado byte a byte na TASK-0003.
- Nenhum teste fora de tarefa Inspector; nenhum código de produção fora de tarefa Engineer.

## Tarefa

Copiar byte a byte os schemas DEVAI 1.5.6, criar manifest e adopter-policy, e atualizar índices law sem tocar no corpus docs.

## Definições que valem como contrato

Roster M3: copiar TODOS os *.schema.json do pacote instalado, sem reformatação; manifest com versão 1.5.6 e sha256 de cada cópia. .prettierignore exclui apenas cópias byte-idênticas, com comentário. adopter-policy contém domains.client do contrato; não incluir glob_guards, thresholds nem scorecard_na. README referencia a política vigente e docs/framework/schemas sem duplicar. Não editar .devai/config: o maestro executa init bind.

## Critérios de aceitação

- `pnpm exec devai check --only glob-guards --repo-root . --format json` → SCHEMAS_DIR >=35
- `pnpm format:check` → exit 0

Comandos finais de grupo e evidência cabem ao maestro. Onde o próximo papel ainda não entregou seu artefato, registre o RED esperado sem ajustar o critério.

## Regras sem exceção

1. Não invente valor normativo, papel, estado, prazo ou regra; use `source_pending` ou proponha `OD-R19-nnn` no relatório.
2. Preserve fronteiras de autoridade e não edite testes para fazê-los passar.
3. Não faça `git` de qualquer tipo. Não deixe processo `pnpm check` em segundo plano.
4. Formate somente arquivos autorais que tocou com `node_modules/.bin/prettier --write`; não reformate cópias byte-idênticas de schema.
5. Antes de terminar, cite cada arquivo e cada comando executado; nenhuma lacuna some do relatório.

## Entrega (somente este formato)

```markdown
Papel: Architect
Tarefa: TASK-0003
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL/RED esperado por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descrição>
````

````

### work/rounds/R-0019/prompts/TASK-0004.md

```markdown
# Prompt de worker — TASK-0004 (inspector-tests)

> Worker da frente law-corpus, rodada R-0019, na worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Execute uma tarefa. Nunca execute git, instale pacotes, edite gerados ou altere testes para passar. Relate bloqueio em vez de ampliar a fronteira.

## Papel

Papel constitucional (Art. 6): **Inspector**. Declare-o na primeira linha da resposta. Manual do perfil: `docs/meta/agents/inspector-tests.md`; leia-o primeiro. Para arquivos `docs/` e `law/`, a transcrição é ato Architect. `product/` é proposta para aceite posterior do Owner.

## Contexto da frente

R-0019 executa a ação 2 da campanha C-0002: destila o corpus já publicado em `docs/framework/**` para artefatos DEVAI em `law/` e `product/`, sem modificar o corpus. CTG-0001 precede CTG-0002. Esta tarefa pertence a CTG-0001. O maestro é o único que usa git, liga a política DEVAI, executa gates de grupo, evidencia e abre PR.

## Leitura obrigatória (lista fechada; não leia além dela)

- `docs/meta/agents/inspector-tests.md`
- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0019/plan.md`
- `work/rounds/R-0019/contracts/CTG-0001.md`
- `law/schemas/manifest.json`
- `law/policy/adopter-policy.json`
- `law/trace.json`
- `package.json`

## Pode tocar

- `tools/law/tests/verify.test.mjs`
- `tools/law/tests/fixtures/**`

## Não pode tocar

- Qualquer caminho não listado em "Pode tocar", inclusive `docs/framework/**`, `record/`, `.devai/`, `law/adr/**`, `law/register/**`, `law/policy/adr-validation.json`, `law/policy/forbidden-action-authorizations.json` e CI.
- Nenhum arquivo gerado; `law/schemas/*.schema.json` só pode ser copiado byte a byte na tarefa de schemas.
- Nenhum teste fora de tarefa Inspector; nenhum código de produção fora de tarefa Engineer.

## Tarefa

Escrever testes positivos e negativos para regras a, b e e de verify:law-corpus, sem implementar o gate.

## Definições que valem como contrato

Testar cópia de schema alterada, sha divergente, id/âncora sem fonte, README obsoleto, além dos casos válidos. Fixtures isoladas em diretório temporário e sem editar law/ de produção. O verificador será tools/law/verify.mjs com interface CLI e exportação testável definida no contrato. Resultado RED é esperado até TASK-0005.

## Critérios de aceitação

- `node --test tools/law/tests/verify.test.mjs` → testes demonstram RED pela ausência de tools/law/verify.mjs, sem skip ou redução de asserções
- `pnpm format:check` → exit 0

Comandos finais de grupo e evidência cabem ao maestro. Onde o próximo papel ainda não entregou seu artefato, registre o RED esperado sem ajustar o critério.

## Regras sem exceção

1. Não invente valor normativo, papel, estado, prazo ou regra; use `source_pending` ou proponha `OD-R19-nnn` no relatório.
2. Preserve fronteiras de autoridade e não edite testes para fazê-los passar.
3. Não faça `git` de qualquer tipo. Não deixe processo `pnpm check` em segundo plano.
4. Formate somente arquivos autorais que tocou com `node_modules/.bin/prettier --write`; não reformate cópias byte-idênticas de schema.
5. Antes de terminar, cite cada arquivo e cada comando executado; nenhuma lacuna some do relatório.

## Entrega (somente este formato)

```markdown
Papel: Inspector
Tarefa: TASK-0004
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL/RED esperado por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descrição>
````

````

### work/rounds/R-0019/prompts/TASK-0005.md

```markdown
# Prompt de worker — TASK-0005 (engineer-backend)

> Worker da frente law-corpus, rodada R-0019, na worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Execute uma tarefa. Nunca execute git, instale pacotes, edite gerados ou altere testes para passar. Relate bloqueio em vez de ampliar a fronteira.

## Papel

Papel constitucional (Art. 6): **Engineer**. Declare-o na primeira linha da resposta. Manual do perfil: `docs/meta/agents/engineer-backend.md`; leia-o primeiro. Para arquivos `docs/` e `law/`, a transcrição é ato Architect. `product/` é proposta para aceite posterior do Owner.

## Contexto da frente

R-0019 executa a ação 2 da campanha C-0002: destila o corpus já publicado em `docs/framework/**` para artefatos DEVAI em `law/` e `product/`, sem modificar o corpus. CTG-0001 precede CTG-0002. Esta tarefa pertence a CTG-0001. O maestro é o único que usa git, liga a política DEVAI, executa gates de grupo, evidencia e abre PR.

## Leitura obrigatória (lista fechada; não leia além dela)

- `docs/meta/agents/engineer-backend.md`
- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0019/plan.md`
- `work/rounds/R-0019/contracts/CTG-0001.md`
- `tools/law/tests/verify.test.mjs`
- `package.json`
- `.prettierignore`
- `law/schemas/manifest.json`

## Pode tocar

- `tools/law/verify.mjs`
- `package.json`

## Não pode tocar

- Qualquer caminho não listado em "Pode tocar", inclusive `docs/framework/**`, `record/`, `.devai/`, `law/adr/**`, `law/register/**`, `law/policy/adr-validation.json`, `law/policy/forbidden-action-authorizations.json` e CI.
- Nenhum arquivo gerado; `law/schemas/*.schema.json` só pode ser copiado byte a byte na tarefa de schemas.
- Nenhum teste fora de tarefa Inspector; nenhum código de produção fora de tarefa Engineer.

## Tarefa

Implementar tools/law/verify.mjs para regras a/b/e, criar scripts law:test e verify:law-corpus e ligar o verificador a pnpm check.

## Definições que valem como contrato

Implementar só a/b/e; c/d chegam em CTG-0002. Não editar os testes. O gate falha fechado para bytes e hashes de schema, referências RN/WF/UC/JRN/APP/ADR/OD sem arquivo/registro, e READMEs com frases obsoletas. package.json é lock compartilhado com R-0017; alterar apenas scripts próprios e composição de check, preservando atualizações upstream.

## Critérios de aceitação

- `pnpm law:test` → exit 0, incluindo negativos do Inspector
- `pnpm verify:law-corpus` → exit 0 para o corpus atual
- `pnpm check` → exit 0

Comandos finais de grupo e evidência cabem ao maestro. Onde o próximo papel ainda não entregou seu artefato, registre o RED esperado sem ajustar o critério.

## Regras sem exceção

1. Não invente valor normativo, papel, estado, prazo ou regra; use `source_pending` ou proponha `OD-R19-nnn` no relatório.
2. Preserve fronteiras de autoridade e não edite testes para fazê-los passar.
3. Não faça `git` de qualquer tipo. Não deixe processo `pnpm check` em segundo plano.
4. Formate somente arquivos autorais que tocou com `node_modules/.bin/prettier --write`; não reformate cópias byte-idênticas de schema.
5. Antes de terminar, cite cada arquivo e cada comando executado; nenhuma lacuna some do relatório.

## Entrega (somente este formato)

```markdown
Papel: Engineer
Tarefa: TASK-0005
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL/RED esperado por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descrição>
````

````

### work/rounds/R-0019/prompts/TASK-0006.md

```markdown
# Prompt de worker — TASK-0006 (architect-blueprint)

> Worker da frente law-corpus, rodada R-0019, na worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Execute uma tarefa. Nunca execute git, instale pacotes, edite gerados ou altere testes para passar. Relate bloqueio em vez de ampliar a fronteira.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual do perfil: `docs/meta/agents/architect-blueprint.md`; leia-o primeiro. Para arquivos `docs/` e `law/`, a transcrição é ato Architect. `product/` é proposta para aceite posterior do Owner.

## Contexto da frente

R-0019 executa a ação 2 da campanha C-0002: destila o corpus já publicado em `docs/framework/**` para artefatos DEVAI em `law/` e `product/`, sem modificar o corpus. CTG-0001 precede CTG-0002. Esta tarefa pertence a CTG-0002. O maestro é o único que usa git, liga a política DEVAI, executa gates de grupo, evidencia e abre PR.

## Leitura obrigatória (lista fechada; não leia além dela)

- `docs/meta/agents/architect-blueprint.md`
- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0019/plan.md`
- `docs/framework/glossary/domain.md`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/glossary-entry.schema.json`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/journey.schema.json`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/use-cases.schema.json`
- `docs/framework/product/domains/ch/pec/APP.md`
- `docs/framework/product/domains/est/boat/APP.md`
- `docs/framework/product/domains/inf/rait/APP.md`
- `docs/framework/product/domains/inf/teat/APP.md`
- `docs/framework/product/transversal/dashboard/APP.md`
- `docs/framework/product/transversal/portal/APP.md`
- `docs/framework/product/domains/ch/pec/journeys/JRN-PEC-001.md`
- `docs/framework/product/domains/ch/pec/journeys/JRN-PEC-002.md`
- `docs/framework/product/domains/ch/pec/journeys/JRN-PEC-003.md`
- `docs/framework/product/domains/ch/pec/journeys/JRN-PEC-004.md`
- `docs/framework/product/domains/ch/pec/journeys/JRN-PEC-005.md`
- `docs/framework/product/domains/ch/pec/journeys/JRN-PEC-006.md`
- `docs/framework/product/domains/ch/pec/journeys/JRN-PEC-007.md`
- `docs/framework/product/domains/est/boat/journeys/JRN-BOAT-001.md`
- `docs/framework/product/domains/est/boat/journeys/JRN-BOAT-002.md`
- `docs/framework/product/domains/est/boat/journeys/JRN-BOAT-003.md`
- `docs/framework/product/domains/est/boat/journeys/JRN-BOAT-004.md`
- `docs/framework/product/domains/est/boat/journeys/JRN-BOAT-005.md`
- `docs/framework/product/domains/inf/rait/journeys/JRN-RAIT-001.md`
- `docs/framework/product/domains/inf/rait/journeys/JRN-RAIT-002.md`
- `docs/framework/product/domains/inf/rait/journeys/JRN-RAIT-003.md`
- `docs/framework/product/domains/inf/rait/journeys/JRN-RAIT-004.md`
- `docs/framework/product/domains/inf/teat/journeys/JRN-TEAT-001.md`
- `docs/framework/product/domains/inf/teat/journeys/JRN-TEAT-002.md`
- `docs/framework/product/domains/inf/teat/journeys/JRN-TEAT-003.md`
- `docs/framework/product/domains/inf/teat/journeys/JRN-TEAT-004.md`
- `docs/framework/product/domains/inf/teat/journeys/JRN-TEAT-005.md`
- `docs/framework/product/domains/inf/teat/journeys/JRN-TEAT-006.md`
- `docs/framework/product/transversal/dashboard/journeys/JRN-DASH-001.md`
- `docs/framework/product/transversal/dashboard/journeys/JRN-DASH-002.md`
- `docs/framework/product/transversal/dashboard/journeys/JRN-DASH-003.md`
- `docs/framework/product/transversal/dashboard/journeys/JRN-DASH-004.md`
- `docs/framework/product/transversal/dashboard/journeys/JRN-DASH-005.md`
- `docs/framework/product/transversal/dashboard/journeys/JRN-DASH-006.md`
- `docs/framework/product/transversal/dashboard/journeys/JRN-DASH-007.md`
- `docs/framework/product/transversal/portal/journeys/JRN-PORTAL-001.md`
- `docs/framework/product/transversal/portal/journeys/JRN-PORTAL-002.md`
- `docs/framework/product/transversal/portal/journeys/JRN-PORTAL-003.md`
- `docs/framework/product/transversal/portal/journeys/JRN-PORTAL-004.md`
- `docs/framework/product/transversal/portal/journeys/JRN-PORTAL-005.md`
- `docs/framework/product/transversal/portal/journeys/JRN-PORTAL-006.md`
- `docs/framework/product/transversal/portal/journeys/JRN-PORTAL-007.md`
- `docs/framework/product/transversal/portal/journeys/JRN-PORTAL-008.md`
- `docs/framework/product/transversal/portal/journeys/JRN-PORTAL-009.md`
- `docs/framework/product/transversal/portal/journeys/JRN-PORTAL-010.md`
- `docs/framework/product/transversal/portal/journeys/JRN-PORTAL-011.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-001.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-002.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-003.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-004.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-005.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-006.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-007.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-008.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-009.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-010.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-011.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-012.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-013.md`
- `docs/framework/product/domains/ch/pec/use-cases/UC-PEC-014.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-001.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-002.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-003.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-004.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-005.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-006.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-007.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-008.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-009.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-010.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-011.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-012.md`
- `docs/framework/product/domains/est/boat/use-cases/UC-BOAT-013.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-001.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-002.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-003.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-004.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-005.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-006.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-007.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-008.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-009.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-010.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-011.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-012.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-013.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-014.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-015.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-016.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-017.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-018.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-019.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-020.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-021.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-022.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-023.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-024.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-025.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-026.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-027.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-028.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-029.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-030.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-031.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-032.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-033.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-034.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-035.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-036.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-037.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-038.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-039.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-040.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-041.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-042.md`
- `docs/framework/product/domains/inf/rait/use-cases/UC-RAIT-043.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-001.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-002.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-003.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-004.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-005.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-006.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-007.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-008.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-009.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-010.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-011.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-012.md`
- `docs/framework/product/domains/inf/teat/use-cases/UC-TEAT-013.md`
- `docs/framework/product/transversal/dashboard/use-cases/UC-DASH-001.md`
- `docs/framework/product/transversal/dashboard/use-cases/UC-DASH-002.md`
- `docs/framework/product/transversal/dashboard/use-cases/UC-DASH-003.md`
- `docs/framework/product/transversal/dashboard/use-cases/UC-DASH-004.md`
- `docs/framework/product/transversal/dashboard/use-cases/UC-DASH-005.md`
- `docs/framework/product/transversal/dashboard/use-cases/UC-DASH-006.md`
- `docs/framework/product/transversal/dashboard/use-cases/UC-DASH-007.md`
- `docs/framework/product/transversal/dashboard/use-cases/UC-DASH-008.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-001.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-002.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-003.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-004.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-005.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-006.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-007.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-008.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-009.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-010.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-011.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-012.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-013.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-014.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-015.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-016.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-017.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-018.md`
- `docs/framework/product/transversal/portal/use-cases/UC-PORTAL-019.md`

## Pode tocar

- `work/rounds/R-0019/contracts/CTG-0002.md`

## Não pode tocar

- Qualquer caminho não listado em "Pode tocar", inclusive `docs/framework/**`, `record/`, `.devai/`, `law/adr/**`, `law/register/**`, `law/policy/adr-validation.json`, `law/policy/forbidden-action-authorizations.json` e CI.
- Nenhum arquivo gerado; `law/schemas/*.schema.json` só pode ser copiado byte a byte na tarefa de schemas.
- Nenhum teste fora de tarefa Inspector; nenhum código de produção fora de tarefa Engineer.

## Tarefa

Escrever contracts/CTG-0002.md com catálogo GE, mapa de 40 JRN para JNY, 110 UC e regras c/d do gate.

## Definições que valem como contrato

Destilar, nunca copiar, o corpus. Cada JNY recebe persona, pré/pós-condições, passos e AC da JRN correspondente, status draft e provenance. Cada UC retém id, título e papéis no bundle do app. Glossário tem termo, definição fechada, categoria, provenance com linha/fonte e links INV existentes. BOAT conflituoso e termos sem fonte RENAVAM/CDT viram OD; não inventar expansão. product/ e law/glossary/ são proposta para aceite separado do Owner. Referências ao corpus docs são read-only.

## Critérios de aceitação

- `test -s work/rounds/R-0019/contracts/CTG-0002.md` → mapa completo 40 JRN, 110 UC, GE e C-02-nn
- `pnpm format:check` → exit 0

Comandos finais de grupo e evidência cabem ao maestro. Onde o próximo papel ainda não entregou seu artefato, registre o RED esperado sem ajustar o critério.

## Regras sem exceção

1. Não invente valor normativo, papel, estado, prazo ou regra; use `source_pending` ou proponha `OD-R19-nnn` no relatório.
2. Preserve fronteiras de autoridade e não edite testes para fazê-los passar.
3. Não faça `git` de qualquer tipo. Não deixe processo `pnpm check` em segundo plano.
4. Formate somente arquivos autorais que tocou com `node_modules/.bin/prettier --write`; não reformate cópias byte-idênticas de schema.
5. Antes de terminar, cite cada arquivo e cada comando executado; nenhuma lacuna some do relatório.

## Entrega (somente este formato)

```markdown
Papel: Architect
Tarefa: TASK-0006
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL/RED esperado por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descrição>
````

````

### work/rounds/R-0019/prompts/TASK-0007.md

```markdown
# Prompt de worker — TASK-0007 (transcriber-docs)

> Worker da frente law-corpus, rodada R-0019, na worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Execute uma tarefa. Nunca execute git, instale pacotes, edite gerados ou altere testes para passar. Relate bloqueio em vez de ampliar a fronteira.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual do perfil: `docs/meta/agents/transcriber-docs.md`; leia-o primeiro. Para arquivos `docs/` e `law/`, a transcrição é ato Architect. `product/` é proposta para aceite posterior do Owner.

## Contexto da frente

R-0019 executa a ação 2 da campanha C-0002: destila o corpus já publicado em `docs/framework/**` para artefatos DEVAI em `law/` e `product/`, sem modificar o corpus. CTG-0001 precede CTG-0002. Esta tarefa pertence a CTG-0002. O maestro é o único que usa git, liga a política DEVAI, executa gates de grupo, evidencia e abre PR.

## Leitura obrigatória (lista fechada; não leia além dela)

- `docs/meta/agents/transcriber-docs.md`
- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0019/plan.md`
- `work/rounds/R-0019/contracts/CTG-0002.md`
- `docs/framework/glossary/domain.md`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/glossary-entry.schema.json`

## Pode tocar

- `law/glossary/GE-*.json`
- `law/glossary/README.md`

## Não pode tocar

- Qualquer caminho não listado em "Pode tocar", inclusive `docs/framework/**`, `record/`, `.devai/`, `law/adr/**`, `law/register/**`, `law/policy/adr-validation.json`, `law/policy/forbidden-action-authorizations.json` e CI.
- Nenhum arquivo gerado; `law/schemas/*.schema.json` só pode ser copiado byte a byte na tarefa de schemas.
- Nenhum teste fora de tarefa Inspector; nenhum código de produção fora de tarefa Engineer.

## Tarefa

Criar entradas GE draft e README a partir do contrato CTG-0002 e do glossário humano.

## Definições que valem como contrato

Autoridade conjunta Owner+Architect: todas entradas status draft e sem alegar aceite. Termo único sem diferença de caixa; related_invariants referem INV existentes. Em conflito de expansão, abrir OD e não consolidar falsa definição.

## Critérios de aceitação

- `pnpm exec devai check --only glossary --repo-root . --format json` → files_scanned igual ao contrato, sem erros
- `pnpm format:check` → exit 0

Comandos finais de grupo e evidência cabem ao maestro. Onde o próximo papel ainda não entregou seu artefato, registre o RED esperado sem ajustar o critério.

## Regras sem exceção

1. Não invente valor normativo, papel, estado, prazo ou regra; use `source_pending` ou proponha `OD-R19-nnn` no relatório.
2. Preserve fronteiras de autoridade e não edite testes para fazê-los passar.
3. Não faça `git` de qualquer tipo. Não deixe processo `pnpm check` em segundo plano.
4. Formate somente arquivos autorais que tocou com `node_modules/.bin/prettier --write`; não reformate cópias byte-idênticas de schema.
5. Antes de terminar, cite cada arquivo e cada comando executado; nenhuma lacuna some do relatório.

## Entrega (somente este formato)

```markdown
Papel: Architect
Tarefa: TASK-0007
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL/RED esperado por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descrição>
````

````

### work/rounds/R-0019/prompts/TASK-0008.md

```markdown
# Prompt de worker — TASK-0008 (transcriber-docs)

> Worker da frente law-corpus, rodada R-0019, na worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Execute uma tarefa. Nunca execute git, instale pacotes, edite gerados ou altere testes para passar. Relate bloqueio em vez de ampliar a fronteira.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual do perfil: `docs/meta/agents/transcriber-docs.md`; leia-o primeiro. Para arquivos `docs/` e `law/`, a transcrição é ato Architect. `product/` é proposta para aceite posterior do Owner.

## Contexto da frente

R-0019 executa a ação 2 da campanha C-0002: destila o corpus já publicado em `docs/framework/**` para artefatos DEVAI em `law/` e `product/`, sem modificar o corpus. CTG-0001 precede CTG-0002. Esta tarefa pertence a CTG-0002. O maestro é o único que usa git, liga a política DEVAI, executa gates de grupo, evidencia e abre PR.

## Leitura obrigatória (lista fechada; não leia além dela)

- `docs/meta/agents/transcriber-docs.md`
- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0019/plan.md`
- `work/rounds/R-0019/contracts/CTG-0002.md`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/journey.schema.json`
- `node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/use-cases.schema.json`
- `docs/framework/product/README.md`
- `docs/framework/blueprints/README.md`
- `docs/framework/product/domains/ch/pec/APP.md`
- `docs/framework/product/domains/est/boat/APP.md`
- `docs/framework/product/domains/inf/rait/APP.md`
- `docs/framework/product/domains/inf/teat/APP.md`
- `docs/framework/product/transversal/dashboard/APP.md`
- `docs/framework/product/transversal/portal/APP.md`

## Pode tocar

- `product/journeys/JNY-*.json`
- `product/use-cases/*.json`
- `product/README.md`
- `product/specification.md`

## Não pode tocar

- Qualquer caminho não listado em "Pode tocar", inclusive `docs/framework/**`, `record/`, `.devai/`, `law/adr/**`, `law/register/**`, `law/policy/adr-validation.json`, `law/policy/forbidden-action-authorizations.json` e CI.
- Nenhum arquivo gerado; `law/schemas/*.schema.json` só pode ser copiado byte a byte na tarefa de schemas.
- Nenhum teste fora de tarefa Inspector; nenhum código de produção fora de tarefa Engineer.

## Tarefa

Criar 40 JNY draft, seis bundles de use-cases e índices product conforme contrato CTG-0002.

## Definições que valem como contrato

Todo product/ tem autoridade Owner: esta é proposta Architect de transcrição para aceite, status draft. Mapa bijetivo JRN→JNY (40) e UC→bundle (110), sem inventar passos, papéis ou AC. Se contrato insuficiente, relatar lacuna/OD; não completar por analogia. Os índices apontam aos seis APP.md e blueprints, sem mover docs.

## Critérios de aceitação

- `pnpm exec devai check --only journeys --repo-root . --format json` → 40 arquivos, sem erros
- `pnpm format:check` → exit 0

Comandos finais de grupo e evidência cabem ao maestro. Onde o próximo papel ainda não entregou seu artefato, registre o RED esperado sem ajustar o critério.

## Regras sem exceção

1. Não invente valor normativo, papel, estado, prazo ou regra; use `source_pending` ou proponha `OD-R19-nnn` no relatório.
2. Preserve fronteiras de autoridade e não edite testes para fazê-los passar.
3. Não faça `git` de qualquer tipo. Não deixe processo `pnpm check` em segundo plano.
4. Formate somente arquivos autorais que tocou com `node_modules/.bin/prettier --write`; não reformate cópias byte-idênticas de schema.
5. Antes de terminar, cite cada arquivo e cada comando executado; nenhuma lacuna some do relatório.

## Entrega (somente este formato)

```markdown
Papel: Architect
Tarefa: TASK-0008
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL/RED esperado por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descrição>
````

````

### work/rounds/R-0019/prompts/TASK-0009.md

```markdown
# Prompt de worker — TASK-0009 (inspector-tests)

> Worker da frente law-corpus, rodada R-0019, na worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Execute uma tarefa. Nunca execute git, instale pacotes, edite gerados ou altere testes para passar. Relate bloqueio em vez de ampliar a fronteira.

## Papel

Papel constitucional (Art. 6): **Inspector**. Declare-o na primeira linha da resposta. Manual do perfil: `docs/meta/agents/inspector-tests.md`; leia-o primeiro. Para arquivos `docs/` e `law/`, a transcrição é ato Architect. `product/` é proposta para aceite posterior do Owner.

## Contexto da frente

R-0019 executa a ação 2 da campanha C-0002: destila o corpus já publicado em `docs/framework/**` para artefatos DEVAI em `law/` e `product/`, sem modificar o corpus. CTG-0001 precede CTG-0002. Esta tarefa pertence a CTG-0002. O maestro é o único que usa git, liga a política DEVAI, executa gates de grupo, evidencia e abre PR.

## Leitura obrigatória (lista fechada; não leia além dela)

- `docs/meta/agents/inspector-tests.md`
- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0019/plan.md`
- `work/rounds/R-0019/contracts/CTG-0002.md`
- `tools/law/tests/verify.test.mjs`
- `tools/law/verify.mjs`
- `docs/framework/glossary/domain.md`

## Pode tocar

- `tools/law/tests/verify.test.mjs`
- `tools/law/tests/fixtures/**`

## Não pode tocar

- Qualquer caminho não listado em "Pode tocar", inclusive `docs/framework/**`, `record/`, `.devai/`, `law/adr/**`, `law/register/**`, `law/policy/adr-validation.json`, `law/policy/forbidden-action-authorizations.json` e CI.
- Nenhum arquivo gerado; `law/schemas/*.schema.json` só pode ser copiado byte a byte na tarefa de schemas.
- Nenhum teste fora de tarefa Inspector; nenhum código de produção fora de tarefa Engineer.

## Tarefa

Acrescentar testes positivos/negativos de paridade GE↔domain.md e bijeção JRN/UC↔product, sem editar gate.

## Definições que valem como contrato

Casos negativos mínimos: termo sem GE, GE sem termo, JRN sem JNY, JNY órfã, UC sem bundle, UC órfã. Não enfraquecer testes de CTG-0001, nem editar código de produção.

## Critérios de aceitação

- `pnpm law:test` → novos testes RED até TASK-0010; existentes continuam verdes
- `pnpm format:check` → exit 0

Comandos finais de grupo e evidência cabem ao maestro. Onde o próximo papel ainda não entregou seu artefato, registre o RED esperado sem ajustar o critério.

## Regras sem exceção

1. Não invente valor normativo, papel, estado, prazo ou regra; use `source_pending` ou proponha `OD-R19-nnn` no relatório.
2. Preserve fronteiras de autoridade e não edite testes para fazê-los passar.
3. Não faça `git` de qualquer tipo. Não deixe processo `pnpm check` em segundo plano.
4. Formate somente arquivos autorais que tocou com `node_modules/.bin/prettier --write`; não reformate cópias byte-idênticas de schema.
5. Antes de terminar, cite cada arquivo e cada comando executado; nenhuma lacuna some do relatório.

## Entrega (somente este formato)

```markdown
Papel: Inspector
Tarefa: TASK-0009
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL/RED esperado por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descrição>
````

````

### work/rounds/R-0019/prompts/TASK-0010.md

```markdown
# Prompt de worker — TASK-0010 (engineer-backend)

> Worker da frente law-corpus, rodada R-0019, na worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Execute uma tarefa. Nunca execute git, instale pacotes, edite gerados ou altere testes para passar. Relate bloqueio em vez de ampliar a fronteira.

## Papel

Papel constitucional (Art. 6): **Engineer**. Declare-o na primeira linha da resposta. Manual do perfil: `docs/meta/agents/engineer-backend.md`; leia-o primeiro. Para arquivos `docs/` e `law/`, a transcrição é ato Architect. `product/` é proposta para aceite posterior do Owner.

## Contexto da frente

R-0019 executa a ação 2 da campanha C-0002: destila o corpus já publicado em `docs/framework/**` para artefatos DEVAI em `law/` e `product/`, sem modificar o corpus. CTG-0001 precede CTG-0002. Esta tarefa pertence a CTG-0002. O maestro é o único que usa git, liga a política DEVAI, executa gates de grupo, evidencia e abre PR.

## Leitura obrigatória (lista fechada; não leia além dela)

- `docs/meta/agents/engineer-backend.md`
- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0019/plan.md`
- `work/rounds/R-0019/contracts/CTG-0002.md`
- `tools/law/tests/verify.test.mjs`
- `tools/law/verify.mjs`

## Pode tocar

- `tools/law/verify.mjs`

## Não pode tocar

- Qualquer caminho não listado em "Pode tocar", inclusive `docs/framework/**`, `record/`, `.devai/`, `law/adr/**`, `law/register/**`, `law/policy/adr-validation.json`, `law/policy/forbidden-action-authorizations.json` e CI.
- Nenhum arquivo gerado; `law/schemas/*.schema.json` só pode ser copiado byte a byte na tarefa de schemas.
- Nenhum teste fora de tarefa Inspector; nenhum código de produção fora de tarefa Engineer.

## Tarefa

Implementar regras c/d do verify:law-corpus até todos os testes do Inspector passarem.

## Definições que valem como contrato

Preservar a/b/e, acrescentar c/d. Comparar termo por identidade canônica e id com correspondência completa, falhar fechado para ausentes/órfãos. Não editar teste ou documento de produto.

## Critérios de aceitação

- `pnpm law:test` → exit 0
- `pnpm verify:law-corpus` → exit 0
- `pnpm check` → exit 0

Comandos finais de grupo e evidência cabem ao maestro. Onde o próximo papel ainda não entregou seu artefato, registre o RED esperado sem ajustar o critério.

## Regras sem exceção

1. Não invente valor normativo, papel, estado, prazo ou regra; use `source_pending` ou proponha `OD-R19-nnn` no relatório.
2. Preserve fronteiras de autoridade e não edite testes para fazê-los passar.
3. Não faça `git` de qualquer tipo. Não deixe processo `pnpm check` em segundo plano.
4. Formate somente arquivos autorais que tocou com `node_modules/.bin/prettier --write`; não reformate cópias byte-idênticas de schema.
5. Antes de terminar, cite cada arquivo e cada comando executado; nenhuma lacuna some do relatório.

## Entrega (somente este formato)

```markdown
Papel: Engineer
Tarefa: TASK-0010
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL/RED esperado por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descrição>
````

````

### work/rounds/R-0019/prompts/TASK-0011.md

```markdown
# Prompt de worker — TASK-0011 (transcriber-docs)

> Worker da frente law-corpus, rodada R-0019, na worktree `/Users/aarusso/.codex/worktrees/law-corpus/detran`. Execute uma tarefa. Nunca execute git, instale pacotes, edite gerados ou altere testes para passar. Relate bloqueio em vez de ampliar a fronteira.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual do perfil: `docs/meta/agents/transcriber-docs.md`; leia-o primeiro. Para arquivos `docs/` e `law/`, a transcrição é ato Architect. `product/` é proposta para aceite posterior do Owner.

## Contexto da frente

R-0019 executa a ação 2 da campanha C-0002: destila o corpus já publicado em `docs/framework/**` para artefatos DEVAI em `law/` e `product/`, sem modificar o corpus. CTG-0001 precede CTG-0002. Esta tarefa pertence a CTG-0003. O maestro é o único que usa git, liga a política DEVAI, executa gates de grupo, evidencia e abre PR.

## Leitura obrigatória (lista fechada; não leia além dela)

- `docs/meta/agents/transcriber-docs.md`
- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0019/plan.md`
- `docs/meta/knowledge-base/backlog.md`
- `docs/meta/agents/orchestra/waves.md`
- `work/rounds/README.md`

## Pode tocar

- `docs/meta/knowledge-base/backlog.md`
- `docs/meta/agents/orchestra/waves.md`
- `work/rounds/README.md`

## Não pode tocar

- Qualquer caminho não listado em "Pode tocar", inclusive `docs/framework/**`, `record/`, `.devai/`, `law/adr/**`, `law/register/**`, `law/policy/adr-validation.json`, `law/policy/forbidden-action-authorizations.json` e CI.
- Nenhum arquivo gerado; `law/schemas/*.schema.json` só pode ser copiado byte a byte na tarefa de schemas.
- Nenhum teste fora de tarefa Inspector; nenhum código de produção fora de tarefa Engineer.

## Tarefa

Atualizar backlog, histórico da orquestra e apenas a linha R-0019 do índice de rodadas.

## Definições que valem como contrato

Atualizar somente fatos comprovados e linha da rodada. Não declarar fechamento antes do merge e dos recibos. R-0018 também edita índices: preservar conteúdo integrado de main e tocar apenas a linha R-0019.

## Critérios de aceitação

- `pnpm docs:kb:check` → exit 0
- `pnpm format:check` → exit 0

Comandos finais de grupo e evidência cabem ao maestro. Onde o próximo papel ainda não entregou seu artefato, registre o RED esperado sem ajustar o critério.

## Regras sem exceção

1. Não invente valor normativo, papel, estado, prazo ou regra; use `source_pending` ou proponha `OD-R19-nnn` no relatório.
2. Preserve fronteiras de autoridade e não edite testes para fazê-los passar.
3. Não faça `git` de qualquer tipo. Não deixe processo `pnpm check` em segundo plano.
4. Formate somente arquivos autorais que tocou com `node_modules/.bin/prettier --write`; não reformate cópias byte-idênticas de schema.
5. Antes de terminar, cite cada arquivo e cada comando executado; nenhuma lacuna some do relatório.

## Entrega (somente este formato)

```markdown
Papel: Architect
Tarefa: TASK-0011
Arquivos criados/alterados: <lista de caminhos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <PASS/FAIL/RED esperado por critério>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids ou nenhuma>
Bloqueios: <nenhum ou descrição>
````

```

```
