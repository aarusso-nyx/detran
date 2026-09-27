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
   `test_corpus` conforme a descoberta DEVAI (vazio enquanto 0 arquivos são descobertos; sem digest manual). É a entrada dos sensores de R-0020 (`trace_resolution`,
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

| Tarefa    | Papel                                 | Perfil              | Modelo/esforço | Lock                                                          | Depende de                 | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------- | ------------------------------------- | ------------------- | -------------- | ------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect                             | architect-blueprint | Terra / alto   | `MOD-r19-contract-law`, `MOD-od-r19`                          | —                          | `contracts/CTG-0001.md`: domínios de cliente (M2); catálogo fechado de invariantes (id, domínio, tipo, severidade, status, statement CNL, `authority_docs` doc+âncora verificada por `grep '^#'`, `provenance`, `verification` e `strategy`, testes existentes); plano de `trace.json`; roster de `law/schemas` (M3); conteúdo de `adopter-policy.json`; regras (a)(b)(e) do gate; critérios C-01-nn; ODs `OD-R19-nnn` no registro canônico; interface do gate e dependência operacional de R-0018 para regra (e) |
| TASK-0002 | Architect (transcr.)                  | transcriber-docs    | Luna / baixo   | `MOD-law-invariants`, `MOD-law-trace`                         | TASK-0001                  | `law/invariants/INV-*.json`, `law/invariants/VERSION`, `law/trace.json`, `law/invariants/README.md` — transcrição exata do contrato                                                                                                                                                                                                                                                                                                                                                                               |
| TASK-0003 | Architect (transcr.)                  | transcriber-docs    | Luna / baixo   | `MOD-law-schemas`, `MOD-law-policy`                           | TASK-0001                  | `law/schemas/*.schema.json` (cópia `cp`, sem edição) + `manifest.json` + `README.md`; `law/policy/adopter-policy.json` + `README.md`; `law/README.md`; formatação das cópias permanece RED até TASK-0005                                                                                                                                                                                                                                                                                                          |
| TASK-0004 | Inspector                             | inspector-tests     | Luna / médio   | `MOD-law-gate-tests`                                          | TASK-0002, TASK-0003       | `tools/law/tests/verify.test.mjs` + fixtures: (a)(b)(e) positivos e negativos (byte alterado, sha divergente, âncora/id inexistente, README "intentionally empty")                                                                                                                                                                                                                                                                                                                                                |
| TASK-0005 | Engineer                              | engineer-backend    | Terra / médio  | `MOD-law-gate`, `MOD-root-package-json`, `MOD-prettierignore` | TASK-0004 + checkpoint (a) | `tools/law/verify.mjs` (a)(b)(e); scripts `verify:law-corpus` e `law:test` em `package.json`, ligados a `pnpm check`; testes verdes                                                                                                                                                                                                                                                                                                                                                                               |
| TASK-0006 | Architect                             | architect-blueprint | Terra / alto   | `MOD-r19-contract-product`, `MOD-od-r19`                      | merge CTG-0001             | `contracts/CTG-0002.md`: catálogo GE (termo, definição destilada, categoria, `provenance`, `related_invariants`); mapa JRN → JNY (40) com passos, pré/pós-condições e AC extraídos da JRN; mapa UC → `use-cases/<app>.json` (110); índice `product/`; regras (c)(d) do gate; ODs para o Owner                                                                                                                                                                                                                     |
| TASK-0007 | Architect (transcr.)                  | transcriber-docs    | Luna / baixo   | `MOD-law-glossary`                                            | TASK-0006                  | `law/glossary/GE-*.json` + `README.md` (proposta conjunta, `status: draft`)                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| TASK-0008 | Architect (transcr.) — proposta Owner | transcriber-docs    | Luna / baixo   | `MOD-product`                                                 | TASK-0006                  | `product/journeys/JNY-*.json`, `product/use-cases/*.json`, `product/README.md`, `product/specification.md` (`status: draft`)                                                                                                                                                                                                                                                                                                                                                                                      |
| TASK-0009 | Inspector                             | inspector-tests     | Luna / médio   | `MOD-law-gate-tests`                                          | TASK-0007, TASK-0008       | testes de (c)(d): termo sem GE, GE sem termo, JRN sem JNY, UC órfão                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| TASK-0010 | Engineer                              | engineer-backend    | Terra / médio  | `MOD-law-gate`                                                | TASK-0009                  | `tools/law/verify.mjs` (c)(d); testes verdes                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| TASK-0011 | Architect (transcr.)                  | transcriber-docs    | Luna / baixo   | `MOD-docs`                                                    | TASK-0010                  | `docs/meta/knowledge-base/backlog.md`; `docs/meta/agents/orchestra/waves.md` §Histórico e `work/rounds/README.md` (só a linha R-0019)                                                                                                                                                                                                                                                                                                                                                                             |

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

**Por tarefa:** os `acceptance_commands` em `tasks/TASK-*.json` usam apenas scripts ou arquivos verificáveis no momento da execução. TASK-0001/0006/0007/0008/0011 usam `pnpm format:check` (exit 0); TASK-0011 acrescenta `pnpm docs:kb:check` (exit 0). TASK-0002 verifica apenas seus próprios arquivos com `prettier --check law/invariants law/trace.json` (exit 0). TASK-0003 usa `devai check --only glob-guards` (SCHEMAS_DIR ≥35, exit 0); o `format:check` global fica RED até TASK-0005 adicionar `.prettierignore`. TASK-0004 usa `node --check tools/law/tests/verify.test.mjs` (exit 0); seus testes e o formato global ficam RED até TASK-0005. TASK-0009 tem novos testes RED até TASK-0010, sem `skip` ou enfraquecimento. Para TASK-0005/0010, `pnpm law:test`, `pnpm verify:law-corpus` e `pnpm check` devem todos retornar exit 0 depois das dependências de merge. Os contratos de TASK-0001/0006 exigem arquivo não vazio e os mapas/contagens fechados descritos na tabela de tarefas, além de formatação.

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
- **M6 — orçamento:** teto original da janela de 5 h de aproximadamente 650 mil tokens de entrada estimados, checkpoint a 80% (520 mil). A autorização inicial da rodada não removeu esse corte; a emenda explícita do Owner em `AUTHORIZATION.md` §Emendas o dispensou para concluir R-0019.
- **M7 — defeito de baseline em `law/adr/README.md`:** prompt-review-1 identificou que o README ainda diz “Content is intentionally empty until authored.” e “Generated by DEVAI v1.4.5.” apesar de existir uma ADR. A regra (e) do gate permanece integral para `law/*`; R-0018 é a dona do caminho e já planeja corrigi-lo. O plano de R-0018 só exige remover a primeira expressão, portanto OD-R19-001 registra a diferença e a dependência exige a ausência **das duas** expressões. CTG-0001 avança em contrato, transcrição, testes e implementação, mas o gate real e o PR só ficam verdes depois da integração do reparo completo de R-0018 em `main`. Isto acrescenta uma dependência operacional ao checkpoint final sem substituir critério de aceitação nem transferir o lock.
- **M8 — autoridade dos testes:** `tools/law/tests/` é reservado à tarefa Inspector nesta rodada conforme o plano; a formalização da extensão de caminho no sensor de `forbidden-actions` cabe à R-0020. A separação Inspector (teste) × Engineer (gate) continua obrigatória.

## Concorrência

`origin/main` estava em `220a4020` no bootstrap, incluindo PR #127 (campanha C-0002) e PR #117 (`boat-mobile`). R-0017 (`orchestra/local-stack`) e R-0018 (`orchestra/index-state`) tinham worktrees locais, sem merge em `main` e sem PR da frente encontrado no inventário inicial. CTG-0001 não depende deles e pode avançar. CTG-0002 começa após merge de CTG-0001 e só mescla com aceite do Owner. CTG-0003 segue CTG-0002 ou seu checkpoint. Compartilham-se `package.json`, `.prettierignore` e seções próprias de índices/OD; antes de cada PR, integrar qualquer avanço de `origin/main` por merge normal após o primeiro push, reconciliar no mesmo commit e repetir gates.

Após prompt-review-1, a regra (e) expôs a dependência operacional M7: `law/adr/README.md` é corrigido somente por R-0018, e `verify:law-corpus` não pode ser PASS no corpus real até esse merge. O trabalho livre de CTG-0001 prossegue; não editar `law/adr/**` nesta frente.

## Bloqueios

## Triagem

- `sensor-error` — prompt-review-2: Claude returned a PASS judgment wrapped in a Markdown code fence; `bridge.sh` correctly refused to record it because the output was not a single JSON expression. No formal PASS was accepted. The transport retry uses the same restricted second-cycle scope and requires raw JSON only; the two low notes (both obsolete README phrases and TASK-0004 formatting RED) were incorporated before retry.
- TASK-0001, `sensor-error`: `pnpm format:check` encontrou somente
  `tasks/TASK-0001.json` desformatado após a mudança de status pelo maestro;
  o maestro formatou o arquivo, sem pedir ao worker que tocasse fora do lock.
- TASK-0001, `reference-gap`: a revisão pré-aceite encontrou âncoras existentes
  que não fundamentavam semanticamente certas afirmações de CH, OPS e DASH,
  além de uma suíte INF de política em vez de ciclo de vida. Iteração restrita
  solicitada ao mesmo Architect antes da transcrição.
- TASK-0004, `plant-bug`: o fixture do Inspector escreve o registro OD e o
  README de product antes de criar seus diretórios, e usa um
  `law/invariants.json` que não existe no formato real do corpus. Iteração
  restrita solicitada ao mesmo Inspector antes de TASK-0005.
- TASK-0005, `plant-bug`: o algoritmo de slug do gate colapsou espaços que
  DEVAI preserva ao remover travessão; duas âncoras válidas falharam. Iteração
  restrita do Engineer para alinhar com o checker instalado.
- TASK-0005, `sensor-error` operacional: o worker encerrou `pnpm check` após
  seis minutos sem saída em `blueprints:check`, mas o gerador invoca Prettier
  sincronamente para muitos arquivos e já havia sido lento no bootstrap. O
  maestro matou somente o processo órfão exato deixado por essa execução e
  repete `pnpm blueprints:check` até terminar antes de julgar o gate; nenhuma
  verificação será marcada PASS por ausência de saída.
- CTG-0001, `policy-issue`: regra (e) foi aplicada aos READMEs de diretórios
  ainda vazios (`law/glossary/`, `product/`), embora a Meta 7 e CTG-0001 §6
  condicionem a proibição a conteúdo presente. Architect explicita a condição
  sem mudar o critério; Inspector acrescenta casos vazio/populado e Engineer
  implementa a condição.

**Clarificação C-01-06.1 (sem substituição de critério):** o Architect fixou
em `contracts/CTG-0001.md` que um README com apenas o placeholder gerado e sem
outro artefato substantivo no diretório fica isento até ser preenchido. A
verificação inclui descendentes do diretório para que `product/journeys/` e
`product/use-cases/` tornem `product/README.md` sujeito à regra. C-01-06
continua obrigatório e não há PASS falso em `law/adr/`.

**Gates CTG-0001 após TASK-0005:** `pnpm law:test` 22/22 PASS;
`pnpm verify:law-corpus` PASS; `pnpm check` completo PASS (exit 0) após
`pnpm blueprints:check` isolado PASS. DEVAI: `invariants` 9/9,
`invariant-strategies` população 9, `trace` 9, `test-trace` pass com
descoberta 0, `glob-guards` 89, `schemas` com binding — todos PASS, status
Git idêntico antes/depois. `devai doctor` OK. `sense run spec_depth`
passou com 9 invariantes, 41 ADRs e 0 casos de uso (estes vêm no CTG-0002).
Delivery-review CTG-0001 ciclo 1: `REVIEW`, quatro achados high agrupados em
três correções: equivalência de âncora DEVAI sem variante NFD (Architect,
Inspector e Engineer), resolução OD em qualquer seção do registro (Inspector e
Engineer) e índices/gates nos quatro READMEs de law (Architect transcriber).
Os low pertinentes incluem mover a seção R-0019 após R-0018 no registro,
marcar OD-R19-001 resolvida, fortalecer asserts e documentar C-01-06.1 como
interpretação. Correções em andamento antes de revisão restrita ciclo 2.

- CTG-0001, `plant-bug` (delivery-review ciclo 1): o teste e o gate aceitavam
  `decisao` onde DEVAI aceita somente `deciso`, e o gate restringia ODs válidas
  à seção R-0019. Após o contrato Architect C-01-05.1, Inspector escalado
  codificou os negativos e o positivo de OD-R18 (26 PASS, 2 RED); Engineer
  escalado corrigiu o gate (28/28 PASS). Transcriber Architect completou os
  quatro índices de `law/` com fontes e gates. A seção OD foi movida após
  R-0018 e OD-R19-001 foi marcada resolvida. A fonte de EST acrescentou
  APP-BOAT §Modelo de dados e ADR-0002 §Decision no contrato, invariante e
  trace; DEVAI `invariants` e `trace` PASS. Revisão restrita ciclo 2 da outra
  família: **PASS**, zero findings; 28/28 testes reexecutados pelo reviewer.

## Retomada

**Estado corrente após delivery-review ciclo 1:** TASK-0001…0005 concluídas,
com escaladas Inspector e Engineer para os achados high. `pnpm law:test`
28/28 e `pnpm verify:law-corpus` PASS após correção; revisão restrita ciclo 2
**PASS** e `pnpm check` completo em execução. O Checkpoint 1 abaixo é histórico.
Próximo passo: gates finais, commits segregados, evidência e
PR CTG-0001. CTG-0002 só começa após seu merge.

**Integração pré-PR CTG-0001:** commits segregados por autoridade; branch
local ainda não publicado rebaseado em `origin/main` `4bd1d553` (R-0018
CTG-0003). O conflito no registro OD preservou `OD-R18-005` de `main` e a
seção R-0019 com `OD-R19-001..003`. Após o rebase, os seis membros DEVAI
(`invariants`, `invariant-strategies`, `trace`, `test-trace`, `glob-guards`,
`schemas`) passaram com status Git idêntico antes/depois; `devai doctor` OK;
`pnpm check` completo **PASS** (exit 0, incluindo law:test 28/28,
verify:law-corpus, blueprints:check, typecheck, frontends). O veredito
delivery-review ciclo 2 continua aplicável: a única integração foi o novo
OD-R18-005 no registro canônico e nenhuma regra revisada mudou.

**Emenda de orçamento — Owner, 2026-09-26:** o Owner escreveu nesta conversa
“waive token budget to allow this round to finish”. O limite de 650.000 tokens
de entrada e a parada em 80% ficam dispensados para R-0019. O maestro mantém
`budget.json` como trilha de estimativas, continua a partir deste checkpoint e
preserva os demais gates, locks, revisões e dependências do prompt.

**Retomada após a emenda:** `devai init bind --adopter-policy` gerou
`.devai/config/adopter-policy-binding.json` sem edição manual. Checks DEVAI
`invariants` (9), `invariant-strategies` (população 9), `trace` (9),
`test-trace` (pass com descoberta 0), `glob-guards` (89) e `schemas`
(adopter-policy incluída) passaram. TASK-0004 foi liberada.
`git fetch` encontrou o merge de R-0018 CTG-0001 em `origin/main`
(`289a072f`, PR #128). O `law/adr/README.md` desse commit não contém nenhuma
das duas frases exatas da regra (e). Integrar esse avanço antes de TASK-0005/
delivery-review, após o Inspector terminar, preservando os arquivos em curso.
TASK-0004 terminou com bootstrap de fixture PASS, `node --check` PASS e 18
testes RED só pela ausência do verificador. O maestro fez snapshot com `git
stash push -u`, rebaseou a branch ainda não publicada sobre `origin/main`
(`289a072f`) e aplicou o snapshot sem conflito; HEAD atual `a512158b`.
TASK-0005 liberada sobre essa base.

**Checkpoint 1 — 2026-09-26, janela 1 no limite de 80% do orçamento.**
Os quatro parágrafos deste checkpoint são a fotografia histórica da parada;
as linhas de **Retomada após a emenda** e **Gates CTG-0001** acima descrevem
o estado atual e substituem os pendentes/RED de então.
`budget.json` estima 519.823 tokens de entrada de 650.000 (limiar 520.000),
incluindo planejamento, três chamadas do reviewer (uma falha de transporte) e
TASK-0001 com iteração, TASK-0002 e TASK-0003. Nenhum worker continua em curso.
Último veredito formal: `reviews/prompt-review-2-retry.json` **PASS**; ainda não
houve delivery-review. `git fetch -q origin` neste checkpoint mostrou nenhum
commit novo em `HEAD..origin/main`; branch local `orchestra/law-corpus` segue
sem push/PR e com os artefatos de trabalho pendentes de commit.

**Concluídas:** TASK-0001 (contrato `CTG-0001`, OD-R19-001/002/003, uma
iteração `reference-gap`; `pnpm format:check` PASS após correção do arquivo
de status pelo maestro), TASK-0002 (nove invariantes ativos, nove linhas de
trace, `test_corpus: []`, Prettier local PASS), TASK-0003 (89 schemas
byte-idênticos ao DEVAI 1.5.6, manifesto com 89 hashes, `glob-guards` PASS,
política de seis domínios e índices). `pnpm format:check` está **RED esperado**
porque 58 cópias de schema requerem a entrada em `.prettierignore` de
TASK-0005; não formatar as cópias. Relatórios dos três workers estão em
`reports/` e precisam de `git add -f` até R-0018 ajustar `.gitignore`.

**Pendentes:** TASK-0004…TASK-0011; binding DEVAI de
`law/policy/adopter-policy.json` pelo maestro ainda não executado (gerará
`.devai/config/adopter-policy-binding.json` via `devai init bind` apenas).
CTG-0001 não terminou e não teve delivery-review, evidência, PR nem merge.
CTG-0002 requer merge de CTG-0001 e aceite explícito do Owner antes de seu
próprio merge. R-0018 ainda é dono de `law/adr/README.md`; a regra (e) do
gate ficará RED até as duas frases obsoletas saírem naquele PR.

**Próximos passos da janela 2:** validar status e formatos, executar `devai
init bind` e os checks DEVAI dos artefatos de TASK-0002/0003; despachar
TASK-0004 (Inspector), depois TASK-0005 (Engineer) e repetir os gates de
CTG-0001. Preparar delivery-review pela ponte Claude Opus 5.5, corrigir
achados, segregar commits por autoridade, registrar evidência e abrir PR só
com o gate (e) verde após a integração de R-0018. Depois desenvolver CTG-0002
e CTG-0003 segundo suas dependências e o próximo orçamento. Antes de
qualquer PR, buscar/integrar `origin/main` e reconciliar locks partilhados.

## Leitura

Bootstrap `HEAD=de28867a5b1c0fb2a1fac9eb5a2520ed4b7f54e2`. Lidos na ordem exigida: `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`; `docs/meta/agents/orchestra/{README,model-ladder,waves}.md`; `work/campaigns/C-0002-consolidacao.md`; `.devai/pin/constitution.md` arts. 6, 7, 11–13 e 41; esquemas DEVAI 1.5.6 `invariant`, `trace`, `glossary-entry`, `journey`, `use-cases`, `adopter-policy`, `common-defs` (defs citadas); `docs/framework/product/README.md`, `docs/framework/glossary/domain.md`, `docs/framework/schemas/README.md`, `docs/framework/blueprints/README.md` e os seis `APP.md`; `docs/meta/knowledge-base/steering.md` §H; manuais `architect-blueprint`, `engineer-backend`, `inspector-tests`, `transcriber-docs`; este plano. Lidos também os templates de tarefa, worker e reviewer da orquestra para a decomposição. A lista fechada de fontes específicas de cada worker ficará no respectivo prompt.

Validação DEVAI: `task.schema.json` 2.0.0 compilado com o Ajv 8.20.0 do pacote `@aarusso-nyx/devai@1.5.6`; `TASK-0001`…`TASK-0011` = **11/11 PASS** após formatação. `target_invariants` está vazio até CTG-0001 publicar os IDs, e WF/RN/ADR/OD ficam como referências de prompt/contrato, não como falsos IDs INV. `compositions.json` registra o SHA-256 de cada prompt final e o PC derivado.

Prompt-review pela ponte Claude Opus 5.5: ciclo 1 `REVIEW` (6 high, 5 low); ciclo 2 teve falha de normalização JSON, registrada como `sensor-error`; retry do mesmo ciclo `PASS`, 0 findings, com hashes em `reviews/prompt-review-2-retry.bridge.json`. Nenhum worker foi disparado antes desse PASS.
