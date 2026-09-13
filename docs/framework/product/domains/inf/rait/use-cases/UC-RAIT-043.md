---
id: UC-RAIT-043
title: Administrador do órgão parametriza pools, estratégias, timers operacionais, calendário e escada de alertas
status: draft
apps: [rait]
sources: [REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-09-12
---

## Ator e objetivo

Administrador do órgão (`agency-admin`) mantém os parâmetros que os workflows declaram como calibração do Owner, versionados e auditáveis, sem tocar nos prazos legais, que são fixos no motor.

## Pré-condições

- Perfil `agency-admin`; decisão do Owner ou do gestor para cada parâmetro (steering §A; [WF-RAIT-004] §Decisões pendentes).

## Fluxo principal

1. Administrador edita: pools e estratégia por pool (`pull`, `round_robin`, `load_balanced`); limiares da escada de alertas por relógio; timers operacionais (`T-DIL` default, `T-VOTO`, `T-CONV`, `T-CLAIM`, `T-ASS`, `T-TRI`, `T-REG`), limite de casos simultâneos; cadência e tamanho do lote; amostra de qualidade; regra de jeton; calendário de feriados nacional + AM; unidades/turmas e circunscrições.
2. Cada alteração exige motivo e referência à decisão; entra em vigor em data programada; versões anteriores ficam consultáveis.
3. Prazos legais (`T-NA`, `T-DEF`, `T-DEC`, `T-NP-VENC`, `T-REM10`, `T-JUL-24M`, `T-R2`, `T-PAR-3A`) não são editáveis; só o LEGAL pode alterar a base legal com nova versão do motor.
4. Simulação: o sistema mostra o impacto de um novo limiar/limite sobre a fila atual antes de aplicar.

## Fluxos alternativos / exceções

- **1a.** Parâmetro sem fonte (jeton, escala de assinatura, limiar de retenção): pode ser cadastrado como "pendente de fonte" e o sistema o sinaliza em toda tela que o usa.
- **3a.** Tentativa de suspender ou alongar prazo legal por parâmetro: recusada ([RN-RAIT-105]).

## Pós-condições

Parâmetros versionados e vigentes; prazos legais intocados; impacto simulado antes de aplicar.

## Critérios de aceitação

**AC-RAIT-043-1 — prazo legal não é parâmetro**

- **Dado** um administrador
- **Quando** tenta editar `T-JUL-24M`
- **Então** o campo é somente leitura com a base legal exibida

**AC-RAIT-043-2 — toda mudança tem motivo e data**

- **Dado** um novo limite de casos simultâneos
- **Quando** é salvo
- **Então** fica com motivo, decisão de referência, vigência e autor

**AC-RAIT-043-3 — o calendário combina duas fontes**

- **Dado** um feriado estadual do AM
- **Quando** um vencimento cai nele
- **Então** o vencimento prorroga ao 1º dia útil ([RN-RAIT-005])

## Regras aplicáveis

- [RN-RAIT-005] (contagem e calendário)
- [RN-RAIT-105] (prazos não se suspendem)
- [RN-RAIT-141] (critérios publicados)
