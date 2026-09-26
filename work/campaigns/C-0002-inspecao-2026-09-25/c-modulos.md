# Inspeção 2026-09-25 — item (c): Módulos, componentes e partes

**Papel:** Auditor (Constitution Article 6; avaliação somente-leitura).
**Repositório:** `/Users/aarusso/Development/detran` @ `main` (`a92ef731`, após o fechamento de R-0015).
**Escopo:** verificar se todos os módulos, componentes e partes documentados estão presentes, completos e satisfatórios. Nenhum arquivo versionado foi alterado. Nenhum build ou teste foi executado.

---

## 1. Resumo executivo

Os **esqueletos estão completos**, mas os **módulos estão desigualmente completos**. Todo módulo documentado tem um correspondente físico:

- 48 blueprints mapeiam para 48 pacotes de backend e para 67 arquivos de DDL.
- 71 contratos OpenAPI têm os 71 tipos correspondentes gerados em `@detran/api-clients`.
- Todas as fichas de tela têm rota registrada.

O grau de acabamento, porém, varia muito entre as camadas:

| Camada                                              | Situação                                                                                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend (inf / ops / portal / est / dashboard / ch) | **Substancialmente implementado**; poucas pendências pontuais                                                                               |
| RAIT web                                            | Leituras reais (45 rotas L2); **64 comandos do console desligados**; 13 rotas L0; guarda de caso = `true`                                   |
| PORTAL web                                          | 27/27 telas reais; **delegações centrais (defesa, recursos, indicação, pagamento, junta, diligência) = 422 SERVICE_UNAVAILABLE no backend** |
| DASHBOARD web                                       | **18/18 telas em L0** ("indisponível nesta versão"); nenhum cliente HTTP                                                                    |
| TEAT mobile                                         | 59 páginas: **55 são cascas** (título genérico + "carregando"); 4 páginas reais                                                             |
| TEAT web                                            | 52 rotas servidas por **um único componente genérico** que renderiza `JSON.stringify` da resposta                                           |
| BOAT (mobile e web)                                 | **17 telas são cascas** (só título/estado fixo); portas nativas sem implementação, sem Capacitor                                            |
| PEC web / PORTAL mobile                             | Slots reservados por decisão (apenas README)                                                                                                |

**O principal achado é estrutural.** A campanha R-0003…R-0016 entregou contratos, backend, manifestos, guardas, i18n e testes de fronteira. Três rodadas de frontend, porém, fecharam **explicitamente** em nível de "casca" ou "L0":

- R-0012: comandos ficaram em `todo` até R-0007 CTG-0004.
- R-0016: fechou em L0.
- R-0013/R-0015: homologação de UI, sem operação produtiva.

A religação pós-R-0007 **nunca foi executada**. R-0007 fechou em 2026-09-22 às 17:19Z, depois de R-0012 (14:30Z). Há duas consequências:

- Os comandos RAIT existem no backend, mas o console lança `RaitCommandUnavailableError` antes de qualquer HTTP.
- As delegações do PORTAL continuam apontando para `delegacao_indisponivel_r0007`.

Esses gaps estão registrados nas issues abertas #122, #124, #125 e #108–#112, e não constituem dívida oculta. Mesmo assim, significam que **nenhum dos cinco produtos está funcionalmente completo de ponta a ponta**.

---

## 2. Metodologia e fontes

- **Governança lida:** `AGENTS.md`, `README.md`, `BUILD-PLAN.md`, `DESIGN-DECISIONS.md`, `docs/framework/arch/README.md`, `law/*/README.md` e `product/README.md`.
- **Inventário documental:**
  - `docs/framework/product/**`: 732 arquivos; fichas IU, UC, RN, WF, JRN por aplicação.
  - `docs/framework/blueprints/*.json`: 48 blueprints.
  - `docs/framework/contracts/*.openapi.json`: 71 contratos.
  - `docs/framework/arch/*` (build packs, route contracts, error catalogs, i18n seeds).
  - `docs/meta/knowledge-base/backlog.md`, linhas 575–636.
- **Inventário de implementação:**
  - `apps/*/*/src/app/{features,data,core,shared}`.
  - Manifestos `app.route-manifest.ts`.
  - `backend/domains/*/*`, `backend/app/src`, `backend/database/ddl`.
  - `packages/{ui,api-clients,senatran-adapter,sefaz-adapter}`.
