---
id: UC-RAIT-009
title: Recorrente interpõe recurso ao CETRAN-AM (remessa de 2ª instância)
status: approved
apps: [rait, portal]
sources: [REF-CTB-extracts-raw, REF-DETRANAM-SERVICOS]
updated: 2026-08-26
---

## Ator e objetivo

Requerente cujo recurso foi negado ou não conhecido pela JARI interpõe recurso ao CETRAN-AM,
abrindo um novo caso RAIT de 2ª instância dentro do prazo legal.

## Pré-condições

Caso `instancia=jari` `COMUNICADO` com resultado `negado` ou `não conhecido`.

## Fluxo principal

1. Requerente interpõe recurso ao CETRAN-AM (PORTAL, Protocolo Virtual, ou Protocolo
   Administrativo presencial — [REF-DETRANAM-SERVICOS]) dentro de 30 dias da
   publicação/notificação da decisão da JARI (CTB art.288).
2. Sistema abre novo caso RAIT `instancia=cetran`, `caso_origem_id` = caso JARI, `ait_id`
   herdado — reentra em `PROTOCOLADO` do novo caso, seguindo triagem completa
   ([UC-RAIT-001]/[UC-RAIT-002]).
3. Sistema anexa de ofício o parecer e a conclusão da JARI ao dossiê do novo caso —
   requerente não precisa reapresentar o que o órgão já possui ([RN-RAIT-003]).
4. Novo caso segue o ciclo completo de [WF-RAIT-001] (triagem → distribuição/sorteio →
   instrução → pauta → sessão do CETRAN-AM).

## Fluxos alternativos / exceções

- **1a.** Recurso intempestivo (fora dos 30 dias): triagem de admissibilidade do novo caso
  resulta em `NAO_CONHECIDO` ([UC-RAIT-002], [RN-RAIT-001]).
- **1b.** Requerente apresenta o recurso ao órgão do seu domicílio, diferente do órgão
  autuador: recebido e remetido de pronto ao órgão competente (CTB art.287 § único).
- **4a.** Decisão do CETRAN-AM é sempre irrecorrível administrativamente (CTB art.290) — o
  novo caso só poderá terminar em `TRANSITADO`.

## Pós-condições

Novo caso RAIT `instancia=cetran` criado e em tramitação; decisão da JARI ainda não definitiva
enquanto o CETRAN não julgar.

## Critérios de aceitação

**AC-RAIT-009-1 — o recurso ao CETRAN nasce como caso novo, vinculado**

- **Dado** um caso `instancia=jari` `COMUNICADO` com resultado `negado` ou `não conhecido`
- **Quando** o requerente interpõe recurso ao CETRAN dentro de 30 dias ([RN-RAIT-103])
- **Então** o sistema cria um caso `instancia=cetran` com `caso_origem_id` e `ait_id` herdados, em `PROTOCOLADO`, sujeito à triagem completa

**AC-RAIT-009-2 — peças da JARI vêm de ofício**

- **Dado** a criação do caso de 2ª instância
- **Quando** o dossiê é montado
- **Então** o parecer e a conclusão da JARI são anexados pelo sistema ([RN-RAIT-003], [RN-RAIT-117]) e o formulário não pede esses documentos ao requerente

**AC-RAIT-009-3 — intempestivo é triado, não recusado no protocolo**

- **Dado** um recurso apresentado após os 30 dias
- **Quando** é protocolado
- **Então** o caso é criado normalmente e o não-conhecimento é decidido na triagem ([UC-RAIT-002], AC-RAIT-002-5) — o protocolo não julga tempestividade

**AC-RAIT-009-4 — protocolo em órgão de domicílio diverso é remetido**

- **Dado** um requerente que protocola no órgão do seu domicílio, diverso do órgão autuador
- **Quando** o caso é registrado
- **Então** é recebido e remetido de pronto ao órgão competente (CTB art.287 § único), preservada a data de protocolo original

**AC-RAIT-009-5 — o caso CETRAN não oferece nova instância**

- **Dado** um caso `instancia=cetran`
- **Quando** ele chega a `COMUNICADO`
- **Então** o único destino é `TRANSITADO` ([RN-RAIT-119], CTB art.290)

## Regras aplicáveis

- [RN-RAIT-103] (prazo de 30 dias para recurso ao CETRAN); [RN-RAIT-104] (termo inicial
  conforme o canal de ciência)
- [RN-RAIT-001], [RN-RAIT-002], [RN-RAIT-003] (aplicáveis à nova triagem)
