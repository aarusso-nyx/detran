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

**Segundo ciclo — restrito aos dois achados de `delivery-review-CTG-0002`** (orchestra/README.md
§5). Avalie somente estas correções (adenda **A5** em `plan.md` §Adendas; iteração 3 de TASK-0007
em `reports/TASK-0007-iteration-3.md`):

1. (item 7, `legal-texts.spec.ts`) a asserção dos quatro efeitos do SNE fixa agora os nomes de
   [RN-PORTAL-123] — `ciencia_ficta`, `substituicao`, `responsabilidade`, `cancelamento` —
   (`toEqual` do conjunto de chaves-filhas + existência e ≥ 40 caracteres de cada uma); a paráfrase
   divergente dos prompts está corrigida por A5 e M9.
2. (item 7, `screen-sheets.spec.ts`) a vedação de citar rota de outra tela cobre agora **todos** os
   paths do manifesto, inclusive os de um segmento: da seção Identidade só entram os spans com forma
   de rota (iniciados por `/`), normalizados e comparados aos paths das outras telas; a verificação
   ampliada não acusou nenhuma ficha.

Gates re-executados: `pnpm --filter @detran/portal-web typecheck` 0 erros; `test` **472/472**;
`pnpm format:check` OK (o `pnpm check` completo já era EXIT 0 antes de A5, que só alterou dois specs).

### Veredito anterior (delivery-review-CTG-0002.json)

```json
{
  "mode": "delivery-review",
  "round": "R-0014",
  "verdict": "REVIEW",
  "findings": [
    {
      "severity": "high",
      "item": 7,
      "file": "apps/portal/web/src/app/screens/legal-texts.spec.ts",
      "line": 44,
      "claim": "O teste reduziu o contrato dos quatro efeitos do SNE a uma contagem; portanto aceita quaisquer quatro chaves-filhas. O prompt ainda exige nomes explícitos, enquanto a regra canônica RN-PORTAL-123 enumera os quatro efeitos obrigatórios.",
      "fix": "Fixar as quatro chaves canônicas `ciencia_ficta`, `substituicao`, `responsabilidade` e `cancelamento` no spec; registrar a correção do prompt divergente em adenda, sem manter a asserção apenas quantitativa."
    },
    {
      "severity": "high",
      "item": 7,
      "file": "apps/portal/web/src/app/screens/screen-sheets.spec.ts",
      "line": 75,
      "claim": "A vedação de citar rota de outra tela foi limitada a paths compostos. Isso deixa sem cobertura as rotas de um segmento, embora TASK-0007 exija nenhuma rota de outra tela.",
      "fix": "Extrair somente spans que representem rotas (por exemplo, iniciados por `/`) e comparar todos os paths do manifesto, inclusive os de um segmento, evitando a colisão com nomes de módulos sem reduzir a asserção."
    }
  ],
  "notes": [
    "A4, a remoção de `acompanhar_manifestacao`, o catálogo de 16 service keys e as OD-P52 a OD-P56 estão alinhados ao plano e às fontes citadas."
  ]
}
```

### Diff das correções

```diff
diff --git a/apps/portal/web/src/app/screens/legal-texts.spec.ts b/apps/portal/web/src/app/screens/legal-texts.spec.ts
new file mode 100644
index 0000000..29a3a72
--- /dev/null
+++ b/apps/portal/web/src/app/screens/legal-texts.spec.ts
@@ -0,0 +1,79 @@
+// R-0014 TASK-0007 (Inspector). Contrato dos textos jurídicos versionados (plan.md M9;
+// prompts/TASK-0007.md §Tarefa item 4).
+//
+// `efeitos_sne.v1`: os quatro efeitos da adesão ao SNE são os de [RN-PORTAL-123] como TASK-0006
+// os transcreveu — `ciencia_ficta`, `substituicao`, `responsabilidade`, `cancelamento` — e não a
+// paráfrase do prompt de TASK-0006/0007 ("canal exclusivo, desconto de 60%, cancelamento a
+// qualquer tempo"), que não corresponde à tabela normativa da regra e misturaria adesão com
+// decisão de pagamento. Fixado por adenda do maestro (plan.md §Adendas A5, 2026-09-17,
+// delivery-review-CTG-0002): o teste fixa as quatro chaves por nome, nunca só por contagem.
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
+// Os quatro efeitos de [RN-PORTAL-123], nomeados exatamente como TASK-0006 os transcreveu
+// (plan.md §Adendas A5).
+const SNE_EFFECTS = [
+  'ciencia_ficta',
+  'substituicao',
+  'responsabilidade',
+  'cancelamento',
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
+  it('dado o catálogo quando portal.legal.efeitos_sne.v1.* é lido então tem exatamente as 4 chaves nomeadas de [RN-PORTAL-123], além de .source', () => {
+    const prefix = 'portal.legal.efeitos_sne.v1.';
+    const children = Object.keys(catalog)
+      .filter((key) => key.startsWith(prefix))
+      .filter((key) => key !== `${prefix}source`)
+      .map((key) => key.slice(prefix.length))
+      .sort();
+    expect(children).toEqual([...SNE_EFFECTS].sort());
+    for (const effect of SNE_EFFECTS) {
+      const key = `${prefix}${effect}`;
+      expect(catalog[key], `chave ausente: ${key}`).toBeDefined();
+      expect(
+        catalog[key].length,
+        `texto de ${key} tem menos de ${MIN_LEGAL_TEXT_LENGTH} caracteres`,
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
diff --git a/apps/portal/web/src/app/screens/screen-sheets.spec.ts b/apps/portal/web/src/app/screens/screen-sheets.spec.ts
new file mode 100644
index 0000000..b636a20
--- /dev/null
+++ b/apps/portal/web/src/app/screens/screen-sheets.spec.ts
@@ -0,0 +1,137 @@
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
+      it('quando a seção Identidade é lida então não cita rota de outra tela (plan.md §Adendas A5.b)', () => {
+        // Extrai só os spans com forma de rota (iniciados por "/", ex.: `/autos`) — isso evita a
+        // colisão com nome de módulo citado na prosa (ex.: T-01 cita `módulo: autos`, sem barra,
+        // que não é uma citação de rota) sem restringir a paths compostos: cobre todo o
+        // manifesto, inclusive rotas de um segmento (plan.md §Adendas A5.b).
+        const identity = extractSection(text, '1. Identidade');
+        const routeSpans = new Set(
+          backtickSpans(identity)
+            .filter((span) => span.startsWith('/'))
+            .map(withoutLeadingSlash),
+        );
+        const ownPaths = new Set(
+          entries.map((entry) => withoutLeadingSlash(entry.path)),
+        );
+        const otherPaths = new Set(
+          PORTAL_ROUTE_MANIFEST.filter((entry) => entry.screen !== screen).map(
+            (entry) => withoutLeadingSlash(entry.path),
+          ),
+        );
+        const offenders = [...routeSpans].filter(
+          (span) => !ownPaths.has(span) && otherPaths.has(span),
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
```
