---
id: IU-DASH-001
title: Inventário de painéis do DASHBOARD — camadas de ação, vigilância e contexto
status: reviewed
apps: [dashboard]
sources:
  [REF-LEI-12527-2011, REF-LEI-13460-2017, REF-LEI-13709, REF-CONTRAN-918]
updated: 2026-08-31
---

Promovido de `_intake/ux-notes.md` §a na rodada de 2026-08-31. Nenhum painel tem artefato de
produto confirmado — o DASHBOARD é greenfield, e este é o inventário de origem.

Três correções sobre a versão de intake, todas de deriva da camada derivada: o radar do RAIT
cobre **quatro** relógios (§4.1-4.4 de [WF-RAIT-002], não §4.1-4.3 — o relógio D entrou depois);
o catálogo de deveres tem **14 linhas**, não 13 ([RN-DASH-120]); e a tela de transparência ativa,
que os casos de uso exigem, não constava.

## A — Painéis (9)

| id       | Painel                                       | Camada          | Jornada        | UC                           | Origem do indicador                                                                       |
| -------- | -------------------------------------------- | --------------- | -------------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| P-01     | Triagem do turno — fila de alertas cross-app | Ação            | [JRN-DASH-001] | [UC-DASH-002]                | agregado de todas as escadas                                                              |
| P-02     | Radar de prescrição RAIT                     | Ação            | [JRN-DASH-002] | [UC-DASH-001]                | [WF-RAIT-002] §4.1-4.4, [RN-DASH-131] — **quatro** relógios A/B/C/D                       |
| P-03     | Escada de prazos da junta PEC                | Ação            | [JRN-DASH-007] | [UC-DASH-001]                | [RN-PEC-112], [RN-DASH-132]                                                               |
| P-04     | Saúde técnica de integrações                 | Ação/Técnico    | [JRN-DASH-004] | [UC-DASH-006]                | [RN-PEC-008], [RN-DASH-133], [RN-DASH-134]                                                |
| P-05     | Catálogo e calendário de deveres periódicos  | Ação/Vigilância | [JRN-DASH-003] | [UC-DASH-003], [UC-DASH-008] | [RN-DASH-120] — 14 linhas, 10 com prazo numérico                                          |
| P-06     | Comparativo de unidades e circuitos          | Vigilância      | [JRN-DASH-006] | [UC-DASH-005]                | [WF-RAIT-002] §5, [RN-DASH-170]                                                           |
| P-07     | Trilha de auditoria consolidada              | Contexto        | [JRN-DASH-005] | [UC-DASH-004]                | [RN-DASH-171], [RN-DASH-172]                                                              |
| **P-08** | **Transparência ativa e dados abertos**      | Vigilância      | —              | [UC-DASH-007]                | [RN-DASH-140], [RN-DASH-141], [RN-DASH-151] — o módulo é, ele mesmo, superfície do painel |
| P-09     | Estatística agregada de sinistros            | Contexto        | —              | [UC-DASH-005]                | [RN-DASH-160], [RN-DASH-161] — **condicional**, ver §D                                    |

## B — A hierarquia de três camadas é a decisão estrutural do produto

Ação, vigilância e contexto nunca têm o mesmo peso visual. É o erro mais fácil de cometer num
painel interno, porque mostrar tudo igual é tecnicamente mais simples:

1. **Ação** — algo cruzou um limiar e precisa de dono agora. Topo da tela, sempre com verbo, nunca
   só um número.
2. **Vigilância** — nada exige ação imediata, mas merece acompanhamento periódico.
3. **Contexto** — consultado sob demanda, nunca competindo por atenção com as duas camadas acima.

## C — Requisitos transversais

1. **As letras dos relógios são as do RAIT.** A/B/C/D de [WF-RAIT-002] §4, os únicos valores que
   `rait_clock.clock_code` aceita. O painel exibe **qual** relógio governa, porque a ação corretiva
   difere por letra ([RN-DASH-131], AC-DASH-001-2).
2. **Nenhum botão pratica ato de negócio.** O painel detecta, classifica, notifica e acompanha; o
   ato acontece no app de origem ([RN-DASH-101]). Um botão de "julgar" ou "declarar prescrição"
   aqui seria violação de fronteira, não conveniência.
3. **Todo número carrega selo de frescor** — `FRESCO`, `ATRASADO`, `INDISPONIVEL` ([WF-DASH-003]).
   O estado "desatualizado" é cidadão de primeira classe, não um caso de erro.
4. **Severidade não depende só de cor** — forma e rótulo textual acompanham, e a escada existe para
   prevenir fadiga de alerta.
5. **Meta operacional e teto legal jamais no mesmo componente** — a distinção de [WF-RAIT-002] §4.5
   vale em toda superfície de gestão.
6. **Segregação por papel e revelação auditada** — um painel que agrega saúde, processo e campo não
   dá a ninguém visão de tudo ([RN-DASH-170], [RN-DASH-171]).
7. **A exportação herda as regras da publicação** — supressão de célula inclusive
   ([RN-DASH-172], [RN-DASH-161]).

## D — P-09 não deve ser construído ainda

A estatística agregada de sinistros só existe depois que a camada de anonimização de
[RN-BOAT-131] estiver resolvida e o limiar de supressão de célula tiver parecer
([RN-DASH-161], DT-029). O risco de reidentificação em municípios pequenos do AM foi classificado
como **ALTO**, e é verificável de fora por qualquer interessado. Construir antes, mesmo sob pressão
de prazo, é assumir um risco que não é do produto — é do órgão.

## E — Painéis dependentes de decisão pendente

| Painel     | Depende de                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------ |
| P-09       | DT-029 — limiar de célula, com parecer antes da primeira publicação                              |
| P-08       | DT-066 — adesão do AM à Lei 14.129/2021, que condiciona parte do módulo público                  |
| P-05       | DT-017 — periodicidade de transmissão ao RENAEST, hoje sem prazo vigente                         |
| P-01, P-02 | limiares das escadas já propagados (DT-030, 2026-08-28); nota de capacidade do RAIT segue aberta |
