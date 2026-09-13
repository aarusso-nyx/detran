# use-cases/ — catálogo do corpus RAIT

Doze casos de uso completos cobrem o ciclo operacional inteiro descrito em
[WF-RAIT-001], [WF-RAIT-002] e [WF-RAIT-003]: intake, triagem, instrução, julgamento
(1º e 2º circuitos), comunicação, os dois caminhos de escalonamento a 2ª instância, e a
governança de risco/capacidade (monitoramento de prescrição, reatribuição, desistência).

| id                              | Título                                                                              | Workflow(s) de referência                                   |
| ------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [UC-RAIT-001](./UC-RAIT-001.md) | Secretaria protocola e valida intake multi-canal                                    | [WF-RAIT-001] `PROTOCOLADO`                                 |
| [UC-RAIT-002](./UC-RAIT-002.md) | Analista realiza juízo de admissibilidade                                           | [WF-RAIT-001] `TRIAGEM_ADMISSIBILIDADE`                     |
| [UC-RAIT-003](./UC-RAIT-003.md) | Analista instrui o caso e conduz diligência                                         | [WF-RAIT-001] `EM_INSTRUCAO`/`DILIGENCIA`                   |
| [UC-RAIT-004](./UC-RAIT-004.md) | Relator prepara parecer e voto (2º circuito)                                        | [WF-RAIT-002] §3, [WF-RAIT-003]                             |
| [UC-RAIT-005](./UC-RAIT-005.md) | Presidente monta e fecha a pauta de julgamento                                      | [WF-RAIT-002] §4, [WF-RAIT-003]                             |
| [UC-RAIT-006](./UC-RAIT-006.md) | Colegiado julga em sessão                                                           | [WF-RAIT-003] (máquina completa)                            |
| [UC-RAIT-007](./UC-RAIT-007.md) | Secretaria comunica a decisão ao requerente                                         | [WF-RAIT-001] `COMUNICADO`                                  |
| [UC-RAIT-008](./UC-RAIT-008.md) | Autoridade decide recorrer de decisão de provimento                                 | [WF-RAIT-001] §Reentrância (autoridade)                     |
| [UC-RAIT-009](./UC-RAIT-009.md) | Recorrente interpõe recurso ao CETRAN-AM                                            | [WF-RAIT-001] §Reentrância (recorrente)                     |
| [UC-RAIT-010](./UC-RAIT-010.md) | Gestor RAIT monitora risco de prescrição                                            | [WF-RAIT-001] §Relógios, [WF-RAIT-002] §4-§6                |
| [UC-RAIT-011](./UC-RAIT-011.md) | Reatribuir caso por afastamento, impedimento ou rebalanceamento                     | [WF-RAIT-002] §5                                            |
| [UC-RAIT-012](./UC-RAIT-012.md) | Processar desistência do requerente                                                 | [WF-RAIT-001] `ENCERRADO_DESISTENCIA`                       |
| [UC-RAIT-013](./UC-RAIT-013.md) | Coordenador publica a escala semanal e designa o plantão                            | [WF-RAIT-004] §3                                            |
| [UC-RAIT-014](./UC-RAIT-014.md) | Secretaria executa o sorteio de relatores em lote                                   | [WF-RAIT-004] §5                                            |
| [UC-RAIT-015](./UC-RAIT-015.md) | Secretaria confirma a banca da sessão e convoca suplentes                           | [WF-RAIT-004] §6                                            |
| [UC-RAIT-016](./UC-RAIT-016.md) | Autoridade signatária decide a defesa prévia (acolhe, indefere ou devolve a minuta) | [WF-RAIT-001] `DECIDIDO_AUTORIDADE`; [WF-RAIT-004] F-DP-5   |
| [UC-RAIT-017](./UC-RAIT-017.md) | Secretaria remete o recurso admitido à JARI e registra o recebimento                | [WF-RAIT-001] `AGUARDANDO_REMESSA_JARI`→`DISTRIBUIDO`       |
| [UC-RAIT-018](./UC-RAIT-018.md) | Secretaria executiva do CETRAN-AM registra recebimento e devolve a decisão          | [WF-RAIT-001] `instancia=cetran`                            |
| [UC-RAIT-019](./UC-RAIT-019.md) | Membro pede vista e o presidente reprograma o item                                  | [WF-RAIT-003]                                               |
| [UC-RAIT-020](./UC-RAIT-020.md) | Secretaria lavra, assina e publica a ata (marco de `T-R2`)                          | [WF-RAIT-003] `ATA_LAVRADA`→`ATA_ASSINADA`                  |
| [UC-RAIT-021](./UC-RAIT-021.md) | Presidente convoca sessão extraordinária por casos críticos                         | [WF-RAIT-002] §6; [WF-RAIT-003]                             |
| [UC-RAIT-022](./UC-RAIT-022.md) | Suspensão de prazo por força maior como ato motivado                                | [RN-RAIT-105]                                               |
| [UC-RAIT-023](./UC-RAIT-023.md) | Declarar decadência ou prescrição de ofício e abrir incidente                       | [WF-INF-003] `EXTINTO_DECADENCIA`/`EXTINTO_PRESCRICAO`      |
| [UC-RAIT-024](./UC-RAIT-024.md) | Arquivar autos, custódia e retenção                                                 | [WF-RAIT-001] `TRANSITADO`; [RN-RAIT-136]                   |
| [UC-RAIT-025](./UC-RAIT-025.md) | Revisão de qualidade por amostragem (subcoordenador)                                | [WF-RAIT-004] F-DP-Q                                        |
| [UC-RAIT-026](./UC-RAIT-026.md) | Tratar impedimento declarado ou suspeição arguida                                   | [RN-RAIT-140]                                               |
| [UC-RAIT-027](./UC-RAIT-027.md) | Recurso destinado a outro órgão / redirecionamento com devolução de prazo           | [RN-RAIT-106], [RN-RAIT-109]                                |
| [UC-RAIT-028](./UC-RAIT-028.md) | Sanear pendência de conteúdo mínimo sem consumir prazo                              | [RN-RAIT-002]                                               |
| [UC-RAIT-029](./UC-RAIT-029.md) | Espelhar o estado do processo no RENAINF (senatran-adapter)                         | [WF-INF-003] §8                                             |
| [UC-RAIT-030](./UC-RAIT-030.md) | Cadastrar penalidade/pontuação no RENACH e estornar                                 | [WF-INF-003] `INSTANCIA_ENCERRADA`                          |
| [UC-RAIT-031](./UC-RAIT-031.md) | Operador de integração trata falhas e conciliações                                  | [WF-INF-002] §10                                            |
| [UC-RAIT-032](./UC-RAIT-032.md) | Emitir e atualizar o documento de arrecadação por fase                              | [WF-INF-002] P8                                             |
| [UC-RAIT-033](./UC-RAIT-033.md) | Restituição corrigida após provimento/extinção com pagamento                        | [WF-INF-003] `RESTITUICAO_DEVIDA`                           |
| [UC-RAIT-034](./UC-RAIT-034.md) | Cobrança e dívida ativa (handoff Fazenda)                                           | [WF-INF-003] `EM_COBRANCA`                                  |
| [UC-RAIT-035](./UC-RAIT-035.md) | Conciliar pagamentos com o estado do processo                                       | [WF-INF-003] `PAGAMENTO_CONFIRMADO`                         |
| [UC-RAIT-036](./UC-RAIT-036.md) | Folha de remuneração por sessão (jeton)                                             | [WF-RAIT-003]; [WF-RAIT-004] §8                             |
| [UC-RAIT-037](./UC-RAIT-037.md) | Gestão de mandatos: nomeação, posse, recondução, perda                              | [WF-RAIT-002] §5 `MANDATO_ENCERRADO`                        |
| [UC-RAIT-038](./UC-RAIT-038.md) | Planejar capacidade do período e solicitar reforço                                  | [WF-RAIT-004] §8                                            |
| [UC-RAIT-039](./UC-RAIT-039.md) | Constituir nova turma/JARI e designar coordenador                                   | [WF-RAIT-004] §7 `TURMA_EM_CONSTITUICAO`                    |
| [UC-RAIT-040](./UC-RAIT-040.md) | Acompanhamento gerencial da produção e retroalimentação                             | [APP-RAIT] §KPIs                                            |
| [UC-RAIT-041](./UC-RAIT-041.md) | Expedir a NP após decisão ou decurso, com marcos por canal                          | [WF-INF-003] `PENALIDADE_A_APLICAR`→`NOTIFICADO_PENALIDADE` |
| [UC-RAIT-042](./UC-RAIT-042.md) | Auditor consulta trilha e exporta com controle LGPD                                 | [RN-RAIT-133]…[RN-RAIT-138]                                 |
| [UC-RAIT-043](./UC-RAIT-043.md) | Administrador parametriza pools, timers, calendário e escada                        | [WF-RAIT-002]; [WF-RAIT-004]                                |

