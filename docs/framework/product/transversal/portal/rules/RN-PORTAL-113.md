---
id: RN-PORTAL-113
title: Acessibilidade digital é obrigação legal de resultado — LBI art. 63 e Decreto 5.296/2004; WCAG 2.1 AA/eMAG são prova de cumprimento, não a norma
status: draft
apps: [portal, dashboard]
sources:
  [
    REF-LEI-13146-2015-acessibilidade,
    REF-LEI-14129-2021,
    REF-LEI-12527-2011,
    REF-LEI-13460-2017,
  ]
updated: 2026-08-24
---

**Regra.** A acessibilidade do PORTAL é **obrigação legal vinculante**, e não requisito de qualidade
negociável em backlog. A obrigação tem três características que definem como cumpri-la e como
verificá-la:

1. **É obrigação de resultado, remetida a padrão externo.** A lei manda garantir _"acesso às
   informações disponíveis, conforme as melhores práticas e diretrizes de acessibilidade adotadas
   internacionalmente"_ — não nomeia norma técnica. Cabe ao órgão escolher o padrão e provar o
   resultado.
2. **Alcança órgãos de governo sem qualquer condição de adesão.** A LBI é lei federal de direitos
   fundamentais aplicável a _"órgãos de governo"_ em geral; o Decreto 5.296/2004 fala em
   _"administração pública"_. Diferentemente do bloco de Governo Digital ([RN-PORTAL-106]), **não há
   aqui cláusula de adesão estadual a confirmar** — esta é uma das obrigações mais seguras de todo o
   corpus PORTAL.
3. **Vem com um requisito visual expresso**: símbolo de acessibilidade em destaque na página de
   entrada, exigido **duas vezes** (LBI art. 63, § 1º e Decreto 5.296/2004 art. 47, § 2º). É o único
   elemento de interface que a norma especifica literalmente, e a sua ausência é descumprimento
   trivialmente constatável por qualquer fiscalização.

**Padrão técnico adotado (decisão de arquitetura, não norma).** WCAG 2.1 nível AA, complementado pelo
eMAG 3.1. Fundamento da escolha: são os critérios objetivos mais defensáveis para **provar**
cumprimento do art. 63 perante fiscalização ou Ministério Público, e são o padrão que o próprio
governo federal adota. Registro honesto do seu status: o eMAG foi institucionalizado pela Portaria nº
3, de 07/05/2007, como obrigatório **no âmbito do SISP federal** — o DETRAN-AM, autarquia estadual,
está fora do SISP; e o gov.br Design System é diretriz de identidade visual federal sem força
normativa própria. Nem um nem outro vincula o DETRAN-AM por si só. O que vincula é o **art. 63**; o
WCAG/eMAG é a régua com que se demonstra tê-lo cumprido.

**Base legal.**

- [REF-LEI-13146-2015-acessibilidade] LBI art. 63: _"É obrigatória a acessibilidade nos sítios da
  internet mantidos por empresas com sede ou representação comercial no País ou **por órgãos de
  governo**, para uso da pessoa com deficiência, garantindo-lhe acesso às informações disponíveis,
  conforme as melhores práticas e diretrizes de acessibilidade adotadas internacionalmente."_ § 1º:
  _"Os sítios devem conter símbolo de acessibilidade em destaque."_
- [REF-LEI-13146-2015-acessibilidade] Decreto nº 5.296/2004 art. 47: _"[...] será obrigatória a
  acessibilidade nos portais e sítios eletrônicos da administração pública na rede mundial de
  computadores (internet), para o uso das pessoas portadoras de deficiência visual, garantindo-lhes o
  pleno acesso às informações disponíveis."_ § 2º: _"Os sítios eletrônicos acessíveis [...] conterão
  símbolo que represente a acessibilidade [...] a ser adotado nas respectivas páginas de entrada."_
  (Prazo do _caput_ exaurido desde 2005-2006: a obrigação hoje é permanente e imediatamente
  exigível.)
- [REF-LEI-14129-2021] art. 3º, XIX: princípio do Governo Digital é _"a acessibilidade da pessoa com
  deficiência ou com mobilidade reduzida, nos termos da Lei nº 13.146, de 6 de julho de 2015"_ —
  reforço, com remissão à própria LBI, o que torna o reforço imune à questão de adesão: o comando
  substantivo continua sendo o da LBI.
- [REF-LEI-12527-2011] art. 8º, § 3º, VIII: os sítios oficiais devem _"adotar as medidas necessárias
  para garantir a acessibilidade de conteúdo para pessoas com deficiência"_ — terceira norma, de
  terceiro fundamento (transparência), impondo o mesmo dever.
- [REF-LEI-13460-2017] art. 5º, I: direito do usuário a _"urbanidade, respeito, **acessibilidade** e
  cortesia no atendimento"_.

**Verificação (monitorável pelo DASHBOARD).**

| Indicador                            | Evidência                                                      | Meta                                            |
| ------------------------------------ | -------------------------------------------------------------- | ----------------------------------------------- |
| Símbolo de acessibilidade na entrada | inspeção da página inicial                                     | presente (obrigação literal)                    |
| Conformidade WCAG 2.1 AA             | auditoria automatizada + auditoria manual assistiva, por fluxo | 0 violações de nível A e AA nos fluxos críticos |
| Cobertura de auditoria               | fluxos auditados ÷ fluxos do catálogo                          | 100% dos serviços publicados                    |
| Frescor da auditoria                 | data da última auditoria por fluxo                             | periodicidade a fixar pelo órgão                |
| Guia/boleto em formato acessível     | ver [RN-PORTAL-114]                                            | disponível sob solicitação                      |

Fluxos críticos, em que a violação é mais grave por bloquear exercício de direito com prazo: wizard de
defesa/recurso, resposta a diligência, tela de decisão, e o contador de prazo. Requisitos concretos já
levantados pelo UX e aqui **elevados de recomendação a critério de conformidade**: navegação completa
por teclado em formulários longos; mensagem de erro associada ao campo, não só sumarizada no topo;
nunca usar cor como único sinal de "pendente/urgente" (ícone + texto); contraste AA em banners de
prazo; equivalente textual completo em toda notificação.

**Controvérsia/risco.** (a) A obrigação é de **resultado** e a lei não define o padrão: um órgão pode,
em tese, sustentar cumprimento por outro caminho técnico. Isso é liberdade, mas também exposição —
sem um critério objetivo declarado, o cumprimento vira matéria de opinião numa eventual ação civil
pública. Declarar formalmente o padrão adotado (WCAG 2.1 AA + eMAG) **reduz** o risco, e é ato de
custo próximo de zero. (b) A LBI não fixa prazo, sanção específica nem autoridade fiscalizadora
própria para o art. 63; a exigibilidade prática vem por via de Ministério Público, ação civil pública
e órgãos de controle. Isso significa risco **de baixa frequência e alto impacto** — o oposto do perfil
de risco dos prazos processuais —, e é a razão de esta regra existir como conformidade medida, e não
como boa intenção de design. Ver `_intake/legal-assessment.md`.
