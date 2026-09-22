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

**Segundo ciclo — restrito às correções dos 2 achados de `delivery-review-CTG-0002b-1.json`** (adenda
A11 do `plan.md`): (1) nos 4 componentes com gate (`case-header`, `inquiry-card`, `decision-panel`,
`queue-table`) os specs geram um `it` por ação × papel canônico a partir de `ROLE_PERMISSIONS_FIXTURE`
(13 papéis; presença para concedidos, ausência para omitidos): 13 + 26 + 39 + 13 = 91 `it` novos;
(2) C-2B-44 corrigido — `rait-analyst`/`rait-rapporteur` veem `impede` (`inf:rait-impediment:declare`)
e não veem `sign`/`return-draft`. Nenhuma alteração de produção foi necessária (os componentes já
obedeciam à política). Gates: `test` → Test Files 67 passed; Tests 2263 passed | 134 todo (2397);
`lint`/`typecheck`/`format:check` OK. Avalie somente essas correções. Contexto do primeiro ciclo,
mantido para referência: Grupo acoplado CTG-0002b-1 (WP-F: camada de dados, facades e componentes
compartilhados de `apps/rait/web`; adenda A8).** Tríade: Architect TASK-0007
(`work/rounds/R-0012/contracts/CTG-0002b.md`, 91 critérios; este par cobre C-2B-01…60, 84…87 e os
gates 88…91) → Inspector TASK-0008 (3 fixtures novas + acréscimos em `kb.ts`/`stynx-session.stub.ts`;
53 specs; 2 iterações — A10) → Engineer TASK-0009 (Opus; `data/`: modelos-alias dos contratos gerados,
`list-query` (estreita/pagina sem reordenar, OD-R12-018), `rait-http` + `etag-store`, `clock`,
`idempotency-key`, 8 clientes com 98 GET + 64 comandos `todo` M8, `read-store`/`command`/`list.facade`

- 11 facades com invalidação SSE, `case-shell-search`; `shared/`: 26 componentes; 2 iterações — A10).
  Adendas que valem como base de julgamento: `plan.md` A8, A9, **A10** (reconciliação: 8 defeitos de spec
  corrigidos pelo Inspector; `emptyWhen`; `*stynxHasPermission` do kit em vez de diretiva local;
  `stynx-session.stub.ts` ganha `active$`). Relatórios: `work/rounds/R-0012/reports/TASK-0007.md`,
  `TASK-0008.md`, `TASK-0009.md` (com iteração 2).

Gates rodados pelo maestro sobre a árvore final: `pnpm --filter @detran/rait-web typecheck|lint|test|build`
→ verdes (Test Files 67 passed; Tests 2172 passed | 134 todo (2306); bundle sem warnings);
`pnpm verify:parameter-catalogue` → OK (57 i18n namespaces); `pnpm format:check` → OK; `pnpm check`
completo → EXIT 0 (rodado pelo Engineer na iteração 2, log no relatório).

Leia na worktree (não anexado inline): `apps/rait/web/src/app/data/**`, `apps/rait/web/src/app/shared/**`,
`apps/rait/web/src/app/core/shell-search.ts`, `apps/rait/web/src/testing/{http-fixtures,policy.fixture,clock.stub,kb,stynx-session.stub}.ts`,
`apps/rait/web/src/app/i18n/rait.pt-BR.json` (+65 chaves (P) do contrato §9.2 → OD-R12-028),
`work/rounds/R-0012/contracts/CTG-0002b.md` §2–§5, §7, §8, §9. Pontos a julgar: rubrica 5 (nenhum DTO à
mão — tipos só de `@detran/api-clients`; textos (P) com OD), 7 (specs só ajustados por adenda numerada A10;
134 `it.todo` todos citando R-0007 CTG-0004 + OD; nenhum gerado editado), 8 (A1: tokens por composição;
enums dos contratos), 9 (nenhuma chamada nacional), 11 (fronteira §13/§1 do contrato: páginas ficam para o
par 2), 13 (gate por papel nos componentes com `*stynxHasPermission` e `ROLE_PERMISSIONS_FIXTURE`).

Arquivos novos (`git status --short` `??`):

