# ADR-0027 — Signatários da ata de sessão RAIT

- Status: Accepted
- Date: 2026-09-19
- Owner decision: presidente e relatores dos itens

## Context

`UC-RAIT-020` e `WF-RAIT-003` exigem presidente e relatores, com exceção para
relator ausente, enquanto uma mensagem do catálogo mencionava presidente e
secretaria. A divergência bloqueava sensores positivos de assinatura e
publicação da ata em CTG-0002.

## Decision

A ata da sessão exige assinatura do presidente e de todos os relatores dos
itens. Relator formalmente ausente não retém a ata quando ausência e dispensa
estão registradas no snapshot server-owned. Secretaria prepara e publica, mas
não integra o conjunto obrigatório apenas em razão desse papel.

O serviço deriva o conjunto sob tenant, sessão, banca e presença vigentes; o
cliente não fornece signatários. `ATA_ASSINADA` somente ocorre quando recibos
PAdES-B-LT/TSA/OCSP-CRL válidos cobrem o conjunto requerido.

## Consequences

O schema suporta múltiplos signatários e recibos imutáveis. Sensores cobrem
presidente, cada relator, ausência formal, signatário estranho, replay e
alteração do snapshot. A decisão não valida criptografia por fake nem dispensa
o gate do serviço documental configurado.
