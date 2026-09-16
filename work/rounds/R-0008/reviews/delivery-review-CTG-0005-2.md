# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `teat-backend` (rodada `R-0008`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran-worktrees/teat-backend`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/teat-build-pack.md` — apenas a seção do WP `WP-T3` e o "mapa entregável → definições"
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

## Nota do maestro — delivery-review CTG-0005, ciclo 2 (restrito aos 4 achados do ciclo 1)

Veredito anterior: `REVIEW` (`reviews/delivery-review-CTG-0005.json`, itens 4, 6, 7, 11). Resolução do Architect em CTG-0005 §9 itens 14–18 (anexos). Correções: (item 4) §3.1 atualizado formalmente — `scanControllers → { routes, problems }` (os problemas de varredura, C-5-15, nascem aí) e `collectOperations(contractsDir, blueprintsDir = default)` com segundo parâmetro opcional implementado; (item 6) Inspector iteração 2 — testes independentes para C-5-03, 05, 07, 08, 12…16, 22…26 mais quatro casos de `checkClients` e CLI `--check`; `schemas.test.mjs` com validador mínimo local; C-5-16/C-5-22 contra o repositório real (92 operações, clientes em sincronia); total `node --test` 35/35 (arquivos de teste anexos na íntegra); (item 7) `checkClients` + `generate-clients.mjs --check` (diretório temporário, comparação byte a byte, `stale|missing|orphan-client`, sem escrita) ligado em `contracts:check`, que agora imprime três linhas OK (`clients in sync: 47`); (item 11) TASK-0011 concluída — `teat-build-pack.md` §WP-T2/WP-T3, `teat-route-contract.md` §9, `schemas/README.md`, `rait-fixtures.md` §9 TEAT, `parameter-catalogue.md`, `open-decisions-rait.md` §F com OD-T13…OD-T73, `backlog.md`; catálogo de erros com os três códigos `TEAT.SYNC_INVALID_*` soletrados (OD-T72, ato do maestro). Achado colateral: C-5-26 revelou `crash-record` fora do enum do schema do lote → §9.18, enum alinhado a `batch-protocol.ts`. Gates completos (`pnpm check`, `backend:test:ci`) em execução sobre este candidato após reseed (ciclo 1: ambos exit 0, 52 execuções, 1543 testes). Avalie **somente** os quatro itens. Anexos: §9.14–§9.18; diff de `check-commands.mjs`, `generate-clients.mjs`, `package.json`, schema do lote, catálogo; `--stat` dos testes e da documentação; os três arquivos de teste na íntegra.

## Anexo — CTG-0005 §9.14–§9.18

```markdown
14. **Delivery-review ciclo 1 (`REVIEW`, 4 achados) — item 4, assinaturas**: §3.1 passa a ler
    `scanControllers(controllerRoots) → { routes: Array<{ method, path, file, line }>, problems }`
    (os `problems` de varredura — decorador não literal, C-5-15 — nascem aqui e `checkCommands` os
    repassa) e `collectOperations(contractsDir, blueprintsDir = <root>/docs/framework/blueprints)` —
    segundo parâmetro **opcional** com o default de §3.1. Engineer: tornar `blueprintsDir` opcional com
    esse default; nada mais muda na API.
15. **Item 7 — gate dos clientes em `contracts:check` (C-5-2x)**: `generate-clients.mjs` ganha
    `export async function checkClients({ contractsDir, outDir }) → Promise<{ ok, problems }>` com
    `problems[].kind ∈ 'stale-client' | 'missing-client' | 'orphan-client'` (`file`, `detail`), sem
    escrever em `outDir` (gera em diretório temporário e compara byte a byte), e o CLI `--check`:
    exit 0 com stdout `clients in sync: <n>`; exit 1 com uma linha por problema em stderr.
    `scripts["contracts:check"]` = `node tools/contracts/generate-openapi.mjs --check && node
tools/contracts/check-commands.mjs && node tools/contracts/generate-clients.mjs --check`.
16. **Item 6 — cobertura de §7 (Inspector, iteração 2)**: testes para C-5-03, C-5-05, C-5-07, C-5-08,
    C-5-12…C-5-16, C-5-22…C-5-26 e para `checkClients`/`--check` (em sincronia; `stale-client`;
    `orphan-client`; `missing-client`). C-5-16 e C-5-22 rodam contra o repositório real sem escrever
    (`checkCommands()` e `checkClients()` com defaults). C-5-23/C-5-24/C-5-26 validam os schemas com
    `ajv` (já em `node_modules`, dependência transitiva; se não importável da raiz, validador mínimo
    local para `type`/`required`/`properties`/`const`/`enum`/`additionalProperties`). C-5-25: os envelopes
    são fixtures literais copiadas dos `*.spec.ts` dos `events.ts` de cada módulo (citando o arquivo de
    origem no comentário), não importação de TS.
17. **Item 11 — TASK-0011 integra CTG-0005**: a documentação (build pack, route contract §9, schemas
    README, fixtures, catálogo, OD-T13…T73) entra no mesmo commit/PR do grupo; o ciclo 2 da
    delivery-review só é aberto com TASK-0011 concluída.
18. **C-5-26 × §5.1 `entity_type`** (Inspector iteração 2 / Engineer iteração 2): o código montado
    (`batch-protocol.ts`) aceita seis tipos — os cinco de §4.3 do route contract **e** `crash-record`
    (BOAT; destino não ligado → item rejeitado, não erro de forma) — e o e2e real usa `crash-record`.
    Pelo princípio do item 2 (o contrato transcreve o comportamento montado), o `enum` de
    `items[].entity_type` em `teat-offline-sync-batch.schema.json` passa a listar os seis tipos de
    `batch-protocol.ts`, com a `description` dizendo que `crash-record` é aceito na forma e rejeitado no
    destino (`TEAT.SYNC_DESTINATION_NOT_WIRED`). §5.1 linha "crash-record … não é aceito aqui" fica
    substituída por esta. Engineer aplica; C-5-26 não muda.
```

## Anexo — diff

