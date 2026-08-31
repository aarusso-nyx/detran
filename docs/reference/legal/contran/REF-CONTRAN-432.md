---
id: REF-CONTRAN-432
title: Resolução CONTRAN nº 432, de 23/1/2013 — procedimentos de fiscalização de alcoolemia/substância psicoativa (etilômetro)
orgao: CONTRAN
status: vigente (sem indício de revogação localizado; ainda hospedada na página oficial corrente do CONTRAN)
url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolu-o-uo-432-2013c.pdf'
pdf: 'REF-CONTRAN-432-2013.pdf (txt: REF-CONTRAN-432-2013.txt)'
apps: [teat]
sources: [REF-CTB-165-277-medidas-alcoolemia, REF-INMETRO-369-2021]
updated: 2026-08-24
---

# O que este arquivo é

Regulamentação do CTB arts. 165, 276, 277 e 306 (dirigir sob influência de álcool/substância
psicoativa) para aplicação pelas autoridades de trânsito e seus agentes. Fecha o gap de
"procedimento de etilômetro" citado em [APP-TEAT] ("procedimento de etilômetro (teste, recusa,
sinais psicomotores, encaminhamento)") e a base legal, hoje "fonte pendente" em [RN-TEAT-005],
para a diferenciação entre recusa e impossibilidade técnica no teste de alcoolemia. Extraído via
`pdftotext -layout` do PDF oficial.

---

## Art. 3º — Meios de prova (hierarquia e concorrência)

> Art. 3º A confirmação da alteração da capacidade psicomotora em razão da influência de álcool
> ou de outra substância psicoativa que determine dependência dar-se-á por meio de, pelo menos,
> um dos seguintes procedimentos a serem realizados no condutor de veículo automotor: I – exame
> de sangue; II – exames realizados por laboratórios especializados…; III – teste em aparelho
> destinado à medição do teor alcoólico no ar alveolar (etilômetro); IV – verificação dos sinais
> que indiquem a alteração da capacidade psicomotora do condutor.
>
> § 1º Além do disposto nos incisos deste artigo, também poderão ser utilizados prova
> testemunhal, imagem, vídeo ou qualquer outro meio de prova em direito admitido.
>
> § 2º Nos procedimentos de fiscalização deve-se priorizar a utilização do teste com etilômetro.
>
> § 3° Se o condutor apresentar sinais de alteração da capacidade psicomotora na forma do art. 5º
> ou haja comprovação dessa situação por meio do teste de etilômetro e houver encaminhamento do
> condutor para a realização do exame de sangue ou exame clínico, não será necessário aguardar o
> resultado desses exames para fins de autuação administrativa.

**Efeito no TEAT.** O procedimento de etilômetro do TEAT não deve ser o único meio de prova
modelado — o app precisa suportar, como alternativas **não excludentes**, ao menos: teste de
etilômetro (prioritário, §2º), constatação de sinais (art. 5º), e referência a exame de
sangue/laboratorial (cujo resultado **não bloqueia** a autuação, §3º — a autuação administrativa é
imediata, o exame apenas reforça a prova).

## Art. 4º — Requisitos do etilômetro e margem de tolerância

> Art. 4º O etilômetro deve atender aos seguintes requisitos: I – ter seu modelo aprovado pelo
> INMETRO; II – ser aprovado na verificação metrológica inicial, eventual, em serviço e anual
> realizadas pelo Instituto Nacional de Metrologia, Qualidade e Tecnologia - INMETRO ou por órgão
> da Rede Brasileira de Metrologia Legal e Qualidade - RBMLQ;
>
> Parágrafo único. Do resultado do etilômetro (medição realizada) deverá ser descontada margem de
> tolerância, que será o erro máximo admissível, conforme legislação metrológica, de acordo com a
> "Tabela de Valores Referenciais para Etilômetro" constante no Anexo I.

**Efeito no TEAT.** Cadeia normativa completa (CTB art. 276, parágrafo único → este artigo →
[REF-INMETRO-369-2021]): o TEAT precisa registrar **medição realizada** e **valor considerado**
(pós-desconto) como campos distintos — nunca apenas um valor único — e o campo "modelo do
aparelho" precisa ser validável contra a lista de modelos aprovados pelo INMETRO (dado de
homologação de equipamento, análogo em natureza à homologação de dispositivo do TEAT em
[RN-TEAT-003], mas de outro órgão).

## Art. 5º — Sinais de alteração da capacidade psicomotora

