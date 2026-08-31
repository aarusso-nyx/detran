# use-cases/ — catálogo do corpus TEAT

Este índice cataloga o corpus de casos de uso/telas do TEAT identificado em
`teat:docs/framework/product/ux-parity/**` (matriz oficial de paridade Web/Mobile, autoridade de
runtime) e em `teat:docs/meta/prototypes/docs/UC-1-mobile.md` (protótipo React, evidência de UX,
não autoridade de runtime — ver `teat:docs/framework/product/README.md`). UC completos abaixo
cobrem os fluxos centrais; o restante do corpus é catalogado por tema/contagem apenas.

## Paridade oficial Web/Mobile (`ux-parity/`)

**Mobile** — 67 telas (62 numeradas + 5 complementares), 576 transições, `implementationStatus`
observado: `gap` (64) / `implemented` (3). Fonte: `teat:docs/framework/product/ux-parity/mobile-matrix.json`.

| Grupo                               | Telas | Exemplos                                                                                                                                                 |
| ----------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ait-completo                        |    15 | Novo AIT — início; veículo; condutor/infrator; enquadramento; local; observações; evidências; assinatura/ciência; revisão; impressão                     |
| sinistros                           |    11 | Novo sinistro; local e horário; condições; veículos/pessoas envolvidos; vítimas; dinâmica; croqui; evidências; AITs vinculados; revisão (ver [APP-BOAT]) |
| autenticacao-e-turno                |     9 | Login; MFA; dispositivo bloqueado; seleção de unidade/equipe/viatura; abertura/encerramento de turno                                                     |
| alcoolemia                          |     8 | Início; etilômetro; resultado; recusa; sinais psicomotores; encaminhamento; termo                                                                        |
| medidas-administrativas             |     7 | Nova medida; retenção; remoção; inventário; transbordo; termo; finalização                                                                               |
| sincronizacao-suporte-e-diagnostico |     6 | Fila de sincronização; item pendente; conflito; diagnóstico; suporte; comunicados                                                                        |
| consultas                           |     6 | Consulta de veículo/condutor; resultado; divergência; falha de consulta                                                                                  |
| complementares                      |     5 | Abordagem sem autuação; fiscalização documental/de carga; ajuda contextual; configurações locais                                                         |

**Web** — 56 telas, 163 transições/ações; `implementationStatus`: `gap` (54) / `implemented` (2).
Fonte: `teat:docs/framework/product/ux-parity/web-matrix.json`.

| Grupo      | Telas | Exemplos                                                                                                                                       |
| ---------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| ait        |     9 | Fila de recebidos; fila de validação; pendentes de saneamento; rejeitados; detalhe; saneamento; rejeição; integração RENAINF/estadual; espelho |
| operations |     6 | Dashboard operacional; mapa de agentes/equipes; operações; turnos ativos; mensagens                                                            |
| admin      |     6 | Órgãos; unidades; usuários/agentes; perfis/permissões; dispositivos; convênios/competências                                                    |
| technical  |     5 | Integrações; filas; certificados; jobs; saúde do sistema                                                                                       |
| normative  |     5 | Catálogos normativos; enquadramentos; regras de validação; templates; pacotes mobile                                                           |
| audit      |     5 | Eventos de auditoria; timeline do AIT/agente; consultas externas; anomalias                                                                    |
| measures   |     4 | Lista/detalhe de medidas; remoções; liberação                                                                                                  |
| evidence   |     4 | Consulta/visualizador de evidências; cadeia de custódia; pacote probatório                                                                     |
| crashes    |     4 | Lista/detalhe de sinistros; complementação; integração RENAEST (ver [APP-BOAT])                                                                |
| bi         |     4 | BI fiscalização/sinistros/qualidade/integração                                                                                                 |
| entry      |     2 | Login; dashboard inicial                                                                                                                       |
| alcohol    |     2 | Procedimentos de alcoolemia; etilômetros                                                                                                       |

**9 jornadas oficiais** (`ux-parity/journeys.json`): ait-complete, administrative-measure,
alcohol-procedure, crash-record, evidence-custody, sync-conflict, audit-export, bi-dashboard,
integration-monitoring — ver [JRN-TEAT-001], [JRN-TEAT-002] para narrativas ponta-a-ponta.

Status de cobertura (`ux-parity/cycle-3-closure.md`, snapshot 2026-05-20): paridade de
navegação/inventário atingida (56/56 telas web, 67/67 mobile, 163/163 e 576/576
transições); paridade **não é** pixel-perfect e várias telas são "shell-functional" — ligação
real a `/v1` ainda progressiva; capacidades nativas (armazenamento seguro, impressora/BLE,
remote-wipe por push) pendentes de hardening.

