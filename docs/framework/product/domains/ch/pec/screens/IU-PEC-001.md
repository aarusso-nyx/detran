---
id: IU-PEC-001
title: Inventário de telas do PEC — console clínico, console regulatório e portal do candidato
status: reviewed
apps: [pec, portal]
sources:
  [
    REF-CFM-1636-2002,
    REF-CONTRAN-927-2022,
    REF-LEI-13787-2018,
    REF-SENATRAN-PORTARIA-968-2022,
  ]
updated: 2026-08-26
---

Promovido de `_intake/ux-notes.md` §a na rodada de 2026-08-26. Diferente do TEAT (que tem matriz
oficial de 67 telas) e do BOAT (cujas telas existem no app de campo), **nenhuma tela do PEC está
confirmada como artefato existente** nas fontes lidas — todas são propostas. Isso é informação de
planejamento, não uma lacuna deste documento: o PEC de origem tem implementação, mas seu
inventário de UI não foi capturado no KB.

Acréscimos desta rodada sobre a versão de intake: três telas que os casos de uso exigem e o
inventário não previa (C-12, R-07, P-07), e a marcação de quais telas ficam bloqueadas por
decisão pendente do Owner.

## A — Console clínico (12)

| id       | Tela                                                         | Ator                      | UC / WF                                                                                 |
| -------- | ------------------------------------------------------------ | ------------------------- | --------------------------------------------------------------------------------------- |
| C-01     | Agenda do dia / fila de atendimento                          | Recepção                  | [WF-PEC-003]                                                                            |
| C-02     | Check-in biométrico (captura + validação de presença)        | Técnico Biométrico        | [UC-PEC-002], [RN-PEC-130]                                                              |
| C-03     | Registro de falha + solicitação de exceção                   | Técnico Biométrico        | [UC-PEC-003], [RN-PEC-003]                                                              |
| C-04     | Aprovação de exceção biométrica                              | Supervisor                | [UC-PEC-003]                                                                            |
| C-05     | Atendimento — anamnese e exame médico                        | Médico                    | [UC-PEC-002], [WF-PEC-001]                                                              |
| C-06     | Atendimento — avaliação psicológica                          | Psicólogo                 | [UC-PEC-002], [RN-PEC-104]                                                              |
| C-07     | Entrevista devolutiva (oferecida / realizada)                | Médico, Psicólogo         | [UC-PEC-011], [RN-PEC-153]                                                              |
| C-08     | Emissão e assinatura de laudo, com biometria de encerramento | Médico, Psicólogo         | [UC-PEC-006], [RN-PEC-005], [RN-PEC-142]                                                |
| C-09     | Solicitação e aprovação dupla de adendo                      | Supervisor + profissional | [UC-PEC-007], [RN-PEC-001]                                                              |
| C-10     | Checklist de encerramento do episódio                        | Médico, Psicólogo         | [UC-PEC-008], [RN-PEC-006]                                                              |
| C-11     | Painel de transmissão RENACH (ACK / erro)                    | Admin Clínica, Gestor     | [UC-PEC-009], [RN-PEC-008]                                                              |
| **C-12** | **Registro de resultado e código de restrição**              | Médico                    | [UC-PEC-011] — o vocabulário legal vive aqui, e é onde `CONDICIONADO` não pode aparecer |

## B — Console regulatório (7)

| id       | Tela                                                       | Ator            | UC / WF                                                 |
| -------- | ---------------------------------------------------------- | --------------- | ------------------------------------------------------- |
| R-01     | Fila e montagem de dossiê para a junta                     | Auditor, Gestor | [UC-PEC-004]                                            |
| R-02     | Dossiê do caso + registro de parecer                       | Junta           | [UC-PEC-005], [WF-PEC-002]                              |
| R-03     | Recurso à Junta Especial de Saúde                          | CETRAN          | [UC-PEC-010] — entidade **hoje inexistente no sistema** |
| R-04     | Escada de prazos do caso (30 / 15du / 30 / 30 / 20du)      | Junta, Gestor   | [RN-PEC-112]                                            |
| R-05     | Credenciamento de clínicas e profissionais                 | Gestor DETRAN   | fora dos UC atuais; alimenta o pool de [UC-PEC-013]     |
| R-06     | Relatórios regulatórios e trilha de auditoria              | Auditor, DPO    | somente leitura                                         |
| **R-07** | **Retenção e eliminação de prontuário (lote + aprovação)** | DPO             | [UC-PEC-014], [RN-PEC-141]                              |

## C — Portal do candidato (7)

| id       | Tela                                                                        | UC / regra                                                    |
| -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| P-01     | Meu agendamento — **ver**, não escolher clínica                             | [UC-PEC-013], [RN-PEC-113]                                    |
| P-02     | Meu resultado e meu dossiê (acesso integral, não mascarado)                 | [RN-PEC-153]                                                  |
| P-03     | Entender minha restrição                                                    | [UC-PEC-011] — conteúdo limitado pelo Anexo XV, não capturado |
| P-04     | Solicitar junta médica/psicológica (exercer o prazo de 30 dias)             | [UC-PEC-004], [RN-PEC-112]                                    |
| P-05     | Acompanhar meu recurso                                                      | [UC-PEC-010]                                                  |
| P-06     | Meu calendário de exame toxicológico periódico                              | [UC-PEC-012] — **condicional** à decisão de escopo (DT-024)   |
| **P-07** | **Exercer direitos do titular (acesso, correção, devolução do prontuário)** | [RN-PEC-153], [UC-PEC-014]                                    |

## D — Requisitos transversais

1. **O vocabulário exibido é o legal.** apto · apto com restrições · inapto temporário · inapto.
   `CONDICIONADO` e `PENDENTE` são internos e **nunca** aparecem ao candidato ([RN-PEC-105]).
   As trilhas médica e psicológica têm taxonomias distintas e a UI não as mistura.
2. **O candidato vê o próprio dossiê sem máscara.** Mascaramento existe para Suporte, não para o
   titular ([RN-PEC-153]) — inverter isso é o erro mais fácil de cometer aqui.
3. **Nenhuma tela oferece escolha de clínica ou perito.** Sob P2, o candidato escolhe região e
   data; a UI não deve sugerir visualmente que a clínica é uma escolha ([RN-PEC-113], §e do
   intake).
4. **Assinatura mostra o nível aplicado.** Avançada ou qualificada, e por quê ([RN-PEC-142]).
5. **Todo dado do núcleo é sensível.** O tratamento de tela segue [RN-PEC-150]/[RN-PEC-151], não
   apenas os campos de laudo.
6. **Prazo é direito, não jargão.** Nas telas do candidato, o prazo aparece como "até quando você
   pode agir", nunca como nome de estado interno.

## E — Telas bloqueadas por decisão pendente

| Tela               | Depende de                                                                 |
| ------------------ | -------------------------------------------------------------------------- |
| P-06               | DT-024 — o PEC participa do ciclo toxicológico periódico?                  |
| P-01 (forma final) | DT-021 — regime de distribuição P1/P2/P3                                   |
| R-03               | DT-025 — a Junta Especial de Saúde é órgão distinto no modelo?             |
| R-07, P-07         | DT-023 — quem é o responsável pela guarda do prontuário                    |
| C-12 (rótulos)     | DT-022 — mapeamento do vocabulário de resultado confirmado com o DETRAN-AM |

Cinco das 26 telas dependem de decisão do Owner. Nenhuma delas está no caminho crítico do
atendimento clínico — C-01 a C-11 formam um fluxo completo e implementável sem essas respostas.
