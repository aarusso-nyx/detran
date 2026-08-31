---
id: RN-PORTAL-120
title: Prazo de resposta ao titular perante o Poder Público — os 15 dias da LGPD não se aplicam automaticamente; acesso imediato é o padrão do autosserviço
status: draft
apps: [portal, boat, dashboard]
sources:
  [
    REF-LEI-13709-2018,
    REF-LEI-12527-2011,
    REF-LEI-9784-1999,
    REF-LEI-13460-2017,
  ]
updated: 2026-08-24
---

**Regra.** O prazo de resposta ao titular de dados **não é único** e o PORTAL deve tratá-lo em três
faixas, conforme o tipo de pedido:

| Faixa                           | Pedido                                                                                                                | Prazo                                                                                                                                                                                                                                    | Fundamento                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **1. Imediato**                 | Confirmação de existência de tratamento; acesso em **formato simplificado** (o dado que o titular vê na própria tela) | **Imediato**, sem requerimento e sem fila                                                                                                                                                                                                | LGPD art. 19, I                                           |
| **2. Declaração completa**      | Declaração _"clara e completa"_, com origem dos dados, critérios utilizados e finalidade do tratamento                | **Prazo do regime específico do Poder Público**, não os 15 dias genéricos — adotar **20 dias, prorrogáveis por 10** (LAI), por ser o regime mais próximo e o único com prazo numérico expresso para pedido de informação a órgão público | LGPD art. 19, II c/c art. 23, § 3º; LAI art. 11, §§ 1º-2º |
| **3. Providência sobre o dado** | Correção, bloqueio, eliminação, informação sobre compartilhamento                                                     | Mesmo prazo da faixa 2; se inviável de imediato, resposta motivada no prazo, indicando as razões de fato ou de direito                                                                                                                   | LGPD art. 18, § 4º; Lei 9.784/1999 (subsidiária)          |

Três regras de conduta derivadas:

1. **Autosserviço mata prazo.** O que o cidadão consegue ver sozinho e na hora ([RN-PORTAL-118])
   nunca deveria virar requerimento — o desenho correto elimina a maior parte dos pedidos da faixa 2
   por não deixá-los nascer.
2. **Prorrogação exige justificativa expressa e ciência ao requerente** — como na LAI e na ouvidoria.
3. **Sem custos**, em qualquer faixa (LGPD art. 18, § 5º).

**Base legal.**

- [REF-LEI-13709-2018] art. 19: _"A confirmação de existência ou o acesso a dados pessoais serão
  providenciados, mediante requisição do titular: **I - em formato simplificado, imediatamente**; ou
  II - por meio de declaração clara e completa, que indique a origem dos dados, a inexistência de
  registro, os critérios utilizados e a finalidade do tratamento, observados os segredos comercial e
  industrial, **fornecida no prazo de até 15 (quinze) dias**, contado da data do requerimento do
  titular."_
- [REF-LEI-13709-2018] art. 23, § 3º: _"Os prazos e procedimentos para exercício dos direitos do
  titular **perante o Poder Público** observarão o disposto em legislação específica, em especial as
  disposições constantes da Lei nº 9.507, de 12 de novembro de 1997 (Lei do Habeas Data), da Lei nº
  9.784, de 29 de janeiro de 1999 (Lei Geral do Processo Administrativo), e da Lei nº 12.527, de 18
  de novembro de 2011 (Lei de Acesso à Informação)."_
- [REF-LEI-12527-2011] art. 11: _"O órgão ou entidade pública deverá autorizar ou conceder **o acesso
  imediato à informação disponível**."_ § 1º: não sendo possível, _"em prazo não superior a 20
  (vinte) dias"_, comunicar data/local/modo da consulta, indicar as razões da recusa ou comunicar que
  não possui a informação. § 2º: _"O prazo referido no § 1º poderá ser prorrogado por mais 10 (dez)
  dias, mediante justificativa expressa, da qual será cientificado o requerente."_
- [REF-LEI-13709-2018] art. 18, § 4º e § 5º: resposta motivada em caso de impossibilidade imediata;
  atendimento sem custos.
- [REF-LEI-13460-2017] art. 16: relógio de 30+30 da **ouvidoria** — regime distinto, que não se
  confunde com o do titular de dados (ver Controvérsia).

**Verificação (monitorável pelo DASHBOARD).**

| Indicador                          | Fórmula                                                              | Meta                                                      |
| ---------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| Taxa de atendimento imediato       | pedidos resolvidos em autosserviço ÷ total de acessos a dado próprio | quanto maior, melhor — mede a eficácia de [RN-PORTAL-118] |
| Requerimentos no prazo             | requerimentos do art. 18 respondidos em ≤ 20 dias ÷ total            | —                                                         |
| Requerimentos no teto              | respondidos em ≤ 30 dias ÷ total                                     | **100%**                                                  |
| Prorrogações justificadas          | prorrogados com justificativa registrada ÷ prorrogados               | 100%                                                      |
| Requerimentos com decisão motivada | respostas com motivação textual ÷ total respondido                   | 100% (inclusive indeferimentos)                           |

**Controvérsia/risco (ALTO — escolha jurídica não fechada).** O art. 23, § 3º remete a **três
regimes** distintos e não elege nenhum; nenhum ato do DETRAN-AM fazendo essa escolha foi localizado.
A adoção do prazo da LAI (20+10) é **posição de trabalho**, escolhida por três razões: é o único dos
três com prazo numérico expresso para pedido de informação a órgão público; é o regime que a própria
Lei 14.129/2021 art. 30, § 2º manda aplicar a pedidos de abertura de bases; e é mais protetivo que a
alternativa de deixar o prazo indefinido. Três alternativas defensáveis que um parecerista pode
preferir: (a) manter os 15 dias do art. 19, II da LGPD por serem prazo próprio da matéria; (b) usar
o prazo geral de decisão da Lei 9.784/1999; (c) diferenciar por tipo de pedido. **É definição formal
que cabe ao órgão fazer**, e a mesma lacuna já está registrada em [RN-BOAT-126], "Controvérsia (a)" —
aqui ela deixa de ser observação e vira número operante, porque o PORTAL precisa de um relógio para
funcionar. Item 7 de `_intake/legal-assessment.md`.

Risco secundário — **três relógios convivendo no mesmo produto**: ouvidoria 30+30
([RN-PORTAL-109]), titular de dados 20+10 (esta regra), e os prazos processuais do CTB
([RN-RAIT-101] a [RN-RAIT-103]). São regimes independentes, contam de marcos diferentes e **não se
comunicam**: pedir dado pela via LGPD não suspende prazo de recurso, e manifestar-se na ouvidoria não
substitui requerimento de titular. A UX precisa impedir que o cidadão use um canal esperando o efeito
de outro — mesmo risco apontado em [RN-PORTAL-109], "Controvérsia (b)".
