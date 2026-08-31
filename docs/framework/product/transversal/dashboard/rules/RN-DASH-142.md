---
id: RN-DASH-142
title: Classificação do conteúdo do DASHBOARD — público por dever, publicável por decisão, e interno por natureza
status: draft
apps: [dashboard, portal]
sources:
  [
    REF-LEI-12527-2011,
    REF-LEI-13460-2017,
    REF-LEI-13709-2018,
    REF-CONTRAN-808-2020,
    REF-SENATRAN-PORTARIA-139-2025,
  ]
updated: 2026-08-24
---

**Regra.** O DASHBOARD é **interno por missão** ([APP-DASHBOARD]), mas **parte do seu conteúdo é
público por dever legal**. Confundir as duas coisas produz um dos dois erros simétricos: publicar
risco processual e dado sensível, ou esconder atrás de "painel interno" informação cuja publicação a
lei impõe. A classificação abaixo é obrigatória e deve existir **como atributo de cada indicador**, não
como julgamento caso a caso na hora de publicar.

| Camada                                   | Definição                                                                                                                       | Exemplos no DASHBOARD                                                                                                                                                                                                                                      | Regime                                                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **P1 — Público por dever**               | A lei manda publicar, independentemente de pedido                                                                               | Resultado da avaliação de satisfação e **ranking de reclamações** (Lei 13.460 art. 23, § 2º); **relatório anual da ouvidoria** (art. 15, par. único, II); rol do art. 8º, § 1º da LAI que o órgão produz; indicadores por serviço do art. 22 da Lei 14.129 | Publicação obrigatória, com o checklist técnico do art. 8º, § 3º ([RN-DASH-140])                                            |
| **P2 — Publicável por decisão do órgão** | Não há dever de publicar, mas não há vedação; a publicação é escolha institucional que **cria responsabilidade de controlador** | Estatística **agregada** de sinistros do Estado; tempos médios de julgamento; volume de autuações por período; indicadores de integração                                                                                                                   | Só após decisão documentada, com granularidade segura ([RN-DASH-161]) e apoio do Encarregado ([RN-BOAT-127], [RN-BOAT-130]) |
| **P3 — Interno por natureza**            | A publicação criaria risco jurídico, de segurança ou de dado pessoal                                                            | Fila de processos **por risco de prescrição** ([RN-DASH-131]); equipamentos com certificado vencido ([RN-DASH-134]); backlog de transmissão RENAEST; alertas ignorados por destinatário ([RN-DASH-135]); qualquer registro individual                      | Acesso segregado por papel ([RN-DASH-170]) + registro de acesso ([RN-DASH-171])                                             |

**Base legal e fundamentos de cada camada.**

- **P1** — [REF-LEI-12527-2011] art. 8º, _caput_ e § 1º (rol mínimo, _"independentemente de
  requerimentos"_); [REF-LEI-13460-2017] art. 15, parágrafo único, II (_"disponibilizado
  integralmente na internet"_) e art. 23, § 2º (_"O resultado da avaliação deverá ser integralmente
  publicado no sítio do órgão"_).
- **P2** — o dever de publicar estatística de sinistros é **federal e mensal**, do órgão máximo
  executivo da União ([REF-CONTRAN-808-2020] art. 8º, V), **não do DETRAN-AM** ([RN-BOAT-130]). Se o
  Estado publicar, publica por decisão própria e **sob sua própria responsabilidade de controlador**.
  Isso não é tecnicalidade: muda quem responde por eventual reidentificação.
- **P3** — [REF-LEI-13709-2018] art. 6º, III (necessidade) e VII (segurança); e o **princípio
  anti-reidentificação** de [REF-SENATRAN-PORTARIA-139-2025] art. 17, § 2º: _"A classificação do grupo
  de informação como público ou restrito [...] dependerá da **conjugação entre os parâmetros de
  entrada e de saída**"_ — um dado inofensivo isolado torna-se restrito quando combinado com outro.

**Verificação.**

1. **Todo indicador nasce P3.** A promoção a P2 ou P1 é ato explícito, com responsável, data e
   fundamento registrados. O padrão inverso (nasce público, restringe-se depois) já vazou antes de
   alguém revisar.
2. **P1 tem prazo; P2 e P3 não.** Indicadores P1 herdam a periodicidade da norma que os impõe e
   entram nos relógios de [RN-DASH-115] e [RN-DASH-117]. Um P1 desatualizado é descumprimento, não
   backlog.
3. **A camada define a granularidade, não só a visibilidade.** O mesmo fato pode existir nas três
   camadas com granularidades diferentes: _"percentual de recursos julgados dentro de 24 meses"_ é P1
   (art. 23, III, cumprimento de prazos); _"quantidade de processos em risco de prescrição por pool"_
   é P2 no máximo; _"processo nº X prescreve em 12 dias"_ é P3 sempre.
4. **P3 nunca vira P1 por agregação automática.** A passagem exige a análise de reidentificação de
   [RN-DASH-161] — agregação não é anonimização ([RN-DASH-160]).
5. **Separação técnica, não apenas lógica.** O módulo público não deve consultar o acervo interno em
   tempo de requisição: publica-se um **conjunto derivado**, gerado, revisado e versionado. Isso evita
   a classe inteira de falhas em que um parâmetro de URL desce a granularidade além do previsto.
6. **Risco processual não se publica.** Publicar "temos 4.200 processos prestes a prescrever" é
   entregar mapa de defesa a quem litiga contra o órgão. Não há dever de publicar isso, e o interesse
   público é atendido pelo indicador P1 de cumprimento de prazos, que mede a mesma realidade sem
   individualizar o alvo.

**Controvérsia/risco.** _Severidade: média-alta._ Duas forças legítimas puxam em direções opostas: a
LAI e o interesse público em transparência de mortalidade no trânsito empurram para a abertura; a LGPD
e o dado sensível empurram para a restrição. O ponto de equilíbrio — **agregado com granularidade
segura** — é **decisão do órgão com apoio do Encarregado, documentada**, e não pode ser improvisada
pelo painel ([RN-BOAT-130], nota de controvérsia). Registrar a decisão é parte do cumprimento, porque
é o que se apresenta quando ela for questionada — em qualquer das duas direções.
