---
id: IU-TEAT-evidence-search
title: Consulta de evidências
status: draft
apps: [teat]
updated: 2026-09-21
---

# Consulta de evidências

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [UC-TEAT-003]; [RN-TEAT-002]; [RN-TEAT-142]; [ARCH-TEAT-FRONTENDS] §6.3.
- Identidade: screenId `evidence-search`, uxCode `UX-WEB-070`, grupo `evidence`, rota `/ux/web/evidence-search`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `field-agent`, `field-supervisor`, `processing-operator`, `traffic-authority`, `auditor`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: localizar evidências vinculadas a atos legais e acessar sua visualização, custódia ou composição probatória autorizada.
- Campos e dados: metadados de `Evidence` — tipo, `hash_algorithm`, `hash_value`, autoria, agente/dispositivo, momento/local da captura e estado — e vínculo `EvidenceLink` com `entity_type`, `entity_id`, `role` e obrigatoriedade. O vínculo permite reconhecer o ato ao qual a mídia pertence.
- Ações/comandos: consultar os registros, selecionar evidência e abrir visualizador, cadeia de custódia ou pacote probatório. A pesquisa não altera hash, vínculo ou eventos de custódia.
- Validações e estados: evidência com hash divergente permanece inválida/em quarentena; pendência de upload não é omitida. Para bodycam, a consulta ordinária exibe somente metadados; conteúdo exige requisição aprovada, inclusive para auditor.
- Critérios e fonte fechada: AC-TEAT-003-2/3/4/5 exige vínculo, custódia, quarentena e preservação do original; [RN-TEAT-142] restringe conteúdo. As fontes não fecham sintaxe de busca textual nem lista obrigatória de filtros adicionais.

## Navegação autoritativa

1. `evidence-viewer`
2. `custody-chain`
3. `probative-package`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
