---
id: IU-TEAT-alcohol-links
title: AIT/medidas vinculadas
status: draft
apps: [teat]
updated: 2026-09-21
---

# AIT/medidas vinculadas

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-007], [WF-TEAT-005], [RN-TEAT-132]…[RN-TEAT-137].
- Identidade: screenId `alcohol-links`, uxCode `UX-MOB-056`, grupo `alcoolemia`, rota `/ux/mobile/alcohol-links`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: AIT e medidas vinculados ao procedimento.
- Ações/comandos: vincular AIT, retenção ou termo.
- Validações e estados: vínculo respeita o estado do AIT e da medida.
- Critérios e fonte fechada: [UC-TEAT-007].

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `home`
4. `ait-start`
5. `measure-start`
6. `crash-start`
7. `sync`
8. `ait-start`
9. `retention`
10. `alcohol-term`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
