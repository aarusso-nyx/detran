---
id: REF-CONTRAN-808-2020
title: Res. CONTRAN 808/2020 — institui o Registro Nacional de Acidentes e Estatísticas de Trânsito (RENAEST); revoga a Res. 607/2016
orgao: CONTRAN
status: "vigente (nenhuma revogação/alteração posterior localizada nesta rodada; terminologia do texto ainda usa 'acidente', não atualizada para 'sinistro' pós-Lei 14.599/2023 — ver anotação de risco)"
url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao8082020.pdf ; DOU: https://www.in.gov.br/web/dou/-/resolucao-contran-n-808-de-15-de-dezembro-de-2020-296172888'
pdf: REF-CONTRAN-808-2020.pdf (txt correspondente, extração pdftotext -layout)
apps: [boat, teat, dashboard]
sources: []
updated: 2026-08-24
---

# O que este arquivo é

**Achado central da rodada CRAWLER — BOAT.** Fecha o gap nº 1 do briefing ("base normativa do
RENAEST — CONTRAN? SENATRAN? apenas infra-legal?"): existe, sim, uma **Resolução CONTRAN**
específica e vigente que institui e disciplina o RENAEST em nível infra-legal, fundamentada no
art. 326-A do CTB (por sua vez incluído pela Lei 13.614/2018 — ver [REF-LEI-13614-2018] — e hoje
com redação dada pela Lei 14.599/2023). Texto obtido em PDF original do DOU (`pdftotext -layout`,
conteúdo íntegro e internamente consistente).

## Excertos úteis

### Preâmbulo — fundamento legal

> O CONSELHO NACIONAL DE TRÂNSITO (CONTRAN), no uso da competência que lhe conferem o inciso I
> do art. 12 e o art. 326-A da Lei nº 9.503, de 23 de setembro de 1997, que institui o Código de
> Trânsito Brasileiro (CTB) […] resolve:

Aplica-se a: [RN-BOAT-*] (base legal geral da existência do RENAEST), fecha "(fonte pendente)" de
[APP-BOAT] §Âncoras legais.

### Art. 1º-2º — objeto e definição

> Art. 1º Esta Resolução dispõe sobre o Registro Nacional de Acidentes e Estatísticas de Trânsito
> (RENAEST).
>
> Art. 2º O RENAEST é o sistema de registro, gestão e controle de dados e informações sobre
> acidentes e estatísticas de trânsito, coletados pelos órgãos que compõem o Sistema Nacional de
> Trânsito (SNT) e pelos demais órgãos e entidades que efetuam o registro de acidentes de
> trânsito, que apuram suas circunstâncias ou prestam atendimento às suas vítimas.
>
> Parágrafo único. Os dados e informações de que trata o caput serão consolidados em base
> nacional, organizada e mantida pelo órgão máximo executivo de trânsito da União, de modo a
> subsidiar o desenvolvimento de estudos, pesquisas e ações que visem à melhoria da segurança no
> trânsito no país.

Aplica-se a: [WF-BOAT-001] (existência formal da máquina de estados nacional que o mock
`senatran` implementa).

### Art. 3º — metodologia padronizada e os dois Manuais

> Art. 3º O órgão máximo executivo de trânsito da União estabelecerá metodologia padronizada
> para comunicação, registro, controle, consulta e acompanhamento de dados e informações sobre
> acidentes e estatísticas de trânsito.
>
> Parágrafo único. A metodologia padronizada a que se refere o caput constará no Manual do
> Sistema RENAEST e no Manual de Gestão de Estatísticas de Acidente de Trânsito, a serem
> instituídos pelo órgão máximo executivo de trânsito da União.

**Achado de pesquisa (negativo, documentado)**: os dois Manuais citados neste parágrafo único —
que fechariam por completo o gap nº 3 do briefing (dicionário/padrão de dados) — são
**referenciados normativamente mas não foram localizados publicamente** nesta rodada (busca
dirigida sem sucesso no portal `gov.br/transportes` e no acervo SERPRO). Parecem ser
documentação técnico-operacional restrita aos órgãos integrados ao RENAEST, não publicada como
PDF público — mesmo padrão já observado no TEAT para os "manuais técnico-operacionais
específicos" citados no art. 2º de [REF-SENATRAN-PORTARIA-139-2025].

Aplica-se a: gap "(fonte pendente) padrão de dados/dicionário RENAEST" — **reduzido, não
fechado**: existência e base legal do padrão confirmadas; o documento em si não obtido.

### Art. 4º — o BAT (Boletim de Ocorrência de Acidente de Trânsito) e seus campos

> Art. 4º Os dados sobre acidentes de trânsito serão registrados por meio de Boletim de
> Ocorrência de Acidente de Trânsito (BAT) e relacionados: I - à pessoa, vítima e/ou condutor;
> II - ao veículo; III - à via; e IV - ao acidente propriamente dito.
>
> § 1º O órgão máximo executivo de trânsito da União estabelecerá, em normativo específico, os
> campos mínimos com os dados que deverão compor o BAT.
>
> § 2º Os órgãos que realizam o registro do BAT em todo o território nacional observarão os
> requisitos estabelecidos nesta Resolução.
>
> § 3º Os órgãos que realizam o registro do BAT atestarão a consistência dos dados coletados.
>
> § 4º Os dados e as informações do RENAEST serão complementados por dados e informações dos
> sistemas de Registro Nacional de Veículos Automotores (RENAVAM), Registro Nacional de Carteira
> de Habilitação (RENACH) e Registro Nacional de Infrações de Trânsito (RENAINF).

**Achado de pesquisa (negativo, documentado)**: o "normativo específico" do §1º (equivalente, para
o BAT, ao que a Portaria SENATRAN 997/2022 é para o AIT do TEAT — ver [REF-SENATRAN-997]) **não
foi localizado**. A Portaria SENATRAN 354/2022 encontrada na busca trata dos campos mínimos do
**AIT** (autuação), não do BAT — não deve ser confundida como fonte deste dispositivo.

As 4 categorias do inciso I-IV mapeiam diretamente ao modelo de dados de [APP-BOAT]: I→
`CrashPerson`/`CrashVictim`; II→`CrashVehicle`; III→dados de via em `CrashRecord`; IV→dinâmica/
tipo em `CrashRecord`. Confirma a estrutura, não fecha o mapeamento campo-a-campo (ver
`_intake/proposals.md` item já registrado).

### Art. 5º — homologação, validação em três níveis e LGPD

> Art. 5º Os dados e as informações referentes a acidentes e estatísticas de trânsito, coletados e
> enviados ao órgão máximo executivo de trânsito da União, serão homologados e, então,
> consolidados na base nacional do RENAEST.
>
> § 1º Para fins de consolidação, os dados e as informações na base nacional do RENAEST serão
> validados em nível: I - municipal: pelos órgãos ou entidades executivos de trânsito dos
> municípios integrados ao SNT; II - estadual: pelos órgãos e entidades executivos de trânsito dos
> Estados e do Distrito Federal; e III - federal: pelo órgão máximo executivo de trânsito da
> União.
>
> § 2º Nos municípios não integrados ao SNT, a validação das informações será realizada pelos
> órgãos e entidades executivos de trânsito dos Estados e do Distrito Federal.
>
> [...]
>
> § 5º No envio de dados e informações de que trata o caput entre os órgãos integrados ao
> RENAEST, serão observados os dispositivos da Lei nº 13.709, de 14 de agosto de 2018, a Lei Geral
> de Proteção de Dados Pessoais (LGPD).

**CONFIRMA, com fonte normativa explícita**, a máquina de estados de 3 níveis
(RECEBIDO→EM_ANALISE→CONSOLIDADO/REJEITADO) hoje só documentada via contrato técnico
`senatran`-mock em [WF-BOAT-001] — "homologados e, então, consolidados" é a origem normativa do
verbo "consolidação nacional" do mock. **Achado de LGPD de alto valor** (handoff LEGAL): o §5º é
a **única menção normativa explícita à LGPD** encontrada em toda a cadeia RENAEST — mas trata
apenas do envio entre órgãos **integrados**; nada dispõe sobre base legal de tratamento, retenção
ou direitos do titular para os **dados sensíveis de saúde da vítima** (`hospital_destination`,
`health_notes` em [RN-BOAT-003]) especificamente.

Aplica-se a: [WF-BOAT-001] (máquina de estados nacional — fonte normativa agora além do mock),
[RN-BOAT-003] (LGPD).

### Art. 6º — integração ao RENAEST: quem pode/deve, e a confirmação do "parceiro conveniado"

> Art. 6º O RENAEST, coordenado pelo órgão máximo executivo de trânsito da União, será integrado
> pelos órgãos e entidades do SNT.
>
> § 1º Poderão integrar o RENAEST os demais órgãos e entidades que efetuam o registro de
> ocorrências de acidentes de trânsito, que apuram suas circunstâncias ou prestam atendimento às
> vítimas, entre os quais: I - o Ministério da Saúde; II - as secretarias de saúde dos Estados, do
> Distrito Federal e dos municípios; III - o Serviço de Atendimento Médico de Urgência (SAMU);
> IV - as polícias civis e os corpos de bombeiros militares dos Estados e do Distrito Federal; e
> V - a administradora do Seguro de Danos Pessoais Causados por Veículos Automotores de Via
> Terrestre (Seguro DPVAT).
>
> § 2º Os órgãos ou entidades executivos de trânsito dos Estados e do Distrito Federal, a Polícia
> Rodoviária Federal (PRF), o Departamento Nacional de Infraestrutura de Transportes (DNIT) e a
> Agência Nacional de Transportes Terrestres (ANTT) deverão se integrar ao RENAEST por meio do
> órgão máximo executivo de trânsito da União.
>
> § 3º Caso optem pela integração ao RENAEST, o Ministério da Saúde e a administradora do Seguro
> DPVAT deverão se integrar por meio do órgão máximo executivo de trânsito da União.
>
> § 4º Ressalvados os órgãos e entidades elencados no § 2º, os demais órgãos e entidades
> integrantes do SNT deverão se integrar ao RENAEST por meio do órgão ou entidade executivo de
> trânsito do Estado ou do Distrito Federal, de acordo com a respectiva circunscrição.
>
> § 5º Caso os órgãos e entidades elencados nos incisos II, III e IV do § 1º optem pela integração
> ao RENAEST, deverão se integrar por meio do órgão ou entidade executivo de trânsito do Estado ou
> do Distrito Federal, de acordo com a respectiva circunscrição.

**Achado mais consequente da rodada para o modelo de atores de BOAT.** Este dispositivo
**CONFIRMA, com base legal explícita, a hipótese de "parceiro conveniado"** que
`_intake/proposals.md` da rodada de mineração havia marcado como não confirmada pelo corpus
`teat` lido (nenhum RBAC próprio encontrado). A norma nomeia exatamente os três setores da missão
de [APP-BOAT] ("saúde, rodovias, seguradoras"): saúde (Ministério da Saúde, secretarias estaduais/
municipais, **SAMU**), segurança/emergência (polícias civis, corpos de bombeiros) e seguro
(administradora do **DPVAT**) como integráveis ao RENAEST. Duas nuances importantes:

1. A integração desses órgãos é **facultativa** ("Poderão integrar" / "Caso optem") — não há
   dever legal de que hospitais/SAMU/seguradora alimentem o sistema, diferente da integração
   **obrigatória** dos órgãos do SNT (art. 6º, caput, e art. 16).
2. Quando optam, integram-se **através do órgão estadual/distrital de trânsito** (§5º) — ou seja,
   a via de entrada desses parceiros no fluxo de dados é o **próprio DETRAN estadual**, não uma
   ligação direta com a União. Isso é compatível com — e talvez seja a base normativa procurada
   para — o papel `processing-operator` de [APP-BOAT] atuar como ponto de consolidação de dados
   vindos de fontes externas antes da transmissão nacional, embora a Resolução não crie nenhum
   RBAC ou fluxo de sistema específico (é norma de governança interinstitucional, não de UX/
   modelagem de dados).

Aplica-se a: `_intake/proposals.md` "Atores (`shared/actors.md`) — a reconciliar: parceiro
conveniado" — **hipótese CONFIRMADA como legalmente prevista, porém facultativa e sem RBAC
próprio definido pela norma**; [APP-BOAT] §Missão e §Atores.

### Art. 5º, §§ 3º e 4º — vinculação aos Manuais _(acrescentado na revisão LEGAL de 2026-08-24)_

> § 3º Os órgãos e entidades integrados ao RENAEST adotarão todas as medidas necessárias ao seu
> efetivo funcionamento, em observância ao que dispõe o Manual do Sistema RENAEST e o Manual de
> Gestão de Estatísticas de Acidente de Trânsito, previstos no parágrafo único do art. 3º.
>
> § 4º O envio de dados e informações de que trata o caput deverá seguir as regras do Manual do
> Sistema RENAEST e as orientações do Manual de Gestão de Estatísticas de Acidente de Trânsito,
> previstos no parágrafo único do art. 3º.

**Anotação de risco (revisão LEGAL).** Os §§ 3º e 4º **vinculam a conduta do órgão a documentos que
não são públicos** — o DETRAN-AM está normativamente obrigado a registrar e enviar "em conformidade
com os Manuais" que a pesquisa não localizou. Isso não é detalhe: é obrigação de resultado sem
acesso ao critério. Aplica-se a: [RN-BOAT-103].

### Art. 7º-15 — coordenadores, competências e prazos de envio (cadeia de citação ao CTB)

> Art. 7º Os órgãos e entidades executivos de trânsito dos Estados e do Distrito Federal, a PRF, o
> DNIT e a ANTT designarão um Coordenador de RENAEST, responsável pelo controle, tratamento e
> fornecimento dos dados referentes a acidentes e estatísticas de trânsito, bem como pelo
> relacionamento com o Coordenador designado pelo órgão máximo executivo de trânsito da União.
>
> Parágrafo único. Caso o Ministério da Saúde opte pela integração ao RENAEST, designará um
> Coordenador de RENAEST, nos termos previstos no caput.

_(art. 7º completado na revisão LEGAL de 2026-08-24 — a captura original truncava o caput e omitia
o parágrafo único. Aplica-se a: [RN-BOAT-105].)_

> Art. 8º Caberá ao órgão máximo executivo de trânsito da União: I - organizar e manter o RENAEST;
> II - estabelecer os dados mínimos que deverão compor o BAT; III - desenvolver e padronizar os
> procedimentos operacionais do sistema por meio dos Manuais previstos no parágrafo único do art.
> 3º; IV - validar em nível federal, homologar e consolidar os dados e as informações na base
> nacional do RENAEST; V - **publicar, atualizar mensalmente e promover a divulgação das informações
> referentes a acidentes e estatísticas de trânsito no sítio eletrônico do órgão**; VI - assegurar a
> correta gestão do RENAEST; VII - incentivar a integração dos órgãos e entidades de que trata o
> art. 6º; e VIII - organizar e realizar reuniões periódicas com os coordenadores previstos no art.
> 7º, para manutenção e gestão do RENAEST.

_(art. 8º **acrescentado integralmente** na revisão LEGAL de 2026-08-24 — não constava da captura
original.)_ Dois incisos com efeito de regra: o **II** é a base de competência do padrão de
gravidade e dos campos mínimos ([RN-BOAT-111]); o **V** é o **único dever normativo de publicação
estatística** localizado em toda a cadeia, e é **federal e mensal** — não estadual ([RN-BOAT-130]).

> Art. 9º Caberá aos órgãos e entidades executivos de trânsito dos Estados e do Distrito Federal:
> I - organizar e manter os dados e as informações referentes a acidentes e estatísticas de
> trânsito, de acordo com as regras dos Manuais previstos no parágrafo único do art. 3º; II - enviar
> ao órgão máximo executivo de trânsito da União os dados referentes a acidentes e estatísticas de
> trânsito coletados conforme disposto no inciso IX do art. 22 do CTB, em conformidade com os
> Manuais previstos no parágrafo único do art. 3º; III - validar os dados e as informações coletados
> em nível estadual e, no caso dos municípios não integrados ao SNT, em nível municipal; IV - seguir
> os procedimentos operacionais do sistema por meio dos Manuais previstos no parágrafo único do art.
> 3º; V - cooperar para a correta gestão do RENAEST; VI - incentivar a integração dos órgãos e
> entidades de que trata o art. 6º; VII - participar das reuniões periódicas com os coordenadores
> previstos no art. 7º, para manutenção e gestão do RENAEST; e VIII - organizar e realizar reuniões
> periódicas com os órgãos ou entidades integradas ao RENAEST em nível estadual.

_(art. 9º **completado** na revisão LEGAL de 2026-08-24 — a captura original trazia apenas o inciso
II.)_ É o **rol taxativo de deveres do DETRAN-AM** no RENAEST: seis dos oito incisos não são de
envio, mas de organização, validação, cooperação e **articulação com terceiros** ([RN-BOAT-105],
[RN-BOAT-113]).

> Art. 10. Caberá aos órgãos e entidades executivos de trânsito dos municípios: [...] II - enviar
> ao órgão ou entidade executivo de trânsito do respectivo Estado os dados referentes a acidentes
> e estatísticas de trânsito coletados conforme disposto no inciso IV do art. 24 do CTB [...]
>
> Art. 11. Caberá à PRF enviar ao órgão máximo executivo de trânsito da União os dados referentes
> a acidentes e estatísticas de trânsito coletados conforme disposto no inciso VII do art. 20 do
> CTB [...]
>
> Art. 12. Caberá ao DNIT enviar [...] conforme disposto no inciso IV do art. 21 do CTB [...]
>
> Art. 13. Caberá à ANTT enviar ao órgão máximo executivo de trânsito da União os dados referentes a
> acidentes e estatísticas de trânsito coletados conforme inciso XIV do art. 35 da Lei nº 10.233, de
> 5 de junho de 2001 [...]
>
> Art. 14. Caberá aos órgãos executivos rodoviários dos Estados, do Distrito Federal e dos
> municípios enviar ao órgão ou entidade executivo de trânsito da respectiva Unidade Federativa os
> dados referentes a acidentes e estatísticas de trânsito coletados conforme disposto no inciso IV
> do art. 21 do CTB, em conformidade com os Manuais previstos no parágrafo único do art. 3º.
>
> Art. 15. Caberá aos Conselhos Estaduais de Trânsito (CETRAN): I - mediar e fomentar a comunicação
> entre os municípios e os órgãos e entidades executivos de trânsito dos Estados; e II - estimular
> os municípios a coletarem e fornecerem os dados e as informações referentes a acidentes e
> estatísticas de trânsito aos órgãos e entidades executivos de trânsito dos Estados.

_(arts. 13, 14 e 15 **acrescentados** na revisão LEGAL de 2026-08-24.)_ O art. 14 confirma que os
órgãos rodoviários estaduais e municipais enviam **ao DETRAN**, não à União — reforçando o papel de
hub estadual ([RN-BOAT-113]); o art. 15 traz o CETRAN como **articulador**, papel de governança que
não aparece em nenhum artefato BOAT.

Cadeia de citação **fecha exatamente** com os dispositivos capturados em
[REF-CTB-sinistro-cena-renaest] arts. 19 (XI, XXXII), 20 (VII, XIII), 21 (IV), 22 (IX), 24 (IV) —
confirmação cruzada entre a Resolução (2020, ainda com terminologia "acidente") e o texto vigente
do CTB (com terminologia "sinistro" desde 2023): a competência de **coletar** dados é do CTB
(arts. 19-24), a obrigação específica de **enviar ao RENAEST** e a definição de coordenador são
desta Resolução.

### Art. 16-18 — prazo de integração e revogação

> Art. 16. Os órgãos e entidades que compõem o SNT deverão se integrar ao RENAEST até 4 de janeiro
> de 2022.
>
> Art. 17. Fica revogada a Resolução CONTRAN nº 607, de 24 de maio de 2016.
>
> Art. 18. Esta Resolução entra em vigor em 4 de janeiro de 2021.

O art. 16 é o único **prazo legal** localizado em toda a pesquisa desta rodada — mas é prazo de
**integração institucional do órgão** ao sistema (já vencido, 04/01/2022), não prazo de
transmissão de cada sinistro individual após o atendimento. Aplica-se a: [WF-BOAT-001] §Prazos e
timers — **não fecha** o gap (nenhum prazo por-registro localizado), mas fornece o único marco
temporal normativo do domínio RENAEST.

## Anotação de risco — desatualização terminológica pós-Lei 14.599/2023

A Resolução usa, em todo o seu texto, "acidente(s) de trânsito" e nomeia o RENAEST como "Registro
**Nacional de Acidentes** e Estatísticas de Trânsito" — a nomenclatura **anterior** à renomeação
promovida pela Lei 14.599/2023 no próprio CTB (que hoje chama o mesmo sistema de "Registro
**Nacional de Sinistros** e Estatísticas de Trânsito", CTB art. 19, XXXII — ver
[REF-CTB-sinistro-cena-renaest]). **Nenhuma resolução CONTRAN de atualização terminológica
posterior a 2023 foi localizada nesta rodada** — a Res. 808/2020 permanece, ao que tudo indica,
formalmente vigente com o nome antigo, gerando uma dissonância nominal entre a lei (sinistro) e a
resolução regulamentadora (acidente) que ainda organiza e mantém o mesmo sistema. Recomenda-se
verificação jurídica humana antes de tratar isso como confirmação de que o sistema captado pelo
mock `senatran` (que já usa `SinistroRequest`/gravidade em português "sinistro") corresponde
100% ao RENAEST desta Resolução — a correspondência é de altíssima probabilidade (mesmo acrônimo,
mesmo órgão, mesma função), mas não há um único instrumento que amarre as duas nomenclaturas
formalmente.

## Índice reverso — artigo → aplicação em BOAT

_(reescrito na revisão LEGAL de 2026-08-24 com as RN da série legal)_

| Artigo                                                            | Aplica-se a                                                                                                                        |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Art. 2º e parágrafo único                                         | [RN-BOAT-102] — existência, natureza e finalidade da base nacional; [RN-BOAT-122] (finalidade estatística ≠ segurança pública)     |
| Art. 3º, parágrafo único                                          | [RN-BOAT-103] — Manuais: existem por norma, não são públicos                                                                       |
| Art. 4º, I-IV                                                     | [RN-BOAT-103] — BAT como documento-fonte e as 4 categorias; [RN-BOAT-001]                                                          |
| Art. 4º, § 1º                                                     | [RN-BOAT-103], [RN-BOAT-111] — campos mínimos e padrão de gravidade dependem de normativo não localizado                           |
| Art. 4º, § 3º                                                     | **[RN-BOAT-004]** — âncora do dever local de atestar consistência (fecha "(fonte pendente)"); [RN-BOAT-002]                        |
| Art. 4º, § 4º                                                     | [RN-BOAT-107] — complementação por RENAVAM/RENACH/RENAINF                                                                          |
| Art. 5º, _caput_ e § 1º/§ 2º                                      | [RN-BOAT-104] — homologação e validação em três níveis; [WF-BOAT-001]                                                              |
| Art. 5º, §§ 3º e 4º                                               | [RN-BOAT-103] — vinculação a Manuais não públicos                                                                                  |
| Art. 5º, § 5º                                                     | [RN-BOAT-003], [RN-BOAT-122], [RN-BOAT-127] — LGPD no envio entre órgãos                                                           |
| Art. 6º, _caput_, § 2º e § 4º                                     | [RN-BOAT-108] — integração obrigatória do SNT; [RN-BOAT-113] — DETRAN como hub estadual                                            |
| Art. 6º, § 1º, § 3º e § 5º                                        | [RN-BOAT-112] — parceiros facultativos (saúde/SAMU/bombeiros/polícia civil/DPVAT); [RN-BOAT-128] — regime LGPD do compartilhamento |
| Art. 7º                                                           | [RN-BOAT-105] — Coordenador de RENAEST                                                                                             |
| Art. 8º, II                                                       | [RN-BOAT-111] — competência federal do padrão de gravidade e dos campos mínimos                                                    |
| Art. 8º, IV                                                       | [RN-BOAT-104] — validação federal, homologação e consolidação                                                                      |
| Art. 8º, V                                                        | [RN-BOAT-130] — dever de publicação estatística é federal e mensal; [RN-BOAT-106] (referência de periodicidade)                    |
| Art. 9º, I-VIII                                                   | [RN-BOAT-105], [RN-BOAT-113] — rol de deveres estaduais                                                                            |
| Art. 9º, II / Art. 10, II / Art. 11 / Art. 12 / Art. 13 / Art. 14 | cadeia de citação a CTB arts. 22, IX / 24, IV / 20, VII / 21, IV e Lei 10.233 art. 35, XIV                                         |
| Art. 15                                                           | [RN-BOAT-113] — CETRAN como articulador municípios↔Estado                                                                          |
| Art. 16                                                           | [RN-BOAT-108] — prazo de integração institucional, vencido em 04/01/2022; [RN-BOAT-106] (não é prazo por registro)                 |
