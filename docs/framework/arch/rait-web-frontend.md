---
id: ARCH-RAIT-WEB
title: apps/rait/web — especificação completa da aplicação web (módulos, domínios, rotas, componentes, jornadas, transições e ações)
status: draft
apps: [rait, dashboard]
updated: 2026-09-22
---

# apps/rait/web — Console interno do RAIT

Especificação de construção do frontend do RAIT (Recursos Administrativos de Infrações de
Trânsito): o console interno usado por revisores, secretaria, autoridades de trânsito, membros e
presidentes da JARI-AM e do CETRAN-AM, gestor, RH/financeiro, operador de integração, auditor e
administrador. O cidadão **não** usa este app (vive em `apps/portal/web`).

Fontes de verdade que este documento apenas projeta em software: [WF-RAIT-001] (caso),
[WF-RAIT-002] (distribuição e SLA), [WF-RAIT-003] (sessão), [WF-RAIT-004] (organização do
trabalho), [WF-INF-002]/[WF-INF-003] (infração), regras [RN-RAIT-001]…[RN-RAIT-143], casos de uso
[UC-RAIT-001]…[UC-RAIT-043], inventário [IU-RAIT-001], jornadas [JRN-RAIT-001]…[JRN-RAIT-004].
Quando este documento e um deles divergirem, vale o artefato de produto.

Documentos companheiros desta especificação (2026-09-12): diagramas de módulos, rotas e
componentes (`rait-web-structure-diagrams.md`), jornadas por papel com diagramas
(`rait-web-journeys/`), catálogo de erros (`rait-error-catalog.md`), questões pendentes de
decisão do Owner e dos regimentos (`docs/meta/knowledge-base/open-decisions-rait.md`) e o pacote
de construção para a orquestra de agentes (`rait-build-pack.md`).

## 1. Stack, princípios e fronteiras

| Item           | Decisão                                                                                                                                                                                                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | Angular 22 (faixa peer do STYNX 1.3.1: `>=22.0.0 <23`; ADR-0015), componentes standalone, `ChangeDetectionStrategy.OnPush`, signals para estado local e de feature, `@angular/router` com rotas lazy por feature, Node `>=24 <25` (ADR-0006)                                                                                                    |
| Kit            | `@detran/ui` (shell, breadcrumbs, feedback pt-BR, tema light/dark, re-exports STYNX table/pagination/empty/loading/toast, i18n) — ADR-0006. O app não reimplementa primitivos                                                                                                                                                                   |
| Plataforma     | `@stynx-nyx/angular` (defaults, interceptors de auth/request-id/tenant/erro), `angular-auth` (OIDC Cognito, sessão, `authGuard`/`permissionGuard`), `angular-tenancy` (tenant do órgão), `angular-i18n` (pt-BR), `angular-ui` (tabela, paginação, confirm-dialog, banner, toast); todos **`1.3.1`** exatos (ADR-0015). DEVAI `1.5.2` (ADR-0028) |
| Bootstrap      | `provideDetranAuthenticatedApp({ angular, oidc, tenancy, i18n })` em `main.ts` (kit `@detran/ui` recompilado sobre Angular 22 / STYNX 1.3.1 em WP-0); nenhum provider de auth/tenant próprio                                                                                                                                                    |
| API            | somente o backend unificado (`/v1/inf/rait/*`, contratos gerados de `docs/framework/contracts/BP-INF-RAIT-*.openapi.json` — ADR-0009); **nenhuma** chamada a SENATRAN, RENAINF ou SNE a partir do browser (ADR-0003)                                                                                                                            |
| Clientes HTTP  | gerados dos OpenAPI (`openapi-typescript` + wrapper `HttpClient`), um por módulo (`case`, `worklist`, `session`) mais os clientes dos módulos **pendentes** (§11)                                                                                                                                                                               |
| Estado         | signals + `computed` em facades por feature; sem NgRx; cache por rota com invalidação por evento; tempo real por SSE do backend (§8)                                                                                                                                                                                                            |
| Idioma         | pt-BR único; catálogo `i18n/pt-BR.json` com chaves `rait.*`; vocabulário de estados = tokens canônicos dos workflows, traduzidos só para rótulo                                                                                                                                                                                                 |
| Acessibilidade | WCAG 2.1 AA, foco visível, operação por teclado das ações críticas ([IU-RAIT-001] §Requisitos 5), risco nunca só por cor                                                                                                                                                                                                                        |
| Fronteiras     | não contém lógica de prazo: datas-limite, bandeiras e tempestividade vêm calculadas do backend; o frontend exibe e valida forma, nunca recalcula prazo legal ([RN-RAIT-005], [RN-RAIT-105])                                                                                                                                                     |

## 2. Domínios e módulos do frontend

Cada módulo é uma pasta lazy em `src/app/features/<modulo>` com rotas próprias, facade, clientes e
componentes. A correspondência com o backend e com as fontes de verdade:

| Módulo FE     | Responsabilidade                                                                                                                                                                           | Backend (módulo gerado)                                             | Fonte de verdade                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `core`        | shell, navegação por papel, sessão, tenant, tema, erro global, atalhos de teclado, SSE                                                                                                     | `backend/app` (auth, tenancy)                                       | ADR-0005, ADR-0006                                                                     |
| `painel`      | painel do turno (T-01), bandeja "prontos para retomar" (T-06)                                                                                                                              | rait-case, rait-worklist                                            | [JRN-RAIT-001]; [WF-RAIT-004] §2                                                       |
| `fila`        | filas de trabalho e claim-next (T-02), limite de casos simultâneos                                                                                                                         | rait-worklist (`assignments`, `pools`)                              | [WF-RAIT-002] §2; [WF-RAIT-004] §4; [RN-RAIT-141]                                      |
| `caso`        | dossiê, triagem (T-03), instrução (T-04), diligência (T-05), minuta (T-07), partes, prazos, histórico                                                                                      | rait-case (todas as entidades)                                      | [UC-RAIT-002], [UC-RAIT-003], [UC-RAIT-026], [UC-RAIT-028]                             |
| `protocolo`   | intake físico e digitalização (T-08), pendências, remessas, redirecionamentos, desistências (T-17)                                                                                         | rait-case (`cases`, `documents`, `parties`)                         | [UC-RAIT-001], [UC-RAIT-012], [UC-RAIT-017], [UC-RAIT-027], [UC-RAIT-028]              |
| `assinatura`  | fila da autoridade signatária e decisão da defesa (T-07 lado autoridade)                                                                                                                   | rait-case (`decisions`)                                             | [UC-RAIT-016]; [RN-RAIT-143]                                                           |
| `autoridade`  | provimentos a avaliar — recurso vinculado (T-16)                                                                                                                                           | rait-case                                                           | [UC-RAIT-008]; [RN-RAIT-130]                                                           |
| `colegiado`   | distribuição por lote e sorteio (T-09), relatoria e voto (T-10), pauta (T-11), sessão ao vivo (T-12), banca, ata (T-13), vistas, calendário — parametrizado por órgão (`jari` \| `cetran`) | rait-session, rait-worklist                                         | [UC-RAIT-004]…[UC-RAIT-006], [UC-RAIT-014], [UC-RAIT-015], [UC-RAIT-019]…[UC-RAIT-021] |
| `gestao`      | radar de prescrição (T-14/T-15), produção e metas, capacidade, turmas, incidentes e extinções                                                                                              | rait-worklist (`clocks`, `clock-alerts`) + dashboard                | [UC-RAIT-010], [UC-RAIT-023], [UC-RAIT-038]…[UC-RAIT-040]                              |
| `organizacao` | escala e plantão, membros e mandatos, pools, jeton                                                                                                                                         | rait-worklist (`pool-members`) + **pendente** (escala, lote, jeton) | [UC-RAIT-013], [UC-RAIT-036], [UC-RAIT-037]; [WF-RAIT-004] §3, §10                     |
| `integracoes` | painel RENAINF/RENACH/SNE: filas de retransmissão, divergências, conciliação                                                                                                               | **pendente** (adapter/outbox)                                       | [UC-RAIT-029]…[UC-RAIT-031]                                                            |
| `financeiro`  | arrecadação por fase, restituições, cobrança/dívida ativa, conciliação de pagamentos                                                                                                       | **pendente** (módulo financeiro / infração)                         | [UC-RAIT-032]…[UC-RAIT-035]                                                            |
| `arquivo`     | busca de autos encerrados, dossiê final selado, retenção                                                                                                                                   | rait-case (`documents`, `events`)                                   | [UC-RAIT-024]                                                                          |
| `auditoria`   | trilha por caso/período, exportações com finalidade                                                                                                                                        | rait-case (`events`) + audit do kernel                              | [UC-RAIT-042]                                                                          |
| `admin`       | parâmetros operacionais, calendário de feriados, atos de suspensão                                                                                                                         | **pendente** (parâmetros) + rait-worklist (`pools`)                 | [UC-RAIT-022], [UC-RAIT-043]                                                           |

