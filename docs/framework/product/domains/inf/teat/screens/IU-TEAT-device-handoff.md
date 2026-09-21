---
id: IU-TEAT-device-handoff
title: Declarar falha de dispositivo / handoff de sessão
status: draft
apps: [teat]
updated: 2026-09-21
---

# Declarar falha de dispositivo / handoff de sessão

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [JRN-TEAT-006], [UC-TEAT-012], [RN-TEAT-111].
- Identidade: screenId `device-handoff`, uxCode `D-01`, grupo `autenticacao-e-turno`, rota `/device-handoff`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Objetivo e contrato de tela

- Objetivo: Distinguir handoff autorizado de sessão concorrente; o dispositivo reserva exige nova reserva de numeração.
- Campos e dados: declaração de falha, dispositivo de origem, dispositivo de destino e motivo; a janela de “mesmo intervalo” permanece source_pending.
- Ações/comandos: Registrar o handoff; encerrar a sessão anterior somente pelo fluxo autorizado.
- Validação e estados: Sessão concorrente é bloqueada e encaminhada à apuração; não fixar janela numérica sem fonte.
- Critério de aceite: AC-TEAT-012-4 e AC-TEAT-012-5.

## Navegação autoritativa

source_pending — a fonte de delta não fornece destinos; nenhum destino foi inferido.

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Dispositivo destino homologado, sessão exclusiva e nova reserva ativa.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
- Estado da funcionalidade: Disponível.
