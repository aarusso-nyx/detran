---
id: IU-PEC-C-01
title: Agenda do dia e fila de atendimento
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Agenda do dia e fila de atendimento

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fonte fechada: [IU-PEC-001], [WF-PEC-003] e [RN-PEC-113].
- Rota proposta: `/clinico/agenda`; ator do inventário: Recepção.
- Dados e comandos publicados: agenda por `GET /v1/ch/appointments`; criação, redistribuição e ausência pelos comandos publicados para agendamentos.
- A distribuição permanece no servidor. A tela não oferece escolha de clínica ou perito.

## Contrato transcrito

- A tela apresenta a agenda e a fila autorizadas ao tenant; não calcula ordem, prazo ou estado no navegador.
- Região e data seguem ao servidor quando aplicáveis. A forma final da jornada do candidato pertence a P-01 em R-0032.
- Atualização usa o polling do padrão, sem stream novo, até decisão de OD-PW-003. Frequência e tratamento de erro seguem `source_pending` até a retomada de frontend.

## Estados e proteção

- Dados do núcleo são sensíveis; dados clínicos não entram em URL, cache persistente, log ou notificação.
- Vazio, erro e carregamento preservam a resposta do backend e usam componentes do kit.
