# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `teat-backend` (rodada `R-0008`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/teat-build-pack.md` — apenas a seção do WP `WP-T2` e o "mapa entregável → definições"
4. `work/rounds/R-0008/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0008/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0008/reports/*.md`, o diff anexado abaixo e os
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
  "round": "R-0008",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0008/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

## Nota do maestro — delivery-review CTG-0002, ciclo 4 (restrito ao achado único do ciclo 3)

Veredito anterior: `REVIEW` (`reviews/delivery-review-CTG-0002-3.json`): replay de lote interrompido não completava os itens faltantes (§14 c). Correção (Engineer iteração 5, só `submit-batch.command.ts`): passo 5 grava `receipts_json.declared_keys`; `replay` virou `resume` — sequência divergente ou conjunto ≠ declarado → 409; conjunto igual → continuação (recibos existentes sem `apply`, itens faltantes materializados/aplicados no mesmo `batchId`, fechamento no passo 9, 200). Linhas legadas sem `declared_keys`: materializadas ⊆ reenviadas. Ratificado pelo Architect em §14 (d) (anexo; OD-T49 fechada). Testes (Inspector iteração 4, integration `sync-batch.integration.spec.ts` bloco "§14 (c)"): positivo com contador por chave (0 `apply` para a já materializada, 1 para a faltante) e fechamento do lote no banco; negativos omissão/chave nova → 409; regime legado. Gates: ops-offline-sync unit 27/27, integration 44/44; app e2e 58/58; `pnpm check` + `backend:test:ci` em execução no envio (registrados antes do commit). Avalie **somente** essa correção. Anexos: §14 completo; diff acumulado dos dois arquivos contra HEAD cab0983 (o trecho relevante é `resume`/`runItems`/`declared_keys` e o bloco de testes §14 (c)).

## Anexo — CTG-0002 §14

````markdown
## 14. Adenda do maestro (Architect, 2026-09-15, após delivery-review-CTG-0002 ciclo 2)

**Ordem canônica do lote — resolução formal da incompatibilidade entre §4.1 passos 7–10 e o `batchId` dos
envelopes transacionais.** O ciclo 1 exigiu `data.batchId` persistido em todo envelope de item, o que é
impossível se `ops.sync_batch` só nasce no passo 9. Decisão do Architect, que **substitui** os passos 5–10 de
§4.1:

```text
passo  ação                                                                              transação
-----  --------------------------------------------------------------------------------  --------------------------
1–4    validação de forma (zod), replay de device_batch_id, guarda de sequência          nenhuma escrita
5      persistir ops.sync_batch { device_batch_id, batch_sequence, submitted_at,          própria (durável)
       accepted_items = 0, receipts_json = { item_ids: [] } } — identidade durável do
       envio; nada de item ainda existe
6–8    por item: materializar sync_queue_item/sync_receipt `received`; aplicar (applier   uma por item (§4.3)
       + promoção pelas portas + eventos, todos com data.batchId = id do passo 5);
       falha → rollback do item + recibo conflict|rejected em transação própria
9      fechar o lote: update ops.sync_batch { accepted_items, receipts_json.item_ids }    própria
10     publicar sync.batch.received (batchId, counts) e responder
```
````

Consequências que passam a valer como contrato: (a) um lote interrompido entre 5 e 9 **fica durável** com
`accepted_items = 0` ou parcial e `receipts_json` incompleto — isso é desejado: o reenvio do mesmo
`device_batch_id` cai no replay de passo 2 e devolve os recibos já emitidos (recuperação de ACK perdido,
C-0002-27/28), nunca reaplica; (b) `sync_batch` sem itens não é estado inválido (o DDL 18 admite
`accepted_items >= 0`); (c) o replay compara o conjunto de `idempotency_key` dos itens **materializados**
com o lote reenviado — lote interrompido antes de materializar todos os itens e reenviado com o mesmo
`device_batch_id` e o mesmo conjunto é replay legítimo e completa a materialização dos itens que faltam
(comportamento já coberto por C-0002-28 "lote parcial"). A implementação da iteração 3/4 de TASK-0005
segue exatamente esta ordem; nenhum teste muda.

**§14 (d) — ratificação (Architect, após TASK-0005 iteração 5 / OD-T49).** O passo 5 grava em
`ops.sync_batch.receipts_json.declared_keys` o conjunto de `idempotency_key` declarado no envio original
(sem DDL). O replay compara o conjunto reenviado com `declared_keys`: igual → continuação (recibos
existentes sem `apply`, itens faltantes materializados e aplicados, fechamento no passo 9); diferente
(chave a mais ou a menos) ou sequência divergente → 409 `TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH`.
Linhas legadas sem `declared_keys` (anteriores a esta adenda; só fixtures) usam o conjunto materializado:
materializadas ⊆ reenviadas é continuação; chave materializada omitida → 409. OD-T49 fecha-se por esta
ratificação.

````

## Anexo — diff