```text
apps/rait/web/src/app/core/shell-search.spec.ts
apps/rait/web/src/app/data/
apps/rait/web/src/app/shared/admissibility-checklist.component.spec.ts
apps/rait/web/src/app/shared/admissibility-checklist.component.ts
apps/rait/web/src/app/shared/batch-draw-viewer.component.spec.ts
apps/rait/web/src/app/shared/batch-draw-viewer.component.ts
apps/rait/web/src/app/shared/case-header.component.spec.ts
apps/rait/web/src/app/shared/case-header.component.ts
apps/rait/web/src/app/shared/case-state-badge.component.spec.ts
apps/rait/web/src/app/shared/case-state-badge.component.ts
apps/rait/web/src/app/shared/clocks-panel.component.spec.ts
apps/rait/web/src/app/shared/clocks-panel.component.ts
apps/rait/web/src/app/shared/deadline-chip.component.spec.ts
apps/rait/web/src/app/shared/deadline-chip.component.ts
apps/rait/web/src/app/shared/decision-panel.component.spec.ts
apps/rait/web/src/app/shared/decision-panel.component.ts
apps/rait/web/src/app/shared/document-uploader.component.spec.ts
apps/rait/web/src/app/shared/document-uploader.component.ts
apps/rait/web/src/app/shared/dossier-viewer.component.spec.ts
apps/rait/web/src/app/shared/dossier-viewer.component.ts
apps/rait/web/src/app/shared/event-timeline.component.spec.ts
apps/rait/web/src/app/shared/event-timeline.component.ts
apps/rait/web/src/app/shared/impediment-dialog.component.spec.ts
apps/rait/web/src/app/shared/impediment-dialog.component.ts
apps/rait/web/src/app/shared/inquiry-card.component.spec.ts
apps/rait/web/src/app/shared/inquiry-card.component.ts
apps/rait/web/src/app/shared/inquiry-form.component.spec.ts
apps/rait/web/src/app/shared/inquiry-form.component.ts
apps/rait/web/src/app/shared/kpi-tile.component.spec.ts
apps/rait/web/src/app/shared/kpi-tile.component.ts
apps/rait/web/src/app/shared/legal-basis-tooltip.component.spec.ts
apps/rait/web/src/app/shared/legal-basis-tooltip.component.ts
apps/rait/web/src/app/shared/minuta-editor.component.spec.ts
apps/rait/web/src/app/shared/minuta-editor.component.ts
apps/rait/web/src/app/shared/opinion-editor.component.spec.ts
apps/rait/web/src/app/shared/opinion-editor.component.ts
apps/rait/web/src/app/shared/page-state.component.spec.ts
apps/rait/web/src/app/shared/page-state.component.ts
apps/rait/web/src/app/shared/queue-table.component.spec.ts
apps/rait/web/src/app/shared/queue-table.component.ts
apps/rait/web/src/app/shared/quorum-indicator.component.spec.ts
apps/rait/web/src/app/shared/quorum-indicator.component.ts
apps/rait/web/src/app/shared/risk-flag.component.spec.ts
apps/rait/web/src/app/shared/risk-flag.component.ts
apps/rait/web/src/app/shared/route-screen.ts
apps/rait/web/src/app/shared/schedule-grid.component.spec.ts
apps/rait/web/src/app/shared/schedule-grid.component.ts
apps/rait/web/src/app/shared/signature-dialog.component.spec.ts
apps/rait/web/src/app/shared/signature-dialog.component.ts
apps/rait/web/src/app/shared/stream-status-banner.component.spec.ts
apps/rait/web/src/app/shared/stream-status-banner.component.ts
apps/rait/web/src/app/shared/table-column.ts
apps/rait/web/src/app/shared/trend-chart.component.spec.ts
apps/rait/web/src/app/shared/trend-chart.component.ts
apps/rait/web/src/app/shared/vote-tally.component.spec.ts
apps/rait/web/src/app/shared/vote-tally.component.ts
apps/rait/web/src/testing/clock.stub.ts
apps/rait/web/src/testing/http-fixtures.ts
apps/rait/web/src/testing/policy.fixture.ts
```

`git status --short` completo:

```text
 M apps/rait/web/src/app/core/rait-shell.component.spec.ts
 M apps/rait/web/src/app/core/shell-search.ts
 M apps/rait/web/src/app/i18n/rait.pt-BR.json
 M apps/rait/web/src/app/shared/placeholder-page.component.ts
 M apps/rait/web/src/main.ts
 M apps/rait/web/src/testing/kb.ts
 M apps/rait/web/src/testing/stynx-session.stub.ts
 M work/rounds/R-0012/budget.json
 M work/rounds/R-0012/plan.md
 M work/rounds/R-0012/tasks/TASK-0008.json
 M work/rounds/R-0012/tasks/TASK-0009.json
?? apps/rait/web/src/app/core/shell-search.spec.ts
?? apps/rait/web/src/app/data/
?? apps/rait/web/src/app/shared/admissibility-checklist.component.spec.ts
?? apps/rait/web/src/app/shared/admissibility-checklist.component.ts
?? apps/rait/web/src/app/shared/batch-draw-viewer.component.spec.ts
?? apps/rait/web/src/app/shared/batch-draw-viewer.component.ts
?? apps/rait/web/src/app/shared/case-header.component.spec.ts
?? apps/rait/web/src/app/shared/case-header.component.ts
?? apps/rait/web/src/app/shared/case-state-badge.component.spec.ts
?? apps/rait/web/src/app/shared/case-state-badge.component.ts
?? apps/rait/web/src/app/shared/clocks-panel.component.spec.ts
?? apps/rait/web/src/app/shared/clocks-panel.component.ts
?? apps/rait/web/src/app/shared/deadline-chip.component.spec.ts
?? apps/rait/web/src/app/shared/deadline-chip.component.ts
?? apps/rait/web/src/app/shared/decision-panel.component.spec.ts
?? apps/rait/web/src/app/shared/decision-panel.component.ts
?? apps/rait/web/src/app/shared/document-uploader.component.spec.ts
?? apps/rait/web/src/app/shared/document-uploader.component.ts
?? apps/rait/web/src/app/shared/dossier-viewer.component.spec.ts
?? apps/rait/web/src/app/shared/dossier-viewer.component.ts
?? apps/rait/web/src/app/shared/event-timeline.component.spec.ts
?? apps/rait/web/src/app/shared/event-timeline.component.ts
?? apps/rait/web/src/app/shared/impediment-dialog.component.spec.ts
?? apps/rait/web/src/app/shared/impediment-dialog.component.ts
?? apps/rait/web/src/app/shared/inquiry-card.component.spec.ts
?? apps/rait/web/src/app/shared/inquiry-card.component.ts
?? apps/rait/web/src/app/shared/inquiry-form.component.spec.ts
?? apps/rait/web/src/app/shared/inquiry-form.component.ts
?? apps/rait/web/src/app/shared/kpi-tile.component.spec.ts
?? apps/rait/web/src/app/shared/kpi-tile.component.ts
?? apps/rait/web/src/app/shared/legal-basis-tooltip.component.spec.ts
?? apps/rait/web/src/app/shared/legal-basis-tooltip.component.ts
?? apps/rait/web/src/app/shared/minuta-editor.component.spec.ts
?? apps/rait/web/src/app/shared/minuta-editor.component.ts
?? apps/rait/web/src/app/shared/opinion-editor.component.spec.ts
?? apps/rait/web/src/app/shared/opinion-editor.component.ts
?? apps/rait/web/src/app/shared/page-state.component.spec.ts
?? apps/rait/web/src/app/shared/page-state.component.ts
?? apps/rait/web/src/app/shared/queue-table.component.spec.ts
?? apps/rait/web/src/app/shared/queue-table.component.ts
?? apps/rait/web/src/app/shared/quorum-indicator.component.spec.ts
?? apps/rait/web/src/app/shared/quorum-indicator.component.ts
?? apps/rait/web/src/app/shared/risk-flag.component.spec.ts
?? apps/rait/web/src/app/shared/risk-flag.component.ts
?? apps/rait/web/src/app/shared/route-screen.ts
?? apps/rait/web/src/app/shared/schedule-grid.component.spec.ts
?? apps/rait/web/src/app/shared/schedule-grid.component.ts
?? apps/rait/web/src/app/shared/signature-dialog.component.spec.ts
?? apps/rait/web/src/app/shared/signature-dialog.component.ts
?? apps/rait/web/src/app/shared/stream-status-banner.component.spec.ts
?? apps/rait/web/src/app/shared/stream-status-banner.component.ts
?? apps/rait/web/src/app/shared/table-column.ts
?? apps/rait/web/src/app/shared/trend-chart.component.spec.ts
?? apps/rait/web/src/app/shared/trend-chart.component.ts
?? apps/rait/web/src/app/shared/vote-tally.component.spec.ts
?? apps/rait/web/src/app/shared/vote-tally.component.ts
?? apps/rait/web/src/testing/clock.stub.ts
?? apps/rait/web/src/testing/http-fixtures.ts
?? apps/rait/web/src/testing/policy.fixture.ts
```