## Corpus de protótipo — UC-1-mobile.md (evidência, não autoridade)

`teat:docs/meta/prototypes/docs/UC-1-mobile.md` cataloga 216+ casos de uso em 20 grupos (A–T),
cada um seguindo um template genérico (Objetivo/Pré-condições/Fluxo/Pós-condições idênticos, só o
título muda) — útil para confirmar a existência e o agrupamento de funcionalidades, não como
narrativa de negócio específica por caso.

| Grupo | Faixa           | Tema                                                                           |
| ----- | --------------- | ------------------------------------------------------------------------------ |
| G     | UC-1.086–1.118  | Lavratura de AIT (inclui UC-1.088/1.089 abordagem/sem abordagem)               |
| H     | UC-1.119–1.122+ | Ciência, assinatura, recusa, comprovante e impressão                           |
| I     | inclui UC-1.140 | Medidas administrativas (retenção, remoção, liberação)                         |
| N     | UC-1.216–1.225  | Abordagem sem autuação e ações educativas                                      |
| O     | UC-1.226–1.254  | Sinistros/acidentes de trânsito (ver [APP-BOAT] `est/boat/use-cases/INDEX.md`) |
| P     | UC-1.255–1.270  | Evidências digitais e cadeia de custódia                                       |

As regras de negócio substantivas (não o UC boilerplate) estão em
`teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md` — citadas
diretamente nas regras [RN-TEAT-*] e nos UCs completos abaixo.

## UC completos (núcleo)

| id                              | título                                                                           | status |
| ------------------------------- | -------------------------------------------------------------------------------- | ------ |
| [UC-TEAT-001](./UC-TEAT-001.md) | Agente lavra AIT com abordagem ao condutor                                       | draft  |
| [UC-TEAT-002](./UC-TEAT-002.md) | Agente lavra AIT sem abordagem (constatação indireta)                            | draft  |
| [UC-TEAT-003](./UC-TEAT-003.md) | Agente anexa evidência com cadeia de custódia                                    | draft  |
| [UC-TEAT-004](./UC-TEAT-004.md) | Agente coleta assinatura, recusa ou impossibilidade                              | draft  |
| [UC-TEAT-005](./UC-TEAT-005.md) | Dispositivo sincroniza lote de atos offline                                      | draft  |
| [UC-TEAT-006](./UC-TEAT-006.md) | Operador saneia AIT com inconsistência tratável                                  | draft  |
| [UC-TEAT-007](./UC-TEAT-007.md) | Agente conduz procedimento de etilômetro (teste, recusa, sinais, encaminhamento) | draft  |
| [UC-TEAT-008](./UC-TEAT-008.md) | Agente aplica medida administrativa de retenção e recolhimento de documento      | draft  |
| [UC-TEAT-009](./UC-TEAT-009.md) | Agente aciona remoção do veículo e avalia guarda monitorada                      | draft  |
| [UC-TEAT-010](./UC-TEAT-010.md) | Agente captura e vincula gravação de bodycam como evidência do ato legal         | draft  |
| [UC-TEAT-011](./UC-TEAT-011.md) | Diretoria de Fiscalização decide cancelamento de AIT pós-finalização             | draft  |
| [UC-TEAT-012](./UC-TEAT-012.md) | Sistema impede sessão concorrente do mesmo agente em dispositivos diferentes     | draft  |

UC-TEAT-007..012 foram acrescentados na rodada BPO de 2026-08-24, a partir dos achados da rodada de
pesquisa CRAWLER ([REF-SENATRAN-997], [REF-CONTRAN-1025-2026], [REF-CONTRAN-432],
[REF-INMETRO-369-2021], [REF-DETRANAM-TALAO-BODYCAM]) — cobrem os grupos de telas `alcoolemia`
(início, etilômetro, resultado, recusa, sinais psicomotores, encaminhamento, termo) e
`medidas-administrativas` (nova medida, retenção, remoção, termo, finalização) do mobile-matrix,
antes catalogados apenas por contagem, agora com narrativa de negócio própria. Grupo
`sincronizacao-suporte-e-diagnostico` ganha [UC-TEAT-012] para o caso específico de concorrência de
sessão. Ver [WF-TEAT-004], [WF-TEAT-005] para as máquinas de estado correspondentes.

Backlog de UCs não escritos (telas com `implementationStatus: gap` sem narrativa própria ainda):
ver `_intake/proposals.md`.
