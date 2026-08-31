---
id: IU-RAIT-001
title: Inventário de telas do console interno RAIT
status: approved
apps: [rait]
sources:
  [
    REF-CONTRAN-357,
    REF-CETRAN-PROCESSO-INTERNO,
    REF-CTB-extracts-raw,
    REF-LEI-9873-1999,
  ]
updated: 2026-08-28
---

Inventário das telas do console interno do RAIT (analista, relator, secretaria, presidente,
autoridade, gestor). Promovido de `_intake/ux-notes.md` §a na rodada de endurecimento de
especificação de 2026-08-26, com os nomes de estado reconciliados ao vocabulário canônico de
[WF-RAIT-001] §Vocabulário canônico — a versão de intake usava nomes anteriores à consolidação
da máquina de estados (`RECEBIDO`, `EM_ANALISE`, `PRONTO_PARA_JULGAMENTO`, `DECISAO_AUTORIDADE`,
`SESSAO_JARI`, `DECIDIDO`), que não existem e não devem ser implementados.

O lado cidadão vive em `transversal/portal`; o mapa de tradução do vocabulário técnico daqui
para a linguagem do cidadão é responsabilidade do PORTAL, não do RAIT.

## Inventário

| id   | Tela                                            | Ator primário                           | Estado(s) [WF-RAIT-001]                                           | Jornada                        | Casos de uso                 |
| ---- | ----------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------- | ------------------------------ | ---------------------------- |
| T-01 | Painel do turno                                 | Analista, relator                       | agregado (vencendo, diligência expirando, parado)                 | [JRN-RAIT-001]                 | [UC-RAIT-003]                |
| T-02 | Fila de trabalho (defesa / recurso)             | Analista, relator                       | `ADMITIDO`, `DISTRIBUIDO`                                         | [JRN-RAIT-001], [JRN-RAIT-003] | [UC-RAIT-003], [UC-RAIT-004] |
| T-03 | Triagem de admissibilidade                      | Analista, secretaria                    | `TRIAGEM_ADMISSIBILIDADE` → `ADMITIDO`\|`NAO_CONHECIDO`           | [JRN-RAIT-001]                 | [UC-RAIT-002]                |
| T-04 | Dossiê do caso / instrução                      | Analista, relator                       | `EM_INSTRUCAO`                                                    | [JRN-RAIT-001]                 | [UC-RAIT-003]                |
| T-05 | Abertura de diligência                          | Analista, relator                       | `EM_INSTRUCAO` → `DILIGENCIA`                                     | [JRN-RAIT-001]                 | [UC-RAIT-003]                |
| T-06 | Bandeja "prontos para retomar"                  | Analista, relator                       | `DILIGENCIA` → `EM_INSTRUCAO`\|`PRONTO_P_DECISAO`                 | [JRN-RAIT-001]                 | [UC-RAIT-003]                |
| T-07 | Editor de minuta e decisão (1º circuito)        | Analista (minuta), autoridade (decisão) | `PRONTO_P_DECISAO` → `DECIDIDO_AUTORIDADE`                        | [JRN-RAIT-001]                 | [UC-RAIT-003]                |
| T-08 | Cadastro e digitalização de intake físico       | Secretaria                              | `[*]` → `PROTOCOLADO`                                             | [JRN-RAIT-003]                 | [UC-RAIT-001]                |
| T-09 | Distribuição a relator (lote, round-robin)      | Presidente, coordenador                 | `ADMITIDO`\|`AGUARDANDO_REMESSA_JARI` → `DISTRIBUIDO`             | [JRN-RAIT-002]                 | [UC-RAIT-004], [UC-RAIT-011] |
| T-10 | Leitura de dossiê e redação de voto             | Relator                                 | `EM_INSTRUCAO` → `PRONTO_P_DECISAO`                               | [JRN-RAIT-002]                 | [UC-RAIT-004]                |
| T-11 | Montagem de pauta                               | Presidente                              | `PRONTO_P_DECISAO` → `PAUTADO`                                    | [JRN-RAIT-002]                 | [UC-RAIT-005]                |
| T-12 | Sessão de julgamento (quorum, registro ao vivo) | Presidente, secretaria, colegiado       | `PAUTADO` → `JULGADO_SESSAO` ([WF-RAIT-003])                      | [JRN-RAIT-002]                 | [UC-RAIT-006]                |
| T-13 | Ata da sessão (gerada, assinada)                | Secretaria, presidente                  | `DECISAO_PROCLAMADA` → `ATA_ASSINADA` ([WF-RAIT-003])             | [JRN-RAIT-002]                 | [UC-RAIT-006]                |
| T-14 | Radar de prescrição (cross-caso)                | Gestor RAIT                             | transversal — relógios A, B, C                                    | [JRN-RAIT-004]                 | [UC-RAIT-010]                |
| T-15 | Drill-down de caso em risco                     | Gestor RAIT                             | qualquer estado ativo                                             | [JRN-RAIT-004]                 | [UC-RAIT-010], [UC-RAIT-011] |
| T-16 | Fila da autoridade — provimentos a avaliar      | Autoridade de trânsito                  | `JULGADO_SESSAO`(provido) → `REMETIDO_2A_INSTANCIA`\|`TRANSITADO` | —                              | [UC-RAIT-008]                |
| T-17 | Registro de desistência                         | Secretaria                              | qualquer estado pré-decisão → `ENCERRADO_DESISTENCIA`             | —                              | [UC-RAIT-012]                |

