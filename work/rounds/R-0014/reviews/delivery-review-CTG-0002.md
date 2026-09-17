# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `portal-pwa` (rodada `R-0014`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/portal-build-pack.md` — apenas a seção do WP `WP-P4…P6` e o "mapa entregável → definições"
4. `work/rounds/R-0014/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0014/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0014/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0014",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0014/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Primeiro ciclo (exaustivo) da entrega do grupo acoplado CTG-0002** — WP-P4: TASK-0005/0013/0014
(Architect transcrição, três lotes: 27 fichas `IU-PORTAL-T01…T27.md` + baseline do KB 522 → 549),
TASK-0006 (Architect transcrição: catálogo i18n `apps/portal/web/src/app/i18n/portal.pt-BR.json`,
+436 chaves — mapa de tradução `portal.situation.*`, textos jurídicos `portal.legal.*.v1` com
`.source`, `portal.errors.*` = 67 códigos do catálogo, `portal.screens.t<nn>.*` das fichas,
`portal.forms.*`, `portal.services.*`, `portal.notifications.*`, `portal.documents.*`; 3 iterações),
TASK-0007 (Inspector: 5 specs tela ↔ ficha ↔ rota ↔ i18n, 211 casos; 2 iterações — a segunda só
tipagem). Adenda **A4** do Architect (`plan.md` §Adendas): T-22 perde o `serviceKey`
`acompanhar_manifestacao` (não é serviço do catálogo canônico [WF-PORTAL-001]; a rota ficaria
sempre bloqueada) — aplicada em `route-manifest.md`, `app.route-manifest.ts` (Engineer, TASK-0004
it. 3) e `src/testing/route-manifest.fixture.ts` (Inspector, TASK-0002 it. 3); `junta_medica`
mantém o `serviceKey` (serviço canônico, ausente da fixture por OD-P19) e ganha
`portal.services.junta_medica`. OD propostas (numeração do Architect, transcrição ao build pack em
TASK-0012): OD-P52 (nível de T-08), OD-P53 (nível de T-09), OD-P54 (offline T-16/T-17), OD-P55
(catálogo de serviços: 15 linhas na fixture; nome de `cancelamento_sne`), OD-P56 (`badge_of` para 9
estados sem fonte). Relatórios: `work/rounds/R-0014/reports/TASK-0005.md`, `TASK-0013.md`,
`TASK-0014.md`, `TASK-0006.md` (+ `-iteration-2`, `-iteration-3`), `TASK-0007.md` (+ `-iteration-2`),
`TASK-0004-iteration-3.md`, `TASK-0002-iteration-3.md`. Triagem: `plan.md` §Triagem (typecheck do
spec, `plant-bug`). A entrega está **staged, não commitada** (`git diff --cached`), no branch
publicado `orchestra/portal-pwa` (= `origin/main` `1396f1a` + `67a4600` + `288ba41`).

Gates executados pelo maestro sobre a árvore staged (log `pnpm-check-ctg2b.log`): `pnpm check`
completo → **EXIT 0**: `docs:kb:check` **OK (549 artifacts, 446 canonical tokens)**; publish-check
OK; `verify:parameter-catalogue` OK (14 i18n namespaces); typecheck 54 pacotes OK;
`@detran/portal-web` lint OK, test **472/472** (261 anteriores + 211 novos), build OK; demais
verificadores OK; `format:check` OK.

Itens a julgar com atenção: (5) nenhum valor inventado nas fichas e no catálogo — cada texto cita
fonte (`[UC-…]`, `[RN-…]`, ux-notes §c) ou virou OD (P52…P56); os textos jurídicos trazem
`…v1.source`; (8) vocabulário: tokens ALL_CAPS só em backticks quando pertencem a um workflow
(`kb:check` prova), nenhum token cru como valor do catálogo (`translation-map.spec.ts`); (10) as
fichas de [IU-PORTAL-001] §F transcrevem as premissas adotadas (OD-P03/H.53, OD-P04, H.50, H.51)
sem reabrir; (7) nenhum spec enfraquecido — o Inspector relatou 3 defeitos reais do catálogo em vez
de acomodá-los, corrigidos pelo transcriber (it. 3); (13) não se aplica (sem matriz de política
nova; a matriz de guardas do CTG-0001 continua verde com 18 rotas com `serviceKey`).

### git diff --cached --stat (sem `work/`)

```
 apps/portal/web/src/app/app.route-manifest.ts      |   1 -
 apps/portal/web/src/app/i18n/portal.pt-BR.json     | 440 ++++++++++++++++++++-
 .../portal/web/src/app/screens/legal-texts.spec.ts |  72 ++++
 .../portal/web/src/app/screens/screen-i18n.spec.ts |  69 ++++
 .../web/src/app/screens/screen-sheets.spec.ts      | 134 +++++++
 .../web/src/app/screens/services-i18n.spec.ts      |  41 ++
 .../web/src/app/screens/translation-map.spec.ts    | 130 ++++++
 apps/portal/web/src/testing/kb.ts                  | 213 ++++++++++
 .../web/src/testing/route-manifest.fixture.ts      |  10 +-
 .../transversal/portal/screens/IU-PORTAL-T01.md    | 161 ++++++++
 .../transversal/portal/screens/IU-PORTAL-T02.md    | 157 ++++++++
 .../transversal/portal/screens/IU-PORTAL-T03.md    | 140 +++++++
 .../transversal/portal/screens/IU-PORTAL-T04.md    | 138 +++++++
 .../transversal/portal/screens/IU-PORTAL-T05.md    | 149 +++++++
 .../transversal/portal/screens/IU-PORTAL-T06.md    | 120 ++++++
 .../transversal/portal/screens/IU-PORTAL-T07.md    | 147 +++++++
 .../transversal/portal/screens/IU-PORTAL-T08.md    | 134 +++++++
 .../transversal/portal/screens/IU-PORTAL-T09.md    | 147 +++++++
 .../transversal/portal/screens/IU-PORTAL-T10.md    | 108 +++++
 .../transversal/portal/screens/IU-PORTAL-T11.md    | 105 +++++
 .../transversal/portal/screens/IU-PORTAL-T12.md    | 103 +++++
 .../transversal/portal/screens/IU-PORTAL-T13.md    | 115 ++++++
 .../transversal/portal/screens/IU-PORTAL-T14.md    | 101 +++++
 .../transversal/portal/screens/IU-PORTAL-T15.md    |  87 ++++
 .../transversal/portal/screens/IU-PORTAL-T16.md    | 103 +++++
 .../transversal/portal/screens/IU-PORTAL-T17.md    | 101 +++++
 .../transversal/portal/screens/IU-PORTAL-T18.md    | 101 +++++
 .../transversal/portal/screens/IU-PORTAL-T19.md    | 135 +++++++
 .../transversal/portal/screens/IU-PORTAL-T20.md    | 140 +++++++
 .../transversal/portal/screens/IU-PORTAL-T21.md    | 121 ++++++
 .../transversal/portal/screens/IU-PORTAL-T22.md    | 121 ++++++
 .../transversal/portal/screens/IU-PORTAL-T23.md    | 145 +++++++
 .../transversal/portal/screens/IU-PORTAL-T24.md    | 137 +++++++
 .../transversal/portal/screens/IU-PORTAL-T25.md    | 123 ++++++
 .../transversal/portal/screens/IU-PORTAL-T26.md    | 122 ++++++
 .../transversal/portal/screens/IU-PORTAL-T27.md    | 142 +++++++
 docs/meta/knowledge-base/import-manifest.json      |   2 +-
 37 files changed, 4507 insertions(+), 8 deletions(-)