```diff
diff --git a/backend/domains/ops/offline-sync/src/handwritten/submit-batch.command.ts b/backend/domains/ops/offline-sync/src/handwritten/submit-batch.command.ts
new file mode 100644
index 0000000..3b867d4
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/submit-batch.command.ts
@@ -0,0 +1,1025 @@
+// CTG-0002 §4 e §5.13 (M5–M7, R-0008, TASK-0005) — `POST /v1/ops/offline-sync/
+// sync-batches`: o único ponto de entrada do protocolo de sincronização.
+//
+// Ordem das etapas, que é parte do contrato (§4.1): replay de lote → guarda de
+// sequência → materialização dos itens → detecção de concorrência → aplicação
+// item a item, **uma transação por item** → recibos → lote → eventos.
+//
+// Fronteira de persistência: a escrituração do protocolo (fila, recibo,
+// conflito, lote) passa pela porta de repositório injetada; o efeito de
+// domínio do item roda numa transação própria, que é a que o applier recebe e
+// a que carrega os eventos do item. Uma falha do applier reverte a transação
+// inteira e o recibo de recusa é gravado depois, fora dela (§4.3 passo 5).
+import type { OpsRow, SyncEntityApplier } from '@detran/ops-core';
+import {
+  asQueryable,
+  createOpsRow,
+  teatEventSink,
+  type SyncEntityApplierItem,
+} from '@detran/ops-core';
+import { DetranError, type TeatEventEnvelope } from '@detran/shared';
+import type { Transaction } from '@stynx-nyx/data';
+import { z } from 'zod';
+
+import {
+  ALLOWED_RESOLUTION_ACTIONS,
+  CONFLICT_DESCRIPTION,
+  SUPPORTED_ENTITY_TYPES,
+  clockOf,
+  numberOf,
+  outcomeFor,
+  ownedBy,
+  storeOf,
+  tenantScope,
+  type ConflictType,
+  type OfflineSyncDeps,
+  type ReceiptStatus,
+} from './batch-protocol.js';
+import { canonicalHash } from './canonical-hash.js';
+import {
+  CONCURRENCY_WINDOW_KEY,
+  CONCURRENCY_WINDOW_WARNING,
+  concurrentCandidates,
+  windowBounds,
+  windowFrom,
+} from './concurrency-detector.js';
+import {
+  aitConcurrencySuspectedEvent,
+  aitReceivedEvent,
+  syncConflictOpenedEvent,
+  syncItemReceivedEvent,
+  type EventScope,
+} from './events.js';
+
+export interface SyncBatchItemInput {
+  entity_type: string;
+  local_entity_id: string;
+  server_entity_id?: string;
+  idempotency_key?: string;
+  payload_hash: string;
+  created_locally_at?: string;
+  payload_json?: Record<string, unknown>;
+}
+
+export interface SubmitSyncBatchInput {
+  traffic_agency_id: string;
+  device_id: string;
+  agent_id: string;
+  device_batch_id: string;
+  batch_sequence?: number | null;
+  items: SyncBatchItemInput[];
+}
+
+export interface SyncReceiptView {
+  local_entity_id: string | null;
+  idempotency_key: string | null;
+  status: string | null;
+  server_entity_id: string | null;
+  error_code: string | null;
+  error_message: string | null;
+  details_json: Record<string, unknown> | null;
+}
+
+export interface SubmitSyncBatchResponse {
+  batchId: string | null;
+  batch_sequence: number | null;
+  accepted_items: number;
+  receipts: SyncReceiptView[];
+  warnings: string[];
+}
+
+/**
+ * §4.2 e §5.13 — forma do `SubmitSyncBatchDto` de origem, conferida na
+ * fronteira antes de qualquer materialização. `tenant_id` do DTO de origem é
+ * descartado (CODESTYLE §Backend: o tenant vem do `RequestContext`), então o
+ * objeto **não** é estrito: chaves desconhecidas são removidas, não recusadas.
+ */
+const syncBatchItemSchema = z.object({
+  entity_type: z.string().min(1).max(60),
+  local_entity_id: z.uuid(),
+  server_entity_id: z.uuid().nullish(),
+  idempotency_key: z.string().min(1).max(160).nullish(),
+  payload_hash: z.string().min(1).max(128),
+  created_locally_at: z.iso.datetime({ offset: true }).nullish(),
+  payload_json: z.record(z.string(), z.unknown()).nullish(),
+});
+
+const submitSyncBatchSchema = z.object({
+  traffic_agency_id: z.uuid(),
+  device_id: z.uuid(),
+  agent_id: z.uuid(),
+  device_batch_id: z.string().min(1).max(160),
+  batch_sequence: z.int().min(1).nullish(),
+  items: z.array(syncBatchItemSchema).min(1),
+});
+
+/** `context.fields[] { path, rule, params }` do catálogo §1 regra 5. */
+function validationFields(error: z.ZodError): Array<Record<string, unknown>> {
+  return error.issues.map((issue) => {
+    const {
+      code,
+      path,
+      message: _message,
+      ...params
+    } = issue as unknown as Record<string, unknown>;
+    return {
+      path: (path as unknown[]).map(String).join('.'),
+      rule: String(code),
+      params,
+    };
+  });
+}
+
+interface PreparedItem {
+  raw: SyncBatchItemInput;
+  entityType: string;
+  localEntityId: string;
+  idempotencyKey: string;
+  payloadHash: string;
+  createdLocallyAt: string;
+  /** Recibo já existente (replay de item) — nada mais acontece. */
+  existingReceipt?: OpsRow;
+  /** Linha de fila criada para o item deste lote. */
+  itemRow?: OpsRow;
+  receiptRow?: OpsRow;
+  /** Desfecho já decidido antes da aplicação. */
+  closed?: { code: string; context: Record<string, unknown> };
+  /** Recibo sintético: o item existe com a mesma chave e outro hash (§4.2). */
+  transient?: SyncReceiptView;
+  applier?: SyncEntityApplier;
+  concurrencySuspect?: boolean;
+  concurrencyContext?: Record<string, unknown>;
+}
+
+/** §4.2 — chave derivada do caminho legado. */
+function legacyKey(deviceId: string, localEntityId: string): string {
+  return `legacy:${deviceId}:${localEntityId}`;
+}
+
+function receiptView(row: OpsRow): SyncReceiptView {
+  const details = (row.details_json ?? null) as Record<string, unknown> | null;
+  return {
+    local_entity_id: (row.local_entity_id as string) ?? null,
+    idempotency_key: (row.idempotency_key as string) ?? null,
+    status: (row.status as string) ?? null,
+    server_entity_id: (row.server_entity_id as string) ?? null,
+    error_code: (row.reason_code as string) ?? null,
+    error_message: null,
+    details_json: details,
+  };
+}
+
+export class SubmitBatchCommand {
+  constructor(private readonly deps: OfflineSyncDeps) {}
+
+  async execute(input: SubmitSyncBatchInput): Promise<SubmitSyncBatchResponse> {
+    const { tenantId, actorId } = tenantScope(this.deps);
+    const clock = clockOf(this.deps);
+    const scope: EventScope = { tenantId, actorId, occurredAt: clock.now() };
+    const parsed = submitSyncBatchSchema.safeParse(input);
+    if (!parsed.success)
+      throw new DetranError('TEAT.VALIDATION_FAILED', {
+        status: 400,
+        context: { fields: validationFields(parsed.error) },
+        message: 'Lote de sincronização com forma inválida.',
+      });
+    const deviceId = parsed.data.device_id;
+    const deviceBatchId = parsed.data.device_batch_id;
+    const sequence =
+      parsed.data.batch_sequence === undefined ||
+      parsed.data.batch_sequence === null
+        ? null
+        : numberOf(parsed.data.batch_sequence);
+    const rawItems = input.items;
+
+    const batches = storeOf(this.deps, 'batches');
+    const deviceBatches = ownedBy(await batches.list(), tenantId).filter(
+      (row) => String(row.device_id) === deviceId,
+    );
+    const declaredKeys = rawItems.map((raw) =>
+      raw.idempotency_key
+        ? String(raw.idempotency_key)
+        : legacyKey(deviceId, String(raw.local_entity_id)),
+    );
+    const replayed = deviceBatches.find(
+      (row) => String(row.device_batch_id) === deviceBatchId,
+    );
+    if (replayed)
+      return this.resume(
+        replayed,
+        input,
+        rawItems,
+        declaredKeys,
+        sequence,
+        tenantId,
+        scope,
+      );
+    this.assertSequence(deviceBatches, sequence, deviceBatchId);
+
+    // §14 passo 5 — o lote nasce durável antes de qualquer item, para que o id
+    // exista em `data.batchId` de todo envelope; `declared_keys` guarda o
+    // conjunto anunciado pelo envio, que é o que distingue "outro conjunto"
+    // (409) de "mesmo conjunto, materialização incompleta" (continuação).
+    const batchRow = await batches.create({
+      traffic_agency_id: String(input.traffic_agency_id),
+      agent_id: String(input.agent_id),
+      device_id: deviceId,
+      device_batch_id: deviceBatchId,
+      batch_sequence: sequence,
+      submitted_at: scope.occurredAt,
+      accepted_items: 0,
+      receipts_json: { item_ids: [], declared_keys: declaredKeys },
+    });
+
+    return this.runItems(
+      String(batchRow.id),
+      declaredKeys,
+      input,
+      rawItems,
+      sequence,
+      tenantId,
+      scope,
+    );
+  }
+
+  /**
+   * §14 passos 6–10 — materializa, aplica, fecha o lote e responde. Chamado
+   * tanto pelo envio novo quanto pela continuação de um lote durável: um item
+   * cuja `idempotency_key` já foi materializada com o mesmo hash devolve o
+   * recibo existente sem novo `apply` (§4.2), então reexecutar o trecho é
+   * seguro e é o que completa os itens que faltaram.
+   */
+  private async runItems(
+    batchId: string,
+    declaredKeys: readonly string[],
+    input: SubmitSyncBatchInput,
+    rawItems: SyncBatchItemInput[],
+    sequence: number | null,
+    tenantId: string,
+    scope: EventScope,
+  ): Promise<SubmitSyncBatchResponse> {
+    const window = await this.concurrencyWindow(input.traffic_agency_id);
+    const warnings =
+      window.minutes === null ? [CONCURRENCY_WINDOW_WARNING] : [];
+
+    const prepared: PreparedItem[] = [];
+    for (const raw of rawItems) {
+      prepared.push(await this.materialize(raw, input, tenantId));
+    }
+    if (window.minutes !== null) {
+      await this.detectConcurrency(
+        prepared,
+        input,
+        tenantId,
+        scope,
+        window.minutes,
+      );
+    }
+
+    const receipts: SyncReceiptView[] = [];
+    for (const item of prepared) {
+      receipts.push(await this.settle(item, input, sequence, scope, batchId));
+    }
+
+    const acceptedItems = receipts.filter(
+      (receipt) =>
+        receipt.status !== 'rejected' && receipt.status !== 'conflict',
+    ).length;
+    const itemIds = [
+      ...new Set(
+        prepared
+          .map((item) => item.itemRow?.id)
+          .filter((id): id is string => typeof id === 'string'),
+      ),
+    ];
+    await storeOf(this.deps, 'batches').update(batchId, {
+      accepted_items: acceptedItems,
+      receipts_json: { item_ids: itemIds, declared_keys: [...declaredKeys] },
+    });
+
+    return {
+      batchId,
+      batch_sequence: sequence,
+      accepted_items: acceptedItems,
+      receipts,
+      warnings,
+    };
+  }
+
+  /**
+   * §4.1 passo 3 e §14 (c) — retransmissão do mesmo `device_batch_id`.
+   *
+   * Critério adotado para separar os dois casos:
+   *  - `receipts_json.declared_keys` (gravado no passo 5) é o conjunto de
+   *    `idempotency_key` que o **envio** anunciou. Reenvio com conjunto
+   *    diferente do anunciado, ou com sequência diferente da gravada, é 409
+   *    `TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH`;
+   *  - lotes gravados sem `declared_keys` (versões anteriores, fixtures) caem
+   *    no critério de subconjunto: as chaves **materializadas** precisam estar
+   *    contidas no reenvio.
+   *
+   * Passado o critério, o reenvio é continuação: as chaves já materializadas
+   * devolvem os recibos existentes sem novo `apply` e as que faltam são
+   * materializadas e aplicadas no mesmo lote (mesmo `batchId`), que é fechado
+   * de novo no passo 9. É a recuperação de ACK perdido e, ao mesmo tempo, a
+   * retomada de um lote interrompido entre os passos 5 e 9.
+   */
+  private async resume(
+    batch: OpsRow,
+    input: SubmitSyncBatchInput,
+    rawItems: SyncBatchItemInput[],
+    declaredKeys: readonly string[],
+    sequence: number | null,
+    tenantId: string,
+    scope: EventScope,
+  ): Promise<SubmitSyncBatchResponse> {
+    const deviceBatchId = String(batch.device_batch_id);
+    const stored =
+      batch.batch_sequence === null || batch.batch_sequence === undefined
+        ? null
+        : numberOf(batch.batch_sequence);
+    if (stored !== sequence) throw replayMismatch(deviceBatchId);
+
+    const receiptsJson = (batch.receipts_json ?? {}) as {
+      item_ids?: string[];
+      declared_keys?: string[];
+    };
+    const itemIds = (receiptsJson.item_ids ?? []).map(String);
+    const incoming = new Set(declaredKeys);
+    const announced = receiptsJson.declared_keys;
+    if (announced) {
+      if (!sameSet(announced.map(String), declaredKeys))
+        throw replayMismatch(deviceBatchId);
+    } else {
+      const materialized = ownedBy(
+        await storeOf(this.deps, 'items').list(),
+        tenantId,
+      )
+        .filter((row) => itemIds.includes(String(row.id)))
+        .map((row) => String(row.idempotency_key));
+      if (materialized.some((key) => !incoming.has(key)))
+        throw replayMismatch(deviceBatchId);
+      // Sem `declared_keys`, a única evidência de que o lote não chegou ao
+      // passo 9 é `accepted_items = 0` — o valor escrito no passo 5 e
+      // substituído no fechamento. Lote já fechado não admite chave nova:
+      // o replay completa o que faltou, nunca acrescenta item ao envio.
+      const materializedKeys = new Set(materialized);
+      const additions = declaredKeys.filter(
+        (key) => !materializedKeys.has(key),
+      );
+      if (additions.length > 0 && numberOf(batch.accepted_items ?? 0) > 0)
+        throw replayMismatch(deviceBatchId);
+    }
+
+    return this.runItems(
+      String(batch.id),
+      announced ? announced.map(String) : declaredKeys,
+      input,
+      rawItems,
+      stored,
+      tenantId,
+      scope,
+    );
+  }
+
+  /**
+   * §4.1 passo 4 — sequência: `last` é o maior `batch_sequence` aceito do
+   * (tenant, device) **ou 0**, inclusive no primeiro lote do dispositivo. Com
+   * `last = 0` o primeiro lote sequenciado só pode ser o `1`: qualquer outro é
+   * replay (≤ 0 é impossível pelo schema) ou lacuna.
+   */
+  private assertSequence(
+    deviceBatches: OpsRow[],
+    sequence: number | null,
+    deviceBatchId: string,
+  ): void {
+    if (sequence === null) return;
+    const sequences = deviceBatches
+      .map((row) => row.batch_sequence)
+      .filter((value) => value !== null && value !== undefined)
+      .map(numberOf)
+      .filter((value) => Number.isFinite(value));
+    const last = sequences.length === 0 ? 0 : Math.max(...sequences);
+    if (sequence <= last)
+      throw new DetranError('TEAT.SYNC_BATCH_SEQUENCE_REPLAYED', {
+        status: 409,
+        context: {
+          expectedSequence: last + 1,
+          received: sequence,
+          deviceBatchId,
+        },
+        message: 'Sequência de lote já aceita para o dispositivo.',
+      });
+    if (sequence > last + 1)
+      throw new DetranError('TEAT.SYNC_BATCH_SEQUENCE_GAP', {
+        status: 422,
+        context: {
+          expectedSequence: last + 1,
+          received: sequence,
+          deviceBatchId,
+        },
+        message: 'Sequência de lote com lacuna; reenvie os lotes anteriores.',
+      });
+  }
+
+  private async concurrencyWindow(
+    agencyId: string,
+  ): Promise<{ minutes: number | null }> {
+    const parameters = this.deps.parameters;
+    if (!parameters) return { minutes: null };
+    try {
+      const row = await parameters.get(CONCURRENCY_WINDOW_KEY, {
+        agencyId: agencyId ? String(agencyId) : undefined,
+      });
+      return windowFrom(row ?? {});
+    } catch {
+      // Linha ausente no catálogo do tenant: detecção desligada (§4.7).
+      return { minutes: null };
+    }
+  }
+
+  /** §4.2 — identidade, integridade e materialização de um item. */
+  private async materialize(
+    raw: SyncBatchItemInput,
+    input: SubmitSyncBatchInput,
+    tenantId: string,
+  ): Promise<PreparedItem> {
+    const deviceId = String(input.device_id);
+    const entityType = String(raw.entity_type);
+    const localEntityId = String(raw.local_entity_id);
+    const legacy = !raw.idempotency_key;
+    const idempotencyKey = legacy
+      ? legacyKey(deviceId, localEntityId)
+      : String(raw.idempotency_key);
+    const payloadHash = String(raw.payload_hash);
+    const createdLocallyAt = raw.created_locally_at
+      ? String(raw.created_locally_at)
+      : clockOf(this.deps).now();
+    const base: PreparedItem = {
+      raw,
+      entityType,
+      localEntityId,
+      idempotencyKey,
+      payloadHash,
+      createdLocallyAt,
+    };
+
+    const items = storeOf(this.deps, 'items');
+    const known = ownedBy(await items.list(), tenantId).find(
+      (row) => String(row.idempotency_key) === idempotencyKey,
+    );
+    if (known) {
+      const storedHash = String(known.payload_hash);
+      const receipts = ownedBy(
+        await storeOf(this.deps, 'receipts').list(),
+        tenantId,
+      );
+      const receipt = receipts.find(
+        (row) => String(row.sync_queue_item_id) === String(known.id),
+      );
+      if (storedHash === payloadHash)
+        return receipt
+          ? { ...base, itemRow: known, existingReceipt: receipt }
+          : {
+              ...base,
+              itemRow: known,
+              transient: {
+                local_entity_id: localEntityId,
+                idempotency_key: idempotencyKey,
+                status: String(known.status ?? 'received'),
+                server_entity_id: (known.server_entity_id as string) ?? null,
+                error_code: (known.error_code as string) ?? null,
+                error_message: null,
+                details_json: null,
+              },
+            };
+      {
+        const context = {
+          idempotencyKey,
+          storedHash,
+          receivedHash: payloadHash,
+        };
+        await this.openConflict(
+          known,
+          'integrity',
+          'TEAT.SYNC_INTEGRITY_ERROR',
+          {
+            local: payloadHash,
+            server: storedHash,
+          },
+        );
+        // Os índices `(tenant_id, idempotency_key)` de `ops.sync_queue_item` e
+        // `ops.sync_receipt` são únicos: a chave já tem fila e recibo próprios,
+        // então o registro durável da divergência é o conflito e o recibo da
+        // resposta é sintético.
+        return {
+          ...base,
+          itemRow: known,
+          transient: {
+            local_entity_id: localEntityId,
+            idempotency_key: idempotencyKey,
+            status: 'rejected',
+            server_entity_id: null,
+            error_code: 'TEAT.SYNC_INTEGRITY_ERROR',
+            error_message: null,
+            details_json: context,
+          },
+        };
+      }
+    }
+
+    const itemRow = await items.create({
+      traffic_agency_id: String(input.traffic_agency_id),
+      device_id: deviceId,
+      agent_id: String(input.agent_id),
+      entity_type: entityType,
+      local_entity_id: localEntityId,
+      status: 'pending',
+      created_locally_at: createdLocallyAt,
+      idempotency_key: idempotencyKey,
+      payload_hash: payloadHash,
+      payload_json: raw.payload_json ?? {},
+    });
+    const receiptRow = await storeOf(this.deps, 'receipts').create({
+      sync_queue_item_id: String(itemRow.id),
+      idempotency_key: idempotencyKey,
+      entity_type: entityType,
+      local_entity_id: localEntityId,
+      accepted_hash: payloadHash,
+      status: 'received',
+    });
+    const prepared: PreparedItem = { ...base, itemRow, receiptRow };
+
+    if (legacy)
+      return {
+        ...prepared,
+        closed: { code: 'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED', context: {} },
+      };
+    if (raw.payload_json && canonicalHash(raw.payload_json) !== payloadHash) {
+      const context = {
+        idempotencyKey,
+        storedHash: canonicalHash(raw.payload_json),
+        receivedHash: payloadHash,
+      };
+      return {
+        ...prepared,
+        closed: { code: 'TEAT.SYNC_INTEGRITY_ERROR', context },
+      };
+    }
+    if (!SUPPORTED_ENTITY_TYPES.includes(entityType))
+      return {
+        ...prepared,
+        closed: {
+          code: 'TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE',
+          context: { supported: [...SUPPORTED_ENTITY_TYPES] },
+        },
+      };
+    const applier = (this.deps.appliers ?? []).find(
+      (candidate) => candidate.entityType === entityType,
+    );
+    if (!applier)
+      return {
+        ...prepared,
+        closed: {
+          code: 'TEAT.SYNC_DESTINATION_NOT_WIRED',
+          context: { entityType },
+        },
+      };
+    const rejection = applier.validate(raw.payload_json ?? {});
+    if (rejection)
+      return {
+        ...prepared,
+        closed: {
+          code: rejection.code,
+          context: { fields: [...rejection.fields] },
+        },
+      };
+    return { ...prepared, applier };
+  }
+
+  /** §4.7 — marca os dois lados quando a janela está ligada. */
+  private async detectConcurrency(
+    prepared: PreparedItem[],
+    input: SubmitSyncBatchInput,
+    tenantId: string,
+    scope: EventScope,
+    windowMinutes: number,
+  ): Promise<void> {
+    const items = storeOf(this.deps, 'items');
+    const handoffStore = this.deps.repositories.handoffs;
+    const handoffs = handoffStore
+      ? ownedBy(await handoffStore.list(), tenantId)
+      : [];
+    const deviceId = String(input.device_id);
+    const agentId = String(input.agent_id);
+    for (const item of prepared) {
+      if (item.entityType !== 'ait' || !item.itemRow) continue;
+      // O ato existe e está na fila: a apuração vale mesmo quando o destino
+      // ainda não está montado (§4.7 fala do item `ait` do lote, não do
+      // applier). Itens sem identidade estável (legado), com integridade
+      // quebrada ou de tipo não suportado ficam fora.
+      const applicable =
+        item.applier !== undefined ||
+        item.closed?.code === 'TEAT.SYNC_DESTINATION_NOT_WIRED';
+      if (!applicable) continue;
+      const rows = ownedBy(await items.list(), tenantId);
+      const candidates = concurrentCandidates({
+        items: rows,
+        handoffs,
+        agentId,
+        deviceId,
+        createdLocallyAt: item.createdLocallyAt,
+        windowMinutes,
+        excludeItemId: String(item.itemRow.id),
+      });
+      if (candidates.length === 0) continue;
+      const bounds = windowBounds(item.createdLocallyAt, windowMinutes);
+      const context = {
+        otherDeviceId: String(candidates[0]!.device_id),
+        ...bounds,
+        windowMinutes,
+        conflictingQueueItemIds: candidates.map((row) => String(row.id)),
+      };
+      item.concurrencySuspect = true;
+      item.concurrencyContext = context;
+      const conflict = await this.openConflict(
+        item.itemRow,
+        'concurrency',
+        'TEAT.SYNC_CONCURRENCY_SUSPECT',
+      );
+      item.concurrencyContext = {
+        ...context,
+        conflictId: (conflict?.id as string) ?? null,
+      };
+      await this.emit(
+        syncConflictOpenedEvent(scope, {
+          conflictId: String(conflict?.id ?? ''),
+          conflictType: 'concurrency',
+          syncQueueItemId: String(item.itemRow.id),
+          reasonCode: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+          openedAt: scope.occurredAt,
+        }),
+      );
+      for (const candidate of candidates) {
+        await this.markCandidate(
+          candidate,
+          item,
+          windowMinutes,
+          scope,
+          tenantId,
+        );
+      }
+    }
+  }
+
+  private async markCandidate(
+    candidate: OpsRow,
+    item: PreparedItem,
+    windowMinutes: number,
+    scope: EventScope,
+    tenantId: string,
+  ): Promise<void> {
+    const bounds = windowBounds(
+      String(candidate.created_locally_at),
+      windowMinutes,
+    );
+    const context = {
+      otherDeviceId: String(item.itemRow?.device_id ?? ''),
+      ...bounds,
+      windowMinutes,
+      conflictingQueueItemIds: [String(item.itemRow?.id ?? '')],
+    };
+    await storeOf(this.deps, 'items').update(String(candidate.id), {
+      status: 'conflict',
+      error_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+    });
+    const receipts = storeOf(this.deps, 'receipts');
+    const existing = ownedBy(await receipts.list(), tenantId).find(
+      (row) => String(row.sync_queue_item_id) === String(candidate.id),
+    );
+    if (existing)
+      await receipts.update(String(existing.id), {
+        status: 'conflict',
+        reason_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+        details_json: context,
+      });
+    const conflict = await this.openConflict(
+      candidate,
+      'concurrency',
+      'TEAT.SYNC_CONCURRENCY_SUSPECT',
+    );
+    await this.emit(
+      syncConflictOpenedEvent(scope, {
+        conflictId: String(conflict?.id ?? ''),
+        conflictType: 'concurrency',
+        syncQueueItemId: String(candidate.id),
+        reasonCode: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+        openedAt: scope.occurredAt,
+      }),
+    );
+  }
+
+  /** §4.3 — aplicação (ou desfecho já decidido) de um item. */
+  private async settle(
+    item: PreparedItem,
+    input: SubmitSyncBatchInput,
+    sequence: number | null,
+    scope: EventScope,
+    batchId: string,
+  ): Promise<SyncReceiptView> {
+    if (item.existingReceipt) return receiptView(item.existingReceipt);
+    if (item.transient) return item.transient;
+    if (!item.itemRow || !item.receiptRow)
+      throw new Error('Sync item was not materialized');
+
+    if (item.concurrencySuspect && item.concurrencyContext && item.closed) {
+      // O ato ficou barrado pela apuração antes de ter destino: o desfecho do
+      // item é o conflito de concorrência (§4.4), e o AIT do servidor ainda
+      // não existe — o evento identifica o ato pelo id local.
+      const view = await this.close(
+        item,
+        'TEAT.SYNC_CONCURRENCY_SUSPECT',
+        item.concurrencyContext,
+        null,
+        'already-open',
+      );
+      await this.emitConcurrencyEvent(item, item.localEntityId, scope);
+      await this.publishItemEvent(item, input, sequence, scope, view, batchId);
+      return view;
+    }
+    if (item.closed) {
+      const view = await this.close(
+        item,
+        item.closed.code,
+        item.closed.context,
+        null,
+      );
+      await this.publishItemEvent(item, input, sequence, scope, view, batchId);
+      return view;
+    }
+
+    const applier = item.applier;
+    if (!applier) throw new Error('Sync item has no applier');
+    const applierItem: SyncEntityApplierItem = {
+      id: String(item.itemRow.id),
+      tenantId: scope.tenantId,
+      trafficAgencyId: String(input.traffic_agency_id),
+      deviceId: String(input.device_id),
+      agentId: String(input.agent_id),
+      entityType: item.entityType,
+      localEntityId: item.localEntityId,
+      idempotencyKey: item.idempotencyKey,
+      payloadHash: item.payloadHash,
+      createdLocallyAt: item.createdLocallyAt,
+      concurrencySuspect: item.concurrencySuspect === true,
+      receiptId: String(item.receiptRow.id),
+    };
+    const suspect = applierItem.concurrencySuspect;
+    const receiptStatus: ReceiptStatus = suspect ? 'conflict' : 'applied';
+    let settled: { serverEntityId: string; receipt?: OpsRow };
+    try {
+      // §4.3 passo 4 — uma transação por item: efeito de domínio, escrituração
+      // da fila, recibo e eventos commitam juntos; qualquer falha reverte tudo.
+      settled = await this.deps.database.tx(async (tx) => {
+        await lockDeviceScope(tx, scope.tenantId, applierItem.deviceId);
+        const applied = await applier.apply(applierItem, tx as Transaction);
+        // A escrituração passa pela porta (§4.8), com a transação do item
+        // explícita: a linha promovida commita junto com o efeito de domínio e
+        // some junto com ele se qualquer passo seguinte falhar.
+        await storeOf(this.deps, 'items').update(
+          applierItem.id,
+          {
+            status: receiptStatus,
+            server_entity_id: applied.serverEntityId,
+            received_at: scope.occurredAt,
+            ...(suspect ? { error_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT' } : {}),
+          },
+          tx,
+        );
+        const receipt = await storeOf(this.deps, 'receipts').update(
+          applierItem.receiptId,
+          {
+            status: receiptStatus,
+            server_entity_id: applied.serverEntityId,
+            applied_at: scope.occurredAt,
+            ...(suspect
+              ? {
+                  reason_code: 'TEAT.SYNC_CONCURRENCY_SUSPECT',
+                  details_json: item.concurrencyContext ?? {},
+                }
+              : {}),
+          },
+          tx,
+        );
+        const sink = teatEventSink(this.deps.outbox);
+        if (item.entityType === 'ait') {
+          if (suspect && item.concurrencyContext)
+            await sink.append(
+              tx as Transaction,
+              concurrencyEnvelope(item, applied.serverEntityId, scope),
+            );
+          else
+            await sink.append(
+              tx as Transaction,
+              aitReceivedEvent(scope, {
+                aitId: applied.serverEntityId,
+                fromState: 'TRANSMITIDO',
+                receiptProtocol: applierItem.receiptId,
+                receivedAt: scope.occurredAt,
+              }),
+            );
+        }
+        await sink.append(
+          tx as Transaction,
+          syncItemReceivedEvent(scope, {
+            batchId,
+            deviceBatchId: String(input.device_batch_id),
+            batchSequence: sequence,
+            itemId: applierItem.id,
+            entityType: item.entityType,
+            localEntityId: item.localEntityId,
+            receiptStatus,
+            errorCode: suspect ? 'TEAT.SYNC_CONCURRENCY_SUSPECT' : null,
+            serverEntityId: applied.serverEntityId,
+          }),
+        );
+        return { serverEntityId: applied.serverEntityId, receipt };
+      });
+    } catch (error) {
+      // §4.3 passo 5 — rollback completo do item; o recibo de recusa é gravado
+      // numa transação própria e nova.
+      const failure = asDomainFailure(error);
+      const view = await this.close(
+        item,
+        failure.code,
+        failure.context,
+        null,
+        failure.conflictType,
+      );
+      await this.publishItemEvent(item, input, sequence, scope, view, batchId);
+      return view;
+    }
+    return receiptView(settled.receipt ?? item.receiptRow);
+  }
+
+  /** Recibo e fila num desfecho terminal, com o conflito quando couber (§4.4). */
+  private async close(
+    item: PreparedItem,
+    code: string,
+    context: Record<string, unknown>,
+    serverEntityId: string | null,
+    conflictType?: ConflictType | 'already-open',
+  ): Promise<SyncReceiptView> {
+    const outcome = outcomeFor(code);
+    const status: ReceiptStatus = outcome.status;
+    await storeOf(this.deps, 'items').update(String(item.itemRow!.id), {
+      status,
+      error_code: code,
+      ...(serverEntityId ? { server_entity_id: serverEntityId } : {}),
+    });
+    const updated = await storeOf(this.deps, 'receipts').update(
+      String(item.receiptRow!.id),
+      {
+        status,
+        reason_code: code,
+        details_json: context,
+        ...(serverEntityId ? { server_entity_id: serverEntityId } : {}),
+      },
+    );
+    const type = conflictType ?? outcome.conflictType;
+    if (type && type !== 'already-open')
+      await this.openConflict(item.itemRow!, type, code);
+    return receiptView(updated ?? item.receiptRow!);
+  }
+
+  /**
+   * `ops.sync_conflict` não tem coluna de contexto (DDL 18): o detalhe do caso
+   * vive em `sync_receipt.details_json`; aqui ficam só os campos do contrato
+   * (§4.2) — tipo, código, hashes, ações admitidas e estado.
+   */
+  private async openConflict(
+    itemRow: OpsRow,
+    conflictType: ConflictType,
+    reasonCode: string,
+    hashes: { local?: string; server?: string } = {},
+  ): Promise<OpsRow | undefined> {
+    const conflicts = this.deps.repositories.conflicts;
+    if (!conflicts) return undefined;
+    return createOpsRow(conflicts, {
+      sync_queue_item_id: String(itemRow.id),
+      conflict_type: conflictType,
+      reason_code: reasonCode,
+      local_hash: hashes.local ?? null,
+      server_hash: hashes.server ?? null,
+      retryable: false,
+      allowed_resolution_actions: [...ALLOWED_RESOLUTION_ACTIONS[conflictType]],
+      description: CONFLICT_DESCRIPTION[conflictType],
+      status: 'open',
+    });
+  }
+
+  private async emitConcurrencyEvent(
+    item: PreparedItem,
+    aitId: string,
+    scope: EventScope,
+  ): Promise<void> {
+    await this.emit(concurrencyEnvelope(item, aitId, scope));
+  }
+
+  private async publishItemEvent(
+    item: PreparedItem,
+    input: SubmitSyncBatchInput,
+    sequence: number | null,
+    scope: EventScope,
+    view: SyncReceiptView,
+    batchId: string,
+  ): Promise<void> {
+    await this.emit(
+      syncItemReceivedEvent(scope, {
+        batchId,
+        deviceBatchId: String(input.device_batch_id),
+        batchSequence: sequence,
+        itemId: String(item.itemRow?.id ?? ''),
+        entityType: item.entityType,
+        localEntityId: item.localEntityId,
+        receiptStatus: (view.status ?? 'received') as ReceiptStatus,
+        errorCode: view.error_code,
+        serverEntityId: view.server_entity_id,
+      }),
+    );
+  }
+
+  private async emit(envelope: TeatEventEnvelope): Promise<void> {
+    const sink = teatEventSink(this.deps.outbox);
+    await this.deps.database.tx((tx) =>
+      sink.append(tx as Transaction, envelope),
+    );
+  }
+}
+
+function concurrencyEnvelope(
+  item: PreparedItem,
+  aitId: string,
+  scope: EventScope,
+): TeatEventEnvelope {
+  const context = item.concurrencyContext ?? {};
+  return aitConcurrencySuspectedEvent(scope, {
+    aitId,
+    agentId: String(item.itemRow?.agent_id ?? ''),
+    deviceId: String(item.itemRow?.device_id ?? ''),
+    otherDeviceId: (context.otherDeviceId as string) ?? null,
+    windowStart: String(context.windowStart),
+    windowEnd: String(context.windowEnd),
+    conflictId: (context.conflictId as string) ?? null,
+  });
+}
+
+function sameSet(left: readonly string[], right: readonly string[]): boolean {
+  const a = [...new Set(left)].sort();
+  const b = [...new Set(right)].sort();
+  return a.length === b.length && a.every((value, index) => value === b[index]);
+}
+
+function replayMismatch(deviceBatchId: string): DetranError {
+  return new DetranError('TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH', {
+    status: 409,
+    context: { deviceBatchId },
+    message: 'Lote retransmitido com contexto diferente do gravado.',
+  });
+}
+
+/**
+ * §4.1 passo 2 — serializa a aceitação por tenant+dispositivo. A porta de
+ * repositório abre transação por instrução, então o bloqueio é tomado na
+ * transação do item, que é onde o efeito de domínio acontece.
+ */
+async function lockDeviceScope(
+  tx: unknown,
+  tenantId: string,
+  deviceId: string,
+): Promise<void> {
+  const queryable = asQueryable(tx);
+  if (!queryable) return;
+  await queryable.query(
+    'select id from ops.sync_batch where tenant_id = $1 and device_id = $2 for update',
+    [tenantId, deviceId],
+  );
+}
+
+function asDomainFailure(error: unknown): {
+  code: string;
+  context: Record<string, unknown>;
+  conflictType?: ConflictType;
+} {
+  const candidate = error as {
+    code?: unknown;
+    context?: unknown;
+  } | null;
+  const code =
+    typeof candidate?.code === 'string' ? candidate.code : 'TEAT.INTERNAL';
+  const context =
+    candidate?.context && typeof candidate.context === 'object'
+      ? (candidate.context as Record<string, unknown>)
+      : {};
+  return { code, context, conflictType: outcomeFor(code).conflictType };
+}
diff --git a/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts b/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts
index 1e92cb7..1738375 100644
--- a/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts
+++ b/backend/domains/ops/offline-sync/tests/integration/sync-batch.integration.spec.ts
@@ -99,6 +99,15 @@ function submitBatch(
   );
 }

+/**
+ * `batch_sequence` é monotônica por `(tenant, device)`: o passo 4 da §4.1 exige
+ * `last + 1` e o índice único `ux_sync_batch_tenant_id_device_id_batch_sequence`
+ * (DDL 18) proíbe repetir. Um contador por arquivo entrega a próxima sequência
+ * a cada lote; os casos que testam replay ou gap passam `batch_sequence`
+ * explicitamente no `overrides`.
+ */
+let nextSequence = 1;
+
 function batchInput(
   overrides: Record<string, unknown> = {},
 ): Record<string, unknown> {
@@ -108,7 +117,7 @@ function batchInput(
     device_id: field.deviceId,
     agent_id: field.agentId,
     device_batch_id: `batch-${randomUUID().slice(0, 8)}`,
-    batch_sequence: 1,
+    batch_sequence: nextSequence++,
     items: [
       {
         entity_type: 'ait',
@@ -145,14 +154,54 @@ afterAll(async () => {
   await client.end();
 });

+/**
+ * Reserva `reserved` do device+turno cobrindo o número 2026000001, criada no
+ * arranjo porque `ops.numbering_consumption.reservation_id` é **not null** com
+ * FK (`fk_ops_numbering_consumption_reservation`, DDL 18): sem ela o applier
+ * não tem onde ancorar a linha `aplicado` da §4.6.
+ */
+async function seedReservation(): Promise<string> {
+  const id = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into ops.numbering_reservation
+       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
+        idempotency_key, start_number, end_number, valid_until, status)
+     values ($1, $2, $3, $4, $5, $6, $7, $8, 2026000001, 2026000001,
+             '2026-12-31T23:59:59-04:00', 'reserved')`,
+    [
+      id,
+      tenantId,
+      field.rangeId,
+      field.agencyId,
+      field.agentId,
+      field.deviceId,
+      field.shiftId,
+      `sync-batch-${id.slice(0, 8)}`,
+    ],
+  );
+  return id;
+}
+
 describe('CTG-0002 §4.3/§4.4 — transação por item e rollback (C-0002-27…29)', () => {
   it('C-0002-27 — dado um item aplicado então na mesma transação existem o AIT em RECEBIDO, a linha numbering_consumption aplicado, o recibo applied e os envelopes na integration.outbox', async () => {
+    const reservationId = await seedReservation();
     const deps = commandDeps(client, tenantId, actorId, {
       appliers: [
         {
           entityType: 'ait',
           validate: () => null,
-          apply: async (item: { id: string }, tx: unknown) => {
+          apply: async (
+            item: {
+              id: string;
+              localEntityId: string;
+              idempotencyKey: string;
+            },
+            tx: unknown,
+          ) => {
             const serverEntityId = randomUUID();
             await (
               tx as {
@@ -182,7 +231,31 @@ describe('CTG-0002 §4.3/§4.4 — transação por item e rollback (C-0002-27…
                 FIXTURES.catalogId,
               ],
             );
-            void item;
+            // §4.6: o applier grava o consumo do número na **mesma**
+            // transação do item; sem esta linha o dublê não representaria o
+            // efeito que C-0002-27 verifica.
+            await (
+              tx as {
+                query(
+                  sql: string,
+                  values: readonly unknown[],
+                ): Promise<unknown>;
+              }
+            ).query(
+              `insert into ops.numbering_consumption
+                 (tenant_id, reservation_id, range_id, number, local_entity_id,
+                  idempotency_key, server_entity_id, finalized_at, status)
+               values ($1, $2, $3, 2026000001, $4, $5, $6,
+                       '2026-09-14T13:05:00-04:00', 'aplicado')`,
+              [
+                tenantId,
+                reservationId,
+                field.rangeId,
+                item.localEntityId,
+                item.idempotencyKey,
+                serverEntityId,
+              ],
+            );
             return { serverEntityId };
           },
         },
@@ -305,10 +378,7 @@ describe('CTG-0002 §4.3/§4.4 — transação por item e rollback (C-0002-27…
     expect((first.receipts as { status: string }[])[0]?.status).toBe(
       'received',
     );
-    const second = await submitBatch(
-      deps,
-      batchInput({ batch_sequence: 2, items: [item] }),
-    );
+    const second = await submitBatch(deps, batchInput({ items: [item] }));
     expect((second.receipts as { status: string }[])[0]?.status).toBe(
       'received',
     );
@@ -375,3 +445,704 @@ describe('CTG-0002 §5.13 — leituras de recibo e recuperação de ACK perdido
     });
   });
 });
+
+/**
+ * CTG-0002 §4.1 e §4.3 (R-0008, TASK-0004 iteração 3) — achados 1, 2 e 3 da
+ * delivery-review do CTG-0002.
+ *
+ * Achado 1 (§4.3 passo 4): a transação **do item** contém o efeito de domínio,
+ * `sync_queue_item.status`/`server_entity_id`, `sync_receipt.status` e os
+ * eventos. Se qualquer um desses passos falhar, **nada** persiste — inclusive o
+ * efeito de domínio já gravado pelo applier.
+ * Achado 2 (§4.1 passos 9–10): `ops.sync_batch` é persistido **antes** dos
+ * envelopes, e todo envelope de item leva `data.batchId` = id persistido.
+ * Achado 3 (§4.1 passo 4): sem lote anterior, `last = 0`.
+ */
+
+/** Reserva `reserved` do device+turno cobrindo um número específico. */
+async function seedReservationFor(
+  deviceId: string,
+  number: number,
+): Promise<string> {
+  const id = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into ops.numbering_reservation
+       (id, tenant_id, range_id, traffic_agency_id, agent_id, device_id, shift_id,
+        idempotency_key, start_number, end_number, valid_until, status)
+     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9,
+             '2026-12-31T23:59:59-04:00', 'reserved')`,
+    [
+      id,
+      tenantId,
+      field.rangeId,
+      field.agencyId,
+      field.agentId,
+      deviceId,
+      field.shiftId,
+      `atomicity-${id.slice(0, 8)}`,
+      number,
+    ],
+  );
+  return id;
+}
+
+/**
+ * Applier-dublê que grava o efeito de domínio completo da §4.6 (AIT em
+ * `RECEBIDO` + `numbering_consumption('aplicado')`) na transação recebida.
+ */
+function domainApplier(number: number, reservationId: string) {
+  /**
+   * Conta as invocações de `apply`: sem isso o caso negativo passaria
+   * vacuamente se o protocolo sequer chegasse a aplicar o item — a asserção
+   * "nada persiste" só prova algo depois que o efeito de domínio foi escrito.
+   */
+  const calls = { apply: 0 };
+  return {
+    calls,
+    entityType: 'ait',
+    validate: () => null,
+    apply: async (
+      item: { localEntityId: string; idempotencyKey: string },
+      tx: unknown,
+    ) => {
+      calls.apply += 1;
+      const serverEntityId = randomUUID();
+      const query = (
+        tx as {
+          query(sql: string, values: readonly unknown[]): Promise<unknown>;
+        }
+      ).query.bind(tx);
+      await query(
+        `insert into inf.ait_ait
+           (id, tenant_id, traffic_agency_id, ait_number, series, agent_id,
+            shift_id, device_id, framing_id, catalog_id, infraction_at,
+            issued_at, issuance_mode, constatation_type, had_approach,
+            location_description, uf, current_status, content_hash)
+         values ($1, $2, $3, $4, 'F', $5, $6, $7, $8, $9,
+                 '2026-09-14T13:00:00-04:00', '2026-09-14T13:05:00-04:00',
+                 'eletronico', 'abordagem', true, 'Av. Djalma Batista',
+                 'AM', 'RECEBIDO', 'sha256:atomicity')`,
+        [
+          serverEntityId,
+          tenantId,
+          field.agencyId,
+          String(number),
+          field.agentId,
+          field.shiftId,
+          field.deviceId,
+          FIXTURES.framingId,
+          FIXTURES.catalogId,
+        ],
+      );
+      await query(
+        `insert into ops.numbering_consumption
+           (tenant_id, reservation_id, range_id, number, local_entity_id,
+            idempotency_key, server_entity_id, finalized_at, status)
+         values ($1, $2, $3, $4, $5, $6, $7, '2026-09-14T13:05:00-04:00',
+                 'aplicado')`,
+        [
+          tenantId,
+          reservationId,
+          field.rangeId,
+          number,
+          item.localEntityId,
+          item.idempotencyKey,
+          serverEntityId,
+        ],
+      );
+      return { serverEntityId };
+    },
+  };
+}
+
+async function freshDevice(): Promise<string> {
+  const id = randomUUID();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`select set_config('app.tenant_id', $1, false)`, [
+    tenantId,
+  ]);
+  await client.query(
+    `insert into ops.ops_operational_device
+       (id, tenant_id, traffic_agency_id, hardware_identifier_hash, os_name,
+        status, app_version, tamper_flag)
+     values ($1, $2, $3, $4, 'android', 'authorized', '1.0.0', false)`,
+    [id, tenantId, field.agencyId, `sha256:fresh-${id.slice(0, 8)}`],
+  );
+  return id;
+}
+
+describe('CTG-0002 §4.3 passo 4 — a transação do item é uma só (achado 1)', () => {
+  it('dado um item cujo efeito de domínio é gravado e cujo passo seguinte da mesma transação falha então nada persiste: nem o AIT, nem o consumo, nem sync_queue_item/sync_receipt applied', async () => {
+    const number = 2026000101;
+    const reservationId = await seedReservationFor(field.deviceId, number);
+    const applier = domainApplier(number, reservationId);
+    /**
+     * O recibo `received` é criado **antes** do `apply` (§4.8: o item carrega
+     * `receiptId` de uma linha já existente), então a falha precisa vir do
+     * passo que a §4.3 passo 4 põe **dentro** da mesma transação: a promoção de
+     * `sync_queue_item`/`sync_receipt` a `applied`. O dublê deixa o applier
+     * gravar o efeito e quebra na primeira dessas escritas. Se elas estiverem
+     * na transação do item, o efeito de domínio some junto; se estiverem numa
+     * transação posterior (o defeito), o AIT sobrevive e este caso acusa.
+     */
+    const deps = commandDeps(client, tenantId, actorId, {
+      appliers: [applier],
+    });
+    for (const store of ['items', 'receipts'] as const) {
+      const target = deps.repositories[store];
+      const original = target.update.bind(target);
+      target.update = async (
+        id: string,
+        patch: Record<string, unknown>,
+      ): Promise<Record<string, unknown> | undefined> => {
+        if (applier.calls.apply > 0 && patch.status === 'applied')
+          throw new Error(
+            `falha injetada na promoção de ${store} a applied, dentro da transação do item`,
+          );
+        return original(id, patch);
+      };
+    }
+    const idempotencyKey = `atomic-${randomUUID().slice(0, 8)}`;
+    const input = batchInput();
+    (input.items as Record<string, unknown>[])[0]!.idempotency_key =
+      idempotencyKey;
+    const aitBefore = await countRows('inf.ait_ait', 'tenant_id = $1', [
+      tenantId,
+    ]);
+    const consumptionBefore = await countRows(
+      'ops.numbering_consumption',
+      'tenant_id = $1',
+      [tenantId],
+    );
+    // O protocolo pode propagar o erro ou devolver o lote com o item não
+    // aplicado — o que a §4.3 fixa é que **nada** do efeito de domínio sobrevive.
+    const outcome = await submitBatch(deps, input).then(
+      (response) => ({ kind: 'resolved' as const, response }),
+      (error: unknown) => ({ kind: 'rejected' as const, error }),
+    );
+    expect(
+      applier.calls.apply,
+      'o applier precisa ter gravado o efeito de domínio antes da falha; sem isso o caso não prova atomicidade',
+    ).toBeGreaterThan(0);
+    expect(
+      await countRows('inf.ait_ait', 'tenant_id = $1 and ait_number = $2', [
+        tenantId,
+        String(number),
+      ]),
+      `o AIT do item não pode sobreviver à falha do passo seguinte (resultado: ${outcome.kind})`,
+    ).toBe(0);
+    expect(await countRows('inf.ait_ait', 'tenant_id = $1', [tenantId])).toBe(
+      aitBefore,
+    );
+    expect(
+      await countRows('ops.numbering_consumption', 'tenant_id = $1', [
+        tenantId,
+      ]),
+    ).toBe(consumptionBefore);
+    expect(
+      await countRows(
+        'ops.sync_queue_item',
+        'tenant_id = $1 and idempotency_key = $2 and status = $3',
+        [tenantId, idempotencyKey, 'applied'],
+      ),
+    ).toBe(0);
+    expect(
+      await countRows(
+        'ops.sync_receipt',
+        'tenant_id = $1 and idempotency_key = $2 and status = $3',
+        [tenantId, idempotencyKey, 'applied'],
+      ),
+    ).toBe(0);
+  });
+
+  it('dado o mesmo item com a gravação do recibo livre então item, recibo e efeito de domínio são commitados juntos e coerentes (server_entity_id igual nos três)', async () => {
+    const number = 2026000102;
+    const reservationId = await seedReservationFor(field.deviceId, number);
+    const deps = commandDeps(client, tenantId, actorId, {
+      appliers: [domainApplier(number, reservationId)],
+    });
+    const input = batchInput();
+    const idempotencyKey = (input.items as { idempotency_key: string }[])[0]!
+      .idempotency_key;
+    const response = await submitBatch(deps, input);
+    expect((response.receipts as { status: string }[])[0]?.status).toBe(
+      'applied',
+    );
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    const item = await client.query<{
+      status: string;
+      server_entity_id: string;
+    }>(
+      `select status, server_entity_id from ops.sync_queue_item
+        where tenant_id = $1 and idempotency_key = $2`,
+      [tenantId, idempotencyKey],
+    );
+    const receipt = await client.query<{
+      status: string;
+      server_entity_id: string;
+      applied_at: string | null;
+    }>(
+      `select status, server_entity_id, applied_at from ops.sync_receipt
+        where tenant_id = $1 and idempotency_key = $2`,
+      [tenantId, idempotencyKey],
+    );
+    expect(item.rows[0]?.status).toBe('applied');
+    expect(receipt.rows[0]?.status).toBe('applied');
+    expect(receipt.rows[0]?.applied_at).not.toBeNull();
+    expect(receipt.rows[0]?.server_entity_id).toBe(
+      item.rows[0]?.server_entity_id,
+    );
+    const ait = await client.query<{ current_status: string }>(
+      'select current_status from inf.ait_ait where id = $1',
+      [item.rows[0]?.server_entity_id],
+    );
+    expect(ait.rows[0]?.current_status).toBe('RECEBIDO');
+    const consumption = await client.query<{ status: string }>(
+      `select status from ops.numbering_consumption
+        where tenant_id = $1 and reservation_id = $2`,
+      [tenantId, reservationId],
+    );
+    expect(consumption.rows[0]?.status).toBe('aplicado');
+  });
+});
+
+describe('CTG-0002 §4.1 passos 9–10 — o lote é persistido antes dos envelopes (achado 2)', () => {
+  it('dado um lote aplicado então todo envelope sync.batch.received do lote leva data.batchId = ops.sync_batch.id (nunca null) e é gravado depois da linha do lote', async () => {
+    const number = 2026000103;
+    const reservationId = await seedReservationFor(field.deviceId, number);
+    const deps = commandDeps(client, tenantId, actorId, {
+      appliers: [domainApplier(number, reservationId)],
+    });
+    const deviceBatchId = `order-${randomUUID().slice(0, 8)}`;
+    const response = await submitBatch(
+      deps,
+      batchInput({ device_batch_id: deviceBatchId }),
+    );
+    const batchId = response.batchId as string;
+    expect(batchId).toEqual(expect.any(String));
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    const persisted = await client.query<{
+      id: string;
+      submitted_at: string;
+    }>(
+      `select id, submitted_at from ops.sync_batch
+        where tenant_id = $1 and device_batch_id = $2`,
+      [tenantId, deviceBatchId],
+    );
+    expect(persisted.rows[0]?.id).toBe(batchId);
+    const envelopes = await client.query<{
+      batch_id: string | null;
+      created_at: string;
+      topic: string;
+    }>(
+      `select payload->'data'->>'batchId' as batch_id, created_at, topic
+         from integration.outbox
+        where tenant_id = $1 and payload->'data'->>'deviceBatchId' = $2
+        order by created_at, id`,
+      [tenantId, deviceBatchId],
+    );
+    expect(envelopes.rows.length).toBeGreaterThan(0);
+    for (const envelope of envelopes.rows) {
+      expect(
+        envelope.batch_id,
+        `envelope ${envelope.topic} saiu com data.batchId nulo: o lote precisa ser persistido antes dos eventos (§4.1 passos 9–10)`,
+      ).toBe(batchId);
+      expect(new Date(envelope.created_at).getTime()).toBeGreaterThanOrEqual(
+        new Date(persisted.rows[0]!.submitted_at).getTime(),
+      );
+    }
+  });
+});
+
+describe('CTG-0002 §4.1 passo 4 — primeiro lote sequenciado do device (achado 3)', () => {
+  it('dado um device sem lote anterior quando chega batch_sequence = 2 então 422 TEAT.SYNC_BATCH_SEQUENCE_GAP com expectedSequence 1 e received 2, e nenhum sync_batch é gravado; em seguida batch_sequence = 1 é aceito', async () => {
+    const deviceId = await freshDevice();
+    const number = 2026000104;
+    const reservationId = await seedReservationFor(deviceId, number);
+    const deps = commandDeps(client, tenantId, actorId, {
+      appliers: [domainApplier(number, reservationId)],
+    });
+    await expect(
+      submitBatch(deps, batchInput({ device_id: deviceId, batch_sequence: 2 })),
+    ).rejects.toMatchObject({
+      code: 'TEAT.SYNC_BATCH_SEQUENCE_GAP',
+      status: 422,
+      context: expect.objectContaining({ expectedSequence: 1, received: 2 }),
+    });
+    expect(
+      await countRows('ops.sync_batch', 'tenant_id = $1 and device_id = $2', [
+        tenantId,
+        deviceId,
+      ]),
+    ).toBe(0);
+    const accepted = await submitBatch(
+      deps,
+      batchInput({ device_id: deviceId, batch_sequence: 1 }),
+    );
+    expect(accepted.batch_sequence).toBe(1);
+    expect(
+      await countRows('ops.sync_batch', 'tenant_id = $1 and device_id = $2', [
+        tenantId,
+        deviceId,
+      ]),
+    ).toBe(1);
+  });
+});
+
+/**
+ * CTG-0002 §14 consequência (c) (R-0008, TASK-0004 iteração 4) — achado do
+ * ciclo 3 da delivery-review.
+ *
+ * A §14 reordenou o lote: `ops.sync_batch` nasce no passo 5, **antes** de
+ * qualquer item, e o fechamento (`accepted_items`, `receipts_json.item_ids`) é
+ * o passo 9. Um lote interrompido entre 5 e 9 fica durável com o conjunto de
+ * itens materializados **incompleto** — e, reenviado com o mesmo
+ * `device_batch_id` e o mesmo conjunto de itens, é replay legítimo: devolve os
+ * recibos já emitidos sem reaplicar e **completa** a materialização dos que
+ * faltam.
+ *
+ * Nota sobre o negativo. A §14 (c) fixa a comparação contra o conjunto
+ * **materializado**; só com ele, "chave nova que não estava no envio original"
+ * e "item que ainda faltava materializar" são indistinguíveis. A implementação
+ * de TASK-0005 fecha essa lacuna gravando no passo 5, em
+ * `ops.sync_batch.receipts_json.declared_keys`, o conjunto **declarado** no
+ * envio original — chave de conveniência da implementação, **sem** linha no
+ * contrato (proposta de OD no relatório da tarefa). Os casos abaixo cobrem os
+ * dois regimes: com `declared_keys` gravado, o reenvio precisa casar o conjunto
+ * declarado (omitir ou acrescentar chave → 409); sem ele (linha anterior a esta
+ * adenda), vale a letra da §14 (c) — materializadas ⊆ reenviadas é replay
+ * legítimo e completa o que falta.
+ */
+describe('CTG-0002 §14 (c) — replay de lote interrompido completa a materialização', () => {
+  /** Applier que conta as invocações por `idempotency_key`. */
+  function countingApplier(reservationByNumber: Map<number, string>) {
+    const numbers = [...reservationByNumber.keys()].sort((a, b) => a - b);
+    const calls = new Map<string, number>();
+    let used = 0;
+    return {
+      calls,
+      entityType: 'ait',
+      validate: () => null,
+      apply: async (
+        item: { localEntityId: string; idempotencyKey: string },
+        tx: unknown,
+      ) => {
+        calls.set(
+          item.idempotencyKey,
+          (calls.get(item.idempotencyKey) ?? 0) + 1,
+        );
+        const number = numbers[used++]!;
+        const reservationId = reservationByNumber.get(number)!;
+        const serverEntityId = randomUUID();
+        const query = (
+          tx as {
+            query(sql: string, values: readonly unknown[]): Promise<unknown>;
+          }
+        ).query.bind(tx);
+        await query(
+          `insert into inf.ait_ait
+             (id, tenant_id, traffic_agency_id, ait_number, series, agent_id,
+              shift_id, device_id, framing_id, catalog_id, infraction_at,
+              issued_at, issuance_mode, constatation_type, had_approach,
+              location_description, uf, current_status, content_hash)
+           values ($1, $2, $3, $4, 'F', $5, $6, $7, $8, $9,
+                   '2026-09-14T13:00:00-04:00', '2026-09-14T13:05:00-04:00',
+                   'eletronico', 'abordagem', true, 'Av. Djalma Batista',
+                   'AM', 'RECEBIDO', 'sha256:resume')`,
+          [
+            serverEntityId,
+            tenantId,
+            field.agencyId,
+            String(number),
+            field.agentId,
+            field.shiftId,
+            field.deviceId,
+            FIXTURES.framingId,
+            FIXTURES.catalogId,
+          ],
+        );
+        await query(
+          `insert into ops.numbering_consumption
+             (tenant_id, reservation_id, range_id, number, local_entity_id,
+              idempotency_key, server_entity_id, finalized_at, status)
+           values ($1, $2, $3, $4, $5, $6, $7, '2026-09-14T13:05:00-04:00',
+                   'aplicado')`,
+          [
+            tenantId,
+            reservationId,
+            field.rangeId,
+            number,
+            item.localEntityId,
+            item.idempotencyKey,
+            serverEntityId,
+          ],
+        );
+        return { serverEntityId };
+      },
+    };
+  }
+
+  /** Item completo do lote, com hash canônico do próprio payload. */
+  function resumeItem(key: string): Record<string, unknown> {
+    const payload = aitPayload('2026000201');
+    return {
+      entity_type: 'ait',
+      local_entity_id: randomUUID(),
+      idempotency_key: key,
+      created_locally_at: '2026-09-14T13:05:00.000Z',
+      payload_json: payload,
+      payload_hash: canonicalHash(payload),
+    };
+  }
+
+  /**
+   * Arranja o lote interrompido: a linha de `ops.sync_batch` do passo 5 existe
+   * com `accepted_items = 0` e `receipts_json.item_ids` contendo **só** o
+   * primeiro item, que já tem `sync_queue_item` e `sync_receipt` `received`.
+   */
+  async function interruptedBatch(
+    deviceId: string,
+    deviceBatchId: string,
+    first: Record<string, unknown>,
+    declaredKeys?: readonly string[],
+  ): Promise<{ batchId: string; itemId: string; receiptId: string }> {
+    const batchId = randomUUID();
+    const itemId = randomUUID();
+    const receiptId = randomUUID();
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    await client.query(`select set_config('app.tenant_id', $1, false)`, [
+      tenantId,
+    ]);
+    await client.query(
+      `insert into ops.sync_batch
+         (id, tenant_id, traffic_agency_id, agent_id, device_id, device_batch_id,
+          batch_sequence, submitted_at, accepted_items, receipts_json)
+       values ($1, $2, $3, $4, $5, $6, 1, '2026-09-14T13:06:00-04:00', 0,
+               '{"item_ids": []}'::jsonb)`,
+      [
+        batchId,
+        tenantId,
+        field.agencyId,
+        field.agentId,
+        deviceId,
+        deviceBatchId,
+      ],
+    );
+    await client.query(
+      `insert into ops.sync_queue_item
+         (id, tenant_id, traffic_agency_id, device_id, agent_id, entity_type,
+          local_entity_id, status, created_locally_at, idempotency_key,
+          payload_hash, payload_json)
+       values ($1, $2, $3, $4, $5, 'ait', $6, 'received', $7, $8, $9, $10)`,
+      [
+        itemId,
+        tenantId,
+        field.agencyId,
+        deviceId,
+        field.agentId,
+        first.local_entity_id,
+        first.created_locally_at,
+        first.idempotency_key,
+        first.payload_hash,
+        JSON.stringify(first.payload_json),
+      ],
+    );
+    await client.query(
+      `insert into ops.sync_receipt
+         (id, tenant_id, sync_queue_item_id, idempotency_key, entity_type,
+          local_entity_id, accepted_hash, status, reason_code)
+       values ($1, $2, $3, $4, 'ait', $5, $6, 'received', null)`,
+      [
+        receiptId,
+        tenantId,
+        itemId,
+        first.idempotency_key,
+        first.local_entity_id,
+        first.payload_hash,
+      ],
+    );
+    await client.query(
+      `update ops.sync_batch set receipts_json = $2::jsonb where id = $1`,
+      [
+        batchId,
+        JSON.stringify(
+          declaredKeys
+            ? { item_ids: [itemId], declared_keys: [...declaredKeys] }
+            : { item_ids: [itemId] },
+        ),
+      ],
+    );
+    return { batchId, itemId, receiptId };
+  }
+
+  async function seedTwoReservations(
+    deviceId: string,
+  ): Promise<Map<number, string>> {
+    const map = new Map<number, string>();
+    for (const number of [2026000201, 2026000202]) {
+      map.set(number, await seedReservationFor(deviceId, number));
+    }
+    return map;
+  }
+
+  it('dado um lote interrompido depois do passo 5, com só o primeiro de dois itens materializado, quando reenviado com o mesmo device_batch_id e os mesmos dois itens então 200: o recibo do item já emitido volta sem reaplicar e o item faltante é materializado e aplicado', async () => {
+    const deviceId = await freshDevice();
+    const reservations = await seedTwoReservations(deviceId);
+    const deviceBatchId = `resume-${randomUUID().slice(0, 8)}`;
+    const first = resumeItem(`resume-first-${randomUUID().slice(0, 8)}`);
+    const second = resumeItem(`resume-second-${randomUUID().slice(0, 8)}`);
+    const interrupted = await interruptedBatch(deviceId, deviceBatchId, first, [
+      first.idempotency_key as string,
+      second.idempotency_key as string,
+    ]);
+    const applier = countingApplier(reservations);
+    const deps = commandDeps(client, tenantId, actorId, {
+      appliers: [applier],
+    });
+
+    const response = await submitBatch(deps, {
+      traffic_agency_id: field.agencyId,
+      device_id: deviceId,
+      agent_id: field.agentId,
+      device_batch_id: deviceBatchId,
+      batch_sequence: 1,
+      items: [first, second],
+    });
+
+    expect(response.batchId).toBe(interrupted.batchId);
+    const receipts = response.receipts as {
+      idempotency_key: string;
+      status: string;
+    }[];
+    expect(receipts).toHaveLength(2);
+    const firstReceipt = receipts.find(
+      (receipt) => receipt.idempotency_key === first.idempotency_key,
+    );
+    const secondReceipt = receipts.find(
+      (receipt) => receipt.idempotency_key === second.idempotency_key,
+    );
+    // (c) "devolve os recibos já emitidos sem reaplicar"
+    expect(firstReceipt?.status).toBe('received');
+    expect(
+      applier.calls.get(first.idempotency_key as string) ?? 0,
+      'o item já materializado não pode ser reaplicado no replay (§14 c)',
+    ).toBe(0);
+    // (c) "completa a materialização dos itens que faltam"
+    expect(secondReceipt?.status).toBe('applied');
+    expect(applier.calls.get(second.idempotency_key as string) ?? 0).toBe(1);
+
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    const closed = await client.query<{
+      accepted_items: number;
+      receipts_json: { item_ids?: string[] };
+    }>(
+      'select accepted_items, receipts_json from ops.sync_batch where id = $1',
+      [interrupted.batchId],
+    );
+    // passo 9: o lote fecha com os dois itens; `received` + `applied` contam.
+    expect(closed.rows[0]?.accepted_items).toBe(2);
+    const itemIds = closed.rows[0]?.receipts_json?.item_ids ?? [];
+    expect(itemIds).toHaveLength(2);
+    expect(itemIds).toContain(interrupted.itemId);
+    const persisted = await client.query<{ count: string }>(
+      `select count(*)::text as count from ops.sync_queue_item
+        where tenant_id = $1 and idempotency_key = any($2::text[])`,
+      [tenantId, [first.idempotency_key, second.idempotency_key]],
+    );
+    expect(Number(persisted.rows[0]!.count)).toBe(2);
+    const applied = await client.query<{ count: string }>(
+      `select count(*)::text as count from ops.sync_receipt
+        where tenant_id = $1 and idempotency_key = $2 and status = 'applied'`,
+      [tenantId, second.idempotency_key],
+    );
+    expect(Number(applied.rows[0]!.count)).toBe(1);
+  });
+
+  it('dado o mesmo lote interrompido quando reenviado **omitindo** a chave já materializada então 409 TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH com context.deviceBatchId', async () => {
+    const deviceId = await freshDevice();
+    const reservations = await seedTwoReservations(deviceId);
+    const deviceBatchId = `resume-miss-${randomUUID().slice(0, 8)}`;
+    const first = resumeItem(`miss-first-${randomUUID().slice(0, 8)}`);
+    const second = resumeItem(`miss-second-${randomUUID().slice(0, 8)}`);
+    await interruptedBatch(deviceId, deviceBatchId, first, [
+      first.idempotency_key as string,
+      second.idempotency_key as string,
+    ]);
+    const deps = commandDeps(client, tenantId, actorId, {
+      appliers: [countingApplier(reservations)],
+    });
+    await expect(
+      submitBatch(deps, {
+        traffic_agency_id: field.agencyId,
+        device_id: deviceId,
+        agent_id: field.agentId,
+        device_batch_id: deviceBatchId,
+        batch_sequence: 1,
+        items: [second],
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH',
+      status: 409,
+      context: expect.objectContaining({ deviceBatchId }),
+    });
+  });
+
+  it('dado um lote interrompido cujo envio original declarou duas chaves quando reenviado com uma chave que **não** estava nesse envio então 409 TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH — o replay completa o que faltava, nunca aceita item novo', async () => {
+    const deviceId = await freshDevice();
+    const reservations = await seedTwoReservations(deviceId);
+    const deviceBatchId = `resume-extra-${randomUUID().slice(0, 8)}`;
+    const first = resumeItem(`extra-first-${randomUUID().slice(0, 8)}`);
+    const second = resumeItem(`extra-second-${randomUUID().slice(0, 8)}`);
+    const intruder = resumeItem(`extra-intruder-${randomUUID().slice(0, 8)}`);
+    await interruptedBatch(deviceId, deviceBatchId, first, [
+      first.idempotency_key as string,
+      second.idempotency_key as string,
+    ]);
+    const deps = commandDeps(client, tenantId, actorId, {
+      appliers: [countingApplier(reservations)],
+    });
+    await expect(
+      submitBatch(deps, {
+        traffic_agency_id: field.agencyId,
+        device_id: deviceId,
+        agent_id: field.agentId,
+        device_batch_id: deviceBatchId,
+        batch_sequence: 1,
+        items: [first, intruder],
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH',
+      status: 409,
+      context: expect.objectContaining({ deviceBatchId }),
+    });
+  });
+
+  it('dado um lote interrompido **sem** o conjunto declarado gravado (linha anterior a esta adenda) quando reenviado com as mesmas chaves materializadas mais as faltantes então 200 — a comparação cai no conjunto materializado, como diz a §14 (c)', async () => {
+    const deviceId = await freshDevice();
+    const reservations = await seedTwoReservations(deviceId);
+    const deviceBatchId = `resume-legacy-${randomUUID().slice(0, 8)}`;
+    const first = resumeItem(`legacy-first-${randomUUID().slice(0, 8)}`);
+    const second = resumeItem(`legacy-second-${randomUUID().slice(0, 8)}`);
+    const interrupted = await interruptedBatch(deviceId, deviceBatchId, first);
+    const applier = countingApplier(reservations);
+    const deps = commandDeps(client, tenantId, actorId, {
+      appliers: [applier],
+    });
+    const response = await submitBatch(deps, {
+      traffic_agency_id: field.agencyId,
+      device_id: deviceId,
+      agent_id: field.agentId,
+      device_batch_id: deviceBatchId,
+      batch_sequence: 1,
+      items: [first, second],
+    });
+    expect(response.batchId).toBe(interrupted.batchId);
+    expect(response.receipts).toHaveLength(2);
+    expect(applier.calls.get(first.idempotency_key as string) ?? 0).toBe(0);
+    expect(applier.calls.get(second.idempotency_key as string) ?? 0).toBe(1);
+  });
+});

````
