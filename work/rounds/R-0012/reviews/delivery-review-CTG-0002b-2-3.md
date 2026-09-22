# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `rait-web` (rodada `R-0012`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/rait-web`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/rait-build-pack.md` — apenas a seção do WP `WP-F` e o "mapa entregável → definições"
4. `work/rounds/R-0012/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0012/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0012/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0012",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0012/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Terceiro ciclo — restrito ao único achado de `delivery-review-CTG-0002b-2-2.json`** (desvio B4): `defense-pool-queue.page.spec.ts` — `claim-next` agora com três `it` separados (message; `confirm` → `runMock` uma vez com `'rait-case:claim-next'`; `dismissed` → não chamado) e `claimNext: commandMethod('rait-case:claim-next', command)` no stub; `test` do módulo `fila` 43/43; `typecheck`/`lint` OK. Avalie somente essa correção. Texto do ciclo 2 (adenda A15,
Inspector it. 5): C-2B-71 agora cobre as **45** ações confirmáveis, cada uma com três `it` no spec
da sua página — diálogo com `message` = chave `confirm.<x>`; `confirm` chama a facade exatamente uma
vez com o comando M8 (`commandMethod(m8, runner)` em `facade.stub.ts`); `dismissed` não chama —
tabela ação → página no relatório `reports/TASK-0014.md`; dois papéis corrigidos nos specs
(`batches.approve` → `rait-chair`; `live-session.view_request` → `rait-rapporteur`). Também A16
(it. 6): o harness de `core/shortcut.service.spec.ts` provê `StynxSessionService` (flake NG0201 do
coletor). Gates: `test` → Tests 3686 passed | 139 todo (3825), 3 execuções sem erro; `lint`/
`typecheck` OK; `pnpm check` completo em execução. Avalie somente essas correções. Contexto do
primeiro ciclo, mantido para referência: Grupo acoplado CTG-0002b-2 (WP-F: 50 páginas, rotas por módulo e
matriz de autorização por ação × papel; adenda A8 par 2).** Tríade: Architect TASK-0007
(`contracts/CTG-0002b.md` §6 páginas/§6.2 matriz, §8 C-2B-61…83) → Architect (transcrição)
TASK-0016 (45 chaves `confirm.*` das fichas §6; A12/A13) → Inspector TASK-0014 (4 iterações: 67
specs em `features/`, `facade.stub.ts` (A9), 455 `it` de matriz + C-2A-11/22 atualizados, C-2B-81/82;
A14) → Engineer TASK-0015 (Opus, 2 iterações: 50 páginas L1/L2 + `CaseLayoutPage`, 12 rotas ligadas,
apoio `list-url-sync`/`page-support`/…, `clocks-panel` NG8102). Adendas base de julgamento:
`plan.md` A8, A9, A12, A13, **A14** (7 correções de spec + 1 de `shared/`). Relatórios:
`work/rounds/R-0012/reports/TASK-0014.md`, `TASK-0015.md`, `TASK-0016.md`.

Gates rodados pelo maestro sobre a árvore final: `pnpm --filter @detran/rait-web typecheck|lint|test|build`
→ verdes (Test Files 133 passed | 1 skipped; Tests 3575 passed | 139 todo (3714); bundle sem
warnings); `pnpm verify:parameter-catalogue` → OK (57); `pnpm format:check` → OK; `pnpm check`
completo em execução (anexado no PR).

Leia na worktree (não anexado inline): `apps/rait/web/src/app/features/**` (lista abaixo),
`apps/rait/web/src/testing/facade.stub.ts`, `apps/rait/web/src/app/i18n/rait.pt-BR.json` (chaves
`confirm.*`), `work/rounds/R-0012/contracts/CTG-0002b.md` §6, §8. Pontos a julgar: rubrica 5
(nada inventado: corpos M8 só com campos do formulário; rótulos sem chave = nome do campo, OD-R12-028;
OD-R12-053/054 registradas), 7 (specs ajustados só por adenda numerada A14; `todo` só com OD;
componentes inline em vez de arquivos próprios — refatoração sem efeito nos critérios, registrada),
8 (tokens por composição; `*stynxHasPermission` do kit), 11 (fronteira §13: comandos `todo`,
composição de duas facades pendente — registrado em "Fora do escopo"), 13 (matriz §6.2: 455 `it`,
positivos por papel concedido e negativos por omitido, montagem isolada para rotas restritas — A14 4).

Arquivos de produção de `features/` (sem specs):

```text
apps/rait/web/src/app/features/admin/admin.routes.ts
apps/rait/web/src/app/features/arquivo/arquivo.routes.ts
apps/rait/web/src/app/features/arquivo/pages/archive-search.page.ts
apps/rait/web/src/app/features/arquivo/pages/retention-queue.page.ts
apps/rait/web/src/app/features/arquivo/pages/sealed-dossier.page.ts
apps/rait/web/src/app/features/assinatura/assinatura.routes.ts
apps/rait/web/src/app/features/assinatura/pages/signing-decision.page.ts
apps/rait/web/src/app/features/assinatura/pages/signing-queue.page.ts
apps/rait/web/src/app/features/auditoria/auditoria.routes.ts
apps/rait/web/src/app/features/auditoria/pages/audit-trail.page.ts
apps/rait/web/src/app/features/autoridade/autoridade.routes.ts
apps/rait/web/src/app/features/autoridade/pages/provided-appeals.page.ts
apps/rait/web/src/app/features/caso/case-route.ts
apps/rait/web/src/app/features/caso/caso.routes.ts
apps/rait/web/src/app/features/caso/deadline-kind.ts
apps/rait/web/src/app/features/caso/pages/case-decision.page.ts
apps/rait/web/src/app/features/caso/pages/case-layout.page.ts
apps/rait/web/src/app/features/caso/pages/case-summary.page.ts
apps/rait/web/src/app/features/caso/pages/communications.page.ts
apps/rait/web/src/app/features/caso/pages/deadlines.page.ts
apps/rait/web/src/app/features/caso/pages/dossier.page.ts
apps/rait/web/src/app/features/caso/pages/draft.page.ts
apps/rait/web/src/app/features/caso/pages/history.page.ts
apps/rait/web/src/app/features/caso/pages/impediments.page.ts
apps/rait/web/src/app/features/caso/pages/inquiries.page.ts
apps/rait/web/src/app/features/caso/pages/parties.page.ts
apps/rait/web/src/app/features/caso/pages/triage.page.ts
apps/rait/web/src/app/features/colegiado/colegiado-route.ts
apps/rait/web/src/app/features/colegiado/colegiado.routes.ts
apps/rait/web/src/app/features/colegiado/pages/agenda-builder.page.ts
apps/rait/web/src/app/features/colegiado/pages/batch-detail.page.ts
apps/rait/web/src/app/features/colegiado/pages/batches.page.ts
apps/rait/web/src/app/features/colegiado/pages/bench.page.ts
apps/rait/web/src/app/features/colegiado/pages/extraordinary.page.ts
apps/rait/web/src/app/features/colegiado/pages/live-session.page.ts
apps/rait/web/src/app/features/colegiado/pages/minutes.page.ts
apps/rait/web/src/app/features/colegiado/pages/opinion.page.ts
apps/rait/web/src/app/features/colegiado/pages/rapporteur-cases.page.ts
apps/rait/web/src/app/features/colegiado/pages/sessions.page.ts
apps/rait/web/src/app/features/colegiado/pages/views.page.ts
apps/rait/web/src/app/features/conta/conta.routes.ts
apps/rait/web/src/app/features/conta/pages/account.page.ts
apps/rait/web/src/app/features/fila/fila.routes.ts
apps/rait/web/src/app/features/fila/pages/defense-pool-queue.page.ts
apps/rait/web/src/app/features/fila/pages/rapporteur-queue.page.ts
apps/rait/web/src/app/features/financeiro/financeiro.routes.ts
apps/rait/web/src/app/features/gestao/gestao.routes.ts
apps/rait/web/src/app/features/gestao/pages/capacity-plan.page.ts
apps/rait/web/src/app/features/gestao/pages/incidents.page.ts
apps/rait/web/src/app/features/gestao/pages/production.page.ts
apps/rait/web/src/app/features/gestao/pages/quality-sampling.page.ts
apps/rait/web/src/app/features/gestao/pages/risk-case-drilldown.page.ts
apps/rait/web/src/app/features/gestao/pages/risk-radar.page.ts
apps/rait/web/src/app/features/gestao/pages/units.page.ts
apps/rait/web/src/app/features/integracoes/integracoes.routes.ts
apps/rait/web/src/app/features/l1-list.ts
apps/rait/web/src/app/features/list-url-sync.ts
apps/rait/web/src/app/features/organizacao/organizacao.routes.ts
apps/rait/web/src/app/features/organizacao/pages/members.page.ts
apps/rait/web/src/app/features/organizacao/pages/pools.page.ts
apps/rait/web/src/app/features/page-support.ts
apps/rait/web/src/app/features/painel/pages/resume-tray.page.ts
apps/rait/web/src/app/features/painel/pages/shift-dashboard.page.ts
apps/rait/web/src/app/features/painel/painel.routes.ts
apps/rait/web/src/app/features/protocolo/pages/intake-list.page.ts
apps/rait/web/src/app/features/protocolo/pages/intake-new.page.ts
apps/rait/web/src/app/features/protocolo/pages/pending-content.page.ts
apps/rait/web/src/app/features/protocolo/pages/redirects.page.ts
apps/rait/web/src/app/features/protocolo/pages/remittances.page.ts
apps/rait/web/src/app/features/protocolo/pages/withdrawals.page.ts
apps/rait/web/src/app/features/protocolo/protocolo.routes.ts
apps/rait/web/src/app/features/queue-columns.ts
apps/rait/web/src/app/features/queue-items.ts
apps/rait/web/src/app/features/route-params.ts
```

`git status --short` (sem `work/`):

```text
 M apps/rait/web/src/app/app.guards-matrix.presence.spec.ts
 M apps/rait/web/src/app/app.routes.spec.ts
 M apps/rait/web/src/app/core/guards.spec.ts
 M apps/rait/web/src/app/features/arquivo/arquivo.routes.ts
 M apps/rait/web/src/app/features/assinatura/assinatura.routes.ts
 M apps/rait/web/src/app/features/auditoria/auditoria.routes.ts
 M apps/rait/web/src/app/features/autoridade/autoridade.routes.ts
 M apps/rait/web/src/app/features/caso/caso.routes.ts
 M apps/rait/web/src/app/features/colegiado/colegiado.routes.ts
 M apps/rait/web/src/app/features/conta/conta.routes.ts
 M apps/rait/web/src/app/features/fila/fila.routes.ts
 M apps/rait/web/src/app/features/gestao/gestao.routes.ts
 M apps/rait/web/src/app/features/organizacao/organizacao.routes.ts
 M apps/rait/web/src/app/features/painel/painel.routes.ts
 M apps/rait/web/src/app/features/protocolo/protocolo.routes.ts
 M apps/rait/web/src/app/i18n/i18n.spec.ts
 M apps/rait/web/src/app/i18n/rait.pt-BR.json
 M apps/rait/web/src/app/screens/screens.spec.ts
 M apps/rait/web/src/app/shared/clocks-panel.component.ts
?? apps/rait/web/src/app/features/admin/admin.routes.spec.ts
?? apps/rait/web/src/app/features/arquivo/arquivo.routes.spec.ts
?? apps/rait/web/src/app/features/arquivo/pages/
?? apps/rait/web/src/app/features/assinatura/assinatura.routes.spec.ts
?? apps/rait/web/src/app/features/assinatura/pages/
?? apps/rait/web/src/app/features/auditoria/auditoria.routes.spec.ts
?? apps/rait/web/src/app/features/auditoria/pages/
?? apps/rait/web/src/app/features/autoridade/autoridade.routes.spec.ts
?? apps/rait/web/src/app/features/autoridade/pages/
?? apps/rait/web/src/app/features/caso/case-route.ts
?? apps/rait/web/src/app/features/caso/caso.routes.spec.ts
?? apps/rait/web/src/app/features/caso/deadline-kind.ts
?? apps/rait/web/src/app/features/caso/pages/
?? apps/rait/web/src/app/features/colegiado/colegiado-route.ts
?? apps/rait/web/src/app/features/colegiado/colegiado.routes.spec.ts
?? apps/rait/web/src/app/features/colegiado/pages/
?? apps/rait/web/src/app/features/conta/conta.routes.spec.ts
?? apps/rait/web/src/app/features/conta/pages/
?? apps/rait/web/src/app/features/error-presentation.spec.ts
?? apps/rait/web/src/app/features/fila/fila.routes.spec.ts
?? apps/rait/web/src/app/features/fila/pages/
?? apps/rait/web/src/app/features/financeiro/financeiro.routes.spec.ts
?? apps/rait/web/src/app/features/gestao/gestao.routes.spec.ts
?? apps/rait/web/src/app/features/gestao/pages/
?? apps/rait/web/src/app/features/integracoes/integracoes.routes.spec.ts
?? apps/rait/web/src/app/features/l1-list.ts
?? apps/rait/web/src/app/features/list-url-sync.ts
?? apps/rait/web/src/app/features/organizacao/organizacao.routes.spec.ts
?? apps/rait/web/src/app/features/organizacao/pages/
?? apps/rait/web/src/app/features/page-support.ts
?? apps/rait/web/src/app/features/painel/pages/
?? apps/rait/web/src/app/features/painel/painel.routes.spec.ts
?? apps/rait/web/src/app/features/protocolo/pages/
?? apps/rait/web/src/app/features/protocolo/protocolo.routes.spec.ts
?? apps/rait/web/src/app/features/queue-columns.ts
?? apps/rait/web/src/app/features/queue-items.ts
?? apps/rait/web/src/app/features/route-params.ts
?? apps/rait/web/src/app/features/static-gates.spec.ts
?? apps/rait/web/src/testing/facade.stub.ts
?? docs/framework/arch/rait-web-forms.md
```

Diff dos arquivos rastreados alterados (rotas, `clocks-panel`, specs do CTG-0002a atualizados):

```diff
diff --git a/apps/rait/web/src/app/app.guards-matrix.presence.spec.ts b/apps/rait/web/src/app/app.guards-matrix.presence.spec.ts
index d2640cdf..67946618 100644
--- a/apps/rait/web/src/app/app.guards-matrix.presence.spec.ts
+++ b/apps/rait/web/src/app/app.guards-matrix.presence.spec.ts
@@ -6,7 +6,9 @@
 // entrega: `app.routes.ts`/`core/*` de produção ainda não existem.
 import { Router } from '@angular/router';
 import { TestBed } from '@angular/core/testing';
+import { StynxSessionService } from '@stynx-nyx/angular-auth';
 import { describe, expect, it } from 'vitest';
+import { ROLE_PERMISSIONS_FIXTURE } from '../testing/policy.fixture';
 import {
   RAIT_ROUTE_MANIFEST_FIXTURE,
   ROLE_HOME_FIXTURE,
@@ -22,6 +24,7 @@ import {
   FIXED_ENTITY_ID,
 } from '../testing/router-harness';
 import { createSessionStub } from '../testing/session.stub';
+import { createStynxSessionStub } from '../testing/stynx-session.stub';

 const MATRIX_ROWS = RAIT_ROUTE_MANIFEST_FIXTURE.filter(
   (entry) => entry.path !== 'sem-permissao' && entry.path !== 'auth/callback',
@@ -71,6 +74,14 @@ MATRIX_ROWS.forEach((entry) => {
     const { RaitSessionFacade } = await import('./core/session.facade');
     const harness = await createRaitRouterHarness([
       { provide: RaitSessionFacade, useValue: session },
+      {
+        provide: StynxSessionService,
+        useValue: createStynxSessionStub({
+          active: true,
+          permissions: [...ROLE_PERMISSIONS_FIXTURE[role]],
+          claims: { roles: [role] },
+        }),
+      },
     ]);
     const url = `/${substituteRouteParams(entry.path)}`;
     await harness.navigateByUrl(url);
diff --git a/apps/rait/web/src/app/app.routes.spec.ts b/apps/rait/web/src/app/app.routes.spec.ts
index a517b317..9f182ba1 100644
--- a/apps/rait/web/src/app/app.routes.spec.ts
+++ b/apps/rait/web/src/app/app.routes.spec.ts
@@ -200,15 +200,18 @@ describe('C-2A-10 — FEATURE_MOUNTS e ownsFirstSegment', () => {
   });
 });

-describe('C-2A-11 — página sem componente real renderiza o placeholder', () => {
+describe('C-2A-11 / C-2B-63 — página L0 (sem página real nesta rodada) renderiza o placeholder', () => {
+  // Atualização de C-2A-11 (CTG-0002b.md §8, "Atualização de C-2A-11"): com o CTG-0002b, as
+  // rotas L1/L2 passam a ter página real (C-2B-61/62) — o placeholder só continua para as 13
+  // rotas L0 do manifesto (M13). É o mesmo `it`, restrito por `level === 'L0'`.
   const placeholderEntries = RAIT_ROUTE_MANIFEST_FIXTURE.filter(
-    (entry) =>
-      entry.kind === 'page' &&
-      entry.path !== '' &&
-      entry.path !== 'sem-permissao' &&
-      entry.path !== 'auth/callback',
+    (entry) => entry.kind === 'page' && entry.level === 'L0',
   );

+  it('dado o manifesto quando filtradas as rotas L0 então são 13', () => {
+    expect(placeholderEntries).toHaveLength(13);
+  });
+
   placeholderEntries.forEach((entry) => {
     it(`dado a rota "${entry.path}" ativada com o papel mínimo quando renderizada então rait-placeholder-page com data-screen="${entry.screen ?? ''}"`, async () => {
       const minimalRole =
diff --git a/apps/rait/web/src/app/core/guards.spec.ts b/apps/rait/web/src/app/core/guards.spec.ts
index 5439eee4..779f8bf9 100644
--- a/apps/rait/web/src/app/core/guards.spec.ts
+++ b/apps/rait/web/src/app/core/guards.spec.ts
@@ -23,6 +23,7 @@ import {
   GROUP_REDIRECT_FIXTURE,
   type RaitRoleCode,
 } from '../../testing/route-manifest.fixture';
+import { ROLE_PERMISSIONS_FIXTURE } from '../../testing/policy.fixture';
 import { createSessionStub } from '../../testing/session.stub';
 import { createStynxSessionStub } from '../../testing/stynx-session.stub';
 import {
@@ -42,6 +43,32 @@ import {
 } from './session.facade';
 import { roleHomeFor, ROLE_HOME } from './role-home';

+/**
+ * Providers de `StynxSessionService` (`*stynxHasPermission`, usada pelas páginas reais de
+ * TASK-0015) para os `it`s de C-2A-23/24 que navegam até destinos concedidos — sem isso, a
+ * página no destino final lança `NullInjectorError` ao injetar `StynxSessionService`. Permissões
+ * são a união das de cada papel de `roles` (fixture); `role as RaitRoleCode` porque `Object.
+ * entries`/negativos como `'DPO'` alargam o tipo para `string` (`'DPO'` não tem linha na
+ * fixture — `?? []`).
+ */
+function stynxProviderFor(roles: readonly string[]) {
+  const permissions = [
+    ...new Set(
+      roles.flatMap(
+        (role) => ROLE_PERMISSIONS_FIXTURE[role as RaitRoleCode] ?? [],
+      ),
+    ),
+  ];
+  return {
+    provide: StynxSessionService,
+    useValue: createStynxSessionStub({
+      active: true,
+      permissions,
+      claims: { roles: [...roles] },
+    }),
+  };
+}
+
 function runCanActivate(
   guard: CanActivateFn,
   url = '/x',
@@ -271,7 +298,7 @@ describe('C-2A-22 — aba inicial de /casos/:id por papel (RAIT_ROLE_PRECEDENCE)
   ];

   cases.forEach(({ roles, tab }) => {
-    it(`dado /casos/${FIXED_ENTITY_ID} com sessão ${JSON.stringify(roles)} quando navegada então .../${tab}`, async () => {
+    it(`dado /casos/${FIXED_ENTITY_ID} com sessão ${JSON.stringify(roles)} quando navegada então .../${tab} com <rait-case-layout-page> como host do outlet (CTG-0002b, C-2B-64)`, async () => {
       const session = createSessionStub({ active: true, roles });
       const harness = await createRaitRouterHarness([
         { provide: RaitSessionFacade, useValue: session },
@@ -279,6 +306,15 @@ describe('C-2A-22 — aba inicial de /casos/:id por papel (RAIT_ROLE_PRECEDENCE)
       await harness.navigateByUrl(`/casos/${FIXED_ENTITY_ID}`);
       const router = TestBed.inject(Router);
       expect(router.url).toBe(`/casos/${FIXED_ENTITY_ID}/${tab}`);
+      // Seletor pela convenção comum de página do contrato §6 (`rait-<kebab>-page`), sem
+      // importar `CaseLayoutPageComponent` (TASK-0015, ainda inexistente): um import — estático
+      // ou dinâmico com especificador literal — de um módulo ausente quebra a transformação do
+      // arquivo inteiro no Vite/Vitest (falha observada), não só este `it`; a checagem por tag
+      // evita essa classe de falha e continua provando o mesmo fato (host do outlet).
+      const host = harness.fixture.nativeElement.querySelector(
+        'rait-case-layout-page',
+      );
+      expect(host).not.toBeNull();
     });
   });

@@ -302,6 +338,7 @@ describe('C-2A-23 — roleHomeFor / roleHomeRedirectGuard', () => {
       const session = createSessionStub({ active: true, roles: [role] });
       const harness = await createRaitRouterHarness([
         { provide: RaitSessionFacade, useValue: session },
+        stynxProviderFor([role]),
       ]);
       await harness.navigateByUrl('/');
       const router = TestBed.inject(Router);
@@ -326,6 +363,7 @@ describe('C-2A-23 — roleHomeFor / roleHomeRedirectGuard', () => {
     });
     const harness = await createRaitRouterHarness([
       { provide: RaitSessionFacade, useValue: session },
+      stynxProviderFor(['rait-finance', 'rait-manager']),
     ]);
     await harness.navigateByUrl('/');
     const router = TestBed.inject(Router);
@@ -336,6 +374,7 @@ describe('C-2A-23 — roleHomeFor / roleHomeRedirectGuard', () => {
     const session = createSessionStub({ active: true, roles: ['DPO'] });
     const harness = await createRaitRouterHarness([
       { provide: RaitSessionFacade, useValue: session },
+      stynxProviderFor(['DPO']),
     ]);
     await harness.navigateByUrl('/');
     const router = TestBed.inject(Router);
@@ -356,6 +395,7 @@ describe('C-2A-24 — groupRedirectGuard × GROUP_REDIRECT_FIXTURE', () => {
       const session = createSessionStub({ active: true, roles: [role] });
       const harness = await createRaitRouterHarness([
         { provide: RaitSessionFacade, useValue: session },
+        stynxProviderFor([role]),
       ]);
       const requestedUrl = `/${substituteRouteParams(path)}`;
       await harness.navigateByUrl(requestedUrl);
diff --git a/apps/rait/web/src/app/features/arquivo/arquivo.routes.ts b/apps/rait/web/src/app/features/arquivo/arquivo.routes.ts
index 116938e7..4ffd84a0 100644
--- a/apps/rait/web/src/app/features/arquivo/arquivo.routes.ts
+++ b/apps/rait/web/src/app/features/arquivo/arquivo.routes.ts
@@ -1,7 +1,14 @@
-// Módulo `arquivo` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
-// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
-// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
+// Módulo `arquivo` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
+// CTG-0002b §6.1 linhas 55–57): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
+// fábrica (`moduleRoutes`); a raiz `arquivo` continua redirect; as páginas L2 são ligadas por `path`.
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { ArchiveSearchPageComponent } from './pages/archive-search.page';
+import { RetentionQueuePageComponent } from './pages/retention-queue.page';
+import { SealedDossierPageComponent } from './pages/sealed-dossier.page';

-export const ARQUIVO_ROUTES: Routes = moduleRoutes('arquivo');
+export const ARQUIVO_ROUTES: Routes = moduleRoutes('arquivo', {
+  'arquivo/busca': { component: ArchiveSearchPageComponent },
+  'arquivo/casos/:id': { component: SealedDossierPageComponent },
+  'arquivo/retencao': { component: RetentionQueuePageComponent },
+});
diff --git a/apps/rait/web/src/app/features/assinatura/assinatura.routes.ts b/apps/rait/web/src/app/features/assinatura/assinatura.routes.ts
index bbb49987..d15267ee 100644
--- a/apps/rait/web/src/app/features/assinatura/assinatura.routes.ts
+++ b/apps/rait/web/src/app/features/assinatura/assinatura.routes.ts
@@ -1,7 +1,12 @@
-// Módulo `assinatura` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
-// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
-// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
+// Módulo `assinatura` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
+// CTG-0002b §6.1 linhas 24–25): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
+// fábrica (`moduleRoutes`); as páginas L2 são ligadas por `path`.
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { SigningDecisionPageComponent } from './pages/signing-decision.page';
+import { SigningQueuePageComponent } from './pages/signing-queue.page';

-export const ASSINATURA_ROUTES: Routes = moduleRoutes('assinatura');
+export const ASSINATURA_ROUTES: Routes = moduleRoutes('assinatura', {
+  assinatura: { component: SigningQueuePageComponent },
+  'assinatura/:caseId': { component: SigningDecisionPageComponent },
+});
diff --git a/apps/rait/web/src/app/features/auditoria/auditoria.routes.ts b/apps/rait/web/src/app/features/auditoria/auditoria.routes.ts
index 6d68c0e6..d3e96a67 100644
--- a/apps/rait/web/src/app/features/auditoria/auditoria.routes.ts
+++ b/apps/rait/web/src/app/features/auditoria/auditoria.routes.ts
@@ -1,7 +1,10 @@
-// Módulo `auditoria` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
-// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
-// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
+// Módulo `auditoria` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
+// CTG-0002b §6.1 linhas 58–59): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
+// fábrica (`moduleRoutes`); a raiz continua redirect; `trilha` é L2 e `exportacoes` continua L0.
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { AuditTrailPageComponent } from './pages/audit-trail.page';

-export const AUDITORIA_ROUTES: Routes = moduleRoutes('auditoria');
+export const AUDITORIA_ROUTES: Routes = moduleRoutes('auditoria', {
+  'auditoria/trilha': { component: AuditTrailPageComponent },
+});
diff --git a/apps/rait/web/src/app/features/autoridade/autoridade.routes.ts b/apps/rait/web/src/app/features/autoridade/autoridade.routes.ts
index 28ba0e69..ef3dbe02 100644
--- a/apps/rait/web/src/app/features/autoridade/autoridade.routes.ts
+++ b/apps/rait/web/src/app/features/autoridade/autoridade.routes.ts
@@ -1,7 +1,10 @@
-// Módulo `autoridade` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
-// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
-// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
+// Módulo `autoridade` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
+// CTG-0002b §6.1 linha 26): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
+// fábrica (`moduleRoutes`); a página L2 é ligada por `path`.
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { ProvidedAppealsPageComponent } from './pages/provided-appeals.page';

-export const AUTORIDADE_ROUTES: Routes = moduleRoutes('autoridade');
+export const AUTORIDADE_ROUTES: Routes = moduleRoutes('autoridade', {
+  'autoridade/provimentos': { component: ProvidedAppealsPageComponent },
+});
diff --git a/apps/rait/web/src/app/features/caso/caso.routes.ts b/apps/rait/web/src/app/features/caso/caso.routes.ts
index 04412826..6d0af52a 100644
--- a/apps/rait/web/src/app/features/caso/caso.routes.ts
+++ b/apps/rait/web/src/app/features/caso/caso.routes.ts
@@ -1,7 +1,33 @@
-// Módulo `caso` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
-// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
-// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
+// Módulo `caso` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e CTG-0002b
+// §6.1 linhas 6–17): rotas derivadas do manifesto — guardas, `title` e `data` vêm da fábrica
+// (`moduleRoutes`); o layout `casos/:id` recebe o `CaseLayoutPageComponent` (CaseHeader +
+// abas + router-outlet, guia §3.2) e as 11 abas as páginas L2, ligadas por `path`.
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { CaseDecisionPageComponent } from './pages/case-decision.page';
+import { CaseLayoutPageComponent } from './pages/case-layout.page';
+import { CaseSummaryPageComponent } from './pages/case-summary.page';
+import { CommunicationsPageComponent } from './pages/communications.page';
+import { DeadlinesPageComponent } from './pages/deadlines.page';
+import { DossierPageComponent } from './pages/dossier.page';
+import { DraftPageComponent } from './pages/draft.page';
+import { HistoryPageComponent } from './pages/history.page';
+import { ImpedimentsPageComponent } from './pages/impediments.page';
+import { InquiriesPageComponent } from './pages/inquiries.page';
+import { PartiesPageComponent } from './pages/parties.page';
+import { TriagePageComponent } from './pages/triage.page';

-export const CASO_ROUTES: Routes = moduleRoutes('caso');
+export const CASO_ROUTES: Routes = moduleRoutes('caso', {
+  'casos/:id': { component: CaseLayoutPageComponent },
+  'casos/:id/resumo': { component: CaseSummaryPageComponent },
+  'casos/:id/triagem': { component: TriagePageComponent },
+  'casos/:id/dossie': { component: DossierPageComponent },
+  'casos/:id/diligencias': { component: InquiriesPageComponent },
+  'casos/:id/minuta': { component: DraftPageComponent },
+  'casos/:id/decisao': { component: CaseDecisionPageComponent },
+  'casos/:id/prazos': { component: DeadlinesPageComponent },
+  'casos/:id/partes': { component: PartiesPageComponent },
+  'casos/:id/comunicacoes': { component: CommunicationsPageComponent },
+  'casos/:id/impedimentos': { component: ImpedimentsPageComponent },
+  'casos/:id/historico': { component: HistoryPageComponent },
+});
diff --git a/apps/rait/web/src/app/features/colegiado/colegiado.routes.ts b/apps/rait/web/src/app/features/colegiado/colegiado.routes.ts
index bc7da771..99dbed53 100644
--- a/apps/rait/web/src/app/features/colegiado/colegiado.routes.ts
+++ b/apps/rait/web/src/app/features/colegiado/colegiado.routes.ts
@@ -1,7 +1,35 @@
-// Módulo `colegiado` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
-// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
-// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
+// Módulo `colegiado` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
+// CTG-0002b §6.1 linhas 27–37): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
+// fábrica (`moduleRoutes`); a raiz `colegiado/:orgao` continua redirect e as 11 páginas L2 são
+// ligadas por `path`.
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { AgendaBuilderPageComponent } from './pages/agenda-builder.page';
+import { BatchDetailPageComponent } from './pages/batch-detail.page';
+import { BatchesPageComponent } from './pages/batches.page';
+import { BenchPageComponent } from './pages/bench.page';
+import { ExtraordinaryPageComponent } from './pages/extraordinary.page';
+import { LiveSessionPageComponent } from './pages/live-session.page';
+import { MinutesPageComponent } from './pages/minutes.page';
+import { OpinionPageComponent } from './pages/opinion.page';
+import { RapporteurCasesPageComponent } from './pages/rapporteur-cases.page';
+import { SessionsPageComponent } from './pages/sessions.page';
+import { ViewsPageComponent } from './pages/views.page';

-export const COLEGIADO_ROUTES: Routes = moduleRoutes('colegiado');
+export const COLEGIADO_ROUTES: Routes = moduleRoutes('colegiado', {
+  'colegiado/:orgao/distribuicao': { component: BatchesPageComponent },
+  'colegiado/:orgao/distribuicao/:loteId': {
+    component: BatchDetailPageComponent,
+  },
+  'colegiado/:orgao/relatoria': { component: RapporteurCasesPageComponent },
+  'colegiado/:orgao/relatoria/:caseId/voto': {
+    component: OpinionPageComponent,
+  },
+  'colegiado/:orgao/pauta': { component: AgendaBuilderPageComponent },
+  'colegiado/:orgao/sessoes': { component: SessionsPageComponent },
+  'colegiado/:orgao/sessoes/:id': { component: LiveSessionPageComponent },
+  'colegiado/:orgao/sessoes/:id/banca': { component: BenchPageComponent },
+  'colegiado/:orgao/sessoes/:id/ata': { component: MinutesPageComponent },
+  'colegiado/:orgao/vistas': { component: ViewsPageComponent },
+  'colegiado/:orgao/extraordinaria': { component: ExtraordinaryPageComponent },
+});
diff --git a/apps/rait/web/src/app/features/conta/conta.routes.ts b/apps/rait/web/src/app/features/conta/conta.routes.ts
index a1705166..bf7394a2 100644
--- a/apps/rait/web/src/app/features/conta/conta.routes.ts
+++ b/apps/rait/web/src/app/features/conta/conta.routes.ts
@@ -1,7 +1,10 @@
-// Módulo `conta` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
-// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
-// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
+// Módulo `conta` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e CTG-0002b
+// §6.1 linha 63): rota derivada do manifesto — guardas, `title` e `data` vêm da fábrica
+// (`moduleRoutes`); a página L2 é ligada por `path`.
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { AccountPageComponent } from './pages/account.page';

-export const CONTA_ROUTES: Routes = moduleRoutes('conta');
+export const CONTA_ROUTES: Routes = moduleRoutes('conta', {
+  conta: { component: AccountPageComponent },
+});
diff --git a/apps/rait/web/src/app/features/fila/fila.routes.ts b/apps/rait/web/src/app/features/fila/fila.routes.ts
index 6f385914..98d44ed4 100644
--- a/apps/rait/web/src/app/features/fila/fila.routes.ts
+++ b/apps/rait/web/src/app/features/fila/fila.routes.ts
@@ -1,7 +1,12 @@
-// Módulo `fila` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
-// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
-// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
+// Módulo `fila` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e CTG-0002b
+// §6.1 linhas 4–5): rotas derivadas do manifesto — guardas, `title` e `data` vêm da fábrica
+// (`moduleRoutes`); as páginas L2 são ligadas por `path`.
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { DefensePoolQueuePageComponent } from './pages/defense-pool-queue.page';
+import { RapporteurQueuePageComponent } from './pages/rapporteur-queue.page';

-export const FILA_ROUTES: Routes = moduleRoutes('fila');
+export const FILA_ROUTES: Routes = moduleRoutes('fila', {
+  'fila/defesa': { component: DefensePoolQueuePageComponent },
+  'fila/recurso/:orgao': { component: RapporteurQueuePageComponent },
+});
diff --git a/apps/rait/web/src/app/features/gestao/gestao.routes.ts b/apps/rait/web/src/app/features/gestao/gestao.routes.ts
index dce5279e..ba569b36 100644
--- a/apps/rait/web/src/app/features/gestao/gestao.routes.ts
+++ b/apps/rait/web/src/app/features/gestao/gestao.routes.ts
@@ -1,7 +1,23 @@
-// Módulo `gestao` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
-// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
-// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
+// Módulo `gestao` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
+// CTG-0002b §6.1 linhas 38–43): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
+// fábrica (`moduleRoutes`); a raiz `gestao` continua redirect; L2 (radar, drill-down,
+// incidentes) e L1 (produção, capacidade, turmas, qualidade) ligadas por `path`.
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { CapacityPlanPageComponent } from './pages/capacity-plan.page';
+import { IncidentsPageComponent } from './pages/incidents.page';
+import { ProductionPageComponent } from './pages/production.page';
+import { QualitySamplingPageComponent } from './pages/quality-sampling.page';
+import { RiskCaseDrilldownPageComponent } from './pages/risk-case-drilldown.page';
+import { RiskRadarPageComponent } from './pages/risk-radar.page';
+import { UnitsPageComponent } from './pages/units.page';

-export const GESTAO_ROUTES: Routes = moduleRoutes('gestao');
+export const GESTAO_ROUTES: Routes = moduleRoutes('gestao', {
+  'gestao/radar': { component: RiskRadarPageComponent },
+  'gestao/radar/:caseId': { component: RiskCaseDrilldownPageComponent },
+  'gestao/producao': { component: ProductionPageComponent },
+  'gestao/capacidade': { component: CapacityPlanPageComponent },
+  'gestao/turmas': { component: UnitsPageComponent },
+  'gestao/incidentes': { component: IncidentsPageComponent },
+  'gestao/qualidade': { component: QualitySamplingPageComponent },
+});
diff --git a/apps/rait/web/src/app/features/organizacao/organizacao.routes.ts b/apps/rait/web/src/app/features/organizacao/organizacao.routes.ts
index 1de2326a..0a8b7069 100644
--- a/apps/rait/web/src/app/features/organizacao/organizacao.routes.ts
+++ b/apps/rait/web/src/app/features/organizacao/organizacao.routes.ts
@@ -1,7 +1,13 @@
-// Módulo `organizacao` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
-// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
-// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
+// Módulo `organizacao` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
+// CTG-0002b §6.1 linhas 44–47): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
+// fábrica (`moduleRoutes`); L1 (membros, pools) ligadas por `path`; `escala` e `jeton` continuam
+// L0 (placeholder, M13).
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { MembersPageComponent } from './pages/members.page';
+import { PoolsPageComponent } from './pages/pools.page';

-export const ORGANIZACAO_ROUTES: Routes = moduleRoutes('organizacao');
+export const ORGANIZACAO_ROUTES: Routes = moduleRoutes('organizacao', {
+  'organizacao/membros': { component: MembersPageComponent },
+  'organizacao/pools': { component: PoolsPageComponent },
+});
diff --git a/apps/rait/web/src/app/features/painel/painel.routes.ts b/apps/rait/web/src/app/features/painel/painel.routes.ts
index 1d1f0ecc..18aa7dfe 100644
--- a/apps/rait/web/src/app/features/painel/painel.routes.ts
+++ b/apps/rait/web/src/app/features/painel/painel.routes.ts
@@ -1,7 +1,12 @@
-// Módulo `painel` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
-// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
-// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
+// Módulo `painel` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
+// CTG-0002b §6.1 linhas 2–3): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
+// fábrica (`moduleRoutes`); as páginas L2 são ligadas por `path`.
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { ResumeTrayPageComponent } from './pages/resume-tray.page';
+import { ShiftDashboardPageComponent } from './pages/shift-dashboard.page';

-export const PAINEL_ROUTES: Routes = moduleRoutes('painel');
+export const PAINEL_ROUTES: Routes = moduleRoutes('painel', {
+  painel: { component: ShiftDashboardPageComponent },
+  'painel/retomar': { component: ResumeTrayPageComponent },
+});
diff --git a/apps/rait/web/src/app/features/protocolo/protocolo.routes.ts b/apps/rait/web/src/app/features/protocolo/protocolo.routes.ts
index 45b05bf7..b9bdfaf8 100644
--- a/apps/rait/web/src/app/features/protocolo/protocolo.routes.ts
+++ b/apps/rait/web/src/app/features/protocolo/protocolo.routes.ts
@@ -1,7 +1,20 @@
-// Módulo `protocolo` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
-// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
-// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
+// Módulo `protocolo` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
+// CTG-0002b §6.1 linhas 18–23): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
+// fábrica (`moduleRoutes`); as páginas L2 são ligadas por `path`.
 import type { Routes } from '@angular/router';
 import { moduleRoutes } from '../../core/manifest-routes';
+import { IntakeListPageComponent } from './pages/intake-list.page';
+import { IntakeNewPageComponent } from './pages/intake-new.page';
+import { PendingContentPageComponent } from './pages/pending-content.page';
+import { RedirectsPageComponent } from './pages/redirects.page';
+import { RemittancesPageComponent } from './pages/remittances.page';
+import { WithdrawalsPageComponent } from './pages/withdrawals.page';

-export const PROTOCOLO_ROUTES: Routes = moduleRoutes('protocolo');
+export const PROTOCOLO_ROUTES: Routes = moduleRoutes('protocolo', {
+  protocolo: { component: IntakeListPageComponent },
+  'protocolo/novo': { component: IntakeNewPageComponent },
+  'protocolo/pendencias': { component: PendingContentPageComponent },
+  'protocolo/remessas': { component: RemittancesPageComponent },
+  'protocolo/redirecionamentos': { component: RedirectsPageComponent },
+  'protocolo/desistencias': { component: WithdrawalsPageComponent },
+});
diff --git a/apps/rait/web/src/app/i18n/i18n.spec.ts b/apps/rait/web/src/app/i18n/i18n.spec.ts
index ae4345e9..d746fd9a 100644
--- a/apps/rait/web/src/app/i18n/i18n.spec.ts
+++ b/apps/rait/web/src/app/i18n/i18n.spec.ts
@@ -318,6 +318,158 @@ describe('C-2A-54 — tokens dos enums gerados compostos por tokenKey existem no
   });
 });

+// R-0012 TASK-0014 (Inspector). CTG-0002b.md §8 C-2B-82 / §9.2: as chaves (P) que o Engineer
+// acrescenta ao catálogo do app para o CTG-0002b (namespaces já allowlistados `rait.common`,
+// `rait.screens`; nenhum namespace novo) devem existir com texto não vazio; a semente continua
+// intacta (glossário §2.2 — mesma verificação de C-2A-51, repetida aqui como C-2B-82 [negativo]).
+const NEW_COMMON_KEYS = [
+  'rait.common.clock',
+  'rait.common.ceilingOn',
+  'rait.common.clockAbsent',
+  'rait.common.suspensiveEffect',
+  'rait.common.originRequester',
+  'rait.common.originOfficial',
+  'rait.common.digitised',
+  'rait.common.documentKind',
+  'rait.common.file',
+  'rait.common.attach',
+  'rait.common.yes',
+  'rait.common.no',
+  'rait.common.addressee',
+  'rait.common.addressee_requerente',
+  'rait.common.addressee_orgao_autuador',
+  'rait.common.subject',
+  'rait.common.dueOn',
+  'rait.common.extensions',
+  'rait.common.inquiry_respondida',
+  'rait.common.inquiry_expirada',
+  'rait.common.facts',
+  'rait.common.grounds',
+  'rait.common.ruling',
+  'rait.common.author',
+  'rait.common.draft_rascunho',
+  'rait.common.draft_submetida',
+  'rait.common.draft_devolvida',
+  'rait.common.draft_assinada',
+  'rait.common.signatureUnavailable',
+  'rait.common.registeredAt',
+  'rait.common.quorum',
+  'rait.common.chairPresent',
+  'rait.common.chairAbsent',
+  'rait.common.parity',
+  'rait.common.priority',
+  'rait.common.activeRow',
+  'rait.common.seed',
+  'rait.common.batch_semanal',
+  'rait.common.batch_extraordinario',
+  'rait.common.accepted',
+  'rait.common.declined',
+  'rait.common.decline_impedimento',
+  'rait.common.decline_suspeicao',
+  'rait.common.impediment_impedimento',
+  'rait.common.impediment_suspeicao',
+  'rait.common.basis',
+  'rait.common.wipLimit',
+  'rait.common.absence_ferias',
+  'rait.common.absence_licenca',
+  'rait.common.absence_curso',
+  'rait.common.absence_sessao_externa',
+  'rait.common.transition',
+  'rait.common.actor',
+  'rait.common.retry',
+  'rait.common.list_capped',
+  'rait.common.extraordinary',
+  'rait.common.viewDueOn',
+  'rait.common.party_requerente',
+  'rait.common.party_procurador',
+  'rait.common.party_autoridade',
+  'rait.common.strategy_pull',
+  'rait.common.strategy_round_robin',
+  'rait.common.strategy_load_balanced',
+  'rait.screens.gestao-producao.kpi.loaded',
+  'rait.screens.gestao-capacidade.kpi.loaded',
+] as const;
+
+/** §9.2: 45 chaves `rait.screens.<slug>.confirm.<x>` (texto da coluna "Confirmação" da ficha
+ * §6); acrescentadas ao catálogo por TASK-0016 em paralelo a esta tarefa. */
+const CONFIRM_KEYS = [
+  'rait.screens.fila-defesa.confirm.claim-next',
+  'rait.screens.casos-id-triagem.confirm.admit',
+  'rait.screens.casos-id-triagem.confirm.reject',
+  'rait.screens.casos-id-diligencias.confirm.open',
+  'rait.screens.casos-id-diligencias.confirm.extend',
+  'rait.screens.casos-id-minuta.confirm.submit',
+  'rait.screens.casos-id-decisao.confirm.accept',
+  'rait.screens.casos-id-decisao.confirm.reject',
+  'rait.screens.casos-id-decisao.confirm.return-draft',
+  'rait.screens.casos-id-decisao.confirm.declare-impediment',
+  'rait.screens.casos-id-impedimentos.confirm.declare',
+  'rait.screens.protocolo-novo.confirm.protocol',
+  'rait.screens.protocolo-pendencias.confirm.resolve',
+  'rait.screens.protocolo-remessas.confirm.remit',
+  'rait.screens.protocolo-remessas.confirm.receive',
+  'rait.screens.protocolo-redirecionamentos.confirm.redirect',
+  'rait.screens.protocolo-desistencias.confirm.withdraw',
+  'rait.screens.assinatura-caseId.confirm.sign',
+  'rait.screens.assinatura-caseId.confirm.return_draft',
+  'rait.screens.assinatura-caseId.confirm.declare_impediment',
+  'rait.screens.autoridade-provimentos.confirm.appeal',
+  'rait.screens.autoridade-provimentos.confirm.waive',
+  'rait.screens.colegiado-orgao-distribuicao.confirm.open',
+  'rait.screens.colegiado-orgao-distribuicao.confirm.draw',
+  'rait.screens.colegiado-orgao-distribuicao.confirm.approve',
+  'rait.screens.colegiado-orgao-distribuicao-loteId.confirm.approve',
+  'rait.screens.colegiado-orgao-relatoria.confirm.accept',
+  'rait.screens.colegiado-orgao-relatoria.confirm.impede',
+  'rait.screens.colegiado-orgao-relatoria-caseId-voto.confirm.register',
+  'rait.screens.colegiado-orgao-pauta.confirm.close',
+  'rait.screens.colegiado-orgao-sessoes-id.confirm.open',
+  'rait.screens.colegiado-orgao-sessoes-id.confirm.adjourn',
+  'rait.screens.colegiado-orgao-sessoes-id.confirm.vote',
+  'rait.screens.colegiado-orgao-sessoes-id.confirm.casting_vote',
+  'rait.screens.colegiado-orgao-sessoes-id.confirm.view_request',
+  'rait.screens.colegiado-orgao-sessoes-id.confirm.proclaim',
+  'rait.screens.colegiado-orgao-sessoes-id-banca.confirm.confirm',
+  'rait.screens.colegiado-orgao-sessoes-id-banca.confirm.summon_substitute',
+  'rait.screens.colegiado-orgao-sessoes-id-ata.confirm.generate',
+  'rait.screens.colegiado-orgao-sessoes-id-ata.confirm.sign',
+  'rait.screens.colegiado-orgao-sessoes-id-ata.confirm.publish',
+  'rait.screens.colegiado-orgao-vistas.confirm.register_view_vote',
+  'rait.screens.colegiado-orgao-extraordinaria.confirm.convene',
+  'rait.screens.gestao-radar-caseId.confirm.reassign',
+  'rait.screens.gestao-incidentes.confirm.declare-extinction',
+] as const;
+
+describe('C-2B-82 — chaves (P) do §9.2 existem com texto não vazio', () => {
+  it('dado a lista de chaves (P) quando lida então nenhum namespace novo (só rait.common/rait.screens)', () => {
+    for (const key of [...NEW_COMMON_KEYS, ...CONFIRM_KEYS]) {
+      expect(
+        key.startsWith('rait.common.') || key.startsWith('rait.screens.'),
+      ).toBe(true);
+    }
+  });
+
+  [...NEW_COMMON_KEYS, ...CONFIRM_KEYS].forEach((key) => {
+    it(`dado a chave ${key} quando lida em readAppCatalog() então existe com texto não vazio`, () => {
+      const app = readAppCatalog();
+      expect(Object.prototype.hasOwnProperty.call(app, key), key).toBe(true);
+      expect((app[key] ?? '').length, key).toBeGreaterThan(0);
+    });
+  });
+});
+
+describe('C-2B-82 — semente intacta (glossário §2.2) [negativo]', () => {
+  it('dado readSeedCatalog() quando comparado a readAppCatalog() então nenhuma chave da semente foi renomeada ou removida', () => {
+    const seed = readSeedCatalog();
+    const app = readAppCatalog();
+    for (const [key, value] of Object.entries(seed)) {
+      expect(app[key], `chave da semente ausente ou alterada: ${key}`).toBe(
+        value,
+      );
+    }
+  });
+});
+
 describe('C-2A-55 — nenhum literal estático dos 9 namespaces de token', () => {
   const forbidden =
     /['"`]rait\.(caseState|sessionState|infractionState|infractionSubstate|riskFlag|memberStatus|orgState|closureMotive|timer)\./;
diff --git a/apps/rait/web/src/app/screens/screens.spec.ts b/apps/rait/web/src/app/screens/screens.spec.ts
index bfca6833..ea75a3b9 100644
--- a/apps/rait/web/src/app/screens/screens.spec.ts
+++ b/apps/rait/web/src/app/screens/screens.spec.ts
@@ -2,9 +2,16 @@
 // ficha ↔ rota ↔ i18n. Usa só `RAIT_ROUTE_MANIFEST_FIXTURE` (independente de `app.route-manifest.ts`)
 // e `kb.ts` sobre as 63 fichas reais em disco (já mescladas de CTG-0001, `main`). Este spec pode
 // falhar hoje só se `src/app/i18n/rait.pt-BR.json` (catálogo do app, TASK-0006) ainda não existir.
+import { readFileSync } from 'node:fs';
+import { join } from 'node:path';
 import { describe, expect, it } from 'vitest';
 import { RAIT_ROUTE_MANIFEST_FIXTURE } from '../../testing/route-manifest.fixture';
-import { listSheetFiles, readSheet, readAppCatalog } from '../../testing/kb';
+import {
+  APP_SRC_ROOT,
+  listSheetFiles,
+  readSheet,
+  readAppCatalog,
+} from '../../testing/kb';

 describe('C-2A-56 — cada entrada com sheet ↔ ficha ↔ i18n', () => {
   const withSheet = RAIT_ROUTE_MANIFEST_FIXTURE.filter(
@@ -61,3 +68,102 @@ describe('C-2A-57 — listSheetFiles() × manifesto', () => {
     expect(fromDisk).toEqual(fromManifest);
   });
 });
+
+// R-0012 TASK-0014 (Inspector). CTG-0002b.md §8 C-2B-81 (segunda parte — a primeira, "toda chave
+// rait.screens.<slug>.* citada existe em readAppCatalog()", já é C-2A-56 acima): para cada rota
+// L1/L2 do manifesto, todas as chaves cmd.*/field.*/state.* que a ficha cita em "## Chaves i18n"
+// devem aparecer literalmente no fonte da página (`features/<modulo>/pages/<arquivo>.page.ts`);
+// chaves sem uso em páginas L1 (M13, OD-R12-034) são só relatadas, nunca falham. Mapa path →
+// arquivo transcrito da tabela §6.1 (50 páginas: 43 L2 + 1 layout + 6 L1).
+const PAGE_FILE_BY_PATH: Readonly<Record<string, string>> = {
+  painel: 'painel/pages/shift-dashboard.page.ts',
+  'painel/retomar': 'painel/pages/resume-tray.page.ts',
+  'fila/defesa': 'fila/pages/defense-pool-queue.page.ts',
+  'fila/recurso/:orgao': 'fila/pages/rapporteur-queue.page.ts',
+  'casos/:id': 'caso/pages/case-layout.page.ts',
+  'casos/:id/resumo': 'caso/pages/case-summary.page.ts',
+  'casos/:id/triagem': 'caso/pages/triage.page.ts',
+  'casos/:id/dossie': 'caso/pages/dossier.page.ts',
+  'casos/:id/diligencias': 'caso/pages/inquiries.page.ts',
+  'casos/:id/minuta': 'caso/pages/draft.page.ts',
+  'casos/:id/decisao': 'caso/pages/case-decision.page.ts',
+  'casos/:id/prazos': 'caso/pages/deadlines.page.ts',
+  'casos/:id/partes': 'caso/pages/parties.page.ts',
+  'casos/:id/comunicacoes': 'caso/pages/communications.page.ts',
+  'casos/:id/impedimentos': 'caso/pages/impediments.page.ts',
+  'casos/:id/historico': 'caso/pages/history.page.ts',
+  protocolo: 'protocolo/pages/intake-list.page.ts',
+  'protocolo/novo': 'protocolo/pages/intake-new.page.ts',
+  'protocolo/pendencias': 'protocolo/pages/pending-content.page.ts',
+  'protocolo/remessas': 'protocolo/pages/remittances.page.ts',
+  'protocolo/redirecionamentos': 'protocolo/pages/redirects.page.ts',
+  'protocolo/desistencias': 'protocolo/pages/withdrawals.page.ts',
+  assinatura: 'assinatura/pages/signing-queue.page.ts',
+  'assinatura/:caseId': 'assinatura/pages/signing-decision.page.ts',
+  'autoridade/provimentos': 'autoridade/pages/provided-appeals.page.ts',
+  'colegiado/:orgao/distribuicao': 'colegiado/pages/batches.page.ts',
+  'colegiado/:orgao/distribuicao/:loteId':
+    'colegiado/pages/batch-detail.page.ts',
+  'colegiado/:orgao/relatoria': 'colegiado/pages/rapporteur-cases.page.ts',
+  'colegiado/:orgao/relatoria/:caseId/voto': 'colegiado/pages/opinion.page.ts',
+  'colegiado/:orgao/pauta': 'colegiado/pages/agenda-builder.page.ts',
+  'colegiado/:orgao/sessoes': 'colegiado/pages/sessions.page.ts',
+  'colegiado/:orgao/sessoes/:id': 'colegiado/pages/live-session.page.ts',
+  'colegiado/:orgao/sessoes/:id/banca': 'colegiado/pages/bench.page.ts',
+  'colegiado/:orgao/sessoes/:id/ata': 'colegiado/pages/minutes.page.ts',
+  'colegiado/:orgao/vistas': 'colegiado/pages/views.page.ts',
+  'colegiado/:orgao/extraordinaria': 'colegiado/pages/extraordinary.page.ts',
+  'gestao/radar': 'gestao/pages/risk-radar.page.ts',
+  'gestao/radar/:caseId': 'gestao/pages/risk-case-drilldown.page.ts',
+  'gestao/producao': 'gestao/pages/production.page.ts',
+  'gestao/capacidade': 'gestao/pages/capacity-plan.page.ts',
+  'gestao/turmas': 'gestao/pages/units.page.ts',
+  'gestao/incidentes': 'gestao/pages/incidents.page.ts',
+  'gestao/qualidade': 'gestao/pages/quality-sampling.page.ts',
+  'organizacao/membros': 'organizacao/pages/members.page.ts',
+  'organizacao/pools': 'organizacao/pages/pools.page.ts',
+  'arquivo/busca': 'arquivo/pages/archive-search.page.ts',
+  'arquivo/casos/:id': 'arquivo/pages/sealed-dossier.page.ts',
+  'arquivo/retencao': 'arquivo/pages/retention-queue.page.ts',
+  'auditoria/trilha': 'auditoria/pages/audit-trail.page.ts',
+  conta: 'conta/pages/account.page.ts',
+};
+
+describe('C-2B-81 — chaves cmd.*/field.*/state.* da ficha usadas no fonte da página (L1/L2)', () => {
+  const l1l2 = RAIT_ROUTE_MANIFEST_FIXTURE.filter(
+    (entry) =>
+      entry.sheet !== null &&
+      (entry.level === 'L1' || entry.level === 'L2' || entry.kind === 'layout'),
+  );
+
+  it('dado o mapa path → arquivo de página quando comparado às rotas L1/L2 então cobre as 50 páginas', () => {
+    expect(Object.keys(PAGE_FILE_BY_PATH)).toHaveLength(50);
+    for (const entry of l1l2) {
+      expect(PAGE_FILE_BY_PATH[entry.path], entry.path).toBeDefined();
+    }
+  });
+
+  l1l2.forEach((entry) => {
+    const file = PAGE_FILE_BY_PATH[entry.path];
+    if (file === undefined) return;
+    it(`dado a ficha ${entry.sheet} (${entry.path}) quando lida então toda chave cmd.*/field.*/state.* aparece em ${file}`, () => {
+      const sheet = readSheet(entry.sheet as string);
+      const usageKeys = sheet.i18nKeys.filter((key) =>
+        /\.(cmd|field|state)\./.test(key),
+      );
+      if (usageKeys.length === 0) return;
+      if (entry.level === 'L1') {
+        // M13/OD-R12-034: páginas L1 não têm botão de comando — chaves cmd.* da ficha ficam
+        // sem uso no catálogo; reportado, nunca falha aqui.
+        return;
+      }
+      const source = readFileSync(
+        join(APP_SRC_ROOT, 'app', 'features', file),
+        'utf8',
+      );
+      for (const key of usageKeys) {
+        expect(source, `${file}: chave ausente ${key}`).toContain(key);
+      }
+    });
+  });
+});
diff --git a/apps/rait/web/src/app/shared/clocks-panel.component.ts b/apps/rait/web/src/app/shared/clocks-panel.component.ts
index 4a6e9ba2..eed3b400 100644
--- a/apps/rait/web/src/app/shared/clocks-panel.component.ts
+++ b/apps/rait/web/src/app/shared/clocks-panel.component.ts
@@ -62,7 +62,7 @@ interface ClockPosition {
               <rait-risk-flag
                 [flag]="clock.flag"
                 [clockCode]="clock.clock_code"
-                [daysRemaining]="daysRemaining()[clock.id] ?? null"
+                [daysRemaining]="daysRemainingOf(clock.id)"
                 [ceilingOn]="clock.ceiling_on"
               />
               <time [attr.datetime]="clock.started_on">{{
@@ -91,6 +91,12 @@ export class ClocksPanelComponent {
   readonly emptyKey = EMPTY_KEY;
   readonly clockAbsentKey = CLOCK_ABSENT_KEY;

+  /** Dias restantes do relógio quando o servidor os mandou; senão `null` (OD-R12-022). */
+  daysRemainingOf(clockId: string): number | null {
+    const days = this.daysRemaining();
+    return Object.hasOwn(days, clockId) ? days[clockId] : null;
+  }
+
   /** Posições fixas A, B, C, D; a primeira ocorrência de cada código na ordem recebida. */
   readonly positions = computed<readonly ClockPosition[]>(() => {
     const clocks = this.clocks();
```
