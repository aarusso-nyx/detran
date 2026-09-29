# TEAT web: substituir páginas genéricas pelo console de fiscalização

## Escopo

Entregar o console TEAT web sobre o backend unificado, com uma página de produto por rota da matriz R-0029, guards de autenticação, tenant, papel e contexto, clientes baseados nos OpenAPI do repositório e componentes do padrão STYNX. Remover a página genérica que imprime JSON. Manter o modo padrão de homologação com dados sintéticos e HTTP remoto bloqueado. O caminho de produção será configurado via gateway conforme OD-R29-001=(a), decisão do Owner; o selo permanece `homologacao` até ADR de release.

Inclui concorrência e cancelamentos de AIT, acessos a evidência, sincronização (filas, conflitos, numeração e recibos), homologações, versões e cadastros de campo, tabelas metrológicas, administração, operações, auditoria, BI e `/conta`, conforme a matriz. `features/sinistros/` pertence ao CTG-0004 de R-0028 e permanece intocado. Nenhuma tela BOAT nova é criada.

## Dependências e sequência

- R-0024: integrar o padrão de ligação frontend e os clientes gerados já mesclados.
- R-0028: empilhar CTG-0002+ depois de o CTG-0004 web BOAT estar publicado; integrar sem alterar `features/sinistros/`.
- CTG-0001 (TASK-0001/0002): matriz, contratos prospectivos, ODs, transcrição i18n e fichas. Concluído nesta Sessão A.
- CTG-0002 (TASK-0003/0004): caracterizar oráculo e homologação; então implementar shell, árvore de rotas e camada de dados.
- CTG-0003 (TASK-0005/0006/0007): fiscalização, medidas, alcoolemia, evidências e normativos.
- CTG-0004 (TASK-0008/0009/0010): operações, sincronização, administração, técnico, auditoria, BI e conta.
- CTG-0005 (TASK-0011/0012): smoke por papel na stack e documentação/manifesto de disponibilidade.

## Critérios de aceite

- **CTG-0001:** matriz fixa de rota × 9 papéis, incluindo presença e ausência, com paths, guards, operações e formulários referenciados aos contratos lidos; quatro ODs em `teat-build-pack.md` §4; chaves i18n só de fonte fechada; fichas necessárias em `draft`; body desta issue preparado sem publicação.
- **CTG-0002:** caracterizar antes da troca o oráculo vigente (549 pares) e acrescentar as 13 rotas apenas quando materializadas; provar guards e falhas de auth/tenant/papel/contexto sem HTTP/SSE; preservar os paths conforme a OD-R29-002; usar métodos e paths OpenAPI; eliminar `ProductPageComponent` e `JSON.stringify` de renderização; homologação bloqueia todo HTTP remoto e exibe `HOMOLOGAÇÃO — SIMULAÇÃO`.
- **CTG-0003:** caracterizar e implementar fiscalização, medidas, alcoolemia, evidência e normativos com papéis presentes/ausentes, estados do servidor, formulários, erros e SSE comprovados. Janela OD-T03 e retenção OD-T08 permanecem fail-closed enquanto `source_pending`.
- **CTG-0004:** caracterizar e implementar operações, sincronização, administração e retaguarda com a política de cada ação. Numeração respeita H.54/OD-T07, sem cálculo ou reatribuição local de números; comandos sem contrato ou sem autorização comprovados não são atribuídos à UI.
- **CTG-0005:** smoke local por módulo registra requisição, resposta e evento quando aplicável; verificar homologação; publicar availability e documentação listadas no plano.
- Executar os gates definidos no plano R-0029: typecheck, lint, test, build e produção do TEAT web; testes mobile TEAT/BOAT; E2E e backend; contracts, catálogo de parâmetros, KB, publish-check, formato e `pnpm check`. A suíte e os oráculos permanecem integrais.

## Decisão e parada da Sessão A

OD-R29-001=(a) foi decidida pelo Owner em 2026-09-26: caminho real em `production` via gateway, homologação como padrão, HTTP remoto bloqueado nesse modo e selo `homologacao` até ADR de release. A decisão não remove as condições de autorização, tenant, evidência E2 ou serviços do backend. OD-R29-002…004 são propostas do Architect e continuam identificadas como tais.

A Sessão A encerra após TASK-0002. TASK-0003+ aguardam R-0024 e, para CTG-0002 em diante, CTG-0004 de R-0028 no branch publicado; depois, reconferir matriz, contratos e i18n contra a base integrada. A frente segue parada até essas dependências estarem disponíveis.
