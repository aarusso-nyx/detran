---
id: REF-CONTRAN-1025-2026
title: Resolução CONTRAN nº 1.025, de 26/06/2026 — remoção, guarda, liberação e leilão de veículos recolhidos; institui o SIVEC
orgao: CONTRAN (DOU 30/06/2026, ed. 120, seção 1, p. 145-147)
status: vigente (em vigor desde a publicação; revoga a Res. CONTRAN 623/2016 — art. 45)
url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resoluo10252026.pdf'
pdf: 'REF-CONTRAN-1025-2026.pdf (txt: REF-CONTRAN-1025-2026.txt)'
apps: [teat, boat]
sources:
  [
    'CTB arts. 271, 328',
    REF-CTB-165-277-medidas-alcoolemia,
    REF-CTB-sinistro-cena-renaest,
  ]
updated: 2026-08-24
---

# O que este arquivo é

Regulamentação **vigente e muito recente** (publicada há menos de dois meses da data desta
pesquisa) do CTB art. 271 (remoção de veículo) e art. 328 (leilão), que revoga integralmente a
Res. CONTRAN nº 623/2016 — o instrumento historicamente citado nesta matéria. Cria o **Sistema
Integrado de Veículos Custodiados (Sivec)**, plataforma nacional obrigatória de governança de
remoção/guarda/liberação/leilão, e institui a **guarda monitorada** (custódia do veículo sob
responsabilidade do próprio proprietário, com dispositivo de monitoramento, como alternativa à
remoção física a depósito). Extraído via `pdftotext -layout` do PDF oficial do DOU.

**Achado de vigência**: esta Resolução é datada de 26/06/2026 — **posterior à data de
"revisão LEGAL de 2026-08-24" registrada em `refs/INDEX.md`**, mas anterior à data de hoje
(2026-08-24). Não há indício de que os artefatos RAIT/TEAT já existentes tenham considerado esta
norma; é achado 100% novo desta rodada.

---

## Art. 1º — Objeto e Sivec

> Art. 1º Esta Resolução dispõe sobre a aplicação da medida administrativa de remoção de veículo
> infrator, os serviços de remoção e guarda, a liberação e o leilão de veículos recolhidos a
> qualquer título, nos termos dos arts. 271 e 328 da Lei nº 9.503, de 23 de setembro de 1997 -
> Código de Trânsito Brasileiro.
>
> § 1º Fica instituído o Sistema Integrado de Veículos Custodiados - Sivec, plataforma nacional
> de integração e governança das informações relativas à remoção, guarda, liberação e leilão de
> veículos.
>
> § 2º O Sivec estará integrado aos sistemas e subsistemas informatizados do órgão máximo
> executivo de trânsito da União relacionados aos processos de que trata esta Resolução.

**Efeito no TEAT.** O Sivec é um novo sistema nacional de integração análogo, em natureza, ao
RENAVAM/RENACH/RENAINF já listados em [APP-TEAT] como integrações auditadas do TEAT. Se o TEAT
aplica a medida administrativa de remoção, o registro eletrônico da medida (art. 14 abaixo)
deverá, no médio prazo, alimentar o Sivec — **candidato a nova integração** em
[INV-INTEGRATION-001], hoje não listada.

## Art. 14 — Termo de Recolhimento do Veículo (conteúdo mínimo)

