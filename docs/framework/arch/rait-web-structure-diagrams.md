---
id: ARCH-RAIT-WEB-DIAGRAMS
title: apps/rait/web — diagramas de módulos, rotas, componentes e fluxo de dados
status: draft
apps: [rait]
updated: 2026-09-12
---

# Diagramas auxiliares da estrutura do frontend

Companheiro visual de `rait-web-frontend.md`. Cada diagrama é gerado a partir do bloco Mermaid
deste arquivo (Mermaid 11.4.1, tema neutro) e salvo em `./diagrams/ARCH-RAIT-WEB-*.svg`; ao
alterar um bloco, regenerar o SVG correspondente. A fonte de verdade da estrutura continua sendo a
especificação; aqui só se desenha o que ela define.

## D1 — Módulos do frontend, módulos do backend e fontes de verdade

Cada módulo lazy de `src/app/features/` conversa com um ou mais módulos gerados do backend
(`backend/domains/inf/rait-*`) ou com um módulo ainda pendente (tracejado).

<!-- svg: ARCH-RAIT-WEB-d1-modulos -->

```mermaid
flowchart LR
    subgraph fe["apps/rait/web — features/"]
        direction TB
        core["core — shell, navegação por papel, sessão, tema, SSE, atalhos"]
        painel["painel — turno T-01, retomar T-06"]
        fila["fila — filas T-02, puxar próximo"]
        caso["caso — dossiê, triagem, diligência, minuta, prazos, partes, histórico"]
        protocolo["protocolo — intake T-08, pendências, remessas, redirecionamentos, desistências T-17"]
        assinatura["assinatura — fila da autoridade, decisão T-07"]
        autoridade["autoridade — provimentos T-16"]
        colegiado["colegiado (jari | cetran) — sorteio T-09, relatoria T-10, pauta T-11, sessão T-12, banca, ata T-13, vistas"]
        gestao["gestao — radar T-14/T-15, produção, capacidade, turmas, incidentes, qualidade"]
        organizacao["organizacao — escala, membros, pools, jeton"]
        integracoes["integracoes — RENAINF, RENACH, falhas"]
        financeiro["financeiro — arrecadação, restituições, cobrança, conciliação"]
        arquivo["arquivo — busca, dossiê selado, retenção"]
        auditoria["auditoria — trilha, exportações"]
        admin["admin — parâmetros, calendário, atos de suspensão"]
    end
    subgraph be["backend/domains/inf — módulos gerados (ADR-0007)"]
        direction TB
        app["backend/app — auth, tenancy, policy guard"]
        rcase["rait-case — cases, parties, documents, admissibility, deadlines, inquiries, decisions, communications, events"]
        rwork["rait-worklist — pools, pool-members, assignments, impediments, clocks, clock-alerts"]
        rsess["rait-session — sessions, agenda-items, attendance, votes, oral-arguments, minutes"]
        rcmd["comandos com guarda de estado (WP-B)"]:::pend
        rinf["agregado da infração BP-INF-INFRACTION-001 (WP-A)"]:::pend
        rfin["financeiro / arrecadação (WP-A/B)"]:::pend
        rint["painel de integrações — outbox do adapter (WP-B)"]:::pend
        rorg["escala, lote de sorteio, unidade/turma, jeton, parâmetros (WP-A/B)"]:::pend
    end
    core --> app
    painel --> rcase & rwork
    fila --> rwork & rcmd
    caso --> rcase & rcmd
    protocolo --> rcase & rcmd
    assinatura --> rcase & rcmd
    autoridade --> rcmd & rinf
    colegiado --> rsess & rwork & rcmd & rorg
    gestao --> rwork & rorg
    organizacao --> rwork & rorg
    integracoes --> rint
    financeiro --> rfin & rinf
    arquivo --> rcase
    auditoria --> rcase & app
    admin --> rorg & rwork
    classDef pend stroke-dasharray: 6 4,fill:#f6f6f6
```

[Renderizado: ARCH-RAIT-WEB-d1-modulos.svg](./diagrams/ARCH-RAIT-WEB-d1-modulos.svg)

