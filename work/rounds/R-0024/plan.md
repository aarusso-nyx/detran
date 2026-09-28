# R-0024 — frente `stynx-dedup` (C-0002, ação 7b: deduplicação STYNX e `@detran/ui` como kit de app)

**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner**. Planejada em 2026-09-26
pelo Architect a partir de `work/campaigns/C-0002-consolidacao.md` §2 (fase C), §3.3 e §4 (padrão de
ligação), e da inspeção (d) (`work/campaigns/C-0002-inspecao-2026-09-25/d-stynx.md` §4, §5 A4/M1/M4/M5/M6/B1–B3, §7).
Nenhum `AUTHORIZATION.md`, `tasks/` ou `compositions.json` existe: nascem no bootstrap, depois da
autorização. Maestro **Opus 5.5** (Claude Code); workers da escada Claude (Opus 5.5 grande e médio,
Sonnet 5 pequeno) por subagentes nativos; reviewer **Sol 6 nível grande** pela ponte
(`tools/orchestra/bridge.sh codex <id-sol-6> …`, id confirmado com `codex --help`).
Worktree `/Volumes/Thiamat II/stech/detran-worktrees/stynx-dedup`, branch `orchestra/stynx-dedup`.
**Concorrência:** abre **empilhada** em `origin/orchestra/stynx-sse-tenancy` (R-0022: pin 1.5.0,
SSE Angular canônico, tenancy sem _monkey-patch_); o PR final espera o merge de R-0022 (OD-C2-005).
CTG-0001…CTG-0003 (inventário, kit, apps) correm **em paralelo a R-0023**
(`orchestra/authz-unification`): locks disjuntos — R-0023 não toca `apps/` nem `packages/ui`; esta
rodada não toca `backend/` nem `policy.ts` antes do CTG-0004. **CTG-0004/0005 (backend) começam
depois de o CTG-0003 e o CTG-0004 de R-0023 existirem no branch publicado (empilhar); o PR final
espera o merge de R-0023** (usa `pnpm verify:authz-matrix` como guarda e toca `app.module.ts`, lock
de R-0023). As rodadas R-0025…R-0029 e R-0031 consomem o entregável
`docs/framework/arch/frontend-wiring-pattern.md`; nenhuma abre antes de o CTG-0006 existir no branch
publicado (empilhar); os PRs finais delas esperam o merge desta rodada.
**Janelas previstas:** 2 (campanha §3); recalibração provável para 3 no bootstrap, dado o volume
(kit + 5 apps + backend). 1: bootstrap + CTG-0001 + CTG-0002; 2: CTG-0003 (+ CTG-0004 se R-0023
mesclou); 3: CTG-0004/0005/0006 + fechamento. Recalibradas em §Execução OD-C2-005.

## Execução OD-C2-005 (Owner, 2026-09-27)

Esta seção **prevalece sobre qualquer menção a um PR/merge/evidência/delivery-review por CTG neste
plano** (C-0002 §12). A rodada corre na branch única `orchestra/stynx-dedup`, com um commit por
tarefa ou por CTG. Entre CTGs não há PR, CI remoto, `devai evidence record`, `audit observe`,
`pnpm check` completo nem delivery-review. Os critérios de aceitação não mudam; muda só o momento:
os `acceptance_commands` de cada tarefa rodam ao fim da tarefa, e os critérios formulados "por CTG",
"no fim de cada CTG" ou "no sha de cada merge" rodam **uma vez**, na sequência final.

**Ondas** (até 3 workers simultâneos na mesma worktree; o maestro serializa os commits; push sem PR
ao fim de cada onda):

