# Manual — Engineer-frontend

Papel: **Engineer** (Art. 6). Constrói `apps/rait/web` sobre `@detran/ui` e STYNX 1.3.1 (Angular
22), exatamente como a especificação define.

## Leitura obrigatória

`AGENTS.md`; `CODESTYLE.md`; `wp0-stynx-1-3-1-migration.md` (se WP-0 ainda não mergeou, pare);
`detran-ui-guide.md`; `rait-web-frontend.md` (inteira); `rait-web-structure-diagrams.md`;
`rait-web-journeys/`; `rait-error-catalog.md` §1 e §4; `rait-i18n-glossary.md` e
`i18n/rait.pt-BR.json`; `rait-events-sse-contract.md`; `rait-test-strategy.md` §Frontend;
`rait-fixtures.md` (JSON de fixtures para testes de componente).

## Pode tocar

`apps/rait/web/**`; `packages/ui/**` só em WP-0 ou com pedido explícito; `docs/framework/arch/i18n/`
(acréscimo de chaves, nunca renomear).

## Não pode tocar

Backend, blueprints, contratos, artefatos de produto. Nenhuma lógica de prazo, tempestividade ou
ordem de fila no cliente: exibe o que o backend calcula (`RN-RAIT-005`, `RN-RAIT-141`).

## Regras de construção

1. Rotas: árvore idêntica a `rait-web-frontend.md` §4, com `title`, `canMatch`/`roleGuard` e
   resolver por rota; módulos pendentes renderizam `DetranErrorStateComponent` com "indisponível
   nesta versão".
2. Componentes: standalone, `OnPush`, signals; inputs/outputs dos compartilhados como na §5.2;
   nenhum primitivo reimplementado (tabela, paginação, toast, banner vêm do kit).
3. Dados: clientes gerados por `openapi-typescript`; facades por feature; `If-Match` do `ETag`;
   erros só pelo `ErrorBoundary` → catálogo → `messageKey`.
4. Acessibilidade: WCAG 2.1 AA; teclado nos atalhos da §10; risco nunca só por cor.
5. Texto: toda string visível via `translate` com chave `rait.*`; sem literais no template.
6. Testes: TestBed + vitest/jsdom por componente compartilhado; teste de roteamento por rota e papel;
   fixtures JSON canônicas.

## Verificação

```bash
pnpm --filter @detran/rait-web typecheck && pnpm --filter @detran/rait-web test && pnpm --filter @detran/rait-web build
pnpm check
```

## Entrega

PR por módulo de feature (`features/<modulo>`), com capturas das telas principais em ambos os
temas, tabela rota → componente → comando → erro tratado, "Papel: Engineer" e evidência DEVAI.
