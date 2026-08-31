---
id: IU-PORTAL-001
title: Inventário de telas do PORTAL — trilha de apelação, serviços greenfield e superfícies transversais
status: reviewed
apps: [portal]
sources:
  [
    REF-LEI-13460-2017,
    REF-DECRETO-10543-2020,
    REF-LEI-13709,
    REF-CONTRAN-931,
    REF-CONTRAN-918,
    REF-LEI-13146-LBI,
  ]
updated: 2026-08-26
---

Promovido de `_intake/ux-notes.md` §a na rodada de 2026-08-26. Nenhuma tela do PORTAL está
confirmada como artefato existente — o app é greenfield, e este é o inventário de origem, não um
registro de deltas.

Acréscimos desta rodada: uma tela que os casos de uso exigiam e o intake não previa (T-27,
elevação de nível), e a marcação de quais telas dependem de decisão pendente do Owner.

## A — Trilha de apelação de multas (13)

| id   | Tela                                 | UC                                     | Nota de desenho                                                                            |
| ---- | ------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------ |
| T-01 | Detalhe da autuação (NA/NP)          | entrada de [UC-PORTAL-001]/[002]/[004] | os três caminhos — defender, indicar condutor, pagar — sempre visíveis **juntos**          |
| T-02 | Assistente de defesa prévia          | [UC-PORTAL-001]                        | pré-preenchido; checklist sem documentos do próprio órgão ([RN-PORTAL-106])                |
| T-03 | Assistente de recurso à JARI         | [UC-PORTAL-002]                        | banner de efeito suspensivo ([RN-RAIT-108])                                                |
| T-04 | Assistente de recurso ao CETRAN      | [UC-PORTAL-003]                        | parecer e conclusão da JARI anexados de ofício, não editáveis                              |
| T-05 | Assistente de indicação de condutor  | [UC-PORTAL-004]                        | assinatura remota gov.br **ou** upload assinado — sem firma reconhecida ([RN-PORTAL-104])  |
| T-06 | Meus processos (lista)               | [UC-PORTAL-005]                        | ordenável por urgência de prazo                                                            |
| T-07 | Detalhe do processo (linha do tempo) | [UC-PORTAL-005], [UC-PORTAL-009]       | separa "com você" de "com o órgão" ([RN-PORTAL-112])                                       |
| T-08 | Confirmação de desistência           | [UC-PORTAL-006]                        | consequência antes do clique                                                               |
| T-09 | Adesão ao SNE                        | [UC-PORTAL-007]                        | separada da decisão de pagar ([RN-PORTAL-123])                                             |
| T-10 | Tela de decisão                      | [UC-PORTAL-008]                        | resultado + resumo simples + próximo passo como ação                                       |
| T-11 | Resposta a diligência                | [UC-PORTAL-009]                        | contador de prazo destacado                                                                |
| T-12 | Caixa de entrada / notificações      | transversal                            | identifica o canal — SNE × canal próprio ([RN-PORTAL-124])                                 |
| T-13 | Comparação de pagamento              | [UC-PORTAL-015]                        | intercepta o clique de pagar; só a faixa de 40% encerra o questionamento ([RN-PORTAL-128]) |

## B — Serviços greenfield (13)

