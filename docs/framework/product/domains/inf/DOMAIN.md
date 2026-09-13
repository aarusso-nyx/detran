---
id: DOMAIN-INF
title: Domínio INF — Infrações (espelha RENAINF)
status: draft
apps: [teat, rait, portal, dashboard]
sources: []
updated: 2026-09-12
---

Ciclo de vida da infração: lavratura do AIT ([WF-TEAT-001]) → autuação e notificação →
indicação de condutor / defesa prévia → penalidade e notificação → recurso à JARI → recurso ao
CETRAN → encerramento da instância (RENACH, cobrança) ou extinção (cancelamento, decadência,
prescrição).

- Máquina de estados canônica da infração: [WF-INF-003] (substitui [WF-INF-001] — decisão do Owner,
  2026-09-12, ADR-0012).
- Modelo de processos (BPMN) e catálogo de timers automáticos: [WF-INF-002].
- Máquina operacional do caso de defesa/recurso: [WF-RAIT-001] (distribuição em [WF-RAIT-002],
  sessão colegiada em [WF-RAIT-003]).
