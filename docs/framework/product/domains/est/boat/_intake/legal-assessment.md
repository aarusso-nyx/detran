---
id: LEGAL-ASSESSMENT-BOAT
title: Parecer técnico-legal — riscos, controvérsias e questões abertas do corpus do BOAT
status: draft
apps: [boat]
sources:
  [
    REF-CTB-sinistro-cena-renaest,
    REF-CONTRAN-808-2020,
    REF-LEI-13614-2018,
    REF-SENATRAN-PORTARIA-139-2025,
    REF-LEI-13709-2018,
    REF-CONTRAN-1025-2026,
    REF-DETRANAM-TALAO-BODYCAM,
  ]
updated: 2026-08-24
---

# Escopo e método

Produzido pelo especialista **LEGAL** sobre o dossiê do CRAWLER (`_intake/research-dossier.md`) e o
corpus de `refs/`. Método: cada dispositivo que ancora regra foi **reconferido contra a fonte
primária local** — `pdftotext -layout` do PDF oficial do DOU para a Res. CONTRAN 808/2020 e a
Portaria SENATRAN 139/2025, `planalto_plain.txt` para o CTB, HTML compilado do Planalto para a Lei
13.614/2018 e para a LGPD.

**Regra de disciplina adotada** (a mesma das rodadas RAIT e TEAT): onde o texto é ambíguo, silente ou
conflitante, este documento **registra a lacuna** e propõe uma leitura de trabalho **explicitamente
rotulada como interpretação**. Nenhuma lacuna foi preenchida com norma inventada, jurisprudência não
verificada ou "prática de mercado".

**Produtos desta rodada:** a série `est/boat/rules/RN-BOAT-101` a `RN-BOAT-132` (32 regras legais);
revisão cirúrgica, com nota em arquivo, de `RN-BOAT-001` a `RN-BOAT-004`; captura de um REF novo
(`refs/leis/REF-LEI-13709-2018` — LGPD) e refinamento de cinco REF existentes
(`REF-CONTRAN-808-2020`, `REF-SENATRAN-PORTARIA-139-2025`, `REF-CTB-sinistro-cena-renaest`,
`REF-CONTRAN-1025-2026`, `REF-DETRANAM-TALAO-BODYCAM`), com as linhas correspondentes de
`refs/INDEX.md`.

**Não editados, por regra de fronteira** — mas com pendência registrada no §6: `est/boat/APP.md`
(§Âncoras legais ainda diz "(fonte pendente)", hoje superado), `est/boat/workflows/WF-BOAT-001.md`
(§Prazos), `est/boat/use-cases/*`, `shared/glossary.md`, `shared/actors.md`, `_meta/backlog.md`.

---

# 1. Auditoria de RN-BOAT-001 a 004

Nenhuma das quatro regras foi **contradita** pelas novas fontes. **Uma sofreu correção material**;
três foram **confirmadas com upgrade de fonte**, sendo que em duas o "(fonte pendente)" foi fechado.

| Regra                                                | Resultado                                                                                | O que mudou                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **RN-BOAT-001** (gravidade sempre obrigatória)       | **Confirmada; "(fonte pendente)" requalificado; duas precisões acrescentadas**           | A regra **não tem nem terá** base legal direta — o achado negativo foi confirmado por busca exaustiva no CTB. O que passou a existir é a **cadeia de competência** (CTB art. 19, XI; Res. 808/2020 arts. 4º, I e 8º, II) e a **qualificação do status**: padrão técnico-administrativo, não norma ([RN-BOAT-111]). Precisão material: `severity` (vítima) e `gravidade` (sinistro) são **duas classificações de níveis distintos**, e a regra de derivação entre elas não tem fonte. Registrado que o CTB **não define "vítima"** e que `severity` é, ele próprio, dado sensível de saúde                                            |
| **RN-BOAT-002** (RENAEST exige vítima por gravidade) | **Confirmada, com upgrade parcial de fonte e uma delimitação**                           | Fundamento **indireto** localizado: dever de atestar consistência (Res. 808/2020 art. 4º, § 3º) e homologação federal (art. 5º). A formulação concreta do gate continua sendo contrato de mock — a instrução "trate como requisito técnico até confirmação normativa" **permanece válida**. Delimitação acrescentada: consistência **local** (DETRAN) e homologação **nacional** são dois momentos, dois responsáveis, dois fundamentos. Advertência: tratar `REJEITADO` como terminal sem retificação é decisão de contrato, não norma                                                                                              |
| **RN-BOAT-003** (acesso reforçado a dado de vítima)  | **CORRIGIDA — a marcação de retenção é juridicamente insustentável**; base legal fechada | `"retention": "forever"` para dado **identificado** contraria os arts. 15 e 16 da LGPD, em que a **eliminação é a regra** e a conservação ampla exige **anonimização** (art. 16, IV). Substituída por política em duas camadas ([RN-BOAT-125]). Fechado o "(fonte pendente)": a proteção decorre de lei (LGPD arts. 5º, II; 11; 46) e de duas normas setoriais. Escopo ampliado: o regime alcança **todos** os dados de saúde da vítima, inclusive `severity`, `medical_care`, `death_at_scene` e `death_at` — hoje não classificados como sensíveis no blueprint. **A base legal do tratamento continua em aberto** ([RN-BOAT-123]) |
| **RN-BOAT-004** (registro grave exige dados mínimos) | **Confirmada; "(fonte pendente)" fechado; três acréscimos**                              | Âncora localizada: [REF-CONTRAN-808-2020] art. 4º, § 3º — _"Os órgãos que realizam o registro do BAT atestarão a consistência dos dados coletados"_. A regra deixa de ser "qualidade de registro" e passa a ser **cumprimento de dever normativo de atestação**, o que exige que a atestação seja **ato identificado**, não efeito colateral da transição de estado. Acréscimos: a completude depende do **regime jurídico da cena** (com/sem vítima), faltam **hora de liberação da via e fundamento**, e há hipóteses de encerramento hoje não previstas (veículo removido sem responsável; registro recebido de outra origem)     |