`shared/` reúne componentes de domínio reutilizados por vários módulos (§5) e `data/` os clientes
e modelos gerados.

## 3. Papéis e permissões

Os dez papéis abaixo são **canônicos** desde 2026-09-12 (Owner, steering G.35; ADR-0015): estão
em `backend/domains/shared/src/roles.ts` (`RAIT_ROLES`), na matriz de política (`RAIT_SURFACE_RULES`
e `RAIT_COMMAND_RULES`, chaves `inf:rait-<recurso>:<ação>`), no DDL (`auth.role_catalog`) e em
`shared/actors.md` §Papéis granulares RAIT. As guardas de rota e a navegação usam exatamente
estes códigos. Um usuário pode acumular papéis (união, ADR-0005).

| Papel (código canônico)  | Quem                                                 | Módulos visíveis                                                            |
| ------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------- |
| `rait-analyst`           | revisor/analista da defesa prévia                    | painel, fila (defesa), caso, protocolo (leitura)                            |
| `rait-coordinator`       | coordenador e subcoordenador da defesa prévia        | + organização (escala, pools), gestão (produção, capacidade), qualidade     |
| `rait-secretary`         | secretaria do órgão e dos colegiados                 | protocolo, colegiado (distribuição, banca, ata, calendário), arquivo, jeton |
| `rait-signing-authority` | autoridade de trânsito investida (por circunscrição) | assinatura                                                                  |
| `rait-central-authority` | autoridade centralizada do recurso vinculado         | autoridade (provimentos)                                                    |
| `rait-rapporteur`        | membro/conselheiro (titular ou suplente)             | painel, fila (recurso), caso (leitura), colegiado (relatoria, sessão)       |
| `rait-chair`             | presidente JARI / CETRAN-AM (ou suplente)            | + colegiado (distribuição, pauta, banca, extraordinária, vistas)            |
| `rait-manager`           | gestor RAIT                                          | gestão, organização (leitura), integrações (leitura), incidentes            |
| `rait-hr`                | RH/gabinete                                          | organização (membros e mandatos, jeton)                                     |
| `rait-finance`           | financeiro/tesouraria                                | financeiro                                                                  |
| `integration-operator`   | existente (TEAT)                                     | integrações                                                                 |
| `AUDITOR`                | existente                                            | auditoria (somente leitura em tudo)                                         |
| `agency-admin`           | existente                                            | admin                                                                       |

Guardas: `authGuard` (sessão STYNX), `tenantGuard`, `roleGuard(roles[])` por rota, e
`caseAccessGuard` (o caso pertence ao pool/unidade do usuário, ou o papel é transversal). O botão
de uma ação só aparece quando `isDetranActionAllowed(principal, resource, action)` retorna
verdadeiro para o par recurso/ação da §7 — a mesma matriz do backend, obtida no login.

## 4. Mapa de rotas

Todas as rotas abaixo de `/` exigem sessão. `:orgao` ∈ {`jari`, `cetran`}. Cada rota lista tela
([IU-RAIT-001]), papéis, dados carregados (resolver) e caso de uso.

