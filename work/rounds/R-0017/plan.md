# R-0017 — frente `local-stack` (C-0002, ação 4: stack local versionada)

**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner.** Planejada em 2026-09-26
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

(vazio)

## Decisões do maestro

(vazio — M1 obrigatória: ids de CLI confirmados)

## Concorrência

(preenchida no bootstrap)

## Bloqueios

(vazio)

## Triagem

(vazio)

## Retomada

(vazio)

## Leitura

(vazio)
