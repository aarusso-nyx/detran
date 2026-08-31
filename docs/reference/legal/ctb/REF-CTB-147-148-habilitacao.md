---
id: REF-CTB-147-148-habilitacao
title: CTB arts. 147, 147-A, 148, 148-A e 340-A §7º — exames de habilitação, periodicidade do exame de aptidão física e mental, credenciamento e exame toxicológico, verbatim
orgao: Presidência da República (Lei 9.503/1997, texto compilado)
status: 'vigente — texto compilado conferido contra `refs/ctb/planalto_plain.txt` (captura local do planalto.gov.br); inclui as redações das Leis 14.071/2020, 14.440/2022, 14.599/2023 e **15.428/2026**'
url: 'https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm'
pdf: refs/ctb/REF-CTB-L9503-planalto.html (texto extraído em refs/ctb/planalto_plain.txt)
apps: [pec]
sources: []
updated: 2026-08-24
---

# O que este arquivo é

**Captura de lacuna aberta pela rodada LEGAL do PEC.** A rodada CRAWLER capturou as resoluções
CONTRAN que _regulamentam_ os exames de habilitação ([REF-CONTRAN-927-2022],
[REF-CONTRAN-789-2020], [REF-CONTRAN-923-1009-toxicologico]) mas **não a lei que as fundamenta**.
A ausência não era neutra: a conferência dos dispositivos legais contra as resoluções revelou um
**conflito vertical de norma** que o dossiê de pesquisa não detectou e que teria propagado um
prazo desatualizado para dentro do corpus PEC — a periodicidade do exame de aptidão física e
mental (§ 2º do art. 147, ver anotação abaixo).

Escopo do excerto: apenas os dispositivos do Capítulo XIV ("Da Habilitação") que ancoram regra de
negócio do PEC, mais o art. 340-A § 7º (RNPC) pela sua consequência direta sobre a permanência do
exame médico. O restante do Capítulo XIV (formação de condutores, CFC, aprendizagem, categorias)
está fora do escopo declarado de [APP-PEC].

## Excertos úteis

### Art. 147 — exames de habilitação, ordem, titulação do perito e registro no RENACH

> Art. 147. O candidato à habilitação deverá submeter-se a exames realizados pelo órgão executivo
> de trânsito, **na ordem descrita a seguir**, e os exames de aptidão física e mental e a
> avaliação psicológica deverão ser realizados por **médicos e psicólogos peritos examinadores**,
> respectivamente, **com titulação de especialista em medicina do tráfego e em psicologia do
> trânsito**, conferida pelo respectivo conselho profissional, conforme regulamentação do Contran:
> _(Redação dada pela Lei nº 14.071, de 2020)_
>
> I - de aptidão física e mental;
> II - (VETADO)
> III - escrito, sobre legislação de trânsito;
> IV - de noções de primeiros socorros, conforme regulamentação do CONTRAN;
> V - de direção veicular, realizado na via pública, em veículo da categoria para a qual estiver
> habilitando-se.
>
> § 1º **Os resultados dos exames e a identificação dos respectivos examinadores serão registrados
> no RENACH.** _(Renumerado do parágrafo único, pela Lei nº 9.602, de 1998)_

**Anotação (fecha o "(fonte pendente)" mais persistente do corpus PEC).** O § 1º é a **base legal
da própria existência da integração PEC→RENACH**, que [RN-PEC-008] declarava "(fonte pendente) —
requisito de integração/SLA interno do PEC". A obrigação de registrar resultado **e** identificação
do examinador é legal, não contratual; o que continua sem base normativa é apenas o **SLA de 15
minutos** (esse sim, decisão de engenharia). Note-se também que a lei manda registrar o
**examinador**, o que sustenta a persistência de `signer_name`/`signer_council` de [RN-PEC-002] como
exigência legal e não apenas como evidência de assinatura. Aplica-se a: [RN-PEC-008], [RN-PEC-002],
[RN-PEC-101].

### Art. 147, § 2º — periodicidade do exame de aptidão física e mental (**conflito vertical**)

> § 2º O exame de aptidão física e mental, a ser realizado **no local de residência ou domicílio do
> examinado**, será preliminar e renovável com a seguinte periodicidade: _(Redação dada pela Lei nº
> 14.071, de 2020)_
>
> I - **a cada 10 (dez) anos**, para condutores com idade **inferior a 50 (cinquenta) anos**;
> II - **a cada 5 (cinco) anos**, para condutores com idade **igual ou superior a 50 e inferior a
> 70 anos**;
> III - **a cada 3 (três) anos**, para condutores com idade **igual ou superior a 70 anos**.
>
> § 4º Quando houver indícios de deficiência física ou mental, ou de progressividade de doença que
> possa diminuir a capacidade para conduzir o veículo, **os prazos previstos nos incisos I, II e III
> do § 2º deste artigo poderão ser diminuídos por proposta do perito examinador.** _(Redação dada
> pela Lei nº 14.071, de 2020)_

