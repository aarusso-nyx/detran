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

### Ciclo 3 — o que mudou desde o ciclo 2 (FAIL)

| Achado do ciclo 2                     | Resposta                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| contrato §3.3 "42 linhas vigentes"    | corrigido para 43 (maestro, Architect)                                                                                                                                                                                                                                                                                       |
| `reschedule` sem `TIMER_REPROGRAMADO` | mini-tríade TASK-0009…0011 (decisão do humano, opção (ii)): porta `DeadlineEvents` obrigatória em `DeadlineEngineDeps`, `InMemoryDeadlineEvents`, `reschedule` publica `inf.timer.rescheduled` (`reason: 'suspensao'`), `sweep` publica `inf.timer.expired` uma vez por timer vencido; caso 19 e emenda do caso 12 testados  |
| sem prorrogação única de `T-DIL`      | verbo `extend(id, reason)`: só `T-DIL` (catálogo), `extensionCount` 0→1, nova data por 15 dias úteis com calendário (caso 20: 2026-12-07 → 2026-12-30), segunda → `RAIT.INQUIRY_EXTENSION_LIMIT` 422 (caso 21), timer legal → `RAIT.DEADLINE_LEGAL_READONLY` 422 (caso 22); `reason: 'prorrogacao'`, `suspensionActId: null` |

Decisão M14 (Owner, 2026-09-14): `aggregate.kind: 'clock'`; tokens de `reason` `suspensao` | `prorrogacao`; `suspensionActId` obrigatório e anulável no contrato §5.2, na tabela §2.4 de `rait-events-sse-contract.md` e no JSON Schema; espelho zod de `@detran/inf-infraction` sincronizado (4 `it` novos). Prompts da mini-tríade passaram por 5 ciclos de prompt-review; o disparo sem PASS final foi autorizado pelo humano (exceção registrada em `plan.md` §Triagem).

### Estado da entrega CTG-0001 (inalterado desde o ciclo 2, exceto o acima)

Commits no branch não publicado: `2fe9337` (checkpoint da entrega, base d8fe83a) + bookkeeping. O diff completo do grupo contra `main` tem 88 files changed, 10412 insertions(+), 15 deletions(-); o diff abaixo é **só o incremental** da mini-tríade (staging). Relatórios da tríade original: `reports/TASK-0001.md`, `TASK-0002.md`, `TASK-0003.md`; da mini-tríade: `TASK-0009.md`, `TASK-0010.md`, `TASK-0011.md` (abaixo).

Gates (maestro, após a mini-tríade, em execução paralela): `pnpm check`, `backend:test:ci`, `rls-smoke`; gates por tarefa nos relatórios (22/22, 88/88, 7/7, typecheck limpo, Prettier).

### `git diff --cached --stat` (incremental)

```
 backend/domains/inf/deadlines/src/engine.ts        | 117 +++++++++-
 backend/domains/inf/deadlines/src/events.ts        |  17 ++
 backend/domains/inf/deadlines/src/index.ts         |   5 +
 backend/domains/inf/deadlines/src/types.ts         |  63 ++++++
 .../deadlines/tests/unit/deadline-engine.spec.ts   | 248 ++++++++++++++++++++-
 .../inf/infraction/src/handwritten/events.ts       |  10 +-
 .../infraction/tests/unit/events.schema.spec.ts    |  66 +++++-
 docs/framework/arch/rait-events-sse-contract.md    |   4 +-
 .../events/inf.timer.rescheduled.schema.json       |  14 +-
 work/rounds/R-0006/budget.json                     |  33 ++-
 work/rounds/R-0006/contracts/CTG-0001.md           | 227 +++++++++++++++++++
 work/rounds/R-0006/plan.md                         |   3 +
 work/rounds/R-0006/tasks/TASK-0009.json            |   4 +-
 work/rounds/R-0006/tasks/TASK-0010.json            |   4 +-
 work/rounds/R-0006/tasks/TASK-0011.json            |   4 +-
 15 files changed, 794 insertions(+), 25 deletions(-)
```

### Relatórios da mini-tríade

#### `work/rounds/R-0006/reports/TASK-0009.md`

Papel: Architect (Art. 6)
Tarefa: TASK-0009
Arquivos criados/alterados: `work/rounds/R-0006/contracts/CTG-0001.md` (seção 5.2 "Emenda (janela 2): porta de eventos e prorrogação" ao fim do §5; item 8 no §9 — só acréscimos); `docs/framework/schemas/events/inf.timer.rescheduled.schema.json` (`data.reason` obrigatório, enum `suspensao`/`prorrogacao`; `suspensionActId` obrigatório `["string","null"]`); `docs/framework/arch/rait-events-sse-contract.md` (só a linha de `inf.timer.rescheduled` em §2.4 e `updated`).
Comandos executados e saída resumida: contagem de dias úteis sobre `calendar-2026.json` → 09,10,11,14,15,16,17,18,21,22,23,24,28,29,30/12 → `due 2026-12-30` (caso 4 reproduzido); prettier --check OK; `JSON.parse` do esquema ok; `grep -c '### 5.2'` = 1; `inf-deadlines test` 18 passed; `pnpm check` exit 0; diff contra cópias de referência só com as alterações previstas; `T-DIL` é o único timer prorrogável no catálogo.
Critérios de aceitação: 5/5 PASS (§5.2 contém `DeadlineEvents`/`DeadlineEvent`/`TimerRescheduledData`/`TimerExpiredData` com `aggregate.kind: 'clock'`, `InMemoryDeadlineEvents`, `extend(id, reason)`, `RAIT.DEADLINE_LEGAL_READONLY` 422 `{ timerCode }`, `RAIT.INQUIRY_EXTENSION_LIMIT` 422 `{ ownerId, timerCode, extensionCount }`, `RAIT.INTERNAL` 500 para timer não armado; caso 19: `oldDueOn 2026-12-07`/`newDueOn 2026-12-22`/`reason 'suspensao'`; caso 20: `rawDueOn = dueOn = 2026-12-30`, `extensionCount 1`, `reason 'prorrogacao'`; caso 21/22; emenda do caso 12).
Fora do escopo / deixado: código e testes (TASK-0010/0011); espelho zod da infração registrado em §5.2 como tarefa de TASK-0010/0011; `rait-error-catalog.md` não tocado (`context` de `RAIT.INQUIRY_EXTENSION_LIMIT` divergente — TASK-0008, §9 item 4); `inf.timer.expired.schema.json` inalterado; linha de `inf.timer.expired` em §2.4 tem pipes não escapados (defeito preexistente, fora da fronteira).
OD tocadas ou propostas: nenhuma existente tocada. Propostas: (1) `context` de `RAIT.INQUIRY_EXTENSION_LIMIT` — biblioteca emite `{ ownerId, timerCode, extensionCount }`, comando de R-0007 acrescenta `inquiryId`; (2) `TIMER_REPROGRAMADO` segue ausente de `inf.infraction_event_ref` (só outbox).
Bloqueios: nenhum.

#### `work/rounds/R-0006/reports/TASK-0010.md`