```diff
diff --git a/docs/framework/arch/teat-error-catalog.md b/docs/framework/arch/teat-error-catalog.md
index d8c79bb..6712817 100644
--- a/docs/framework/arch/teat-error-catalog.md
+++ b/docs/framework/arch/teat-error-catalog.md
@@ -17,26 +17,26 @@ de origem para manter compatibilidade com o cliente móvel já validado.

 ## 1. Protocolo de sincronização e numeração (síncronos no `POST sync-batches` ou por item)

-| Código                                                                                                                              | Status/onde     | Quando                                                                | `context`                                      | Recuperação na UI                               |
-| ----------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
-| `TEAT.SYNC_BATCH_SEQUENCE_REPLAYED`                                                                                                 | 409             | `batch_sequence` repetido sob novo `device_batch_id`                  | `expectedSequence`, `received`                 | descarta lote, reenvia com a sequência esperada |
-| `TEAT.SYNC_BATCH_SEQUENCE_GAP`                                                                                                      | 422             | sequência além de `last accepted + 1`                                 | `expectedSequence`, `received`                 | reenvia lotes anteriores primeiro               |
-| `TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH`                                                                                           | 409             | mesmo `device_batch_id` com itens ou sequência diferentes             | `deviceBatchId`                                | incidente técnico; não reenviar; suporte        |
-| `TEAT.SYNC_INTEGRITY_ERROR`                                                                                                         | item `rejected` | mesma `idempotency_key` com hash canônico diferente                   | `idempotencyKey`, `storedHash`, `receivedHash` | conflito de integridade → `sync-conflict`       |
-| `TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE`                                                                                                 | item `rejected` | `entity_type` fora da lista                                           | `supported[]`                                  | atualizar app                                   |
-| `TEAT.SYNC_INVALID_CANONICAL_AIT`                                                                                                   | item `rejected` | payload do AIT não passa no schema canônico                           | `fields[]`                                     | corrigir localmente e reenviar                  |
-| `TEAT.SYNC_INVALID_ADMINISTRATIVE_MEASURE_RECORD` · `…_CRASH_RECORD` · `…_ALCOHOL_SIGNS_TERM_RECORD` · `…_AIT_CANCELLATION_REQUEST` | item `rejected` | idem por tipo                                                         | `fields[]`                                     | idem                                            |
-| `TEAT.SYNC_DESTINATION_NOT_WIRED`                                                                                                   | 500 por item    | tipo suportado sem destino montado (falha de implantação)             | `entityType`                                   | suporte; item permanece `received`              |
-| `TEAT.SYNC_ITEM_CONFLICT`                                                                                                           | item `conflict` | divergência local × servidor                                          | `conflictId`, `conflictType`                   | supervisor resolve em `sync-conflict`           |
-| `TEAT.SYNC_CONCURRENCY_SUSPECT`                                                                                                     | item `conflict` | mesmo agente, dispositivos distintos, mesmo intervalo ([RN-TEAT-111]) | `otherDeviceId`, `windowStart`, `windowEnd`    | bloqueado até apuração da autoridade (web)      |
-| `TEAT.SYNC_RECEIPT_NOT_FOUND`                                                                                                       | 404             | recibo por `idempotency_key` inexistente no tenant                    | —                                              | reenviar item                                   |
-| `TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED`                                                                                                 | item `received` | item sem `idempotency_key` (caminho legado) nunca é aplicado          | —                                              | atualizar app                                   |
-| `TEAT.NUMBERING_RANGE_EXHAUSTED`                                                                                                    | 422             | faixa `ESGOTADA`                                                      | `rangeId`, `series`                            | supervisor cria faixa                           |
-| `TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS`                                                                                          | 409             | reserva ativa para o mesmo dispositivo/turno                          | `reservationId`                                | usa a existente                                 |
-| `TEAT.NUMBERING_RESERVATION_EXPIRED`                                                                                                | 422 / item      | número de reserva `EXPIRADA`/`CANCELADA` usado em AIT                 | `reservationId`, `number`                      | AIT vai a conflito; número nunca reatribuído    |
-| `TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT`                                                                                          | 422             | reserva de turno anterior usada                                       | `reservationId`, `shiftId`                     | pede nova reserva                               |
-| `TEAT.NUMBERING_NUMBER_ALREADY_APPLIED`                                                                                             | item `rejected` | número já consumido por AIT aplicado                                  | `number`, `aitId`                              | conflito; nunca renumerar                       |
-| `TEAT.NUMBERING_RECONCILE_MISMATCH`                                                                                                 | 422             | `claimed_numbers` fora do intervalo da reserva                        | `outOfRange[]`                                 | supervisor                                      |
+| Código                                                                                                                                                                              | Status/onde     | Quando                                                                | `context`                                      | Recuperação na UI                               |
+| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
+| `TEAT.SYNC_BATCH_SEQUENCE_REPLAYED`                                                                                                                                                 | 409             | `batch_sequence` repetido sob novo `device_batch_id`                  | `expectedSequence`, `received`                 | descarta lote, reenvia com a sequência esperada |
+| `TEAT.SYNC_BATCH_SEQUENCE_GAP`                                                                                                                                                      | 422             | sequência além de `last accepted + 1`                                 | `expectedSequence`, `received`                 | reenvia lotes anteriores primeiro               |
+| `TEAT.SYNC_BATCH_REPLAY_CONTEXT_MISMATCH`                                                                                                                                           | 409             | mesmo `device_batch_id` com itens ou sequência diferentes             | `deviceBatchId`                                | incidente técnico; não reenviar; suporte        |
+| `TEAT.SYNC_INTEGRITY_ERROR`                                                                                                                                                         | item `rejected` | mesma `idempotency_key` com hash canônico diferente                   | `idempotencyKey`, `storedHash`, `receivedHash` | conflito de integridade → `sync-conflict`       |
+| `TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE`                                                                                                                                                 | item `rejected` | `entity_type` fora da lista                                           | `supported[]`                                  | atualizar app                                   |
+| `TEAT.SYNC_INVALID_CANONICAL_AIT`                                                                                                                                                   | item `rejected` | payload do AIT não passa no schema canônico                           | `fields[]`                                     | corrigir localmente e reenviar                  |
+| `TEAT.SYNC_INVALID_ADMINISTRATIVE_MEASURE_RECORD` · `TEAT.SYNC_INVALID_CRASH_RECORD` · `TEAT.SYNC_INVALID_ALCOHOL_SIGNS_TERM_RECORD` · `TEAT.SYNC_INVALID_AIT_CANCELLATION_REQUEST` | item `rejected` | idem por tipo                                                         | `fields[]`                                     | idem                                            |
+| `TEAT.SYNC_DESTINATION_NOT_WIRED`                                                                                                                                                   | 500 por item    | tipo suportado sem destino montado (falha de implantação)             | `entityType`                                   | suporte; item permanece `received`              |
+| `TEAT.SYNC_ITEM_CONFLICT`                                                                                                                                                           | item `conflict` | divergência local × servidor                                          | `conflictId`, `conflictType`                   | supervisor resolve em `sync-conflict`           |
+| `TEAT.SYNC_CONCURRENCY_SUSPECT`                                                                                                                                                     | item `conflict` | mesmo agente, dispositivos distintos, mesmo intervalo ([RN-TEAT-111]) | `otherDeviceId`, `windowStart`, `windowEnd`    | bloqueado até apuração da autoridade (web)      |
+| `TEAT.SYNC_RECEIPT_NOT_FOUND`                                                                                                                                                       | 404             | recibo por `idempotency_key` inexistente no tenant                    | —                                              | reenviar item                                   |
+| `TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED`                                                                                                                                                 | item `received` | item sem `idempotency_key` (caminho legado) nunca é aplicado          | —                                              | atualizar app                                   |
+| `TEAT.NUMBERING_RANGE_EXHAUSTED`                                                                                                                                                    | 422             | faixa `ESGOTADA`                                                      | `rangeId`, `series`                            | supervisor cria faixa                           |
+| `TEAT.NUMBERING_RESERVATION_ACTIVE_EXISTS`                                                                                                                                          | 409             | reserva ativa para o mesmo dispositivo/turno                          | `reservationId`                                | usa a existente                                 |
+| `TEAT.NUMBERING_RESERVATION_EXPIRED`                                                                                                                                                | 422 / item      | número de reserva `EXPIRADA`/`CANCELADA` usado em AIT                 | `reservationId`, `number`                      | AIT vai a conflito; número nunca reatribuído    |
+| `TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT`                                                                                                                                          | 422             | reserva de turno anterior usada                                       | `reservationId`, `shiftId`                     | pede nova reserva                               |
+| `TEAT.NUMBERING_NUMBER_ALREADY_APPLIED`                                                                                                                                             | item `rejected` | número já consumido por AIT aplicado                                  | `number`, `aitId`                              | conflito; nunca renumerar                       |
+| `TEAT.NUMBERING_RECONCILE_MISMATCH`                                                                                                                                                 | 422             | `claimed_numbers` fora do intervalo da reserva                        | `outOfRange[]`                                 | supervisor                                      |

 ## 2. Bootstrap, sessão, dispositivo e turno

diff --git a/docs/framework/schemas/teat-offline-sync-batch.schema.json b/docs/framework/schemas/teat-offline-sync-batch.schema.json
new file mode 100644
index 0000000..0393663
--- /dev/null
+++ b/docs/framework/schemas/teat-offline-sync-batch.schema.json
@@ -0,0 +1,102 @@
+{
+  "$schema": "https://json-schema.org/draft/2020-12/schema",
+  "$id": "https://detran.example.invalid/schemas/teat-offline-sync-batch.schema.json",
+  "title": "TEAT Offline Sync Batch",
+  "description": "Lote do protocolo de sincronização offline (teat-route-contract.md §4.3; CTG-0002 §4 e §5.13). Reconciliado com submitSyncBatchSchema de backend/domains/ops/offline-sync/src/handwritten/submit-batch.command.ts (CTG-0002 §14d, declared_keys) — não é o arquivo da origem (../teat), cujas chaves de item (local_id, content_hash, payload) o comando montado não lê (OD-T67).",
+  "type": "object",
+  "additionalProperties": false,
+  "required": [
+    "traffic_agency_id",
+    "device_id",
+    "agent_id",
+    "device_batch_id",
+    "items"
+  ],
+  "properties": {
+    "traffic_agency_id": {
+      "type": "string",
+      "format": "uuid"
+    },
+    "device_id": {
+      "type": "string",
+      "format": "uuid"
+    },
+    "agent_id": {
+      "type": "string",
+      "format": "uuid"
+    },
+    "device_batch_id": {
+      "type": "string",
+      "minLength": 1,
+      "maxLength": 160
+    },
+    "batch_sequence": {
+      "type": ["integer", "null"],
+      "minimum": 1
+    },
+    "items": {
+      "type": "array",
+      "minItems": 1,
+      "items": {
+        "type": "object",
+        "additionalProperties": false,
+        "required": ["entity_type", "local_entity_id", "payload_hash"],
+        "properties": {
+          "entity_type": {
+            "type": "string",
+            "minLength": 1,
+            "maxLength": 60,
+            "enum": [
+              "ait",
+              "administrative-measure",
+              "alcohol-signs-term",
+              "ait-cancel-request",
+              "ait-cancel-posfinal-request",
+              "crash-record"
+            ],
+            "description": "SUPPORTED_ENTITY_TYPES de backend/domains/ops/offline-sync/src/handwritten/batch-protocol.ts; os cinco primeiros são route contract §4.3, e crash-record (BOAT) é aceito na forma e rejeitado no destino (TEAT.SYNC_DESTINATION_NOT_WIRED)."
+          },
+          "local_entity_id": {
+            "type": "string",
+            "format": "uuid"
+          },
+          "server_entity_id": {
+            "type": ["string", "null"],
+            "format": "uuid"
+          },
+          "idempotency_key": {
+            "type": ["string", "null"],
+            "minLength": 1,
+            "maxLength": 160,
+            "description": "A ausência é o caminho legado, que nunca é aplicado — TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED."
+          },
+          "payload_hash": {
+            "type": "string",
+            "minLength": 1,
+            "maxLength": 128
+          },
+          "created_locally_at": {
+            "type": ["string", "null"],
+            "format": "date-time"
+          },
+          "payload_json": {
+            "type": ["object", "null"],
+            "additionalProperties": true
+          }
+        }
+      }
+    },
+    "tenant_id": {
+      "type": "string",
+      "format": "uuid",
+      "deprecated": true,
+      "description": "ignorado; tenant vem do contexto"
+    },
+    "normative_package_id": {
+      "type": "string",
+      "format": "uuid",
+      "deprecated": true,
+      "description": "campo do schema de origem; não é lido pelo comando"
+    }
+  }
+}
diff --git a/package.json b/package.json
index e0bdd42..b06359c 100644
--- a/package.json
+++ b/package.json
@@ -12,7 +12,7 @@
   },
   "packageManager": "pnpm@9.15.0",
   "scripts": {
-    "check": "pnpm format:check && pnpm verify:orchestra-bridge && pnpm docs:kb:check && pnpm docs:kb:publish-check && pnpm blueprints:check && pnpm contracts:check && pnpm parameters:test && pnpm verify:parameter-catalogue && pnpm typecheck && pnpm --filter @detran/ui test && pnpm --filter @detran/ui build && pnpm verify:decorators && pnpm verify:rls-ddl && pnpm verify:role-catalog && pnpm verify:lifecycle-vocabulary && pnpm verify:senatran-boundary && pnpm verify:senatran-contracts && pnpm verify:pec-parity && pnpm verify:pec-superset",
+    "check": "pnpm format:check && pnpm verify:orchestra-bridge && pnpm docs:kb:check && pnpm docs:kb:publish-check && pnpm blueprints:check && pnpm contracts:check && pnpm parameters:test && pnpm contracts:test && pnpm verify:parameter-catalogue && pnpm typecheck && pnpm --filter @detran/ui test && pnpm --filter @detran/ui build && pnpm verify:decorators && pnpm verify:rls-ddl && pnpm verify:role-catalog && pnpm verify:lifecycle-vocabulary && pnpm verify:senatran-boundary && pnpm verify:senatran-contracts && pnpm verify:pec-parity && pnpm verify:pec-superset",
     "format:check": "prettier --check .",
     "format": "prettier --write .",
     "typecheck": "pnpm -r --if-present run typecheck",
@@ -42,7 +42,9 @@
     "verify:parameter-catalogue": "node tools/parameters/verify.mjs --check-generated --check-usage",
     "blueprints:check": "node tools/blueprints/check.mjs",
     "contracts:openapi": "node tools/contracts/generate-openapi.mjs",
-    "contracts:check": "node tools/contracts/generate-openapi.mjs --check",
+    "contracts:check": "node tools/contracts/generate-openapi.mjs --check && node tools/contracts/check-commands.mjs && node tools/contracts/generate-clients.mjs --check",
+    "contracts:test": "node --test tools/contracts/tests/*.test.mjs",
+    "contracts:clients": "node tools/contracts/generate-clients.mjs",
     "docs:sync": "npm --prefix docs/site run sync-docs",
     "docs:typecheck": "npm --prefix docs/site run typecheck",
     "docs:build": "npm --prefix docs/site run build",
@@ -57,6 +59,7 @@
     "@aarusso-nyx/devai": "1.4.5",
     "@types/node": "^24.10.1",
     "@types/pg": "^8.15.4",
+    "openapi-typescript": "7.13.0",
     "pg": "^8.20.0",
     "prettier": "^3.5.3",
     "tsx": "^4.23.13",
diff --git a/tools/contracts/check-commands.mjs b/tools/contracts/check-commands.mjs
new file mode 100644
index 0000000..4a32cfe
--- /dev/null
+++ b/tools/contracts/check-commands.mjs
@@ -0,0 +1,499 @@
+#!/usr/bin/env node
+// Gate for the nine hand-written `*.commands.openapi.json` command contracts
+// (WP-T3, CTG-0005 §3). Checks each contract file for shape (§3.3 rule 1),
+// resolves `x-blueprint` against `docs/framework/blueprints/` (rule 2), and
+// cross-checks the routes it documents against the handwritten controllers
+// that are actually mounted (rules 5/6), the error codes it enumerates
+// against `teat-error-catalog.md` (rule 3), and `operationId` uniqueness
+// (rule 4). Molde: `tools/parameters/verify.mjs` (CLI shape) and
+// `tools/verify-controller-decorators.ts` (AST scan technique).
+import fs from 'node:fs';
+import path from 'node:path';
+import ts from 'typescript';
+import { fileURLToPath } from 'node:url';
+
+const root = process.cwd();
+
+export const CONTROLLER_ROOTS = [
+  'backend/domains/inf/ait/src',
+  'backend/domains/inf/normative/src',
+  'backend/domains/inf/measures/src',
+  'backend/domains/inf/alcohol/src',
+  'backend/domains/ops/field/src/handwritten',
+  'backend/domains/ops/offline-sync/src/handwritten',
+  'backend/domains/ops/evidence/src/handwritten',
+  'backend/domains/ops/snapshots/src/handwritten',
+  'backend/app/src',
+];
+
+// Único e nomeado (CTG-0005 §2.6, §3.2): `SpeedModule` só monta atrás da
+// flag `teat.speed_meters` (default false, seed 05); a rota não está
+// montada e por isso fica fora da varredura. Retirar quando a flag virar
+// `true` (mesmo PR que cria BP-INF-SPEED-001.commands.openapi.json).
+export const FLAG_GATED_CONTROLLERS = [
+  'backend/domains/inf/speed/src/handwritten/speed-commands.controller.ts',
+];
+
+const ROUTE_DECORATORS = new Set([
+  'Get',
+  'Post',
+  'Put',
+  'Patch',
+  'Delete',
+  'All',
+  'Head',
+  'Options',
+]);
+
+function toPosix(value) {
+  return value.split(path.sep).join('/');
+}
+
+function relFromRoot(absolute) {
+  return toPosix(path.relative(root, absolute));
+}
+
+function normalizeRoute(base, sub) {
+  const joined = [base, sub]
+    .map((segment) => segment.replace(/^\/+|\/+$/gu, ''))
+    .filter((segment) => segment.length > 0)
+    .join('/');
+  return `/${joined}`.replace(/:([A-Za-z0-9_]+)/gu, '{$1}');
+}
+
+function decoratorsOf(node) {
+  return ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : [];
+}
+
+function decoratorInfo(decorator) {
+  const expression = decorator.expression;
+  const isCall = ts.isCallExpression(expression);
+  const callee = isCall ? expression.expression : expression;
+  const name = ts.isIdentifier(callee)
+    ? callee.text
+    : ts.isPropertyAccessExpression(callee)
+      ? callee.name.text
+      : undefined;
+  const args = isCall ? expression.arguments : [];
+  return { name, args };
+}
+
+function findFilesBelow(directory) {
+  if (!fs.existsSync(directory)) return [];
+  const results = [];
+  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
+    if (entry.isDirectory()) {
+      if (
+        entry.name === 'controllers' ||
+        entry.name === 'generated' ||
+        entry.name === 'tests'
+      )
+        continue;
+      results.push(...findFilesBelow(path.join(directory, entry.name)));
+      continue;
+    }
+    if (!entry.isFile()) continue;
+    if (!entry.name.endsWith('.controller.ts')) continue;
+    if (entry.name.includes('.spec.')) continue;
+    results.push(path.join(directory, entry.name));
+  }
+  return results;
+}
+
+/**
+ * Scans `controllerRoots` (repo-relative or absolute) for `@Controller`
+ * classes and route-decorated methods, returning the normalized route
+ * surface (CTG-0005 §3.2). A route whose decorator argument is present but
+ * not a string literal is reported as a `problems` entry with kind
+ * `invalid-json` (fail-closed: the surface is not derivable from source).
+ */
+export function scanControllers(controllerRoots) {
+  const routes = [];
+  const problems = [];
+  const flagGated = new Set(
+    FLAG_GATED_CONTROLLERS.map((entry) => toPosix(path.resolve(root, entry))),
+  );
+  for (const rawRoot of controllerRoots) {
+    const absoluteRoot = path.isAbsolute(rawRoot)
+      ? rawRoot
+      : path.resolve(root, rawRoot);
+    const isAppSrc =
+      toPosix(absoluteRoot) === toPosix(path.resolve(root, 'backend/app/src'));
+    for (const file of findFilesBelow(absoluteRoot)) {
+      if (isAppSrc && !path.basename(file).startsWith('teat-')) continue;
+      if (flagGated.has(toPosix(file))) continue;
+      const source = ts.createSourceFile(
+        file,
+        fs.readFileSync(file, 'utf8'),
+        ts.ScriptTarget.Latest,
+        true,
+      );
+      source.forEachChild((node) => {
+        if (!ts.isClassDeclaration(node)) return;
+        const classDecorators = decoratorsOf(node);
+        const controllerDecorator = classDecorators.find(
+          (decorator) => decoratorInfo(decorator).name === 'Controller',
+        );
+        if (!controllerDecorator) return;
+        const { args: controllerArgs } = decoratorInfo(controllerDecorator);
+        let base = '';
+        if (controllerArgs.length > 0) {
+          if (!ts.isStringLiteralLike(controllerArgs[0])) {
+            problems.push({
+              kind: 'invalid-json',
+              file: relFromRoot(file),
+              detail: `rota não estática em ${node.name?.text ?? '<anonymous>'} (decorador @Controller); a superfície não é derivável do código-fonte`,
+            });
+            return;
+          }
+          base = controllerArgs[0].text;
+        }
+        const className = node.name?.text ?? '<anonymous>';
+        for (const member of node.members) {
+          if (!ts.isMethodDeclaration(member)) continue;
+          const methodDecorators = decoratorsOf(member);
+          const routeDecorator = methodDecorators.find((decorator) =>
+            ROUTE_DECORATORS.has(decoratorInfo(decorator).name ?? ''),
+          );
+          if (!routeDecorator) continue;
+          const { name: decoratorName, args: routeArgs } =
+            decoratorInfo(routeDecorator);
+          const methodName = member.name.getText(source);
+          const line =
+            source.getLineAndCharacterOfPosition(member.name.getStart(source))
+              .line + 1;
+          let sub = '';
+          if (routeArgs.length > 0) {
+            if (!ts.isStringLiteralLike(routeArgs[0])) {
+              problems.push({
+                kind: 'invalid-json',
+                file: relFromRoot(file),
+                detail: `rota não estática em ${className}.${methodName}; a superfície não é derivável do código-fonte`,
+              });
+              continue;
+            }
+            sub = routeArgs[0].text;
+          }
+          routes.push({
+            method: (decoratorName ?? '').toUpperCase(),
+            path: normalizeRoute(base, sub),
+            file: relFromRoot(file),
+            line,
+          });
+        }
+      });
+    }
+  }
+  return { routes, problems };
+}
+
+/** Todo `TEAT.*` citado em `catalogPath` (crases ou prosa), como um Set. */
+export function parseErrorCatalog(catalogPath) {
+  const text = fs.readFileSync(catalogPath, 'utf8');
+  const codes = new Set();
+  for (const match of text.matchAll(/TEAT\.[A-Z0-9_]+/gu)) codes.add(match[0]);
+  return codes;
+}
+
+function errorSchemaEnumsIn(document) {
+  // Toda resposta 4xx/5xx com schema de erro inline (§1.2 item 8), e todo
+  // `enum` de uma propriedade `error_code` em qualquer schema do documento
+  // (recibos de sincronização por item, §2.2/§3.3 regra 3b).
+  const found = [];
+  const visitSchemaForErrorCode = (schema, pathLabel) => {
+    if (!schema || typeof schema !== 'object') return;
+    if (
+      schema.properties &&
+      typeof schema.properties === 'object' &&
+      schema.properties.error_code &&
+      Array.isArray(schema.properties.error_code.enum)
+    ) {
+      found.push({
+        enum: schema.properties.error_code.enum,
+        label: `${pathLabel} propriedade error_code`,
+        exempt: false,
+      });
+    }
+    for (const [key, value] of Object.entries(schema.properties ?? {})) {
+      visitSchemaForErrorCode(value, `${pathLabel}.${key}`);
+    }
+    if (schema.items) visitSchemaForErrorCode(schema.items, `${pathLabel}[]`);
+  };
+  for (const [routePath, methods] of Object.entries(document.paths ?? {})) {
+    if (!methods || typeof methods !== 'object') continue;
+    for (const [method, operation] of Object.entries(methods)) {
+      if (!operation || typeof operation !== 'object' || !operation.operationId)
+        continue;
+      for (const [status, response] of Object.entries(
+        operation.responses ?? {},
+      )) {
+        const numericStatus = Number(status);
+        const schema =
+          response?.content?.['application/json']?.schema ?? undefined;
+        if (numericStatus >= 400) {
+          const enumValues = schema?.properties?.code?.enum;
+          const isIdempotencyKernel = response?.['x-kernel'] === 'idempotency';
+          if (!Array.isArray(enumValues)) {
+            if (!isIdempotencyKernel) {
+              found.push({
+                enum: [],
+                missing: true,
+                label: `${operation.operationId} resposta ${status}`,
+              });
+            }
+            continue;
+          }
+          found.push({
+            enum: enumValues,
+            label: `${operation.operationId} resposta ${status}`,
+          });
+        }
+        if (schema) visitSchemaForErrorCode(schema, `${routePath} ${method}`);
+      }
+      for (const [name, schema] of Object.entries(
+        document.components?.schemas ?? {},
+      )) {
+        visitSchemaForErrorCode(schema, `components.schemas.${name}`);
+      }
+    }
+  }
+  return found;
+}
+
+/**
+ * Lê todo `*.commands.openapi.json` de `contractsDir` (arquivos sem o
+ * sufixo `.commands` são ignorados — são saída do gerador, §0). Valida a
+ * forma mínima (regra 1) e o `x-blueprint` (regra 2), e devolve as
+ * operações válidas junto com os problemas encontrados nesse primeiro
+ * passo.
+ */
+export function collectOperations(
+  contractsDir,
+  blueprintsDir = path.resolve(root, 'docs/framework/blueprints'),
+) {
+  const problems = [];
+  const operations = [];
+  if (!fs.existsSync(contractsDir)) return { operations, problems };
+  const files = fs
+    .readdirSync(contractsDir)
+    .filter((name) => name.endsWith('.commands.openapi.json'))
+    .sort();
+  const blueprintIds = new Set(
+    fs.existsSync(blueprintsDir)
+      ? fs
+          .readdirSync(blueprintsDir)
+          .filter((name) => name.endsWith('.json'))
+          .map((name) => name.slice(0, -'.json'.length))
+      : [],
+  );
+  for (const name of files) {
+    const filePath = path.join(contractsDir, name);
+    const relFile = relFromRoot(filePath);
+    const raw = fs.readFileSync(filePath, 'utf8');
+    let document;
+    try {
+      document = JSON.parse(raw);
+    } catch {
+      problems.push({
+        kind: 'invalid-json',
+        file: relFile,
+        detail: `${name} não é JSON válido`,
+      });
+      continue;
+    }
+    const info = document.info;
+    const shapeProblem = (() => {
+      if (!info) return 'documento sem info';
+      if (!info['x-blueprint']) return 'info.x-blueprint ausente';
+      if (info['x-commands'] !== true) return 'info.x-commands !== true';
+      if (info['x-generated'] !== undefined)
+        return 'info.x-generated presente (marcador de arquivo gerado)';
+      if (typeof info.version !== 'string' || info.version.length === 0)
+        return 'info.version ausente ou vazia';
+      if (!document.paths || typeof document.paths !== 'object')
+        return 'documento sem paths, ou paths não é objeto';
+      return null;
+    })();
+    if (shapeProblem) {
+      problems.push({
+        kind: 'invalid-json',
+        file: relFile,
+        detail: shapeProblem,
+      });
+      continue;
+    }
+    if (!blueprintIds.has(info['x-blueprint'])) {
+      problems.push({
+        kind: 'unknown-blueprint',
+        file: relFile,
+        detail: `x-blueprint ${info['x-blueprint']} não existe em docs/framework/blueprints`,
+      });
+      continue;
+    }
+    for (const [routePath, methods] of Object.entries(document.paths)) {
+      if (!methods || typeof methods !== 'object') continue;
+      for (const [method, operation] of Object.entries(methods)) {
+        if (!operation || typeof operation !== 'object') continue;
+        if (!operation.operationId) continue;
+        operations.push({
+          operationId: operation.operationId,
+          method: method.toUpperCase(),
+          path: routePath,
+          file: relFile,
+          document,
+          operation,
+        });
+      }
+    }
+  }
+  return { operations, problems };
+}
+
+/**
+ * Confere os nove `*.commands.openapi.json` contra os controladores
+ * manuscritos montados e o catálogo de erros (CTG-0005 §3).
+ */
+export function checkCommands({
+  contractsDir = path.resolve(root, 'docs/framework/contracts'),
+  controllerRoots = CONTROLLER_ROOTS,
+  catalogPath = path.resolve(root, 'docs/framework/arch/teat-error-catalog.md'),
+  blueprintsDir = path.resolve(root, 'docs/framework/blueprints'),
+} = {}) {
+  const problems = [];
+
+  // 1 + 2: forma e x-blueprint, por arquivo.
+  const { operations, problems: shapeProblems } = collectOperations(
+    contractsDir,
+    blueprintsDir,
+  );
+  problems.push(...shapeProblems);
+
+  // 3: códigos de erro fora do catálogo.
+  const catalog = fs.existsSync(catalogPath)
+    ? parseErrorCatalog(catalogPath)
+    : new Set();
+  const seenUnknown = new Set();
+  for (const entry of operations) {
+    for (const found of errorSchemaEnumsIn(entry.document)) {
+      if (found.missing) {
+        const key = `missing:${found.label}`;
+        if (seenUnknown.has(key)) continue;
+        seenUnknown.add(key);
+        problems.push({
+          kind: 'unknown-error-code',
+          file: entry.file,
+          detail: `${found.label}: resposta sem properties.code.enum`,
+        });
+        continue;
+      }
+      for (const code of found.enum) {
+        if (catalog.has(code)) continue;
+        const key = `${entry.file}:${found.label}:${code}`;
+        if (seenUnknown.has(key)) continue;
+        seenUnknown.add(key);
+        problems.push({
+          kind: 'unknown-error-code',
+          file: entry.file,
+          detail: `${found.label}: código ${code} não está em teat-error-catalog.md`,
+        });
+      }
+    }
+  }
+
+  // 4: operationId duplicado.
+  const byOperationId = new Map();
+  for (const entry of operations) {
+    if (!byOperationId.has(entry.operationId))
+      byOperationId.set(entry.operationId, []);
+    byOperationId.get(entry.operationId).push(entry);
+  }
+  for (const [operationId, entries] of byOperationId) {
+    const files = [...new Set(entries.map((entry) => entry.file))];
+    if (entries.length <= 1) continue;
+    const [fileA, fileB] = files.length > 1 ? files : [files[0], files[0]];
+    problems.push({
+      kind: 'duplicate-operation-id',
+      file: fileA,
+      detail: `${operationId} aparece em ${fileA} e ${fileB}`,
+    });
+  }
+
+  // Varredura dos controladores manuscritos montados.
+  const { routes: scannedRoutes, problems: scanProblems } =
+    scanControllers(controllerRoots);
+  problems.push(...scanProblems);
+
+  const routeKey = (method, routePath) => `${method} ${routePath}`;
+  const scannedKeys = new Map();
+  for (const route of scannedRoutes) {
+    const key = routeKey(route.method, route.path);
+    if (!scannedKeys.has(key)) scannedKeys.set(key, []);
+    scannedKeys.get(key).push(route);
+  }
+  const operationKeys = new Set(
+    operations.map((entry) => routeKey(entry.method, entry.path)),
+  );
+
+  // 5: contrato → código.
+  const seenMissingRoute = new Set();
+  for (const entry of operations) {
+    const key = routeKey(entry.method, entry.path);
+    if (scannedKeys.has(key)) continue;
+    if (seenMissingRoute.has(key)) continue;
+    seenMissingRoute.add(key);
+    problems.push({
+      kind: 'missing-route',
+      file: entry.file,
+      detail: `${entry.operationId} (${entry.method} ${entry.path}) não tem controlador manuscrito montado`,
+    });
+  }
+
+  // 6: código → contrato.
+  for (const route of scannedRoutes) {
+    const key = routeKey(route.method, route.path);
+    if (operationKeys.has(key)) continue;
+    problems.push({
+      kind: 'missing-operation',
+      file: route.file,
+      detail: `${route.method} ${route.path} (${route.file}:${route.line}) não tem operação em nenhum *.commands.openapi.json`,
+    });
+  }
+
+  return { ok: problems.length === 0, operations: operations.length, problems };
+}
+
+function parseCliArgs(argv) {
+  const options = {};
+  const controllerRoots = [];
+  for (let i = 0; i < argv.length; i += 1) {
+    const arg = argv[i];
+    if (arg === '--contracts-dir') options.contractsDir = argv[++i];
+    else if (arg === '--controllers') controllerRoots.push(argv[++i]);
+    else if (arg === '--catalog') options.catalogPath = argv[++i];
+    else if (arg === '--blueprints') options.blueprintsDir = argv[++i];
+  }
+  if (controllerRoots.length > 0) options.controllerRoots = controllerRoots;
+  return options;
+}
+
+function runCli() {
+  const options = parseCliArgs(process.argv.slice(2));
+  const result = checkCommands(options);
+  if (result.ok) {
+    process.stdout.write(
+      `commands contracts: OK (${result.operations} operations)\n`,
+    );
+    process.exit(0);
+  }
+  for (const problem of result.problems) {
+    process.stderr.write(
+      `${problem.kind}: ${problem.file} — ${problem.detail}\n`,
+    );
+  }
+  process.exit(1);
+}
+
+const isMain =
+  process.argv[1] !== undefined &&
+  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
+if (isMain) runCli();
diff --git a/tools/contracts/generate-clients.mjs b/tools/contracts/generate-clients.mjs
new file mode 100644
index 0000000..3e045b4
--- /dev/null
+++ b/tools/contracts/generate-clients.mjs
@@ -0,0 +1,190 @@
+#!/usr/bin/env node
+// Generates TypeScript types for every `docs/framework/contracts/*.openapi.json`
+// contract — generated CRUD and hand-written `.commands` alike — into
+// `packages/api-clients/src/generated/` (CTG-0005 §4). Molde:
+// `packages/senatran-adapter/scripts/generate-contracts.ts`.
+import {
+  readFile,
+  readdir,
+  mkdir,
+  mkdtemp,
+  rm,
+  writeFile,
+} from 'node:fs/promises';
+import { dirname, join, relative, resolve } from 'node:path';
+import { tmpdir } from 'node:os';
+import { fileURLToPath, pathToFileURL } from 'node:url';
+
+import openapiTS, { astToString } from 'openapi-typescript';
+import { format } from 'prettier';
+
+const root = process.cwd();
+
+function relFromRoot(absolute) {
+  return relative(root, absolute).split('\\').join('/');
+}
+
+/**
+ * @param {{ contractsDir?: string, outDir?: string }} [options]
+ * @returns {Promise<{ written: string[] }>}
+ */
+export async function generateClients({
+  contractsDir = resolve(root, 'docs/framework/contracts'),
+  outDir = resolve(root, 'packages/api-clients/src/generated'),
+} = {}) {
+  const names = (await readdir(contractsDir))
+    .filter((name) => name.endsWith('.openapi.json'))
+    .sort();
+
+  await mkdir(outDir, { recursive: true });
+
+  const written = [];
+  const expectedBasenames = new Set();
+  for (const name of names) {
+    const inputPath = join(contractsDir, name);
+    const outputName = `${name.slice(0, -'.openapi.json'.length)}.ts`;
+    expectedBasenames.add(outputName);
+    const outputPath = join(outDir, outputName);
+
+    const generated = astToString(await openapiTS(pathToFileURL(inputPath)));
+    const relativeInput = `docs/framework/contracts/${name}`;
+    const content = await format(
+      `// Generated from ${relativeInput}. Do not edit.\n${generated}`,
+      { parser: 'typescript', singleQuote: true },
+    );
+
+    const existing = await readFile(outputPath, 'utf8').catch(() => null);
+    if (existing !== content) {
+      await writeFile(outputPath, content, 'utf8');
+    }
+    written.push(join(outDir, outputName).split('\\').join('/'));
+  }
+
+  const existingFiles = await readdir(outDir).catch(() => []);
+  for (const name of existingFiles) {
+    if (!name.endsWith('.ts')) continue;
+    if (expectedBasenames.has(name)) continue;
+    await rm(join(outDir, name));
+  }
+
+  return { written: written.sort() };
+}
+
+/**
+ * Gera os clientes de `contractsDir` num diretório temporário (reaproveitando
+ * `generateClients`) e compara byte a byte com `outDir`, sem nunca escrever
+ * em `outDir`. Devolve também `expectedCount` (nº de arquivos esperados,
+ * para o `<n>` da CLI) além de `ok`/`problems` — uso interno; `checkClients`
+ * expõe só a forma pública de CTG-0005 §9 item 15.
+ *
+ * @param {{ contractsDir: string, outDir: string }} options
+ * @returns {Promise<{ ok: boolean, problems: Array<{ kind: string, file: string, detail: string }>, expectedCount: number }>}
+ */
+async function diffClients({ contractsDir, outDir }) {
+  const problems = [];
+  const tempDir = await mkdtemp(join(tmpdir(), 'detran-check-clients-'));
+  try {
+    const { written } = await generateClients({
+      contractsDir,
+      outDir: tempDir,
+    });
+    const expectedNames = written.map((entry) => entry.split('/').pop()).sort();
+
+    for (const name of expectedNames) {
+      const expectedContent = await readFile(join(tempDir, name), 'utf8');
+      const actualPath = join(outDir, name);
+      const actualContent = await readFile(actualPath, 'utf8').catch(
+        () => null,
+      );
+      if (actualContent === null) {
+        problems.push({
+          kind: 'missing-client',
+          file: relFromRoot(actualPath),
+          detail: `${name} não existe em ${relFromRoot(outDir)}; rode pnpm contracts:clients`,
+        });
+        continue;
+      }
+      if (actualContent !== expectedContent) {
+        problems.push({
+          kind: 'stale-client',
+          file: relFromRoot(actualPath),
+          detail: `${name} está fora de sincronia com ${relFromRoot(contractsDir)}; rode pnpm contracts:clients`,
+        });
+      }
+    }
+
+    const expectedSet = new Set(expectedNames);
+    const existingFiles = await readdir(outDir).catch(() => []);
+    for (const name of existingFiles) {
+      if (!name.endsWith('.ts')) continue;
+      if (expectedSet.has(name)) continue;
+      problems.push({
+        kind: 'orphan-client',
+        file: relFromRoot(join(outDir, name)),
+        detail: `${name} não corresponde a nenhum contrato em ${relFromRoot(contractsDir)}`,
+      });
+    }
+
+    return {
+      ok: problems.length === 0,
+      problems,
+      expectedCount: expectedNames.length,
+    };
+  } finally {
+    await rm(tempDir, { recursive: true, force: true });
+  }
+}
+
+/**
+ * @param {{ contractsDir?: string, outDir?: string }} [options]
+ * @returns {Promise<{ ok: boolean, problems: Array<{ kind: 'stale-client' | 'missing-client' | 'orphan-client', file: string, detail: string }> }>}
+ */
+export async function checkClients({
+  contractsDir = resolve(root, 'docs/framework/contracts'),
+  outDir = resolve(root, 'packages/api-clients/src/generated'),
+} = {}) {
+  const { ok, problems } = await diffClients({ contractsDir, outDir });
+  return { ok, problems };
+}
+
+async function runCli() {
+  const checkMode = process.argv.includes('--check');
+  if (checkMode) {
+    try {
+      const { ok, problems, expectedCount } = await diffClients({
+        contractsDir: resolve(root, 'docs/framework/contracts'),
+        outDir: resolve(root, 'packages/api-clients/src/generated'),
+      });
+      if (ok) {
+        process.stdout.write(`clients in sync: ${expectedCount}\n`);
+        return;
+      }
+      for (const problem of problems) {
+        process.stderr.write(
+          `${problem.kind}: ${problem.file} — ${problem.detail}\n`,
+        );
+      }
+      process.exitCode = 1;
+    } catch (error) {
+      process.stderr.write(
+        `${error instanceof Error ? error.message : String(error)}\n`,
+      );
+      process.exitCode = 1;
+    }
+    return;
+  }
+  try {
+    const result = await generateClients({});
+    process.stdout.write(`clients written: ${result.written.length}\n`);
+  } catch (error) {
+    process.stderr.write(
+      `${error instanceof Error ? error.message : String(error)}\n`,
+    );
+    process.exitCode = 1;
+  }
+}
+
+const isMain =
+  process.argv[1] !== undefined &&
+  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
+if (isMain) await runCli();

