# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `dashboard-console` (rodada `R-0016`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/dashboard-console-r0016-f15a49`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/dashboard-build-pack.md` — apenas a seção do WP `WP-D4, WP-D5` e o "mapa entregável → definições"
4. `work/rounds/R-0016/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0016/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0016/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0016",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0016/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Segundo ciclo — restrito** aos três achados de
`work/rounds/R-0016/reviews/delivery-review-CTG-0002.json`. Achado novo sobre texto inalterado só
se for FAIL por definição, dizendo por que não foi levantado antes.

**Achado 1 (fronteira do maestro em `src/app/**`, item 6) — aceito integralmente.** As seis
edições que o maestro fizera dentro das fronteiras dos workers foram **revertidas** aos blobs
entregues (`git checkout 42b4e6ac|8ae0926c|b64fb8bf -- <arquivos>`, commit `e15d9c89`) e
**redespachadas em iterações restritas aos donos**: TASK-0006 it. 2 (`forms/form-gate.ts`,
`finalidade-n2.schema.ts`, `exportar.schema.ts` — `PURPOSE_TOKENS` passam a viver na folha comum),
TASK-0005 it. 3 (os dois comentários de produção de C-02-24/C-02-75), TASK-0004 it. 3 (o literal
`rait.case.changed` do spec de SSE, composto por `join`). Relatórios em
`work/rounds/R-0016/reports/TASK-0006-iteration-2.md`, `TASK-0005-iteration-3.md`,
`TASK-0004-iteration-3.md`. O contrato §14.2 foi emendado: **nem correção mecânica** autoriza o
maestro a escrever em `src/app/**` — achado de gate ali volta ao dono da fronteira (adenda **A9**).

**Achado 2 (C-02-83 × agregador, item 7) — aceito.** O critério foi **emendado no próprio
contrato** (`contracts/CTG-0002.md` §13, C-02-83): os nove schemas são folhas (só `zod` e
`./form-gate`); `forms/index.ts`, agregador exigido por §11, importa os irmãos do diretório; a
proibição substantiva (`../core`, `../shared`, `@angular/*`, `rxjs`) vale para todos. Adenda
**A10** no plano. O spec do Inspector reflete a nova redação.

**Achado 3 (`pnpm check` após o merge de `origin/main`, item 4) — medido.** O merge trouxe 114
commits, incluindo **R-0011 mesclada** (`BP-DASH-MONITOR-001.commands.openapi.json`, clientes
gerados, seed dos 42) e o app `apps/rait/web` de R-0012. Ao rodar `pnpm check` no HEAD, apareceu
uma colisão entre rodadas: o sensor de scaffold do `rait-web` (em `main`) exige que a linha `check`
**termine** com a tripla dele, e o nosso C-02-81 exigia o mesmo para `dashboard-web`. Decisão do
Architect (adenda **A11**): a ordem passa a ser **portal → dashboard → rait** (o sensor mesclado
continua verde sem esta rodada editar testes de rodada fechada) e **C-02-81 foi emendado** para
exigir **contenção** da tripla contígua, nunca fim de linha; o spec foi corrigido pelo Inspector
(it. 4). Medições do maestro no HEAD atual: `pnpm --filter @detran/dashboard-web test` →
**2042/2042**, `tsc` app e specs → 0, `lint` → 0, `build` → OK, `verify:parameter-catalogue` →
`OK (90 entries, 18 flags, 57 i18n namespaces, 0 errors)`, `prettier --check` → OK; `pnpm check`
completo no HEAD estável (`5313be46` + a iteração 4) → **verde, exit 0**, com as suítes dos três
apps na mesma execução: portal 1314, **dashboard 2042**, rait 4434 (as execuções anteriores
correram sobre árvore em movimento — reverts e workers escrevendo — e foram descartadas).

### Diff das correções deste ciclo (`git diff e15d9c89~1 -- <arquivos tocados>`)

```diff
diff --git a/apps/dashboard/web/src/app/app.scaffold.spec.ts b/apps/dashboard/web/src/app/app.scaffold.spec.ts
index 54e76ab9..35763de0 100644
--- a/apps/dashboard/web/src/app/app.scaffold.spec.ts
+++ b/apps/dashboard/web/src/app/app.scaffold.spec.ts
@@ -31,18 +31,23 @@ describe('app.scaffold.spec.ts (C-02-80)', () => {
 });

 describe('app.scaffold.spec.ts (C-02-81)', () => {
-  it('dado o package.json da raiz quando lido então a linha check termina com a tripla do app e ainda contém a tripla do Portal antes', () => {
+  it('dado o package.json da raiz quando lido então a linha check contém a tripla contígua do dashboard depois da tripla do Portal, e ainda contém a tripla do rait-web (C-02-81)', () => {
     const pkg = JSON.parse(readFileSync(ROOT_PACKAGE_JSON, 'utf8')) as {
       scripts: Record<string, string>;
     };
     const check = pkg.scripts['check'];
-    expect(check).toMatch(
-      /&& pnpm --filter @detran\/dashboard-web lint && pnpm --filter @detran\/dashboard-web test && pnpm --filter @detran\/dashboard-web build$/,
+    expect(check).toContain(
+      '&& pnpm --filter @detran/dashboard-web lint && pnpm --filter @detran/dashboard-web test && pnpm --filter @detran/dashboard-web build',
     );
     expect(check).toContain('@detran/portal-web');
     const dashboardIndex = check.indexOf('@detran/dashboard-web');
     const portalIndex = check.indexOf('@detran/portal-web');
     expect(portalIndex).toBeLessThan(dashboardIndex);
+    // A11: um app novo (rait-web, R-0012, em main) hoje encerra a linha com a sua própria
+    // tripla — exigir a presença dela aqui pega uma remoção acidental por engano.
+    expect(check).toContain(
+      '&& pnpm --filter @detran/rait-web lint && pnpm --filter @detran/rait-web test && pnpm --filter @detran/rait-web build',
+    );
   });

   it('dado apps/dashboard/web/package.json quando lido então name/scripts corretos, sem service worker nem biblioteca de gráficos', () => {
diff --git a/apps/dashboard/web/src/app/core/sse/sse.service.spec.ts b/apps/dashboard/web/src/app/core/sse/sse.service.spec.ts
index 9a8baef6..ff258e34 100644
--- a/apps/dashboard/web/src/app/core/sse/sse.service.spec.ts
+++ b/apps/dashboard/web/src/app/core/sse/sse.service.spec.ts
@@ -137,11 +137,14 @@ describe('core/sse/sse.service.ts', () => {
     expect(invalidations.filter((event) => event.key === 'v1')).toHaveLength(5);

     const before = events.length;
-    // Eventos de outro domínio são ignorados (C-02-40). Os nomes são compostos por `join`
-    // porque o gate `verify:parameter-catalogue` trata o literal `rait.case.changed` como
-    // candidato a chave de parâmetro (mesma razão dos demais sensores, `plan.md` A7 item 8).
-    send('99', ['x', 'changed'].join('.'), {});
-    send('100', ['rait', 'case', 'changed'].join('.'), {});
+    // C-02-40: eventos de outro domínio devem ser ignorados sem erro. Os nomes
+    // são compostos em runtime (nunca crus) para que o verificador de uso de
+    // parâmetros (tools/parameters/verify.mjs --check-usage) não os leia como
+    // literais de chave de parâmetro (mesma classe da adenda A7 item 8).
+    const foreignDomainEvent = ['x', 'changed'].join('.');
+    const foreignSurfaceEvent = ['rait', 'case', 'changed'].join('.');
+    send('99', foreignDomainEvent, {});
+    send('100', foreignSurfaceEvent, {});
     expect(events).toHaveLength(before);
   });

diff --git a/apps/dashboard/web/src/app/forms/finalidade-n2.schema.ts b/apps/dashboard/web/src/app/forms/finalidade-n2.schema.ts
index 6a7d70c0..4c902c3c 100644
--- a/apps/dashboard/web/src/app/forms/finalidade-n2.schema.ts
+++ b/apps/dashboard/web/src/app/forms/finalidade-n2.schema.ts
@@ -3,12 +3,13 @@
 import { z } from 'zod';
 import type { FormGate } from './form-gate.js';
 import { PURPOSE_TOKENS } from './form-gate.js';
+import type { PurposeToken } from './form-gate.js';

-// OD-D16-008: os tokens vivem em `./form-gate` (folha comum a este schema e a
-// `exportar.schema.ts`); reexportados aqui porque o contrato §11 e C-02-88 os endereçam por
-// `finalidade-n2`.
+// OD-D16-008: os 6 tokens vivem em `form-gate.ts` (a folha comum) porque `exportar.schema.ts`
+// também os usa e nenhum schema pode importar outro (§14.2 regra 1, C-02-83); reexportados
+// aqui porque o contrato §11 e o critério C-02-88 os endereçam por `finalidade-n2`.
 export { PURPOSE_TOKENS };
-export type { PurposeToken } from './form-gate.js';
+export type { PurposeToken };

 export const FinalidadeN2Schema = z.strictObject({
   purpose: z.enum(PURPOSE_TOKENS),
diff --git a/apps/dashboard/web/src/app/forms/form-gate.ts b/apps/dashboard/web/src/app/forms/form-gate.ts
index 3ef71a1c..d866bf74 100644
--- a/apps/dashboard/web/src/app/forms/form-gate.ts
+++ b/apps/dashboard/web/src/app/forms/form-gate.ts
@@ -48,11 +48,12 @@ export interface FormGate {
 /** sha-256 hex = 64 dígitos hex (OD-D16-011); usado por `DASH.DUTY_EVIDENCE_HASH_INVALID`. */
 export const SHA256_HEX = /^[0-9a-fA-F]{64}$/;

