---
id: REF-SENATRAN-PORTARIA-139-2025
title: Portaria SENATRAN 139/2025 — disciplina o acesso aos dados dos sistemas e subsistemas informatizados da Senatran (inclui RENAEST), regime LGPD
orgao: SENATRAN
status: 'vigente (publicada DOU 24/02/2025, edição 38, seção 1, página 108)'
url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2025/Portaria1392025.pdf ; DOU: https://www.in.gov.br/en/web/dou/-/portaria-senatran-n-139-de-20-de-fevereiro-de-2025-614275603'
pdf: REF-SENATRAN-PORTARIA-139-2025.pdf (txt correspondente, extração pdftotext -layout, 8 páginas)
apps: [boat]
sources: [REF-CONTRAN-808-2020]
updated: 2026-08-24
---

# O que este arquivo é

Norma **vigente e original**, baixada em PDF do portal `gov.br/transportes` (confirmada também no
DOU/Imprensa Nacional). Disciplina o **acesso** — não a coleta/registro em si — aos dados de todos
os sistemas informatizados controlados pela SENATRAN, entre eles o RENAEST. É o instrumento que
estrutura a governança LGPD do RENAEST em nível federal: define a SENATRAN como controladora, o
SERPRO como operador, e um regime de "grupos de informação" e "uso primário/secundário" para
qualquer requerente (incluindo o próprio DETRAN-AM). Relevante ao handoff LEGAL do briefing (flag
obrigatório de toda norma que toque dado de saúde de vítima).

## Excertos úteis

### Preâmbulo — competência e base legal

> Disciplina o acesso aos dados dos sistemas e subsistemas informatizados da Secretaria Nacional
> de Trânsito - Senatran.
>
> O SECRETÁRIO NACIONAL DE TRÂNSITO, no uso das competências que lhe confere o art. 19, incisos I,
> II, IV, V, VIII, IX, X, XIV, XXX, XXXI e XXXII, da Lei nº 9.503, de 23 de setembro de 1997, e com
> base no disposto na Lei nº 12.527, de 18 de novembro de 2011, na Lei nº 13.709, de 14 de agosto
> de 2018, na Lei nº 14.129, de 29 de março de 2021, e no Decreto nº 10.046, de 9 de outubro de
> 2019 [...]

Cita expressamente o inciso XXXII do art. 19 do CTB (RENAEST) como fundamento de competência —
confirmação cruzada, em norma distinta, do achado de [REF-CTB-sinistro-cena-renaest].

### Art. 7º, §1º — RENAEST como sistema controlado pela SENATRAN (controladora LGPD)

> Art. 7º A Senatran exercerá o papel de controladora dos dados de seus sistemas e subsistemas
> informatizados, cabendo-lhe as decisões referentes ao tratamento de dados, nos termos da Lei nº
> 13.709, de 2018.
>
> § 1º Constituem-se nos sistemas informatizados controlados pela Senatran o Registro Nacional de
> Carteiras de Habilitação - Renach, o Registro Nacional de Veículos Automotores - Renavam, o
> Registro Nacional de Infrações de Trânsito - Renainf, o Registro Nacional Positivo de Condutores
>
> - RNPC, o Registro Nacional de Sinistros e Estatísticas de Trânsito - Renaest e o Sistema de
>   Notificação Eletrônica - SNE, além de outros sistemas instituídos por Lei ou regulamento [...]
>
> § 3º Considerando as competências definidas no art. 19, do Código de Trânsito Brasileiro, o
> tratamento de dados restritos pelos órgãos ou entidades executivos de trânsito dos Estados e do
> Distrito Federal, no âmbito de suas circunscrições, coletados para o desempenho de atribuições
> delegadas pela Senatran, nos termos do art. 22, incisos II e III, do Código de Trânsito
> Brasileiro, observará o disposto no art. 2º.

**Achado central para o handoff LGPD**: a SENATRAN é formalmente **controladora** (LGPD, art. 5º,
VI) dos dados do RENAEST. O § 3º trata do tratamento de dados **delegados** por órgãos estaduais
— mas cita apenas os incisos II e III do art. 22 do CTB (habilitação e registro de veículo), **não
o inciso IX** (coleta de sinistro) — a competência de sinistro do DETRAN-AM não é, textualmente,
uma competência "delegada pela Senatran" no mesmo sentido de habilitação/RENAVAM; é competência
**própria** do art. 22, IX. Isso sugere que o papel do DETRAN-AM/BOAT em relação ao RENAEST pode
ser mais o de **fonte primária de dados** (colaborador/co-controlador de fato) do que o de simples
processador de dados delegados pela União — distinção juridicamente relevante que não foi
resolvida por nenhuma norma lida nesta rodada e que merece parecer LEGAL específico.

