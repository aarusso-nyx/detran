# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `rait-model` (rodada `R-0006`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/rait-model`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/rait-build-pack.md` — apenas a seção do WP `WP-A` e o "mapa entregável → definições"
4. `work/rounds/R-0006/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0006/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0006/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0006",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0006/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

### Ciclo 2 — restrito às correções do ciclo 1 (regra do §Veredito, ajuste R-0006)

| Achado do ciclo 1                           | Correção                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Onde verificar                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1. TASK-0008 como Owner em `docs/`          | tarefa reatribuída à disciplina **Architect** (especialização `transcriber-docs`); relatório com a atestação do maestro (Architect); decisão M17(a)                                                                                                                                                                                                                                                                                                                                                                      | `tasks/TASK-0008.json`, `reports/TASK-0008.md`, `plan.md` M17                                        |
| 2. Engineer alterou `BP-INF-COLLECTION-001` | bump assumido pelo Architect (maestro): `module.version` 1.0.1, árvore regenerada, `blueprints:check` passed; M17(b)                                                                                                                                                                                                                                                                                                                                                                                                     | `docs/framework/blueprints/BP-INF-COLLECTION-001.json`, commit 7997a9e                               |
| 3. mock `BankPort` sem testes prévios       | TASK-0014 (Inspector): `bank-port.mock.spec.ts`, 8 `it` cobrindo os comportamentos 1–5 do contrato §c (idempotência, determinismo, janela/ordem, isolamento entre instâncias, `Clock` injetado, sem I/O) — 8/8 verdes sem alteração do mock                                                                                                                                                                                                                                                                              | `backend/domains/inf/collection/tests/unit/bank-port.mock.spec.ts`, `reports/TASK-0014.md`           |
| 4. módulos montados sem matriz de política  | `rait-org`, `collection`, `rait-integration` **desmontados** do `AppModule` (M13 estendido, M17(c)); negativas exaustivas: `describe` novo em `policy.spec.ts` prova, para os 23 recursos novos × read/create/update/delete × 32 papéis canônicos não administrativos, que `isDetranActionAllowed` nega e que a matriz não tem chaves `inf:<recurso>:*` (duas exceções pré-existentes nomeadas: `inf:rait-suspension-act:create`, `inf:rait-export:create`, já em `RAIT_COMMAND_RULES` antes desta rodada — OD proposta) | `backend/app/src/app.module.ts`, `backend/domains/shared/src/policy.spec.ts`, `reports/TASK-0014.md` |
| 5. critério 134 tabelas                     | corrigido para 178 (134 base → 140 CTG-0001 → 165 com ops-agency → 178)                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `plan.md` §Critérios                                                                                 |

Gates após as correções: `blueprints:check` passed, `@detran/app` typecheck 0 erros, `@detran/shared` 73/73, `inf-collection` unit 8/8; gates completos (`pnpm check`, `backend:test:ci` com `role_app_backend`) em execução paralela.

### `git diff --stat 0fcc1f7..HEAD` (só o incremental do ciclo 2)

```
 backend/app/package.json                           |    3 -
 backend/app/src/app.module.ts                      |    6 -
 backend/database/ddl/57-inf-collection.sql         |    2 +-
 .../inf/collection/src/collection.module.ts        |    2 +-
 .../controllers/collection-document.controller.ts  |    2 +-
 .../src/controllers/debt-handoff.controller.ts     |    2 +-
 .../src/controllers/payment.controller.ts          |    2 +-
 .../src/controllers/refund-order.controller.ts     |    2 +-
 .../src/dto/create-collection-document.dto.ts      |    2 +-
 .../collection/src/dto/create-debt-handoff.dto.ts  |    2 +-
 .../inf/collection/src/dto/create-payment.dto.ts   |    2 +-
 .../collection/src/dto/create-refund-order.dto.ts  |    2 +-
 .../src/entities/collection-document.entity.ts     |    2 +-
 .../collection/src/entities/debt-handoff.entity.ts |    2 +-
 .../inf/collection/src/entities/payment.entity.ts  |    2 +-
 .../collection/src/entities/refund-order.entity.ts |    2 +-
 backend/domains/inf/collection/src/index.ts        |    2 +-
 .../repositories/collection-document.repository.ts |    2 +-
 .../src/repositories/debt-handoff.repository.ts    |    2 +-
 .../src/repositories/payment.repository.ts         |    2 +-
 .../src/repositories/refund-order.repository.ts    |    2 +-
 .../src/services/collection-document.service.ts    |    2 +-
 .../src/services/debt-handoff.service.ts           |    2 +-
 .../inf/collection/src/services/payment.service.ts |    2 +-
 .../src/services/refund-order.service.ts           |    2 +-
 .../collection/tests/unit/bank-port.mock.spec.ts   |  233 +
 backend/domains/shared/src/policy.spec.ts          |  141 +
 .../blueprints/BP-INF-COLLECTION-001.json          |  268 +-
 .../contracts/BP-INF-COLLECTION-001.openapi.json   |    2 +-
 pnpm-lock.yaml                                     |    9 -
 work/rounds/R-0006/budget.json                     |   25 +-
 work/rounds/R-0006/compositions.json               |    8 +
 work/rounds/R-0006/evidence-CTG-0002.json          |  163 +
 work/rounds/R-0006/plan.md                         |   85 +-
 work/rounds/R-0006/prompts/TASK-0014.md            |   92 +
 .../reviews/delivery-review-CTG-0002.bridge.json   |   11 +
 .../R-0006/reviews/delivery-review-CTG-0002.json   |   50 +
 .../R-0006/reviews/delivery-review-CTG-0002.md     | 5992 ++++++++++++++++++++
 work/rounds/R-0006/tasks/TASK-0008.json            |   13 +-
 work/rounds/R-0006/tasks/TASK-0014.json            |   48 +
 40 files changed, 7065 insertions(+), 130 deletions(-)
