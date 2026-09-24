# Prompt corretivo — CTG-0004b, web de homologação

Papel constitucional: **Architect → Inspector → Engineer → Reviewer**, em passagens
separadas. Aplica-se ao trabalho aberto após TASK-0014–0017; seus registros concluídos
permanecem históricos. Ler `AGENTS.md`, `CODESTYLE.md`, `plan.md` desta rodada,
ADR-0033, `docs/framework/arch/teat-web-contract.md`, matriz web e testes pertinentes.
Workers não usam Git, não editam `record/**` nem siblings; maestro integra e registra.

## Meta e fronteira

Entregar `apps/teat/web` para homologar UI e workflows correlatos ao mobile, mantendo
56 fichas, 60 rotas, 12 módulos, papéis, guards, i18n, a11y, ErrorBoundary e SSE/polling
como experiência demonstrável. Dados, decisões e eventos simulados são identificados
como sintéticos. Não afirmar homologação operacional de integração, despacho,
saneamento, emissão ou espelho produtivo a partir de respostas de teste.

Architect explicita no contrato quais jornadas são executadas com doubles e quais
integrações reais já existem, sem inventar estado de backend. Inspector prova a
segregação e o comportamento de erro e negação; Engineer implementa somente o
contrato e não altera os testes congelados. O caminho produtivo não aceita mock
implícito nem privilegia um papel omitido da matriz. Sinistros permanecem ponto de
extensão de R-0015. O eventual escopo de produção web que dependa do mobile será
rastreado nas issues futuras, sem ampliar esse round.

## Critérios de aceitação

- `pnpm --filter @detran/teat-web lint`, `typecheck`, `test`, `build` e `pnpm check`
  verdes; zero skip/todo novo; revisão independente no candidato exato.
- 60/60 rotas, 56/56 fichas e produto cartesiano de papéis preservados, incluindo
  negativos; jornadas demonstrativas e estados vazio/erro/SSE-fallback testados.
- UI e evidências marcam a modalidade de homologação; fixtures não cruzam para
  autoridade produtiva, mutações reais não são inferidas e o relatório distingue
  simulação de integração comprovada.
