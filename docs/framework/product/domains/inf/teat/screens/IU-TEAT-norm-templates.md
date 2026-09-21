---
id: IU-TEAT-norm-templates
title: Templates
status: draft
apps: [teat]
updated: 2026-09-21
---

# Templates

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [WF-TEAT-003]; [ARCH-TEAT-BUILD-PACK] WP-T1; [RN-TEAT-105]; [RN-TEAT-109]; [RN-TEAT-116]; [RN-TEAT-126].
- Identidade: screenId `norm-templates`, uxCode `UX-WEB-113`, grupo `normative`, rota `/ux/web/norm-templates`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `traffic-authority`, `agency-admin`, `technical-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: consultar os modelos documentais versionados que compõem os comprovantes de AIT e termos de medida.
- Campos e dados: template vinculado ao catálogo, `document_kind` e `signature_policy`. No AIT, variantes de impressão no ato e diferida/reimpressão, campo de assinatura do infrator e aviso RENAINF; no termo de remoção, sete elementos do caput, quatro do §1º e os dois prazos de retirada do contrato.
- Ações/comandos: consultar o modelo e seguir para pacote mobile, espelho de AIT ou detalhe de medida. O uso do template conserva sua versão normativa; a leitura não altera documentos de atos já emitidos.
- Validações e estados: assinatura manual do agente é exigida apenas na impressão no ato; a diferida usa identificação eletrônica. Todas as vias preservam a caracterização integral da infração. Template de termo mantém ciência/recusa/impossibilidade e não confunde recusa com ausência da pessoa.
- Critérios e fonte fechada: [RN-TEAT-105]/[RN-TEAT-116] fecham as variantes do AIT; [RN-TEAT-109] impede segunda via resumida; [RN-TEAT-126] e [WF-TEAT-004] fecham o termo e seus dois prazos. [WF-TEAT-003] integra os templates ao catálogo; a fonte não especifica editor gráfico nem publicação independente de template.

## Navegação autoritativa

1. `norm-mobile-packages`
2. `ait-mirror`
3. `measure-detail`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
