---
id: UC-RAIT-012
title: Processar desistência do requerente
status: approved
apps: [rait, portal]
sources: [REF-CONTRAN-900]
updated: 2026-08-26
---

## Ator e objetivo

Requerente (ou procurador habilitado) desiste do pleito por escrito a qualquer momento antes
do julgamento, encerrando o caso sem decisão de mérito — tipicamente para viabilizar
pagamento com desconto (ex.: adesão ao SNE — CONTRAN-931 art.9º).

## Pré-condições

Caso em qualquer estado pré-decisão: `PROTOCOLADO`, `TRIAGEM_ADMISSIBILIDADE`, `DISTRIBUIDO`,
`EM_INSTRUCAO`, `DILIGENCIA`, `PRONTO_P_DECISAO`, ou `PAUTADO` ([WF-RAIT-001]).

## Fluxo principal

1. Requerente registra desistência por escrito — via PORTAL (ação dedicada) ou petição no
   canal de origem (CONTRAN-900 art.11).
2. Sistema verifica que o caso ainda não foi julgado (`DECIDIDO_AUTORIDADE`/`JULGADO_SESSAO`
   não alcançados) — desistência só é admissível até o julgamento.
3. Caso passa a `ENCERRADO_DESISTENCIA`, independentemente do estado em que estava.
4. Sistema encerra quaisquer diligências abertas e remove o caso de pautas futuras, se
   pautado.
5. Requerente é comunicado do encerramento; efeitos sobre pagamento/desconto são tratados no
   PORTAL (fora do escopo deste UC).

## Fluxos alternativos / exceções

- **2a.** Caso já julgado (`DECIDIDO_AUTORIDADE`/`JULGADO_SESSAO` alcançado): pedido de
  desistência é rejeitado — decisão já produzida efeitos; requerente é orientado sobre o
  caminho recursal remanescente, se houver.
- **4a.** Caso estava `PAUTADO` para sessão iminente: remoção da pauta deve ocorrer antes da
  abertura da sessão — se a comunicação de desistência chegar durante a sessão, presidente
  decide se ainda é tempestiva (registrar em ata).

## Pós-condições

Caso em `ENCERRADO_DESISTENCIA`, estado terminal; sem decisão de mérito registrada.

## Critérios de aceitação

**AC-RAIT-012-1 — desistência é admissível até o julgamento, e só até ele**

- **Dado** um caso em qualquer estado pré-decisão (`PROTOCOLADO`…`PAUTADO`)
- **Quando** a desistência por escrito é registrada
- **Então** o caso passa a `ENCERRADO_DESISTENCIA` ([RN-RAIT-123], CONTRAN-900 art.11)
- **E dado** um caso já em `DECIDIDO_AUTORIDADE` ou `JULGADO_SESSAO`
- **Quando** a desistência é tentada
- **Então** é recusada, com orientação sobre o caminho recursal remanescente

**AC-RAIT-012-2 — a desistência exige forma escrita e legitimidade**

- **Dado** um pedido de desistência
- **Quando** submetido
- **Então** o sistema exige termo escrito do requerente ou de procurador habilitado ([RN-RAIT-121]) e o anexa ao dossiê como peça

**AC-RAIT-012-3 — encerrar limpa diligências e pautas**

- **Dado** um caso com diligência aberta e presença em pauta futura
- **Quando** a desistência é processada
- **Então** as diligências são encerradas e o caso é removido da pauta no mesmo ato

**AC-RAIT-012-4 — desistência durante a sessão é decisão do presidente**

- **Dado** uma comunicação de desistência que chega com a sessão já aberta
- **Quando** o caso é chamado
- **Então** o presidente decide sobre a tempestividade do pedido e a decisão é registrada em ata ([WF-RAIT-003])

**AC-RAIT-012-5 — sem decisão de mérito**

- **Dado** um caso encerrado por desistência
- **Quando** o dossiê é consultado
- **Então** não há resultado de mérito registrado, e o caso não alimenta a taxa de provimento por enquadramento

## Regras aplicáveis

- [RN-RAIT-123] (desistência por escrito, admissível até a realização do julgamento)
- [RN-RAIT-121] (legitimidade de quem assina a desistência, quando por procurador)