Diff dos arquivos rastreados alterados:

```diff
diff --git a/apps/rait/web/src/app/core/rait-shell.component.spec.ts b/apps/rait/web/src/app/core/rait-shell.component.spec.ts
index 1afe2bc4..6d209870 100644
--- a/apps/rait/web/src/app/core/rait-shell.component.spec.ts
+++ b/apps/rait/web/src/app/core/rait-shell.component.spec.ts
@@ -17,13 +17,23 @@ import {
 import { expectNoSeriousA11yViolations } from '../../testing/axe.spec-helper';
 // Produção (TASK-0006): ainda não existe.
 import { navigationFor, RaitShellComponent } from './rait-shell.component';
-import {
-  RaitShellSearch,
-  PendingShellSearch,
-  type RaitShellSearchResult,
-} from './shell-search';
+import { RaitShellSearch, type RaitShellSearchResult } from './shell-search';
 import { RaitTitleStrategy } from './title.strategy';
 import { RaitSessionFacade } from './session.facade';
+// R-0012 TASK-0008 (Inspector, CTG-0002b.md §8 C-2B-84/85): substitui o `it` de C-2A-27 que
+// exercitava `PendingShellSearch` — o contrato manda `CaseShellSearch` (`data/shell-search/`,
+// ainda inexistente nesta entrega: TASK-0009) no lugar. `provideHttpClient`/
+// `provideHttpClientTesting` porque `CaseShellSearch` faz uma requisição real via `CaseClient`.
+// `CaseShellSearch` (e tudo que importa `data/list-query.ts`/`data/models`, TASK-0009) é
+// carregado por `import()` DENTRO do `it` — nunca como import estático do arquivo — para que só
+// esse `it` falhe enquanto o módulo não existe; um import estático aqui derrubaria a
+// transformação do arquivo inteiro e quebraria C-2A-25…26/28…30, que continuam verdes hoje
+// (regra "specs do CTG-0002a continuam verdes, exceto o it substituído").
+import { provideHttpClient } from '@angular/common/http';
+import {
+  HttpTestingController,
+  provideHttpClientTesting,
+} from '@angular/common/http/testing';

 describe('C-2A-25 — navigationFor × NAVIGATION_FIXTURE', () => {
   Object.entries(NAVIGATION_FIXTURE).forEach(([role, expected]) => {
@@ -123,27 +133,70 @@ describe('C-2A-26 — RaitShellComponent renderizado (rait-analyst)', () => {
 });

 describe('C-2A-27 — busca do shell', () => {
-  it('dado PendingShellSearch quando submetido "AM-2026-0001" então nenhuma navegação e banner "unavailable_in_version"', async () => {
-    const fixture = await renderShell({
+  // C-2B-84/85: substitui o `it` que exercitava `PendingShellSearch` — o shell agora recebe
+  // `CaseShellSearch` (produção `data/shell-search/case-shell-search.ts`, TASK-0009), que busca
+  // via `CaseClient` (`GET /v1/inf/rait/cases`). Submeter um protocolo existente navega a
+  // `/casos/<id>`; o comportamento de "unavailable" (banner) deixou de existir — a busca real
+  // devolve `{ kind: 'case' }` ou `{ kind: 'none' }` (C-2A-2x do shell continua verde com o novo
+  // provider).
+  it('dado o shell com CaseShellSearch provido quando o formulário de busca é submetido com um protocolo existente então router navega a /casos/<id>', async () => {
+    // `data/shell-search/case-shell-search.ts` ainda não existe (TASK-0009) — `import()`
+    // dinâmico para que só este `it` falhe (ver comentário no topo do arquivo). O caso 07
+    // (`rait-fixtures.json` "cases": id `00000000-0000-7000-8000-000010000007`, protocol
+    // `RAIT-2026-000007`) é citado aqui como literal, não via `http-fixtures.ts`, porque aquele
+    // arquivo importa `data/list-query.ts` (também TASK-0009) e derrubaria este import dinâmico
+    // junto — nenhum valor inventado: os dois campos vêm da mesma linha da fixture canônica.
+    const CASE_07_ID = '00000000-0000-7000-8000-000010000007';
+    // Especificador montado em runtime (nunca um literal estático no `import(...)`): o plugin
+    // `vite:import-analysis` do Vitest resolve e falha na TRANSFORMAÇÃO de um `import('literal')`
+    // dinâmico do mesmo jeito que um `import` estático — só um especificador não-literal escapa
+    // dessa resolução antecipada e falha (como esperado) apenas quando este `it` executa.
+    const caseShellSearchModulePath = [
+      '..',
+      'data',
+      'shell-search',
+      'case-shell-search',
+    ].join('/');
+    const { CaseShellSearch } = await import(caseShellSearchModulePath);
+
+    const session = createSessionStub({
+      active: true,
       roles: ['rait-analyst'],
-      search: new PendingShellSearch(),
     });
+    TestBed.configureTestingModule({
+      imports: [RaitShellComponent, markerI18nModule([...SHELL_KEYS])],
+      providers: [
+        provideRouter([{ path: '**', children: [] }]),
+        provideHttpClient(),
+        provideHttpClientTesting(),
+        { provide: RaitSessionFacade, useValue: session },
+        { provide: RaitShellSearch, useClass: CaseShellSearch },
+      ],
+    });
+    await initializeMarkerI18n();
+    const fixture = TestBed.createComponent(RaitShellComponent);
+    fixture.detectChanges();
+
     const router = TestBed.inject(Router);
-    const navigateSpy = vi.spyOn(router, 'navigate');
+    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
+    const httpMock = TestBed.inject(HttpTestingController);
+
     const input: HTMLInputElement = fixture.nativeElement.querySelector(
       'form[role="search"] input',
     );
-    input.value = 'AM-2026-0001';
+    input.value = 'RAIT-2026-000007';
     input.dispatchEvent(new Event('input'));
     fixture.nativeElement
       .querySelector('form[role="search"]')
       .dispatchEvent(new Event('submit'));
-    await fixture.whenStable();
-    fixture.detectChanges();
-    expect(navigateSpy).not.toHaveBeenCalled();
-    expect(fixture.nativeElement.textContent).toContain(
-      buildTestCatalog([...SHELL_KEYS])['rait.states.unavailable_in_version'],
+
+    const req = await vi.waitFor(() =>
+      httpMock.expectOne({ method: 'GET', url: '/v1/inf/rait/cases' }),
     );
+    req.flush([{ id: CASE_07_ID, protocol_number: 'RAIT-2026-000007' }]);
+    await fixture.whenStable();
+    expect(navigateSpy).toHaveBeenCalledWith(['/casos', CASE_07_ID]);
+    httpMock.verify();
   });

   it('dado stub resolvendo { kind: "case", caseId: "c1" } quando submetido então navega para /casos/c1', async () => {
diff --git a/apps/rait/web/src/app/core/shell-search.ts b/apps/rait/web/src/app/core/shell-search.ts
index 66c1d6e1..65dc0b47 100644
--- a/apps/rait/web/src/app/core/shell-search.ts
+++ b/apps/rait/web/src/app/core/shell-search.ts
@@ -1,8 +1,11 @@
-// Busca do shell por protocolo/AIT (spec §5.1; contrato CTG-0002a §5): abstração injetável.
-// Nesta CTG não há cliente de dados (M8/§13): `PendingShellSearch` resolve sempre
-// `{ kind: 'unavailable' }` — nunca simula um acerto. O CTG-0002b substitui por busca via
-// `CaseClient` (`GET /v1/inf/rait/cases`, `protocol_number`/`ait`).
+// Busca do shell por protocolo (spec §5.1; contrato CTG-0002a §5; CTG-0002b §3.6): abstração
+// injetável cuja implementação é `CaseShellSearch` (`data/shell-search/case-shell-search.ts`,
+// `GET /v1/inf/rait/cases` por `CaseClient`; busca por AIT fora desta CTG — OD-R12-030). A
+// fábrica padrão aponta para ela (o `main.ts` também a registra explicitamente,
+// `{ provide: RaitShellSearch, useClass: CaseShellSearch }`, OD-R12-030 b); os specs do shell
+// substituem por `useValue`.
 import { Injectable, inject } from '@angular/core';
+import { CaseShellSearch } from '../data/shell-search/case-shell-search';

 export type RaitShellSearchResult =
   | { readonly kind: 'case'; readonly caseId: string }
@@ -11,16 +14,8 @@ export type RaitShellSearchResult =

 @Injectable({
   providedIn: 'root',
-  useFactory: () => inject(PendingShellSearch),
+  useFactory: () => inject(CaseShellSearch),
 })
 export abstract class RaitShellSearch {
   abstract search(query: string): Promise<RaitShellSearchResult>;
 }
-
-@Injectable({ providedIn: 'root' })
-export class PendingShellSearch extends RaitShellSearch {
-  // todo(CTG-0002b): busca via CaseClient; até lá a busca está indisponível nesta versão.
-  async search(_query: string): Promise<RaitShellSearchResult> {
-    return { kind: 'unavailable' };
-  }
-}
diff --git a/apps/rait/web/src/app/shared/placeholder-page.component.ts b/apps/rait/web/src/app/shared/placeholder-page.component.ts
index d8bad5e2..96a3faae 100644
--- a/apps/rait/web/src/app/shared/placeholder-page.component.ts
+++ b/apps/rait/web/src/app/shared/placeholder-page.component.ts
@@ -1,21 +1,17 @@
 // Placeholders de rota (plan.md M13; spec §11 "rota registrada, indisponível nesta versão, sem
 // mock silencioso"; contrato CTG-0002a §3): `DetranErrorStateComponent` com
 // `rait.states.unavailable_in_version` e `data-screen` = tela (`T-nn`) lida do `data` da rota
-// (`''` quando a rota não tem tela). `PlaceholderLayoutComponent` é o layout de `/casos/:id`
+// (`''` quando a rota não tem tela; `screenOf` em `route-screen.ts`). `PlaceholderLayoutComponent` é o layout de `/casos/:id`
 // (abas em `router-outlet`) até o CTG-0002b trazer o `CaseHeader` real; a tela ativa é a da aba
 // (o layout não carrega `data-screen` — `screenElement` do harness lê o filho).
 import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
 import { ActivatedRoute, RouterOutlet } from '@angular/router';
 import { DetranErrorStateComponent, StynxTranslatePipe } from '@detran/ui';
 import { provideRaitI18nFallback } from '../core/i18n-fallback';
+import { screenOf } from './route-screen';

 export const UNAVAILABLE_IN_VERSION_KEY = 'rait.states.unavailable_in_version';

-function screenOf(route: ActivatedRoute): string {
-  const screen: unknown = route.snapshot?.data?.['screen'];
-  return typeof screen === 'string' ? screen : '';
-}
-
 @Component({
   selector: 'rait-placeholder-page',
   imports: [DetranErrorStateComponent, StynxTranslatePipe],
diff --git a/apps/rait/web/src/main.ts b/apps/rait/web/src/main.ts
index 0de8980a..f1b6d22d 100644
--- a/apps/rait/web/src/main.ts
+++ b/apps/rait/web/src/main.ts
@@ -15,7 +15,9 @@ import { AppComponent } from './app/app.component';
 import { RAIT_ROUTES } from './app/app.routes';
 import { LOGIN_ROUTE } from './app/core/guards/auth.guard';
 import { readRuntimeConfig } from './app/core/runtime-config';
+import { RaitShellSearch } from './app/core/shell-search';
 import { RaitTitleStrategy } from './app/core/title.strategy';
+import { CaseShellSearch } from './app/data/shell-search/case-shell-search';

 const runtime = readRuntimeConfig();
 const origin = window.location.origin;
@@ -46,6 +48,8 @@ bootstrapApplication(AppComponent, {
       },
     }),
     { provide: TitleStrategy, useClass: RaitTitleStrategy },
+    // Busca do shell por protocolo via `CaseClient` (contrato CTG-0002b §3.6; OD-R12-030 b).
+    { provide: RaitShellSearch, useClass: CaseShellSearch },
   ],
 }).catch((error: unknown) => {
   console.error(error);
diff --git a/apps/rait/web/src/testing/kb.ts b/apps/rait/web/src/testing/kb.ts
index bf312749..79b4a596 100644
--- a/apps/rait/web/src/testing/kb.ts
+++ b/apps/rait/web/src/testing/kb.ts
@@ -27,6 +27,84 @@ export const ERROR_CATALOG_PATH = join(
   'docs/framework/arch/rait-error-catalog.md',
 );

+// R-0012 TASK-0008 (Inspector). Acréscimos do contrato CTG-0002b.md §7: caminho das fixtures
+// HTTP canônicas (rait-fixtures.md §7 "testes do frontend importam
+// docs/framework/arch/fixtures/rait-fixtures.json") e leitura independente de
+// `RAIT_COMMAND_RULES` (`backend/domains/shared/src/policy.ts`) para C-2B-13. Nada é importado
+// de `policy.ts` em runtime (`policy.fixture.ts` é a transcrição independente); esta função só
+// lê o texto-fonte para provar a transcrição.
+export const FIXTURES_PATH = join(
+  REPO_ROOT,
+  'docs/framework/arch/fixtures/rait-fixtures.json',
+);
+export const POLICY_PATH = join(
+  REPO_ROOT,
+  'backend/domains/shared/src/policy.ts',
+);
+
+export interface PolicyCommandRule {
+  readonly key: string;
+  readonly roles: readonly string[];
+}
+
+/**
+ * Regex sobre o texto de `policy.ts`: extrai o array `RAIT_COMMAND_RULES` (entre a declaração e
+ * o `];` que o fecha) e, de cada tripla `['<recurso>', '<ação>', [...papéis]]` (uma linha ou
+ * quebrada em várias, como em `rait-assignment:reassign`/`rait-impediment:declare`/
+ * `rait-clock:acknowledge-alert`), monta `{ key: 'inf:<recurso>:<ação>', roles }` (`teat('inf',
+ * resource, action)` de `policy.ts`). Nenhuma importação de `policy.ts` em runtime.
+ */
+export function readPolicyCommandRules(): readonly PolicyCommandRule[] {
+  const text = readFileSync(POLICY_PATH, 'utf8');
+  const startMarker =
+    'const RAIT_COMMAND_RULES: Array<[string, string, readonly DetranRole[]]> = [';
+  const start = text.indexOf(startMarker);
+  if (start < 0) {
+    throw new Error(`${POLICY_PATH}: RAIT_COMMAND_RULES não encontrado`);
+  }
+  const bodyStart = start + startMarker.length;
+  const end = text.indexOf('\n];', bodyStart);
+  if (end < 0) {
+    throw new Error(`${POLICY_PATH}: fim de RAIT_COMMAND_RULES não encontrado`);
+  }
+  const body = text.slice(bodyStart, end);
+  // Cada tripla começa por `['<resource>', '<action>',` (aspas simples), podendo quebrar em
+  // várias linhas até o `]` que fecha o array de papéis; não há arrays aninhados dentro dos
+  // papéis, então `[^\]]*` captura o bloco inteiro sem escapar do fechamento certo. As triplas
+  // quebradas em várias linhas (`reassign`, `declare`, `acknowledge-alert`) trazem uma vírgula
+  // final depois do array de papéis e antes do `]` que fecha a tripla — `,?` opcional entre os
+  // dois fechamentos (A10 item c).
+  const triplePattern =
+    /\[\s*'([a-z-]+)'\s*,\s*'([a-z-]+)'\s*,\s*\[([^\]]*)\]\s*,?\s*\]/g;
+  const rules: PolicyCommandRule[] = [];
+  for (const match of body.matchAll(triplePattern)) {
+    const [, resource, action, rolesBlock] = match;
+    const roles = [...rolesBlock.matchAll(/'([A-Za-z-]+)'/g)].map(
+      (roleMatch) => roleMatch[1],
+    );
+    rules.push({ key: `inf:${resource}:${action}`, roles });
+  }
+  return rules;
+}
+
+/**
+ * Tokens `rait.<recurso>:<ação>` citados na seção `## 6. Comandos` da ficha `id` — utilitário do
+ * catálogo (contrato §7) para comparar a cobertura de `RAIT_COMMANDS`/`RAIT_COMMAND_RULES`
+ * contra o que cada ficha pede (relatório de divergência OD-R12-026/027); não tem `it` numerado
+ * dedicado no §8 do contrato (a referência "C-2B-105" do §7 excede os 91 critérios do §8 —
+ * registrada como observação no relatório de entrega, não inventada aqui).
+ */
+export function readSheetCommands(id: string): readonly string[] {
+  const file = join(SCREENS_DIR, `${id}.md`);
+  const text = readFileSync(file, 'utf8');
+  const section = extractSection(text, '6. Comandos');
+  const seen = new Set<string>();
+  for (const match of section.matchAll(/`(rait\.[a-z-]+:[a-z-]+)`/g)) {
+    seen.add(match[1]);
+  }
+  return [...seen];
+}
+
 const SHEET_FILE_PATTERN = /^IU-RAIT-(\d{3})\.md$/;

 /** Nomes dos arquivos de ficha em disco, exceto `IU-RAIT-001.md` (inventário, não ficha de rota). */