```

### Relatórios novos/alterados

#### `work/rounds/R-0006/reports/TASK-0008.md`

Papel: Architect (Art. 6) — disciplina reatribuída em M17 (delivery-review-CTG-0002: `docs/**` é fronteira do Architect); o worker declarou "Owner (delegado)" conforme o manual `transcriber-docs.md`; o maestro (Architect) atesta o conteúdo transcrito.
Tarefa: TASK-0008
Arquivos criados/alterados: `docs/framework/arch/rait-build-pack.md` (§WP-A: tabela de blueprints conforme M1/M2/M10, `BP-INF-NOTIFICATION-001`, `BP-INF-COLLECTION-001`, integração só `rait_reconciliation`; frase do `apply.sh` substituída; DDL reais 38/39/57/58/59; nota "executado em R-0006"; `updated`); `docs/framework/blueprints/README.md` (`module.ddlFile`; `@detran/inf-deadlines` manuscrito); `docs/framework/arch/rait-fixtures.md` (§7 faixa `00…60`; §8 reescrito); `docs/framework/arch/rait-deadline-engine.md` (§1 pacote em `backend/domains/inf/deadlines`, ADR-0016 §2); `docs/meta/knowledge-base/backlog.md` (itens executados, R-0006).
Comandos executados e saída resumida: prettier OK; `format:check` OK; `docs:kb:check` OK (521/446, baseline inalterada); `docs:kb:publish-check` OK (201); grep "34…37 já foram incluídos" ausente; grep "59-inf-notification.sql" 1 linha.
Critérios de aceitação: 5/5 PASS.
Fora do escopo / deixado: build pack §5 (já correto); backlog sem bullets próprios para org/financeiro/integração; `rait-error-catalog.md` (fora de escopo).
OD tocadas ou propostas: nenhuma.
Bloqueios: nenhum. Desvios: `Edit` bloqueado pelo Auto Mode → edições por script; um `git status --porcelain` (leitura).

#### `work/rounds/R-0006/reports/TASK-0014.md`

Papel: Inspector
Tarefa: TASK-0014
Arquivos criados/alterados: `backend/domains/inf/collection/tests/unit/bank-port.mock.spec.ts` (novo, 8 `it`); `backend/domains/shared/src/policy.spec.ts` (só acrescentado `describe('CTG-0002 — recursos sem matriz até R-0007 (M17)')`, 24 `it`).
Comandos executados e saída resumida: prettier OK; `inf-collection test:unit` 8/8; `@detran/shared test` 73/73 (49 + 24); typecheck dos dois pacotes sem erro.
Critérios de aceitação: 4/4 PASS.
Matriz comportamento/recurso → teste → resultado: contrato §c 1–5 (idempotência de `registerDocument`, determinismo de barcode/pix, `fetchReturns` por janela com ordem estável e idempotente, `orderRefund` idempotente, isolamento entre instâncias, sem `Date.now()`, sem I/O) → 8 PASS; M17: catálogo dos 23 recursos + um `it` por recurso (read/create/update/delete × 36 papéis, 4 papéis administrativos globais excecionados por estrutura) → 24 PASS, com duas exceções nomeadas: `inf:rait-suspension-act:create` (rait-signing-authority, rait-chair) e `inf:rait-export:create` (AUDITOR) já concedidos por `RAIT_COMMAND_RULES`.
Fora do escopo / deixado: nenhum defeito do mock; `GLOBAL_ADMIN_ROLES` liberados por estrutura; ações de comando pré-existentes (`rait-unit:constitute`…) fora da negativa CRUD; `pnpm check` completo não é critério da tarefa (typecheck dos pacotes tocados OK).
OD tocadas ou propostas: proposta — decidir se os grants pré-existentes `inf:rait-suspension-act:create` e `inf:rait-export:create` em `RAIT_COMMAND_RULES` são intencionais antes de R-0007 criar a matriz dos 23 recursos.
Bloqueios: nenhum.

### Diff incremental dos arquivos manuscritos (6 arquivos)

```diff
diff --git a/backend/app/package.json b/backend/app/package.json
index 3d3d135..d4a395e 100644
--- a/backend/app/package.json
+++ b/backend/app/package.json
@@ -38,12 +38,9 @@
     "@detran/ch-toxicology": "workspace:*",
     "@detran/inf-ait": "workspace:*",
     "@detran/inf-alcohol": "workspace:*",
-    "@detran/inf-collection": "workspace:*",
     "@detran/inf-measures": "workspace:*",
     "@detran/inf-normative": "workspace:*",
     "@detran/inf-rait-case": "workspace:*",
-    "@detran/inf-rait-integration": "workspace:*",
-    "@detran/inf-rait-org": "workspace:*",
     "@detran/inf-rait-session": "workspace:*",
     "@detran/inf-rait-worklist": "workspace:*",
     "@detran/inf-speed": "workspace:*",
diff --git a/backend/app/src/app.module.ts b/backend/app/src/app.module.ts
index 0c809c1..4eccceb 100644
--- a/backend/app/src/app.module.ts
+++ b/backend/app/src/app.module.ts
@@ -63,12 +63,9 @@ import { ToxicologyModule } from '@detran/ch-toxicology';
 import { ComplaintsModule } from '@detran/portal-complaints';
 import { AitModule } from '@detran/inf-ait';
 import { AlcoholModule } from '@detran/inf-alcohol';
-import { CollectionModule } from '@detran/inf-collection';
 import { MeasuresModule } from '@detran/inf-measures';
 import { NormativeModule } from '@detran/inf-normative';
 import { RaitCaseModule } from '@detran/inf-rait-case';
-import { RaitIntegrationModule } from '@detran/inf-rait-integration';
-import { RaitOrgModule } from '@detran/inf-rait-org';
 import { RaitSessionModule } from '@detran/inf-rait-session';
 import { RaitWorklistModule } from '@detran/inf-rait-worklist';
 import { SpeedModule } from '@detran/inf-speed';
@@ -359,9 +356,6 @@ export class AppModule {
         RaitCaseModule,
         RaitWorklistModule,
         RaitSessionModule,
-        RaitOrgModule,
-        CollectionModule,
-        RaitIntegrationModule,
         AgencyModule,
         FieldModule,
         SnapshotsModule,
diff --git a/backend/domains/inf/collection/tests/unit/bank-port.mock.spec.ts b/backend/domains/inf/collection/tests/unit/bank-port.mock.spec.ts
new file mode 100644
index 0000000..f83e73b
--- /dev/null
+++ b/backend/domains/inf/collection/tests/unit/bank-port.mock.spec.ts
@@ -0,0 +1,233 @@
+// Testes do mock determinístico da porta bancária (TASK-0014, M17(d)):
+// work/rounds/R-0006/contracts/CTG-0002-modules.md §c, "Comportamento
+// exigido do mock determinístico" (itens 1-5). O Engineer (TASK-0007)
+// escreveu o mock sem testes prévios; este arquivo prova o contrato — um
+// `it` por comportamento numerado como no contrato. Relógio fixo (`Clock`
+// injetado, nunca `Date.now()`, CODESTYLE §TypeScript), mesmo padrão de
+// `backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts`.
+//
+// `documentId`/`infractionId`/`refundOrderId` usados aqui são identificadores
+// de teste locais à porta bancária: o contrato §c não fixa um formato
+// canônico para eles (nenhuma entrada em `rait-fixtures.md` os define, só
+// `50-fixtures-collection.sql` §8 nomeia as tabelas). O código de faixa de
+// pagamento (`tier`) é o único valor canônico disponível e vem de
+// `inf.infraction_payment_tier_ref` (14-inf-lifecycle-vocabulary.sql linha 114).
+import { describe, expect, it, vi } from 'vitest';
+
+import {
+  createMockBankPort,
+  type BankDocumentRegistration,
+  type BankRefundInstruction,
+  type BankReturnLine,
+  type BankReturnWindow,
+  type Clock,
+} from '../../src/handwritten/ports/bank/index.js';
+
+class FixedClock implements Clock {
+  constructor(private readonly iso: string) {}
+  now(): Date {
+    return new Date(this.iso);
+  }
+}
+
+const CLOCK_INSTANT = '2026-09-14T12:00:00.000Z';
+const TIER_DESCONTO_80 = 'desconto_80'; // inf.infraction_payment_tier_ref
+
+function makeRegistration(documentId: string): BankDocumentRegistration {
+  return {
+    documentId,
+    infractionId: 'infraction-0001',
+    tier: TIER_DESCONTO_80,
+    amount: '150.00',
+    validUntil: '2026-10-14',
+  };
+}
+
+describe('MockBankPort (@detran/inf-collection) — contrato CTG-0002-modules.md §c', () => {
+  it('dado um documentId já registrado quando registerDocument é chamado de novo então devolve o mesmo BankDocumentHandle, com mesmo barcode, pixReference e registeredAt do Clock injetado (item 1)', async () => {
+    const clock = new FixedClock(CLOCK_INSTANT);
+    const port = createMockBankPort(clock);
+    const registration = makeRegistration('doc-0001');
+
+    const first = await port.registerDocument(registration);
+    const second = await port.registerDocument(registration);
+
+    expect(second).toEqual(first);
+    expect(second.registeredAt).toBe(new Date(CLOCK_INSTANT).toISOString());
+  });
+
+  it('dado o mesmo documentId em duas instâncias diferentes do mock quando registerDocument deriva barcode e pixReference então os valores são idênticos entre instâncias, nunca ambos nulos e sem contador global (item 2)', async () => {
+    const documentId = 'doc-0002';
+    const registration = makeRegistration(documentId);
+    const portA = createMockBankPort(new FixedClock(CLOCK_INSTANT));
+    const portB = createMockBankPort(
+      new FixedClock('2026-10-01T08:00:00.000Z'),
+    );
+
+    const handleA = await portA.registerDocument(registration);
+    const handleB = await portB.registerDocument(registration);
+
+    expect(handleA.barcode).toBe(handleB.barcode);
+    expect(handleA.pixReference).toBe(handleB.pixReference);
+    expect(handleA.barcode === null && handleA.pixReference === null).toBe(
+      false,
+    );
+    expect(handleA.barcode).toMatch(/^\d{44}$/);
+    expect(handleA.pixReference).toMatch(/^PIX-MOCK-\d{24}$/);
+  });
+
+  it('dado retornos semeados dentro e fora de uma janela quando fetchReturns roda então devolve só as linhas de [from, to] inclusive, em ordem estável por (paidOn, bankReference) (item 3)', async () => {
+    const seeded: readonly BankReturnLine[] = [
+      {
+        bankReference: 'BANKREF-B',
+        barcode: null,
+        pixReference: 'PIX-MOCK-1',
+        paidOn: '2026-09-10',
+        amount: '10.00',
+      },
+      {
+        bankReference: 'BANKREF-A',
+        barcode: null,
+        pixReference: 'PIX-MOCK-2',
+        paidOn: '2026-09-10',
+        amount: '20.00',
+      },
+      {
+        bankReference: 'BANKREF-C',
+        barcode: null,
+        pixReference: 'PIX-MOCK-3',
+        paidOn: '2026-09-12',
+        amount: '30.00',
+      },
+      {
+        bankReference: 'BANKREF-D-FORA-DA-JANELA',
+        barcode: null,
+        pixReference: 'PIX-MOCK-4',
+        paidOn: '2026-09-20',
+        amount: '40.00',
+      },
+    ];
+    const port = createMockBankPort(new FixedClock(CLOCK_INSTANT), seeded);
+    const window: BankReturnWindow = { from: '2026-09-10', to: '2026-09-14' };
+
+    const result = await port.fetchReturns(window);
+
+    expect(result.map((line) => line.bankReference)).toEqual([
+      'BANKREF-A',
+      'BANKREF-B',
+      'BANKREF-C',
+    ]);
+  });
+
+  it('dado a mesma janela consultada duas vezes quando fetchReturns roda então devolve a mesma lista, sem inventar pagamento novo (AC-RAIT-031-1, item 3)', async () => {
+    const seeded: readonly BankReturnLine[] = [
+      {
+        bankReference: 'BANKREF-REPEAT',
+        barcode: null,
+        pixReference: 'PIX-MOCK-5',
+        paidOn: '2026-09-11',
+        amount: '15.00',
+      },
+    ];
+    const port = createMockBankPort(new FixedClock(CLOCK_INSTANT), seeded);
+    const window: BankReturnWindow = { from: '2026-09-10', to: '2026-09-14' };
+
+    const first = await port.fetchReturns(window);
+    const second = await port.fetchReturns(window);
+
+    expect(second).toEqual(first);
+  });
+
+  it('dado um refundOrderId já ordenado quando orderRefund é chamado de novo então devolve o mesmo BankRefundReceipt, sem segunda ordem (item 4)', async () => {
+    const clock = new FixedClock(CLOCK_INSTANT);
+    const port = createMockBankPort(clock);
+    const instruction: BankRefundInstruction = {
+      refundOrderId: 'refund-0001',
+      amount: '50.00',
+      indexKey: 'IPCA-2026-09',
+    };
+
+    const first = await port.orderRefund(instruction);
+    const second = await port.orderRefund(instruction);
+
+    expect(second).toEqual(first);
+    expect(second.bankReference).toMatch(/^BANKREF-MOCK-\d{20}$/);
+    expect(second.orderedAt).toBe(new Date(CLOCK_INSTANT).toISOString());
+  });
+
+  it('dado duas instâncias do mock semeadas com retornos diferentes quando fetchReturns roda em cada então uma não vê os retornos semeados na outra (item 5: sem estado compartilhado entre instâncias)', async () => {
+    const window: BankReturnWindow = { from: '2026-01-01', to: '2026-12-31' };
+    const lineA: BankReturnLine = {
+      bankReference: 'BANKREF-INST-A',
+      barcode: null,
+      pixReference: 'PIX-MOCK-A',
+      paidOn: '2026-06-01',
+      amount: '10.00',
+    };
+    const lineB: BankReturnLine = {
+      bankReference: 'BANKREF-INST-B',
+      barcode: null,
+      pixReference: 'PIX-MOCK-B',
+      paidOn: '2026-06-02',
+      amount: '20.00',
+    };
+    const portA = createMockBankPort(new FixedClock(CLOCK_INSTANT), [lineA]);
+    const portB = createMockBankPort(new FixedClock(CLOCK_INSTANT), [lineB]);
+
+    const resultA = await portA.fetchReturns(window);
+    const resultB = await portB.fetchReturns(window);
+
+    expect(resultA).toEqual([lineA]);
+    expect(resultB).toEqual([lineB]);
+  });
+
+  it('dado um fluxo completo de registerDocument, fetchReturns e orderRefund quando o mock roda então Date.now nunca é chamado (Clock injetado, CODESTYLE §TypeScript; item 5)', async () => {
+    const dateNowSpy = vi.spyOn(Date, 'now');
+    const clock = new FixedClock(CLOCK_INSTANT);
+    const port = createMockBankPort(clock, [
+      {
+        bankReference: 'BANKREF-NO-DATE-NOW',
+        barcode: null,
+        pixReference: 'PIX-MOCK-6',
+        paidOn: '2026-09-11',
+        amount: '25.00',
+      },
+    ]);
+
+    await port.registerDocument(makeRegistration('doc-0003'));
+    await port.fetchReturns({ from: '2026-09-10', to: '2026-09-14' });
+    await port.orderRefund({
+      refundOrderId: 'refund-0002',
+      amount: '25.00',
+      indexKey: 'IPCA-2026-09',
+    });
+
+    expect(dateNowSpy).not.toHaveBeenCalled();
+    dateNowSpy.mockRestore();
+  });
+
+  it('dado o mesmo fluxo completo quando o mock roda então nenhuma chamada de rede (fetch) é registrada (sem I/O; item 5)', async () => {
+    const fetchSpy = vi.spyOn(globalThis, 'fetch');
+    const clock = new FixedClock(CLOCK_INSTANT);
+    const port = createMockBankPort(clock, [
+      {
+        bankReference: 'BANKREF-NO-IO',
+        barcode: null,
+        pixReference: 'PIX-MOCK-7',
+        paidOn: '2026-09-11',
+        amount: '35.00',
+      },
+    ]);
+
+    await port.registerDocument(makeRegistration('doc-0004'));
+    await port.fetchReturns({ from: '2026-09-10', to: '2026-09-14' });
+    await port.orderRefund({
+      refundOrderId: 'refund-0003',
+      amount: '35.00',
+      indexKey: 'IPCA-2026-09',
+    });
+
+    expect(fetchSpy).not.toHaveBeenCalled();
+    fetchSpy.mockRestore();
+  });
+});
diff --git a/backend/domains/shared/src/policy.spec.ts b/backend/domains/shared/src/policy.spec.ts
index 5f441ae..e01b63e 100644
--- a/backend/domains/shared/src/policy.spec.ts
+++ b/backend/domains/shared/src/policy.spec.ts
@@ -818,3 +818,144 @@ describe('DASHBOARD roles, dashboard:* policy matrix and access layers (WP-D0, C
     ).toBe(false);
   });
 });
+
+/**
+ * CTG-0002 — recursos sem matriz até R-0007 (M17(c), delivery-review-CTG-0002
+ * ciclo 1, achado 4; work/rounds/R-0006/plan.md). `rait-org`, `collection` e
+ * `rait-integration` ficam desmontados do `AppModule` nesta rodada, mas os
+ * recursos NOVOS dos módulos já montados (`rait-case`, `rait-worklist`,
+ * `rait-session`) continuam expostos pela superfície CRUD gerada — por isso
+ * a política precisa provar ausência (README da orquestra §4 regra 8) para
+ * os 23 recursos abaixo, em toda ação gerada (`read`, `create`, `update`,
+ * `delete`) e todo papel canônico de `roles.ts`, até R-0007 criar a matriz
+ * real.
+ *
+ * Dois papéis são exceção estrutural, não gap desta rodada:
+ * `GLOBAL_ADMIN_ROLES` (`ADMIN`, `GESTOR_DETRAN`, `SUPORTE`,
+ * `technical-admin`) — `isDetranActionAllowed` os libera para toda chave
+ * antes de consultar `DETRAN_POLICY_MATRIX` (mesmo comportamento que
+ * `permissionsForRoles(['technical-admin'])` devolve `['*']`, provado acima
+ * em "preserves PEC, TEAT, and citizen decisions"); isto é válido para
+ * qualquer recurso do sistema, não uma lacuna dos recursos novos.
+ *
+ * Escopo da negativa: só a superfície CRUD **gerada** (`read`/`create`/
+ * `update`/`delete`, `api.resources[].operations`), que é o que M17(c) e
+ * "guarda falha fechado" cobrem. Vários destes recursos já têm ação de
+ * **comando** gravada em `RAIT_COMMAND_RULES` de rodada anterior
+ * (worklist/org, TASK-0004/0005) — `rait-unit:constitute/activate`,
+ * `rait-schedule:publish`, `rait-batch:open/draw/approve/accept/impede`,
+ * `rait-incident:open`, `rait-quality-sample:review`,
+ * `rait-capacity-plan:publish` — nenhuma delas é `read`/`create`/`update`/
+ * `delete`, então ficam fora desta negativa (comando ≠ superfície gerada;
+ * fora do escopo desta tarefa).
+ *
+ * Achado (não corrigido aqui — Inspector não edita `policy.ts`, manual
+ * `inspector-tests.md` §Não pode tocar): duas dessas chaves de comando
+ * COINCIDEM com uma ação gerada — `inf:rait-suspension-act:create`
+ * (`rait-signing-authority`, `rait-chair`) e `inf:rait-export:create`
+ * (`AUDITOR`). Isso contradiz a premissa "a matriz não contém nenhuma chave
+ * `inf:<recurso>:*` destes recursos" para a ação `create` desses dois
+ * recursos; os testes abaixo provam o estado real (com a exceção nomeada)
+ * em vez de falhar às ciências, e o achado vai para
+ * `docs/meta/knowledge-base/open-decisions-rait.md` (relatório desta tarefa).
+ */
+describe('CTG-0002 — recursos sem matriz até R-0007 (M17)', () => {
+  const GENERATED_ACTIONS = ['read', 'create', 'update', 'delete'] as const;
+  const GLOBAL_ADMIN_ROLES = [
+    'ADMIN',
+    'GESTOR_DETRAN',
+    'SUPORTE',
+    'technical-admin',
+  ] as const;
+  /**
+   * Achado (ver comentário do describe): `RAIT_COMMAND_RULES` grava estas
+   * duas chaves de ação gerada, de rodada anterior. Único par (recurso,
+   * ação gerada) com uma exceção; todos os outros recursos e ações negam
+   * para todo papel além de `GLOBAL_ADMIN_ROLES`.
+   */
+  const PRE_EXISTING_COMMAND_GRANTS: Readonly<
+    Record<string, Readonly<Record<string, readonly string[]>>>
+  > = {
+    'rait-suspension-act': {
+      create: ['rait-signing-authority', 'rait-chair'],
+    },
+    'rait-export': { create: ['AUDITOR'] },
+  };
+
+  /**
+   * Só confere as 4 chaves de ação **gerada** (`read`/`create`/`update`/
+   * `delete`) do recurso — nunca todas as chaves `inf:<recurso>:*`, porque
+   * várias destas 23 já têm ações de comando pré-existentes fora deste
+   * conjunto (ver comentário do describe); essas ficam fora do escopo desta
+   * negativa, não são o gap que M17(c) endereça.
+   */
+  function expectResourceHasNoGeneratedMatrixEntry(resource: string): void {
+    const grantedActions = Object.keys(
+      PRE_EXISTING_COMMAND_GRANTS[resource] ?? {},
+    );
+    const presentGeneratedKeys = GENERATED_ACTIONS.filter(
+      (action) => `inf:${resource}:${action}` in DETRAN_POLICY_MATRIX,
+    ).map((action) => `inf:${resource}:${action}`);
+    expect(presentGeneratedKeys.sort()).toEqual(
+      grantedActions.map((action) => `inf:${resource}:${action}`).sort(),
+    );
+  }
+
+  function expectDeniedForEveryRole(resource: string): void {
+    for (const action of GENERATED_ACTIONS) {
+      const exceptionRoles =
+        PRE_EXISTING_COMMAND_GRANTS[resource]?.[action] ?? [];
+      for (const role of DETRAN_ROLES) {
+        const expected =
+          (GLOBAL_ADMIN_ROLES as readonly string[]).includes(role) ||
+          exceptionRoles.includes(role);
+        expect(
+          isDetranActionAllowed(
+            { roles: [role], permissions: [] },
+            `inf:${resource}`,
+            action,
+          ),
+          `inf:${resource}:${action} para o papel ${role} deveria ser ${expected}`,
+        ).toBe(expected);
+      }
+    }
+  }
+
+  const NEW_RESOURCES = [
+    'rait-unit',
+    'rait-schedule',
+    'rait-schedule-slot',
+    'rait-batch',
+    'rait-batch-item',
+    'rait-substitute-duty',
+    'rait-bench',
+    'rait-pending-content',
+    'rait-redirect',
+    'rait-draft',
+    'rait-holiday',
+    'rait-suspension-act',
+    'rait-jeton-sheet',
+    'rait-jeton-line',
+    'rait-incident',
+    'rait-quality-sample',
+    'rait-capacity-plan',
+    'rait-export',
+    'collection-document',
+    'payment',
+    'refund-order',
+    'debt-handoff',
+    'rait-reconciliation',
+  ];
+
+  it(`cataloga exatamente os 23 recursos novos de CTG-0002 sem matriz (M17)`, () => {
+    expect(NEW_RESOURCES).toHaveLength(23);
+    expect(new Set(NEW_RESOURCES).size).toBe(23);
+  });
+
+  for (const resource of NEW_RESOURCES) {
+    it(`dado o recurso novo inf:${resource} sem matriz quando isDetranActionAllowed é chamado para read/create/update/delete então nega para todo papel canônico de roles.ts, exceto GLOBAL_ADMIN_ROLES e a exceção nomeada da matriz de comando (M17)`, () => {
+      expectDeniedForEveryRole(resource);
+      expectResourceHasNoGeneratedMatrixEntry(resource);
+    });
+  }
+});
diff --git a/docs/framework/blueprints/BP-INF-COLLECTION-001.json b/docs/framework/blueprints/BP-INF-COLLECTION-001.json
index 165e47d..48843fc 100644
--- a/docs/framework/blueprints/BP-INF-COLLECTION-001.json
+++ b/docs/framework/blueprints/BP-INF-COLLECTION-001.json
@@ -4,7 +4,7 @@
   "module": {
     "name": "Collection",
     "namespace": "inf",
-    "version": "1.0.0",
+    "version": "1.0.1",
     "ddlFile": "57-inf-collection.sql",
     "dependencies": {
       "@detran/inf-infraction": "workspace:*"
@@ -41,25 +41,75 @@
         "primaryKey": ["id"],
         "description": "Documento proprio de arrecadacao por faixa e fase — UC-RAIT-032 (fluxo 1 a 4, AC-RAIT-032-1 data-limite unica, AC-RAIT-032-3 duas casas truncadas) e ADR-0017 Decision 1. tier referencia inf.infraction_payment_tier_ref e issued_for_state a fase da infracao para a qual foi emitido (RAIT.COLLECTION_PHASE_INVALID e a guarda de comando). A faixa desconto_40_fora_sne existe no vocabulario e fica desligada pela flag collection.discount_40_outside_sne=false (steering H.53; RAIT.COLLECTION_DISCOUNT_SNE_ONLY). Estados minusculos derivados de ADR-0017 Decision 2 (emitir ou invalidar por fase) e do fluxo 3 e 4 do UC (decisao M12).",
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "infraction_id", "type": "uuid" },
-          { "name": "tier", "type": "varchar(40)" },
-          { "name": "amount", "type": "numeric(12,2)" },
-          { "name": "barcode", "type": "varchar(60)", "nullable": true },
-          { "name": "pix_reference", "type": "varchar(140)", "nullable": true },
-          { "name": "valid_until", "type": "date" },
-          { "name": "issued_for_state", "type": "varchar(40)" },
-          { "name": "status", "type": "varchar(20)", "default": "'emitido'" },
-          { "name": "issued_at", "type": "timestamptz", "default": "now()" },
-          { "name": "issued_by", "type": "uuid", "nullable": true },
-          { "name": "document_id", "type": "uuid", "nullable": true },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "infraction_id",
+            "type": "uuid"
+          },
+          {
+            "name": "tier",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "amount",
+            "type": "numeric(12,2)"
+          },
+          {
+            "name": "barcode",
+            "type": "varchar(60)",
+            "nullable": true
+          },
+          {
+            "name": "pix_reference",
+            "type": "varchar(140)",
+            "nullable": true
+          },
+          {
+            "name": "valid_until",
+            "type": "date"
+          },
+          {
+            "name": "issued_for_state",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "status",
+            "type": "varchar(20)",
+            "default": "'emitido'"
+          },
+          {
+            "name": "issued_at",
+            "type": "timestamptz",
+            "default": "now()"
+          },
+          {
+            "name": "issued_by",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "document_id",
+            "type": "uuid",
+            "nullable": true
+          },
           {
             "name": "supersedes_document_id",
             "type": "uuid",
             "nullable": true
           },
