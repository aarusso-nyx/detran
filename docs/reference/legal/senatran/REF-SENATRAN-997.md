---
id: REF-SENATRAN-997
title: Portaria SENATRAN nº 997, de 2/8/2022 — requisitos técnicos, homologação e procedimento do Talão Eletrônico
orgao: Ministério da Infraestrutura/Secretaria Nacional de Trânsito (SENATRAN) — DOU 04/08/2022, ed. 147, seção 1, p. 41
status: vigente (em vigor desde 01/09/2022; revoga art. 5º da Portaria DENATRAN 346/2020 e as Portarias DENATRAN 99/2017 e 124/2017)
url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2022/Portaria9972022.PDF'
pdf: 'REF-SENATRAN-PORTARIA-997-2022.pdf (txt: REF-SENATRAN-PORTARIA-997-2022.txt)'
apps: [teat]
sources: [REF-CONTRAN-918]
updated: 2026-08-24
---

# O que este arquivo é

**Este é o achado central da rodada de pesquisa TEAT.** [REF-CONTRAN-918] art. 3º §1º, II remete
duas vezes a "regulamentação definida pelo órgão máximo executivo de trânsito da União" para o
talão eletrônico; [APP-TEAT], [RN-TEAT-003] e `_intake/proposals.md` marcavam essa regulamentação
como **"fonte pendente"**. A Portaria SENATRAN nº 997/2022 **é exatamente esse ato**: regulamenta,
com base expressa no art. 3º, §1º, II da Res. 918/2022, os requisitos técnicos, o processo de
homologação e o procedimento de uso do Talão Eletrônico na lavratura do AIT. Extraído
integralmente (`pdftotext -layout`) do PDF oficial do DOU; verbatim abaixo nos artigos e nos
itens do Anexo relevantes ao TEAT.

---

## Art. 1º — Objeto e âncora legal expressa

> Art. 1º Esta Portaria estabelece os requisitos técnicos, especificações e condições para
> homologação de sistema informatizado (software) do Talão Eletrônico, de que trata o art. 3º, §
> 1º, inciso II, da Resolução CONTRAN nº 918, de 28 de março de 2022, e regulamenta o
> procedimento para o seu uso na lavratura do Auto de Infração de Trânsito (AIT).

**Efeito no TEAT.** Fecha formalmente o encadeamento normativo CTB art. 280 §2º → CONTRAN 918
art. 3º §1º, II → esta Portaria. É a base legal que faltava para [RN-TEAT-003] (homologação de
dispositivo/aplicativo) e para o conceito de "Talão eletrônico" em `shared/glossary.md`.

## Art. 2º — Definição operacional e limites de uso

> Art. 2º O Talão Eletrônico é constituído por equipamento dotado de software que permite o
> registro das informações relativas à infração de trânsito, a ser utilizado pela autoridade de
> trânsito ou por seus agentes para o lavratura do AIT.
>
> § 1º O equipamento de que trata o _caput_ poderá ser utilizado para outras finalidades, desde
> que não interfiram no registro das infrações de trânsito.
>
> § 2º O Talão Eletrônico poderá: I - possuir dispositivo registrador de imagem; e II - ser
> acoplado a equipamento de detecção de infração regulamentado pelo CONTRAN.
>
> § 3º O acesso ao Talão Eletrônico deverá seguir padrões de segurança da informação que
> permitam a identificação do agente autuador.

**Efeito no TEAT.** §3º é a base legal (antes "fonte pendente") da exigência de identidade do
agente em todo ato offline ([INV-OFFLINE-001], [RN-TEAT-001]).

## Art. 3º — Requisitos funcionais mínimos do equipamento