> Art. 5º Os sinais de alteração da capacidade psicomotora poderão ser verificados por: I – exame
> clínico com laudo conclusivo e firmado por médico perito; ou II – constatação, pelo agente da
> Autoridade de Trânsito, dos sinais de alteração da capacidade psicomotora nos termos do Anexo
> II.
>
> § 1º Para confirmação da alteração da capacidade psicomotora pelo agente da Autoridade de
> Trânsito, deverá ser considerado não somente um sinal, mas um **conjunto de sinais** que
> comprovem a situação do condutor.
>
> § 2º Os sinais de alteração da capacidade psicomotora de que trata o inciso II deverão ser
> descritos no auto de infração ou em **termo específico** que contenha as informações mínimas
> indicadas no Anexo II, o qual deverá acompanhar o auto de infração.

**Efeito no TEAT — fecha o gap de "sinais psicomotores" de [APP-TEAT].** O §2º exige um **termo
específico anexo ao AIT** (não apenas texto livre no campo observações) com conteúdo mínimo
definido em Anexo próprio — modelo de documento estruturado que o TEAT deveria produzir como
artefato distinto do AIT em si, com vínculo formal (semelhante ao `EvidenceLink` do modelo de
evidências).

## Art. 6º — Caracterização da infração administrativa e recusa

> Art. 6º A infração prevista no art. 165 do CTB será caracterizada por: I – exame de sangue que
> apresente qualquer concentração de álcool por litro de sangue; II – teste de etilômetro com
> medição realizada igual ou superior a 0,05 miligrama de álcool por litro de ar alveolar
> expirado (0,05 mg/L), descontado o erro máximo admissível…; III – sinais de alteração da
> capacidade psicomotora obtidos na forma do art. 5º.
>
> Parágrafo único. Serão aplicadas as penalidades e medidas administrativas previstas no art. 165
> do CTB ao condutor que recusar a se submeter a qualquer um dos procedimentos previstos no art.
> 3º, sem prejuízo da incidência do crime previsto no art. 306 do CTB caso o condutor apresente os
> sinais de alteração da capacidade psicomotora.

**Efeito no TEAT — fecha diretamente o gap de base legal de [RN-TEAT-005] quanto à recusa no
procedimento de etilômetro.** Combinado com CTB art. 165-A e art. 277 §3º (ver
[REF-CTB-165-277-medidas-alcoolemia]), fica clara a arquitetura de três camadas: (1) recusa a
**qualquer** procedimento do art. 3º gera infração autônoma; (2) essa infração é tipificada no
art. 165-A; (3) se além da recusa houver sinais de alteração, pode configurar também o **crime**
do art. 306, tratado à parte pela Polícia Judiciária (art. 7º §2º, abaixo) — três consequências
jurídicas distintas e não excludentes que o TEAT precisa poder registrar simultaneamente.
Ver [RN-TEAT-134].

**Anotação LEGAL (2026-08-24) — remissão desatualizada, com efeito sobre o enquadramento.** O
parágrafo único do art. 6º manda aplicar à recusa _"as penalidades e medidas administrativas
previstas no **art. 165** do CTB"_. Essa redação é de **janeiro de 2013** e é **anterior à Lei nº
13.281, de 2016**, que criou o **art. 165-A** (tipo autônomo de recusa) e deu ao art. 277 §3º a
redação vigente: _"Serão aplicadas as penalidades e medidas administrativas estabelecidas no art.
**165-A** deste Código ao condutor que se recusar a se submeter a qualquer dos procedimentos
previstos no caput deste artigo."_ Prevalece a lei posterior: **o AIT de recusa é lavrado por
art. 165-A, não por art. 165**. A consequência é prática, não apenas formal — o enquadramento
impresso no auto muda. Não foi localizada resolução CONTRAN posterior harmonizando o texto da Res.
432/2013. Registrado em `inf/teat/_intake/legal-assessment.md`, item 36.

## Art. 7º — Crime (fronteira do escopo do TEAT)

> Art. 7º O crime previsto no art. 306 do CTB será caracterizado por qualquer um dos
> procedimentos abaixo: I – exame de sangue… ≥ 6 dg/L; II – teste de etilômetro… ≥ 0,34 mg/L…;
> III – exames laboratoriais…; IV – sinais de alteração da capacidade psicomotora…
>
> § 2º Configurado o crime de que trata este artigo, o condutor e testemunhas, se houver, serão
> encaminhados à Polícia Judiciária, devendo ser acompanhados dos elementos probatórios.

**Efeito no TEAT — fronteira de escopo confirmada.** O TEAT lavra o AIT/medida administrativa
(infração de trânsito), mas quando o valor medido ultrapassa o limiar do crime (0,34 mg/L, dez
vezes o limiar administrativo), o fluxo se bifurca para a Polícia Judiciária, **fora do escopo
TEAT** — mas o TEAT precisa **sinalizar** essa bifurcação (encaminhamento) como evento registrado,
já que "elementos probatórios" devem acompanhar o condutor.

## Art. 8º — Conteúdo mínimo do AIT em caso de alcoolemia