---

# 2. Quatro questões estruturais

## 2.1 Base legal do tratamento de dado de saúde da vítima — a lacuna nº 1 do corpus

**Severidade: ALTA. Bloqueia decisão de modelo de dados, de retenção e de acesso.**

O núcleo do registro de sinistro é **dado pessoal sensível**: gravidade da vítima, óbito,
atendimento médico, destino hospitalar e notas de saúde são todos _"dado referente à saúde"_
([REF-LEI-13709-2018] art. 5º, II). Não é um campo acessório que se possa desligar: `severity` é
obrigatório ([RN-BOAT-001]) e determina a gravidade transmitida ao RENAEST ([RN-BOAT-002]).

**Nenhuma norma diz sob qual hipótese esse tratamento é lícito.** A Res. CONTRAN 808/2020 manda
observar a LGPD no envio entre órgãos (art. 5º, § 5º); a Portaria SENATRAN 139/2025 manda observar
_"as hipóteses legais de tratamento específicas definidas no art. 11"_ (art. 18) — **sem indicar
qual**. Ironicamente, a mesma Portaria **exige de terceiros** que declarem a _"hipótese legal de
tratamento dos dados"_ em cada caso de uso (art. 16, § 3º, III): o padrão que a União impõe a quem
acessa seus sistemas é justamente o que falta ao próprio dado de sinistro.

**Posição prudencial adotada** ([RN-BOAT-123]): base principal no **art. 11, II, "a"** (cumprimento
de obrigação legal — o DETRAN-AM é obrigado a coletar pelo CTB art. 22, IX e a enviar pela Res.
808/2020 art. 9º, II, e o BAT tem a vítima como categoria normativa de dado), com base concorrente
no **art. 11, II, "b"** (política pública prevista em lei — Pnatrans). Três exclusões deliberadas,
igualmente importantes:

- **Consentimento (art. 11, I) é inadequado** — em cena de sinistro o titular está ferido,
  inconsciente ou morto; e sua revogação não poderia ser atendida, porque o tratamento continuaria
  obrigatório. Coletar consentimento aqui criaria aparência de escolha inexistente.
- **A alínea "e"** (proteção da vida/incolumidade física) sustenta **o socorro**, não a guarda
  registral posterior. É o erro mais provável nesta matéria.
- **A alínea "f"** (tutela da saúde) é **textualmente indisponível** ao DETRAN-AM: vale
  _"exclusivamente, em procedimento realizado por profissionais de saúde, serviços de saúde ou
  autoridade sanitária"_.

**A posição adotada gera obrigações imediatas**, que não são opcionais: publicidade da dispensa de
consentimento (art. 11, § 2º c/c art. 23, I — hoje **não cumprida**: a página de LGPD do DETRAN-AM
não menciona dado de saúde nem vítima de sinistro), registro da hipótese legal por caso de uso, e
vinculação estrita à finalidade.

**Recomendação:** **Relatório de Impacto à Proteção de Dados** ([REF-LEI-13709-2018] art. 38) e
consulta ao CPPD e ao Encarregado do DETRAN-AM **antes** de consolidar o modelo de dados de vítima.
O padrão de lacuna é o mesmo já identificado na rodada TEAT para a bodycam (§2.3 de
`inf/teat/_intake/legal-assessment.md`): governança LGPD institucional existente, sem tratamento do
caso de uso sensível específico.

## 2.2 O prazo de transmissão que desapareceu — e por quê

**Severidade: alta em governança institucional; média em produto.**

Este é o raro caso em que a pesquisa não encontra a norma **porque ela foi revogada e a delegação
não foi cumprida**. A cronologia é precisa:

1. **2018** — a Lei 13.614/2018 cria o art. 326-A, § 9º do CTB, com prazo expresso: os dados
   estaduais são repassados à União _"até o dia 1º de março"_, por meio do _"sistema de registro
   nacional de acidentes e estatísticas de trânsito"_.
2. **2020** — a Res. CONTRAN 808/2020 regulamenta o RENAEST, mas fixa **apenas prazo de integração
   institucional** (4 de janeiro de 2022, art. 16); nenhum prazo por registro.