> Art. 3º O Talão Eletrônico deverá atender aos seguintes requisitos:
>
> I - receber, de forma automática, sem interferência externa, numeração sequencial de AIT,
> estabelecida previamente pela autoridade de trânsito;
>
> II - armazenar os AIT até sua transmissão ao órgão ou entidade de trânsito;
>
> III - identificar o agente da autoridade de trânsito responsável pela lavratura do AIT;
>
> IV - permitir a impressão do AIT em duas vias;
>
> V - ser dotado de elementos de segurança que garantam a fidelidade e integridade dos dados
> registrados e impeçam sua alteração após o término da lavratura do AIT; e
>
> VI - impedir que os campos destinados à identificação do veículo sejam preenchidos de forma
> automática a partir da informação da placa ou outro elemento de identificação de veículo, sem
> que haja validação dos dados pelo agente.
>
> § 1º O Talão Eletrônico também poderá ser dotado de arquivos que contenham informações, tais
> como código de municípios, endereços, veículos, condutores, códigos de infração e legislação.
>
> § 2º O equipamento poderá dispor de Sistema de Posicionamento Global (GPS).

**Efeito no TEAT — mapa direto para invariantes existentes:**

| Requisito legal                                          | Onde já existe no TEAT                                            | Situação                                                                                                       |
| -------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| I — numeração sequencial automática, pré-estabelecida    | `AitNumberingRange`/`OfflineNumberingReservation` ([WF-TEAT-002]) | **CONFIRMA** o desenho de faixas/reservas — é mandato legal, não só escolha técnica                            |
| II — armazenar até transmissão                           | fila local cifrada (`MobileEncryptedStorePort`)                   | **CONFIRMA** [WF-TEAT-001]                                                                                     |
| III — identificar o agente                               | identidade do agente em [INV-OFFLINE-001]                         | **CONFIRMA**                                                                                                   |
| IV — impressão em duas vias                              | `MobilePrinterPort`, recibo impresso                              | **CONFIRMA**, ver Anexo III abaixo p/ detalhe                                                                  |
| V — integridade/imutabilidade pós-lavratura              | `content_hash` ([RN-TEAT-004], [INV-AIT-001])                     | **CONFIRMA E ANCORA** — RN-TEAT-004 tinha base legal genérica (art. 3º CONTRAN 918); agora tem base específica |
| VI — vedação de auto-preenchimento não validado da placa | **não modelado** nos blueprints lidos                             | **GAP NOVO** — ver seção de achados abaixo                                                                     |

**VI é um achado de risco novo, não coberto por nenhuma RN-TEAT existente**: o software não pode
auto-preencher os campos de identificação do veículo a partir de leitura de placa (OCR/ANPR) sem
**validação do agente**. Se o TEAT vier a integrar captura automática de placa (câmera/OCR), esta
é uma restrição legal explícita, não apenas de UX.

## Art. 4º — Conteúdo mínimo do AIT e assinatura condicional

> Art. 4º O AIT lavrado no Talão Eletrônico deverá conter os dados mínimos definidos no art. 280
> do Código de Trânsito Brasileiro (CTB) e em regulamentação específica.
>
> Parágrafo único. A assinatura da autoridade de trânsito ou de seu agente será obrigatória
> somente quando o AIT do Talão Eletrônico for impresso no ato do seu preenchimento.

**Efeito no TEAT — anotação corrigida na revisão LEGAL de 2026-08-24.** A leitura anterior
("confirma verbatim [REF-CONTRAN-918] art. 3º §2º") era **imprecisa**: os dois textos não dizem a
mesma coisa e, lidos isoladamente, apontam em direções opostas.

- [REF-CONTRAN-918] art. 3º §2º dispensa a assinatura **como consequência de o AIT ser impresso**
  pelo órgão autuador para instruir o processo administrativo: _"deverá imprimir o AIT lavrado nas
  formas previstas nos incisos II e III do § 1º […] sendo dispensada a assinatura da autoridade ou
  de seu agente."_
- Esta Portaria, art. 4º parágrafo único, torna a assinatura **obrigatória exatamente na impressão**
  quando esta ocorre no ato: _"será obrigatória **somente** quando o AIT do Talão Eletrônico for
  impresso no ato do seu preenchimento."_ Reiterado no Anexo III, e).

