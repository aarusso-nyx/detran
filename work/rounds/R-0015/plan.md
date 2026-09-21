# R-0015 — frente `boat-mobile` (WP-B4, WP-B5 do BOAT: fichas, formulários, i18n, biblioteca de sinistro mobile e módulo web)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro Fable 5.1
(prompt em `prompts/00-maestro.md`). Reviewer: GPT-5.6 Terra via `tools/orchestra/bridge.sh codex`.
**Concorrência:** abre já; merge por grupo acoplado — CTG-0001 (17 fichas, i18n, transições): nenhum upstream. CTG-0002 (biblioteca mobile, módulo `sinistros` web, formulários): `boat-backend` R-0010 já em `main` (PC-0008); falta `teat-frontends` R-0013 CTG-0004 (shell de campo e `apps/teat/web`), ainda não iniciado — empilhar em `orchestra/teat-frontends` quando os apps existirem ou aguardar.
**Janelas previstas:** 3.

## Metas

1. **Fichas** (WP-B4): `docs/framework/product/domains/est/boat/screens/IU-BOAT-S-nn.md` (12
   mobile) e `IU-BOAT-W-nn.md` (5 web) — 17 fichas no padrão da origem, com os estados obrigatórios,
   a regra de acesso a vítimas (perfil + finalidade + auditoria) e os textos fixos ("sinistro" nunca
   "acidente"; "fotografar a cena, não o sofrimento"; "registro nacional definitivo, sem correção").
   Baseline do KB sobe em 17.
2. **Formulários, transições e i18n**: `apps/boat/mobile/src/lib/forms/*.schema.ts` (14 formulários,
   `boat-frontends.md` §8); `transitions.ts` com as 149 transições + S-12; `i18n/boat.pt-BR.json`
   (estados, regimes 176/177/178 em linguagem simples, catálogos de condição — valores do protótipo
   `source_pending` H.42 —, erros).
3. **Biblioteca mobile** (WP-B5): `apps/boat/mobile` (`@detran/boat-mobile`) como biblioteca de
   features carregada pelo `FieldShell` do TEAT (pontos de extensão definidos em R-0013): 12 telas,
   componentes §6, `victimAccessGuard`, editor de croqui, GPS/câmera/assinatura via Capacitor,
   armazenamento cifrado e atestação de dispositivo (portas com fixtures nos testes).
4. **Módulo web** `sinistros` em `apps/teat/web` (5 telas, `boat-frontends.md` §5); Portal T-18/T-19
   já entregues em R-0014 (projeção `portal.crash_view`).