Papel: Inspector (Art. 6)
Tarefa: TASK-0010
Arquivos criados/alterados: `backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts` (import `InMemoryDeadlineEvents`; `makeEngine` e as instanciações dos casos 7/17 passam `events`; helpers `loadDataSchema`/`dataSchemaProblems`; emenda do caso 12 sobre `events.published`; casos 19–22); `backend/domains/inf/infraction/tests/unit/events.schema.spec.ts` (exemplo de `inf.timer.rescheduled` com `reason: 'suspensao'`; `describe` da emenda §5.2 com 4 `it`: aceita `suspensionActId` nulo + `reason 'prorrogacao'`; rejeita sem `reason`; rejeita `reason` fora do enum; rejeita sem `suspensionActId`).
Comandos executados e saída resumida: prettier --check (deadlines/tests, events.schema.spec.ts) OK; `inf-deadlines test` 22 testes, 22 falham com causa única `InMemoryDeadlineEvents is not a constructor` em `makeEngine`; `inf-infraction test:unit` 88 testes, 85 passam, 3 falham (grupo `inf.timer.rescheduled`: `reason` unrecognized, `suspensionActId` não aceita null); `inf-deadlines typecheck` TS2305/TS2339/TS2353 (símbolos de TASK-0011); `inf-infraction typecheck` limpo.
Critérios de aceitação: prettier PASS; contagem 22 e causa única PASS; infraction unit só os `it` de `inf.timer.rescheduled` falham (85 passam) PASS; matriz PASS.
Matriz caso → teste → resultado: 1–18 FAIL (fábrica quebra por símbolo ausente; asserções intactas); 19 FAIL; 20 FAIL; 21 FAIL; 22 FAIL; 12-emenda FAIL (mesma causa); espelho infração: aceitação com `reason` FAIL; nulo + `prorrogacao` FAIL; sem `reason` FAIL (zod ainda aceita a ausência); `reason` fora do enum PASS (coincidente por `unrecognized_keys`); sem `suspensionActId` PASS (zod já exige); sincronização com o JSON Schema PASS.
Fora do escopo / deixado: casos 19–22 mantidos em `deadline-engine.spec.ts` (sem arquivo separado); `pnpm check` não fica verde para `inf-deadlines` até TASK-0011 (mesma causa única); divergência de `context` de `RAIT.INQUIRY_EXTENSION_LIMIT` no catálogo (TASK-0008).
OD tocadas ou propostas: nenhuma.
Bloqueios: nenhum.

#### `work/rounds/R-0006/reports/TASK-0011.md`

Papel: Engineer (Art. 6)
Tarefa: TASK-0011
Arquivos criados/alterados: `backend/domains/inf/deadlines/src/types.ts` (`TimerRescheduledData`, `TimerExpiredData`, `DeadlineEvent`, `DeadlineEvents`; `extend` em `DeadlineEngine`); `backend/domains/inf/deadlines/src/events.ts` (novo — `InMemoryDeadlineEvents`); `backend/domains/inf/deadlines/src/index.ts` (exports novos); `backend/domains/inf/deadlines/src/engine.ts` (`events` obrigatório em `DeadlineEngineDeps`; `reschedule` publica `inf.timer.rescheduled` `reason:'suspensao'`; `sweep` publica `inf.timer.expired` só para os itens efetivamente vencidos; `extend` com as três guardas na ordem do contrato); `backend/domains/inf/infraction/src/handwritten/events.ts` (esquema zod de `inf.timer.rescheduled`: `suspensionActId` anulável, `reason` obrigatório `suspensao`/`prorrogacao`).
Comandos executados e saída resumida: `inf-deadlines typecheck` sem erros; `inf-deadlines test` 22 passed; `inf-infraction typecheck` e `inf-notification typecheck` sem erros; `inf-infraction test:unit` 88 passed; `inf-notification test:unit` 7 passed; `pnpm format:check` OK.
Critérios de aceitação: 5/5 PASS (contagem real da infração é 88, não os 84 do prompt — TASK-0010 acrescentou 4 `it`; nenhum teste alterado pelo Engineer).
Fora do escopo / deixado: nada fora da fronteira; `context` de `RAIT.INQUIRY_EXTENSION_LIMIT` no catálogo (TASK-0008); `TIMER_REPROGRAMADO` ausente de `inf.infraction_event_ref` (lacuna registrada).
OD tocadas ou propostas: nenhuma.
Bloqueios: nenhum. Um `git status --porcelain` executado (leitura pura), registrado.

### Diff incremental completo (10 arquivos)