## D2 — Rotas de operação (painel, fila, caso, protocolo, assinatura, autoridade)

<!-- svg: ARCH-RAIT-WEB-d2-rotas-operacao -->

```mermaid
flowchart LR
    root["/"] -->|redireciona por papel| painel["/painel  T-01"]
    painel --> retomar["/painel/retomar  T-06"]
    root --> fila["/fila"]
    fila --> filadef["/fila/defesa  T-02 (analyst)"]
    fila --> filarec["/fila/recurso/:orgao  T-02 (rapporteur)"]
    root --> casos["/casos/:id  T-04 layout com abas"]
    casos --> resumo["resumo"]
    casos --> triagem["triagem  T-03"]
    casos --> dossie["dossie  T-04"]
    casos --> dilig["diligencias  T-05"]
    casos --> minuta["minuta  T-07 (analyst)"]
    casos --> decisao["decisao  T-07 (signing-authority)"]
    casos --> prazos["prazos"]
    casos --> partes["partes"]
    casos --> comunic["comunicacoes"]
    casos --> imped["impedimentos"]
    casos --> hist["historico"]
    root --> prot["/protocolo  T-08"]
    prot --> protnovo["novo"]
    prot --> protpend["pendencias"]
    prot --> protrem["remessas  (F-J-0, T-REM10)"]
    prot --> protred["redirecionamentos"]
    prot --> protdes["desistencias  T-17"]
    root --> ass["/assinatura  fila F-DP-5"]
    ass --> asscase["/assinatura/:caseId  T-07"]
    root --> aut["/autoridade/provimentos  T-16"]
    filadef -. "puxar próximo" .-> triagem
    filarec -. abrir .-> dossie
    asscase -. "após assinar" .-> ass
```

[Renderizado: ARCH-RAIT-WEB-d2-rotas-operacao.svg](./diagrams/ARCH-RAIT-WEB-d2-rotas-operacao.svg)

## D3 — Rotas do colegiado (parametrizadas por órgão)

<!-- svg: ARCH-RAIT-WEB-d3-rotas-colegiado -->

```mermaid
flowchart LR
    col["/colegiado/:orgao   (:orgao = jari | cetran)"]
    col --> dist["distribuicao  T-09 — lotes de sorteio (chair, secretary)"]
    dist --> lote["distribuicao/:loteId — ata do lote, aceites, impedimentos"]
    col --> rel["relatoria  T-10 — meus casos, T-VOTO, aceitar lote (rapporteur)"]
    rel --> voto["relatoria/:caseId/voto  T-10 — parecer e voto"]
    col --> pauta["pauta  T-11 — montagem e fechamento (chair)"]
    col --> sess["sessoes — calendário e lista"]
    sess --> live["sessoes/:id  T-12 — sessão ao vivo: quorum, itens, votos"]
    live --> banca["sessoes/:id/banca — presenças e suplentes"]
    live --> ata["sessoes/:id/ata  T-13 — gerar, assinar, publicar"]
    col --> vistas["vistas — itens com vista e prazos"]
    col --> extra["extraordinaria — convocação (chair)"]
    lote -. "aceite em T-CLAIM" .-> rel
    voto -. "PRONTO_P_DECISAO" .-> pauta
    pauta -. "PAUTADO / PAUTA_FECHADA" .-> sess
    ata -. "publicação = marco T-R2" .-> col
```

[Renderizado: ARCH-RAIT-WEB-d3-rotas-colegiado.svg](./diagrams/ARCH-RAIT-WEB-d3-rotas-colegiado.svg)

## D4 — Rotas de gestão, organização, integrações, financeiro, arquivo, auditoria e admin

<!-- svg: ARCH-RAIT-WEB-d4-rotas-gestao -->

