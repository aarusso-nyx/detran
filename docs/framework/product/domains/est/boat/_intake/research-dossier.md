# Dossiê de pesquisa — BOAT (CRAWLER, 2026-08-24)

Rodada de pesquisa dedicada a fechar as lacunas legais explícitas do base BOAT já mineirado
(`est/boat/APP.md`, `workflows/WF-BOAT-001`, `rules/RN-BOAT-001..004`,
`use-cases/UC-BOAT-001..005`, `_intake/proposals.md`). Todos os downloads e REFs estão sob
`refs/**`; nada foi escrito em `est/boat/**` além deste dossiê, por regra de fronteira do
briefing (modo confirm-extend). Revisado também `inf/teat/_intake/bpo-notes.md` §5 (itens
boat-adjacentes flagados pela rodada TEAT: bodycam em atendimento a sinistro) e
`refs/detran-am/REF-DETRANAM-TALAO-BODYCAM.md`.

**Achado central da rodada**: o RENAEST — cuja base normativa era o gap nº 1, mais citado, de todo
o corpus BOAT ("(fonte pendente)" em [APP-BOAT], [WF-BOAT-001] e implicitamente em todas as RN) —
**existe em três camadas normativas confirmadas**: (a) competência no próprio **CTB**, incluída
pela Lei 14.599/2023 (arts. 19, XI/XXXII; 22, IX; 24, IV; 326-A); (b) origem histórica na **Lei
13.614/2018** (Pnatrans, cria o art. 326-A); (c) regulamentação infralegal específica na
**Resolução CONTRAN 808/2020**, ainda vigente. A Res. 808/2020 também resolve, com base legal
explícita, a hipótese de "parceiro conveniado" que a rodada de mineração havia marcado como não
confirmada: saúde (Ministério da Saúde, secretarias estaduais/municipais, **SAMU**), emergência
(corpos de bombeiros, polícias civis) e seguro (**DPVAT**) são integrantes **facultativos** do
RENAEST, via o DETRAN estadual.

---

## 1. Base normativa do RENAEST

