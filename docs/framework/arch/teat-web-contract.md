---
id: ARCH-TEAT-WEB-CONTRACT
title: Contrato executável do console web TEAT
status: draft
apps: [teat]
updated: 2026-09-24
---

# Contrato do console web TEAT

Este é o único manifesto de rotas do console `apps/teat/web`. Ele fecha 56
fichas de produto da matriz web, uma ficha BOAT suplementar e quatro rotas
operacionais: **61 rotas**. A
matriz é a autoridade de telas, `roles.ts` é a autoridade dos papéis e
`teat-route-contract.md` é a autoridade de APIs, estados e erros.

## Adenda de homologação UI/workflows — ADR-0033

O aceite de CTG-0004b nesta rodada é de **homologação de UI e workflows**, não
de operação produtiva. A build padrão seleciona uma entrada explícita de
homologação, com token `TEAT_WEB_HOMOLOGATION` e marcador visível
`HOMOLOGAÇÃO — SIMULAÇÃO`; a entrada comum mantém o token ausente. O interceptor
`webHomologationHttpBlockInterceptor` rejeita todo HTTP de backend/remoto,
inclusive leituras GET, e permite somente assets locais. A composição de
homologação não instala OIDC: sessão, tenant, catálogo e consultas de rota são
sintéticos e mantidos em memória, sem reutilizar auth storage ou redirecionar ao
IdP. A UI oferece seletor visível de persona sintética em memória para navegar
as classes de papel da matriz; ele não escreve claims nem persiste identidade.
Os guards reais continuam aplicando RBAC; papel omitido é negado. `ng serve`
sem argumento usa a mesma composição de homologação; a entrada comum com OIDC
exige escolha explícita de configuração. O
`SseService` recebe exclusivamente nesse perfil um port de eventos sintéticos
determinísticos para demonstrar atualização de UI; sem port, retorna fluxo vazio.
Não abre `EventSource` nem polling remoto (ambos contornariam ou gerariam
requests). Fixtures de homologação não criam atos, decisões ou recibos oficiais. Essa
fronteira não altera 61 rotas, 56 fichas, papéis ou a ordem dos guards;
integrações reais não são declaradas a partir de doubles. O app de produção e
suas dependências pertencem ao round posterior dedicado, nas issues #108–#112.

As consultas sintéticas são roteadas por `runtimeClient` e `endpoint`, não por
uma resposta AIT única: cada classe de módulo recebe dado identificado como
demo, e um cenário em memória seleciona estados `data`, `empty` ou `error`.
O usuário pode acionar na UI uma atualização por evento sintético e observar o
fallback demonstrativo sem `EventSource` ou polling de backend. Inspector prova
payload/estado pelo DOM em amostras de todos os 12 módulos, inclusive BOAT como
extensão indisponível, sem inferir integração real de uma fixture.
O port em memória permite provocar indisponibilidade do SSE sintético: após
15 s de relógio, o fallback emite atualização sintética periódica e a UI
exibe marcador explícito. Nem esse fallback nem o evento inicial consultam
backend ou abrem `EventSource`; o perfil comum mantém o contrato produtivo.

## Invariantes de implementação

- Papéis canônicos TEAT: `field-agent`, `field-supervisor`,
  `processing-operator`, `traffic-authority`, `agency-admin`,
  `technical-admin`, `AUDITOR`, `bi-analyst`, `integration-operator`.
  A entrada de matriz `auditor` é normalizada exclusivamente para `AUDITOR`
  por `canonicalRole()`. Papel ausente da coluna **Permitidos** é negado.
- Toda rota de produto executa, nesta ordem, `authGuard`, `tenantGuard`,
  `roleGuard(data.allowedRoles)` e o guarda contextual documentado pela ficha,
  quando houver. A autorização de comando continua no backend; a rota não
  decide mérito, prazo legal ou transição de estado.
- H.39 é preservado: a tela de cancelamento somente apresenta o fluxo e a
  política do servidor, inclusive `addressedTo`; não reinterpreta a autoridade.
  H.54 é preservado: parâmetros, prazos, flags e catálogos são consumidos do
  contrato/servidor, nunca recalculados pelo cliente. E.29/ADR-0031 são preservados:
  pacote normativo vencido em campo é aviso de prontidão, não bloqueio criado pelo web.
  H.55 rege separadamente a homologação de software vencida.