**Anotação (CONTRADICT de vigência — achado próprio da rodada LEGAL, não presente no dossiê).**
[REF-CONTRAN-789-2020] art. 4º ainda diz _"renovável a cada cinco anos, ou a cada três anos para
condutores com mais de sessenta e cinco anos"_ — **esse texto está superado**. A Res. 789/2020 foi
publicada em **24/06/2020**; a Lei 14.071/2020 é de **13/10/2020** e entrou em vigor em
**12/04/2021** (cláusula de vigência diferida). A resolução reproduzia o texto do art. 147 § 2º
_anterior_, e **não foi atualizada** desde então. Prevalece a lei.

Três consequências, todas materiais:

1. A faixa etária de corte mudou de **65** para **70** anos, e surgiu uma faixa intermediária
   (50-70) inexistente no texto da resolução.
2. O prazo-regra para o condutor mais jovem **dobrou** — de 5 para **10 anos**.
3. Qualquer regra, tela ou cálculo de vencimento que o PEC derive da Res. 789/2020 art. 4º
   produzirá **renovações indevidamente antecipadas** para a maioria da população de condutores.

O dossiê de pesquisa (`ch/pec/_intake/research-dossier.md` §4, WF-PEC-001) recomendava, como
EXTEND, acrescentar à tabela de prazos de [WF-PEC-001] a linha _"validade do exame médico (5 anos
/ 3 para >65a — Res. 789/2020 art. 4º)"_. **Essa recomendação não deve ser executada como está** —
ver [RN-PEC-102]. Aplica-se a: [WF-PEC-001], [RN-PEC-102] — **correção obrigatória**.

### Art. 147, § 3º e § 5º — quando a avaliação psicológica é exigida

> § 3º O exame previsto no § 2º **incluirá avaliação psicológica preliminar e complementar sempre
> que a ele se submeter o condutor que exerce atividade remunerada ao veículo**, incluindo-se esta
> avaliação para os demais candidatos **apenas no exame referente à primeira habilitação**.
> _(Redação dada pela Lei nº 10.350, de 2001)_
>
> § 5º O condutor que exerce atividade remunerada ao veículo terá essa informação incluída na sua
> Carteira Nacional de Habilitação, conforme especificações do Contran.
>
> § 6º (Revogado pela Lei nº 15.428, de 2026)
> § 7º (Revogado pela Lei nº 15.428, de 2026)

**Anotação.** O § 3º é a base legal do art. 5º, § 2º de [REF-CONTRAN-789-2020] e explica por que
nem todo `encounter` do PEC tem duas trilhas clínicas: na **renovação** de condutor não remunerado
a avaliação psicológica **não é exigida**. O modelo do PEC já admite isso (`exams_medical` e
`exams_psych` são ambos opcionais até o fechamento), mas [RN-PEC-006] exige, no gate de
encerramento, que **os dois** exames tenham sido realizados — o que é incompatível com o § 3º nesse
cenário. Ver [RN-PEC-103] e a auditoria de [RN-PEC-006]. Aplica-se a: [RN-PEC-006], [RN-PEC-103].

### Art. 147-A — acessibilidade para candidato com deficiência auditiva

> Art. 147-A. Ao candidato com deficiência auditiva é assegurada **acessibilidade de comunicação**,
> mediante emprego de tecnologias assistivas ou de ajudas técnicas **em todas as etapas do processo
> de habilitação**. _(Incluído pela Lei nº 13.146, de 2015)_
>
> § 2º É assegurado também ao candidato com deficiência auditiva **requerer, no ato de sua
> inscrição, os serviços de intérprete da Libras**, para acompanhamento em aulas práticas e
> teóricas.

**Anotação (gap de produto não registrado em nenhum artefato PEC).** "Todas as etapas do processo
de habilitação" alcança o exame de aptidão física e mental e a avaliação psicológica — que são,
por definição, etapas de **comunicação intensiva** (anamnese, entrevista individual obrigatória da
[REF-CFP-01-2019] § 9º, entrevista devolutiva do § 22). Nenhuma jornada, UC ou RN do PEC menciona
acessibilidade ou necessidade de intérprete; o agendamento ([WF-PEC-003]) não coleta essa
necessidade. É uma obrigação legal direta, não uma boa prática. Aplica-se a: [WF-PEC-003],
[RN-PEC-104] — handoff a UX.

