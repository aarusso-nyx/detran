---
id: IU-TEAT-evidencias-acessos
title: Acessos a evidências
status: draft
apps: [teat]
updated: 2026-09-29
---

# Acessos a evidências

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Identidade: uxCode `UX-WEB-074`, rota `/ux/web/evidence-access`, módulo `evidence`.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-074); `docs/framework/arch/teat-frontends.md` §5; `docs/framework/arch/teat-web-contract.md` (manifesto de rotas e oráculo).
- Papéis permitidos na rota: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`, AUDITOR.
- Papéis ausentes na rota: `technical-admin`, `bi-analyst`, `integration-operator`. A ausência é negativa; não há permissão implícita.
- Guardas: auth → tenant → role → context quando item/id; ops:evidence-access-request:{read,create,approve,deny,deliver}. A permissão de rota não amplia a autorização do comando no backend.
- Homologação e caminho real: regra H/R da matriz R-0029. Em homologação, HTTP remoto é bloqueado e a UI identifica `HOMOLOGAÇÃO — SIMULAÇÃO`. O caminho real é via gateway em `production`, com selo `homologacao` até ADR de release (OD-R29-001=(a), decisão do Owner).

## Contrato transcrito

- Leituras comprovadas:
  - `listEvidenceAccessRequest` — GET `/v1/ops/evidence/evidence-access-requests` (contrato: `BP-OPS-EVIDENCE-001.openapi.json`)
  - `getEvidenceAccessRequest` — GET `/v1/ops/evidence/evidence-access-requests/{id}` (contrato: `BP-OPS-EVIDENCE-001.openapi.json`)
- Comandos comprovados:
  - `teatEvidenceAccessRequestCreate` — POST `/v1/ops/evidence-access-requests` (contrato: `BP-OPS-EVIDENCE-001.commands.openapi.json`)
  - `teatEvidenceAccessRequestApprove` — POST `/v1/ops/evidence-access-requests/{id}/approve` (contrato: `BP-OPS-EVIDENCE-001.commands.openapi.json`)
  - `teatEvidenceAccessRequestDeny` — POST `/v1/ops/evidence-access-requests/{id}/deny` (contrato: `BP-OPS-EVIDENCE-001.commands.openapi.json`)
  - `teatEvidenceAccessRequestDeliver` — POST `/v1/ops/evidence-access-requests/{id}/deliver` (contrato: `BP-OPS-EVIDENCE-001.commands.openapi.json`)
- Componente, formulário e contrato de estado: `EvidenceViewer`; RN-TEAT-142; retenção source_pending. Eventos e atualização: sim — source_pending.
- Classificação de acesso: fail-closed-OD — retenção de bodycam source_pending.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-074); `docs/framework/arch/teat-frontends.md` §§5 e 6.3; `docs/framework/contracts/BP-OPS-EVIDENCE-001.openapi.json`, `docs/framework/contracts/BP-OPS-EVIDENCE-001.commands.openapi.json`.

## Lacunas e limites

- Lacunas registradas na matriz: RN-TEAT-142; retenção lacuna de fonte; sim — lacuna de fonte
- A operação afetada permanece fail-closed até a lacuna da OD correspondente ser resolvida. Valores e decisões não definidos pelas fontes permanecem `source_pending`; não são exibidos como texto de interface nem convertidos em endpoint, permissão, estado ou valor local.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-074) e `docs/framework/arch/teat-build-pack.md` §4 (ODs R-0029; OD-T03, OD-T07 e OD-T08 somente quando citadas pela linha).