```mermaid
flowchart LR
    subgraph g["/gestao (manager, coordinator)"]
        radar["radar  T-14"] --> drill["radar/:caseId  T-15"]
        prod["producao"]
        cap["capacidade"]
        turmas["turmas"]
        inc["incidentes"]
        qual["qualidade (coordinator)"]
    end
    subgraph o["/organizacao (coordinator, chair, secretary, hr)"]
        esc["escala"]
        memb["membros (hr, chair)"]
        pools["pools (coordinator, admin)"]
        jeton["jeton (secretary, hr)"]
    end
    subgraph i["/integracoes (integration-operator, manager)"]
        renainf["renainf"]
        renach["renach"]
        falhas["falhas"]
    end
    subgraph f["/financeiro (finance)"]
        arr["arrecadacao"]
        rest["restituicoes"]
        cob["cobranca"]
        conc["conciliacao"]
    end
    subgraph a["/arquivo (secretary, AUDITOR)"]
        busca["busca"] --> arqcaso["casos/:id — dossiê selado"]
        ret["retencao (secretary)"]
    end
    subgraph au["/auditoria (AUDITOR)"]
        trilha["trilha"]
        exp["exportacoes"]
    end
    subgraph ad["/admin (agency-admin)"]
        par["parametros"]
        cal["calendario"]
        susp["atos/suspensao"]
    end
    conta["/conta (todos)"]
```

[Renderizado: ARCH-RAIT-WEB-d4-rotas-gestao.svg](./diagrams/ARCH-RAIT-WEB-d4-rotas-gestao.svg)

## D5 — Hierarquia de componentes

Do shell às páginas e aos componentes compartilhados de domínio. Setas cheias = composição
(pai contém filho); tracejadas = uso de componente compartilhado.

<!-- svg: ARCH-RAIT-WEB-d5-componentes -->

```mermaid
flowchart TB
    shell["RaitShellComponent (DetranAppShellComponent) — nav por papel, busca, tema, conta"]
    shell --> bc["DetranBreadcrumbsComponent"]
    shell --> fb["DetranFeedbackComponent / ErrorBoundary"]
    shell --> outlet["router-outlet (features lazy)"]
    outlet --> painelp["ShiftDashboardPage / ResumeTrayPage"]
    outlet --> filap["DefensePoolQueuePage / RapporteurQueuePage"]
    outlet --> casol["CaseLayoutPage"]
    outlet --> protp["IntakeListPage / IntakeNewPage / PendingContentPage / RemittancesPage / RedirectsPage / WithdrawalsPage"]
    outlet --> assp["SigningQueuePage / SigningDecisionPage"]
    outlet --> colp["BatchesPage / RapporteurCasesPage / OpinionPage / AgendaBuilderPage / LiveSessionPage / BenchPage / MinutesPage / ViewsPage / ExtraordinaryPage"]
    outlet --> gesp["RiskRadarPage / ProductionPage / CapacityPlanPage / UnitsPage / IncidentsPage / QualitySamplingPage"]
    outlet --> orgp["SchedulePage / MembersPage / PoolsPage / JetonPage"]
    outlet --> outros["Integrações · Financeiro · Arquivo · Auditoria · Admin pages"]
    casol --> header["CaseHeader — estado, partes, bandeiras, ações permitidas"]
    casol --> tabs["abas: TriagePage · DossierPage · InquiriesPage · DraftPage · DeadlinesPage · PartiesPage · CommunicationsPage · ImpedimentsPage · HistoryPage"]
    painelp --> cards["ShiftSummaryCards / ResumeTrayList"]
    filap --> claim["ClaimNextButton (WIP)"]
    protp --> wizard["IntakeWizard / RemittanceChecklist"]
    assp --> dp["DecisionPanel / ReturnToReviewerDialog"]
    colp --> board["LiveSessionBoard / AgendaComposer / MinutesPreview"]
    gesp --> radarc["ClockRadar / ReassignDialog / CapacitySimulator / UnitWizard / IncidentForm"]
    orgp --> grid["ScheduleGrid / MandateForm / PoolStrategyForm / JetonSheet"]
    subgraph shared["shared/ — componentes de domínio"]
        direction LR
        s1["CaseStateBadge · DeadlineChip · RiskFlag · ClocksPanel · LegalBasisTooltip"]
        s2["DossierViewer · DocumentUploader · AdmissibilityChecklist · InquiryForm · MinutaEditor"]
        s3["DecisionPanel · SignatureDialog · OpinionEditor · QuorumIndicator · VoteTally"]
        s4["QueueTable · BatchDrawViewer · ScheduleGrid · KpiTile · TrendChart · EventTimeline · ImpedimentDialog"]
    end
    header -.-> s1
    tabs -.-> s2
    tabs -.-> s3
    board -.-> s3
    filap -.-> s4
    gesp -.-> s4
    colp -.-> s4
```