Leitura harmônica adotada: a Res. 918 alcança a **impressão diferida, feita pela retaguarda**; a
Portaria 997 — norma específica e posterior — alcança a **via entregue em campo, no ato**, em que a
assinatura cumpre função de autenticação presencial. Regra em nível de negócio: **a decisão de
imprimir no ato muda o conteúdo formal exigido do documento**. Ver [RN-TEAT-105]; a divergência
textual está registrada em `inf/teat/_intake/legal-assessment.md`, item 4.

## Art. 5º — Homologação do software pela SENATRAN

> Art. 5º O software que compõe o Talão Eletrônico deverá ser homologado pela Secretaria
> Nacional de Trânsito (SENATRAN).
>
> § 1º A SENATRAN, após receber requerimento devidamente instruído e protocolado, notificará o
> interessado acerca da viabilidade do pedido, no prazo máximo de sessenta dias.
>
> § 2º Para cumprimento do estabelecido no _caput_, o órgão ou entidade de trânsito interessado
> deverá apresentar laudo técnico que comprove o atendimento dos requisitos estabelecidos no
> Anexo desta Portaria.
>
> § 3º O laudo técnico de que trata o § 2º deverá ser emitido por profissional sem vínculos
> laborais com o solicitante, que possua certificação em auditoria de sistema, segurança da
> informação ou forense computacional, ou por universidade ou instituição a ela vinculada.
>
> § 4º O laudo técnico de que trata o § 2º deverá ser renovado e encaminhado à SENATRAN a cada
> quatro anos.
>
> § 5º A homologação do Talão Eletrônico deve ser precedida da descrição detalhada de seu
> funcionamento, ficando disponível ao público na sede do órgão ou entidade de trânsito e junto
> à respectiva Junta Administrativa de Recurso de Infração (JARI).

**Efeito no TEAT — este é o ato de homologação, não o do equipamento/dispositivo físico.**
[RN-TEAT-003] modela hoje `Homologation`/`ApplicationVersion.homologation_id` como homologação
de **dispositivo+versão de aplicativo**; este artigo trata da homologação do **software do talão
eletrônico perante a SENATRAN**, com renovação **quadrienal** (§4º) e laudo técnico **independente**
(§3º). São dois níveis de homologação potencialmente distintos: (a) homologação SENATRAN do
software/sistema como um todo (este artigo) e (b) controle interno do órgão sobre qual
dispositivo/versão está autorizado a operar (`OperationalDevice`/`ApplicationVersion` do TEAT).
**RN-TEAT-003 deveria referenciar explicitamente este artigo e adicionar o atributo de validade
quadrienal do laudo técnico como possível campo de `Homologation`.**

## Art. 6º e 7º — Revogações e vigência

> Art. 6º Ficam revogados: I - o art. 5º da Portaria DENATRAN nº 346, de 31 de janeiro de 2020;
> II - a Portaria DENATRAN nº 99, de 01 de junho de 2017; e III - a Portaria DENATRAN nº 124, de
> 19 de junho de 2017.
>
> Art. 7º Esta Portaria entra em vigor em 1º de setembro de 2022.

## Anexo — Requisitos técnicos detalhados (verbatim, itens com efeito direto no TEAT)

> **I. TALÃO ELETRÔNICO – GERAL**
>
> e) Deverá permitir o preenchimento on-line e off-line do AIT;
>
> f) Deverá permitir o registro de AIT não vinculadas ao veículo;
>
> g) Deverá permitir o registro de AIT de veículos nacionais e estrangeiros;
>
> h) Deverá permitir o registro de AIT com abordagem e sem abordagem ao condutor ou infrator.

**Efeito no TEAT.** **e)** é a base legal explícita (antes ausente) da doutrina offline-first do
TEAT — não é só arquitetura, é requisito normativo. **h)** confirma "constatação sem abordagem"
como modalidade prevista em norma, não apenas prática operacional (ver também [REF-CONTRAN-985-1003-MBFT]
para o catálogo de casos "possível sem abordagem / mediante abordagem / vide procedimentos").