```

## Anexo — `--stat` (testes e documentação)

```text
 docs/framework/arch/parameter-catalogue.md         |  30 +-
 docs/framework/arch/rait-fixtures.md               |  80 ++-
 docs/framework/arch/teat-build-pack.md             |  44 +-
 docs/framework/arch/teat-error-catalog.md          |  40 +-
 docs/framework/arch/teat-route-contract.md         |  35 +-
 docs/framework/schemas/README.md                   |  66 +-
 docs/meta/knowledge-base/backlog.md                |  28 +-
 docs/meta/knowledge-base/open-decisions-rait.md    |  72 +++
 tools/contracts/tests/check-commands.test.mjs      | 720 +++++++++++++++++++++
 .../check-commands/blueprints/BP-DEMO-001.json     |   5 +
 .../tests/fixtures/check-commands/catalog.md       |  14 +
 .../contract-duplicate.commands.openapi.json       |  42 ++
 .../check-commands/contract.commands.openapi.json  |  70 ++
 .../controllers/generated-crud.controller.ts       |  16 +
 .../demo-items-dynamic-route.controller.ts         |  17 +
 .../check-commands/demo-items-empty.controller.ts  |   9 +
 .../demo-items-two-routes.controller.ts            |  19 +
 .../check-commands/demo-items.controller.ts        |  16 +
 .../check-commands/demo-items.spec.controller.ts   |  16 +
 .../empty-paths-contract.commands.openapi.json     |  13 +
 .../generated/another-generated.controller.ts      |  16 +
 .../fixtures/check-commands/outro.controller.ts    |  16 +
 .../fixtures/check-commands/teat-x.controller.ts   |  17 +
 .../BP-DEMO-001.commands.openapi.json              |  42 ++
 .../generate-clients/BP-DEMO-001.openapi.json      |  29 +
 tools/contracts/tests/generate-clients.test.mjs    | 419 ++++++++++++
 .../tests/helpers/mini-schema-validate.mjs         | 192 ++++++
 tools/contracts/tests/schemas.test.mjs             | 544 ++++++++++++++++
 28 files changed, 2577 insertions(+), 50 deletions(-)