3. **2023** — a Lei 14.599/2023 dá nova redação ao § 9º e **suprime a data**, substituindo-a por
   _"conforme regulamentação do Contran"_.
4. **Até esta pesquisa** — nenhum ato do CONTRAN posterior a 2023 restabelecendo prazo periódico foi
   localizado. A remissão está **descumprida**.

Resultado: hoje **não existe prazo vigente** de transmissão de sinistro ao RENAEST. Marcos temporais
correlatos existem e **não são este prazo**: fornecimento mensal obrigatório de dado estatístico
(CTB art. 19, § 3º, vinculado ao inciso X), publicação mensal federal (Res. 808/2020 art. 8º, V),
divulgação do índice do Pnatrans até 30 de abril (art. 326-A, § 12).

**Posição prudencial** ([RN-BOAT-106]): adotar **periodicidade mensal** como parâmetro de trabalho,
por convergência do art. 19, § 3º com o art. 8º, V — com três condições: é **configuração
versionada do órgão**, jamais constante de código; **não** pode ser apresentado como "prazo legal";
e **não deve produzir bloqueio**, apenas alerta, porque o atraso não gera hoje consequência jurídica
identificável. **Recomendação:** consulta formal do DETRAN-AM à SENATRAN sobre a periodicidade
esperada, em vez de fixação unilateral.

## 2.3 Três regimes jurídicos de cena comprimidos em um booleano

**Severidade: média — decisão de produto com efeito jurídico direto.**

O CTB distingue, na cena do sinistro, **três regimes com sujeitos, fatos geradores e penalidades
diferentes**: art. 176 (condutor **envolvido**, sinistro **com vítima**, **cinco deveres
autônomos**, gravíssima ×5 + suspensão + recolhimento do documento); art. 177 (condutor **não
necessariamente envolvido**, que recusa socorro **solicitado pela autoridade**, grave); art. 178
(sinistro **sem vítima**, dever único de remover o veículo para a fluidez, média). O modelo de dados
representa tudo isso por `CrashVehicle.evaded`.

Duas consequências concretas: o AIT lavrado a partir do registro **carece do fato específico** que o
fundamenta — fragilidade direta na defesa ([WF-INF-001]) —, e a estatística estadual não distingue
condutas que a lei distingue. Estrutura mínima de captura proposta em [RN-BOAT-117], com a
observação de que o registro do **impedimento** ("podendo fazê-lo" é elemento do tipo) é tão
relevante quanto o da omissão.

Some-se a **tensão preservar × liberar** ([RN-BOAT-118]): o art. 176, III manda preservar o local
para a perícia; os arts. 176, IV e 178 mandam remover o veículo. **Não há critério normativo de
precedência** — nem por gravidade, nem por tipo de via, nem por presença de perito. E a competência
de **perícia administrativa** só é nominalmente atribuída à **PRF, em rodovia federal** (art. 20,
XIII); quem a realiza no âmbito estadual não está resolvido em nenhuma norma lida. Enquanto isso, o
mínimo defensável é registrar **hora de chegada, hora de liberação da via e fundamento da
liberação** — três dados hoje inexistentes em `CrashRecord`.

## 2.4 Parceiros: hipótese confirmada em direito, facultativa em regime, e problemática em dado de saúde

**Severidade: média — bloqueia decisão de escopo, não a operação atual.**

A missão de [APP-BOAT] ("parceiros conveniados — saúde, rodovias, seguradoras") **tem base legal
expressa**: a Res. CONTRAN 808/2020, art. 6º, § 1º nomeia Ministério da Saúde, secretarias de saúde,
SAMU, polícias civis, corpos de bombeiros e a administradora do **DPVAT**. Três qualificações
mudam o que se pode construir sobre isso:

1. **A integração é facultativa** — _"Poderão integrar"_ / _"Caso optem"_. Não há dever de que
   hospital, SAMU ou seguradora alimentem o sistema. Logo: nenhum fluxo obrigatório, nenhum SLA
   sobre ato de terceiro, nenhuma transição de estado que dependa deles ([RN-BOAT-112]).
2. **A norma não cria RBAC nem fluxo de sistema** — é governança interinstitucional. Confirmar a
   hipótese em direito **não** confirma um ator de sistema; a decisão de modelá-lo continua com o
   Owner.
3. **O DPVAT é entidade privada**, e aí há um achado que precisa de atenção: a LGPD **veda** a
   comunicação ou uso compartilhado, entre controladores, de **dado sensível referente à saúde com
   objetivo de obter vantagem econômica** (art. 11, § 4º), cujas exceções são todas de prestação de
   serviços de saúde — **seguro não é nenhuma delas**. Some-se o regime restritivo da transferência
   público→privado (arts. 26, § 1º e 27). Leitura harmônica proposta ([RN-BOAT-128]): a integração
   do art. 6º, § 1º, V alcança o **fluxo de sinistro** (ocorrência, veículos, local), **não o dado
   clínico da vítima**. E, de todo modo, a administradora do DPVAT integra-se **pela União** (§ 3º),
   não pelo DETRAN-AM — o BOAT não deve desenhar esse canal.

