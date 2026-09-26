# Inspeção 2026-09-25 — item (g): Documentação de desenvolvedor e de usuário

- **Papel:** Auditor (Constitution Article 6). Avaliação somente leitura: nenhum arquivo versionado foi alterado.
- **Repositório:** `/Users/aarusso/Development/detran` @ `main` (`a92ef731`, após o fechamento de R-0015 como PC-0014).
- **Data:** 2026-09-25.
- **Arquivo de saída:** `tmp/inspecao-2026-09-25/g-documentacao.md`. O diretório é ignorado pelo git (`.gitignore:16: tmp/`).

---

## 1. Resumo executivo

1. **A documentação de desenvolvedor é volumosa e está bem ligada no nível de especificação.** Há cerca de 950 arquivos `.md` em `docs/`: 38 documentos de arquitetura, 37 ADRs, 732 artefatos de produto e 81 contratos. Em 1.043 arquivos `.md` versionados, o verificador de links Markdown relativos encontrou **um único link quebrado**. Nos documentos de orientação e de estado, porém, a coerência é **fraca**:
   - versões divergentes do DEVAI: `CLAUDE.md` diz 1.4.5, enquanto `AGENTS.md`, `README.md` e o `package.json` dizem 1.5.6;
   - o índice `DESIGN-DECISIONS.md` para na ADR-0022 e omite 12 ADRs;
   - há três números de ADR duplicados (0006, 0024 e 0028);
   - vários READMEs ainda dizem "placeholder" ou "Stub" em código que já foi entregue: `apps/teat/*`, `apps/boat/mobile`, `backend/domains/*` e `docs/framework/arch/README.md`;
   - `work/rounds/README.md` marca R-0007…R-0016 como "planned", embora a maioria já esteja fechada;
   - os build packs de TEAT e RAIT dizem "pendente" ou "a abrir" para PRs já mesclados.
2. **Não existe o setup de ponta a ponta para rodar a stack local.** Os scripts `stack:*` do `package.json` e `tools/detran-stack.sh` não estão versionados (estão no working tree local), e nenhum documento os descreve. Faltam também um guia de Postgres/variáveis de ambiente e READMEs em 2 pacotes, 1 domínio e 55 módulos de domínio.
3. **Não existe documentação de usuário.** Não há manual, guia por perfil, FAQ, tutorial nem seção "usuário" no site Docusaurus. `docs/roles/` e `docs/adopters/` são stubs. As fichas de tela (`IU-*`) e as jornadas (`JRN-*`, `JW-*`) são especificações técnicas, 97% delas em `status: draft`, e por isso **não são publicadas**.
4. **O site Docusaurus está configurado com `defaultLocale: 'en'`**, embora o conteúdo seja pt-BR. Ele não publica os 32 documentos de arquitetura em draft nem o glossário (`status: draft`). `docs/dev/` fica fora da IA de sete seções.
5. **Cerca de 250 rotas estão implementadas em 6 superfícies**: PORTAL 38, RAIT 74, DASHBOARD 22, TEAT mobile 71 (incluindo as 12 do BOAT), TEAT web 57, além da extensão BOAT. **Nenhuma delas tem documentação de usuário.** A ajuda dentro dos apps se resume a:
   - o diálogo de atalhos do RAIT;
   - uma página "Ajuda contextual MBFT" do TEAT que é só uma casca, sem conteúdo;
   - a página de acessibilidade e a tela "Como funciona a pontuação" do PORTAL.
6. **Severidade geral:** **Alta** para a documentação de usuário do PORTAL, que é o serviço ao cidadão e o mais próximo de produção, e do RAIT, o console de julgamento. **Média** para a coerência da documentação de desenvolvedor.

---

## 2. Metodologia

1. Li os documentos-base na ordem de `CLAUDE.md`: `AGENTS.md`, `README.md`, `BUILD-PLAN.md`, `DESIGN-DECISIONS.md`, `law/`, `.devai/constitution.md`, `CODESTYLE.md` e `CONSTITUTION.md`.
2. Inventariei a árvore `docs/` (as sete seções mais `_ia`, `dev` e `site`), `law/`, `product/`, `record/` e os READMEs de todos os pacotes do workspace (`pnpm-workspace.yaml`).
3. **Links:**
   - um script em Node, no scratchpad fora do repositório, extraiu os links Markdown relativos de todos os `.md` versionados (excluindo `work/`, `scratch/`, `node_modules` e `vendor`) e verificou se os alvos existem;
   - um segundo script verificou os **caminhos citados entre crases** (`docs/…`, `apps/…`, `backend/…`, `tools/…`, `work/…`), que são a forma de referência dominante no repositório.
   - Os falsos positivos foram revisados à mão: caminhos gerados, _templates_ `R-nnnn` e caminhos relativos a `senatran-mock/`.
4. **Coerência:**
   - comparei as versões (DEVAI, STYNX, Angular) com `package.json` e `.devai/config/project.json`;
   - comparei o índice de ADRs com `ls docs/meta/adr` e com o campo `## Status` de cada ADR;
   - comparei o estado de WPs e rodadas com `git log` (commits `chore(round): close R-00nn`), `waves.md` e os build packs;
   - comparei o catálogo de papéis com `backend/domains/shared/src/roles.ts`.
5. **Funcionalidades:** li `app.route-manifest.ts` (PORTAL, RAIT, DASHBOARD) e `features/*/*.routes.ts` (TEAT mobile e web), `boat-pages.ts` e os diretórios `pages/`, e identifiquei os placeholders (L0).
6. **Documentação de usuário:** busquei `manual|guia|faq|ajuda|help|tutorial` em `git ls-files` e nos catálogos i18n, e revisei as páginas de ajuda dentro dos apps.
7. **Publicação:** li `docs/_ia/categories.json`, `docs/_ia/publication.json`, `docs/site/scripts/sync-docs.mjs`, `docusaurus.config.ts` e `sidebars.ts`, e contei os `status:` do front matter.
8. **GitHub Issues:** `gh issue list --state all`, com 28 issues. **Nenhuma issue trata de documentação de usuário ou de desenvolvedor.**

**Limitações:**

- Não executei `pnpm docs:check`, porque ele escreve em `docs/site/docs` e `build`. A validação de links do Docusaurus, com `onBrokenLinks: 'throw'`, cobre só o conjunto **publicado**.
- Não validei o conteúdo jurídico.
- Não abri os `work/rounds/*` além do necessário para confrontar estados.

---

## 3. Inventário da documentação

### 3.1 Raiz e governança