> **II. SEGURANÇA DA INFORMAÇÃO**
>
> a) O acesso ao software do Talão Eletrônico deverá seguir padrões de segurança da informação
> que permitam a identificação do agente autuador responsável pela lavratura do AIT, por meio de
> código do usuário e senha, biometria ou assinatura digital;
>
> b) Deverá ser dotado de elementos de segurança que garantam a fidelidade e integridade dos
> dados registrados e impeçam sua alteração após o término da lavratura do AIT;
>
> c) Deverá receber, de forma automática, sem interferência externa, numeração sequencial de
> AIT, estabelecida previamente pela autoridade de trânsito. Essa numeração pode estar
> pré-carregada no aparelho, inclusive para permitir o registro do AIT quando o preenchimento for
> off-line;
>
> d) Deverá impedir que os campos destinados à identificação do veículo sejam preenchidos de
> forma automática a partir da informação da placa ou outro elemento de identificação de veículo,
> sem que haja validação dos dados do campo pelo agente;
>
> e) Quando os dados forem lidos, gravados e transmitidos estes devem ser criptografados;
>
> f) Deverá armazenar os AIT até a sua transmissão ao órgão ou entidade de trânsito;
>
> g) Deverá exigir que o agente de trânsito indique a finalização do preenchimento do AIT, para
> que um novo AIT possa ser preenchido, não podendo ser de forma automática ao final do
> preenchimento;
>
> h) O agente de trânsito não poderá estar logado simultaneamente em mais de um equipamento.
> Quando da transmissão dos dados para processamento, apurada a existência de registros
> realizados por um mesmo agente de trânsito, dentro de um mesmo intervalo de tempo, em
> aparelhos diferentes, esses registros não deverão ser processados e o fato deve ser apurado
> pela autoridade de trânsito;
>
> i) O software deverá identificar o equipamento e impedir sua instalação ou uso não autorizado;
>
> j) Deverá ser efetuado o registro das operações envolvendo as autuações realizadas, indicando
> no mínimo, data e hora, agente de trânsito, veículo, local e número do aparelho utilizado para
> permitir a realização de auditorias;
>
> k) Iniciado o preenchimento do AIT, o seu cancelamento poderá ser solicitado à Autoridade de
> Trânsito, no próprio software, com a devida justificativa.

**Efeito no TEAT — achados de maior impacto:**

- **c)** confirma **pré-carregamento offline de numeração** — exatamente o desenho de
  [WF-TEAT-002] (reserva consumida localmente).
- **g)** é base legal nova para uma regra hoje ausente do TEAT: **finalização não pode ser
  automática** — precisa de indicação explícita do agente. Se o app tiver algum fluxo de
  "auto-submit", ele viola este item.
- **h) é o achado de maior risco de segurança do corpus TEAT.** A Portaria **proíbe** que o mesmo
  agente esteja logado em mais de um dispositivo simultaneamente, e manda que registros
  simultâneos do mesmo agente em aparelhos diferentes, no mesmo intervalo, **não sejam
  processados** e sejam apurados pela autoridade. Isso é uma regra de negócio de detecção de
  fraude/erro operacional **hoje ausente de [RN-TEAT-001]** (que trata de idempotência de
  reenvio, não de sessão concorrente do mesmo agente em dispositivos distintos). Deve gerar nova
  RN-TEAT (proposta: "sessão de agente é exclusiva por dispositivo; concorrência bloqueia
  processamento e aciona apuração").
- **k) é a base legal, antes ausente, do gap "condições e ator autorizado a cancelar um AIT
  finalizado antes do envio" ([WF-TEAT-001], decisão pendente).** A norma federal só cobre o
  **cancelamento do preenchimento em curso** ("iniciado o preenchimento... poderá ser solicitado
  à Autoridade de Trânsito, no próprio software, com a devida justificativa") — isto é, um
  rascunho não finalizado. Ela **não resolve** o cancelamento de um AIT já **finalizado** localmente
  antes do envio (o estado `CANCELADO` de [WF-TEAT-001] parte de `FINALIZADO_LOCAL`). O gap
  permanece parcialmente aberto: agora sabemos que cancelamento de rascunho é ato do agente com
  aprovação da autoridade de trânsito e justificativa obrigatória; cancelamento pós-finalização
  segue sem previsão federal (ver achado local do DETRAN-AM em `refs/detran-am/`, que resolve
  esse caso especificamente para a operação amazonense).

> **III. IMPRESSÃO DOS DADOS**
>
> a) Deverá permitir a impressão do AIT em duas vias, em tempo real, no ato da sua lavratura, de
> forma que uma das vias possa entregue ao infrator, caso esteja presente.
>
> b) O AIT deverá permanecer armazenado no equipamento, no mínimo, durante o dia da lavratura do
> AIT, de modo a viabilizar sua reimpressão por meio do equipamento, conforme quantidade de vias
> necessárias, em momento diverso do da autuação;
>
> d) A qualidade do papel utilizado na impressão do AIT deverá permitir que as informações
> impressas permaneçam legíveis por no mínimo 2 (dois) anos, sendo essa comprovação indicada em
> documentação do fabricante do papel;
>
> e) A assinatura da autoridade de trânsito ou de seu agente será obrigatória quando o AIT do
> Talão Eletrônico for impresso no ato de sua lavratura;
>
> f) O AIT impresso deverá possuir campo para a assinatura do infrator; e
>
> g) O AIT impresso deverá conter aviso que é obrigatória a presença do código RENAINF nas
> notificações, sob pena de invalidade da multa.

