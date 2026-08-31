---
id: RN-PEC-104
title: Conteúdo e condução da perícia psicológica — instrumentos com parecer SATEPSI, entrevista individual obrigatória e entrevista devolutiva
status: draft
apps: [pec, portal]
sources:
  [
    REF-CFP-01-2019,
    REF-CONTRAN-927-2022,
    REF-DETRANAM-PORTARIA-005-2021,
    REF-CTB-147-148-habilitacao,
  ]
updated: 2026-08-24
---

**Regra.** A avaliação psicológica do candidato é uma **perícia psicológica** com conteúdo mínimo
normatizado, não um exame de formato livre. O PEC hoje regula apenas o **laudo**; a norma regula o
**procedimento**. Cinco exigências vinculam diretamente o produto:

1. **Três eixos obrigatórios de avaliação**: aspectos cognitivos (atenção concentrada, dividida e
   alternada; memória visual; inteligência), juízo crítico/comportamento (entrevista, situações
   hipotéticas, histórico de sinistros) e traços de personalidade (impulsividade, agressividade,
   ansiedade).
2. **Instrumentos restritos ao SATEPSI**: a escolha do teste é prerrogativa do psicólogo, **desde
   que o instrumento tenha parecer favorável do Sistema de Avaliação de Testes Psicológicos do CFP**.
3. **Entrevista individual obrigatória** — de caráter individual, sempre. Veda avaliação em grupo,
   em espelho do art. 4º, parágrafo único da [REF-CFM-1636-2002] para o exame médico
   ([RN-PEC-114]).
4. **Entrevista devolutiva obrigatória quando solicitada** pelo candidato, com apresentação
   objetiva do resultado — obrigação federal (CFP) **replicada expressamente** pela norma estadual
   do DETRAN-AM.
5. **Arquivamento conjunto**: o documento psicológico é arquivado **junto aos protocolos dos testes
   e demais instrumentos utilizados** — o laudo assinado não é, sozinho, o acervo exigido.

Acresce, por força de lei, a **acessibilidade de comunicação em todas as etapas** do processo de
habilitação ao candidato com deficiência auditiva, inclusive intérprete de Libras requerido na
inscrição (CTB art. 147-A) — exigência que incide com força máxima justamente sobre a entrevista.

**Base legal.**

- [REF-CFP-01-2019] art. 2º, § 2º (os três eixos), § 4º (_"desde que com parecer favorável pelo
  Sistema de Avaliação de Testes Psicológicos (Satepsi) do CFP"_), § 9º (_"a entrevista tem caráter
  individual e obrigatório"_), § 20 (_"O resultado deve ser conclusivo e obedecer às normativas
  vigentes do CONTRAN, restringindo-se às informações estritamente necessárias à solicitação,
  preservando a individualidade da(o) candidata(o)"_), § 21 (arquivamento junto aos protocolos),
  § 22 (_"Quando solicitado, fica a(o) psicóloga(o) obrigada(o) a realizar a entrevista devolutiva"_).
- [REF-CFP-01-2019] art. 1º, § 3º: _"A desobediência à presente resolução constitui falta
  ético-disciplinar"_ — a sanção é pessoal do profissional, perante o CRP.
- [REF-DETRANAM-PORTARIA-005-2021] art. 47, § 1º (novo): obrigação da entrevista devolutiva _"nos
  termos do artigo 2º, § 22 da Resolução nº 001/2019-Conselho Federal de Psicologia"_.
- [REF-CONTRAN-927-2022] art. 6º, parágrafo único: remete às resoluções do CFP que instituem normas
  e procedimentos no contexto do trânsito — é o dispositivo que **incorpora** a CFP 01/2019 ao
  regime CONTRAN.
- [REF-CTB-147-148-habilitacao] art. 147-A e § 2º (acessibilidade e Libras).

**Verificação.** Requisitos concretos, todos derivados de dispositivo acima:

1. **Catálogo de instrumentos validado.** O sistema deve registrar **qual teste foi aplicado** e
   permitir apenas instrumentos com parecer favorável SATEPSI vigente — lista que muda no tempo,
   logo é dado de referência versionado, não constante de código.
2. **A entrevista é um evento do encounter**, não um campo do laudo. Hoje o PEC não tem entidade,
   marcação de tempo nem evidência de realização da entrevista individual.
3. **A entrevista devolutiva é um fluxo com dois atores e um gatilho externo** ("quando
   solicitado"): o candidato precisa poder **solicitar** (canal natural: [APP-PORTAL] /
   [UC-PEC-001]) e o psicólogo precisa poder **registrar a realização**. Nenhuma jornada
   ([JRN-PEC-001]) ou UC modela isso — handoff UX já registrado no dossiê.
4. **Arquivamento junto aos protocolos (§ 21)** amplia o objeto de retenção de [RN-PEC-141]: o que
   se guarda não é só o PDF/A assinado, são também os protocolos dos testes. Se os protocolos
   nascem em papel na clínica, existe acervo físico fora do PEC — e o modelo "100% paperless" de
   [RN-PEC-140] não é verdadeiro para a trilha psicológica.
5. **§ 20 é uma regra de minimização anterior à LGPD**: o resultado restringe-se _"às informações
   estritamente necessárias à solicitação"_. Reforça [RN-PEC-152]: ao RENACH vai o **resultado**,
   não o conteúdo clínico.
6. **Acessibilidade** precisa ser coletada no agendamento ([WF-PEC-003]) para poder ser provida no
   atendimento — não há como improvisar intérprete de Libras no balcão.

**Controvérsia/risco.** A CFP 01/2019 é norma de **conselho profissional**: vincula o psicólogo sob
pena ético-disciplinar (art. 1º, § 3º) e é incorporada ao regime CONTRAN pelo art. 6º, parágrafo
único da Res. 927/2022, mas **não é norma de trânsito** e não cria, por si, obrigação para o
sistema do órgão. A leitura de trabalho adotada é que o PEC, sendo o instrumento pelo qual o
psicólogo pratica o ato, **deve ser capaz de suportar o cumprimento** dessas exigências — não
impedi-lo de cumpri-las. É posição de conformidade, não obrigação legal direta ao DETRAN-AM, e está
rotulada como tal. Item 11 de `_intake/legal-assessment.md`.
