# Issue da frente `dashboard-wiring` (R-0026) — corpo

Título: **DASHBOARD: console L0 → L2 sobre BP-DASH-MONITOR-001 (R-0026, ação 6 da C-0002)**

> Redigido pelo maestro em 2026-09-29, a pedido do Owner, a partir de `plan.md` (§Metas, §Decisões
> do Owner, §Retomada). A issue foi aberta no GitHub com este corpo, sem as três primeiras linhas.

## Contexto

O console `apps/dashboard/web` tem 18 telas e 22 entradas de rota, todas `level: 'L0'`. O contrato
de comandos `BP-DASH-MONITOR-001` tem 43 operações (23 GET, 18 POST, 2 PATCH) e nenhum consumidor
no app. O bloco A (`legal-ceiling`) está com 2/11 indicadores conectados, porque os eventos RAIT
`rait.clock.flag-changed`, `rait.decision.published` e `rait.case.created` não têm produtor (#96,
OD-D17). A frente R-0026 (`dashboard-wiring`) é a ação 6 da C-0002 para o DASHBOARD.

Decisão do Owner de 2026-09-26: OD-R26-001 = (a). A própria rodada cria os três eventos RAIT, na
transação do comando, com varredura de bandeira.

## Escopo por CTG

- **CTG-0001 — reconciliação (#123):** `read-map.md` (22 rotas, nível-alvo), `command-map.md`
  (16 comandos), triagem de OD-D16-001…019, decisões OD-D33 (#97), OD-D35 (#98) e OD-D58 (#100),
  registradas no build pack §4.
- **CTG-0002 — backend DASHBOARD (#98, #99, #100):** códigos de estado por recurso, retirada de
  `DASH.ALERT_BUSINESS_ACT_FORBIDDEN`, job de relatórios em `@stynx-nyx/jobs` 1.5.x com ator
  técnico, 5 rotas `GET` novas (OD-R26-004 = a).
- **CTG-0003 — produtores RAIT (#96):** os três eventos com o envelope de
  `rait-events-sse-contract.md` e a varredura de bandeira (WF-RAIT-002 §4, H.46); `connected=true`
  no seed só com replay verde.
- **CTG-0004 — console L0 → L2 (#124):** clientes e facades pelo padrão de ligação de R-0024, dados
  reais nas 18 telas, 9 formulários ligados, SSE canônico, D-13 com supressão ponta a ponta.
- **CTG-0005 — docs e delta:** build pack, `dashboard-frontends.md`, README do app, backlog,
  `waves.md` e `docs/framework/arch/availability/dashboard-web.availability.json`.

## Feito na abertura antecipada (adenda A-C2-15, só documentos)

TASK-0001 (mapas e triagem), TASK-0002 (build pack §4 com OD-D16-001…019 e OD-R26-001…040,
route contract §6, catálogo de erros, backlog), TASK-0003 (`contracts/CTG-0002.md`) e TASK-0006
(`contracts/CTG-0003.md`, com o transporte pendente do outbox de R-0022).

## Espera R-0022, R-0023 e R-0024

- **R-0022:** pin com `@stynx-nyx/jobs` 1.5.x (TASK-0004/0005) e outbox migrado, stynx #316
  (TASK-0007/0008).
- **R-0024:** padrão `frontend-wiring-pattern.md` (TASK-0009 em diante).
- **R-0023:** camada do usuário e `policy.ts` como dados.
- Os contratos produzidos agora são reconferidos contra `origin/main` na retomada. Divergência vira
  adenda numerada do Architect.

## Decisões e riscos a acompanhar

- Decididas pelo Owner em 2026-09-29: alvo do job em `@stynx-nyx/jobs` 1.5.x; OD-R26-004 e 005;
  009, 011, 012, 014, 015, 019, 020, 021, 026, 030, 031, 033, 037 e 038. As chaves i18n de
  OD-D16-012 só foram registradas, sem editar a semente.
- OD-R26-002 continua aberta.
- Com OD-R26-030 (escada do relógio D `source_pending`), o bloco A chega no máximo a **6/11**. O
  plano previa 7/11.
- OD-R26-028: em D-13, o limiar está fixo no código e a supressão secundária cobre só uma célula.
  Entra como teste RED na retomada.

## Rastreio

- Frente: #123 (reconciliação), #124 (L0 → L2).
- ODs: #96 (OD-D17), #97 (OD-D33), #98 (OD-D35), #99 (OD-D50), #100 (OD-D58).

## Estado (checkpoint 2026-09-29)

O branch `orchestra/dashboard-wiring` está publicado, sem PR (OD-C2-005). Commits: TASK-0001
`8a1e8bac`, TASK-0006 `00fc4b7e`, TASK-0003 `a20529ed`, TASK-0002 `446c882d`. O checkpoint está em
`work/rounds/R-0026/plan.md` §Retomada (`f43f8506`). O PR final da rodada espera R-0022, R-0023 e
R-0024 em `main`.