17 telas núcleo. T-16 e T-17 são acréscimos desta rodada: o inventário de intake não cobria o
circuito da autoridade ([UC-RAIT-008]) nem o registro de desistência pelo balcão
([UC-RAIT-012]), embora ambos os casos de uso existissem.

## Requisitos transversais de tela

Valem para todas as telas acima e são verificáveis em revisão de UI:

1. **Prazo nunca aparece sozinho.** Todo prazo exibido carrega a base legal ao lado — "24 meses
   (CTB art.285 §6º / art.289-A) — risco de prescrição por inércia do órgão", nunca "24 meses"
   solto ([RN-RAIT-112], [RN-RAIT-113]).
2. **Meta operacional e teto legal são visualmente distintos.** O SLA interno (30 dias ao
   cidadão; 20 dias de voto do relator) jamais é apresentado com a mesma ênfase ou no mesmo
   componente que os relógios de extinção — confundi-los é o anti-padrão nº3 do intake.
3. **Quem instrui não é quem assina.** Em T-07 e T-13, minuta e decisão/ata assinada ocupam
   áreas visualmente separadas, com autoria explícita ([UC-RAIT-004] AC-RAIT-004-1).
4. **Risco não depende de cor.** Em T-01, T-02, T-14 e T-15, urgência é comunicada também por
   ordenação e rótulo textual de dias restantes (AC-RAIT-010-5).
5. **Eficiência de teclado.** Claim do próximo caso, navegação da triagem e registro de voto
   são operáveis sem mouse; contraste AA e foco visível mantidos.
6. **Caso digitalizado tem a mesma forma de um caso nativo.** T-08 produz dossiê estruturado;
   um PDF anexado sem campos extraídos não satisfaz a tela (AC-RAIT-001-5).
7. **Vocabulário interno não vaza para o cidadão, e vice-versa.** Nenhum texto destas telas é
   reaproveitado no PORTAL.

## Pendências de desenho

- ~~T-12 — sustentação oral~~ — **RESOLVIDO (2026-08-28, `_meta/open-issues.md` DT-011):**
  omitida por padrão, não configurável. A tela T-12 não expõe a etapa como parte do fluxo normal
  de sessão; o passo `SUSTENTACAO_ORAL` de [WF-RAIT-003] só é alcançável se um regimento local
  futuro vier a admiti-la — não precisa de toggle de configuração no MVP.
- **T-14 — limiares por relógio** já estão fixados ([WF-RAIT-002] §4), mas a nota de capacidade
  do steering (volume >500/mês com uma única JARI) pode alterar a densidade de casos em alerta
  simultâneo — o desenho não deve pressupor poucas linhas em `CRITICO`.
