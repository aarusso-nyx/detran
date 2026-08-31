---
id: RN-PORTAL-108
title: Carta de Serviços ao Usuário — conteúdo mínimo obrigatório por serviço, medível item a item
status: draft
apps: [portal, dashboard]
sources:
  [
    REF-LEI-13460-2017,
    REF-LEI-14129-2021,
    REF-DECRETO-10543-2020,
    REF-DETRANAM-SERVICOS,
  ]
updated: 2026-08-24
---

**Regra.** A Carta de Serviços é **obrigação legal com conteúdo mínimo taxativo**, não uma página
institucional. No PORTAL ela é uma **estrutura de dados viva**, alimentada pelo catálogo de serviços
([WF-PORTAL-001]), e não um documento estático republicado periodicamente. Cada serviço do catálogo
carrega, obrigatoriamente, onze campos — seis do art. 7º, § 2º e cinco do § 3º da Lei 13.460/2017:

| #   | Campo                                                                 | Base              | Estado no DETRAN-AM hoje |
| --- | --------------------------------------------------------------------- | ----------------- | ------------------------ |
| 1   | Descrição do serviço oferecido                                        | art. 7º, §2º, I   | Presente                 |
| 2   | Requisitos, documentos, formas e informações necessárias para acessar | art. 7º, §2º, II  | Presente                 |
| 3   | Principais etapas de processamento                                    | art. 7º, §2º, III | Parcial                  |
| 4   | **Previsão do prazo máximo para a prestação do serviço**              | art. 7º, §2º, IV  | **AUSENTE**              |
| 5   | Forma de prestação do serviço (canais)                                | art. 7º, §2º, V   | Presente                 |
| 6   | Locais e formas de apresentar manifestação                            | art. 7º, §2º, VI  | Presente                 |
| 7   | Prioridades de atendimento                                            | art. 7º, §3º, I   | **AUSENTE**              |
| 8   | Previsão de tempo de espera para atendimento                          | art. 7º, §3º, II  | **AUSENTE**              |
| 9   | Mecanismos de comunicação com os usuários                             | art. 7º, §3º, III | Presente                 |
| 10  | Procedimentos para receber e responder manifestações                  | art. 7º, §3º, IV  | Parcial                  |
| 11  | **Mecanismos de consulta do andamento** do serviço e da manifestação  | art. 7º, §3º, V   | **AUSENTE por serviço**  |

Acrescenta-se um décimo segundo campo, por boa prática defensável e não por norma vinculante ao
DETRAN-AM: **nível de assinatura eletrônica exigido** por serviço ([RN-PORTAL-101]) — que o
[REF-DECRETO-10543-2020] art. 13, II impõe à administração federal e que é o remédio direto para o
risco de exigência sem base local registrado naquela regra.

Duas obrigações de manutenção, ambas com verbo próprio na lei: a Carta é objeto de **atualização
periódica** e de **permanente divulgação** em sítio eletrônico (art. 7º, § 4º).

**Base legal.**

- [REF-LEI-13460-2017] art. 7º, § 2º: _"A Carta de Serviços ao Usuário deverá trazer informações
  claras e precisas em relação a **cada um dos serviços prestados**, apresentando, no mínimo,
  informações relacionadas a: I - serviços oferecidos; II - requisitos, documentos, formas e
  informações necessárias para acessar o serviço; III - principais etapas para processamento do
  serviço; **IV - previsão do prazo máximo para a prestação do serviço**; V - forma de prestação do
  serviço; e VI - locais e formas para o usuário apresentar eventual manifestação sobre a prestação
  do serviço."_
- [REF-LEI-13460-2017] art. 7º, § 3º: _"Além das informações descritas no § 2º, a Carta de Serviços
  ao Usuário deverá detalhar os compromissos e padrões de qualidade do atendimento relativos, no
  mínimo, aos seguintes aspectos: I - prioridades de atendimento; II - previsão de tempo de espera
  para atendimento; III - mecanismos de comunicação com os usuários; IV - procedimentos para receber
  e responder as manifestações dos usuários; e V - mecanismos de consulta, por parte dos usuários,
  acerca do andamento do serviço solicitado e de eventual manifestação."_
