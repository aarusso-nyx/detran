---
id: UC-PORTAL-006
title: Cidadão desiste de defesa ou recurso até o julgamento
status: approved
apps: [portal, rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918]
updated: 2026-08-26
---

## Ator e objetivo

Requerente com defesa ou recurso em tramitação decide desistir — tipicamente para pagar a multa com
desconto (ex.: aderir ao SNE e reconhecer a infração — [UC-PORTAL-007]) antes de uma decisão que
poderia ser desfavorável, ou porque as circunstâncias mudaram.

## Pré-condições

- Processo em tramitação, ainda não julgado (a qualquer fase — 1º ou 2º circuito).

## Fluxo principal

1. Cidadão abre o processo em "Meus processos" ([UC-PORTAL-005]) e escolhe "Desistir".
2. Sistema explica em linguagem direta a consequência: a desistência é definitiva para este
   requerimento e a penalidade (ou o AIT, conforme a fase) segue seu curso normal sem o benefício do
   pedido retirado.
3. Cidadão confirma por escrito (ação equivalente a assinatura eletrônica — requisito de forma
   escrita do [REF-CONTRAN-900] art.11).
4. Sistema registra a desistência com data/hora, encerra o requerimento no [WF-RAIT-001]
   (`ENCERRADO_DESISTENCIA`), e atualiza o status visível ao cidadão.
5. Se a desistência foi motivada por pagamento com desconto, sistema direciona para a tela de
   pagamento correspondente, com o valor e prazo aplicáveis já calculados.

## Fluxos alternativos / exceções

- **1a.** Processo já pautado para sessão de julgamento na data corrente: sistema verifica se ainda
  há tempo hábil antes do início da sessão; se não houver, informa que a desistência pode não ser
  processada a tempo e orienta contato direto com a secretaria.
- **3a.** Cidadão cancela a confirmação: nenhuma alteração é feita; processo segue normalmente.

## Pós-condições

Processo encerrado por desistência ([WF-RAIT-001]); nenhuma decisão de mérito é registrada para
este requerimento; caminhos de pagamento (se aplicável) disponíveis imediatamente.

## Critérios de aceitação

**AC-PORTAL-006-1 — a consequência é dita antes da confirmação**

- **Dado** um pedido de desistência
- **Quando** o cidadão o inicia
- **Então** a tela explica que é definitiva para aquele requerimento e que a penalidade segue seu
  curso ([RN-RAIT-123])

**AC-PORTAL-006-2 — desistir exige forma escrita**

- **Dado** a confirmação
- **Quando** é registrada
- **Então** equivale a assinatura eletrônica, com o termo anexado ao dossiê (CONTRAN-900 art.11)

**AC-PORTAL-006-3 — só até o julgamento**

- **Dado** um caso já julgado
- **Quando** o cidadão tenta desistir
- **Então** a ação não está disponível, com explicação do porquê e do caminho restante

**AC-PORTAL-006-4 — desistir para pagar leva ao valor certo**

- **Dado** uma desistência motivada por desconto
- **Quando** é concluída
- **Então** o cidadão vai para o pagamento com valor e prazo já calculados — e vê qual faixa se
  aplica ([RN-PORTAL-128])

## Regras aplicáveis

- [RN-RAIT-123] (desistência por escrito até o julgamento)
