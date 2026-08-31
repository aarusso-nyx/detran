---
id: RN-TEAT-136
title: Conteúdo mínimo do AIT de alcoolemia — nove elementos além do art. 280 do CTB
status: draft
apps: [teat]
sources: [REF-CONTRAN-432, REF-CTB-165-277-medidas-alcoolemia]
updated: 2026-08-24
---

**Regra.** Além das exigências gerais ([RN-TEAT-101]), o AIT lavrado em decorrência da infração do
art. 165 do CTB **deverá conter**: (I) havendo encaminhamento a exame de sangue, exame clínico ou
laboratório especializado, **a referência a esse procedimento**; (II) havendo constatação de
sinais, **os sinais do Anexo II ou a referência ao preenchimento do termo específico**; (III)
havendo teste de etilômetro, **marca, modelo e nº de série do aparelho, nº do teste, a medição
realizada, o valor considerado e o limite regulamentado em mg/L**; (IV) conforme o caso, a
**identificação da(s) testemunha(s)**, se houve **fotos, vídeos ou outro meio de prova
complementar**, **se houve recusa do condutor**, entre outras informações disponíveis. São nove
campos estruturados que o `AlcoholTest`/`AlcoholRefusal` do TEAT deve produzir por força de norma,
não por escolha de modelagem.

**Base legal.** [REF-CONTRAN-432] art. 8º:

> "Art. 8º Além das exigências estabelecidas em regulamentação específica, o auto de infração
> lavrado em decorrência da infração prevista no art. 165 do CTB deverá conter: I – no caso de
> encaminhamento do condutor para exame de sangue, exame clínico ou exame em laboratório
> especializado, a referência a esse procedimento; II – no caso do art. 5º, os sinais de alteração
> da capacidade psicomotora de que trata o Anexo II ou a referência ao preenchimento do termo
> específico…; III – no caso de teste de etilômetro, a marca, modelo e nº de série do aparelho, nº
> do teste, a medição realizada, o valor considerado e o limite regulamentado em mg/L; IV –
> conforme o caso, a identificação da(s) testemunha(s), se houve fotos, vídeos ou outro meio de
> prova complementar, se houve recusa do condutor, entre outras informações disponíveis."

**Verificação.** O inciso III é a **confirmação normativa** de [RN-TEAT-133] (medição realizada e
valor considerado como campos distintos) e liga o auto ao instrumento de medição de [RN-TEAT-135]
(marca/modelo/série). O inciso IV confirma a existência legal da **testemunha** como elemento do
auto de alcoolemia — respondendo, para este recorte, o backlog "assinatura de testemunha… entidade
própria no runtime oficial" de `_intake/proposals.md`: no AIT de alcoolemia, a identificação da
testemunha é **campo do auto por exigência normativa**, ainda que a assinatura dela não seja
exigida. A regra vale expressamente para o AIT do **art. 165**; por identidade de razão e por força
do art. 277 §3º, aplica-se também ao AIT do **art. 165-A** naquilo que for compatível (incisos I,
II e IV).

**Controvérsia/risco.** O _caput_ do art. 8º alcança literalmente apenas o AIT do art. 165. A
extensão ao art. 165-A é **interpretação** — necessária, porque nenhuma norma fixa o conteúdo do
auto de recusa, e o auto de recusa é justamente aquele em que o registro do contexto (quem
presenciou, o que foi oferecido, houve mídia) mais importa para a defensabilidade. Registrado em
`_intake/legal-assessment.md`, item 38.
