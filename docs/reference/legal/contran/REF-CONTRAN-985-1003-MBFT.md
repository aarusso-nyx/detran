---
id: REF-CONTRAN-985-1003-MBFT
title: Resolução CONTRAN nº 985/2022 (altera. 1.003/2023) — Manual Brasileiro de Fiscalização de Trânsito (MBFT), Parte Geral
orgao: 'CONTRAN (Res. 985: DOU 26/12/2022, ed. 242-B; Res. 1.003: DOU 26/12/2023, ed. 244-B — altera o Anexo)'
status: vigente (985/2022 em vigor desde 02/01/2023, revoga a Res. CONTRAN 925/2022; 1.003/2023 altera o Anexo, em vigor desde 02/01/2024)
url: 'Res. 985: https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9852022.pdf ; Anexo (MBFT): https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/mbvt20222.pdf ; Res. 1.003: https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao10032023.pdf'
pdf: REF-CONTRAN-985-2022.pdf, REF-CONTRAN-1003-2023.pdf, REF-CONTRAN-985-2022-MBFT-ANEXO.pdf (txt correspondente)
apps: [teat]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-08-24
---

# O que este arquivo é

O **Manual Brasileiro de Fiscalização de Trânsito (MBFT)** é o segundo grande achado desta
rodada: é literalmente o manual operacional nacional que padroniza a atuação do agente de
trânsito na lavratura do AIT — exatamente o tipo de fonte que os gaps de `_intake/proposals.md`
buscavam ("requisitos legais específicos do talão eletrônico… fé pública do agente…"). Aprovado
pela Res. CONTRAN 985/2022 (Anexo hospedado separadamente, ~17MB, 20 páginas de "Parte Geral" +
extenso catálogo de fichas de fiscalização por infração), com o Anexo alterado pela Res.
1.003/2023. Este REF cobre a **Parte Geral** (seções 1 a 11, antes do catálogo de fichas por
artigo do CTB), que é a parte de doutrina/procedimento — as fichas individuais de enquadramento
não foram transcritas (catálogo extenso, de baixo valor de citação direta; permanecem disponíveis
no PDF baixado para consulta pontual por código de infração).

**Nota de vigência.** O arquivo `mbvt20222.pdf` baixado nesta rodada está hospedado sob URL de
nome "20222" (sugerindo publicação original de 2022); não há confirmação de que reflita as
alterações da Res. 1.003/2023 (que altera o Anexo com vigência desde 02/01/2024). Recomenda-se
reconferência humana pontual caso qualquer fato dependa criticamente do texto pós-1.003/2023 —
o conteúdo abaixo, por tratar da Parte Geral (doutrina/procedimento, não das fichas específicas
por infração, que são o alvo mais provável de alteração pela 1.003/2023), tem risco de
desatualização considerado **baixo**.

---

## Seção 3 — Introdução (propósito do Manual)

> A fiscalização de trânsito… é uma ferramenta de suma importância na busca de convivência
> pacífica entre usuários das vias… o presente Manual tem como objetivos uniformizar
> procedimentos e orientar a autoridade de trânsito e seus agentes nas ações de fiscalização.

## Seção 4 — Agente da autoridade de trânsito (base da fé pública/competência)

> O agente da autoridade de trânsito, competente para realizar a fiscalização, deve se enquadrar
> em uma das seguintes categorias, com atuação isolada ou cumulativa, não bastando mera
> designação mediante portaria ou outro ato administrativo:
>
> I - agentes de trânsito dos órgãos ou entidades executivos de trânsito ou rodoviário; II -
> policiais rodoviários federais; III - policiais militares do serviço ativo, quando firmado
> convênio para esta finalidade, de acordo com o inciso III do art. 23 do CTB; IV - guardas
> municipais, na conformidade do inciso VI do art. 5º da Lei nº 13.022, de 8 de agosto de 2014; e
> V - agentes dos órgãos policiais da Câmara dos Deputados e do Senado Federal, quando firmado
> convênio com o órgão ou entidade de trânsito com circunscrição sobre a via, de acordo com o
> art. 25-A do CTB.
>
> Para que possa exercer suas atribuições, o agente da autoridade de trânsito deverá estar
> devidamente uniformizado, conforme padrão da instituição, e no regular exercício de suas
> funções.
>
> Todo veículo utilizado na fiscalização de trânsito deverá estar caracterizado na forma definida
> pelo órgão ou entidade.
>
> O agente da autoridade de trânsito, ao constatar o cometimento da infração, lavrará o
> respectivo auto e adotará as medidas administrativas e penais cabíveis, conforme previsão legal
> correspondente à conduta infracional.

