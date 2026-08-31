---
id: REF-DECRETO-8936-2016
title: Decreto nº 8.936, de 19/12/2016 — institui a Plataforma gov.br (ex-Plataforma de Cidadania Digital)
orgao: Presidência da República (texto compilado, planalto.gov.br)
status: vigente (renomeada "Plataforma gov.br" e reestruturada pelos Decretos 9.094/2017, 9.723/2019, 10.332/2020 e 10.900/2021)
url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/decreto/D8936.htm'
pdf: REF-DECRETO-8936-2016.html (extração de texto em decreto8936_plain.txt)
apps: [portal, dashboard]
sources: [REF-DECRETO-10543-2020]
updated: 2026-08-25
---

# O que este arquivo é

Item nº 3 do briefing PORTAL. É o decreto fundacional da Plataforma gov.br — a "conta única" que o
PORTAL usará como mecanismo de identidade digital. Sua lista de componentes (art. 3º) é, décadas
antes da Lei 14.129/2021, o mesmo checklist funcional que hoje aparece com mais detalhe em
[REF-LEI-14129-2021] arts. 20-22 — os dois devem ser lidos em conjunto: este decreto instituiu o
padrão, a lei posterior o elevou e o detalhou.

## Excertos úteis

### Art. 1º — finalidade

> Art. 1º Fica instituída a Plataforma gov.br, no âmbito da administração pública federal direta,
> autárquica e fundacional, com a finalidade de: I - facultar aos cidadãos, às pessoas jurídicas e
> a outros entes públicos a solicitação e o acompanhamento dos serviços públicos sem a necessidade
> de atendimento presencial; II - implementar e difundir o uso dos serviços públicos digitais [...]
> inclusive por meio de dispositivos móveis; III - disponibilizar, em plataforma única e
> centralizada, **mediante o nível de autenticação requerido**, o acesso às informações e a
> prestação direta dos serviços públicos; IV - simplificar as solicitações [...] com foco na
> experiência do usuário; V - dar transparência à execução e permitir o acompanhamento e o
> monitoramento dos serviços públicos; e VI - promover a atuação integrada e sistêmica entre os
> órgãos [...] (Redação dada pelo Decreto nº 10.900, de 2021)

O inciso III é a única menção, neste decreto, a "nível de autenticação requerido" — sem detalhar
bronze/prata/ouro (ver anotação em [REF-DECRETO-10543-2020]).

### Art. 3º — componentes da Plataforma gov.br

> Art. 3º Compõem a Plataforma gov.br: I - o portal único gov.br [...] (Redação dada pelo Decreto
> nº 10.332, de 2020); II - o mecanismo de acesso digital único do usuário aos serviços públicos,
> com nível de segurança compatível com o grau de exigência, natureza e criticidade dos dados e
> das informações pertinentes ao serviço público solicitado; III - a ferramenta de solicitação e
> acompanhamento dos serviços públicos, com as seguintes características: a) identificação do
> serviço público e de suas principais etapas; b) solicitação eletrônica dos serviços; c)
> agendamento eletrônico, quando couber; d) acompanhamento das solicitações por etapas; e e)
> peticionamento eletrônico de qualquer natureza; IV - a ferramenta de avaliação da satisfação dos
> usuários [...]; V - **o painel de monitoramento do desempenho dos serviços públicos prestados**,
> com, no mínimo, as seguintes informações para cada serviço, órgão ou entidade [...]: a) volume de
> solicitações; b) tempo médio de atendimento; e c) nível de satisfação dos usuários; e d) número
> de Solicitações de Simplificação relativas ao serviço; VI - **o barramento de interoperabilidade
> de dados** entre órgãos e entidades [...] nos termos do Decreto nº 10.046, de 9 de outubro de
> 2019 (Incluído pelo Decreto nº 10.332, de 2020); VII - a ferramenta de notificações e mensageria
> [...]; VIII - a ferramenta de meios de pagamentos digitais para serviços públicos [...] (Redação
> dada pelo Decreto nº 10.900, de 2021); e IX - o mecanismo para assinaturas eletrônicas em
> interações com entes públicos, nos termos do art. 5º do Decreto nº 10.543, de 2020 (Incluído
> pelo Decreto nº 10.900, de 2021).
> Parágrafo único. Os órgãos e as entidades da administração pública federal encaminharão à
> Secretaria de Governo Digital [...] os dados da prestação dos serviços públicos sob sua
> responsabilidade para composição dos indicadores do painel de monitoramento do portal único
> gov.br. (Redação dada pelo Decreto nº 10.332, de 2020)

**Achado direto.** Este é o texto mais antigo (2016, com acréscimos até 2021) do mesmo painel de
monitoramento que a Lei 14.129/2021 art. 22 detalha — pré-existe à lei e é federal, mas a estrutura
de indicadores (volume, tempo médio, satisfação) é idêntica, confirmando que o padrão de indicador
do DASHBOARD (quando modelar métricas por serviço) deve seguir esse trio consolidado desde 2016.

Aplica-se a: PORTAL (arquitetura de identidade única + componentes funcionais); DASHBOARD (painel
de indicadores por serviço — mesmo trio volume/tempo/satisfação do art. 22 da Lei 14.129/2021).

### Art. 4º — obrigações dos órgãos federais para integração

> Art. 4º Os órgãos e as entidades da administração pública federal direta, autárquica e
> fundacional deverão, até 30 de junho de 2021: [...] II - cadastrar e atualizar as informações dos
> serviços públicos oferecidos no portal único gov.br; [...]

Aplica-se a: referência de prazo federal já vencido (2021) — não vincula diretamente o DETRAN-AM,
mas ilustra o padrão de prazo de integração que outros órgãos federais tiveram (analogia útil ao
gap de adesão estadual registrado em [REF-LEI-14129-2021]).

## Índice reverso — artigo → aplicação

| Artigo                 | Aplica-se a                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Art. 1º, III           | Nível de autenticação requerido — remete à distinção com [REF-DECRETO-10543-2020]                                                      |
| Art. 3º, II-IV, VII-IX | Componentes funcionais mínimos do PORTAL (identidade única, solicitação/acompanhamento, avaliação, notificação, pagamento, assinatura) |
| Art. 3º, V             | Painel de monitoramento — precedente direto do art. 22 da Lei 14.129/2021, base do DASHBOARD                                           |
| Art. 3º, VI            | Barramento de interoperabilidade — base técnica do "uso único"                                                                         |