- **Trabalho e rastreio:** `work/rounds/R-0007…R-0016/closure.json` (campo `notes`), `gh issue list --state all` e `gh issue view` 96, 99, 122–125.
- **Varredura sistemática:** feita sobre os 3.579 arquivos versionados `.ts/.mjs/.js/.sql/.html/.scss` de `apps`, `backend`, `packages`, `senatran-mock` e `tools`. Termos buscados: `TODO|FIXME|XXX|HACK|NotImplemented|stub|placeholder|it.skip|it.todo|describe.skip|skipIf`, `UNAVAILABLE_IN_VERSION`, `RaitCommandUnavailableError`, `SERVICE_UNAVAILABLE` e `InMemory*`.
- **Scripts ad hoc (somente leitura):**
  - chaves i18n: semente do documento × catálogo do app × chaves literais usadas no código;
  - comandos: FE × contrato × backend;
  - UC e fichas: documento × referência no código;
  - classificação de páginas: "casca" × "real".

---

## 3. Inventário-matriz: documentado × implementado

### 3.1 Por aplicação (frontend)

| App                                                               | Fichas de tela (doc)                                         | Rotas/páginas no código                                                 | Nível real                                                                                                                                                 | UC sem rastreio no código                                              | i18n (semente doc × app)                                                       | Testes                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| **RAIT** `apps/rait/web`                                          | 64 (`IU-RAIT-001` é o inventário + 002…064); 63 em `draft`   | 74 entradas no manifesto; 64 fichas referenciadas; 50 `*.page.ts`       | **45 L2 / 6 L1 / 13 L0**; leituras reais; **64 comandos desligados (M8)**                                                                                  | UC-RAIT-007, 009, 018, 041                                             | 349 → 890 (541 chaves do app ausentes da semente); 0 chaves literais faltantes | 155 specs; **~40 `it.todo`** "comportamento real R-0007 CTG-0004"; sem e2e |
| **PORTAL** `apps/portal/web`                                      | 28 (001 + T01…T27); 27 em `draft`                            | 39 rotas; 27 telas com componente real (nenhuma usa mais o placeholder) | Telas reais; **8 superfícies internas marcam `unavailable_in_version`**; serviços centrais barrados no backend (§4.2)                                      | UC-PORTAL-013 (acesso ao BAT)                                          | 672 chaves no app; **sem semente em `docs/framework/arch/i18n/`**              | 118 specs; 14 `it.todo` citando OD-Pxx; sem e2e/Lighthouse                 |
| **DASHBOARD** `apps/dashboard/web`                                | 19 (001 + D-01…D-18); 18 em `draft`                          | 22 rotas; 18 páginas                                                    | **22/22 rotas L0**; 18/18 páginas iniciam em `UNAVAILABLE_IN_VERSION`; nenhum `HttpClient` em features                                                     | —                                                                      | 307 = 307 (idêntico)                                                           | 64 specs; sem e2e                                                          |
| **TEAT mobile** `apps/teat/mobile`                                | 127 (001 + 126 slugs, compartilhadas com o web); 126 `draft` | 71 `teatRoute` (inclui 12 de BOAT); 59 páginas                          | **55/59 cascas** (`teat.shell.mobile` + `teat.common.loading`); reais: `ait-start`, `ait-review`, `ait-done`, `open-shift` (mais login/MFA de homologação) | UC-TEAT-001, 003–010, 012 (10 de 13)                                   | 528 = 528                                                                      | 25 specs, **todos em nível de app**; 0 specs dentro de `features/*`        |
| **TEAT web** `apps/teat/web`                                      | (mesmas fichas)                                              | 52 `productRoute` em 11 features + 5 páginas de sinistros               | **Um componente genérico** (`ProductPageComponent`) para todas as rotas; renderiza JSON da resposta                                                        | (idem)                                                                 | 528 na semente → 356 no app (177 `teat.forms.homologationAit.*` ausentes)      | 4 specs de app; 0 em `features/*`                                          |
| **BOAT** `apps/boat/mobile` (lib) + `teat/web/features/sinistros` | 18 (001 + S-01…S-12 + W-01…W-05); 17 `draft`                 | 12 páginas S (lib) + 5 páginas W (web)                                  | **17/17 cascas**; componentes compartilhados vazios (`<section>`, `<canvas>`); 6 portas nativas sem implementação                                          | **UC-BOAT-001…013 (13 de 13)**                                         | 114 = 114                                                                      | 3 specs (forms, transitions, extensão)                                     |
| **PEC** `apps/pec/web`                                            | 1 ficha (IU-PEC-001)                                         | Apenas README ("reserved, not planned")                                 | Fora de escopo por decisão (backend-only)                                                                                                                  | UC-PEC-001…014 (14 de 14; paridade por disposição de testes de origem) | —                                                                              | —                                                                          |
| **PORTAL mobile** `apps/portal/mobile`                            | —                                                            | Apenas README ("Deferred to after Phase 5")                             | Adiado por decisão                                                                                                                                         | —                                                                      | —                                                                              | —                                                                          |

