---
id: ARCH-DASHBOARD-FRONTENDS
title: DASHBOARD — especificação do frontend de monitoramento (painéis de ação, vigilância e contexto)
status: draft
apps: [dashboard]
updated: 2026-09-13
---

# Frontend do DASHBOARD — monitoramento interno

Especificação de construção de `apps/dashboard/web`, o console interno de monitoramento do
DETRAN-AM: nove painéis inventariados em [IU-DASH-001] (P-01…P-09), organizados nas três camadas
**Ação › Vigilância › Contexto**, mais as telas de apoio que o ciclo do alerta, o calendário de
deveres e a disciplina de frescor exigem. O DASHBOARD é greenfield: não existe protótipo de
origem para os painéis; a origem só contribui com o grupo `bi` do TEAT (4 telas `UX-WEB-090…093`,
todas `gap`) e o blueprint `BP-BI-REPORTING-001` (relatórios gerados, configuração de indicador,
painel BI), absorvidos aqui como telas de apoio. Companheiros: `dashboard-route-contract.md`,
`dashboard-error-catalog.md`, `dashboard-build-pack.md`.

Fontes de verdade: [APP-DASHBOARD] (42 indicadores em quatro blocos), [WF-DASH-001] (ciclo do
alerta), [WF-DASH-002] (calendário de deveres), [WF-DASH-003] (frescor), [UC-DASH-001]…[008],
[RN-DASH-101]…[173] (31 regras), [JRN-DASH-001]…[007], [IU-DASH-001]; ADR-0020 (projeções);
`rait-events-sse-contract.md`. Quando divergirem, vale o artefato de produto.

## 1. Stack, princípios e fronteiras

| Item        | Decisão                                                                                                                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App         | Angular 22 standalone em `apps/dashboard/web`, bootstrap `provideDetranAuthenticatedApp` (OIDC, tenancy, i18n), kit `@detran/ui` (`DetranAppShellComponent`, tabela, paginação, toast, estados vazio/carregando/erro)        |
| Dados       | só projeções `dashboard.*` (ADR-0020) e o estado próprio do painel (alertas, ciclos de dever, frescor, exportações); nenhuma leitura de tabela de outro domínio; nenhuma escrita em domínio                                  |
| Tempo real  | SSE `GET /v1/dashboard/stream` (alertas, frescor, integrações) com fallback de polling de 30 s; cada leitura carrega `freshness` e `asOf`                                                                                    |
| Fronteira   | **nenhum botão pratica ato de negócio** ([RN-DASH-101]): verbos permitidos são ver, filtrar, exportar e notificar um humano; toda ação de mérito é deep-link para o app de origem                                            |
| Camadas     | Ação (cruzou limiar, precisa de dono agora, sempre com verbo) › Vigilância (acompanhamento periódico) › Contexto (sob demanda) — ordem fixa na tela e na navegação ([IU-DASH-001] §B)                                        |
| Segregação  | camadas de acesso N0 (agregados institucionais), N1 (fila operacional), N2 (identificação de objeto de processo), N3 (dado sensível: ninguém pelo DASHBOARD) ([RN-DASH-170]); toda consulta N2 é registrada ([RN-DASH-171])  |
| Exportação  | herda a camada, registra quem/quando/filtros/linhas/formato, marca d'água e cabeçalho de classificação, supressão de célula, vedação absoluta para N3, limite de volume com aprovação nominal ([RN-DASH-172], [RN-DASH-161]) |
| Vocabulário | "sinistro"; letras de relógio A/B/C/D são as do RAIT ([RN-DASH-131]); "meta operacional" e "teto legal" nunca no mesmo componente ([WF-RAIT-002] §4.5)                                                                       |

## 2. Invariantes de interface

1. **Todo número tem selo de frescor** (`FRESCO`, `ATRASADO`, `INDISPONIVEL`, `DESATUALIZADO_MARCADO`) e hora de leitura; bloco `legal-ceiling` oculta em vez de marcar ([WF-DASH-003]).
2. **Severidade nunca só por cor**: forma + rótulo textual (N1, N2, N3, CRÍTICO).
3. **Alerta com anatomia mínima** ([RN-DASH-135]): indicador, objeto, severidade, base legal, dono, tempo restante, relógio governante, próximo marco, trilha.
4. **`CRITICO_EXTINCAO` e `INCIDENTE_REGISTRADO`** têm cor e ícone próprios; o botão é "ver apuração de incidente", nunca "encerrar" ([WF-DASH-001] §Distinção de UI).
5. **ACK manual é rotulado "manual"** enquanto o app de origem não expõe evento de ciência (AC-DASH-002-5).
6. **Encerramento exige verificação por evidência da origem**, nunca autodeclaração.
7. **Prazo do candidato × prazo do órgão** (PEC) rotulados e sem botão de ação no primeiro ([JRN-DASH-007]).
8. **Comparativo abre em distribuição, nunca em ranking**; indicador individual nomeado só em N2 com finalidade declarada ([JRN-DASH-006]).
9. **Dever sem prazo normativo vigente** exibe "sem prazo definido", nunca ausência silenciosa ([RN-DASH-113]).
10. **Classificação P1/P2/P3** aparece como atributo de cada indicador antes de qualquer exibição ou exportação ([RN-DASH-142]).
11. **P-09 (estatística de sinistros) não é construído** até o parecer do limiar de célula (DT-029).