- [REF-LEI-13460-2017] art. 7º, § 4º: _"A Carta de Serviços ao Usuário será objeto de atualização
  periódica e de permanente divulgação mediante publicação em sítio eletrônico do órgão ou entidade
  na internet."_
- [REF-LEI-14129-2021] art. 18, II: as Cartas de Serviços são **componente essencial** da prestação
  digital; art. 3º, XVIII: princípio do _"cumprimento de compromissos e de padrões de qualidade
  divulgados na Carta de Serviços ao Usuário"_; art. 27, II: direito ao _"atendimento nos termos da
  respectiva Carta de Serviços ao Usuário"_.
- [REF-DECRETO-10543-2020] art. 13, II: dever (federal) de _"divulgar na Carta de Serviços ao Usuário
  os níveis de assinatura eletrônica exigidos nos seus serviços"_.

**Verificação (escrita para ser monitorável pelo DASHBOARD).** Três métricas com denominador
explícito, calculáveis sobre o catálogo:

1. **Completude da Carta** = nº de serviços com os 11 campos preenchidos ÷ nº total de serviços
   publicados. Meta legal: 100%. Valor de referência de partida: **inferior a 100%**, com o campo 4
   ausente em toda a base ([REF-LEI-13460-2017], anotação de auditoria de 2026-08-25).
2. **Aderência ao prazo publicado** = nº de solicitações concluídas dentro do `prazo_maximo`
   declarado ÷ nº de solicitações concluídas, por serviço. Só é calculável depois que o campo 4
   existir — o que faz do campo 4 pré-requisito de todo o painel de desempenho, e não apenas um item
   de conformidade formal.
3. **Frescor** = data da última atualização de cada linha do catálogo; alerta quando exceder a
   periodicidade que o órgão fixar (a lei diz "periódica" sem número — a periodicidade é decisão do
   órgão a registrar, não uma lacuna a ignorar).

Trava de produto: **um serviço só entra no catálogo do PORTAL com os 11 campos preenchidos.** O campo
4 não admite "não se aplica"; admite, no máximo, um prazo declaradamente estimado, com essa
qualificação visível ao cidadão.

**Achado de conformidade e ação recomendada.** A auditoria de `detran.am.gov.br/servicos/`
(2026-08-25, registrada em [REF-LEI-13460-2017]) confirma catálogo extenso (100+ serviços), pesquisa
de satisfação e ouvidoria presentes, mas **sem prazo máximo por serviço** e sem o detalhamento do
§ 3º por serviço. É **omissão de conteúdo obrigatório** — diferente das duas exigências _contra
legem_ já corrigidas por decisão de steering D.28, que eram exigências indevidas. Recomenda-se ao
Owner uma ação análoga, de baixo risco e alto impacto: publicar prazo máximo por serviço. Ver
`_intake/legal-assessment.md`.

**Controvérsia/risco.** (a) A lei não fixa a **periodicidade** da atualização nem o **método** de
apuração do prazo máximo — se prazo legal, se prazo-meta operacional, se percentil histórico. Adotar
prazo legal onde existir e prazo-meta declarado onde não existir é a leitura defensável, mas é
escolha do órgão. (b) Há risco de o prazo publicado ser lido como promessa exigível: o art. 3º, XVIII
da Lei 14.129/2021 transforma o cumprimento do compromisso publicado em **princípio**, o que torna o
prazo declarado oponível ao órgão. Publicar prazo irreal é, portanto, pior do que publicar prazo
folgado — observação que vale especialmente para os "30 dias úteis" que a carta de serviço "Recurso à
JARI" já anuncia hoje ([REF-DETRANAM-SERVICOS]) contra um teto legal de 24 meses ([RN-RAIT-110]).