| Onda | CTGs / tarefas em paralelo                  | Fronteiras de escrita (disjuntas)                                                                                                                                            | Depende de                                                                                                                         |
| ---- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| O1   | CTG-0001: TASK-0001                         | `work/rounds/R-0024/{dedup-inventory.md,contracts/}`, `open-decisions-rait.md` §C-0002                                                                                       | bootstrap e prompt-review única com `PASS`; O3 (pin) de R-0022 no branch publicado                                                 |
| O2   | CTG-0001: TASK-0002 ∥ CTG-0002: TASK-0003   | `docs/framework/arch/frontend-wiring-pattern.md` × specs de caracterização nos apps, `packages/ui/test/**`, `tools/contracts/tests/generate-clients.test.mjs`                | O1                                                                                                                                 |
| O3   | CTG-0002: TASK-0004 ∥ TASK-0005             | `packages/ui/{src,styles,package.json,ng-package.json}` × `tools/contracts/generate-clients.mjs` e `packages/api-clients/src/generated/**` (só por `pnpm contracts:clients`) | O2 **commitada** (caracterização verde antes de qualquer troca)                                                                    |
| O4   | CTG-0003: TASK-0006 ∥ TASK-0007 ∥ TASK-0008 | `apps/{rait,teat}/web` × `apps/{dashboard,portal}/web` × `apps/teat/mobile` e `apps/boat/mobile` (deps)                                                                      | O3, checkpoint (b) (`pnpm install`, lockfile, `pnpm --filter @detran/ui build`); O5 (SSE Angular) de R-0022 no branch publicado    |
| O5   | CTG-0004: TASK-0009 → TASK-0010             | `contracts/CTG-0004.md`, `contracts/CTG-0005.md` (adenda); testes de caracterização do backend (`MOD-app-tests-dedup`, `MOD-adapter-tests`)                                  | CTG-0003 e CTG-0004 de R-0023 no branch publicado `origin/orchestra/authz-unification`; pode começar quando uma vaga de O4 liberar |
| O6   | CTG-0004: TASK-0011                         | `app.module.ts`, jobs, auditoria/idempotência, `portal/requests`                                                                                                             | O5 **commitada** (caracterização do backend verde antes da troca)                                                                  |
| O7   | CTG-0005: TASK-0012                         | `app.module.ts`, `shared/src/errors`, adapters HTTP, dublês de teste, calendário de prazos                                                                                   | O6 (lock `MOD-app-module`)                                                                                                         |
| O8   | CTG-0006: TASK-0013                         | `frontend-wiring-pattern.md` final, ADRs, spec upstream §8, `detran-ui-guide.md`, inventário, `waves.md`, `backlog.md`                                                       | O4 e O7                                                                                                                            |

O frontend (O1…O4) corre em paralelo a R-0023, porque R-0023 não toca `apps/` nem `packages/ui`, e
esta rodada não toca `backend/` nem `policy.ts` antes de O5. Se R-0023 ainda não tiver publicado o
CTG-0004 quando O4 acabar, O5…O7 esperam e O8 não começa. Essa espera não bloqueia os commits de
O1…O4, que já estão no branch publicado.

**Abertura empilhada.**

- **Base:** `origin/orchestra/stynx-sse-tenancy` (R-0022)
  (`git worktree add -b orchestra/stynx-dedup "/Volumes/Thiamat II/stech/detran-worktrees/stynx-dedup" origin/orchestra/stynx-sse-tenancy`),
  ou `origin/main` se R-0022 já tiver mesclado. Revisões de R-0022 entram por
  `git merge --no-edit origin/orchestra/stynx-sse-tenancy`. Antes de O5, integre
  `git merge --no-edit origin/orchestra/authz-unification`. Nunca rebase de branch publicado.
- **Pode ser feito antes dos merges de R-0022 e R-0023:** a rodada inteira, O1…O8, sobre
  `1.5.0-rc.N` quando for o caso (OD-S15-01), respeitando a coluna "Depende de".
- **Espera os merges:** só o PR final, que exige R-0022 **e** R-0023 em `main`, a STYNX 1.5.0
  **final** e o pin `1.5.0` final em todos os manifestos, inclusive as dependências STYNX novas do
  kit (OD-S15-01).
- **Caracterização commitada antes de qualquer troca**, em dois pontos: O2 (frontend) antes de O3, e
  O5 (backend) antes de O6. Antes do PR final, depois de integrar `origin/main`, a caracterização de
  frontend (`pnpm --filter @detran/<app> test` dos apps) e a de backend (`pnpm backend:test:ci`) são
  reexecutadas no HEAD, e `pnpm verify:authz-matrix` tem de sair com diff vazio contra a matriz de
  R-0023 em `main`.
- **Downstream:** R-0025…R-0029 e R-0031 empilham sobre `origin/orchestra/stynx-dedup` depois de O8
  (padrão de ligação final) existir no branch publicado; os PRs finais delas esperam o merge desta.

**Sequência final** (C-0002 §12, nesta ordem):

1. Com R-0022 e R-0023 em `main`: `git fetch -q origin` e `git merge --no-edit origin/main`; se a
   rodada correu em RC, pin `1.5.0` final, `pnpm install` e commit do lockfile.
2. CI local completo: `pnpm check`; `pnpm backend:test:ci`;
   `pnpm --filter @detran/ui typecheck|test|build`;
   `pnpm --filter @detran/{rait-web,dashboard-web,portal-web,teat-web,teat-mobile,boat-mobile} lint|test|build|typecheck`;
   `pnpm contracts:test`; `pnpm contracts:clients` duas vezes, a segunda sem diff; `pnpm contracts:check`;
   `pnpm verify:authz-matrix` (diff vazio); `pnpm verify:decorators`; `pnpm verify:role-catalog`;
   `pnpm verify:stynx-pin`; as verificações `find`/`grep` do plano; recontagem do inventário;
   `pnpm docs:kb:check`, `pnpm docs:kb:publish-check`, `pnpm format:check`;
   `pnpm devai:rc:prepare` quando aplicável.