**Efeito no TEAT — fecha, em parte, o gap de "fé pública do agente".** O Manual não usa a
expressão "fé pública", mas define, de forma **taxativa** (rol fechado, "não bastando mera
designação"), quem pode legalmente lavrar um AIT: agente de trânsito do próprio órgão, PRF, PM
mediante convênio, guarda municipal (Lei 13.022/2014) ou agentes da Câmara/Senado mediante
convênio. **Isso é a base normativa direta que faltava para `field-agent` em [APP-TEAT]**: hoje o
RBAC do TEAT trata `field-agent` como papel único; a norma revela que, na prática do DETRAN-AM,
esse papel pode ser ocupado por servidores do próprio órgão **ou** por policiais militares do
BPTRAN mediante convênio (confirmado localmente — ver `refs/detran-am/`). O requisito de
**uniformização** e **caracterização do veículo** é também um pré-requisito de legitimidade da
autuação, hoje não modelado como validação em nenhum RN-TEAT.

## Seção 7 — Autuação (doutrina de lavratura)

> A autuação é ato administrativo, vinculado na forma da lei, da autoridade de trânsito ou seus
> agentes quando da constatação do cometimento de infração de trânsito, devendo ser formalizado
> por meio da lavratura do Auto de Infração de Trânsito (AIT).
>
> Para fins do contido no § 3º do art. 280 e no § 6º-A do art. 282, ambos do CTB, considera-se em
> flagrante quem está cometendo a infração de trânsito ou acaba de cometê-la, com ou sem
> abordagem.
>
> […] Quando a configuração de uma infração depender da existência de sinalização específica,
> esta deverá revelar-se suficiente e corretamente implantada de forma legível e visível. Caso
> contrário, o agente não deverá lavrar o AIT…
>
> É vedada a lavratura do AIT por solicitação de terceiros, excetuando-se o caso em que o órgão
> ou entidade de trânsito realiza operação de fiscalização de trânsito, em que um agente de
> trânsito constate a infração e a informe a outro agente que esteja na operação, devendo tal
> informação constar do campo observações do AIT.
>
> O agente da autoridade só poderá registrar uma infração por auto e, no caso da constatação de
> infrações simultâneas em que os códigos infracionais possuam a mesma raiz (os três primeiros
> dígitos), considerar-se-á apenas uma infração.
>
> Será lavrado somente um AIT quando o veículo estiver estacionado irregularmente e não for
> aplicada a medida administrativa de remoção, independentemente do tempo em que permaneça no
> local, desde que não seja movimentado nesse período.

**Efeito no TEAT — gap fechado: definição legal de "flagrante" para fiscalização eletrônica.**
Isto responde diretamente ao gap registrado em [REF-CTB-280-290] sobre o art. 282 §6º-A
("regulamentação do CONTRAN sobre o termo inicial da decadência nas autuações que não sejam em
flagrante… não localizada — afeta a maior parte do acervo de fiscalização eletrônica"): o MBFT
**define** "em flagrante" como "está cometendo… ou acaba de cometê-la, **com ou sem abordagem**".
Isso não resolve completamente o gap (ainda não há um procedimento explícito para contar o "termo
inicial… da data do conhecimento da infração" quando não há flagrante), mas **fixa o critério de
enquadramento** que decide se uma autuação é ou não "em flagrante" — pré-requisito lógico para
aplicar a regra do art. 282 §6º-A. **Recomenda-se atualizar a anotação de risco em
[REF-CTB-280-290], art. 282, com esta referência.**

A regra "um AIT = uma infração; mesma raiz de código = uma só infração; infrações concorrentes
→ um único AIT; infrações concomitantes → um AIT por infração" é **doutrina operacional direta
para o `NormativeCatalog`/`Framing`** do TEAT — hoje não modelada como regra de consolidação de
enquadramentos. É candidata a nova RN-TEAT.

## Seção 7 (cont.) — Campo Observações e integridade formal do auto _(acrescentado na revisão LEGAL de 2026-08-24)_

> O campo de Observações do AIT:
>
> a) poderá ser preenchido, consignando informações com o objetivo de especificar a conduta
> constatada e/ou adicionar outras informações relevantes, conforme exemplos constantes nas fichas
> de fiscalização;
>
> b) deverá ser preenchido, de forma obrigatória, nas infrações cuja ficha de fiscalização preveja
> de forma expressa, que é necessária alguma informação para caracterizar a infração, a exemplo do
> art. 169 do CTB (dirigir sem atenção e sem os cuidados indispensáveis à segurança).
>
> As informações referentes à caracterização da infração devem constar em todas as vias do AIT.
>
> O AIT, quando lavrado em suporte físico, não poderá conter rasuras, emendas, uso de corretivos,
> ou qualquer tipo de adulteração.

**Efeito no TEAT.** A alínea b) confirma e ancora o atributo `Framing.requires_observation` de
[APP-TEAT] como **dado normativo do MBFT**, não parametrização local do órgão. "Todas as vias"
projeta-se sobre o modelo de documento impresso ([RN-TEAT-116]). A vedação de rasura é literal para
suporte físico; o equivalente funcional no meio eletrônico é a imutabilidade pós-lavratura da
[REF-SENATRAN-997] art. 3º, V. Aplica-se a: [RN-TEAT-109].