```

## Anexo — testes do Inspector

### tools/contracts/tests/check-commands.test.mjs

```javascript
// Testes de `tools/contracts/check-commands.mjs` (TASK-0012, WP-T3, CTG-0005 §3 e §7).
//
// O módulo ainda não existe — TASK-0010 (Engineer) o implementa. Por isso este arquivo
// falha hoje inteiro por `ERR_MODULE_NOT_FOUND` na importação estática abaixo; é o
// vermelho esperado (CTG-0005 §7 C-5-01…C-5-16, prompt TASK-0012 item 4). Qualquer outra
// falha, depois que `check-commands.mjs` existir, é defeito do gate ou do teste.
//
// Fixtures em tools/contracts/tests/fixtures/check-commands/ (nunca os contratos reais,
// docs/meta/agents/inspector-tests.md e CTG-0005 §7). Cada caso monta um diretório
// temporário mínimo — um contrato de uma operação e um controlador de uma rota — e aponta
// o gate para ele via as opções de diretório da assinatura (CTG-0005 §3.1).
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import test from 'node:test';
import { checkCommands } from '../check-commands.mjs';

const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const fixturesDir = join(root, 'tools/contracts/tests/fixtures/check-commands');
const gate = join(root, 'tools/contracts/check-commands.mjs');

async function readFixture(name) {
  return readFile(join(fixturesDir, name), 'utf8');
}

async function run(args) {
  try {
    const result = await exec(process.execPath, [gate, ...args], {
      cwd: root,
    });
    return { status: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return {
      status: typeof error.code === 'number' ? error.code : 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? String(error),
    };
  }
}

// Monta um diretório temporário com contractsDir/controllerRoots/catalogPath/blueprintsDir
// mínimos. `contracts` e `controllers` são mapas nome de arquivo → conteúdo; por padrão
// cada diretório recebe só a fixture base (uma operação, uma rota, ambas casando).
async function scenario({
  contracts = { 'contract.commands.openapi.json': null },
  controllers = { 'demo-items.controller.ts': null },
  catalog = null,
  blueprint = null,
} = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'detran-check-commands-'));
  const contractsDir = join(dir, 'contracts');
  const controllersDir = join(dir, 'controllers');
  const blueprintsDir = join(dir, 'blueprints');
  const catalogPath = join(dir, 'catalog.md');
  await mkdir(contractsDir, { recursive: true });
  await mkdir(controllersDir, { recursive: true });
  await mkdir(blueprintsDir, { recursive: true });
  for (const [name, content] of Object.entries(contracts)) {
    const text = content ?? (await readFixture(name));
    const target = join(contractsDir, name);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, text, 'utf8');
  }
  for (const [name, content] of Object.entries(controllers)) {
    const text = content ?? (await readFixture(name));
    const target = join(controllersDir, name);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, text, 'utf8');
  }
  await writeFile(
    catalogPath,
    catalog ?? (await readFixture('catalog.md')),
    'utf8',
  );
  await writeFile(
    join(blueprintsDir, 'BP-DEMO-001.json'),
    blueprint ?? (await readFixture('blueprints/BP-DEMO-001.json')),
    'utf8',
  );
  return {
    dir,
    contractsDir,
    controllerRoots: [controllersDir],
    catalogPath,
    blueprintsDir,
  };
}

async function cleanup(s) {
  await rm(s.dir, { recursive: true, force: true });
}

// (a) contrato válido + controlador com as mesmas rotas → ok: true, operations = n
test('dado contrato válido e controlador com a mesma rota quando checkCommands então ok=true, operations=1 e problems=[]', async () => {
  const s = await scenario();
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, true);
    assert.equal(result.operations, 1);
    assert.deepEqual(result.problems, []);
  } finally {
    await cleanup(s);
  }
});

// (b) rota no contrato sem controlador → missing-route
test('dado rota no contrato sem controlador correspondente quando checkCommands então exatamente um missing-route', async () => {
  const s = await scenario({
    controllers: { 'demo-items-empty.controller.ts': null },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.problems.length, 1);
    assert.equal(result.problems[0].kind, 'missing-route');
    assert.match(result.problems[0].detail, /teatDemoItemFinalize/);
    assert.match(
      result.problems[0].detail,
      /POST.*\/v1\/demo\/items\/\{id\}\/finalize/,
    );
  } finally {
    await cleanup(s);
  }
});

// (c) rota no controlador sem contrato → missing-operation
test('dado rota no controlador sem operação correspondente quando checkCommands então exatamente um missing-operation', async () => {
  const s = await scenario({
    contracts: { 'empty-paths-contract.commands.openapi.json': null },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.operations, 0);
    assert.equal(result.problems.length, 1);
    assert.equal(result.problems[0].kind, 'missing-operation');
    assert.match(
      result.problems[0].detail,
      /POST.*\/v1\/demo\/items\/\{id\}\/finalize/,
    );
    assert.match(result.problems[0].file, /controller\.ts/);
  } finally {
    await cleanup(s);
  }
});

