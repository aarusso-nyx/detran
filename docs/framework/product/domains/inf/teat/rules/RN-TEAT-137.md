---
id: RN-TEAT-137
title: Alcoolemia — retenção do veículo, custódia do documento por 5 dias e encaminhamento à Polícia Judiciária
status: draft
apps: [teat]
sources: [REF-CONTRAN-432, REF-CTB-165-277-medidas-alcoolemia]
updated: 2026-08-24
---

**Regra.** Caracterizada a infração do art. 165 ou do art. 165-A:

1. **O veículo será retido até a apresentação de condutor habilitado**, que **também será submetido
   à fiscalização**. Não se apresentando condutor habilitado, ou verificando o agente que ele não
   está em condições de dirigir, **o veículo será recolhido ao depósito** ([RN-TEAT-125]).
2. **O documento de habilitação será recolhido pelo agente, mediante recibo**, e ficará sob
   custódia do órgão até que o condutor comprove que não está com a capacidade psicomotora
   alterada. **Não comparecendo no prazo de 5 (cinco) dias**, o documento é encaminhado ao órgão
   executivo de trânsito responsável pelo seu registro ([RN-TEAT-129]).
3. **Configurado o crime do art. 306 do CTB** ([RN-TEAT-133]), **o condutor e as testemunhas, se
   houver, serão encaminhados à Polícia Judiciária, acompanhados dos elementos probatórios** — a
   persecução criminal está **fora do escopo do TEAT**, mas o **encaminhamento é evento a
   registrar**, com identificação dos elementos probatórios entregues.

**Base legal.**

- [REF-CONTRAN-432] art. 9º: _"O veículo será retido até a apresentação de condutor habilitado, que
  também será submetido à fiscalização. Parágrafo único. Caso não se apresente condutor habilitado
  ou o agente verifique que ele não está em condições de dirigir, o veículo será recolhido ao
  depósito…"_
- [REF-CONTRAN-432] art. 10 e §1º: _"O documento de habilitação será recolhido pelo agente, mediante
  recibo, e ficará sob custódia do órgão… até que o condutor comprove que não está com a capacidade
  psicomotora alterada… § 1º Caso o condutor não compareça… no prazo de 5 (cinco) dias… o documento
  será encaminhado ao órgão executivo de trânsito responsável pelo seu registro…"_
- [REF-CONTRAN-432] art. 7º §2º: _"Configurado o crime de que trata este artigo, o condutor e
  testemunhas, se houver, serão encaminhados à Polícia Judiciária, devendo ser acompanhados dos
  elementos probatórios."_
- [REF-CTB-165-277-medidas-alcoolemia] arts. 165 e 165-A (medidas administrativas vinculadas ao
  tipo) e art. 270 §4º (não se apresentando condutor habilitado, remoção a depósito).

**Verificação.** As medidas dos arts. 165/165-A são **vinculadas ao tipo**, não discricionárias:
todo AIT por esses enquadramentos deve produzir **duas** medidas administrativas (retenção do
veículo + recolhimento do documento), salvo impossibilidade registrada ([RN-TEAT-005],
[RN-TEAT-123]). O art. 9º acrescenta uma regra ausente do modelo atual: **o condutor substituto
também é fiscalizado** — ou seja, o fluxo pode gerar **um segundo procedimento de alcoolemia**
sobre outra pessoa, dentro da mesma ocorrência. O prazo de **5 dias** do art. 10 §1º é timer de
negócio hoje não modelado em nenhum WF-TEAT. O encaminhamento criminal é um `CustodyEvent` de
transferência de elementos probatórios ([RN-TEAT-002]) — o pacote probatório sai do domínio do
órgão e a cadeia precisa registrar a entrega.

**Controvérsia/risco.** Ver [RN-TEAT-129]: o art. 10 da Res. 432/2013 atribui expressamente ao
**agente** o recolhimento do documento, enquanto o MBFT Seção 8.3 diz que o agente **somente**
recolhe no flagrante do art. 162, II. O conflito incide integralmente aqui e é o ponto de maior
exposição prática do procedimento de alcoolemia. Item 32 de `_intake/legal-assessment.md`.
