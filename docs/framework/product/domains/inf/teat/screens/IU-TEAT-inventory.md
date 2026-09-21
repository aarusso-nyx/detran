---
id: IU-TEAT-inventory
title: Inventário
status: draft
apps: [teat]
updated: 2026-09-21
---

# Inventário

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-008], [UC-TEAT-009], [WF-TEAT-004], [RN-TEAT-124]…[RN-TEAT-128].
- Identidade: screenId `inventory`, uxCode `UX-MOB-043`, grupo `medidas-administrativas`, rota `/ux/mobile/inventory`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: quatro campos do art. 14 §1º e itens do veículo.
- Ações/comandos: registrar inventário.
- Validações e estados: campos estruturados antecedem a custódia.
- Critérios e fonte fechada: [RN-TEAT-126], AC-TEAT-009-2.

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `home`
4. `ait-start`
5. `measure-start`
6. `crash-start`
7. `sync`
8. `measure-term`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