### 3.2 Backend (blueprint → pacote → DDL → app)

| Domínio       | Blueprints                                                                                                                      | Pacotes em `backend/domains`                | DDL               | Registrado no app                                                                             | Observações                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `inf`         | 13 (AIT, ALCOHOL, COLLECTION, INFRACTION, MEASURES, NORMATIVE, NOTIFICATION, RAIT-CASE/INTEGRATION/ORG/SESSION/WORKLIST, SPEED) | 13 + `deadlines` (motor sem BP, por design) | 30–39, 57–59      | Sim (todos)                                                                                   | 2 `TODO` em `inf/ait` (§4.6); produtores de eventos RAIT faltantes (§4.5)                                                                   |
| `ops`         | 8 (+ contrato BOOTSTRAP sem BP próprio)                                                                                         | 8 + `core`                                  | 13, 15–18, 21, 30 | 7/8; **`ops/example` não registrado** (fixture do gerador; DDL `30-ops-example.sql` aplicado) | `ops/agency` sem teste próprio                                                                                                              |
| `portal`      | 6                                                                                                                               | 6                                           | 19, 60–65         | Sim                                                                                           | Delegações indisponíveis (§4.2)                                                                                                             |
| `est`         | 1 (CRASH)                                                                                                                       | 1                                           | 19, 70, 75        | Sim                                                                                           | `DOMAIN.md` com `status: stub`                                                                                                              |
| `dashboard`   | 2 (MONITOR, CRASHES)                                                                                                            | 2                                           | 19, 71, 80        | Sim                                                                                           | Job de relatórios ausente (#99); `crashes` sem teste próprio                                                                                |
| `integration` | 1 (RENAEST-MIRROR)                                                                                                              | 1                                           | 72                | Sim                                                                                           | Sem teste próprio (coberto por `backend/app/tests/integration/boat-projections.integration.spec.ts`); ausente do mapa de domínios do README |
| `ch`          | 17                                                                                                                              | 17 (`clinical-reports` ≡ BP-CH-REPORTS)     | 40–56             | Sim                                                                                           | `patients` e `toxicology` sem testes; paridade PEC `READY` (`docs/meta/pec-parity-blockers.json`); `DOMAIN.md` `stub`                       |
| `vam`         | —                                                                                                                               | — (reservado)                               | —                 | —                                                                                             | Conforme README                                                                                                                             |

### 3.3 Pacotes

| Pacote                      | Documentado                                                | Implementado                                                                   | Nota                                                                                                 |
| --------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `packages/ui`               | `detran-ui-guide.md` (shell, breadcrumbs, 3 estados, tema) | 4 classes + reexports STYNX; **confere com o guia**                            | Só 1 spec; falta `group?` em `DetranNavItem` (OD-D16-014)                                            |
| `packages/api-clients`      | ADR-0009                                                   | 71 arquivos de tipos gerados, **apenas tipos**                                 | Consumido só por `rait/web` (10 arquivos) e `portal/web` (4); não usado por dashboard, teat nem boat |
| `packages/senatran-adapter` | ADR-0003, ADR-0008                                         | Portas RENACH, RENAINF, RENAEST, SNE, CDT, WSDENATRAN; 4 testes + specs inline | Adequado                                                                                             |
| `packages/sefaz-adapter`    | Só em `docs/meta/pec-porting-report.md`                    | Adaptador de pagamento PEC (usado por `backend/app/src/pec-sefaz.service.ts`)  | **Sem ADR próprio; ausente do layout em `AGENTS.md`/`README.md`**                                    |

### 3.4 Camada `law/` e `product/` (fontes de invariantes e políticas)

`law/invariants/`, `law/policy/` (apenas JSONs de RC e mutação), `law/schemas/`, `law/glossary/` e `product/` contêm somente o README gerado ("Content is intentionally empty until authored").

**Não há inventário canônico de invariantes nem de políticas em `law/`** contra o qual cruzar a implementação. As políticas efetivas vivem em `backend/domains/shared/src/policy.ts` e as invariantes, dispersas nas fichas RN e nos build packs.

---

## 4. Achados detalhados (com evidência)

### 4.1 RAIT: console sem comandos, guarda de caso permissiva, 13 rotas L0

- **64 comandos desligados.** O comando `grep "throw new RaitCommandUnavailableError"` retorna 64 ocorrências distribuídas assim: `case.client.ts` 19, `worklist.client.ts` 16, `session.client.ts` 15, `org.client.ts` 8, `collection.client.ts` 4 e `integration.client.ts` 2. Exemplo: `apps/rait/web/src/app/data/api/session.client.ts:126`, `:146` e `:162`. O teste `queue.facade.spec.ts:41-51` prova "sem requisição HTTP". O backend já expõe 44 operações de comando (`BP-INF-RAIT-*.commands.openapi.json`) e os serviços correspondentes, por exemplo `backend/domains/inf/rait-session/src/handwritten/rait-session-command.service.ts`.
- **Contrato divergente.** O vocabulário de 64 comandos do FE **não casa 1:1** com as 44 operações do contrato. Vários comandos do FE não têm endpoint nem chave de política no backend: `rait-decision:sign`, `rait-clock:acknowledge-alert`, `rait-member:mandate`, `rait-pool:update`, `rait-calendar:update`, `rait-document:attach-official`, `rait-attendance:confirm` e `rait-case:triage` (grep em `backend/**/*.ts` = 0 arquivos). O contrato usa, por exemplo, `raitCaseDecide` (`commands/decide`), enquanto fichas e formulários usam `inf:rait-decision:sign` (`IU-RAIT-026.md:27`, `rait-web-forms.md:165`). OD-R12-052 confirma que não existe comando para iniciar a triagem.
- **Guarda de caso permissiva.** `caseAccessGuard` devolve `true` (`apps/rait/web/src/app/core/guards/case-access.guard.ts:7`); a verificação de pool, unidade e circunscrição fica só no backend (OD-R12-005).
- **Rotas L0 sem frontend.** As 13 rotas L0 renderizam `PlaceholderPageComponent`: `organizacao/escala`, `organizacao/jeton`, `integracoes/{renainf,renach,falhas}`, `financeiro/{arrecadacao,restituicoes,cobranca,conciliacao}`, `auditoria/exportacoes` e `admin/{parametros,calendario,atos/suspensao}` (`app.route-manifest.ts`, campo `level`). Para várias delas **o backend já existe**: jeton-sheets, exports, suspension-acts, cobrança (BP-INF-COLLECTION) e outbox de integração.
- **L1 somente leitura.** As 6 rotas L1 (`gestao/{producao,capacidade,turmas,qualidade}`, `organizacao/{membros,pools}`) são somente leitura pelos clientes CRUD.
- **Testes pendentes.** Há ~40 `it.todo` em `apps/rait/web/src/app/data/{api,facades}/*.spec.ts`, `features/error-presentation.spec.ts:8-12` e `shared/page-state.component.spec.ts:78-82`. Todos citam "R-0007 CTG-0004", que **já está em `main`**. Não há diretório `e2e/` nem `playwright.config.*` em nenhum app.
- **Fechamento da rodada.** `work/rounds/R-0012/closure.json` (`notes`) registra: "comandos do console deixados como todo até R-0007 CTG-0004". Issue #122, checklist de 13 itens, aberta.

### 4.2 PORTAL: serviços centrais do cidadão indisponíveis no backend

- `backend/app/src/portal-delegation.providers.ts:118-126` compõe como `UnavailableDelegationTarget` os serviços `defesa_previa`, `recurso_jari`, `recurso_cetran`, `indicacao_condutor`, `pagamento`, `junta_medica`, `inf:rait-case:answer-inquiry` (diligência), `lgpd_declaracao` e `emissao_crlv`. O comentário das linhas 5–12 diz: "R-0007 não está em `main` … Trocar os alvos indisponíveis pelos comandos reais é tarefa de R-0014 (M23)". R-0014 fechou antes de R-0007 e **a troca não ocorreu**.
- **Efeito:** `POST /v1/portal/requests` responde 422 `PORTAL.SERVICE_UNAVAILABLE` para os serviços que justificam o portal (`backend/domains/portal/requests/src/handwritten/delegation/delegation.service.ts:84`). Funcionam apenas `consulta_*` e `adesao_sne`/`cancelamento_sne`.
- **Documentos assinados:** CNH-e e CRLV-e retornam `SERVICE_UNAVAILABLE documento_assinado_pendente_r0014` (`backend/domains/portal/projections/src/handwritten/documents.controller.ts:7,111`). As preferências e a elevação de assurance também respondem 422 (`identity/src/handwritten/preferences.controller.ts:46`, `assurance.controller.ts:33`).
- **No frontend** há superfícies "indisponível nesta versão" em:
  - `pagamento.page.ts:84,89` (guia de arrecadação e formato acessível);
  - `pagamento-preservando-recurso.page.ts:97,105`;
  - `exam-list.page.ts:153-159` (entrevista devolutiva, OD-P92);
  - `preferences.page.ts:59`;
  - `points-explainer.page.ts:27`;
  - `own-data.page.ts:185-190`;
  - `crash-detail.page.ts:134-139`;
  - `decisao.page.ts:144`.
- **Testes pendentes:** 14 `it.todo` citando OD-P15/P54/P59/P60/P65/P76/P87/P88/P92 (`features/notificacoes/static-analysis.pair3.spec.ts:87-95`, entre outros).
- **Rastreio:** issue #125 (homologação gov.br/SNE/privacy/CRLV-e) aberta. **Não há issue específica** para religar as delegações a R-0007; isso não consta do checklist de #125.

### 4.3 DASHBOARD: console inteiro em L0

- `apps/dashboard/web/src/app/app.route-manifest.ts:95-96`: "Todas `'L0'` nesta CTG"; 22/22 entradas `level: 'L0'`.
- As 18 páginas iniciam em `mutableAccessor<…>(UNAVAILABLE_IN_VERSION)` (ex.: `features/radar/pages/radar-rait.page.ts:86`). Não há `HttpClient` em `features/` e não há `@detran/api-clients` no app.
- O backend `dashboard/monitor` é o maior módulo do repositório: 152 arquivos, ~19,4 mil linhas, 31 specs, 43 operações de comando. Está pronto e **não é consumido**.
- **Pendências de backend:**
  - Job assíncrono de relatórios ausente (#99). Hoje `complete`/`fail` são chamadas manuais.
  - Bloco A (legal-ceiling) com **2/11 indicadores conectados**, porque os produtores de `rait.clock.flag-changed`, `rait.decision.published` e `rait.case.created` **não existem** em `backend/domains/*/*/src`. O grep encontra apenas consumidores: `dashboard/monitor/.../prescription-risk.projection.ts`, `production.projection.ts` e `portal/projections/.../process-timeline.projection.ts`. A issue #96 atribui isso a R-0007 CTG-0003, que já fechou.
- 19 divergências contratuais provisórias OD-D16-001…019 (policy × route contract × fichas × i18n): `backlog.md:617-636`, issue #123.
- Rastreio: `work/rounds/R-0016/closure.json` `notes` ("A rodada fecha com o console em nível L0"); issue #124.

### 4.4 TEAT e BOAT: frontends de homologação, não de produto

- **TEAT mobile, 55 de 59 páginas são cascas idênticas.** Exemplos:
  - `apps/teat/mobile/src/app/features/medidas/pages/retention.page.ts:9-28`: template `<h1>{{title}}</h1><p role="status">{{status}}</p>`, com `title = 'teat.shell.mobile'` e `status = 'teat.common.loading'`;
  - `features/consultas/pages/vehicle-result.page.ts`: idêntico.

  As páginas chamam `runtime.load(contract)`, mas não renderizam dados, campos nem ações. As exceções reais são `ait-start` (164 linhas), `ait-review` (192), `ait-done` e `open-shift` (153), além das telas de login/MFA de homologação.

- **TEAT web, 52 rotas → 1 componente.** `productRoute({… page: 'AdminOrgsPage' …})` declara nomes de página que **não existem como classes**; todas as rotas usam `ProductPageComponent`. Esse componente exibe `renderValue(...)`, isto é, `JSON.stringify` do payload (`apps/teat/web/src/app/shared/product-page.component.ts:309,341-345`). Não há tabelas, formulários nem estados específicos das fichas (ex.: `IU-TEAT-admin-orgs`, `IU-TEAT-norm-templates`). Há também um arquivo com espaço no nome: `apps/teat/web/src/app/data/kernel STYNX.client.ts`.
- **Escopo declarado:** ADR-0033 e `R-0013/closure.json` `notes` ("closes only the delivered UI/workflow homologation scope … not productive TEAT mobile/field operation"). Issues #108–#112 estão abertas.
- **BOAT, 17 de 17 telas são cascas:**
  - `apps/boat/mobile/src/lib/pages/boat-pages.ts`: 12 componentes que só exibem título e `status = 'boat.states.EM_ATENDIMENTO'` (linha 14).
  - `apps/teat/web/src/app/features/sinistros/sinistros.pages.ts`: 5 páginas W com o mesmo padrão.
  - Componentes compartilhados vazios: `sketch-editor.component.ts:6` (`<canvas>` sem lógica) e `boat-shared.components.ts` (`<section>` vazias).
  - `forms/schemas.ts` (14 schemas) e `navigation/transitions.ts` existem e são testados, mas **não estão ligados** a nenhuma página.
- **BOAT, camada nativa ausente.** O README (`apps/boat/mobile/README.md`) promete "Capacitor, camera, real GPS, signature capture, hardware-backed secure storage and server-side device attestation". Em `apps/boat/mobile/src/lib/ports.ts` há 6 interfaces e tokens de injeção, com **zero implementações** e nenhuma dependência `@capacitor` no repositório. O README continua dizendo "(placeholder)" no título.
- **BOAT, rastreio.** Nenhum dos 13 UC-BOAT é citado no código. Há 13 textos `source_pending` (#119) e ids indefinidos para W-05/S-12 (#118).

### 4.5 Integrações transversais faltantes (backend)

- **Eventos RAIT sem produtor** (ver §4.3), afetando DASHBOARD (bloco A) e PORTAL (linha do tempo do processo).
- **Motor de prazos com calendário fixo de 2026, lido de `docs/`.** Em `backend/domains/inf/measures/src/handwritten/deadlines.ts:71-84`, a produção carrega `../../../../../../docs/framework/arch/fixtures/calendar-2026.json` por caminho relativo. `backend/app/src/dashboard-sweep.providers.ts:11,73` usa o mesmo arquivo (OD-D28). Prazos que atravessam 2027 ou mais (a própria tabela de `rait-deadline-engine.md:153-157` vai até 2030) ignoram feriados, e o runtime depende de um arquivo de documentação. O RAIT, em contraste, usa a tabela `inf.rait_holiday` (`rait-case-command.service.ts`).

### 4.6 Marcadores de débito no código

- Só há **2 `TODO` em código de produção**, ambos em `backend/domains/inf/ait/src/ait-lifecycle.service.ts`:
  - `:619`: `TODO(Phase 3 W3.3 RAIT): accepted AITs become the source for defesa/recurso case intake`. A ponte AIT aceito → caso RAIT não está implementada.
  - `:1276`: `TODO(Phase 3 outbox): invoke this adapter port from @stynx-nyx/outbox`. A publicação RENAINF é síncrona, fora do outbox.
- **0 `FIXME`/`HACK`/`XXX`/`NotImplemented`.** As ocorrências de "stub"/"placeholder" no backend são falsos positivos: placeholders SQL `$1…` e comentários de testes.
- **0 `it.skip`/`describe.skip`.** Há ~60 `it.todo`, todos citando OD ou rodada, conforme CODESTYLE. Também há `describe.skipIf`/`it.runIf` condicionais a ambiente em `backend/app/tests/in-house/*` e `backend/app/tests/real/postgis.real.spec.ts`, o que é legítimo.

### 4.7 Documentação × implementação (lacunas de rastreio)

- **Status das fontes:** 564 de 696 documentos de produto estão em `status: draft`. As fichas de tela implementadas são quase todas `draft`: RAIT 63/64, TEAT 126/127, PORTAL 27/28, DASHBOARD 18/19, BOAT 17/18. `docs/framework/product/domains/{ch,est}/DOMAIN.md` estão com `status: stub`, e `docs/framework/arch/README.md:3` ainda diz "Stub — Phase 2 (W2.1)…".
- **UC sem referência no código:** RAIT 4, PORTAL 1, TEAT 10/13, BOAT 13/13 e PEC 14/14. A matriz UC → código só existe de fato para RAIT, PORTAL e DASHBOARD.
- **i18n:**
  - Sem chaves literais faltantes em nenhum app (as 10 "faltantes" do RAIT são prefixos dinâmicos).
  - A semente `docs/framework/arch/i18n/rait.pt-BR.json` (349) está **defasada** em relação ao app (890).
  - Não existe semente de PORTAL em `docs/framework/arch/i18n/`.
  - As fichas do DASHBOARD divergem da semente em 34 de 36 textos de intro/empty (OD-D16-019).
  - Faltam 5 chaves de forma do `SeverityChip` (OD-D16-009).
- **Implementado sem documentação de arquitetura:**
  - `packages/sefaz-adapter` (sem ADR);
  - `backend/domains/integration` fora do mapa de domínios do README;
  - `packages/api-clients` fora do layout do AGENTS.md;
  - `ops/example` e DDL `30-ops-example.sql` aplicados em produção sem uso.
- **Numeração duplicada de ADRs:** ADR-0006 aparece duas vezes em `DESIGN-DECISIONS.md`, e existem dois arquivos ADR-0024 e dois ADR-0028 em `docs/meta/adr/`.
- **Rodadas desatualizadas:** `work/rounds/README.md:14-26` ainda marca R-0007…R-0016 como "planned", embora todas tenham `closure.json` com `closed_at`.

### 4.8 Cobertura de testes por módulo (contagem de specs)

- **Backend sem spec próprio:** `ch/patients`, `ch/toxicology`, `ops/agency`, `ops/example`, `dashboard/crashes` e `integration/renaest-mirror`. Os três últimos em uso são parcialmente cobertos por `backend/app/tests/**`, que tem 44 specs (e2e/integration).
- **Módulos `ch/*`:** apenas 1 spec unitário de lifecycle cada.
- **Frontend:** RAIT (155 specs para 206 fontes), PORTAL (118/170) e DASHBOARD (64/98) têm cobertura ampla, embora centrada em fronteira e contrato. TEAT web (4/69), TEAT mobile (25/146) e BOAT (3/13) têm **nenhum spec dentro de `features/*`**.
- **Nenhum teste e2e de navegador** (Playwright/Cypress) em todo o repositório.

---

## 5. Lacunas por severidade

### Crítica

| #   | Lacuna                                                                                                                  | Evidência                                                                                  | Rastreio                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| C1  | RAIT: os 64 comandos do console lançam `RaitCommandUnavailableError`; nenhum ato processual é executável pela UI        | `apps/rait/web/src/app/data/api/*.client.ts` (64 `throw`)                                  | #122                                                                         |
| C2  | PORTAL: defesa, recursos JARI/CETRAN, indicação de condutor, pagamento, junta e resposta de diligência = 422 no backend | `backend/app/src/portal-delegation.providers.ts:118-124`                                   | **Sem issue específica** (fora do checklist de #125)                         |
| C3  | DASHBOARD: 18/18 telas L0; backend pronto e não consumido                                                               | `app.route-manifest.ts:95-96`; `features/**/pages/*.page.ts`                               | #124                                                                         |
| C4  | BOAT: 17 telas-casca e 6 portas nativas sem implementação (GPS, câmera, assinatura, croqui, cofre, atestação)           | `apps/boat/mobile/src/lib/pages/boat-pages.ts`, `ports.ts`, `sketch-editor.component.ts:6` | #118–#120 (parcial; **não há issue para as telas nem para a camada nativa**) |

### Alta

| #   | Lacuna                                                                                                                          | Evidência                                                        | Rastreio                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| A1  | TEAT mobile: 55/59 páginas-casca                                                                                                | `apps/teat/mobile/src/app/features/*/pages/*.page.ts`            | #108–#112                                                           |
| A2  | TEAT web: 52 rotas num componente genérico que exibe JSON; as `page:` declaradas não existem                                    | `apps/teat/web/src/app/shared/product-page.component.ts:309,341` | ADR-0033 (escopo de homologação); sem issue para a UI web produtiva |
| A3  | Vocabulário de comandos RAIT (FE 64) × contrato (44 ops) × backend divergente; ≥ 8 comandos sem endpoint nem política           | §4.1                                                             | #122 (implícito)                                                    |
| A4  | Produtores de `rait.clock.flag-changed`, `rait.decision.published` e `rait.case.created` ausentes; bloco A do DASHBOARD em 2/11 | grep em `backend/domains/*/*/src`                                | #96                                                                 |
| A5  | Ponte AIT aceito → caso RAIT não implementada                                                                                   | `backend/domains/inf/ait/src/ait-lifecycle.service.ts:619`       | Nenhum                                                              |
| A6  | RAIT: 13 rotas L0 (financeiro, integrações, jeton, escala, exportações, admin) apesar de backend parcialmente disponível        | `app.route-manifest.ts` (`level: 'L0'`)                          | #122 (parcial)                                                      |

### Média

| #   | Lacuna                                                                                                                                    | Evidência                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| M1  | `caseAccessGuard` = `true` (proteção só no backend/RLS)                                                                                   | `apps/rait/web/src/app/core/guards/case-access.guard.ts:7`     |
| M2  | Calendário de prazos fixo em 2026 e lido de `docs/` em runtime (measures, dashboard)                                                      | `backend/domains/inf/measures/src/handwritten/deadlines.ts:76` |
| M3  | RENAINF publicado de forma síncrona, fora do outbox                                                                                       | `ait-lifecycle.service.ts:1276`                                |
| M4  | Job de relatórios do DASHBOARD ausente                                                                                                    | #99                                                            |
| M5  | CNH-e e CRLV-e assinados indisponíveis; privacy (`@stynx-nyx/privacy`) não montado                                                        | `documents.controller.ts:111`; #125                            |
| M6  | `law/invariants`, `law/policy`, `law/schemas`, `law/glossary` e `product/` vazios, sem base canônica para auditar invariantes e políticas | `law/*/README.md`                                              |
| M7  | Fontes de produto majoritariamente `draft` (564/696), inclusive as fichas já implementadas                                                | frontmatter de `docs/framework/product/**`                     |
| M8  | Nenhum e2e de navegador; TEAT e BOAT sem specs em `features/*`                                                                            | §4.8                                                           |
| M9  | 19 divergências provisórias do DASHBOARD (policy × contrato × fichas × i18n)                                                              | `backlog.md:617-636`; #123                                     |

### Baixa

| #   | Lacuna                                                                                                                                                | Evidência                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| B1  | Semente i18n RAIT defasada (349 × 890); sem semente PORTAL; TEAT web com 177 chaves a menos que a semente                                             | `docs/framework/arch/i18n/*`                        |
| B2  | Rastreio UC → código ausente em TEAT, BOAT e PEC                                                                                                      | §4.7                                                |
| B3  | `packages/sefaz-adapter` sem ADR; `integration` e `api-clients` fora do layout do README/AGENTS                                                       | §3.3                                                |
| B4  | `ops/example` e `30-ops-example.sql` aplicados sem uso                                                                                                | `backend/database/ddl/30-ops-example.sql`           |
| B5  | Arquivo com espaço no nome                                                                                                                            | `apps/teat/web/src/app/data/kernel STYNX.client.ts` |
| B6  | `work/rounds/README.md` desatualizado; ADR-0006, ADR-0024 e ADR-0028 duplicados; `docs/framework/arch/README.md` "Stub"; `DOMAIN.md` de ch/est `stub` | §4.7                                                |
| B7  | Módulos backend sem spec próprio (`ch/patients`, `ch/toxicology`, `ops/agency`, `dashboard/crashes`, `integration/renaest-mirror`)                    | §4.8                                                |

---

## 6. Recomendações

1. **Abrir uma frente de religação pós-R-0007** (prioridade máxima; resolve C1, C2 e parte de A3, A6, M1). Três passos:
   - (a) Trocar os 64 `throw` dos clientes RAIT por chamadas aos contratos `BP-INF-RAIT-*.commands` e converter os ~40 `it.todo` em testes reais.
   - (b) Trocar os `UnavailableDelegationTarget` de `portal-delegation.providers.ts:118-124` pelos comandos RAIT/infração/cobrança reais.
   - (c) Antes de ligar, publicar uma tabela de reconciliação "comando FE ↔ operationId ↔ chave de `policy.ts`", decidindo por ADR/adenda os ≥ 8 comandos sem endpoint.

   Hoje C2 não tem issue própria; convém criá-la.

2. **Publicar os três eventos RAIT faltantes (A4) e a ponte AIT → caso (A5)** no backend. São pré-requisitos de DASHBOARD L2 e da linha do tempo do PORTAL.
3. **Planejar DASHBOARD L2 (#124)** só depois de fatiar ou decidir os OD-D16 (#123). O backend já está pronto, então o esforço é quase só de facades e clientes.
4. **Declarar formalmente TEAT e BOAT como "homologação de UI"** nos READMEs dos apps e no BUILD-PLAN, e abrir issues para a UI produtiva:
   - TEAT web, com uma página por ficha, em vez do componente genérico;
   - BOAT, com as 17 telas ligadas a `forms/schemas.ts` e `transitions.ts`;
   - camada nativa Capacitor com as 6 portas.

   Hoje só existem #108–#112 (TEAT mobile) e #118–#120 (textos, ids, RENAEST).

5. **Calendário de prazos (M2):** mover para tabela versionada por tenant (padrão `inf.rait_holiday`, ADR-0021), com cobertura plurianual, e eliminar a leitura de `docs/` em runtime.
6. **Base canônica de lei (M6/M7):** povoar `law/invariants` e `law/policy`, ao menos com ponteiros para `policy.ts` e as RN, e promover para `approved` as fichas já implementadas, para que auditorias futuras tenham referência estável.
7. **Testes:** criar e2e de navegador mínimo (smoke por papel) para RAIT e PORTAL, e specs por feature em TEAT e BOAT quando deixarem de ser cascas.
8. **Higiene (baixa):** criar ADR para `sefaz-adapter`; atualizar o layout em `README.md`/`AGENTS.md`; renomear `kernel STYNX.client.ts`; retirar `ops/example` do DDL de produção ou justificá-lo; sincronizar as sementes i18n com os catálogos; atualizar `work/rounds/README.md`; e desambiguar os ADRs duplicados.