diff --git a/apps/rait/web/src/testing/stynx-session.stub.ts b/apps/rait/web/src/testing/stynx-session.stub.ts
index e618bca5..1bbea5c9 100644
--- a/apps/rait/web/src/testing/stynx-session.stub.ts
+++ b/apps/rait/web/src/testing/stynx-session.stub.ts
@@ -7,13 +7,26 @@
 // provider do Angular aceita `useValue` de qualquer forma, então o stub não precisa (nem pode,
 // por causa de membros privados) estender a classe real. Padrão
 // `apps/portal/web/src/testing/stynx-session.stub.ts`.
+//
+// R-0012 TASK-0008 (Inspector, iteração restrita — adenda A10 item i, `plan.md`). O
+// `.d.ts` do kit 1.3.1 (`StynxSessionService`, linha ~162) declara `readonly active$:
+// Observable<StynxSessionState>` (`@deprecated` mas ainda presente e assinado pelo construtor
+// de `StynxHasPermissionDirective`); sem ele, injetar `StynxSessionService` nos specs de
+// `shared/` que renderizam `*stynxHasPermission` lança porque a diretiva não consegue assinar
+// `session.active$`. `active$` é um `BehaviorSubject` que emite o estado corrente na assinatura
+// e a cada `state.set/update` ou `active.set/update` — os dois signals continuam graváveis
+// exatamente como antes (nenhum spec existente que grava `stub.state.set(...)` muda de
+// comportamento).
 import { signal, type WritableSignal } from '@angular/core';
 import { vi, type Mock } from 'vitest';
