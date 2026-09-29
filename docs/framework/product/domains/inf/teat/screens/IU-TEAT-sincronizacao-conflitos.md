---
id: IU-TEAT-sincronizacao-conflitos
title: Conflitos de sincronização
status: draft
apps: [teat]
updated: 2026-09-29
---

# Conflitos de sincronização

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Identidade: uxCode `UX-WEB-131`, rota `/ux/web/sync-conflicts`, módulo `sync`.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-131); `docs/framework/arch/teat-frontends.md` §5; `docs/framework/arch/teat-web-contract.md` (manifesto de rotas e oráculo).
- Papéis permitidos na rota: `field-supervisor`, `processing-operator`, `technical-admin`.
- Papéis ausentes na rota: `field-agent`, `traffic-authority`, `agency-admin`, AUDITOR, `bi-analyst`, `integration-operator`. A ausência é negativa; não há permissão implícita.
- Guardas: auth → tenant → role → context quando item/id; ops:sync-conflict:{read,resolve}. A permissão de rota não amplia a autorização do comando no backend.
- Homologação e caminho real: regra H/R da matriz R-0029. Em homologação, HTTP remoto é bloqueado e a UI identifica `HOMOLOGAÇÃO — SIMULAÇÃO`. O caminho real é via gateway em `production`, com selo `homologacao` até ADR de release (OD-R29-001=(a), decisão do Owner).

## Contrato transcrito

- Leituras comprovadas:
  - `listSyncConflict` — GET `/v1/ops/offline-sync/sync-conflicts` (contrato: `BP-OPS-OFFLINE-SYNC-001.openapi.json`)
  - `teatSyncConflictList` — GET `/v1/ops/offline-sync/sync-conflicts` (contrato: `BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`)
- Comandos comprovados:
  - `teatSyncConflictResolve` — POST `/v1/ops/offline-sync/sync-conflicts/{id}/resolve` (contrato: `BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`)
- Componente, formulário e contrato de estado: `ConflictQueue`; sync-conflict (§8). Eventos e atualização: sim — sync.conflict.opened.
- Classificação de acesso: ligada — GET/comando do OpenAPI, sob política e estado do servidor.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-131); `docs/framework/arch/teat-frontends.md` §§5, 6.3 e 8; `docs/framework/contracts/BP-OPS-OFFLINE-SYNC-001.openapi.json`, `docs/framework/contracts/BP-OPS-OFFLINE-SYNC-001.commands.openapi.json`.

## Lacunas e limites

- Lacunas registradas na matriz: nenhuma lacuna source_pending nesta linha.
- Valores e decisões não definidos pelas fontes permanecem `source_pending`; não são exibidos como texto de interface nem convertidos em endpoint, permissão, estado ou valor local.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-131) e `docs/framework/arch/teat-build-pack.md` §4 (ODs R-0029; OD-T03, OD-T07 e OD-T08 somente quando citadas pela linha).
