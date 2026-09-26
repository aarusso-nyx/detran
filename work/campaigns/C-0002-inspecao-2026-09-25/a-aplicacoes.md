# Inspeção 2026-09-25 — Item (a): Aplicações previstas × aplicações existentes

**Papel declarado:** Auditor (Constitution Article 6: avaliação somente leitura).
**Repositório:** `/Users/aarusso/Development/detran` (branch `main`, HEAD `a92ef731`, 2026-09-24).
**Escopo:** verificar se todas as aplicações previstas estão presentes e completas, superfície por superfície.

---

## 1. Resumo executivo

1. **Lista canônica: seis aplicações, e "REAT" não existe.** A documentação de produto define exatamente seis aplicações, cada uma com um `APP.md` `status: approved` em `docs/framework/product/`:
   - **PEC** (`domains/ch/pec/APP.md`);
   - **TEAT** (`domains/inf/teat/APP.md`);
   - **RAIT** (`domains/inf/rait/APP.md`), que significa "Recursos Administrativos de Infrações de Trânsito";
   - **BOAT** (`domains/est/boat/APP.md`);
   - **PORTAL** (`transversal/portal/APP.md`);
   - **DASHBOARD** (`transversal/dashboard/APP.md`).

   A sigla **"REAT" não aparece em nenhum arquivo do repositório**. É um lapso para **RAIT**, não uma aplicação faltante. Além das seis, há três elementos que não são aplicações:
   - `senatran-mock` e `packages/senatran-adapter`, que são transversais;
   - o domínio `vam`, reservado e explicitamente "não construído" (`README.md` §Domain map).

2. **O backend está presente para todas as seis aplicações.** Existem módulos de domínio, DDL, blueprints, contratos OpenAPI e clientes gerados para todas, e todos os módulos estão montados na raiz de composição `backend/app/src/app.module.ts:50-99`. O backend é a camada mais madura do programa.
3. **Os frontends estão muito abaixo do que a documentação e os fechamentos de rodada sugerem.** Maturidade observada, da maior para a menor:

   | Aplicação | Frontend     | Estado observado                                                                                        |
   | --------- | ------------ | ------------------------------------------------------------------------------------------------------- |
   | PORTAL    | web          | Funcional (27 telas reais). Os atos centrais do cidadão estão **desligados no backend**.                |
   | RAIT      | web          | Console só de leitura: **65 métodos de comando lançam `RaitCommandUnavailableError`**.                  |
   | TEAT      | mobile       | Somente homologação sintética. Sem Capacitor/Android.                                                   |
   | TEAT      | web          | Uma página genérica para 58 rotas; só a validação de AIT tem interação.                                 |
   | DASHBOARD | web          | 18 telas em **L0**.                                                                                     |
   | BOAT      | mobile e web | **Stub**: 12 + 5 páginas que só exibem título; 9 componentes vazios; portas nativas só como interfaces. |
   | PEC       | —            | **Nenhum frontend**, embora `IU-PEC-001` proponha 26 telas.                                             |
   | PORTAL    | mobile       | **Adiado**; só existe o README.                                                                         |

