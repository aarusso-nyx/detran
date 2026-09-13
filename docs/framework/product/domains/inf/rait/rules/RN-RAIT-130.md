---
id: RN-RAIT-130
title: Comunicação obrigatória do resultado e informação sobre recurso da autoridade contra decisão de provimento
status: draft
apps: [rait, portal]
sources:
  [
    REF-CONTRAN-918,
    REF-CTB-280-290,
    REF-CONTRAN-357,
    REF-CONTRAN-931,
    REF-LEI-9784-1999,
  ]
updated: 2026-09-13
---

**Regra.** O recorrente **deve ser informado das decisões** dos recursos de 1ª e de 2ª instância. No
caso de **deferimento** do recurso de 1ª instância, o recorrente deve ser informado **se a autoridade
recorrer da decisão**. As decisões do colegiado devem ser **fundamentadas** e ter a **devida
publicidade**.

Legitimidade recursal em 2ª instância é **bilateral**: da decisão de **não provimento** recorre o
responsável pela infração; da decisão de **provimento** recorre **a autoridade que impôs a
penalidade**.

**Base legal.**

- [REF-CONTRAN-918] art. 17: _"O recorrente deverá ser informado das decisões dos recursos de que
  tratam os arts. 15 e 16."_
- [REF-CONTRAN-918] art. 17, parágrafo único: _"No caso de deferimento do recurso de que trata o art.
  15, o recorrente deverá ser informado se a autoridade recorrer da decisão."_
- [REF-CTB-280-290] art. 288 §1º: _"O recurso será interposto, da decisão do não provimento, pelo
  responsável pela infração, e da decisão de provimento, pela autoridade que impôs a penalidade."_
- [REF-CONTRAN-357] item 8.3: decisões fundamentadas, aprovadas por maioria simples, _"dando-se a
  devida publicidade"_.
- [REF-CONTRAN-931] art. 4º, VI: o **resultado de julgamentos** é item que os órgãos devem
  disponibilizar no SNE ([RN-RAIT-125]).

**Verificação.** O evento `RAIT_DECISAO_PUBLICADA` ([WF-RAIT-001] §Eventos) dispara comunicação ao recorrente pelo canal
correspondente (SNE quando aderente; postal; PORTAL), com a decisão fundamentada e, quando aplicável,
o prazo de recurso ao CETRAN ([RN-RAIT-103]). Em caso de provimento, o RAIT abre **fila própria de
recurso da autoridade**, com responsável designado e prazo, e o cidadão é informado do resultado
dessa deliberação — provido ou não — em qualquer caso, e não apenas se a autoridade recorrer.

**Controvérsia/risco (o ponto mais aberto do circuito de 2ª instância).** O corpus capturado **não
regula** o recurso da autoridade contra a decisão de provimento. Especificamente, não há norma que
defina:

1. se o recurso é **discricionário** ou **vinculado** — o art. 288 §1º é afirmativo mas não
   expressamente exclusivo, e o art. 17, parágrafo único, da Res. 918/2022 pressupõe a faculdade sem
   discipliná-la ("informado **se** a autoridade recorrer");
2. **qual autoridade** dentro do DETRAN-AM é competente para exercê-lo, e sob que critérios;
3. o **prazo** aplicável — o art. 288 _caput_ fixa 30 dias "da publicação ou da notificação da
   decisão", mas para a autoridade a ciência é o próprio julgamento, marco não explicitado;
4. se o cidadão é **intimado para contrarrazões**. Socorro subsidiário mais próximo:
   [REF-LEI-9784-1999] art. 62 (intimação dos demais interessados para alegações em 5 dias úteis) e
   art. 64, parágrafo único (contraditório prévio quando puder decorrer gravame ao recorrente —
   _reformatio in pejus_).

Nenhum desses quatro pontos pode ser resolvido por inferência no desenho do sistema.
`_intake/legal-assessment.md`, item 5.

**Dado institucional recebido (2026-08-27/28, não resolve o ponto 2).** A Sub Gerência de
Infração do DETRAN-AM informou haver **55 servidores investidos com "Autoridade de Trânsito"** (50
na capital, 5 no interior) — ver [APP-RAIT] §Volumes e capacidade. Isso confirma que
"autoridade de trânsito" é um **papel exercido por muitas pessoas**, não um cargo único
centralizado — relevante ao desenho do ponto 2 (é plausível que cada autoridade recorra
individualmente contra a decisão de provimento sobre seus próprios AITs, em vez de uma autoridade
central concentrar o recurso), mas **não determina** qual delas é competente para o recurso
vinculado nem sob que critério — segue sem resposta.

**Decisão (parcial, atualizada 2026-08-28).** Owner, em steering (`_meta/steering.md` C.16,
2026-08-24), sem parecer jurídico formal, resolveu o **ponto 1**: o recurso da autoridade é
**vinculado** — a autoridade é obrigada a recorrer sempre que a decisão de 1ª instância for de
provimento (não é faculdade discricionária).

Em rodada de decisões de 2026-08-28 (`_meta/open-issues.md` DT-010), o Owner respondeu mais dois
pontos, também sem parecer jurídico formal:

- **Ponto 2 (qual autoridade).** **Autoridade centralizada** exerce o recurso — não cada uma das
  55 autoridades de trânsito individualmente sobre seus próprios AITs (ver [APP-RAIT] §Volumes e
  capacidade). O RAIT deve modelar um responsável/cargo único designado para a fila de recurso da
  autoridade, não distribuir a decisão entre as 55. **Qual cargo/setor especificamente** ainda não
  foi identificado — é o próximo ponto a esclarecer, provavelmente por via institucional
  (`institutional-ask`), não por nova pergunta de steering.
- **Ponto 4 (contrarrazões).** O cidadão **não é intimado** para contrarrazões quando a
  autoridade recorre — decisão explícita de **não** adotar o socorro subsidiário do art. 62 da
  Lei 9.784/1999 (intimação para alegações) nem o art. 64, parágrafo único (contraditório prévio
  por _reformatio in pejus_). O RAIT não deve modelar etapa de contraditório do cidadão nesse
  fluxo específico.

**Ponto 3 (prazo aplicável) segue sem resposta** — nem a pergunta original de steering nem a
rodada de 2026-08-28 o cobriram. O fluxo do recurso vinculado da autoridade em [WF-RAIT-001]
"Reentrância" ainda não pode ser modelado por completo sem esse ponto.

**Decisão do Owner (2026-09-13, steering.md H.47) — prazo.** O recurso vinculado da autoridade
centralizada é interposto em **30 dias contados da publicação da decisão da JARI**, por isonomia
com o art. 288 _caput_ do CTB; parâmetro operacional, revisável quando o DETRAN-AM responder ao
ofício que pede a confirmação (item 3 do ofício 01).
