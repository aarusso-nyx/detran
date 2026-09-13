---
id: UC-RAIT-016
title: Autoridade signatária decide a defesa prévia (acolhe, indefere ou devolve a minuta)
status: draft
apps: [rait]
sources: [REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-09-12
---

## Ator e objetivo

Autoridade de trânsito investida, escalada para a circunscrição do AIT, aprecia a minuta do revisor e decide a defesa da autuação, inclusive quanto ao mérito ([RN-RAIT-115]); é o único ator que assina a decisão do 1º circuito.

## Pré-condições

- Caso em `PRONTO_P_DECISAO` com minuta do revisor (fila F-DP-5 de [WF-RAIT-004] §2.1).
- Autoridade `EM_PLANTAO` ou `DISPONIVEL` na escala de assinatura da circunscrição ([UC-RAIT-013]).
- `T-DEC` da infração ainda aberto ([WF-INF-003] §3).

## Fluxo principal

1. Autoridade abre a fila da sua circunscrição, ordenada pela ordem única ([RN-RAIT-141]), com dias restantes de `T-DEC` por caso.
2. Autoridade lê a minuta, o dossiê e o parecer de admissibilidade; o sistema exibe o enquadramento, as provas do órgão anexadas de ofício e as diligências realizadas.
3. Autoridade decide: acolhida (AIT cancelado, registro arquivado, comunicação ao proprietário — 918 art. 9º §1º) ou indeferida (aplicação da penalidade e expedição da NP — 918 art. 9º §2º); a decisão é fundamentada e assinada (PAdES+TSA).
4. Caso passa a `DECIDIDO_AUTORIDADE`; evento `RAIT_DECISAO_PUBLICADA` é publicado; a infração transita conforme [WF-INF-003] #8/#9.
5. Sistema encaminha a comunicação ([UC-RAIT-007]) e, se indeferida, a expedição da NP ([UC-RAIT-041]).

## Fluxos alternativos / exceções

- **3a.** Autoridade devolve a minuta ao revisor com orientação, uma única vez; o caso permanece em `PRONTO_P_DECISAO`, a devolução fica no histórico e `T-ASS` reinicia.
- **3b.** Autoridade identifica impedimento ou suspeição próprios ([RN-RAIT-140]): devolve à fila da circunscrição e o substituto da escala assume.
- **1a.** `T-ASS` vencido: alerta ao coordenador e ao gestor; caso destacado no radar quando `T-DEC` estiver em `ALERTA_N2` ou acima.
- **3c.** Defesa pede advertência por escrito (918 art. 10-11): decisão registra a modalidade; o sistema aplica o bloqueio de recurso à JARI do art. 11 §2º na fase seguinte.

## Pós-condições

Decisão assinada e fundamentada; caso em `DECIDIDO_AUTORIDADE`; infração em `AIT_CANCELADO` ou `PENALIDADE_A_APLICAR`.

## Critérios de aceitação

**AC-RAIT-016-1 — a assinatura é pessoal e territorial**

- **Dado** uma minuta da circunscrição X
- **Quando** uma autoridade escalada em Y tenta assinar
- **Então** o sistema recusa; só autoridade escalada em X, ou seu substituto designado, assina ([RN-RAIT-143])

**AC-RAIT-016-2 — o revisor nunca assina**

- **Dado** um revisor com a minuta pronta
- **Quando** tenta concluir a decisão
- **Então** o sistema só permite enviar à fila de assinatura; a tela indica "aguardando assinatura da autoridade"

**AC-RAIT-016-3 — devolução é única e rastreada**

- **Dado** uma minuta já devolvida uma vez
- **Quando** a autoridade tenta devolver de novo
- **Então** o sistema exige decisão ou ato motivado do coordenador para nova devolução

**AC-RAIT-016-4 — decisão fora do prazo decadencial é bloqueada**

- **Dado** um caso com `T-DEC` vencido
- **Quando** a autoridade tenta indeferir e aplicar penalidade
- **Então** o sistema bloqueia a NP e encaminha a declaração de decadência ([UC-RAIT-023])

## Regras aplicáveis

- [RN-RAIT-115] (competência, inclusive mérito)
- [RN-RAIT-143] (competência territorial e escala de assinatura)
- [RN-RAIT-114] (decadência 180/360 dias)
- [RN-RAIT-132] (efeitos por desfecho)
- [RN-RAIT-140] (impedimento e suspeição)