### Art. 6º — definições que operam como regra _(acrescentado na revisão LEGAL de 2026-08-24)_

> Art. 6º Para os efeitos desta Portaria, adotam-se as seguintes definições: [...]
>
> VI - **dado público**: informação contida nos sistemas e subsistemas informatizados da Senatran não
> sujeita à restrição de acesso;
>
> VII - **dado restrito**: informação contida nos sistemas e subsistemas informatizados da Senatran,
> cujo acesso é restrito por força de lei, devendo obedecer a determinadas diretrizes, requisitos e
> procedimentos;
>
> VIII - **grupo de informação**: conjunto fechado de parâmetros de entrada e saída, agregados por
> sistema ou subsistema informatizado, necessários para atender a uma finalidade específica; [...]
>
> XI - **uso primário dos dados**: tratamento dos dados conforme as finalidades previamente
> estabelecidas e informadas ao titular no momento da coleta, garantindo sua vinculação ao propósito
> original, que justificou o tratamento;
>
> XII - **uso secundário dos dados**: tratamento dos dados para finalidades distintas daquelas
> originalmente informadas ao titular no momento da coleta, exigindo avaliação de compatibilidade com
> o propósito inicial ou nova justificativa legal; [...]
>
> XIV - **validação de dados**: método de confirmação de compatibilidade entre diferentes parâmetros
> de entrada com os dados dos sistemas e subsistemas informatizados da Senatran, de forma a indicar a
> consistência das informações.

A definição de **validação de dados** (XIV) é o que dá sentido operacional ao art. 18, § 2º:
responder _"confere / não confere"_ em vez de devolver o dado sensível ([RN-BOAT-124]). A dupla
**uso primário × secundário** (XI/XII) é o vocabulário que o BOAT deveria adotar para disciplinar
reaproveitamentos do dado de sinistro ([RN-BOAT-132]).

### Art. 8º e 9º — uso primário e uso secundário do dado restrito _(acrescentado na revisão LEGAL de 2026-08-24)_

> Art. 8º O uso primário dos dados restritos pela Senatran terá como finalidades específicas a
> execução de políticas públicas e o desempenho de atribuições definidas em Lei e regulamentos.
>
> Parágrafo único. As finalidades de que trata o caput estarão disponíveis aos titulares e demais
> interessados no sítio eletrônico da Senatran e nas soluções tecnológicas de seus operadores.
>
> Art. 9º O uso secundário dos dados restritos somente será permitido se observados os preceitos,
> diretrizes e procedimentos estabelecidos nesta Portaria, em consonância com a Lei nº 13.709, de 2018.
>
> Parágrafo único. O uso secundário de que trata o caput será analisado pela Senatran para cada caso
> concreto, **vedada sua aplicação com finalidades genéricas**.

O art. 8º, parágrafo único, é o análogo federal do dever de publicidade do art. 23, I da LGPD
([REF-LEI-13709-2018]) — obrigação equivalente recai sobre o DETRAN-AM quanto ao seu próprio
tratamento ([RN-BOAT-126]).

### Art. 2º e Art. 3º §3º — manuais técnico-operacionais e regime dos DETRANs estaduais

> Art. 2º O acesso aos dados dos sistemas e subsistemas informatizados da Senatran por órgãos e
> entidades componentes do Sistema Nacional de Trânsito será disciplinado por manuais técnico-
> operacionais específicos elaborados pela Senatran.
>
> § 1º Somente terão o acesso de que trata o caput os órgãos e entidades integrados ao Sistema
> Nacional de Trânsito, conforme disciplina o art. 333, § 2º, da Lei nº 9.503 [...]
>
> § 2º O acesso de que trata o caput terá como finalidade o desempenho das atribuições legais
> definidas pelo Código de Trânsito Brasileiro.

Confirma, em norma distinta e mais recente, a existência de "manuais técnico-operacionais
específicos" por sistema — mesmo padrão dos "Manual do Sistema RENAEST" e "Manual de Gestão de
Estatísticas de Acidente de Trânsito" citados em [REF-CONTRAN-808-2020] art. 3º. **Nenhum dos dois
foi localizado publicamente** nesta rodada (mesmo achado negativo, reforçado por segunda fonte).

### Art. 18 — dados pessoais sensíveis (relevante a dados de saúde da vítima)

> Art. 18. Os casos de uso que envolvam o acesso a dados pessoais sensíveis deverão observar as
> hipóteses legais de tratamento específicas definidas no art. 11, da Lei nº 13.709, de 2018.
>
> § 1º O requerente deve, sempre que possível, evitar a inclusão de dados pessoais sensíveis nos
> grupos de informação, substituindo-os por outros dados que atendam à mesma finalidade.
>
> § 2º Não sendo possível observar o disposto no § 1º, o atendimento à finalidade deverá ser
> priorizado pela validação de dados, com o acesso aos dados pessoais sensíveis brutos sendo
> autorizado somente em caráter excepcional.