Em contrapartida, o corpus **subestimava** um papel que a norma atribui ao DETRAN-AM: ele é
**hub estadual obrigatório** — os demais órgãos do SNT no Amazonas **devem** integrar-se ao RENAEST
_por meio dele_ (art. 6º, § 4º), os órgãos rodoviários estaduais e municipais **enviam a ele** (art.
14), e a consolidação estadual abrange PRF, Polícia Militar, rodoviários e municípios (CTB art.
326-A, § 10). Isso exige uma **fronteira de recepção** que [WF-BOAT-001] não modela: hoje todo
registro nasce em rascunho de campo, e um registro recebido da PM ou de um município **não nasce
assim** ([RN-BOAT-113]).

---

# 3. Riscos, controvérsias e questões abertas (itens referenciados pelas RN)

## LGPD e dado de vítima

**1 — Base legal do tratamento de dado de saúde não definida por norma alguma.** _Severidade: ALTA —
item prioritário nº 1._ Ver §2.1. Posição prudencial adotada e obrigações decorrentes em
[RN-BOAT-123]; qualificação do dado em [RN-BOAT-122]; efeito sobre [RN-BOAT-003].

**2 — Retenção "forever" de dado identificado é insustentável, e não há prazo em norma alguma.**
_Severidade: alta._ A LGPD faz da eliminação a regra (art. 16); nenhuma norma de trânsito fixa prazo
de guarda do BAT ou do registro de sinistro. Modelo de duas camadas — registral identificada com
prazo, estatística anonimizada — em [RN-BOAT-125]. **A fixação do prazo é decisão do órgão**, com
apoio do Encarregado e do CPPD. Mesma lacuna já apontada para bodycam (item 42 da rodada TEAT).

**3 — Papel LGPD do DETRAN-AM não está resolvido: controlador, co-controlador ou operador?**
_Severidade: média-alta._ A Portaria 139/2025 art. 7º, § 3º refere-se a atribuições _"delegadas pela
Senatran, nos termos do art. 22, incisos II e III"_ — **não cita o inciso IX** (sinistro). Leitura
adotada: controlador quanto ao registro estadual, porque a competência é própria e não delegada
([RN-BOAT-101], [RN-BOAT-127]). Consequência prática da dúvida: **quem responde perante a ANPD e
perante o titular por um vazamento de dado de vítima**.

**4 — Acesso do interessado ao registro que contém dado de saúde de terceiro.** _Severidade: média._
O autuado que precisa do registro de sinistro para instruir defesa ([WF-INF-001]) esbarra na
proteção do dado da vítima. Solução de trabalho: fornecer o registro com **supressão dos campos de
saúde de terceiros**, salvo requisição de autoridade — não negar o acesso ao registro inteiro
([RN-BOAT-126]). Mesma tensão do item 43 da rodada TEAT, aqui com dado sensível.

**5 — Compartilhamento com a administradora do DPVAT esbarra no art. 11, § 4º da LGPD.**
_Severidade: alta se o fluxo for priorizado; baixa enquanto não for._ Ver §2.4 e [RN-BOAT-128].

**6 — Bodycam na cena do sinistro agrava as três lacunas já identificadas.** _Severidade: alta._
"Atendimento a sinistros de trânsito" é a **primeira hipótese** de gravação obrigatória (Portaria
DETRAN-AM 003/2026, art. 4º, I) — e o material gravado contém **dado sensível de saúde de terceiro**
que não é parte de processo algum ([REF-LEI-13709-2018] art. 11, § 1º: o regime alcança qualquer
tratamento que **revele** dado sensível). A Portaria não menciona a LGPD, não fixa retenção e não
inclui o interessado no rol de acesso. **Recomendação mantida: não integrar o acervo de bodycam ao
BOAT como fonte consultável** enquanto não houver a Portaria complementar do art. 16
([RN-BOAT-129], [RN-TEAT-141], [RN-TEAT-142]).

**7 — Campo livre `health_notes` é o mais difícil de sustentar sob o teste de "indispensável".**
_Severidade: média._ Texto livre sobre saúde de terceiro, preenchido em campo, sem vocabulário
controlado. Recomendação: substituir por campos estruturados de finalidade delimitada; se mantido,
orientar expressamente que ali **não** se registram diagnóstico, prontuário, histórico de saúde ou
qualquer dado clínico não indispensável ([RN-BOAT-124]). Mesmo problema de sobrecarga do campo
Observações do TEAT ([RN-TEAT-109]), aqui com dado sensível dentro.

**8 — Anonimização de sinistro é tecnicamente difícil e frequentemente confundida com
pseudonimização.** _Severidade: média-alta._ Local + instante + veículo reidentificam a vítima com
facilidade; e manter tabela de correspondência **não é anonimização** ([RN-BOAT-131]). Se a
anonimização não for alcançável, a consequência jurídica é direta: o dado continua pessoal e
continua sujeito a prazo e base legal.

## RENAEST — institucional

