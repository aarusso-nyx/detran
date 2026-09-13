---
id: UC-RAIT-034
title: Órgão encaminha a multa definitiva não paga à cobrança e à dívida ativa (handoff Fazenda)
status: draft
apps: [rait, dashboard]
sources: [REF-CTB-280-290, REF-CONTRAN-918, REF-LEI-9873-1999]
updated: 2026-09-12
---

## Ator e objetivo

Após o encerramento da instância, o sistema identifica multas não pagas, aplica os encargos, tenta a cobrança administrativa (canais do Portal, parcelamento por cartão quando autorizado) e, esgotada a fase administrativa, transfere o crédito à área de dívida ativa — fronteira do RAIT ([APP-RAIT] §Escopo: cobrança fora).

## Pré-condições

- Infração em `INSTANCIA_ENCERRADA` com sub-estado `PENDENTE_PAGAMENTO`.

## Fluxo principal

1. Sistema aplica juros e restrições admitidas (licenciamento/transferência — CTB art. 284 §3º a contrario) e mantém o documento de arrecadação atualizado ([UC-RAIT-032]).
2. Cobrança administrativa: lembretes pelo canal de ciência; oferta de pagamento parcelado por cartão quando o órgão estiver autorizado (918 art. 27; [RN-PORTAL-126]).
3. Decorrido o prazo de cobrança administrativa (parâmetro do órgão, **fonte pendente**), o crédito é transferido à dívida ativa com o dossiê fiscal (AIT, NP, decisão, marcos) — sub-estado `EM_COBRANCA`; o RAIT deixa de ser dono do caso.
4. A prescrição da execução (5 anos do encerramento — Lei 9.873 art. 1º-A, validade para órgão estadual a confirmar) é exposta ao dashboard como relógio informativo.

## Fluxos alternativos / exceções

- **2a.** Pagamento durante a cobrança: sub-estado `QUITADA`; restrições liberadas; nada vai à dívida ativa.
- **3a.** Veículo licenciado em outra UF ou multa de outro órgão: fora do parcelamento (918 art. 27 §12); cobrança pelos meios ordinários.

## Pós-condições

Crédito cobrado ou transferido com dossiê completo; estado da infração refletido no Portal.

## Critérios de aceitação

**AC-RAIT-034-1 — nenhuma restrição antes do encerramento**

- **Dado** uma multa com recurso pendente
- **Quando** o licenciamento é consultado
- **Então** não há bloqueio por essa multa ([RN-RAIT-108]; DT-027)

**AC-RAIT-034-2 — o dossiê acompanha o crédito**

- **Dado** um crédito transferido
- **Quando** a dívida ativa consulta
- **Então** recebe AIT, NP, decisão e marcos sem pedir ao RAIT

## Regras aplicáveis

- [RN-RAIT-108] (efeito suspensivo e restrições)
- [RN-RAIT-128] (juros)
- [RN-PORTAL-126] (parcelamento por cartão)
- [RN-RAIT-113] (Lei 9.873)