### Art. 148 — credenciamento de entidades; titulação e preço público (novidades de 2026)

> Art. 148. Os exames de habilitação, **exceto os de direção veicular, poderão ser aplicados por
> entidades públicas ou privadas credenciadas pelo órgão executivo de trânsito dos Estados** e do
> Distrito Federal, de acordo com as normas estabelecidas pelo CONTRAN.
>
> § 6º Os exames de aptidão física e mental e a avaliação psicológica serão realizados,
> respectivamente, por médicos e psicólogos peritos examinadores, **autorizados pelo órgão máximo
> executivo de trânsito da União**, com titulação de especialista em medicina do tráfego e em
> psicologia do trânsito conferida pelo respectivo conselho profissional, nos termos de regulação
> do Contran. _(Incluído pela Lei nº 15.428, de 2026)_
>
> § 7º Os valores correspondentes à realização dos exames de aptidão física e mental e da avaliação
> psicológica observarão **preço público fixado pelo órgão máximo executivo de trânsito da União**,
> conforme regulamentação do Contran, e serão atualizados anualmente pelo **IPCA** ou por outro
> índice oficial que venha a substituí-lo. _(Incluído pela Lei nº 15.428, de 2026)_

**Anotação (achado de 2026 com impacto direto no módulo de faturamento do PEC).** O § 7º é
**novo** e nenhum artefato do corpus o reflete: [APP-PEC] §Escopo/Dentro inclui _"faturamento do
atendimento"_, e a partir da Lei 15.428/2026 esse faturamento **não é preço livre da clínica** —
é **preço público de fixação federal**, com indexação anual pelo IPCA. Um módulo de faturamento
que trate o valor do exame como parâmetro da clínica ou do estado está estruturalmente errado.
O § 6º, por sua vez, **eleva à lei** a exigência de titulação de especialista que até então vinha
de resolução ([REF-CONTRAN-927-2022] art. 19) — o que torna a carência do art. 19 § 1º (válida até
12/04/2024, já expirada) definitivamente insustentável. Aplica-se a: [RN-PEC-115], (faturamento —
sem RN dedicado hoje).

### Art. 148-A — exame toxicológico: base legal de nível LEI

> Art. 148-A. Os condutores das **categorias C, D e E** deverão comprovar **resultado negativo em
> exame toxicológico** para a obtenção e a renovação da CNH. _(Redação dada pela Lei nº 14.071, de 2020)_
>
> § 1º O exame [...] deverá ter **janela de detecção mínima de 90 (noventa) dias**, nos termos das
> normas do Contran.
>
> § 2º Além da realização do exame previsto no _caput_, os condutores das categorias C, D e E **com
> idade inferior a 70 anos serão submetidos a novo exame a cada período de 2 (dois) anos e 6 (seis)
> meses**, a partir da obtenção ou renovação da CNH, **independentemente da validade dos demais
> exames** de que trata o inciso I do _caput_ do art. 147. _(Redação dada pela Lei nº 14.071, de 2020)_
>
> § 4º **É garantido o direito de contraprova e de recurso administrativo, sem efeito suspensivo**,
> no caso de resultado positivo para os exames de que trata este artigo, nos termos das normas do
> Contran.
>
> § 5º O resultado positivo no exame previsto no § 2º deste artigo acarretará ao condutor: [...]
> II - a **suspensão do direito de dirigir pelo período de 3 (três) meses**, condicionado o
> levantamento da suspensão à inclusão no Renach de resultado negativo em novo exame, **vedada a
> aplicação de outras penalidades, ainda que acessórias**. _(Incluído pela Lei nº 14.599, de 2023)_
>
> § 6º **O resultado do exame somente será divulgado para o interessado e não poderá ser utilizado
> para fins estranhos ao disposto neste artigo** ou no § 6º do art. 168 da CLT. _(Incluído pela Lei
> nº 13.103, de 2015)_
>
> § 7º O exame será realizado, **em regime de livre concorrência**, pelos laboratórios credenciados
> pelo órgão máximo executivo de trânsito da União [...], **vedado aos entes públicos**: I - fixar
> preços para os exames; II - limitar o número de empresas ou o número de locais em que a atividade
> pode ser exercida [...]. _(Redação dada pela Lei nº 14.440, de 2022)_

