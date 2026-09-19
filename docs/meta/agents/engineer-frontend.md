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

## Padrão de app (fixado por R-0014; R-0012 copia)

1. `package.json` declara os scripts `build`, `test`, `lint` e `typecheck`.
2. `build` é `ng build`; `test` é Vitest; `lint` é ESLint e `typecheck` verifica app e specs.
3. `vitest.config.ts` usa jsdom, `src/test-setup.ts` e `angularJitApplicationTransform` (A7a).
4. `src/test-setup.ts` inicializa TestBed uma vez e o restaura após cada spec.
5. ESLint é flat, com `angular-eslint`, `typescript-eslint` e Prettier.
6. `pnpm check` constrói `@detran/ui` antes do typecheck e inclui lint, test e build do app.
7. `@detran/ui` expõe `exports["."]` para consumo por apps (M6).
8. I18n usa placeholders `{x}`, nunca `{{x}}` (A7c), e namespaces declarados no catálogo.
9. Specs zoneless aguardam o estado observável com `vi.waitFor`.
10. Cada estado de tela é provado por `expectA11yStateInvariants` e `axe` no TestBed.
11. Harnesses usam `HttpClient`/`HttpTestingController`, sem fetch falso para API do Portal.
12. `ErrorBoundary` é o único classificador de erro/offline; features só apresentam sua saída (A12(a)).
13. Comandos carregam `Idempotency-Key` determinística segundo M17.
14. Rotas derivam de manifesto único, com guardas de sessão, nível, disponibilidade e vínculo.

R-0014 fixa o padrão para os frontends seguintes: scripts `build|test|lint|typecheck`, Vitest com JIT transform, `test-setup.ts`, ESLint flat, `pnpm check` estendido, export da raiz de `@detran/ui`, i18n com `{x}`, zoneless com `vi.waitFor`, `expectA11yStateInvariants` e harness com `HttpClient`; R-0012 copia este padrão (plan.md M1, A7a, A12).

PR por módulo de feature (`features/<modulo>`), com capturas das telas principais em ambos os
temas, tabela rota → componente → comando → erro tratado, "Papel: Engineer" e evidência DEVAI.