> Art. 14. Ao aplicar a medida administrativa de remoção do veículo, nos termos do art. 271 do
> Código de Trânsito Brasileiro, o órgão ou entidade responsável pela aplicação da medida
> administrativa de remoção dos veículos deverá emitir o Termo de Recolhimento do Veículo e
> realizar o respectivo registro eletrônico junto ao órgão máximo executivo de trânsito da União,
> na forma por ele estabelecida, contendo, no mínimo, as seguintes informações:
>
> I - a identificação do órgão ou da entidade responsável pela aplicação da medida administrativa
> de remoção; II - a identificação do veículo; III - a indicação do número do auto de infração,
> da ordem judicial ou do ato administrativo que tenha determinado a remoção; IV - o local, a
> data e a hora da remoção; V - o fundamento legal que ampara a aplicação da medida administrativa
> de remoção; VI - a identificação do local de guarda do veículo; e VII - identificação do
> proprietário e do condutor, sempre que possível.
>
> § 1º Devem ser registrados no Termo de Recolhimento do Veículo os objetos deixados no veículo
> por conveniência e inteira responsabilidade do condutor; os equipamentos obrigatórios ausentes;
> o estado geral da lataria, pintura e pneus e o prazo para a retirada do veículo, sob pena de ser
> levado a leilão.
>
> § 2º Considera-se notificado o proprietário ou o condutor presente no momento do recolhimento,
> ainda que se recuse a assinar o termo de recolhimento.

**Efeito no TEAT — este é o "campo mínimo" que faltava para modelar formalmente a medida
administrativa de remoção.** O `AdministrativeTerm` de remoção do TEAT deveria produzir, no
mínimo, os 7 campos do _caput_ mais os do §1º (objetos deixados no veículo, equipamentos
ausentes, estado de conservação, prazo de retirada). O §2º é diretamente equivalente, para a
remoção, ao padrão de "assinado/recusa/impossibilidade" de [RN-TEAT-005]: recusa de assinatura
**não impede** a notificação de se considerar válida — mesma lógica do art. 271 §7º do CTB (ver
[REF-CTB-165-277-medidas-alcoolemia]).

## Art. 15 — Notificação quando ausente o proprietário/condutor

> Art. 15. Caso o proprietário ou o condutor não esteja presente no momento da remoção do
> veículo, o órgão ou a entidade responsável pela remoção do veículo providenciará em até dez
> dias da remoção, a notificação ao proprietário acerca da aplicação da medida administrativa de
> remoção, das providências necessárias à restituição do veículo e da possibilidade de seu
> encaminhamento a leilão, caso não seja reclamado no prazo legal.
>
> § 1º A notificação de que trata o _caput_ será realizada, preferencialmente, por meio
> eletrônico, pelo Sistema de Notificação Eletrônica - SNE, de que trata o art. 282-A do Código
> de Trânsito Brasileiro, conforme regulamentação específica e observados os procedimentos
> estabelecidos pelo órgão máximo executivo de trânsito da União.
>
> § 2º Quando não houver adesão prévia ao SNE, a notificação será realizada por remessa postal,
> no prazo máximo de dez dias contado da data da remoção e, frustrada sua entrega, mediante
> publicação por edital, nos termos da legislação aplicável.
>
> § 3º A partir de 1º de janeiro de 2027, as notificações de que trata o _caput_ serão realizadas
> exclusivamente por meio do SNE, nos termos do art. 24, inciso I, da Lei nº 14.440, de 2 de
> setembro de 2022, conforme regulamentação específica.

**Efeito no TEAT/RAIT.** Confirma o prazo de 10 dias já presente no CTB art. 271 §6º, e adiciona
um **marco temporal duro para 2027**: a partir de 1/1/2027, notificação de remoção passa a ser
**exclusiva** pelo SNE. Isso é relevante para [REF-CONTRAN-931] (SNE) e para o roadmap do RAIT/
PORTAL — hoje não registrado em nenhum artefato lido.

## Art. 16 — veículos abandonados e **sinistrados** _(acrescentado na revisão LEGAL de 2026-08-24 — cruzamento com BOAT)_

> Art. 16. Ao recolhimento de veículos abandonados, **sinistrados**, identificados com restrição
> policial ou judicial sobre seu prontuário, aplicam-se as disposições do art. 328 do Código de
> Trânsito Brasileiro, sem prejuízo do cumprimento das demais regras estabelecidas nesta Resolução.

