---
id: WF-INF-001
title: Ciclo de vida da infração — SUBSTITUÍDO por WF-INF-003 (mantido como ponteiro histórico)
status: draft
superseded_by: WF-INF-003
apps: [teat, rait, portal, dashboard]
sources: [REF-CONTRAN-918, REF-CONTRAN-900, REF-DETRANAM-TALAO-BODYCAM]
updated: 2026-09-12
---

## Substituição

**Decisão do Owner (2026-09-12):** a máquina de estados do ciclo de vida da infração é
[WF-INF-003]. Este artefato deixa de ser autoridade sobre estados, transições e prazos da infração
e permanece no corpus apenas como ponteiro, para que as referências históricas a `[WF-INF-001]`
continuem resolvendo. O modelo de processos (BPMN) que derivou a nova máquina está em [WF-INF-002].

Nenhum documento pode voltar a citar os estados antigos como vocabulário vigente. A tabela de
equivalência entre o vocabulário deste artefato e o de [WF-INF-003] está em [WF-INF-003] §7; os
timers T1…T5 correspondem a `T-NA`, `T-DEF`, `T-DEC`, `T-NP-VENC` e `T-R2` ([WF-INF-002] §9.2).

O conteúdo anterior (diagrama de estados, tabela de prazos T1…T5, decisões de modelagem) está
preservado no histórico do repositório até este commit.

## Decisões

- **2026-09-12** — Owner: [WF-INF-003] substitui este artefato. Registro em ADR-0014
  (`docs/meta/adr/`).