```text
/                                   → redireciona para o painel do papel principal
/painel                             T-01  todos                 resolver: resumo do turno (fila, vencendo, diligências, parados)
/painel/retomar                     T-06  analyst, rapporteur   bandeja "prontos para retomar"
/fila/defesa                        T-02  analyst               fila coletiva do pool defesa_previa + botão "puxar próximo"
/fila/recurso/:orgao                T-02  rapporteur            meus casos distribuídos (relatoria)
/casos/:id                          T-04  todos com acesso      layout do caso com abas (resolver: caso, partes, prazos, bandeiras)
  /casos/:id/resumo                       —                     cabeçalho, estado, relógios, próximas ações
  /casos/:id/triagem                T-03  analyst, secretary    4 critérios de admissibilidade
  /casos/:id/dossie                 T-04  todos                 documentos, evidências, peças
  /casos/:id/diligencias            T-05  analyst, rapporteur   abrir/responder/prorrogar
  /casos/:id/minuta                 T-07  analyst               editor de minuta (não assina)
  /casos/:id/decisao                T-07  signing-authority     decisão/assinatura (lado autoridade)
  /casos/:id/prazos                       todos                 timers, base legal, marcos por canal
  /casos/:id/partes                       secretary, analyst    requerente, procurador, legitimidade
  /casos/:id/comunicacoes                 secretary             envios e marcos de ciência
  /casos/:id/impedimentos                 rapporteur, chair     declarar impedimento / arguições
  /casos/:id/historico                    todos                 eventos e trilha
/protocolo                          T-08  secretary             lista de intake do dia
  /protocolo/novo                   T-08  secretary             cadastro e digitalização de peça física
  /protocolo/pendencias                   secretary             pendências de conteúdo mínimo (UC-028)
  /protocolo/remessas                     secretary             F-J-0: remessas à JARI, T-REM10 (UC-017)
  /protocolo/redirecionamentos            secretary             peças de/para outro órgão (UC-027)
  /protocolo/desistencias           T-17  secretary             registro de desistência (UC-012)
/assinatura                               signing-authority     fila F-DP-5 da circunscrição, ordenada (UC-016)
  /assinatura/:caseId               T-07  signing-authority     decisão com minuta lado a lado
/autoridade/provimentos             T-16  central-authority     provimentos da JARI a avaliar, dias restantes de T-R2 (UC-008)
/colegiado/:orgao                         rapporteur, chair, secretary
  /colegiado/:orgao/distribuicao    T-09  chair, secretary      lotes de sorteio (UC-014)
  /colegiado/:orgao/distribuicao/:loteId  chair, secretary      ata do lote, aceites, impedimentos
  /colegiado/:orgao/relatoria       T-10  rapporteur            meus casos, T-VOTO, aceitar lote
  /colegiado/:orgao/relatoria/:caseId/voto T-10 rapporteur      redação do parecer e voto (UC-004)
  /colegiado/:orgao/pauta           T-11  chair                 montagem e fechamento da pauta (UC-005)
  /colegiado/:orgao/sessoes               chair, secretary, rapporteur  calendário e lista de sessões
  /colegiado/:orgao/sessoes/:id     T-12  todos do colegiado    sessão ao vivo: quorum, itens, votos (UC-006)
  /colegiado/:orgao/sessoes/:id/banca     secretary, chair      confirmação de banca e suplentes (UC-015)
  /colegiado/:orgao/sessoes/:id/ata T-13  secretary, chair      ata gerada, assinatura, publicação (UC-020)
  /colegiado/:orgao/vistas                chair, rapporteur     itens com vista e prazos (UC-019)
  /colegiado/:orgao/extraordinaria        chair                 convocação extraordinária (UC-021)
/gestao                                   manager, coordinator
  /gestao/radar                     T-14  manager               radar de prescrição por relógio (UC-010)
  /gestao/radar/:caseId             T-15  manager               drill-down e ação (reatribuir, priorizar, escalar)
  /gestao/producao                        manager, coordinator  produção, metas, taxa de provimento (UC-040)
  /gestao/capacidade                      coordinator, manager  projeção e plano do período (UC-038)
  /gestao/turmas                          manager               unidades e constituição (UC-039)
  /gestao/incidentes                      manager               PRESCRITO_OPERACIONAL, extinções declaradas (UC-023)
  /gestao/qualidade                       coordinator           amostragem e achados (UC-025)
/organizacao                              coordinator, chair, secretary, hr
  /organizacao/escala                     coordinator, chair    escala semanal e plantão (UC-013)
  /organizacao/membros                    hr, chair             membros, mandatos, posse, perda (UC-037)
  /organizacao/pools                      coordinator, admin    pools e estratégias
  /organizacao/jeton                      secretary, hr         folha de remuneração por sessão (UC-036)
/integracoes                              integration-operator, manager
  /integracoes/renainf                    —                     espelhamento e recibos (UC-029)
  /integracoes/renach                     —                     penalidades definitivas e estornos (UC-030)
  /integracoes/falhas                     —                     retransmissão e conciliação (UC-031)
/financeiro                               finance
  /financeiro/arrecadacao                 —                     documentos por fase (UC-032)
  /financeiro/restituicoes                —                     ordens de restituição (UC-033)
  /financeiro/cobranca                    —                     cobrança e dívida ativa (UC-034)
  /financeiro/conciliacao                 —                     retornos bancários (UC-035)
/arquivo                                  secretary, AUDITOR
  /arquivo/busca                          —                     autos encerrados
  /arquivo/casos/:id                      —                     dossiê final selado, vista/cópia (UC-024)
  /arquivo/retencao                       secretary             fila de retenção e anonimização
/auditoria                                AUDITOR
  /auditoria/trilha                       —                     trilha por caso/período (UC-042)
  /auditoria/exportacoes                  —                     exportações registradas
/admin                                    agency-admin
  /admin/parametros                       —                     timers operacionais, WIP, lotes, escada (UC-043)
  /admin/calendario                       —                     feriados nacional + AM
  /admin/atos/suspensao                   —                     atos de força maior (UC-022)
/conta                                    todos                 perfil, papéis ativos, tema
```

Regras de roteamento: rota de caso usa `canMatch` por papel para escolher a aba inicial
(analista → triagem/dossiê; autoridade → decisão; relator → voto); `title` de cada rota gera o
título da janela e o breadcrumb (`DetranBreadcrumbsComponent`); toda rota de lista aceita
`?q=&ordem=&filtro=` sincronizados com o estado da tabela; deep-link em `/casos/:id` é o formato
canônico de compartilhamento interno.

## 5. Componentes

### 5.1 Layout e núcleo (`core/`)

| Componente           | Papel                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `RaitShellComponent` | envolve `DetranAppShellComponent`; navegação calculada dos papéis; ações de topo (busca por protocolo/AIT, tema, conta)   |
| `RoleHomeRedirect`   | guarda funcional que resolve `/` para o painel do papel principal                                                         |
| `SseService`         | assina `/v1/inf/rait/stream` (§8) e publica eventos tipados; reconexão com backoff                                        |
| `ShortcutService`    | atalhos globais: `n` puxar próximo, `g f` fila, `g p` painel, `?` ajuda; desabilitados em campos de texto                 |
| `ErrorBoundary`      | mapeia erros HTTP para `DetranFeedbackComponent` (403 → "sem permissão para esta ação", 409 → "estado mudou, recarregue") |

### 5.2 Compartilhados de domínio (`shared/`)

| Componente                    | Entradas / saídas                                                                                                 | Regra que materializa                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `CaseStateBadge`              | `state`, `instance`                                                                                               | rótulo pt-BR do token canônico; nunca exibe o token cru ao usuário final, mas o mantém em `title` |
| `DeadlineChip`                | `timerCode`, `dueOn`, `legalBasis`, `kind` (`legal` \| `operacional`)                                             | prazo nunca sozinho; meta e teto visualmente distintos ([IU-RAIT-001] §1-2)                       |
| `RiskFlag`                    | `clockCode`, `flag`, `daysRemaining`                                                                              | urgência por ordenação + rótulo textual, não só cor                                               |
| `ClocksPanel`                 | lista de `RaitClock`                                                                                              | quatro relógios A/B/C/D com base legal e dias restantes                                           |
| `CaseHeader`                  | caso, partes, bandeiras, próximas ações permitidas                                                                | cabeçalho fixo de `/casos/:id`                                                                    |
| `DossierViewer`               | documentos por origem (`requerente` \| `oficio`), hash, visualizador PDF/imagem                                   | caso digitalizado tem a mesma forma do nativo ([UC-RAIT-001])                                     |
| `DocumentUploader`            | tipo, origem, digitalizado de papel; devolve `RaitDocument`                                                       | nunca exige documento do órgão ([RN-RAIT-003])                                                    |
| `AdmissibilityChecklist`      | 4 critérios com veredito e fundamento; tempestividade somente leitura (calculada)                                 | [RN-RAIT-001], [RN-RAIT-122]                                                                      |
| `InquiryForm` / `InquiryCard` | destinatário, assunto, prazo (default 15 du), prorrogação única                                                   | [RN-RAIT-004]; [UC-RAIT-003]                                                                      |
| `MinutaEditor`                | editor estruturado (fatos, fundamentos, dispositivo); versões; autor explícito; sem assinatura                    | quem instrui não é quem assina ([IU-RAIT-001] §3)                                                 |
| `DecisionPanel`               | minuta lado a lado, decisão (`acolhida` \| `indeferida` \| …), fundamentação, assinatura PAdES+TSA                | [UC-RAIT-016]                                                                                     |
| `SignatureDialog`             | fluxo de assinatura digital (integração do kernel de assinatura); resultado `signature_ref`                       | steering A.8                                                                                      |
| `OpinionEditor`               | resumo descritivo, análise fundamentada, voto conclusivo obrigatório                                              | [UC-RAIT-004] AC-3                                                                                |
| `QuorumIndicator`             | quorum exigido/observado, presidente presente, paridade (CETRAN), por item                                        | [RN-RAIT-142]                                                                                     |
| `VoteTally`                   | votos por membro, empate, voto de qualidade                                                                       | [WF-RAIT-003]                                                                                     |
| `QueueTable`                  | tabela STYNX com ordem única (risco → prioridade legal → cronológica), colunas por fila, ação principal por linha | [RN-RAIT-141]; [WF-RAIT-004] §2                                                                   |
| `BatchDrawViewer`             | ata do lote: semente, ordem, membro por caso, aceites                                                             | [UC-RAIT-014]                                                                                     |
| `ScheduleGrid`                | membros × dias; estados `DISPONIVEL`/`EM_PLANTAO`/`AUSENTE_PROGRAMADO`; limite `WIP`                              | [UC-RAIT-013]                                                                                     |
| `KpiTile`, `TrendChart`       | indicador com meta e teto separados; série temporal                                                               | [UC-RAIT-040]; [IU-RAIT-001] §2                                                                   |
| `EventTimeline`               | eventos do caso (`RaitCaseEvent`), ator, de→para                                                                  | [UC-RAIT-042]                                                                                     |
| `ImpedimentDialog`            | declarar impedimento / registrar arguição de suspeição, tipo e fundamento                                         | [RN-RAIT-140]                                                                                     |
| `LegalBasisTooltip`           | exibe o dispositivo citado (ex.: "CTB art. 285 §6º")                                                              | transversal                                                                                       |