**Efeito — é o ponto de contato entre esta Resolução e o domínio de sinistro.** O CTB art. 279-A
autoriza a remoção do veículo **sinistrado** quando não há responsável no local,
_"independentemente da existência de infração à legislação de trânsito"_, e manda aplicar o art. 328
(§ 2º) — remissão que este art. 16 confirma. Consequências: (a) o Termo de Recolhimento do art. 14
pode nascer de um **sinistro**, sem AIT de origem ([RN-TEAT-118], [RN-BOAT-120]); (b) o prazo a
imprimir é o de **60 dias do recolhimento** (art. 328 _caput_ c/c art. 25 desta Resolução), não os
30 dias do edital — erro já anotado no item 29 de `inf/teat/_intake/legal-assessment.md`, aqui
ainda mais gravoso, porque o proprietário do veículo sinistrado pode estar hospitalizado. Ver
[REF-CTB-sinistro-cena-renaest] arts. 279-A e 328.

## Art. 17 — Guarda monitorada (figura nova)

> Art. 17. O órgão ou entidade competente poderá autorizar o cumprimento da medida
> administrativa de remoção mediante guarda monitorada do veículo sob responsabilidade de seu
> proprietário ou possuidor legítimo, observados os requisitos estabelecidos nesta Resolução.
>
> § 1º A autorização prevista no _caput_ constitui prerrogativa do órgão ou entidade competente,
> e somente poderá ser concedida quando atendidos os seguintes requisitos: I - o veículo deve
> oferecer condições de segurança para circulação; II - o veículo não possui indícios de
> adulteração de placa, chassi, motor e demais sinais identificadores; III - o veículo deve ser
> retirado por condutor regularmente habilitado; IV - o veículo não possui registro ativo de
> furto, roubo, apropriação indébita ou outra ocorrência criminal; V - o veículo não possui
> restrições judiciais; VI - o veículo com contrato de alienação fiduciária não está sob execução
> extrajudicial…; VII - o veículo deve ter sido licenciado em pelo menos um dos três últimos
> exercícios; VIII - o proprietário ou possuidor não tenha descumprido o prazo para regularização
> concedido nos termos do art. 271, § 9º-A, do CTB…; e IX - inexistem circunstâncias que
> comprometam o acompanhamento, a fiscalização ou a efetividade da guarda monitorada.
>
> § 3º O descumprimento das condições da guarda monitorada, inclusive mediante remoção,
> inutilização ou violação do dispositivo de monitoramento, acarretará a imposição de restrição
> administrativa de circulação do veículo, sujeitando-o à remoção e ao recolhimento ao local de
> guarda indicado pelo órgão ou entidade competente, vedada a concessão de nova guarda monitorada
> para o mesmo fato gerador, caracterizando-se como infração prevista no art. 239 do Código de
> Trânsito Brasileiro, cuja autuação compete ao órgão ou entidade responsável pela aplicação da
> medida administrativa de remoção do veículo.
>
> § 4º A guarda monitorada de que trata o _caput_ será viabilizada por soluções tecnológicas
> previamente homologadas pelo órgão máximo executivo de trânsito da União…

**Efeito no TEAT — figura totalmente nova, fora do escopo hoje descrito em [APP-TEAT].** "Guarda
monitorada" é uma terceira via entre "liberar" e "remover fisicamente": o veículo permanece com o
proprietário sob monitoramento eletrônico homologado. Isso é uma **extensão de escopo em
potencial** para o módulo de medidas administrativas do TEAT — hoje o app modela apenas
retenção/remoção/termos, sem essa modalidade. Se DETRAN-AM adotar, TEAT precisará: (a) registrar
a autorização com os 9 requisitos do §1º; (b) tratar violação do monitoramento como nova infração
autônoma (art. 239 CTB, autuação pelo próprio órgão de remoção) — um caso raro de medida
administrativa que **gera** um novo AIT.

### Art. 17, §§2º, 5º, 6º e 7º _(acrescentados na revisão LEGAL de 2026-08-24 — faltavam na captura original)_