- `ErrorBoundary` é o classificador exclusivo de `StynxError`; usa somente
  `teat-error-catalog.md` e `teat.errors.*`. Páginas não classificam códigos.
  SSE é `GET /v1/ops/stream`; a reconexão indisponível usa polling de 15 s.
- `crashes-list`, `crash-detail`, `crash-complement`, `renaest-integration` e
  `bi-crashes` são pontos de extensão BOAT. Eles não chamam domínio TEAT nem
  transferem a autoridade de `/v1/est/boat/*` para este aplicativo.

Os quatro mounts PC-0013 `/ux/web/crashes-list`, `/ux/web/crash-detail`,
`/ux/web/crash-complement` e `/ux/web/renaest-integration` implementam as quatro telas BOAT
correspondentes no módulo `sinistros`; não há alias novo. W-01…W-04 preservam os quatro papéis
da entrada publicada. A ação `validate` de W-03 é exclusiva de `processing-operator` e
`traffic-authority`; `close` de W-04 é exclusiva de `field-supervisor` e
`traffic-authority`. Dados de vítima exigem sempre `purpose` e auditoria.

### Perfis reutilizáveis

| Perfil      | Cliente permitido                                              | Componentes compartilhados                                                 |
| ----------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `ops`       | gerados `ops`, `offline-sync`, `mobile-bootstrap`, `snapshots` | `Shell`, `PageHeader`, `DataTable`, `StatusBadge`, `SseRefresh`            |
| `ait`       | gerado `ait`                                                   | `Shell`, `PageHeader`, `DataTable`, `StatusBadge`, `ErrorBoundary`         |
| `measures`  | gerado `measures`                                              | `Shell`, `PageHeader`, `DataTable`, `StatusBadge`, `ErrorBoundary`         |
| `alcohol`   | gerado `alcohol`                                               | `Shell`, `PageHeader`, `DataTable`, `StatusBadge`, `ErrorBoundary`         |
| `evidence`  | gerado `evidence`                                              | `Shell`, `PageHeader`, `EvidenceViewer`, `StatusBadge`, `ErrorBoundary`    |
| `audit`     | kernel STYNX `/audit/*`                                        | `Shell`, `PageHeader`, `AuditTimeline`, `DataTable`, `ErrorBoundary`       |
| `bi`        | dashboard (leitura)                                            | `Shell`, `PageHeader`, `DashboardPanel`, `FreshnessBadge`, `ErrorBoundary` |
| `agency`    | gerado `agency`                                                | `Shell`, `PageHeader`, `DataTable`, `StatusBadge`, `ErrorBoundary`         |
| `normative` | gerado `normative`                                             | `Shell`, `PageHeader`, `DataTable`, `StatusBadge`, `ErrorBoundary`         |
| `technical` | outbox/adapter em `/v1/ops/integrations/*`                     | `Shell`, `PageHeader`, `DataTable`, `StatusBadge`, `SseRefresh`            |
| `boat`      | `source_pending` (BOAT, não TEAT)                              | `Shell`, `PageHeader`, `BoatExtensionOutlet`, `ErrorBoundary`              |

`SseRefresh` subscreve os eventos autorizados do contrato e usa o fallback de
15 s. `ErrorBoundary` envolve cada página; nenhum componente cria taxonomia de
erro paralela.

O provider web mescla `BOAT_PT_BR_CATALOG`, cópia byte a byte do catálogo BOAT de 114 chaves,
ao catálogo TEAT sem substituir chaves. Os 13 valores
`source_pending:OD-R15-004` permanecem não traduzidos e não podem ser exibidos na interface.

## Manifesto de rotas e oráculo cartesiano

Em cada linha, **Permitidos** é a linha do oráculo rota × papel: para cada um
dos nove papéis a expectativa é `allow` se estiver listado e `deny` se não
estiver. Logo não existe permissão implícita, inclusive nos perfis
administrativos. `G` é a sequência de guardas; `G*` inclui o guarda contextual
da ficha. `I18n` aponta a chave de título existente.