## 3. Papéis e guardas

| Papel do corpus           | Papel RBAC                                                                                                     | Camada máxima                          | Painéis                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------- |
| Operador de monitoramento | `dash-operator` (**novo**, `dashboard-build-pack.md` OD-D01)                                                   | N1                                     | P-01, P-04 (leitura), P-05    |
| Gestor de área            | papéis de gestão dos domínios (`rait-manager`, `rait-coordinator`, `rait-chair`, `traffic-authority`, `pec-*`) | N2 do próprio domínio                  | P-02/P-03/P-06 do seu domínio |
| Gestor DETRAN             | `agency-admin`                                                                                                 | N2 transversal                         | P-01…P-08                     |
| Administração técnica     | `technical-admin`, `integration-operator`                                                                      | N1, sem conteúdo de domínio            | P-04, frescor                 |
| Dono de dever periódico   | `dash-duty-owner` (**novo**) + ouvidoria/financeiro                                                            | N1                                     | P-05                          |
| Auditor / DPO             | `AUDITOR`                                                                                                      | N2 transversal, leitura, sempre logado | P-07, todos em leitura        |
| Analista de BI            | `bi-analyst`                                                                                                   | N1 (agregados)                         | P-06, P-08, relatórios        |

Guardas: `authGuard`, `permissionGuard('dashboard:<recurso>:read')`, `layerGuard(N)` que exige
finalidade declarada para N2 e bloqueia N3 sem exceção, `freshnessInterceptor` que anexa o selo a
toda resposta.

## 4. Módulos, rotas e telas

Rotas sob `/monitoramento`. Ordem do menu = camadas.