+import { BehaviorSubject, type Observable } from 'rxjs';
 import type { StynxSessionState } from '@stynx-nyx/angular-auth';

 export interface StynxSessionServiceStub {
   readonly state: WritableSignal<StynxSessionState>;
   readonly active: WritableSignal<boolean>;
+  /** `StynxSessionService.active$` (kit 1.3.1, `@deprecated`, ainda assinado pela diretiva). */
+  readonly active$: Observable<StynxSessionState>;
   snapshot(): StynxSessionState;
   readonly login: Mock<() => void>;
   readonly loginRedirect: Mock<() => void>;
@@ -37,12 +50,47 @@ export function createStynxSessionStub(
   initial: Partial<StynxSessionState> = {},
 ): StynxSessionServiceStub {
   const merged: StynxSessionState = { ...DEFAULT_STATE, ...initial };
-  const stateSignal = signal(merged);
-  const activeSignal = signal(merged.active);
+  const subject = new BehaviorSubject<StynxSessionState>(merged);
+  const baseStateSignal = signal(merged);
+  const baseActiveSignal = signal(merged.active);
+
+  // `WritableSignal` é uma função com `set`/`update`/`asReadonly` anexados (mesma forma que o
+  // Angular usa internamente) — reaproveita-se o signal de base para leitura e intercepta-se as
+  // escritas para também alimentar `active$`.
+  const stateSignal: WritableSignal<StynxSessionState> = Object.assign(
+    (() => baseStateSignal()) as WritableSignal<StynxSessionState>,
+    {
+      set(value: StynxSessionState): void {
+        baseStateSignal.set(value);
+        subject.next(value);
+      },
+      update(updater: (value: StynxSessionState) => StynxSessionState): void {
+        baseStateSignal.update(updater);
+        subject.next(baseStateSignal());
+      },
+      asReadonly: () => baseStateSignal.asReadonly(),
+    },
+  );
+  const activeSignal: WritableSignal<boolean> = Object.assign(
+    (() => baseActiveSignal()) as WritableSignal<boolean>,
+    {
+      set(value: boolean): void {
+        baseActiveSignal.set(value);
+        subject.next(baseStateSignal());
+      },
+      update(updater: (value: boolean) => boolean): void {
+        baseActiveSignal.update(updater);
+        subject.next(baseStateSignal());
+      },
+      asReadonly: () => baseActiveSignal.asReadonly(),
+    },
+  );
+
   const completeLogin = vi.fn(async (_url?: string) => stateSignal());
   return {
     state: stateSignal,
     active: activeSignal,
+    active$: subject.asObservable(),
     snapshot: () => stateSignal(),
     login: vi.fn(),
     loginRedirect: vi.fn(),
```
