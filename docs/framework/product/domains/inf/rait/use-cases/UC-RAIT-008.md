---
id: UC-RAIT-008
title: Autoridade decide recorrer de decisão de provimento
status: approved
apps: [rait]
sources: [REF-CTB-extracts-raw, REF-CONTRAN-918]
updated: 2026-08-26
---

## Ator e objetivo

Autoridade de trânsito (que impôs a penalidade originalmente) avalia se recorre ao CETRAN-AM
contra uma decisão da JARI que deu provimento ao recurso do cidadão — a única hipótese em que
o próprio órgão, e não o cidadão, é o recorrente de 2ª instância.

## Pré-condições

Caso `instancia=jari` `JULGADO_SESSAO` com resultado `provido`, comunicado ao requerente
([UC-RAIT-007]).

## Fluxo principal

1. Sistema sinaliza à autoridade os casos com provimento recente, dentro da janela de 30 dias
   (CTB art.288, contados da publicação/notificação da decisão).
2. Autoridade avalia os fundamentos da decisão de provimento (ex.: discordância jurídica,
   precedente relevante, orientação normativa).
3. Se decide recorrer: sistema abre um novo caso RAIT `instancia=cetran`, remessa **interna**
   (sem petição externa — a legitimidade da autoridade é presumida pelo cargo, CTB art.288
   §1º) — caso nasce em `ADMITIDO`/`DISTRIBUIDO`, herdando `caso_origem_id` do caso JARI.
4. Requerente é comunicado de que a autoridade recorreu (CONTRAN-918 art.17 §ú) — a decisão
   favorável ainda não transitou em julgado.
5. Se a autoridade não recorre dentro dos 30 dias: caso JARI passa a `TRANSITADO` — provimento
   torna-se definitivo, multa cancelada.

## Fluxos alternativos / exceções

- **1a.** Janela de 30 dias expira sem decisão registrada: sistema trata como não-recurso
  (silêncio = renúncia ao prazo) → segue fluxo 5.
- **3a.** Múltiplos casos de provimento com mesmo fundamento sistemático repetido: CONTRAN-357
  item 3.1.c prevê que a JARI encaminhe ao órgão informações sobre problemas de autuação que
  se repitam — proposta de alimentar esse achado ao dashboard de qualidade de autuação (fora
  do escopo direto deste UC, ver `bpo-notes.md`).

## Pós-condições

- Se recorreu: novo caso `instancia=cetran` criado, requerente comunicado, decisão da JARI
  ainda não definitiva.
- Se não recorreu: caso JARI `TRANSITADO`, decisão definitiva a favor do cidadão.

## Critérios de aceitação

**AC-RAIT-008-1 — a janela de 30 dias é apresentada à autoridade como fila própria**

- **Dado** decisões de provimento em `instancia=jari` comunicadas
- **Quando** a autoridade abre sua fila
- **Então** os casos aparecem com os dias restantes da janela de 30 dias (CTB art.288) e a fundamentação da decisão de provimento acessível

**AC-RAIT-008-2 — recorrer abre caso interno, sem triagem de admissibilidade cidadã**

- **Dado** uma autoridade que decide recorrer
- **Quando** registra a decisão
- **Então** o sistema cria caso `instancia=cetran` já em `ADMITIDO`/`DISTRIBUIDO`, com `caso_origem_id` e `ait_id` herdados, sem passar por `TRIAGEM_ADMISSIBILIDADE` ([WF-RAIT-001] §Reentrância, [RN-RAIT-130])

**AC-RAIT-008-3 — silêncio da autoridade é renúncia**

- **Dado** uma janela de 30 dias que expira sem decisão registrada
- **Quando** o timer vence
- **Então** o caso JARI transita automaticamente para `TRANSITADO`, o provimento torna-se definitivo e o cancelamento da multa é publicado ([RN-RAIT-132])

**AC-RAIT-008-4 — o requerente é comunicado do recurso da autoridade**

- **Dado** uma autoridade que recorreu
- **Quando** o novo caso CETRAN é criado
- **Então** o requerente recebe comunicação de que a decisão favorável ainda não transitou ([RN-RAIT-130], CONTRAN-918 art.17 §ú)

**AC-RAIT-008-5 — a decisão da autoridade é fundamentada e auditável**

- **Dado** a decisão de recorrer ou de não recorrer
- **Quando** registrada
- **Então** exige fundamentação e fica vinculada à identidade da autoridade, com trilha de auditoria — inclusive no caso de não-recurso expresso

## Regras aplicáveis

- [RN-RAIT-130] (legitimidade recursal bilateral e dever de informar se a autoridade recorre —
  CTB art.288 §1º; CONTRAN-918 art.17 §ú)
- Referência: [WF-RAIT-001] §Reentrância
