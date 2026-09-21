---
id: IU-TEAT-ait-print
title: AIT — impressão
status: draft
apps: [teat]
updated: 2026-09-21
---

# AIT — impressão

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-001] AC-TEAT-001-6/7; [RN-TEAT-004]; [RN-TEAT-105]; [RN-TEAT-116]; [ARCH-TEAT-FRONTENDS] §6.2.
- Identidade: screenId `ait-print`, uxCode `UX-MOB-033`, grupo `ait-completo`, rota `/ux/mobile/ait-print`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Objetivo: emitir o comprovante do AIT finalizado usando a variante de documento correspondente ao momento da impressão.
- Campos e dados: duas vias, confirmação entre vias, evento de impressão e reimpressão. Na impressão no ato da lavratura, a via impressa exige assinatura manual do agente; na impressão diferida/reimpressão, usa-se sua identificação eletrônica, sem exigir nova assinatura manual.
- Ações/comandos: selecionar impressora no `PrinterDialog`, emitir via 1, confirmar e emitir via 2; reimprimir no mesmo dia sem duplicar o ato. O AIT permanece no equipamento pelo menos até o fim do dia da lavratura, mesmo após a transmissão.
- Validações e estados: o momento registrado pelo `MobilePrinterPort` determina a variante, não uma escolha livre do usuário. Ambas contêm campo de assinatura do infrator e aviso RENAINF do template normativo. Falha registra `failure_reason` sem invalidar o AIT, mantendo reimpressão controlada e o mesmo número.
- Critérios e fonte fechada: AC-TEAT-001-6 exige a assinatura manual na impressão no ato; [RN-TEAT-105] fecha também a identificação eletrônica na impressão diferida/reimpressão. AC-TEAT-001-7 e [RN-TEAT-116] preservam duas vias, reimpressão no dia, ausência de duplicidade e legibilidade do papel por dois anos.

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `home`
4. `ait-start`
5. `measure-start`
6. `crash-start`
7. `sync`
8. `ait-done`
9. `ait-print`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