| Arquivo                                                           | Situação                                                                                                                                                                                                    |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                                                       | Ponteiro para `AGENTS.md`. **Versão do DEVAI desatualizada** (1.4.5)                                                                                                                                        |
| `AGENTS.md` (52 l.)                                               | Constituição dos agentes, atualizada (DEVAI 1.5.6). Descrição de `pnpm check` e de `packages/` incompleta                                                                                                   |
| `README.md` (50 l.)                                               | Mapa de domínios e layout. "Getting started" com 3 comandos. Não cita `packages/api-clients`, `packages/sefaz-adapter` nem `backend/domains/integration`                                                    |
| `BUILD-PLAN.md` (33 l.)                                           | Plano de fases de 2026-08-23 com adendo de 2026-09-13. Não reflete o estado das rodadas R-0003…R-0016                                                                                                       |
| `DESIGN-DECISIONS.md` (57 l.)                                     | Índice de ADRs, **incompleto** (vai até 0022) e com status divergente                                                                                                                                       |
| `CODESTYLE.md` (78 l.)                                            | Bom, mas centrado no RAIT: exige chaves `rait.*` para "every visible string" e escopos de commit só do RAIT                                                                                                 |
| `CONSTITUTION.md` (427 l.)                                        | Cópia **legada** da Constitution 0.3.0, preservada como evidência histórica (conforme `law/constitution.md`). O próprio arquivo não traz aviso de que está obsoleto                                         |
| `.devai/constitution.md`, `.devai/pin/constitution.md`            | Binding ativo (1.0.0)                                                                                                                                                                                       |
| `law/` (constitution, adr, glossary, invariants, policy, schemas) | `law/constitution.md` é um bom ponteiro. `glossary`, `invariants` e `schemas` são READMEs "intentionally empty". `law/adr/README.md` diz "empty", mas contém `ADR-0001-devai-1.4.5-stynx-1.1.1-adoption.md` |
| `product/README.md`                                               | "Content is intentionally empty". O conteúdo real de produto está em `docs/framework/product/`                                                                                                              |

### 3.2 `docs/` (IA de sete seções mais extras)

| Seção                                                     | Conteúdo                                                                                                      | Estado                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `start/index.md`                                          | Orientação                                                                                                    | **Desatualizado** ("Phase 0 skeleton", `docs/start/index.md:18`)                                 |
| `theory/index.md`                                         | 1 parágrafo                                                                                                   | Stub                                                                                             |
| `framework/arch/` (38 arquivos)                           | Build packs, catálogos de erro, contratos de rota, frontends por app, guia do kit, motor de prazos, SSE, i18n | Rico. **32 de 33 com `status: draft`, portanto não publicados.** O `README.md` começa com "Stub" |
| `framework/contracts/` (81)                               | OpenAPI gerados e `*.commands.openapi.json`                                                                   | Bom                                                                                              |
| `framework/blueprints/` (50), `schemas/` (33)             | Blueprints e schemas de eventos                                                                               | Bom                                                                                              |
| `framework/product/` (732)                                | APP, jornadas, casos de uso, regras, fichas de tela e workflows por app                                       | Rico. Maioria em draft (tabela 3.3)                                                              |
| `framework/glossary/domain.md`                            | Glossário pt-BR, 82 linhas                                                                                    | `status: draft`, portanto **não publicado**. Lacunas de termos (§4.6)                            |
| `roles/index.md`                                          | "Stub — populated as governance rounds run here."                                                             | Stub                                                                                             |
| `adopters/index.md`, `adopters/integrations/`             | "Stub — populated as apps ship."                                                                              | Stub, embora 6 superfícies já tenham sido entregues                                              |
| `reference/`                                              | Corpus legal (200) e institucional (8)                                                                        | Bom (publicação filtrada)                                                                        |
| `meta/adr/` (37)                                          | ADRs e README-índice                                                                                          | Índice incompleto (§4.2)                                                                         |
| `meta/agents/`, `meta/decisions/`, `meta/knowledge-base/` | Manuais de agentes, orquestra (`waves.md` atualizado), KB                                                     | Bom. `meta/index.md` não lista `agents/` nem `decisions/`                                        |
| `meta/eng/`, `meta/ops/`, `meta/security/`                | Os três READMEs dizem "Stub". `security/lgpd-rait.md` é o único conteúdo                                      | Stubs                                                                                            |
| `docs/dev/{operations,security}/README.md`                | "Content is intentionally empty until authored. Generated by DEVAI v1.4.5."                                   | **Fora da IA** (`sync-docs.mjs:14-22` publica só as sete seções). Diretório órfão                |
| `docs/site/`                                              | Docusaurus 3.10.2                                                                                             | `defaultLocale: 'en'`, tagline em inglês                                                         |

### 3.3 Maturidade dos artefatos de produto (front matter `status:`, sem `_intake`)

| App       | Total | approved | reviewed | draft | Fichas de tela (draft/total) |
| --------- | ----- | -------- | -------- | ----- | ---------------------------- |
| RAIT      | 164   | 27       | 5        | 132   | 63/64                        |
| TEAT      | 202   | 11       | 9        | 182   | 126/127                      |
| BOAT      | 76    | 7        | 10       | 59    | 17/18                        |
| PEC       | 67    | 10       | 10       | 47    | 0/1                          |
| PORTAL    | 91    | 15       | 10       | 66    | 27/28                        |
| DASHBOARD | 70    | 10       | 3        | 57    | 18/19                        |
| shared    | 4     | 0        | 2        | 2     | —                            |

Pela política `docs/_ia/publication.json`, só `reviewed` e `approved` vão para o site. Na prática, **quase nenhuma ficha de tela nem o glossário são publicados.**

### 3.4 READMEs de pacote, app e domínio