5. Documentação: `boat-build-pack.md` §WP-B4/B5 executados (gates reais); `boat-frontends.md` §9/§10;
   backlog (homologação RENAEST mock → real como passo institucional).

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                    | Depende de | Entrega                                                                                                                                                                            |
| --------- | -------------------- | ------------------- | -------------- | ------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus / alto    | `MOD-boat-mobile-arch`                                  | —          | decisões (forma de biblioteca carregada pelo shell, portas nativas, editor de croqui), lista tela → ficha → rota, critérios                                                        |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-product-boat-screens`, `MOD-kb-manifest`           | TASK-0001  | 17 fichas; manifesto                                                                                                                                                               |
| TASK-0003 | Engineer             | engineer-frontend   | Sonnet / baixo | `MOD-boat-i18n-transitions`                             | TASK-0001  | `i18n/boat.pt-BR.json`, `transitions.ts` (149 + S-12)                                                                                                                              |
| TASK-0004 | Inspector            | inspector-tests     | Sonnet / médio | `MOD-boat-mobile-tests`, `MOD-teat-web-sinistros-tests` | TASK-0003  | testes: roteamento e transições, `victimAccessGuard` (perfil + finalidade), 14 schemas, TestBed dos compartilhados, portas nativas com fixtures; teste tela ↔ ficha ↔ rota (17/17) |
| TASK-0005 | Engineer             | engineer-frontend   | Opus / médio   | `MOD-boat-mobile-lib`, `MOD-package-json`               | TASK-0004  | biblioteca `@detran/boat-mobile` (12 telas, componentes, guardas, croqui, portas); `pnpm check` estendido; testes verdes                                                           |
| TASK-0006 | Engineer             | engineer-frontend   | Sonnet / médio | `MOD-teat-web-sinistros`, `MOD-boat-mobile-forms`       | TASK-0005  | módulo `sinistros` (5 telas) em `apps/teat/web`; 14 schemas com gates; testes verdes                                                                                               |
| TASK-0007 | Architect (transcr.) | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                              | TASK-0006  | build pack, `boat-frontends.md`, backlog                                                                                                                                           |

CTG-0001 = 0002/0003; CTG-0002 = 0004…0006. Um PR por CTG.

**Checkpoint de dependências:** após TASK-0005 criar `apps/boat/mobile/package.json`, o maestro roda `pnpm install`, guarda o lockfile, estende `pnpm check` e libera TASK-0004/0006 contra a biblioteca.

## Critérios de aceitação (comandos → resultado)

- `node tools/docs/kb/check.mjs` → baseline + 17 / 446, atualizado no mesmo commit; `pnpm docs:kb:publish-check` → OK.
- `pnpm --filter @detran/boat-mobile typecheck|test|build|lint` → verdes; `pnpm --filter @detran/teat-mobile build`
  carrega a biblioteca (teste de integração do shell); `pnpm --filter @detran/teat-web test|build` → verdes com o módulo `sinistros`.
- teste tela ↔ ficha ↔ rota: 17/17; transições: 149 + S-12 verdes; a11y de campo (axe) sem `serious`/`critical`.
- `pnpm check` → verde; `pnpm backend:test:ci` inalterado.

## Mapa entregável → definições

| Entregável  | Definição                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| fichas      | [IU-BOAT-001]; `boat-frontends.md` §4–§7; matriz `crash-*` da origem; [JRN-BOAT-001…005]; `portal-frontends.md` T-18/T-19 |
| formulários | `boat-frontends.md` §8; [RN-BOAT-*]; `boat-error-catalog.md`; [WF-BOAT-001…003]                                           |
| hierarquia  | `boat-frontends.md` §1–§3, §9–§10; `teat-frontends.md` §10 (shell de campo)                                               |
| LGPD        | steering H.44/H.45; `lgpd-assessment.md`; S-06/W-05                                                                       |
| catálogos   | steering H.42 (`est.crash_condition_ref`, `source_pending`)                                                               |

## Riscos

- `apps/teat/web` e `apps/teat/mobile` são de R-0013: esta frente só abre depois do merge; edita
  apenas o módulo `sinistros` e o registro da biblioteca no shell.
- Vítimas: tela liberada para produção por H.44, mas retenção e finalidade vêm do backend (R-0010);
  nada de acesso sem `purpose`.
- Nativos (câmera, GPS, assinatura, atestação): portas com fixtures; hardware real fora da rodada.

## Lições aplicadas (método §4.8–§4.18, `waves.md` §Histórico)

- Transcrição de fichas, contratos, i18n e docs é ato de **Architect** (`transcriber-docs`); tarefas assim aparecem como "Architect (transcr.)".
- Nenhum Engineer ou transcriber entrega o teste do próprio artefato: contratos → `contracts:test` pelo Inspector; fichas/i18n → teste tela ↔ ficha ↔ rota pelo Inspector.
- Ciclos de review a partir do segundo restritos aos itens corrigidos; contradições contrato × código resolvidas pelo Architect por adenda numerada em `plan.md` antes de redespachar.
- O CTG seguinte só começa a escrever depois do merge do anterior ou nasce em branch empilhado; nunca commits novos no branch de um PR aberto; integrar `main` por merge, nunca `--force`.
- Listas de leitura dos workers fechadas e completas (DDL gerado, blueprint, `seed.sh`, fixtures, specs de referência como `backend/app/tests/e2e/policy-routes.e2e.spec.ts`); lacuna aqui foi `reference-gap` em R-0010.
- Padrão de app (R-0014, `apps/portal/web`): copiar scripts, `angular.json`, `eslint.config.js`, `tsconfig.*`, `vitest.config.ts` com `angularJitApplicationTransform` e a árvore de pastas; `pnpm check` recebe a tripla `lint|test|build` da biblioteca.
- Pacote de workspace novo: o maestro roda `pnpm install`, guarda o `pnpm-lock.yaml` para o commit do grupo e só então libera o Inspector (CI é `--frozen-lockfile`).
- Chaves i18n não são parâmetros (OD-P46): allowlist já existe; acrescentar as linhas `boat.<namespace>` antes de `i18n/boat.pt-BR.json` entrar em código; placeholders `{x}`.
- Testes de roteamento cobrem papéis com e sem acesso (presença e ausência), não só o papel mínimo.

## Concorrência

(preenchido pelo maestro no bootstrap: upstreams já em `main`, grupos liberados para merge, grupos
em base empilhada e sobre qual branch)

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