4. **Três condições de desbloqueio já estão satisfeitas, mas o código não reagiu:**
   - A R-0007 (backend RAIT) fechou em 2026-09-22 (`work/rounds/R-0007/closure.json`, CTG-0001…0004, PRs #69/#94).
   - Mesmo assim, o Portal mantém `defesa_previa`, `recurso_jari`, `recurso_cetran`, `indicacao_condutor`, `pagamento`, `junta_medica` e diligência como `delegacao_indisponivel_r0007` (`backend/app/src/portal-delegation.providers.ts:5-6,118-124`).
   - O RAIT web continua esperando "R-0007 CTG-0004" para ligar os comandos (`apps/rait/web/src/app/data/api/case.client.ts:216-221`).
   - O cliente gerado `BP-DASH-MONITOR-001` já existe (`packages/api-clients/src/generated/BP-DASH-MONITOR-001.ts`), mas o DASHBOARD continua em L0 alegando que "não tem código" (`apps/dashboard/web/README.md:65`).
5. **Documentação desatualizada ou contraditória sobre as próprias aplicações:**
   - `boat-frontends.md:158` diz que `backend/domains/est/crash` é "inexistente (só README)", mas ele existe desde a R-0010.
   - `teat-frontends.md:154` diz que as telas de sinistro "não entram neste app", enquanto `boat-frontends.md:28` as coloca em `apps/teat/web`, onde de fato estão.
   - `teat-build-pack.md:50` ainda diz "Frontends: só README".
   - Os READMEs de `apps/teat/*` e `apps/boat/mobile` ainda dizem "(placeholder)".
6. **Lacunas sem issue no GitHub:**
   - religar as delegações do Portal ao RAIT (existe só no `backlog.md:103-107`);
   - ligar dados e formulários das 17 telas BOAT;
   - OD-R15-006 (portas nativas por tela);
   - TEAT web produtivo (as issues #108–112 cobrem só o mobile);
   - frontend PEC (nem decisão formal em ADR);
   - Portal mobile.

---

## 2. Metodologia e fontes

- **Documentos de governança:** `AGENTS.md`, `README.md`, `BUILD-PLAN.md`, `DESIGN-DECISIONS.md`, `CLAUDE.md`.
- **Produto:** `docs/framework/product/**/APP.md`, `docs/framework/product/domains/ch/pec/screens/IU-PEC-001.md`.
- **Arquitetura:** `docs/framework/arch/{rait,teat,portal,boat,dashboard}-*.md`, em especial os `*-build-pack.md` e `*-frontends.md`, além de `docs/framework/arch/README.md`.
- **PEC:** `docs/meta/pec-porting-report.md`, `docs/meta/pec-parity-blockers.json`.
- **Backlog:** `docs/meta/knowledge-base/backlog.md`.
- **Rodadas:** `work/rounds/README.md`, `work/rounds/R-*/closure.json` e `plan.md` (R-0007, R-0012, R-0015); `record/proofs/work/generic/R-0002.jsonl`; `work/audit/README.md`.
- **Código inspecionado:**
  - `apps/*/*`: estrutura, `package.json`, manifestos de rota, páginas e clientes de dados;
  - `backend/app/src/app.module.ts`, `backend/domains/*/*`, `backend/database/{ddl,seed}`;
  - `packages/{api-clients,senatran-adapter,ui}`, `senatran-mock/`.
- **GitHub Issues:** `gh issue list --state all --limit 200`, além de `gh issue view` de #118–#126.
- **Métricas:** contagens de arquivos e linhas com `find`/`wc` (excluindo `node_modules` e `dist`), e `grep` de verbos HTTP, `todo(`, `PlaceholderPage`, `level: 'L*'` e `RaitCommandUnavailableError`.
- **O que não foi feito:** nenhum build ou teste foi executado (a regra era não escrever em arquivos versionados). A maturidade é inferida por inspeção estática.

**Níveis de maturidade de tela.** A definição vem de `work/rounds/R-0012/plan.md:174-181` (M13) e foi reusada pelo DASHBOARD:

| Nível | Significado                                                                                   |
| ----- | --------------------------------------------------------------------------------------------- |
| L0    | `DetranErrorStateComponent` com a mensagem "indisponível nesta versão"                        |
| L1    | Lista ou leitura pelos clientes CRUD gerados                                                  |
| L2    | Página real com leitura por facade, componentes e formulário (comando ainda `todo` na R-0012) |

---

## 3. Lista canônica de aplicações

| Aplicação       | Definição canônica                                                  | Nome                                              | Domínio         | Superfícies previstas pela documentação                                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------- | ------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PEC             | `docs/framework/product/domains/ch/pec/APP.md`                      | Prontuário Eletrônico (aptidão do condutor)       | `ch` (RENACH)   | Backend (`domains/ch`, 17 blueprints). A web está **reservada, "no frontend planned"** (`apps/pec/web/README.md:4`). Contradição: `IU-PEC-001.md` propõe 26 telas (12 do console clínico, 7 do console regulatório, 7 do portal do candidato). |
| TEAT            | `docs/framework/product/domains/inf/teat/APP.md`                    | Talonário Eletrônico                              | `inf` + `ops`   | `apps/teat/mobile` (67 telas oficiais), `apps/teat/web` (56 telas), backend `inf/{ait,measures,alcohol,normative,speed}` + `ops/*` (`teat-frontends.md`, `teat-build-pack.md`)                                                                 |
| RAIT            | `docs/framework/product/domains/inf/rait/APP.md`                    | Recursos Administrativos de Infrações de Trânsito | `inf`           | `apps/rait/web` (74 rotas / 63 fichas), backend `inf/rait-*`, `infraction`, `notification`, `collection`, `deadlines` (`rait-build-pack.md`, `rait-web-frontend.md`)                                                                           |
| BOAT            | `docs/framework/product/domains/est/boat/APP.md`                    | Boletim de Acidentalidade de Trânsito             | `est` (RENAEST) | `apps/boat/mobile` (biblioteca de 12 telas carregada pelo shell TEAT), módulo `sinistros` em `apps/teat/web` (5 telas), telas T-18/T-19 no Portal, backend `est/crash`, RENAEST pelo adapter (`boat-frontends.md` §1)                          |
| PORTAL          | `docs/framework/product/transversal/portal/APP.md` ("web + mobile") | Serviços ao cidadão                               | `portal`        | `apps/portal/web` (PWA, 38 rotas) e `apps/portal/mobile` (**adiado**, OD-P12), backend `portal/*`                                                                                                                                              |
| DASHBOARD       | `docs/framework/product/transversal/dashboard/APP.md`               | Monitoramento interno                             | `dashboard`     | `apps/dashboard/web` (18 telas), backend `dashboard/{monitor,crashes}`                                                                                                                                                                         |
| _(transversal)_ | ADR-0003, `README.md`                                               | senatran-mock / senatran-adapter                  | —               | `senatran-mock/` (domínios renach, renainf, renaest, sne, cdt…), `packages/senatran-adapter` (portas Renach, Renainf, Renaest, Sne, Cdt, WsdenatranRead)                                                                                       |
| _(reservado)_   | `README.md` §Domain map, ADR-0001                                   | VAM (RENAVAM)                                     | `vam`           | **Não construir.** Não há `backend/domains/vam`, o que é coerente com a documentação.                                                                                                                                                          |

**Sobre REAT e RAIT:** `grep -rIlw REAT` não retorna nenhum arquivo. A única aplicação de recursos administrativos é a **RAIT**, e nenhuma aplicação está faltando por causa da sigla.

---

## 4. Matriz aplicação × superfície

Legenda: **C** = completo · **P** = parcial · **S** = stub (só estrutura ou título) · **A** = ausente · **R** = reservado ou adiado por decisão · n/a = não previsto.

| Superfície                                                         | PEC                                                              | TEAT                                                                                            | RAIT                                                                                                                         | BOAT                                                                                                             | PORTAL                                                                                                  | DASHBOARD                                                                |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| APP.md de produto                                                  | C                                                                | C                                                                                               | C                                                                                                                            | C                                                                                                                | C                                                                                                       | C                                                                        |
| Especificação de arquitetura (frontends, rotas, erros, build pack) | **A** para frontend (só o relatório de port do backend)          | C                                                                                               | C                                                                                                                            | C (com trechos obsoletos)                                                                                        | C                                                                                                       | C                                                                        |
| Web                                                                | **R/A** (`apps/pec/web` só com README; 26 telas propostas)       | **P** (58 rotas em `/ux/web/*` sobre uma página genérica; homologação)                          | **P** (45 L2, 6 L1, 13 L0; **0 de 65 comandos ligados**)                                                                     | **S** (5 páginas `sinistros` em `apps/teat/web`, só título)                                                      | **P+** (38 rotas, 27 telas reais; atos centrais indisponíveis no backend)                               | **S/L0** (18 telas L0)                                                   |
| Mobile                                                             | n/a (o portal do candidato estaria no PORTAL)                    | **P** (71 rotas, cerca de 20,5 mil linhas TS; homologação sintética; **sem Capacitor/Android**) | n/a                                                                                                                          | **S** (biblioteca `@detran/boat-mobile`: 12 páginas com título, 9 componentes vazios, portas só como interfaces) | **R** (`apps/portal/mobile`: só README, OD-P12)                                                         | n/a                                                                      |
| Domínio backend                                                    | C (17 módulos `ch/*` + `backend/app/src/pec-*.ts`; parity READY) | C (`inf/ait,measures,alcohol,normative,speed`, `ops/*`, R-0005/R-0008)                          | C (`inf/rait-case,worklist,session,org,integration`, `infraction`, `notification`, `collection`, `deadlines`, R-0006/R-0007) | C (`est/crash` com CRUD gerado + `handwritten/boat-commands.*`, `crash-sync-applier`, R-0010)                    | C com delegações desligadas (`portal/{identity,requests,inbox,citizen-service,complaints,projections}`) | C (`dashboard/monitor` com 188 arquivos TS, `dashboard/crashes`, R-0011) |
| DDL (`backend/database/ddl`)                                       | C (40–56)                                                        | C (13, 14, 16–18, 21, 30–33, 37)                                                                | C (19-rait-priority-*, 34–36, 38, 39, 57–59)                                                                                 | C (19-est, 70, 72, 75)                                                                                           | C (19-portal-platform, 60–65)                                                                           | C (19-dashboard, 71, 80)                                                 |
| Blueprints e contratos OpenAPI                                     | C (17 BP-CH + 17 openapi)                                        | C                                                                                               | C (incluindo `*.commands.openapi.json`)                                                                                      | C (`BP-EST-CRASH-001` + commands, `boat-renaest-job.md`, `renaest-mapping.md`)                                   | C                                                                                                       | C (`BP-DASH-MONITOR-001` + commands)                                     |
| Cliente gerado (`packages/api-clients/src/generated`)              | C                                                                | C                                                                                               | C (**não consumido pelos comandos do web**)                                                                                  | C (**não consumido** pelo mobile nem pelo web BOAT)                                                              | C                                                                                                       | C (**não consumido**: não há facade nem `*.client.ts`)                   |
| Seeds e fixtures (`backend/database/seed`)                         | **A** (nenhuma seed `ch`)                                        | C (25–29)                                                                                       | C (20, 21, 40, 50, 60)                                                                                                       | C (70-est, 72)                                                                                                   | C (70-portal, 71)                                                                                       | C (80, 81)                                                               |
| Mock e adapter nacional                                            | C (RenachPort + `senatran-mock/domain/renach`)                   | C (Renainf, WsdenatranRead)                                                                     | C (Renainf, Sne)                                                                                                             | P (RenaestPort + mock; mapeamento provisório, DT-061)                                                            | P (SnePort não chamado de verdade, OD-P16; gov.br não homologado)                                       | n/a                                                                      |
| Issues abertas relacionadas                                        | #126 (decisões)                                                  | #108–#112, #126                                                                                 | #122, #96                                                                                                                    | #118, #119, #120, #126                                                                                           | #125, #126                                                                                              | #96–#100, #123, #124                                                     |

---

## 5. Achados detalhados por aplicação

### 5.1 PEC

- **Backend completo e declarado READY.**
  - `docs/meta/pec-porting-report.md:3`: "READY — … proved superset".
  - `docs/meta/pec-parity-blockers.json` tem `acceptanceBlockers: []`.
  - Os 17 módulos `@detran/ch-*` estão montados em `backend/app/src/app.module.ts:50-69`, com controladores PEC na raiz (`backend/app/src/pec-*.controller.ts`: RENACH, SEFAZ, toxicologia, parâmetros de processo, administração de usuários e de Cognito).
  - A R-0002 (port do PEC) existe só como linha de prova `record/proofs/work/generic/R-0002.jsonl` (1 linha, `verdict: READY`, 76/76 critérios). Isso é intencional segundo `work/rounds/README.md:12`, mas **não há** `plan.md` nem `closure.json` em `work/rounds/R-0002/`. É uma lacuna só de papéis de trabalho.
- **Frontend inexistente, com conflito documental.**
  - `apps/pec/web/README.md:1-6`: "Reserved slot only … **no frontend planned** … Orchestration rule 7: deferred by decision".
  - Por outro lado, `docs/framework/product/domains/ch/pec/screens/IU-PEC-001.md` (status `reviewed`, `apps: [pec, portal]`) inventaria 26 telas. O próprio documento conclui que "C-01 a C-11 formam um fluxo completo e implementável" (linhas 26-92).
  - O APP-PEC descreve o PEC como plataforma que DETRAN e clínicas "usam" para produzir o laudo. Sem console clínico, a operação depende inteiramente de API.
  - Não há ADR registrando a decisão de não fazer frontend PEC (busca em `docs/meta/adr/`). A "Orchestration rule 7" não está em documento versionado localizável.
  - As telas do candidato (P-01…P-06) se sobrepõem parcialmente ao Portal (T-20 exames, junta médica). A delegação `junta_medica` está desligada (ver 5.5).
- **Testes esparsos nos módulos `ch`.** A maioria dos módulos tem 1 arquivo de teste; `ch/patients` e `ch/toxicology` têm 0. Parte da prova está na raiz do app (`pec-*.spec.ts`).
- **Não há seed ou fixture `ch`** em `backend/database/seed/`.

### 5.2 TEAT

- **Mobile (`apps/teat/mobile`):** 173 arquivos, cerca de 20,5 mil linhas TS, 25 specs, 71 rotas em 8 módulos (`features/{ait,alcoolemia,complementares,consultas,medidas,sincronizacao,sinistro,turno}`). Os componentes de domínio existem em `shared/`.
  - Segundo a adenda R-0013 (`docs/framework/arch/teat-build-pack.md:11-40`, ADR-0033), a entrega é **homologação sintética**: "HOMOLOGAÇÃO — SIMULAÇÃO", HTTP remoto bloqueado, sem ato oficial.
  - O README ainda diz "Angular/Capacitor", mas **não há dependência Capacitor nem projeto `android/`** (`find apps -name capacitor.config* -o -name android` retorna vazio).
  - A produção está nas issues #108–#112 (autoridade offline E2, Android/GMS820, validador V01–V11, ciclo AIT e numeração, gate de release).
- **Web (`apps/teat/web`):** 75 arquivos, cerca de 6,2 mil linhas TS, 4 specs, 58 rotas.
  - Todas as rotas (exceto `sinistros`) carregam o mesmo `ProductPageComponent` genérico (`apps/teat/web/src/app/data/route-contract.ts:43-46`). Esse componente só tem interação para `login` e `ait-validation` (`apps/teat/web/src/app/shared/product-page.component.ts:44,60,142`).
  - As facades por feature são classes vazias de 5 linhas (por exemplo `features/admin/admin.facade.ts`).
  - Há 1 chamada de escrita HTTP em todo o app.
  - **Divergência com a especificação:** `teat-frontends.md` §5 (linhas 130-154) exige rotas em português e módulos/telas novas: `/sincronizacao/*` (conflitos, numeração, recibos), `/fiscalizacao/aits/concorrencia`, `/fiscalizacao/cancelamentos`, `/evidencias/acessos`, `/conta`, `/normativos/tabelas-metrologicas`, `/administracao/homologacoes|versoes|campo/*`.
  - O código usa mounts `/ux/web/<slug>` (`teat-web-contract.md:125+`) e **nenhuma dessas rotas novas existe** (grep por `concorren|cancel|acessos|metrolog|sincronizacao` nas rotas web retorna vazio).
  - **Nenhuma issue** cobre o TEAT web produtivo.
- **Anomalia de nomenclatura:** o arquivo `apps/teat/web/src/app/data/kernel STYNX.client.ts` tem espaço no nome e é referenciado como chave `'kernel STYNX'` (`route-contract.ts:120`, `web-client.registry.ts:10,25`). Parece artefato de substituição em massa.
- **Documentação obsoleta:**
  - `apps/teat/web/README.md` e `apps/teat/mobile/README.md` ainda dizem "(placeholder)".
  - `teat-build-pack.md:50` diz "Frontends: só README". Esse é o estado de 2026-09-13, sem nota de atualização na tabela.

### 5.3 RAIT (a sigla que a pergunta chamou de "REAT")

- **Backend completo.** As rodadas R-0006 e R-0007 foram fechadas. `work/rounds/R-0007/closure.json` tem CTG-0004 com o headline "organização, cobrança, integrações e SSE do RAIT, sete contratos OpenAPI de comandos … clientes tipados (PR #94)". Os módulos `inf/rait-*`, `infraction`, `notification`, `collection` e `deadlines` estão montados (`app.module.ts:83-91`).
- **Web (`apps/rait/web`):** 364 arquivos, cerca de 52 mil linhas TS, 155 specs. Manifesto de 74 entradas com **45 L2, 6 L1 e 13 L0** (`apps/rait/web/src/app/app.route-manifest.ts`), coerente com `work/rounds/R-0012/route-manifest.md:150`.
  - As 13 rotas L0 são: `organizacao/escala`, `organizacao/jeton`, `integracoes/{renainf,renach,falhas}`, `financeiro/{arrecadacao,restituicoes,cobranca,conciliacao}`, `auditoria/exportacoes`, `admin/{parametros,calendario,atos/suspensao}`.
  - **Comandos não ligados:** 65 ocorrências de `throw new RaitCommandUnavailableError(...)` nos clientes (`case.client.ts` 19, `session` 15, `worklist` 16, `org` 8, `collection` 4, `integration` 2), cada uma com `todo(R-0007 CTG-0004)`.
  - A R-0007 CTG-0004 **já foi mesclada** (fechamento em 2026-09-22), então a condição de desbloqueio está satisfeita e não foi executada.
  - Na prática, o console RAIT é só leitura: nenhum ato processual (protocolar, triar, admitir, distribuir, votar, assinar) é executável.
  - `caseAccessGuard` também é `todo` (`core/guards/case-access.guard.ts:3`).
  - Tudo isso está rastreado na **issue #122**.

### 5.4 BOAT

- **Backend completo.**
  - `backend/domains/est/crash` tem 12 entidades, repositórios, serviços e controladores gerados, além de `handwritten/boat-commands.controller.ts`, `boat-commands.service.ts` e `crash-sync-applier.ts`.
  - DDL `70-est-crash.sql` e `75-boat-renaest-job.sql`; job e transmissão em `backend/app/src/boat-renaest-job.*` e `boat-renaest-transmission.service.ts`; documentos PDF/A em `boat-documents.ts`.
  - Projeções `dashboard/crashes` e `integration/renaest-mirror` (estas duas **sem testes**).
- **Mobile (`apps/boat/mobile`, biblioteca `@detran/boat-mobile`):** 17 arquivos e cerca de 1,9 mil linhas, das quais cerca de 860 são testes.
  - As 12 páginas usam o mesmo template, que só mostra `<h1>` e `<p role="status">` (`apps/boat/mobile/src/lib/pages/boat-pages.ts:5-10`, 12 `@Component`).
  - Os 9 componentes de domínio (`SeverityPicker`, `ConditionsQuad`, `InvolvedList`, `VictimCard`, `SceneDutyChecklist`, `DamageWitnessForm`, `CrashLinksPanel`, `PreliminaryReportButton`, `MinimumDataChecklist`) renderizam só `<section [attr.aria-label]>` vazia (`shared/boat-shared.components.ts:6`). `SketchEditorComponent` é igual (11 linhas).
  - `ports.ts` define só interfaces e `InjectionToken` para GPS, câmera, assinatura, croqui, armazenamento cifrado e atestação. **Não há implementação Capacitor nem dependência Capacitor.**
  - Não há `HttpClient` nem chamada `/v1/est/*` no pacote.
  - Existem, com teste: schemas zod (`forms/schemas.ts`), gates, `transitions.ts` (244 linhas) e o catálogo i18n.
  - A integração com o shell TEAT existe: `apps/teat/mobile/src/main.ts:6,107` e `features/sinistro/sinistro.routes.ts` com carga dinâmica.
- **Web (módulo `sinistros` em `apps/teat/web`):** 5 páginas que só exibem título e uma frase legal fixa (`apps/teat/web/src/app/features/sinistros/sinistros.pages.ts`), sem dados.
- **Maturidade declarada × observada:**
  - `boat-build-pack.md` §WP-B5 declara "executado no escopo comprovado" e admite que o "binding completo dos campos/formulários permanece handoff futuro".
  - `apps/boat/mobile/README.md` promete a "camada nativa nova (Capacitor, câmera, GPS real, assinatura, secure storage, atestação)", que **não existe**.
  - O observado equivale a **L0/stub** em todas as 17 telas.
- **Documentação contraditória:**
  - `boat-frontends.md:158` (atualizado em 2026-09-24) diz que `est/crash` é "inexistente (só README)", o que é falso.
  - `boat-frontends.md:28` coloca a retaguarda em `apps/teat/web`, enquanto `teat-frontends.md:154` diz que "Sinistros (060–063) pertencem ao BOAT web e não entram neste app".
  - `backend/domains/est/README.md` ainda diz "Populated in Phase 5".
- **Issues:** #118 (identificadores de W-05 e S-12), #119 (13 textos `source_pending`), #120 (RENAEST real). **Sem issue** para ligar dados e formulários das 17 telas nem para OD-R15-006 (consumidores das portas nativas por tela; registrado só em `backlog.md:601`).

### 5.5 PORTAL

- **Web (`apps/portal/web`):** 290 arquivos, cerca de 47 mil linhas TS, 118 specs. Manifesto de 38 rotas, 13 módulos, 27 telas reais e PWA (`ngsw-config.json`). O README afirma que nenhuma rota usa `PlaceholderPageComponent`, embora o componente continue como padrão em `core/manifest-routes.ts:55`. É a aplicação mais madura.
- **Atos centrais desligados no backend** (achado crítico):
  - `backend/app/src/portal-delegation.providers.ts:118-124` registra `defesa_previa`, `recurso_jari`, `recurso_cetran`, `indicacao_condutor`, `pagamento`, `junta_medica` e a resposta de diligência (`inf:rait-case:answer-inquiry`) como `UnavailableDelegationTarget('delegacao_indisponivel_r0007')`.
  - As linhas 125-126 fazem o mesmo com `lgpd_declaracao` e `emissao_crlv`.
  - O comentário do próprio arquivo (linhas 5-12) diz "R-0007 não está em `main` … Trocar os alvos indisponíveis pelos comandos reais é tarefa de R-0014 (M23)". **A R-0007 está em `main` desde 2026-09-22 e a R-0014 fechou.** O arquivo não é alterado desde `e12e9a48` (2026-09-16).
  - Rastreado apenas em `docs/meta/knowledge-base/backlog.md:103-107`, **sem issue no GitHub**. A #125 cobre gov.br, SNE, CRLV-e, junta e privacidade, mas não as delegações ao RAIT.
- **Mobile:** `apps/portal/mobile/README.md` diz "Deferred to after Phase 5"; OD-P12 (`portal-build-pack.md:196`) diz "adiado até o runtime móvel provar-se no BOAT". Como o runtime nativo do BOAT não existe (5.4), a condição não será satisfeita tão cedo. O `APP-PORTAL` promete "web + mobile". Não há issue.
- **Integrações reais pendentes** (#125): gov.br não homologado; `SnePort` não chamado (`backlog.md:108-110`); VAPID; CRLV-e.

### 5.6 DASHBOARD

- **Backend completo.** `backend/domains/dashboard/monitor` tem 188 arquivos TS, 40 manuscritos e 31 testes (R-0011 fechada como PC-0009 segundo `dashboard-build-pack.md:62`); `dashboard/crashes` também existe.
- **Web (`apps/dashboard/web`):** 164 arquivos, cerca de 16,5 mil linhas TS, 64 specs. As **22 entradas do manifesto estão todas em `level: 'L0'`** (`app.route-manifest.ts:95-96`). Não há `*.client.ts` nem facades, e o app não faz chamada de leitura de dados (só interceptor de frescor e SSE).
- **README obsoleto e condição satisfeita:**
  - `apps/dashboard/web/README.md:65`: "R-0011 (`BP-DASH-MONITOR-001`) não tem código … Cada tela **sobe a L2 quando** `features/<módulo>/<módulo>.client.ts` (gerado de `BP-DASH-MONITOR-001`) existir".
  - O cliente gerado já está em `packages/api-clients/src/generated/BP-DASH-MONITOR-001{,.commands}.ts`, e `backlog.md:636` reconhece que o upstream está em `main`.
  - Rastreado em **#124** (L0 para L2) e **#123** (reconciliação de contratos, policy, SSE e i18n), além de #96–#100.

### 5.7 Transversais (senatran-mock e senatran-adapter)

- `packages/senatran-adapter/src/ports.ts:102-316` define as portas `RenachPort`, `RenainfPort`, `RenaestPort`, `SnePort`, `CdtPort` e `WsdenatranReadPort`. O modo é `SENATRAN_PROVIDER=mock|real` e falha fechado (`config.ts:14,132-141`).
- `senatran-mock/domain/` cobre renach, renainf, renaest, sne, cdt, veículos, condutores e outros.
- Coerente com ADR-0003. O modo `real` depende de credenciais e homologação externas (#120, #121, #125).

---

## 6. Lacunas classificadas por severidade

### Crítica

| #   | Lacuna                                                                                                                                                                                                | Evidência                                                                                                                                                                                       | Rastreio                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| C1  | BOAT não tem frontend funcional: 17 telas (12 mobile + 5 web) só com título, 9 componentes vazios, portas nativas sem implementação e sem Capacitor. A documentação declara WP-B4/WP-B5 "executados". | `apps/boat/mobile/src/lib/pages/boat-pages.ts:5-10`; `shared/boat-shared.components.ts`; `ports.ts`; `apps/teat/web/src/app/features/sinistros/sinistros.pages.ts`; `boat-build-pack.md` §WP-B5 | Parcial (#118–#120); ligação de dados e formulários e OD-R15-006 **sem issue** |
| C2  | Os atos centrais do cidadão no Portal (defesa, recursos JARI/CETRAN, indicação de condutor, pagamento, junta, diligência) estão desligados, embora a R-0007 já esteja em `main`.                      | `backend/app/src/portal-delegation.providers.ts:5-12,118-124`                                                                                                                                   | Só `backlog.md:103-107`; **sem issue**                                         |
| C3  | O RAIT web não executa nenhum ato: 65 comandos lançam `RaitCommandUnavailableError`, embora os comandos do backend e os contratos da R-0007 CTG-0004 estejam mesclados.                               | `apps/rait/web/src/app/data/api/*.client.ts` (`todo(R-0007 CTG-0004)`)                                                                                                                          | #122                                                                           |

### Alta

| #   | Lacuna                                                                                                                                                                                   | Evidência                                                                           | Rastreio                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------- |
| A1  | DASHBOARD web inteiro em L0, embora o cliente gerado exista.                                                                                                                             | `apps/dashboard/web/src/app/app.route-manifest.ts:95`; `README.md:65`               | #124, #123                              |
| A2  | TEAT web é uma casca genérica (uma página para 58 rotas; facades vazias), sem os módulos e rotas novas da especificação (sincronização, concorrência, cancelamentos, acessos a bodycam). | `route-contract.ts:43-46`; `product-page.component.ts`; `teat-frontends.md:130-154` | **Sem issue** (#108–#112 são só mobile) |
| A3  | TEAT mobile é só homologação: sem Capacitor/Android, sem autoridade offline real.                                                                                                        | adenda `teat-build-pack.md:11-40`; ausência de `capacitor.config`/`android/`        | #108–#112                               |
| A4  | PEC sem frontend: slot "no frontend planned" contra 26 telas propostas em `IU-PEC-001` (status `reviewed`) e APP-PEC aprovado. A decisão não está registrada em ADR.                     | `apps/pec/web/README.md:4-6`; `IU-PEC-001.md:26-92`                                 | **Sem issue e sem ADR**                 |

### Média

| #   | Lacuna                                                                                                                                                                                                                     | Evidência                                                                                                                                                                | Rastreio      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| M1  | Documentação obsoleta ou contraditória sobre BOAT e TEAT: `est/crash` descrito como "inexistente"; sinistros "não entram" no TEAT web × "estão" no TEAT web; "Frontends: só README"; READMEs de app ainda "(placeholder)". | `boat-frontends.md:158`, `:28`; `teat-frontends.md:154`; `teat-build-pack.md:50`; `apps/teat/*/README.md`; `apps/boat/mobile/README.md`; `backend/domains/est/README.md` | Nenhum        |
| M2  | O Portal mobile foi prometido em APP-PORTAL e adiado sob uma condição (runtime provado no BOAT) que não está a caminho de se satisfazer.                                                                                   | `apps/portal/mobile/README.md`; `portal-build-pack.md:196`                                                                                                               | **Sem issue** |
| M3  | Projeções e módulos backend sem testes próprios: `dashboard/crashes`, `integration/renaest-mirror`, `ops/agency`, `ch/patients`, `ch/toxicology` (0 arquivos de teste cada).                                               | contagem em `backend/domains/*/*`                                                                                                                                        | Nenhum        |
| M4  | O comentário e o README de delegação/DASHBOARD citam condições ("R-0007 não está em main", "R-0011 não tem código") que já não são verdade. Risco de agentes tomarem o texto como autoritativo.                            | `portal-delegation.providers.ts:5`; `apps/dashboard/web/README.md:65`                                                                                                    | Nenhum        |

### Baixa

| #   | Lacuna                                                                                                                                                                 | Evidência                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| B1  | Arquivo com espaço no nome e chave de cliente `'kernel STYNX'` no TEAT web.                                                                                            | `apps/teat/web/src/app/data/kernel STYNX.client.ts`; `route-contract.ts:120` |
| B2  | R-0002 (port do PEC) sem papéis de trabalho em `work/rounds/R-0002/`, só a linha de prova. Parece intencional pelo README de rounds, mas destoa da convenção de pasta. | `work/rounds/README.md:12`; `record/proofs/work/generic/R-0002.jsonl`        |
| B3  | Sem seeds ou fixtures do domínio `ch`.                                                                                                                                 | `backend/database/seed/`                                                     |
| B4  | Prefixos numéricos de DDL duplicados (`13-*` ×2, `19-*` ×5, `30-*` ×2) e de seed (`70-*` ×2). A ordem depende do desempate lexical.                                    | `backend/database/ddl/`, `seed/`                                             |
| B5  | `apps/pec/web` e `apps/portal/mobile` estão sob o glob `apps/*/*` do workspace sem `package.json`. É inofensivo, mas é um slot sem guarda.                             | `pnpm-workspace.yaml`                                                        |

---

## 7. Achados cruzados (para os outros agentes, em resumo)

- **Rodadas:** `work/rounds/README.md:15-24` lista R-0007…R-0016 como "planned", mas todas têm `closure.json` com `closing_decision: D-2`. A tabela está obsoleta.
- **DEVAI:** há inconsistência de versão. `CLAUDE.md` e `work/audit/README.md` citam 1.4.5; `AGENTS.md` e `README.md` citam 1.5.6. `work/audit/` está vazio ("intentionally empty until authored").
- **Documentação:** `DESIGN-DECISIONS.md` tem ADR-0006, ADR-0024 e ADR-0028 duplicados (dois arquivos cada em `docs/meta/adr/`). `docs/framework/arch/README.md:3` ainda diz "Stub — Phase 2 …".
- **Fases:** `BUILD-PLAN.md` mantém as fases P3–P6 como cronograma histórico. A adenda de 2026-09-13 as substitui para o escopo de infrações, mas não para PEC e BOAT.

---

## 8. Recomendações

1. **Religar o Portal ao RAIT (C2)** como a ação de maior impacto e menor custo: substituir os `UnavailableDelegationTarget` de `defesa_previa`, `recurso_*`, `indicacao_condutor`, `pagamento` e diligência pelos comandos da R-0007 e converter o `it.todo` de delegação real em teste. Abrir issue própria, referenciando `backlog.md:103-107`.
2. **Executar a #122 (C3):** ligar os 65 comandos do RAIT web aos clientes `BP-INF-RAIT-*.commands` gerados e implementar `caseAccessGuard`. A dependência declarada já foi satisfeita.
3. **Abrir uma frente BOAT-frontend (C1):** fichas para ligar dados e formulários das 12 telas mobile e 5 telas web aos schemas e clientes existentes; implementações Capacitor das portas (OD-R15-006). Reclassificar publicamente WP-B4/WP-B5 como "estrutural/L0" até lá.
4. **Subir o DASHBOARD para L2 (#124)**, precedido da #123. Corrigir desde já o README (`apps/dashboard/web/README.md:65`) para dizer que o upstream existe.
5. **Definir formalmente o PEC-frontend (A4):** ou um ADR do Owner declarando "sem frontend", com a mudança de `IU-PEC-001` para status `deferred` e a indicação de que as telas P-* vão para o Portal, ou uma rodada com build pack próprio. Pela regra de perguntas reservadas ao Owner, a decisão não pode ser inferida.
6. **Abrir issues para as lacunas sem rastreio:** TEAT web produtivo com as rotas novas da especificação §5 (A2) e Portal mobile (M2).
7. **Passada de reconciliação documental (M1/M4)**, feita pelo papel Transcriber-docs ou Architect: corrigir `boat-frontends.md:158` e `:28` contra `teat-frontends.md:154`, `teat-build-pack.md:50`, os READMEs "(placeholder)" e `backend/domains/est/README.md`.
8. **Higiene (baixa severidade):** renomear `kernel STYNX.client.ts`; adicionar testes mínimos nos módulos backend sem teste (M3); seeds `ch`; política para prefixos de DDL duplicados.
