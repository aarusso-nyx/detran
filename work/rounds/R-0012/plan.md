# R-0012 — frente `rait-web` (WP-D, WP-E, WP-F do RAIT: fichas de tela, formulários e esqueleto de `apps/rait/web`)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro Fable 5.1
(prompt em `prompts/00-maestro.md`). Reviewer: GPT-5.6 Terra via `tools/orchestra/bridge.sh codex`.
**Concorrência:** abre já; merge por grupo acoplado — CTG-0001 (fichas): nenhum upstream. CTG-0002 (app, formulários): os **controladores** de comando de `rait-case`/`rait-worklist`/`rait-session` estão em `main` (R-0007 CTG-0001/0002, PR #69), mas os contratos `BP-INF-RAIT-*.commands.openapi.json` (WP-C) só chegam com R-0007 CTG-0004; `@detran/api-clients` hoje gera apenas o CRUD do RAIT. Portanto: scaffold, rotas, `core/`, 22 componentes, 16 schemas de formulário, i18n e facades sobre os clientes CRUD entram já; os métodos de facade que disparam comandos (`POST …/commands/*`) e seus testes ficam `todo` citando R-0007 CTG-0004 e são ligados quando os contratos mesclarem — nunca DTO digitado à mão nem cliente fora de `contracts:clients`. Org, financeiro e integrações renderizam "indisponível nesta versão" até o mesmo CTG. Padrão de scaffold em `main` (`apps/portal/web`, R-0014): copiar. Allowlist i18n existe: acrescentar as linhas `rait.*`. Lock `packages/ui` com R-0013 CTG-0004 (não iniciado): esta rodada toma o lock primeiro; R-0013 integra `main` depois. Pedido a R-0007: publicar os contratos de comando de case/worklist/sessão como tarefa de transcrição antes do CTG-0004, para fechar os `todo` desta rodada.
**Lock compartilhado:** `packages/ui` — nunca ativa ao mesmo tempo que `teat-frontends` (R-0013).
**Janelas previstas:** 3.

## Metas

1. **Fichas de tela** (WP-D): uma ficha por rota de `rait-web-frontend.md` §4 em
   `docs/framework/product/domains/inf/rait/screens/IU-RAIT-<nnn>.md` (ids `IU-RAIT-002…`, id da
   rota no cabeçalho): objetivo, papel, resolver/dados, layout (top-level e nested), componentes
   compartilhados (§5.2), ações e comandos (§7), estados carregando/vazio/erro (códigos do
   `rait-error-catalog.md`), atalhos, LGPD (campos suprimidos por papel), critérios ligados aos
   `AC-RAIT-*`. Status `draft` até revisão do Owner. **Baseline do KB**: `artifactIdCount` do
   `import-manifest.json` sobe em exatamente o número de fichas criadas (contar com
   `node tools/docs/kb/check.mjs` antes e depois; o número entra no relatório).
2. **Formulários e gates** (WP-E): `apps/rait/web/src/app/forms/<formulario>.schema.ts` para os 16
   formulários da §9 (Zod ou `FormGroup` tipado — decisão da TASK-0001, uma só para o app): campo,
   tipo, obrigatoriedade condicional, máscara, validação de forma, código de erro de negócio
   esperado; gate de transição (pré-estado, papel, pré-condições, comando, pós-estado) no cabeçalho
   do arquivo e consolidado em `docs/framework/arch/rait-web-forms.md`. Regra de lint "nenhum prazo
   legal calculado no cliente" ([RN-RAIT-005]) como regra ESLint local (`eslint-plugin-local` ou
   `no-restricted-syntax`) ligada ao `lint` do app.
