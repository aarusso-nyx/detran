---
id: RN-PORTAL-111
title: Direitos do usuário aplicáveis a todo serviço do PORTAL — protocolo sempre, gratuidade, linguagem simples, canal preferencial e vedação de exigência sem lei
status: draft
apps: [portal, dashboard]
sources: [REF-LEI-13460-2017, REF-LEI-14129-2021]
updated: 2026-08-24
---

**Regra.** Independentemente do serviço, o cidadão que usa o PORTAL tem um conjunto de direitos que
funcionam como **critérios de aceitação de qualquer UC novo**. Nenhum serviço entra em produção sem
satisfazê-los:

| #   | Direito                                  | O que o PORTAL tem de fazer                                                                                       | Base                                       |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1   | **Protocolo sempre**                     | Toda solicitação apresentada gera número de protocolo, imediatamente e independentemente de conferência posterior | 14.129 art. 27, IV                         |
| 2   | **Gratuidade de acesso**                 | Usar o PORTAL não custa nada; taxas e multas do serviço em si são outra coisa e devem estar declaradas na Carta   | 14.129 art. 27, I                          |
| 3   | **Atendimento nos termos da Carta**      | O que a Carta promete é exigível — inclusive o prazo publicado ([RN-PORTAL-108])                                  | 14.129 arts. 3º, XVIII e 27, II            |
| 4   | **Canal preferencial de comunicação**    | O usuário escolhe e altera o canal por onde quer ser contatado; a escolha é respeitada por todos os serviços      | 14.129 art. 27, V                          |
| 5   | **Padronização de formulários e guias**  | Mesmo esqueleto de requerimento e de guia em todos os serviços, inclusive em formato digital                      | 14.129 art. 27, III                        |
| 6   | **Linguagem simples e compreensível**    | Requisito legal, não estilo — inclui a tradução de estado interno para status cidadão                             | 13.460 art. 5º, XIV                        |
| 7   | **Vedação de exigência sem base legal**  | Nenhum campo, anexo, taxa ou etapa sem norma que o autorize                                                       | 13.460 art. 5º, IV                         |
| 8   | **Acessibilidade no atendimento**        | Ver [RN-PORTAL-113]                                                                                               | 13.460 art. 5º, I                          |
| 9   | **Consulta do andamento**                | Mecanismo de acompanhamento por serviço, e não apenas para a trilha de multas                                     | 13.460 art. 7º, §3º, V; 14.129 art. 21, IV |
| 10  | **Notificação do usuário**               | O órgão comunica ativamente; o cidadão não descobre por conta própria                                             | 14.129 art. 21, VII                        |
| 11  | **Transparência do tratamento de dados** | Ver [RN-PORTAL-122]                                                                                               | 14.129 art. 21, X                          |
| 12  | **Ouvidoria**                            | Ver [RN-PORTAL-109]                                                                                               | 14.129 art. 21, XI; 13.460 arts. 10-16     |

**Base legal.**

- [REF-LEI-14129-2021] art. 27: _"São garantidos os seguintes direitos aos usuários da prestação
  digital de serviços públicos, além daqueles constantes das Leis nºs 13.460, de 2017, e 13.709, de
  2018 (LGPD): I - gratuidade no acesso às Plataformas de Governo Digital; II - atendimento nos termos
  da respectiva Carta de Serviços ao Usuário; III - padronização de procedimentos referentes à
  utilização de formulários, de guias e de outros documentos congêneres, incluídos os de formato
  digital; IV - recebimento de protocolo, físico ou digital, das solicitações apresentadas; e V -
  indicação de canal preferencial de comunicação com o prestador público [...]"_
- [REF-LEI-14129-2021] art. 21: rol mínimo da ferramenta digital de atendimento — _"I - identificação
  do serviço público e de suas principais etapas; II - solicitação digital do serviço; III -
  agendamento digital, quando couber; IV - acompanhamento das solicitações por etapas; V - avaliação
  continuada da satisfação dos usuários [...]; VI - identificação [...] e gestão do perfil pelo
  usuário; VII - notificação do usuário; VIII - possibilidade de pagamento digital de serviços
  públicos e de outras cobranças, quando necessário; IX - nível de segurança compatível com o grau de
  exigência, a natureza e a criticidade dos serviços públicos e dos dados utilizados; X -
  funcionalidade para solicitar acesso a informações acerca do tratamento de dados pessoais [...]; e
  XI - implementação de sistema de ouvidoria [...]"_
- [REF-LEI-13460-2017] art. 5º: _"O usuário de serviço público tem direito à adequada prestação dos
  serviços [...]: I - urbanidade, respeito, acessibilidade e cortesia no atendimento aos usuários;
  [...] **IV - adequação entre meios e fins, vedada a imposição de exigências, obrigações, restrições
  e sanções não previstas na legislação**; [...] XIII - aplicação de soluções tecnológicas que visem a
  simplificar processos e procedimentos de atendimento ao usuário [...]; **XIV - utilização de
  linguagem simples e compreensível** [...]"_
- [REF-LEI-13460-2017] art. 4º: _"Os serviços públicos e o atendimento do usuário serão realizados de
  forma adequada, observados os princípios da regularidade, continuidade, efetividade, segurança,
  atualidade, generalidade, transparência e cortesia."_

**Verificação (monitorável pelo DASHBOARD).** A tabela acima é um **checklist de doze itens por
serviço**, e o indicador correspondente é `conformidade_direitos = itens satisfeitos ÷ 12`, por
serviço do catálogo. Três testes automatizáveis de imediato: (a) toda solicitação concluída tem
`numero_protocolo` não nulo com timestamp anterior a qualquer validação de conteúdo (item 1); (b)
todo serviço expõe endpoint de acompanhamento (item 9); (c) o `canal_preferencial` do perfil é lido
por **todos** os serviços que notificam, e não apenas por alguns (item 4) — divergência aqui é bug
transversal, não de um serviço.

**Interação com o item 9 do art. 21 (nível de segurança compatível).** O inciso IX é a base
principiológica da matriz de [RN-PORTAL-101]: segurança **proporcional à criticidade**. Ele corta nos
dois sentidos — proíbe subproteger o ato grave e proíbe superproteger a consulta trivial. Exigir
assinatura avançada para consultar a própria pontuação viola o inciso IX tanto quanto aceitar
assinatura simples numa indicação de condutor.

**Controvérsia/risco.** Os itens 1 a 5 e 9 a 12 têm por base a Lei 14.129/2021, cuja aplicação ao
DETRAN-AM depende da adesão estadual não localizada ([RN-PORTAL-106]). Os itens 6, 7 e 8 têm base na
Lei 13.460/2017, que vincula sem condição. No cenário de não adesão, os direitos da coluna
condicionada não desaparecem — vários deles reaparecem na Lei 13.460/2017 em formulação próxima
(acompanhamento: art. 7º, § 3º, V; ouvidoria: arts. 10-16) —, mas o **rol expresso de direitos da
prestação digital** perde a sua âncora literal. É mais um argumento para tratar a confirmação da
adesão como item nº 1 do `_intake/legal-assessment.md`.
