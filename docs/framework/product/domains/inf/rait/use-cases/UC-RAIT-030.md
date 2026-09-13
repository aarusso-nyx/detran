---
id: UC-RAIT-030
title: Sistema cadastra a penalidade e a pontuação no RENACH após o encerramento da instância e estorna em cancelamento
status: draft
apps: [rait]
sources: [REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-09-12
---

## Ator e objetivo

Ao encerrar a instância administrativa, o sistema envia ao RENACH, pelo senatran-adapter, a penalidade definitiva e a pontuação do sujeito passivo; em cancelamento definitivo posterior, envia o estorno. Antes do encerramento nada é cadastrado.

## Pré-condições

- Infração em `INSTANCIA_ENCERRADA` (evento `PENALIDADE_DEFINITIVA`) ou em `CANCELADO_DEFINITIVO` após cadastro prévio.

## Fluxo principal

1. Evento de encerramento identifica o sujeito passivo final (proprietário, condutor indicado, PJ) e a penalidade (multa com pontuação; advertência sem pontuação — 918 art. 10 §4º).
2. Adapter cadastra no RENACH e registra o recibo; Portal passa a exibir a pontuação ao titular.
3. Reincidência e suspensão por acúmulo consideram só infrações com instância encerrada ([RN-RAIT-131]).
4. Cancelamento definitivo após cadastro (recurso da autoridade negado, restituição): adapter envia estorno e o Portal atualiza.

## Fluxos alternativos / exceções

- **1a.** Sujeito passivo é PJ sem indicação: multa dobrada em AIT autônomo segue seu próprio ciclo; a pontuação não é atribuída à PJ.
- **2a.** Falha de cadastro: retransmissão; o encerramento local não é revertido, mas o indicador de "penalidades definitivas não cadastradas" fica visível ao operador de integração.

## Pós-condições

Penalidade e pontuação registradas no RENACH somente após esgotados os recursos; estornos aplicados.

## Critérios de aceitação

**AC-RAIT-030-1 — nada vai ao RENACH antes do encerramento**

- **Dado** um recurso pendente
- **Quando** qualquer evento ocorre
- **Então** nenhuma chamada de cadastro é feita

**AC-RAIT-030-2 — advertência não pontua**

- **Dado** uma penalidade de advertência encerrada
- **Quando** o cadastro é feito
- **Então** registra a advertência no prontuário sem pontuação

**AC-RAIT-030-3 — estorno é automático**

- **Dado** um cancelamento definitivo após cadastro
- **Quando** o evento é publicado
- **Então** o estorno é enviado sem ação humana

## Regras aplicáveis

- [RN-RAIT-131] (RENACH só após esgotados os recursos)
- [RN-RAIT-119] (encerramento da instância)
- [RN-RAIT-132] (efeitos por desfecho)
