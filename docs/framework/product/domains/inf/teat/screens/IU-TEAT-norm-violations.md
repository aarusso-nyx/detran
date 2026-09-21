---
id: IU-TEAT-norm-violations
title: Enquadramentos
status: draft
apps: [teat]
updated: 2026-09-21
---

# Enquadramentos

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [WF-TEAT-003]; [RN-TEAT-101]; [RN-TEAT-108]; [RN-TEAT-109]; [ARCH-TEAT-FRONTENDS] §§5,6.2,8.
- Identidade: screenId `norm-violations`, uxCode `UX-WEB-111`, grupo `normative`, rota `/ux/web/norm-violations`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `traffic-authority`, `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: consultar os enquadramentos versionados que determinam as exigências de lavratura e de validação do AIT.
- Campos e dados: código/artigo do enquadramento, catálogo/pacote, `approach_class`, `required_fields`, exigência de observação, instrumento e medidas aplicáveis. Busca por código/artigo e requisitos vêm do conteúdo normativo, não de texto livre criado pelo operador.
- Ações/comandos: consultar enquadramento e seguir para regras, catálogo ou validação dos autos. A página de leitura não muda exigências do MBFT nem publica alterações isoladas fora do catálogo.
- Validações e estados: Caso 1 permite constatação sem abordagem sem justificar; Caso 2 exige abordagem; Caso 3 exige justificativa quando não há abordagem. Campos mínimos do art. 280 são piso, somado aos requisitos específicos; observação é obrigatória somente quando a ficha exigir.
- Critérios e fonte fechada: [RN-TEAT-108] fecha as três classes e prevalece na sua interpretação; AC-TEAT-002-1/2 e [RN-TEAT-101]/[RN-TEAT-109] fecham as exigências. [WF-TEAT-003] preserva a versão aplicável ao ato; a ficha não infere novas infrações a partir de descrições livres.

## Navegação autoritativa

1. `norm-rules`
2. `norm-catalogs`
3. `ait-validation`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
