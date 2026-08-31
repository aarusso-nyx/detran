---
id: UC-DASH-001
title: Gestor abre o radar de prescrição
status: approved
apps: [dashboard, rait, pec]
sources:
  [
    WF-DASH-001,
    RN-RAIT-110,
    RN-RAIT-111,
    RN-RAIT-112,
    RN-RAIT-113,
    RN-RAIT-114,
    RN-PEC-112,
  ]
updated: 2026-08-31
---

## Ator e objetivo

Gestor de área (Gestor RAIT, Gestor Clínica/PEC) quer ver, em um único painel, todos os casos que
se aproximam de um teto legal que extingue direito — sem precisar entrar em cada app de domínio
separadamente para montar esse quadro.

## Pré-condições

- O gestor tem acesso ao DASHBOARD com escopo sobre o(s) app(s) de sua área.
- Pelo menos um indicador tipo `legal-ceiling` do app está conectado (ver [APP-DASHBOARD]
  §Catálogo, bloco A).

## Fluxo principal

1. Gestor abre o radar de prescrição no DASHBOARD.
2. Sistema lista todos os casos com indicador tipo `legal-ceiling` acima de `SEM_RISCO`,
   agrupados por indicador (IND-DASH-101..111) e ordenados por proximidade do teto.
3. Para cada caso, o painel exibe: nível de severidade atual (N1/N2/N3/CRÍTICO), base legal
   citada explicitamente (ex. "CTB art. 289-A"), dono do caso, tempo restante até o teto, e o
   selo de frescor da leitura ([WF-DASH-003]).
4. Gestor filtra por pool/circuito/unidade, se desejar (ver [UC-DASH-005] para a visão
   comparativa completa).
5. Gestor seleciona um caso para ver detalhe e aciona o dono direto, se ainda não notificado
   (ver [UC-DASH-002] para o ciclo de reconhecimento).

## Fluxos alternativos / exceções

- **Fonte indisponível**: se a leitura de um app estiver `INDISPONIVEL` ([WF-DASH-003]), o
  painel oculta os números daquele indicador (default para bloco A) e exibe "sem leitura desde
  <timestamp> — fonte indisponível", nunca o último número como atual.
- **Indicador sem escada calibrada** (ex. IND-DASH-105, prescrição quinquenal): o caso aparece
  listado com o marco absoluto (tempo desde a `data_pratica_ato`), sem nível de severidade
  N1/N2/N3 — sinalizado como "sem escada calibrada" na UI.
- **Gap de dado do CETRAN** (IND-DASH-103): casos em 2ª instância sem `data_recebimento_cetran`
  capturada aparecem como "sem leitura — integração pendente", não como `SEM_RISCO` (que seria
  falso-negativo perigoso).

## Pós-condições

- Gestor tem visão consolidada e priorizada dos casos em risco de extinção de direito, sem ter
  aberto RAIT e PEC separadamente.

## Critérios de aceitação

**AC-DASH-001-1 — o relógio governante é o mais curto, e é nomeado**

- **Dado** um processo com mais de um relógio de extinção correndo
- **Quando** o radar o exibe
- **Então** a urgência vem do **menor tempo restante** (steering C.14) e o painel diz **qual letra**
  governa — A, B, C ou D ([RN-DASH-131]) — porque a ação corretiva difere por relógio

**AC-DASH-001-2 — as letras são as do RAIT, não as do painel**

- **Dado** qualquer exibição de relógio de extinção
- **Quando** é rotulada
- **Então** usa os códigos de [WF-RAIT-002] §4, os únicos que `rait_clock.clock_code` aceita — a
  1ª e a 2ª instância são dois ciclos do **relógio B**, distinguidos por `instancia`, nunca letras
  próprias

**AC-DASH-001-3 — todo teto legal de outro app vira relógio aqui**

- **Dado** um prazo extintivo modelado em qualquer app de domínio
- **Quando** o catálogo é montado
- **Então** existe indicador correspondente no DASHBOARD ([RN-DASH-130]) — a regra é geral, e um
  teto sem indicador é lacuna de catálogo, não decisão

**AC-DASH-001-4 — o painel não re-modela o relógio de origem**

- **Dado** um relógio do RAIT ou do PEC
- **Quando** o DASHBOARD o exibe
- **Então** lê o estado do app dono; não recalcula prazo por conta própria ([RN-DASH-101]) — duas
  implementações do mesmo prazo divergem, e a do painel não é a que vale

**AC-DASH-001-5 — a base legal aparece junto do número**

- **Dado** um caso em risco
- **Quando** é listado
- **Então** o dispositivo é citado ao lado do prazo (ex. "CTB art. 289-A"), nunca só a contagem

**AC-DASH-001-6 — o selo de frescor acompanha cada leitura**

- **Dado** um número exibido no radar
- **Quando** é apresentado
- **Então** carrega o estado da fonte ([WF-DASH-003]: `FRESCO`, `ATRASADO`, `INDISPONIVEL`) — um
  número velho nunca aparece como se fosse atual

**AC-DASH-001-7 — a escada do PEC é vigiada com seus cinco prazos**

- **Dado** um caso de revisão no PEC
- **Quando** é monitorado
- **Então** os cinco prazos de [RN-PEC-112] são acompanhados separadamente ([RN-DASH-132]),
  distinguindo os preclusivos do candidato dos que são SLA do órgão

## Regras aplicáveis

- [RN-RAIT-110], [RN-RAIT-111], [RN-RAIT-112], [RN-RAIT-113], [RN-RAIT-114], [RN-PEC-112]
- [WF-DASH-001] §Classificação
- [WF-DASH-003] §Regra de honestidade do painel