3. **Esqueleto do app** (WP-F): pacote `apps/rait/web/package.json` (`@detran/rait-web`; scripts
   `build`, `test`, `lint`, `typecheck` sobre Angular CLI 22 — os scripts são criados **nesta**
   rodada e passam a ser os comandos de aceitação; até existirem, o gate provisório é
   `pnpm --filter @detran/ui build`), `provideDetranAuthenticatedApp`, `app.routes.ts` com a árvore
   exata da §4 (títulos, `canMatch` por papel, resolvers), `features/<módulo>/`, `shared/` com os 22
   componentes de domínio (assinaturas da §5.2), `data/api/*` (clientes de `contracts:clients`),
   `core/` (shell, SSE, atalhos, error boundary), `i18n/pt-BR.json` (semente:
   `docs/framework/arch/i18n/rait.pt-BR.json` + `rait.errors.*` do catálogo); páginas de módulos
   pendentes renderizam "indisponível nesta versão". `pnpm check` passa a incluir `--filter @detran/rait-web typecheck|test|build`.
4. Documentação: `rait-build-pack.md` §WP-D/E/F executados com os gates reais (substituindo `ng build`
   e `pnpm --filter @detran/rait-web test` "inexistentes" por scripts que agora existem);
   `rait-web-frontend.md` §12/§13 conferidos; `detran-ui-guide.md` se um componente novo entrar em
   `packages/ui`; backlog.

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                      | Depende de           | Entrega                                                                                                                                                                                                                                                                                     |
| --------- | -------------------- | ------------------- | -------------- | --------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus / alto    | `MOD-rait-web-arch`                                       | —                    | decisões do app (copiando o scaffold de `apps/portal/web`: scripts, `angular.json`, `eslint.config.js`, `tsconfig.*`, `vitest.config.ts` com o plugin JIT do Angular, `app.route-manifest.ts`; forma dos schemas; estrutura §12; regra de lint), lista fechada de rotas → fichas, critérios |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-product-rait-screens`, `MOD-kb-manifest`             | TASK-0001            | fichas `IU-RAIT-002…` (metade das rotas: operação e protocolo), manifesto                                                                                                                                                                                                                   |
| TASK-0003 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-product-rait-screens-2`                              | TASK-0001            | fichas restantes (colegiado, gestão, integração); `rait-web-forms.md`                                                                                                                                                                                                                       |
| TASK-0004 | Inspector            | inspector-tests     | Sonnet / médio | `MOD-rait-web-tests`                                      | TASK-0001            | testes: roteamento por rota × papel mínimo (todas as rotas da §4), schemas dos 16 formulários, regra de lint (caso negativo); caso negativo do verificador de parâmetros para a linha `rait.*` da allowlist                                                                                 |
| TASK-0005 | Engineer             | engineer-frontend   | Opus / médio   | `MOD-rait-web-app`, `MOD-packages-ui`, `MOD-package-json` | TASK-0004            | pacote, rotas, `core/`, `shared/` (22 componentes), `data/api`, i18n; `pnpm check` estendido; testes verdes; linhas `rait.*` na allowlist do catálogo (`pnpm parameters:generate`)                                                                                                          |
| TASK-0006 | Engineer             | engineer-frontend   | Sonnet / médio | `MOD-rait-web-forms`                                      | TASK-0003, TASK-0005 | 16 schemas com gates no cabeçalho; lint; testes verdes                                                                                                                                                                                                                                      |
| TASK-0007 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                                | TASK-0006            | build pack (gates reais), `rait-web-frontend.md`, backlog                                                                                                                                                                                                                                   |

CTG-0001 = 0002/0003 (fichas, PR próprio); CTG-0002 = 0004…0006 (app). TASK-0001 e 0007 simples.

**Checkpoint de dependências:** após TASK-0005 criar `apps/rait/web/package.json`, o maestro roda `pnpm install`, guarda o `pnpm-lock.yaml` para o commit do grupo, estende `pnpm check` e só então libera o Inspector a rodar TASK-0004 contra o app; `pnpm contracts:clients` antes de TASK-0005 para os clientes RAIT de R-0007.

## Critérios de aceitação (comandos → resultado)

- `node tools/docs/kb/check.mjs` → `baseline vigente + N` artefatos (N = fichas criadas; baseline em `import-manifest.json`, 675 em 2026-09-21) / 446 tokens, com o
  baseline atualizado no mesmo commit; `pnpm docs:kb:publish-check` → OK.
