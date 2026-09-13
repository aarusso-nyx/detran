---
id: UC-RAIT-028
title: Secretaria saneia pendência de conteúdo mínimo e junta documentos após o protocolo sem consumir prazo
status: draft
apps: [rait, portal]
sources: [REF-CONTRAN-900, REF-CTB-280-290]
updated: 2026-09-12
---

## Ator e objetivo

Secretaria registra a peça mesmo incompleta, abre pendência tipada ao requerente pelo canal de origem e junta os documentos recebidos, sem que a falta formal vire recusa de protocolo nem consuma o prazo do requerente.

## Pré-condições

- Peça protocolada por balcão/postal/protocolo virtual com item do conteúdo mínimo ausente ([RN-RAIT-002]) que não seja documento do próprio órgão.

## Fluxo principal

1. Sistema gera protocolo imediato e lista os itens ausentes; secretaria abre pendência com prazo interno ao requerente (proposta: 10 dias) e comunica pelo canal de origem.
2. Requerente junta os documentos (Portal, balcão ou postal); secretaria anexa ao caso com data de juntada.
3. Pendência encerrada → caso segue a `TRIAGEM_ADMISSIBILIDADE` ([UC-RAIT-002]).
4. Documentos do próprio órgão ausentes são anexados de ofício, nunca pedidos ([RN-RAIT-003]).

## Fluxos alternativos / exceções

- **2a.** Pendência não atendida: a peça vai à triagem no estado em que se encontra; só as hipóteses fechadas do art. 4º da Res. 900 levam ao não conhecimento — "documento faltante" não está entre elas ([RN-PORTAL-107]).
- **1a.** Peça com mais de um AIT: recusada no protocolo com orientação, sem criar caso ([UC-RAIT-001]).

## Pós-condições

Peça registrada, pendência tratada, juntadas datadas; triagem realizada com o que existe.

## Critérios de aceitação

**AC-RAIT-028-1 — pendência não é recusa**

- **Dado** uma peça sem cópia da CNH
- **Quando** é protocolada
- **Então** recebe número de protocolo no ato e uma pendência, não uma recusa

**AC-RAIT-028-2 — o prazo do requerente não é consumido pela pendência**

- **Dado** uma defesa tempestiva com pendência atendida em 12 dias
- **Quando** a admissibilidade roda
- **Então** a tempestividade considera a data do protocolo original

## Regras aplicáveis

- [RN-RAIT-002] (conteúdo mínimo)
- [RN-RAIT-003] (documentos do órgão de ofício)
- [RN-RAIT-122] (ordem de exame da admissibilidade)
- [RN-PORTAL-107] (exigência de uma só vez)
