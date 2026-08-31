---
id: LEGAL-ASSESSMENT-PORTAL
title: Parecer técnico-legal — riscos, controvérsias e questões abertas do corpus do PORTAL
status: draft
apps: [portal]
sources:
  [
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
    REF-DECRETO-10543-2020,
    REF-DECRETO-8936-2016,
    REF-LEI-13146-2015-acessibilidade,
    REF-LEI-12527-2011,
    REF-CONTRAN-809-2020,
    REF-CONTRAN-918,
    REF-CONTRAN-931,
    REF-CONTRAN-900,
    REF-LEI-13709-2018,
    REF-LEI-14063-2020,
    REF-MP-2200-2-2001,
    REF-LEI-9784-1999,
    REF-CTB-280-290,
    REF-DETRANAM-SERVICOS,
  ]
updated: 2026-08-24
---

# Escopo e método

Produzido pelo especialista **LEGAL** sobre o dossiê do CRAWLER
(`transversal/portal/_intake/research-dossier.md`) e o corpus de `refs/`. Modo **confirm-extend**: a
trilha de apelação do PORTAL já estava coberta pela rodada RAIT (`RN-RAIT-001..005`, `101..132`); o
restante da superfície de serviço do PORTAL era greenfield.

Método: cada dispositivo que ancora regra foi **reconferido contra a fonte primária local** —
`pdftotext -layout` do PDF oficial do DOU para as Resoluções CONTRAN 918/2022 e 809/2020; extrações
`*_plain.txt` do HTML compilado do Planalto para as Leis 14.129/2021, 13.460/2017, 13.146/2015,
12.527/2011, 13.709/2018 e 9.784/1999 e para os Decretos 10.543/2020, 8.936/2016 e 5.296/2004.

**Regra de disciplina adotada** (a mesma das rodadas RAIT, TEAT, BOAT e PEC): onde o texto é ambíguo,
silente ou conflitante, este documento **registra a lacuna** e propõe uma leitura de trabalho
**explicitamente rotulada como interpretação**. Nenhuma lacuna foi preenchida com norma inventada,
jurisprudência não verificada ou "prática de mercado".

**Produtos desta rodada:**

- Série `transversal/portal/rules/RN-PORTAL-101` a `RN-PORTAL-128` (**28 regras legais** — primeiro
  conjunto de regras do PORTAL, que até aqui só tinha jornadas e casos de uso).
- Refinamento de quatro REF (`REF-DECRETO-10543-2020`, `REF-CONTRAN-918`, `REF-LEI-13709-2018`,
  `REF-LEI-9784-1999`) e as linhas correspondentes de `refs/INDEX.md`, incluindo cinco novas lacunas
  catalogadas.

**Não editados, por regra de fronteira** — mas com pendência registrada no §5:
`transversal/portal/APP.md`, `journeys/`, `use-cases/`, `workflows/`, `_intake/research-dossier.md`
(que contém **um erro material** — ver item 12), `_intake/ux-notes.md`, `inf/rait/rules/RN-RAIT-003`
(que merece um upgrade de base legal — ver item 1), `_meta/backlog.md` e `_meta/steering.md`.

**Correção de premissa do briefing, registrada por escrito:** o Decreto 10.543/2020 **não** define os
níveis bronze/prata/ouro da conta gov.br. Ele define os níveis de **assinatura eletrônica por ato**
(simples/avançada/qualificada), espelhando a Lei 14.063/2020. Bronze/prata/ouro é classificação
**operacional da Plataforma gov.br**, sem instrumento normativo localizado que a institua. São dois
eixos distintos e o PORTAL deve mantê-los separados — [RN-PORTAL-102].

---

# 1. Três questões estruturais

## 1.1 A adesão do Amazonas à Lei 14.129/2021 — a condição que sustenta um terço deste corpus

**Severidade: ALTA. Condiciona o fundamento (não o conteúdo) de 12 das 28 regras.**

A Lei 14.129/2021 é a espinha dorsal estatutária que o dossiê de pesquisa identificou para o PORTAL:
uso único (art. 3º, XIII), exigência de uma só vez (XII), presunção de autenticidade (art. 26),
direitos da prestação digital (art. 27), checklist funcional (arts. 20-22), CPF como identificador
(art. 28). Mas o seu art. 2º, III só a estende a Estados _"desde que adotem os comandos desta Lei por
meio de atos normativos próprios"_, e o § 2º reitera a condição. **Nenhum decreto ou lei estadual do
Amazonas de adesão foi localizado.**

Três precisões que a análise legal acrescenta ao achado do CRAWLER:

1. **A maior parte do conteúdo sobrevive à não adesão, por outra via.** A vedação de exigir nova
   prova de fato já comprovado está também no art. 5º, XV da **Lei 13.460/2017**, que alcança os
   entes federados sem cláusula de adesão. A vedação de exigir documento do próprio órgão está no
   **art. 285, § 4º do CTB** — norma de **lei**, de trânsito, aplicável a todo órgão do SNT. O CPF
   como identificador suficiente está no **art. 10-A da Lei 13.460/2017**, expresso quanto a órgãos
   _"estaduais"_. A acessibilidade está na **LBI art. 63**. O que a Lei 14.129/2021 acrescenta de
   próprio, e que se perde na não adesão, é: o dever **positivo** de interoperar (art. 24, IV-V), o
   rol expresso de direitos da prestação digital (art. 27), a presunção legal de autenticidade
   (art. 26) e a exigência de painel de monitoramento (art. 22 — relevante sobretudo ao DASHBOARD).
