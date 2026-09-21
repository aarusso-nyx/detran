---
id: IU-TEAT-operation-messages
title: Mensagens operacionais
status: draft
apps: [teat]
updated: 2026-09-21
---

# Mensagens operacionais

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [ARCH-TEAT-FRONTENDS] §§4–5; [IU-TEAT-messages].
- Identidade: screenId `operation-messages`, uxCode `UX-WEB-008`, grupo `operations`, rota `/ux/web/operation-messages`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: consultar a comunicação operacional associada à operação e manter o acesso ao seu contexto e aos turnos participantes.
- Campos e dados: conteúdo do comunicado operacional e sua leitura, correspondentes a `messages` no fluxo móvel. A matriz web vincula esta página ao detalhe da operação e aos turnos; o corpus não especifica assunto, prioridade, destinatários individuais ou comprovante de leitura obrigatório.
- Ações/comandos: consultar o comunicado e retornar ao contexto operacional. As fontes fecham a consulta; não fecham payload ou comando web de redigir, enviar, editar ou excluir mensagens.
- Validações e estados: o comunicado não modifica estado legal de AIT nem substitui declaração formal de incidente. Ausência de comunicados é estado vazio de comunicação, sem afirmar que não há turnos ou atos pendentes.
- Critérios e fonte fechada: [ARCH-TEAT-FRONTENDS] §§4–5 e [IU-TEAT-messages] fecham o vínculo entre comunicação de campo e retaguarda; a matriz define os dois destinos. A lacuna específica é o ciclo editorial/envio, não a existência nem a função desta consulta.

## Navegação autoritativa

1. `operation-detail`
2. `active-shifts`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
