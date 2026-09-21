---
id: IU-TEAT-ait-speed-measurement
title: Operação de medição de velocidade (vínculo do medidor + resultado)
status: draft
apps: [teat]
updated: 2026-09-21
---

# Operação de medição de velocidade (vínculo do medidor + resultado)

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-013], [RN-TEAT-138], [IU-TEAT-001] §A.
- Identidade: screenId `ait-speed-measurement`, uxCode `D-05`, grupo `ait-completo`, rota `/ait-speed-measurement`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Objetivo e contrato de tela

- Objetivo: Vincular medidor acoplado à sessão e apresentar a cadeia metrológica com medida e considerada lado a lado.
- Campos e dados: medidor identificado, cadeia metrológica, medição realizada e valor considerado.
- Ações/comandos: Vincular resultado ao AIT somente quando a flag permitir a funcionalidade.
- Validação e estados: Medidor, dispositivo e aplicativo homologados; par medido/considerado é obrigatório.
- Critério de aceite: AC-TEAT-013; requisito de par de valores de [RN-TEAT-138].

## Navegação autoritativa

source_pending — a fonte de delta não fornece destinos; nenhum destino foi inferido.

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Postura, sessão exclusiva e cadeia metrológica vigente.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
- Estado da funcionalidade: Rota registrada e feature-disabled (teat.speed_meters).