2. **Corolário sobre [RN-RAIT-003].** O dossiê propôs "elevar" aquela regra de prática recomendada a
   dever estatutário com base na Lei 14.129/2021. **A elevação é desnecessária**: a regra sempre teve
   fundamento de lei no art. 285, § 4º do CTB, que a captura original citava apenas indiretamente,
   pela Res. 900/2022. A correção devida em [RN-RAIT-003] não é de status — é de **base legal**.
3. **É achado negativo, não prova de inexistência**, e a verificação é barata (Diário Oficial do
   Estado / Procuradoria-Geral do Estado). Enquanto não confirmada, todas as regras afetadas trazem
   a ressalva por escrito, e nenhuma delas depende **exclusivamente** da Lei 14.129/2021 para o seu
   núcleo operacional.

Regras afetadas: [RN-PORTAL-104], [RN-PORTAL-105], [RN-PORTAL-106], [RN-PORTAL-107],
[RN-PORTAL-108], [RN-PORTAL-110], [RN-PORTAL-111], [RN-PORTAL-112], [RN-PORTAL-113],
[RN-PORTAL-117], [RN-PORTAL-122], [RN-PORTAL-124].

## 1.2 Identidade e assinatura: um parâmetro federal aplicado a uma autarquia estadual

**Severidade: ALTA. É o problema de fundamento mais subestimado da rodada.**

A matriz "ato → nível de assinatura" ([RN-PORTAL-101]) é normativamente sólida **no seu conteúdo**:
o Decreto 10.543/2020 nomeia expressamente _"a apresentação de defesa e interposição de recursos
administrativos"_ como assinatura avançada (art. 4º, II, "h"), e o autocadastro na alínea "d". Mas:

- O **âmbito** do Decreto é a _"administração pública federal direta, autárquica e fundacional"_
  (art. 1º e art. 2º, I) — e a limitação está no **caput do próprio art. 4º**, não apenas na
  disposição transitória do art. 13 como a captura original sugeria. **O DETRAN-AM é autarquia
  estadual e não está no âmbito.**
- As resoluções CONTRAN exigem _que haja_ assinatura no requerimento ([REF-CONTRAN-900] art. 3º, VI)
  e fazem da sua ausência causa de não conhecimento (art. 4º, III), mas **não definem o nível
  eletrônico** dela. É exatamente aí que a matriz preenche uma lacuna — e uma lacuna preenchida por
  decisão de arquitetura não é norma.
- Consequência prática: enquanto não houver **ato próprio do DETRAN-AM (ou do Estado)** fixando os
  níveis por serviço, cada exigência de assinatura avançada imposta pelo PORTAL é atacável sob o art.
  5º, IV da Lei 13.460/2017 — _"vedada a imposição de exigências, obrigações, restrições e sanções
  não previstas na legislação"_.

**A mitigação é desproporcionalmente barata em relação ao risco**: uma portaria do DETRAN-AM que
adote a matriz de [RN-PORTAL-101] e a publique na Carta de Serviços fecha o problema por inteiro — e
é o mesmo tipo de ação de baixo risco/alto impacto que o Owner já autorizou em `_meta/steering.md`
D.28.

## 1.3 O módulo de pagamento apoia-se em três dispositivos que ninguém tinha lido

**Severidade: ALTA. Um erro material propagado, uma pré-condição não verificada, uma renúncia sem
forma normativa.**

O **Capítulo VIII da Res. 918/2022 (arts. 24 a 27) não constava de nenhuma captura** deste
repositório antes desta rodada. Ele foi obtido do PDF oficial do DOU e acrescentado a
`refs/contran/REF-CONTRAN-918.md`. Três achados:

1. **Não existe limite de "12x".** Conferência textual integral: a palavra "doze" aparece na
   Resolução apenas nos arts. 11 e 13 (janela de reincidência e histórico de infrações), **nunca** em
   matéria de parcelamento. O art. 27 fala em _"parcelas mensais"_ e o § 12 lista exclusões
   materiais, não teto. O dossiê de pesquisa afirma "parcelamento [...] em até 12x" — **é incorreto**
   e precisa ser retirado (item 12).
2. **"Parcelamento" não é parcelamento do crédito público.** O art. 24, § 3º manda receber
   _"exclusivamente à vista e de forma integral"_; o que se parcela é a operação de cartão, "por
   conta e risco" da instituição do SPB, com encargos a cargo do titular do cartão (art. 27, § 5º).
   O órgão recebe integral; o cidadão fica devedor da administradora. Apresentar como moratória do
   DETRAN-AM é informação incorreta com consequência econômica direta ([RN-PORTAL-126]).
3. **A funcionalidade depende de dupla habilitação não verificada**: autorização do órgão máximo
   executivo de trânsito da União ao DETRAN-AM (art. 27, §§ 1º-2º) e credenciamento das processadoras
   por aquele mesmo órgão (§§ 4º e 15). Nenhum dos dois atos foi localizado. É **pré-condição de
   existência**, não detalhe de implementação (item 13).