## Seção 7 (cont.) — Catálogo de "constatação sem/com abordagem"

> O agente da autoridade de trânsito, sempre que possível, deverá abordar o condutor do veículo
> para constatar a infração, ressalvados os casos em que a infração poderá ser comprovada sem a
> abordagem. Para esse fim, o Manual estabelece as seguintes situações:
>
> ● Caso 1: "possível sem abordagem" - significa que a infração pode ser constatada sem a
> abordagem do condutor, sendo desnecessária a justificativa no AIT quanto ao motivo de não ter
> sido abordado.
>
> ● Caso 2: "mediante abordagem" – significa que a infração só pode ser constatada se houver a
> abordagem do condutor.
>
> ● Caso 3: "vide procedimentos" – significa que há situações em que só é possível constatar a
> infração mediante abordagem, porém há outras situações em que é possível constatá-la sem
> abordagem.

**Efeito no TEAT — fecha diretamente o gap registrado em `_intake/proposals.md`**: "catálogo
fechado de valores de `no_approach_reason` (motivos aceitos de constatação sem abordagem) — hoje
campo de texto livre." O Manual não fornece um catálogo de **motivos** de texto livre — fornece
algo mais forte: uma **classificação por enquadramento** (Caso 1/2/3), atribuída ficha a ficha no
catálogo de infrações do próprio MBFT (campo "Constatação da Infração" de cada ficha). Isso
sugere que `no_approach_reason` não deveria ser campo de texto livre no AIT, mas sim **derivado
do enquadramento escolhido** (o `Framing` do `NormativeCatalog` já tem `allows_no_approach`,
segundo [APP-TEAT] — este achado **confirma e refina** esse campo: ele deveria ter três estados,
não booleano, refletindo os Casos 1/2/3, com Caso 3 exigindo justificativa textual apenas nas
situações em que a abordagem seria necessária).

## Seção 8 — Medidas administrativas (doutrina geral)

> Medidas administrativas são providências de caráter complementar, exigidas para a
> regularização de situações infracionais, sendo, em grande parte, de aplicação momentânea, e têm
> como objetivo prioritário impedir a continuidade da prática infracional, garantindo a proteção
> à vida e à incolumidade física das pessoas e não se confundem com penalidades.
>
> Compete à autoridade de trânsito com circunscrição sobre a via e seus agentes aplicar as
> medidas administrativas, considerando a necessidade de segurança e fluidez do trânsito.
>
> A ausência de registro no AIT da medida administrativa adotada ou a impossibilidade de sua
> aplicação ou conclusão não invalidam a autuação pela infração de trânsito.
>
> A eventual invalidação, anulação ou arquivamento do AIT não prejudicará, necessariamente, a
> medida administrativa aplicada pelo agente da autoridade de trânsito.

