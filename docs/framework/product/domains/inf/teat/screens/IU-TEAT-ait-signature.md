---
id: IU-TEAT-ait-signature
title: AIT — assinatura/ciência
status: draft
apps: [teat]
updated: 2026-09-21
---

# AIT — assinatura/ciência

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-001]…[UC-TEAT-004], [WF-TEAT-001], [RN-TEAT-004].
- Identidade: screenId `ait-signature`, uxCode `UX-MOB-030`, grupo `ait-completo`, rota `/ux/mobile/ait-signature`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Contrato transcrito

- Objetivo: Coletar ciência do condutor antes da revisão, sem tratar assinatura como concordância de mérito.
- Campos e dados: resultado exclusivo (assinado, recusado ou impossibilitado), motivo obrigatório para recusa/impossibilidade, assinatura digital, evidência, data/hora, local e testemunha quando aplicável.
- Ações/comandos: Registrar assinatura, recusa ou impossibilidade; anexar testemunha opcional; avançar para revisão.
- Validação e estados: Os três resultados não partilham booleano; recusa exige motivo; testemunha é adicional e permanece source_pending no runtime oficial; nenhum ramo bloqueia finalização.
- Critério de aceite: AC-TEAT-004-1, AC-TEAT-004-2, AC-TEAT-004-3, AC-TEAT-004-4 e AC-TEAT-004-5; [RN-TEAT-005].

## Navegação autoritativa

1. `__previous__`
2. `context-help`
3. `home`
4. `ait-start`
5. `measure-start`
6. `crash-start`
7. `sync`
8. `ait-review`

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Readiness aplica bootstrap, sessão exclusiva, dispositivo homologado, pacote normativo e reserva quando o destino cria ato legal.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