-// OD-D16-008: os 6 tokens de finalidade N2, mesma ordem de `shared/models.ts` `PURPOSE_TOKENS` —
-// duplicados literalmente (fronteiras disjuntas de §14.2; igualdade provada em
-// `schemas-matrix.spec.ts`, C-02-93). Vivem aqui, e não em `finalidade-n2.schema.ts`, porque
-// `exportar.schema.ts` também os usa e `forms/` é folha: um schema nunca importa outro
-// (C-02-83; correção do maestro como Engineer, `plan.md` §Triagem 2026-09-22).
+// OD-D16-008: os 6 tokens, mesma ordem de `shared/models.ts` `PURPOSE_TOKENS` — duplicado
+// literalmente (fronteiras disjuntas de §14.2); igualdade provada pelo Inspector em
+// `schemas-matrix.spec.ts` (C-02-93). Vivem em `form-gate.ts` (a folha comum) porque
+// `exportar.schema.ts` e `finalidade-n2.schema.ts` precisam do mesmo token e nenhum schema
+// pode importar outro (§14.2 regra 1, C-02-83); `finalidade-n2.schema.ts` os reexporta, pois
+// o contrato §11 e o critério C-02-88 os endereçam por `finalidade-n2`.
 export const PURPOSE_TOKENS = [
   'supervisao',
   'auditoria',
diff --git a/package.json b/package.json
index fa4ecb17..9007b6e4 100644
--- a/package.json
+++ b/package.json
@@ -12,7 +12,7 @@
   },
   "packageManager": "pnpm@9.15.0",
   "scripts": {
-    "check": "pnpm format:check && pnpm verify:orchestra-bridge && pnpm docs:kb:check && pnpm docs:kb:publish-check && pnpm blueprints:check && pnpm contracts:check && pnpm parameters:test && pnpm contracts:test && pnpm verify:parameter-catalogue && pnpm --filter @detran/ui build && pnpm typecheck && pnpm --filter @detran/ui test && pnpm verify:decorators && pnpm verify:rls-ddl && pnpm verify:role-catalog && pnpm verify:lifecycle-vocabulary && pnpm verify:senatran-boundary && pnpm verify:senatran-contracts && pnpm verify:pec-parity && pnpm verify:pec-superset && pnpm --filter @detran/portal-web lint && pnpm --filter @detran/portal-web test && pnpm --filter @detran/portal-web build && pnpm --filter @detran/rait-web lint && pnpm --filter @detran/rait-web test && pnpm --filter @detran/rait-web build && pnpm --filter @detran/dashboard-web lint && pnpm --filter @detran/dashboard-web test && pnpm --filter @detran/dashboard-web build",
+    "check": "pnpm format:check && pnpm verify:orchestra-bridge && pnpm docs:kb:check && pnpm docs:kb:publish-check && pnpm blueprints:check && pnpm contracts:check && pnpm parameters:test && pnpm contracts:test && pnpm verify:parameter-catalogue && pnpm --filter @detran/ui build && pnpm typecheck && pnpm --filter @detran/ui test && pnpm verify:decorators && pnpm verify:rls-ddl && pnpm verify:role-catalog && pnpm verify:lifecycle-vocabulary && pnpm verify:senatran-boundary && pnpm verify:senatran-contracts && pnpm verify:pec-parity && pnpm verify:pec-superset && pnpm --filter @detran/portal-web lint && pnpm --filter @detran/portal-web test && pnpm --filter @detran/portal-web build && pnpm --filter @detran/dashboard-web lint && pnpm --filter @detran/dashboard-web test && pnpm --filter @detran/dashboard-web build && pnpm --filter @detran/rait-web lint && pnpm --filter @detran/rait-web test && pnpm --filter @detran/rait-web build",
     "format:check": "prettier --check .",
     "format": "prettier --write .",
     "typecheck": "pnpm -r --if-present run typecheck",
```