**Efeito no TEAT.** **CONFIRMA** [RN-TEAT-004] ("impressão do AIT é comprovante, não condição de
existência válida do ato digital — falha de impressão gera evento e reimpressão controlada");
**b)** dá o piso legal mínimo (retenção no equipamento por pelo menos o dia da lavratura) para
esse mecanismo de reimpressão.

> **V. (dados e destino)**
>
> e) Os dados dos AIT somente poderão ser enviados e armazenados no banco de dados do órgão
> autuador;
>
> f) Permitir, após a finalização do preenchimento do AIT, a vinculação da medida administrativa
> adotada.

**Efeito no TEAT.** **f)** é a base legal explícita (antes ausente) da modelagem de vínculo
AIT↔medida administrativa em [APP-TEAT], reforçando que a vinculação ocorre **após** a
finalização — compatível com o desenho atual de [WF-TEAT-001].

> **VI. DOCUMENTAÇÃO DAS PRODUTORAS E FORNECEDORAS DE SISTEMAS**
>
> a) A homologação do Talão Eletrônico deve ser precedida da descrição detalhada de seu
> funcionamento, contendo o fluxo do processo, conforme modelo Business Process Management
> System (BPM)…
>
> i) Código fonte de todos os programas que são utilizados no Talonário Eletrônico;
>
> j) Scripts dos Bancos de Dados que são utilizados no Talonário Eletrônico;
>
> Parágrafo único: Quando se tratar do software desenvolvido pelo próprio órgão de trânsito,
> ficam dispensadas as alíneas "c", "d", "e", "f" e "g" [documentos societários/CNPJ/certidões —
> aplicáveis apenas a fornecedores terceiros].

**Efeito no TEAT — item crítico para o produto.** Se o DETRAN-AM opera TEAT como sistema
**próprio** (desenvolvido/contratado pelo órgão, não por terceiro no mercado), o parágrafo único
dispensa a documentação societária, mas **não dispensa** a exigência de **código-fonte e scripts
de banco de dados** apresentados à SENATRAN para fins de homologação (alíneas i e j do item VI,
fora do escopo do parágrafo único). Isso é um requisito de compliance de produto — não uma
questão de negócio do agente — mas com implicação direta de **governança de release**: toda
alteração relevante do código do TEAT pode disparar nova homologação (item VII abaixo).

> **VII. HOMOLOGAÇÕES e AUDITORIAS EVENTUAIS**
>
> a) A cada alteração do código da aplicação do talonário, que gere alteração de funcionalidade,
> será exigida nova homologação.
>
> b) No período de validade da certificação poderão ser realizadas auditorias no sistema
> instalado nos equipamentos e, caso seja comprovada a existência de qualquer alteração, fica
> automaticamente cancelada a certificação e, consequentemente, sua homologação.
>
> c) A SENATRAN poderá cancelar a homologação a qualquer momento, quando comprovar que as
> empresas deixaram de cumprir com as exigências desta Portaria.

