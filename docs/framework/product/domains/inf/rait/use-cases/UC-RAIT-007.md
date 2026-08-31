---
id: UC-RAIT-007
title: Secretaria comunica a decisão ao requerente
status: approved
apps: [rait, portal]
sources: [REF-CONTRAN-918, REF-CONTRAN-931]
updated: 2026-08-26
---

## Ator e objetivo

Secretaria (via processo automatizado, com canal do PORTAL como via preferencial) notifica o
requerente do resultado do caso — decisão de autoridade (1º circuito), decisão de sessão (2º
circuito), ou não-conhecimento — dando ciência formal e abrindo/fechando o prazo recursal
seguinte.

## Pré-condições

Caso em `DECIDIDO_AUTORIDADE`, `JULGADO_SESSAO`, ou `NAO_CONHECIDO` ([WF-RAIT-001]).

## Fluxo principal

1. Sistema gera a comunicação formal: resultado (acolhida/indeferida; provido/negado/não
   conhecido), fundamentação, e — quando aplicável — a data-limite do próximo prazo recursal
   (CONTRAN-918 art.17).
2. Sistema anexa de ofício ao requerente os artefatos que o órgão já possui (parecer e
   conclusão da JARI, quando comunicando resultado de recurso ao CETRAN — [RN-RAIT-003]).
3. Notificação é enviada preferencialmente por via eletrônica (SNE, se o requerente aderiu —
   CONTRAN-931) ou pelo canal de protocolo original.
4. Caso passa a `COMUNICADO`.
5. Se a decisão foi de provimento em `instancia=jari`: sistema também comunica se a autoridade
   vai recorrer (CONTRAN-918 art.17 §ú) — ver [UC-RAIT-008].

## Fluxos alternativos / exceções

- **3a.** Notificação eletrônica via SNE: só se considera efetivada 30 dias após a inclusão no
  sistema e envio da mensagem (CTB art.282-A §2º) — o prazo do próximo recurso só começa a
  contar depois desse intervalo, não no instante do envio.
- **3b.** Requerente não aderiu ao SNE: notificação por via postal/edital, com as regras de
  tempestividade correspondentes (CONTRAN-918 art.14).

## Pós-condições

Requerente notificado; caso em `COMUNICADO`, prazo do próximo recurso (se houver) contando a
partir da ciência efetiva.

## Critérios de aceitação

**AC-RAIT-007-1 — a comunicação carrega o próximo prazo, calculado**

- **Dado** uma decisão que ainda admite recurso
- **Quando** a comunicação é gerada
- **Então** ela contém resultado, fundamentação e a **data-limite** do próximo prazo recursal calculada pelo motor de prazos (CONTRAN-918 art.17, [RN-RAIT-005]) — nunca apenas "30 dias" em abstrato

**AC-RAIT-007-2 — anexação de ofício das peças do órgão**

- **Dado** a comunicação do resultado de um recurso à JARI
- **Quando** o requerente pode recorrer ao CETRAN
- **Então** o parecer e a conclusão da JARI seguem anexados de ofício ([RN-RAIT-003], [RN-RAIT-117]), e em nenhuma tela se exige que o requerente os junte

**AC-RAIT-007-3 — ciência ficta do SNE conta 30 dias**

- **Dado** um requerente aderente ao SNE
- **Quando** a notificação é incluída no sistema em D
- **Então** a ciência só se considera efetivada em D+30 (CTB art.282-A §2º, [RN-RAIT-124]) e o prazo do recurso seguinte começa a correr a partir daí, não do envio

**AC-RAIT-007-4 — o termo inicial varia com o canal**

- **Dado** requerentes notificados por via postal, pessoalmente, por edital ou por via eletrônica
- **Quando** o prazo seguinte é calculado
- **Então** o termo inicial aplicado corresponde ao canal efetivamente usado ([RN-RAIT-104]), registrado no caso junto com a prova de ciência

**AC-RAIT-007-5 — provimento em JARI comunica a intenção da autoridade**

- **Dado** um caso `instancia=jari` com resultado `provido`
- **Quando** a comunicação é expedida
- **Então** ela informa se a autoridade recorrerá ([RN-RAIT-130], CONTRAN-918 art.17 §ú) e deixa explícito que a decisão favorável ainda não é definitiva enquanto a janela de 30 dias correr

## Regras aplicáveis

- [RN-RAIT-003] (anexação de ofício)
- [RN-RAIT-005] (contagem de prazo a partir da comunicação)