````diff
diff --git a/backend/domains/inf/deadlines/src/engine.ts b/backend/domains/inf/deadlines/src/engine.ts
index c7cf81c..469427e 100644
--- a/backend/domains/inf/deadlines/src/engine.ts
+++ b/backend/domains/inf/deadlines/src/engine.ts
@@ -16,6 +16,7 @@ import type {
   Clock,
   Deadline,
   DeadlineEngine,
+  DeadlineEvents,
   ExpiryEffect,
   ExpiryKind,
   LocalDate,
@@ -26,6 +27,7 @@ import type {
   TimerCatalog,
   TimerCode,
   TimerDefinition,
+  TimerRescheduledData,
   TimerStore,
 } from './types.js';

@@ -50,11 +52,22 @@ const SUSPENSION_FORBIDDEN: ReadonlySet<TimerCode> = new Set([
   'T-PRESC-5A',
 ]);

+/**
+ * Timers prorrogáveis (CTG-0001 §5.2, emenda janela 2): só `T-DIL` — nenhum
+ * dos outros 17 códigos declara prorrogação em `inf.infraction_timer_ref`.
+ */
+const EXTENDABLE: ReadonlySet<TimerCode> = new Set(['T-DIL']);
+
 export interface DeadlineEngineDeps {
   clock: Clock;
   calendar: Calendar;
   catalog: TimerCatalog;
   store: TimerStore;
+  /**
+   * Porta de publicação de `DeadlineEvent` (CTG-0001 §5.2, emenda janela 2):
+   * obrigatória — a biblioteca nunca engole erro de publicação.
+   */
+  events: DeadlineEvents;
   /**
    * Fuso do tenant para `clock.today()` (`auth.tenants.timezone`,
    * rait-deadline-engine.md §5). Omitido, o relógio injetado responde com o seu
@@ -86,6 +99,7 @@ class Engine implements DeadlineEngine {
   private readonly calendar: Calendar;
   private readonly catalog: TimerCatalog;
   private readonly store: TimerStore;
+  private readonly events: DeadlineEvents;
   private readonly tenantTz: string;

   constructor(deps: DeadlineEngineDeps) {
@@ -93,9 +107,25 @@ class Engine implements DeadlineEngine {
     this.calendar = deps.calendar;
     this.catalog = deps.catalog;
     this.store = deps.store;
+    this.events = deps.events;
     this.tenantTz = deps.tenantTz ?? '';
   }

+  /** `occurredAt` de `clock.now()` em ISO-8601 (CTG-0001 §5.2 nota 5). */
+  private async publishRescheduled(
+    deadline: Deadline,
+    data: TimerRescheduledData,
+  ): Promise<void> {
+    await this.events.publish({
+      type: 'inf.timer.rescheduled',
+      domainEvent: 'TIMER_REPROGRAMADO',
+      occurredAt: this.clock.now().toISOString(),
+      tenantId: deadline.tenantId,
+      aggregate: { kind: 'clock', id: deadline.id },
+      data,
+    });
+  }
+
   /** Soma `days` dias úteis ao marco (o dia do marco não conta). */
   private async addBusinessDays(
     startOn: LocalDate,
@@ -305,13 +335,84 @@ class Engine implements DeadlineEngine {
       definition.durationUnit === 'data_impressa'
         ? addCalendarDays(rawDueOn, suspendedDays)
         : rawDueOn;
-    return this.store.update({
+    const oldDueOn = deadline.dueOn;
+    const updated = await this.store.update({
       ...deadline,
       rawDueOn,
       dueOn: await this.roundForward(base, deadline.tenantId),
       suspendedDays,
       suspendedByActId: act.id,
     });
+    await this.publishRescheduled(updated, {
+      ownerId: updated.ownerId,
+      timerCode: updated.code,
+      oldDueOn,
+      newDueOn: updated.dueOn,
+      suspensionActId: act.id,
+      reason: 'suspensao',
+    });
+    return updated;
+  }
+
+  /**
+   * Prorrogação única de `T-DIL` (CTG-0001 §5.2, emenda janela 2). Guardas,
+   * nesta ordem: código não prorrogável, timer não armado, segunda
+   * prorrogação. `reason` é o motivo do chamador para auditoria (como em
+   * `satisfy`/`cancel`) — a biblioteca não tem coluna para ele; o `reason` do
+   * evento publicado é sempre `'prorrogacao'`.
+   */
+  async extend(id: string, _reason: string): Promise<Deadline> {
+    const deadline = await this.open(id);
+    if (!EXTENDABLE.has(deadline.code)) {
+      throw new DeadlineError('RAIT.DEADLINE_LEGAL_READONLY', {
+        status: 422,
+        context: { timerCode: deadline.code },
+        message: 'Tentativa de editar prazo legal ou marco de ciência.',
+      });
+    }
+    if (deadline.status !== 'armado') {
+      throw internal('Só um timer armado pode ser prorrogado.', {
+        deadlineId: id,
+        status: deadline.status,
+      });
+    }
+    if (deadline.extensionCount >= 1) {
+      throw new DeadlineError('RAIT.INQUIRY_EXTENSION_LIMIT', {
+        status: 422,
+        context: {
+          ownerId: deadline.ownerId,
+          timerCode: deadline.code,
+          extensionCount: deadline.extensionCount,
+        },
+        message: 'A prorrogação é única (extension_count <= 1).',
+      });
+    }
+    const definition = this.catalog.get(deadline.code);
+    // Mesma duração/unidade da definição, contada do due_on vigente (o marco
+    // da soma é o vencimento, não o started_on — CTG-0001 §5.2, "mesmo prazo").
+    const rawDueOn = await this.rawDueFor(
+      definition,
+      deadline.dueOn,
+      definition.durationValue ?? 0,
+      deadline.tenantId,
+    );
+    const oldDueOn = deadline.dueOn;
+    const newDueOn = await this.roundForward(rawDueOn, deadline.tenantId);
+    const updated = await this.store.update({
+      ...deadline,
+      rawDueOn,
+      dueOn: newDueOn,
+      extensionCount: deadline.extensionCount + 1,
+    });
+    await this.publishRescheduled(updated, {
+      ownerId: updated.ownerId,
+      timerCode: updated.code,
+      oldDueOn,
+      newDueOn,
+      suspensionActId: null,
+      reason: 'prorrogacao',
+    });
+    return updated;
   }

   async timeliness(input: TimelinessInput): Promise<TimelinessResult> {
@@ -356,6 +457,20 @@ class Engine implements DeadlineEngine {
         status: 'vencido',
         expiredAt: this.clock.now(),
       });
+      await this.events.publish({
+        type: 'inf.timer.expired',
+        domainEvent: 'TIMER_VENCIDO',
+        occurredAt: this.clock.now().toISOString(),
+        tenantId: deadline.tenantId,
+        aggregate: { kind: 'clock', id: deadline.id },
+        data: {
+          ownerKind: deadline.ownerKind,
+          ownerId: deadline.ownerId,
+          timerCode: deadline.code,
+          dueOn: deadline.dueOn,
+          effect: kind,
+        },
+      });
       expired.push({
         id: deadline.id,
         code: deadline.code,
diff --git a/backend/domains/inf/deadlines/src/events.ts b/backend/domains/inf/deadlines/src/events.ts
new file mode 100644
index 0000000..47c2080
--- /dev/null
+++ b/backend/domains/inf/deadlines/src/events.ts
@@ -0,0 +1,17 @@
+// Porta de eventos do motor de prazos (work/rounds/R-0006/contracts/CTG-0001.md
+// §5.2, emenda janela 2): quem consome a biblioteca injeta `DeadlineEvents`;
+// esta rodada só tem a implementação em memória (sem outbox — R-0007 grava na
+// mesma transação do comando). `published` preserva a ordem de publicação.
+import type { DeadlineEvent, DeadlineEvents } from './types.js';
+
+export class InMemoryDeadlineEvents implements DeadlineEvents {
+  private readonly rows: DeadlineEvent[] = [];
+
+  get published(): readonly DeadlineEvent[] {
+    return this.rows;
+  }
+
+  async publish(event: DeadlineEvent): Promise<void> {
+    this.rows.push(event);
+  }
+}
diff --git a/backend/domains/inf/deadlines/src/index.ts b/backend/domains/inf/deadlines/src/index.ts
index 71821ae..4043cb8 100644
--- a/backend/domains/inf/deadlines/src/index.ts
+++ b/backend/domains/inf/deadlines/src/index.ts
@@ -8,6 +8,7 @@ export { createDeadlineEngine } from './engine.js';
 export type { DeadlineEngineDeps } from './engine.js';
 export { DeadlineError } from './errors.js';
 export type { DeadlineErrorOptions } from './errors.js';
+export { InMemoryDeadlineEvents } from './events.js';
 export {
   addCalendarDays,
   addCalendarMonths,
@@ -27,6 +28,8 @@ export type {
   Clock,
   Deadline,
   DeadlineEngine,
+  DeadlineEvent,
+  DeadlineEvents,
   ExpiryEffect,
   ExpiryKind,
   LocalDate,
@@ -38,7 +41,9 @@ export type {
   TimerCode,
   TimerDefinition,
   TimerDurationUnit,
+  TimerExpiredData,
   TimerOwnerKind,
+  TimerRescheduledData,
   TimerStatus,
   TimerStore,
 } from './types.js';
diff --git a/backend/domains/inf/deadlines/src/types.ts b/backend/domains/inf/deadlines/src/types.ts
index 2a38fde..c3e5243 100644
--- a/backend/domains/inf/deadlines/src/types.ts
+++ b/backend/domains/inf/deadlines/src/types.ts
@@ -169,6 +169,12 @@ export interface DeadlineEngine {
   satisfy(id: string, reason: string): Promise<void>;
   cancel(id: string, reason: string): Promise<void>;
   reschedule(id: string, act: SuspensionAct): Promise<Deadline>;
+  /**
+   * Prorrogação única de `T-DIL` (CTG-0001 §5.2, emenda janela 2): `reason` é
+   * o motivo do chamador para auditoria, como em `satisfy`/`cancel` — nunca o
+   * token do evento publicado (que é sempre `'prorrogacao'`).
+   */
+  extend(id: string, reason: string): Promise<Deadline>;
   computeDue(
     code: TimerCode,
     startOn: LocalDate,
@@ -179,6 +185,63 @@ export interface DeadlineEngine {
   timeliness(input: TimelinessInput): Promise<TimelinessResult>;
 }

+/**
+ * `data` de `inf.timer.rescheduled` (CTG-0001 §5.2, emenda janela 2):
+ * `suspensionActId` é obrigatório e anulável (o ato existe na suspensão, é
+ * nulo na prorrogação); `reason` distingue as duas origens.
+ */
+// `extends Record<string, unknown>` dá às duas interfaces uma assinatura de
+// índice: é o que permite ao Inspector conferir `data` contra o esquema JSON
+// com `as Record<string, unknown>` (deadline-engine.spec.ts), sem afrouxar os
+// campos declarados (todos são subtipos de `unknown`).
+export interface TimerRescheduledData extends Record<string, unknown> {
+  ownerId: string;
+  timerCode: TimerCode;
+  oldDueOn: LocalDate;
+  newDueOn: LocalDate;
+  suspensionActId: string | null;
+  reason: 'suspensao' | 'prorrogacao';
+}
+
+/** `data` de `inf.timer.expired` — um por timer que a varredura vence. */
+export interface TimerExpiredData extends Record<string, unknown> {
+  ownerKind: TimerOwnerKind;
+  ownerId: string;
+  timerCode: TimerCode;
+  dueOn: LocalDate;
+  effect: ExpiryEffect;
+}
+
+/**
+ * Envelope reduzido ao que a biblioteca conhece (CTG-0001 §5.2 nota 1): os
+ * campos que só quem grava na `integration.outbox` sabe preencher (`id`,
+ * `version`, `actor`, `correlationId`, `causationId`, `aggregate.version`)
+ * ficam fora. `aggregate.kind` é `'clock'` — o agregado do evento é o
+ * relógio, não a infração/caso (nota 2 do §5.2).
+ */
+export type DeadlineEvent =
+  | {
+      type: 'inf.timer.rescheduled';
+      domainEvent: 'TIMER_REPROGRAMADO';
+      occurredAt: string;
+      tenantId: string;
+      aggregate: { kind: 'clock'; id: string };
+      data: TimerRescheduledData;
+    }
+  | {
+      type: 'inf.timer.expired';
+      domainEvent: 'TIMER_VENCIDO';
+      occurredAt: string;
+      tenantId: string;
+      aggregate: { kind: 'clock'; id: string };
+      data: TimerExpiredData;
+    };
+
+/** Porta de eventos do motor (CTG-0001 §5.2): obrigatória em `DeadlineEngineDeps`. */
+export interface DeadlineEvents {
+  publish(event: DeadlineEvent): Promise<void>;
+}
+
 /**
  * Forma de `docs/framework/arch/fixtures/calendar-2026.json`: feriados são as
  * chaves de `national`, `am` e `manaus`; `optional` (ponto facultativo) não é
diff --git a/backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts b/backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts
index 5dac36c..a91a43d 100644
--- a/backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts
+++ b/backend/domains/inf/deadlines/tests/unit/deadline-engine.spec.ts
@@ -13,6 +13,7 @@ import {
   DeadlineError,
   FixedClock,
   InMemoryCalendar,
+  InMemoryDeadlineEvents,
   InMemoryTimerStore,
   StaticTimerCatalog,
 } from '../../src/index.js';
@@ -41,17 +42,69 @@ const CASE_08 = '00000000-0000-7000-8000-000010000008';
 // explícito de pendência, nunca um id canônico inventado.
 const SUSPENSION_ACT_ID = '00000000-0000-0000-0000-000000000000';

+// Confere `data` do evento contra a porção `data` do esquema JSON, sem ajv —
+// mesmo método de events.schema.spec.ts da infração (presença de `required`,
+// pertinência a `enum`, ausência de chave fora de `properties`). A emenda do
+// §5.2 nota 1 reduz o envelope ao subconjunto que a biblioteca conhece
+// (sem `id`/`version`/`actor`/`correlationId`/`aggregate.version`), por isso só
+// `data` é conferido, nunca o envelope inteiro.
+interface DataSchema {
+  required?: string[];
+  properties?: Record<string, { enum?: unknown[] }>;
+}
+
+function loadDataSchema(
+  type: 'inf.timer.rescheduled' | 'inf.timer.expired',
+): DataSchema {
+  const schema = JSON.parse(
+    readFileSync(
+      fileURLToPath(
+        new URL(
+          `../../../../../../docs/framework/schemas/events/${type}.schema.json`,
+          import.meta.url,
+        ),
+      ),
+      'utf8',
+    ),
+  ) as { properties: { data: DataSchema } };
+  return schema.properties.data;
+}
+
+function dataSchemaProblems(
+  schema: DataSchema,
+  value: Record<string, unknown>,
+): string[] {
+  const problems: string[] = [];
+  for (const key of schema.required ?? []) {
+    if (!(key in value)) problems.push(`data/${key}: obrigatório ausente`);
+  }
+  for (const key of Object.keys(value)) {
+    const child = schema.properties?.[key];
+    if (!child) {
+      problems.push(`data/${key}: chave fora de properties`);
+      continue;
+    }
+    if (child.enum && !child.enum.includes(value[key] as never)) {
+      problems.push(`data/${key}: ${String(value[key])} fora do enum`);
+    }
+  }
+  return problems;
+}
+
 function makeEngine(today: string = TODAY) {
   const clock = new FixedClock(today, TENANT_TZ);
   const calendar = new InMemoryCalendar(calendar2026);
   const catalog = new StaticTimerCatalog();
   const store = new InMemoryTimerStore();
+  // Emenda CTG-0001 §5.2: `events` é obrigatória em `DeadlineEngineDeps`.
+  const events = new InMemoryDeadlineEvents();
   return {
     clock,
     calendar,
     catalog,
     store,
-    engine: createDeadlineEngine({ clock, calendar, catalog, store }),
+    events,
+    engine: createDeadlineEngine({ clock, calendar, catalog, store, events }),
   };
 }

@@ -141,7 +194,7 @@ describe('motor de prazos (@detran/inf-deadlines) — casos §7', () => {
   });

   it('dada NA por SNE disponibilizada 2026-09-14 sem leitura quando a varredura alcança T-SNE-CIENCIA então a ciência ficta é 2026-10-14 com efeito marco e T-DEF conta dela (caso 7)', async () => {
-    const { engine, store, clock, calendar, catalog } = makeEngine();
+    const { engine, store, clock, calendar, catalog, events } = makeEngine();

     const ficta = await engine.arm({
       ownerKind: 'infraction',
@@ -163,6 +216,7 @@ describe('motor de prazos (@detran/inf-deadlines) — casos §7', () => {
       calendar,
       catalog,
       store,
+      events,
     });
     const report = await sweepEngine.sweep(TENANT);

@@ -298,7 +352,7 @@ describe('motor de prazos (@detran/inf-deadlines) — casos §7', () => {
   });

   it('dado T-NA da infração …0010 vencido em 2026-08-05 quando a varredura roda duas vezes então há uma transição e um TIMER_VENCIDO (caso 12)', async () => {
-    const { engine, store } = makeEngine();
+    const { engine, store, events } = makeEngine();

     const deadline = await engine.arm({
       ownerKind: 'infraction',
@@ -330,6 +384,27 @@ describe('motor de prazos (@detran/inf-deadlines) — casos §7', () => {

     const expiredTwice = await store.findById(deadline.id);
     expect(expiredTwice?.expiredAt).toEqual(expiredOnce?.expiredAt);
+
+    // Emenda CTG-0001 §5.2: a porta tem exatamente um `inf.timer.expired` para
+    // este timer — a segunda varredura não publica de novo (nota 3 do §5.2).
+    expect(events.published).toHaveLength(1);
+    const [published] = events.published;
+    expect(published).toMatchObject({
+      type: 'inf.timer.expired',
+      domainEvent: 'TIMER_VENCIDO',
+      aggregate: { kind: 'clock', id: deadline.id },
+    });
+    const expiredData = published.data as Record<string, unknown>;
+    expect(expiredData).toMatchObject({
+      ownerKind: 'infraction',
+      ownerId: infraction('0010'),
+      timerCode: 'T-NA',
+      dueOn: '2026-08-05',
+      effect: 'transicao',
+    });
+    expect(
+      dataSchemaProblems(loadDataSchema('inf.timer.expired'), expiredData),
+    ).toEqual([]);
   });

   it('dado T-PAR-3A armado em 2026-06-18 quando há movimentação em 2027-01-10 então o relógio reinicia com due_on 2030-01-10 (caso 13)', async () => {
@@ -451,7 +526,7 @@ describe('motor de prazos (@detran/inf-deadlines) — casos §7', () => {
   });

   it('dado T-DEC de 180 dias sobre o cometimento 2026-06-15 quando a defesa é admitida tempestiva então due_on passa para 360 dias do cometimento (caso 17)', async () => {
-    const { engine, clock, calendar, store, catalog } = makeEngine();
+    const { engine, clock, calendar, store, catalog, events } = makeEngine();

     const at180 = await engine.computeDue('T-DEC', '2026-06-15', TENANT);
     expect(at180).toEqual({ rawDueOn: '2026-12-12', dueOn: '2026-12-14' });
@@ -467,6 +542,7 @@ describe('motor de prazos (@detran/inf-deadlines) — casos §7', () => {
       calendar,
       catalog: extendedCatalog,
       store,
+      events,
     });

     const at360 = await extended.computeDue('T-DEC', '2026-06-15', TENANT);
@@ -499,4 +575,168 @@ describe('motor de prazos (@detran/inf-deadlines) — casos §7', () => {
     expect(unchanged?.rawDueOn).toBe('2026-10-31');
     expect(unchanged?.dueOn).toBe('2026-11-03');
   });
+
+  // Emenda CTG-0001 §5.2 (janela 2, decisão M14): porta de eventos
+  // `DeadlineEvents` e verbo `extend` (prorrogação única de T-DIL).
+  it('dado T-DIL armado em 2026-11-13 quando um ato de suspensão o reprograma então a porta publica exatamente um inf.timer.rescheduled com reason suspensao válido contra o esquema (caso 19)', async () => {
+    const { engine, events } = makeEngine();
+
+    const deadline = await engine.arm({
+      ownerKind: 'case',
+      ownerId: CASE_08,
+      code: 'T-DIL',
+      startOn: '2026-11-13',
+      startBasis: 'abertura da diligência',
+      legalBasis: 'Res. 900/2022 art. 9º p.ú.; RN-RAIT-004',
+      tenantId: TENANT,
+    });
+    expect(deadline.dueOn).toBe('2026-12-07');
+
+    const rescheduled = await engine.reschedule(deadline.id, {
+      id: SUSPENSION_ACT_ID,
+      days: 10,
+      evidenceRef: 'ato de suspensão por força maior (fixture)',
+      signedAt: new Date('2026-11-20T12:00:00-04:00'),
+    });
+    expect(rescheduled.dueOn).toBe('2026-12-22');
+
+    expect(events.published).toHaveLength(1);
+    const [published] = events.published;
+    expect(published).toMatchObject({
+      type: 'inf.timer.rescheduled',
+      domainEvent: 'TIMER_REPROGRAMADO',
+      aggregate: { kind: 'clock', id: deadline.id },
+    });
+    const rescheduledData = published.data as Record<string, unknown>;
+    expect(rescheduledData).toMatchObject({
+      ownerId: CASE_08,
+      timerCode: 'T-DIL',
+      oldDueOn: '2026-12-07',
+      newDueOn: '2026-12-22',
+      suspensionActId: SUSPENSION_ACT_ID,
+      reason: 'suspensao',
+    });
+    expect(
+      dataSchemaProblems(
+        loadDataSchema('inf.timer.rescheduled'),
+        rescheduledData,
+      ),
+    ).toEqual([]);
+  });
+
+  it('dado T-DIL armado em 2026-11-13 quando extend então prorroga 15 dias úteis do vencimento, extensionCount vira 1 e a porta publica um inf.timer.rescheduled com reason prorrogacao e suspensionActId nulo (caso 20)', async () => {
+    const { engine, events } = makeEngine();
+
+    const deadline = await engine.arm({
+      ownerKind: 'case',
+      ownerId: CASE_08,
+      code: 'T-DIL',
+      startOn: '2026-11-13',
+      startBasis: 'abertura da diligência',
+      legalBasis: 'Res. 900/2022 art. 9º p.ú.; RN-RAIT-004',
+      tenantId: TENANT,
+    });
+    expect(deadline.dueOn).toBe('2026-12-07');
+
+    const extended = await engine.extend(
+      deadline.id,
+      'prorrogação decidida em despacho da diligência (fixture)',
+    );
+
+    // 15 dias úteis de 2026-12-07 (o marco não conta), pulando 08/12 (Manaus)
+    // e 25/12 (Natal) e contando 24/12 (ponto facultativo municipal, não é
+    // feriado — nota 3 do §5): 30/12 é quarta-feira e dia útil, sem
+    // arredondamento (CTG-0001 §5.2, conta verificada contra calendar-2026.json).
+    expect(extended.rawDueOn).toBe('2026-12-30');
+    expect(extended.dueOn).toBe('2026-12-30');
+    expect(extended.extensionCount).toBe(1);
+    expect(extended.suspendedDays).toBe(0);
+    expect(extended.suspendedByActId).toBeNull();
+
+    expect(events.published).toHaveLength(1);
+    const [published] = events.published;
+    expect(published).toMatchObject({
+      type: 'inf.timer.rescheduled',
+      domainEvent: 'TIMER_REPROGRAMADO',
+      aggregate: { kind: 'clock', id: deadline.id },
+    });
+    expect(published.data as Record<string, unknown>).toMatchObject({
+      ownerId: CASE_08,
+      timerCode: 'T-DIL',
+      oldDueOn: '2026-12-07',
+      newDueOn: '2026-12-30',
+      suspensionActId: null,
+      reason: 'prorrogacao',
+    });
+  });
+
+  it('dado T-DIL já prorrogado uma vez quando extend é chamado de novo então RAIT.INQUIRY_EXTENSION_LIMIT 422 sem gravar nem publicar evento novo (caso 21)', async () => {
+    const { engine, events, store } = makeEngine();
+
+    const deadline = await engine.arm({
+      ownerKind: 'case',
+      ownerId: CASE_08,
+      code: 'T-DIL',
+      startOn: '2026-11-13',
+      startBasis: 'abertura da diligência',
+      legalBasis: 'Res. 900/2022 art. 9º p.ú.; RN-RAIT-004',
+      tenantId: TENANT,
+    });
+    await engine.extend(
+      deadline.id,
+      'prorrogação decidida em despacho da diligência (fixture)',
+    );
+    expect(events.published).toHaveLength(1);
+
+    const secondExtend = engine.extend(
+      deadline.id,
+      'segunda tentativa de prorrogação (fixture)',
+    );
+
+    await expect(secondExtend).rejects.toBeInstanceOf(DeadlineError);
+    await expect(secondExtend).rejects.toMatchObject({
+      code: 'RAIT.INQUIRY_EXTENSION_LIMIT',
+      status: 422,
+      context: {
+        ownerId: CASE_08,
+        timerCode: 'T-DIL',
+        extensionCount: 1,
+      },
+    });
+
+    // Nenhum evento novo e nenhuma gravação (nota 3 do verbo `extend`, §5.2):
+    // dueOn e extensionCount seguem no valor do primeiro extend.
+    expect(events.published).toHaveLength(1);
+    const stillOnce = await store.findById(deadline.id);
+    expect(stillOnce?.dueOn).toBe('2026-12-30');
+    expect(stillOnce?.extensionCount).toBe(1);
+  });
+
+  it('dado T-DEC armado quando extend é chamado então RAIT.DEADLINE_LEGAL_READONLY 422 sem publicar evento (caso 22)', async () => {
+    const { engine, events } = makeEngine();
+
+    const deadline = await engine.arm({
+      ownerKind: 'infraction',
+      ownerId: infraction('0001'),
+      code: 'T-DEC',
+      startOn: '2026-09-01',
+      startBasis: 'cometimento; 360 dias se defesa tempestiva',
+      legalBasis:
+        'CTB art. 282 §§6º-7º; Res. 918/2022 art. 9º §§2º-3º; RN-RAIT-114',
+      tenantId: TENANT,
+    });
+
+    const extending = engine.extend(
+      deadline.id,
+      'tentativa indevida (fixture)',
+    );
+
+    await expect(extending).rejects.toBeInstanceOf(DeadlineError);
+    await expect(extending).rejects.toMatchObject({
+      code: 'RAIT.DEADLINE_LEGAL_READONLY',
+      status: 422,
+      context: { timerCode: 'T-DEC' },
+    });
+    expect(events.published).toHaveLength(0);
+  });
 });
diff --git a/backend/domains/inf/infraction/src/handwritten/events.ts b/backend/domains/inf/infraction/src/handwritten/events.ts
index 99d77ca..85ae6cd 100644
--- a/backend/domains/inf/infraction/src/handwritten/events.ts
+++ b/backend/domains/inf/infraction/src/handwritten/events.ts
@@ -202,8 +202,14 @@ const timerRescheduled = envelope(
     timerCode: z.enum(TIMER_CODES),
     oldDueOn: z.iso.date(),
     newDueOn: z.iso.date(),
-    // inf.rait_suspension_act (DDL 39); referência sem FK (M5).
-    suspensionActId: z.uuid(),
+    // inf.rait_suspension_act (DDL 39); referência sem FK (M5). Obrigatório e
+    // anulável: o ato existe na suspensão e é nulo na prorrogação (CTG-0001
+    // §5.2, emenda decisão M14).
+    suspensionActId: z.uuid().nullable(),
+    // Origem da reprogramação: suspensão por ato ou prorrogação única de
+    // T-DIL; tokens em português fixados pelo Owner em 2026-09-14 (decisão
+    // M14, work/rounds/R-0006/plan.md).
+    reason: z.enum(['suspensao', 'prorrogacao']),
   }),
 );

diff --git a/backend/domains/inf/infraction/tests/unit/events.schema.spec.ts b/backend/domains/inf/infraction/tests/unit/events.schema.spec.ts
index 57627b2..8136752 100644
--- a/backend/domains/inf/infraction/tests/unit/events.schema.spec.ts
+++ b/backend/domains/inf/infraction/tests/unit/events.schema.spec.ts
@@ -188,7 +188,8 @@ const EXAMPLES: Record<
     outOfVocabulary: ['effect', 'indicador'],
   },
   // Caso 10 de CTG-0001 §5.1: T-DIL do caso RAIT 08 reprogramado por ato de
-  // suspensão de 10 dias úteis (2026-12-07 → 2026-12-22).
+  // suspensão de 10 dias úteis (2026-12-07 → 2026-12-22). `reason` e a
+  // anulabilidade de `suspensionActId` são a emenda §5.2 (decisão M14).
   'inf.timer.rescheduled': {
     example: envelope(
       'inf.timer.rescheduled',
@@ -201,6 +202,7 @@ const EXAMPLES: Record<
         oldDueOn: '2026-12-07',
         newDueOn: '2026-12-22',
         suspensionActId: PENDING_ID,
+        reason: 'suspensao',
       },
     ),
     missing: 'newDueOn',
@@ -250,4 +252,66 @@ describe('esquemas dos eventos publicados do agregado (§2.4)', () => {
       });
     });
   }
+
+  // Emenda CTG-0001 §5.2 (decisão M14): `reason` obrigatório
+  // (`suspensao`/`prorrogacao`) e `suspensionActId` obrigatório e anulável —
+  // nulo só na prorrogação, ausência sempre rejeitada. O espelho zod de
+  // `inf.timer.rescheduled` ainda não conhece `reason` nem aceita
+  // `suspensionActId` nulo (TASK-0011); estes `it` ficam vermelhos até lá.
+  describe('inf.timer.rescheduled — emenda §5.2 (reason e suspensionActId anulável)', () => {
+    const rescheduledExample = EXAMPLES['inf.timer.rescheduled'].example;
+
+    it('dado um envelope de inf.timer.rescheduled com suspensionActId nulo e reason prorrogacao (caso 20) quando parse então é aceito', () => {
+      const data = {
+        ...(rescheduledExample.data as Record<string, unknown>),
+        suspensionActId: null,
+        reason: 'prorrogacao',
+      };
+
+      expect(() =>
+        INFRACTION_EVENT_SCHEMAS['inf.timer.rescheduled'].parse({
+          ...rescheduledExample,
+          data,
+        }),
+      ).not.toThrow();
+    });
+
+    it('dado um envelope de inf.timer.rescheduled sem o campo reason quando parse então é rejeitado', () => {
+      const data = { ...(rescheduledExample.data as Record<string, unknown>) };
+      delete data.reason;
+
+      expect(() =>
+        INFRACTION_EVENT_SCHEMAS['inf.timer.rescheduled'].parse({
+          ...rescheduledExample,
+          data,
+        }),
+      ).toThrow();
+    });
+
+    it('dado um envelope de inf.timer.rescheduled com reason fora de suspensao/prorrogacao quando parse então é rejeitado', () => {
+      const data = {
+        ...(rescheduledExample.data as Record<string, unknown>),
+        reason: 'reprogramacao',
+      };
+
+      expect(() =>
+        INFRACTION_EVENT_SCHEMAS['inf.timer.rescheduled'].parse({
+          ...rescheduledExample,
+          data,
+        }),
+      ).toThrow();
+    });
+
+    it('dado um envelope de inf.timer.rescheduled sem suspensionActId (ausência, não nulo) quando parse então é rejeitado', () => {
+      const data = { ...(rescheduledExample.data as Record<string, unknown>) };
+      delete data.suspensionActId;
+
+      expect(() =>
+        INFRACTION_EVENT_SCHEMAS['inf.timer.rescheduled'].parse({
+          ...rescheduledExample,
+          data,
+        }),
+      ).toThrow();
+    });
+  });
 });
diff --git a/docs/framework/arch/rait-events-sse-contract.md b/docs/framework/arch/rait-events-sse-contract.md
index cbd8bef..98941f4 100644
--- a/docs/framework/arch/rait-events-sse-contract.md
+++ b/docs/framework/arch/rait-events-sse-contract.md
@@ -3,7 +3,7 @@ id: ARCH-RAIT-EVENTS
 title: Contrato de eventos de domínio e do fluxo SSE do RAIT
 status: draft
 apps: [rait, portal, dashboard]
-updated: 2026-09-13
+updated: 2026-09-14
 ---

 # Eventos de domínio e fluxo SSE
@@ -81,7 +81,7 @@ pós-transição, o que permite ao frontend descartar eventos velhos.
 | `inf.infraction.penalty-final` | `PENALIDADE_DEFINITIVA`    | `infractionId, aitId, finalOn, points, amountTier`                                                      | senatran-adapter (RENACH)                     |
 | `inf.infraction.refund-due`    | `RESTITUICAO_DEVIDA`       | `infractionId, paymentId, amount, reason`                                                               | financeiro                                    |
 | `inf.timer.expired`            | `TIMER_VENCIDO`            | `ownerKind, ownerId, timerCode, dueOn, effect: transicao                                                | alerta                                        | marco | regra` | auditoria |
-| `inf.timer.rescheduled`        | `TIMER_REPROGRAMADO`       | `ownerId, timerCode, oldDueOn, newDueOn, suspensionActId`                                               | auditoria, SSE                                |
+| `inf.timer.rescheduled`        | `TIMER_REPROGRAMADO`       | `ownerId, timerCode, oldDueOn, newDueOn, suspensionActId (obrigatório, nulo na prorrogação), reason`    | auditoria, SSE                                |

 Eventos **consumidos** pela infração (produzidos fora): `AIT_INTEGRADO`, `AIT_CANCELADO_POSFINAL`
 (TEAT), `NOTIFICACAO_EXPEDIDA`, `NOTIFICACAO_CIENCIA` (notificação), `CONDUTOR_INDICADO`
diff --git a/docs/framework/schemas/events/inf.timer.rescheduled.schema.json b/docs/framework/schemas/events/inf.timer.rescheduled.schema.json
index ce5fa42..f8d83fc 100644
--- a/docs/framework/schemas/events/inf.timer.rescheduled.schema.json
+++ b/docs/framework/schemas/events/inf.timer.rescheduled.schema.json
@@ -98,14 +98,15 @@
     },
     "data": {
       "type": "object",
-      "description": "Suspensao nunca e automatica: so ato motivado e auditado ([RN-RAIT-105]); vedada sobre T-DEC, T-JUL-24M, T-PAR-3A e T-PRESC-5A (RAIT.SUSPENSION_LEGAL_TIMER).",
+      "description": "Duas origens (CTG-0001 secao 5.2): suspensao por ato — nunca automatica, so ato motivado e auditado ([RN-RAIT-105]), vedada sobre T-DEC, T-JUL-24M, T-PAR-3A e T-PRESC-5A (RAIT.SUSPENSION_LEGAL_TIMER) — e prorrogacao unica de T-DIL (mesmo prazo, extension_count <= 1; Res. 900/2022 art. 9o, [RN-RAIT-004]), em que suspensionActId e nulo.",
       "additionalProperties": false,
       "required": [
         "ownerId",
         "timerCode",
         "oldDueOn",
         "newDueOn",
-        "suspensionActId"
+        "suspensionActId",
+        "reason"
       ],
       "properties": {
         "ownerId": {
@@ -145,9 +146,14 @@
           "format": "date"
         },
         "suspensionActId": {
-          "type": "string",
+          "type": ["string", "null"],
           "format": "uuid",
-          "description": "inf.rait_suspension_act (DDL 39); referencia sem FK."
+          "description": "inf.rait_suspension_act (DDL 39); referencia sem FK. Obrigatorio e anulavel: o ato existe na suspensao e e nulo na prorrogacao (CTG-0001 secao 5.2)."
+        },
+        "reason": {
+          "type": "string",
+          "enum": ["suspensao", "prorrogacao"],
+          "description": "Origem da reprogramacao; tokens em portugues fixados pelo Owner em 2026-09-14 (decisao M14, work/rounds/R-0006/plan.md)."
         }
       }
     }
diff --git a/work/rounds/R-0006/contracts/CTG-0001.md b/work/rounds/R-0006/contracts/CTG-0001.md
index 5d5874a..67ec436 100644
--- a/work/rounds/R-0006/contracts/CTG-0001.md
+++ b/work/rounds/R-0006/contracts/CTG-0001.md
@@ -729,6 +729,222 @@ O caso 9 usa a escada de `WF-RAIT-002` §4.1 (12/18/21/23 meses) aplicada a `due
 risco (`rait_clock`) são de `BP-INF-RAIT-WORKLIST-001`, logo o teste verifica apenas as datas que o
 motor calcula, não a escrita da bandeira.

+### 5.2 Emenda (janela 2): porta de eventos e prorrogação
+
+Emenda decidida pelo humano em 2026-09-14 (`work/rounds/R-0006/plan.md` §Bloqueios, opção (ii), e
+decisão M14) para fechar os achados (b) e (c) de
+`work/rounds/R-0006/reviews/delivery-review-CTG-0001-2.json`: o motor não tinha por onde publicar
+`TIMER_REPROGRAMADO` (o caso 10 do §5.1 exige o evento) e não tinha verbo de prorrogação, de modo que
+`extension_count` nunca se movia nem era limitado. A emenda **só acrescenta**: nenhuma assinatura do
+§5 muda e nenhuma das suas seis notas é revogada.
+
+**Porta de eventos `DeadlineEvents`** (obrigatória em `DeadlineEngineDeps`):
+
+```ts
+export interface TimerRescheduledData {
+  ownerId: string;
+  timerCode: TimerCode;
+  oldDueOn: LocalDate;
+  newDueOn: LocalDate;
+  suspensionActId: string | null; // obrigatório; nulo na prorrogação
+  reason: 'suspensao' | 'prorrogacao';
+}
+
+export interface TimerExpiredData {
+  ownerKind: TimerOwnerKind;
+  ownerId: string;
+  timerCode: TimerCode;
+  dueOn: LocalDate;
+  effect: 'transicao' | 'alerta' | 'marco' | 'regra';
+}
+
+export type DeadlineEvent =
+  | {
+      type: 'inf.timer.rescheduled';
+      domainEvent: 'TIMER_REPROGRAMADO';
+      occurredAt: string; // ISO-8601 de clock.now(); nunca Date.now()
+      tenantId: string;
+      aggregate: { kind: 'clock'; id: string }; // id = Deadline.id
+      data: TimerRescheduledData;
+    }
+  | {
+      type: 'inf.timer.expired';
+      domainEvent: 'TIMER_VENCIDO';
+      occurredAt: string;
+      tenantId: string;
+      aggregate: { kind: 'clock'; id: string };
+      data: TimerExpiredData;
+    };
+
+export interface DeadlineEvents {
+  publish(event: DeadlineEvent): Promise<void>;
+}
+
+export class InMemoryDeadlineEvents implements DeadlineEvents {
+  readonly published: readonly DeadlineEvent[];
+  publish(event: DeadlineEvent): Promise<void>;
+}
+
+// `DeadlineEngineDeps` é o tipo que `createDeadlineEngine` já recebe (o §5 o
+// escrevia inline); a emenda acrescenta `events`, obrigatória.
+export interface DeadlineEngineDeps {
+  clock: Clock;
+  calendar: Calendar;
+  catalog: TimerCatalog;
+  store: TimerStore;
+  events: DeadlineEvents;
+  tenantTz?: string;
+}
+```
+
+Notas da porta (não negociáveis):
+
+1. `DeadlineEvent` é o envelope da §1 de `rait-events-sse-contract.md` **reduzido ao que a biblioteca
+   conhece**. Os campos que ela não tem como preencher — `id` (ULID), `version`, `actor`,
+   `correlationId`, `causationId` e `aggregate.version` — são completados por quem grava na
+   `integration.outbox`, isto é, pelos comandos de R-0007. Consequência: os esquemas de
+   `docs/framework/schemas/events/` continuam descrevendo o envelope **completo**, e `DeadlineEvent` é
+   o subconjunto que a biblioteca produz; o teste do Inspector verifica os campos presentes, não o
+   esquema inteiro.
+2. `aggregate.kind` é `'clock'` — token da lista canônica da §1 de `rait-events-sse-contract.md`
+   (`case|infraction|session|batch|clock|assignment|agenda-item|outbox`); `timer` **não** existe nessa
+   lista. `aggregate.id` é o `Deadline.id`: o agregado do evento é o relógio, não a infração.
+3. Eventos que a biblioteca emite, e só eles: `inf.timer.rescheduled` (`TIMER_REPROGRAMADO`) em
+   `reschedule` **e** em `extend`; `inf.timer.expired` (`TIMER_VENCIDO`) em `sweep`, um por timer que a
+   varredura passa a `vencido` (os itens de `SweepReport.expired`), nenhum para os `skipped`. A
+   idempotência da nota 6 do §5 vale para o evento: a segunda varredura sobre o mesmo timer não
+   publica de novo (caso 12).
+4. Ordem dentro do verbo: primeiro `store.update`, depois `events.publish`, com `await` antes do
+   retorno — o evento carrega os valores já gravados. A falha da porta propaga (a biblioteca não
+   engole erro de publicação). Em R-0007 as duas escritas ficam na mesma transação do comando, como
+   manda a §1 do contrato de eventos.
+5. `occurredAt` vem de `clock.now()` serializado em ISO-8601: `CODESTYLE` §TypeScript proíbe
+   `Date.now()` em código de domínio.
+6. `InMemoryDeadlineEvents` é exportada pela biblioteca e é o que o Inspector injeta; `published`
+   preserva a ordem de publicação.
+
+**Verbo `extend` — prorrogação única de `T-DIL`**:
+
+```ts
+export interface DeadlineEngine {
+  // … tudo do §5, mais:
+  extend(id: string, reason: string): Promise<Deadline>;
+}
+```
+
+`reason` é o motivo registrado pelo chamador para auditoria (como em `satisfy` e `cancel`); **não** é
+o token do evento — o `reason` do `data` de uma prorrogação é sempre `'prorrogacao'`.
+
+Guardas, nesta ordem:
+
+1. Código não prorrogável → `DeadlineError('RAIT.DEADLINE_LEGAL_READONLY', …)` com `status: 422` e
+   `context { timerCode }`. Prorrogável nesta rodada: **só `T-DIL`** — `inf.infraction_timer_ref`
+   grava `start_mark = 'abertura da diligência (prorrogável uma vez)'`, `duration 15 dias_uteis` e a
+   base Res. 900/2022 art. 9º p.ú. (`RN-RAIT-004`); nenhum dos outros 17 códigos declara prorrogação.
+   Os demais são prazos legais ou marcos, e é exatamente a hipótese da §3.9 de
+   `rait-error-catalog.md` ("tentativa de editar prazo legal ou marco de ciência", `context` com
+   `timerCode`).
+2. `status !== 'armado'` → `RAIT.INTERNAL` com `status: 500` e `context { deadlineId, status }`, como
+   `reschedule` já faz: é defeito de chamada, não erro de domínio (`rait-error-catalog.md` §1 regra
+   7).
+3. `extensionCount >= 1` → `DeadlineError('RAIT.INQUIRY_EXTENSION_LIMIT', …)` com `status: 422` e
+   `context { ownerId, timerCode, extensionCount }`; nada é gravado no `TimerStore` e **nenhum** evento
+   é publicado (`extension_count ≤ 1`, Res. 900/2022 art. 9º; `RN-RAIT-004`).
+
+Efeito quando as três guardas passam:
+
+- `rawDueOn` = `dueOn` **atual** somado à mesma `durationValue` na mesma `durationUnit` da definição
+  (para `T-DIL`: 15 dias úteis, o dia do marco não conta — a contagem da §2 de
+  `rait-deadline-engine.md`, a mesma de `computeDue`). O marco da soma é o `dueOn` vigente, não
+  `startedOn`: a prorrogação é "mesmo prazo" contado do vencimento.
+- `dueOn` = primeiro dia útil ≥ `rawDueOn` (regra de dia não útil do §5: nunca antecipa).
+- `extensionCount` 0 → 1.
+- `startedOn`, `ceilingOn`, `status`, `suspendedDays` e `suspendedByActId` ficam inalterados: a
+  prorrogação **não** é suspensão — a §2 de `rait-deadline-engine.md` trata as duas como operações
+  distintas, com bases legais distintas.
+- Publica **um** `inf.timer.rescheduled` com `ownerId` = `Deadline.ownerId`, `timerCode` =
+  `Deadline.code`, `oldDueOn` = `dueOn` anterior, `newDueOn` = `dueOn` novo, `suspensionActId: null` e
+  `reason: 'prorrogacao'`.
+
+`reschedule` (nota 5 do §5, inalterada quanto ao cálculo) passa a publicar o mesmo evento com
+`suspensionActId` = `act.id` e `reason: 'suspensao'`.
+
+Divergência registrada: a §3.5 de `rait-error-catalog.md` dá `context` `inquiryId` a
+`RAIT.INQUIRY_EXTENSION_LIMIT`, porque o código nasceu na diligência (`/casos/:id/diligencias`). A
+biblioteca não conhece a diligência — conhece o timer e o seu `ownerId` (o caso RAIT). Por isso o
+`context` aqui é `{ ownerId, timerCode, extensionCount }`, e o comando de R-0007 que embrulha `extend`
+acrescenta `inquiryId`. O texto do catálogo está fora da fronteira desta tarefa
+(`docs/framework/arch/rait-error-catalog.md` só é tocado por TASK-0008, como o §9 item 4 já registra).
+
+**Efeito no esquema `inf.timer.rescheduled`**
+(`docs/framework/schemas/events/inf.timer.rescheduled.schema.json`, draft 2020-12 e
+`additionalProperties: false` em todos os níveis, como antes):
+
+- `data.suspensionActId` continua **obrigatório** (segue em `required`) e passa a ser **anulável**:
+  `"type": ["string", "null"]`. O `"format": "uuid"` é mantido — em draft 2020-12 `format` só se
+  aplica quando a instância é string, logo `null` não o viola.
+- `data.reason` é **novo e obrigatório**, `"enum": ["suspensao", "prorrogacao"]` — tokens fixados pelo
+  Owner em 2026-09-14 (decisão M14 em `work/rounds/R-0006/plan.md`), em português, como manda
+  `CODESTYLE` §TypeScript (vocabulário de domínio é português; tokens são copiados, nunca traduzidos).
+- A `description` do `data` passa a citar as duas origens da reprogramação (ato de suspensão, §2 de
+  `rait-deadline-engine.md`; prorrogação única de `T-DIL`, Res. 900/2022 art. 9º).
+- `inf.timer.expired` **não** muda.
+
+A fonte do `data` é a linha de `inf.timer.rescheduled` na tabela §2.4 de
+`rait-events-sse-contract.md`, atualizada por esta mesma tarefa para
+`ownerId, timerCode, oldDueOn, newDueOn, suspensionActId (obrigatório, nulo na prorrogação), reason`,
+para que o contrato canônico e o esquema não divirjam.
+
+**Casos obrigatórios novos (19–22) e emenda do caso 12.** Mesmo cenário do §5.1, com
+`events = new InMemoryDeadlineEvents()` injetada em `createDeadlineEngine`.
+
+```text
+ #  chamada                                                               asserção
+--  --------------------------------------------------------------------  -------------------------------------------------
+19  reschedule(idDoTDIL, { days: 10, … }) — o caso 10 com a porta         events.published tem 1 evento: type
+                                                                          'inf.timer.rescheduled', domainEvent
+                                                                          'TIMER_REPROGRAMADO', aggregate.kind 'clock',
+                                                                          aggregate.id = id do timer, data { ownerId,
+                                                                          timerCode 'T-DIL', oldDueOn '2026-12-07',
+                                                                          newDueOn '2026-12-22', suspensionActId = act.id,
+                                                                          reason 'suspensao' }
+20  arm('T-DIL', startOn '2026-11-13') (dueOn '2026-12-07') e depois       rawDueOn e dueOn '2026-12-30';
+    extend(id, '<motivo>')                                                extensionCount 1; suspendedDays 0 e
+                                                                          suspendedByActId null; 1 evento
+                                                                          'inf.timer.rescheduled' com data { oldDueOn
+                                                                          '2026-12-07', newDueOn '2026-12-30',
+                                                                          suspensionActId null, reason 'prorrogacao' }
+21  segundo extend sobre o mesmo T-DIL                                    DeadlineError 'RAIT.INQUIRY_EXTENSION_LIMIT',
+                                                                          422, context { ownerId, timerCode 'T-DIL',
+                                                                          extensionCount 1 }; events.published segue com
+                                                                          1 evento (nenhum novo); dueOn inalterado
+22  extend sobre o T-DEC armado do caso 11                                DeadlineError 'RAIT.DEADLINE_LEGAL_READONLY',
+                                                                          422, context { timerCode 'T-DEC' }; nenhum
+                                                                          evento publicado
+12  emenda do caso 12: sweep(t) duas vezes sobre o mesmo timer vencido    exatamente 1 'inf.timer.expired' em
+                                                                          events.published, com data { ownerKind
+                                                                          'infraction', ownerId, timerCode 'T-NA', dueOn
+                                                                          '2026-08-05', effect 'transicao' }
+```
+
+A conta do caso 20, verificada contra `docs/framework/arch/fixtures/calendar-2026.json` (dia útil =
+seg–sex fora de `national`, `am` e `manaus`; o bloco `optional` conta como dia útil, nota 3 do §5): 15
+dias úteis a partir de 2026-12-07 (segunda-feira; o dia do marco não conta), pulando 08/12 (`manaus`,
+Nossa Senhora da Conceição) e 25/12 (`national`, Natal) e contando 24/12 (`optional`, ponto
+facultativo municipal em Manaus) — 09, 10, 11, 14, 15, 16, 17, 18, 21, 22, 23, 24, 28, 29 e **30** de
+dezembro. 2026-12-30 é quarta-feira e dia útil, logo não há arredondamento:
+`rawDueOn = dueOn = '2026-12-30'`.
+
+**Espelho zod da infração.** A mudança do esquema obriga o espelho de `inf.timer.rescheduled` em
+`@detran/inf-infraction`, nesta mesma tríade e não nesta tarefa:
+
+- `backend/domains/inf/infraction/src/handwritten/events.ts` — Engineer (TASK-0011): `reason`
+  obrigatório com os dois tokens (`suspensao`, `prorrogacao`) e `suspensionActId` string **ou** nulo,
+  obrigatório.
+- `backend/domains/inf/infraction/tests/unit/events.schema.spec.ts` — Inspector (TASK-0010): os `it`
+  de `inf.timer.rescheduled` (aceitação com `reason` e com `suspensionActId` nulo; rejeição sem
+  `reason`).
+
 ## 6. API pública manuscrita dos módulos (`src/handwritten/index.ts`)

 ### 6.1 `@detran/inf-infraction`
@@ -1110,3 +1326,14 @@ Nenhum valor de prazo, papel, estado, código de erro ou rótulo foi criado fora
 7. **`@detran/inf-deadlines` não é dependência declarada** de `BP-INF-INFRACTION-001` nem de
    `BP-INF-NOTIFICATION-001` (a tarefa fixa `@detran/inf-ait` e `@detran/inf-infraction`). Os
    módulos consomem o motor a partir de TASK-0003; a dependência entra no mesmo `v1.1.0` do item 6.
+8. **Lacunas (b) e (c) da delivery-review ciclo 2 — fechadas pela emenda do §5.2** (2026-09-14). (b)
+   `reschedule` sem emissão de `TIMER_REPROGRAMADO` e (c) ausência de verbo de prorrogação com
+   `extension_count ≤ 1` eram defeitos deste contrato, não do código: o §5 não tinha porta de eventos
+   nem `extend`. O §5.2 acrescenta `DeadlineEvents`/`InMemoryDeadlineEvents`,
+   `extend(id, reason)`, os casos 19–22, a emenda do caso 12 e a alteração do esquema
+   `inf.timer.rescheduled` (`reason` obrigatório; `suspensionActId` obrigatório e anulável) — testes
+   por TASK-0010, implementação por TASK-0011. Duas observações continuam abertas: o item 1 acima
+   (`TIMER_REPROGRAMADO` ausente de `inf.infraction_event_ref`, logo o evento vive só na
+   `integration.outbox`) e a divergência de `context` do `RAIT.INQUIRY_EXTENSION_LIMIT`
+   (`inquiryId` no catálogo §3.5 × `{ ownerId, timerCode, extensionCount }` na biblioteca),
+   registrada no §5.2 e a corrigir no texto do catálogo por quem detém `docs/framework/arch/`.
````

### Nota do maestro

Responda apenas com o JSON do §Saída.
