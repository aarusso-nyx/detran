---
id: RN-RAIT-108
title: Efeito suspensivo automático do recurso tempestivo — alcance e limites
status: draft
apps: [rait, portal]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-08-24
---

**Regra.** O recurso tempestivo contra a penalidade tem **efeito suspensivo automático**, decorrente
da própria lei: não depende de pedido do recorrente, de garantia, de depósito nem de deferimento por
autoridade. Seu alcance é o seguinte:

**Suspende (o que fica bloqueado enquanto pende o recurso):**

- qualquer **restrição nos arquivos do órgão de registro do veículo**, inclusive para fins de
  **licenciamento e transferência**;
- **cobrança moratória** e incidência de juros ([RN-RAIT-128]);
- **registro da penalidade no RENACH** e a pontuação correspondente ([RN-RAIT-131]).

**NÃO suspende:**

- os **prazos processuais**, que continuam correndo ([RN-RAIT-105]);
- os prazos de **decadência** do art. 282 §§6º-7º ([RN-RAIT-114]) nem os de **prescrição**
  ([RN-RAIT-112], [RN-RAIT-113]);
- a **exigibilidade futura** da multa caso o recurso seja improvido.

**Base legal.**

- [REF-CTB-280-290] art. 285, _caput_: _"O recurso … será interposto perante a autoridade que imputou
  a penalidade e terá efeito suspensivo."_
- [REF-CTB-280-290] art. 284 §3º: _"Não incidirá cobrança moratória e não poderá ser aplicada
  qualquer restrição, inclusive para fins de licenciamento e transferência, enquanto não for
  encerrada a instância administrativa de julgamento de infrações e penalidades."_
- [REF-CONTRAN-918] art. 13: _"Até a data de vencimento expressa na NP de multa ou enquanto
  permanecer o efeito suspensivo sobre o AIT, não incidirá qualquer restrição, inclusive para fins de
  licenciamento e transferência, nos arquivos do órgão ou entidade executivo de trânsito responsável
  pelo registro do veículo."_
- [REF-CONTRAN-918] art. 18 e [REF-CTB-280-290] art. 290, parágrafo único: RENACH só após esgotados
  os recursos.

**Verificação.** Ao admitir o recurso tempestivo, o RAIT publica `RAIT_EFEITO_SUSPENSIVO_INSTAURADO`
([WF-RAIT-001] §Eventos) — que leva a infração a `EM_RECURSO` em [WF-INF-001] — bloqueando restrições ao
sistema de registro de veículo e ao módulo de cobrança; o PORTAL exibe o estado "em recurso — sem
restrição" com a base legal. O bloqueio só é liberado pelo evento de **encerramento da instância**
([RN-RAIT-119]).

**Observação de alcance.** O art. 284 §3º é **mais amplo** que o efeito suspensivo do art. 285: veda
restrição e cobrança moratória _"enquanto não for encerrada a instância administrativa"_, sem
condicionar a que haja recurso. Ou seja, mesmo sem recurso interposto, enquanto a instância não se
encerra por uma das hipóteses do art. 290, a proteção patrimonial persiste. O RAIT deve derivar o
bloqueio do **estado da instância**, não da existência de recurso.