## Cobertura ampliada (rodada de 2026-09-12)

Os UC-RAIT-016..043 completam as atividades internas contra [WF-RAIT-001]…[WF-RAIT-004] e
[WF-INF-002]/[WF-INF-003]: **julgamento e processamento** (016 decisão da autoridade, 017/018
remessa e recebimento pelos julgadores, 019 vista, 020 ata e publicação, 021 extraordinária, 022
força maior, 023 extinção de ofício, 024 arquivo e retenção, 025 qualidade, 041 expedição da NP);
**protocolo** (027 outro órgão/redirecionamento, 028 pendência de conteúdo, 026 impedimento e
suspeição); **integração nacional** (029 RENAINF, 030 RENACH, 031 falhas e conciliação);
**Fazenda** (032 arrecadação, 033 restituição, 034 cobrança e dívida ativa como handoff, 035
conciliação de pagamentos); **RH** (036 jeton, 037 mandatos); **planejamento** (038 capacidade,
039 turmas); **gestão** (040 produção e relatórios, 042 auditoria, 043 parametrização). Todos
`draft`; parâmetros sem fonte local (jeton, escala de assinatura, prazo de cobrança administrativa,
limiar de retenção) estão marcados como pendentes.

## Backlog de UCs não escritos

- Adesão ao SNE pelo requerente durante o processo (reconhecimento de infração + desconto de
  60%) — hoje só referenciado como fluxo alternativo em [UC-RAIT-012]; pertence mais
  naturalmente ao PORTAL do que ao RAIT.
- ~~Auditoria/exportação de decisões (LGPD, trilha de auditoria)~~ — escrito como [UC-RAIT-042] (2026-09-12).
- ~~Sessão extraordinária por acúmulo de casos críticos~~ — escrito como [UC-RAIT-021] (2026-09-12).