### 5.3 Por módulo (páginas e componentes inteligentes)

| Módulo      | Páginas (rota)                                                                                                                                                                               | Componentes inteligentes                                                                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| painel      | `ShiftDashboardPage`, `ResumeTrayPage`                                                                                                                                                       | `ShiftSummaryCards` (vencendo em 5 dias, diligências expirando, parados há N dias), `ResumeTrayList`                                                                                  |
| fila        | `DefensePoolQueuePage`, `RapporteurQueuePage`                                                                                                                                                | `ClaimNextButton` (bloqueado por `WIP`), `QueueTable`                                                                                                                                 |
| caso        | `CaseLayoutPage` + abas                                                                                                                                                                      | `TriagePage`, `DossierPage`, `InquiriesPage`, `DraftPage`, `DeadlinesPage`, `PartiesPage`, `CommunicationsPage`, `ImpedimentsPage`, `HistoryPage`                                     |
| protocolo   | `IntakeListPage`, `IntakeNewPage`, `PendingContentPage`, `RemittancesPage`, `RedirectsPage`, `WithdrawalsPage`                                                                               | `IntakeWizard` (canal, marco de tempestividade, partes, documentos, conteúdo mínimo), `RemittanceChecklist`                                                                           |
| assinatura  | `SigningQueuePage`, `SigningDecisionPage`                                                                                                                                                    | `DecisionPanel`, `ReturnToReviewerDialog`                                                                                                                                             |
| autoridade  | `ProvidedAppealsPage`                                                                                                                                                                        | `AuthorityAppealDecision` (recorrer / não recorrer, fundamento, dias restantes)                                                                                                       |
| colegiado   | `BatchesPage`, `BatchDetailPage`, `RapporteurCasesPage`, `OpinionPage`, `AgendaBuilderPage`, `SessionsPage`, `LiveSessionPage`, `BenchPage`, `MinutesPage`, `ViewsPage`, `ExtraordinaryPage` | `BatchDrawViewer`, `AgendaComposer` (arrasta itens; bloqueio sem N3/CRÍTICO), `LiveSessionBoard` (item corrente, quorum, votos, vista, retirada), `MinutesPreview`, `SignatureDialog` |
| gestao      | `RiskRadarPage`, `RiskCaseDrilldownPage`, `ProductionPage`, `CapacityPlanPage`, `UnitsPage`, `IncidentsPage`, `QualitySamplingPage`                                                          | `ClockRadar` (segmentos por relógio/pool/nível), `ReassignDialog`, `CapacitySimulator`, `UnitWizard`, `IncidentForm`, `SampleReviewList`                                              |
| organizacao | `SchedulePage`, `MembersPage`, `PoolsPage`, `JetonPage`                                                                                                                                      | `ScheduleGrid`, `MandateForm`, `PoolStrategyForm`, `JetonSheet` (memória de cálculo)                                                                                                  |
| integracoes | `RenainfMirrorPage`, `RenachPage`, `IntegrationFailuresPage`                                                                                                                                 | `RetryQueueTable`, `ReconciliationDiff` (estado local × nacional)                                                                                                                     |
| financeiro  | `CollectionDocsPage`, `RefundsPage`, `DebtCollectionPage`, `ReconciliationPage`                                                                                                              | `ChargeTierCard` (80/60/juros), `RefundOrderForm`, `HandoffChecklist`                                                                                                                 |
| arquivo     | `ArchiveSearchPage`, `SealedDossierPage`, `RetentionQueuePage`                                                                                                                               | `SealedDossierViewer` (hash, supressão de terceiros)                                                                                                                                  |
| auditoria   | `AuditTrailPage`, `ExportsPage`                                                                                                                                                              | `EventTimeline`, `ExportRequestForm` (finalidade obrigatória)                                                                                                                         |
| admin       | `ParametersPage`, `HolidayCalendarPage`, `SuspensionActsPage`                                                                                                                                | `ParameterEditor` (versionado, prazos legais somente leitura), `ImpactSimulator`, `SuspensionActForm`                                                                                 |

## 6. Jornadas e transições de tela

Cada jornada é a sequência rota → ação → chamada → efeito. Estados entre colchetes são do caso
([WF-RAIT-001]) salvo indicação.

### 6.1 Revisor da defesa prévia ([JRN-RAIT-001])

1. `/painel` — vê resumo do turno (SSE atualiza).
2. `/fila/defesa` — "puxar próximo" (`n`) → `POST assignments` (claim) → `[DISTRIBUIDO]` → redireciona a `/casos/:id/triagem`.
3. Triagem — marca 4 vereditos (tempestividade já calculada) → comando `admitir` ou `nao-conhecer` → `[ADMITIDO]` (evento de efeito suspensivo em recurso) ou `[NAO_CONHECIDO]`.
4. `/casos/:id/dossie` → instrução; documento do órgão ausente → botão "anexar de ofício" (tarefa interna), nunca pedido ao requerente.
5. `/casos/:id/diligencias` → abre diligência (prazo default 15 du) → `[DILIGENCIA]`; o caso some da mesa e entra em `/painel/retomar` quando responde ou vence (`T-DIL` → avança sem arquivar).
6. `/casos/:id/minuta` → redige, versiona, "enviar para assinatura" → `[PRONTO_P_DECISAO]`; tela mostra "aguardando assinatura da autoridade".
7. Recebe devolução com orientação (uma vez) ou vê a decisão assinada em `/casos/:id/decisao` (somente leitura).

### 6.2 Secretaria ([JRN-RAIT-003])