> § 2º A aplicação da medida de que trata o caput não afasta a aplicação das demais medidas
> administrativas e penalidades previstas na legislação de trânsito.
>
> § 5º Os órgãos ou entidades responsáveis pelos serviços de remoção ou guarda de veículos poderão
> operar as soluções tecnológicas de guarda monitorada, desde que previamente homologadas pelo órgão
> máximo executivo de trânsito da União, nos termos do § 4º.
>
> § 6º Aplica-se aos procedimentos de guarda monitorada o disposto no art. 25.
>
> § 7º A adoção da medida prevista neste artigo observará critérios de eficiência administrativa,
> racionalização da utilização dos serviços de remoção e otimização da capacidade dos locais de
> guarda de veículos.

**Anotação LEGAL.** O §6º é decisivo e passava despercebido: **o prazo de 60 dias do art. 25
(leilão do veículo não reclamado) aplica-se também à guarda monitorada** — ou seja, o veículo em
poder do próprio proprietário, sob monitoramento, **continua correndo prazo de alienação** se as
pendências não forem regularizadas. O §2º impede leitura da guarda monitorada como benefício que
substitui penalidade. O §4º c/c §5º condiciona toda a modalidade a **soluções tecnológicas
homologadas** cujos requisitos técnicos o órgão máximo _"estabelecerá"_ — futuro, ainda não
publicado: **a figura está em vigor mas é operacionalmente inaplicável até essa regulamentação**.
Aplica-se a: [RN-TEAT-127], [RN-TEAT-128].

## Arts. 21 a 27 — Custos, liberação e prazos de custódia _(acrescentado na revisão LEGAL de 2026-08-24)_

> Art. 21. Os custos dos serviços de remoção e guarda do veículo serão suportados pelo proprietário
> ou interessado, nos termos da legislação aplicável, inclusive na modalidade de guarda monitorada
> de que trata o art. 17.
>
> § 1º A cobrança pela guarda do veículo será efetuada por diárias, correspondentes a períodos de
> vinte e quatro horas, contadas da entrada do veículo no centro de custódia, sendo devida nova
> diária somente após o transcurso de cada período.
>
> § 2º A cobrança das diárias de guarda fica limitada ao período máximo de seis meses, sendo seu
> pagamento devido por quem promover a retirada do veículo, independentemente de ser o proprietário
> ou de ter dado causa ao seu recolhimento.

> Art. 22. Todas as informações relativas à custódia do veículo, inclusive sua localização,
> situação, histórico de movimentações, valores atualizados dos serviços de remoção e guarda e
> demais informações pertinentes à sua liberação ou alienação deverão permanecer permanentemente
> atualizadas no Sivec e disponibilizadas ao proprietário […]

> Art. 23. A liberação do veículo dependerá da prévia quitação dos débitos incidentes e da
> regularização das condições que motivaram sua remoção […] § 1º Quando a regularização exigir
> providência que não possa ser realizada no centro de custódia, o veículo poderá ser liberado
> exclusivamente para transporte ao local destinado ao reparo, mediante autorização do órgão ou
> entidade competente, sendo fixado prazo para reapresentação não superior a sessenta dias. § 2º Não
> realizada a regularização do veículo no prazo estabelecido, será registrada restrição
> administrativa de circulação no […] Renavam […]

> Art. 25. O veículo removido a qualquer título e não reclamado pelo proprietário ou interessado, no
> prazo de sessenta dias contado da data do recolhimento, será levado a leilão […] § 1º Considera-se
> não reclamado o veículo cujo proprietário ou interessado, dentro do prazo legal, deixe de promover
> simultaneamente: I - a regularização das pendências que motivaram sua retenção ou remoção; e II -
> sua retirada do centro de custódia.

> Art. 26. Decorridos trinta dias da remoção do veículo, sem que tenha ocorrido sua regularização e
> retirada, poderá ser promovida notificação por edital para cientificar o proprietário e os demais
> interessados acerca da necessidade de promover sua liberação, sob pena de encaminhamento do
> veículo a leilão […]
>
> Art. 27. Decorrido o prazo de trinta dias contado da data do recolhimento do veículo, poderá ser
> iniciado o procedimento de preparação para o leilão […]