---

# 2. Riscos, controvérsias e questões abertas (itens referenciados pelas RN)

## Item 1 — Adesão do Estado do Amazonas à Lei 14.129/2021 não localizada

Ver §1.1. **Severidade ALTA (fundamento).** Leitura de trabalho: tratar a Lei 14.129/2021 como
parâmetro fortemente recomendável, e ancorar cada regra, sempre que possível, também numa norma sem
cláusula de adesão. Ação: verificar no DOE/PGE; se houver adesão, promover as regras afetadas e
corrigir a base legal de [RN-RAIT-003] (que na verdade já tinha lei própria — CTB art. 285, § 4º).
Regras: [RN-PORTAL-104], [106], [107].

## Item 2 — Âmbito federal do Decreto 10.543/2020 e ausência de ato local sobre níveis de assinatura

Ver §1.2. **Severidade ALTA.** Leitura de trabalho: adotar a matriz como parâmetro de arquitetura e
recomendar portaria do DETRAN-AM que a positive. Regras: [RN-PORTAL-101], [102], [105].

## Item 3 — Enquadramentos por subsunção na matriz de assinatura (linhas 5, 8 e 9)

As alíneas do art. 4º do Decreto são precedidas de _"incluídos"_ — róis exemplificativos. Defesa e
recurso (alínea "h") e autocadastro (alínea "d") são **nomeados**; **indicação de condutor**
(subsunção à alínea "f": declaração prestada em virtude de lei que constitui reconhecimento de fato e
assunção de obrigação), **desistência** (paralelismo de forma) e **adesão ao SNE** (alíneas "d"/"f")
são enquadramentos por subsunção. Assimetria de risco registrada: errar **para cima** é atrito de
usabilidade; errar **para baixo** é fragilidade probatória num ato que atribui infração a terceiro —
adotou-se o lado conservador. Regra: [RN-PORTAL-101].

## Item 4 — Bronze/prata/ouro sem base normativa localizada

A página institucional da Plataforma gov.br descreve os três níveis sem citar Decreto, Portaria ou
IN. Achado negativo, não prova de inexistência; e ainda que exista o ato, seria federal e de
organização interna da Plataforma, não criando requisito oponível ao administrado perante autarquia
estadual. Leitura de trabalho: nível de conta é **meio de prova** de identidade, nunca o predicado que
autoriza o ato. Regra: [RN-PORTAL-102].

## Item 5 — Fronteira "meu dado" × "dado de terceiro" em processos com coautoria

O titular vê o próprio dado sem máscara ([RN-PORTAL-118]); a única supressão legítima é dado de
terceiro ([REF-LEI-9784-1999] art. 46). O caso difícil é o **corresponsável**: no sinistro, na
indicação de condutor e na infração com responsabilidade solidária, dados de duas pessoas convivem no
mesmo documento. Leitura de trabalho: suprimir **dado identificador de terceiro** (documento,
endereço, telefone, dado de saúde); manter visível o **fato processual** que o envolve, por integrar
o próprio processo e ser pressuposto do contraditório. Interpretação prudencial, sem texto expresso.
Regra: [RN-PORTAL-118]; conexo a [RN-BOAT-126].

## Item 6 — Assinatura avançada gov.br basta, ou o ato do cidadão exige ICP-Brasil?

Nenhuma norma de trânsito exige assinatura **qualificada** para ato do cidadão. O Decreto 10.543/2020
reserva a qualificada para transferência/registro de **bens imóveis**, atos de Presidente/Ministros e
"demais hipóteses previstas em lei" (art. 4º, III) — nenhuma das quais alcança defesa, recurso,
indicação de condutor ou adesão ao SNE. A ATPV-e é o caso mais próximo e a própria Res. 809/2020 art.
16 remete à Lei 14.063/2020, admitindo avançada. Leitura de trabalho: **avançada basta**; a
qualificada permanece aceita em qualquer interação, e a elevação depende de ato da autoridade máxima
(art. 4º, § 1º). Ponto de atenção: a Lei 14.063/2020 art. 5º, § 5º manda prevalecer a qualificada _"no
caso de conflito entre normas vigentes"_ — se surgir norma estadual divergente, a regra de conflito
puxa para cima. Regra: [RN-PORTAL-101].

## Item 7 — Prazo de resposta ao titular de dados perante o Poder Público

O art. 23, § 3º da LGPD remete a **três** regimes (Habeas Data, Lei 9.784/1999, LAI) e não elege
nenhum; os 15 dias do art. 19, II não se aplicam automaticamente ao órgão público. Nenhum ato do
DETRAN-AM fazendo a escolha foi localizado. Leitura de trabalho adotada: **20 + 10 dias (LAI)**, por
ser o único dos três com prazo numérico expresso para pedido de informação a órgão público e por ser
o regime que a própria Lei 14.129/2021 art. 30, § 2º manda aplicar a pedidos análogos. Alternativas
defensáveis: manter os 15 dias da LGPD; usar o prazo geral da Lei 9.784/1999; diferenciar por tipo de
pedido. **Definição formal cabe ao órgão.** Mesma lacuna já registrada em [RN-BOAT-126]. Regra:
[RN-PORTAL-120].

