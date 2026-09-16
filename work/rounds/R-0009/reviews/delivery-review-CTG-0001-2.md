# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `portal-backend` (rodada `R-0009`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/portal-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/portal-build-pack.md` — apenas a seção do WP `WP-P0…P3` e o "mapa entregável → definições"
4. `work/rounds/R-0009/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0009/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0009/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0009",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0009/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Segundo ciclo — restrito aos dois achados `high` de `delivery-review-CTG-0001`** (orchestra/README.md §5). Avalie somente as correções abaixo (commit `7cd4ac2`, Inspector TASK-0003 iteração 3). Gates reexecutados: `pnpm --filter @detran/portal-identity test:unit` 49/49; `test:integration` 11/11 em duas execuções; `pnpm format:check` verde.

### Veredito anterior

```json
{
  "mode": "delivery-review",
  "round": "R-0009",
  "verdict": "REVIEW",
  "findings": [
    {
      "severity": "high",
      "item": 4,
      "file": "backend/domains/portal/identity/tests/integration/portal-rls.integration.spec.ts",
      "line": 165,
      "claim": "C-0001-32 exige inserir portal.subject sem tenant_id e provar que o trigger o preenche; o teste fornece tenant_id canônico divergente e só prova rejeição 42501.",
      "fix": "inserir sem tenant_id sob OTHER_TENANT e afirmar que a linha retornada/consultada recebeu OTHER_TENANT; manter a asserção negativa de tenant divergente como caso adicional."
    },
    {
      "severity": "high",
      "item": 4,
      "file": "backend/domains/portal/identity/src/handwritten/act-level.spec.ts",
      "line": 72,
      "claim": "CTG-0001 §11 exige relógio fixo 2026-09-14 nos testes unitários, mas C-0001-13–19 e C-0001-21 chamam assertActLevel sem o clock e usam PortalClock real.",
      "fix": "passar o clock fixo como quinto argumento em todas as chamadas de assertActLevel do spec, ou encapsular a chamada em helper que sempre o injete."
    }
  ],
  "notes": []
}
```

### Diff das correções (62169ee..7cd4ac2)

```diff
diff --git a/backend/domains/portal/identity/src/handwritten/act-level.spec.ts b/backend/domains/portal/identity/src/handwritten/act-level.spec.ts
index abd709f..fe28722 100644
--- a/backend/domains/portal/identity/src/handwritten/act-level.spec.ts
+++ b/backend/domains/portal/identity/src/handwritten/act-level.spec.ts
@@ -32,6 +32,21 @@ const clock = {
   today: () => FIXED_TODAY,
 };

