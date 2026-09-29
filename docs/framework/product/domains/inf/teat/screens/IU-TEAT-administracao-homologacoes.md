---
id: IU-TEAT-administracao-homologacoes
title: Homologações da administração
status: draft
apps: [teat]
updated: 2026-09-29
---

# Homologações da administração

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Identidade: uxCode `UX-WEB-106`, rota `/ux/web/admin-homologations`, módulo `admin`.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-106); `docs/framework/arch/teat-frontends.md` §5; `docs/framework/arch/teat-web-contract.md` (manifesto de rotas e oráculo).
- Papéis permitidos na rota: `agency-admin`, `technical-admin`.
- Papéis ausentes na rota: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, AUDITOR, `bi-analyst`, `integration-operator`. A ausência é negativa; não há permissão implícita.
- Guardas: auth → tenant → role → context quando item/id; ops:homologation:{read,renew,cancel-by-audit}. A permissão de rota não amplia a autorização do comando no backend.
- Homologação e caminho real: regra H/R da matriz R-0029. Em homologação, HTTP remoto é bloqueado e a UI identifica `HOMOLOGAÇÃO — SIMULAÇÃO`. O caminho real é via gateway em `production`, com selo `homologacao` até ADR de release (OD-R29-001=(a), decisão do Owner).

## Contrato transcrito

- Leituras comprovadas:
  - `teatHomologationList` — GET `/v1/ops/field/homologations` (contrato: `BP-OPS-FIELD-001.commands.openapi.json`)
- Comandos comprovados:
  - `teatHomologationRenew` — POST `/v1/ops/field/homologations/{id}/renew` (contrato: `BP-OPS-FIELD-001.commands.openapi.json`)
  - `teatHomologationCancelByAudit` — POST `/v1/ops/field/homologations/{id}/cancel-by-audit` (contrato: `BP-OPS-FIELD-001.commands.openapi.json`)
- Componente, formulário e contrato de estado: `HomologationForm`; web homologação (§8); valores do servidor. Eventos e atualização: source_pending.
- Classificação de acesso: ligada — GET/comando do OpenAPI, sob política e estado do servidor.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-106); `docs/framework/arch/teat-frontends.md` §§5, 6.3 e 8; `docs/framework/contracts/BP-OPS-FIELD-001.commands.openapi.json`.

## Lacunas e limites

- Lacunas registradas na matriz: lacuna de fonte
- Valores e decisões não definidos pelas fontes permanecem `source_pending`; não são exibidos como texto de interface nem convertidos em endpoint, permissão, estado ou valor local.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-106) e `docs/framework/arch/teat-build-pack.md` §4 (ODs R-0029; OD-T03, OD-T07 e OD-T08 somente quando citadas pela linha).