**9 — Dissonância nominal entre a lei ("sinistro") e a resolução que institui o sistema
("acidente").** _Severidade: média (citação e escopo)._ Nenhuma resolução de atualização
terminológica pós-Lei 14.599/2023 foi localizada. A identidade dos dois é de altíssima
probabilidade, mas nenhum instrumento a amarra. Regra prática: transcrever "acidente" quando se cita
a Res. 808/2020 — "corrigir" a citação seria adulterar fonte ([RN-BOAT-102], [RN-BOAT-110]).

**10 — Prazo de transmissão inexistente.** _Severidade: alta (institucional)._ Ver §2.2 e
[RN-BOAT-106].

**11 — Manuais, normativo específico do BAT e manuais técnico-operacionais: obrigação vinculada a
documento não público.** _Severidade: ALTA — bloqueia o mapeamento campo-a-campo._ Três normas de
anos diferentes (Res. 808/2020 arts. 3º p.ú., 4º § 1º e 5º §§ 3º-4º; Portaria 139/2025 arts. 2º e 21) vinculam a conduta do órgão a documentos que a pesquisa não localizou. O DETRAN-AM está obrigado
a registrar "em conformidade com os Manuais" que não pode ler publicamente. **A via é solicitação
institucional, não pesquisa pública** ([RN-BOAT-103], [RN-BOAT-132]).

**12 — Classificação de gravidade sem critérios públicos.** _Severidade: média-alta._ É padrão
técnico-administrativo sob competência legal da SENATRAN (CTB art. 19, XI; Res. 808/2020 art. 8º,
II), cujo valor concreto não tem assento em lei e cujo documento-fonte não é público. Riscos:
inconsistência entre agentes (o que é "ferido" sem critério?) e divergência com o padrão federal,
com necessidade de reclassificação retroativa. Some-se que **o CTB não define "vítima"** e que
**não há marco temporal normativo para o óbito posterior** que reclassifica o registro — os 30 dias
citados por fonte secundária **não foram confirmados em norma brasileira** ([RN-BOAT-111]).

**13 — Efeito da não-validação e retificação pós-rejeição não são disciplinados.** _Severidade:
média._ A Res. 808/2020 descreve os três níveis de validação, mas **não fixa prazo, forma, efeito da
não-validação nem devolução ao nível inferior**. O mock trata `REJEITADO` como terminal sem
correção — decisão de contrato técnico, **não** norma ([RN-BOAT-104]).

**14 — Integração institucional vencida em 04/01/2022, sem sanção cominada.** _Severidade: média._
Se o DETRAN-AM hoje não envia dados ao RENAEST por meio algum, há inadimplemento que **antecede e
independe** do projeto de software. Fato a apurar com o órgão, não pesquisável em norma
([RN-BOAT-108]).

**15 — Coordenador de RENAEST: designação obrigatória, ato não localizado.** _Severidade:
baixa-média._ A revisão da listagem oficial de Portarias Normativas do DETRAN-AM não encontrou o
ato. O produto não resolve isso, mas **não deve desenhar o envio nacional como ato anônimo do
sistema** ([RN-BOAT-105]).

**16 — A Polícia Militar é fonte de dado a consolidar pelo Estado (CTB art. 326-A, § 10, II) mas não
figura no rol do art. 6º da Res. 808/2020.** _Severidade: média._ A via de entrada do dado da PM é
provavelmente o convênio DETRAN-AM/BPTRAN — **cujo instrumento formal não foi localizado** (mesma
lacuna do item 44 da rodada TEAT). Alcança a completude do dado estadual ([RN-BOAT-113]).

## Cena do sinistro

**17 — Três regimes de dever comprimidos em `evaded`.** _Severidade: média._ Ver §2.3 e
[RN-BOAT-117].

**18 — Preservar × liberar sem critério de precedência; competência pericial estadual
indeterminada.** _Severidade: média-alta — ato de campo irreversível._ Ver §2.3 e [RN-BOAT-118].
Consequência imediata: **o sistema não deve afirmar em tela que "a perícia está a caminho"** nem
condicionar a liberação a ato de terceiro indeterminado.

**19 — Concurso entre os arts. 176, I e 177 não disciplinado.** _Severidade: baixa-média._ A redação
do art. 177 é aberta quanto ao sujeito. Leitura de trabalho: para o condutor **envolvido** aplica-se
o art. 176, I; o art. 177 é a hipótese do **não envolvido** convocado pela autoridade. Interpretação
sobre silêncio ([RN-BOAT-115]).

**20 — Reclassificação da cena (vítima constatada depois) não é disciplinada.** _Severidade: média._
Vítima que se afasta e depois procura atendimento, ou óbito posterior, deslocam o enquadramento de
178 para 176 — depois de a via já ter sido liberada. Mínimo defensável: **preservar croqui e
evidências de todo sinistro, inclusive sem vítima** ([RN-BOAT-116]).

**21 — Veículo sinistrado removido sem responsável: prazo de 60 dias corre contra proprietário
possivelmente hospitalizado.** _Severidade: alta em efeito sobre o cidadão._ CTB art. 279-A c/c art.
328 e Res. 1.025/2026 art. 16. **Nenhuma das normas prevê suspensão do prazo por internação,
incapacidade ou óbito do proprietário.** Lacuna material. Registre-se também que o prazo a imprimir
no termo é de **60 dias**, não os 30 do edital — erro já corrigido na rodada TEAT e aqui ainda mais
gravoso ([RN-BOAT-120]).

