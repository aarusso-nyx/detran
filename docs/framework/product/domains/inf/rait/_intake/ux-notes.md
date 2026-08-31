---
id: UX-NOTES-RAIT
title: Notas de UX — RAIT (console interno)
status: draft
apps: [rait, portal]
sources:
  [
    REF-CONTRAN-357,
    REF-CETRAN-PROCESSO-INTERNO,
    REF-CTB-extracts-raw,
    REF-LEI-9873-1999,
    REF-CONTRAN-900,
    REF-CONTRAN-918,
  ]
updated: 2026-08-24
---

Notas de trabalho do especialista UX para o console interno do RAIT (analista, relator/JARI,
secretaria, gestor). Complementa [JRN-RAIT-001] a [JRN-RAIT-004]. Ver
`transversal/portal/_intake/ux-notes.md` para o lado citizen-facing e o guia de linguagem que traduz
os estados abaixo para o cidadão.

## (a) Inventário de telas — mapeado a jornadas e a [WF-RAIT-001]

> **PROMOVIDO (2026-08-26).** Este inventário virou artefato próprio em
> [IU-RAIT-001](../screens/IU-RAIT-001.md), com os nomes de estado reconciliados ao vocabulário
> canônico de [WF-RAIT-001] e duas telas acrescentadas (fila da autoridade, registro de
> desistência). A tabela abaixo fica como registro histórico do intake — **não usar para
> implementação**: os estados que ela cita (`RECEBIDO`, `EM_ANALISE`, `PRONTO_PARA_JULGAMENTO`,
> `DECISAO_AUTORIDADE`, `SESSAO_JARI`, `DECIDIDO`) não existem na máquina de estados.

| Tela                                                     | Jornada                        | Estado(s) [WF-RAIT-001] tocados                                      |
| -------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------- |
| Painel do turno (resumo antes da fila)                   | [JRN-RAIT-001]                 | agregado — vencendo em breve, diligência expirando, parado sem toque |
| Fila (defesa / recurso)                                  | [JRN-RAIT-001], [JRN-RAIT-003] | `RECEBIDO`                                                           |
| Triagem de admissibilidade (checklist estruturado)       | [JRN-RAIT-001]                 | `TRIAGEM(ADMISSIBILIDADE)`                                           |
| Dossiê do caso / instrução                               | [JRN-RAIT-001]                 | `DISTRIBUIDO`, `EM_ANALISE`                                          |
| Abertura de diligência (com prazo)                       | [JRN-RAIT-001]                 | → `DILIGENCIA`                                                       |
| Bandeja "prontos para retomar" (diligência respondida)   | [JRN-RAIT-001]                 | `DILIGENCIA` → `PRONTO_PARA_JULGAMENTO`                              |
| Editor de minuta de decisão (1º circuito)                | [JRN-RAIT-001]                 | → `DECISAO_AUTORIDADE`                                               |
| Cadastro/digitalização de intake físico                  | [JRN-RAIT-003]                 | entrada em `RECEBIDO` por canal balcão/Correios                      |
| Distribuição a relator (lote, sorteio — proposta)        | [JRN-RAIT-002]                 | `PAUTADO`                                                            |
| Leitura de dossiê + redação de voto                      | [JRN-RAIT-002]                 | pré-`PAUTADO`                                                        |
| Montagem de pauta                                        | [JRN-RAIT-002]                 | → `PAUTADO`                                                          |
| Sessão da JARI (verificação de quorum, registro ao vivo) | [JRN-RAIT-002]                 | `SESSAO_JARI`                                                        |
| Ata (gerada, não redigida do zero)                       | [JRN-RAIT-002]                 | `SESSAO_JARI` → `DECIDIDO`                                           |
| Radar de prescrição (cross-caso)                         | [JRN-RAIT-004]                 | transversal — decadência, art.289-A, Lei 9.873/99 §1º                |
| Drill-down de processo em risco (ação de escalonamento)  | [JRN-RAIT-004]                 | qualquer estado ativo                                                |

14 telas núcleo. Distribuição/pauta/sessão como estados formais dependem de [WF-RAIT-002]/
[WF-RAIT-003] (BPO, em elaboração em paralelo) — telas acima referenciam o desenho hoje descrito nas
jornadas como proposta, a confirmar quando esses workflows existirem.

## (b) Blueprint de serviço — detalhe de bastidor (backstage)