1. `/protocolo/novo` — assistente: canal e marco (postal usa data da postagem), partes e legitimidade, documentos digitalizados com campos extraídos, conteúdo mínimo → protocolo imediato → `[PROTOCOLADO]`; peça com mais de um AIT é recusada com orientação.
2. `/protocolo/pendencias` — pendências de conteúdo com prazo; juntadas datadas.
3. `/protocolo/remessas` — F-J-0: checklist de ofício, remeter, `T-REM10` visível; recebimento pela JARI registra o marco.
4. `/protocolo/desistencias` — termo, legitimidade, encerra diligências e remove de pauta → `[ENCERRADO_DESISTENCIA]`.
5. `/colegiado/:orgao/distribuicao` — abre lote, roda o sorteio, presidente homologa → aceites em `T-CLAIM`.
6. `/colegiado/:orgao/sessoes/:id/banca` — confirma presenças, convoca suplente de plantão.
7. `/colegiado/:orgao/sessoes/:id/ata` — gera, colhe assinaturas, publica (marco de `T-R2`).
8. `/organizacao/jeton` — apura e gera a folha.
9. `/arquivo/retencao` — aplica retenção.

### 6.3 Autoridade signatária

1. `/assinatura` — fila da circunscrição, ordem única, `T-ASS` por linha.
2. `/assinatura/:caseId` — minuta e dossiê lado a lado → "acolher" / "indeferir" com fundamentação → `SignatureDialog` → `[DECIDIDO_AUTORIDADE]`; ou "devolver com orientação" (1x); ou "declarar impedimento".

### 6.4 Relator e presidente ([JRN-RAIT-002])

1. `/colegiado/:orgao/relatoria` — lote sorteado: "aceitar" ou "declarar impedimento" em `T-CLAIM`; `T-VOTO` por caso.
2. `/colegiado/:orgao/relatoria/:caseId/voto` — `OpinionEditor` (resumo, análise, voto) → `[PRONTO_P_DECISAO]`.
3. Presidente: `/colegiado/:orgao/pauta` — `AgendaComposer` destaca `ALERTA_N3`/`CRITICO` (fechamento bloqueado sem eles); fechar → `[PAUTADO]`, sessão `PAUTA_FECHADA`, convocação disparada.
4. `/colegiado/:orgao/sessoes/:id` — `LiveSessionBoard`: abertura só com quorum (`SESSAO_ABERTA`), item a item: relatoria lida, votação, vista, retirada por impedimento, empate → voto de qualidade (CETRAN), proclamação; tudo registrado ao vivo.
5. `/colegiado/:orgao/sessoes/:id/ata` → assinatura → publicação; casos → `[COMUNICADO]`.

### 6.5 Gestor ([JRN-RAIT-004])

1. `/gestao/radar` — segmenta por relógio (A/B/C/D), pool, nível; cada linha com dias restantes.
2. `/gestao/radar/:caseId` — causa do atraso; ações: reatribuir (`ReassignDialog`, motivo tipado), priorizar em pauta, escalar ao presidente, abrir incidente.
3. `/gestao/producao` — tempo por fase, aderência ao SLA local, taxa de provimento por enquadramento; gera relatório de problemas sistemáticos ao TEAT.
4. `/gestao/capacidade` — projeção, simulação, plano do período, pedido de reforço.
5. `/gestao/turmas` — constituição de nova turma (`TURMA_EM_CONSTITUICAO` → `TURMA_ATIVA`), coordenador obrigatório.

### 6.6 Transições de estado disparadas pela UI

| Ação na UI                             | Pré-estado                                                 | Pós-estado                             | Rota de origem                           |
| -------------------------------------- | ---------------------------------------------------------- | -------------------------------------- | ---------------------------------------- |
| protocolar                             | —                                                          | `PROTOCOLADO`                          | `/protocolo/novo`, (Portal)              |
| iniciar triagem                        | `PROTOCOLADO`                                              | `TRIAGEM_ADMISSIBILIDADE`              | `/casos/:id/triagem`                     |
| admitir / não conhecer                 | `TRIAGEM_ADMISSIBILIDADE`                                  | `ADMITIDO` / `NAO_CONHECIDO`           | `/casos/:id/triagem`                     |
| remeter à JARI / registrar recebimento | `ADMITIDO` → `AGUARDANDO_REMESSA_JARI`                     | `DISTRIBUIDO`                          | `/protocolo/remessas`                    |
| puxar próximo / aceitar lote           | `ADMITIDO` / `DISTRIBUIDO`                                 | `EM_INSTRUCAO`                         | `/fila/*`, `/colegiado/:orgao/relatoria` |
| abrir diligência / responder / vencer  | `EM_INSTRUCAO` ↔ `DILIGENCIA`                              | `EM_INSTRUCAO` / `PRONTO_P_DECISAO`    | `/casos/:id/diligencias`                 |
| enviar minuta / registrar voto         | `EM_INSTRUCAO`                                             | `PRONTO_P_DECISAO`                     | `/casos/:id/minuta`, `…/voto`            |
| decidir (autoridade)                   | `PRONTO_P_DECISAO`                                         | `DECIDIDO_AUTORIDADE`                  | `/assinatura/:caseId`                    |
| fechar pauta                           | `PRONTO_P_DECISAO`                                         | `PAUTADO`                              | `/colegiado/:orgao/pauta`                |
| proclamar decisão                      | `PAUTADO`                                                  | `JULGADO_SESSAO`                       | `/colegiado/:orgao/sessoes/:id`          |
| publicar / comunicar                   | `DECIDIDO_AUTORIDADE` / `JULGADO_SESSAO` / `NAO_CONHECIDO` | `COMUNICADO`                           | `…/ata`, automático                      |
| recorrer (autoridade) / decurso        | `COMUNICADO`                                               | `REMETIDO_2A_INSTANCIA` / `TRANSITADO` | `/autoridade/provimentos`, timer         |
| desistir                               | qualquer pré-decisão                                       | `ENCERRADO_DESISTENCIA`                | `/protocolo/desistencias`                |
| reatribuir                             | `DISTRIBUIDO` / `EM_INSTRUCAO` / `DILIGENCIA`              | (inalterado; responsável muda)         | `/gestao/radar/:caseId`, `/organizacao`  |

## 7. Catálogo de ações (comandos)

Cada ação tem recurso/ação de política, papel, pré-condição e chamada. A chave de política é
`inf:rait-<recurso>:<ação>` (notação abreviada `rait.<recurso>:<ação>` na tabela); as chaves
estão registradas em `RAIT_COMMAND_RULES` (`backend/domains/shared/src/policy.ts`, ADR-0015) e
são as mesmas que o `DetranPolicyGuard` avalia no servidor. O backend gerado hoje expõe CRUD; as
ações abaixo pressupõem **endpoints de comando** não gerados (ADR-0007 admite comportamento em
arquivos não gerados) — listados em §11 como dependência e detalhados, com payloads e erros, em
`rait-error-catalog.md` e no pacote de construção `rait-build-pack.md`. Enquanto não existirem, a
UI usa `PATCH` de estado + `POST events`, o que é inaceitável para produção por não validar
guardas no servidor; portanto os comandos são pré-requisito de release.