**Achado de LGPD de alto valor para o handoff LEGAL**: este é o único dispositivo, em toda a
pesquisa desta rodada, que estabelece um **princípio de minimização reforçada** para dado pessoal
sensível (categoria que inclui dado de saúde, LGPD art. 5º, II) no ecossistema de sistemas
SENATRAN — compatível com, mas mais explícito que, o já capturado em [RN-BOAT-003]
(`hospital_destination`/`health_notes` como PII alta/retenção "forever"). Nenhuma norma lida
define, porém, **qual** é a "hipótese legal específica" do art. 11 da LGPD aplicável ao dado de
saúde de vítima de sinistro (consentimento? tutela da vida/incolumidade física, art. 11, II, "e"?
exercício regular de direitos em processo administrativo, art. 11, II, "d"?) — permanece questão
jurídica em aberto, própria de parecer LEGAL.

### Art. 16 e 17 — caso de uso, hipótese legal declarada e grupos de informação _(acrescentado na revisão LEGAL de 2026-08-24)_

> Art. 16. O acesso aos dados dos sistemas e subsistemas informatizados da Senatran compreende o
> conjunto de casos de uso apresentados pelo requerente, e autorizados pela Senatran, por meio de
> Termo de Autorização de Acesso a Dados. [...]
>
> § 3º Cada caso de uso é compreendido, minimamente, pelas seguintes informações: I - modalidade de
> acesso aos sistemas e subsistemas informatizados da Senatran, podendo ser acesso direto ou
> indireto [...]; II - descrição clara e específica da finalidade do acesso; III - **hipótese legal
> de tratamento dos dados**; IV - grupos de informação; e V - justificativa da necessidade de cada
> grupo de informação, para atender à finalidade pretendida, obedecendo ao princípio da necessidade,
> estabelecido pelo art. 6º, inciso III, da Lei nº 13.709, de 2018. [...]
>
> § 7º **É vedado, a qualquer título, ceder a terceiros o acesso aos dados** de que trata o caput,
> sem prévia e expressa autorização da Senatran.
>
> Art. 17. Os grupos de informação de interesse serão definidos pelo requerente no momento da
> solicitação de acesso. [...] § 2º **A classificação do grupo de informação como público ou
> restrito, pela Senatran, dependerá da conjugação entre os parâmetros de entrada e de saída.**

**Achado de alto valor para o handoff LGPD.** O inciso III do § 3º é a **exigência formal de declarar
a hipótese legal de tratamento por caso de uso** — exatamente o que nenhuma norma faz para o dado de
saúde de vítima do RENAEST ([RN-BOAT-123]). O § 2º do art. 17 enuncia o princípio que governa
reidentificação: público ou restrito depende da **conjugação** de parâmetros, não do campo isolado
([RN-BOAT-130], [RN-BOAT-131]).

### Art. 19 e 20 — anonimização e dados abertos _(acrescentado na revisão LEGAL de 2026-08-24)_

> Art. 19. O acesso a dados anonimizados somente será autorizado caso seja possível a utilização de
> meios técnicos razoáveis e disponíveis na ocasião de seu tratamento, que garantam a não
> identificação do titular.
>
> Parágrafo único. A responsabilidade pela anonimização dos dados de forma a atender o disposto no
> caput é da Senatran.
>
> Art. 20. Os dados abertos, estruturados em formato aberto, na forma disposta no Decreto nº 8.777,
> de 11 de maio de 2016, serão disponibilizados conforme o Plano de Dados Abertos instituído pelo
> Ministério dos Transportes. [...] § 2º Os dados abertos da Senatran, constantes do Plano de Dados
> Abertos, serão processáveis por máquina, referenciados na internet e disponibilizados sob licença
> aberta, que permita sua livre utilização, consumo ou cruzamento, independentemente de solicitações
> por parte do interessado.

Aplica-se a: [RN-BOAT-131] (anonimização), [RN-BOAT-130] (divulgação estatística e dados abertos).
Note-se que a responsabilidade de anonimizar atribuída à SENATRAN alcança **os sistemas dela**; o
acervo local do DETRAN-AM é responsabilidade do próprio órgão, como controlador ([RN-BOAT-127]).

### Art. 22, § 3º e Art. 23, § 2º — regime do órgão público e régua de segurança para dado sensível _(acrescentado na revisão LEGAL de 2026-08-24)_