3. **Uma** delivery-review (Sol 6, nível grande, pela ponte) sobre o diff inteiro. Ela anexa a lista
   de `it.fails` invertidos (= C-03), a saída de `verify:authz-matrix`, o snapshot de envelope de erro
   antes e depois, e a conferência do padrão de ligação contra C-0002 §4. `REVIEW` pede correções
   restritas, no máximo 2 ciclos; `FAIL` → `escalated`.
4. **Um** PR contra `main`, pelo template, com a tabela CTG → tarefas → commits e os gates.
5. CI remoto; falha de código volta à tarefa responsável; merge só com CI verde e `PASS`.
6. Publicação: `evidence-R-0024.json` com os 6 CTGs, `devai evidence record` e `evidence verify`,
   `devai audit observe` no sha do merge, `closure.json`, `devai round close`, `devai round seal`,
   `waves.md` e `backlog.md`.

**Janelas recalibradas:** 2 (3 com a recalibração prevista) → **≈ 3 de trabalho, ≈ 1–1,5 depois do
merge de R-0023**. O volume (kit, 5 apps, backend) não encolhe. Janela 1: bootstrap, prompt-review
única e O1…O3, em paralelo a R-0023. Janela 2: O4, e O5 se R-0023 já tiver publicado o CTG-0004.
Janela 3: O5…O8 e a sequência final. O frontend sai do caminho crítico. Depois do merge de R-0023,
resta O6…O8 (se ainda não feitos) e a sequência final.

## Decisões do Owner — OD-S15-01 (2026-09-26)

Decisão registrada em `work/campaigns/C-0002-stynx-upstream-spec.md` §Decisões do Owner. Efeito nesta
rodada:

- U8–U15 são **MUST**. Os CTGs de adoção deixam de ter ramo "SHOULD/MAY ausente → código local fica":
  IFM, NGERR, SHELL, TEST-02…04, HOOK (`renach-webhook.guard.ts`), CAL (`inf/deadlines` calendário e
  relógio; os feriados continuam como dados do DETRAN) e NGIDEM (`idempotency-key.ts`) são todos
  adotados, e o código local correspondente é removido.
- **UPS-CLI-01 (gerador de módulo):** o CTG-0005 acrescenta uma tríade que avalia a equivalência
  entre `stynx generate module` e `tools/blueprints/` (574 l.) com o gate `pnpm blueprints:check`.
  Se forem equivalentes, migra e remove o gerador local; se houver divergência de saída, registra
  desvio na ADR de divisão STYNX × DETRAN com decisão do Owner. Nunca mantém duas fontes silenciosas.
- Consumo por RC permitido; merge só com o pin `1.5.0` final. As janelas são recalibradas no
  bootstrap (+1 esperado).

## Metas

1. **Saldo recalculado no bootstrap.** A inspeção (d) estimou ~13 mil linhas genéricas locais, ~4,9 mil
   delas duplicando o STYNX (§7). R-0021 (outbox, assinatura, offline-sync, notificações), R-0022
   (SSE backend e Angular, tenancy, assinatura final) e R-0023 (autorização, sessão) removem a maior
   parte. TASK-0001 refaz a contagem **com comandos reprodutíveis** (`find`/`wc -l`, mesmas exclusões
   da inspeção: specs, `dist/`, gerados, `node_modules`) e publica o inventário
   `work/rounds/R-0024/dedup-inventory.md`: item, caminho, linhas, classe (UP/DUP/LOC), estado após
   R-0021…R-0023 e **destino** (remover e adotar símbolo STYNX publicado ≤ 1.5.0; mover para o kit;
   manter local com desvio registrado + item da próxima minor do STYNX). A mesma contagem é repetida
   no fechamento (TASK-0013).
