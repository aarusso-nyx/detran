---
id: RN-RAIT-004
title: Diligência com prazo; julgamento no estado se não atendida
status: draft
apps: [rait, portal]
sources: [REF-CONTRAN-900]
updated: 2026-08-24
---

**Regra.** Instâncias podem solicitar documentos/provas fixando prazo; não atendida a solicitação,
julga-se no estado em que se encontra. O requerente pode desistir por escrito até o julgamento.
**Base legal.** [REF-CONTRAN-900] arts. 9º e 11.
**Verificação.** Estado DILIGENCIA no [WF-RAIT-001] com timer; expiração NÃO arquiva — devolve à fila
de julgamento; ação de desistência disponível no PORTAL até a sessão/decisão.