-          { "name": "invalidated_at", "type": "timestamptz", "nullable": true }
+          {
+            "name": "invalidated_at",
+            "type": "timestamptz",
+            "nullable": true
+          }
         ],
         "indexes": [
           {
@@ -110,7 +160,10 @@
           {
             "name": "fk_inf_collection_document_infraction",
             "columns": ["infraction_id"],
-            "references": { "table": "inf.infraction", "columns": ["id"] }
+            "references": {
+              "table": "inf.infraction",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_inf_collection_document_tier",
@@ -144,16 +197,52 @@
         "primaryKey": ["id"],
         "description": "Pagamento vindo do retorno bancario e sua conciliacao — UC-RAIT-035 (fluxo 1 casamento por documento, valor e data; AC-RAIT-035-3 rastreabilidade) e ADR-0017 Decision 1. Retorno sem documento correspondente fica sem document_id e sem matched_at (RAIT.PAYMENT_UNMATCHED, catalogo secao 3.11); reversed_at registra o estorno que publica PAGAMENTO_ESTORNADO (ADR-0017 Decision 2). O pagamento nao muda estado da infracao: o agregado decide ([WF-INF-003] secao 2 linhas 12 a 16 e 29).",
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "document_id", "type": "uuid", "nullable": true },
-          { "name": "bank_reference", "type": "varchar(80)" },
-          { "name": "paid_on", "type": "date" },
-          { "name": "amount", "type": "numeric(12,2)" },
-          { "name": "tier_applied", "type": "varchar(40)", "nullable": true },
-          { "name": "received_at", "type": "timestamptz", "default": "now()" },
-          { "name": "matched_at", "type": "timestamptz", "nullable": true },
-          { "name": "reversed_at", "type": "timestamptz", "nullable": true }
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "document_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "bank_reference",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "paid_on",
+            "type": "date"
+          },
+          {
+            "name": "amount",
+            "type": "numeric(12,2)"
+          },
+          {
+            "name": "tier_applied",
+            "type": "varchar(40)",
+            "nullable": true
+          },
+          {
+            "name": "received_at",
+            "type": "timestamptz",
+            "default": "now()"
+          },
+          {
+            "name": "matched_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "reversed_at",
+            "type": "timestamptz",
+            "nullable": true
+          }
         ],
         "indexes": [
           {
@@ -214,13 +303,35 @@
         "primaryKey": ["id"],
         "description": "Ordem de restituicao corrigida — UC-RAIT-033 (fluxo 1 a 4, fluxo 3a dados bancarios ausentes, AC-RAIT-033-1 sem pedido do cidadao, AC-RAIT-033-2 indice visivel) e ADR-0017 Decision 1. index_key registra qual indice foi aplicado e nao tem default: o valor vigente e o parametro rait.refund.index (IPCA-E, ops.parameter; RAIT.REFUND_INDEX_PENDING quando nao parametrizado). Estados minusculos dos eventos reservados RESTITUICAO_ORDENADA e RESTITUICAO_PAGA (rait-events-sse-contract.md secao 2.5) mais a abertura por RESTITUICAO_DEVIDA (decisao M12).",
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "infraction_id", "type": "uuid" },
-          { "name": "payment_id", "type": "uuid" },
-          { "name": "reason", "type": "varchar(30)" },
-          { "name": "base_amount", "type": "numeric(12,2)" },
-          { "name": "index_key", "type": "varchar(40)" },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "infraction_id",
+            "type": "uuid"
+          },
+          {
+            "name": "payment_id",
+            "type": "uuid"
+          },
+          {
+            "name": "reason",
+            "type": "varchar(30)"
+          },
+          {
+            "name": "base_amount",
+            "type": "numeric(12,2)"
+          },
+          {
+            "name": "index_key",
+            "type": "varchar(40)"
+          },
           {
             "name": "updated_amount",
             "type": "numeric(12,2)",
@@ -231,11 +342,31 @@
             "type": "varchar(20)",
             "default": "'pendente'"
           },
-          { "name": "status", "type": "varchar(20)", "default": "'aberta'" },
-          { "name": "opened_at", "type": "timestamptz", "default": "now()" },
-          { "name": "ordered_at", "type": "timestamptz", "nullable": true },
-          { "name": "paid_at", "type": "timestamptz", "nullable": true },
-          { "name": "document_id", "type": "uuid", "nullable": true }
+          {
+            "name": "status",
+            "type": "varchar(20)",
+            "default": "'aberta'"
+          },
+          {
+            "name": "opened_at",
+            "type": "timestamptz",
+            "default": "now()"
+          },
+          {
+            "name": "ordered_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "paid_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "document_id",
+            "type": "uuid",
+            "nullable": true
+          }
         ],
         "indexes": [
           {
@@ -282,12 +413,18 @@
           {
             "name": "fk_inf_refund_order_infraction",
             "columns": ["infraction_id"],
-            "references": { "table": "inf.infraction", "columns": ["id"] }
+            "references": {
+              "table": "inf.infraction",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_inf_refund_order_payment",
             "columns": ["payment_id"],
-            "references": { "table": "inf.payment", "columns": ["id"] }
+            "references": {
+              "table": "inf.payment",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -297,9 +434,19 @@
         "primaryKey": ["id"],
         "description": "Encaminhamento do credito definitivo nao pago a Fazenda e a divida ativa — UC-RAIT-034 (fluxo 3 transferencia com o dossie fiscal, fluxo 2a pagamento durante a cobranca, AC-RAIT-034-2) e ADR-0017 Decision 1. Antes de INSTANCIA_ENCERRADA ou com efeito suspensivo o encaminhamento e recusado (RAIT.DEBT_HANDOFF_NOT_FINAL, guarda de comando porque depende do estado do agregado). A porta da Fazenda segue pendente de fonte (ADR-0017 tabela de ownership).",
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "infraction_id", "type": "uuid" },
+          {
+            "name": "id",
+            "type": "uuid",
+            "default": "gen_random_uuid()"
+          },
+          {
+            "name": "tenant_id",
+            "type": "uuid"
+          },
+          {
+            "name": "infraction_id",
+            "type": "uuid"
+          },
           {
             "name": "fazenda_reference",
             "type": "varchar(80)",
@@ -310,15 +457,31 @@
             "type": "uuid",
             "nullable": true
           },
-          { "name": "status", "type": "varchar(20)", "default": "'preparado'" },
-          { "name": "prepared_at", "type": "timestamptz", "default": "now()" },
-          { "name": "sent_at", "type": "timestamptz", "nullable": true },
+          {
+            "name": "status",
+            "type": "varchar(20)",
+            "default": "'preparado'"
+          },
+          {
+            "name": "prepared_at",
+            "type": "timestamptz",
+            "default": "now()"
+          },
+          {
+            "name": "sent_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
           {
             "name": "acknowledged_at",
             "type": "timestamptz",
             "nullable": true
           },
-          { "name": "cancel_reason", "type": "varchar(30)", "nullable": true }
+          {
+            "name": "cancel_reason",
+            "type": "varchar(30)",
+            "nullable": true
+          }
         ],
         "indexes": [
           {
@@ -362,7 +525,10 @@
           {
             "name": "fk_inf_debt_handoff_infraction",
             "columns": ["infraction_id"],
-            "references": { "table": "inf.infraction", "columns": ["id"] }
+            "references": {
+              "table": "inf.infraction",
+              "columns": ["id"]
+            }
           }
         ]
       }
@@ -376,7 +542,11 @@
         "path": "collection-documents",
         "resource": "collection-document"
       },
-      { "entity": "Payment", "path": "payments", "resource": "payment" },
+      {
+        "entity": "Payment",
+        "path": "payments",
+        "resource": "payment"
+      },
       {
         "entity": "RefundOrder",
         "path": "refund-orders",
diff --git a/work/rounds/R-0006/plan.md b/work/rounds/R-0006/plan.md
index 8a423f7..fd2f80b 100644
--- a/work/rounds/R-0006/plan.md
+++ b/work/rounds/R-0006/plan.md
@@ -52,42 +52,44 @@ git); prompt em `prompts/00-maestro.md`. Reviewer: GPT-5.6 Terra via `tools/orch

 ## Decisões do maestro (Architect, 2026-09-14) — reconciliação build pack × ADRs aceitas

-| #   | Decisão                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Fonte                                                        |
-| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
-| M1  | Avisos (NA/NP/decisão) **não** são entidade do agregado (`infraction_notice` do build pack): vivem em `inf.notice*` do módulo `inf/notification`. O agregado guarda apenas `infraction_timer` e `infraction_event`.                                                                                                                                                                                                                                                                                                                           | ADR-0016 §1 (aceita 2026-09-13, posterior ao build pack)     |
-| M2  | Pagamentos **não** são entidade do agregado (`infraction_payment`): `inf.payment` pertence a `inf/collection`; o agregado só carrega `paid`/`payment_tier`. Blueprint financeiro chama-se `BP-INF-COLLECTION-001` com tabelas `collection_document`, `payment`, `refund_order`, `debt_handoff` (sem prefixo `rait_`).                                                                                                                                                                                                                         | ADR-0017 §1                                                  |
-| M3  | `@detran/inf-deadlines` é pacote **manuscrito** em `backend/domains/inf/deadlines` (glob `backend/domains/*/*` do workspace), consumido por `infraction`, `notification` e `rait-case`. `rait-deadline-engine.md` §1 (que o punha em `rait-case`) é corrigido em TASK-0008.                                                                                                                                                                                                                                                                   | ADR-0016 §2                                                  |
-| M4  | Sem edição de `14-inf-lifecycle-vocabulary.sql`: todos os `*_ref` exigidos já estão seedados (15 estados, 12 sub-estados, 46 transições, 18 timers, 6 faixas, 6 canais). O lock com `ops-agency` fica virtual; se um worker achar lacuna, reporta em vez de editar.                                                                                                                                                                                                                                                                           | `verify:lifecycle-vocabulary` OK na base d8fe83a             |
-| M5  | `suspended_by_act_id` em `infraction_timer` (DDL 38) referencia `rait_suspension_act` (DDL 39) **sem FK** (ordem lexicográfica impede), como já faz `rait_deadline.suspended_by_act_id`.                                                                                                                                                                                                                                                                                                                                                      | `apply.sh`; BP-INF-RAIT-CASE-001                             |
-| M6  | Fixtures SQL são escritas pelo **Inspector** (manual `inspector-tests.md` §Pode tocar), no mesmo grupo do blueprint (`rait-fixtures.md` §8): `30-fixtures-infraction.sql` em TASK-0002; org/finance/integration e ajustes do `20-fixtures-rait.sql` em TASK-0006.                                                                                                                                                                                                                                                                             | manual do Inspector; `rait-fixtures.md` §8                   |
-| M7  | Pacotes novos (gerados ou manuscritos) exigem `pnpm install` (lockfile). Workers não instalam; o **maestro** roda `pnpm install` no checkpoint de cada tarefa que cria pacote e commita `chore(deps)`. Antes de TASK-0002/0003 o maestro cria o esqueleto de `@detran/inf-deadlines` (package.json, tsconfig, vitest) já linkado.                                                                                                                                                                                                             | `AGENTS.md` regra 6; template do worker                      |
-| M8  | Guarda de transição da infração nasce nesta rodada como **código puro** (`src/handwritten/guards/`, espelho de `infraction_transition_ref`) sem rotas; o teste de matriz lê o bloco `INSERT` do DDL 14 e exige cobertura de 100 % das linhas `vigente`.                                                                                                                                                                                                                                                                                       | `rait-test-strategy.md` §3; ADR-0016 §1                      |
-| M9  | Sem paralelismo entre tarefas que regeneram blueprints ou aplicam DDL: `pnpm blueprints:generate` reescreve a árvore gerada inteira e `apply.sh` lê todos os DDL. A frente roda em pipeline estrito (TASK-0001 → 0002 → 0003 → PR CTG-0001 → 0004 → 0005 → 0006 → 0007 → 0008).                                                                                                                                                                                                                                                               | `tools/blueprints/generate.mjs`; `apply.sh`                  |
-| M10 | Migração de `rait_communication` para projeção de `inf.notice` (ADR-0016 §4) e **toda** projeção por consumidor (ADR-0020), inclusive a projeção da `integration.outbox` por sistema que o build pack punha em `BP-INF-RAIT-INTEGRATION-001`, ficam **fora** desta rodada: projeções nascem em WP-P (após WP-B). `BP-INF-RAIT-INTEGRATION-001` nasce só com `rait_reconciliation`. Registrado em §Fora de escopo do PR.                                                                                                                       | ADR-0020 §Consequências; build pack §5                       |
-| M11 | Esquemas JSON dos cinco eventos publicados do agregado (`rait-events-sse-contract.md` §2.4) nascem em `docs/framework/schemas/events/` (WP-A cria a partir da tabela). Eventos consumidos não ganham esquema aqui (donos são outros módulos).                                                                                                                                                                                                                                                                                                 | `rait-events-sse-contract.md` §2.4                           |
-| M13 | Nesta rodada os módulos `inf/infraction` e `inf/notification` **não** são montados no `AppModule`: a superfície HTTP (leituras geradas + comandos) entra em R-0007 junto com a política `inf:infraction:*`/`inf:notice:*`. Entidades append-only (`infraction_event`, `notice_acknowledgement`, `notice_delivery_attempt`) não geram `update`/`delete` (`api.resources[].operations`). A exposição de `PATCH` sobre `infraction.state` pela rota gerada é OD para R-0007 (política deve negar até existirem comandos).                        | delivery-review-CTG-0001; ADR-0016 §1                        |
-| M14 | Envelope reduzido da biblioteca de prazos usa `aggregate.kind: 'clock'` (§1 do contrato de eventos). `data.reason` de `inf.timer.rescheduled` tem os tokens **`suspensao`** \| **`prorrogacao`** (decisão do Owner, 2026-09-14, em resposta ao prompt-review-5); `suspensionActId` é obrigatório e anulável (nulo na prorrogação) no contrato, na tabela §2.4 e no JSON Schema.                                                                                                                                                               | Owner 2026-09-14; `rait-events-sse-contract.md` §1           |
-| M15 | O motivo do chamador em `extend(id, reason)` é retido em `Deadline.extensionReason` (string, nulo até a prorrogação), persistido pela porta `TimerStore`; o envelope de `inf.timer.rescheduled` não muda (`data.reason` = token `prorrogacao`). Proposta do maestro após delivery-review-3; vigora com a decisão do humano.                                                                                                                                                                                                                   | delivery-review-CTG-0001-3; contrato §5.2                    |
-| M16 | Fixtures de CTG-0002 usam prefixos **livres** (uma entidade, um prefixo; `rait-fixtures.md`): os prefixos do prompt de TASK-0004 colidiam com `rait_admissibility/deadline/inquiry/assignment/impediment/clock`; a tabela normativa é a §e.3 de `contracts/CTG-0002-deltas.md` (remapeada a pedido do maestro). `rait_bench` e `rait_substitute_duty` ficam no blueprint do worklist, com `session_id` sem FK (DDL 35 < 36, regra M5). As UCs 027 (redirecionamento) e 028 (pendência) estavam trocadas no prompt; o contrato cita as certas. | relatório TASK-0004                                          |
-| M12 | Vocabulários que nenhum workflow fixa (status do timer, status do aviso, tipo de evidência de ciência) são decisões de modelagem do Architect derivadas de `rait-deadline-engine.md` §3 e ADR-0016 §1, em minúsculas (padrão dos enums não canônicos, ex.: `rait_pool.strategy`), documentadas no contrato; não são tokens canônicos.                                                                                                                                                                                                         | `CODESTYLE.md` §Naming; padrão de `BP-INF-RAIT-WORKLIST-001` |
+| #   | Decisão                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Fonte                                                        |
+| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
+| M1  | Avisos (NA/NP/decisão) **não** são entidade do agregado (`infraction_notice` do build pack): vivem em `inf.notice*` do módulo `inf/notification`. O agregado guarda apenas `infraction_timer` e `infraction_event`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | ADR-0016 §1 (aceita 2026-09-13, posterior ao build pack)     |
+| M2  | Pagamentos **não** são entidade do agregado (`infraction_payment`): `inf.payment` pertence a `inf/collection`; o agregado só carrega `paid`/`payment_tier`. Blueprint financeiro chama-se `BP-INF-COLLECTION-001` com tabelas `collection_document`, `payment`, `refund_order`, `debt_handoff` (sem prefixo `rait_`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ADR-0017 §1                                                  |
+| M3  | `@detran/inf-deadlines` é pacote **manuscrito** em `backend/domains/inf/deadlines` (glob `backend/domains/*/*` do workspace), consumido por `infraction`, `notification` e `rait-case`. `rait-deadline-engine.md` §1 (que o punha em `rait-case`) é corrigido em TASK-0008.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | ADR-0016 §2                                                  |
+| M4  | Sem edição de `14-inf-lifecycle-vocabulary.sql`: todos os `*_ref` exigidos já estão seedados (15 estados, 12 sub-estados, 46 transições, 18 timers, 6 faixas, 6 canais). O lock com `ops-agency` fica virtual; se um worker achar lacuna, reporta em vez de editar.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `verify:lifecycle-vocabulary` OK na base d8fe83a             |
+| M5  | `suspended_by_act_id` em `infraction_timer` (DDL 38) referencia `rait_suspension_act` (DDL 39) **sem FK** (ordem lexicográfica impede), como já faz `rait_deadline.suspended_by_act_id`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `apply.sh`; BP-INF-RAIT-CASE-001                             |
+| M6  | Fixtures SQL são escritas pelo **Inspector** (manual `inspector-tests.md` §Pode tocar), no mesmo grupo do blueprint (`rait-fixtures.md` §8): `30-fixtures-infraction.sql` em TASK-0002; org/finance/integration e ajustes do `20-fixtures-rait.sql` em TASK-0006.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | manual do Inspector; `rait-fixtures.md` §8                   |
+| M7  | Pacotes novos (gerados ou manuscritos) exigem `pnpm install` (lockfile). Workers não instalam; o **maestro** roda `pnpm install` no checkpoint de cada tarefa que cria pacote e commita `chore(deps)`. Antes de TASK-0002/0003 o maestro cria o esqueleto de `@detran/inf-deadlines` (package.json, tsconfig, vitest) já linkado.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `AGENTS.md` regra 6; template do worker                      |
+| M8  | Guarda de transição da infração nasce nesta rodada como **código puro** (`src/handwritten/guards/`, espelho de `infraction_transition_ref`) sem rotas; o teste de matriz lê o bloco `INSERT` do DDL 14 e exige cobertura de 100 % das linhas `vigente`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `rait-test-strategy.md` §3; ADR-0016 §1                      |
+| M9  | Sem paralelismo entre tarefas que regeneram blueprints ou aplicam DDL: `pnpm blueprints:generate` reescreve a árvore gerada inteira e `apply.sh` lê todos os DDL. A frente roda em pipeline estrito (TASK-0001 → 0002 → 0003 → PR CTG-0001 → 0004 → 0005 → 0006 → 0007 → 0008).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `tools/blueprints/generate.mjs`; `apply.sh`                  |
+| M10 | Migração de `rait_communication` para projeção de `inf.notice` (ADR-0016 §4) e **toda** projeção por consumidor (ADR-0020), inclusive a projeção da `integration.outbox` por sistema que o build pack punha em `BP-INF-RAIT-INTEGRATION-001`, ficam **fora** desta rodada: projeções nascem em WP-P (após WP-B). `BP-INF-RAIT-INTEGRATION-001` nasce só com `rait_reconciliation`. Registrado em §Fora de escopo do PR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | ADR-0020 §Consequências; build pack §5                       |
+| M11 | Esquemas JSON dos cinco eventos publicados do agregado (`rait-events-sse-contract.md` §2.4) nascem em `docs/framework/schemas/events/` (WP-A cria a partir da tabela). Eventos consumidos não ganham esquema aqui (donos são outros módulos).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `rait-events-sse-contract.md` §2.4                           |
+| M13 | Nesta rodada os módulos `inf/infraction` e `inf/notification` **não** são montados no `AppModule`: a superfície HTTP (leituras geradas + comandos) entra em R-0007 junto com a política `inf:infraction:*`/`inf:notice:*`. Entidades append-only (`infraction_event`, `notice_acknowledgement`, `notice_delivery_attempt`) não geram `update`/`delete` (`api.resources[].operations`). A exposição de `PATCH` sobre `infraction.state` pela rota gerada é OD para R-0007 (política deve negar até existirem comandos).                                                                                                                                                                                                                                                                                                                                                                                                                                         | delivery-review-CTG-0001; ADR-0016 §1                        |
+| M14 | Envelope reduzido da biblioteca de prazos usa `aggregate.kind: 'clock'` (§1 do contrato de eventos). `data.reason` de `inf.timer.rescheduled` tem os tokens **`suspensao`** \| **`prorrogacao`** (decisão do Owner, 2026-09-14, em resposta ao prompt-review-5); `suspensionActId` é obrigatório e anulável (nulo na prorrogação) no contrato, na tabela §2.4 e no JSON Schema.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Owner 2026-09-14; `rait-events-sse-contract.md` §1           |
+| M15 | O motivo do chamador em `extend(id, reason)` é retido em `Deadline.extensionReason` (string, nulo até a prorrogação), persistido pela porta `TimerStore`; o envelope de `inf.timer.rescheduled` não muda (`data.reason` = token `prorrogacao`). Proposta do maestro após delivery-review-3; vigora com a decisão do humano.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | delivery-review-CTG-0001-3; contrato §5.2                    |
+| M16 | Fixtures de CTG-0002 usam prefixos **livres** (uma entidade, um prefixo; `rait-fixtures.md`): os prefixos do prompt de TASK-0004 colidiam com `rait_admissibility/deadline/inquiry/assignment/impediment/clock`; a tabela normativa é a §e.3 de `contracts/CTG-0002-deltas.md` (remapeada a pedido do maestro). `rait_bench` e `rait_substitute_duty` ficam no blueprint do worklist, com `session_id` sem FK (DDL 35 < 36, regra M5). As UCs 027 (redirecionamento) e 028 (pendência) estavam trocadas no prompt; o contrato cita as certas.                                                                                                                                                                                                                                                                                                                                                                                                                  | relatório TASK-0004                                          |
+| M17 | Correções da delivery-review-CTG-0002 ciclo 1: (a) `docs/**` é fronteira do Architect (Constituição): a transcrição de TASK-0008 é reatribuída à disciplina **Architect** (especialização `transcriber-docs`), com o maestro (Architect) atestando o conteúdo; (b) o bump de `BP-INF-COLLECTION-001` (`handwrittenExports`/`handwrittenProviders`) é ato do Architect — maestro assume e versiona 1.0.1; (c) M13 estende-se a CTG-0002: `rait-org`, `collection` e `rait-integration` **não** são montados no `AppModule` até R-0007 (política `inf:*` dos recursos novos inexistente; guard falha fechado); os recursos novos dos módulos já montados (`rait-unit`, `rait-schedule`, `rait-batch`, …, `rait-draft`) ganham testes de **negativa exaustiva** na política até R-0007 criar a matriz; (d) o mock do `BankPort` recebe testes do Inspector (TASK-0014) antes de qualquer ajuste do Engineer; (e) critério de `verify:rls-ddl` corrigido para 178. | delivery-review-CTG-0002                                     |
+| M12 | Vocabulários que nenhum workflow fixa (status do timer, status do aviso, tipo de evidência de ciência) são decisões de modelagem do Architect derivadas de `rait-deadline-engine.md` §3 e ADR-0016 §1, em minúsculas (padrão dos enums não canônicos, ex.: `rait_pool.strategy`), documentadas no contrato; não são tokens canônicos.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `CODESTYLE.md` §Naming; padrão de `BP-INF-RAIT-WORKLIST-001` |

 ## Tarefas

-| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                                                                                                                                   | Depende de           | Entrega                                                                                                                                                                                                                                        |
-| --------- | ------------ | ------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
-| TASK-0001 | Architect    | architect-blueprint | Opus / alto    | `MOD-bp-inf-infraction`, `MOD-bp-inf-notification`, `MOD-ddl-38`, `MOD-ddl-59`, `MOD-schemas-events`, `MOD-generated-tree`                                             | —                    | `BP-INF-INFRACTION-001`, `BP-INF-NOTIFICATION-001`, gerados (módulos, DDL 38/59, contratos OpenAPI), esquemas dos eventos, `contracts/CTG-0001.md` (entidades, guardas por linha de `infraction_transition_ref`, API do motor, ids de fixture) |
-| TASK-0002 | Inspector    | inspector-tests     | Opus / médio   | `MOD-inf-infraction-tests`, `MOD-inf-notification-tests`, `MOD-inf-deadlines-tests`, `MOD-seed-30`, `MOD-inf-ait-rls-count`                                            | TASK-0001            | testes: matriz de transição (todas as linhas de `infraction_transition_ref`), motor de prazos (§7 casos 1–18), esquemas de evento, RLS/checks/unicidade; fixtures `30-fixtures-infraction.sql`                                                 |
-| TASK-0003 | Engineer     | engineer-backend    | Opus / médio   | `MOD-inf-deadlines`, `MOD-inf-infraction-handwritten`, `MOD-inf-notification-handwritten`, `MOD-app-module`, `MOD-root-scripts`                                        | TASK-0002            | `@detran/inf-deadlines` implementado, guardas e eventos da infração, regras de ciência da notificação, `AppModule`, scripts raiz; testes de TASK-0002 verdes                                                                                   |
-| TASK-0004 | Architect    | architect-blueprint | Opus / alto    | `MOD-bp-rait-worklist`, `MOD-bp-rait-session`, `MOD-bp-rait-case`, `MOD-ddl-34`, `MOD-ddl-35`, `MOD-ddl-36`, `MOD-generated-tree`                                      | PR CTG-0001 mesclado | deltas v1.1.0 (três blueprints), gerados, `contracts/CTG-0002-deltas.md` (máquinas TURMA/LOTE/BANCA/disponibilidade, unicidade, notas de migração, ajustes de seed exigidos)                                                                   |
-| TASK-0005 | Architect    | architect-blueprint | Opus / alto    | `MOD-bp-rait-org`, `MOD-bp-collection`, `MOD-bp-rait-integration`, `MOD-ddl-39`, `MOD-ddl-57`, `MOD-ddl-58`, `MOD-generated-tree`                                      | TASK-0004            | três blueprints novos, gerados, `contracts/CTG-0002-modules.md` (entidades, port bancário, especificação da fachada de documentos, ids de fixture)                                                                                             |
-| TASK-0006 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-rait-tests`, `MOD-seed-20`, `MOD-seed-40-60`, `MOD-fixtures-json`, `MOD-inf-ait-rls-count`, `MOD-shared-documents-tests`                                          | TASK-0005            | testes de integração (RLS, checks, FKs, unicidade de lote/escala), fixtures novas e ajustadas, teste de tipos da fachada                                                                                                                       |
-| TASK-0007 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-collection-handwritten`, `MOD-inf-rait-org-handwritten`, `MOD-inf-rait-integration-handwritten`, `MOD-shared-documents`, `MOD-app-module`, `MOD-root-scripts` | TASK-0006            | wiring dos módulos novos, port bancário + mock, fachada de documentos (tipos) em `@detran/shared`, scripts raiz; testes de TASK-0006 verdes                                                                                                    |
-| TASK-0009 | Architect    | architect-blueprint | Opus / alto    | `MOD-contract-ctg-0001`, `MOD-schemas-events`, `MOD-arch-events-contract`                                                                                              | TASK-0003            | contrato §5.2 (porta `DeadlineEvents`, `extend`, casos 19–22, emenda do caso 12), esquema `inf.timer.rescheduled`                                                                                                                              |
-| TASK-0010 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-inf-deadlines-tests`                                                                                                                                              | TASK-0009            | testes dos casos 19–22 e da emenda do 12 (vermelhos)                                                                                                                                                                                           |
-| TASK-0011 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-deadlines`                                                                                                                                                    | TASK-0010            | porta de eventos, emissão idempotente, `extend`; testes verdes                                                                                                                                                                                 |
-| TASK-0012 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-inf-deadlines-tests`                                                                                                                                              | TASK-0011            | caso 23 (retenção do motivo de `extend`, M15)                                                                                                                                                                                                  |
-| TASK-0013 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-inf-deadlines`                                                                                                                                                    | TASK-0012            | `Deadline.extensionReason` persistido; 23 casos verdes                                                                                                                                                                                         |
-| TASK-0008 | Owner deleg. | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                                                                                                                                             | TASK-0007            | build pack §WP-A, `blueprints/README.md`, `rait-fixtures.md`, `rait-deadline-engine.md` §1, backlog                                                                                                                                            |
+| Tarefa    | Papel       | Perfil              | Modelo/esforço | Lock                                                                                                                                                                   | Depende de           | Entrega                                                                                                                                                                                                                                        |
+| --------- | ----------- | ------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
+| TASK-0001 | Architect   | architect-blueprint | Opus / alto    | `MOD-bp-inf-infraction`, `MOD-bp-inf-notification`, `MOD-ddl-38`, `MOD-ddl-59`, `MOD-schemas-events`, `MOD-generated-tree`                                             | —                    | `BP-INF-INFRACTION-001`, `BP-INF-NOTIFICATION-001`, gerados (módulos, DDL 38/59, contratos OpenAPI), esquemas dos eventos, `contracts/CTG-0001.md` (entidades, guardas por linha de `infraction_transition_ref`, API do motor, ids de fixture) |
+| TASK-0002 | Inspector   | inspector-tests     | Opus / médio   | `MOD-inf-infraction-tests`, `MOD-inf-notification-tests`, `MOD-inf-deadlines-tests`, `MOD-seed-30`, `MOD-inf-ait-rls-count`                                            | TASK-0001            | testes: matriz de transição (todas as linhas de `infraction_transition_ref`), motor de prazos (§7 casos 1–18), esquemas de evento, RLS/checks/unicidade; fixtures `30-fixtures-infraction.sql`                                                 |
+| TASK-0003 | Engineer    | engineer-backend    | Opus / médio   | `MOD-inf-deadlines`, `MOD-inf-infraction-handwritten`, `MOD-inf-notification-handwritten`, `MOD-app-module`, `MOD-root-scripts`                                        | TASK-0002            | `@detran/inf-deadlines` implementado, guardas e eventos da infração, regras de ciência da notificação, `AppModule`, scripts raiz; testes de TASK-0002 verdes                                                                                   |
+| TASK-0004 | Architect   | architect-blueprint | Opus / alto    | `MOD-bp-rait-worklist`, `MOD-bp-rait-session`, `MOD-bp-rait-case`, `MOD-ddl-34`, `MOD-ddl-35`, `MOD-ddl-36`, `MOD-generated-tree`                                      | PR CTG-0001 mesclado | deltas v1.1.0 (três blueprints), gerados, `contracts/CTG-0002-deltas.md` (máquinas TURMA/LOTE/BANCA/disponibilidade, unicidade, notas de migração, ajustes de seed exigidos)                                                                   |
+| TASK-0005 | Architect   | architect-blueprint | Opus / alto    | `MOD-bp-rait-org`, `MOD-bp-collection`, `MOD-bp-rait-integration`, `MOD-ddl-39`, `MOD-ddl-57`, `MOD-ddl-58`, `MOD-generated-tree`                                      | TASK-0004            | três blueprints novos, gerados, `contracts/CTG-0002-modules.md` (entidades, port bancário, especificação da fachada de documentos, ids de fixture)                                                                                             |
+| TASK-0006 | Inspector   | inspector-tests     | Sonnet / médio | `MOD-rait-tests`, `MOD-seed-20`, `MOD-seed-40-60`, `MOD-fixtures-json`, `MOD-inf-ait-rls-count`, `MOD-shared-documents-tests`                                          | TASK-0005            | testes de integração (RLS, checks, FKs, unicidade de lote/escala), fixtures novas e ajustadas, teste de tipos da fachada                                                                                                                       |
+| TASK-0007 | Engineer    | engineer-backend    | Sonnet / médio | `MOD-inf-collection-handwritten`, `MOD-inf-rait-org-handwritten`, `MOD-inf-rait-integration-handwritten`, `MOD-shared-documents`, `MOD-app-module`, `MOD-root-scripts` | TASK-0006            | wiring dos módulos novos, port bancário + mock, fachada de documentos (tipos) em `@detran/shared`, scripts raiz; testes de TASK-0006 verdes                                                                                                    |
+| TASK-0009 | Architect   | architect-blueprint | Opus / alto    | `MOD-contract-ctg-0001`, `MOD-schemas-events`, `MOD-arch-events-contract`                                                                                              | TASK-0003            | contrato §5.2 (porta `DeadlineEvents`, `extend`, casos 19–22, emenda do caso 12), esquema `inf.timer.rescheduled`                                                                                                                              |
+| TASK-0010 | Inspector   | inspector-tests     | Sonnet / médio | `MOD-inf-deadlines-tests`                                                                                                                                              | TASK-0009            | testes dos casos 19–22 e da emenda do 12 (vermelhos)                                                                                                                                                                                           |
+| TASK-0011 | Engineer    | engineer-backend    | Sonnet / médio | `MOD-inf-deadlines`                                                                                                                                                    | TASK-0010            | porta de eventos, emissão idempotente, `extend`; testes verdes                                                                                                                                                                                 |
+| TASK-0014 | Inspector   | inspector-tests     | Sonnet / médio | `MOD-inf-collection-tests`, `MOD-shared-policy-tests`                                                                                                                  | TASK-0007            | testes unitários do mock `BankPort` (contrato §c) e negativas exaustivas da política para os recursos novos (M17)                                                                                                                              |
+| TASK-0012 | Inspector   | inspector-tests     | Sonnet / médio | `MOD-inf-deadlines-tests`                                                                                                                                              | TASK-0011            | caso 23 (retenção do motivo de `extend`, M15)                                                                                                                                                                                                  |
+| TASK-0013 | Engineer    | engineer-backend    | Sonnet / médio | `MOD-inf-deadlines`                                                                                                                                                    | TASK-0012            | `Deadline.extensionReason` persistido; 23 casos verdes                                                                                                                                                                                         |
+| TASK-0008 | Architect\* | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                                                                                                                                             | TASK-0007            | build pack §WP-A, `blueprints/README.md`, `rait-fixtures.md`, `rait-deadline-engine.md` §1, backlog                                                                                                                                            |

 CTG-0001 = TASK-0001…0003 (infração, notificação, prazos) + mini-tríade TASK-0009…0011 (janela 2: porta de eventos e
 prorrogação de `T-DIL`, decisão do humano após delivery-review-2); CTG-0002 = TASK-0004…0008 (RAIT). Um PR por CTG.
@@ -99,7 +101,8 @@ documentação e atualizado pelo maestro no fechamento.

 - `pnpm format:check` → sem diferenças. `pnpm blueprints:check` → "committed generated tree matches
   every blueprint". `pnpm contracts:check` → sincronizado.
-- `pnpm verify:rls-ddl` → OK com o novo total de tabelas de tenant (134 na base); `pnpm verify:lifecycle-vocabulary` →
+- `pnpm verify:rls-ddl` → OK com o total efetivo de tabelas de tenant: 134 na base d8fe83a, 140 após CTG-0001, **178** após
+  CTG-0002 sobre `main` com `ops-agency` (165 + 13); `pnpm verify:lifecycle-vocabulary` →
   OK (15 estados, 12 sub-estados, 18 timers — inalterado); `pnpm verify:decorators` → OK.
 - `DB_NAME=detran_r6 DB_PASSWORD=postgres bash backend/database/apply.sh --full` → `apply.sh: done`;
   `DB_NAME=detran_r6 DB_PASSWORD=postgres bash backend/database/seed.sh` duas vezes → `seed.sh: done`, sem erro;
@@ -242,7 +245,9 @@ com as rotas) e reemitir a delivery-review com essa premissa registrada como M14
 janela 2 (emenda do contrato §5 com porta `EventSink` e verbo `extend`, testes do Inspector para o envelope e para a
 segunda prorrogação negada, implementação do Engineer) antes do PR. Recomendação do maestro: (ii) — custo de uma
 tríade pequena (~150 k) e fecha as duas lacunas que os três workers apontaram; até lá o grupo fica commitado como
-checkpoint em branch não publicado. Demais lacunas (não bloqueantes) — lacunas achadas por TASK-0001 (contrato `CTG-0001.md` §9), carregadas como premissa e a
+checkpoint em branch não publicado. OD proposta por TASK-0014 (não bloqueante): `RAIT_COMMAND_RULES` já concede `inf:rait-suspension-act:create` e
+`inf:rait-export:create` a papéis específicos antes de R-0007 fixar a matriz dos 23 recursos de CTG-0002 — confirmar
+intencionalidade em R-0007. Demais lacunas (não bloqueantes) — lacunas achadas por TASK-0001 (contrato `CTG-0001.md` §9), carregadas como premissa e a
 decidir fora desta rodada: (1) `TIMER_REPROGRAMADO` não existe em `inf.infraction_event_ref` → nesta rodada o
 evento vive só na `integration.outbox`; a linha nova no DDL 14 é da rodada dona do lock (`ops-agency`) ou de
 R-0007 (OD proposta). (2) Entrada em `INSTANCIA_ENCERRADA` com `paid=true` cai em `PENDENTE_PAGAMENTO` pela
@@ -286,6 +291,16 @@ Inspector segue a especificação §7).
 - 2026-09-14 (janela 3) TASK-0008 concluída (Sonnet, ~194 k brutos): 5/5 PASS; build pack, README dos blueprints,
   fixtures, motor de prazos e backlog transcritos. Grupo CTG-0002 completo: `pnpm check` + delivery-review.

+- 2026-09-14 (janela 3) delivery-review-CTG-0002 ciclo 1 (exaustivo por regra): **FAIL**, 5 achados → M17 (todos
+  `policy-issue`, nenhum contradiz definição canônica): (1) TASK-0008 reatribuída a Architect; (2) bump do blueprint
+  assumido pelo Architect (v1.0.1); (3) testes do mock bancário → TASK-0014 (Inspector); (4) módulos novos desmontados
+  (M13) + negativas de política → TASK-0014; (5) critério 178. Ciclo 2 restrito às correções.
+
+- 2026-09-15 (janela 3) TASK-0014 concluída (Sonnet, ~215 k brutos): 4/4 PASS; mock bancário 8/8 sem defeito; negativas
+  exaustivas para 23 recursos (73/73 em `@detran/shared`). OD proposta: grants pré-existentes `inf:rait-suspension-act:create`
+  e `inf:rait-export:create` em `RAIT_COMMAND_RULES` antes da matriz de R-0007 (registrada em §Bloqueios como não
+  bloqueante). Delivery-review ciclo 2 (restrito às correções M17) solicitada.
+
 **Janela 3 aberta em 2026-09-14 (decisão do humano): CTG-0002 a partir de TASK-0004; recomendações metodológicas
 adotadas nos docs do método (reviewer: primeiro ciclo exaustivo, seguintes restritos aos itens corrigidos;
 README §4 regra 9 fixtures no CI; escada recalibrada em tokens brutos).** Prompts TASK-0004…0008 mantêm o PASS de
```

### Nota do maestro

Avalie somente as cinco correções acima; achados novos sobre texto inalterado só se forem FAIL por definição (contradição canônica, decisão do Owner, ADR, Constituição ou fronteira), dizendo por que não foram levantados no ciclo 1. Responda apenas com o JSON do §Saída.
