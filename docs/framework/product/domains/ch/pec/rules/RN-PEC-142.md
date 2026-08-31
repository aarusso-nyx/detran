---
id: RN-PEC-142
title: Nível de assinatura exigido do laudo — avançada é o piso do art. 14; qualificada é exigência direta se o laudo for atestado do art. 13, e é o patamar que o PEC já adota
status: draft
apps: [pec]
sources:
  [
    REF-LEI-14063-2020,
    REF-MP-2200-2-2001,
    REF-CFM-1821-2007,
    REF-LEI-13787-2018,
  ]
updated: 2026-08-24
---

**Regra.** A lei classifica as assinaturas eletrônicas em **simples, avançada e qualificada** — sendo
**qualificada** a que usa certificado digital ICP-Brasil, com o _"nível mais elevado de
confiabilidade"_. Para documentos de saúde, o regime é bipartido:

- **art. 13** — _receituários de medicamentos sujeitos a controle especial_ e **atestados médicos**
  em meio eletrônico: **somente assinatura qualificada**;
- **art. 14** — os **demais** documentos eletrônicos subscritos por profissionais de saúde e
  relacionados à sua área de atuação: válidos com **assinatura avançada OU qualificada**.

**Posição adotada.** O laudo de aptidão física e mental e o laudo psicológico devem ser assinados
com **assinatura qualificada (ICP-Brasil)**, como já faz [RN-PEC-002] — e essa exigência é sustentada
por **quatro fundamentos independentes**, de modo que ela se mantém qualquer que seja a classificação
do laudo entre os arts. 13 e 14:

1. **CFM 1.821/2007 art. 5º**: o NGS2, que é o que autoriza eliminar o papel, **exige assinatura
   digital**, com uso autorizado do certificado ICP-Brasil ([RN-PEC-140]).
2. **Lei 13.787/2018 art. 2º, § 2º**: certificado ICP-Brasil (ou outro padrão legalmente aceito) no
   tratamento do prontuário.
3. **MP 2.200-2/2001 art. 10, § 1º**: só o certificado ICP-Brasil confere **presunção legal de
   veracidade** quanto ao signatário — presunção que um laudo pericial destinado a produzir efeito
   perante o Estado e o cidadão não deveria dispensar.
4. **Lei 14.063/2020 art. 5º, § 5º**: _"No caso de conflito entre normas vigentes [...] prevalecerá
   o uso de assinaturas eletrônicas qualificadas."_ — regra de desempate expressa, aplicável
   exatamente à dúvida art. 13 × art. 14.

**Classificação do laudo — questão aberta com consequência prática.** Se o laudo de aptidão for
equiparado a **"atestado médico"** do art. 13 — tese defensável, já que o documento **atesta** a
aptidão ou inaptidão de uma pessoa —, a assinatura qualificada deixa de ser prudência e passa a ser
**exigência legal direta**. Se for documento do art. 14, o piso legal é a **avançada**, e o patamar
do PEC é escolha de arquitetura. **A prática atual não muda em nenhuma das hipóteses**; muda a
natureza da obrigação, e portanto a análise de risco de qualquer proposta futura de afrouxamento.

**Base legal.**

- [REF-LEI-14063-2020] art. 4º, III: _"assinatura eletrônica qualificada: a que utiliza certificado
  digital, nos termos do § 1º do art. 10 da Medida Provisória nº 2.200-2"_; § 1º: nível mais elevado
  de confiabilidade.
- [REF-LEI-14063-2020] art. 13: _"Os receituários de medicamentos sujeitos a controle especial e os
  atestados médicos em meio eletrônico, previstos em ato do Ministério da Saúde, somente serão
  válidos quando subscritos com assinatura eletrônica qualificada do profissional de saúde."_
- [REF-LEI-14063-2020] art. 14: _"Com exceção do disposto no art. 13 desta Lei, os documentos
  eletrônicos subscritos por profissionais de saúde e relacionados à sua área de atuação são válidos
  para todos os fins quando assinados por meio de: I - assinatura eletrônica avançada; ou II -
  assinatura eletrônica qualificada."_
- [REF-LEI-14063-2020] art. 5º, § 5º (prevalência da qualificada em caso de conflito).
- [REF-MP-2200-2-2001] art. 1º e art. 10, § 1º e § 2º.
- [REF-CFM-1821-2007] arts. 3º-5º; [REF-LEI-13787-2018] art. 2º, § 2º.

**Verificação.** Fecha o "(fonte pendente)" de [RN-PEC-001] e [RN-PEC-002]. Consequências
verificáveis:

1. **A exigência de certificado do próprio profissional** (não da clínica, não da plataforma) decorre
   do art. 13/14 combinados: quem assina é _"o profissional de saúde"_. Certificado institucional
   **não** satisfaz.
2. **O parágrafo único do art. 13 — _"não se aplicam aos atos internos do ambiente hospitalar"_ —
   não socorre o PEC**: o laudo é documento **externo** por definição, destinado ao RENACH e ao
   cidadão.
3. **TSA e OCSP/CRL não são exigidos por essas leis** — são requisitos técnicos de verificabilidade
   no tempo, adotados pelo PEC. Tornam-se **indispensáveis de fato** por causa dos 20 anos de
   [RN-PEC-141], não por texto legal.
4. **O piso não pode ser rebaixado** sem revisitar [RN-PEC-140]: a assinatura avançada não satisfaz o
   NGS2 do CFM e, portanto, não autorizaria o modelo sem papel.
5. **Regulamentação delegada pendente**: o parágrafo único do art. 14 remete a ato do Ministro da
   Saúde ou da Anvisa para especificar hipóteses e critérios de validação — **não localizado**.

**Controvérsia/risco.** _Severidade: baixa quanto à prática, média quanto à qualificação — item nº 4
da lista de validação humana._ (a) A classificação art. 13 × art. 14 depende de "ato do Ministério da
Saúde" que a própria lei pressupõe e que não foi localizado — a definição de _"atestado médico em
meio eletrônico"_ é, portanto, **normativamente incompleta**. (b) A norma do art. 13 fala em
"atestados **médicos**"; o **laudo psicológico** não é ato médico, e cairia no art. 14 em qualquer
leitura — o que produziria, sem a regra de desempate do art. 5º, § 5º, **dois pisos diferentes para
os dois laudos do mesmo episódio**. É mais um argumento prático para manter o patamar único e mais
alto. (c) Nada disso é urgente enquanto o PEC operar no nível qualificado; torna-se decisivo se
alguma vez se propuser reduzir. Item 6 de `_intake/legal-assessment.md`.