## Item 8 — Exposição de conformidade em acessibilidade

A obrigação é **de resultado** (LBI art. 63; Decreto 5.296/2004 art. 47), vinculante e **sem cláusula
de adesão** — uma das mais seguras do corpus. Mas a lei não define o padrão técnico, não fixa prazo,
não prevê sanção específica e não designa autoridade fiscalizadora própria: a exigibilidade vem por
Ministério Público, ação civil pública e órgãos de controle. Perfil de risco: **baixa frequência,
alto impacto**. O eMAG é obrigatório apenas no âmbito do **SISP federal** (Portaria nº 3/2007), fora
do qual está o DETRAN-AM. Leitura de trabalho: declarar formalmente WCAG 2.1 AA + eMAG como critério
de conformidade — custo próximo de zero, reduz materialmente a exposição. Único requisito literal da
norma: **símbolo de acessibilidade em destaque na página de entrada** (exigido duas vezes: LBI art.
63, § 1º e Decreto 5.296/2004 art. 47, § 2º). Regra: [RN-PORTAL-113].

## Item 9 — Carta de Serviços do DETRAN-AM incompleta face ao art. 7º da Lei 13.460/2017

Auditoria de `detran.am.gov.br/servicos/` (2026-08-25): catálogo extenso, ouvidoria e pesquisa de
satisfação presentes, mas **sem prazo máximo de prestação por serviço** (§ 2º, IV) e sem o
detalhamento do § 3º por serviço. É **omissão de conteúdo obrigatório**, categoria distinta das duas
exigências _contra legem_ já corrigidas em D.28. Agravante que a análise acrescenta: a omissão do
prazo **bloqueia dois outros deveres legais** — a aderência ao prazo publicado ([RN-PORTAL-108],
métrica 2) e a dimensão III da avaliação obrigatória do art. 23 ([RN-PORTAL-110]). É, portanto, o
item de conformidade com maior efeito em cascata. Contrapartida a advertir: o art. 3º, XVIII da Lei
14.129/2021 torna o compromisso publicado **oponível ao órgão** — publicar prazo irreal é pior que
publicar prazo folgado. Regras: [RN-PORTAL-108], [110].

## Item 10 — As duas exigências _contra legem_ do DETRAN-AM, reforçadas pelas normas desta rodada

As duas exigências documentadas em [REF-DETRANAM-SERVICOS] — endosso cartorial em documento
autenticado fora do AM, e juntada do parecer/conclusão da JARI pelo cidadão — já haviam sido
autorizadas a corrigir (D.28). Esta rodada **acrescenta fundamento**, o que reforça a decisão e não a
altera:

- Endosso cartorial: além da [REF-DETRANAM-PORTARIA-5046] art. 2º, I e § 2º (que já dispensava o
  cartório), agora também [REF-LEI-13460-2017] art. 5º, IX (_"vedada a exigência de reconhecimento de
  firma, salvo em caso de dúvida de autenticidade"_ — lei sem cláusula de adesão) e, se confirmada a
  adesão, [REF-LEI-14129-2021] art. 26 (presunção de autenticidade). Regra: [RN-PORTAL-104].
- Parecer da JARI: além do CTB art. 285, § 4º e da Res. 900 art. 5º, p.ú., agora também o art. 5º, XV
  da Lei 13.460/2017. Regra: [RN-PORTAL-106].

## Item 11 — CRLV-e bloqueado por multa cuja exigibilidade está suspensa por recurso

**Severidade ALTA — colisão entre duas normas, sem dispositivo que a resolva.** O art. 4º da Res.
809/2020 condiciona a expedição do CRLV-e à **quitação de multas**; o art. 286 do CTB garante recorrer
**sem recolher**, e o recurso tempestivo tem **efeito suspensivo automático** (art. 285, _caput_;
[RN-RAIT-108]). Leitura de trabalho adotada: **multa com exigibilidade suspensa por recurso tempestivo
não é "débito" para efeito do art. 4º** — o contrário converteria a impossibilidade de licenciar em
coação indireta ao pagamento, esvaziando a garantia do art. 286. É interpretação sistemática e
prudencial, **sem texto expresso**, e nenhuma resolução localizada trata do ponto. Se o parecerista
divergir, a consequência de produto é severa (quem recorre não licencia) e a tela precisa dizê-lo
antes de o cidadão escolher entre pagar e recorrer. Regra: [RN-PORTAL-116].

## Item 12 — Erro material no dossiê de pesquisa: "parcelamento em até 12x"

Ver §1.3.1. O dossiê afirma parcelamento _"por cartão de crédito/débito em até 12x"_ com base na Res.
918/2022 art. 27. **A Resolução não fixa número de parcelas.** Também há imprecisão menor na
referência a "§§1º-13" (o art. 27 tem **quinze** parágrafos). Correção registrada em
[REF-CONTRAN-918]; o dossiê está fora da fronteira de edição desta rodada (§5). Regra:
[RN-PORTAL-126].

## Item 13 — Autorização e credenciamento para arrecadação por cartão não localizados

Ver §1.3.3. **Pré-condição de existência da funcionalidade.** Verificação administrativa barata, de
resposta binária, que deve preceder qualquer desenvolvimento. Risco adicional do art. 27, § 7º: a
autorização **pode ser suspensa** por falta da prestação de contas mensal do § 6º — a funcionalidade
pode ser desligada por descumprimento administrativo do próprio órgão. Regra: [RN-PORTAL-126].

## Item 14 — PIX não nomeado em norma CONTRAN

O art. 24, § 2º manda pagar _"na rede bancária arrecadadora"_; o § 3º cita o SPB, mas sintaticamente
ligado ao **parcelamento por cartão**; o art. 27 nomeia apenas cartões. O PIX integra o SPB. Leitura
de trabalho: o PIX cabe no art. 24, § 2º (à vista, integral, documento padronizado), desde que
preservado o repasse automático ao FUNSET — **gap de nomeação, não necessariamente de cobertura**.
Recomenda-se confirmação com a SENATRAN antes de anunciar PIX como meio oficial, porque o interesse
protegido pelo art. 24 é justamente a garantia do repasse. Regra: [RN-PORTAL-125].

## Item 15 — Desconto de 40% fora do SNE: a declaração de renúncia não tem forma normativa

**Severidade ALTA.** O Owner decidiu (C.17) aplicar o desconto mesmo sem adesão do órgão ao SNE,
seguindo o CTB art. 284, § 6º (Lei 14.599/2023). Duas pendências, uma já conhecida e outra nova:

- **Conhecida**: o procedimento de emissão do documento de arrecadação com desconto fora do SNE
  continua indefinido (`_meta/steering.md`, "Pontos que a múltipla escolha não fechou").
- **Nova, e mais grave**: fora do SNE **não existe o campo normativo** em que o infrator declara a
  opção por não apresentar defesa nem recurso (Res. 918 art. 21; Res. 931 art. 9º, § 1º, I). Essa
  declaração teria de ser colhida pelo próprio PORTAL, com valor jurídico não normatizado — e o
  objeto dela é **renúncia a direito de defesa**. É a fragilidade probatória mais séria do módulo de
  pagamento. Mitigação mínima enquanto não houver norma: confirmação em duas etapas, texto de renúncia
  versionado, registro de qual versão foi exibida e quando. Regra: [RN-PORTAL-128].

## Item 16 — CTB art. 159, § 5º ("somente [...] em original") convivendo com a paridade da Lei 15.428/2026

A redação de 2026 estabelece paridade plena entre CNH física e digital (inciso I) e fé pública em
ambos os meios (inciso III), mas o § 5º permanece. Leitura de trabalho: a **versão digital oficial no
aplicativo oficial é ela própria o "original"**, e o que o § 5º exclui é a _cópia_ (fotocópia, foto na
galeria, captura de tela). Consequência de produto: exportar imagem do documento produz cópia, não
documento. Recomenda-se ainda avaliar se a Lei 15.428/2026 impacta outros artefatos do corpus que
citam a CNH — em especial os documentos de identificação exigidos em defesa/recurso
([REF-CONTRAN-900] art. 5º, III), onde a equivalência a documento de identidade pode dispensar
exigências hoje praticadas. Regras: [RN-PORTAL-115], [117].

## Item 17 — Instrumento técnico da Carteira Digital de Trânsito não localizado; e o portal estadual como superfície de documento oficial

Não foi localizada resolução ou portaria autônoma dedicada ao aplicativo ("CNH do Brasil"/CDT); a Res.
809/2020, apontada por fontes de imprensa, trata exclusivamente de CRLV-e/ATPV-e — provável confusão
de fonte secundária. Pistas não confirmadas: Res. CONTRAN 1.020/2025 e 1.027/2026. Questão jurídica
correlata e ainda mais relevante: a Res. 809/2020 art. 6º, § 1º fala em _"aplicativos oficiais do
Governo Federal"_; se o DETRAN-AM optar por **superficiar o documento no seu próprio portal**, convém
confirmar a legitimidade dessa exibição com a SENATRAN antes de tratá-la como equivalente ao app
oficial. Regras: [RN-PORTAL-115], [117].

## Item 18 — O art. 20 da LGPD não garante revisão humana; e a automatização da admissibilidade

A redação original dizia "revisão, **por pessoa natural**"; a expressão foi suprimida pela Lei
13.853/2019 e a tentativa de reintroduzi-la (§ 3º) foi **VETADA**. Quem sustentar que a LGPD obriga
revisão humana está citando texto que não vigora. No PORTAL a revisão é humana **por outro
fundamento**: a admissibilidade é juízo do órgão ([REF-CONTRAN-900] art. 4º; [RN-RAIT-001]) e a
decisão administrativa exige motivação. Risco correlato já identificado na rodada RAIT e aqui
agravado pela automação: o inciso IV do art. 4º ("pedido incompatível com a situação fática") é o
único que exige juízo de conteúdo — automatizá-lo materializaria o risco de julgamento antecipado de
mérito por via de triagem ([RN-RAIT-122]). A decisão de steering C.23 (restringir o inciso IV à
**ausência formal de pedido**) é o que torna essa parte automatizável com segurança. Regra:
[RN-PORTAL-122].

## Item 19 — Portabilidade: direito enunciado sem regulamentação e sem destinatário

O art. 18, V condiciona a portabilidade à _"regulamentação da autoridade nacional"_, não localizada
para o setor público; e não existe, no ecossistema de trânsito, "outro fornecedor de serviço ou
produto" para quem portar um prontuário de condutor — o registro é nacional, único e legalmente
atribuído aos órgãos do SNT. Leitura de trabalho: **não oferecer portabilidade**; oferecer
**exportação** do próprio dado em formato legível por máquina, gratuita (art. 19, § 2º), e não chamá-la
de portabilidade. Registro correlato: os incisos VI, VIII e IX do art. 18 pressupõem **consentimento**
e são materialmente inaplicáveis a tratamento fundado em competência legal (art. 23, _caput_) — expor
no produto direitos que não se pode exercer é pior do que não os enunciar. Regras: [RN-PORTAL-119],
[121].

## Item 20 — Vista do processo: Lei 9.784/1999 (federal) aplicada a órgão estadual

O direito de ter ciência da tramitação, vista dos autos e cópias (art. 3º, II e art. 46) é o lastro do
módulo "meus processos". O CTB não disciplina vista de autos no processo de infração, então a lacuna
existe e a subsidiariedade do art. 69 opera — mas a extensão de lei federal de processo administrativo
a órgão estadual é **a mesma questão aberta** já registrada para a Lei 9.873/1999 e respondida pelo
Owner sem parecer formal (`_meta/steering.md` C.13). Mitigação relevante: o núcleo do direito à vista
tem assento constitucional (CF/88 art. 5º, LV), o que o torna pouco vulnerável independentemente da
via. Regra: [RN-PORTAL-112].

## Item 21 — Ouvidoria: contagem do prazo, e o risco de o cidadão usar o canal errado

(a) A Lei 13.460/2017 diz "trinta dias" sem qualificar corridos ou úteis; nada no CTB alcança a
ouvidoria e o regime subsidiário natural é o da Lei 9.784/1999 art. 66 — leitura adotada, coerente
com [RN-RAIT-005], mas sem norma expressa. (b) **Risco de UX com consequência jurídica**: manifestar-se
na ouvidoria **não** interrompe nem suspende prazo processual ([RN-RAIT-105]). Um cidadão que reclama
na ouvidoria em vez de recorrer perde o prazo. O PORTAL tem o dever de avisá-lo antes. O mesmo vale
para o requerimento de titular de dados ([RN-PORTAL-120]): **três relógios independentes convivem no
mesmo produto** e não se comunicam. Regras: [RN-PORTAL-109], [120].

## Item 22 — "Ranking das entidades" (art. 23, § 2º) num órgão isolado

O dispositivo manda publicar _"o ranking das entidades com maior incidência de reclamação"_ — no
plural e no nível de entidade, o que um DETRAN estadual isolado não produz. Leitura de trabalho:
publicar ranking **por serviço** (ou por unidade de atendimento) dentro do órgão, atendendo ao
propósito de transparência comparativa sem forçar o texto; e observar que o parágrafo único do art. 22
da Lei 14.129/2021 sugere que o ranking **entre entes** é tarefa de quem agrega (Plataforma gov.br),
não de cada órgão. Regra: [RN-PORTAL-110].

## Item 23 — Formato acessível do documento de arrecadação padronizado

A LBI art. 62 assegura receber cobranças em formato acessível mediante solicitação; a Res. 918/2022
art. 24 impõe o **documento próprio de arrecadação estabelecido pelo órgão máximo da União**, cujo
leiaute o DETRAN-AM não define e não pode substituir (é ele que garante o repasse ao FUNSET). Leitura
de trabalho: a versão acessível **acompanha** o documento padronizado como representação alternativa
do conteúdo, sem substituí-lo para fins de arrecadação. Nenhuma norma localizada trata da versão
acessível do documento de arrecadação de trânsito — lacuna normativa; a solução é prudencial. Regra:
[RN-PORTAL-114].

## Item 24 — Índice de correção da restituição (herdado, ainda aberto)

O CTB art. 286, § 2º menciona a **UFIR**, extinta, "ou índice legal de correção dos débitos fiscais".
Owner decidiu (C.25) usar o índice fiscal padrão do estado do AM, **mas o índice específico ainda não
foi identificado** junto à área fazendária estadual. Efeito no PORTAL: é possível informar que há
restituição devida, não o seu valor. Regra: [RN-PORTAL-127]; herdado de [RN-RAIT-129].

## Item 25 — Momento em que a adesão ao SNE produz efeito

O SNE é sistema **da União**; o DETRAN-AM é aderente, não operador. Se a adesão feita pelo PORTAL
produz efeito no aceite ou na confirmação pelo SNE **não está normatizado**, e a diferença é
juridicamente relevante: notificação expedida no intervalo pode ser disputada. Leitura de trabalho:
registrar os dois carimbos de tempo, tratar como efetiva a data de confirmação pelo SNE, e informá-la
ao cidadão. Correlato: a ciência ficta é a regra de maior potencial de litígio do corpus do PORTAL —
produz perda de prazo sem que o cidadão tenha lido nada —, o que torna a prova de que ele foi
informado dos efeitos ao aderir um ativo de defesa do órgão. Regra: [RN-PORTAL-123]; regime em
[RN-RAIT-124].

## Item 26 — Conformidade do comprovante do Protocolo Virtual do Estado ao art. 6º, § 2º

Dúvida registrada em [REF-DETRANAM-SERVICOS] e **ainda não resolvida**: o comprovante emitido pelo
Protocolo Virtual do Estado contém identificação e assinatura do recebedor, identificação do órgão de
trânsito e data do recebimento? Sem isso, a prova da tempestividade fica frágil para todo protocolo
feito por aquele canal — que é canal do Estado, não do DETRAN-AM. Verificação operacional barata,
impacto direto sobre [RN-RAIT-106]. Regra: [RN-PORTAL-124].

---

# 3. O que foi verificado e está firme (para não re-litigar)

| Ponto                                                                             | Status                                                                                                                                                 |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Defesa e recurso administrativo exigem assinatura **avançada**                    | **Firme quanto ao conteúdo** — nomeado literalmente no Decreto 10.543/2020 art. 4º, II, "h". A ressalva é de **âmbito** (item 2), não de classificação |
| Ouvidoria **não** admite exigência de nível mínimo de assinatura                  | **Firme** — art. 2º, p.ú., III do Decreto exclui expressamente os sistemas de ouvidoria; convergente com Lei 13.460/2017 arts. 10, §1º e 11            |
| CPF é identificador suficiente, vedada a exigência de outro número                | **Firme e independente do item 1** — art. 10-A da Lei 13.460/2017 é expresso quanto a órgãos estaduais e não tem cláusula de adesão                    |
| Vedação de exigir documento emitido pelo próprio órgão                            | **Firme, com fundamento de lei** — CTB art. 285, § 4º (não apenas Res. 900 art. 5º, p.ú.)                                                              |
| Vedação de exigir reconhecimento de firma salvo dúvida                            | **Firme** — Lei 13.460/2017 art. 5º, IX; reforçado pela Portaria DETRAN-AM 5046/2018                                                                   |
| Acessibilidade de sítio governamental é obrigação vinculante                      | **Firme** — LBI art. 63 e Decreto 5.296/2004 art. 47; sem cláusula de adesão. O que **não** vincula por si é o eMAG (SISP federal)                     |
| CNH tem paridade jurídica plena física/digital, a critério do condutor            | **Firme** — CTB art. 159, I e III, redação da Lei 15.428/2026                                                                                          |
| CRLV-e dispensa via impressa e é suficiente para o art. 133 do CTB                | **Firme** — Res. 809/2020 art. 6º, §§ 1º-2º                                                                                                            |
| Recorrer **não** exige recolher; antecipar pagamento **não** prejudica o processo | **Firme** — CTB art. 286, _caput_ e art. 284, § 2º; Res. 918 art. 33                                                                                   |
| A faixa de 40%/60% é a **única** em que pagar extingue defesa e recurso           | **Firme** — CTB art. 284, § 2º, parte final, c/c § 1º                                                                                                  |
| O SNE **não** permite parcelamento                                                | **Firme** — Res. 931/2022 art. 9º, § 4º                                                                                                                |
| Recebimento de multa pela rede arrecadadora é à vista e integral                  | **Firme** — Res. 918/2022 art. 24, § 3º                                                                                                                |
| Prazos de ouvidoria: 30+30 (usuário) e 20+20 (interno)                            | **Firme quanto aos números** — Lei 13.460/2017 art. 16; aberto apenas o modo de contagem (item 21)                                                     |
| Prazo LAI: imediato; senão 20 + 10                                                | **Firme** — Lei 12.527/2011 art. 11, §§ 1º-2º. Aberta apenas a **escolha** desse regime para a LGPD (item 7)                                           |

---

# 4. Lista priorizada — o que um advogado humano precisa validar

| #   | Questão                                                                                      | Severidade  | Por que é prioritária                                                                                                            | Item |
| --- | -------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | **O Estado do Amazonas aderiu formalmente à Lei 14.129/2021** (art. 2º, III)?                | ALTA        | Decide o fundamento de 12 das 28 regras. Verificação barata (DOE/PGE), resposta binária, efeito imediato de promoção             | 1    |
| 2   | **O DETRAN-AM pode/deve editar portaria fixando os níveis de assinatura por serviço?**       | ALTA        | Sem ato local, toda exigência de nível avançado é atacável sob a Lei 13.460/2017 art. 5º, IV. A mitigação custa uma portaria     | 2    |
| 3   | **Multa com exigibilidade suspensa por recurso é "débito" para o art. 4º da Res. 809/2020?** | ALTA        | Se for, quem recorre não licencia — coação indireta ao pagamento. Sem dispositivo que resolva; interpretação sistemática adotada | 11   |
| 4   | **Como colher validamente a renúncia a defesa/recurso na faixa de 40% fora do SNE?**         | ALTA        | Renúncia a direito de defesa sem forma normativa. Decisão de política já tomada (C.17), mecanismo inexistente                    | 15   |
| 5   | **O DETRAN-AM tem autorização do órgão máximo da União para arrecadar por cartão/parcelar?** | ALTA        | Pré-condição de existência do módulo. Resposta binária; evita desenvolvimento inútil                                             | 13   |
| 6   | **Qual prazo o DETRAN-AM pratica para requerimentos de titular de dados?**                   | MÉDIA-ALTA  | Três regimes possíveis, nenhum eleito. O PORTAL precisa de um relógio para funcionar; mesma lacuna de [RN-BOAT-126]              | 7    |
| 7   | **A indicação de condutor exige assinatura avançada?** (subsunção à alínea "f")              | MÉDIA-ALTA  | Ato que atribui infração a terceiro; errar para baixo compromete a prova                                                         | 3    |
| 8   | **Declarar formalmente WCAG 2.1 AA + eMAG como critério de conformidade**                    | MÉDIA-ALTA  | Risco de baixa frequência e alto impacto (MP/ACP); mitigação de custo quase nulo                                                 | 8    |
| 9   | **Autorizar a correção da Carta de Serviços (prazo máximo por serviço)**                     | MÉDIA-ALTA  | Omissão de conteúdo obrigatório que bloqueia dois outros deveres legais em cascata. Análoga à decisão D.28                       | 9    |
| 10  | **A Lei 15.428/2026 (CTB art. 159) impacta outros artefatos do corpus?**                     | MÉDIA       | Texto muito recente; a equivalência da CNH a documento de identidade pode dispensar exigências hoje praticadas em defesa/recurso | 16   |
| 11  | **O PORTAL estadual pode superficiar CNH-e/CRLV-e, ou deve encaminhar ao app federal?**      | MÉDIA       | Res. 809/2020 fala em "aplicativos oficiais do Governo Federal"; confirmar com a SENATRAN                                        | 17   |
| 12  | **O PIX pode ser anunciado como meio oficial de pagamento de multa?**                        | MÉDIA       | Gap de nomeação; o interesse protegido é o repasse ao FUNSET                                                                     | 14   |
| 13  | **Qual o índice fiscal do AM para a restituição do art. 286, § 2º?**                         | MÉDIA       | Herdado de C.25; sem ele o PORTAL não calcula o valor devido                                                                     | 24   |
| 14  | **O comprovante do Protocolo Virtual do Estado atende ao art. 6º, § 2º da Res. 900?**        | MÉDIA       | Verificação operacional barata; impacto probatório direto sobre a tempestividade                                                 | 26   |
| 15  | **Fronteira "meu dado" × "dado de terceiro" em processos com corresponsável**                | MÉDIA       | Interpretação prudencial sem texto; afeta sinistro, indicação de condutor e solidariedade                                        | 5    |
| 16  | **Contagem dos 30 dias da ouvidoria: corridos ou úteis?**                                    | BAIXA-MÉDIA | Sem norma expressa; leitura subsidiária adotada                                                                                  | 21   |
| 17  | **Ranking do art. 23, § 2º num órgão isolado**                                               | BAIXA       | Interpretação adotada atende ao propósito; risco reputacional, não jurídico                                                      | 22   |
| 18  | **Versão acessível do documento de arrecadação padronizado**                                 | BAIXA       | Lacuna normativa; solução prudencial não contraria o art. 24                                                                     | 23   |

---

# 5. Pendências de edição fora da fronteira desta rodada

Registradas para quem detiver a fronteira dos respectivos arquivos:

1. **`transversal/portal/_intake/research-dossier.md`** — contém **erro material**: "parcelamento por
   cartão de crédito/débito **em até 12x**" (§6). A Res. 918/2022 não fixa número de parcelas
   (item 12). Também: "art. 27, §§1º-13" onde o artigo tem **quinze** parágrafos.
2. **`inf/rait/rules/RN-RAIT-003`** — a base legal cita apenas [REF-CONTRAN-900] art. 5º, p.ú. e art. 10. Deve citar também o **CTB art. 285, § 4º**, que é norma de **lei** e torna desnecessária a
   "elevação estatutária" via Lei 14.129/2021 discutida no dossiê (item 1.2 do §1.1).
3. **`transversal/portal/APP.md`** — §Escopo e §Missão poderiam referenciar a série RN-PORTAL como
   camada legal do app; o arquivo foi ampliado em paralelo pelo BPO nesta mesma rodada e não foi
   tocado aqui.
4. **`transversal/portal/use-cases/*` e `workflows/*`** — os UC-PORTAL-010..019 e WF-PORTAL-001..004
   produzidos em paralelo pelo BPO devem receber, em revisão futura, os vínculos explícitos às RN
   desta série (em especial [RN-PORTAL-101] no WF-PORTAL-002, [RN-PORTAL-108..110] no WF-PORTAL-004 e
   [RN-PORTAL-123..124] no WF-PORTAL-003).
5. **`_meta/steering.md`** — quatro itens novos para o Owner: adesão à Lei 14.129/2021 (item 1);
   portaria de níveis de assinatura (item 2); autorização de arrecadação por cartão (item 13);
   correção da Carta de Serviços com prazo por serviço (item 9, análogo a D.28).
6. **`_meta/backlog.md`** — as cinco lacunas novas catalogadas em `refs/INDEX.md` §"Lacunas
   acrescentadas pela revisão LEGAL da rodada PORTAL".
7. **`transversal/dashboard/**`** — os deveres monitoráveis explicitados em [RN-PORTAL-108],
   [RN-PORTAL-109], [RN-PORTAL-110] e [RN-PORTAL-113] foram escritos com fórmula e denominador para
   serem consumidos pelo DASHBOARD; a fronteira daquele app é de outro agente e não foi tocada.
