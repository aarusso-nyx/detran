---
id: IU-TEAT-alcohol-refusal
title: Recusa
status: draft
apps: [teat]
updated: 2026-09-21
---

# Recusa

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-007], [WF-TEAT-005], [RN-TEAT-132]…[RN-TEAT-137].
- Identidade: screenId `alcohol-refusal`, uxCode `UX-MOB-053`, grupo `alcoolemia`, rota `/ux/mobile/alcohol-refusal`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Campos e dados: recusa ao teste e impossibilidade técnica em controles distintos.
- Ações/comandos: registrar ramo aplicável e seguir ao termo/AIT.
- Validações e estados: recusa gera 165-A; impossibilidade técnica não gera; o tipo é obrigatório.
- Critérios e fonte fechada: [RN-TEAT-134], AC-TEAT-007-4/5.

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `home`
4. `ait-start`
5. `measure-start`
6. `crash-start`
7. `sync`
8. `alcohol-term`
9. `ait-start`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