Complementam: **art. 19** (ingresso no centro de custódia precedido de **vistoria eletrônica**) e
**art. 20** (o centro de custódia responde pela guarda, segurança e integridade física do veículo
durante toda a custódia).

**Efeito no TEAT.** Depósito, guarda e leilão estão fora do escopo operacional do TEAT, mas **um
desses prazos precisa ser impresso corretamente no termo entregue em campo**: o art. 14 §1º exige
que o Termo de Recolhimento registre _"o prazo para a retirada do veículo, sob pena de ser levado a
leilão"_ — e esse prazo é o do **art. 25: sessenta dias contados do recolhimento**, não os trinta
dias do art. 26/27 (que são o marco do edital e da preparação do leilão). Imprimir 30 dias é vício
de notificação com efeito sobre a alienação. Aplica-se a: [RN-TEAT-126], [RN-TEAT-128].

## Art. 45 e 46 — Revogação e vigência

> Art. 45. Fica revogada a Resolução Contran nº 623, de 6 de setembro de 2016.
>
> Art. 46. Esta Resolução entra em vigor na data de sua publicação.

---

# Achados de conferência

Extração direta via `pdftotext -layout` do PDF do DOU; conteúdo consistente internamente (numeração
de artigos, remissões ao CTB corretas). Não há fonte secundária de conferência disponível dado o
ineditismo da norma (publicada há ~2 meses da data da pesquisa) — recomenda-se reconferência
humana antes de uso como base normativa definitiva de produto, dado o caráter recentíssimo.

# Índice reverso — dispositivo → artefato TEAT/RAIT

| Dispositivo                                     | Artefato                                                                     | Efeito                                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Art. 1º §1º-2º (Sivec)                          | [APP-TEAT] integrações                                                       | EXTENDE — candidato a nova integração nacional                                             |
| Art. 14                                         | [RN-TEAT-126], `AdministrativeTerm` de remoção                               | GAP fechado — conteúdo mínimo do termo (7 + 4 elementos)                                   |
| Art. 14, III                                    | [RN-TEAT-118]                                                                | remoção **pode existir sem AIT** (ordem judicial / ato administrativo)                     |
| Art. 14, V                                      | [RN-TEAT-125]                                                                | exige **fundamento legal estruturado** da remoção                                          |
| Art. 14 §2º                                     | [RN-TEAT-005], [RN-TEAT-126]                                                 | CONFIRMA padrão de notificação válida mesmo com recusa de assinatura                       |
| Art. 15 §3º (marco 2027 SNE)                    | [REF-CONTRAN-931], RAIT/PORTAL roadmap                                       | EXTENDE — novo prazo regulatório não registrado alhures                                    |
| **Art. 16 (veículo sinistrado → art. 328 CTB)** | **[RN-BOAT-120]**, [RN-TEAT-118], [REF-CTB-sinistro-cena-renaest] art. 279-A | **cruzamento BOAT↔TEAT** — Termo de Recolhimento sem AIT de origem; prazo de 60 dias       |
| Art. 17 (guarda monitorada)                     | [RN-TEAT-127]                                                                | EXTENDE — modalidade nova, fora do escopo hoje descrito                                    |
| Art. 17 §6º c/c art. 25                         | [RN-TEAT-127], [RN-TEAT-128]                                                 | o prazo de 60 dias **alcança a guarda monitorada**                                         |
| Art. 17 §§4º-5º                                 | [RN-TEAT-127]                                                                | solução tecnológica homologada **ainda não regulamentada** — figura inaplicável na prática |
| Arts. 21, 23, 25, 26, 27                        | [RN-TEAT-128], [RN-TEAT-126]                                                 | prazo de retirada a imprimir no termo = **60 dias** (art. 25), não 30                      |
