# Campanha C-0003: produto primeiro — prévia de frontend, jornadas verticais, endurecimento

> **Continuação atual — 2026-10-18:** R-0033 integrada por PR #191, fechada/selada
> PC-0021. R-0025 retomada de `orchestra/rait-web-wiring` com A-C3-01, main
> conciliada e recorte inicial de admissibilidade aprovado pelo Owner; PR limitado
> sem autorização de merge/close. Quatro tarefas de pré-trabalho preservadas.
> Claim/instrução e aceitação integral permanecem pendentes; R-0022 segue parada.
> R-0034/35 não são iniciadas. OD-C3-009 não é reaberta. A revisão 1 abaixo é
> histórica; versões/dependências atuais estão no plano R-0025 A-C3-01.

**Autoridade:** Architect (Constitution Article 6). Revisão 1 de 2026-10-14, redigida a partir da
diretiva do Owner que **parou** a R-0022 `stynx-sse-tenancy` (C-0002, ação 7c) na mesma data.
**Status atual:** em execução; R-0033 integrada e encerrada, R-0025 retomada
no recorte A-C3-01.

**Status histórico da revisão 1:** proposta com decisões OD-C3-001…006 tomadas,
aguardando autorização para abrir R-0033; naquele momento nenhuma rodada estava aberta. O `AUTHORIZATION.md` de cada rodada só nasce quando o Owner autoriza o respectivo
`prompts/00-maestro.md`. A diretiva está registrada como OD-C3-001; as decisões OD-C3-002…006
(§10) foram **decididas pelo Owner em 2026-10-14**, todas pela recomendação (a) do Architect.
**Governança:** DEVAI 1.5.6, Constituição 1.0.0 (`.devai/pin/constitution.md`), ADR-0022
(orquestras). Esta campanha **não** cria um segundo sistema de governança e **não** reabre as
decisões de produto e de segurança já publicadas (ADRs, OD-R22-07/B5, OD-R22-08/B6, OD-R22-66/B16,
B17). Ela substitui apenas a **ordem** de execução das fases C e D da C-0002 (adenda A-C2-16 em
`work/campaigns/C-0002-consolidacao.md` §14).

## 0. Diretiva do Owner (2026-10-14)

Texto do handoff recebido pelo Architect em 2026-10-14, 21:18 BRT (transcrição; a fonte é o
relatório de parada da R-0022):

> stop the current campaign, commit the work, and hand off a new substitute campaign that delivers
> product frontend surfaces as soon as possible for parallel UI/UX work, then feature completion,
> hardening, certification, and other formalities.

Efeitos imediatos:

1. A R-0022 **para** no checkpoint `c22ea63a9f2c949a18a9877c66d241235af68ac2` (branch
   `codex/detran-r22-adoption-160`, 85 commits à frente de `origin/main`, sem PR). Não há
   fechamento, selo, release ou deploy. A rodada fica no estado **parada** em
   `work/rounds/README.md`; o `AUTHORIZATION.md` da R-0022 existe **só no branch do checkpoint**
   (`origin/main` ainda a lista como "proposta").
2. O checkpoint é **branch de salvamento/referência**, não a base desta campanha (§9).
3. Esta campanha nasce de `origin/main` verificado (`897f01991a17e20253721ecf7c8592f2123a37f0`,
   2026-10-14) numa worktree isolada.
4. A diretiva **não** dispensa nenhuma regra de produto, segurança, tenancy, teste ou integração;
   **não** autoriza push, PR, merge, release, deploy, reescrita de cadeia de provas, escrita em
   repositórios irmãos nem valores de confiança de produção. Cada rodada obtém e registra o seu
   escopo exato antes de produzir efeitos.

## 1. Estado de entrada verificado (2026-10-14)

