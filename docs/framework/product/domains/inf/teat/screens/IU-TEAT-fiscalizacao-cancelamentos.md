---
id: IU-TEAT-fiscalizacao-cancelamentos
title: Fiscalização de cancelamentos
status: draft
apps: [teat]
updated: 2026-09-29
---

# Fiscalização de cancelamentos

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Identidade: uxCode `UX-WEB-030`, rota `/ux/web/ait-cancellations`, módulo `fiscalizacao`.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-030); `docs/framework/arch/teat-frontends.md` §5; `docs/framework/arch/teat-web-contract.md` (manifesto de rotas e oráculo).
- Papéis permitidos na rota: `processing-operator`, `traffic-authority`, `agency-admin`.
- Papéis ausentes na rota: `field-agent`, `field-supervisor`, `technical-admin`, AUDITOR, `bi-analyst`, `integration-operator`. A ausência é negativa; não há permissão implícita.
- Guardas: auth → tenant → role → context quando item/id; inf:ait-cancel-request:{read,review,decide}. A permissão de rota não amplia a autorização do comando no backend.
- Homologação e caminho real: regra H/R da matriz R-0029. Em homologação, HTTP remoto é bloqueado e a UI identifica `HOMOLOGAÇÃO — SIMULAÇÃO`. O caminho real é via gateway em `production`, com selo `homologacao` até ADR de release (OD-R29-001=(a), decisão do Owner).

## Contrato transcrito

- Leituras comprovadas:
  - `listAitCancelRequest` — GET `/v1/inf/ait/cancel-requests` (contrato: `BP-INF-AIT-001.openapi.json`)
  - `getAitCancelRequest` — GET `/v1/inf/ait/cancel-requests/{id}` (contrato: `BP-INF-AIT-001.openapi.json`)
  - `listAitCancelRequestEvent` — GET `/v1/inf/ait/cancel-request-events` (contrato: `BP-INF-AIT-001.openapi.json`)
  - `teatAitCancelRequestOutcomes` — GET `/v1/inf/ait/cancel-requests/outcomes/{targetLocalActId}` (contrato: `BP-INF-AIT-001.commands.openapi.json`)
- Comandos comprovados:
  - `teatAitCancelRequestReview` — POST `/v1/inf/ait/cancel-requests/{id}/review` (contrato: `BP-INF-AIT-001.commands.openapi.json`)
  - `teatAitCancelRequestDecide` — POST `/v1/inf/ait/cancel-requests/{id}/decide` (contrato: `BP-INF-AIT-001.commands.openapi.json`)
- Componente, formulário e contrato de estado: `CancelRequestDecision`; web cancelamentos (§8); addressedTo H.39 servidor. Eventos e atualização: sim — source_pending.
- Classificação de acesso: fail-closed-OD — decisor OD-T01/addressedTo de servidor.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-030); `docs/framework/arch/teat-frontends.md` §§5, 6.3 e 8; `docs/framework/contracts/BP-INF-AIT-001.openapi.json`, `docs/framework/contracts/BP-INF-AIT-001.commands.openapi.json`.

## Lacunas e limites

- Lacunas registradas na matriz: sim — lacuna de fonte
- A operação afetada permanece fail-closed até a lacuna da OD correspondente ser resolvida. Valores e decisões não definidos pelas fontes permanecem `source_pending`; não são exibidos como texto de interface nem convertidos em endpoint, permissão, estado ou valor local.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-030) e `docs/framework/arch/teat-build-pack.md` §4 (ODs R-0029; OD-T03, OD-T07 e OD-T08 somente quando citadas pela linha).