> Art. 22. São requisitos para o acesso aos dados dos sistemas e subsistemas informatizados de
> trânsito, **por pessoas jurídicas de direito privado**: [...]
>
> § 3º Os requisitos para o acesso aos dados dos sistemas e subsistemas informatizados de trânsito,
> **por pessoas jurídicas de direito público**, observarão o disposto em normativo específico ou
> manual técnico-operacional, elaborados pela Senatran, ou o disposto em acordos, convênios e demais
> instrumentos de cooperação.
>
> Art. 23. [...] § 2º **Caso o requerimento de acesso contenha dados pessoais sensíveis**, o nível de
> maturidade em segurança da informação observará a seguinte classificação: I - pontuação menor e
> igual a três: nível insatisfatório [...]; II - pontuação igual a quatro: nível regular [...]; e
> III - pontuação igual a cinco: nível satisfatório de maturidade em segurança da informação.

O art. 23, § 2º é a materialização normativa do princípio de que **dado sensível exige régua de
segurança mais alta** — o que era satisfatório (4) passa a regular. Precedente citável para o
patamar de segurança exigível do próprio BOAT ([RN-BOAT-124]). O art. 22, § 3º mostra que **o regime
concreto aplicável ao DETRAN-AM não está nesta Portaria**, mas em instrumento não localizado
([RN-BOAT-132]).

**Anotação — provável erro material no texto publicado.** O art. 24 dispõe que _"A perda de quaisquer
dos requisitos exigidos no **art. 21**, em qualquer tempo, sujeitará o usuário ao bloqueio do acesso
aos dados"_, mas os requisitos de acesso estão no **art. 22** (o art. 21 trata de especificações
tecnológicas). Remissão aparentemente equivocada; não altera a substância, mas deve ser citada com
a ressalva.

### Art. 21 — especificações tecnológicas via manual técnico

> Art. 21. As especificações tecnológicas para acesso aos dados dos sistemas e subsistemas
> informatizados se dará conforme o disposto em manual técnico elaborado pela Senatran.
>
> Parágrafo único. O manual técnico de que trata o caput estará disponível aos interessados nos
> canais eletrônicos definidos pela Senatran.

Reforça (terceira menção, contando os dois Manuais de 808/2020) a existência de documentação
técnica de campo/payload não localizada publicamente nesta rodada — recomenda-se, no handoff BPO,
solicitação direta à SENATRAN/DETRAN-AM (canal institucional) em vez de nova busca pública, dado o
padrão consistente de "existe, mas não é público" observado em três normas distintas.

## Índice reverso

_(ampliado na revisão LEGAL de 2026-08-24)_

| Artigo                          | Aplica-se a                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Preâmbulo (cita art. 19, XXXII) | [REF-CTB-sinistro-cena-renaest] — confirmação cruzada                                                                                  |
| Art. 2º / Art. 21               | [RN-BOAT-103], [RN-BOAT-132] — manuais técnico-operacionais: existem por norma, não são públicos                                       |
| Art. 6º, VI-VIII, XI-XII, XIV   | [RN-BOAT-124] (validação de dados), [RN-BOAT-132] (uso primário × secundário, grupo de informação)                                     |
| Art. 7º, §1º                    | [RN-BOAT-102], [RN-BOAT-127] — RENAEST entre os sistemas controlados pela Senatran                                                     |
| Art. 7º, §3º                    | **[RN-BOAT-127]** — cita art. 22, II e III do CTB, **não o IX**: sustenta a leitura de competência própria (controlador), não delegada |
| Art. 8º e 9º                    | [RN-BOAT-132] — uso primário/secundário; publicidade das finalidades                                                                   |
| Art. 16, §3º, III               | **[RN-BOAT-123]**, [RN-BOAT-126], [RN-BOAT-132] — hipótese legal declarada por caso de uso                                             |
| Art. 16, §7º                    | [RN-BOAT-132] — vedação de cessão de acesso a terceiros                                                                                |
| Art. 17, §2º                    | [RN-BOAT-130], [RN-BOAT-131] — público/restrito depende da conjugação de parâmetros (reidentificação)                                  |
| Art. 18                         | [RN-BOAT-003], **[RN-BOAT-124]** — minimização reforçada; hipótese do art. 11 da LGPD permanece indefinida ([RN-BOAT-123])             |
| Art. 19                         | [RN-BOAT-131] — anonimização                                                                                                           |
| Art. 20                         | [RN-BOAT-130] — dados abertos e Plano de Dados Abertos                                                                                 |
| Art. 22, §3º                    | [RN-BOAT-132] — regime do órgão público remetido a instrumento não localizado                                                          |
| Art. 23, §2º                    | [RN-BOAT-124] — régua de segurança mais alta para dado sensível                                                                        |
| Art. 24                         | anotação de **remissão provavelmente equivocada** ("art. 21" onde caberia "art. 22")                                                   |
