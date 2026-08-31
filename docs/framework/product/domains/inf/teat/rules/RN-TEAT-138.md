---
id: RN-TEAT-138
title: Medidor de velocidade — aprovação de modelo e verificação metrológica são condição de validade do AIT
status: draft
apps: [teat]
sources: [REF-CONTRAN-798-804-equipamentos, REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-08-24
---

**Regra.** Quando a infração é apurada por medidor de velocidade — inclusive no talão eletrônico
**acoplado a equipamento de detecção** ([REF-CONTRAN-918] art. 3º §1º, II) — o equipamento deve
observar requisitos **metrológicos** cumulativos: (a) **ter modelo aprovado pelo INMETRO**,
atendendo à legislação metrológica e aos requisitos da Res. 798/2020; (b) **ser aprovado em
verificação metrológica inicial** pelo INMETRO ou entidade delegada; e (c) **ser aprovado em
verificação metrológica periódica**, de acordo com a regulamentação técnica metrológica vigente.
As aprovações das alíneas (b) e (c) **podem ser substituídas por procedimento previsto em
regulamentação metrológica vigente**. Requisitos **técnicos** do equipamento: registrar a
velocidade medida em km/h, a contagem volumétrica de tráfego, a latitude e longitude do local de
operação, e possuir **tecnologia de OCR**. A velocidade **considerada** para aplicação da
penalidade é o resultado da **subtração da velocidade medida pelo erro máximo admitido** na
legislação metrológica.

**Base legal.**

- [REF-CONTRAN-798-804-equipamentos] — Res. CONTRAN 798/2020 art. 4º, com a redação dada pela Res.
  CONTRAN 804/2020, art. 2º:
  > "Art. 4º Os medidores de velocidade devem observar: I - requisitos metrológicos: a) ter seu
  > modelo aprovado pelo Instituto Nacional de Metrologia, Qualidade e Tecnologia (Inmetro),
  > atendendo à legislação metrológica em vigor e aos requisitos estabelecidos nesta Resolução;
  > b) ser aprovado em verificação metrológica inicial pelo Inmetro ou entidade por ele delegada; e
  > c) ser aprovado pelo Inmetro ou entidade por ele delegada, em verificação metrológica
  > periódica, de acordo com a regulamentação técnica metrológica vigente; […] Parágrafo único. As
  > aprovações previstas nas alíneas b e c do inciso I poderão ser substituídas por procedimento
  > previsto em regulamentação metrológica vigente." (NR — Res. 804/2020)
  >
  > "II - requisitos técnicos: a) registrar a velocidade medida do veículo em km/h; b) registrar a
  > contagem volumétrica de tráfego; c) registrar a latitude e longitude do local de operação; e
  > d) possuir tecnologia de Reconhecimento Óptico de Caracteres (OCR)."
  >
  > "Art. 8º Para caracterização de infrações de trânsito de excesso de velocidade, a velocidade
  > considerada para aplicação da penalidade é o resultado da subtração da velocidade medida pelo
  > instrumento ou equipamento pelo erro máximo admitido previsto na legislação metrológica em
  > vigor, conforme tabela de valores referenciais de velocidade e tabela para enquadramento
  > infracional constantes do ANEXO III."
- [REF-CTB-280-290] art. 280 §2º (o meio tecnológico deve ser _"previamente regulamentado pelo
  CONTRAN"_).

**Verificação.** Mesma arquitetura de [RN-TEAT-135] (etilômetro), com instrumento diferente: o
cadastro de instrumentos precisa cobrir **medidores de velocidade** com `registro_inmetro`,
`numero_de_serie`, `identificacao_do_orgao` e `data_ultima_verificacao_metrologica`. A **velocidade
considerada** é calculada pelo sistema a partir da tabela do Anexo III versionada no pacote
normativo ([WF-TEAT-003]) — nunca digitada. Note-se o paralelo estrutural com a alcoolemia: em
ambos, **valor medido ≠ valor considerado** ([RN-TEAT-133]), e em ambos o enquadramento deriva do
segundo.

**Controvérsia/risco.** A redação original da Res. 798/2020 fixava periodicidade **mínima de doze
meses** para a verificação (art. 4º, I, "c"); a Res. 804/2020 **substituiu** essa redação por
remissão genérica à "regulamentação técnica metrológica vigente" e ainda admitiu **substituição**
das aprovações por procedimento metrológico. Ou seja: **a periodicidade deixou de estar na
resolução do CONTRAN** e passou a depender do RTM aplicável a cada tipo de medidor. Citar "12
meses" como exigência da Res. 798/2020 é, hoje, **citação de redação revogada**. Item 39 de
`_intake/legal-assessment.md`.