2. **`@detran/ui` como kit de app** (hoje 209 linhas TS + 101 CSS em `packages/ui/src`): uma única cópia
   de: (a) **bootstrap e i18n** — `loadCatalog` compõe os catálogos pt-BR de
   `@stynx-nyx/angular-{ui,auth,tenancy,i18n}/catalogs/pt-BR.json` + fallback do kit + catálogo do app,
   sem sobrescrever (WP-0 passo 3.4, `wp0-stynx-1-3-1-migration.md` §3 item 4); estratégia de título;
   harness de i18n para testes; (b) **shell** com grupos de navegação, _skip link_, região `aria-live`,
   tema persistido e rótulos i18n (hoje `aria-label` fixo em pt); (c) **error boundary** —
   classificação `HttpErrorResponse` → envelope `StynxError` → tipo → `messageKey`, banner e páginas
   utilitárias (proibido, não encontrado, indisponível, _callback_ de auth), usando
   `ErrorInterceptor`/`ErrorBannerService` de `@stynx-nyx/angular` onde servirem; o mapa de códigos por
   app vira **dado** do app; (d) **cliente de comando** — `Idempotency-Key` (hoje
   `apps/{rait,portal}/web/src/app/data/idempotency-key.ts`), `If-Match` com armazenamento de ETag
   (`apps/rait/web/src/app/data/api/etag-store.ts`), mapeamento de erros e estado de envio
   (`apps/rait/web/src/app/data/facades/command.ts`); (e) **costura SSE canônica** — o serviço fino por app que R-0022 deixou sobre
   `provideStynxEventStream` vira um provedor único do kit, com a configuração de cada app preservada
   (OD-R22-03), sem parser local;
   (f) **sessão e guardas por política** — fachada de sessão por signals, guardas de rota e
   `*stynxHasPermission` com o curinga publicado em 1.5.0 (sai `dashCan`,
   `apps/dashboard/web/src/app/core/can.directive.ts`; fecha OD-D16-015); (g) **utilitários** —
   `runtime-config`, carregamento de rotas por manifesto; (h) **dublês de teste** (`@detran/ui/testing`)
   só onde `@stynx-nyx/angular-auth/testing` 1.5.0 continuar vazio; (i) **estilos** — TEAT web e TEAT
   mobile passam a importar `@detran/ui/styles` (hoje só RAIT, DASHBOARD e Portal; OD-R24-01). Peças com item
   UPS (`UPS-NGERR-*` U9, `UPS-SHELL-*` U10, `UPS-NGIDEM-01` U14, `UPS-TEST-*` U11, curinga
   `UPS-AUTHZ-06`) usam o símbolo publicado em 1.5.0; item SHOULD ausente → o kit hospeda **uma** cópia
   consolidada da implementação local existente (não uma nova), com desvio e item de _backlog_. A troca
   de `dashCan` fica aqui, e não em R-0023 como lista a especificação §2 (U6): R-0023 não toca `apps/`
   para manter os locks disjuntos com os CTGs de frontend desta rodada.
3. **Geração do cliente de comando.** `tools/contracts/generate-clients.mjs` passa a emitir, além dos
   tipos, **descritores de comando** (operação, método, caminho, exige `If-Match`, idempotente) a
   partir dos `*.commands.openapi.json`, consumidos pelo cliente do kit — o "cliente de comando gerado"
   da campanha §4. Sem mudança nos contratos.
4. **Apps sobre o kit.** RAIT web, DASHBOARD, Portal, TEAT web e TEAT mobile trocam as cópias locais
   pelo kit (inspeção (d) §4.5: SSE residual, error boundary ~1.590 l., shells ~1.090 l.,
   `runtime-config` 4×, `title.strategy` 3×, `i18n-fallback` 3×, `i18n-token-key` 2×, `auth-callback`
   3×, `manifest-routes` 3×, `idempotency-key` 2×, stubs de sessão 3×, `teat-translate.pipe` e
   `i18n.service` do TEAT mobile); uploaders com hash (`portal/.../attachment-uploader.component.ts`,
   `dashboard/.../evidence-attach.component.ts`) passam a `StynxDocumentUploadComponent`
   (`@stynx-nyx/angular-storage`) se a caracterização provar o mesmo contrato de hash; resíduos saem
   (`apps/teat/web/src/app/shared/data-table.component.ts` vazio,
   `apps/teat/web/src/app/data/kernel STYNX.client.ts`). Imports diretos de `angular-ui`/`angular-auth`
   nos apps (RAIT: 61 em 2026-09-26) passam pelo kit, salvo exceção registrada no guia.
5. **Backend (após R-0023).** Consumo dos itens que a especificação `C-0002-stynx-upstream-spec.md`
   §2 atribui a R-0024, pela sua regra de consumo (§7): **MUST ausente → checkpoint do CTG consumidor
   (OD-R22-02), sem _shim_ nem cópia do código STYNX; SHOULD/MAY ausente → código local fica, com desvio
   na ADR "Divisão STYNX × DETRAN" criada por R-0021 e item de volta ao _backlog_ de upstream para a
   próxima minor** — nunca reimplementado de outra forma. (a) **MUST — CTG-0004:** U4 `UPS-JOB-01…04`
   (`backend/app/src/boat-renaest-job.{service,providers}.ts`,
   `backend/domains/dashboard/monitor/src/handwritten/cycle/clock.sweeper.ts`); U5 `UPS-TXN-01…05`
   (`backend/app/src/rait-transactional-audit.interceptor.ts`,
   `backend/domains/portal/requests/src/handwritten/idempotency.service.ts`, `withTenantContext` se
   `UPS-TXN-05` sair). (b) **SHOULD/P2–P3 — CTG-0005:** U8 `UPS-IFM-*`
   (`backend/domains/shared/src/errors/if-match.ts` e a cópia interna
   `backend/domains/dashboard/monitor/src/handwritten/cycle/if-match.ts`); U11 `UPS-TEST-02…04`
   (_duck-typing_ `asQueryable` em 20 arquivos); U12 `UPS-HOOK-*` (`backend/app/src/renach-webhook.guard.ts`);
   U13 `UPS-CAL-*` (`backend/domains/inf/deadlines/src/{calendar,clock,local-date}.ts`); extras de
   offline-sync `UPS-OFS-01…04` deixados por R-0021. (c) **Já publicados, sem UPS:**
   `backend/app/src/detran-error.filter.ts` × `StynxErrorFilter` (`@stynx-nyx/core`, OD-R24-02);
   `packages/sefaz-adapter/src/http-adapter.ts`,
   `backend/domains/ch/biometrics/src/biometric-verification.http-adapter.ts` e
   `backend/domains/ch/clinical-network/src/council-verification.http-adapter.ts` ×
   `@stynx-nyx/integration-adapter`; dependências mortas que R-0021 não tiver removido (`@stynx-nyx/audit` em `backend/app`; em
   `apps/boat/mobile`, 4 deps STYNX declaradas e só `angular-i18n` importada em 2026-09-26); resíduo
   `backend/domains/ops/example`. O escopo da 1.5.0 foi decidido em OD-S15-01 (todos os 15 obrigatórios; o texto a seguir sobre P2/P3 ficarem para
   1.5.x): o que não vier fica pela regra acima.
