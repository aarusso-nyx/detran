---
id: IU-TEAT-fiscalizacao-aits-concorrencia
title: Fiscalização de AITs: análise de concorrência
status: draft
apps: [teat]
updated: 2026-09-29
---

# Fiscalização de AITs: análise de concorrência

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Identidade: uxCode `UX-WEB-029`, rota `/ux/web/ait-concurrency`, módulo `fiscalizacao`.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-029); `docs/framework/arch/teat-frontends.md` §5; `docs/framework/arch/teat-web-contract.md` (manifesto de rotas e oráculo).
- Papéis permitidos na rota: `processing-operator`, `traffic-authority`, `agency-admin`.
- Papéis ausentes na rota: `field-agent`, `field-supervisor`, `technical-admin`, AUDITOR, `bi-analyst`, `integration-operator`. A ausência é negativa; não há permissão implícita.
- Guardas: auth → tenant → role → context quando item/id; inf:ait:review-concurrency. A permissão de rota não amplia a autorização do comando no backend.
- Homologação e caminho real: regra H/R da matriz R-0029. Em homologação, HTTP remoto é bloqueado e a UI identifica `HOMOLOGAÇÃO — SIMULAÇÃO`. O caminho real é via gateway em `production`, com selo `homologacao` até ADR de release (OD-R29-001=(a), decisão do Owner).

## Contrato transcrito

- Leituras comprovadas:
  - `getAit` — GET `/v1/inf/ait/aits/{id}` (contrato: `BP-INF-AIT-001.openapi.json`)
  - `listAit` — GET `/v1/inf/ait/aits` (contrato: `BP-INF-AIT-001.openapi.json`)
- Comandos comprovados:
  - `teatAitReviewConcurrency` — POST `/v1/inf/ait/aits/{id}/concurrency-review` (contrato: `BP-INF-AIT-001.commands.openapi.json`)
- Componente, formulário e contrato de estado: `ConcurrencyReview`; web concorrencia (§8); janela OD-T03 source_pending. Eventos e atualização: sim — ait.concurrency-suspected.
- Classificação de acesso: fail-closed-OD — janela OD-T03 source_pending.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-029); `docs/framework/arch/teat-frontends.md` §§5, 6.3 e 8; `docs/framework/contracts/BP-INF-AIT-001.openapi.json`, `docs/framework/contracts/BP-INF-AIT-001.commands.openapi.json`.

## Lacunas e limites

- Lacunas registradas na matriz: web concorrencia (§8); janela OD-T03 lacuna de fonte
- A operação afetada permanece fail-closed até a lacuna da OD correspondente ser resolvida. Valores e decisões não definidos pelas fontes permanecem `source_pending`; não são exibidos como texto de interface nem convertidos em endpoint, permissão, estado ou valor local.
- Fontes desta seção: `work/rounds/R-0029/route-matrix.md` (linha UX-WEB-029) e `docs/framework/arch/teat-build-pack.md` §4 (ODs R-0029; OD-T03, OD-T07 e OD-T08 somente quando citadas pela linha).