| Rota                              | Ficha · UX                                      | Permitidos                                                                                                                                      | G                                                  | Cliente                  | I18n                                        | Módulo       | SSE | Página                     |
| --------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------ | ------------------------------------------- | ------------ | --- | -------------------------- |
| `/ux/web/login`                   | `IU-TEAT-login` · `UX-WEB-001`                  | field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin, technical-admin, AUDITOR, bi-analyst, integration-operator | auth → tenant → role                               | sessão STYNX             | `teat.screens.login.title`                  | entry        | não | `LoginPage`                |
| `/ux/web/dashboard-home`          | `IU-TEAT-dashboard-home` · `UX-WEB-002`         | field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin, technical-admin, AUDITOR, bi-analyst, integration-operator | G                                                  | dashboard                | `teat.screens.dashboard-home.title`         | entry        | sim | `DashboardHomePage`        |
| `/ux/web/ops-dashboard`           | `IU-TEAT-ops-dashboard` · `UX-WEB-003`          | field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin                                                             | G                                                  | ops                      | `teat.screens.ops-dashboard.title`          | operations   | sim | `OpsDashboardPage`         |
| `/ux/web/ops-map`                 | `IU-TEAT-ops-map` · `UX-WEB-004`                | field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin                                                             | G                                                  | ops                      | `teat.screens.ops-map.title`                | operations   | sim | `OpsMapPage`               |
| `/ux/web/operations-list`         | `IU-TEAT-operations-list` · `UX-WEB-005`        | field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin                                                             | G                                                  | ops                      | `teat.screens.operations-list.title`        | operations   | sim | `OperationsListPage`       |
| `/ux/web/operation-detail`        | `IU-TEAT-operation-detail` · `UX-WEB-006`       | field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin                                                             | G*                                                 | ops                      | `teat.screens.operation-detail.title`       | operations   | sim | `OperationDetailPage`      |
| `/ux/web/active-shifts`           | `IU-TEAT-active-shifts` · `UX-WEB-007`          | field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin                                                             | G                                                  | mobile-bootstrap         | `teat.screens.active-shifts.title`          | operations   | sim | `ActiveShiftsPage`         |
| `/ux/web/operation-messages`      | `IU-TEAT-operation-messages` · `UX-WEB-008`     | field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin                                                             | G                                                  | ops                      | `teat.screens.operation-messages.title`     | operations   | sim | `OperationMessagesPage`    |
| `/ux/web/ait-inbox`               | `IU-TEAT-ait-inbox` · `UX-WEB-020`              | processing-operator, traffic-authority, agency-admin                                                                                            | G                                                  | ait                      | `teat.screens.ait-inbox.title`              | fiscalizacao | sim | `AitInboxPage`             |
| `/ux/web/ait-validation`          | `IU-TEAT-ait-validation` · `UX-WEB-021`         | processing-operator, traffic-authority, agency-admin                                                                                            | G*                                                 | ait                      | `teat.screens.ait-validation.title`         | fiscalizacao | sim | `AitValidationPage`        |
| `/ux/web/ait-sanitization-queue`  | `IU-TEAT-ait-sanitization-queue` · `UX-WEB-022` | processing-operator, traffic-authority, agency-admin                                                                                            | G                                                  | ait                      | `teat.screens.ait-sanitization-queue.title` | fiscalizacao | sim | `AitSanitizationQueuePage` |
| `/ux/web/ait-rejected`            | `IU-TEAT-ait-rejected` · `UX-WEB-023`           | processing-operator, traffic-authority, agency-admin                                                                                            | G                                                  | ait                      | `teat.screens.ait-rejected.title`           | fiscalizacao | sim | `AitRejectedPage`          |
| `/ux/web/ait-detail`              | `IU-TEAT-ait-detail` · `UX-WEB-024`             | processing-operator, traffic-authority, agency-admin                                                                                            | G*                                                 | ait                      | `teat.screens.ait-detail.title`             | fiscalizacao | sim | `AitDetailPage`            |
| `/ux/web/ait-sanitize`            | `IU-TEAT-ait-sanitize` · `UX-WEB-025`           | processing-operator, traffic-authority, agency-admin                                                                                            | G*                                                 | ait                      | `teat.screens.ait-sanitize.title`           | fiscalizacao | sim | `AitSanitizePage`          |
| `/ux/web/ait-reject`              | `IU-TEAT-ait-reject` · `UX-WEB-026`             | processing-operator, traffic-authority, agency-admin                                                                                            | G*                                                 | ait                      | `teat.screens.ait-reject.title`             | fiscalizacao | sim | `AitRejectPage`            |
| `/ux/web/ait-integration`         | `IU-TEAT-ait-integration` · `UX-WEB-027`        | processing-operator, traffic-authority, agency-admin                                                                                            | G                                                  | ait                      | `teat.screens.ait-integration.title`        | fiscalizacao | sim | `AitIntegrationPage`       |
| `/ux/web/ait-mirror`              | `IU-TEAT-ait-mirror` · `UX-WEB-028`             | processing-operator, traffic-authority, agency-admin                                                                                            | G                                                  | ait                      | `teat.screens.ait-mirror.title`             | fiscalizacao | sim | `AitMirrorPage`            |
| `/ux/web/measures-list`           | `IU-TEAT-measures-list` · `UX-WEB-040`          | field-supervisor, processing-operator, traffic-authority, agency-admin                                                                          | G                                                  | measures                 | `teat.screens.measures-list.title`          | measures     | não | `MeasuresListPage`         |
| `/ux/web/measure-detail`          | `IU-TEAT-measure-detail` · `UX-WEB-041`         | field-supervisor, processing-operator, traffic-authority, agency-admin                                                                          | G*                                                 | measures                 | `teat.screens.measure-detail.title`         | measures     | não | `MeasureDetailPage`        |
| `/ux/web/removals`                | `IU-TEAT-removals` · `UX-WEB-042`               | field-supervisor, processing-operator, traffic-authority, agency-admin                                                                          | G*                                                 | measures                 | `teat.screens.removals.title`               | measures     | não | `RemovalsPage`             |
| `/ux/web/release`                 | `IU-TEAT-release` · `UX-WEB-043`                | field-supervisor, processing-operator, traffic-authority, agency-admin                                                                          | G*                                                 | measures                 | `teat.screens.release.title`                | measures     | não | `ReleasePage`              |
| `/ux/web/alcohol-procedures`      | `IU-TEAT-alcohol-procedures` · `UX-WEB-050`     | field-supervisor, processing-operator, traffic-authority, agency-admin                                                                          | G                                                  | alcohol                  | `teat.screens.alcohol-procedures.title`     | alcohol      | não | `AlcoholProceduresPage`    |
| `/ux/web/breathalyzers`           | `IU-TEAT-breathalyzers` · `UX-WEB-051`          | field-supervisor, processing-operator, traffic-authority, agency-admin                                                                          | G                                                  | alcohol                  | `teat.screens.breathalyzers.title`          | alcohol      | não | `BreathalyzersPage`        |
| `/ux/web/crashes-list`            | `IU-TEAT-crashes-list` · `UX-WEB-060`           | field-supervisor, processing-operator, traffic-authority, agency-admin                                                                          | G                                                  | source_pending (BOAT)    | `teat.screens.crashes-list.title`           | crashes      | não | `CrashesListPage`          |
| `/ux/web/crash-detail`            | `IU-TEAT-crash-detail` · `UX-WEB-061`           | field-supervisor, processing-operator, traffic-authority, agency-admin                                                                          | G*                                                 | source_pending (BOAT)    | `teat.screens.crash-detail.title`           | crashes      | não | `CrashDetailPage`          |
| `/ux/web/crash-complement`        | `IU-TEAT-crash-complement` · `UX-WEB-062`       | field-supervisor, processing-operator, traffic-authority, agency-admin                                                                          | G*                                                 | source_pending (BOAT)    | `teat.screens.crash-complement.title`       | crashes      | não | `CrashComplementPage`      |
| `/ux/web/renaest-integration`     | `IU-TEAT-renaest-integration` · `UX-WEB-063`    | field-supervisor, processing-operator, traffic-authority, agency-admin                                                                          | G                                                  | source_pending (BOAT)    | `teat.screens.renaest-integration.title`    | crashes      | sim | `RenaestIntegrationPage`   |
| `/fiscalizacao/sinistros/titular` | `IU-BOAT-W-05` · `source_pending`               | processing-operator, AUDITOR                                                                                                                    | authGuard → tenantGuard → roleGuard → contextGuard | `@detran/boat-mobile`    | `boat.screens.crash_subject_request.title`  | sinistros    | não | `SubjectRequestPage`       |
| `/ux/web/evidence-search`         | `IU-TEAT-evidence-search` · `UX-WEB-070`        | field-agent, field-supervisor, processing-operator, traffic-authority, AUDITOR, agency-admin                                                    | G                                                  | evidence                 | `teat.screens.evidence-search.title`        | evidence     | não | `EvidenceSearchPage`       |
| `/ux/web/evidence-viewer`         | `IU-TEAT-evidence-viewer` · `UX-WEB-071`        | field-agent, field-supervisor, processing-operator, traffic-authority, AUDITOR, agency-admin                                                    | G*                                                 | evidence                 | `teat.screens.evidence-viewer.title`        | evidence     | não | `EvidenceViewerPage`       |
| `/ux/web/custody-chain`           | `IU-TEAT-custody-chain` · `UX-WEB-072`          | field-agent, field-supervisor, processing-operator, traffic-authority, AUDITOR, agency-admin                                                    | G*                                                 | evidence                 | `teat.screens.custody-chain.title`          | evidence     | não | `CustodyChainPage`         |
| `/ux/web/probative-package`       | `IU-TEAT-probative-package` · `UX-WEB-073`      | field-agent, field-supervisor, processing-operator, traffic-authority, AUDITOR, agency-admin                                                    | G*                                                 | evidence                 | `teat.screens.probative-package.title`      | evidence     | não | `ProbativePackagePage`     |
| `/ux/web/audit-events`            | `IU-TEAT-audit-events` · `UX-WEB-080`           | AUDITOR, traffic-authority, technical-admin, agency-admin                                                                                       | G                                                  | kernel STYNX             | `teat.screens.audit-events.title`           | audit        | sim | `AuditEventsPage`          |
| `/ux/web/ait-timeline`            | `IU-TEAT-ait-timeline` · `UX-WEB-081`           | AUDITOR, traffic-authority, technical-admin, agency-admin                                                                                       | G*                                                 | kernel STYNX + ait       | `teat.screens.ait-timeline.title`           | audit        | sim | `AitTimelinePage`          |
| `/ux/web/agent-timeline`          | `IU-TEAT-agent-timeline` · `UX-WEB-082`         | AUDITOR, traffic-authority, technical-admin, agency-admin                                                                                       | G*                                                 | kernel STYNX             | `teat.screens.agent-timeline.title`         | audit        | sim | `AgentTimelinePage`        |
| `/ux/web/external-queries-audit`  | `IU-TEAT-external-queries-audit` · `UX-WEB-083` | AUDITOR, traffic-authority, technical-admin, agency-admin                                                                                       | G                                                  | kernel STYNX + snapshots | `teat.screens.external-queries-audit.title` | audit        | sim | `ExternalQueriesAuditPage` |
| `/ux/web/anomalies`               | `IU-TEAT-anomalies` · `UX-WEB-084`              | AUDITOR, traffic-authority, technical-admin, agency-admin                                                                                       | G                                                  | kernel STYNX             | `teat.screens.anomalies.title`              | audit        | sim | `AnomaliesPage`            |
| `/ux/web/bi-enforcement`          | `IU-TEAT-bi-enforcement` · `UX-WEB-090`         | bi-analyst, traffic-authority, agency-admin, technical-admin                                                                                    | G                                                  | dashboard                | `teat.screens.bi-enforcement.title`         | bi           | sim | `BiEnforcementPage`        |
| `/ux/web/bi-crashes`              | `IU-TEAT-bi-crashes` · `UX-WEB-091`             | bi-analyst, traffic-authority, agency-admin, technical-admin                                                                                    | G                                                  | source_pending (BOAT)    | `teat.screens.bi-crashes.title`             | bi           | sim | `BiCrashesPage`            |
| `/ux/web/bi-quality`              | `IU-TEAT-bi-quality` · `UX-WEB-092`             | bi-analyst, traffic-authority, agency-admin, technical-admin                                                                                    | G                                                  | dashboard                | `teat.screens.bi-quality.title`             | bi           | sim | `BiQualityPage`            |
| `/ux/web/bi-integrations`         | `IU-TEAT-bi-integrations` · `UX-WEB-093`        | bi-analyst, traffic-authority, agency-admin, technical-admin                                                                                    | G                                                  | dashboard                | `teat.screens.bi-integrations.title`        | bi           | sim | `BiIntegrationsPage`       |
| `/ux/web/admin-orgs`              | `IU-TEAT-admin-orgs` · `UX-WEB-100`             | agency-admin, technical-admin                                                                                                                   | G                                                  | agency                   | `teat.screens.admin-orgs.title`             | admin        | não | `AdminOrgsPage`            |
| `/ux/web/admin-units`             | `IU-TEAT-admin-units` · `UX-WEB-101`            | agency-admin, technical-admin                                                                                                                   | G                                                  | agency                   | `teat.screens.admin-units.title`            | admin        | não | `AdminUnitsPage`           |
| `/ux/web/admin-users-agents`      | `IU-TEAT-admin-users-agents` · `UX-WEB-102`     | agency-admin, technical-admin                                                                                                                   | G                                                  | agency                   | `teat.screens.admin-users-agents.title`     | admin        | não | `AdminUsersAgentsPage`     |
| `/ux/web/admin-profiles`          | `IU-TEAT-admin-profiles` · `UX-WEB-103`         | agency-admin, technical-admin                                                                                                                   | G                                                  | agency                   | `teat.screens.admin-profiles.title`         | admin        | não | `AdminProfilesPage`        |
| `/ux/web/admin-devices`           | `IU-TEAT-admin-devices` · `UX-WEB-104`          | agency-admin, technical-admin                                                                                                                   | G                                                  | agency                   | `teat.screens.admin-devices.title`          | admin        | não | `AdminDevicesPage`         |
| `/ux/web/admin-competencies`      | `IU-TEAT-admin-competencies` · `UX-WEB-105`     | agency-admin, technical-admin                                                                                                                   | G                                                  | agency                   | `teat.screens.admin-competencies.title`     | admin        | não | `AdminCompetenciesPage`    |
| `/ux/web/norm-catalogs`           | `IU-TEAT-norm-catalogs` · `UX-WEB-110`          | traffic-authority, agency-admin, technical-admin                                                                                                | G                                                  | normative                | `teat.screens.norm-catalogs.title`          | normative    | não | `NormCatalogsPage`         |
| `/ux/web/norm-violations`         | `IU-TEAT-norm-violations` · `UX-WEB-111`        | traffic-authority, agency-admin, technical-admin                                                                                                | G                                                  | normative                | `teat.screens.norm-violations.title`        | normative    | não | `NormViolationsPage`       |
| `/ux/web/norm-rules`              | `IU-TEAT-norm-rules` · `UX-WEB-112`             | traffic-authority, agency-admin, technical-admin                                                                                                | G                                                  | normative                | `teat.screens.norm-rules.title`             | normative    | não | `NormRulesPage`            |
| `/ux/web/norm-templates`          | `IU-TEAT-norm-templates` · `UX-WEB-113`         | traffic-authority, agency-admin, technical-admin                                                                                                | G                                                  | normative                | `teat.screens.norm-templates.title`         | normative    | não | `NormTemplatesPage`        |
| `/ux/web/norm-mobile-packages`    | `IU-TEAT-norm-mobile-packages` · `UX-WEB-114`   | traffic-authority, agency-admin, technical-admin                                                                                                | G*                                                 | normative                | `teat.screens.norm-mobile-packages.title`   | normative    | não | `NormMobilePackagesPage`   |
| `/ux/web/tech-integrations`       | `IU-TEAT-tech-integrations` · `UX-WEB-120`      | integration-operator, technical-admin, agency-admin                                                                                             | G                                                  | integrations             | `teat.screens.tech-integrations.title`      | technical    | sim | `TechIntegrationsPage`     |
| `/ux/web/tech-queues`             | `IU-TEAT-tech-queues` · `UX-WEB-121`            | integration-operator, technical-admin, agency-admin                                                                                             | G*                                                 | integrations             | `teat.screens.tech-queues.title`            | technical    | sim | `TechQueuesPage`           |
| `/ux/web/tech-certificates`       | `IU-TEAT-tech-certificates` · `UX-WEB-122`      | integration-operator, technical-admin, agency-admin                                                                                             | G                                                  | integrations             | `teat.screens.tech-certificates.title`      | technical    | sim | `TechCertificatesPage`     |
| `/ux/web/tech-jobs`               | `IU-TEAT-tech-jobs` · `UX-WEB-123`              | integration-operator, technical-admin, agency-admin                                                                                             | G                                                  | integrations             | `teat.screens.tech-jobs.title`              | technical    | sim | `TechJobsPage`             |
| `/ux/web/tech-health`             | `IU-TEAT-tech-health` · `UX-WEB-124`            | integration-operator, technical-admin, agency-admin                                                                                             | G                                                  | integrations             | `teat.screens.tech-health.title`            | technical    | sim | `TechHealthPage`           |
| `/acesso-negado`                  | — operacional                                   | field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin, technical-admin, AUDITOR, bi-analyst, integration-operator | auth → tenant                                      | —                        | `source_pending`                            | core         | não | `AccessDeniedPage`         |
| `/conta`                          | — operacional                                   | field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin, technical-admin, AUDITOR, bi-analyst, integration-operator | auth → tenant                                      | sessão STYNX             | `source_pending`                            | core         | não | `AccountPage`              |
| `/erro`                           | — operacional                                   | field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin, technical-admin, AUDITOR, bi-analyst, integration-operator | auth → tenant                                      | —                        | `source_pending`                            | core         | não | `ErrorPage`                |
| `**`                              | — operacional                                   | field-agent, field-supervisor, processing-operator, traffic-authority, agency-admin, technical-admin, AUDITOR, bi-analyst, integration-operator | auth → tenant                                      | —                        | `source_pending`                            | core         | não | `NotFoundPage`             |