**22 — Registrador instantâneo de velocidade: vedação absoluta ao agente, hoje sem modelagem.**
_Severidade: baixa-média._ Em sinistro com vítima, **somente o perito oficial** pode retirar o disco
ou a unidade (art. 279). Nenhum artefato BOAT menciona a existência do dispositivo — falta o
atributo em `CrashVehicle` que é o gatilho do regime ([RN-BOAT-119]).

**23 — Fronteira penal: o socorro prestado é fato com efeito imediato sobre a liberdade.**
_Severidade: baixa, mas evita erro de desenho._ O art. 301 afasta prisão em flagrante e fiança de
quem presta pronto e integral socorro; e o art. 304, parágrafo único mostra que a omissão do condutor
persiste **mesmo quando terceiros socorrem**. Consequência: "a vítima foi socorrida" e "o condutor
prestou socorro" são **fatos distintos** e precisam de registros distintos. Nenhum campo ou relatório
do BOAT deve rotular conduta como crime ([RN-BOAT-121]).

## Estatística, sigilo e acesso

**24 — O dever de publicação estatística é federal e mensal; o do Estado não existe em norma.**
_Severidade: média._ Se o DETRAN-AM publicar, publica **agregado** e sob sua própria
responsabilidade. Falta regra de granularidade: em município pequeno, "1 óbito em maio" identifica a
pessoa ([RN-BOAT-130]).

**25 — Uso secundário do dado de sinistro precisa existir como categoria no produto.**
_Severidade: baixa-média._ A Portaria 139/2025 define uso primário × secundário e **veda a aplicação
do secundário com finalidades genéricas** (art. 9º, p.ú.). Cruzamentos, estudos e painéis não
previstos são uso secundário e exigem análise ([RN-BOAT-132]).

**26 — Vedação de cessão de acesso a terceiros alcança fornecedores e integrações.** _Severidade:
média-alta (arquitetura)._ Portaria 139/2025 art. 16, § 7º — mesma lógica da restrição de destino do
dado do talão eletrônico ([RN-TEAT-112]). Deve entrar na decisão de hospedagem e terceirização.

**27 — O regime de acesso aplicável ao órgão público remete a instrumento não localizado.**
_Severidade: média._ O rol de requisitos do art. 22 é para pessoa jurídica de direito **privado**; o
§ 3º manda o órgão público observar _"normativo específico ou manual técnico-operacional [...] ou o
disposto em acordos, convênios"_ — não localizados ([RN-BOAT-132]).

---

# 4. O que foi verificado e está firme (para não re-litigar)

Reconferido contra fonte primária local, **sem divergência material**:

- **CTB arts. 19 (XI, XXXII, § 3º), 20 (IV, VII, XIII), 21 (IV), 22 (IX), 24 (IV), 326-A, 176, 177,
  178, 279, 279-A, 301, 304, 305, 328 e Anexo I** — conferidos contra `planalto_plain.txt`. Os
  extratos do CRAWLER estavam materialmente corretos; três precisões foram acrescentadas ao REF
  (penalidade tríplice do art. 176; autonomia dos incisos e o _"podendo fazê-lo"_ como elemento do
  tipo; ausência da qualificação "envolvido" no art. 177) e o art. 328 foi acrescentado.
- **Res. CONTRAN 808/2020** — extraída do PDF oficial do DOU, conferida **artigo a artigo** nesta
  revisão (18 artigos). Vigente, sem revogação localizada. Cinco artigos que faltavam na captura
  original foram acrescentados (5º §§3º-4º, 8º, 9º completo, 13, 14, 15).
- **Lei 13.614/2018** — HTML compilado do Planalto; a redação de 2018 do art. 326-A, § 9º e sua
  substituição em 2023 estão corretamente documentadas lado a lado.
- **Portaria SENATRAN 139/2025** — PDF oficial (DOU 24/02/2025, ed. 38, seção 1, p. 108); conferida
  nos Capítulos I a III. Vigente. Uma **remissão provavelmente equivocada** anotada (art. 24 cita
  "art. 21" onde caberia "art. 22").
- **Lei 13.709/2018 (LGPD)** — HTML compilado do Planalto, capturado nesta revisão; excertos
  transcritos na **redação vigente**, com as redações empilhadas descartadas e sinalizadas.
- **Portaria Normativa DETRAN-AM 003/2026** — já conferida na rodada TEAT; art. 4º, I e art. 14, I
  agora indexados também ao BOAT.

**Confiança reduzida, explicitamente sinalizada:**

- **Res. CONTRAN 808/2020 × terminologia pós-2023** — dissonância nominal não resolvida (item 9).
- **Res. CONTRAN 1.025/2026** — publicada em 30/06/2026, sem fonte secundária de conferência
  (ressalva herdada da rodada TEAT).
- **CPPD e Encarregado do DETRAN-AM** — fonte secundária (página institucional); as duas portarias
  citadas não foram obtidas.
- **BAT/e-DAT da PRF e BATEU/PR** — fontes secundárias (snippets de busca); **não citáveis** como
  norma, apenas como referência comparativa.
