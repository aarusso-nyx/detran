---
id: JRN-RAIT-001
title: Analista instrui uma defesa do início da fila até a decisão de mérito
status: draft
apps: [rait, portal]
sources: [REF-CONTRAN-900, REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-08-24
---

## Persona e contexto

Josiane é analista de 1º circuito no RAIT. Seu turno mistura duas filas: defesas prévias
recém-chegadas ([RN-RAIT-001] triagem de admissibilidade) e casos em diligência aguardando prova.
Ela não decide sozinha o mérito de tudo — a autoridade de trânsito assina a decisão final ([REF-
CONTRAN-918] art.9º) — mas monta o dossiê, aplica a triagem e redige a minuta que a autoridade
revisa. Seu maior medo não é errar uma decisão isolada: é deixar um caso "esquecido" numa fila e
o prazo virar contra o cidadão ou contra o órgão.

## Narrativa ponta-a-ponta

1. **Início do turno — painel, não fila crua.** Josiane abre o console e vê três números antes de
   qualquer lista: casos vencendo em 5 dias, casos em diligência com prazo expirando, casos parados
   há mais de X dias sem toque. A fila em si é secundária a esse resumo — o desenho evita que ela
   precise "adivinhar" o que é urgente rolando uma lista longa.
2. **Claim.** Ela clica em "puxar próximo" (fila por ordem de vencimento, não por ordem de chegada
   — [WF-RAIT-001]); o caso passa a `DISTRIBUIDO(analista)` e some da fila coletiva, evitando dois
   analistas trabalharem o mesmo processo.
3. **Triagem de admissibilidade.** Tela estruturada com os quatro critérios de [RN-RAIT-001] como
   checklist (tempestividade calculada automaticamente pelo motor de prazos [RN-RAIT-005];
   legitimidade, assinatura, pedido compatível — julgamento humano). Se algo pré-validado pelo
   PORTAL já veio marcado (ex.: campos obrigatórios do [RN-RAIT-002] preenchidos), ela não
   re-digita — só confirma.
4. **Instrução.** Ela lê fatos e anexos. Se falta prova que só o próprio órgão tem (foto do
   equipamento, laudo), o sistema já a anexou de ofício ao dossiê ([RN-RAIT-003]) — Josiane nunca
   precisa pedir ao cidadão o que o DETRAN-AM já possui. Se falta prova que só o cidadão pode trazer,
   ela abre diligência com prazo ([RN-RAIT-004]); o caso sai da sua mesa e entra em espera com timer
   visível — ela é notificada quando o prazo vence ou quando o cidadão responde, o que vier primeiro.
5. **Interrupção — diligência de outro caso responde.** No meio da leitura de um processo novo, uma
   notificação lateral avisa que um caso em diligência recebeu resposta. O desenho não força
   contexto-switch imediato — a notificação empilha numa bandeja "prontos para retomar", e Josiane
   decide quando voltar a ele, sem perder o estado do caso que estava lendo.
6. **Minuta e decisão.** Josiane redige a minuta de parecer (acolher/indeferir, com fundamento).
   Ela mesma não assina — a tela deixa isso explícito ("aguardando assinatura da autoridade"),
   evitando a ambiguidade de quem decidiu o quê.
7. **Fim do circuito.** Autoridade assina; sistema dispara [WF-RAIT-001]: acolhida → AIT cancelado,
   caso encerra; indeferida → NP expedida, prazo de recurso começa a contar ([REF-CONTRAN-918]
   arts.9º, 12) — o cidadão vê isso no PORTAL no mesmo dia.

## Pontos de contato (apps/canais)

RAIT (console web — fila, triagem, diligência, minuta). PORTAL (origem do requerimento e destino da
comunicação de resultado). DASHBOARD (indicadores de fila que alimentam o painel do turno).

## Métricas de sucesso

Zero casos vencendo sem toque humano prévio (alerta disparado com folga); tempo médio entre claim e
minuta; % de diligências resolvidas sem repetir pedido de documento que o órgão já possuía; retomada
de caso interrompido sem perda de contexto (medido por reabertura sem re-leitura completa).