**Efeito no TEAT — CONFIRMA [RN-TEAT-004] com fonte direta.** A independência entre o destino do
AIT e o destino da medida administrativa (hoje justificada em RN-TEAT-004 apenas por inferência a
partir do art. 3º da Res. 918) tem aqui **fonte doutrinária explícita e simétrica** (nos dois
sentidos: falha no registro da medida não invalida o AIT; invalidação do AIT não invalida
necessariamente a medida).

## Seção 8.1/8.2 — Detalhamento de retenção e remoção (doutrina operacional)

Ver artigos 270/271 do CTB, verbatim, em [REF-CTB-165-277-medidas-alcoolemia]; o MBFT acrescenta,
sobre a **remoção por "boa ordem administrativa"** (hipótese sem contrapartida verbatim expressa
no CTB):

> O veículo será removido ao depósito nos seguintes casos: … III. quando necessário à boa ordem
> administrativa. IV. O atendimento à boa ordem administrativa se dará nas infrações em que,
> embora a irregularidade possa ter cessado em razão da abordagem, seja necessário garantir que a
> conduta não será praticada novamente… V. São exemplos de infrações que ensejam o recolhimento
> do veículo ao depósito, quando necessário à boa ordem administrativa: arts. 173; 174; 175; 210;
> 230, I; 231, VIII; 239; 253; e 253-A.

**Efeito no TEAT.** É uma hipótese de remoção **discricionária motivada** (não automática por
descumprimento de prazo) — distinta das hipóteses do art. 270 §4º/271 §9º-D do CTB. O
`AdministrativeTerm` de remoção do TEAT precisa, portanto, registrar **o fundamento** (prazo
descumprido vs. condições de segurança vs. boa ordem administrativa) como campo estruturado, não
apenas o fato da remoção.

## Seção 8.2 (cont.) — Marco do "início da operação de remoção" _(acrescentado na revisão LEGAL de 2026-08-24)_

> Nas infrações de estacionamento em que se prevê a remoção do veículo, esta não será aplicada se o
> condutor, regularmente habilitado, retirar o veículo de onde se encontra irregularmente, desde
> que esteja devidamente licenciado e em condições de circulação, se a retirada do veículo do local
> ocorrer antes do início da operação de remoção, ou ainda, quando o agente avaliar que a operação
> de remoção trará ainda mais prejuízo à segurança e/ou fluidez da via.
>
> Considera-se iniciada a operação de remoção quando o veículo destinado para a remoção (guincho)
> se encontrar no local da infração e o responsável pelo guincho já tiver iniciado qualquer
> procedimento mecânico de guinchamento, tais como, destravamento do sistema de transmissão ou de
> frenagem, amarração de rodas, veículo sobre ao menos um dos patins, colocação de veículo na lança
> do guincho, ou, subida de veículo, ainda que parcial, na plataforma do guincho, entre outros.
>
> O veículo em estado de abandono ou acidentado poderá ser removido para o depósito fixado pelo
> órgão ou entidade competente […] independentemente da existência de infração à legislação de
> trânsito.

**Efeito no TEAT.** O marco temporal é a fronteira entre "veículo retirado pelo condutor, sem
remoção e sem custos" e "remoção consumada, com despesas devidas" — precisa ser **evento
registrado com timestamp e autor**, não inferência. A remoção de abandonado/acidentado **sem
infração** confirma que `AdministrativeTerm` deve existir sem AIT de origem. Aplica-se a:
[RN-TEAT-125], [RN-TEAT-118].

## Seção 8.3 — Recolhimento do documento de habilitação _(acrescentado na revisão LEGAL de 2026-08-24)_

