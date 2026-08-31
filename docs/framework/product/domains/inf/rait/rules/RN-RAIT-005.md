---
id: RN-RAIT-005
title: Contagem de prazos em dias consecutivos com prorrogação para dia útil
status: approved
apps: [rait, portal]
sources: [REF-CONTRAN-918]
updated: 2026-08-26
---

**Regra.** Prazos contam-se em dias consecutivos, excluído o dia da notificação/edital e incluído o do
vencimento; caindo em feriado/fim de semana/dia sem expediente (ou expediente encerrado antes da hora
normal), prorroga-se ao 1º dia útil.
**Base legal.** [REF-CONTRAN-918] art. 29.
**Verificação.** Motor de prazos único (porta de calendário de feriados injetável) usado por
PORTAL (exibição) e RAIT (SLA).

**Decisão.** Owner, em steering (`_meta/steering.md` A.6, 2026-08-24): fonte do calendário
combina feriados **nacionais + estaduais (AM)**.
