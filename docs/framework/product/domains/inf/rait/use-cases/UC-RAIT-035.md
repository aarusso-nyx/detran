---
id: UC-RAIT-035
title: Sistema concilia pagamentos com o estado do processo
status: draft
apps: [rait, portal]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-09-12
---

## Ator e objetivo

Ao receber `PAGAMENTO_CONFIRMADO` da rede arrecadadora, o sistema atualiza o atributo de pagamento da infração sem encerrar o processo — salvo pagamento com reconhecimento — e ajusta filas, comunicações e restrições.

## Pré-condições

- Infração em qualquer estado a partir de `NOTIFICADO_AUTUACAO`; retorno bancário conciliável por documento de arrecadação.

## Fluxo principal

1. Retorno bancário casa com o documento emitido (nosso número, valor, data); infração recebe `pago=true` e a faixa paga.
2. Se o pagamento é de 80% ou integral, o processo continua: defesa e recurso permanecem possíveis (CTB art. 284 §2º); Portal exibe "pago — você ainda pode recorrer".
3. Se o pagamento é com reconhecimento e requerimento de encerramento (art. 290 III), a instância é encerrada (`INSTANCIA_ENCERRADA`, motivo reconhecimento) e o caso RAIT aberto, se houver, é encerrado como desistência ([UC-RAIT-012]).
4. Pagamento após o encerramento: sub-estado `QUITADA`; restrições liberadas; cobrança cancelada ([UC-RAIT-034]).

## Fluxos alternativos / exceções

- **1a.** Pagamento a menor ou a maior: pendência financeira; diferença cobrada ou restituída; o estado do processo não muda.
- **1b.** Pagamento em duplicidade: restituição do excedente ([UC-RAIT-033]).
- **3a.** Reconhecimento sem os requisitos legais (adesão ao SNE após o envio da NA): tratado como pagamento comum de 80%, sem encerramento.

## Pós-condições

Pagamento conciliado e refletido; processo encerrado apenas nas hipóteses legais.

## Critérios de aceitação

**AC-RAIT-035-1 — pagar não renuncia**

- **Dado** uma multa paga a 80%
- **Quando** o cidadão interpõe recurso
- **Então** o recurso é aceito e, se provido, a restituição dispara

**AC-RAIT-035-2 — reconhecimento encerra**

- **Dado** um pagamento de 60% com termo de renúncia válido
- **Quando** é conciliado
- **Então** a instância encerra e nenhum recurso é oferecido

**AC-RAIT-035-3 — conciliação é rastreável**

- **Dado** um retorno bancário
- **Quando** é casado
- **Então** o caso mostra documento, valor, data e faixa

## Regras aplicáveis

- [RN-RAIT-127] (faixas e reconhecimento)
- [RN-RAIT-119] (encerramento por pagamento com reconhecimento)
- [RN-PORTAL-128] (renúncia informada)
