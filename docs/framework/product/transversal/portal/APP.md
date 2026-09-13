---
id: APP-PORTAL
title: PORTAL — Serviços ao cidadão (web + mobile)
status: approved
apps: [portal]
sources:
  [
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
    REF-DECRETO-10543-2020,
    REF-DECRETO-8936-2016,
  ]
updated: 2026-09-13
---

## Missão

Porta única do cidadão/condutor/proprietário para serviços de qualquer domínio: consultar
multas e pontuação, aderir ao SNE, indicar condutor, apresentar defesa prévia e recursos
(JARI/CETRAN), acompanhar processos, receber notificações.

## Atores

Cidadão; condutor; proprietário (PF/PJ); procurador. Ver `shared/actors.md` para o catálogo
completo — o PORTAL é o único app cuja base de atores é majoritariamente externa ao órgão (o
"Gestor DETRAN"/"Auditor" transversal existe, mas apenas com visão de leitura sobre o que o
cidadão vê).

## Escopo (dentro / fora)

**Dentro**: identidade gov.br e elevação de nível por ato ([WF-PORTAL-002]); consultas de leitura
sobre dados de outros sistemas (RENAINF, RENACH, RENAVAM, BOAT, PEC); composição e protocolo de
pedidos, com pré-preenchimento por uso único ([WF-PORTAL-001]); acompanhamento com tradução para
linguagem cidadã; notificações e caixa do cidadão, incl. SNE ([WF-PORTAL-003]); ouvidoria, avaliação
de satisfação e Carta de Serviços ([WF-PORTAL-004]); pagamento (solicitação e confirmação de guia).

**Fora**: análise/julgamento de mérito de qualquer processo (rait, pec, boat decidem — o PORTAL
delega e exibe, nunca decide); atendimento presencial (existe em paralelo, não é modelado aqui);
registro autoritativo de veículo/CNH/sinistro (RENAVAM/RENACH/RENAEST são a fonte — o PORTAL espelha
e não duplica). Ver `_intake/bpo-notes.md` §"O que o PORTAL não faz" para a lista completa e
explícita, incluindo os limites que uma implementação apressada tende a violar.

## Modelo de operação

O PORTAL é um **orquestrador de vitrine**, não um sistema de registro próprio. Toda solicitação
segue o ciclo genérico de [WF-PORTAL-001] (identificação → elegibilidade → composição → assinatura
no nível exigido → protocolo → acompanhamento → resultado → avaliação) e é sempre delegada a um
workflow de destino de domínio (RAIT, PEC, BOAT, ou leitura direta de sistema nacional). As quatro
pontes transversais que sustentam qualquer serviço do catálogo:

| Ponte                            | Workflow        | O que resolve                                                                                  |
| -------------------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| Identidade e nível de assinatura | [WF-PORTAL-002] | login gov.br, matriz ato→nível, elevação guiada, representação/procuração                      |
| Notificações                     | [WF-PORTAL-003] | SNE (efeito jurídico) vs. notificação de processo (UX), preferências, comprovação de ciência   |
| Ouvidoria e avaliação            | [WF-PORTAL-004] | manifestação (Lei 13.460), prazos de resposta, avaliação de satisfação, Carta de Serviços viva |
| Ciclo comum de solicitação       | [WF-PORTAL-001] | o esqueleto que qualquer serviço novo do catálogo deve instanciar, sem reinventar estado       |

## Catálogo de serviços

A tabela completa (serviço · domínio · nível de assinatura · workflow de destino · prazo) vive em
[WF-PORTAL-001] §"Catálogo de serviços" — tratada como **fonte única de verdade**, inclusive para
alimentar a correção do gap de conformidade encontrado na Carta de Serviços publicada do DETRAN-AM
(prazo máximo por serviço ausente — [REF-LEI-13460-2017] art.7º §2º, IV). Não duplicar essa tabela
aqui nem em nenhum outro artefato.

**Primeira entrega (decisão de produto, mantida)**: trilha de recurso — interpor defesa/recurso de
multa → acompanhar → resultado (deferido: multa cancelada; indeferido: mantida) incl. 2ª instância.
Ver [JRN-PORTAL-001].

**Ondas seguintes (escopo greenfield confirmado pela rodada CRAWLER, `_intake/research-dossier.md`)**:
consultas de leitura (multas/pontuação/CNH-e/CRLV-e), pagamento, acesso a BAT de sinistro, resultado
de exame de aptidão, ouvidoria/avaliação/LGPD — ver [UC-PORTAL-010] a [UC-PORTAL-019].

## KPIs (propostos pelo BPO — a validar em steering)

| KPI                                                   | O que mede                                                                                   | Por quê                                                                                                                              |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Taxa de autosserviço                                  | % de solicitações concluídas sem contato humano (balcão/telefone)                            | mede se o PORTAL está de fato substituindo o atendimento presencial, não só duplicando canal                                         |
| % protocolos digitais vs. balcão                      | proporção de entrada por canal, por serviço                                                  | Lei 14.129 art.16 preserva o atendimento presencial — este KPI mostra se a preservação virou dependência                             |
| Tempo de resposta por serviço vs. prazo legal         | tempo real do workflow de destino / prazo legal do catálogo                                  | usa a própria tabela de [WF-PORTAL-001] como referência — permite alerta antes do estouro, mesmo padrão da escada de alertas do RAIT |
| Taxa de elevação de nível abandonada                  | % de tentativas de `ELEVACAO_GUIADA` que terminam em `ELEVACAO_ABANDONADA` ([WF-PORTAL-002]) | mede fricção de identidade — item explicitamente pedido no briefing BPO                                                              |
| Satisfação por serviço                                | média da avaliação de [UC-PORTAL-017], por serviço                                           | base direta do painel de monitoramento exigido pela Lei 14.129 art.22                                                                |
| Taxa de manifestação respondida no prazo (30/60 dias) | % de manifestações de ouvidoria respondidas dentro do teto legal                             | Lei 13.460 art.16 — indicador de risco de responsabilização do agente público                                                        |