| Ação (`recurso:ação`)                            | Papel                       | Pré-condição                                 | Comando (proposto)                                               | Efeitos na UI                      |
| ------------------------------------------------ | --------------------------- | -------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------- |
| `rait.case:protocol`                             | secretary, (Portal)         | conteúdo mínimo ou pendência aberta          | `POST /v1/inf/rait/cases`                                        | protocolo exibido no ato           |
| `rait.case:claim-next`                           | analyst                     | `DISPONIVEL`, `WIP` < limite                 | `POST /v1/inf/rait/pools/{id}/claim-next`                        | redireciona ao caso                |
| `rait.case:triage`                               | analyst, secretary          | `TRIAGEM_ADMISSIBILIDADE`                    | `POST /v1/inf/rait/cases/{id}/admissibility`                     | checklist salvo                    |
| `rait.case:admit` / `:reject`                    | analyst                     | 4 vereditos registrados                      | `POST /v1/inf/rait/cases/{id}/commands/admit` \| `non-admission` | badge, evento de efeito suspensivo |
| `rait.case:remit-jari`                           | secretary                   | `ADMITIDO`, instancia `jari`                 | `POST …/commands/remit`                                          | fila de remessas                   |
| `rait.case:receive-judging-body`                 | secretary (colegiado)       | `AGUARDANDO_REMESSA_JARI` / caso cetran      | `POST …/commands/receive`                                        | marco de 24 meses exibido          |
| `rait.case:open-inquiry` / `:answer` / `:extend` | analyst, rapporteur         | `EM_INSTRUCAO` / `DILIGENCIA`                | `POST /v1/inf/rait/inquiries`, `PATCH …/{id}`                    | timer T-DIL                        |
| `rait.case:submit-draft`                         | analyst                     | minuta com dispositivo                       | `POST …/commands/ready`                                          | "aguardando assinatura"            |
| `rait.decision:sign`                             | signing-authority           | `PRONTO_P_DECISAO`, circunscrição, escala    | `POST /v1/inf/rait/decisions` + `…/commands/decide`              | assinatura PAdES                   |
| `rait.decision:return-draft`                     | signing-authority           | 1ª devolução                                 | `POST …/commands/return-draft`                                   | volta ao revisor                   |
| `rait.batch:open` / `:draw` / `:approve`         | secretary / chair           | casos sem relator                            | `POST /v1/inf/rait/batches`, `…/draw`, `…/approve`               | ata do lote                        |
| `rait.batch:accept` / `:impede`                  | rapporteur                  | `T-CLAIM` aberto                             | `POST …/batches/{id}/items/{caseId}/accept` \| `impediment`      | relatoria / redistribuição         |
| `rait.opinion:register`                          | rapporteur                  | `EM_INSTRUCAO`                               | `PATCH /v1/inf/rait/agenda-items/{id}` (opinion)                 | `PRONTO_P_DECISAO`                 |
| `rait.agenda:close`                              | chair                       | itens com parecer; N3/CRÍTICO incluídos      | `POST /v1/inf/rait/sessions/{id}/commands/close-agenda`          | `PAUTADO`, convocação              |
| `rait.session:open` / `:adjourn`                 | chair                       | quorum confirmado                            | `POST …/sessions/{id}/commands/open` \| `adjourn`                | board ao vivo                      |
| `rait.session:vote` / `:casting-vote`            | rapporteur, chair           | item em votação, não impedido                | `POST /v1/inf/rait/votes`                                        | tally                              |
| `rait.session:view-request`                      | rapporteur                  | item lido                                    | `POST …/agenda-items/{id}/commands/view`                         | item reprogramado                  |
| `rait.session:proclaim`                          | chair                       | maioria ou desempate                         | `POST …/agenda-items/{id}/commands/proclaim`                     | `JULGADO_SESSAO`                   |
| `rait.minutes:generate` / `:sign` / `:publish`   | secretary, chair            | `DECISAO_PROCLAMADA`                         | `POST /v1/inf/rait/minutes`, `…/sign`, `…/publish`               | `COMUNICADO`, `T-R2`               |
| `rait.appeal:authority-decide`                   | central-authority           | provido, `T-R2` aberto                       | `POST …/commands/authority-appeal` \| `waive`                    | novo caso cetran ou transitado     |
| `rait.case:withdraw`                             | secretary                   | pré-decisão, termo assinado                  | `POST …/commands/withdraw`                                       | encerrado                          |
| `rait.assignment:reassign`                       | coordinator, manager, chair | motivo tipado                                | `PATCH /v1/inf/rait/assignments/{id}` (release) + `POST`         | novo responsável                   |
| `rait.impediment:declare` / `:suspicion`         | rapporteur / secretary      | caso ativo                                   | `POST /v1/inf/rait/impediments`                                  | exclusão em sorteio e quorum       |
| `rait.schedule:publish`                          | coordinator, chair          | plantonista por dia                          | `POST /v1/inf/rait/schedules` (pendente)                         | elegibilidade                      |
| `rait.member:mandate`                            | hr                          | ato publicado                                | `POST/PATCH /v1/inf/rait/pool-members`                           | membro ativo/encerrado             |
| `rait.jeton:generate` / `:approve`               | secretary / chair           | sessões com ata assinada                     | `POST /v1/inf/rait/jeton-sheets` (pendente)                      | folha                              |
| `rait.unit:constitute` / `:activate`             | manager                     | gatilho de capacidade; coordenador designado | `POST /v1/inf/rait/units` (pendente)                             | turma ativa                        |
| `rait.clock:acknowledge-alert`                   | responsável do nível        | alerta aberto                                | `PATCH /v1/inf/rait/clock-alerts/{id}`                           | reconhecido                        |
| `rait.extinction:declare`                        | signing-authority / chair   | teto atingido                                | `POST …/commands/declare-extinction` (pendente)                  | encerrado; incidente               |
| `rait.suspension-act:create`                     | signing-authority / chair   | prova de força maior                         | `POST /v1/inf/rait/suspension-acts` (pendente)                   | vencimentos reprogramados          |
| `rait.parameter:update`                          | agency-admin                | motivo e vigência                            | `PUT /v1/inf/rait/parameters/{key}` (pendente)                   | versão nova                        |
| `rait.export:create`                             | AUDITOR                     | finalidade                                   | `POST /v1/inf/rait/exports` (pendente)                           | arquivo assinado                   |

Todo comando exige o `updated_at`/versão do recurso como pré-condição (`If-Match`); conflito
(409) reabre a tela com os dados atuais. Toda ação de mudança de estado mostra confirmação com o
efeito jurídico em linguagem clara ("Ao admitir, o efeito suspensivo é instaurado").

## 8. Dados, cache e tempo real

- **Clientes**: `data/api/{case,worklist,session}.client.ts` gerados; modelos TypeScript a partir
  dos schemas (`RaitCase`, `RaitDecision`, `RaitDeadline`, `RaitClock`, `RaitSession`,
  `RaitAgendaItem`, `RaitAttendance`, `RaitVote`, `RaitMinutes`, …). Enums dos contratos são a
  única fonte de tokens (`state`, `instance`, `timer_code`, `flag`, `decision_kind`).
- **Facades por feature** (`CaseFacade`, `QueueFacade`, `SessionFacade`, `RadarFacade`…): expõem
  `signal`s de leitura e métodos de comando; cache por `id` com TTL curto; invalidação por evento SSE.
