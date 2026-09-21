---
id: IU-TEAT-ait-detail
title: Detalhe do AIT
status: draft
apps: [teat]
updated: 2026-09-21
---

# Detalhe do AIT

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [ARCH-TEAT-FRONTENDS] §6.3; [RN-TEAT-004]; [UC-TEAT-006]; [UC-TEAT-011].
- Identidade: screenId `ait-detail`, uxCode `UX-WEB-024`, grupo `ait`, rota `/ux/web/ait-detail`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `processing-operator`, `traffic-authority`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: permitir a análise de um AIT individual, reunindo o ato congelado e os registros posteriores que explicam seu processamento.
- Campos e dados: cabeçalho com identificação/estado do AIT e abas de dados, veículo, condutor, evidências, histórico, correções, impressões e integração (`AitDetail`). Número, autor, local/data/hora, snapshot, enquadramento, versão normativa e `content_hash` permanecem associados ao conteúdo original.
- Ações/comandos: consultar as abas, abrir evidência, linha do tempo ou formulário de saneamento. O acesso ao detalhe não habilita edição direta do auto finalizado; retificações e decisões são registros apensos nos procedimentos próprios.
- Validações e estados: correção aprovada conserva valor anterior/novo, justificativa e responsáveis; decisão pós-finalização conserva o ato original. Acesso a bodycam limita-se a metadados salvo requisição aprovada; TEAT.AIT_IMMUTABLE rejeita reescrita do conteúdo congelado.
- Critérios e fonte fechada: [ARCH-TEAT-FRONTENDS] §6.3 define as oito abas; [RN-TEAT-004], AC-TEAT-006-6 e AC-TEAT-011-1 exigem coexistência do original e dos apensos. [RN-TEAT-142] limita o conteúdo audiovisual mesmo nesta visão consolidada.

## Navegação autoritativa

1. `evidence-viewer`
2. `ait-timeline`
3. `ait-sanitize`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
