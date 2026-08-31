---
id: RN-DASH-140
title: Transparência ativa — rol mínimo do art. 8º § 1º e o checklist técnico do § 3º, que é especificação de portal com força normativa
status: draft
apps: [dashboard, portal]
sources:
  [REF-LEI-12527-2011, REF-LEI-14129-2021, REF-LEI-13146-2015-acessibilidade]
updated: 2026-08-24
---

**Regra.** A transparência ativa é a divulgação de informações de interesse coletivo ou geral
**independentemente de requerimento**. Ela tem dois níveis de exigência, ambos vinculantes e ambos
frequentemente confundidos com "publicar alguma coisa no site":

- **Nível de conteúdo (art. 8º, § 1º)** — rol mínimo de seis blocos que **devem** constar: estrutura e
  competências com endereços/telefones/horários; **repasses ou transferências de recursos**; despesas;
  procedimentos licitatórios e contratos; dados de acompanhamento de programas, ações, projetos e
  obras; e perguntas frequentes.
- **Nível técnico (art. 8º, § 3º)** — oito requisitos que o **sítio** deve atender: ferramenta de
  pesquisa; **exportação em formatos abertos e não proprietários**; **acesso automatizado por sistemas
  externos em formato aberto, estruturado e legível por máquina**; divulgação detalhada dos formatos
  usados; garantia de **autenticidade e integridade**; **manutenção da atualização**; canal de
  comunicação com o órgão; e **acessibilidade para pessoas com deficiência**.

O § 3º é, na prática, uma **especificação técnica de portal com força de norma** — e é o achado que
governa o módulo público do DASHBOARD: não basta publicar um painel bonito; ele precisa ser
pesquisável, exportável, consumível por máquina, documentado, íntegro, atualizado e acessível.

**Base legal.** [REF-LEI-12527-2011] art. 8º _(verbatim)_:

> Art. 8º É **dever** dos órgãos e entidades públicas promover, **independentemente de requerimentos**,
> a divulgação em local de fácil acesso, no âmbito de suas competências, de informações de interesse
> coletivo ou geral por eles produzidas ou custodiadas.
> § 1º Na divulgação das informações a que se refere o caput, deverão constar, no mínimo: I - registro
> das competências e estrutura organizacional, endereços e telefones das respectivas unidades e
> horários de atendimento ao público; II - **registros de quaisquer repasses ou transferências de
> recursos financeiros**; III - registros das despesas; IV - informações concernentes a procedimentos
> licitatórios [...]; V - dados gerais para o acompanhamento de programas, ações, projetos e obras
> [...]; e VI - respostas a perguntas mais frequentes da sociedade.
> § 2º [...] **sendo obrigatória a divulgação em sítios oficiais** da rede mundial de computadores
> (internet).
> § 3º Os sítios de que trata o § 2º deverão, na forma de regulamento, atender, entre outros, aos
> seguintes requisitos: I - conter **ferramenta de pesquisa de conteúdo** [...]; II - possibilitar a
> **gravação de relatórios em diversos formatos eletrônicos, inclusive abertos e não proprietários**
> [...]; III - possibilitar o **acesso automatizado por sistemas externos em formatos abertos,
> estruturados e legíveis por máquina**; IV - **divulgar em detalhes os formatos** utilizados para
> estruturação da informação; V - garantir a **autenticidade e a integridade** das informações
> disponíveis para acesso; VI - **manter atualizadas** as informações disponíveis para acesso; VII -
> indicar local e instruções que permitam ao interessado **comunicar-se** [...]; e VIII - adotar as
> medidas necessárias para garantir a **acessibilidade** de conteúdo para pessoas com deficiência [...]

Princípio orientador — [REF-LEI-12527-2011] art. 3º, I-II: _"observância da **publicidade como
preceito geral e do sigilo como exceção**"_; _"divulgação de informações de interesse público,
**independentemente de solicitações**"_.

Convergência — [REF-LEI-14129-2021] art. 20, II e art. 22: o **painel de monitoramento do desempenho
dos serviços públicos** é componente obrigatório da Plataforma de Governo Digital, com conteúdo mínimo
por serviço (volume anual, tempo médio, satisfação) e **padronização que permita comparação entre
entes** — com a ressalva de adesão estadual de [RN-DASH-150].

**Verificação.**

1. **O que do DASHBOARD é candidato natural a transparência ativa**: indicadores agregados de
   desempenho por serviço ([RN-DASH-117]), séries estatísticas agregadas de sinistros
   ([RN-DASH-160..162]), resultado da avaliação de satisfação e ranking de reclamações, relatório
   anual de ouvidoria ([RN-DASH-115]) e o próprio rol do art. 8º, § 1º na parte que o DETRAN-AM
   produz. A classificação item a item está em [RN-DASH-142].
2. **Checklist do § 3º como requisito de aceitação** de qualquer publicação — os oito incisos viram
   oito critérios verificáveis, e uma publicação que falhe em qualquer um deles não está conforme,
   ainda que o conteúdo esteja lá. Em especial o inciso III (**API legível por máquina**) e o VI
   (**atualização mantida**), que são os dois mais frequentemente omitidos.
3. **Autoinstrumentação (inciso VI).** O DASHBOARD deve monitorar a **atualidade da sua própria
   publicação pública**: data da última atualização por conjunto publicado, e alerta quando a
   periodicidade declarada for excedida. Transparência ativa desatualizada é descumprimento contínuo
   e invisível — e é o único descumprimento de LAI que o órgão pode detectar sozinho.
4. **Acessibilidade (inciso VIII)** não é opcional nem posterior: conecta-se ao dever já capturado em
   [REF-LEI-13146-2015-acessibilidade]. Painel gráfico sem alternativa textual, sem contraste adequado
   e sem navegação por teclado descumpre o inciso VIII **e** o Estatuto.
5. **Taxa de atendimento imediato de pedidos LAI** ([RN-DASH-118]) é o indicador indireto da qualidade
   da transparência ativa: rol publicado completo → pedido respondível na hora → fila menor.

**Controvérsia/risco.** _Severidade: média._ O § 3º diz _"na forma de regulamento"_. O regulamento
federal da LAI (Decreto 7.724/2012) **não vincula automaticamente** a autarquia estadual, e o
regulamento estadual do Amazonas **não foi localizado** nesta rodada. Isso não afasta o dever — o art.
8º é autoaplicável no seu núcleo —, mas deixa o **detalhamento** dos oito requisitos sem norma
regulamentadora local identificada. Ver `_intake/legal-assessment.md`, proposta de REF.
