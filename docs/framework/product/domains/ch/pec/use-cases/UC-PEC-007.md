---
id: UC-PEC-007
title: Retificar laudo via adendo assinado
status: approved
apps: [pec]
sources:
  - pec:docs/framework/pec/signatures.md
  - pec:docs/framework/pec/rbac-matrix.md
  - pec:docs/framework/pec/checklist-conformidade.md
  - pec:docs/framework/pec/catalogo-uc.md
updated: 2026-08-26
---

## Ator e objetivo

Médico, Psicólogo ou Supervisor solicita a correção de um erro material evidente em um laudo
já assinado; Supervisor e Admin Clínica aprovam em dupla; a correção é publicada como um
documento novo (adendo), nunca como edição do original. Origem: SUC-UC-15 ("Retificar
registro via adendo"), UCAP-UC-16 ("Retificar Laudo — Fluxo Controlado").

## Pré-condições

- Laudo original já assinado e persistido em `pec.reports`.
- Erro material evidente identificado.

## Fluxo principal

1. Médico, Psicólogo ou Supervisor solicita a retificação, descrevendo o erro material.
2. Supervisor **e** Admin Clínica aprovam a retificação (dupla aprovação — dois papéis
   distintos).
3. Sistema gera o adendo em PDF/A, referenciando o documento original por ID e hash.
4. Adendo é assinado com PAdES + TSA; OCSP validado (fallback CRL).
5. Adendo é vinculado ao prontuário em `pec.documents (kind='ADENDO')`, mantendo o
   encadeamento de hash em auditoria.
6. Notificação é disparada (ex.: às partes interessadas do processo).

## Fluxos alternativos / exceções

- **Tentativa de editar o original**: não suportada por desenho — o laudo assinado é
  imutável; qualquer correção é necessariamente um novo documento.

## Pós-condições

- Adendo assinado, vinculado ao laudo original, íntegro na cadeia de auditoria.
- Original permanece inalterado (mesmo hash de antes da retificação).

## Critérios de aceitação

**AC-PEC-007-1 — o adendo é peça nova, assinada, apensa**

- **Dado** um laudo assinado com erro
- **Quando** é retificado
- **Então** nasce um adendo assinado, vinculado ao original, que permanece íntegro e recuperável
  ([RN-PEC-001])

**AC-PEC-007-2 — retificação exige dupla validação**

- **Dado** um pedido de retificação
- **Quando** é processado
- **Então** exige solicitação e aprovação por atores distintos (Supervisor no circuito), com
  justificativa registrada

**AC-PEC-007-3 — o adendo herda o regime de assinatura do laudo**

- **Dado** um adendo
- **Quando** é assinado
- **Então** aplica PAdES+TSA e validação de certificado, como o laudo original ([RN-PEC-002])

**AC-PEC-007-4 — o resultado transmitido reflete o adendo**

- **Dado** um adendo que altera o resultado
- **Quando** é assinado
- **Então** um novo evento de transmissão é enfileirado ([UC-PEC-009]) — o RENACH não pode ficar
  com o resultado superado

## Regras aplicáveis

- [RN-PEC-001]
- [RN-PEC-002]
