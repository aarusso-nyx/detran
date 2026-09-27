# R-0017 — frente `local-stack` (C-0002, ação 4: stack local versionada)

**Status:** **em execução — C-0002 rev. 2, autorizada pelo Owner em 2026-09-26.** Planejada em 2026-09-26
pelo Architect a partir de `work/campaigns/C-0002-consolidacao.md` §2 (fase A, primeira linha) e da
inspeção (b) de 2026-09-25 (`work/campaigns/C-0002-inspecao-2026-09-25/b-camadas.md`, versionado na campanha: achados A5, M3,
M4). Nenhum `AUTHORIZATION.md`, `tasks/` ou `compositions.json` existe: o maestro os cria no
bootstrap, depois da autorização. Maestro **Sol 6** (Codex CLI); reviewer **Opus 5.5** (Claude
Code) pela ponte (C-0002 §4, OD-C2-003); ids de CLI confirmados na primeira tarefa do maestro
(M1). Base prevista: `origin/main` ≥ `a92ef731` **mais** o commit do Owner que versiona a campanha
C-0002 e a ADR-0034. Worktree `/Volumes/Thiamat II/stech/detran-worktrees/local-stack`, branch
`orchestra/local-stack`.
**Concorrência:** nenhum upstream de código. Corre em paralelo com R-0018 `index-state` e R-0019
`law-corpus` (fase A, locks disjuntos). Arquivos partilhados — integrar `origin/main` por merge
antes de cada PR, mantendo as linhas das duas partes: `package.json` (R-0017 acrescenta `stack:*`
e `test:stack`; R-0018 acrescenta `verify:state-index`), `docs/meta/agents/orchestra/waves.md`
(§Histórico), `docs/meta/knowledge-base/open-decisions-rait.md` (uma seção por rodada),
`work/rounds/README.md` (só a linha R-0017; o restante é de R-0018). **Não tocar** em
`tools/README.md`, `docs/start/**`, `docs/meta/adr/**`, `DESIGN-DECISIONS.md` (locks de R-0018) nem
em `law/**` (R-0018/R-0019). Rodadas posteriores que dependem desta: R-0021 (abre após o merge).
**Janelas previstas:** 2 (janela 1: bootstrap com M1 + planejamento + CTG-0001; janela 2: CTG-0002 +
CTG-0003).

## Insumo não versionado (âncora)

Os artefatos a adotar existem **só** no working tree do checkout principal
`/Users/aarusso/Development/detran` (fora de qualquer worktree), medidos em 2026-09-26:

| Artefato                                                            | sha256                                                             | Observação                  |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------- |
| `tools/detran-stack.sh` (386 linhas)                                | `e91977b024b83327f69fde9af065491b8311e6d3c1b1121dd02e09f11f193001` | orquestrador bash           |
| `tools/detran-stack.proxy.json`                                     | `74a36b5c6250020a8636248dc8a41eac65ae6caa28231178b9e14ec362317957` | só `/v1` → `127.0.0.1:3001` |
| `git diff package.json` (9 scripts `stack`, `stack:start…db-reset`) | `b882f80d2448ff0232575520d173930af5d52db102ad8d4aeddebb7bf64eb832` | diff não commitado          |

O primeiro commit do CTG-0001 é a **adoção verbatim** (bytes idênticos, sha256 conferido); só
depois vêm as revisões. Se o sha256 divergir no bootstrap, o Owner editou o insumo: a versão atual
é a fonte, o novo hash vai para §Decisões do maestro e o critério C-01-01 usa o hash novo.

## Metas

1. **Adoção e caracterização** (lição C-0001 "caracterização antes de troca"): versionar o script,
   o proxy e os scripts `stack:*` exatamente como estão; o Inspector escreve testes **offline**
   (sem Docker, sem rede) que fixam o comportamento atual — `help`, erros de argumento (`stop`,
   `status`, `build`, `db-init`, `db-reset` recusam opções; comando desconhecido → exit ≠ 0),
   `db-reset` restrito ao banco descartável, mapa de portas, projetos Angular (`portal-web`,
   `rait-web`, `dashboard-web`, `teat-web`, conferidos em `apps/*/web/angular.json`) — antes de
   qualquer mudança. Divergência não explicada por adenda = FAIL.
2. **Revisão do orquestrador** (contrato do CTG-0001 decide cada item):
   - **Banco:** `DB_NAME=detran_r13` fixo (linhas 17, 52, 61, 169) e o reuso da autorização de
     ensaio `DETRAN_R13_FULL_AUTHORIZED` de R-0013 (`backend/database/apply.sh:25-29`) dão lugar a
     um banco próprio da stack com autorização própria no `case` de `apply.sh` (os casos
     `detran_r7_ctg1_a2` e `detran_r13` ficam intactos — CI e ensaios os usam). Nome e flag no
     contrato; volumes existentes nunca são removidos (migração descrita no runbook).
   - **Imagem pinada:** o digest de `DB_IMAGE` (linha 11) tem de ser **igual** ao de
     `.github/workflows/ci.yml:180` (serviço do `backend-kernel`); teste offline compara os dois.
     `--platform linux/amd64` fica documentado (emulação em Apple Silicon).
   - **Mock SENATRAN:** `senatran-mock/docker-compose.yml` publica `3000:3000` em todas as
     interfaces e o script usa `up --build -d` sem espera. A stack passa a esperar saúde
     (`--wait` ou sondagem de `/health`); `senatran-mock/` **não é editado** (projeto autônomo,
     D-0012; o job `senatran-mock` do CI depende dele) — ajustes por arquivo de override da stack,
     se o contrato exigir.
   - **Portas:** backend 3001 (mock 3000), frontends 4200–4203 e **slot 4204 reservado a
     `apps/pec/web`** (ADR-0034; hoje só `README.md`): a tabela de frontends vira dado único
     (nome, diretório, porta, projeto) e o slot PEC fica **inativo** enquanto
     `apps/pec/web/angular.json` não existir — `status` o lista como "não construído (R-0031)";
     R-0031 ativa sem editar o orquestrador.
   - **Configuração inspecionável:** subcomando novo que imprime a configuração resolvida em JSON
     (portas, banco, imagem, provedores externos e seus estados, perfil de seed), sem segredos —
     base dos testes offline e do runbook.
   - **Healthchecks:** subcomando de saúde que sonda `GET /healthz` e `GET /readyz` do backend
     (`@stynx-nyx/health`, montado em `backend/app/src/app.module.ts:756`), `GET /health` do mock
     SENATRAN, o mock SEFAZ (Meta 4) e `GET /` de cada frontend ativo; `start` ganha espera
     limitada até saúde (timeout no contrato) e falha com o log do serviço culpado.
   - **Papéis locais:** cada código de `DETRAN_LOCAL_ROLES` padrão (linha 243) tem de existir no
     catálogo (`backend/domains/shared/src/roles.ts`); teste offline.
