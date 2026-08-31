---
id: RN-PORTAL-109
title: Ouvidoria no PORTAL — recebimento irrecusável, comprovante imediato e dois relógios legais (30+30 ao usuário, 20+20 internos)
status: draft
apps: [portal, dashboard]
sources: [REF-LEI-13460-2017, REF-DECRETO-10543-2020, REF-LEI-14129-2021]
updated: 2026-08-24
---

**Regra.** O PORTAL oferece canal de ouvidoria com cinco propriedades vinculantes:

1. **Recebimento irrecusável.** _"Em nenhuma hipótese"_ a manifestação pode ser recusada — a recusa
   acarreta **responsabilidade do agente público**. O sistema não pode ter caminho de código que
   rejeite uma manifestação por conteúdo, por forma, por serviço não catalogado ou por competência
   alheia; no máximo, encaminha.
2. **Identificação mínima, sem barreira.** A manifestação contém a identificação do requerente, mas
   _"não conterá exigências que inviabilizem sua manifestação"_, e são **vedadas exigências sobre os
   motivos** da manifestação. Consequência direta: **nenhum nível de assinatura eletrônica é exigível
   aqui** — o [REF-DECRETO-10543-2020] exclui expressamente os sistemas de ouvidoria do seu alcance
   (linha 3 da matriz de [RN-PORTAL-101]).
3. **Comprovante imediato.** Emissão de comprovante de recebimento é elemento da própria "efetiva
   resolução" da manifestação (art. 12, parágrafo único, II), e não uma cortesia.
4. **Relógio do usuário: 30 dias, prorrogável uma única vez por igual período** (teto de 60), para a
   decisão administrativa final ser encaminhada ao usuário.
5. **Relógio interno: 20 dias, prorrogável uma única vez por igual período** (teto de 40), para o
   agente público responder à solicitação de informação feita pela ouvidoria — **prazo do órgão
   consigo mesmo, nunca exibido ao cidadão como se fosse o prazo dele** (`_intake/ux-notes.md`).

As cinco etapas da resolução efetiva — recepção, comprovante, análise, decisão final, ciência ao
usuário — são o **modelo de estados** da manifestação; nenhuma pode ser suprimida.

**Base legal.**

- [REF-LEI-13460-2017] art. 10: _"A manifestação será dirigida à ouvidoria do órgão ou entidade
  responsável e conterá a identificação do requerente."_ § 1º: _"A identificação do requerente não
  conterá exigências que inviabilizem sua manifestação."_ § 2º: _"São vedadas quaisquer exigências
  relativas aos motivos determinantes da apresentação de manifestações perante a ouvidoria."_ § 4º:
  _"A manifestação poderá ser feita por meio eletrônico, ou correspondência convencional, ou
  verbalmente [...]"_.
- [REF-LEI-13460-2017] art. 11: _"Em nenhuma hipótese, será recusado o recebimento de manifestações
  formuladas nos termos desta Lei, sob pena de responsabilidade do agente público."_
- [REF-LEI-13460-2017] art. 12, parágrafo único: _"A efetiva resolução das manifestações dos usuários
  compreende: I - recepção da manifestação no canal de atendimento adequado; II - emissão de
  comprovante de recebimento da manifestação; III - análise e obtenção de informações, quando
  necessário; IV - decisão administrativa final; e V - ciência ao usuário."_
- [REF-LEI-13460-2017] art. 16: _"A ouvidoria encaminhará a decisão administrativa final ao usuário,
  observado o prazo de trinta dias, prorrogável de forma justificada uma única vez, por igual
  período."_ Parágrafo único: _"[...] a ouvidoria poderá solicitar informações e esclarecimentos
  diretamente a agentes públicos do órgão [...], e as solicitações devem ser respondidas no prazo de
  vinte dias, prorrogável de forma justificada uma única vez, por igual período."_
- [REF-LEI-13460-2017] arts. 14, II e 15: relatório de gestão **anual**, com nº de manifestações,
  motivos, análise de pontos recorrentes e providências, _"disponibilizado integralmente na
  internet"_.
- [REF-DECRETO-10543-2020] art. 2º, parágrafo único, III: o Decreto de níveis de assinatura _"não se
  aplica [...] aos sistemas de ouvidoria de entes públicos"_.
- [REF-LEI-14129-2021] art. 21, XI: a ferramenta digital de atendimento deve conter _"implementação
  de sistema de ouvidoria, nos termos da Lei nº 13.460/2017"_.

**Verificação (monitorável pelo DASHBOARD).**

| Indicador                         | Fórmula                                                                                  | Meta                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Taxa de resposta no prazo simples | manifestações respondidas em ≤ 30 dias ÷ total encerrado                                 | —                                                                             |
| Taxa de resposta no teto legal    | manifestações respondidas em ≤ 60 dias ÷ total encerrado                                 | **100%** (abaixo disso há descumprimento de prazo legal)                      |
| Prorrogações justificadas         | manifestações com prorrogação **e** justificativa registrada ÷ manifestações prorrogadas | **100%** — a prorrogação sem justificativa é irregular, não apenas incompleta |
| Relógio interno                   | solicitações da ouvidoria respondidas por agente em ≤ 20 / ≤ 40 dias ÷ total             | 100% no teto                                                                  |
| Recusas de recebimento            | contagem absoluta de manifestações recusadas                                             | **0**, por definição legal                                                    |
| Relatório anual publicado         | existência e data de publicação do relatório do art. 15                                  | 1 por ano, publicado na internet                                              |

Travas de produto: (a) o campo "motivo da manifestação" só pode existir como **classificação
opcional**, nunca obrigatória; (b) a prorrogação exige texto de justificativa não vazio, e o sistema
grava `prorrogado_em`, `prorrogado_por` e `justificativa`; (c) a contagem dos 30 dias parte da
**recepção**, não da triagem.

**Controvérsia/risco.** (a) A lei diz "trinta dias" sem qualificar corridos ou úteis. Nada no CTB ou
nas resoluções CONTRAN alcança a ouvidoria, e o regime subsidiário natural é o da
[REF-LEI-9784-1999] art. 66 (dias corridos, excluindo o dia do começo e incluindo o do vencimento,
com prorrogação para o primeiro dia útil) — leitura adotada aqui e coerente com [RN-RAIT-005], mas
não confirmada por norma expressa. (b) A relação entre a **manifestação de ouvidoria** e a **defesa/
recurso** precisa ser explicitada na UX: são vias distintas, com efeitos jurídicos distintos, e
manifestar-se na ouvidoria **não** interrompe nem suspende prazo processual algum ([RN-RAIT-105]).
Um cidadão que reclama na ouvidoria em vez de recorrer perde o prazo — e o PORTAL tem o dever de
avisá-lo antes, não depois. Este é o risco de UX mais consequente de todo o bloco de ouvidoria.