**Efeito no TEAT — achado de maior impacto de produto/roadmap.** **a)** significa que
[WF-TEAT-003] (publicação de catálogo normativo/pacote mobile) e o ciclo de release do próprio
aplicativo TEAT são **duas engrenagens regulatórias distintas com o mesmo risco**: alteração de
funcionalidade do app pode exigir nova homologação SENATRAN, com prazo de até 60 dias
(art. 5º §1º) — isso é um item de planejamento de produto/roadmap que hoje não aparece em nenhum
artefato TEAT.

---

# Achados de conferência

Nenhuma divergência entre este extrato e o PDF oficial do DOU (extração direta via
`pdftotext -layout`, sem fonte secundária).

# Índice reverso — dispositivo → artefato TEAT

_(coluna "Artefato" atualizada na revisão LEGAL de 2026-08-24 com as RN da série legal)_

| Dispositivo                               | Artefato                                         | Efeito                                                                                                       |
| ----------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Art. 1º                                   | [APP-TEAT]                                       | fecha remissão do art. 3º §1º-II da Res. 918                                                                 |
| Art. 2º §3º                               | [RN-TEAT-110], [RN-TEAT-001], [INV-OFFLINE-001]  | base da identidade do agente                                                                                 |
| Art. 3º, I e Anexo II, c)                 | [RN-TEAT-113], [WF-TEAT-002]                     | CONFIRMA numeração sequencial pré-estabelecida e pré-carregável offline                                      |
| Art. 3º, II e V; Anexo II, b), e), f), j) | [RN-TEAT-112], [RN-TEAT-004], [RN-TEAT-002]      | integridade, criptografia, retenção e trilha de auditoria                                                    |
| Art. 3º, VI e Anexo II, d)                | [RN-TEAT-115]                                    | vedação de auto-preenchimento de placa sem validação **do campo** pelo agente                                |
| Art. 4º e parágrafo único; Anexo III, e)  | [RN-TEAT-105]                                    | assinatura do agente obrigatória **só** na impressão no ato (ver anotação corrigida acima)                   |
| Art. 5º e Anexo VI-VII                    | [RN-TEAT-117]                                    | homologação SENATRAN do software — **distinta** do controle de dispositivo/versão de [RN-TEAT-003]           |
| Anexo I, e)                               | [RN-TEAT-001], [APP-TEAT] doutrina offline-first | CONFIRMA com base legal explícita                                                                            |
| Anexo I, h)                               | [RN-TEAT-108]                                    | CONFIRMA previsão normativa da constatação sem abordagem                                                     |
| Anexo II, a)                              | [RN-TEAT-110]                                    | três meios de autenticação admitidos (senha, biometria, assinatura digital)                                  |
| Anexo II, g)                              | [RN-TEAT-114]                                    | finalização é ato explícito — vedado encadeamento automático                                                 |
| Anexo II, h)                              | [RN-TEAT-111]                                    | **risco alto** — sessão exclusiva por dispositivo; concorrência **bloqueia processamento** e aciona apuração |
| Anexo II, i)                              | [RN-TEAT-003]                                    | identificação do equipamento; vedação de instalação/uso não autorizado                                       |
| Anexo II, k)                              | [RN-TEAT-120]                                    | cancelamento **de rascunho**; não alcança AIT finalizado ([RN-TEAT-121])                                     |
| Anexo III, a)-g)                          | [RN-TEAT-116]                                    | duas vias, reimpressão no dia, papel legível por 2 anos, aviso RENAINF                                       |
| Anexo V, e)                               | [RN-TEAT-112]                                    | dado do AIT **só** no banco do órgão autuador — restrição de arquitetura                                     |
| Anexo V, f)                               | [RN-TEAT-118]                                    | vínculo AIT↔medida administrativa, **pós-finalização**                                                       |
| Anexo VII, a)-c)                          | [RN-TEAT-117], [WF-TEAT-003] / roadmap           | mudança de funcionalidade exige nova homologação; auditoria pode cancelar certificação                       |
