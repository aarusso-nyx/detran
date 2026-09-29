---
id: IU-TEAT-sincronizacao-numeracao
title: Numeração da sincronização
status: draft
apps: [teat]
updated: 2026-09-29
---

# Numeração da sincronização

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Identidade: uxCode `UX-WEB-132`, rota `/ux/web/sync-numbering`, módulo `sync`.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-132); `docs/framework/arch/teat-frontends.md` §5; `docs/framework/arch/teat-web-contract.md` (manifesto de rotas e oráculo).
- Papéis permitidos na rota: `field-supervisor`, `processing-operator`, `technical-admin`.
- Papéis ausentes na rota: `field-agent`, `traffic-authority`, `agency-admin`, AUDITOR, `bi-analyst`, `integration-operator`. A ausência é negativa; não há permissão implícita.
- Guardas: auth → tenant → role → context quando item/id; ops:numbering-reservation:{read,reserve,cancel,block,close,reconcile}. A permissão de rota não amplia a autorização do comando no backend.
- Homologação e caminho real: regra H/R da matriz R-0029. Em homologação, HTTP remoto é bloqueado e a UI identifica `HOMOLOGAÇÃO — SIMULAÇÃO`. O caminho real é via gateway em `production`, com selo `homologacao` até ADR de release (OD-R29-001=(a), decisão do Owner).

## Contrato transcrito

- Leituras comprovadas:
  - `listAitNumberingRange` — GET `/v1/ops/offline-sync/numbering-ranges` (contrato: `BP-OPS-OFFLINE-SYNC-001.openapi.json`)
  - `listNumberingReservation` — GET `/v1/ops/offline-sync/numbering-reservations` (contrato: `BP-OPS-OFFLINE-SYNC-001.openapi.json`)
  - `teatNumberingReservationConsumption` — GET `/v1/ops/offline-sync/numbering-reservations/{id}/consumption` (contrato: `BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`)
- Comandos comprovados:
  - `teatNumberingReservationReserve` — POST `/v1/ops/offline-sync/numbering-reservations/reserve` (contrato: `BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`)
  - `teatNumberingReservationCancel` — POST `/v1/ops/offline-sync/numbering-reservations/{id}/cancel` (contrato: `BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`)
  - `teatNumberingReservationBlock` — POST `/v1/ops/offline-sync/numbering-reservations/{id}/block` (contrato: `BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`)
  - `teatNumberingReservationClose` — POST `/v1/ops/offline-sync/numbering-reservations/{id}/close` (contrato: `BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`)
  - `teatNumberingReservationReconcile` — POST `/v1/ops/offline-sync/numbering-reservations/{id}/reconcile` (contrato: `BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`)
- Componente, formulário e contrato de estado: `NumberingRangeGrid`; H.54/OD-T07; reserva expirada source_pending. Eventos e atualização: sim — source_pending.
- Classificação de acesso: fail-closed-OD — reserva expirada OD-T07 source_pending.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-132); `docs/framework/arch/teat-frontends.md` §§5 e 6.3; `docs/framework/contracts/BP-OPS-OFFLINE-SYNC-001.openapi.json`, `docs/framework/contracts/BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`.

## Lacunas e limites

- Lacunas registradas na matriz: H.54/OD-T07; reserva expirada lacuna de fonte; sim — lacuna de fonte
- A operação afetada permanece fail-closed até a lacuna da OD correspondente ser resolvida. Valores e decisões não definidos pelas fontes permanecem `source_pending`; não são exibidos como texto de interface nem convertidos em endpoint, permissão, estado ou valor local.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-132) e `docs/framework/arch/teat-build-pack.md` §4 (ODs R-0029; OD-T03, OD-T07 e OD-T08 somente quando citadas pela linha).
