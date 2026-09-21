---
id: IU-TEAT-audit-events
title: Eventos de auditoria
status: draft
apps: [teat]
updated: 2026-09-21
---

# Eventos de auditoria

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [RN-TEAT-112]; [RN-TEAT-002]; [ARCH-TEAT-FRONTENDS] §§3,5.
- Identidade: screenId `audit-events`, uxCode `UX-WEB-080`, grupo `audit`, rota `/ux/web/audit-events`; implementação `implemented` / `official-angular-shell`.
- Papéis permitidos: `auditor`, `traffic-authority`, `technical-admin`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: consultar a trilha das operações de autuação para identificar quem praticou cada ação e sobre qual ato.
- Campos e dados: evento/operação com data e hora, agente de trânsito, veículo, local e número do aparelho utilizado; referência ao ato permite seguir sua história. Eventos de custódia associados conservam autoria e vínculo, sem substituir a trilha geral de operações.
- Ações/comandos: consultar eventos e abrir a linha do tempo de um AIT, a de um agente ou a visão de anomalias. O papel de auditor tem acesso de leitura; consultar um evento não o retifica.
- Validações e estados: número do aparelho pertence a cada registro, não apenas ao cadastro atual do dispositivo. Eventos de custódia são somente apensáveis e o conteúdo legal congelado continua íntegro; metadados de bodycam não concedem acesso à gravação.
- Critérios e fonte fechada: [RN-TEAT-112] item 4 fecha o conjunto mínimo auditável; [RN-TEAT-002] impede editar/remover custódia e [RN-TEAT-142] limita bodycam. A fonte não especifica formato de exportação ou novo comando de alteração de eventos.

## Navegação autoritativa

1. `ait-timeline`
2. `agent-timeline`
3. `anomalies`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