> A medida administrativa de recolhimento do documento de habilitação é aplicada pela autoridade de
> trânsito quando da imposição da penalidade de suspensão do direito de dirigir ou de cassação da
> CNH/PPD, após o devido processo administrativo, com o objetivo de impedir a condução de veículos
> nas vias públicas enquanto perdurar a suspensão ou cassação.
>
> Quando o condutor possuir CNH/PPD em meio digital, a autoridade de trânsito colocará um bloqueio
> no aplicativo, indicando a existência da suspensão ou cassação.
>
> O agente da autoridade de trânsito somente aplicará a medida administrativa de recolhimento de
> documento de habilitação quando ele flagrar o cometimento das infrações previstas nos art. 162,
> II (Dirigir veículo com Carteira Nacional de Habilitação, Permissão para Dirigir ou Autorização
> para Conduzir Ciclomotor cassada ou com suspensão do direito de dirigir).
>
> No caso do art. 162, II, quando o documento de habilitação for apresentado em meio físico, o
> agente da autoridade de trânsito deve providenciar o seu recolhimento, mediante recibo, para que
> seja feito o encaminhamento para a autoridade de trânsito responsável pela aplicação da penalidade
> de suspensão ou cassação. Se o documento for apresentado em meio digital, o bloqueio já estará
> inserido no próprio sistema do Renach.
>
> Quando o agente detectar indícios de inautenticidade ou adulteração, o documento de habilitação
> apresentado deverá ser recolhido e encaminhado, juntamente com o condutor, para a Polícia
> Judiciária, nos termos do art. 272 do CTB.

**Anotação LEGAL — conflito normativo direto, severidade alta.** O advérbio **"somente"** deste
trecho colide frontalmente com duas fontes: (a) **CTB arts. 165 e 165-A**
([REF-CTB-165-277-medidas-alcoolemia]), que preveem o _"recolhimento do documento de habilitação"_
como **medida administrativa da própria infração**, aplicada no ato; e (b) **Res. CONTRAN 432/2013
art. 10** ([REF-CONTRAN-432]), que determina expressamente que _"o documento de habilitação será
recolhido **pelo agente**, mediante recibo"_ no procedimento de alcoolemia. Três normas — duas do
mesmo CONTRAN — com comandos incompatíveis sobre **quem recolhe e quando**. Leitura de trabalho
adotada nas RN: o "somente" alcança a medida do art. 269, III **como decorrência de penalidade já
imposta**, sem revogar as hipóteses em que a **própria lei** prevê o recolhimento no ato — porque
resolução não derroga lei e porque a Res. 432/2013 é norma especial expressa para alcoolemia.
**É interpretação sobre conflito real.** Ver [RN-TEAT-129], [RN-TEAT-137] e
`inf/teat/_intake/legal-assessment.md`, item 32.

## Seção 8.4 — Recolhimento do CLA/CRLV-e _(acrescentado na revisão LEGAL de 2026-08-24)_

> Consiste na inserção, em sistema informatizado, de restrição do documento que certifica o
> licenciamento do veículo, com o objetivo de garantir que o proprietário promova a regularização de
> uma infração constatada. Deve ser aplicado nas seguintes situações:
>
> a) quando não for possível sanar a irregularidade no local da infração, nos casos em que esteja
> prevista a medida administrativa de retenção ou de remoção do veículo e este tenha sido liberado
> nos termos do § 2º do art. 270 e § 9º-A do art. 271 do CTB.
>
> b) quando houver fundada suspeita quanto à inautenticidade ou adulteração, devendo ser
> encaminhado, juntamente com o condutor, para a Polícia Judiciária, nos termos do art. 274 do CTB.
>
> A ciência do recolhimento digital do CLA/CRLV-e dar-se-á por meio de recibo entregue ao condutor
> ou de lançamento dessa medida administrativa em campo próprio ou no de observações do AIT.

**Efeito no TEAT.** O "recolhimento" é **lançamento em sistema**, não apreensão — e a **ciência**
(recibo ou campo do AIT) é o que faz correr o prazo de regularização de [RN-TEAT-124]/[RN-TEAT-125].
Aplica-se a: [RN-TEAT-130], [RN-TEAT-122].

## Seções 8.5 a 8.7 — Transbordo, animais e medidas inominadas _(acrescentado na revisão LEGAL de 2026-08-24)_

> [8.5] A critério do agente, avaliados os riscos e as condições de segurança, poderá ser dispensado
> o remanejamento ou transbordo de produtos perigosos, produtos perecíveis, cargas vivas e
> passageiros. Nos casos em que não for dispensado o remanejamento ou transbordo da carga, o veículo
> deverá ser recolhido ao depósito.
>
> [8.6] O recolhimento [de animais] deixará de ocorrer se o responsável, presente no local, se
> dispuser a retirar o animal.
>
> [8.7] Além das medidas administrativas relacionadas no artigo 269, o CTB prevê medidas
> administrativas específicas para as infrações dos artigos 221 (apreensão das placas irregulares),
> 243 (recolhimento de placas e documentos), 245 (remoção de mercadoria e material), 255 (remoção de
> bicicleta) e 278 (retorno ao ponto de evasão).