- **SSE** (`/v1/inf/rait/stream`, pendente): eventos `case.changed`, `assignment.changed`,
  `clock.flag-changed`, `session.changed`, `agenda-item.changed`, `batch.changed`. A sessão ao vivo
  (T-12) e o radar (T-14) dependem dele; fallback por polling de 15 s.
- **Listas**: paginação server-side (contratos limitam a 500); filtros na URL; ordenação padrão =
  ordem única ([RN-RAIT-141]) fornecida pelo backend, não recalculada no cliente.
- **Offline**: não suportado; perda de rede exibe banner e bloqueia comandos.
- **Arquivos**: upload por URL assinada do storage do kernel; visualização inline de PDF/imagem;
  hash exibido.

## 9. Formulários e validação

| Formulário            | Campos obrigatórios                                                                                                                          | Validação de forma (cliente)                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Intake físico         | canal, data do marco (postagem/protocolo), placa + nº do AIT (um só), requerente (nome, CPF/CNPJ, endereço), assinatura presente, documentos | um AIT por requerimento; CPF/CNPJ válidos; data do marco ≤ hoje                         |
| Triagem               | veredito e fundamento por critério; tempestividade somente leitura                                                                           | não conhecimento exige fundamento citando o inciso do art. 4º da Res. 900               |
| Diligência            | destinatário, assunto, prazo                                                                                                                 | destinatário "requerente" bloqueado para documento do órgão; prorrogação 1x             |
| Minuta                | fatos, fundamentos, dispositivo                                                                                                              | dispositivo ∈ {acolher, indeferir}; versão salva a cada envio                           |
| Decisão da autoridade | decisão, fundamentação, assinatura                                                                                                           | circunscrição = do AIT; escala do dia                                                   |
| Parecer/voto          | resumo, análise, voto ∈ {provimento, não provimento, não conhecimento}                                                                       | voto obrigatório                                                                        |
| Lote de sorteio       | pool, casos, membros elegíveis (calculados)                                                                                                  | somente leitura exceto exclusões manuais motivadas                                      |
| Pauta                 | sessão, itens                                                                                                                                | bloqueio sem N3/CRÍTICO; item sem parecer recusado; convocação < 5 du exige confirmação |
| Sessão ao vivo        | presenças, item corrente, votos                                                                                                              | abertura exige quorum; voto de impedido bloqueado                                       |
| Desistência           | termo assinado, legitimidade                                                                                                                 | só pré-decisão                                                                          |
| Escala                | membro × dia, plantonista, `WIP`                                                                                                             | plantonista por dia útil                                                                |
| Mandato               | ato, representação, titular/suplente, datas                                                                                                  | dupla composição JARI × CETRAN bloqueada                                                |
| Reatribuição          | novo responsável (calculado), motivo tipado                                                                                                  | nunca ao impedido                                                                       |
| Ato de suspensão      | casos, período, fundamento, prova                                                                                                            | prazos legais de extinção não selecionáveis                                             |
| Parâmetro             | valor, motivo, vigência                                                                                                                      | prazos legais somente leitura                                                           |
| Exportação            | recorte, finalidade                                                                                                                          | finalidade obrigatória; nominal em massa exige aprovação do DPO                         |

Regra geral: erro de forma inline e em pt-BR; erro de negócio vem do backend no envelope
`StynxError` com código estável do catálogo `rait-error-catalog.md` (por exemplo
`RAIT.CASE_STATE_INVALID`, `RAIT.ASSIGNMENT_WIP_LIMIT`, `RAIT.MEMBER_IMPEDED`,
`RAIT.SESSION_QUORUM_MISSING`, `RAIT.PARAMETER_LEGAL_READONLY`) mapeado a mensagem e, quando
cabível, à base legal. Formulários campo a campo, gates de transição e payloads: ver
`rait-build-pack.md` §C-E.

## 10. Requisitos transversais de interface

1. Prazo com base legal ao lado e distinção visual entre meta operacional e teto legal
   ([IU-RAIT-001] §1-2): `DeadlineChip` tem `kind` obrigatório.
2. Risco por ordenação e texto, não só cor (§4): `RiskFlag` sempre renderiza "faltam N dias".
3. Autoria explícita: minuta × decisão; parecer × ata (§3).
4. Teclado: `n` puxar próximo; `j/k` navegar lista; `enter` abrir; `t` triagem; `d` diligência;
   `v` votar (sessão); `?` ajuda; nenhum atalho ativo em campos de texto.
5. Vocabulário interno não vaza ao cidadão (§7): nenhum componente deste app é reutilizado pelo
   Portal.
6. LGPD: dados do requerente/procurador visíveis por papel; terceiros suprimidos campo a campo em
   vista/cópia ([RN-RAIT-137]); texto livre da petição nunca em listas ou painéis ([RN-RAIT-134]).
7. Tema light/dark via `setDetranTheme`; preferência em `localStorage` do usuário.
8. Densidade: tabelas compactas com linha ativa; painel do turno como "resumo antes da lista".

## 11. Dependências de backend (pré-requisitos de release)