3. **Perfis de seed/fixtures** (`backend/database/seed.sh`): o perfil padrão `fresh` omite
   `40-fixtures-rait-org.sql` e `60-fixtures-rait-integration.sql` (`seed.sh:21-40`), e
   `40-…` declara depender de `20-fixtures-rait.sql` (histórico legado, só em `legacy-upgrade`).
   O Architect **caracteriza** (aplica `fresh` + 40 + 60 num banco de rascunho e registra o que
   falha) e o contrato fixa um perfil novo para a stack — `fresh` + organização e integração
   RAIT compatíveis com o caso `fresh` — sem alterar os perfis `fresh` e `legacy-upgrade` (CI e
   `rait-seed-profiles.integration.spec.ts` os fixam). Fixtures novas derivam das existentes e de
   `docs/framework/arch/rait-fixtures.md`; valor normativo ausente = `source_pending`. **Fixtures
   PEC ficam fora** (ADR-0034 §Decisão 3; R-0031).
4. **Integrações externas locais — mock mínimo ou desligamento explícito** (C-0002 §4: nenhuma
   integração real; #125/#126):
   - **SEFAZ:** no perfil local o `AppModule` aponta para `http://localhost:3999` + `/mock`
     (`backend/app/src/app.module.ts:938-961`), servidor inexistente. Proposta: **mock mínimo**
     servido pela stack (Node sem dependências, dados determinísticos) cobrindo as seis rotas de
     `packages/sefaz-adapter/src/http-adapter.ts:41-61`, com formas de `domain.ts` e da tabela de
     `docs/meta/pec-external-environment-contract.md` §SEFAZ-AM; paridade provada pelo próprio
     `SefazHttpAdapter` contra o mock. Alternativa (b): provedor `off` fail-closed — exige mudar
     `app.module.ts`. Decisão: **OD-R17-001**.
   - **PAdES clínico, biometria, conselho:** os adapters já falham fechados sem variáveis
     (`ch/clinical-reports/src/pades-signing.http-adapter.ts:66-80`,
     `ch/biometrics/src/biometric-verification.http-adapter.ts:32-40`,
     `ch/clinical-network/src/council-verification.http-adapter.ts:23`). Proposta: **desligamento
     explícito** — a stack nunca define essas variáveis, a configuração (Meta 2) os reporta como
     `off` e o smoke prova o 503 fail-closed de uma rota de cada. Mock servido só se o Owner pedir
     (**OD-R17-002**).
   - Demais externos (banco, assinador normativo, Cognito/gov.br, VAPID, SNE): o contrato lista o
     estado real de cada um no perfil `local-sandbox`, lido do código (ex.:
     `inf/collection/src/handwritten/ports/bank/bank.mock.ts`,
     `inf/normative/src/handwritten/package-signer.ts`, `DetranLocalTokenVerifier` em
     `backend/app/src/detran-runtime.ts:300-352`), sem inventar.
5. **`stack:smoke`:** script Node sem dependências que, com a stack de pé, faz por app ativo
   (portal, rait, dashboard, teat; pec quando existir): `GET /` do frontend e **uma** chamada de
   leitura `/v1/...` **pelo proxy do dev server** (prova proxy + backend + RLS + seed), com o
   "login simulado" do perfil `local-sandbox` (`Authorization: Bearer local`; principal composto
   por `DETRAN_LOCAL_ROLES` e claims `DETRAN_LOCAL_*`); mais saúde do backend e dos mocks e os 503
   esperados dos externos desligados. A rota de cada app sai de contrato existente em
   `docs/framework/contracts/*.openapi.json` e é populada pelo perfil de seed da Meta 3. Relatório
   em tabela + JSON no diretório de estado; exit ≠ 0 em qualquer falha.
6. **Runbook pt-BR** em `docs/dev/operations/local-stack.md` (hoje `docs/dev/operations/README.md`
   é stub DEVAI; o README passa a indexar o runbook): pré-requisitos (Node e pnpm de
   `package.json`, Docker, `NODE_AUTH_TOKEN="$(gh auth token)"`), comandos, portas, perfis,
   matriz de externos, `runtime-config.js` por app (`apps/*/web/public/runtime-config.js`), banco
   descartável e migração do volume antigo, diagnóstico. `.env.example` na raiz (já liberado em
   `.gitignore`) só com sobrescritas da stack, **sem credencial real**. `docs/dev/` não é publicado
   pelo site (`docs/site/sidebars.ts`): nenhum link a ele a partir de páginas publicadas.
7. **Job de CI opcional** `stack-smoke` em `.github/workflows/ci.yml`, só `workflow_dispatch`,
   **fora** da proteção de `main` (os 5 checks obrigatórios não mudam); torná-lo obrigatório é
   **OD-R17-003**.

## Tarefas

Modelos pela escada Codex (C-0002 §4): Sol 6 grande; Terra e Luna vigentes nos níveis médio e
pequeno — ids confirmados em M1. Workers por `tools/orchestra/worker.sh`.

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                            | Depende de           | Entrega                                                                                                                                                                                                                                                                                                                                                             |
| --------- | -------------------- | ------------------- | -------------- | --------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Terra / alto   | `MOD-r17-contract`                                              | M1                   | `contracts/CTG-0001.md`: âncora sha256; superfície de comandos (atual + `config`, `health`, `smoke`); tabela de frontends com slot PEC; nome do banco e flag de `apply.sh`; espera de saúde (timeouts); matriz de externos (Meta 4, lida do código); esquema JSON de `config`; critérios C-01-nn                                                                    |
| TASK-0002 | Inspector            | inspector-tests     | Luna / médio   | `MOD-stack-tests`                                               | TASK-0001            | `tools/stack/*.test.mjs` (`node:test`, offline): caracterização do script adotado (C-01-01…) **verde sobre os bytes verbatim**; depois, casos das revisões (vermelhos até TASK-0003): `config` JSON, digest = `ci.yml:180`, papéis ⊂ `roles.ts`, proxy → porta do backend, slot PEC inativo, `apply.sh --full` recusa o banco novo sem flag (sai antes de conectar) |
| TASK-0003 | Engineer             | engineer-backend    | Luna / médio   | `MOD-stack-tool`, `MOD-db-apply`, `MOD-root-package-scripts`    | TASK-0002            | revisões do orquestrador (Meta 2) em `tools/detran-stack.sh` e `tools/stack/`; caso novo em `backend/database/apply.sh`; `stack:config`, `stack:health`, `test:stack` em `package.json`; `test:stack` em `check` (posição no contrato)                                                                                                                              |
| TASK-0004 | Architect            | architect-blueprint | Terra / alto   | `MOD-r17-contract`                                              | CTG-0001 mesclado    | `contracts/CTG-0002.md`: caracterização de `fresh`+40+60 em banco de rascunho (saída anexada); perfil novo (nome, lista fechada de arquivos, fixtures derivadas); mock SEFAZ (rotas, formas, dados, porta 3999, prefixo `/mock`) conforme OD-R17-001; rota de smoke por app com persona e fixture; 503 esperados; critérios C-02-nn                                 |
| TASK-0005 | Inspector            | inspector-tests     | Luna / médio   | `MOD-seed-tests`, `MOD-stack-tests`                             | TASK-0004            | extensão de `backend/domains/inf/rait-case/tests/integration/rait-seed-profiles.integration.spec.ts` (perfil novo: aplica, idempotente, `fresh`/`legacy-upgrade` inalterados); teste de paridade `SefazHttpAdapter` × mock; testes do `smoke` (relatório, exit ≠ 0 em não-2xx, 503 esperado conta como sucesso só onde o contrato manda)                            |
| TASK-0006 | Engineer             | engineer-backend    | Luna / médio   | `MOD-seed`                                                      | TASK-0005            | `backend/database/seed.sh` (perfil novo) e fixtures em `backend/database/seed/`; testes de TASK-0005 verdes                                                                                                                                                                                                                                                         |
| TASK-0007 | Engineer             | engineer-backend    | Terra / médio  | `MOD-stack-tool`, `MOD-stack-mocks`, `MOD-root-package-scripts` | TASK-0005            | mock SEFAZ em `tools/stack/mocks/` (ou flag, conforme OD-R17-001), ligado a `start/stop/status/health`; `tools/stack/smoke.mjs`; script `stack:smoke`; perfil novo como padrão da stack                                                                                                                                                                             |
| TASK-0008 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-dev-docs`                                                  | CTG-0002 mesclado    | `docs/dev/operations/local-stack.md`, `docs/dev/operations/README.md`, `.env.example` — conteúdo transcrito dos contratos CTG-0001/0002 e da saída real de `stack:config`                                                                                                                                                                                           |
| TASK-0009 | Engineer             | engineer-backend    | Luna / baixo   | `MOD-ci-workflow`                                               | CTG-0002 mesclado    | job `stack-smoke` (`workflow_dispatch`) em `.github/workflows/ci.yml`, com o mesmo digest do Postgres e `PACKAGES_READ_TOKEN` como `foundation`; nenhuma mudança nos jobs obrigatórios                                                                                                                                                                              |
| TASK-0010 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-waves`, `MOD-open-decisions`, `MOD-rounds-readme-row`      | TASK-0008, TASK-0009 | `waves.md` §Histórico (linha R-0017 com M1), seção R-0017 em `open-decisions-rait.md` (OD-R17-001…003 e novas), `docs/meta/knowledge-base/backlog.md`, linha R-0017 de `work/rounds/README.md`                                                                                                                                                                      |

CTG-0001 = 0001 → 0002 → **checkpoint (a)** → 0003 (tríade). CTG-0002 = 0004 → 0005 → 0006 ∥ 0007
(locks disjuntos) → **checkpoint (b)**. CTG-0003 = 0008 ∥ 0009 → 0010. **Um PR por CTG.** O CTG
seguinte nasce depois do merge do anterior ou em branch empilhado; nunca commits novos no branch
de um PR aberto.

**Checkpoints (maestro, Engineer):** (a) após TASK-0002: commit de adoção verbatim (sha256 = âncora)
com os testes de caracterização **verdes sobre ele**; só então libera TASK-0003. (b) após
TASK-0006/0007, numa worktree limpa (`git clean -ndx` vazio fora de `node_modules`):
`pnpm stack:db-reset` → `pnpm stack:start` → `pnpm stack:health` → `pnpm stack:smoke` →
`pnpm stack:stop`; saída integral em `reports/checkpoint-b.md` (é a prova do critério de sucesso
C-0002 §5, linha 1). Docker indisponível = `sensor-error`, nunca dispensa.

## Critérios de aceitação (comandos → resultado)

Comandos já existentes em `package.json` de `origin/main` (conferidos em 2026-09-26; os 9
`stack:*` do working tree **não** estão em `main`):

- `pnpm format:check` → OK; `pnpm check` → verde; `pnpm docs:check` → OK.
- `pnpm verify:orchestra-bridge` → OK (ponte usada por M1).
- `pnpm ci:backend-kernel:local` → verde, incluindo `rait-seed-profiles.integration.spec.ts` com o
  perfil novo; `fresh` e `legacy-upgrade` com os mesmos snapshots de antes (lição 9: `seed.sh` faz
  parte do CI; a rodada dona das fixtures prova as duas execuções).
- `pnpm --filter @detran/sefaz-adapter test:unit` → verde (inalterado).

Gates novos (entregáveis; não existem antes da tarefa indicada):

- `pnpm test:stack` (TASK-0003) → todos os casos de TASK-0002 verdes; roda em `pnpm check`.
- `pnpm stack:config` (TASK-0003) → JSON válido; nenhum valor de segredo (o teste busca chaves
  `PASSWORD`/`TOKEN`/`SECRET` com valor não vazio fora do default local do Postgres descartável,
  lista fechada no contrato).
- `pnpm stack:start && pnpm stack:health && pnpm stack:smoke` (TASK-0007) → exit 0 em worktree
  limpa (checkpoint (b)); `pnpm stack:smoke` **falha** (exit ≠ 0) com o backend parado — o gate
  prova que detecta.

Verificações de arquivo:

- `sha256` do primeiro commit de `tools/detran-stack.sh` = âncora (`git show <commit>:tools/detran-stack.sh | shasum -a 256`).
- `git grep -n 'detran_r13' -- tools/ package.json docs/dev/` → vazio.
- `git grep -n 'DETRAN_R13_FULL_AUTHORIZED' -- backend/database/apply.sh` → a linha do caso original continua.
- `git grep -nE '(TOKEN|SECRET|PASSWORD)=.+' -- .env.example` → só o default local do Postgres descartável, se o contrato o admitir.
- `git check-ignore -v work/rounds/R-0017/reports/TASK-0001.md` → ignorado até R-0018 corrigir (por isso `git add -f`); `find work/rounds/R-0017 -type f` = `git ls-files work/rounds/R-0017` antes de cada push.

## Mapa entregável → definições

| Entregável          | Definição                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| orquestrador        | insumo verbatim (§Insumo); `backend/database/apply.sh`, `seed.sh`; `senatran-mock/docker-compose.yml`; `backend/app/package.json` (`start`)                |
| portas e apps       | `apps/{portal,rait,dashboard,teat}/web/angular.json`; `apps/pec/web/README.md`; ADR-0034                                                                   |
| imagem              | `.github/workflows/ci.yml:180`                                                                                                                             |
| perfil local        | `backend/app/src/detran-runtime.ts` (`DETRAN_RUNTIME_PROFILE`, `DetranLocalTokenVerifier`, `isLocalRuntimeProfile`); `backend/domains/shared/src/roles.ts` |
| saúde               | `backend/app/src/app.module.ts:756` (`StynxHealthModule`); `senatran-mock/docker-compose.yml` (healthcheck `/health`)                                      |
| seed                | `backend/database/seed/*.sql`; `docs/framework/arch/rait-fixtures.md`; `rait-seed-profiles.integration.spec.ts`                                            |
| SEFAZ               | `packages/sefaz-adapter/src/{http-adapter,domain}.ts`; `backend/app/src/app.module.ts:938-961`; `docs/meta/pec-external-environment-contract.md`           |
| externos desligados | `backend/domains/ch/README.md`; adapters citados na Meta 4; ADR-0018 (assinatura)                                                                          |
| smoke               | `docs/framework/contracts/*.openapi.json`; `apps/*/web/public/runtime-config.js`; `tools/detran-stack.proxy.json`                                          |
| runbook             | `docs/dev/operations/README.md`; `docs/site/sidebars.ts`; `.gitignore` (`!.env.example`)                                                                   |
| CI                  | `.github/workflows/ci.yml` (jobs `foundation`, `backend-kernel-full`)                                                                                      |

## Riscos

- **Persona única por processo:** o principal local vem do ambiente do backend, não do token. Staff
  (RAIT, DASHBOARD, TEAT) e cidadão (PORTAL, claims `DETRAN_LOCAL_CPF`/`ASSURANCE_LEVEL`) podem
  não caber num só processo. O contrato do CTG-0002 decide (união de papéis e claims, se as guardas
  admitirem; senão, reinício por persona dentro do smoke) e registra a escolha; nunca afrouxar
  guarda para o smoke passar.
- **`--full` em `apply.sh`** é destrutivo: o caso novo só aceita o nome exato do banco da stack com
  a flag; `db-reset` continua recusando qualquer outro nome; nenhum volume é removido.
- **Mock SEFAZ × fronteira:** o mock vive em `tools/stack/`, não no `senatran-mock` (ADR-0003 cobre
  só APIs nacionais) nem em código de runtime; `verify:senatran-boundary` segue verde. Falta ADR
  própria de `packages/sefaz-adapter` (inspeção (c)) — fora de escopo; registrar no backlog.
- **Custo do smoke no CI:** quatro `ng serve` + backend + PostGIS; por isso o job é manual
  (OD-R17-003).
- **Apple Silicon:** PostGIS `linux/amd64` emulado é lento; o timeout de saúde é parâmetro da stack
  com default no contrato, não constante.
- **Paralelismo com R-0018:** gate `verify:state-index` pode entrar em `check` antes do fechamento
  desta rodada; a linha R-0017 de `work/rounds/README.md` (TASK-0010) mantém o gate verde.

## Lições aplicadas (C-0001; C-0002 §4; `waves.md` §Histórico)

- **Relatórios versionados:** `git add -f work/rounds/R-0017/reports/` até R-0018 corrigir o
  `.gitignore`; após cada `git add`, `find` × `git ls-files`.
- **Critérios imutáveis:** mudança só por adenda numerada com decisão do Owner; critério
  substituído vai ao `closure.json` como **não cumprido**. Proibido trocar o smoke integral por
  testes focais (precedente R-0014) ou dispensar o checkpoint (b) por falta de Docker.
- **ODs no registro canônico:** OD-R17-nnn em `open-decisions-rait.md`, seção da rodada, no mesmo PR
  que as cita.
- **Âncora da prova:** `devai evidence record` por CTG, `evidence verify --scope chain` e âncora em
  `record/proofs/chain.json` antes do fechamento; conflito em `chain.json` → aceitar `main` e
  regravar pelo verbo.
- **Orçamento:** `budget.json` obrigatório; a 80 % da janela, checkpoint e parada.
- **Caracterização antes de troca:** adoção verbatim + testes verdes sobre ela antes de qualquer
  revisão (checkpoint (a)).
- Workers não deixam processos da stack vivos: `pnpm stack:stop` ao fim de toda tarefa que a sobe;
  processos perdidos encerrados pelo pid exato do diretório de estado.
- O closure afirma só os 5 checks obrigatórios da proteção de `main`; `stack-smoke` é opcional.
- Nenhuma credencial real em arquivo, log ou relatório; `NODE_AUTH_TOKEN` só por ambiente.

## Adendas

- **A1 (CTG-0001, Architect, 2026-09-26):** `pnpm` imprime banner no comando
  normal; o JSON puro de `stack:config` e verificado por `pnpm -s` ou pelo
  script direto. Os hashes da adocao sao apenas checkpoint (a), nunca assercao
  persistente em `tools/stack/*.test.mjs`. Sem mudanca de escopo ou esquema.
- **A2 (CTG-0001, Architect, 2026-09-26):** apos TASK-0003, o
  `delivery-review-CTG-0001.json` encontrou sensores incompletos de
  C-01-03/07/10/11/12. Autoriza o Inspector a corrigir **somente** os dois
  `tools/stack/*.test.mjs`, sem enfraquecer teste ou mudar producao. Os casos
  novos ficam vermelhos ate a correcao do Engineer. O contrato registra a
  mesma autorizacao; a adocao verbatim e o primeiro commit nao mudam.
- **A3 (CTG-0001, Architect, 2026-09-26):** o segundo delivery-review
  encontrou regressao de `env -i`: opcionais ausentes viram strings vazias e
  contornam os defaults do backend. Inspector acrescenta sensor offline apenas
  em `revision.test.mjs`; Engineer inclui cada opcional no ambiente somente
  quando ela estiver definida. Nenhuma chave de config ou criterio muda.

## Decisões do maestro

- **Owner, OD-R17-001/002/003 (2026-09-27):** aceitas as tres recomendacoes
  da rodada: mock SEFAZ-AM minimo de seis rotas, PAdES clinico/biometria/
  conselho explicitamente `off` com 503 fail-closed no smoke, e job
  `stack-smoke` manual/opcional fora da protecao de `main`. Registro canonico
  em `docs/meta/knowledge-base/open-decisions-rait.md` §R-0017. O CTG-0001
  permanece historicamente `pending`/`proposed_off`; CTG-0002 implementa os
  estados decididos. Nenhum servico externo real foi autorizado.
- **M1 (2026-09-26):** `codex-cli 0.157.1` confirmou `gpt-6-sol`,
  `gpt-5.6-terra` e `gpt-5.6-luna` com `codex exec -m <id> 'responda ok'`
  (saída `ok`, exit 0 para os três). `Claude Code 2.1.283` confirmou
  `claude-opus-5-5` com `claude -p --model claude-opus-5-5 'responda ok'`
  (saída `ok`, exit 0). `tools/orchestra/bridge.sh claude claude-opus-5-5`
  também passou: `reviews/m1-bridge.json` contém
  `{"status":"ok","message":"ok"}` e o hash da invocação está em
  `reviews/m1-bridge.bridge.json`. O maestro atua como Architect no planejamento
  e na revisão e como Engineer nos commits; o reviewer externo atua como Auditor.
- **Ambiente:** o volume `/Volumes/Thiamat II` não está montado nesta máquina.
  A worktree isolada desta sessão foi criada pelo Codex em
  `/Users/aarusso/.codex/worktrees/local-stack/detran` sobre
  `orchestra/local-stack` a partir de `origin/main`. Todo caminho de execução
  da rodada usa essa raiz; o checkout principal segue como insumo somente leitura.
- **Insumo conferido:** `tools/detran-stack.sh` =
  `e91977b024b83327f69fde9af065491b8311e6d3c1b1121dd02e09f11f193001`,
  `tools/detran-stack.proxy.json` =
  `74a36b5c6250020a8636248dc8a41eac65ae6caa28231178b9e14ec362317957`
  e `git diff package.json` no checkout principal =
  `b882f80d2448ff0232575520d173930af5d52db102ad8d4aeddebb7bf64eb832`;
  todos coincidem com a ancora do plano.
- **Revisao escalonada por CTG:** esta janela compoe e revisa os prompts
  TASK-0001…0003 de CTG-0001 antes de despacha-los. Os prompts CTG-0002/0003
  serao compostos sobre os contratos e commits ja integrados de cada CTG e
  receberao prompt-review propria antes de seus workers. As dez tarefas foram
  materializadas e validadas no esquema DEVAI 2.0.0; as ainda nao despachaveis
  mantem `PC-0000000000000000` ate seu prompt final existir.
- **Prompt-review CTG-0001, ciclo 1:** o reviewer externo marcou `REVIEW` com
  tres achados altos: estado SEFAZ antes de TASK-0007, literal do banco antigo
  em testes persistentes e ODs citadas sem registro no PR. Os prompts foram
  corrigidos para SEFAZ `pending` sem sonda em CTG-0001, testes sem esse
  literal e registro das ODs antes do PR; os achados baixos foram incorporados.
  O ciclo 2 verificara os novos hashes antes do despacho.
- **Prompt-review CTG-0001, ciclo 2:** `reviews/prompt-review-2.json` = `PASS`,
  sem achados; os tres hashes conferem com `compositions.json` e com os IDs das
  tarefas. A primeira tentativa do ciclo 2 gerou JSON invalido e foi
  descartada pela bridge (exit 4); o retry com saida estrita passou (exit 0).
- **ODs no CTG-0001:** apos TASK-0001, o maestro/transcritor registra
  OD-R17-001 e OD-R17-002 e qualquer OD nova proposta no contrato na secao
  R-0017 de `docs/meta/knowledge-base/open-decisions-rait.md`, sob lock
  `MOD-open-decisions`, no proprio PR de CTG-0001. TASK-0010 completa a secao
  no CTG-0003 sem substituir o registro inicial.
- **RAIT serve:** CTG-0001 corrige o comando efetivo no tooling e nao edita
  `apps/rait/web/angular.json`, fora do escopo de TASK-0003. O reparo da
  referencia `serve.buildTarget` no app entra no backlog em TASK-0010.
- **TASK-0001:** Architect entregou `contracts/CTG-0001.md` com C-01-01…13;
  `test -s` e `pnpm format:check` passaram. As ODs citadas sao OD-R17-001/002
  e OD-P88 ja existente. A secao R-0017 de
  `docs/meta/knowledge-base/open-decisions-rait.md` foi criada para as duas
  ODs abertas no proprio CTG-0001.

## Concorrência

`origin/main` em `220a4020` inclui C-0002 rev. 2 e ADR-0034 (PR #127) e o
baseline `a92ef731`. Nenhum branch ou PR `orchestra/local-stack` preexistia;
R-0017 continha apenas plano e prompt, sem checkpoint. A frente
`orchestra/index-state` de R-0018 possui worktree separada, sem PR aberto no
bootstrap; R-0019 não apareceu na lista de worktrees. CTG-0001 e CTG-0002
estão livres de upstream; CTG-0003 segue CTG-0002. O branch integrará avanços
de `origin/main` por merge depois de publicado, preservando as linhas
partilhadas de `package.json`, `waves.md`, `open-decisions-rait.md` e
`work/rounds/README.md`.

## Bloqueios

(vazio; OD-R17-001/002/003 decididas pelo Owner em 2026-09-27)

## Triagem

- `reference-gap` (bootstrap): `devai round plan --scaffold --round R-0017`
  retornou `ROUND_ALREADY_EXISTS` (exit 2), pois o plano autorizado ja existe
  em `origin/main`. A rodada foi mantida; `tasks/` e os demais artefatos sao
  criados pelo maestro conforme o esquema DEVAI 2.0.0.
- `sensor-error` (TASK-0002, primeira tentativa): 14/14 testes de
  caracterizacao verdes, mas a suite fixa hash do script permanentemente,
  contem uma assercao tautologica de porta e usa um harness que em uma
  iteracao chamou Docker/psql local; 9 vermelhos de revisao incluem checagens
  da fonte inteira incompatíveis com o contrato. Nenhum container ou processo
  ficou ativo. Uma tentativa corretiva do Inspector antecede checkpoint (a).
- `sensor-error` (TASK-0002, retry Luna): a suite segura de caracterizacao
  passou 13/13 e nao deixou Docker/processo, mas `revision.test.mjs` ainda
  testa o caso antigo autorizado em vez do banco novo, acessa
  `config.services.rait` apesar de o contrato fixar `services.frontends[]`,
  e valida saude sobretudo por regex de fonte. O `PATH` extra de um caso pode
  contornar stubs. A verificacao de ausencia do literal antigo, incluida por
  engano no prompt de retry, so e exigivel **apos** TASK-0003. O relatorio de
  retry apontou caminhos curtos inexistentes no proprio prompt; a leitura
  correta usa o prefixo `work/rounds/R-0017/`. Pela regra §7, a correcao
  seguinte vai a Terra (mesma familia, nivel acima), antes do Engineer.
- `plant-bug` + `sensor-error` (CTG-0001 delivery-review ciclo 1): veredito
  `REVIEW` com oito achados altos e quatro baixos em
  `reviews/delivery-review-CTG-0001.json`. A correcao segue a ordem Inspector
  (A2, somente testes) -> Engineer (implementacao). O primeiro `pnpm check`
  do Engineer foi interrompido durante check longo; o maestro o repetiu em
  sessao propria, ainda sem resultado no momento desta anotacao.
- `plant-bug` + `sensor-error` (CTG-0001 delivery-review ciclo 2):
  `reviews/delivery-review-CTG-0001-2.json` = `REVIEW` por uma regressao
  diretamente causada pela allowlist: cinco opcionais ausentes foram enviados
  como strings vazias. Os doze achados do ciclo 1 estao sanados. A3 autoriza
  um sensor Inspector antes da segunda e ultima correcao Engineer, escalada
  para Sol 6. `pnpm test:stack` passou 42/42 antes desse novo sensor.
- `sensor-error` (gate pos-rebase): `pnpm docs:check` deixou
  `docs/site/build/` ignorado na worktree; `verify:parameter-catalogue`
  varreu seu JavaScript gerado e acusou literais desconhecidos. O artefato
  criado nesta sessao foi removido; o verificador isolado e `pnpm check`
  completo passaram no mesmo codigo, sem alterar sensor, teste ou politica.

## Retomada

- **Retomada autorizada pelo Owner (2026-09-27):** as tres ODs impeditivas
  foram decididas conforme as recomendacoes e registradas na secao canonica.
  CTG-0001 continua mesclado e observado; TASK-0004 esta liberada. Executar
  CTG-0002 pela triade 0004 → 0005 → 0006/0007, checkpoint (b), revisao,
  evidencia, PR/CI/merge e observacao; depois CTG-0003 e fechamento completo.
  O checkpoint de bloqueio abaixo e historico, nao a situacao atual.
- **Checkpoint apos merge CTG-0001 (2026-09-27):** PR #133 mesclado em
  `b1268a35c7758e9d017cf297039ba4cdbf95ba27`; TASK-0001 Architect,
  TASK-0002 Inspector e TASK-0003 Engineer estao concluidas. Ultimo
  delivery-review = `PASS` (ciclo 3); CI final 7/7 verde, inclusive os cinco
  checks obrigatorios. `audit observe --at` no SHA integrado concluiu
  `EV-46bd42141d6f82c5`; sua saida gerada e cadeia foram preservadas no
  commit local `286db9c7`. Evidencia CTG-0001 = generic sequencia 4, head
  antes do merge `ff127d27a3905ae2799fa5a7a4c97b5cf98e833481bc9ee75459eb305bc4a73f`;
  apos a observacao, cadeia valida em
  `609ddca1882f481ad7a7d30a260aeb7a6420ec1b3f8c1853d89f16800de0d032`.
  TASK-0004…0010 seguem `queued`. Proximo: Owner responde OD-R17-001/002/003;
  registrar respostas no cadastro canonico, compor e revisar prompts CTG-0002,
  executar TASK-0004…0007, checkpoint (b), delivery-review e PR/CI/merge;
  depois CTG-0003 e fechamento. Nenhuma tarefa CTG-0002/0003 foi iniciada.
- **CTG-0001 pos-PR #132/#135 (2026-09-27):** a terceira rodada de CI
  do PR #133 passou integralmente, mas R-0019 CTG-0001 entrou em `main`
  durante o CI e exigiu reconciliar `package.json` (`test:stack` junto de
  `law:test`/`verify:law-corpus`), o registro de ODs e a cadeia governada.
  Merge local `72012c25` aceitou a cadeia de `main`; R-0018 OD-R18-002/004
  entrou depois, integrada por `cbd8fe1f` sem conflito. `pnpm check`
  (incluindo stack 42/42, law-corpus e state-index 98/98) e
  `pnpm docs:check` passaram no candidato consolidado. Proximo:
  `evidence record` na cadeia atual, push normal, CI verde, merge do PR #133
  e `audit observe` no SHA integrado. As OD-R17-001/002/003 ainda exigem
  resposta do Owner para CTG-0002/0003.
- **CTG-0001 pos-PR #134 (2026-09-27):** a segunda rodada de CI do PR #133
  passou integralmente (inclusive `verified-local-rc`); antes do merge,
  `origin/main` avancou pela decisao OD-R18-003. O branch publicado integrou
  esse estado por merge `b8d6cfe6`, preservando as secoes R-0017 e R-0018
  de `open-decisions-rait.md`. `pnpm check` e `pnpm docs:check` passaram no
  novo candidato. Regravar prova CTG-0001 com os hashes atuais, fazer push
  normal, aguardar novo CI e so entao mesclar PR #133. O papel Engineer agora
  segue Article 7 da AGENTS.md atualizada (Article 6 rege autoridade por
  caminho). As OD-R17-001/002/003 seguem sem resposta do Owner.
- **CTG-0001 pos-PR #131 (2026-09-26):** PR #133 abriu com
  delivery-review ciclo 3 `PASS` e primeira rodada de CI inteiramente verde.
  `origin/main` avancou pelo fechamento de R-0018; o branch publicado integrou
  esse estado por merge `90078a30`, aceitando `record/proofs/chain.json` de
  `main` conforme §3. `pnpm install --frozen-lockfile`, `pnpm check` (incluindo
  `test:stack` 42/42 e `test:state-index` 98/98) e `pnpm docs:check` passaram
  apos o merge. Proximo: regravar a evidencia CTG-0001 na cadeia atual, push
  normal, aguardar o novo CI, mesclar PR #133 e observar o SHA integrado.
  CTG-0002 continua dependente de OD-R17-001/002, sem resposta do Owner;
  CTG-0003 depende tambem de OD-R17-003. A dispensa de limite de tokens segue
  vigente e nao substitui essas decisoes de dominio.
- **Checkpoint CTG-0001 (2026-09-26):** TASK-0001…0003 concluidas;
  caracterizacao 13/13 verde na adocao, revisao 42/42 verde apos A3.
  Delivery-review ciclos 1/2 = `REVIEW`, ciclo 3 = `PASS` sem achados
  bloqueantes. `pnpm check` e `pnpm docs:check` passaram apos rebase sobre
  `origin/main` (PR #128/#129/#130 de R-0018); o ultimo exigiu
  `npm ci --prefix docs/site` sem mudanca rastreada. Commits de CTG-0001
  existem; evidencia, PR/CI/merge e CTG-0002/3 ainda pendentes.
- **Progresso apos a dispensa:** escalada Terra da TASK-0002 concluida,
  relatorio em `reports/TASK-0002-escalation.md`: caracterizacao 13/13 verde
  sobre a adocao, revisao 3 verdes/10 vermelhos apenas por funcionalidade
  ausente, `pnpm format:check` verde. A verificacao independente do maestro
  repetiu 13/13. TASK-0002 e `completed`; TASK-0003 Engineer esta liberada e
  em curso. `origin/main` avancou pelo PR #128 (R-0018 CTG-0001); preservar
  seus gates de state-index ao integrar antes do PR deste CTG.
- **Retomada autorizada (2026-09-26):** o usuario dispensou o limite de
  tokens para permitir concluir R-0017. O checkpoint abaixo permanece como
  registro historico; a parada por `480000` nao se aplica mais. Continuar
  pela escalada Inspector de TASK-0002 e os gates subsequentes.
- **Escalada TASK-0002:** o prompt corretivo esta em
  `prompts/TASK-0002-escalation.md` (`PC-5f2365599a206e82`); Terra/alto e a
  mesma familia no nivel acima de Luna/medio, conforme §7. A tarefa preserva
  os dois relatos anteriores e admite uma terceira iteracao extraordinaria
  sob `MOD-stack-tests`, sem mudar o escopo do Inspector.
- **Checkpoint da janela 1 (2026-09-26):** estimativa de entrada unica
  `434051/600000` tokens (`budget.json`), com limite operacional de 80 % em
  `480000`. O proximo worker Inspector escalado deve demandar mais que os
  `45949` tokens restantes; nenhuma chamada longa e iniciada nesta janela.
  M1 confirmou `gpt-6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna` e
  `claude-opus-5-5`; bridge funcionou. Prompt-review CTG-0001 ciclo 2 =
  `PASS`; nenhum delivery-review ainda.
- **Concluido:** TASK-0001 Architect (CTG-0001 e A1); adocao verbatim no
  commit `58d6698a202a348aa2bc5c7844f80fc1a6bb74ff` apos rebase nao publicado (antes,
  `470730d60fa5a07fab486d6570a1ed2457c35f0e`; primeiro commit de
  CTG-0001), com tres hashes ancorados conferidos e caracterizacao 13/13 verde
  antes da revisao. `pnpm format:check` passou. O commit contem somente
  `package.json`, `tools/detran-stack.sh` e `tools/detran-stack.proxy.json`.
  As ODs abertas 001/002 foram registradas em `open-decisions-rait.md`, ainda
  sem resposta do Owner. O checkout principal permanece intocado.
- **Em curso:** TASK-0002 Inspector esta em `checkpoint` apos duas tentativas
  Luna; os dois arquivos de teste existem mas **nao estao aceitos**. O proximo
  maestro compoe prompt de escalada para Terra com caminhos completos, corrige
  os sensores de revisao sem enfraquecer C-01-05…13, exige testes offline e
  revalida caracterizacao verde e revisao vermelha somente pelo codigo ainda
  ausente. Nao reexecute os prompts Luna; leia `reports/TASK-0002*.md`,
  `tools/stack/*.test.mjs`, §Triagem e Adenda A1. A suite de caracterizacao
  contem regex estrutural de `with_mock=1` que deve virar verificacao de
  argumento com stubs antes de TASK-0003. A suite de revisao deve testar
  autorizacao do banco `detran_local_stack`/flag propria, array
  `services.frontends`, portas e comandos, override Compose efetivo e
  health/timeout por comportamento offline; evite caminhos fixos e stubs
  contornaveis. O teste Compose pode usar `docker compose config`, sem daemon.
- **Pendente:** marcar TASK-0002 concluida, entao TASK-0003 Engineer; somente
  depois CTG-0001 `pnpm check`, `pnpm docs:check`, delivery-review, commits de
  contrato/testes/implementacao, evidencia, PR, CI e merge. CTG-0002/0003 e
  fechamento da rodada seguem pendentes. A resposta do Owner para
  OD-R17-001/002/003 pode chegar durante a retomada; mantenha premissas
  abertas ate la. Nao faca `db-reset` real fora do banco descartavel da stack.
  `reports/` e ignorado pelo Git; adicionar os relatorios necessarios com
  `git add -f` no commit de entrega, sem versionar transcripts temporarios se
  a politica da rodada nao os pedir.

## Leitura

Base lida: `220a40202bf4ab17a5ce28b882ad96d60755842f` (`origin/main`,
2026-09-26). Ordem do §2 cumprida para: `AGENTS.md`, `CODESTYLE.md`,
`docs/meta/agents/README.md`, `docs/meta/agents/orchestra/{README.md,model-ladder.md,waves.md}`,
`work/campaigns/C-0002-consolidacao.md`, o insumo fora do git ancorado em §Insumo,
`backend/database/{apply.sh,seed.sh,seed/*.sql}` (cabecalhos de seed),
`senatran-mock/docker-compose.yml`, `backend/app/src/{detran-runtime.ts,app.module.ts}`,
`packages/sefaz-adapter/src/{http-adapter,domain}.ts`,
`docs/meta/pec-external-environment-contract.md` §SEFAZ-AM,
`backend/domains/ch/README.md`, `.github/workflows/ci.yml`,
`docs/dev/operations/README.md`,
`docs/meta/knowledge-base/{decision-closure-plan.md,steering.md,open-decisions-rait.md}`
nas secoes pedidas, `docs/meta/adr/ADR-0034-pec-web-frontend.md`, os quatro manuais
de papel e este `plan.md`. Foram conferidos ainda os quatro `angular.json`,
`backend/domains/shared/src/roles.ts` e os adapters locais para a matriz do
CTG-0001. `apps/rait/web/angular.json` referencia `portal-web` no `serve` de
`rait-web`; o contrato deve tratar esse defeito antes do checkpoint (b).
