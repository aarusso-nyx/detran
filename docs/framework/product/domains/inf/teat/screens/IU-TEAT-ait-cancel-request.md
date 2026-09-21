---
id: IU-TEAT-ait-cancel-request
title: Solicitação de cancelamento pós-finalização
status: draft
apps: [teat]
updated: 2026-09-21
---

# Solicitação de cancelamento pós-finalização

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [UC-TEAT-011], [WF-TEAT-001].
- Identidade: screenId `ait-cancel-request`, uxCode `D-04`, grupo `ait-completo`, rota `/ait-cancel-request`.
- Papéis permitidos: `field-agent`, `field-supervisor`.
- Dados vêm do backend unificado; qualquer consulta nacional passa somente por packages/senatran-adapter.

## Objetivo e contrato de tela

- Objetivo: Submeter pedido formal de cancelamento pós-finalização, distinto do cancelamento de rascunho.
- Campos e dados: AIT alvo, motivo, corpo do pedido e destinatário decisor.
- Ações/comandos: Submeter pedido formal; a decisão ocorre no fluxo web da Diretoria de Fiscalização.
- Validação e estados: Não cancelar o rascunho por esta tela; destinatário e estado obedecem ao catálogo de erros.
- Critério de aceite: AC-TEAT-011-3.

## Navegação autoritativa

source_pending — a fonte de delta não fornece destinos; nenhum destino foi inferido.

A sequência é integral e ordenada: alvos repetidos permanecem repetidos para preservar as transições da matriz.

## Readiness, offline e ergonomia

- Turno, sessão e postura válidos.
- H.55: homologação SENATRAN caducada é **aviso e registro**, não bloqueio; a fonte não fixa outro mecanismo de continuidade.
- Falta de rede não bloqueia o fluxo de campo: a ação local entra na fila e a recuperação aparece em sync, conforme [RN-TEAT-001].
- Uma mão, sol direto, luvas e operação de campo; erro e vazio usam componentes do kit sem redefinir regra de negócio.
- Estado da funcionalidade: Disponível.
