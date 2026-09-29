---
id: IU-TEAT-administracao-campo-equipes
title: Equipes de campo
status: draft
apps: [teat]
updated: 2026-09-29
---

# Equipes de campo

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Identidade: uxCode `UX-WEB-108`, rota `/ux/web/admin-field-teams`, módulo `admin`.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-108); `docs/framework/arch/teat-frontends.md` §5; `docs/framework/arch/teat-web-contract.md` (manifesto de rotas e oráculo).
- Papéis permitidos na rota: `agency-admin`, `technical-admin`.
- Papéis ausentes na rota: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, AUDITOR, `bi-analyst`, `integration-operator`. A ausência é negativa; não há permissão implícita.
- Guardas: auth → tenant → role → context quando item/id; policy key source_pending. A permissão de rota não amplia a autorização do comando no backend.
- Homologação e caminho real: regra H/R da matriz R-0029. Em homologação, HTTP remoto é bloqueado e a UI identifica `HOMOLOGAÇÃO — SIMULAÇÃO`. O caminho real é via gateway em `production`, com selo `homologacao` até ADR de release (OD-R29-001=(a), decisão do Owner).

## Contrato transcrito

- Leituras comprovadas:
  - `listTeam` — GET `/v1/ops/field/teams` (contrato: `BP-OPS-FIELD-001.openapi.json`)
- Comandos comprovados:
  - Nenhum comando de tela comprovado; a tela é somente leitura ou permanece fechada.
- Componente, formulário e contrato de estado: `DeviceGrid`; source_pending. Eventos e atualização: source_pending.
- Classificação de acesso: somente-leitura — GET do OpenAPI; sem comando de tela autorizado.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-108); `docs/framework/arch/teat-frontends.md` §§5 e 6.3; `docs/framework/contracts/BP-OPS-FIELD-001.openapi.json`.

## Lacunas e limites

- Lacunas registradas na matriz: guarda ou chave de política sem fonte fechada; contrato de comando; lacuna de fonte; lacuna de fonte
- Valores e decisões não definidos pelas fontes permanecem `source_pending`; não são exibidos como texto de interface nem convertidos em endpoint, permissão, estado ou valor local.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-108) e `docs/framework/arch/teat-build-pack.md` §4 (ODs R-0029; OD-T03, OD-T07 e OD-T08 somente quando citadas pela linha).