**Efeito no TEAT.** A Seção 8.7 amplia o enumerado de `AdministrativeTerm.type` além do art. 269:
o catálogo fechado é **art. 269 ∪ medidas inominadas**. Aplica-se a: [RN-TEAT-122].

## Seção 9/10 — Habilitação e disposições finais

> Os órgãos e entidades executivos do SNT poderão celebrar convênio delegando as atividades
> previstas no CTB, com vistas à maior eficiência e à segurança para os usuários da via.

**Efeito no TEAT.** Base geral (além do art. 23, III do CTB citado na Seção 4) para convênios de
delegação de fiscalização — relevante ao caso concreto do convênio DETRAN-AM/BPTRAN (ver
`refs/detran-am/`).

---

# Achados de conferência

Extração via `pdftotext -layout` do PDF do Anexo (17MB/20 páginas — na verdade um documento
extenso: a extração de texto produziu ~34.600 linhas, cobrindo a Parte Geral de 30 páginas e um
catálogo extenso de fichas de fiscalização por infração, não transcrito neste REF). Nenhuma
inconsistência interna encontrada na Parte Geral. Res. 1.003/2023 confirmada como alteração
apenas do Anexo (fichas), não localizado texto da Res. 985/2022 em si alterado.

# Índice reverso — dispositivo/seção → artefato TEAT

| Trecho                                                                                  | Artefato                                      | Efeito                                                                           |
| --------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| Seção 4 (agente de trânsito)                                                            | [APP-TEAT] papel `field-agent`                | EXTENDE — base legal para convênio PM/guarda municipal como origem do papel      |
| Seção 7 ("em flagrante… com ou sem abordagem")                                          | [REF-CTB-280-290] art. 282 §6º-A, gap         | EXTENDE parcialmente — fixa critério de enquadramento, não fecha o termo inicial |
| Seção 7 (uma infração por auto; raiz de código)                                         | `NormativeCatalog`/`Framing` (TEAT)           | GAP fechado — regra de consolidação de enquadramentos                            |
| Seção 7 (Casos 1/2/3 sem/com abordagem)                                                 | `no_approach_reason` (`_intake/proposals.md`) | GAP fechado — não é catálogo de motivos, é classificação por enquadramento       |
| Seção 7 (campo Observações; rasuras; todas as vias)                                     | [RN-TEAT-109]                                 | ancora `Framing.requires_observation` como dado normativo                        |
| Seção 7 (ato vinculado; sinalização; vedação a pedido de terceiro; presunção subjetiva) | [RN-TEAT-102]                                 | três vedações de lavratura                                                       |
| Seção 4 (uniformização, veículo caracterizado, circunscrição)                           | [RN-TEAT-104]                                 | pressupostos de legitimidade; **"fé pública" não é termo da norma**              |
| Seção 8 (independência AIT × medida administrativa)                                     | [RN-TEAT-004], [RN-TEAT-123]                  | CONFIRMA com fonte direta e simétrica                                            |
| Seção 8.1 (retenção; prazo de 30 dias; CRLV-e no Renavam)                               | [RN-TEAT-124]                                 | doutrina operacional da retenção                                                 |
| Seção 8.2 (boa ordem administrativa)                                                    | [RN-TEAT-125]                                 | novo fundamento de remoção, exige campo estruturado                              |
| Seção 8.2 (início da operação de remoção; abandonado/acidentado)                        | [RN-TEAT-125], [RN-TEAT-118]                  | marco temporal de cobrança; medida sem AIT                                       |
| Seção 8.3 ("somente" art. 162, II)                                                      | [RN-TEAT-129], [RN-TEAT-137]                  | **CONFLITO** com CTB 165/165-A e Res. 432 art. 10                                |
| Seção 8.4 (CLA/CRLV-e)                                                                  | [RN-TEAT-130]                                 | recolhimento é lançamento em sistema; ciência por recibo                         |
| Seção 8.7 (medidas inominadas)                                                          | [RN-TEAT-122]                                 | amplia o enumerado além do art. 269                                              |
| Seção 10 (convênios)                                                                    | [RN-TEAT-143]                                 | base geral de delegação                                                          |