| Item                   | Valor verificado                                                                                                                                                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remote                 | `https://github.com/aarusso-nyx/detran.git`                                                                                                                                                                                                                 |
| `origin/main`          | `897f01991a17e20253721ecf7c8592f2123a37f0` (merge do PR #177)                                                                                                                                                                                               |
| Worktree desta revisão | `.claude/worktrees/detran-r22-handoff-03f872`, branch `claude/detran-r22-handoff-03f872`, HEAD = `origin/main`, árvore `7cd955f514c1d31a27aae71f88d24673639dc252`                                                                                           |
| Checkpoint R-0022      | `codex/detran-r22-adoption-160` @ `c22ea63a…` (2026-10-14 21:25 BRT), merge-base = `origin/main`; diff 3 318 arquivos (605 em `tools/stynx-storage`, 291 em `work/rounds`, 167 em `backend/domains`, 149 em `scratch/`, 57 em `backend/app`, 14 em `apps/`) |
| Manifesto v16          | `scratch/r22-adoption-160/checkpoint-evidence-manifest-v16.json` no checkpoint: **11/11 referências com SHA-256 e tamanho conferidos**; status `LOCAL_EVIDENCE_NUMERIC_PROBE_QUARANTINED_NO_PROVIDER_ACCEPTANCE`                                            |
| Validador sucessor     | `run_external_process_once.py` SHA-256 `011c374e…1fd87d` ✔; contrato S2 `…NOT_ADMISSION.md` `9e84e6df…e44eef` ✔; revisão do Inspector `0de06539…8c1a6` ✔ (todos `NOT_ADMISSION`/preparação de fonte)                                                        |
| Checkout primário      | `/Volumes/Thiamat II/stech/detran` em `main` local `a92ef731` (atrasado em relação a `origin/main`), sujo (`.gitignore`, `.ignore`, `docs/PRODUCT_BRIEF.md`); **não é alvo de mutação**                                                                     |
| PR aberto              | **#179** `codex/platform-latest` — "update DEVAI to 2.2.0 and STYNX to 1.5.3"; checks verdes (`stack-smoke` skipped), `MERGEABLE`; cria **ADR-0039/0040** com títulos diferentes dos ADR-0039/0040 do checkpoint (colisão de numeração, OD-C3-005)          |
| Pin STYNX em `main`    | `tools/stynx-version.json` = **1.4.0** (R-0021); checkpoint pinava 1.6.1 (B17); PR #179 propõe 1.5.3                                                                                                                                                        |
| Toolchain local        | Node 24.20.0, pnpm 9.15.0, Docker 20.10.11; `pnpm install --frozen-lockfile` OK nesta worktree                                                                                                                                                              |

**Inventário dos frontends em `origin/main`** (fonte: manifestos de rotas e `features/*/*.routes.ts`):

| Superfície      | App                  | Rotas                                           | Estado real                                                                                                                                                         | Fixtures existentes                                                                                 |
| --------------- | -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `rait-web`      | `apps/rait/web`      | 74 entradas (64 páginas, 9 redirects, 1 layout) | **45 L2**, 6 L1, 13 L0; 155 specs; 12 jornadas por papel documentadas (`docs/framework/arch/rait-web-journeys/JW-01…12`); comandos ainda não ligados (R-0025, #122) | `docs/framework/arch/fixtures/rait-fixtures.json` (canônica, 34 kB) + `src/testing/*.stub.ts`       |
| `portal-web`    | `apps/portal/web`    | 38 rotas, 27 telas, 14 módulos, 15 `serviceKey` | PWA com leituras ligadas; delegações desligadas (103 ocorrências de `SERVICE_UNAVAILABLE`; `servico-indisponivel/:serviceKey`); 118 specs                           | `src/testing/http-fixtures*.ts` (ids da seed `70-fixtures-portal.sql`)                              |
| `dashboard-web` | `apps/dashboard/web` | 23 entradas (20 páginas, 2 auxiliares)          | **todas L0** (R-0016); 64 specs; L0 → L2 é R-0026 (#124)                                                                                                            | `src/testing/*.fixture.ts` (camadas, papéis, matriz)                                                |
| `teat-web`      | `apps/teat/web`      | ≈ 60 rotas de produto + 15 `/ux/web/*`          | página genérica JSON (`product-page.component.ts`) sob build **`homologation`** (ADR-0033): `main.homologation.ts` + interceptor que **bloqueia rede**; 4 specs     | `src/testing/teat-web-contract.fixture.ts`; portas de homologação (`shared/homologation-*.port.ts`) |
| `teat-mobile`   | `apps/teat/mobile`   | ≈ 60 rotas + contratos de API mapeados          | homologação (ADR-0033); 25 specs; fora do escopo de ligação (C-0002 §6)                                                                                             | `src/testing/*.fixture.ts`                                                                          |
| `boat`          | `apps/boat/mobile`   | biblioteca (ng-packagr), sem rotas próprias     | páginas `boat-crash-*` montadas no TEAT mobile; web = `apps/teat/web/.../sinistros/`                                                                                | —                                                                                                   |
| `pec-web`       | `apps/pec/web`       | slot reservado                                  | sem código (R-0031)                                                                                                                                                 | —                                                                                                   |
| `portal-mobile` | `apps/portal/mobile` | placeholder                                     | adiado (decisão da fase 4)                                                                                                                                          | —                                                                                                   |

Mecanismos já existentes que a prévia reaproveita: build por configuração (`angular.json`:
`production`/`development`; TEAT web tem `homologation` com entrada própria), `runtime-config.js`
sem segredo, `tools/detran-stack.sh` servindo os quatro apps em 4200…4203 atrás de proxy `/v1`,
`axe-core` 4.13.0 nos apps Portal e RAIT, `pnpm --filter <app> lint|test|build|typecheck`.

## 2. Objetivo

Entregar, **nesta ordem**, com uma rodada por entrega e PR único por rodada (OD-C2-005):

1. **Prévia honesta de frontend, baseada em fixtures**, para revisão UI/UX em paralelo — primeiro a
   superfície e a jornada **classificadas pelo Owner** (OD-C3-002), depois as demais.
2. **Jornadas verticais completas** (UI → cliente gerado → backend de domínio → persistência →
   integrações mock → testes), uma jornada por vez, na ordem do Owner.
3. **Costuras de plataforma** estabilizadas em fatias delimitadas (só o STYNX necessário, adapters
   DETRAN finos), separando lógica testável localmente de aceitação de provedor/confiança.
4. **Endurecimento e certificação do candidato exato** pelos gates existentes.

**Critério de sucesso da campanha** (acrescenta-se ao da C-0002 §5, que continua valendo):

- Toda superfície tem build `preview` reproduzível, servível localmente e exportável como artefato
  estático, com **marca visível** "PRÉVIA — DADOS FICTÍCIOS" e ações não funcionais marcadas.
- Cada jornada classificada pelo Owner tem exemplos de aceitação escritos **antes** do código,
  selo de disponibilidade coerente com o código mesclado
  (`docs/framework/arch/availability/<surface>.availability.json`, esquema de R-0030) e testes
  nos tiers do app e do backend.
- Nenhum teste enfraquecido; `not run`/`blocked` preservados como tal; nenhum valor normativo,
  OID, âncora ou amostra de provedor inventado.
- RLS, tenancy, fronteira SENATRAN (`packages/senatran-adapter`), geração de blueprints/OpenAPI
  e cadeias de prova intactas.

## 3. Princípios que prevalecem

- **Prévia nunca é funcionalidade.** A prévia usa uma configuração de build própria (`preview`),
  com adapters de fixture na fronteira `data/api` de cada app. O bundle `production` **não**
  contém fixture (gate: busca pela marca no `dist/`). Nenhuma rota de prévia chama `/v1`; a rede
  é bloqueada por interceptor, como no TEAT `homologation`. Sem "mock silencioso"
  (`rait-web-frontend.md` §11).
- **Sem dado real, sem contorno de RLS.** Fixtures são as canônicas do repositório
  (`rait-fixtures.json`, seeds, `@example` dos contratos gerados); valores que exigiriam decisão
  normativa ficam `source_pending` visível.
- **Contratos na fronteira.** Autenticação, tenancy e comandos continuam atrás dos contratos
  gerados (`@detran/api-clients`); a equipe de UI/UX itera sem esperar STYNX ou provedor.
- **Aceitação imutável.** Mudança de critério é adenda numerada com decisão do Owner; critério
  substituído aparece no fechamento como não cumprido.
- **Uma rodada, um PR** (OD-C2-005), reviewer da outra família, `devai evidence record`, `round
close` e `round seal` pelos gates existentes. Hotfix de defeito de produto em `main` continua
  em PR próprio (política B9 da R-0022).

## 4. Mapa de rodadas (ordem de execução)

| Fase | Rodada     | Frente                    | Escopo                                                                                                                                                                                                                                                                                                                               | Abre após                        | Maestro (OD-C2-003)   |
| ---- | ---------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | --------------------- |
| P    | **R-0033** | `frontend-preview`        | Contrato do modo prévia; adapters de fixture; configuração `preview` por app; shell/navegação/mapa de rotas/estados representativos (vazio, carregando, erro, acesso negado, responsivo, a11y básica); **prévia da primeira jornada** classificada pelo Owner; artefato estático e URL local de revisão; padrão de ligação fino (v0) | — (`origin/main`)                | Sol 6 (rev. Opus 5.5) |
| J    | R-0025     | `rait-web-wiring`         | Como planejada (64 comandos, `caseAccessGuard`, formulários, L0), **sobre as costuras atuais de `main`** (SSE local 1.4.0, `DetranPolicyGuard`) — adenda A-C3-01 no `plan.md` ao abrir                                                                                                                                               | R-0033                           | Opus 5.5              |
| J    | R-0027     | `portal-delegations`      | Como planejada (defesa, recursos, indicação, pagamento, junta, diligência) — adenda A-C3-02                                                                                                                                                                                                                                          | R-0033                           | Sol 6                 |
| J    | R-0026     | `dashboard-wiring`        | Como planejada (L0 → L2) — adenda A-C3-03; transporte dos produtores RAIT marcado "pendente da fase S" onde dependia do outbox da R-0022                                                                                                                                                                                             | R-0033                           | Opus 5.5              |
| J    | R-0028     | `boat-wiring`             | Como planejada — adenda A-C3-04                                                                                                                                                                                                                                                                                                      | R-0033                           | Sol 6                 |
| J    | R-0029     | `teat-web-wiring`         | Como planejada — adenda A-C3-05; o shell do TEAT web migra para o kit só se R-0033 o entregar                                                                                                                                                                                                                                        | R-0028 (lock `MOD-teat-web-*`)   | Opus 5.5              |
| S    | **R-0034** | `platform-seams`          | Salvamento delimitado do checkpoint (§9): decisão de pin (OD-C3-005), adapters finos, outbox/offline/assinatura em fatias com lógica local testável separada de aceitação de provedor; investigação de custódia de processo **com timebox de 1 janela** → ambiente nativo amd64 provisionado explicitamente ou parada registrada     | pelo menos uma rodada J mesclada | Sol 6                 |
| S    | R-0023     | `authz-unification`       | Como planejada na C-0002                                                                                                                                                                                                                                                                                                             | R-0034                           | Opus 5.5              |
| S    | R-0024     | `stynx-dedup`             | Como planejada na C-0002 (o padrão de ligação v0 de R-0033 é absorvido, não substituído)                                                                                                                                                                                                                                             | R-0034                           | Sol 6                 |
| H    | **R-0035** | `hardening-certification` | Matriz tenancy/RLS × papel; falhas e replay de outbox/offline; ciclo de vida do instalador; segredos/caminhos; CI nativo; consistência de gerados; a11y e desempenho; amostras públicas reais do provedor e insumos de confiança aprovados; OD-C3-004 (k6/mutation)                                                                  | rodadas J e S do candidato       | Opus 5.5              |
| E    | R-0030     | `user-docs`               | Como planejada na C-0002                                                                                                                                                                                                                                                                                                             | rodadas J                        | Sol 6                 |
| F    | R-0031/32  | `pec-web` / `portal-pec`  | Como planejadas na C-0002 (ADR-0034)                                                                                                                                                                                                                                                                                                 | R-0030 / CTG-0001 de R-0031      | Opus 5.5 / Sol 6      |

Ids R-0033…R-0035 são **propostos** e estavam livres em 2026-10-14 (`ls work/rounds`). A ordem
dentro da fase J é a **proposta** do Architect; a ordem definitiva é a classificação do Owner
(OD-C3-002). As rodadas J correm com locks por app, no máximo 3 simultâneas (C-0002 §3.5).

**O que muda em relação à C-0002 (A-C2-16):** a fase D (ligação dos frontends) deixa de esperar a
fase C (R-0022 → R-0023 → R-0024) e passa a abrir depois da prévia (R-0033). Cada plano de rodada J
recebe, no bootstrap, **uma adenda numerada** (A-C3-0n) que: (i) troca a base de abertura
`origin/orchestra/stynx-dedup` por `origin/main`; (ii) substitui as dependências "padrão de
R-0024 / SSE de R-0022 / `policy.ts` como dados de R-0023" pelas costuras atuais de `main`, com o
padrão de ligação **v0** de R-0033; (iii) mantém a seção "Não tocar" para `app.module.ts`,
`detran-runtime.ts`, serviços SSE, `policy.ts` (exceto chaves novas do próprio CTG), documentos,
outbox, offline-sync, pin STYNX, `.github/workflows/`, `.devai/config`, `law/register`, `record/`.
Critérios de aceitação não mudam; o que dependia de entregável da fase C aparece no fechamento
como **não cumprido** ou é transferido por adenda com decisão do Owner, nunca marcado PASS.

## 5. Caminho crítico, marcos e timeboxes

| Marco | Entrega                                                                                                                                                                                                         | Timebox                                                   |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| M1    | Inventário + contrato de prévia + build `preview` da superfície classificada, servível localmente, com shell e estados representativos                                                                          | **1–2 dias úteis** (≈ 1 janela de maestro) — R-0033 O1–O2 |
| M2    | Prévia da primeira jornada (telas da JW-nn classificada), capturas responsivas/a11y, artefato estático, **handoff demonstrado** à equipe UI/UX e **estimativa revisada** a partir das lacunas reais de rota/API | fim de R-0033 (≈ 2 janelas no total)                      |
| M3    | Primeira jornada vertical completa (primeira rodada J)                                                                                                                                                          | estimada no bootstrap dessa rodada                        |
| M4    | Contratos partilhados pelas jornadas seguintes (padrão de ligação, erros, estados, SSE local, guardas)                                                                                                          | ao longo das rodadas J                                    |
| M5    | Endurecimento e certificação do candidato exato (R-0035)                                                                                                                                                        | estimada após M4                                          |

Não se cita a previsão "≈ 25 janelas" da C-0002: ela precede a parada e a nova prioridade. O
esforço total **permanece inestimável** até o Owner classificar as jornadas, o candidato ser
selecionado, as lacunas upstream do STYNX serem dimensionadas e os insumos de provedor/confiança
terem custodiante e data. `work/rounds/R-0022/budget.json` (no checkpoint) é contabilidade
histórica, não orçamento desta campanha. As esperas por provedor/confiança e por API pública do
STYNX são **dependências paralelas**, fora do caminho crítico das prévias.

## 6. Travas de caminho (locks)

| Rodada | Exclusivos                                                                                                                                                                                                                                                                             | Partilhados (regra de convivência OD-C2-005 §12)                                | Não tocar                                                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-0033 | `apps/<superfície>/src/app/{preview,core/preview-*}`, `apps/<superfície>/angular.json` (configuração `preview`), `apps/<superfície>/src/main.preview.ts`, `docs/framework/arch/frontend-preview-mode.md`, `docs/framework/arch/frontend-wiring-pattern.md` (v0), `work/rounds/R-0033/` | `packages/ui` (só adições; `@detran/ui` continua compilando para todos os apps) | `backend/`, `packages/senatran-adapter`, `packages/api-clients/src/generated`, `tools/stynx-version.json`, `.github/workflows/`, `.devai/`, `record/`, `law/register` |
| J      | conforme cada `plan.md` (app próprio; `MOD-shared-policy` serializado entre R-0025/26/27; `MOD-teat-web-*` entre R-0028/29)                                                                                                                                                            | `backend/domains/shared/src/policy.ts` (chaves novas, dois blocos preservados)  | idem R-0033 + costuras SSE/outbox/offline/pin                                                                                                                         |
| R-0034 | `backend/app/src/{detran-signature,r22-stynx-*}.ts`, `backend/database/ddl/{06-storage-*,19-stynx-*,31-inf-signature-*}.sql`, `tools/stynx-storage*`, `tools/stynx-version.json`, ADR nova                                                                                             | `backend/app/package.json` e manifestos de pin (merge único)                    | `apps/`, `record/`, `.devai/`                                                                                                                                         |
| R-0035 | `work/rounds/R-0035/`, relatórios e matrizes                                                                                                                                                                                                                                           | `.github/workflows/` (só com Owner, por PR próprio)                             | código de produto sem defeito apontado por teste                                                                                                                      |

## 7. Condições de parada (todas as rodadas)

1. Vazamento entre tenants, bypass de RLS ou dado real em fixture → **parada imediata** e relato.
2. Prévia que só funciona com mudança de backend, de política ou de pin → fora do escopo da
   rodada P; registrar OD e seguir com o que não depende disso.
3. Fixture que exigiria inventar valor normativo/jurídico → `source_pending` visível, nunca valor
   plausível.
4. Critério de aceitação que só se cumpriria enfraquecendo teste ou gate → não cumprido, relato ao
   Owner.
5. Orçamento da janela a 80 % → checkpoint em `plan.md` §Retomada e parada.
6. `origin/main`, pacote de registry, arquivos protegidos ou posse concorrente mudarem durante a
   seleção do candidato → revalidar antes de qualquer efeito.
7. Investigação de custódia de processo (R-0034) sem prova em **1 janela** → parar, registrar
   `blocked` e pedir ambiente nativo amd64 provisionado; nunca relaxar verificação de identidade.

## 8. Bloqueadores externos, separados do caminho crítico

| Bloqueador                                                                                                                                                                                                 | Custodiante     | Onde é consumido  | Estado                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------- | ------------------------------------------------------------------------------ |
| Produto/custodiante do provedor de assinatura; amostras **públicas** reais assinadas; piso/perfil/revisão/aprovador normativos; âncoras signer/TSA/arquivo; algoritmo/OID/timestamp/revogação/proveniência | Owner (externo) | R-0034, R-0035    | **ausente**; fixtures sintéticas não substituem                                |
| Lacunas de API pública do STYNX: ACK/proveniência atômica legada, histórico rico/SSE por escopo, deadlines explícitos, insumos C02/C03                                                                     | STYNX (issues)  | R-0034, R-0023/24 | em aberto; sem substituto local não documentado                                |
| Resolução de grafo em Linux alvo instalado, CI nativo sobre candidato submetido, ambiente amd64                                                                                                            | Owner / infra   | R-0034, R-0035    | duas sondas QEMU falharam `UNKNOWN_QUARANTINE` (v15/v16); sem retry autorizado |
| Disposição do PR #179 (DEVAI 2.2.0, STYNX 1.5.3) e da numeração ADR-0039/0040                                                                                                                              | Owner           | antes de R-0034   | OD-C3-005                                                                      |

## 9. Salvamento do checkpoint R-0022 (`codex/detran-r22-adoption-160` @ `c22ea63a`)

Regra: **nada é mesclado em bloco.** Peças entram só por comportamento e teste, em rodada com lock
próprio, revisadas. Classificação do Architect (verificação por diff contra `origin/main`):

| Área do checkpoint                                                                                                                                          | Arquivos | Destino                                 | Justificativa                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `work/rounds/R-0022/` (AUTHORIZATION B1…B17, plan, tasks, contracts CTG-0001…0008, reviews, reports, budget)                                                | 291      | **reutilizar como registro**            | Única fonte das adendas do Owner da R-0022; entra em `main` **como está**, no PR de registro da parada (sem código), para que `work/rounds/README.md` e o estado "parada" tenham lastro. Não executa nada. |
| `scratch/r22-adoption-160/` (manifestos v13…v16, relatórios, `available-test-fixtures-v7.json`)                                                             | 9        | **reutilizar como evidência**           | Índice compacto de evidência local, hashes conferidos (§1). Entra no mesmo PR de registro. Não é CI nativo nem aceitação.                                                                                  |
| `scratch/r22-adoption-161/` (preparação do instalador público, sondas QEMU, contrato S2, validador sucessor)                                                | 140      | **adiar → R-0034 (timebox)**            | Preparação de fonte e registros de falha; `NOT_ADMISSION`. Só o validador sucessor (`011c374e…`) e os registros de falha são lidos; o peer S2 provisório não revisado **não** entra.                       |
| `tools/stynx-storage*` (instalação/verificação do storage publicado, planos, guards, custódia) + `backend/database/stynx-storage.json`                      | 606      | **adiar → R-0034 (por fatia)**          | Depende do pin (1.6.x) e de objetos `storage`/`auth.tenants`; cada instalador entra com o teste de integração correspondente e DDL revisado, nunca em bloco.                                               |
| `backend/database/ddl/{06-storage-signed-documents,19-stynx-*,31-inf-signature-policy-guards}.sql`, `apply.sh`, `00-extensions.sql`, `30-inf-normative.sql` | 11       | **adiar → R-0034**                      | DDL manual do esquema `storage` (OD-R22-67) e guardas da matriz OD-R22-08; exigem `verify:rls-ddl` e blueprint regenerado, não editado.                                                                    |
| `backend/app/src/{detran-signature,r22-stynx-offline*,r22-stynx-outbox.adapter}.ts` + e2e `r22-stynx-16*` + fixtures `stynx-signature-test-pki` (TEST_ONLY) | 57       | **adiar → R-0034 (por fatia)**          | Adapters finos e provas sintéticas; valiosos, mas presos ao pin 1.6.x e ao escritor único OD-R22-07. Entram com os testes que os provam, após decisão de pin.                                              |
| `backend/domains/**/package.json` (bump de pin) e `apps/*/package.json`, `pnpm-lock.yaml`, `tools/stynx-version.json`                                       | ≈ 180    | **descartar**                           | Pin 1.6.1 não decidido para a campanha; PR #179 propõe 1.5.3. Refazer a partir da decisão OD-C3-005, nunca por cherry-pick.                                                                                |
| `backend/domains/est/crash/src/handwritten/crash-sync-applier*.ts`                                                                                          | 2        | **avaliar → rodada J (R-0028)**         | Pode conter correção de comportamento independente do pin; entra só com teste vermelho antes.                                                                                                              |
| `docs/meta/adr/ADR-0039-r22-…`, `ADR-0040-r22-…`, `docs/meta/adr/README.md`, `DESIGN-DECISIONS.md`                                                          | 4        | **renumerar / adiar**                   | Colidem com os ADR-0039/0040 do PR #179. Decisão de ordem no OD-C3-005; a ADR do pin da campanha nasce com o próximo número livre **depois** da decisão.                                                   |
| `docs/framework/arch/sse-stream-contract.md`, blueprints/contratos `BP-INF-NORMATIVE-001`, `BP-OPS-OFFLINE-SYNC-001`                                        | 4        | **adiar → R-0034**                      | Gerados devem ser regenerados pelo gerador, não cherry-picked.                                                                                                                                             |
| `.github/workflows/ci.yml`, `.gitignore`, `.prettierignore`, `senatran-mock/docker-compose.yml`, `tools/ci/*`, `tools/orchestra/*`                          | ≈ 10     | **avaliar item a item (R-0034/R-0035)** | Locks partilhados; só com Owner e PR próprio; nunca `paths` em check obrigatório.                                                                                                                          |
| `apps/teat/*`, `apps/rait/web`, `apps/portal/web`, `apps/dashboard/web` (além do pin)                                                                       | 14       | **avaliar → R-0033/J**                  | Mudanças mínimas de pin/SSE; R-0033 lê o diff e reaproveita só o que não depende do pin.                                                                                                                   |
| `scratch/` não versionado (≈ 11 GB), caches de SDK, estado Docker/Postgres, peer S2 provisório                                                              | —        | **não portável**                        | Permanece na custódia local do checkout `/Users/aarusso/.codex/worktrees/detran-r22-adoption-160`; outro host pede exportação deliberada ou reexecuta.                                                     |

## 10. Decisões do Owner

Registro canônico: `docs/meta/knowledge-base/open-decisions-rait.md` §C-0003.

| OD        | Questão                                                                                                                                   | Estado / recomendação do Architect                                                                                                                                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OD-C3-001 | Parar a R-0022 e substituir a ordem das fases C/D da C-0002 pela campanha produto-primeiro                                                | **Decidida pelo Owner em 2026-10-14** (§0). Aplicada em A-C2-16 e nesta campanha.                                                                                                                                                                 |
| OD-C3-002 | Qual superfície e jornada abrem a prévia e a fase J?                                                                                      | **Decidida (a), 2026-10-14:** `rait-web`, jornada JW-01 (analista), abre a prévia e a fase J; seguem `portal-web`, `dashboard-web`, `teat-web`. Base da recomendação: 45 telas L2 reais, 12 jornadas documentadas, fixtures canônicas, 155 specs. |
| OD-C3-003 | Canal de revisão UI/UX                                                                                                                    | **Decidida (a), 2026-10-14:** URL local (`ng serve --configuration preview` / `pnpm stack:start`) + artefato estático `dist/preview/` anexado ao PR da rodada. Publicação em `gh-pages` permanece sem autorização.                                |
| OD-C3-004 | Reintroduzir na fase H os testes excluídos por B17 (k6, mutation)?                                                                        | **Decidida (a), 2026-10-14:** k6 e mutation continuam **não executados e registrados como tal** (B17); R-0035 não os reabre sem nova decisão.                                                                                                     |
| OD-C3-005 | Linha de base de plataforma: mesclar PR #179 (DEVAI 2.2.0 + STYNX 1.5.3, ADR-0039/0040) antes de R-0033? Numeração dos ADRs do checkpoint | **Decidida (a), 2026-10-14:** #179 é decidido **antes** de R-0034 e **independentemente** de R-0033; os ADRs do checkpoint são renumerados para os próximos livres ao entrarem (R-0034). R-0033 abre sobre o pin de `main` no dia da abertura.    |
| OD-C3-006 | O PR de registro da parada (R-0022 `work/rounds/`, `scratch/r22-adoption-160`, índices, OD) pode abrir a partir desta worktree?           | **Decidida (a), 2026-10-14:** PR só de registro da parada, sem código, a partir da worktree de handoff, revisado pela outra família (§11 passo 0).                                                                                                |

## 11. Primeira ação executável (depois da autorização)

0. **PR de registro da parada (OD-C3-006 = a):** a partir da worktree de handoff, acrescentar ao
   commit `18b26b4c` os arquivos de registro do checkpoint (`work/rounds/R-0022/` e
   `scratch/r22-adoption-160/` de `codex/detran-r22-adoption-160` @ `c22ea63a`, sem código), rodar
   `pnpm check` local, abrir **um** PR contra `main` sem código, revisão pela outra família, merge só
   com CI verde. A abertura do PR ainda precisa da autorização de push desta worktree.
1. `git fetch -q origin --prune && git rev-parse origin/main` — se diferente de `897f0199…`,
   reler §1 e §8 (PR #179 pode ter mesclado: pin 1.5.3 e ADR-0039/0040 em `main`).
2. Worktree nova `detran-worktrees/frontend-preview` a partir de `origin/main`, branch
   `orchestra/frontend-preview`; `export NODE_AUTH_TOKEN="$(gh auth token)"`;
   `pnpm install --frozen-lockfile`.
3. Bootstrap de R-0033 pelo `prompts/00-maestro.md`: `AUTHORIZATION.md`, `tasks/`, prompt-review
   único, O1 (TASK-0001 inventário/contrato de prévia; TASK-0002 specs do modo prévia).
4. OD-C3-002…006 já decididas (§10); a O1 e o shell seguem sem espera.

## 12. Fora de escopo (registrado)

Tudo que a C-0002 §6 exclui; execução de k6/mutation (B17) salvo OD-C3-004; escrita, release ou
execução no repositório STYNX; integração externa real; publicação de prévia fora do canal
decidido em OD-C3-003; retomada da maratona de prova em Linux alvo no caminho crítico da prévia.