```

### git diff --cached — código, testes, manifesto, adenda A4 (sem `work/`, sem as 27 fichas e sem o JSON i18n, anexados a seguir em forma resumida)

```diff
diff --git a/apps/portal/web/src/app/app.route-manifest.ts b/apps/portal/web/src/app/app.route-manifest.ts
index c7d658f..8e98aeb 100644
--- a/apps/portal/web/src/app/app.route-manifest.ts
+++ b/apps/portal/web/src/app/app.route-manifest.ts
@@ -332,7 +332,6 @@ export const PORTAL_ROUTE_MANIFEST: readonly RouteManifestEntry[] = [
     module: 'atendimento',
     access: 'simples',
     entitlement: { kind: 'manifestation', param: 'manifestationId' },
-    serviceKey: 'acompanhar_manifestacao',
     journeys: ['JRN-PORTAL-009'],
   },
   {
diff --git a/apps/portal/web/src/app/screens/legal-texts.spec.ts b/apps/portal/web/src/app/screens/legal-texts.spec.ts
new file mode 100644
index 0000000..27fd357
--- /dev/null
+++ b/apps/portal/web/src/app/screens/legal-texts.spec.ts
@@ -0,0 +1,72 @@
+// R-0014 TASK-0007 (Inspector). Contrato dos textos jurídicos versionados (plan.md M9;
+// prompts/TASK-0007.md §Tarefa item 4).
+//
+// `efeitos_sne.v1`: o prompt de TASK-0007 nomeia os quatro efeitos como `ciencia_ficta`,
+// `canal_exclusivo`, `desconto_60`, `cancelamento` — paráfrase do corpo da própria tarefa. O
+// catálogo real (`portal.pt-BR.json`, TASK-0006) transcreveu, em vez disso, os quatro efeitos tal
+// como a tabela normativa de [RN-PORTAL-123] os enumera: `ciencia_ficta`, `substituicao`,
+// `responsabilidade`, `cancelamento` — documentado no relatório de TASK-0006 ("Fora do escopo",
+// item `efeitos_sne`) como divergência consciente (a paráfrase do prompt não corresponde à tabela
+// da regra e misturaria adesão com decisão de pagamento). Por instrução do maestro (atualização de
+// 2026-09-17 ao prompt desta tarefa), o teste exige exatamente 4 chaves-filhas além de `.source`,
+// sem fixar os nomes do prompt — a divergência de nomes é relatada, não corrigida aqui.
+import { readCatalog } from '../../testing/kb';
+
+const MIN_LEGAL_TEXT_LENGTH = 40;
+
+const VERSIONED_DOCS = [
+  'consequencias_desistencia',
+  'consequencias_indicacao',
+  'efeitos_sne',
+  'renuncia_40',
+] as const;
+
+describe('contrato dos textos jurídicos versionados (M9)', () => {
+  const catalog = readCatalog();
+
+  for (const doc of VERSIONED_DOCS) {
+    it(`dado o catálogo quando portal.legal.${doc}.v1 é lido então existe, tem ≥ 40 caracteres e tem …v1.source não vazio`, () => {
+      const key = `portal.legal.${doc}.v1`;
+      expect(catalog[key], `chave ausente: ${key}`).toBeDefined();
+      expect(
+        catalog[key].length,
+        `texto de ${key} tem menos de ${MIN_LEGAL_TEXT_LENGTH} caracteres`,
+      ).toBeGreaterThanOrEqual(MIN_LEGAL_TEXT_LENGTH);
+
+      const sourceKey = `${key}.source`;
+      expect(
+        catalog[sourceKey]?.length ?? 0,
+        `chave ausente ou vazia: ${sourceKey}`,
+      ).toBeGreaterThan(0);
+    });
+  }
+
+  it('dado o catálogo quando portal.legal.efeitos_sne.v1.* é lido então tem exatamente 4 chaves-filhas além de .source', () => {
+    const prefix = 'portal.legal.efeitos_sne.v1.';
+    const children = Object.keys(catalog)
+      .filter((key) => key.startsWith(prefix))
+      .filter((key) => key !== `${prefix}source`);
+    expect(
+      children,
+      `chaves-filhas de efeitos_sne.v1 (exceto .source): ${children.join(', ')}`,
+    ).toHaveLength(4);
+    for (const child of children) {
+      expect(
+        catalog[child].length,
+        `texto de ${child} tem menos de ${MIN_LEGAL_TEXT_LENGTH} caracteres`,
+      ).toBeGreaterThanOrEqual(MIN_LEGAL_TEXT_LENGTH);
+    }
+  });
+
+  it('dado todo texto jurídico (portal.legal.*, exceto .source) quando inspecionado então não está vazio nem tem menos de 40 caracteres', () => {
+    const offenders = Object.entries(catalog)
+      .filter(([key]) => key.startsWith('portal.legal.'))
+      .filter(([key]) => !key.endsWith('.source'))
+      .filter(([, value]) => value.length < MIN_LEGAL_TEXT_LENGTH)
+      .map(([key]) => key);
+    expect(
+      offenders,
+      `textos jurídicos curtos ou vazios: ${offenders.join(', ')}`,
+    ).toEqual([]);
+  });
+});
diff --git a/apps/portal/web/src/app/screens/screen-i18n.spec.ts b/apps/portal/web/src/app/screens/screen-i18n.spec.ts
new file mode 100644
index 0000000..8cb9b33
--- /dev/null
+++ b/apps/portal/web/src/app/screens/screen-i18n.spec.ts
@@ -0,0 +1,69 @@
+// R-0014 TASK-0007 (Inspector). Contrato ficha ↔ i18n (plan.md M9/M11; prompts/TASK-0007.md
+// §Tarefa item 2): toda chave `portal.screens.t<nn>.*` listada na seção "Chaves i18n" de cada
+// ficha existe no catálogo; `portal.screens.t<nn>.title` existe para as 27 telas; nenhuma chave
+// `portal.screens.t<nn>.*` do catálogo pertence a uma tela sem ficha.
+import {
+  extractSection,
+  listSheetIds,
+  readCatalog,
+  readSheet,
+} from '../../testing/kb';
+
+// O prompt de TASK-0007 sugere `portal\.screens\.t\d{2}\.[a-z0-9_.]+` (só minúsculas), mas o
+// catálogo real (TASK-0006) usa segmentos camelCase legítimos em várias chaves de campo
+// (`field.additionalText`, `field.driverCpf`, `field.driverCnh` — conferidas nas fichas T-04/T-05
+// e existentes em portal.pt-BR.json); a versão só-minúsculas truncava essas chaves no meio
+// (`field.driver`, `field.additional`) e acusava "chave ausente" por um defeito do próprio
+// regex, não da ficha/catálogo. Estendido para `[A-Za-z0-9_.]+` — mesma exigência semântica
+// (toda chave citada existe no catálogo), captura completa.
+const SCREEN_KEY_PATTERN = /portal\.screens\.t\d{2}\.[A-Za-z0-9_.]+/g;
+const SCREEN_KEY_PREFIX = /^portal\.screens\.t(\d{2})\./;
+
+describe('contrato de chaves i18n das fichas (M9/M11)', () => {
+  const catalog = readCatalog();
+  const catalogKeys = new Set(Object.keys(catalog));
+  const sheetIds = listSheetIds();
+
+  for (const sheet of sheetIds) {
+    it(`dado a ficha ${sheet} quando a seção "Chaves i18n" é lida então toda chave portal.screens.* existe no catálogo`, () => {
+      const section = extractSection(readSheet(sheet), 'Chaves i18n');
+      const keys = [...section.matchAll(SCREEN_KEY_PATTERN)].map(
+        (match) => match[0],
+      );
+      expect(keys.length).toBeGreaterThan(0);
+      const missing = keys.filter((key) => !catalogKeys.has(key));
+      expect(
+        missing,
+        `chaves citadas em ${sheet} sem entrada no catálogo: ${missing.join(', ')}`,
+      ).toEqual([]);
+    });
+  }
+
+  it('dado as 27 telas quando o catálogo é lido então portal.screens.t<nn>.title existe para cada uma', () => {
+    const missing = sheetIds
+      .map((sheet) => sheet.match(/T(\d{2})$/)?.[1])
+      .filter((nn): nn is string => !!nn)
+      .filter((nn) => !catalogKeys.has(`portal.screens.t${nn}.title`));
+    expect(
+      missing,
+      `portal.screens.t<nn>.title ausente para: ${missing.join(', ')}`,
+    ).toEqual([]);
+    expect(sheetIds).toHaveLength(27);
+  });
+
+  it('dado toda chave portal.screens.t<nn>.* do catálogo quando comparada às fichas em disco então pertence a uma tela com ficha', () => {
+    const sheetNumbers = new Set(
+      sheetIds
+        .map((sheet) => sheet.match(/T(\d{2})$/)?.[1])
+        .filter((nn): nn is string => !!nn),
+    );
+    const orphaned = [...catalogKeys].filter((key) => {
+      const match = key.match(SCREEN_KEY_PREFIX);
+      return match && !sheetNumbers.has(match[1]);
+    });
+    expect(
+      orphaned,
+      `chaves portal.screens.* sem ficha correspondente: ${orphaned.join(', ')}`,
+    ).toEqual([]);
+  });
+});
diff --git a/apps/portal/web/src/app/screens/screen-sheets.spec.ts b/apps/portal/web/src/app/screens/screen-sheets.spec.ts
new file mode 100644
index 0000000..4256321
--- /dev/null
+++ b/apps/portal/web/src/app/screens/screen-sheets.spec.ts
@@ -0,0 +1,134 @@
+// R-0014 TASK-0007 (Inspector). Contrato tela ↔ ficha ↔ rota (plan.md M11; prompts/TASK-0007.md
+// §Tarefa item 1). O manifesto de produção (`PORTAL_ROUTE_MANIFEST`, TASK-0004) é a fonte da
+// verdade sobre rotas: sua fidelidade a `route-manifest.md` já foi provada entrada a entrada por
+// TASK-0002 (`app.route-manifest.spec.ts` contra `src/testing/route-manifest.fixture.ts`); aqui
+// comparamos o manifesto às fichas escritas por TASK-0005/0013/0014.
+import { PORTAL_ROUTE_MANIFEST } from '../app.route-manifest';
+import {
+  backtickSpans,
+  extractSection,
+  frontMatter,
+  listSheetIds,
+  MANDATORY_SCREEN_STATES,
+  readSheet,
+  SHEET_SECTIONS,
+} from '../../testing/kb';
+
+/** Caminho sem barra inicial, como o manifesto grava (`route-manifest.md` §cabeçalho). */
+function withoutLeadingSlash(path: string): string {
+  return path.startsWith('/') ? path.slice(1) : path;
+}
+
+const screensWithSheet = PORTAL_ROUTE_MANIFEST.filter(
+  (entry) => entry.screen !== null && entry.sheet !== null,
+);
+
+const screenIds = [...new Set(screensWithSheet.map((entry) => entry.screen))]
+  .filter((screen): screen is `T-${string}` => screen !== null)
+  .sort();
+
+describe('contrato tela ↔ ficha (plan.md M11)', () => {
+  it('dado cada entrada do manifesto com screen ≠ null quando resolvida então o arquivo da ficha existe', () => {
+    const missing = screensWithSheet
+      .map((entry) => entry.sheet as string)
+      .filter((sheet, index, all) => all.indexOf(sheet) === index)
+      .filter((sheet) => !listSheetIds().includes(sheet));
+    expect(missing, `fichas ausentes: ${missing.join(', ')}`).toEqual([]);
+  });
+
+  for (const screen of screenIds) {
+    const entries = screensWithSheet.filter((entry) => entry.screen === screen);
+    const sheet = entries[0].sheet as string;
+
+    describe(`dado a ficha ${sheet} (${screen})`, () => {
+      const text = readSheet(sheet);
+      const meta = frontMatter(text);
+
+      it('quando o front-matter é lido então id = sheet, status = draft, apps = [portal]', () => {
+        expect(meta['id']).toBe(sheet);
+        expect(meta['status']).toBe('draft');
+        expect(meta['apps']).toBe('[portal]');
+      });
+
+      it('quando as seções são listadas então as 12 seções do esqueleto (M11) estão presentes', () => {
+        const lines = text.split(/\r?\n/).map((line) => line.trim());
+        for (const heading of SHEET_SECTIONS) {
+          expect(
+            lines.includes(`## ${heading}`),
+            `seção ausente: ## ${heading}`,
+          ).toBe(true);
+        }
+      });
+
+      it('quando a seção Identidade é lida então cita todas as rotas do manifesto para esta tela', () => {
+        const identity = extractSection(text, '1. Identidade');
+        const spans = new Set(backtickSpans(identity).map(withoutLeadingSlash));
+        const missing = entries
+          .map((entry) => withoutLeadingSlash(entry.path))
+          .filter((path) => !spans.has(path));
+        expect(
+          missing,
+          `rota(s) do manifesto não citada(s) em Identidade: ${missing.join(', ')}`,
+        ).toEqual([]);
+      });
+
+      it('quando a seção Identidade é lida então não cita rota de outra tela (paths compostos, sem colisão com nome de módulo)', () => {
+        // Restrito a paths com "/" (compostos): paths de um segmento só (`autos`, `processos`,
+        // `notificacoes`, `sinistros`...) coincidem, em várias fichas, com o nome do módulo
+        // citado na Identidade da própria tela (ex.: T-01 cita `módulo: autos`, que é também o
+        // path de T-14) — checar isso geraria falso-positivo sistemático; o esqueleto (M11) não
+        // distingue path de nome de módulo na prosa, então o teste cobre o caso inequívoco.
+        const identity = extractSection(text, '1. Identidade');
+        const spans = new Set(backtickSpans(identity).map(withoutLeadingSlash));
+        const ownPaths = new Set(
+          entries.map((entry) => withoutLeadingSlash(entry.path)),
+        );
+        const otherCompositePaths = new Set(
+          PORTAL_ROUTE_MANIFEST.filter(
+            (entry) => entry.screen !== screen && entry.path.includes('/'),
+          ).map((entry) => withoutLeadingSlash(entry.path)),
+        );
+        const offenders = [...spans].filter(
+          (span) => !ownPaths.has(span) && otherCompositePaths.has(span),
+        );
+        expect(
+          offenders,
+          `Identidade de ${sheet} cita rota de outra tela: ${offenders.join(', ')}`,
+        ).toEqual([]);
+      });
+
+      it('quando a seção Acesso é lida então cita o access do manifesto', () => {
+        const access = extractSection(text, '2. Acesso');
+        for (const entry of entries) {
+          expect(
+            access.includes(entry.access),
+            `access "${entry.access}" (rota ${entry.path}) não citado na seção Acesso de ${sheet}`,
+          ).toBe(true);
+        }
+      });
+
+      it('quando a tabela "Estados obrigatórios" é lida então tem as seis linhas', () => {
+        const section = extractSection(
+          text,
+          'Estados obrigatórios',
+        ).toLowerCase();
+        const missing = MANDATORY_SCREEN_STATES.filter(
+          (state) => !section.includes(state),
+        );
+        expect(
+          missing,
+          `linha(s) ausente(s) em "Estados obrigatórios" de ${sheet}: ${missing.join(', ')}`,
+        ).toEqual([]);
+      });
+    });
+  }
+
+  it('dado toda ficha IU-PORTAL-T*.md em disco quando comparada ao manifesto então corresponde a um screen (27 ↔ 27)', () => {
+    const onDisk = listSheetIds();
+    const fromManifest = [
+      ...new Set(screensWithSheet.map((entry) => entry.sheet as string)),
+    ].sort();
+    expect(onDisk).toEqual(fromManifest);
+    expect(onDisk).toHaveLength(27);
+  });
+});
diff --git a/apps/portal/web/src/app/screens/services-i18n.spec.ts b/apps/portal/web/src/app/screens/services-i18n.spec.ts
new file mode 100644
index 0000000..d3a52d2
--- /dev/null
+++ b/apps/portal/web/src/app/screens/services-i18n.spec.ts
@@ -0,0 +1,41 @@
+// R-0014 TASK-0007 (Inspector). Contrato serviço ↔ i18n (plan.md M9; prompts/TASK-0007.md
+// §Tarefa item 5). "Manifesto" aqui é o manifesto de produção `PORTAL_ROUTE_MANIFEST`
+// (src/app/app.route-manifest.ts) — não a fixture `src/testing/route-manifest.fixture.ts` — por
+// instrução do maestro (atualização de 2026-09-17 ao prompt desta tarefa, adenda A4 de plan.md):
+// T-22 não tem `serviceKey` no manifesto real, e `cancelamento_sne` (parte da lista fechada de 16
+// chaves da fixture) não está atrelado a nenhuma rota — nenhum dos dois entra na obrigação deste
+// teste.
+import { PORTAL_ROUTE_MANIFEST } from '../app.route-manifest';
+import { readCatalog, SERVICE_KEYS } from '../../testing/kb';
+
+describe('contrato serviço ↔ i18n (M9)', () => {
+  const catalog = readCatalog();
+  const manifestServiceKeys = [
+    ...new Set(
+      PORTAL_ROUTE_MANIFEST.map((entry) => entry.serviceKey).filter(
+        (key): key is string => !!key,
+      ),
+    ),
+  ].sort();
+
+  it('dado todo serviceKey do manifesto quando comparado à lista fechada de serviços então pertence a ela', () => {
+    const offenders = manifestServiceKeys.filter(
+      (key) => !(SERVICE_KEYS as readonly string[]).includes(key),
+    );
+    expect(
+      offenders,
+      `serviceKey do manifesto fora da lista fechada: ${offenders.join(', ')}`,
+    ).toEqual([]);
+  });
+
+  it('dado todo serviceKey do manifesto quando comparado ao catálogo então existe portal.services.<key>', () => {
+    expect(manifestServiceKeys.length).toBeGreaterThan(0);
+    const missing = manifestServiceKeys.filter(
+      (key) => !catalog[`portal.services.${key}`],
+    );
+    expect(
+      missing,
+      `portal.services.<key> ausente para: ${missing.join(', ')}`,
+    ).toEqual([]);
+  });
+});
diff --git a/apps/portal/web/src/app/screens/translation-map.spec.ts b/apps/portal/web/src/app/screens/translation-map.spec.ts
new file mode 100644
index 0000000..5c0ec5f
--- /dev/null
+++ b/apps/portal/web/src/app/screens/translation-map.spec.ts
@@ -0,0 +1,130 @@
+// R-0014 TASK-0007 (Inspector). Contrato do mapa de tradução (plan.md M9; prompts/TASK-0007.md
+// §Tarefa item 3). Listas fechadas em src/testing/kb.ts, fonte em comentário — nenhum valor
+// inventado aqui: as constantes vêm de INFRACTION_SITUATION_MAP, REQUEST_TRANSITIONS e
+// PROCESS_TIMELINE_DOMAIN_EVENTS, transcritas por TASK-0006 e copiadas ao prompt de TASK-0007.
+//
+// `badge_of`: o maestro confirmou (relatório de entrega, atualização de 2026-09-17, com base nos
+// relatórios TASK-0006/TASK-0006-iteration-2 e na adenda OD-P56 de plan.md) que o catálogo real
+// só define `badge_of` para os 4 estados com correspondência inequívoca na fonte — o critério
+// aqui é "chaves ⊆ 13 estados e valores ⊆ 5 badges", não completude sobre os 13 estados.
+import {
+  BADGES,
+  INFRACTION_SITUATIONS,
+  readCatalog,
+  readErrorCatalogCodes,
+  REQUEST_STATES,
+  TIMELINE_EVENTS,
+} from '../../testing/kb';
+
+function keysWithPrefix(
+  catalog: Record<string, string>,
+  prefix: string,
+): string[] {
+  return Object.keys(catalog)
+    .filter((key) => key.startsWith(prefix))
+    .map((key) => key.slice(prefix.length));
+}
+
+describe('contrato do mapa de tradução (M9)', () => {
+  const catalog = readCatalog();
+
+  it('dado o catálogo quando portal.situation.infraction.* é lido então tem exatamente as 7 situações', () => {
+    const found = keysWithPrefix(
+      catalog,
+      'portal.situation.infraction.',
+    ).sort();
+    expect(found).toEqual([...INFRACTION_SITUATIONS].sort());
+  });
+
+  it('dado o catálogo quando portal.situation.request.* é lido então tem exatamente os 13 estados', () => {
+    const found = keysWithPrefix(catalog, 'portal.situation.request.').sort();
+    expect(found).toEqual([...REQUEST_STATES].sort());
+  });
+
+  it('dado o catálogo quando portal.situation.badge.* é lido então tem exatamente os 5 badges', () => {
+    const found = keysWithPrefix(catalog, 'portal.situation.badge.').sort();
+    expect(found).toEqual([...BADGES].sort());
+  });
+
+  it('dado o catálogo quando portal.situation.badge_of.* é lido então as chaves ⊆ 13 estados e os valores ⊆ 5 badges', () => {
+    const entries = Object.entries(catalog).filter(([key]) =>
+      key.startsWith('portal.situation.badge_of.'),
+    );
+    expect(entries.length).toBeGreaterThan(0);
+    const badStates = entries
+      .map(([key]) => key.slice('portal.situation.badge_of.'.length))
+      .filter(
+        (state) => !(REQUEST_STATES as readonly string[]).includes(state),
+      );
+    expect(badStates, `estados fora dos 13: ${badStates.join(', ')}`).toEqual(
+      [],
+    );
+    const badValues = entries
+      .map(([, value]) => value)
+      .filter((value) => !(BADGES as readonly string[]).includes(value));
+    expect(
+      badValues,
+      `valores fora dos 5 badges: ${badValues.join(', ')}`,
+    ).toEqual([]);
+  });
+
+  it('dado o catálogo quando portal.situation.event.* é lido então tem exatamente os 7 eventos', () => {
+    const found = keysWithPrefix(catalog, 'portal.situation.event.').sort();
+    expect(found).toEqual([...TIMELINE_EVENTS].sort());
+  });
+
+  it('dado o catálogo quando portal.requests.nextAction.* é lido então tem exatamente os 13 estados', () => {
+    const found = keysWithPrefix(catalog, 'portal.requests.nextAction.').sort();
+    expect(found).toEqual([...REQUEST_STATES].sort());
+  });
+
+  it('dado o catálogo quando portal.evaluations.publicIndicator é lido então existe e não é vazio', () => {
+    expect(
+      catalog['portal.evaluations.publicIndicator']?.length,
+    ).toBeGreaterThan(0);
+  });
+
+  it('dado todo valor do catálogo quando inspecionado então nenhum casa ^[A-Z][A-Z_0-9]{3,}$ (token interno não vaza)', () => {
+    const leaked = Object.entries(catalog).filter(([, value]) =>
+      /^[A-Z][A-Z_0-9]{3,}$/.test(value),
+    );
+    expect(
+      leaked.map(([key]) => key),
+      `valores que vazam token interno: ${leaked.map(([key, value]) => `${key}=${value}`).join(', ')}`,
+    ).toEqual([]);
+  });
+
+  it('dado todo valor do catálogo quando inspecionado então nenhum contém "acesso negado"', () => {
+    const offenders = Object.entries(catalog).filter(([, value]) =>
+      /acesso negado/i.test(value),
+    );
+    expect(
+      offenders.map(([key]) => key),
+      `chaves com "acesso negado": ${offenders.map(([key]) => key).join(', ')}`,
+    ).toEqual([]);
+  });
+
+  it('dado o catálogo de erros (portal-error-catalog.md) quando comparado a portal.errors.* então a correspondência é bidirecional', () => {
+    const errorCodes = readErrorCatalogCodes();
+    const errorKeys = Object.keys(catalog).filter((key) =>
+      key.startsWith('portal.errors.'),
+    );
+    const keysWithoutCode = errorKeys.filter(
+      (key) =>
+        !errorCodes.has(key.slice('portal.errors.'.length).toUpperCase()),
+    );
+    expect(
+      keysWithoutCode,
+      `chaves portal.errors.* sem código no catálogo: ${keysWithoutCode.join(', ')}`,
+    ).toEqual([]);
+
+    const keySet = new Set(
+      errorKeys.map((key) => key.slice('portal.errors.'.length).toUpperCase()),
+    );
+    const codesWithoutKey = [...errorCodes].filter((code) => !keySet.has(code));
+    expect(
+      codesWithoutKey,
+      `códigos do catálogo sem chave portal.errors.*: ${codesWithoutKey.join(', ')}`,
+    ).toEqual([]);
+  });
+});
diff --git a/apps/portal/web/src/testing/kb.ts b/apps/portal/web/src/testing/kb.ts
new file mode 100644
index 0000000..2826ed8
--- /dev/null
+++ b/apps/portal/web/src/testing/kb.ts
@@ -0,0 +1,213 @@
+// R-0014 TASK-0007 (Inspector). Helper de leitura das fichas de tela
+// (docs/framework/product/transversal/portal/screens/*.md) e do catálogo i18n
+// (src/app/i18n/portal.pt-BR.json) para os specs tela ↔ ficha ↔ rota ↔ i18n
+// (src/app/screens/*.spec.ts). Listas fechadas com fonte em comentário — nenhum valor inventado
+// (plan.md M9/M11, route-manifest.md, prompts/TASK-0007.md §Definições, e as atualizações do
+// maestro de 2026-09-17 citadas no relatório de entrega).
+import { readFileSync, readdirSync } from 'node:fs';
+import { dirname, join } from 'node:path';
+import { fileURLToPath } from 'node:url';
+
+const testingDir = dirname(fileURLToPath(import.meta.url)); // .../src/testing
+export const APP_SRC_ROOT = join(testingDir, '..'); // .../src
+export const REPO_ROOT = join(testingDir, '..', '..', '..', '..', '..'); // raiz do monorepo
+export const SCREENS_DIR = join(
+  REPO_ROOT,
+  'docs/framework/product/transversal/portal/screens',
+);
+export const I18N_CATALOG_PATH = join(
+  APP_SRC_ROOT,
+  'app/i18n/portal.pt-BR.json',
+);
+export const ERROR_CATALOG_PATH = join(
+  REPO_ROOT,
+  'docs/framework/arch/portal-error-catalog.md',
+);
+
+const SHEET_FILE_PATTERN = /^IU-PORTAL-T(\d{2})\.md$/;
+
+/** Nomes dos arquivos de ficha em disco (ex.: `IU-PORTAL-T01.md`), ordenados. */
+export function listSheetFiles(): string[] {
+  return readdirSync(SCREENS_DIR)
+    .filter((name) => SHEET_FILE_PATTERN.test(name))
+    .sort();
+}
+
+/** `sheet` (`IU-PORTAL-Tnn`) de cada ficha em disco. */
+export function listSheetIds(): string[] {
+  return listSheetFiles().map((name) => name.replace(/\.md$/, ''));
+}
+
+/** Conteúdo bruto de uma ficha pelo id do `sheet` (ex.: `IU-PORTAL-T01`). */
+export function readSheet(sheet: string): string {
+  return readFileSync(join(SCREENS_DIR, `${sheet}.md`), 'utf8');
+}
+
+/** Front-matter simples (uma linha `chave: valor` por campo), mesmo padrão de
+ * `tools/docs/kb/check.mjs` (função `frontMatter`, linhas ~80-90) — reimplementado aqui porque o
+ * módulo não é reutilizável (script `.mjs` fora da fronteira de escrita do Inspector). */
+export function frontMatter(text: string): Record<string, string> {
+  if (!text.startsWith('---\n')) return {};
+  const end = text.indexOf('\n---', 4);
+  if (end < 0) return {};
+  const result: Record<string, string> = {};
+  for (const line of text.slice(4, end).split('\n')) {
+    const match = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
+    if (match) result[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
+  }
+  return result;
+}
+
+/** Corpo de uma seção `## <heading>` até o próximo `## ` (ou fim do arquivo). `heading` é o texto
+ * exatamente como aparece após `## ` (ex.: `1. Identidade`, `Estados obrigatórios`). */
+export function extractSection(text: string, heading: string): string {
+  const lines = text.split(/\r?\n/);
+  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
+  if (start < 0) return '';
+  let end = lines.length;
+  for (let index = start + 1; index < lines.length; index += 1) {
+    if (/^##\s/.test(lines[index])) {
+      end = index;
+      break;
+    }
+  }
+  return lines.slice(start + 1, end).join('\n');
+}
+
+/** Spans entre crases de um trecho (`` `foo` `` → `foo`), sem os apóstrofos. */
+export function backtickSpans(text: string): string[] {
+  return [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
+}
+
+/** Catálogo i18n do Portal como `Record<chave, texto>`. */
+export function readCatalog(): Record<string, string> {
+  return JSON.parse(readFileSync(I18N_CATALOG_PATH, 'utf8')) as Record<
+    string,
+    string
+  >;
+}
+
+/** Códigos `PORTAL.<CODE>` (sem o prefixo) citados em `portal-error-catalog.md`. */
+export function readErrorCatalogCodes(): Set<string> {
+  const text = readFileSync(ERROR_CATALOG_PATH, 'utf8');
+  const codes = new Set<string>();
+  for (const match of text.matchAll(/PORTAL\.([A-Z_]+)/g)) {
+    codes.add(match[1]);
+  }
+  return codes;
+}
+
+// 7 situações do backend que o Portal traduz (`INFRACTION_SITUATION_MAP`, projeção
+// `infraction-view.projection.ts`; prompts/TASK-0007.md §Definições).
+export const INFRACTION_SITUATIONS = [
+  'aguardando_defesa',
+  'em_defesa',
+  'penalidade_aplicada',
+  'em_recurso',
+  'encerrada',
+  'arquivada',
+  'cancelada',
+] as const;
+
+// 13 estados do pedido (`REQUEST_TRANSITIONS`, guards/request.transitions.ts;
+// prompts/TASK-0007.md §Definições; [WF-PORTAL-001] §Estados).
+export const REQUEST_STATES = [
+  'IDENTIFICADO',
+  'SERVICO_SELECIONADO',
+  'ELEGIBILIDADE_VERIFICADA',
+  'INELEGIVEL',
+  'PEDIDO_EM_COMPOSICAO',
+  'AGUARDANDO_NIVEL_ASSINATURA',
+  'AGUARDANDO_PAGAMENTO',
+  'PROTOCOLADO',
+  'EM_ANDAMENTO_NO_ORGAO',
+  'RESULTADO_DISPONIVEL',
+  'AVALIACAO_OFERECIDA',
+  'CONCLUIDO',
+  'DESISTIDO',
+] as const;
+
+// 5 badges do `CitizenStatusBadge` (portal-frontends.md §5.2; prompts/TASK-0007.md §Definições).
+export const BADGES = [
+  'em_analise',
+  'aguardando_decisao',
+  'em_diligencia',
+  'decidido',
+  'encerrado',
+] as const;
+
+// Estados do pedido com `badge_of` inequívoco na fonte (plan.md §Adendas — OD-P56 cobre os
+// outros 9; reports/TASK-0006.md e TASK-0006-iteration-2.md): o catálogo real só define estes 4
+// (verificado em portal.pt-BR.json) — o critério do prompt de TASK-0007 é "chaves ⊆ 13 estados e
+// valores ⊆ 5 badges", não completude sobre os 13 (nota do maestro de 2026-09-17).
+export const BADGE_OF_DEFINED_STATES = [
+  'EM_ANDAMENTO_NO_ORGAO',
+  'RESULTADO_DISPONIVEL',
+  'CONCLUIDO',
+  'DESISTIDO',
+] as const;
+
+// 7 eventos da linha do tempo (`PROCESS_TIMELINE_DOMAIN_EVENTS`,
+// process-timeline.projection.ts; prompts/TASK-0007.md §Definições).
+export const TIMELINE_EVENTS = [
+  'RAIT_CASO_PROTOCOLADO',
+  'RAIT_CASO_ESTADO_ALTERADO',
+  'RAIT_EFEITO_SUSPENSIVO_INSTAURADO',
+  'RAIT_RECURSO_RECEBIDO_JULGADOR',
+  'RAIT_CASO_TRANSITADO',
+  'ENCERRADO_DESISTENCIA',
+  'RAIT_DECISAO_PUBLICADA',
+] as const;
+
+// Universo fechado de `serviceKey` (`PORTAL_SERVICE_KEYS`,
+// src/testing/route-manifest.fixture.ts — 15 linhas de `portal.service_catalog` na fixture,
+// incluindo `cancelamento_sne`, ∪ `junta_medica`; route-manifest.md §Invariantes, A4 do
+// plan.md). Nem todo elemento aparece em `app.route-manifest.ts`: T-22 perdeu `serviceKey` (A4) e
+// `cancelamento_sne` não está atrelado a nenhuma rota (OD-P55) — por isso os specs verificam o
+// serviceKey *do manifesto real*, não esta lista, mas todo serviceKey do manifesto pertence a
+// esta lista fechada.
+export const SERVICE_KEYS = [
+  'consulta_multas',
+  'defesa_previa',
+  'recurso_jari',
+  'recurso_cetran',
+  'indicacao_condutor',
+  'pagamento',
+  'adesao_sne',
+  'cancelamento_sne',
+  'consulta_cnh',
+  'emissao_crlv',
+  'consulta_bat',
+  'consulta_exame',
+  'junta_medica',
+  'manifestar',
+  'avaliar',
+  'lgpd_declaracao',
+] as const;
+
+// As 6 linhas obrigatórias de "Estados obrigatórios" em toda ficha (plan.md M11; build pack
+// WP-P4; prompts/TASK-0005.md §Tarefa).
+export const MANDATORY_SCREEN_STATES = [
+  'carregando',
+  'vazio',
+  'sem elegibilidade',
+  'erro recuperável',
+  'sem permissão',
+  'indisponível',
+] as const;
+
+// As 12 seções `##` do esqueleto exato de ficha (prompts/TASK-0005.md §Tarefa).
+export const SHEET_SECTIONS = [
+  '1. Identidade',
+  '2. Acesso',
+  '3. Entrada',
+  '4. Dados',
+  '5. Estados',
+  '6. Comandos',
+  '7. Saída',
+  '8. Segurança',
+  '9. Acessibilidade',
+  '10. Testes',
+  'Estados obrigatórios',
+  'Chaves i18n',
+] as const;
diff --git a/apps/portal/web/src/testing/route-manifest.fixture.ts b/apps/portal/web/src/testing/route-manifest.fixture.ts
index 355c5fe..454ae03 100644
--- a/apps/portal/web/src/testing/route-manifest.fixture.ts
+++ b/apps/portal/web/src/testing/route-manifest.fixture.ts
@@ -22,8 +22,9 @@ export interface RouteManifestFixtureEntry {
   readonly journeys: readonly string[];
 }

-// Catálogo fechado de serviceKey (route-manifest.md §Invariantes,
-// backend/database/seed/70-fixtures-portal.sql).
+// Catálogo fechado de serviceKey (route-manifest.md §Invariantes — A4: todo `serviceKey` ∈
+// chaves de `portal.service_catalog` ∪ {`junta_medica`}; `acompanhar_manifestacao` e
+// `procuracao` não são serviços do catálogo, backend/database/seed/70-fixtures-portal.sql).
 export const PORTAL_SERVICE_KEYS = [
   'consulta_multas',
   'defesa_previa',
@@ -39,10 +40,8 @@ export const PORTAL_SERVICE_KEYS = [
   'consulta_exame',
   'junta_medica',
   'manifestar',
-  'acompanhar_manifestacao',
   'avaliar',
   'lgpd_declaracao',
-  'procuracao',
 ] as const;

 export const PORTAL_ROUTE_MANIFEST_FIXTURE: readonly RouteManifestFixtureEntry[] =
@@ -337,7 +336,8 @@ export const PORTAL_ROUTE_MANIFEST_FIXTURE: readonly RouteManifestFixtureEntry[]
       module: 'atendimento',
       access: 'simples',
       entitlement: { kind: 'manifestation', param: 'manifestationId' },
-      serviceKey: 'acompanhar_manifestacao',
+      // A4: acompanhar não é serviço próprio do catálogo (parte de "Registrar manifestação");
+      // sem serviceKey, só entitlementGuard('manifestation').
       journeys: ['JRN-PORTAL-009'],
     },
     {
diff --git a/docs/meta/knowledge-base/import-manifest.json b/docs/meta/knowledge-base/import-manifest.json
index 9ed25bb..88905ef 100644
--- a/docs/meta/knowledge-base/import-manifest.json
+++ b/docs/meta/knowledge-base/import-manifest.json
@@ -15,7 +15,7 @@
   },
   "baselines": {
     "sourceFileCount": 620,
-    "artifactIdCount": 522,
+    "artifactIdCount": 549,
     "sourceReportedCanonicalWorkflowTokenCount": 383,
     "canonicalWorkflowTokenCount": 446
   },
```

### Fichas (27 novas) — leia-as na worktree; amostra integral: IU-PORTAL-T01.md e IU-PORTAL-T21.md

```markdown
---
id: IU-PORTAL-T01
title: Detalhe da autuação (NA/NP) — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-CTB-extracts-raw,
    REF-CETRAN-PROCESSO-INTERNO,
    REF-DECRETO-10543-2020,
    REF-CONTRAN-931,
    REF-BENCH-ESTADOS,
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-01. Fontes: [UC-PORTAL-001], [UC-PORTAL-002], [UC-PORTAL-004],
[JRN-PORTAL-001], [JRN-PORTAL-002], [JRN-PORTAL-004], [JRN-PORTAL-005], [RN-PORTAL-101],
[RN-PORTAL-105], [RN-PORTAL-112], [RN-PORTAL-127].

## 1. Identidade

- id: `T-01`; nome visível: "Detalhe da autuação (NA/NP)".
- app: `portal`; módulo: `autos` (`portal-frontends.md` §4).
- rota: `/autos/:aitId` (`route-manifest.md` #9); `screen: 'T-01'`, `sheet: 'IU-PORTAL-T01'`.

## 2. Acesso

- ator: CIDADAO nível simples — consultar a autuação é ato de nível **simples**
  ([RN-PORTAL-101] linha 1).
- `access` do manifesto: `simples`; guardas: `portalAuthGuard` + `assuranceGuard('simples')` →
  `entitlementGuard('ait')` sobre `:aitId` (`route-manifest.md` #9; ordem auth → assurance →
  availability → entitlement, `plan.md` M8).
- pré-condição: AIT vinculado ao CPF do cidadão (`owner`/`driver`/`representative`/
  `interested_party` — `portal-route-contract.md` §1.2).
- sem vínculo comprovável → `404 PORTAL.NOT_FOUND` (disfarce de inexistência, nunca 403 com
  detalhe — `portal-route-contract.md` §1.2; `portal-error-catalog.md` §2) → tela "por que não vejo
  isto"; nunca tela vazia ([IU-PORTAL-001] §E.1 é sobre estado interno, mas o invariante geral de
  "nunca acesso negado seco" está em `portal-frontends.md` §2.8).

## 3. Entrada

- de onde se chega: `/autos` (T-14, lista de multas) ao abrir uma linha; link direto de uma
  notificação em `/notificacoes` (T-12).
- parâmetro `:aitId` validado contra o vínculo do cidadão no servidor antes de qualquer exibição —
  "parâmetros nunca substituem consulta autorizada" (`portal-route-contract.md` §1.2).
- leitura idempotente (`GET`); não há rascunho a recuperar nesta tela.

## 4. Dados

- rota consumida: `GET /v1/portal/aits/{aitId}` (`portal-route-contract.md` §4) → `aitNumber`,
  `plate`, `occurredAt`, `framingLabel`, `amount`, `situation` (`aguardando_defesa` ·
  `em_defesa` · `penalidade_aplicada` · `em_recurso` · `encerrada` · `cancelada` · `arquivada`),
  `deadlines[]{ kind, dueOn, ownedBy }`, `pointsStatus`, `actions[]{ key: defend | indicate_driver |
pay | appeal_jari | appeal_cetran, available, reason?, minimumAssurance }`, `notices[]{ kind: NA |
NP | decisao, channel, dispatchedOn, effectiveOn, fictitious, printedDeadline }`,
  `payment{ tiers[], paid, paidTier }`, `openRequestId?`, `evidenceAvailable`.
- origem: projeção `portal.infraction_view` (ADR-0020); nenhuma tabela do RAIT é lida diretamente
  (`portal-frontends.md` §1).
- prazos chegam calculados e rotulados do servidor (`dueOn`, `ownedBy`); o Portal nunca calcula
  prazo no cliente (`portal-frontends.md` §1 "Fronteiras"; [IU-PORTAL-001] §E.2).
- sem fixture como fallback: indisponibilidade da leitura cai em estado "indisponível" (§5), nunca
  em dado inventado.

## 5. Estados

- **carregando**: esqueleto do cartão de detalhe.
- **vazio**: não se aplica a um AIT identificado — a tela sempre representa um recurso único; se
  nenhuma das três ações está disponível, a tela mostra o motivo de cada uma (`actions[].reason`),
  nunca um cartão em branco.
- **indisponível/offline**: falha da projeção → banner "estamos sem acesso aos seus dados agora;
  seus prazos não mudam" + tentar novamente (`portal-error-catalog.md` §8, `*_UNAVAILABLE`).
- **erro recuperável**: falha transitória de rede → nova tentativa.
- **erro não recuperável**: `aitId` sem vínculo comprovável → `PORTAL.NOT_FOUND` disfarçado.
- **sucesso**: cartão completo com os três caminhos — defender, indicar condutor, pagar — sempre
  visíveis **juntos**, sem viés visual para pagar ([IU-PORTAL-001] nota T-01; [RN-PORTAL-127]
  verificação a).
- **dados desatualizados**: não se aplica — leitura direta da projeção, sem cache local do lado do
  cliente.

## 6. Comandos

A tela em si não submete nenhum ato jurídico — oferece três navegações (`ActionTriplet`,
`portal-frontends.md` §5.2), cada uma abrindo o wizard/tela dedicada:

| Rótulo (chave i18n)                 | Nível exigido | Destino | Base                     |
| ----------------------------------- | ------------- | ------- | ------------------------ |
| "Defender-se" (`cmd.defend`)        | avançada      | T-02    | [RN-PORTAL-101] linha 6  |
| "Indicar condutor" (`cmd.indicate`) | avançada      | T-05    | [RN-PORTAL-101] linha 5  |
| "Pagar" (`cmd.pay`)                 | simples       | T-13    | [RN-PORTAL-101] linha 10 |

- cada ação mostra `available`/`reason` exatamente como o servidor devolve — nunca calculado no
  cliente; se o nível da conta é insuficiente ao clicar, o cidadão segue o passo guiado de elevação
  (T-27), nunca um erro seco (`portal-frontends.md` §3).
- nenhuma ação desta tela muda estado jurídico por si — "um clique não muda estado jurídico só pela
  UI" (`plan.md` §Regras de transcrição/manual do perfil).
- sem idempotência própria: são apenas navegações de leitura.

## 7. Saída

- volta para `/autos` (T-14) ou para a origem (notificação em T-12).
- nada a salvar nesta tela (somente leitura); sem confirmação de abandono necessária.

## 8. Segurança

- vínculo: `portal.entitlement` sobre o AIT (`owner`/`driver`/`representative`/`interested_party`).
- titular vê o próprio CPF sem máscara ([RN-PORTAL-118] citada em `portal-frontends.md` §2.4,
  [IU-PORTAL-001] §E.4); nenhum dado de terceiro aparece nesta tela até haver indicação de condutor
  concluída (ver T-05).
- nenhum token interno em tela/URL/log; o vocabulário do RAIT (`situation`) já chega traduzido pela
  projeção — o token cru, se existir, só em `data-token` para suporte ([RN-PORTAL-112] verificação a;
  `portal-frontends.md` §2.1).

## 9. Acessibilidade

- `ActionTriplet` com rótulo completo lido fora de contexto visual ("Defender-se desta multa", não
  "Defender-se" solto — `_intake/ux-notes.md` §f).
- foco vai ao título da autuação ao concluir o carregamento.
- banners de prazo/urgência nunca só por cor — ícone + texto, testado sob luz direta
  (`_intake/ux-notes.md` §f).
- `aria-live` no banner de indisponibilidade; alvo de toque ≥ 44×44px nos três botões de ação.

## 10. Testes

- unitário: `actions[].available=false` desabilita o botão correspondente e mostra `reason`, nunca
  o esconde silenciosamente.
- roteamento: `entitlementGuard('ait')` presente (bloqueia sem vínculo) e ausente (permite com
  vínculo) — os dois casos.
- jornada feliz: AIT em `aguardando_defesa` mostra os três caminhos juntos; jornada de erro: `aitId`
  sem vínculo → 404 disfarçado; jornada de negação: nível insuficiente ao clicar "Defender-se" →
  redireciona a T-27 com o ato retomável.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                                                              | Ação seguinte                         |
| ----------------- | --------------------------------------------------------------------------------------- | ------------------------------------- |
| carregando        | "Carregando os dados da sua multa..." (`state.loading`)                                 | nenhuma                               |
| vazio             | "Nenhuma ação disponível para esta multa no momento" (`state.empty`) — caso-limite raro | canal presencial ([RN-PORTAL-105])    |
| sem elegibilidade | "Não encontramos essa multa vinculada à sua conta" (`state.ineligible`)                 | comprovar vínculo / ouvidoria         |
| erro recuperável  | "Não conseguimos carregar agora. Tente novamente." (`state.error_recoverable`)          | tentar de novo                        |
| sem permissão     | não redefinida aqui — o bloqueio de fato ocorre por ação, redirecionando a T-27         | ver `portal.screens.t27.*`            |
| indisponível      | "Estamos sem acesso aos seus dados agora; seus prazos não mudam" (`state.unavailable`)  | canal alternativo + tentar mais tarde |

## Chaves i18n

- `portal.screens.t01.title` — "Detalhe da autuação" (obrigatória)
- `portal.screens.t01.cmd.defend` — "Defender-se desta multa"
- `portal.screens.t01.cmd.indicate` — "Indicar quem estava dirigindo"
- `portal.screens.t01.cmd.pay` — "Pagar esta multa"
- `portal.screens.t01.state.loading` — "Carregando os dados da sua multa..."
- `portal.screens.t01.state.empty` — "Nenhuma ação disponível para esta multa no momento"
- `portal.screens.t01.state.ineligible` — "Não encontramos essa multa vinculada à sua conta"
- `portal.screens.t01.state.error_recoverable` — "Não conseguimos carregar agora. Tente novamente."
- `portal.screens.t01.state.unavailable` — "Estamos sem acesso aos seus dados agora; seus prazos não mudam"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por TASK-0006, não redefinidos aqui.

--- IU-PORTAL-T21.md ---
---

id: IU-PORTAL-T21
title: Nova manifestação (ouvidoria) — especificação de tela
status: draft
apps: [portal]
sources: [REF-LEI-13460-2017]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-21. Fontes: [UC-PORTAL-016], [JRN-PORTAL-009], [RN-PORTAL-109].

## 1. Identidade

Tela `T-21` "Nova manifestação (ouvidoria)" ([IU-PORTAL-001] §B). App `portal`. Rota
`ouvidoria/nova` (`route-manifest.md` #31). Módulo `atendimento`. `screen: 'T-21'`,
`sheet: 'IU-PORTAL-T21'`.

## 2. Acesso

Ator anônimo admitido ou Cidadão — `access: nenhum_ou_simples` (`route-manifest.md` #31,
DT-051 fechado, H.51): sem guarda, sessão opcional ([UC-PORTAL-016] pré-condições; [RN-PORTAL-101]
linha 3, "nenhum nível exigível"; [RN-PORTAL-109] item 2). Nenhuma pré-condição além da
identificação mínima necessária para não inviabilizar a manifestação — o sistema **nunca** recusa
o recebimento (art.11, [UC-PORTAL-016] pré-condições).

## 3. Entrada

Chega-se pelo menu "Ouvidoria", acessível a qualquer visitante, anônimo ou autenticado
([UC-PORTAL-016] fluxo 1). Sem parâmetro de rota. "Parâmetros nunca substituem consulta
autorizada": identificação do requerente, quando fornecida, é a da sessão ou do formulário, nunca
inferida de outro parâmetro.

## 4. Dados

`POST manifestations` (`portal-route-contract.md` §8) — não há leitura prévia nesta tela, apenas
o formulário de composição. Campos: tipo (reclamação, denúncia, sugestão, elogio, solicitação —
[UC-PORTAL-016] fluxo 1; `WF-PORTAL-004` nota sobre a taxonomia do art.2º V), descrição livre
(sem categorização fechada de causa obrigatória, [UC-PORTAL-016] AC-2), sigilo do denunciante
opcional, anexos, indicação de anonimato. Nenhum dado pré-existente é consultado (é criação, não
leitura) — sem fixture como fallback.

## 5. Estados

- **Carregando**: n/a no formulário vazio; aplica-se ao envio (submissão em curso).
- **Vazio**: n/a (formulário sempre disponível).
- **Indisponível/offline**: canal de ouvidoria fora do ar — banner de indisponibilidade
  (`portal-error-catalog.md` §8); nunca um motivo que sugira recusa de recebimento
  ([RN-PORTAL-109] item 1).
- **Erro recuperável**: falha de validação de forma (`PORTAL.MANIFESTATION_KIND_INVALID`,
  `portal-error-catalog.md` §6) — inline, foco no primeiro campo.
- **Erro não recuperável**: n/a — recebimento é sempre irrecusável ([RN-PORTAL-109] item 1;
  `PORTAL.MANIFESTATION_NEVER_REFUSED` é invariante de sistema, nunca de UI,
  `portal-error-catalog.md` §6).
- **Sucesso**: comprovante imediato com número de protocolo ([UC-PORTAL-016] fluxo 3;
  [RN-PORTAL-109] item 3).

## 6. Comandos

"Enviar manifestação" (`portal.screens.t21.cmd.enviar`), nível **nenhum** exigível
([RN-PORTAL-101] linha 3; [RN-PORTAL-109] item 2), validação de forma: tipo dentre a taxonomia,
descrição livre sem exigência de causa (`portal-frontends.md` §7 "Manifestação"), idempotência
por `Idempotency-Key` (`portal-route-contract.md` §8), efeito
`MANIFESTACAO_REGISTRADA → COMPROVANTE_EMITIDO` ([WF-PORTAL-004]), destino
`portal/citizen-service`, comprovante imediato com protocolo. "Um clique não muda estado jurídico
só pela UI": o envio gera protocolo, mas a análise de mérito segue o workflow da ouvidoria
([WF-PORTAL-004] `EM_ANALISE`).

## 7. Saída

Após o envio, a tela leva ao comprovante e, com o protocolo, a `/ouvidoria/:manifestationId`
(T-22). Se o cidadão abandona o formulário antes de enviar, não há confirmação — não há rascunho
persistido nesta tela (o envio é atômico).

## 8. Segurança

Sem `portal.entitlement` (ato aberto a qualquer cidadão sobre a própria manifestação). Sigilo do
denunciante preservado nas telas de acompanhamento internas quando solicitado ([UC-PORTAL-016]
1a). Nenhum token/segredo em tela, URL ou log. Nenhuma exigência de motivo determinante
([RN-PORTAL-109] item 2).

## 9. Acessibilidade

Formulário navegável por teclado; mensagens de erro associadas ao campo (`aria-describedby`);
`aria-live` na confirmação de envio; contraste AA; linguagem cidadã, sem jargão de "triagem" ou
"admissibilidade" ([_intake/ux-notes.md] §c "Tom"); WCAG 2.1 AA + eMAG ([IU-PORTAL-001] §D).

## 10. Testes

Unitário: nenhuma combinação de tipo/descrição bloqueia o envio (recebimento irrecusável,
[RN-PORTAL-109] item 1). Roteamento: rota acessível sem sessão (anônimo) e com sessão
(autenticado) — presença e ausência de guarda, conforme `access: nenhum_ou_simples`. Jornada
feliz: envio com comprovante e protocolo. Jornada de erro: falha de validação de forma, inline.
Jornada de negação: n/a (recebimento nunca é recusado).

## Estados obrigatórios

| Estado            | Chave i18n                                   | Texto cidadão                                               | Ação seguinte                   |
| ----------------- | -------------------------------------------- | ----------------------------------------------------------- | ------------------------------- |
| Carregando        | `portal.screens.t21.state.carregando`        | "Enviando sua manifestação."                                | aguardar                        |
| Vazio             | `portal.screens.t21.state.vazio`             | "Não aplicável — o formulário está sempre disponível."      | preencher o formulário          |
| Sem elegibilidade | `portal.screens.t21.state.sem_elegibilidade` | "Não aplicável — a ouvidoria recebe qualquer manifestação." | preencher o formulário          |
| Erro recuperável  | `portal.screens.t21.state.erro_recuperavel`  | "Confira o tipo e a descrição antes de enviar."             | corrigir o campo indicado       |
| Sem permissão     | `portal.screens.t21.state.sem_permissao`     | "Não aplicável — nenhum nível é exigido para manifestar."   | preencher o formulário          |
| Indisponível      | `portal.screens.t21.state.indisponivel`      | "Estamos sem acesso ao canal de ouvidoria agora."           | tentar depois; canal presencial |

## Chaves i18n

- `portal.screens.t21.title` — "Nova manifestação"
- `portal.screens.t21.intro` — "Registre sua reclamação, denúncia, sugestão, elogio ou solicitação."
- `portal.screens.t21.cmd.enviar` — "Enviar manifestação"
- `portal.screens.t21.state.carregando` — (ver tabela acima)
- `portal.screens.t21.state.vazio` — (ver tabela acima)
- `portal.screens.t21.state.sem_elegibilidade` — (ver tabela acima)
- `portal.screens.t21.state.erro_recuperavel` — (ver tabela acima)
- `portal.screens.t21.state.sem_permissao` — (ver tabela acima)
- `portal.screens.t21.state.indisponivel` — (ver tabela acima)
- `portal.screens.t21.field.tipo` — "Tipo de manifestação"
- `portal.screens.t21.field.descricao` — "Descreva o que aconteceu"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por esta tela, não redefinidos aqui.
```

### Catálogo i18n — leia `apps/portal/web/src/app/i18n/portal.pt-BR.json` na worktree; amostra: namespaces `portal.situation` e `portal.legal`

```json
  "portal.legal.consequencias_desistencia.v1": "Desistir é definitivo para este requerimento. A multa (ou o processo, conforme a fase) segue seu curso normal, sem o benefício do pedido retirado. Sua confirmação equivale a uma assinatura eletrônica.",
  "portal.legal.consequencias_desistencia.v1.source": "UC-PORTAL-006 passo 2; RN-RAIT-123",
  "portal.legal.consequencias_indicacao.v1": "Uma indicação irregular gera um novo auto de infração distinto e fica registrada no seu prontuário de condutor para averiguação de reincidência.",
  "portal.legal.consequencias_indicacao.v1.source": "UC-PORTAL-004; RN-PORTAL-104",
  "portal.legal.efeitos_sne.v1": "Aderir ao SNE muda como você é notificado e como seus prazos passam a contar. Veja os quatro efeitos antes de confirmar:",
  "portal.legal.efeitos_sne.v1.ciencia_ficta": "Você é considerado notificado 30 dias após a inclusão da informação no sistema e o envio da mensagem — não abrir o aplicativo não muda esse prazo.",
  "portal.legal.efeitos_sne.v1.substituicao": "A partir da adesão, o SNE passa a ser o único meio de notificação para todos os efeitos legais, e dispensa qualquer outro aviso, como carta registrada.",
  "portal.legal.efeitos_sne.v1.responsabilidade": "O acesso é de sua responsabilidade exclusiva — mantenha seu e-mail e celular atualizados para receber os alertas.",
  "portal.legal.efeitos_sne.v1.cancelamento": "As notificações já disponibilizadas até o cancelamento continuam válidas; o vínculo é cancelado automaticamente após venda ou transferência do veículo.",
  "portal.legal.efeitos_sne.v1.source": "RN-PORTAL-123",
  "portal.legal.renuncia_40.v1": "Optar pela faixa de 40% de desconto (pagar 60%) exige declarar que você reconhece a infração e abre mão de apresentar defesa e recurso para este AIT. É a única faixa de desconto com esse efeito — pagar nas demais faixas não prejudica seu processo.",
  "portal.legal.renuncia_40.v1.source": "UC-PORTAL-015 AC-2; RN-PORTAL-128",
  "portal.situation.infraction.aguardando_defesa": "Aguardando sua defesa",
  "portal.situation.infraction.em_defesa": "Em defesa — aguardando julgamento",
  "portal.situation.infraction.penalidade_aplicada": "Penalidade aplicada",
  "portal.situation.infraction.em_recurso": "Em recurso — aguardando julgamento",
  "portal.situation.infraction.encerrada": "Encerrada",
  "portal.situation.infraction.arquivada": "Arquivada",
  "portal.situation.infraction.cancelada": "Multa cancelada",
  "portal.situation.request.IDENTIFICADO": "Identificado",
  "portal.situation.request.SERVICO_SELECIONADO": "Serviço selecionado",
  "portal.situation.request.ELEGIBILIDADE_VERIFICADA": "Elegibilidade verificada",
  "portal.situation.request.INELEGIVEL": "Não elegível",
  "portal.situation.request.PEDIDO_EM_COMPOSICAO": "Em preenchimento",
  "portal.situation.request.AGUARDANDO_NIVEL_ASSINATURA": "Aguardando confirmação de identidade",
  "portal.situation.request.AGUARDANDO_PAGAMENTO": "Aguardando pagamento",
  "portal.situation.request.PROTOCOLADO": "Protocolado",
  "portal.situation.request.EM_ANDAMENTO_NO_ORGAO": "Em andamento no órgão",
  "portal.situation.request.RESULTADO_DISPONIVEL": "Resultado disponível",
  "portal.situation.request.AVALIACAO_OFERECIDA": "Avaliação disponível",
  "portal.situation.request.CONCLUIDO": "Concluído",
  "portal.situation.request.DESISTIDO": "Desistência registrada",
  "portal.situation.badge.em_analise": "Em análise",
  "portal.situation.badge.aguardando_decisao": "Aguardando decisão",
  "portal.situation.badge.em_diligencia": "Em diligência",
  "portal.situation.badge.decidido": "Decidido",
  "portal.situation.badge.encerrado": "Encerrado",
  "portal.situation.badge_of.EM_ANDAMENTO_NO_ORGAO": "em_analise",
  "portal.situation.badge_of.RESULTADO_DISPONIVEL": "decidido",
  "portal.situation.badge_of.CONCLUIDO": "encerrado",
  "portal.situation.badge_of.DESISTIDO": "encerrado",
  "portal.situation.event.RAIT_CASO_PROTOCOLADO": "Seu pedido foi protocolado — com o órgão",
  "portal.situation.event.RAIT_CASO_ESTADO_ALTERADO": "Seu processo mudou de fase — com o órgão",
  "portal.situation.event.RAIT_EFEITO_SUSPENSIVO_INSTAURADO": "Seu recurso foi admitido, com efeito suspensivo — com o órgão",
  "portal.situation.event.RAIT_RECURSO_RECEBIDO_JULGADOR": "Seu recurso está com quem vai julgar — com o órgão",
  "portal.situation.event.RAIT_CASO_TRANSITADO": "Sua decisão se tornou definitiva — com o órgão",
  "portal.situation.event.ENCERRADO_DESISTENCIA": "Você desistiu deste pedido — com você",
  "portal.situation.event.RAIT_DECISAO_PUBLICADA": "Sua decisão foi publicada — com você",
  "portal.situation.deadline.citizen": "seu prazo",
  "portal.situation.deadline.agency": "prazo do órgão",
  "portal.situation.next_action.citizen": "Com você",
  "portal.situation.next_action.agency": "Com o órgão",
  "portal.situation.next_action.none": "Nenhuma ação necessária"
```
