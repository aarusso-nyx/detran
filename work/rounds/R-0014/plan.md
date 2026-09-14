# R-0014 — frente `portal-pwa` (WP-P4…P6 do PORTAL: fichas, mapa de tradução, i18n, PWA e homologação)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro Fable 5.1
(prompt em `prompts/00-maestro.md`). Reviewer: GPT-5.6 Terra via `tools/orchestra/bridge.sh codex`.
**Concorrência:** abre com `origin/main` ≥ 80d705a; merge por grupo acoplado — CTG-0001 (27 fichas, mapa de tradução, i18n, textos jurídicos): nenhum upstream. CTG-0002 (PWA, formulários) e CTG-0003 (e2e das 11 jornadas no mock, lint de payload): `portal-backend` R-0009 (`orchestra/portal-backend`) — empilhe nele se ainda não mesclou.
**Janelas previstas:** 4.

## Metas

1. **Fichas** (WP-P4): `docs/framework/product/transversal/portal/screens/IU-PORTAL-<T-nn>.md`
   para as 27 telas, no padrão do `screen-specification-standard.md` da origem (identidade, acesso,
   entrada, dados, estados, comandos, saída, segurança, acessibilidade, testes), com os estados
   obrigatórios (carregando, vazio, sem elegibilidade, erro recuperável, sem permissão, indisponível)
   e as regras de conteúdo de [IU-PORTAL-001] §E (linguagem cidadã). Baseline do KB sobe em 27.
2. **Mapa de tradução e i18n**: tabela única de estados internos (RAIT/PEC/BOAT/infração → situação
   cidadã) em `apps/portal/web/src/i18n/portal.pt-BR.json`; textos jurídicos versionados
   (consequências, quatro efeitos do SNE, termo de renúncia dos 40 % — H.53: desligado por flag,
   texto existe); schemas dos 14 formulários (`portal-frontends.md` §7) em
   `apps/portal/web/src/app/forms/*.schema.ts`.
3. **PWA** (WP-P5): `apps/portal/web` (`@detran/portal-web`; Angular 22; `@detran/ui` para
   primitivos, shell próprio; PWA com cache cifrado só para CNH-e/CRLV-e; 13 módulos; ~40 rotas da
   §4; componentes da §5; guardas de nível, vínculo e disponibilidade; `ResumeService`; a11y AA +
   eMAG). Scripts `build|test|lint|typecheck` criados nesta rodada e ligados a `pnpm check`.
   Auditoria automática de a11y por rota: `axe-core` em TestBed (script `test`) — Lighthouse CI
   só se a TASK-0001 confirmar ferramenta instalável sem serviço externo; caso contrário registrar
   em §Bloqueios e manter `axe`.
4. **Integração e homologação** (WP-P6): cotação/reconhecimento via `CdtPort`, CNH-e/CRLV-e,
   push web e adesão SNE **no mock** (`senatran-mock`) com e2e das 11 jornadas
   ([JRN-PORTAL-001…011]) sobre as fixtures; teste "nenhum token interno em resposta `/v1/portal/*`"
   (lint de payload contra o vocabulário de `14-inf-lifecycle-vocabulary.sql` e dos workflows).
   A homologação com o SNE real é passo institucional fora da rodada (registrar em backlog).
5. Documentação: `portal-build-pack.md` §WP-P4…P6 executados (gates reais); `portal-frontends.md`
   §9/§10; backlog; `apps/portal/mobile/README.md` mantém "adiado" (OD-P12).

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                            | Depende de           | Entrega                                                                                                                      |
| --------- | ------------ | ------------------- | -------------- | ----------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect    | architect-blueprint | Opus / alto    | `MOD-portal-web-arch`                           | —                    | decisões do app (pastas §9, cache cifrado, ferramenta de a11y, forma dos schemas), lista tela → ficha → rota, critérios      |
| TASK-0002 | Owner deleg. | transcriber-docs    | Sonnet / baixo | `MOD-product-portal-screens`, `MOD-kb-manifest` | TASK-0001            | 27 fichas; manifesto                                                                                                         |
| TASK-0003 | Owner deleg. | transcriber-docs    | Sonnet / baixo | `MOD-portal-i18n`                               | TASK-0001            | mapa de tradução, `portal.pt-BR.json`, textos jurídicos versionados                                                          |
| TASK-0004 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-portal-web-tests`                          | TASK-0001            | testes: roteamento por nível/vínculo/disponibilidade (todas as rotas), 14 schemas, a11y por rota, TestBed dos compartilhados |
| TASK-0005 | Engineer     | engineer-frontend   | Opus / médio   | `MOD-portal-web-app`, `MOD-package-json`        | TASK-0003, TASK-0004 | pacote, shell, 13 módulos, guardas, `ResumeService`, PWA; `pnpm check` estendido; testes verdes                              |
| TASK-0006 | Engineer     | engineer-frontend   | Sonnet / médio | `MOD-portal-web-forms`                          | TASK-0005            | 14 schemas com gates; testes verdes                                                                                          |
| TASK-0007 | Inspector    | inspector-tests     | Opus / alto    | `MOD-portal-e2e`, `MOD-senatran-mock`           | TASK-0005            | e2e das 11 jornadas no mock; lint de payload; push web; adesão SNE (mock)                                                    |
| TASK-0008 | Owner deleg. | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                      | TASK-0006, TASK-0007 | build pack, `portal-frontends.md`, backlog (homologação SNE real)                                                            |

CTG-0001 = 0002/0003; CTG-0002 = 0004…0006; CTG-0003 = 0007. Um PR por CTG.

## Critérios de aceitação (comandos → resultado)

- `node tools/docs/kb/check.mjs` → baseline + 27 / 446, atualizado no mesmo commit; `pnpm docs:kb:publish-check` → OK.
- `pnpm --filter @detran/portal-web typecheck|test|build|lint` → verdes; a11y por rota sem violação
  `serious`/`critical` (axe).
- `pnpm backend:test:e2e` → 11 jornadas verdes contra `backend/app` com `DETRAN_RUNTIME_PROFILE=test`
  e `senatran-mock`; teste de vocabulário interno → 0 ocorrências.
- `pnpm check` → verde; `pnpm backend:test:ci` inalterado.

## Mapa entregável → definições

| Entregável  | Definição                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| fichas      | [IU-PORTAL-001]; `portal-frontends.md` §4–§6; [JRN-PORTAL-001…011]; catálogo de telas da origem (estados obrigatórios) |
| formulários | `portal-frontends.md` §7; [WF-PORTAL-001/002]; [RN-PORTAL-*]; `portal-error-catalog.md`                                |
| hierarquia  | `portal-frontends.md` §1–§3, §8–§10                                                                                    |
| tradução    | [WF-PORTAL-003]; OD-P09; vocabulário canônico dos workflows                                                            |
| decisões    | steering H.49…H.53; OD-P03/P04/P05/P11/P12                                                                             |
| integrações | `CdtPort`, `SnePort`, `RenachPort` em `packages/senatran-adapter`; `senatran-mock`                                     |

## Riscos

- Ferramenta de auditoria PWA/a11y em CI: só a que rode offline no runner; nunca serviço externo.
- Cache cifrado só para CNH-e/CRLV-e: chave por sessão, nunca persistida em claro.
- `senatran-mock` tem lockfile próprio: alterações no mock vão em commit separado.

## Concorrência

(preenchido pelo maestro no bootstrap: upstreams já em `main`, grupos liberados para merge, grupos
em base empilhada e sobre qual branch)

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