- **Integração SIM (DATASUS) ↔ RENAEST** — fonte secundária, não confirmada em norma primária.

---

# 5. Lista priorizada — o que um advogado humano precisa validar

Ordenada por **risco × custo de errar**. Os cinco primeiros bloqueiam decisões de arquitetura ou
produzem efeito direto sobre o cidadão.

| #     | Questão                                                                                                                                                                                                                        | Por que bloqueia                                                                                                                                                                                                                        | Refs                                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **1** | **Base legal do tratamento de dado de saúde da vítima**: confirmar (ou substituir) o enquadramento no art. 11, II, "a" e "b" da LGPD; e confirmar que as alíneas "e" e "f" **não** sustentam a guarda registral pelo DETRAN-AM | Define se o núcleo do registro pode ser coletado e conservado como está. Sem isso, todo o modelo de dados de vítima opera sem base declarada — e a publicidade da dispensa de consentimento (art. 11, §2º) não pode sequer ser redigida | §2.1, itens 1 e 7, [RN-BOAT-123], [RN-BOAT-122], [RN-BOAT-003] |
| **2** | **Prazo de retenção e política de eliminação** do registro de sinistro e do dado de saúde: qual prazo o órgão fixa para a camada identificada, e o que é anonimizado ao final?                                                 | `"retention": "forever"` é hoje juridicamente insustentável; e sem prazo não há política de armazenamento defensável. Decisão do órgão, com o Encarregado e o CPPD                                                                      | §2.1, item 2, [RN-BOAT-125], [RN-BOAT-131]                     |
| **3** | **Papel LGPD do DETRAN-AM quanto ao RENAEST**: controlador, co-controlador ou operador?                                                                                                                                        | Define **quem responde perante a ANPD e perante o titular** por incidente com dado de vítima; e se o órgão pode invocar instruções da SENATRAN como fundamento                                                                          | §2.1, item 3, [RN-BOAT-127], [RN-BOAT-101]                     |
| **4** | **Acesso do interessado/autuado ao registro de sinistro que contém dado de saúde de terceiro** — e o regime de resposta (LAI? Lei 9.784? Habeas Data?)                                                                         | Contraditório e ampla defesa de um lado, proteção de dado sensível de terceiro do outro. A solução adotada (supressão dos campos de saúde) precisa de confirmação                                                                       | item 4, [RN-BOAT-126]                                          |
| **5** | **Compartilhamento com a administradora do DPVAT**: a integração do art. 6º, §1º, V da Res. 808/2020 alcança dado de saúde, ou esbarra na vedação do art. 11, §4º da LGPD?                                                     | Decide se existe qualquer fluxo local ao seguro. A leitura adotada (alcança o sinistro, não o dado clínico) é interpretação sobre conflito entre norma setorial e norma geral                                                           | §2.4, item 5, [RN-BOAT-128], [RN-BOAT-112]                     |
| 6     | **Obtenção institucional dos Manuais RENAEST, do normativo de campos mínimos do BAT e do manual técnico-operacional de acesso** (ofício DETRAN-AM↔SENATRAN)                                                                    | Sem eles, o mapeamento campo-a-campo é inferência sobre contrato de mock, e o padrão de gravidade não tem critérios                                                                                                                     | item 11, [RN-BOAT-103], [RN-BOAT-111], [RN-BOAT-132]           |
| 7     | **Periodicidade de transmissão ao RENAEST**: consultar formalmente a SENATRAN, dado que a regulamentação delegada pelo art. 326-A, §9º nunca foi editada                                                                       | Define se o parâmetro mensal adotado como posição prudencial é aceitável, e evita fixação unilateral apresentada como prazo legal                                                                                                       | §2.2, item 10, [RN-BOAT-106]                                   |
| 8     | **Correspondência formal entre a Res. CONTRAN 808/2020 ("Registro Nacional de Acidentes") e o RENAEST do CTB ("de Sinistros")**                                                                                                | Define se a Resolução pode ser tratada como base normativa completa e atual do sistema; afeta a citabilidade de toda a série 101-108                                                                                                    | item 9, [RN-BOAT-102], [RN-BOAT-110]                           |
| 9     | **Competência de perícia/levantamento pericial em sinistro no âmbito estadual** e critério de precedência entre preservar o local e liberar a via                                                                              | Ato de campo irreversível; hoje o agente decide sem critério normativo e o sistema não registra o fundamento                                                                                                                            | §2.3, item 18, [RN-BOAT-118]                                   |
| 10    | **Bodycam na cena do sinistro**: retenção, base legal e acesso — matéria dos "casos omissos" do art. 16 da Portaria 003/2026, sem Portaria complementar                                                                        | Define se a gravação pode entrar no escopo do BOAT e sob que regime; agravado por conter dado de saúde de terceiro                                                                                                                      | item 6, [RN-BOAT-129], [RN-TEAT-142]                           |
| 11    | **Veículo sinistrado removido sem responsável**: há suspensão do prazo de 60 dias por internação/óbito do proprietário?                                                                                                        | Prejuízo real e previsível ao cidadão (leilão de veículo de vítima hospitalizada); nenhuma das normas endereça                                                                                                                          | item 21, [RN-BOAT-120]                                         |
| 12    | **Concurso entre os arts. 176, I e 177** e a leitura de que o art. 177 alcança o condutor não envolvido                                                                                                                        | Define enquadramento e penalidade (grave × gravíssima + suspensão)                                                                                                                                                                      | item 19, [RN-BOAT-115]                                         |
| 13    | **Instrumento do convênio DETRAN-AM/BPTRAN** como via de entrada do dado da Polícia Militar no RENAEST estadual                                                                                                                | Alcança a completude do dado estadual e a legitimidade do registro produzido pela PM                                                                                                                                                    | item 16, [RN-BOAT-113], [RN-TEAT-143]                          |
| 14    | **Efeito da rejeição nacional**: a Res. 808/2020 admite retificação de registro rejeitado, ou o terminal do mock corresponde à norma?                                                                                          | Define se existe fluxo de correção pós-rejeição no produto                                                                                                                                                                              | item 13, [RN-BOAT-104], [RN-BOAT-002]                          |
| 15    | **Publicação estatística estadual**: granularidade mínima e supressão de células pequenas                                                                                                                                      | Equilíbrio entre LAI/transparência e LGPD; decisão do órgão, a ser documentada                                                                                                                                                          | item 24, [RN-BOAT-130]                                         |