| Dependência                                                                                                       | Módulo FE afetado                         | Situação                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Endpoints de comando com guardas de estado (§7)                                                                   | todos                                     | pendente (contrato) — controladores de `rait-case`/`rait-worklist`/`rait-session` em `main` desde R-0007 CTG-0001/0002 (PR #69), mas `BP-INF-RAIT-*.commands.openapi.json` (WP-C) e o cliente de comando de `@detran/api-clients` só chegam com R-0007 CTG-0004; R-0012 entrega as 11 facades com os 64 métodos M8, todos `throw RaitCommandUnavailableError` mapeado a `rait.common.unavailable` pelo `ErrorBoundary` (`contracts/CTG-0002b.md` §3.5/§4.3) |
| Papéis do RAIT no catálogo canônico e na matriz de política (§3)                                                  | core, guardas                             | **feito** (ADR-0015; `roles.ts`, `policy.ts`, `05-role-catalog.sql`)                                                                                                                                                                                                                                                                                                                                                                                        |
| Fluxo SSE `/v1/inf/rait/stream`                                                                                   | painel, sessão, radar                     | pendente (endpoint) — R-0012 entrega `SseService` com fallback por polling de 15 s após duas falhas em 60 s e banner `rait.states.stream_unavailable` (`rait-events-sse-contract.md` §3; `contracts/CTG-0002a.md` M10)                                                                                                                                                                                                                                      |
| Escala/plantão, lote de sorteio com ata, unidade/turma, suplência, tipo de impedimento, banca ([WF-RAIT-004] §10) | organizacao, colegiado                    | pendente no blueprint do worklist                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Agregado da infração ([WF-INF-003]) e módulo financeiro (arrecadação, restituição, cobrança)                      | financeiro, caso (prazos T-DEC/T-NP-VENC) | pendente (ADR-0014); vocabulário já persistido em `14-inf-lifecycle-vocabulary.sql` (ADR-0015)                                                                                                                                                                                                                                                                                                                                                              |
| Painel de integrações (adapter/outbox: filas, recibos, divergências)                                              | integracoes                               | pendente                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Parâmetros versionados e calendário de feriados                                                                   | admin, timers                             | pendente                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Jeton (folha) e exportações assinadas                                                                             | organizacao, auditoria                    | pendente; regra local do AM sem fonte                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Assinatura PAdES+TSA (kernel `signature`)                                                                         | assinatura, ata                           | pendente de integração no app; R-0012 já modela `context.signatureAvailable=false` (`OD-R12-043`)                                                                                                                                                                                                                                                                                                                                                           |

Enquanto uma dependência não existe, a rota correspondente é registrada mas exibe estado
"indisponível nesta versão", sem mock silencioso (R-0012, WP-F: `organizacao/{escala,jeton}`,
`integracoes/*`, `financeiro/*`, `admin/*`, `auditoria/exportacoes` nesta rodada, M13).

## 12. Estrutura de pastas

Real desde R-0012 (CTG-0002a/b, PRs #81/#85/#90; `apps/rait/web/README.md`; scaffold copiado de
`apps/portal/web`, M1):

```text
apps/rait/web/
  package.json            @detran/rait-web (private, ESM, engines node >=24 <25; Angular 22.1.6;
                           deps: @detran/ui, @detran/api-clients, @stynx-nyx/angular* 1.3.1, rxjs, zod;
                           scripts build/test/lint/typecheck do M1)
  angular.json            projeto rait-web, builder @angular/build:application, outputPath dist,
                           assets de public/, sem service worker (§8: offline não suportado)
  tsconfig.json / .app.json / .spec.json
  vitest.config.ts        jsdom, globals, src/**/*.spec.ts, setupFiles src/test-setup.ts, JIT
  eslint.config.js        M5 do Portal + regras locais rait/* (eslint/local-rules.js, WP-E)
  eslint/local-rules.js   rait/no-client-deadline-math ([RN-RAIT-005]); rait/no-static-token-i18n-key (A1)
  public/runtime-config.js  tenantId, oidcAuthority, clientId (sem segredo)
  src/
    main.ts               bootstrapApplication com provideDetranAuthenticatedApp + provideRouter(RAIT_ROUTES)
    test-setup.ts          TestBed único; resetTestingModule após cada spec
    app/
      app.routes.ts / app.route-manifest.ts   RAIT_ROUTES + RAIT_ROUTE_MANIFEST — 74 entradas
                                               (72 rotas da §4 + /sem-permissao + /auth/callback, A2)
      core/                shell (RaitShellComponent), guards (auth/role/case-access/group-redirect/
                           role-home), session.facade, sse.service (+ fallback de polling),
                           shortcut.service, error-boundary, title.strategy, runtime-config, pages/
                           (forbidden, not-found, auth-callback)
      data/
        api/               8 clientes (case, worklist→session/org/collection/infraction/integration/
                           notification) sobre @detran/api-clients; rait-http, etag-store
        models/            tipos/enums/tokens por módulo, commands.ts, list-page.ts
        facades/           CaseFacade, QueueFacade, SessionFacade, RadarFacade, OrganizationFacade,
                           ProtocolFacade, SigningFacade, ArchiveFacade, AuditFacade, FinanceFacade,
                           IntegrationFacade + read-store/command/list.facade/bundles/stream
        clock.ts, idempotency-key.ts, list-query.ts, shell-search/
      shared/              22 componentes de domínio da §5.2 (+ apoio: page-state, placeholder-page,
                           route-screen, table-column) — *stynxHasPermission do kit, nunca diretiva local
      features/            15 módulos lazy da §2 (painel, fila, caso, protocolo, assinatura,
                           autoridade, colegiado, gestao, organizacao, integracoes, financeiro,
                           arquivo, auditoria, admin, conta); páginas L0/L1/L2 por rota (M13)
      forms/               16 <formulario>.schema.ts (zod, WP-E) + form-gate.ts (FormGate)
      i18n/rait.pt-BR.json  semente docs/framework/arch/i18n/rait.pt-BR.json + rait.shell/states/
                           screens/forms/legal/a11y/nav
      lint/                *.spec.ts (RuleTester das duas regras locais)
      screens/             screens.spec.ts (tela ↔ ficha ↔ rota ↔ i18n)
    testing/               facade.stub, http-fixtures, policy.fixture, clock.stub, session.stub,
                           stynx-session.stub, router-harness, route-manifest.fixture, gates.fixture,
                           i18n-test-catalog, a11y-state/axe spec-helpers, stream-transport.stub, kb.ts
```

`e2e/` (Playwright) da especificação original não foi criado nesta rodada: os critérios de
aceitação de R-0012 (§13) são cobertos por specs vitest/TestBed; jornadas ponta a ponta com backend
real ficam para quando os comandos de `R-0007 CTG-0004` existirem.

## 13. Testes e critérios de pronto

- Unitários (vitest): facades (transições permitidas, cache/invalidação), componentes compartilhados
  (`DeadlineChip` nunca sem base legal; `RiskFlag` com texto; `QueueTable` respeita a ordem do
  backend), guardas de papel.
- Contrato: clientes gerados validados contra os OpenAPI (`pnpm contracts:check` garante que os
  contratos batem com os blueprints; o app falha o build se o cliente gerado divergir).
- E2E (Playwright, perfil `test` do backend com `DETRAN_LOCAL_ROLES`): uma jornada por persona da
  §6, incluindo teclado; sessão ao vivo com dois clientes (presidente e relator) para testar SSE.
- Acessibilidade: axe em cada página; contraste AA; foco visível.
- Pronto quando: todas as rotas da §4 existem (com "indisponível" onde a dependência falta), os
  critérios de aceitação dos UC-RAIT-001…043 mapeados em §6-§7 têm teste, e `pnpm check` passa.

Gates reais desde R-0012 (`docs/meta/agents/orchestra/README.md` §9 corrigido — `ng build`/
`pnpm --filter @detran/rait-web test` deixam de ser "inexistentes"): `pnpm --filter @detran/rait-web
lint|typecheck|test|build`; `pnpm verify:parameter-catalogue`; `pnpm parameters:test`; `pnpm
format:check`; `pnpm check` (raiz, M2) inclui os quatro. Estado ao final do CTG-0002c (TASK-0012,
gate do maestro sobre a árvore completa): `test` → 4434 passed | 139 todo (4573), 154 arquivos;
`build` sem warnings; `pnpm check` EXIT 0. Testes de roteamento (M14) cobrem as 72 rotas + 2
auxiliares: papel mínimo → ativa, cada papel canônico omitido → `/sem-permissao`, sem sessão →
login (presença e ausência). Tela ↔ ficha ↔ rota ↔ i18n provado para as 63 fichas
(`contracts/CTG-0002a.md` A4/A5, C-2A-53/56; `contracts/CTG-0002b.md` C-2B-81). `e2e/` (Playwright)
não existe nesta rodada (§12); os UC-RAIT-001…043 são cobertos por specs unitárias/TestBed sobre
facades e páginas, não por jornada ponta a ponta com backend real. Comandos reais (`POST
…/commands/*`), `caseAccessGuard` e o endpoint SSE ficam `todo` citando `R-0007 CTG-0004`
(M8/OD-R12-005).

## 14. Fora de escopo deste app

Interposição e acompanhamento pelo cidadão (Portal), notificação de NA/NP ao cidadão (processamento
do órgão, [UC-RAIT-041] é backoffice consumido via módulo `caso`/`financeiro`), painéis
cross-app do DASHBOARD (o RAIT publica indicadores; o dashboard os consome), qualquer chamada a
sistemas nacionais a partir do browser.