[Renderizado: ARCH-RAIT-WEB-d5-componentes.svg](./diagrams/ARCH-RAIT-WEB-d5-componentes.svg)

## D6 — Fluxo de dados: componente → facade → cliente → API, SSE e concorrência

<!-- svg: ARCH-RAIT-WEB-d6-fluxo-dados -->

```mermaid
flowchart LR
    comp["Página / componente (OnPush, signals)"]
    fac["Facade da feature (signals, computed, cache por id)"]
    cli["Clientes gerados (openapi-typescript + HttpClient): case · worklist · session · pendentes"]
    ic["Interceptors STYNX: auth (bearer) · request-id · tenant (X-Tenant-Id) · error (envelope StynxError)"]
    api["Backend /v1/inf/rait/* — CRUD gerado + comandos (If-Match, Idempotency-Key)"]
    guard["DetranPolicyGuard — inf:rait-recurso:acao"]
    sse["SseService — /v1/inf/rait/stream (case.changed, assignment.changed, clock.flag-changed, session.changed, agenda-item.changed, batch.changed)"]
    err["ErrorBoundary → DetranFeedbackComponent (403 / 409 / 412 / 422 com base legal)"]
    comp -->|comando ou leitura| fac
    fac --> cli
    cli --> ic
    ic --> api
    api --> guard
    api -->|"200 / 201 (ETag)"| ic
    api -->|"erro (code, status, context)"| ic
    ic -->|"StynxError tipado"| err
    err -.->|"409/412: recarrega"| fac
    sse -->|"evento tipado"| fac
    fac -->|"invalida cache, atualiza signals"| comp
    login["login OIDC → permissions[] (permissionsForRoles)"] -.-> comp
```

[Renderizado: ARCH-RAIT-WEB-d6-fluxo-dados.svg](./diagrams/ARCH-RAIT-WEB-d6-fluxo-dados.svg)

## D7 — Papéis e visibilidade de módulos

<!-- svg: ARCH-RAIT-WEB-d7-papeis-modulos -->

```mermaid
flowchart LR
    subgraph papeis["Papéis canônicos (roles.ts)"]
        direction TB
        an["rait-analyst"]
        co["rait-coordinator"]
        se["rait-secretary"]
        sa["rait-signing-authority"]
        ca["rait-central-authority"]
        ra["rait-rapporteur"]
        ch["rait-chair"]
        ma["rait-manager"]
        hr["rait-hr"]
        fi["rait-finance"]
        io["integration-operator"]
        aud["AUDITOR"]
        adm["agency-admin"]
    end
    subgraph mods["Módulos"]
        direction TB
        mpainel["painel"]
        mfila["fila"]
        mcaso["caso"]
        mprot["protocolo"]
        mass["assinatura"]
        maut["autoridade"]
        mcol["colegiado"]
        mges["gestao"]
        morg["organizacao"]
        mint["integracoes"]
        mfin["financeiro"]
        marq["arquivo"]
        maud["auditoria"]
        madm["admin"]
    end
    an --> mpainel & mfila & mcaso
    an -. leitura .-> mprot
    co --> mpainel & mfila & mcaso & morg & mges
    se --> mprot & mcol & marq & morg & mcaso
    sa --> mass
    ca --> maut
    ra --> mpainel & mfila & mcol
    ra -. leitura .-> mcaso
    ch --> mcol & morg
    ch -. leitura .-> mcaso
    ma --> mges
    ma -. leitura .-> morg & mint
    hr --> morg
    fi --> mfin
    io --> mint
    aud -. "somente leitura" .-> maud & marq & mcaso
    adm --> madm & morg
```

[Renderizado: ARCH-RAIT-WEB-d7-papeis-modulos.svg](./diagrams/ARCH-RAIT-WEB-d7-papeis-modulos.svg)