| id   | Tela                              | UC / Jornada     | Nota                                                                                  |
| ---- | --------------------------------- | ---------------- | ------------------------------------------------------------------------------------- |
| T-14 | Minhas multas e pontuação         | [UC-PORTAL-010]  | ponto de entrada mais frequente; CPF basta ([RN-PORTAL-103])                          |
| T-15 | Como funciona a pontuação         | [JRN-PORTAL-004] | distingue pontos definitivos de pontos em disputa ([RN-RAIT-131])                     |
| T-16 | Meus documentos — CNH digital     | [UC-PORTAL-011]  | offline, autenticação local, modo bateria crítica ([RN-PORTAL-115])                   |
| T-17 | Meu veículo — CRLV-e              | [UC-PORTAL-012]  | estado de quitação **antes** da tentativa ([RN-PORTAL-116])                           |
| T-18 | Buscar meu boletim de sinistro    | [UC-PORTAL-013]  | busca por vocabulário coloquial; restrita aos próprios sinistros                      |
| T-19 | Detalhe do sinistro               | [UC-PORTAL-013]  | titular sem máscara; dado de terceiro protegido ([RN-PORTAL-118])                     |
| T-20 | Meu resultado de exame de aptidão | [UC-PORTAL-014]  | vocabulário legal federal, nunca `CONDICIONADO` ([RN-PEC-105])                        |
| T-21 | Nova manifestação (ouvidoria)     | [UC-PORTAL-016]  | recebimento irrecusável, protocolo imediato ([RN-PORTAL-109])                         |
| T-22 | Acompanhar manifestação           | [UC-PORTAL-016]  | só o prazo do órgão para o cidadão, nunca o prazo interno                             |
| T-23 | Pagar sem abrir mão do recurso    | [UC-PORTAL-015]  | rótulo explícito, nunca "pagar" ambíguo ([RN-PORTAL-127])                             |
| T-24 | Meus dados (LGPD)                 | [UC-PORTAL-018]  | ponto único; correção como ação de primeira classe ([RN-PORTAL-119], [RN-PORTAL-121]) |
| T-25 | Carta de Serviços por serviço     | transversal      | superfície de produto, não página morta ([RN-PORTAL-108])                             |
| T-26 | Avaliação do serviço              | [UC-PORTAL-017]  | no momento do resultado, não dias depois ([RN-PORTAL-110])                            |

## C — Transversal

| id       | Tela                                | UC              | Nota                                                                                                       |
| -------- | ----------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------- |
| **T-27** | **Elevação de nível de assinatura** | [UC-PORTAL-019] | nunca um erro seco; explica o nível que falta e retoma o ato onde parou ([RN-PORTAL-101], [RN-PORTAL-102]) |

## D — Acessibilidade é obrigação de resultado, não item de backlog

[RN-PORTAL-113] é a regra mais fácil de subestimar deste app: a LBI art. 63 e o Decreto
5.296/2004 impõem **obrigação de resultado**, sem cláusula de adesão e sem prazo a cumprir — o
prazo do art. 47 do decreto exauriu-se em 2004-2005. Consequências concretas de tela:

1. **WCAG 2.1 AA + eMAG é o padrão declarado** (DT-028) — decisão de custo quase nulo e efeito
   total, hoje pendente apenas de declaração formal.
2. **Nenhuma tela desta lista é exceção.** Não há trilha "acessível" paralela: o requisito incide
   sobre T-01 a T-27.
3. **Guia e boleto em formato acessível mediante solicitação** ([RN-PORTAL-114]) — T-13 e T-23
   precisam do caminho de solicitação, não apenas de contraste correto.
4. **O risco é de MP/ACP**, não de reclamação de usuário — o descumprimento é verificável de fora
   por qualquer interessado, como o dever de publicidade do BOAT.

## E — Requisitos transversais de conteúdo

1. **Estado interno nunca vaza.** O vocabulário do RAIT, do PEC e do BOAT é traduzido; o mapa de
   tradução é responsabilidade do PORTAL (`_intake/ux-notes.md` §c).
2. **Prazo é sempre data calculada**, e sempre rotulado como "seu prazo" ou "prazo do órgão".
3. **Valor e desconto aparecem lado a lado**, nunca um escondido atrás de clique ([RN-PORTAL-128]).
4. **O titular vê o próprio dado sem máscara** ([RN-PORTAL-118]) — inverter isso é o erro mais
   fácil de cometer em T-19, T-20 e T-24.
5. **Nenhum ato exige assinatura qualificada** ([RN-PORTAL-101]); o teto é a avançada.
6. **O canal digital nunca é o único** ([RN-PORTAL-105]) — toda tela de ato deve dizer qual é a
   alternativa presencial.

## F — Telas dependentes de decisão pendente

| Tela                   | Depende de                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------- |
| T-02, T-03, T-05, T-27 | DT-050 — portaria estadual de níveis de assinatura; sem ela a exigência é atacável |
| T-13, T-23             | DT-026 — instrumento para colher a renúncia na faixa de 40%                        |
| T-17                   | DT-027 — leitura de que exigibilidade suspensa não é débito                        |
| T-21, T-22             | DT-051 — nível de assinatura da ouvidoria (LEGAL: nenhum; BPO/UX: simples)         |
| T-01 a T-27            | DT-028 — declaração formal de WCAG 2.1 AA + eMAG                                   |

Cinco grupos de telas dependem de decisões, e um deles (DT-028) incide sobre todas. Nenhuma bloqueia
a construção do fluxo de apelação, que é o núcleo do app.