> Art. 8º Além das exigências estabelecidas em regulamentação específica, o auto de infração
> lavrado em decorrência da infração prevista no art. 165 do CTB deverá conter: I – no caso de
> encaminhamento do condutor para exame de sangue, exame clínico ou exame em laboratório
> especializado, a referência a esse procedimento; II – no caso do art. 5º, os sinais de
> alteração da capacidade psicomotora de que trata o Anexo II ou a referência ao preenchimento do
> termo específico…; III – no caso de teste de etilômetro, a marca, modelo e nº de série do
> aparelho, nº do teste, a medição realizada, o valor considerado e o limite regulamentado em
> mg/L; IV – conforme o caso, a identificação da(s) testemunha(s), se houve fotos, vídeos ou
> outro meio de prova complementar, se houve recusa do condutor, entre outras informações
> disponíveis.

**Efeito no TEAT.** É o **conteúdo mínimo estruturado** do AIT de alcoolemia — deveria mapear
diretamente para campos de um `AlcoholTest`/`AlcoholRefusal` do TEAT (já citados em [RN-TEAT-005]
como fontes de corpus de protótipo, RN-ALC-004/010, mas sem base normativa federal citada até
agora): marca/modelo/nº de série do aparelho, nº do teste, medição realizada, valor considerado,
limite regulamentado, testemunha(s), mídia complementar, flag de recusa.

## Art. 9º e 10 — Retenção do veículo e recolhimento do documento de habilitação

> Art. 9° O veículo será retido até a apresentação de condutor habilitado, que também será
> submetido à fiscalização. Parágrafo único. Caso não se apresente condutor habilitado ou o
> agente verifique que ele não está em condições de dirigir, o veículo será recolhido ao depósito…
>
> Art. 10. O documento de habilitação será recolhido pelo agente, mediante recibo, e ficará sob
> custódia do órgão… até que o condutor comprove que não está com a capacidade psicomotora
> alterada… § 1º Caso o condutor não compareça… no prazo de 5 (cinco) dias… o documento será
> encaminhado ao órgão executivo de trânsito responsável pelo seu registro…

**Efeito no TEAT.** Especializa a medida administrativa genérica do CTB art. 165 (retenção +
recolhimento de CNH) com um **prazo próprio de 5 dias** para o condutor reaver o documento antes
de seu encaminhamento ao órgão de registro — timer de negócio hoje não modelado em nenhum
WF-TEAT.

---

# Achados de conferência

Extração via `pdftotext -layout` do PDF oficial (`resolu-o-uo-432-2013c.pdf`, nome de arquivo com
artefato de encoding — conteúdo íntegro). Nenhuma indicação de revogação localizada em busca
dedicada; permanece a referência corrente do CONTRAN nesta matéria. **Risco de vigência residual**:
não foi possível confirmar consolidação pós-2013 (a pesquisa não localizou "Resolução
CONTRAN 966/968" hipotetizada no briefing) — recomenda-se apenas reconfirmação periódica, não
achado de revogação.

# Índice reverso — dispositivo → artefato TEAT

| Dispositivo              | Artefato                                    | Efeito                                                                                                 |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Art. 3º                  | procedimento de etilômetro (TEAT)           | EXTENDE — meios de prova não excludentes, hierarquia de prioridade                                     |
| Art. 4º                  | [REF-INMETRO-369-2021]                      | ancora cadeia CTB→CONTRAN→INMETRO da margem de tolerância                                              |
| Art. 5º §2º              | "sinais psicomotores" ([APP-TEAT])          | GAP fechado — exige termo específico anexo ao AIT                                                      |
| Art. 6º, parágrafo único | [RN-TEAT-005], [RN-TEAT-134]                | GAP fechado — base legal da recusa como fato gerador; **remissão ao art. 165 desatualizada (é 165-A)** |
| Art. 6º, I-III           | [RN-TEAT-133]                               | limiares da infração administrativa; medição realizada × valor considerado                             |
| Art. 9º                  | [RN-TEAT-137]                               | retenção até apresentação de condutor habilitado, **também fiscalizado**                               |
| Art. 10                  | [RN-TEAT-129], [RN-TEAT-137]                | recolhimento do documento **pelo agente**, mediante recibo — conflita com MBFT Seção 8.3               |
| Art. 7º §2º              | fronteira de escopo TEAT/Polícia Judiciária | CONFIRMA — encaminhamento como evento, não como parte do processo administrativo                       |
| Art. 8º                  | `AlcoholTest`/`AlcoholRefusal` (TEAT)       | GAP fechado — conteúdo mínimo estruturado                                                              |
| Art. 10 §1º              | timers de negócio (TEAT)                    | GAP fechado — prazo de 5 dias para reaver CNH                                                          |