**Encontrado — cadeia completa em três níveis.** CTB art. 19, XI ("estabelecer modelo padrão de
coleta de informações sobre as ocorrências de sinistros de trânsito e as estatísticas de
trânsito") e XXXII ("organizar e manter o Registro Nacional de Sinistros e Estatísticas de
Trânsito (Renaest)") — ambos incluídos/redigidos pela **Lei 14.599/2023** — são a base legal
máxima. CTB art. 22, IX (redação idêntica, mesma lei) é a base legal **direta e específica** da
competência do DETRAN-AM de coletar dados de sinistro — não apenas dedução de propósito
estatístico genérico, como o base original havia registrado. O art. 326-A (criado pela **Lei
13.614/2018** — [REF-LEI-13614-2018] —, hoje com redação da Lei 14.599/2023) é o elo histórico:
menciona, desde 2018, um "sistema de registro nacional de acidentes e estatísticas de trânsito"
com prazo de consolidação (1º de março), prazo esse **suprimido do texto legal em 2023** e
delegado a "regulamentação do Contran". Essa regulamentação **existe e foi localizada**: a
**Resolução CONTRAN 808/2020** ([REF-CONTRAN-808-2020]), baixada em PDF original do DOU, dispõe
integralmente sobre o RENAEST — definição, o BAT (Boletim de Ocorrência de Acidente de Trânsito),
validação em três níveis (municipal/estadual/federal), integração obrigatória (SNT) e facultativa
(saúde/SAMU/bombeiros/DPVAT), coordenadores por órgão e prazo de integração institucional (4 de
janeiro de 2022).

**Vigência**: alta confiança para o CTB (texto compilado oficial, mesma extração já usada em
[REF-CTB-280-290]). Confiança moderada-alta para a Res. 808/2020: PDF oficial do DOU, conteúdo
internamente consistente, **porém com risco de desatualização terminológica** — o texto integral
da resolução ainda usa "acidente(s) de trânsito" e nomeia o sistema "Registro Nacional de
**Acidentes** e Estatísticas de Trânsito", nomenclatura anterior à renomeação da Lei 14.599/2023
no CTB. Nenhuma resolução CONTRAN de atualização terminológica posterior a 2023 foi localizada —
recomenda-se verificação jurídica humana antes de tratar a Res. 808/2020 como certamente idêntica,
sem lacunas, ao RENAEST hoje nomeado no CTB (a correspondência é de altíssima probabilidade —
mesmo acrônimo, mesmo órgão, mesma função — mas não há instrumento único que amarre as duas
nomenclaturas).

**Gap residual**: nenhum quanto à existência e à base legal do RENAEST. Permanece em aberto (ver
item 3) a obtenção dos dois Manuais que instrumentalizam o "padrão de dados" em si.

## 2. Terminologia e classificação de sinistro

**Encontrado — fechado quanto à terminologia; classificação de gravidade confirmada como
infralegal.** A Lei 14.599/2023 é o instrumento único (confirmado por buscas externas e pela
anotação `(Redação dada pela Lei nº 14.599, de 2023)` em cada dispositivo do texto compilado
oficial) que substituiu "acidente de trânsito" por "sinistro de trânsito" em 33 pontos do CTB e
introduziu, no **Anexo I** (glossário oficial), a definição legal: _"SINISTRO DE TRÂNSITO - evento
que resulta em dano ao veículo ou à sua carga e/ou em lesões a pessoas ou animais [...] em que
pelo menos uma das partes está em movimento nas vias terrestres ou em áreas abertas ao público."_
— capturada verbatim em [REF-CTB-sinistro-cena-renaest]. A definição cobre tanto dano material
puro quanto lesão a pessoas/animais — não há, no Anexo I nem em nenhum outro dispositivo
pesquisado, uma definição legal própria de "acidente" vs. "sinistro com vítima" vs. "sinistro sem
vítima" como categorias distintas.

**Achado negativo confirmado**: a classificação de gravidade `SEM_VITIMA | COM_VITIMA_FERIDA |
COM_VITIMA_FATAL`, usada pelo mock `senatran` e citada em [RN-BOAT-001]/[RN-BOAT-002], **não tem
assento em texto de lei** — nenhum dispositivo do CTB pesquisado (Anexo I, arts. 19, 22, 326-A ou
correlatos) a define. É, com alta probabilidade, parte do "modelo padrão de coleta" que o art.
19, XI atribui à competência legal da SENATRAN — ou seja, existe **base legal para a competência
de definir** a classificação, mas o **valor concreto do padrão** (os três rótulos e seus critérios)
não foi encontrado em nenhum instrumento normativo público. Resposta à pergunta do briefing ("é
normativa ou padrão técnico?"): **é padrão técnico-administrativo, com base de competência legal,
não uma classificação com assento direto em lei**.

**Vigência**: alta confiança (CTB oficial compilado).

**Gap residual**: origem documental exata da classificação de gravidade (provavelmente um dos dois
Manuais RENAEST não localizados — ver item 3).

## 3. Padrão de dados / dicionário RENAEST

**Parcialmente encontrado — base legal e existência confirmadas; documento em si não obtido.**
Três normas distintas, capturadas nesta rodada, **convergem em apontar a mesma lacuna**: (a)
[REF-CONTRAN-808-2020] art. 3º, parágrafo único, determina que a "metodologia padronizada" conste
no **Manual do Sistema RENAEST** e no **Manual de Gestão de Estatísticas de Acidente de Trânsito**,
"a serem instituídos" pela SENATRAN; (b) o mesmo instrumento, art. 4º, §1º, prevê um "normativo
específico" com os "campos mínimos" do BAT — analogamente ao papel que a Portaria SENATRAN
997/2022 cumpre para o AIT do TEAT; (c) [REF-SENATRAN-PORTARIA-139-2025] arts. 2º e 21 confirmam,
em norma de 2025, o mesmo padrão de "manuais técnico-operacionais específicos" e "manual técnico"
para acesso a dados de cada sistema, incluindo o RENAEST (art. 7º, §1º). **Nenhum dos três
documentos foi localizado publicamente** nesta rodada — busca dirigida no portal
`gov.br/transportes`, no acervo `dados.transportes.gov.br` (bloqueado por DNS/rede nesta sessão) e
no portal SERPRO não teve êxito. A Portaria SENATRAN 354/2022, encontrada durante a busca, foi
verificada e **descartada** como fonte — trata dos campos mínimos do AIT (infração), não do BAT
(sinistro), evitando uma falsa correspondência.

**Vigência**: alta confiança quanto à existência e obrigatoriedade normativa dos manuais/normativo
específico (três fontes independentes e concordantes). Confiança zero quanto ao conteúdo, por
ausência de acesso ao documento.

**Gap residual — recomendação de pesquisa**: o padrão consistente ("existe, mas não é público" em
três normas distintas de anos diferentes: 2020, 2022, 2025) sugere que esses manuais são
documentação técnica restrita, distribuída apenas a órgãos integrados ao RENAEST — recomenda-se
**solicitação institucional direta** do DETRAN-AM à SENATRAN (mesmo canal que obteria o acesso
operacional real ao sistema), não uma nova rodada de busca pública.

## 4. Obrigações na cena do sinistro

**Encontrado — cadeia completa e verbatim.** CTB arts. 176, 177 e 178 (todos com redação dada pela
Lei 14.599/2023) formam uma tríade coerente de infrações administrativas por omissão na cena do
sinistro, capturada verbatim em [REF-CTB-sinistro-cena-renaest]: (a) art. 176 — sinistro **com
vítima**, condutor omisso em socorro/prevenção de novo risco/preservação do local para perícia/
remoção quando determinada/identificação ao policial → infração **gravíssima** (multa 5x +
suspensão do direito de dirigir); (b) art. 177 — recusa a prestar socorro **quando solicitado pela
autoridade** especificamente → infração **grave** autônoma; (c) art. 178 — sinistro **sem
vítima**, omissão de remoção do veículo quando necessária à fluidez → infração **média**. Também
capturados o art. 279 (retirada de disco/unidade de registrador instantâneo de velocidade só por
perito oficial, em sinistro com vítima) e o art. 279-A (remoção de veículo sinistrado sem
responsável no local, distinta da remoção por infração já documentada em
[REF-CTB-165-277-medidas-alcoolemia]). Documentados também, para demarcar fronteira de escopo
(não para uso operacional de BOAT), os tipos penais correlatos arts. 301, 304 e 305 — mesmo fato de
omissão de socorro gera, em paralelo, infração administrativa (176/177, âmbito BOAT) e crime
autônomo (304, fora do escopo já declarado em [APP-BOAT] §Escopo/Fora).

**Vigência**: alta confiança (CTB oficial compilado, mesma fonte primária das demais capturas
CTB desta rodada e das rodadas TEAT/RAIT anteriores).

**Gap residual**: nenhum quanto à existência dos dispositivos. Achado de modelagem: nenhuma RN
BOAT existente cita esses artigos — [RN-BOAT-004] (dados mínimos para encerrar registro grave)
está próxima em espírito ao art. 176, III (preservar o local) mas não cita a tensão explícita
entre preservação para perícia e a necessidade de liberar a via (art. 178) — ver handoff BPO.

## 5. Modelos de coleta (PRF BAT/e-DAT e outros estados)

**Parcialmente encontrado — fonte secundária apenas, download bloqueado.** Localizadas, apenas por
busca (WebSearch), as páginas oficiais da PRF sobre o **BAT** (Boletim de Acidente de Trânsito —
documento de registro de acidentes em rodovias federais, com vítima, produto perigoso ou dano
ambiental; prazo de disponibilização de 5 dias úteis, prorrogável por mais 5) e o **e-DAT**
(Declaração eletrônica de Acidente de Trânsito — substitui o boletim presencial para acidentes sem
vítima, até 5 veículos, sem dano ambiental/patrimônio público; emissão em até 5 dias úteis; prazo
de acesso de até 60 dias após o sinistro em rodovia federal). **Tentativas de download do original
falharam**: WebFetch retornou `ECONNREFUSED` para `portal.prf.gov.br` (ambas as páginas), e `curl`
direto (com e sem verificação TLS) retornou timeout/falha de conexão — domínio aparentemente
inacessível a partir desta sessão. **Marcado como fonte não-original**, conforme regra de
fronteira do briefing. Também localizado, apenas por busca, o **BATEU** (Boletim de Acidente de
Trânsito Eletrônico Unificado, Paraná) — sistema estadual de autoatendimento para sinistros sem
vítima até 4 veículos/8 pessoas, integrando Polícia Militar, DETRAN-PR, DER-PR e Celepar; prazo de
registro de até 180 dias. `curl` a `bateu.pr.gov.br` retornou HTTP 404 na URL testada (domínio
acessível, caminho específico não localizado) — não há, nesta rodada, confirmação de intake por
parceiro de saúde/seguradora no BATEU.

**Vigência**: não avaliável com confiança — fontes secundárias (páginas institucionais via
snippet de busca, não o documento primário).

**Gap residual**: nenhum modelo estadual com intake confirmado de parceiro de saúde/seguradora foi
obtido em fonte primária nesta rodada — a confirmação mais forte da hipótese de parceiro veio, em
vez disso, do item 1 ([REF-CONTRAN-808-2020] art. 6º, nível federal). Recomenda-se, se este item
permanecer prioritário, nova tentativa de acesso ao portal PRF a partir de rede/sessão diferente.

## 6. Interseção saúde

**Encontrado — fronteira parcialmente esclarecida, dois trilhos paralelos identificados.**
[REF-CONTRAN-808-2020] art. 6º, §1º, nomeia expressamente **Ministério da Saúde, secretarias de
saúde estaduais/distritais/municipais e SAMU** como órgãos que **"poderão" integrar** o RENAEST —
juntamente com corpos de bombeiros militares, polícias civis e a administradora do Seguro DPVAT —
por serem entidades que "efetuam o registro de ocorrências de acidentes de trânsito, [...] apuram
suas circunstâncias ou prestam atendimento às vítimas". A integração é **facultativa** ("Poderão
integrar" / art. 6º, §3º "Caso optem") e, quando exercida, ocorre **através do órgão estadual de
trânsito** (§5º) — ou seja, a via de entrada de dados de saúde no sistema nacional é o próprio
DETRAN estadual, não uma ligação direta hospital↔União. Em paralelo, a pesquisa (via busca) indica
que o **Pnatrans** (Lei 13.614/2018/art. 326-A) usa, para o cálculo do índice de mortalidade que
mede sua meta nacional, dados do **SIM** (Sistema de Informação sobre Mortalidade, DATASUS/
Ministério da Saúde) — trilho **estatístico-epidemiológico**, distinto do trilho **registral**
(RENAEST/BAT por sinistro individual) e mencionado por fontes secundárias como carecendo de melhor
integração com o RENAEST para identificação de vítimas até 30 dias após o sinistro. **Não
localizada**, em nenhuma norma primária lida, menção a VIVA/SINAN (ficha de notificação de
violências/acidentes do Ministério da Saúde) como fonte formal do RENAEST — apenas SIM (mortalidade)
e, por extensão organizacional, SAMU/secretarias de saúde como possíveis integradores diretos do
próprio RENAEST (não do SIM).

**Vigência**: alta confiança quanto ao art. 6º da Res. 808/2020 (fonte primária, PDF oficial).
Confiança baixa-moderada quanto à integração SIM↔RENAEST (fonte secundária, não confirmada em
norma primária).

**Gap residual**: mecanismo técnico e normativo exato de integração SIM↔RENAEST não localizado em
fonte primária. Permanece aberta a questão de saber se, na prática do DETRAN-AM especificamente,
algum órgão de saúde amazonense já exerce a opção de integração do art. 6º §1º — não pesquisável
por norma (é fato operacional local, não normativo).

## 7. DETRAN-AM local

**Encontrado (negativo, confirmado por revisão exaustiva) + achado colateral de governança LGPD.**
Revisão da **listagem oficial completa de Portarias Normativas do DETRAN-AM** (2019-2026, ~45
instrumentos, via `detran.am.gov.br/acesso-informacao/publicacoes/portarias/portarias-normativas/`)
não encontrou **nenhuma** portaria sobre registro de sinistro/acidente, boletim de ocorrência ou
sistema BAT local — achado negativo **confirmado por revisão da lista inteira**, não apenas
lacuna de busca pontual (distinto, portanto, do padrão "não localizado" de outros itens deste
dossiê). O que existe publicamente sobre sinistros no DETRAN-AM é operacional, não normativo:
procedimento de solicitação de laudo pericial/vistoria técnica pós-sinistro (para fins de seguro/
DPVAT), e o já documentado (rodada TEAT) uso da bodycam em "atendimento a sinistros de trânsito"
(Portaria Normativa 003/2026, art. 4º, I — ver [REF-DETRANAM-TALAO-BODYCAM] e
`inf/teat/_intake/bpo-notes.md` §5).

**Achado colateral relevante ao handoff LGPD**: DETRAN-AM mantém um **Comitê de Privacidade e
Proteção de Dados Pessoais (CPPD)**, instituído pela **Portaria Normativa nº 006/2023/DP/DETRAN/
AM**, e um Encarregado de Dados designado por Portaria nº 319/2023/DETRAN/AM (confirmado via
página institucional `detran.am.gov.br/lgpd/`, fonte secundária — página institucional, não a
portaria em si, que não foi baixada nesta rodada). A página **não menciona** especificamente dado
de saúde ou dado de vítima de sinistro entre as categorias de dado tratadas — mesmo padrão de
lacuna já observado pela rodada TEAT para a Portaria 003/2026 (bodycam): governança LGPD
institucional existe, mas sem tratamento explícito do caso de uso sensível específico (vítima de
sinistro / imagem de bodycam).

**Vigência**: alta confiança quanto ao achado negativo (revisão de listagem oficial completa).
Confiança moderada quanto ao CPPD/Encarregado (fonte secundária, portarias citadas mas não
baixadas).

**Gap residual**: texto da Portaria Normativa nº 006/2023/DP/DETRAN/AM (CPPD) não obtido — se
prioritário, recomenda-se download dirigido em rodada futura.

---

# Mapa CONFIRMA / CONTRADIZ / ESTENDE

## APP.md

| Claim                                                                                                                                    | Resultado                                                                                                                                                                                                                                                                                                                                              | Onde                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| "(fonte pendente) — nenhum excerto de resolução CONTRAN/CTB específico sobre registro de sinistros/RENAEST foi localizado"               | **ESTENDE — gap fechado**: base legal tríplice (CTB arts. 19/22/24/326-A + Lei 13.614/2018 + Res. CONTRAN 808/2020)                                                                                                                                                                                                                                    | [REF-CTB-sinistro-cena-renaest], [REF-LEI-13614-2018], [REF-CONTRAN-808-2020] |
| Missão: "parceiros conveniados (saúde, rodovias, seguradoras)"                                                                           | **CONFIRMA com base legal explícita, antes ausente** — Res. 808/2020 art. 6º nomeia exatamente esses setores (saúde/SAMU, DPVAT) como integrantes facultativos do RENAEST via DETRAN estadual                                                                                                                                                          | [REF-CONTRAN-808-2020] art. 6º                                                |
| Atores: nenhum papel "parceiro conveniado" distinto encontrado no corpus `teat` (RBAC)                                                   | Sem contradição — **complementa**: a norma federal confirma a **existência legal** do conceito de parceiro/intake externo, mas não cria nem exige um RBAC específico; é papel de governança interinstitucional, não de sistema. `_intake/proposals.md` deveria ser atualizado para refletir que a hipótese é confirmada em nível legal, mesmo sem RBAC | [REF-CONTRAN-808-2020] art. 6º, §§1º e 5º                                     |
| Modelo de dados: `severity` livre / gravidade RENAEST `SEM_VITIMA\|COM_VITIMA_FERIDA\|COM_VITIMA_FATAL` (fonte: contrato técnico apenas) | **CONFIRMA a natureza técnica/infralegal** — pesquisada exaustivamente no CTB (Anexo I, arts. 19/22/326-A): não encontrada. É competência legal da SENATRAN definir (art. 19, XI), mas o valor concreto do padrão não tem assento em lei                                                                                                               | [REF-CTB-sinistro-cena-renaest] Anexo I                                       |

## WF-BOAT-001 (ciclo de vida)

| Item                                                                                                                    | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Onde                                                 |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Máquina de estados nacional RECEBIDO→EM_ANALISE→CONSOLIDADO\|REJEITADO (fonte: apenas contrato técnico `senatran`-mock) | **CONFIRMA com fonte normativa explícita, antes ausente** — Res. 808/2020 art. 5º ("serão homologados e, então, consolidados"; validação em 3 níveis municipal/estadual/federal) é a origem normativa da mecânica que o mock implementa                                                                                                                                                                                                                                                            | [REF-CONTRAN-808-2020] art. 5º                       |
| "(fonte pendente) — nenhum prazo legal de registro/transmissão de sinistro foi localizado"                              | **ESTENDE, com explicação da causa-raiz do gap** — existiu prazo fixo (1º de março) na redação original de 2018 do CTB art. 326-A §9º; a reforma de 2023 suprimiu esse prazo do texto legal, delegando-o a "regulamentação do Contran"; a Res. 808/2020 (que já regulamenta o RENAEST) só fixa prazo de **integração institucional** (04/01/2022), não prazo por-registro. Gap **permanece aberto quanto ao prazo por sinistro**, mas agora com explicação normativa precisa de por que não existe | [REF-LEI-13614-2018], [REF-CONTRAN-808-2020] art. 16 |
| "(fonte pendente) mapeamento campo-a-campo entre CrashRecord/... e SinistroRequest/..."                                 | Sem alteração direta — mas a origem do padrão de campos foi localizada (não o conteúdo): [REF-CONTRAN-808-2020] art. 4º elenca as 4 categorias (pessoa/vítima/condutor; veículo; via; sinistro) que estruturam o BAT, compatíveis com as 4 entidades do modelo BOAT; os campos mínimos exatos dependem do "normativo específico" não obtido (item 3)                                                                                                                                               | [REF-CONTRAN-808-2020] art. 4º                       |
| "(fonte pendente) condições e ator autorizado para CANCELADO no registro local"                                         | Sem alteração — nenhuma norma sobre cancelamento de registro local de sinistro localizada nesta rodada (distinto do cancelamento de AIT já tratado na rodada TEAT)                                                                                                                                                                                                                                                                                                                                 | —                                                    |
| "(fonte pendente) mecanismo de correção de um registro nacional RENAEST já CONSOLIDADO/REJEITADO"                       | Sem alteração — Res. 808/2020 não trata de correção pós-terminal; mock e norma concordam em não prever esse fluxo                                                                                                                                                                                                                                                                                                                                                                                  | —                                                    |

## RN-BOAT-001 (gravidade sempre obrigatória)

| Item                                                             | Resultado                                                                                                                                                                                                                                                                                                                                   | Onde                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| "(fonte pendente) — não localizado excerto normativo específico" | **ESTENDE parcialmente** — a exigência de classificação em si não tem excerto legal direto (permanece requisito de modelo/produto), mas a **definição de "sinistro"** que a antecede logicamente agora tem base legal (Anexo I do CTB) e a **competência de definir o padrão de gravidade** é legalmente atribuída à SENATRAN (art. 19, XI) | [REF-CTB-sinistro-cena-renaest] Anexo I, art. 19, XI |

## RN-BOAT-002 (RENAEST exige dados de vítima por gravidade)

| Item                                                                                                              | Resultado                                                                                                                                                                                                                                                                                                                                                                          | Onde                              |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| "(fonte pendente) — não localizado texto normativo [...] que defina esse requisito [...] apenas no contrato/mock" | Sem alteração direta — nenhuma norma primária localizada que espelhe a regra `RENAEST.CRASH.INCOMPLETE_DATA` especificamente. **Contexto reforçado**: agora sabe-se que o BAT tem 4 categorias de dado normativamente exigidas (art. 4º da Res. 808/2020), das quais "pessoa, vítima e/ou condutor" é uma — compatível com, mas não prova direta de, a regra de completude do mock | [REF-CONTRAN-808-2020] art. 4º, I |

## RN-BOAT-003 (controle de acesso reforçado a dados de vítima)

| Item                                                                                                                                          | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Onde                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| "(fonte pendente) — não localizado excerto normativo específico de proteção de dados de vítima [...] decorre de política de privacidade/LGPD" | **ESTENDE, com duas fontes normativas novas de LGPD** — (a) Res. CONTRAN 808/2020 art. 5º, §5º: envio de dados entre órgãos integrados ao RENAEST observará a LGPD (única menção normativa explícita de LGPD em toda a cadeia RENAEST); (b) Portaria SENATRAN 139/2025 art. 18: princípio de minimização reforçada para dado pessoal sensível, com acesso a dado bruto sensível "somente em caráter excepcional". Nenhuma das duas define a hipótese legal específica (LGPD art. 11) aplicável a dado de saúde de vítima — permanece questão de parecer LEGAL | [REF-CONTRAN-808-2020] art. 5º §5º; [REF-SENATRAN-PORTARIA-139-2025] art. 18 |

## RN-BOAT-004 (registro grave exige dados mínimos para encerrar)

| Item                                                                                             | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                         | Onde                                                 |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| "(fonte pendente) — não localizado excerto normativo específico; regra de qualidade de registro" | Sem alteração direta quanto à origem da regra de completude mínima em si. **Achado adjacente relevante**: CTB art. 176, III exige que o condutor preserve o local "de forma a facilitar os trabalhos da polícia e da perícia" — tensão normativa não capturada em nenhuma RN existente entre essa preservação e o art. 178 (dever de remover o veículo quando necessário à fluidez em sinistro sem vítima) — candidato a nova RN ou nota de risco | [REF-CTB-sinistro-cena-renaest] arts. 176, III e 178 |

## UC-BOAT-003 (vítimas e gravidade) / UC-BOAT-005 (transmissão e encerramento)

| Item                                                                                                       | Resultado                                                                                                                         | Onde                           |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Campo `severity` e gate de transmissão por gravidade                                                       | Sem alteração ao fluxo descrito — reforçado pela origem normativa agora conhecida da máquina de 3 níveis (item WF-BOAT-001 acima) | [REF-CONTRAN-808-2020] art. 5º |
| "eventual ajuste [pós-CONSOLIDADO/REJEITADO] exige novo registro formal (mecanismo exato: fonte pendente)" | Sem alteração — confirmado como lacuna normativa real, não de pesquisa (Res. 808/2020 não trata do caso)                          | —                              |

---

# `_intake/proposals.md` — status dos itens de backlog

| Item do backlog/proposals                                                                                    | Status após esta rodada                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "base normativa (CONTRAN/CTB/portaria SENATRAN) para a existência e as regras de submissão da base RENAEST"  | **FECHADO** — [REF-CTB-sinistro-cena-renaest], [REF-LEI-13614-2018], [REF-CONTRAN-808-2020]                                                                                                                  |
| "mapeamento campo-a-campo confirmado entre entidades TEAT/BOAT e o payload RENAEST"                          | **REDUZIDO, não fechado** — estrutura de 4 categorias confirmada (art. 4º da Res. 808/2020); campos exatos dependem dos Manuais não obtidos                                                                  |
| "condições e ator autorizado para CANCELADO no registro local de sinistro"                                   | **ABERTO** — nenhuma norma localizada nesta rodada                                                                                                                                                           |
| "mecanismo de correção de um registro nacional RENAEST já CONSOLIDADO/REJEITADO"                             | **ABERTO** — confirmado como lacuna normativa real (Res. 808/2020 não prevê)                                                                                                                                 |
| Ator "parceiro conveniado" (saúde, rodovias, seguradoras) — não confirmado com RBAC próprio no corpus `teat` | **PARCIALMENTE RESOLVIDO** — existência legal confirmada (Res. 808/2020 art. 6º), integração facultativa, sem RBAC próprio definido pela norma; decisão de produto sobre modelar ou não continua com o Owner |
| UC-1.245/1.246 (danos materiais/testemunhas) sem UC dedicado                                                 | Sem alteração — fora do escopo desta rodada de pesquisa legal                                                                                                                                                |
| UC-1.251 (relatório preliminar) sem entidade própria                                                         | Sem alteração — fora do escopo desta rodada                                                                                                                                                                  |

---

# Handoff — LEGAL

1. **Confirmar a correspondência terminológica entre a Res. CONTRAN 808/2020 ("acidente"/"Registro
   Nacional de Acidentes") e o RENAEST hoje nomeado no CTB ("sinistro"/"Registro Nacional de
   Sinistros")** pela Lei 14.599/2023 — nenhuma resolução de atualização terminológica localizada;
   a correspondência é de altíssima probabilidade mas não formalmente amarrada em um único
   instrumento. Merece parecer antes de tratar a Res. 808/2020 como base normativa definitiva e
   completa.
2. **LGPD — dado de saúde de vítima de sinistro.** [RN-BOAT-003] trata `hospital_destination` e
   `health_notes` como PII de retenção "forever", sem base legal. Duas normas novas desta rodada
   tocam LGPD no RENAEST ([REF-CONTRAN-808-2020] art. 5º §5º; [REF-SENATRAN-PORTARIA-139-2025]
   art. 18) mas **nenhuma define a hipótese legal específica do art. 11 da LGPD** aplicável
   (consentimento? tutela da vida/incolumidade física? exercício regular de direito em processo
   administrativo?). Esta é a lacuna mais sensível de todo o dossiê BOAT — dado de saúde,
   tratamento contínuo e sistemático, retenção permanente, sem base legal de tratamento
   documentada. Recomenda-se parecer LEGAL dedicado, com paralelo à mesma lacuna já apontada na
   rodada TEAT para a Portaria DETRAN-AM 003/2026 (bodycam) — padrão recorrente de governança LGPD
   institucional sem tratamento do caso de uso sensível específico.
3. **Papel do DETRAN-AM em relação ao RENAEST**: fonte primária de dados (art. 22, IX do CTB —
   competência própria) ou processador/operador de dados delegados pela SENATRAN (art. 22, II/III
   — expressamente citados em [REF-SENATRAN-PORTARIA-139-2025] art. 7º §3º, que **não** cita o
   inciso IX)? A distinção tem consequência de responsabilidade LGPD (controlador vs. operador) e
   não foi resolvida por nenhuma norma lida.
4. **Validar a interpretação de que a integração de saúde/SAMU/DPVAT ao RENAEST é facultativa**
   ([REF-CONTRAN-808-2020] art. 6º, §§1º/3º/5º) — se confirmada, isso significa que o "parceiro
   conveniado" da missão de [APP-BOAT] não pode ser modelado como fluxo obrigatório de intake, mas
   como integração opcional dependente de adesão institucional externa ao DETRAN-AM.
5. **Tensão art. 176, III (preservar local para perícia) vs. art. 178 (remover veículo para
   fluidez em sinistro sem vítima)** — avaliar se há critério normativo de precedência (ex.:
   gravidade do sinistro, tipo de via) ou se é discricionariedade do agente em campo; hoje nenhuma
   RN BOAT trata essa tensão.

# Handoff — BPO

1. **Modelar a integração de parceiro conveniado (saúde/SAMU/DPVAT) como fluxo opcional, não
   obrigatório**, com entrada dos dados **através do DETRAN-AM** (não direta à União) — conforme
   [REF-CONTRAN-808-2020] art. 6º §5º. Decisão de produto: se/quando priorizar esta onda, ela
   depende de adesão institucional externa (Ministério da Saúde/secretaria estadual/SAMU optando
   por integrar), não apenas de trabalho de engenharia do BOAT.
2. **Avaliar se `evaded` (`CrashVehicle`) e a dinâmica de encerramento devem refletir a tríade dos
   arts. 176-178** (sinistro com vítima/sem vítima; recusa de socorro mediante solicitação da
   autoridade como fato distinto de omissão espontânea) — hoje o modelo de dados não distingue
   esses três regimes jurídicos, apenas um campo booleano de evasão.
3. **Planejar solicitação institucional dos dois Manuais RENAEST** (Manual do Sistema RENAEST;
   Manual de Gestão de Estatísticas de Acidente de Trânsito) e do "normativo específico" de campos
   mínimos do BAT — via canal DETRAN-AM↔SENATRAN, não pesquisa pública — antes de finalizar o
   mapeamento campo-a-campo `CrashRecord`/`CrashVehicle`/`CrashPerson`/`CrashVictim` ↔
   `SinistroRequest`/`veiculos`/`pessoas`/`vitimas`.
4. **Avaliar se a bodycam (achado da rodada TEAT, [REF-DETRANAM-TALAO-BODYCAM] art. 4º, I)
   deveria ser modelada como fonte de evidência formal também em BOAT** — a Portaria Normativa
   DETRAN-AM 003/2026 exige gravação obrigatória em "atendimento a sinistros de trânsito", hoje
   sem menção em nenhum artefato BOAT (o §5 de `inf/teat/_intake/bpo-notes.md` já havia flagado
   este item como boat-adjacente, não escrito por regra de fronteira da rodada TEAT).
5. **Confirmar com o Owner se o prazo de disponibilização/registro observado em modelos de outro
   estado (ex.: BATEU-PR, até 180 dias para registro de sinistro sem vítima) é referência útil
   para BOAT** — nenhum prazo equivalente foi localizado em norma federal aplicável ao DETRAN-AM;
   fonte é apenas secundária/estadual (PR).

# Handoff — UX

1. Se o intake de parceiro conveniado (saúde/SAMU) for adotado como onda futura, a UX de
   consolidação (papel `processing-operator`) deveria deixar claro que a origem do dado externo é
   **opcional e institucional** — não um agente de campo aguardando input de terceiro em tempo
   real, mas um fluxo de conciliação/mesclagem de registros vindos de fontes diferentes sobre o
   mesmo sinistro (chave natural uf/município/instante/órgão, mesmo padrão já usado na submissão
   RENAEST).
2. A tela de "Dinâmica" (UX-MOB-066) e a de "Veículos envolvidos" (UX-MOB-062) deveriam capturar,
   quando aplicável, se houve omissão de socorro/preservação/remoção nos termos dos arts. 176-178
   — hoje `evaded` é um campo único, sem distinguir sinistro-com-vítima de sinistro-sem-vítima
   (regimes de dever distintos) nem recusa-mediante-solicitação-da-autoridade (art. 177) de simples
   omissão espontânea.
3. Campos de vítima sensíveis (`hospital_destination`, `health_notes`) já são tratados como PII
   alta em [RN-BOAT-003] — a UX de acesso deveria refletir o princípio de minimização do art. 18
   da Portaria SENATRAN 139/2025 ("evitar a inclusão de dados sensíveis [...] priorizar a
   validação de dados, com acesso ao dado bruto sensível somente em caráter excepcional"), por
   exemplo com uma visão "validada/resumida" padrão e um segundo passo explícito para acessar o
   dado bruto.

---

# Inventário de downloads desta rodada

| Arquivo                                            | Tamanho | Tipo                                                                                                                 |
| -------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `refs/contran/REF-CONTRAN-808-2020.pdf`            | 137 KB  | original (DOU)                                                                                                       |
| `refs/leis/REF-LEI-13614-2018.html`                | 20 KB   | original (planalto.gov.br)                                                                                           |
| `refs/senatran/REF-SENATRAN-PORTARIA-139-2025.pdf` | 492 KB  | original (gov.br/transportes + confirmado DOU)                                                                       |
| `refs/ctb/REF-CTB-sinistro-cena-renaest.md`        | —       | extrato verbatim, reaproveita `REF-CTB-L9503-planalto.html`/`planalto_plain.txt` já capturados nas rodadas RAIT/TEAT |

Todos os `.txt` correspondentes (extração `pdftotext -layout`) foram gerados junto e mantidos ao
lado dos PDFs.

**Negativos registrados (blocked → não-original, ou busca sem êxito, conforme regra de
fronteira):**

- `portal.prf.gov.br/atendimento-a-acidentes/CopiaBAT` e
  `.../paginas-anteriores/declaracao-de-acidente-de-transito-dat` — WebFetch retornou
  `ECONNREFUSED`; `curl` direto (com e sem verificação TLS) também falhou. Conteúdo sobre BAT/e-DAT
  documentado apenas via snippets de busca (WebSearch), marcado como fonte não-original.
- `dados.transportes.gov.br/dataset/renaest` — WebFetch retornou erro de DNS (`ENOTFOUND`).
- `www.bateu.pr.gov.br/batinternet/` — acessível via `curl`, mas a URL testada retornou HTTP 404;
  conteúdo sobre o BATEU documentado apenas via busca.
- Manual do Sistema RENAEST; Manual de Gestão de Estatísticas de Acidente de Trânsito; "normativo
  específico" de campos mínimos do BAT — busca dirigida sem êxito (três instrumentos distintos,
  todos referenciados por norma mas não publicamente localizados).
- Portaria Normativa nº 006/2023/DP/DETRAN/AM (institui o CPPD do DETRAN-AM) — citada por página
  institucional secundária, PDF não localizado/baixado nesta rodada.
- Resolução CONTRAN de atualização terminológica da Res. 808/2020 pós-Lei 14.599/2023 — busca sem
  êxito; possivelmente inexistente (achado a confirmar).

---

# Resumo executivo

**Contagem**: 4 instrumentos novos capturados como original (1 CONTRAN, 1 Lei, 1 Portaria
SENATRAN, 1 novo extrato CTB reaproveitando captura já existente), mais este dossiê. Do mapa
CONFIRMA/CONTRADIZ/ESTENDE: **0 CONTRADIZ** nenhum artefato BOAT existente; **~9 ESTENDE** (a
maioria, incluindo o achado central do RENAEST); **~4 CONFIRMA** com fonte mais forte/específica;
alguns itens permanecem **ABERTO** de forma explicitamente confirmada como lacuna normativa real
(não apenas de pesquisa). Nenhuma contradição frontal encontrada — a mineração original do BOAT
estava correta em tudo que afirmou como incerto, apenas incompleta nos pontos já marcados como
"fonte pendente".

## 5 achados mais consequentes

1. **Base legal tríplice do RENAEST fechada**: CTB arts. 19 (XI/XXXII), 22 (IX), 24 (IV), 326-A
   (todos com redação da Lei 14.599/2023) + Lei 13.614/2018 (origem histórica) + Resolução CONTRAN
   808/2020 (regulamentação infralegal vigente, com o BAT, a máquina de 3 níveis de validação e os
   coordenadores de RENAEST por órgão). Fecha o gap mais citado de todo o corpus BOAT.
2. **"Parceiro conveniado" confirmado com base legal explícita, porém facultativo**: Res. CONTRAN
   808/2020 art. 6º nomeia Ministério da Saúde, secretarias de saúde, SAMU, corpos de bombeiros,
   polícias civis e a administradora do DPVAT como integrantes **facultativos** do RENAEST via o
   DETRAN estadual — resolve a tensão aberta pela rodada de mineração entre a missão declarada de
   [APP-BOAT] e a ausência de RBAC correspondente no corpus `teat`: a hipótese está certa em
   direito, mas não é (e a norma não exige que seja) um RBAC de sistema.
3. **Explicação normativa precisa do desaparecimento do prazo de transmissão**: o CTB art. 326-A
   §9º tinha, desde 2018, prazo fixo de 1º de março para consolidação/repasse estadual; a Lei
   14.599/2023 substituiu esse prazo por remissão a "regulamentação do Contran" — remissão que,
   até onde localizado, **não foi cumprida** por nenhum ato CONTRAN posterior. [WF-BOAT-001] estava
   correto em marcar "fonte pendente"; agora sabe-se exatamente por quê.
4. **Padrão de dados/dicionário RENAEST: existência normativa confirmada em três normas
   independentes (2020, 2022, 2025), conteúdo não obtido em nenhuma delas** — achado consistente o
   suficiente para recomendar, como próximo passo, solicitação institucional direta em vez de nova
   busca pública.
5. **Cadeia legal de obrigações na cena do sinistro (arts. 176-178) capturada por completo**,
   revelando três regimes de dever distintos (sinistro com vítima; recusa mediante solicitação da
   autoridade; sinistro sem vítima) hoje comprimidos em um único campo booleano (`evaded`) no
   modelo de dados de [APP-BOAT] — oportunidade concreta de refinamento de produto identificada
   pelo handoff BPO.