Ver a tabela completa (frontstage+backstage+sistemas) em `transversal/portal/_intake/ux-notes.md`
§b. Detalhe adicional só de backstage, por fase:

| Fase                     | Papel/ator                             | Decisão de design                                                                                                                          |
| ------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Intake multi-canal       | Secretaria                             | digitalização é dever do órgão, não do cidadão (modelo SP — [REF-CETRAN-PROCESSO-INTERNO]); mesmo formato de saída independente da entrada |
| Triagem                  | Analista                               | admissibilidade separada de mérito, checklist estruturado ([RN-RAIT-001])                                                                  |
| Instrução                | Analista                               | nunca reexigir documento que o órgão já tem ([RN-RAIT-003]); diligência não bloqueia trabalho em outros casos                              |
| Julgamento 1º circuito   | Autoridade de trânsito                 | assinatura distinta de quem instrui — minuta vs. decisão sempre visualmente separadas                                                      |
| Distribuição 2º circuito | Presidente/sistema (proposta: sorteio) | transparência do critério de distribuição (benchmark ES)                                                                                   |
| Voto                     | Relator (integrante JARI)              | prazo interno curto (proposta: 20 dias) bem abaixo do teto legal (24 meses)                                                                |
| Sessão                   | JARI colegiada                         | quorum verificado antes de abrir (maioria simples + presidente/suplente — [REF-CONTRAN-357] 8.2)                                           |
| Ata/comunicação          | Secretaria/sistema                     | ata gerada dos registros ao vivo; comunicação ao cidadão disparada sem ação extra                                                          |
| Radar de prescrição      | Gestor                                 | cruza 3 relógios simultâneos (decadência, art.289-A, paralisação >3 anos) por processo                                                     |

## (c) Notas de conteúdo (uso interno)

Diferente do PORTAL, o console interno PODE usar vocabulário técnico do processo administrativo
(nomes de estado, jargão jurídico) — a audiência é treinada. Mesmo assim:

- **Nunca reaproveitar o texto da tela do cidadão como texto da tela do analista, nem vice-versa** —
  são dois vocabulários com propósitos diferentes; o mapa de tradução vive em
  `transversal/portal/_intake/ux-notes.md` §c e é responsabilidade do PORTAL, não do RAIT.
- **Prazos sempre com a base legal visível ao lado, não só o número** — ex.: "24 meses (CTB art.285
  §6º / art.289-A) — risco de prescrição por inércia do órgão", nunca apenas "24 meses" solto, para
  que qualquer analista/gestor novo entenda a gravidade sem precisar perguntar.
- **Distinguir SLA interno (proposta, ex.: 20 dias do relator) de teto legal (24 meses)** em toda tela
  que mostrar prazo — o mesmo princípio de "prazo seu vs. prazo do órgão" do PORTAL, adaptado: aqui é
  "meta operacional vs. teto legal intransponível".

## (d) Notas de acessibilidade

- Console interno de uso profissional intensivo: priorizar eficiência de teclado (atalhos para
  claim/próximo caso, navegação sem mouse na triagem) mais do que no PORTAL, mas sem abandonar
  contraste AA e foco visível — parte da equipe pode usar o sistema em turnos longos.
- Radar de prescrição (gestor): informação crítica não pode depender só de cor (vermelho); usar
  também ordenação por urgência e rótulo textual explícito de "dias restantes até o teto legal".
- Ata e minuta: campos de texto longo devem suportar leitura por leitor de tela na revisão pela
  autoridade/JARI, já que é a peça que embasa uma decisão administrativa.

## (e) Anti-padrões a evitar

1. **Fila crua sem priorização por risco de prazo** — obriga o analista/gestor a calcular urgência de
   cabeça; o painel do turno e o radar de prescrição existem exatamente para eliminar esse cálculo
   manual.
2. **Deixar o formulário PDF escaneado do balcão circular como "o processo"** — a digitalização feita
   pela secretaria ([JRN-RAIT-003]) precisa produzir um caso com a mesma forma estruturada de um caso
   digital nativo; não é aceitável um dossiê que seja "só o PDF anexado".
3. **Tratar 24 meses como número normal de operação** — em qualquer relatório, dashboard ou
   comunicação interna, o teto legal de julgamento deve aparecer sempre com o rótulo de risco de
   prescrição, nunca como uma média/SLA a perseguir.
4. **Ambiguidade de quem decidiu** — telas que misturam a instrução do analista com a assinatura da
   autoridade sem separação visual clara criam risco de atribuição incorreta de decisão.