As 57 linhas com ficha são as 56 telas de produto da matriz e a ficha BOAT suplementar; as
últimas quatro não são fichas. A expansão determinista do oráculo é `61 rotas × 9 papéis = 549`
decisões. O teste deve ler a tabela/manifesto implementado e verificar os 549
pares, além de rejeitar rota, papel ou `uxCode` fora desta lista.

## Ownership sem sobreposição

Os conjuntos abaixo são exaustivos e disjuntos. Um arquivo que corresponda a
um padrão do Inspector não pertence a outro worker, mesmo se estiver sob um
diretório de feature.

| Worker           | Paths exclusivos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scaffold         | `apps/teat/web/package.json`; `apps/teat/web/angular.json`; `apps/teat/web/tsconfig*.json`; `apps/teat/web/vitest.config.ts`; `apps/teat/web/src/main.ts`; `apps/teat/web/src/index.html`; `apps/teat/web/src/styles.css`; `apps/teat/web/src/app/app.config.ts`; `apps/teat/web/src/app/app.component.ts`; `apps/teat/web/src/app/app.routes.ts`; `apps/teat/web/src/app/core/shell/**`; `apps/teat/web/src/app/core/error-boundary/**`; `apps/teat/web/src/app/core/role-home/**`; `apps/teat/web/src/app/core/sse.service.ts`; `apps/teat/web/src/app/testing.setup.ts`                                                           |
| Inspector        | `apps/teat/web/**/*.spec.ts`; `apps/teat/web/src/testing/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Feature Engineer | `apps/teat/web/src/app/features/operations/**`; `apps/teat/web/src/app/features/fiscalizacao/**`; `apps/teat/web/src/app/features/measures/**`; `apps/teat/web/src/app/features/alcohol/**`; `apps/teat/web/src/app/features/crashes/**`; `apps/teat/web/src/app/features/evidence/**`; `apps/teat/web/src/app/features/audit/**`; `apps/teat/web/src/app/features/bi/**`; `apps/teat/web/src/app/features/admin/**`; `apps/teat/web/src/app/features/normative/**`; `apps/teat/web/src/app/features/technical/**`; `apps/teat/web/src/app/shared/**`; `apps/teat/web/src/app/data/**` — excluídos `**/*.spec.ts` e `src/testing/**` |

O Scaffold entrega somente shell vazio, configuração e infraestrutura descrita;
o Feature Engineer não altera sua fundação. O Inspector é o único autor de
testes e fixtures. Arquivos gerados de clientes permanecem gerados pelo fluxo
canônico, nunca handwritten por qualquer um dos três workers.

## Gates de aceitação

1. `pnpm format:check`.
2. `pnpm docs:kb:check`.
3. O Inspector valida 61 rotas, 56 fichas mais a ficha BOAT suplementar, os 549 pares do oráculo, cada
   `uxCode`, a normalização única `auditor → AUDITOR` e a disjunção dos três
   conjuntos de paths.