| id   | Painel / tela (rota)                                            | Camada          | Conteúdo                                                                                                                                                                                              | UC / origem                             |
| ---- | --------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| D-01 | **P-01** Triagem do turno (`/monitoramento`)                    | Ação            | fila de alertas cross-app ordenada por severidade combinada (legal × operacional × técnica); cada item com dono; "fechar turno" só sem item órfão                                                     | [UC-DASH-002], [JRN-DASH-001]           |
| D-02 | Detalhe do alerta (`/monitoramento/alertas/:id`)                | Ação            | anatomia mínima, ciclo [WF-DASH-001] com timestamps e destinatários, ACK (manual rotulado), deep-link ao objeto na origem, verificação, encerramento                                                  | [UC-DASH-002]                           |
| D-03 | **P-02** Radar de prescrição RAIT (`/monitoramento/radar/rait`) | Ação            | casos por faixa (`SEM_RISCO`…`CRITICO`), relógio governante A/B/C/D nomeado, base legal, tempo restante, filtros pool/circuito/unidade, drill-down ao RAIT                                            | [UC-DASH-001], IND-DASH-101…105         |
| D-04 | **P-03** Escada de prazos PEC (`/monitoramento/radar/pec`)      | Ação            | cinco prazos separados; prazo do candidato (preclusivo, sem ação) × prazo do órgão (bloqueio ativo); 3ª instância "sem prazo legal localizado"                                                        | [UC-DASH-001], IND-DASH-106/107/306…309 |
| D-05 | Radar TEAT (`/monitoramento/radar/teat`)                        | Ação            | T-REG30/T-REG15, homologação SENATRAN, marco T-SNE2027, comparecimento 5 dias, notificação 10 dias, depósito 6 meses, `SUSPEITO_CONCORRENCIA`                                                         | IND-DASH-108…111, 311…314               |
| D-06 | **P-04** Saúde técnica (`/monitoramento/integracoes`)           | Ação/Técnico    | outbox lag, fila offline (idade do lote mais antigo), adapter por sistema nacional (latência p95, erro), custódia, pacotes normativos, faixas, homologação de dispositivo, disponibilidade por painel | [UC-DASH-006], IND-DASH-401…408         |
| D-07 | Detalhe da integração (`/monitoramento/integracoes/:system`)    | Técnico         | triagem transporte × aceite × conteúdo, causa raiz, itens isolados, telas dependentes marcadas desatualizadas                                                                                         | [JRN-DASH-004]                          |
| D-08 | **P-05** Deveres periódicos (`/monitoramento/deveres`)          | Ação/Vigilância | 14 linhas da tabela-mestra ([RN-DASH-120]) em calendário e lista; estado do ciclo corrente; dever próprio × derivado; sanção expressa sinalizada                                                      | [UC-DASH-008], IND-DASH-201…209         |
| D-09 | Ciclo do dever (`/monitoramento/deveres/:id/ciclos/:period`)    | Ação            | `JANELA_ABERTA` → … → `ARQUIVADO`; anexar evidência (protocolo, captura, hash); histórico de atrasos                                                                                                  | [UC-DASH-003], [JRN-DASH-003]           |
| D-10 | **P-06** Comparativo (`/monitoramento/comparativo`)             | Vigilância      | distribuição por pool/circuito/unidade/clínica; faixa de risco, % na meta, MTTA/MTTR, % deveres no prazo; contexto (volume, rotatividade); supressão de célula                                        | [UC-DASH-005], [JRN-DASH-006]           |
| D-11 | **P-07** Trilha de auditoria (`/monitoramento/auditoria`)       | Contexto        | linha do tempo por caso/indicador/período/app; fato do acesso sem conteúdo sensível; lacuna exibida como lacuna; exportação registrada                                                                | [UC-DASH-004], [JRN-DASH-005]           |
| D-12 | **P-08** Transparência ativa (`/monitoramento/transparencia`)   | Vigilância      | checklist art. 8º §1º/§3º (6 blocos + itens técnicos), ciclo mensal de auditoria, datasets abertos com os 7 requisitos, indicadores de serviço art. 22                                                | [UC-DASH-007], IND-DASH-209             |
| D-13 | **P-09** Estatística de sinistros (`/monitoramento/sinistros`)  | Contexto        | **bloqueado** (DT-029); placeholder com o motivo                                                                                                                                                      | [UC-DASH-005]                           |
| D-14 | Catálogo de indicadores (`/monitoramento/indicadores`, `:id`)   | Contexto        | 42 indicadores: bloco, fonte, limiar, dono, classificação P1/P2/P3, latência aceitável, fonte conectada?; edição e publicação de configuração                                                         | origem `indicator-config`               |
| D-15 | Frescor das fontes (`/monitoramento/frescor`)                   | Técnico         | página de status por painel/fonte: última leitura, latência aceitável, estado, heartbeat                                                                                                              | [WF-DASH-003], IND-DASH-408             |
| D-16 | Relatórios (`/monitoramento/relatorios`, `:id`)                 | Contexto        | relatórios gerados (solicitar, acompanhar, baixar com marca d'água); status `processing` → `completed`/`failed`                                                                                       | origem `generated-report`               |
| D-17 | Exportações (`/monitoramento/exportacoes`)                      | Contexto        | registro de exportações (quem, quando, filtros, linhas, formato, finalidade), aprovações nominais pendentes                                                                                           | [RN-DASH-172]                           |
| D-18 | KPIs do painel (`/monitoramento/kpis`)                          | Contexto        | cobertura de indicadores, MTTA, MTTR, % deveres no prazo, frescor médio                                                                                                                               | [APP-DASHBOARD] §KPIs                   |

## 5. Componentes compartilhados (`apps/dashboard/web/src/app/shared/`)

`FreshnessSeal` (estado + `asOf`, oculta valor quando `INDISPONIVEL` em bloco A), `SeverityChip`
(forma + rótulo), `AlertCard` (anatomia mínima), `AlertLifecycle` (estados de [WF-DASH-001]),
`ClockGovernorBadge` (A/B/C/D), `LegalBasisTag`, `TargetVsCeiling` (dois componentes distintos,
nunca um), `DutyCalendar`, `DutyCycleStepper`, `EvidenceAttach` (protocolo/captura/hash),
`DistributionChart` (sem ranking por padrão), `SuppressedCell`, `LayerGate` (finalidade para N2),
`ExportDialog` (classificação, marca d'água, volume), `SourceStatusTable`, `DeepLinkButton`
(sempre para o app de origem), `ClassificationBadge` (P1/P2/P3).

## 6. Jornadas (rota → ação → efeito)

| Jornada        | Sequência                                                                                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [JRN-DASH-001] | D-01 fila → item RAIT N3 → D-02 ACK → deep-link RAIT → item PEC 90% → item BOAT `pending_complement` → item outbox `ERROR` → D-06 → fecha turno sem órfão             |
| [JRN-DASH-002] | D-03 radar → card "21/24 meses, art. 289-A" → deep-link ao dossiê no RAIT → age no RAIT → D-03 reflete o estado lido                                                  |
| [JRN-DASH-003] | D-08 dia 15 `JANELA_ABERTA` → D-09 `PREPARADO` (dia 18) → submete e anexa comprovante (dia 19) → `COMPROVADO` → `ARQUIVADO`; dia 20 sem comprovante = `ATRASADO`      |
| [JRN-DASH-004] | D-06 card "`renach_outbox` 340 em `ERROR`" → D-07 triagem transporte/aceite/conteúdo → correção na infraestrutura → fila baixa → item isolado → causa raiz registrada |
| [JRN-DASH-005] | D-11 parte de `PRESCRITO_OPERACIONAL` → linha do tempo N1/N2/N3/CRÍTICO com destinatários → falha de alerta × falha de ação → exportação registrada                   |
| [JRN-DASH-006] | D-10 distribuição → detalhe por unidade com contexto → produtividade pareada com qualidade → nível restrito com finalidade → ação sugerida = plano de apoio           |
| [JRN-DASH-007] | D-04 card tipo de prazo → marco 90% do prazo do órgão priorizado → `UNDER_REVIEW` = T-JM-DECIDE → recurso à Junta Especial → 3ª instância "sem prazo localizado"      |

## 7. Formulários, validação e gates

| Formulário                        | Campos                                                                              | Validação                                         | Gate                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| ACK do alerta (D-02)              | nota, `channel: origin\|manual`                                                     | `manual` exige nota                               | `NOTIFICADO → RECONHECIDO`                                                   |
| Encerrar alerta (D-02)            | confirmação                                                                         | só com evidência de origem                        | `VERIFICADO → ENCERRADO` (trilha irregularidade); extinção fecha sozinha     |
| Registrar causa raiz (D-07)       | categoria (transporte/aceite/conteúdo), descrição                                   | —                                                 | anexa ao alerta                                                              |
| Avançar ciclo do dever (D-09)     | estado alvo, evidência (`protocol`, `capture_uri`, `hash`)                          | `COMPROVADO` exige evidência completa             | transições de [WF-DASH-002]                                                  |
| Finalidade N2 (`LayerGate`)       | finalidade (catálogo), referência                                                   | obrigatório                                       | registra consulta ([RN-DASH-171])                                            |
| Exportar (D-10/D-11/D-16)         | formato aberto, filtros, finalidade (N2), justificativa de volume                   | N3 vedado; volume acima do limite exige aprovador | evento auditável reforçado; marca d'água                                     |
| Configurar indicador (D-14)       | limiar, dono, latência aceitável, classificação P1/P2/P3, estratégia ocultar/marcar | classificação obrigatória                         | `indicator-config:publish` (`bi-analyst`, `agency-admin`, `technical-admin`) |
| Solicitar relatório (D-16)        | `report_type`, filtros                                                              | tipo de catálogo                                  | `generated-report:request`                                                   |
| Auditoria de transparência (D-12) | checklist marcado, evidências                                                       | itens ausentes viram pendências                   | ciclo mensal do IND-DASH-209                                                 |

## 8. Dados

Projeções de ADR-0020 (`dashboard.prescription_risk`, `dashboard.production`,
`dashboard.integration_health`, `dashboard.crashes`) mais as previstas em
`dashboard-route-contract.md` §6 (`pec_deadlines`, `teat_measures`, `duty_evidence`,
`portal_service_metrics`, `source_freshness`); estado próprio em `dashboard.alert`,
`dashboard.duty_cycle`, `dashboard.indicator`, `dashboard.export_log`, `dashboard.generated_report`.

## 9. Pastas

```text
apps/dashboard/web/src/app/
  core/            bootstrap, guards (layerGuard), interceptors (freshness), sse
  shared/          componentes §5
  features/
    triage/        D-01, D-02
    radar/         D-03, D-04, D-05
    integrations/  D-06, D-07
    duties/        D-08, D-09
    comparison/    D-10
    audit/         D-11
    transparency/  D-12
    crashes/       D-13 (placeholder)
    catalogue/     D-14, D-15, D-18
    reports/       D-16, D-17
```

## 10. Dependências de backend

| Dependência                                                                      | Situação                                                   |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `backend/domains/dashboard` (projeções, estado do alerta, ciclos de dever)       | só README (Fase 3 W3.6)                                    |
| Eventos de origem (RAIT publica `rait.clock.flag-changed` e `rait.case.changed`) | contrato RAIT existe; PEC, BOAT, TEAT, PORTAL sem contrato |
| Evento de ciência (ACK) nos apps de origem                                       | inexistente; ACK manual rotulado                           |
| Papéis `dash-operator`, `dash-duty-owner`                                        | a decidir (OD-D01)                                         |
| Limiar de célula (DT-029), adesão à 14.129 (DT-066)                              | bloqueiam P-09 e parte de P-08                             |
