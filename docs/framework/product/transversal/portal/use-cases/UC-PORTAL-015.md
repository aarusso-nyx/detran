---
id: UC-PORTAL-015
title: Cidadão paga uma multa (à vista com desconto, ou parcelado)
status: reviewed
apps: [portal]
sources: [REF-CONTRAN-918, REF-CONTRAN-931, REF-DECRETO-10543-2020]
updated: 2026-08-26
---

## Ator e objetivo

Cidadão paga uma multa de trânsito, vendo sempre lado a lado os dois regimes de desconto
disponíveis (80% padrão / 60% via SNE — [REF-CONTRAN-918] arts.20-21, [REF-CONTRAN-931] art.9º §1º)
e, quando aplicável, a opção de parcelamento por cartão.

## Pré-condições

- Cidadão identificado, nível simples para solicitar a guia (Decreto 10.543/2020 art.4º I) — o
  nível de segurança da transação em si é regido pelos padrões do meio de pagamento (SPB/cartão),
  fora deste Decreto.
- Multa com NP emitida e dentro do prazo de vencimento (ou, fora do prazo, sujeita a juros — ver
  fluxo alternativo).

## Fluxo principal

1. Cidadão acessa a autuação e escolhe "Pagar".
2. Sistema mostra, sempre lado a lado e nunca um escondido atrás de clique extra: valor com 80% de
   desconto (pagamento até o vencimento, sem SNE) e valor com 60% de desconto (se aderido ao SNE e
   reconhecendo a infração sem defesa/recurso — art.21) — mesmo princípio já fixado em
   `_intake/ux-notes.md` §c.
3. Cidadão escolhe a forma de pagamento: à vista (PIX/débito/boleto — art.24 §3º comporta
   tecnicamente, mesmo sem nomear PIX expressamente) ou parcelado no cartão de crédito — o art.27 da
   Res. 918 trata de **operação de cartão por conta e risco da instituição financeira**, e
   **não fixa número de parcelas**: o limite é comercial do emissor, nunca normativo
   ([RN-PORTAL-126]). A afirmação de "até 12x" do dossiê original é falsa (DT-120).
4. Sistema confirma o pagamento e atualiza o status da autuação; se o pagamento libera pré-condição
   de outro serviço (ex. CRLV-e em [UC-PORTAL-012]), reconsulta automaticamente.

## Fluxos alternativos / exceções

- **2a.** Cidadão optar por reconhecer a infração e pagar 60% sem ter aderido ao SNE ainda: sistema
  oferece a adesão no mesmo fluxo ([UC-PORTAL-007]) em vez de simplesmente negar o desconto —
  nunca forçar navegação de ida e volta entre duas telas para um mesmo objetivo.
- **3a.** Prazo de vencimento já expirado: sistema recalcula automaticamente o valor com juros (1%
  no mês seguinte; SELIC + 1% depois — 918 arts.22-23), mostrando o cálculo já pronto, nunca "aplique
  a fórmula do art.23".
- **3b.** Parcelamento escolhido: sistema explicita que a liberação do veículo e a emissão do CRLV-e
  ocorrem imediatamente, mesmo com saldo devedor futuro (918 art.27, §§1º-13).

## Pós-condições

Multa quitada (à vista) ou parcelada com primeira parcela processada; restrição de licenciamento
removida quando aplicável; recibo/comprovante emitido.

## Critérios de aceitação

**AC-PORTAL-015-1 — as faixas aparecem lado a lado, sempre**

- **Dado** uma multa passível de desconto
- **Quando** o pagamento é aberto
- **Então** as faixas aplicáveis são exibidas simultaneamente, nenhuma escondida atrás de clique
  ([RN-PORTAL-128])

**AC-PORTAL-015-2 — só a faixa de 40% encerra defesa e recurso**

- **Dado** as faixas disponíveis
- **Quando** o cidadão escolhe
- **Então** o sistema deixa explícito que **apenas** a de 40% implica renúncia ao questionamento
  ([RN-PORTAL-128], [RN-RAIT-127]) — pagar nas demais **não** prejudica o processo

**AC-PORTAL-015-3 — parcelamento não tem limite normativo de parcelas**

- **Dado** o pagamento parcelado
- **Quando** é oferecido
- **Então** o sistema não afirma um teto normativo de parcelas: o art.27 é operação de cartão por
  conta e risco da instituição, e o limite é comercial do emissor ([RN-PORTAL-126]) — "até 12x"
  como regra do órgão é falso (DT-120)

**AC-PORTAL-015-4 — o PORTAL não é o arrecadador**

- **Dado** o fluxo de pagamento
- **Quando** é executado
- **Então** usa o documento padronizado da União e a rede bancária ([RN-PORTAL-125]) — o PORTAL
  não retém valores nem cria meio de arrecadação próprio

**AC-PORTAL-015-5 — pagar antes não prejudica o recurso em curso**

- **Dado** um processo em tramitação
- **Quando** o cidadão paga
- **Então** o processo segue e a tela o afirma; havendo provimento, há restituição atualizada
  ([RN-PORTAL-127], [RN-RAIT-129])

**AC-PORTAL-015-6 — guia e boleto em formato acessível mediante solicitação**

- **Dado** um cidadão que solicita formato acessível
- **Quando** o documento de cobrança é emitido
- **Então** é fornecido em formato acessível ([RN-PORTAL-114])

**AC-PORTAL-015-7 — quitar destrava o que dependia dela**

- **Dado** um pagamento que era pré-condição de outro serviço
- **Quando** é confirmado
- **Então** o serviço dependente é reconsultado automaticamente ([UC-PORTAL-012])

## Regras aplicáveis

- [REF-CONTRAN-918] arts.20-23 (descontos e juros)
- [REF-CONTRAN-918] art.27 (parcelamento por cartão)
- [REF-CONTRAN-931] art.9º §4º (SNE não permite parcelamento — parcelamento é sempre fora do SNE)
