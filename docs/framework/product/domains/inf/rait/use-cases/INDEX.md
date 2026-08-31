# use-cases/ — catálogo do corpus RAIT

Doze casos de uso completos cobrem o ciclo operacional inteiro descrito em
[WF-RAIT-001], [WF-RAIT-002] e [WF-RAIT-003]: intake, triagem, instrução, julgamento
(1º e 2º circuitos), comunicação, os dois caminhos de escalonamento a 2ª instância, e a
governança de risco/capacidade (monitoramento de prescrição, reatribuição, desistência).

| id                              | Título                                                          | Workflow(s) de referência                    |
| ------------------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| [UC-RAIT-001](./UC-RAIT-001.md) | Secretaria protocola e valida intake multi-canal                | [WF-RAIT-001] `PROTOCOLADO`                  |
| [UC-RAIT-002](./UC-RAIT-002.md) | Analista realiza juízo de admissibilidade                       | [WF-RAIT-001] `TRIAGEM_ADMISSIBILIDADE`      |
| [UC-RAIT-003](./UC-RAIT-003.md) | Analista instrui o caso e conduz diligência                     | [WF-RAIT-001] `EM_INSTRUCAO`/`DILIGENCIA`    |
| [UC-RAIT-004](./UC-RAIT-004.md) | Relator prepara parecer e voto (2º circuito)                    | [WF-RAIT-002] §3, [WF-RAIT-003]              |
| [UC-RAIT-005](./UC-RAIT-005.md) | Presidente monta e fecha a pauta de julgamento                  | [WF-RAIT-002] §4, [WF-RAIT-003]              |
| [UC-RAIT-006](./UC-RAIT-006.md) | Colegiado julga em sessão                                       | [WF-RAIT-003] (máquina completa)             |
| [UC-RAIT-007](./UC-RAIT-007.md) | Secretaria comunica a decisão ao requerente                     | [WF-RAIT-001] `COMUNICADO`                   |
| [UC-RAIT-008](./UC-RAIT-008.md) | Autoridade decide recorrer de decisão de provimento             | [WF-RAIT-001] §Reentrância (autoridade)      |
| [UC-RAIT-009](./UC-RAIT-009.md) | Recorrente interpõe recurso ao CETRAN-AM                        | [WF-RAIT-001] §Reentrância (recorrente)      |
| [UC-RAIT-010](./UC-RAIT-010.md) | Gestor RAIT monitora risco de prescrição                        | [WF-RAIT-001] §Relógios, [WF-RAIT-002] §4-§6 |
| [UC-RAIT-011](./UC-RAIT-011.md) | Reatribuir caso por afastamento, impedimento ou rebalanceamento | [WF-RAIT-002] §5                             |
| [UC-RAIT-012](./UC-RAIT-012.md) | Processar desistência do requerente                             | [WF-RAIT-001] `ENCERRADO_DESISTENCIA`        |

## Backlog de UCs não escritos

- Adesão ao SNE pelo requerente durante o processo (reconhecimento de infração + desconto de
  60%) — hoje só referenciado como fluxo alternativo em [UC-RAIT-012]; pertence mais
  naturalmente ao PORTAL do que ao RAIT.
- Auditoria/exportação de decisões (LGPD, trilha de auditoria) — transversal, ver
  `transversal/dashboard`.
- Sessão extraordinária por acúmulo de casos críticos — mencionado em [UC-RAIT-005]/[UC-RAIT-010]
  como fluxo alternativo, sem UC dedicado.
