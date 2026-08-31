---
id: UC-PORTAL-009
title: Cidadão responde a uma diligência com documento ou prova adicional
status: approved
apps: [portal, rait]
sources: [REF-CONTRAN-900]
updated: 2026-08-26
---

## Ator e objetivo

Requerente cujo processo está em diligência (o órgão pediu documento/prova complementar) anexa o
que foi solicitado dentro do prazo fixado, para que o processo volte a tramitar com a instrução
completa.

## Pré-condições

- Processo em estado `DILIGENCIA` no [WF-RAIT-001], com prazo próprio comunicado ao cidadão
  ([REF-CONTRAN-900] art.9º).

## Fluxo principal

1. Cidadão recebe notificação específica de diligência (distinta de qualquer outra notificação do
   processo), com o que exatamente está sendo pedido e até quando.
2. Cidadão abre o processo em "Meus processos" ([UC-PORTAL-005]) e vê a solicitação destacada com
   contador de prazo visível.
3. Cidadão anexa o(s) documento(s)/prova(s) solicitados.
4. Sistema confirma o recebimento e devolve o processo à fila de julgamento no RAIT
   ([RN-RAIT-004]) — cidadão vê o status voltar de "aguardando você" para "em análise".

## Fluxos alternativos / exceções

- **1a.** Diligência pede documento que o próprio órgão já tem: por desenho, este caso não deveria
  ocorrer ([RN-RAIT-003]) — se ocorrer, é tratado como falha a corrigir no processo interno do RAIT,
  não como comportamento esperado do cidadão.
- **3a.** Cidadão não consegue reunir a prova a tempo: pode solicitar prorrogação (se prevista) ou
  optar por desistir ([UC-PORTAL-006]) antes do vencimento.
- **4a.** Prazo da diligência vence sem resposta: processo é julgado no estado em que se encontra,
  sem arquivamento automático ([RN-RAIT-004]) — cidadão continua podendo acompanhar
  ([UC-PORTAL-005]) mesmo após o vencimento, até a decisão.

## Pós-condições

Diligência atendida (ou vencida) registrada no histórico do processo; processo retorna à fila de
julgamento ([WF-RAIT-001]).

## Critérios de aceitação

**AC-PORTAL-009-1 — a diligência é notificação distinta**

- **Dado** uma diligência aberta
- **Quando** o cidadão é notificado
- **Então** a notificação é específica, diz exatamente o que se pede e até quando — não se mistura
  às notificações gerais do processo

**AC-PORTAL-009-2 — não se pede o que o órgão já tem**

- **Dado** uma diligência
- **Quando** é dirigida ao cidadão
- **Então** não pode ter por objeto documento produzido pelo próprio órgão ([RN-RAIT-003],
  [RN-PORTAL-106]) — nesse caso ela é dirigida ao órgão autuador

**AC-PORTAL-009-3 — exigência posterior é excepcional e justificada**

- **Dado** um requerimento já completo no início
- **Quando** surge nova exigência
- **Então** o sistema a apresenta com justificativa de fato novo ([RN-PORTAL-107])

**AC-PORTAL-009-4 — responder devolve o caso e o status muda na hora**

- **Dado** a resposta anexada dentro do prazo
- **Quando** é submetida
- **Então** o caso volta a "em análise" e o cidadão vê a mudança imediatamente ([RN-RAIT-004])

**AC-PORTAL-009-5 — o prazo expirado não some da tela**

- **Dado** uma diligência não respondida a tempo
- **Quando** o prazo vence
- **Então** o cidadão vê que o processo seguiu para julgamento no estado em que se encontra —
  nunca um desaparecimento silencioso da pendência

## Regras aplicáveis

- [RN-RAIT-003] (vedado exigir documento emitido pelo próprio órgão)
- [RN-RAIT-004] (diligência com prazo; julgamento no estado se não atendida)
- [RN-RAIT-005] (contagem de prazos)