**Anotação (três achados).**

1. **A norma-base do toxicológico é de nível LEI** — o _caput_ e o § 1º do art. 148-A, não apenas
   a Res. CONTRAN 923/2022 e muito menos a Res. 1.009/2024. A correção de citação identificada pelo
   dossiê ([RN-PEC-007] cita a 1.009/2024) deve ir um degrau acima: **CTB art. 148-A + Res.
   923/2022**. Ver [RN-PEC-120].
2. **O § 6º é uma regra de sigilo mais estrita que a LGPD geral** — vinculação de finalidade
   _expressa em lei especial_, com destinatário único ("somente [...] o interessado"). Tem
   consequência de arquitetura para o PEC: o sistema precisa do **fato** "existe resultado negativo
   válido" para liberar o gate de [RN-PEC-007]; **não** precisa — e não deve — armazenar o laudo
   toxicológico detalhado nem as substâncias detectadas. Ver [RN-PEC-122].
3. **O § 7º contrasta deliberadamente com o art. 3º da [REF-CFM-1636-2002]**: para o **laboratório
   toxicológico** o legislador escolheu **livre concorrência e escolha do condutor**, vedando
   expressamente ao ente público limitar locais; para o **exame clínico de aptidão** não existe
   dispositivo equivalente, e a norma do conselho profissional impõe distribuição imparcial pelo
   DETRAN. A assimetria é textual e é o argumento mais forte contra a tese de que a livre escolha
   de clínica seria a regra geral do sistema. Ver [RN-PEC-113].

### Art. 340-A, § 7º — RNPC e a permanência do exame médico

> § 7º O condutor que, ao término do período de validade da CNH ou da ACC, estiver cadastrado no
> RNPC terá sua habilitação **renovada automaticamente** e ficará **dispensado dos procedimentos
> previstos no art. 147 deste Código, com exceção dos exames de aptidão física e mental**.
> _(Redação dada pela Lei nº 15.428, de 2026)_

**Anotação.** Confirma, por exclusão expressa, que o exame de aptidão física e mental é o
**procedimento irredutível** da renovação: mesmo o condutor com registro positivo, dispensado de
tudo o mais, continua obrigado a fazê-lo. É a confirmação legal mais forte da permanência do
objeto de negócio do PEC. Aplica-se a: [APP-PEC], [RN-PEC-101].

## Índice reverso (dispositivo → RN/WF)

| Dispositivo                                                     | RN/WF                                                     |
| --------------------------------------------------------------- | --------------------------------------------------------- |
| art. 147, _caput_ e I (obrigatoriedade, titulação do perito)    | [RN-PEC-101], [RN-PEC-115]                                |
| art. 147, § 1º (registro de resultado e examinador no RENACH)   | [RN-PEC-008], [RN-PEC-101]                                |
| art. 147, § 2º, I-III (periodicidade 10/5/3 anos)               | [RN-PEC-102] — **corrige [REF-CONTRAN-789-2020] art. 4º** |
| art. 147, § 4º (redução de prazo pelo perito)                   | [RN-PEC-102]                                              |
| art. 147, § 3º (quando a avaliação psicológica é exigida)       | [RN-PEC-103], auditoria de [RN-PEC-006]                   |
| art. 147-A (acessibilidade / Libras)                            | [RN-PEC-104], [WF-PEC-003] — handoff UX                   |
| art. 148 (credenciamento de entidades)                          | [RN-PEC-115]                                              |
| art. 148, § 6º (titulação de especialista — nível lei, 2026)    | [RN-PEC-115]                                              |
| art. 148, § 7º (preço público federal + IPCA — 2026)            | (faturamento — gap sem RN)                                |
| art. 148-A, _caput_ e § 1º (toxicológico C/D/E, janela 90 dias) | [RN-PEC-120]                                              |
| art. 148-A, § 2º (exame periódico a cada 2a6m)                  | [RN-PEC-121]                                              |
| art. 148-A, §§ 4º-5º (contraprova, recurso, suspensão 3 meses)  | [RN-PEC-121], [RN-PEC-122]                                |
| art. 148-A, § 6º (sigilo reforçado do resultado)                | [RN-PEC-122]                                              |
| art. 148-A, § 7º (livre concorrência dos laboratórios)          | [RN-PEC-113] (contraste), [RN-PEC-120]                    |
| art. 340-A, § 7º (RNPC não dispensa o exame médico)             | [APP-PEC], [RN-PEC-101]                                   |
