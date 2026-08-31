---
id: RN-PORTAL-110
title: Avaliação de satisfação — obrigação anual com cinco dimensões, publicação integral e ranking de reclamações
status: draft
apps: [portal, dashboard]
sources: [REF-LEI-13460-2017, REF-LEI-14129-2021, REF-DECRETO-8936-2016]
updated: 2026-08-24
---

**Regra.** Avaliar os serviços é **dever legal periódico**, não instrumento opcional de produto. O
PORTAL é o canal natural de coleta e deve suportar cinco exigências:

1. **Cinco dimensões obrigatórias**, não apenas "satisfação": (i) satisfação do usuário com o serviço
   prestado; (ii) qualidade do atendimento; (iii) **cumprimento dos compromissos e prazos definidos**;
   (iv) quantidade de manifestações de usuários; (v) medidas adotadas para melhoria. As dimensões
   (iii) e (iv) **não** vêm de pesquisa — vêm dos próprios dados operacionais do PORTAL
   ([RN-PORTAL-108] métrica 2 e [RN-PORTAL-109]), e é isso que torna o dever verificável sem
   depender da adesão do cidadão a um questionário.
2. **Periodicidade mínima anual**, por pesquisa de satisfação _"ou por qualquer outro meio que
   garanta significância estatística aos resultados"_ — a avaliação contínua embutida no fluxo
   (avaliar ao concluir cada solicitação) **satisfaz** a exigência apenas se produzir significância
   estatística por serviço; do contrário é complemento, não substituto, da pesquisa anual.
3. **Publicação integral** do resultado no sítio do órgão — não um resumo, não um sumário executivo.
4. **Ranking** das entidades com maior incidência de reclamação, publicado junto.
5. **Avaliação por serviço**, não por órgão em bloco: o art. 22 da Lei 14.129/2021 e o art. 3º, V do
   Decreto 8.936/2016 pedem o trio volume / tempo médio / satisfação **para cada serviço** — mesma
   granularidade do catálogo de [RN-PORTAL-108].

**Base legal.**

- [REF-LEI-13460-2017] art. 23: _"Os órgãos e entidades públicos abrangidos por esta Lei deverão
  avaliar os serviços prestados, nos seguintes aspectos: I - satisfação do usuário com o serviço
  prestado; II - qualidade do atendimento prestado ao usuário; III - cumprimento dos compromissos e
  prazos definidos para a prestação dos serviços; IV - quantidade de manifestações de usuários; e V -
  medidas adotadas pela administração pública para melhoria e aperfeiçoamento da prestação do
  serviço."_
  § 1º: _"A avaliação será realizada por pesquisa de satisfação feita, no mínimo, a cada um ano, ou
  por qualquer outro meio que garanta significância estatística aos resultados."_
  § 2º: _"O resultado da avaliação deverá ser integralmente publicado no sítio do órgão ou entidade,
  incluindo o ranking das entidades com maior incidência de reclamação dos usuários [...]"_
- [REF-LEI-14129-2021] art. 21, V: a ferramenta digital de atendimento deve apresentar _"avaliação
  continuada da satisfação dos usuários"_; art. 22: o painel de monitoramento _"deverá conter, no
  mínimo [...] para cada serviço público ofertado: I - quantidade de solicitações em andamento e
  concluídas anualmente; II - tempo médio de atendimento; e III - grau de satisfação dos usuários"_.
- [REF-DECRETO-8936-2016] art. 3º, IV e V: a Plataforma gov.br compõe-se, desde 2016, da ferramenta
  de avaliação da satisfação e do painel de monitoramento com _"a) volume de solicitações; b) tempo
  médio de atendimento; e c) nível de satisfação dos usuários"_ — o mesmo trio, cinco anos antes da
  lei, o que confirma que a estrutura de indicador é padrão consolidado e não escolha de produto.

**Verificação (monitorável pelo DASHBOARD).**

| Indicador                 | Fórmula / evidência                                                                      | Meta                        |
| ------------------------- | ---------------------------------------------------------------------------------------- | --------------------------- |
| Cobertura de avaliação    | serviços com avaliação vigente (≤ 12 meses) ÷ serviços do catálogo                       | 100%                        |
| Significância por serviço | nº de respostas ÷ nº de solicitações concluídas, por serviço, com o `n` sempre publicado | limiar a definir pelo órgão |
| Publicação integral       | existência do resultado completo publicado, com data                                     | 1 por ano                   |
| Ranking publicado         | existência do ranking de reclamações junto ao resultado                                  | 1 por ano                   |
| Trio do art. 22           | volume, tempo médio e satisfação disponíveis **por serviço**                             | 100% do catálogo            |

Trava de produto: a avaliação **não pode ser condição** para concluir o serviço nem para acessar o
resultado — condicionar a entrega à resposta do questionário é exigência não prevista em lei
([REF-LEI-13460-2017] art. 5º, IV) e contamina a própria medição.

**Controvérsia/risco.** (a) O art. 23, § 2º fala em _"ranking das entidades"_ — no plural e no nível
de entidade. Um DETRAN estadual isolado não produz ranking de entidades; a leitura operacional
possível é publicar o ranking **por serviço** (ou por unidade de atendimento) dentro do órgão, o que
atende ao propósito de transparência comparativa sem forçar o texto. É interpretação, não literalidade
— e cabe registrar que o parágrafo único do art. 22 da Lei 14.129/2021 pede padronização _"de modo a
permitir a comparação entre as avaliações e os desempenhos dos serviços públicos prestados pelos
diversos entes"_, o que sugere que o ranking entre entidades é tarefa de quem agrega (a Plataforma
gov.br), não de cada órgão isolado. (b) A dimensão (iii) — cumprimento de prazos — é inexequível
enquanto o campo `prazo_maximo` da Carta de Serviços não existir ([RN-PORTAL-108], campo 4): é o
segundo dever legal que a mesma omissão bloqueia, e o argumento mais forte para tratá-la como
prioridade.