| Alvo                                                       | README  | Observação                                                                                                                                                            |
| ---------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/portal/web`                                          | sim     | Excelente: scripts, estrutura, como rodar                                                                                                                             |
| `apps/rait/web`                                            | sim     | Bom, mas **não explica como rodar localmente** (`runtime-config.js`, backend)                                                                                         |
| `apps/dashboard/web`                                       | sim     | Bom: rotas, camadas, nível L0                                                                                                                                         |
| `apps/teat/web`, `apps/teat/mobile`                        | sim     | **Desatualizados**: "(placeholder)" e "Built in Phase 3 (W3.5)", com 71 e 147 arquivos-fonte entregues                                                                |
| `apps/boat/mobile`                                         | sim     | **Desatualizado**: descreve um app Capacitor autônomo com camada nativa. Hoje é uma **biblioteca ng-packagr** (`@detran/boat-mobile`) montada no shell do TEAT mobile |
| `apps/pec/web`, `apps/portal/mobile`                       | sim     | Slots reservados, coerentes                                                                                                                                           |
| `packages/senatran-adapter`, `packages/ui`                 | sim     | Bons                                                                                                                                                                  |
| **`packages/api-clients`**                                 | **não** | Clientes gerados consumidos por todos os apps                                                                                                                         |
| **`packages/sefaz-adapter`**                               | **não** | Não aparece em nenhum ADR. É citado só em `docs/meta/pec-external-environment-contract.md`                                                                            |
| `backend/`, `backend/app`, `backend/database/ddl`          | sim     | `backend/README.md` não lista `domains/integration`. O DDL README está desatualizado (§4.4)                                                                           |
| `backend/domains/{ch,dashboard,est,inf,ops,portal,shared}` | sim     | Tempo verbal futuro ("Populated in Phase 3/4/5", "Skeleton in Phase 3"). O de `shared` tem contagem de papéis errada                                                  |
| **`backend/domains/integration`**                          | **não** | Contém `renaest-mirror`                                                                                                                                               |
| Módulos `backend/domains/*/*`                              | 1 de 56 | Só `inf/deadlines` tem README. Faltam 55, entre eles `inf/rait-*` (5), `portal/*` (6), `ops/*` (9), `ch/*` (17)                                                       |
| `tools/`                                                   | sim     | **Incompleto** (§4.4)                                                                                                                                                 |

---

## 4. Achados de coerência (com evidência)

### 4.1 Versões e plataforma

| #    | Achado                                                                                                                                                                                                                                                  | Evidência                                                                                                                                                                         | Sev.  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| C-01 | `CLAUDE.md` fixa DEVAI **1.4.5**. `AGENTS.md`, `README.md`, `docs/start` e `package.json` usam **1.5.6**. `CLAUDE.md` é o primeiro arquivo que os agentes leem                                                                                          | `CLAUDE.md:6`; `AGENTS.md:4`; `README.md:6`; `docs/start/index.md:13`; `package.json:75` (`"@aarusso-nyx/devai": "1.5.6"`); `.devai/config/project.json` (`devai_version: 1.5.6`) | Média |
| C-02 | `DESIGN-DECISIONS.md` descreve a ADR-0015 como "STYNX 1.3.1 / Angular 22 / **DEVAI 1.4.5** is the platform target". O DEVAI foi superado pela ADR-0028 (1.5.x) sem nota de substituição                                                                 | `DESIGN-DECISIONS.md:39`; `docs/meta/adr/ADR-0028-devai-1-5-2-attested-local-rc.md`                                                                                               | Baixa |
| C-03 | `work/rounds/README.md` declara "Governed rounds … (DEVAI 1.4.5)". Os READMEs de `law/*`, `product/` e `docs/dev/*` dizem "Generated by DEVAI v1.4.5"                                                                                                   | `work/rounds/README.md:5`; `law/README.md:5`; `docs/dev/operations/README.md:5`                                                                                                   | Baixa |
| C-04 | `law/adr/ADR-0001-devai-1.4.5-stynx-1.1.1-adoption.md` (STYNX **1.1.1**) forma uma **segunda série de ADRs** com numeração que colide com `docs/meta/adr/ADR-0001`. Não aparece em `DESIGN-DECISIONS.md`. `law/adr/README.md` diz "intentionally empty" | `law/adr/ADR-0001-…:1`; `law/adr/README.md:5`                                                                                                                                     | Média |
| C-05 | O `CONSTITUTION.md` da raiz (Constitution **0.3.0**) não traz cabeçalho de obsolescência. Só `law/constitution.md:9-11` explica que ele é legado                                                                                                        | `CONSTITUTION.md:1-12`                                                                                                                                                            | Baixa |

### 4.2 Índice de ADRs (`DESIGN-DECISIONS.md` × `docs/meta/adr/`)

Em `docs/meta/adr/` há **36 ADRs** com **33 números**: há três colisões (0006, 0024 e 0028).

| #    | Achado                                                                                                                                                                                                                                                                    | Evidência                                                                            | Sev.  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----- |
| C-06 | **`DESIGN-DECISIONS.md` para na ADR-0022.** Faltam 0023, 0024 (as duas), 0025, 0026, 0027, 0028 (as duas), 0029, 0030, 0031, 0032 e 0033, ou seja, 13 arquivos                                                                                                            | `DESIGN-DECISIONS.md:51-53` (último item)                                            | Alta  |
| C-07 | **Números duplicados:** `ADR-0006-detran-ui-kit` e `ADR-0006-ops-field-operations-port`; `ADR-0024-govbr-federation-via-cognito` e `ADR-0024-rait-legal-priority-owner-policy`; `ADR-0028-devai-1-5-2-attested-local-rc` e `ADR-0028-provisionamento-operacional-offline` | `ls docs/meta/adr/`; `DESIGN-DECISIONS.md:18-19`                                     | Média |
| C-08 | `docs/meta/adr/README.md` omite `ADR-0006-ops-field-operations-port`, `ADR-0028-devai-1-5-2-attested-local-rc` e as ADRs 0029…0033                                                                                                                                        | `docs/meta/adr/README.md:16,39` (termina em 0028-provisionamento)                    | Média |
| C-09 | **Status divergente:** `DESIGN-DECISIONS.md` marca a ADR-0021 como "(Proposed)", mas o arquivo diz "Accepted on 2026-09-14" e `docs/meta/adr/README.md:31` diz "(Accepted)"                                                                                               | `DESIGN-DECISIONS.md:48`; `docs/meta/adr/ADR-0021-shared-parameter-store.md` §Status | Média |
| C-10 | O cabeçalho `## Status` não é uniforme: as ADRs 0027 e 0028-provisionamento usam `- Status: Accepted`. As ADRs 0024-rait, 0025, 0026 e 0033 estão em pt-BR e as demais em inglês                                                                                          | arquivos citados                                                                     | Baixa |
| C-11 | `AGENTS.md` e `CLAUDE.md` mandam ler "ADR-0001…0004" como fundadoras. Isso está correto, mas não há ponteiro para as ADRs vinculantes posteriores (0014-0020, 0033)                                                                                                       | `AGENTS.md:43`                                                                       | Baixa |

### 4.3 Estado de WPs, rodadas e fases

| #    | Achado                                                                                                                                                                                                                                                                | Evidência                                                                                                                                      | Sev.  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| C-12 | **`work/rounds/README.md` marca R-0007…R-0016 como "planned".** O `git log` mostra os fechamentos: R-0007 (PC-0011), R-0012 (PC-0010), R-0013 (PC-0013), R-0015 (PC-0014), R-0016 (PC-0012). `waves.md` registra também R-0008…R-0011 e R-0014 como fechadas          | `work/rounds/README.md:17-26`; commits `6a2cfaab`, `f2e3169f`, `8214e5e1`, `9fb7b7ef`, `6d970d3f`; `docs/meta/agents/orchestra/waves.md:57-66` | Alta  |
| C-13 | `work/rounds/R-0002/` não existe. O README remete ao `record/…/R-0002.jsonl`, mas não diz que a pasta de trabalho não foi preservada                                                                                                                                  | `work/rounds/README.md:12`                                                                                                                     | Baixa |
| C-14 | `teat-build-pack.md` diz "integração final da rodada pendente" (WP-T4) e "não mesclados nem implantados" (WP-T6), mas R-0013 foi fechada com o merge `646c6c28` (PR #113) em 2026-09-24                                                                               | `docs/framework/arch/teat-build-pack.md:153,196`                                                                                               | Média |
| C-15 | `rait-build-pack.md` WP-A: "CTG-0002: PR pendente", mas o PR #43 foi mesclado (`work/rounds/README.md:16`). WP-E: "PR do CTG-0002c, a abrir", mas R-0012 foi fechada (PC-0010). O WP-0 não tem marca de "executado", embora o `CLAUDE.md` diga "WP-0 done 2026-09-13" | `docs/framework/arch/rait-build-pack.md:50,81,158`                                                                                             | Média |
| C-16 | `docs/start/index.md` §Status: "Phase 0 skeleton: workspace layout, governance root, founding ADRs and staged CI." Desatualizado em ~16 rodadas. É a página de entrada do site                                                                                        | `docs/start/index.md:16-20`                                                                                                                    | Alta  |
| C-17 | `BUILD-PLAN.md` não traz uma tabela de estado. O leitor não sabe que PORTAL, RAIT, TEAT (homologação) e DASHBOARD (L0) já foram entregues                                                                                                                             | `BUILD-PLAN.md:6-33`                                                                                                                           | Média |

### 4.4 Documentação técnica × código

| #    | Achado                                                                                                                                                                                                                                                                                                                                                                    | Evidência                                                                                                                       | Sev.  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----- |
| C-18 | **READMEs de TEAT dizem "placeholder" e "Built in Phase 3 (W3.5) — the port must make it actually build".** Na realidade há 147 arquivos-fonte e 27 specs (mobile) e 71 arquivos-fonte e 5 specs (web), com build no `pnpm check`                                                                                                                                         | `apps/teat/mobile/README.md:1,6-7`; `apps/teat/web/README.md:1,6-7`                                                             | Alta  |
| C-19 | **O README do BOAT descreve um app Capacitor autônomo** ("real native layer: Capacitor, camera, real GPS…"). O pacote real é uma **biblioteca** `ng-packagr` (`@detran/boat-mobile`, `src/lib/*`), com 12 páginas `boat-crash-*` montadas nas rotas `crash-*` do TEAT mobile. A camada nativa não foi provada (R-0015, `waves.md:65`)                                     | `apps/boat/mobile/README.md:1-8`; `apps/boat/mobile/package.json` (`"build": "ng-packagr …"`)                                   | Alta  |
| C-20 | **A sigla BOAT tem duas expansões:** "Boletim de **Ocorrência de Acidente** de Trânsito" e "Boletim de **Acidentalidade** de Trânsito" (charter aprovado)                                                                                                                                                                                                                 | `apps/boat/mobile/README.md:3` × `docs/framework/product/domains/est/boat/APP.md:3`; `docs/framework/arch/boat-frontends.md:11` | Média |
| C-21 | `backend/domains/shared/README.md`: "Role union: PEC 15 + eight unique TEAT staff codes + `CIDADAO`" (24). O catálogo real tem **36** papéis: acrescenta os 10 papéis RAIT e os 2 papéis DASHBOARD                                                                                                                                                                        | `backend/domains/shared/README.md:9-10`; `backend/domains/shared/src/roles.ts:79-92`                                            | Média |
| C-22 | `backend/database/ddl/README.md`: "the domain DDL 30…60 (`inf`, `ch`, `portal`)" e "`20-rls-policies.sql` last". Há `61-65` (portal), `70-est-crash`, `71-dashboard-crashes`, `72-integration-renaest-mirror`, `75-boat-renaest-job` e `80-dashboard` (67 arquivos). A lista numerada cobre só as fundações                                                               | `backend/database/ddl/README.md:3,12`                                                                                           | Média |
| C-23 | Os READMEs dos domínios estão no futuro ("Populated in Phase 3/4/5 (W3.1/W4.3/W5.1)", "Skeleton in Phase 3"), sem listar os módulos existentes. Exemplo: `inf` tem 14 módulos (`ait`, `alcohol`, `collection`, `deadlines`, `infraction`, `measures`, `normative`, `notification`, `rait-case`, `rait-integration`, `rait-org`, `rait-session`, `rait-worklist`, `speed`) | `backend/domains/{inf,est,portal,dashboard}/README.md`                                                                          | Média |
| C-24 | `tools/README.md` cita só os "Current Phase-2 checks". Faltam `check-role-catalog.ts`, `check-lifecycle-vocabulary.ts`, `verify-pec-superset.ts` e os diretórios `blueprints/`, `ci/`, `contracts/`, `docs/`, `domain-boundaries/`, `orchestra/` e `parameters/`                                                                                                          | `tools/README.md:11-25`; `ls tools/`                                                                                            | Média |
| C-25 | `AGENTS.md` descreve "`pnpm check` (format + typecheck)". O script real encadeia mais de 40 gates: blueprints, contratos, parâmetros, lint/test/build de 6 apps, verificadores de RLS/papéis/SENATRAN/PEC etc.                                                                                                                                                            | `AGENTS.md:48`; `package.json:15`                                                                                               | Baixa |
| C-26 | `AGENTS.md` e `README.md` descrevem `packages/` como "(senatran-adapter, ui)". Faltam `api-clients` e `sefaz-adapter`                                                                                                                                                                                                                                                     | `AGENTS.md:46`; `README.md:33`                                                                                                  | Baixa |
| C-27 | `docs/framework/arch/README.md` começa com "Stub — Phase 2 (W2.1) documents the composition root, adapter kernel, runtime profiles, policy matrix and tenancy enforcement here". **Esses documentos nunca foram escritos.** O índice omite `teat-mobile-contract.md`, `teat-web-contract.md`, `teat-web-structure-diagrams.md` e `ops-parameter-command-contract.md`      | `docs/framework/arch/README.md:3-4`                                                                                             | Média |
| C-28 | `docs/framework/index.md` diz "product/ — owner product specs (blueprints migrate here)". Os blueprints estão em `docs/framework/blueprints/`, que não aparece na lista, e `schemas/` também não é citado                                                                                                                                                                 | `docs/framework/index.md:10-13`                                                                                                 | Baixa |
| C-29 | `CODESTYLE.md` exige que "Every visible string goes through the `translate` pipe with a `rait.*` key from `docs/framework/arch/i18n/rait.pt-BR.json`", o que é falso para portal, teat, dashboard e boat. `docs/framework/arch/i18n/` não tem semente `portal.pt-BR.json`. A semente RAIT tem 349 strings e o app tem 890, sem regra documentada de extensão              | `CODESTYLE.md:~48`; `ls docs/framework/arch/i18n`                                                                               | Baixa |
| C-30 | O `package.json` tem 9 scripts `stack:*` **não versionados** (`git diff`), que apontam para `tools/detran-stack.sh` e `tools/detran-stack.proxy.json`, também não versionados. Não há documentação. Se forem commitados sem doc, surgirá mais uma lacuna de setup                                                                                                         | `git status`: `M package.json`, `?? tools/detran-stack.*`                                                                       | Info  |

### 4.5 Nomes de apps

- **REAT × RAIT:** nenhuma ocorrência de "REAT" no repositório (`git grep -w REAT` vazio). O nome **RAIT** está coerente, expandido em `docs/framework/product/domains/inf/rait/APP.md:3` como "Recursos Administrativos de Infrações de Trânsito".
- **BOAT:** duas expansões diferentes (C-20).
- **PEC:** "Prontuário Eletrônico" (APP), com slot frontend reservado. Está coerente.
- As siglas dos apps (RAIT, TEAT, BOAT, PORTAL, DASHBOARD, PEC) **não estão no glossário**.

### 4.6 Glossário

- `docs/framework/glossary/domain.md` tem `status: draft` e **por isso não é publicado** (`publication.json` → `statuses: [reviewed, approved]`).
- `docs/framework/glossary/README.md:6-7` promete RENAVAM e CDT, que não estão no glossário.
- Termos ausentes, todos usados em telas e i18n:
  - PORTAL: RENAVAM, CDT, CRLV-e, CNH-e;
  - RAIT: relator, pauta, diligência, jeton, vista, banca;
  - DASHBOARD: frescor/selo de frescor, camadas N0–N3, níveis de tela L0/L1/L2;
  - arquitetura: tenant/RLS;
  - as siglas dos apps.
- Há três glossários sem ligação entre si: `docs/framework/glossary/domain.md`, `docs/framework/arch/rait-i18n-glossary.md` (draft) e `law/glossary/` (vazio).

---

## 5. Links e referências quebradas

### 5.1 Links Markdown `[..](..)` (1.043 arquivos, 498 links relativos)

| Origem                       | Alvo inexistente                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `senatran-mock/README.md:78` | `.github/workflows/compose-smoke.yml` (o workflow não existe; o texto afirma que ele "smoke-tests it on every push") |

### 5.2 Caminhos citados entre crases (46 candidatos; após triagem manual, os reais abaixo)

| Origem (arquivo:linha)                                                                                 | Referência inexistente                                                                                                    | Observação                                                                                             |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `docs/framework/arch/teat-build-pack.md:119`                                                           | `work/rounds/R-0008/reports/TASK-0009.md`                                                                                 | O arquivo está em `work/rounds/R-0007/reports/TASK-0009.md`                                            |
| `docs/framework/arch/teat-build-pack.md:134`                                                           | `work/rounds/R-0008/reports/TASK-0010.md`                                                                                 | Idem (R-0007)                                                                                          |
| `docs/framework/contracts/manual/README.md:87`                                                         | `work/rounds/R-0007/reports/CTG-0001-C4-OD-PLAN.md`                                                                       | Ausente                                                                                                |
| `docs/meta/adr/ADR-0026-…:93`                                                                          | `work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-SQL2-ELIGIBILITY-CYCLE.md`                                                  | Ausente (evidência citada por ADR)                                                                     |
| `docs/framework/arch/teat-web-contract.md:200`                                                         | `apps/teat/web/src/app/testing.setup.ts`                                                                                  | Ausente                                                                                                |
| `docs/framework/arch/boat-frontends.md:30,110`                                                         | `apps/teat/web/features/`, `…/features/sinistros/shared/`                                                                 | O caminho real é `apps/teat/web/src/app/features/sinistros/` (sem `shared/`)                           |
| `docs/framework/arch/dashboard-build-pack.md:48`                                                       | `tools/verify-domain-boundaries.ts`                                                                                       | O que existe é o diretório `tools/domain-boundaries/`                                                  |
| `docs/framework/arch/rait-test-strategy.md:73`                                                         | `tools/check-command-contracts.ts`                                                                                        | O real é `tools/contracts/check-commands.mjs`                                                          |
| `docs/framework/arch/rait-test-strategy.md:25`                                                         | `docs/kb`                                                                                                                 | Caminho antigo da KB                                                                                   |
| `docs/framework/product/domains/inf/teat/screens/IU-TEAT-001.md:18`; `…/ux-parity/PROVENANCE.md:12-14` | `docs/framework/product/ux-parity/{mobile-matrix,web-matrix,journeys}.json`                                               | Os arquivos estão em `docs/framework/product/domains/inf/teat/ux-parity/`                              |
| `docs/framework/product/domains/inf/teat/APP.md:56`                                                    | `docs/meta/prototypes/docs/AJ-1_…md`                                                                                      | Caminho do repositório de origem (teat)                                                                |
| `docs/framework/product/domains/inf/teat/APP.md:152`; `…/journeys/JRN-TEAT-001.md:34`                  | `apps/mobile/src/app/mobile-runtime.ts`, `apps/mobile`                                                                    | Caminhos do repositório de origem (o real é `apps/teat/mobile`)                                        |
| `docs/meta/knowledge-base/session-artifacts/orchestration-handoff.md:111`                              | `docs/integration/adopt-senatran-mock.prompt.md`                                                                          | Ausente                                                                                                |
| `CONSTITUTION.md:82,145,199,313,417`                                                                   | `.devai/inventory/`, `docs/framework/arch/trace.json`, `.devai/scorecard/thresholds.json`, `docs/framework/substrates.md` | Constituição legada 0.3.0 (esperado, mas sem aviso)                                                    |
| `.devai/pin/constitution.md:90,165`                                                                    | `.devai/local/rounds/`, `law/trace.json`                                                                                  | Constituição ativa referencia artefatos DEVAI não materializados. Registrar, sem editar (pin imutável) |
| `senatran-mock/CLAUDE.md:77`; `senatran-mock/CODESTYLE.md:62`                                          | `docs/user/`                                                                                                              | Diretório de docs de usuário previsto e inexistente                                                    |
| `senatran-mock/CONTEXT.md:103`; `senatran-mock/GOVERNANCE.md:34`                                       | `docs/meta/gov/compliance/`                                                                                               | Ausente                                                                                                |
| `senatran-mock/docs/integration/renach-gap-resolutions.md:4`                                           | `docs/meta/project/integrations/known-gaps.md`                                                                            | Ausente                                                                                                |
| `senatran-mock/docs/reference/senatran-canonical-api/README.md:68`                                     | `docs/architecture.md`                                                                                                    | Ausente                                                                                                |

Falsos positivos descartados:

- `docs/site/docs`, que é gerado;
- os _templates_ `work/rounds/R-nnnn/…` e `IU-RAIT-0nn.md`;
- os caminhos do `senatran-mock` que existem relativos ao subprojeto (`openapi.yaml`, `trace.json` etc.).

**Observação:** o gate `pnpm docs:check` (Docusaurus com `onBrokenLinks: 'throw'`) valida só o conjunto **publicado**. Os documentos em draft (a maioria de arch e product) e as referências entre crases **não são verificados por nenhum gate**.

---

## 6. Setup, run e test (documentação de desenvolvedor)

| Tópico                                                | Onde está                                                                                            | Lacuna                                                                                                                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autenticação no registro (`NODE_AUTH_TOKEN`)          | `README.md:41`, `AGENTS.md:34-35`, `CLAUDE.md`                                                       | Coerente. Não explica o escopo mínimo do token (`read:packages`) nem o caso de quem não usa `gh`                                                                                                               |
| Pré-requisitos (Node 24, pnpm 9.15, Postgres/PostGIS) | `.nvmrc`, `package.json` (`engines`, `packageManager`)                                               | **Nenhum documento cita** Node 24, pnpm 9 ou a necessidade de Postgres com PostGIS (`00-extensions.sql`)                                                                                                       |
| Banco local                                           | `backend/app/README.md:28-34` (`pnpm backend:db:reset`)                                              | Não documenta `DB_PASSWORD`/`PG*` (`backend/database/apply.sh:8`) nem `DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED` (`apply.sh:20`), que bloqueia `--full`. Não há `.env.example` na raiz (só em `senatran-mock/`) |
| Subir backend, mock e frontends juntos                | —                                                                                                    | **Ausente.** Não há runbook "stack local". `stack:*` e `tools/detran-stack.sh` não estão versionados                                                                                                           |
| Rodar cada frontend                                   | Só `apps/portal/web/README.md:23-27`                                                                 | Não há instrução para RAIT, TEAT web/mobile nem DASHBOARD (`runtime-config.js`, OIDC local, proxy `/v1`)                                                                                                       |
| Tiers de teste                                        | `CODESTYLE.md` §Tests; `docs/framework/arch/rait-test-strategy.md` (draft); scripts `backend:test:*` | Não há visão única de `unit/integration/e2e/real/in-house/ci/upgrade` nem dos pré-requisitos de cada um                                                                                                        |
| Gates                                                 | `package.json:15`                                                                                    | `docs/meta/eng/README.md` ("gate registry") é stub                                                                                                                                                             |
| Operação/deploy                                       | `docs/meta/ops/README.md`, `docs/dev/operations/README.md`                                           | Ambos stubs                                                                                                                                                                                                    |
| Segurança (RLS, tenancy, cadeia de auditoria)         | ADR-0002/0005; `docs/meta/security/README.md` (stub); `lgpd-rait.md`                                 | Não há documento de arquitetura de tenancy/RLS (C-27)                                                                                                                                                          |

---

## 7. Documentação de USUÁRIO

### 7.1 O que existe

| Tipo                                         | Existe?       | Evidência                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manual/guia por perfil                       | **Não**       | `git ls-files` sem `manual`, `guia`, `faq`, `tutorial` ou `user-guide` (exceto o corpus legal). `docs/roles/index.md` é stub. `docs/adopters/index.md` é "Stub — populated as apps ship"                                                                                                                                                                                                       |
| Seção de usuário no site                     | **Não**       | `sidebars.ts` tem 7 seções de engenharia/governança. Tagline: "Governed documentation for the DETRAN consolidation runtime"                                                                                                                                                                                                                                                                    |
| FAQ                                          | **Não**       | —                                                                                                                                                                                                                                                                                                                                                                                              |
| Idioma pt-BR                                 | Parcial       | Apps com `lang="pt-BR"` (5 `index.html`) e catálogos i18n pt-BR (PORTAL 672, RAIT 890, TEAT mobile 528, TEAT web 356, DASHBOARD 307, BOAT 114 chaves). **O site de docs está em `en`** (`docusaurus.config.ts:25`)                                                                                                                                                                             |
| Acessibilidade para usuário                  | Só PORTAL     | Rota `/acessibilidade` com declaração WCAG 2.1 AA/eMAG 3.1 (`portal.pt-BR.json:568-570`). RAIT, TEAT e DASHBOARD não têm declaração nem guia de teclado, exceto os atalhos do RAIT. Os testes axe existem (`*/testing/a11y-state.spec-helper.ts`), mas isso é verificação, não documentação                                                                                                    |
| Ajuda contextual no app                      | Mínima        | RAIT: diálogo de atalhos `?` (`apps/rait/web/src/app/core/shortcut-help.component.ts`). TEAT mobile: rota `context-help` "Ajuda contextual MBFT" que **só renderiza título e "carregando"** (`apps/teat/mobile/src/app/features/complementares/pages/context-help.page.ts`). PORTAL: `pontuacao/como-funciona` (T-15), `vinculo/por-que-nao-vejo`, `carta-servicos`. DASHBOARD e BOAT: nenhuma |
| Fichas de tela e jornadas (base para manual) | Sim, técnicas | 257 fichas `IU-*` e jornadas `JRN-*`, mais 12 jornadas por papel em `docs/framework/arch/rait-web-journeys/JW-01…12`. **Escritas para engenheiros** (rota → comando → evento, códigos `RN-`/`UC-`), 97% draft e não publicadas                                                                                                                                                                 |
| Textos de UI pendentes                       | —             | BOAT: 13 textos pt-BR `source_pending` aguardando autorização (issue #119)                                                                                                                                                                                                                                                                                                                     |

### 7.2 Perfis de usuário que precisam de documentação (catálogo `roles.ts`, 36 papéis)

| Perfil                        | Papéis                                                                                                                                                                                                             | Superfície                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| Cidadão/condutor/proprietário | `CIDADAO`                                                                                                                                                                                                          | PORTAL (PWA)                     |
| Agente de campo e supervisor  | `field-agent`, `field-supervisor`                                                                                                                                                                                  | TEAT mobile e BOAT (homologação) |
| Operação e retaguarda TEAT    | `processing-operator`, `traffic-authority`, `agency-admin`, `technical-admin`, `bi-analyst`, `integration-operator`                                                                                                | TEAT web (homologação)           |
| Julgamento de recursos        | `rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair`, `rait-manager`, `rait-hr`, `rait-finance` (+ `AUDITOR`, `agency-admin`) | RAIT web                         |
| Monitoramento                 | `dash-operator`, `dash-duty-owner`, `GESTOR_DETRAN`, `DPO`, `AUDITOR`                                                                                                                                              | DASHBOARD (L0)                   |
| Clínico (PEC)                 | `MEDICO`, `PSICOLOGO`, `RECEPCAO`, …                                                                                                                                                                               | Sem frontend (API apenas)        |

### 7.3 Matriz: funcionalidade implementada × documentação de usuário

Legenda de nível:

- **L2** = tela ligada a dados;
- **L1** = parcial;
- **L0** = placeholder "indisponível nesta versão".

Colunas:

- **Spec** = há ficha `IU-*` ou jornada técnica;
- **Doc usuário** = há manual, guia, FAQ ou ajuda voltada ao usuário final;
- **Ajuda in-app** = há texto explicativo na própria tela.

#### PORTAL (`apps/portal/web`, 38 rotas, 13 módulos, cidadão)

| Funcionalidade (rotas)                                                                                           | Nível | Spec (IU)        | Doc usuário | Ajuda in-app                                        |
| ---------------------------------------------------------------------------------------------------------------- | ----- | ---------------- | ----------- | --------------------------------------------------- |
| Carta de serviços (`/carta-servicos`, `/:serviceKey`)                                                            | L2    | T-25 (draft)     | **Não**     | Sim (é a própria carta)                             |
| Como funciona a pontuação (`/pontuacao/como-funciona`)                                                           | L2    | T-15 (draft)     | **Não**     | Sim                                                 |
| Login gov.br, callback, início, conta (`/auth/callback`, `/inicio`, `/conta`)                                    | L2    | —                | **Não**     | Não                                                 |
| Elevação de nível de assinatura gov.br (`/assinatura/elevacao`)                                                  | L2    | T-27 (draft)     | **Não**     | Parcial (intro)                                     |
| "Por que não vejo meu vínculo" (`/vinculo/por-que-nao-vejo`)                                                     | L2    | —                | **Não**     | Sim                                                 |
| Autos de infração: lista e detalhe (`/autos`, `/autos/:aitId`)                                                   | L2    | T-14, T-01       | **Não**     | Não                                                 |
| Defesa prévia (`/autos/:aitId/defesa/nova`)                                                                      | L2    | T-02             | **Não**     | Não                                                 |
| Indicação de condutor (`/autos/:aitId/condutor/nova`)                                                            | L2    | T-05             | **Não**     | Não                                                 |
| Pagamento e pagamento preservando recurso (`/autos/:aitId/pagamento…`)                                           | L2    | T-13, T-23       | **Não**     | Não (faixa de 40% explicada só como "indisponível") |
| Processos: lista, detalhe, diligência, desistência, decisão (`/processos/*`)                                     | L2    | T-06/07/08/10/11 | **Não**     | Não                                                 |
| Recurso JARI e CETRAN (`/processos/:id/jari/nova`, `/cetran/nova`)                                               | L2    | T-03, T-04       | **Não**     | Não                                                 |
| Notificações, preferências, adesão ao SNE (`/notificacoes`, `/notificacoes/preferencias`, `/sne`)                | L2    | T-12, T-09       | **Não**     | Não                                                 |
| CNH digital, veículos, CRLV-e com cache offline (`/documentos/cnh-digital`, `/veiculos`, `/veiculos/:id/crlv-e`) | L2    | T-16, T-17       | **Não**     | Não                                                 |
| Sinistros: lista e detalhe (`/sinistros`, `/:crashId`)                                                           | L2    | T-18, T-19       | **Não**     | Não                                                 |
| Exames e junta médica (`/exames`, `/exames/:id/junta/nova`)                                                      | L2    | T-20             | **Não**     | Não                                                 |
| Ouvidoria e avaliação (`/ouvidoria/*`, `/avaliacao/:id`)                                                         | L2    | T-21, T-22, T-26 | **Não**     | Não                                                 |
| Privacidade: meus dados (LGPD) (`/privacidade/meus-dados`)                                                       | L2    | T-24             | **Não**     | Não                                                 |
| Acessibilidade (`/acessibilidade`)                                                                               | L2    | —                | Declaração  | Sim                                                 |
| Serviço indisponível (`/servico-indisponivel/:key`)                                                              | L2    | —                | —           | Sim                                                 |

#### RAIT (`apps/rait/web`, 74 rotas, 15 módulos, julgamento interno)

| Funcionalidade (módulo e rotas)                                                                                                         | Nível       | Spec                   | Doc usuário | Ajuda in-app |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------- | ----------- | ------------ |
| Painel do turno e retomada (`/painel`, `/painel/retomar`)                                                                               | L2          | T-01, T-06; JW-01…09   | **Não**     | Atalhos `?`  |
| Filas de defesa e recurso (`/fila/*`)                                                                                                   | L2          | T-02; JW-01/02/07      | **Não**     | Atalhos      |
| Caso: resumo, triagem, dossiê, diligências, minuta, decisão, prazos, partes, comunicações, impedimentos, histórico (`/casos/:id/*`, 11) | L2          | T-03/04/05/07; JW-01   | **Não**     | Atalhos      |
| Protocolo: novo, pendências, remessas, redirecionamentos, desistências (`/protocolo/*`, 6)                                              | L2          | T-08, T-17; JW-03      | **Não**     | Atalhos      |
| Assinatura (`/assinatura`, `/:caseId`)                                                                                                  | L2          | T-07; JW-05            | **Não**     | Atalhos      |
| Autoridade: provimentos (`/autoridade/provimentos`)                                                                                     | L2          | T-16; JW-06            | **Não**     | Atalhos      |
| Colegiado: distribuição, relatoria/voto, pauta, sessões, banca, ata, vistas, extraordinária (`/colegiado/:orgao/*`, 12)                 | L2          | T-09…T-13; JW-04/07/08 | **Não**     | Atalhos      |
| Gestão: radar, drill-down, produção, capacidade, turmas, incidentes, qualidade (`/gestao/*`, 8)                                         | L2          | T-14, T-15; JW-09      | **Não**     | Atalhos      |
| Organização: membros, pools (`/organizacao/membros`, `/pools`)                                                                          | L1          | JW-10                  | **Não**     | —            |
| Organização: escala, jeton                                                                                                              | **L0**      | JW-10                  | **Não**     | —            |
| Arquivo: busca, caso selado, retenção (`/arquivo/*`)                                                                                    | L2          | —                      | **Não**     | —            |
| Auditoria: trilha, exportações (`/auditoria/*`)                                                                                         | L2 (trilha) | JW-12                  | **Não**     | —            |
| Integrações RENAINF/RENACH/falhas (`/integracoes/*`)                                                                                    | **L0**      | JW-11                  | **Não**     | —            |
| Financeiro: arrecadação, restituições, cobrança, conciliação (`/financeiro/*`)                                                          | **L0**      | JW-10                  | **Não**     | —            |
| Admin: parâmetros, calendário, suspensão de atos (`/admin/*`)                                                                           | **L0**      | JW-12                  | **Não**     | —            |
| Conta (`/conta`), sem permissão                                                                                                         | L2          | —                      | **Não**     | —            |

#### TEAT mobile (`apps/teat/mobile`, 8 módulos, agente de campo, escopo de homologação conforme ADR-0033)

| Funcionalidade                                                                                                                      | Rotas | Spec (IU)            | Doc usuário | Ajuda in-app                             |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----- | -------------------- | ----------- | ---------------------------------------- |
| Turno: login, MFA, dispositivo bloqueado, contexto, operação, abrir/fechar turno, resumo, repasse de dispositivo                    | 10    | IU-TEAT-*            | **Não**     | Não                                      |
| Consultas de veículo e condutor, divergência, falha de consulta                                                                     | 6     | IU-TEAT-*            | **Não**     | Não                                      |
| Lavratura de AIT (início → impressão, 17 passos incluindo `ait-cancel-request`; `ait-speed-measurement` indisponível)               | 17    | IU-TEAT-*            | **Não**     | Não                                      |
| Medidas administrativas: retenção, remoção, inventário, transbordo, termo                                                           | 7     | IU-TEAT-*            | **Não**     | Não                                      |
| Alcoolemia: etilômetro, resultado, recusa, sinais, encaminhamento, termo                                                            | 8     | IU-TEAT-*            | **Não**     | Não                                      |
| Sinistro (BOAT embarcado): local, condições, veículos, pessoas, vítimas, dinâmica, croqui, evidências, vínculos AIT, danos, revisão | 12    | IU-BOAT-_, IU-TEAT-_ | **Não**     | Não                                      |
| Sincronização: fila, item, conflito, diagnóstico, suporte, mensagens                                                                | 6     | IU-TEAT-*            | **Não**     | Não                                      |
| Complementares: abordagem sem AIT, checagem de documento, fiscalização especial, **ajuda contextual MBFT**, ajustes locais          | 5     | IU-TEAT-context-help | **Não**     | **Página vazia** (título e "carregando") |

#### TEAT web (`apps/teat/web`, 12 módulos, retaguarda, escopo de homologação)

| Funcionalidade                                                                               | Rotas | Doc usuário | Ajuda in-app |
| -------------------------------------------------------------------------------------------- | ----- | ----------- | ------------ |
| Entrada: login, painel                                                                       | 2     | **Não**     | Não          |
| Fiscalização: caixa de AITs, validação, saneamento, rejeitados, detalhe, integração, espelho | 9     | **Não**     | Não          |
| Operações: painel, mapa, lista, detalhe, turnos ativos, mensagens                            | 6     | **Não**     | Não          |
| Medidas e remoções, liberação                                                                | 4     | **Não**     | Não          |
| Alcoolemia: procedimentos, etilômetros                                                       | 2     | **Não**     | Não          |
| Evidências: busca, visualizador, cadeia de custódia, pacote probatório                       | 4     | **Não**     | Não          |
| Normativo: catálogos, enquadramentos, regras, modelos, pacotes móveis                        | 5     | **Não**     | Não          |
| Auditoria: eventos, linha do tempo de AIT e de agente, consultas externas, anomalias         | 5     | **Não**     | Não          |
| BI: fiscalização, sinistros, qualidade, integrações                                          | 4     | **Não**     | Não          |
| Técnico: integrações, filas, certificados, jobs, saúde                                       | 5     | **Não**     | Não          |
| Admin: órgãos, unidades, usuários/agentes, perfis, dispositivos, competências                | 6     | **Não**     | Não          |
| Sinistros (BOAT web): titular, fiscalização, sinistros                                       | 3     | **Não**     | Não          |

#### DASHBOARD (`apps/dashboard/web`, 22 rotas, todas em **L0**)

| Funcionalidade                                                                                                                                                                              | Nível | Spec (IU)         | Doc usuário | Ajuda in-app                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------------- | ----------- | --------------------------------------------- |
| Triagem e alertas; radar RAIT/PEC/TEAT; integrações; deveres/ciclos; comparativo; auditoria (N2 com finalidade); transparência; sinistros; indicadores/frescor/KPIs; relatórios/exportações | L0    | D-01…D-18 (draft) | **Não**     | Não (só o estado "indisponível nesta versão") |

Aqui a documentação de usuário ainda é prematura. Mesmo assim, conceitos como **camadas N0–N3**, **frescor** e **teto legal × SLA** precisam de explicação para o operador antes da subida a L2 (issue #124).

#### BOAT (`apps/boat/mobile`, biblioteca)

As 12 páginas de sinistro estão cobertas na linha TEAT mobile acima. Não há documentação de usuário, e os 13 textos seguem `source_pending` (issue #119).

**Totais:**

- aproximadamente **250 rotas implementadas**;
- **0 com documentação de usuário**;
- cerca de **5 com ajuda in-app útil**: pontuação, carta de serviços, vínculo, acessibilidade e atalhos do RAIT.

---

## 8. Lacunas por severidade

### Alta

1. **G-U1: não há documentação de usuário do PORTAL**, que atende o público externo e é o mais maduro (L2 em todas as telas). Falta um guia do cidadão pt-BR: login gov.br e níveis de conta, defesa, indicação de condutor, recurso JARI/CETRAN, pagamento com desconto (40% SNE), SNE, CNH-e/CRLV-e offline, ouvidoria, LGPD. Falta também um FAQ.
2. **G-U2: não há manual do RAIT por papel.** São 10 papéis e cerca de 60 rotas L2. As jornadas `JW-01…12` são a melhor base, mas são técnicas e estão em draft.
3. **G-U3: o site de documentação não tem seção de usuário e está configurado em inglês** (`docusaurus.config.ts:25`). `docs/roles` e `docs/adopters` são stubs.
4. **G-D1: `DESIGN-DECISIONS.md` está incompleto e há números de ADR duplicados** (C-06, C-07, C-09).
5. **G-D2: os estados de rodada e fase estão errados nos documentos de entrada**: `work/rounds/README.md` (C-12) e `docs/start/index.md` (C-16).
6. **G-D3: os READMEs de TEAT e BOAT descrevem outra realidade** (C-18, C-19).

### Média

7. **G-D4:** `CLAUDE.md` com a versão do DEVAI errada (C-01), e a segunda série de ADRs em `law/adr/` (C-04).
8. **G-D5:** os build packs de TEAT e RAIT estão desatualizados quanto a merges (C-14, C-15).
9. **G-D6:** falta um runbook de stack local (Postgres/PostGIS, variáveis, mock SENATRAN, frontends) e faltam instruções de run para RAIT, TEAT e DASHBOARD (§6).
10. **G-D7:** READMEs ausentes em `packages/api-clients`, `packages/sefaz-adapter`, `backend/domains/integration` e 55 módulos de domínio. READMEs de domínio desatualizados (C-21…C-24).
11. **G-D8:** arquitetura do backend, com composição, tenancy/RLS e perfis de runtime, prometida e nunca escrita (C-27). `meta/eng`, `meta/ops`, `meta/security` e `dev/*` são stubs.
12. **G-D9:** glossário em draft, portanto não publicado, com termos ausentes e três glossários desconexos (§4.6).
13. **G-D10:** 32 dos 33 documentos de arquitetura estão em draft e por isso **não são publicados**, embora descrevam código já mesclado.
14. **G-U4:** a "Ajuda contextual MBFT" do TEAT mobile é uma rota sem conteúdo. Não há ajuda contextual em TEAT web, DASHBOARD nem BOAT.
15. **G-U5:** só o PORTAL tem declaração de acessibilidade. Os consoles internos (RAIT, TEAT web, DASHBOARD) não documentam navegação por teclado (exceto os atalhos do RAIT), leitores de tela nem contraste.
16. **G-D11:** cerca de 15 referências entre crases quebradas (§5.2), sem gate que as detecte.

### Baixa

17. Nomes BOAT divergentes (C-20). `CODESTYLE.md` centrado no RAIT (C-29). `AGENTS.md` sobre `pnpm check` e `packages/` (C-25, C-26). `CONSTITUTION.md` legado sem aviso (C-05). ADRs em dois idiomas e com formato de status variado (C-10). `docs/framework/index.md` (C-28). `docs/dev/` fora da IA.
18. **G-U6:** a documentação de usuário do DASHBOARD (L0) e do TEAT (homologação, não campo) pode esperar a subida a L2 e o release de campo (issues #124 e #108–#112). Convém registrar isso como dependência explícita nessas issues.

---

## 9. Recomendações

Todas cabem a outros papéis; o Auditor não as executa.

### Owner (produto e documentação de usuário)

1. Abrir um épico "Documentação de usuário" com uma issue por superfície, nesta prioridade: **PORTAL, depois RAIT, depois TEAT (no release de campo), depois DASHBOARD (em L2)**. Hoje nenhuma issue do GitHub cobre documentação.
2. Definir o formato:
   - uma seção nova `docs/usuarios/` (ou reaproveitar `docs/roles/` e `docs/adopters/`), em pt-BR, com um guia por perfil da tabela 7.2;
   - FAQ do cidadão;
   - glossário do usuário final.
3. Decidir se a ajuda dentro dos apps faz parte do escopo:
   - conteúdo da "Ajuda contextual MBFT";
   - intro/ajuda em cada ficha, reaproveitando os campos `intro` já existentes no i18n;
   - links "Saiba mais" do PORTAL para o guia.

### Architect (IA, ADRs, glossário)

4. Regenerar `DESIGN-DECISIONS.md` e `docs/meta/adr/README.md` a partir dos arquivos (0001…0033):
   - resolver as colisões 0006, 0024 e 0028, por exemplo com sufixo `a/b` ou renumeração com nota de alias;
   - corrigir o status da ADR-0021;
   - decidir o destino de `law/adr/ADR-0001` (mover, renumerar ou referenciar) e corrigir `law/adr/README.md`.
5. Docusaurus:
   - `defaultLocale: 'pt-BR'`;
   - incluir a seção de usuário em `_ia/categories.json`;
   - promover a `reviewed` o glossário e os documentos de arquitetura que descrevem código mesclado, ou criar uma política de publicação para `framework/arch`;
   - integrar ou remover `docs/dev/`.
6. Escrever o documento de arquitetura do backend prometido em `docs/framework/arch/README.md`: composição, perfis, política, tenancy e RLS.
7. Criar um gate de referências entre crases, para caminhos de repositório em `.md`, semelhante ao script usado nesta inspeção, ou estender `docs:kb:check`.
8. Unificar os glossários: `law/glossary`, `docs/framework/glossary` e `rait-i18n-glossary`. Acrescentar as siglas dos apps e os termos de §4.6.

### Engineer (READMEs, setup)

9. Atualizar os READMEs:
   - `apps/teat/{web,mobile}` e `apps/boat/mobile` (estado real, escopo de homologação conforme ADR-0033, BOAT como biblioteca);
   - `backend/domains/*` (lista de módulos, papéis 36);
   - `backend/database/ddl` (faixas 61–80);
   - `tools/`;
   - `AGENTS.md`/`README.md` (`packages/`, `pnpm check`);
   - `CLAUDE.md` (DEVAI 1.5.6).
10. Criar READMEs para `packages/api-clients`, `packages/sefaz-adapter` (e avaliar uma ADR para a fronteira SEFAZ) e `backend/domains/integration`.
11. Versionar `tools/detran-stack.sh` junto com um runbook `docs/meta/ops/` ou `docs/start/`, cobrindo:
    - Node 24 e pnpm 9;
    - Postgres + PostGIS;
    - `DB_PASSWORD`/`PG*`;
    - `apply.sh` e a flag `DETRAN_PRIORITY_UPGRADE_FULL_AUTHORIZED`;
    - o mock SENATRAN;
    - `runtime-config.js` por app;
    - um `.env.example` na raiz.
12. Corrigir as referências da §5.2: R-0008 → R-0007, `ux-parity/`, `tools/…`, caminhos do repositório de origem.

### Maestro/Architect (estado)

13. Sincronizar `work/rounds/README.md` com `waves.md`, fechar os parágrafos "pendente" dos build packs (C-14, C-15), atualizar `docs/start/index.md` §Status e acrescentar uma tabela de estado dos WPs a `BUILD-PLAN.md`.