**Ações de conformidade que não dependem de validação jurídica** (podem ser encaminhadas desde já):

1. **Substituir `"retention": "forever"` por política em duas camadas** no blueprint — mesmo antes de
   o prazo ser fixado, a marcação atual é afirmação juridicamente errada ([RN-BOAT-125]).
2. **Classificar como sensíveis todos os dados de saúde da vítima** — `severity`, `medical_care`,
   `death_at_scene`, `death_at` — hoje sem a marcação que `hospital_destination` e `health_notes` já
   têm ([RN-BOAT-122]).
3. **Limitar o papel `auditor` a metadados e trilha** quanto a dado de saúde, com acesso ao dado
   bruto apenas por ato excepcional justificado — mesmo desenho já adotado para bodycam
   ([RN-BOAT-124], [RN-BOAT-126], [RN-TEAT-142]).
4. **Registrar acesso a dado de vítima com finalidade declarada**, reaproveitando o padrão de
   `CustodyEvent`/`RN-AUD-005` já existente no corpus, em vez de criar mecanismo novo
   ([RN-BOAT-126]).
5. **Atualizar a expansão do acrônimo RENAEST** em [APP-BOAT] para a designação legal vigente
   ("Registro Nacional de **Sinistros** e Estatísticas de Trânsito"), mantendo "acidente" apenas nas
   citações literais da Res. 808/2020 e no nome do BAT ([RN-BOAT-110]).
6. **Acrescentar ao registro os três dados de tempo/liberação da via** (chegada, liberação,
   fundamento) — hoje inexistentes e insubstituíveis quando a cena é desfeita ([RN-BOAT-118],
   [RN-BOAT-004]).
7. **Não desenhar canal local de envio ao DPVAT** — a administradora integra-se pela União
   ([RN-BOAT-128]).

---

# 6. Pendências de edição fora da fronteira desta rodada

Registradas aqui para o próximo passo de curadoria (não editadas por regra de fronteira):

- **`est/boat/APP.md`** — §Âncoras legais ainda diz _"(fonte pendente) — nenhum excerto de resolução
  CONTRAN/CTB específico sobre registro de sinistros/RENAEST foi localizado"_, hoje **superado** por
  [RN-BOAT-101] a [RN-BOAT-104]. Também: expansão do acrônimo RENAEST ([RN-BOAT-110]); §Atores
  (Coordenador de RENAEST, [RN-BOAT-105]); §Modelo de dados (classificação de sensibilidade,
  [RN-BOAT-122]).
- **`est/boat/workflows/WF-BOAT-001.md`** — §Prazos e timers: substituir "(fonte pendente)" pela
  explicação do vazio normativo e pelo parâmetro do órgão ([RN-BOAT-106]); acrescentar a origem
  normativa da máquina nacional ([RN-BOAT-104]); admitir registro de **outra origem**
  ([RN-BOAT-113]) e encerramento com **veículo removido sem responsável** ([RN-BOAT-120]).
- **`shared/glossary.md`** — "sinistro" como termo principal com a definição do Anexo I e "acidente"
  como termo histórico ([RN-BOAT-109], [RN-BOAT-110]); "Gravidade do sinistro" com o status
  normativo qualificado ([RN-BOAT-111]); "BAT" e "Coordenador de RENAEST".
- **`shared/actors.md`** — parceiro integrante facultativo do RENAEST ([RN-BOAT-112]) e Coordenador
  de RENAEST ([RN-BOAT-105]), ambos como papéis institucionais, **não** RBAC.
- **`_meta/backlog.md`** — itens de solicitação institucional (Manuais/normativo do BAT; consulta de
  periodicidade à SENATRAN; portarias do CPPD e do Encarregado; instrumento do convênio BPTRAN).
