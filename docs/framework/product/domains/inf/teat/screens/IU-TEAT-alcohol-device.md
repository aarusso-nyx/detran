---
id: IU-TEAT-alcohol-device
title: Etilômetro
status: draft
apps: [teat]
updated: 2026-09-21
---

# Etilômetro

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-007], [WF-TEAT-005], [RN-TEAT-132]…[RN-TEAT-137].
- Identidade: screenId `alcohol-device`, uxCode `UX-MOB-051`, grupo `alcoolemia`, rota `/ux/mobile/alcohol-device`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: etilômetro selecionado, série e número de teste.
- Ações/comandos: selecionar instrumento e registrar teste.
- Validações e estados: etilômetro deve estar verificado e no catálogo.
- Critérios e fonte fechada: TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED.

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `home`
4. `ait-start`
5. `measure-start`
6. `crash-start`
7. `sync`
8. `alcohol-result`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