6. **Padrão de ligação único (entregável da campanha §4).** `docs/framework/arch/frontend-wiring-pattern.md`:
   cliente de comando gerado; `If-Match` e `Idempotency-Key`; mapeamento de erros; estados de tela
   (vazio, carregando, erro, indisponível, bloqueado por decisão, sem permissão); SSE canônico; guardas
   por política; forma do **delta do manifesto de disponibilidade** que cada rodada da fase D entrega
   (um arquivo por rodada, consumido por R-0030); lista do que é proibido (cópia local de qualquer peça
   do kit, `EventSource` sem bearer, chave de política literal fora do manifesto). Rascunho no
   CTG-0001, versão final com os símbolos reais no CTG-0006.
7. **Documentação:** emenda da ADR "Divisão STYNX × DETRAN" (criada por R-0021; número conferido com
   `ls docs/meta/adr`) com as adoções e desvios desta rodada e o _backlog_ de upstream remanescente
   (próxima minor), e adenda de fechamento em `C-0002-stynx-upstream-spec.md` §8 (itens consumidos e
   remanescentes); emenda da ADR-0006 do kit (corpo ainda em Angular 21); `detran-ui-guide.md`;
   `open-issues.md` DT-001 (registry já publica os pacotes) se R-0018 não o tiver corrigido; `waves.md`;
   `backlog.md`.

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço   | Lock                                                                                                             | Depende de                                  | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------- | -------------------- | ------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r24-contracts`, `MOD-kb-open-decisions`                                                                     | —                                           | `dedup-inventory.md` (Meta 1, com os comandos de contagem); `contracts/CTG-0002.md` (API pública do kit: símbolos, subpaths `.`/`./styles`/`./testing`, precedência de catálogos STYNX < kit < app, tabela de códigos por app como dado, dependências STYNX novas do kit); `contracts/CTG-0003.md` (mapa arquivo local → peça do kit por app; mudanças visíveis permitidas e só elas); `contracts/CTG-0004.md` e `contracts/CTG-0005.md` (backend, provisórios até R-0023 publicar os CTG-0003/0004); critérios C-0n-nn; OD-R24-01/02 no registro canônico             |
| TASK-0002 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-arch-wiring-pattern`                                                                                        | TASK-0001                                   | `docs/framework/arch/frontend-wiring-pattern.md` (rascunho, `status: draft`), Meta 6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| TASK-0003 | Inspector            | inspector-tests     | Opus 5.5 / médio | `MOD-ui-tests`, `MOD-web-tests-characterization`, `MOD-contracts-tests`                                          | TASK-0001                                   | (a) caracterização **nos apps, sobre o código atual**: tabela de classificação de erro por app (status × código → tipo → `messageKey`), cabeçalhos `If-Match`/`Idempotency-Key` por comando já ligado, estratégia de título, `runtime-config`, contrato de hash dos uploaders, chaves STYNX exibidas cruas (marcadas `it.fails` como defeito conhecido que o CTG-0003 inverte, única inversão permitida); (b) specs do kit em `packages/ui/test/**` para a API de C-02; (c) `tools/contracts/tests/generate-clients.test.mjs` estendido para os descritores de comando |
| TASK-0004 | Engineer             | engineer-frontend   | Opus 5.5 / alto  | `MOD-ui-kit`                                                                                                     | TASK-0003                                   | kit completo (`packages/ui/src/lib/**`, `styles/`, `package.json`, `ng-package.json`); specs do kit verdes sem edição; dependências novas → `pnpm install` e lockfile pelo maestro                                                                                                                                                                                                                                                                                                                                                                                     |
| TASK-0005 | Engineer             | engineer-backend    | Sonnet 5 / médio | `MOD-contracts-generator`                                                                                        | TASK-0003                                   | `tools/contracts/generate-clients.mjs` com descritores; `pnpm contracts:clients` regenera `packages/api-clients/src/generated/**` (nunca editado à mão); segunda execução sem diff                                                                                                                                                                                                                                                                                                                                                                                     |
| TASK-0006 | Engineer             | engineer-frontend   | Opus 5.5 / médio | `MOD-rait-web-app`, `MOD-teat-web-app`                                                                           | TASK-0004, TASK-0005                        | RAIT web e TEAT web sobre o kit; caracterização verde sem edição (salvo a inversão prevista)                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| TASK-0007 | Engineer             | engineer-frontend   | Opus 5.5 / médio | `MOD-dashboard-web-app`, `MOD-portal-web-app`                                                                    | TASK-0004, TASK-0005                        | DASHBOARD e Portal sobre o kit; `dashCan` removido; uploaders conforme C-03                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| TASK-0008 | Engineer             | engineer-frontend   | Sonnet 5 / médio | `MOD-teat-mobile-app`, `MOD-boat-mobile-deps`                                                                    | TASK-0004                                   | TEAT mobile sobre o kit (i18n, estilos conforme OD-R24-01; `field-shell` preservado — TEAT mobile produtivo está fora de escopo, C-0002 §6); deps STYNX sem import de `apps/boat/mobile` removidas (conferir contra R-0028)                                                                                                                                                                                                                                                                                                                                            |
| TASK-0009 | Architect            | architect-blueprint | Opus 5.5 / médio | `MOD-r24-contracts`                                                                                              | CTG-0003/0004 de R-0023 no branch publicado | adenda a `contracts/CTG-0004.md` e `contracts/CTG-0005.md` sobre o `main` pós-R-0023 e a tabela de conformidade 1.5.0 (spec §7): lista fechada de adoções, de checkpoints (MUST ausente) e de desvios (SHOULD ausente)                                                                                                                                                                                                                                                                                                                                                 |
| TASK-0010 | Inspector            | inspector-tests     | Opus 5.5 / médio | `MOD-app-tests-dedup`, `MOD-adapter-tests`                                                                       | TASK-0009                                   | caracterização backend verde sobre o código atual: job BOAT/DASHBOARD com ator técnico e RLS do tenant (outro tenant → zero linhas); auditoria e idempotência na transação (rollback sem evento e com chave liberada, replay, 409); envelope de erro por código com locale; 428/412 de `If-Match`; HMAC e janela de relógio do webhook; resiliência dos três adapters com servidor falso local; contrato dos dublês `Transaction`                                                                                                                                      |
| TASK-0011 | Engineer             | engineer-backend    | Opus 5.5 / alto  | `MOD-app-module`, `MOD-app-jobs`, `MOD-app-audit-idempotency`, `MOD-portal-requests`                             | TASK-0010                                   | U4/U5 (MUST) sobre os símbolos publicados; remoção dos agendadores e interceptores locais; `verify:authz-matrix` com diff vazio; specs verdes sem edição                                                                                                                                                                                                                                                                                                                                                                                                               |
| TASK-0012 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-app-module`, `MOD-shared-errors`, `MOD-adapters-http`, `MOD-backend-test-doubles`, `MOD-deadlines-calendar` | TASK-0011                                   | itens (b) e (c) da Meta 5: adoções, remoções, desvios registrados no inventário; specs verdes sem edição                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| TASK-0013 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / médio | `MOD-docs`, `MOD-adr`, `MOD-arch-wiring-pattern`, `MOD-upstream-spec`                                            | TASK-0006…0008, TASK-0012                   | `frontend-wiring-pattern.md` final (símbolos reais do kit, `status` atualizado); emenda da ADR de divisão (R-0021); emenda ADR-0006 (kit); adenda da spec §8; `detran-ui-guide.md`; DT-001 se pendente; recontagem final no inventário; `waves.md` §Histórico; `backlog.md`                                                                                                                                                                                                                                                                                            |

CTG-0001 = 0001 → 0002 (documentos; nenhum código). CTG-0002 = 0003 → 0004 ∥ 0005 (kit e gerador;
fronteiras disjuntas). CTG-0003 = 0006 ∥ 0007 ∥ 0008 (no máximo três simultâneas; locks por app).
CTG-0004 = 0009 → 0010 → 0011 (backend MUST; após o CTG-0003/0004 de R-0023 existirem no branch
publicado — empilhar; o PR final espera o merge). CTG-0005 = 0012 (backend SHOULD e adoções sem UPS).
CTG-0006 = 0013. Commits por CTG na branch única; um PR no fim (OD-C2-005). CTG-0004/0005 podem ser
desenvolvidos antes de o CTG-0003 terminar (locks disjuntos).

**Tríade e ordem de prova.** A caracterização de TASK-0003 roda **verde sobre o código atual** (saída
no relatório, sha citado) antes de qualquer remoção; o Engineer nunca a edita. A única mudança de
comportamento permitida no frontend é a lista fechada de C-03 (catálogos STYNX em pt-BR, rótulos do
shell i18n, _skip link_/`aria-live`, estilos do TEAT conforme OD-R24-01). No backend, o envelope de
erro e a matriz de autorização de R-0023 ficam **idênticos** (OD-R24-02).

**Checkpoints do maestro (Engineer):** (a) bootstrap — confirmar pin 1.5.0 e ler os `.d.ts` de
`@stynx-nyx/{angular,angular-ui,angular-auth,angular-i18n,angular-storage,core,integration-adapter,testing,jobs,idempotency,backend}`
e a tabela de conformidade (spec §7);
(b) depois de TASK-0004/0005, `pnpm install` + `pnpm-lock.yaml` + `pnpm --filter @detran/ui build`
antes de liberar CTG-0003 (os apps consomem o `dist` do kit); (c) antes de TASK-0009, confirmar que o
CTG-0003 e o CTG-0004 de R-0023 existem em `origin/orchestra/authz-unification` (ou R-0023 em
`origin/main`) e integrá-los por `git merge --no-edit`; senão checkpoint dos CTG-0004/0005 e seguir
com CTG-0003; (d) `pnpm check` e `pnpm backend:test:ci` uma vez, na sequência final (OD-C2-005).

## Critérios de aceitação (comandos → resultado)

Todos existem hoje; `verify:authz-matrix` é entregável de R-0023 e precisa estar no branch
(empilhado de R-0023) para o CTG-0004 e em `main` para o PR final.

- `pnpm --filter @detran/ui typecheck|test|build` → verdes, com os specs de C-02 sem `skip`.
- `pnpm --filter @detran/rait-web lint|test|build|typecheck`, idem `@detran/dashboard-web`,
  `@detran/portal-web`, `@detran/teat-web`, `@detran/teat-mobile`, `@detran/boat-mobile` → verdes;
  caracterização presente, sem `skip`; os `it.fails` de TASK-0003 invertidos só no CTG-0003.
- `pnpm contracts:test` → verde; `pnpm contracts:clients` duas vezes seguidas → a segunda sem diff em
  `packages/api-clients`; `pnpm contracts:check` → OK.
- Verificações de arquivo após CTG-0003: `find apps -path '*/node_modules' -prune -o \( -name 'i18n-fallback.ts' -o -name 'i18n-token-key.ts' -o -name 'title.strategy.ts' -o -name 'runtime-config.ts' -o -name 'idempotency-key.ts' -o -name 'can.directive.ts' -o -name 'data-table.component.ts' -o -name 'stream-transport.ts' \) -print`
  → vazio fora de `node_modules`/`dist`; `grep -rn "dashCan" apps --include='*.ts'` → vazio;
  `grep -rln "@detran/ui/styles" apps/teat` → os dois apps TEAT (se OD-R24-01 = (a)).
- `pnpm verify:authz-matrix` → diff vazio após CTG-0004 e CTG-0005; `pnpm backend:test:ci` → verde;
  `pnpm verify:decorators` → OK; `pnpm verify:role-catalog` → inalterado.
- `pnpm verify:stynx-pin` (gate de R-0021, exigindo 1.5.0 desde R-0022) → OK, 0 divergências, inclusive
  com as dependências STYNX novas do kit.
- `dedup-inventory.md` final: cada item DUP removido ou com desvio registrado (ADR de divisão de
  R-0021) e item da próxima minor; recontagem com os mesmos comandos do bootstrap.
- `pnpm docs:kb:check` → OK; `pnpm docs:kb:publish-check` → OK; `pnpm format:check` → OK;
  `pnpm check` → verde no fim de cada CTG.
- DEVAI: `devai evidence record` por CTG e `evidence verify` OK; `audit observe` no sha exato de cada
  merge; fechamento com `devai round close` **e** `devai round seal`, com a âncora na cadeia.

## Mapa entregável → definições

| Entregável         | Definição                                                                                                                                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| inventário e saldo | `work/campaigns/C-0002-inspecao-2026-09-25/d-stynx.md` §4, §7 (método e exclusões); planos e closures de R-0021, R-0022, R-0023                                                                                                              |
| kit                | ADR-0006 (kit) e `docs/framework/arch/detran-ui-guide.md`; `wp0-stynx-1-3-1-migration.md` §3 item 4; `.d.ts` 1.5.0 de `@stynx-nyx/angular*`; `packages/ui/src/**`                                                                            |
| cliente de comando | `tools/contracts/generate-clients.mjs`; `docs/framework/contracts/*.commands.openapi.json`; `rait-web-frontend.md`/`rait-web-forms.md` (If-Match, idempotência); catálogos de erro `rait-`, `portal-`, `dashboard-`, `teat-error-catalog.md` |
| SSE                | `rait-events-sse-contract.md` e o contrato SSE comum que R-0022 publicar; DIVERGE-1 (`work/rounds/R-0014/plan.md`)                                                                                                                           |
| padrão de ligação  | C-0002 §4 (lista de seis itens) e §3.5 (delta do manifesto); `work/rounds/R-0030/plan.md` quando existir                                                                                                                                     |
| backend            | `@stynx-nyx/core` (`StynxErrorFilter`), `@stynx-nyx/integration-adapter` (molde: `packages/senatran-adapter`), `@stynx-nyx/testing`; ADR-0008                                                                                                |
| upstream           | `work/campaigns/C-0002-stynx-upstream-spec.md` (tabela de conformidade); d-stynx §6 (U1–U15)                                                                                                                                                 |

## Riscos

- **Mudança visível disfarçada de refatoração.** Cada app tem contrato próprio de tela; a extração
  preserva o comportamento (caracterização) e só a lista fechada de C-03 muda.
- **Divergência de política de erro entre apps.** O núcleo vai ao kit; os mapas de código continuam
  por app como dados; unificar mensagens é decisão de produto fora de 7b.
- **Kit como gargalo da fase D.** API pública fixada em C-02 e no padrão de ligação; mudança de API
  depois do CTG-0006 exige adenda e aviso às rodadas R-0025…R-0029.
- **Envelope de erro do backend.** Trocar `DetranErrorFilter` por `StynxErrorFilter` pode mudar corpo e
  tradução: só com snapshot idêntico (OD-R24-02); a matriz de R-0023 registra `code`.
- **Adapters com integração real.** Caracterização só com servidor falso local; nenhuma chamada a
  SEFAZ, biometria ou conselho reais (C-0002 §4).
- **Saldo menor que o previsto.** Se R-0021…R-0023 já tiverem removido quase tudo, a rodada entrega o
  kit, o padrão e o inventário; não se inventa trabalho para bater a estimativa.

## Lições aplicadas (C-0001 e C-0002 §4)

- **Relatórios versionados** com `git add -f` em `work/rounds/R-0024/reports/` até R-0018 corrigir o
  `.gitignore`; conferir `find <dir> -type f` × `git ls-files <dir>` depois de cada `add` (R-0016: o
  padrão `reports/` escondeu `features/reports/` do git e do Prettier).
- **Critérios imutáveis**; critério substituído aparece como **não cumprido**; proibido repetir as
  substituições de R-0013/R-0014 (axe no lugar de Lighthouse; testes focais no lugar da suíte
  integral) e o waiver SQL2 de R-0007.
- **ODs no registro canônico** (`open-decisions-rait.md` §C-0002) no commit do CTG-0001 (entra no PR
  final).
- **Âncora da prova**, **orçamento** (`budget.json`, checkpoint a 80 %) e **caracterização antes de
  troca**, como em C-0002 §4.
- Padrão de app de R-0012: scripts `build|test|lint|typecheck` e extensão de `pnpm check`; pacote ou
  dependência nova → `pnpm install` pelo maestro e lockfile no commit do grupo (CI `--frozen-lockfile`).
- Chaves i18n não são parâmetros (OD-P46): namespaces novos do kit entram na allowlist de
  `parameter-catalogue.md` §Namespaces i18n, seguidos de `pnpm parameters:generate` e
  `pnpm verify:parameter-catalogue`; specs sem chave de parâmetro literal.
- Genérico ausente de S-1.5 → desvio registrado + próxima minor; nunca cópia local nova de código STYNX.

## Decisões pendentes do Owner (ODs novas desta proposta)

| OD        | Pergunta                                                                           | Opções                                                                                                                                                                                            | Recomendação do Architect                                                                                                                               |
| --------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OD-R24-01 | Mudanças visíveis do kit no TEAT (hoje sem `@detran/ui/styles`)                    | (a) TEAT web e TEAT mobile importam os estilos e tokens do kit agora; TEAT web adota o shell; TEAT mobile mantém `field-shell`; (b) adiar o TEAT web para R-0029 e deixar o TEAT mobile como está | (a): R-0029 liga o TEAT web uma única vez já sobre o kit; o shell de campo do mobile fica, pois o TEAT mobile produtivo está fora de escopo (C-0002 §6) |
| OD-R24-02 | `DetranErrorFilter` × `StynxErrorFilter` quando o envelope ou a tradução diferirem | (a) adotar só com envelope idêntico por código; senão manter o filtro local com desvio e item para a próxima minor; (b) aceitar a mudança de envelope e ajustar os apps                           | (a): a troca de envelope quebraria os mapas de erro dos cinco apps durante a fase D                                                                     |

Respeitadas sem reabrir: OD-C2-001…004, OD-S15-01, OD-R22-02 (regra de MUST ausente), OD-P46, OD-D16-015 (fechada aqui pelo curinga publicado), e as
decisões de R-0021…R-0023 registradas nos respectivos planos.

## Decisões do maestro

## Concorrência

## Triagem

## Adendas

## Bloqueios

## Retomada

## Leitura