// (d) `code` 4xx fora do catálogo → unknown-error-code
test('dado código 4xx fora do catálogo quando checkCommands então exatamente um unknown-error-code citando o código', async () => {
  const baseline = JSON.parse(
    await readFixture('contract.commands.openapi.json'),
  );
  baseline.paths['/v1/demo/items/{id}/finalize'].post.responses['409'].content[
    'application/json'
  ].schema.properties.code.enum = ['TEAT.GHOST_CODE'];
  const s = await scenario({
    contracts: {
      'contract.commands.openapi.json': `${JSON.stringify(baseline, null, 2)}\n`,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.problems.length, 1);
    assert.equal(result.problems[0].kind, 'unknown-error-code');
    assert.match(result.problems[0].detail, /TEAT\.GHOST_CODE/);
  } finally {
    await cleanup(s);
  }
});

// (e) `operationId` duplicado → duplicate-operation-id
test('dado o mesmo operationId em dois arquivos quando checkCommands então exatamente um duplicate-operation-id citando os dois arquivos', async () => {
  const s = await scenario({
    contracts: {
      'contract.commands.openapi.json': null,
      'contract-duplicate.commands.openapi.json': null,
    },
    controllers: { 'demo-items-two-routes.controller.ts': null },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.operations, 2);
    assert.equal(result.problems.length, 1);
    assert.equal(result.problems[0].kind, 'duplicate-operation-id');
    assert.match(result.problems[0].detail, /teatDemoItemFinalize/);
    assert.match(
      result.problems[0].detail,
      /contract\.commands\.openapi\.json/,
    );
    assert.match(
      result.problems[0].detail,
      /contract-duplicate\.commands\.openapi\.json/,
    );
  } finally {
    await cleanup(s);
  }
});

// (f) `x-blueprint` inexistente → unknown-blueprint
test('dado x-blueprint que não existe em blueprintsDir quando checkCommands então há um unknown-blueprint', async () => {
  const baseline = JSON.parse(
    await readFixture('contract.commands.openapi.json'),
  );
  baseline.info['x-blueprint'] = 'BP-GHOST-001';
  const s = await scenario({
    contracts: {
      'contract.commands.openapi.json': `${JSON.stringify(baseline, null, 2)}\n`,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    const unknownBlueprint = result.problems.filter(
      (problem) => problem.kind === 'unknown-blueprint',
    );
    assert.equal(unknownBlueprint.length, 1);
    assert.match(unknownBlueprint[0].detail, /BP-GHOST-001/);
  } finally {
    await cleanup(s);
  }
});

// (g) JSON inválido → invalid-json
test('dado contrato com JSON quebrado quando checkCommands então exatamente um invalid-json no arquivo quebrado', async () => {
  const broken = (await readFixture('contract.commands.openapi.json')).slice(
    0,
    -30,
  );
  const s = await scenario({
    contracts: { 'contract.commands.openapi.json': broken },
    controllers: { 'demo-items-empty.controller.ts': null },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.operations, 0);
    assert.equal(result.problems.length, 1);
    assert.equal(result.problems[0].kind, 'invalid-json');
    assert.match(result.problems[0].file, /contract\.commands\.openapi\.json/);
  } finally {
    await cleanup(s);
  }
});

// (h) arquivo sem sufixo `.commands` é ignorado
test('dado arquivo *.openapi.json sem sufixo .commands quando checkCommands então é ignorado (mesmo se ilegível como JSON)', async () => {
  const s = await scenario({
    contracts: {
      'contract.commands.openapi.json': null,
      'BP-DEMO-001.openapi.json': 'isto não é JSON válido nem deveria ser lido',
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, true);
    assert.equal(result.operations, 1);
    assert.deepEqual(result.problems, []);
  } finally {
    await cleanup(s);
  }
});

// (i) execução como CLI: sucesso e falha
test('dado o repositório fixture sem problemas quando rodar a CLI então exit 0 e "commands contracts: OK (1 operations)"', async () => {
  const s = await scenario();
  try {
    const result = await run([
      '--contracts-dir',
      s.contractsDir,
      '--controllers',
      s.controllerRoots[0],
      '--catalog',
      s.catalogPath,
      '--blueprints',
      s.blueprintsDir,
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'commands contracts: OK (1 operations)\n');
  } finally {
    await cleanup(s);
  }
});

test('dado o repositório fixture com uma rota órfã quando rodar a CLI então exit 1 com a lista de problemas em stderr e stdout vazio', async () => {
  const s = await scenario({
    controllers: { 'demo-items-empty.controller.ts': null },
  });
  try {
    const result = await run([
      '--contracts-dir',
      s.contractsDir,
      '--controllers',
      s.controllerRoots[0],
      '--catalog',
      s.catalogPath,
      '--blueprints',
      s.blueprintsDir,
    ]);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /^missing-route: /);
    assert.match(result.stderr, /teatDemoItemFinalize/);
  } finally {
    await cleanup(s);
  }
});

// ---------------------------------------------------------------------------
// Iteração 2 (delivery-review ciclo 1): C-5-03, C-5-05, C-5-07, C-5-08,
// C-5-12…C-5-16 (CTG-0005 §7, adenda §9.16). `scenario()`/`cleanup()`/`run()`
// acima são reutilizados sem mudança.
// ---------------------------------------------------------------------------

// Ajuda a montar variantes do path do finalize dentro do documento base sem
// duplicar o JSON inteiro em cada caso.
async function baselineContract() {
  return JSON.parse(await readFixture('contract.commands.openapi.json'));
}

test('C-5-03 — dado contrato sem x-blueprint, com x-commands ausente/false, ou com x-generated presente quando checkCommands então cada caso gera exatamente um invalid-json', async () => {
  const cases = [
    {
      label: 'x-blueprint ausente',
      mutate: (doc) => {
        delete doc.info['x-blueprint'];
      },
      match: /x-blueprint ausente/,
    },
    {
      label: 'x-commands ausente',
      mutate: (doc) => {
        delete doc.info['x-commands'];
      },
      match: /x-commands/,
    },
    {
      label: 'x-commands false',
      mutate: (doc) => {
        doc.info['x-commands'] = false;
      },
      match: /x-commands/,
    },
    {
      label: 'x-generated presente',
      mutate: (doc) => {
        doc.info['x-generated'] = true;
      },
      match: /x-generated/,
    },
  ];
  for (const { label, mutate, match } of cases) {
    const baseline = await baselineContract();
    mutate(baseline);
    const s = await scenario({
      contracts: {
        'contract.commands.openapi.json': `${JSON.stringify(baseline, null, 2)}\n`,
      },
      controllers: { 'demo-items-empty.controller.ts': null },
    });
    try {
      const result = await checkCommands({
        contractsDir: s.contractsDir,
        controllerRoots: s.controllerRoots,
        catalogPath: s.catalogPath,
        blueprintsDir: s.blueprintsDir,
      });
      assert.equal(result.ok, false, label);
      assert.equal(
        result.problems.length,
        1,
        `${label}: ${JSON.stringify(result.problems)}`,
      );
      assert.equal(result.problems[0].kind, 'invalid-json', label);
      assert.match(result.problems[0].detail, match, label);
    } finally {
      await cleanup(s);
    }
  }
});

test('C-5-05 — dado contrato cujo nome de arquivo não corresponde a nenhum blueprint mas cujo x-blueprint existe quando checkCommands então ok=true (resolução por x-blueprint, nunca pelo nome do arquivo)', async () => {
  const baseline = await readFixture('contract.commands.openapi.json'); // info['x-blueprint'] = 'BP-DEMO-001'
  const s = await scenario({
    // O nome do arquivo sugere um blueprint que não existe (`BP-GHOST-001`);
    // só o campo `x-blueprint` (BP-DEMO-001, existente) importa — é o mesmo
    // caso real de BP-OPS-BOOTSTRAP-001 (CTG-0005 §2.1).
    contracts: { 'BP-GHOST-001.commands.openapi.json': baseline },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, true, JSON.stringify(result.problems));
    assert.equal(result.operations, 1);
  } finally {
    await cleanup(s);
  }
});

test('C-5-07 — dado resposta 4xx sem properties.code.enum quando checkCommands então um unknown-error-code; dada a mesma resposta com x-kernel idempotency então ok=true', async () => {
  const missingEnum = await baselineContract();
  delete missingEnum.paths['/v1/demo/items/{id}/finalize'].post.responses['409']
    .content['application/json'].schema.properties.code.enum;
  const s1 = await scenario({
    contracts: {
      'contract.commands.openapi.json': `${JSON.stringify(missingEnum, null, 2)}\n`,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s1.contractsDir,
      controllerRoots: s1.controllerRoots,
      catalogPath: s1.catalogPath,
      blueprintsDir: s1.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.problems.length, 1, JSON.stringify(result.problems));
    assert.equal(result.problems[0].kind, 'unknown-error-code');
    assert.match(result.problems[0].detail, /sem properties\.code\.enum/);
  } finally {
    await cleanup(s1);
  }

  const withKernel = await baselineContract();
  delete withKernel.paths['/v1/demo/items/{id}/finalize'].post.responses['409']
    .content['application/json'].schema.properties.code.enum;
  withKernel.paths['/v1/demo/items/{id}/finalize'].post.responses['409'][
    'x-kernel'
  ] = 'idempotency';
  const s2 = await scenario({
    contracts: {
      'contract.commands.openapi.json': `${JSON.stringify(withKernel, null, 2)}\n`,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s2.contractsDir,
      controllerRoots: s2.controllerRoots,
      catalogPath: s2.catalogPath,
      blueprintsDir: s2.blueprintsDir,
    });
    assert.equal(result.ok, true, JSON.stringify(result.problems));
  } finally {
    await cleanup(s2);
  }
});

test('C-5-08 — dado enum de error_code (recibo de sincronização) com código fora do catálogo quando checkCommands então um unknown-error-code', async () => {
  const baseline = await baselineContract();
  const successSchema =
    baseline.paths['/v1/demo/items/{id}/finalize'].post.responses['200']
      .content['application/json'].schema;
  // Forma de backend/domains/ops/offline-sync (receipts[].error_code,
  // CTG-0005 §2.2/§3.3 regra 3b): array de itens com error_code nullable.
  successSchema.properties.receipts = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        error_code: {
          type: ['string', 'null'],
          enum: ['TEAT.GHOST_RECEIPT_CODE'],
        },
      },
    },
  };
  const s = await scenario({
    contracts: {
      'contract.commands.openapi.json': `${JSON.stringify(baseline, null, 2)}\n`,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.problems.length, 1, JSON.stringify(result.problems));
    assert.equal(result.problems[0].kind, 'unknown-error-code');
    assert.match(result.problems[0].detail, /TEAT\.GHOST_RECEIPT_CODE/);
  } finally {
    await cleanup(s);
  }
});

test('C-5-12 — dado :id no controlador e {id} no contrato quando checkCommands então ok=true (normalização :id ↔ {id}); dado {aitId} no contrato contra :id no controlador então um missing-route e um missing-operation', async () => {
  // A normalização já é exercida pela fixture base inteira (controlador
  // ':id/finalize', contrato '{id}/finalize').
  const s1 = await scenario();
  try {
    const result = await checkCommands({
      contractsDir: s1.contractsDir,
      controllerRoots: s1.controllerRoots,
      catalogPath: s1.catalogPath,
      blueprintsDir: s1.blueprintsDir,
    });
    assert.equal(result.ok, true, JSON.stringify(result.problems));
  } finally {
    await cleanup(s1);
  }

  const renamed = await baselineContract();
  const operation = renamed.paths['/v1/demo/items/{id}/finalize'];
  delete renamed.paths['/v1/demo/items/{id}/finalize'];
  renamed.paths['/v1/demo/items/{aitId}/finalize'] = operation;
  const s2 = await scenario({
    contracts: {
      'contract.commands.openapi.json': `${JSON.stringify(renamed, null, 2)}\n`,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s2.contractsDir,
      controllerRoots: s2.controllerRoots,
      catalogPath: s2.catalogPath,
      blueprintsDir: s2.blueprintsDir,
    });
    assert.equal(result.ok, false);
    const kinds = result.problems.map((problem) => problem.kind).sort();
    assert.deepEqual(kinds, ['missing-operation', 'missing-route']);
  } finally {
    await cleanup(s2);
  }
});

test('C-5-13 — dado controlador sob src/controllers/ ou src/generated/, ou arquivo *.spec.ts, quando checkCommands então a rota não é varrida (sem missing-operation)', async () => {
  const s = await scenario({
    controllers: {
      'demo-items.controller.ts': null,
      'controllers/generated-crud.controller.ts': null,
      'generated/another-generated.controller.ts': null,
      'demo-items.spec.controller.ts': null,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, true, JSON.stringify(result.problems));
    assert.deepEqual(result.problems, []);
  } finally {
    await cleanup(s);
  }
});

// C-5-14 exercises `check-commands.mjs`'s `backend/app/src` special case
// (§3.2 rule 4), which compares the scanned root against
// `path.resolve(process.cwd(), 'backend/app/src')` — i.e. it only fires when
// a controllerRoots entry resolves to that exact relative path under the
// *running process's* cwd. A fixture directory passed by absolute path never
// matches it, so this case needs the CLI spawned with `cwd` pointed at a
// scratch root that has its own `backend/app/src`, and `--controllers`
// passed as the relative string `backend/app/src` (same trick as
// `generate-clients.test.mjs`'s `cliScenario`).
async function appSrcCliScenario() {
  const fakeRoot = await mkdtemp(
    join(tmpdir(), 'detran-check-commands-appsrc-'),
  );
  const contractsDir = join(fakeRoot, 'contracts');
  const controllersDir = join(fakeRoot, 'backend/app/src');
  const blueprintsDir = join(fakeRoot, 'blueprints');
  const catalogPath = join(fakeRoot, 'catalog.md');
  await mkdir(contractsDir, { recursive: true });
  await mkdir(controllersDir, { recursive: true });
  await mkdir(blueprintsDir, { recursive: true });
  await writeFile(
    join(contractsDir, 'empty-paths-contract.commands.openapi.json'),
    await readFixture('empty-paths-contract.commands.openapi.json'),
    'utf8',
  );
  await writeFile(
    join(controllersDir, 'teat-x.controller.ts'),
    await readFixture('teat-x.controller.ts'),
    'utf8',
  );
  await writeFile(
    join(controllersDir, 'outro.controller.ts'),
    await readFixture('outro.controller.ts'),
    'utf8',
  );
  await writeFile(catalogPath, await readFixture('catalog.md'), 'utf8');
  await writeFile(
    join(blueprintsDir, 'BP-DEMO-001.json'),
    await readFixture('blueprints/BP-DEMO-001.json'),
    'utf8',
  );
  return { fakeRoot, contractsDir, blueprintsDir, catalogPath };
}

async function runInCwd(cwd, args) {
  try {
    const result = await exec(process.execPath, [gate, ...args], { cwd });
    return { status: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return {
      status: typeof error.code === 'number' ? error.code : 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? String(error),
    };
  }
}

test('C-5-14 — dado backend/app/src (truque de cwd) quando rodar a CLI então só teat-x.controller.ts é varrido; outro.controller.ts (sem prefixo teat-) é ignorado', async () => {
  const s = await appSrcCliScenario();
  try {
    const result = await runInCwd(s.fakeRoot, [
      '--contracts-dir',
      s.contractsDir,
      '--controllers',
      'backend/app/src',
      '--catalog',
      s.catalogPath,
      '--blueprints',
      s.blueprintsDir,
    ]);
    assert.equal(result.status, 1);
    const missingOperationLines = result.stderr
      .split('\n')
      .filter((line) => line.startsWith('missing-operation'));
    assert.equal(missingOperationLines.length, 1, result.stderr);
    assert.match(missingOperationLines[0], /teat-x\.controller\.ts/);
    assert.doesNotMatch(result.stderr, /outro\.controller\.ts/);
  } finally {
    await rm(s.fakeRoot, { recursive: true, force: true });
  }
});

test('C-5-15 — dado um decorador de rota com argumento não literal quando checkCommands então um invalid-json citando classe e método; e a CLI sai com exit 1', async () => {
  const s = await scenario({
    contracts: { 'empty-paths-contract.commands.openapi.json': null },
    controllers: { 'demo-items-dynamic-route.controller.ts': null },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.problems.length, 1, JSON.stringify(result.problems));
    assert.equal(result.problems[0].kind, 'invalid-json');
    assert.match(result.problems[0].detail, /DemoItemsDynamicRouteController/);
    assert.match(result.problems[0].detail, /dynamic/);

    const cli = await run([
      '--contracts-dir',
      s.contractsDir,
      '--controllers',
      s.controllerRoots[0],
      '--catalog',
      s.catalogPath,
      '--blueprints',
      s.blueprintsDir,
    ]);
    assert.equal(cli.status, 1);
  } finally {
    await cleanup(s);
  }
});

test('C-5-16 — dado o repositório real (sem flags) quando checkCommands então ok=true e operations=92', async () => {
  const result = checkCommands();
  assert.equal(result.ok, true, JSON.stringify(result.problems, null, 2));
  assert.equal(result.operations, 92);
});
```

### tools/contracts/tests/generate-clients.test.mjs

```javascript
// Testes de `tools/contracts/generate-clients.mjs` (TASK-0012, WP-T3, CTG-0005 §4 e §7).
//
// `generateClients` já existe (C-5-17…C-5-21 abaixo passam). `checkClients`
// (adenda §9.16 item 15: `export async function checkClients({ contractsDir,
// outDir }) → Promise<{ ok, problems }>`, com `problems[].kind ∈
// 'stale-client' | 'missing-client' | 'orphan-client'`, sem escrever em
// `outDir`) ainda não existe — TASK-0010 (Engineer) o implementa em paralelo
// a esta tarefa. Por isso os testes de C-5-22 e das quatro variações de
// `checkClients` (em sincronia, stale-client, orphan-client, missing-client)
// falham hoje só por `checkClients is not a function` (o módulo importa sem
// erro; o nome só não está exportado ainda) — é o vermelho esperado. Qualquer
// outra falha, depois que `checkClients` existir, é defeito do gerador ou do
// teste.
//
// Fixtures em tools/contracts/tests/fixtures/generate-clients/ (nunca os contratos reais):
// um `*.openapi.json` (imita o gerado) e um `*.commands.openapi.json` (imita o manuscrito),
// ambos mínimos e válidos para `openapi-typescript` (já presente no workspace, 7.13.0 — a
// instalação é ato do maestro, nunca deste teste).
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import test from 'node:test';
// Namespace import (não `import { checkClients, generateClients } from …`):
// `checkClients` ainda não é um export nomeado do módulo (TASK-0010 em
// paralelo) e um `import { checkClients }` estático quebraria o
// carregamento do arquivo inteiro com um SyntaxError de "export ausente" —
// inclusive os testes de `generateClients` que já passam hoje. Com o
// namespace, `generateClientsModule.checkClients` é apenas `undefined` até
// existir, e cada teste que o chama falha isoladamente (TypeError "is not a
// function"), não o arquivo inteiro.
import * as generateClientsModule from '../generate-clients.mjs';

const { generateClients } = generateClientsModule;

const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const fixturesDir = join(
  root,
  'tools/contracts/tests/fixtures/generate-clients',
);
const cli = join(root, 'tools/contracts/generate-clients.mjs');

async function readFixture(name) {
  return readFile(join(fixturesDir, name), 'utf8');
}

async function scenario(files = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'detran-generate-clients-'));
  const contractsDir = join(dir, 'contracts');
  const outDir = join(dir, 'generated');
  await mkdir(contractsDir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    await writeFile(
      join(contractsDir, name),
      content ?? (await readFixture(name)),
      'utf8',
    );
  }
  return { dir, contractsDir, outDir };
}

async function cleanup(s) {
  await rm(s.dir, { recursive: true, force: true });
}

// A CLI de generate-clients.mjs não tem opções de diretório (CTG-0005 §4.2, diferente de
// check-commands.mjs em §3.4): contractsDir/outDir só têm default relativo a `process.cwd()`
// (mesma convenção de tools/contracts/generate-openapi.mjs, `const root = process.cwd()`).
// Por isso a fixture de CLI monta uma raiz temporária própria — nunca `--contracts-dir`
// nem `--out-dir`, que o contrato não define — e roda o processo com `cwd` nela, para nunca
// tocar docs/framework/contracts/ nem packages/api-clients/src/generated/ reais.
async function cliScenario(files = {}) {
  const fakeRoot = await mkdtemp(
    join(tmpdir(), 'detran-generate-clients-cli-'),
  );
  const contractsDir = join(fakeRoot, 'docs/framework/contracts');
  const outDir = join(fakeRoot, 'packages/api-clients/src/generated');
  await mkdir(contractsDir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    await writeFile(
      join(contractsDir, name),
      content ?? (await readFixture(name)),
      'utf8',
    );
  }
  return { fakeRoot, contractsDir, outDir };
}

async function cleanupCli(s) {
  await rm(s.fakeRoot, { recursive: true, force: true });
}

async function runCli(fakeRoot) {
  try {
    const result = await exec(process.execPath, [cli], { cwd: fakeRoot });
    return { status: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return {
      status: typeof error.code === 'number' ? error.code : 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? String(error),
    };
  }
}

test('dado um contrato gerado e um contrato de comando quando generateClients então escreve um .ts por arquivo com export interface paths', async () => {
  const s = await scenario({
    'BP-DEMO-001.openapi.json': null,
    'BP-DEMO-001.commands.openapi.json': null,
  });
  try {
    const result = await generateClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    assert.equal(result.written.length, 2);
    const generated = await readFile(join(s.outDir, 'BP-DEMO-001.ts'), 'utf8');
    const commands = await readFile(
      join(s.outDir, 'BP-DEMO-001.commands.ts'),
      'utf8',
    );
    // CTG-0005 §4.2: "cabeçalho primeira linha de todo arquivo gerado: `// Generated
    // from docs/framework/contracts/<arquivo>. Do not edit.`" — o `<arquivo>` aqui é o
    // nome real dentro do contractsDir da fixture, não o caminho canônico do repositório
    // (que só existe quando contractsDir é o default); por isso o teste casa o nome do
    // arquivo de origem e o sufixo fixo, sem fixar o diretório.
    assert.match(
      generated,
      /^\/\/ Generated from .*BP-DEMO-001\.openapi\.json\. Do not edit\.\n/,
    );
    assert.match(generated, /export interface paths/);
    assert.match(commands, /export interface paths/);
  } finally {
    await cleanup(s);
  }
});

// `X.commands.openapi.json` → `X.commands.ts`: o sufixo `.commands` sobrevive no nome do
// módulo (CTG-0005 §4.2), nunca é confundido com o `.openapi.json` gerado homônimo.
test('dado BP-DEMO-001.commands.openapi.json quando generateClients então a saída é BP-DEMO-001.commands.ts', async () => {
  const s = await scenario({ 'BP-DEMO-001.commands.openapi.json': null });
  try {
    const result = await generateClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    assert.deepEqual(
      result.written.map((entry) => entry.split('/').pop()),
      ['BP-DEMO-001.commands.ts'],
    );
    await assert.doesNotReject(
      readFile(join(s.outDir, 'BP-DEMO-001.commands.ts'), 'utf8'),
    );
  } finally {
    await cleanup(s);
  }
});

test('dada a mesma entrada quando gerar duas vezes então os bytes de saída são idênticos (idempotência)', async () => {
  const s = await scenario({
    'BP-DEMO-001.openapi.json': null,
    'BP-DEMO-001.commands.openapi.json': null,
  });
  try {
    const first = await generateClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    const beforeGenerated = await readFile(
      join(s.outDir, 'BP-DEMO-001.ts'),
      'utf8',
    );
    const beforeCommands = await readFile(
      join(s.outDir, 'BP-DEMO-001.commands.ts'),
      'utf8',
    );
    const second = await generateClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    const afterGenerated = await readFile(
      join(s.outDir, 'BP-DEMO-001.ts'),
      'utf8',
    );
    const afterCommands = await readFile(
      join(s.outDir, 'BP-DEMO-001.commands.ts'),
      'utf8',
    );
    assert.equal(afterGenerated, beforeGenerated);
    assert.equal(afterCommands, beforeCommands);
    assert.deepEqual(
      first.written.slice().sort(),
      second.written.slice().sort(),
    );
  } finally {
    await cleanup(s);
  }
});

test('dado um .ts órfão em outDir quando generateClients então é removido e não aparece em written', async () => {
  const s = await scenario({ 'BP-DEMO-001.openapi.json': null });
  try {
    await mkdir(s.outDir, { recursive: true });
    const orphan = join(s.outDir, 'BP-GHOST-001.ts');
    await writeFile(orphan, '// órfão de propósito\n', 'utf8');
    const result = await generateClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    await assert.rejects(readFile(orphan, 'utf8'));
    assert.ok(!result.written.some((entry) => entry.includes('BP-GHOST-001')));
    const remaining = await readdir(s.outDir);
    assert.deepEqual(remaining, ['BP-DEMO-001.ts']);
  } finally {
    await cleanup(s);
  }
});

test('dado contrato com JSON inválido quando rodar a CLI então exit 1 e o arquivo de saída anterior não é truncado', async () => {
  const s = await cliScenario({ 'BP-DEMO-001.openapi.json': null });
  try {
    const first = await runCli(s.fakeRoot);
    assert.equal(first.status, 0, first.stderr);
    const before = await readFile(join(s.outDir, 'BP-DEMO-001.ts'), 'utf8');
    assert.ok(before.length > 0);

    await writeFile(
      join(s.contractsDir, 'BP-BROKEN-001.openapi.json'),
      '{ "openapi": "3.1.0", "info": { ',
      'utf8',
    );
    const second = await runCli(s.fakeRoot);
    assert.equal(second.status, 1);
    assert.match(second.stderr, /BP-BROKEN-001\.openapi\.json/);

    const after = await readFile(join(s.outDir, 'BP-DEMO-001.ts'), 'utf8');
    assert.equal(after, before);
  } finally {
    await cleanupCli(s);
  }
});

test('dado o conjunto fixture sem erros quando rodar a CLI então stdout "clients written: 2"', async () => {
  const s = await cliScenario({
    'BP-DEMO-001.openapi.json': null,
    'BP-DEMO-001.commands.openapi.json': null,
  });
  try {
    const result = await runCli(s.fakeRoot);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'clients written: 2\n');
  } finally {
    await cleanupCli(s);
  }
});

// ---------------------------------------------------------------------------
// Iteração 2 (delivery-review ciclo 1, adenda §9.16 item 15): `checkClients`
// — em sincronia, stale-client, orphan-client, missing-client — e C-5-22
// (repositório real). `checkClients` não tem ids C-5-nn próprios em
// CTG-0005 §7 (nasceu na adenda, depois da numeração original); os quatro
// nomes de teste abaixo usam o nome da função como prefixo, no lugar de um
// id C-5-nn inexistente.
// ---------------------------------------------------------------------------

test('checkClients — em sincronia (outDir gerado a partir do mesmo contractsDir) então ok=true e problems=[]', async () => {
  const s = await scenario({
    'BP-DEMO-001.openapi.json': null,
    'BP-DEMO-001.commands.openapi.json': null,
  });
  try {
    await generateClients({ contractsDir: s.contractsDir, outDir: s.outDir });
    const result = await generateClientsModule.checkClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    assert.equal(result.ok, true, JSON.stringify(result.problems));
    assert.deepEqual(result.problems, []);
  } finally {
    await cleanup(s);
  }
});

test('checkClients — stale-client (arquivo em outDir diverge do que generateClients produziria) então um stale-client citando o arquivo, sem corrigi-lo', async () => {
  const s = await scenario({ 'BP-DEMO-001.openapi.json': null });
  try {
    await generateClients({ contractsDir: s.contractsDir, outDir: s.outDir });
    const filePath = join(s.outDir, 'BP-DEMO-001.ts');
    const original = await readFile(filePath, 'utf8');
    const divergent = `${original}\n// alterado à mão, propositalmente divergente\n`;
    await writeFile(filePath, divergent, 'utf8');

    const result = await generateClientsModule.checkClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.problems.length, 1, JSON.stringify(result.problems));
    assert.equal(result.problems[0].kind, 'stale-client');
    assert.match(result.problems[0].file, /BP-DEMO-001\.ts/);

    // "sem escrever em outDir" (CTG-0005 adenda §9.16 item 15): o arquivo
    // continua divergente depois de checkClients.
    const stillDivergent = await readFile(filePath, 'utf8');
    assert.equal(stillDivergent, divergent);
  } finally {
    await cleanup(s);
  }
});

test('checkClients — orphan-client (.ts em outDir sem *.openapi.json correspondente) então um orphan-client citando o arquivo, sem removê-lo', async () => {
  const s = await scenario({ 'BP-DEMO-001.openapi.json': null });
  try {
    await generateClients({ contractsDir: s.contractsDir, outDir: s.outDir });
    const orphanPath = join(s.outDir, 'BP-GHOST-001.ts');
    await writeFile(orphanPath, '// órfão de propósito\n', 'utf8');

    const result = await generateClientsModule.checkClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    assert.equal(result.ok, false);
    const orphan = result.problems.filter(
      (problem) => problem.kind === 'orphan-client',
    );
    assert.equal(orphan.length, 1, JSON.stringify(result.problems));
    assert.match(orphan[0].file, /BP-GHOST-001\.ts/);

    // "sem escrever em outDir": diferente de `generateClients`, `checkClients`
    // nunca remove o órfão.
    await assert.doesNotReject(readFile(orphanPath, 'utf8'));
  } finally {
    await cleanup(s);
  }
});

test('checkClients — missing-client (*.openapi.json sem .ts correspondente em outDir) então um missing-client citando o arquivo esperado', async () => {
  const s = await scenario({
    'BP-DEMO-001.openapi.json': null,
    'BP-DEMO-001.commands.openapi.json': null,
  });
  try {
    await generateClients({ contractsDir: s.contractsDir, outDir: s.outDir });
    await rm(join(s.outDir, 'BP-DEMO-001.commands.ts'));

    const result = await generateClientsModule.checkClients({
      contractsDir: s.contractsDir,
      outDir: s.outDir,
    });
    assert.equal(result.ok, false);
    const missing = result.problems.filter(
      (problem) => problem.kind === 'missing-client',
    );
    assert.equal(missing.length, 1, JSON.stringify(result.problems));
    assert.match(missing[0].file, /BP-DEMO-001\.commands\.ts/);
  } finally {
    await cleanup(s);
  }
});

test('checkClients — CLI --check: exit 0 "clients in sync: <n>" quando em sincronia; exit 1 com stderr quando divergente', async () => {
  const s = await cliScenario({
    'BP-DEMO-001.openapi.json': null,
    'BP-DEMO-001.commands.openapi.json': null,
  });
  try {
    const generated = await runCli(s.fakeRoot);
    assert.equal(generated.status, 0, generated.stderr);

    const inSync = await exec(process.execPath, [cli, '--check'], {
      cwd: s.fakeRoot,
    }).then(
      (result) => ({ status: 0, stdout: result.stdout, stderr: result.stderr }),
      (error) => ({
        status: typeof error.code === 'number' ? error.code : 1,
        stdout: error.stdout ?? '',
        stderr: error.stderr ?? String(error),
      }),
    );
    assert.equal(inSync.status, 0, inSync.stderr);
    assert.match(inSync.stdout, /^clients in sync: 2\n?$/);

    await writeFile(
      join(s.outDir, 'BP-DEMO-001.ts'),
      '// divergente de propósito\n',
      'utf8',
    );
    const outOfSync = await exec(process.execPath, [cli, '--check'], {
      cwd: s.fakeRoot,
    }).then(
      (result) => ({ status: 0, stdout: result.stdout, stderr: result.stderr }),
      (error) => ({
        status: typeof error.code === 'number' ? error.code : 1,
        stdout: error.stdout ?? '',
        stderr: error.stderr ?? String(error),
      }),
    );
    assert.equal(outOfSync.status, 1);
    assert.match(outOfSync.stderr, /stale-client/);
  } finally {
    await cleanupCli(s);
  }
});

test('C-5-22 — dado o repositório real (sem flags) quando checkClients então ok=true', async () => {
  const result = await generateClientsModule.checkClients();
  assert.equal(result.ok, true, JSON.stringify(result.problems, null, 2));
});
```

### tools/contracts/tests/schemas.test.mjs

```javascript
// Testes dos schemas JSON manuscritos de `docs/framework/schemas/` (TASK-0012,
// iteração 2, WP-T3, CTG-0005 §5 e §7 C-5-23/24/25/26; adenda §9.16).
//
// `ajv` não está disponível na raiz do workspace (adenda §9.16); os testes usam
// `tools/contracts/tests/helpers/mini-schema-validate.mjs`, um validador mínimo
// local que cobre `type`/`required`/`properties`/`const`/`enum`/
// `additionalProperties`/`items`/`oneOf`/`$ref` local — o subconjunto que estes
// schemas realmente usam (nenhum deles tem `$ref` remoto, `if`/`then`/`else`
// nem `patternProperties`).
//
// C-5-25 pede envelopes "copiados dos *.spec.ts dos events.ts de cada módulo".
// Nenhum módulo TEAT tem um `events*.spec.ts` colocado com literais completos:
// os specs de comando (`*.command.spec.ts`, `*.integration.spec.ts`) afirmam o
// envelope com `expect.objectContaining({...})` PARCIAL contra o evento
// produzido em runtime — nunca um objeto literal completo — e os specs de
// integração de sincronização/AIT conferem a linha da outbox via SQL, sem
// literal JS algum. Por isso cada envelope abaixo é montado a partir da forma
// exigida pelo schema (nomes e tipos dos campos) e recebe, campo a campo, o
// literal mais próximo encontrado nesses specs (token de `domainEvent`,
// `entity_type`/`conflict_type`/`resolutionAction`, ids de fixture de CTG-0005
// §2.5) — a origem exata é citada em cada bloco. É uma aproximação declarada,
// não uma cópia de um envelope completo pré-existente; ver o relatório de
// TASK-0012 (iteração 2).
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validate } from './helpers/mini-schema-validate.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const schemasDir = join(root, 'docs/framework/schemas');
const eventsDir = join(schemasDir, 'events');

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

// Ids canônicos de fixture (CTG-0005 §2.5) — nenhum id é inventado à mão.
const FX = {
  tenant: '00000000-0000-7000-8000-00000000a001',
  agency: '00000000-0000-7000-8000-0000e2000001',
  agent: '00000000-0000-4000-8000-0000b0000001',
  unit: '00000000-0000-7000-8000-0000e2100001',
  device: '00000000-0000-7000-8000-0000e4000002',
  numberingRange: '00000000-0000-7000-8000-0000e5000001',
  reservation: '00000000-0000-7000-8000-0000e6000001',
  catalog: '00000000-0000-7000-8000-0000e0000001',
  framing: '00000000-0000-7000-8000-0000e1000001',
  mobilePackage: '00000000-0000-7000-8000-0000e7000002',
  ait: '00000000-0000-7000-8000-0000f0000001',
  evidence: '00000000-0000-7000-8000-0000ef000001',
  uploadIntent: '00000000-0000-7000-8000-0000ef100001',
  evidenceLink: '00000000-0000-7000-8000-0000ef200001',
  custodyEvent: '00000000-0000-7000-8000-0000ef300001',
  accessRequest: '00000000-0000-7000-8000-0000ef400001',
  measure: '00000000-0000-7000-8000-0000ed000001',
  retention: '00000000-0000-7000-8000-0000ed100001',
  alcoholProcedure: '00000000-0000-7000-8000-0000ee000001',
  shiftOpen: '00000000-0000-7000-8000-0000e3000001',
};

function envelope({ type, domainEvent, aggregateKind, aggregateId, data }) {
  return {
    id: 'outbox-fixture-0001',
    type,
    domainEvent,
    version: 1,
    occurredAt: '2026-09-14T12:00:00.000Z',
    tenantId: FX.tenant,
    actor: { kind: 'user', id: FX.agent, role: 'field-agent' },
    correlationId: 'corr-fixture-0001',
    aggregate: { kind: aggregateKind, id: aggregateId, version: 1 },
    data,
  };
}

// Um envelope de exemplo por arquivo de docs/framework/schemas/events/ (CTG-0005
// §5.4). Origem de cada literal citada no comentário da entrada.
const EVENT_ENVELOPES = [
  {
    // domainEvent e forma dos campos: backend/domains/inf/ait/tests/integration/
    // ait-commands.integration.spec.ts:550 (linha AIT_FINALIZADO na outbox);
    // content_hash/finalized_at: CTG-0005 §1.3 (exemplo de resposta do finalize).
    file: 'ait.changed',
    envelope: envelope({
      type: 'ait.changed',
      domainEvent: 'AIT_FINALIZADO',
      aggregateKind: 'ait',
      aggregateId: FX.ait,
      data: {
        aitId: FX.ait,
        aitNumber: '000001',
        series: 'A',
        fromState: 'RASCUNHO_OFFLINE',
        toState: 'FINALIZADO_LOCAL',
        contentHash: 'sha256:fixture01',
        finalizedAt: '2026-09-14T12:00:00.000Z',
      },
    }),
  },
  {
    // domainEvent: backend/domains/ops/offline-sync/src/handwritten/
    // submit-batch.spec.ts:774 (expect.objectContaining({ domainEvent:
    // 'AIT_SUSPEITO_CONCORRENCIA' })).
    file: 'ait.concurrency-suspected',
    envelope: envelope({
      type: 'ait.concurrency-suspected',
      domainEvent: 'AIT_SUSPEITO_CONCORRENCIA',
      aggregateKind: 'ait',
      aggregateId: FX.ait,
      data: {
        aitId: FX.ait,
        agentId: FX.agent,
        deviceId: FX.device,
        otherDeviceId: null,
        windowStart: '2026-09-14T12:00:00.000Z',
        windowEnd: '2026-09-14T12:05:00.000Z',
        conflictId: null,
      },
    }),
  },
  {
    // domainEvent: submit-batch.spec.ts:678 (SYNC_ITEM_RECEBIDO,
    // aggregate.kind 'sync-queue-item'); entity_type 'ait': linha 141.
    file: 'sync.batch.received',
    envelope: envelope({
      type: 'sync.batch.received',
      domainEvent: 'SYNC_ITEM_RECEBIDO',
      aggregateKind: 'sync-queue-item',
      aggregateId: FX.reservation,
      data: {
        batchId: null,
        deviceBatchId: 'e2e-fixture',
        batchSequence: null,
        itemId: FX.ait,
        entityType: 'ait',
        localEntityId: FX.ait,
        receiptStatus: 'applied',
        errorCode: null,
        serverEntityId: FX.ait,
      },
    }),
  },
  {
    // domainEvent: submit-batch.spec.ts:780 (SYNC_CONFLITO_ABERTO);
    // conflict_type 'concurrency': linha 761.
    file: 'sync.conflict.opened',
    envelope: envelope({
      type: 'sync.conflict.opened',
      domainEvent: 'SYNC_CONFLITO_ABERTO',
      aggregateKind: 'sync-conflict',
      aggregateId: FX.reservation,
      data: {
        conflictId: FX.reservation,
        conflictType: 'concurrency',
        syncQueueItemId: FX.reservation,
        reasonCode: 'TEAT.SYNC_ITEM_CONFLICT',
        openedAt: '2026-09-14T12:00:00.000Z',
      },
    }),
  },
  {
    // domainEvent, conflictType e resolutionAction: backend/domains/ops/
    // offline-sync/tests/integration/resolve-conflict.integration.spec.ts:186-190.
    file: 'sync.conflict.resolved',
    envelope: envelope({
      type: 'sync.conflict.resolved',
      domainEvent: 'SYNC_CONFLITO_RESOLVIDO',
      aggregateKind: 'sync-conflict',
      aggregateId: FX.reservation,
      data: {
        conflictId: FX.reservation,
        conflictType: 'integrity',
        resolutionAction: 'accept_server',
        resolvedAt: '2026-09-14T12:00:00.000Z',
      },
    }),
  },
  {
    // domainEvent: CTG-0005 §5.4 (NUMERACAO_RESERVADA, ops/offline-sync);
    // ids de faixa/reserva: CTG-0005 §2.5.
    file: 'numbering.reservation.changed',
    envelope: envelope({
      type: 'numbering.reservation.changed',
      domainEvent: 'NUMERACAO_RESERVADA',
      aggregateKind: 'numbering-reservation',
      aggregateId: FX.reservation,
      data: {
        reservationId: FX.reservation,
        rangeId: FX.numberingRange,
        agentId: FX.agent,
        deviceId: FX.device,
        shiftId: FX.shiftOpen,
        startNumber: 1,
        endNumber: 100,
        validUntil: '2026-09-15T00:00:00.000Z',
        status: 'reserved',
        action: 'reserve',
      },
    }),
  },
  {
    // domainEvent TURNO_ABERTO: CTG-0005 §5.4 (ops/field FIELD_EVENT_SCHEMAS);
    // ids de turno/unidade/dispositivo: CTG-0005 §2.5.
    file: 'shift.changed',
    envelope: envelope({
      type: 'shift.changed',
      domainEvent: 'TURNO_ABERTO',
      aggregateKind: 'shift',
      aggregateId: FX.shiftOpen,
      data: {
        shiftId: FX.shiftOpen,
        agentId: FX.agent,
        deviceId: FX.device,
        operationalUnitId: FX.unit,
        startedAt: '2026-09-14T08:00:00.000Z',
      },
    }),
  },
  {
    // domainEvent DISPOSITIVO_BLOQUEADO: CTG-0005 §5.4 (ops/field); id de
    // dispositivo: CTG-0005 §2.5.
    file: 'device.posture-changed',
    envelope: envelope({
      type: 'device.posture-changed',
      domainEvent: 'DISPOSITIVO_BLOQUEADO',
      aggregateKind: 'operational-device',
      aggregateId: FX.device,
      data: {
        deviceId: FX.device,
        agentId: FX.agent,
        fromStatus: 'active',
        toStatus: 'blocked',
        eventType: 'block',
      },
    }),
  },
  {
    // domainEvent CATALOGO_PUBLICADO: CTG-0005 §5.4 (inf/normative); id de
    // catálogo: CTG-0005 §2.5.
    file: 'catalog.published',
    envelope: envelope({
      type: 'catalog.published',
      domainEvent: 'CATALOGO_PUBLICADO',
      aggregateKind: 'normative-catalog',
      aggregateId: FX.catalog,
      data: {
        catalogId: FX.catalog,
        name: 'Catálogo fixture',
        version: '2026.1',
        publishedAt: '2026-09-14',
        validFrom: '2026-09-14',
      },
    }),
  },
  {
    // domainEvent PACOTE_MOBILE_PUBLICADO: CTG-0005 §5.4 (inf/normative);
    // manifest_hash: forma citada em backend/domains/inf/normative/src/
    // handwritten/package-content.query.spec.ts:62/85; ids: CTG-0005 §2.5.
    file: 'package.published',
    envelope: envelope({
      type: 'package.published',
      domainEvent: 'PACOTE_MOBILE_PUBLICADO',
      aggregateKind: 'normative-package',
      aggregateId: FX.mobilePackage,
      data: {
        packageId: FX.mobilePackage,
        catalogId: FX.catalog,
        packageVersion: '1',
        manifestHash: 'sha256:fixture-manifest',
        publishedAt: '2026-09-14T12:00:00.000Z',
        validUntil: '2026-12-14',
      },
    }),
  },
  {
    // domainEvent EVIDENCIA_CAPTURADA: CTG-0005 §5.4 (ops/evidence); id de
    // evidência: CTG-0005 §2.5.
    file: 'evidence.changed',
    envelope: envelope({
      type: 'evidence.changed',
      domainEvent: 'EVIDENCIA_CAPTURADA',
      aggregateKind: 'evidence',
      aggregateId: FX.evidence,
      data: {
        evidenceId: FX.evidence,
        entityType: 'ait',
        entityId: FX.ait,
        evidenceType: 'photo',
        hashValue: 'sha256:fixture-evidence',
        capturedAt: '2026-09-14T12:00:00.000Z',
        uploadedAt: '2026-09-14T12:01:00.000Z',
      },
    }),
  },
  {
    // domainEvent CUSTODIA_EVENTO e enum de eventType: CTG-0005 §5.4 e schema
    // (ops/evidence); id de evento de custódia: CTG-0005 §2.5.
    file: 'custody.event',
    envelope: envelope({
      type: 'custody.event',
      domainEvent: 'CUSTODIA_EVENTO',
      aggregateKind: 'evidence',
      aggregateId: FX.evidence,
      data: {
        evidenceId: FX.evidence,
        custodyEventId: FX.custodyEvent,
        eventType: 'uploaded',
        eventAt: '2026-09-14T12:01:00.000Z',
      },
    }),
  },
  {
    // domainEvent CUSTODIA_EVENTO (mesmo token do arquivo anterior; é o que o
    // schema declara — CTG-0005 §5.4); eventType const 'access_delivered' e
    // requesterRole: schema `evidence.access-request.changed.schema.json`;
    // id do pedido de acesso: CTG-0005 §2.5.
    file: 'evidence.access-request.changed',
    envelope: envelope({
      type: 'evidence.access-request.changed',
      domainEvent: 'CUSTODIA_EVENTO',
      aggregateKind: 'evidence',
      aggregateId: FX.evidence,
      data: {
        evidenceId: FX.evidence,
        accessRequestId: FX.accessRequest,
        custodyEventId: FX.custodyEvent,
        eventType: 'access_delivered',
        requesterRole: 'autoridade-policial',
        eventAt: '2026-09-14T12:02:00.000Z',
      },
    }),
  },
  {
    // domainEvent PACOTE_PROBATORIO_GERADO: CTG-0005 §5.4 (ops/evidence); ids
    // de evidência/AIT: CTG-0005 §2.5.
    file: 'probative-package.generated',
    envelope: envelope({
      type: 'probative-package.generated',
      domainEvent: 'PACOTE_PROBATORIO_GERADO',
      aggregateKind: 'probative-package',
      aggregateId: FX.evidence,
      data: {
        packageId: FX.evidence,
        entityType: 'ait',
        entityId: FX.ait,
        purpose: 'processo-administrativo',
        manifestHash: 'sha256:fixture-probative',
        itemCount: 1,
      },
    }),
  },
  {
    // domainEvent: backend/domains/inf/measures/src/handwritten/
    // start-measure.command.spec.ts:238 (MEDIDA_INICIADA); id de medida:
    // CTG-0005 §2.5.
    file: 'measure.changed',
    envelope: envelope({
      type: 'measure.changed',
      domainEvent: 'MEDIDA_INICIADA',
      aggregateKind: 'administrative-measure',
      aggregateId: FX.measure,
      data: {
        measureId: FX.measure,
        measureTypeId: FX.measure,
        aitId: FX.ait,
        agentId: FX.agent,
        currentStatus: 'aberta',
        startedAt: '2026-09-14T12:00:00.000Z',
      },
    }),
  },
  {
    // domainEvent: backend/domains/inf/alcohol/src/handwritten/
    // record-test.command.spec.ts:473 (ALCOOLEMIA_TESTE_REGISTRADO); id de
    // procedimento: CTG-0005 §2.5; resultMgL/maxErrorMgL/consideredMgL: forma
    // citada nos mesmos specs (backend/domains/inf/alcohol/tests/integration/
    // alcohol-commands.integration.spec.ts, close-procedure.command.spec.ts).
    file: 'alcohol.changed',
    envelope: envelope({
      type: 'alcohol.changed',
      domainEvent: 'ALCOOLEMIA_TESTE_REGISTRADO',
      aggregateKind: 'alcohol-procedure',
      aggregateId: FX.alcoholProcedure,
      data: {
        procedureId: FX.alcoholProcedure,
        testId: FX.alcoholProcedure,
        breathalyzerId: null,
        testedAt: '2026-09-14T12:00:00.000Z',
        resultMgL: 0.05,
        maxErrorMgL: 0.005,
        consideredMgL: 0.045,
        outcome: 'abaixo-do-limite',
        toState: 'concluido',
      },
    }),
  },
];

test('C-5-23 — todo docs/framework/schemas/*.json e schemas/events/*.json faz JSON.parse sem erro e declara $schema draft 2020-12 e $id', async () => {
  const topLevel = (await readdir(schemasDir)).filter(
    (name) => name.endsWith('.json') && name !== 'events',
  );
  const eventFiles = (await readdir(eventsDir)).filter((name) =>
    name.endsWith('.json'),
  );
  const files = [
    ...topLevel.map((name) => join(schemasDir, name)),
    ...eventFiles.map((name) => join(eventsDir, name)),
  ];
  assert.ok(
    files.length >= 19,
    `esperava ao menos 19 arquivos, achou ${files.length}`,
  );
  for (const filePath of files) {
    const raw = await readFile(filePath, 'utf8');
    let doc;
    assert.doesNotThrow(() => {
      doc = JSON.parse(raw);
    }, `${filePath} não é JSON válido`);
    assert.equal(
      doc.$schema,
      'https://json-schema.org/draft/2020-12/schema',
      `${filePath}: $schema`,
    );
    assert.ok(
      typeof doc.$id === 'string' && doc.$id.length > 0,
      `${filePath}: $id ausente ou vazio`,
    );
  }
});

// CTG-0005 §5.4 — os dezesseis arquivos e o domainEvent(s)/aggregate.kind que
// cada um cobre; não inclui os cinco `inf.infraction*`/`inf.timer*` (RAIT, de
// rodada anterior, fora de WP-T3) que também vivem em schemas/events/.
const EXPECTED_EVENT_FILES = [
  'ait.changed',
  'ait.concurrency-suspected',
  'sync.batch.received',
  'sync.conflict.opened',
  'sync.conflict.resolved',
  'numbering.reservation.changed',
  'shift.changed',
  'device.posture-changed',
  'catalog.published',
  'package.published',
  'evidence.changed',
  'custody.event',
  'evidence.access-request.changed',
  'probative-package.generated',
  'measure.changed',
  'alcohol.changed',
];

test('C-5-24 — os dezesseis events/<type>.schema.json de CTG-0005 §5.4 existem e o const de type é igual ao nome do arquivo', async () => {
  assert.equal(EXPECTED_EVENT_FILES.length, 16);
  for (const token of EXPECTED_EVENT_FILES) {
    const filePath = join(eventsDir, `${token}.schema.json`);
    const doc = await readJson(filePath);
    assert.equal(doc.properties?.type?.const, token, filePath);
  }
});

test('C-5-25 — para cada envelope de exemplo por domainEvent (ver comentários de origem acima), o schema events/<type>.schema.json correspondente o valida', async () => {
  assert.equal(
    EVENT_ENVELOPES.length,
    EXPECTED_EVENT_FILES.length,
    'um envelope de exemplo por arquivo de §5.4',
  );
  for (const { file, envelope: instance } of EVENT_ENVELOPES) {
    const schema = await readJson(join(eventsDir, `${file}.schema.json`));
    const result = validate(schema, instance);
    assert.ok(
      result.valid,
      `${file}.schema.json não validou o envelope de exemplo:\n${result.errors.join('\n')}`,
    );
  }
});

test('C-5-26 — teat-offline-sync-batch.schema.json valida o corpo do lote usado em backend/app/tests/e2e/teat-field-sync.e2e.spec.ts e recusa um item sem payload_hash', async () => {
  const schema = await readJson(
    join(schemasDir, 'teat-offline-sync-batch.schema.json'),
  );

  // Corpo copiado literalmente de `syncBatchBody()` em
  // backend/app/tests/e2e/teat-field-sync.e2e.spec.ts:87-106 (ids fixos aqui
  // no lugar de randomUUID()/Date.now() para o teste ser determinístico; a
  // forma e os valores dos demais campos são os do arquivo).
  const crashRecordPayload = { crash: { local_protocol: 'BOAT-0001' } };
  const realE2eBody = {
    traffic_agency_id: '00000000-0000-7000-8000-0000e2000001',
    device_id: '00000000-0000-7000-8000-0000e4000002',
    agent_id: '00000000-0000-4000-8000-0000b0000001',
    device_batch_id: 'e2e-fixture01',
    items: [
      {
        entity_type: 'crash-record',
        local_entity_id: '00000000-0000-7000-8000-0000ea000001',
        idempotency_key: 'e2e-item-fixture01',
        created_locally_at: '2026-09-14T13:05:00.000Z',
        payload_json: crashRecordPayload,
        payload_hash: 'sha256:fixture-crash-record',
      },
    ],
  };

  // C-5-26 (CTG-0005 §7) pede que o schema valide o corpo real do e2e. Numa
  // primeira leitura desta iteração, `items[].entity_type.enum` (§5.1) não
  // incluía `"crash-record"` ("crash-record é do BOAT e não é aceito aqui"),
  // enquanto o próprio e2e usa `entity_type: 'crash-record'` e o comenta como
  // "reconhecido como suportado e não tem destino nesta rodada (§4.3)" — o
  // comando montado aceita e responde 200. Ou seja, o schema recusava o mesmo
  // corpo que o e2e prova válido em produção; reportado como achado e
  // corrigido em paralelo pelo Engineer (TASK-0010) — o schema agora inclui
  // `"crash-record"` com a nota "aceito na forma e rejeitado no destino". A
  // asserção abaixo é a do critério (valid === true); mantém o corpo real do
  // e2e como está para continuar provando a integração schema × e2e.
  const realBodyResult = validate(schema, realE2eBody);
  assert.equal(
    realBodyResult.valid,
    true,
    `esperado pelo e2e real (backend/app/tests/e2e/teat-field-sync.e2e.spec.ts) ` +
      `mas o schema recusa: ${realBodyResult.errors.join('; ')}`,
  );

  // Isolando o critério "recusa um item sem payload_hash" do achado acima:
  // mesma forma, com um `entity_type` que o schema aceita hoje.
  const schemaValidBody = JSON.parse(JSON.stringify(realE2eBody));
  schemaValidBody.items[0].entity_type = 'ait';
  const validResult = validate(schema, schemaValidBody);
  assert.ok(
    validResult.valid,
    `corpo com entity_type do enum deveria validar: ${validResult.errors.join('; ')}`,
  );

  delete schemaValidBody.items[0].payload_hash;
  const missingHashResult = validate(schema, schemaValidBody);
  assert.equal(missingHashResult.valid, false);
  assert.ok(
    missingHashResult.errors.some((error) => error.includes('payload_hash')),
    `esperava um erro citando payload_hash; obteve: ${missingHashResult.errors.join('; ')}`,
  );
});
```