## Pedidos de capacidade/volume ao Owner (para dimensionar as ondas seguintes)

Nenhum volume de consulta/pagamento/acesso a documento foi coletado nesta rodada (diferente do
RAIT, que já tem volume aprovado em `_meta/steering.md` B.11 — >500/mês). Perguntas específicas do
PORTAL, ainda não feitas ao Owner:

1. Volume mensal esperado de consultas de leitura (multas/pontuação/CNH-e/CRLV-e) — determina se o
   módulo de espelho de RENAINF/RENACH/RENAVAM precisa de cache dedicado ou pode consultar ao vivo.
2. Volume mensal de pagamentos processados pelo próprio PORTAL vs. redirecionamento a banco/PIX
   externo — determina o escopo real do módulo de pagamento (gateway próprio vs. apenas geração de
   guia).
3. % de acessos a BAT de sinistro que envolvem dado de vítima terceira (não o próprio solicitante)
   — dimensiona o esforço de controle de acesso reforçado de [UC-PORTAL-013].
4. Meta de adesão ao SNE — a Res. 931/2022 dá desconto de 60% como incentivo, mas nenhuma meta de
   produto (% da base de condutores aderida) foi definida.

## Decisões

Ver `_intake/bpo-notes.md` para o registro completo de propostas ao Owner desta rodada
(2026-08-24/25, CRAWLER→BPO).

## Residual aberto após a rodada de endurecimento (2026-08-26)

**As 28 regras seguem em `draft`** — os 18 itens de validação jurídica do PORTAL não foram
respondidos (DT-042).

O PORTAL entrou nesta rodada com **zero das suas 28 regras citadas** por qualquer caso de uso ou
workflow: a rodada LEGAL correu em paralelo à do BPO e seu resultado nunca foi incorporado. Todas
foram ancoradas agora.

| Item                                                     | Onde                                              | Por que importa                                                                                                                                                                                                                                             |
| -------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Portaria estadual de níveis de assinatura**            | [RN-PORTAL-101], [UC-PORTAL-019]                  | o Decreto 10.543/2020 é **federal**; sem ato estadual, exigir "avançada" é atacável (Lei 13.460 art.5º IV). Custo baixo, efeito total (DT-050) — **fechado em 2026-09-13**: PN DETRAN-AM 001/2025 localizada; selo prata aceito por decisão do Owner (H.50) |
| **Adesão do AM à Lei 14.129/2021**                       | 12 regras                                         | condiciona o fundamento de boa parte do app; obter ou registrar formalmente a inexistência (DT-066)                                                                                                                                                         |
| **Instrumento da renúncia na faixa de 40%**              | [RN-PORTAL-128], [UC-PORTAL-015]                  | não há forma normativa para colher a declaração (DT-026)                                                                                                                                                                                                    |
| **CRLV-e × multa sob recurso suspensivo**                | [RN-PORTAL-116], [UC-PORTAL-012]                  | tratar exigibilidade suspensa como débito é coação indireta ao pagamento (DT-027)                                                                                                                                                                           |
| **Declarar WCAG 2.1 AA + eMAG**                          | [RN-PORTAL-113], todas as telas                   | obrigação de resultado sem cláusula de adesão; risco de MP/ACP, custo quase nulo (DT-028)                                                                                                                                                                   |
| **Nível de assinatura da ouvidoria**                     | [RN-PORTAL-101], [UC-PORTAL-016]                  | LEGAL conclui que nenhum é exigível; BPO/UX assumiram "simples" — divergência a alinhar (DT-051) — **fechado em 2026-09-13 (H.51)**: nenhum para manifestar, simples para acompanhar                                                                        |
| **Autorização do órgão máximo para cartão/parcelamento** | [RN-PORTAL-126], [UC-PORTAL-015]                  | pré-condição de existência do módulo (DT-031)                                                                                                                                                                                                               |
| **Cartas de serviço com exigências sem base legal**      | [RN-PORTAL-104], [RN-PORTAL-106], [UC-PORTAL-003] | especificação corrigida: endosso cartorial é vedado e parecer/conclusão da JARI segue de ofício; a publicação no CMS institucional é ação externa ao corpus                                                                                                 |

**Duas contradições corrigidas nesta rodada**, ambas afirmações falsas que teriam virado código:

- [UC-PORTAL-015] afirmava parcelamento "em até 12x" como regra do órgão. O art. 27 da Res. 918
  trata de operação de cartão por conta e risco da instituição e **não fixa número de parcelas**
  ([RN-PORTAL-126], DT-120).
- [UC-PORTAL-018] aplicava os 15 dias do art. 19, II da LGPD ao pedido de declaração completa. Esse
  prazo **não é o do Poder Público** ([RN-PORTAL-120]) — exibi-lo cria expectativa indevida.

A trilha de apelação — defesa, recurso à JARI, recurso ao CETRAN, acompanhamento, diligência,
decisão — está `approved` e não depende de nenhum item acima.
