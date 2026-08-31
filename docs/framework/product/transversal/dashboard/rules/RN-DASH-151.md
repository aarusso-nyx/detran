---
id: RN-DASH-151
title: Requisitos de um conjunto de dados aberto — formato, metadados, periodicidade, histórico, e a vedação de usar inconsistência como desculpa
status: draft
apps: [dashboard, portal]
sources:
  [
    REF-LEI-12527-2011,
    REF-LEI-14129-2021,
    REF-DECRETO-8777-2016,
    REF-SENATRAN-PORTARIA-139-2025,
  ]
updated: 2026-08-24
---

**Regra.** Quando o DETRAN-AM publicar um conjunto de dados — seja por dever (LAI) ou por decisão
(P2, [RN-DASH-142]) —, esse conjunto deve atender a **sete requisitos cumulativos**. A base vinculante
de cada um é a LAI, art. 8º, § 3º; o detalhamento técnico vem da Lei 14.129/2021 e do Decreto
8.777/2016, com o alcance ressalvado em [RN-DASH-150].

| #   | Requisito                                                          | Âncora vinculante (LAI) | Detalhamento                        |
| --- | ------------------------------------------------------------------ | ----------------------- | ----------------------------------- |
| 1   | **Formato aberto e não proprietário**                              | art. 8º, § 3º, II       | Lei 14.129 art. 29, § 1º, II        |
| 2   | **Legível por máquina, acesso automatizado por sistemas externos** | art. 8º, § 3º, III      | Lei 14.129 art. 29, § 1º, II        |
| 3   | **Descrição da estrutura e da semântica** (dicionário de dados)    | art. 8º, § 3º, IV       | Lei 14.129 art. 29, § 1º, III       |
| 4   | **Atualização periódica, com histórico mantido**                   | art. 8º, § 3º, VI       | Lei 14.129 art. 29, § 1º, VI        |
| 5   | **Autenticidade e integridade** garantidas                         | art. 8º, § 3º, V        | —                                   |
| 6   | **Pesquisabilidade** do conteúdo                                   | art. 8º, § 3º, I        | —                                   |
| 7   | **Acessibilidade** para pessoas com deficiência                    | art. 8º, § 3º, VIII     | [REF-LEI-13146-2015-acessibilidade] |

Três regras de regime completam o quadro:

- **Livre utilização.** Dado publicado em transparência ativa é de **livre utilização pela sociedade**
  — o órgão não pode impor licença restritiva, exigir cadastro para consumo ou vedar cruzamento.
- **Abertura presumida.** Consideram-se **automaticamente passíveis de abertura** as bases que **não
  contenham informações protegidas por lei**. O ônus é de justificar o fechamento, não a abertura.
- **Inconsistência não obsta.** _"A existência de inconsistências na base de dados não poderá obstar o
  atendimento da solicitação de abertura."_ Dado imperfeito publica-se **com a ressalva de qualidade**,
  não se esconde até ficar perfeito — e "vamos abrir quando os dados estiverem limpos" é, na prática,
  a forma mais comum de nunca abrir.

**Base legal.**

- [REF-LEI-12527-2011] art. 8º, § 3º _(verbatim dos incisos relevantes)_: _"II - possibilitar a
  **gravação de relatórios em diversos formatos eletrônicos, inclusive abertos e não proprietários**
  [...]; III - possibilitar o **acesso automatizado por sistemas externos em formatos abertos,
  estruturados e legíveis por máquina**; IV - **divulgar em detalhes os formatos utilizados** para
  estruturação da informação; V - garantir a **autenticidade e a integridade** das informações
  disponíveis para acesso; VI - **manter atualizadas** as informações disponíveis para acesso"_.
- [REF-LEI-14129-2021] art. 29 _(verbatim parcial)_: _"Os dados disponibilizados pelos prestadores de
  serviços públicos, bem como qualquer informação de transparência ativa, são de **livre utilização
  pela sociedade** [...] § 1º [...] I - observância da **publicidade das bases de dados não pessoais
  como preceito geral e do sigilo como exceção**; II - garantia de acesso irrestrito aos dados, os
  quais devem ser **legíveis por máquina** e estar disponíveis em **formato aberto** [...]; III -
  **descrição das bases de dados com informação suficiente sobre estrutura e semântica** [...]; VI -
  **atualização periódica, mantido o histórico** [...]; IX - intercâmbio de dados entre órgãos [...],
  **respeitado o disposto no art. 26 da Lei nº 13.709, de 2018 (LGPD)**"_.
- [REF-LEI-14129-2021] art. 30, § 6º: _"Consideram-se **automaticamente passíveis de abertura** as
  bases de dados que **não contenham informações protegidas por lei**."_; art. 32: _"A existência de
  **inconsistências** na base de dados **não poderá obstar** o atendimento da solicitação de
  abertura."_
- [REF-DECRETO-8777-2016] art. 4º (livre utilização), art. 6º (prazos e procedimentos **herdados da
  LAI** — 20+10 dias, ver [RN-DASH-118]) e art. 8º (abertura automática presumida).
- [REF-SENATRAN-PORTARIA-139-2025] art. 20: os dados abertos da SENATRAN seguem o **Plano de Dados
  Abertos** do Ministério dos Transportes, _"processáveis por máquina, referenciados na internet e
  disponibilizados sob licença aberta, que permita sua livre utilização, consumo ou cruzamento,
  **independentemente de solicitações** por parte do interessado"_ — modelo de referência.

**Verificação.**

1. **Nenhuma base contendo dado pessoal entra em dados abertos sem passar por [RN-DASH-160..162].** A
   "publicidade das bases **não pessoais** como preceito geral" do art. 29, § 1º, I é literal: o regime
   de abertura presumida vale para base **não pessoal**. Agregação não converte automaticamente uma
   base pessoal em não pessoal.
2. **Dicionário de dados é entregável obrigatório**, não documentação opcional (requisito 3). Sem ele o
   conjunto é ilegível na prática, e o inciso IV do § 3º não está cumprido.
3. **Histórico não se sobrescreve** (requisito 4). Republicar corrigindo o passado sem manter as
   versões anteriores viola _"mantido o histórico"_ e destrói a comparabilidade das séries.
4. **Ressalva de qualidade publicada junto ao dado** — cobertura, fontes ausentes, período de
   apuração, limitações conhecidas. É o que torna operacional o art. 32 sem induzir o público a erro.
   No caso das estatísticas de sinistro, a ressalva sobre completude multi-fonte ([RN-DASH-133]) é
   essencial: um dado de 2024 com uma fonte inteira ausente não é "quase completo", é enviesado.
5. **Plano de publicação com periodicidade declarada por conjunto**, monitorado pelo próprio DASHBOARD
   ([RN-DASH-140], item 3). Periodicidade declarada e não cumprida é pior que periodicidade não
   declarada.
6. **Licença aberta explícita** em cada conjunto — a ausência de licença declarada gera, na prática, a
   dúvida jurídica que o art. 29 quis eliminar.

**Controvérsia/risco.** _Severidade: média._ O requisito 2 (acesso automatizado por sistemas externos)
implica **API pública**, com todas as consequências de superfície de ataque, custo e versionamento. É
requisito legal na LAI, não escolha de arquitetura — mas sua má implementação é justamente o vetor
pelo qual granularidade excessiva escapa (parâmetros de filtro que permitem descer ao indivíduo). A
API deve servir **conjuntos derivados pré-agregados e revisados**, nunca consulta parametrizada
livre sobre o acervo ([RN-DASH-142], item 5; [RN-DASH-161]).