- `pnpm --filter @detran/rait-web typecheck`, `test`, `build`, `lint` → verdes (scripts criados na TASK-0005).
- `pnpm --filter @detran/ui test` e `build` → verdes (se `packages/ui` for tocado).
- teste de roteamento: cada rota da §4 com o papel mínimo → 200; sem papel → redirecionamento; 100 % das rotas.
- `pnpm check` → verde (incluindo o app novo); `pnpm backend:test:ci` inalterado.

## Mapa entregável → definições

| Entregável  | Definição                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| fichas      | [IU-RAIT-001]; `rait-web-frontend.md` §4–§6; `rait-web-structure-diagrams.md` (D2–D5); `rait-web-journeys/JW-01…12`; [JRN-RAIT-001…004]     |
| formulários | `rait-web-frontend.md` §9 (16 formulários); `rait-error-catalog.md` §3–§4; [RN-RAIT-001…143]; tabelas de transição (caso, sessão, infração) |
| hierarquia  | `rait-web-frontend.md` §2, §4, §5, §12, §13; diagramas D1–D7; ADR-0006; ADR-0015; `detran-ui-guide.md`                                      |
| i18n        | `rait-i18n-glossary.md`; `docs/framework/arch/i18n/rait.pt-BR.json`                                                                         |
| clientes    | contratos de comando (R-0007) via `contracts:clients`                                                                                       |
| testes      | `rait-test-strategy.md`                                                                                                                     |

## Riscos

- `apps/*/*` já está no `pnpm-workspace.yaml`; o primeiro `pnpm install` após criar o pacote muda
  o `pnpm-lock.yaml` (commit separado "chore(deps)").
- Angular 22 (`OnPush` default, router `always`, TS 6): notas em `wp0-stynx-1-3-1-migration.md` §7.
- Fichas são corpus de produto: linguagem e tokens canônicos do KB; nenhuma tela fora da §4.

## Lições aplicadas (método §4.8–§4.18, `waves.md` §Histórico)

- Transcrição de fichas, contratos, i18n e docs é ato de **Architect** (`transcriber-docs`); tarefas assim aparecem como "Architect (transcr.)".
- Nenhum Engineer ou transcriber entrega o teste do próprio artefato: contratos → `contracts:test` pelo Inspector; fichas/i18n → teste tela ↔ ficha ↔ rota pelo Inspector.
- Ciclos de review a partir do segundo restritos aos itens corrigidos; contradições contrato × código resolvidas pelo Architect por adenda numerada em `plan.md` antes de redespachar.
- O CTG seguinte só começa a escrever depois do merge do anterior ou nasce em branch empilhado; nunca commits novos no branch de um PR aberto; integrar `main` por merge, nunca `--force`.
- Listas de leitura dos workers fechadas e completas (DDL gerado, blueprint, `seed.sh`, fixtures, specs de referência como `backend/app/tests/e2e/policy-routes.e2e.spec.ts`); lacuna aqui foi `reference-gap` em R-0010.
- Pacote de workspace novo: o maestro roda `pnpm install`, guarda o `pnpm-lock.yaml` para o commit do grupo e só então libera o Inspector (CI é `--frozen-lockfile`).
- Chaves i18n não são parâmetros (OD-P46): a allowlist já existe em `parameter-catalogue.md` §Namespaces i18n; acrescentar as linhas `rait.<namespace>` antes de `i18n/pt-BR.json` entrar em código; placeholders na sintaxe STYNX `{x}`.
- Testes de roteamento cobrem papéis com e sem acesso (presença e ausência), não só o papel mínimo.
- O job `foundation` já constrói `apps/portal/web`; adicionar um segundo app pode estourar o tempo do job — medir e, se preciso, job próprio, nunca enfraquecer o gate.

## Concorrência

(preenchido pelo maestro no bootstrap: upstreams já em `main`, grupos liberados para merge, grupos
em base empilhada e sobre qual branch)

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