+/**
+ * Injeta sempre o relógio fixo 2026-09-14 (CTG-0001 §11) — nunca `PortalClock`
+ * real. Toda chamada a `assertActLevel` do spec passa por aqui para que a
+ * data de vigência nunca dependa do instante em que os testes rodam.
+ */
+type AssertActLevelArgs = Parameters<typeof assertActLevel>;
+function assertActLevelFixed(
+  tx: AssertActLevelArgs[0],
+  identity: AssertActLevelArgs[1],
+  actKey: AssertActLevelArgs[2],
+  resumeRoute: AssertActLevelArgs[3],
+): ReturnType<typeof assertActLevel> {
+  return assertActLevel(tx, identity, actKey, resumeRoute, clock);
+}
+
 function fakeTx(rows: FakePolicyRow[]) {
   const query = async (_sql: string, values?: readonly unknown[]) => {
     const [actKey, today] = (values ?? []) as [string, string];
@@ -69,7 +84,7 @@ describe('assertActLevel (§4, M4/M5)', () => {
   it('C-0001-13 — dado política vigente "avancada" e current "simples" quando assertActLevel então ASSURANCE_INSUFFICIENT com o context exato', async () => {
     const tx = fakeTx([policy({ minimumAssurance: 'avancada' })]);
     await expect(
-      assertActLevel(
+      assertActLevelFixed(
         tx,
         { cpf: '11111111111', assuranceLevel: 'simples' },
         'ato-x',
@@ -95,7 +110,7 @@ describe('assertActLevel (§4, M4/M5)', () => {
         minimumAssurance: 'avancada',
       }),
     ]);
-    const decision = await assertActLevel(
+    const decision = await assertActLevelFixed(
       tx,
       { cpf: '22222222222', assuranceLevel: 'avancada' },
       'ato-x',
@@ -112,7 +127,7 @@ describe('assertActLevel (§4, M4/M5)', () => {
   it('C-0001-15 — dado política "simples" e current "qualificada" quando assertActLevel então resolve (elevar sempre passa)', async () => {
     const tx = fakeTx([policy({ minimumAssurance: 'simples' })]);
     await expect(
-      assertActLevel(
+      assertActLevelFixed(
         tx,
         { cpf: '44444444444', assuranceLevel: 'qualificada' },
         'ato-x',
@@ -124,7 +139,7 @@ describe('assertActLevel (§4, M4/M5)', () => {
   it('C-0001-16 — dado política "none" e current "simples" quando assertActLevel então resolve (H.51: não compara)', async () => {
     const tx = fakeTx([policy({ minimumAssurance: 'none' })]);
     await expect(
-      assertActLevel(
+      assertActLevelFixed(
         tx,
         { cpf: '11111111111', assuranceLevel: 'simples' },
         'ato-x',
@@ -136,7 +151,7 @@ describe('assertActLevel (§4, M4/M5)', () => {
   it('C-0001-17 — dado política "qualificada" quando assertActLevel então PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED 500 { actKey } (RN-PORTAL-101 (c))', async () => {
     const tx = fakeTx([policy({ minimumAssurance: 'qualificada' })]);
     await expect(
-      assertActLevel(
+      assertActLevelFixed(
         tx,
         { cpf: '11111111111', assuranceLevel: 'qualificada' },
         'ato-x',
@@ -152,7 +167,7 @@ describe('assertActLevel (§4, M4/M5)', () => {
   it('C-0001-18 — dado ato sem nenhuma linha quando assertActLevel então PORTAL.INTERNAL 500 { actKey } (ato sem linha nunca libera)', async () => {
     const tx = fakeTx([]);
     await expect(
-      assertActLevel(
+      assertActLevelFixed(
         tx,
         { cpf: '11111111111', assuranceLevel: 'qualificada' },
         'ato-inexistente',
@@ -168,7 +183,7 @@ describe('assertActLevel (§4, M4/M5)', () => {
   it('C-0001-19 — dado a única linha com enabled=false quando assertActLevel então PORTAL.INTERNAL (tratada como ausência)', async () => {
     const tx = fakeTx([policy({ enabled: false })]);
     await expect(
-      assertActLevel(
+      assertActLevelFixed(
         tx,
         { cpf: '11111111111', assuranceLevel: 'qualificada' },
         'ato-x',
@@ -180,12 +195,11 @@ describe('assertActLevel (§4, M4/M5)', () => {
   it('C-0001-20a — dado effective_from=2026-09-15 e clock=2026-09-14 quando assertActLevel então PORTAL.INTERNAL (ainda não vigente)', async () => {
     const tx = fakeTx([policy({ effectiveFrom: '2026-09-15' })]);
     await expect(
-      assertActLevel(
+      assertActLevelFixed(
         tx,
         { cpf: '11111111111', assuranceLevel: 'qualificada' },
         'ato-x',
         '/resume/ato-x',
-        clock,
       ),
     ).rejects.toMatchObject({ code: 'PORTAL.INTERNAL' });
   });
@@ -195,12 +209,11 @@ describe('assertActLevel (§4, M4/M5)', () => {
       policy({ effectiveFrom: '2026-01-01', effectiveTo: '2026-09-14' }),
     ]);
     await expect(
-      assertActLevel(
+      assertActLevelFixed(
         tx,
         { cpf: '11111111111', assuranceLevel: 'qualificada' },
         'ato-x',
         '/resume/ato-x',
-        clock,
       ),
     ).rejects.toMatchObject({ code: 'PORTAL.INTERNAL' });
   });
@@ -218,7 +231,7 @@ describe('assertActLevel (§4, M4/M5)', () => {
         minimumAssurance: 'avancada',
       }),
     ]);
-    const decision = await assertActLevel(
+    const decision = await assertActLevelFixed(
       tx,
       { cpf: '22222222222', assuranceLevel: 'avancada' },
       'ato-x',
diff --git a/backend/domains/portal/identity/tests/integration/portal-rls.integration.spec.ts b/backend/domains/portal/identity/tests/integration/portal-rls.integration.spec.ts
index caa6ebe..c65f2a7 100644
--- a/backend/domains/portal/identity/tests/integration/portal-rls.integration.spec.ts
+++ b/backend/domains/portal/identity/tests/integration/portal-rls.integration.spec.ts
@@ -158,7 +158,34 @@ describe('portal.* — RLS cruzada entre tenants (CTG-0001 §7, M11)', () => {
     expect(rows).toBe(0);
   });

-  it('C-0001-32 — dado um tenant efêmero quando uma linha do tenant canônico é inserida em portal.subject então enforce_tenant_id (auth.install_tenant_triggers, schema portal — M11) rejeita com 42501', async () => {
+  it('C-0001-32 — dado insert em portal.subject sem tenant_id no payload sob o tenant efêmero então enforce_tenant_id (auth.install_tenant_triggers, schema portal — M11) preenche a linha com o tenant da sessão', async () => {
+    const cpfHash = '1'.repeat(64);
+    await asTenant(OTHER_TENANT, async () => {
+      const inserted = await client.query<{ id: string; tenant_id: string }>(
+        `insert into portal.subject (cpf_hash, name, assurance_level_observed, observed_at)
+         values ($1, 'RLS probe (fixture, sem tenant_id)', 'simples', now())
+         returning id, tenant_id`,
+        [cpfHash],
+      );
+      expect(
+        inserted.rows[0]?.tenant_id,
+        'a linha gravada (RETURNING) deveria ter recebido o tenant da sessão',
+      ).toBe(OTHER_TENANT);
+
+      const consulted = await client.query<{ tenant_id: string }>(
+        'select tenant_id from portal.subject where id = $1',
+        [inserted.rows[0]?.id],
+      );
+      expect(
+        consulted.rows[0]?.tenant_id,
+        'a linha consultada em seguida deveria ter o tenant da sessão',
+      ).toBe(OTHER_TENANT);
+    });
+    // Limpeza: `asTenant` executa `work()` dentro de uma transação sempre
+    // desfeita em `rollback` (finally) — a linha inserida acima não persiste.
+  });
+
+  it('C-0001-32 (caso adicional) — dado um tenant_id divergente do app.tenant_id da sessão quando inserido em portal.subject então enforce_tenant_id rejeita com 42501', async () => {
     await expect(
       asTenant(OTHER_TENANT, () =>
         client.query(
```
