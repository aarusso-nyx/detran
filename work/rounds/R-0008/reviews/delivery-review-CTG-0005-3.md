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

## Nota do maestro — delivery-review CTG-0005, ciclo 3 (restrito ao achado do ciclo 2: C-5-25)

Veredito anterior: `REVIEW` (`reviews/delivery-review-CTG-0005-2.json`, item 6 — C-5-25 com envelopes aproximados). Resolução do Architect: CTG-0005 §9 item 19 (anexo) substitui C-5-25 por **C-5-25′**, mais forte: em cada um dos oito módulos TEAT com `events.ts` manuscrito, um spec vitest `src/handwritten/events.schema.spec.ts` importa os helpers **reais** de `events.ts`, produz um envelope por `type` com ids das fixtures e o valida contra `docs/framework/schemas/events/<type>.schema.json` lido do disco, com o validador mínimo de `tools/contracts/tests/helpers/`. A união dos oito specs cobre os 16 `type` de §5.4 (tabela no relatório anexo; `ops/snapshots` não emite eventos, §5.4 regra 6; `ait.changed` e `sync.conflict.resolved` têm dois produtores). `schemas.test.mjs` deixou de afirmar C-5-25 e perdeu os envelopes aproximados. Nenhuma divergência envelope × schema encontrada; nenhum código de runtime alterado. Contagens: `node --test` 35/35; unit ait 312, measures 134, alcohol 127, normative 23, evidence 45, field 21, offline-sync 33, snapshots 12. Gates completos (`pnpm check`, `backend:test:ci`) em execução sobre este candidato após reseed (ciclo anterior: `backend:test:ci` exit 0; `pnpm check` falhou só por artefatos gerados do catálogo de parâmetros, regenerados pelo maestro — `verify:parameter-catalogue: OK`). Avalie **somente** C-5-25′. Anexos: §9.19; relatório da iteração 3; `--stat` dos oito specs; diff de `schemas.test.mjs` e de quatro specs representativos (ait, measures, evidence, offline-sync); os demais estão na worktree.

## Anexo — CTG-0005 §9.19

```markdown
19. **Delivery-review ciclo 2 (`REVIEW`, 1 achado) — C-5-25**: não existem fixtures literais de
    envelopes nos `*.spec.ts` dos módulos (os specs usam `objectContaining` parcial ou conferem a
    linha da outbox por SQL), logo a versão "aproximada" de `schemas.test.mjs` não prova os envelopes
    produzidos. Critério substituto, verificável: **C-5-25′** — em cada módulo TEAT com `events.ts`
    manuscrito (`inf/{ait,measures,alcohol,normative}`, `ops/{evidence,field,offline-sync,snapshots}`)
    um spec vitest `src/handwritten/events.schema.spec.ts` importa os helpers reais de `events.ts`,
    produz **um envelope por `type`** com ids das fixtures de §2.5 e o valida contra
    `docs/framework/schemas/events/<type>.schema.json` (lido do disco, caminho relativo à raiz) usando o
    validador mínimo de `tools/contracts/tests/helpers/mini-schema-validate.mjs` importado por
    caminho relativo. Os 16 `type` de §5.4 ficam cobertos pela união dos oito specs (o spec lista os
    `type` que cobre; `schemas.test.mjs` passa a conferir só que cada schema de §5.4 é validável e
    deixa de afirmar C-5-25). Sem OD: o critério original é substituído por este, mais forte (envelope
    produzido pelo código, não literal). Inspector aplica (TASK-0012 iteração 3); nenhum código de
    runtime muda.
```

## Anexo — relatório TASK-0012 iteração 3

```markdown
## Iteração 3 (§9.19, C-5-25′)

Oito `events.schema.spec.ts` (ait, measures, alcohol, normative, evidence, field, offline-sync, snapshots) validam os envelopes produzidos pelos helpers reais contra `docs/framework/schemas/events/<type>.schema.json` com o validador mínimo; união cobre os 16 `type` (snapshots sem eventos, §5.4 regra 6). `schemas.test.mjs` sem os envelopes aproximados. Unit: ait 312, measures 134, alcohol 127, normative 23, evidence 45, field 21, offline-sync 33, snapshots 12; `node --test` 35/35; `format:check` limpo. Divergências: nenhuma. Tokens: 246.275 brutos (79 chamadas, 14 min).
```

## Anexo — `--stat`

```text
 .../inf/ait/src/handwritten/events.schema.spec.ts  | 100 +++++++++++++
 .../alcohol/src/handwritten/events.schema.spec.ts  |  68 +++++++++
 .../measures/src/handwritten/events.schema.spec.ts |  65 +++++++++
 .../src/handwritten/events.schema.spec.ts          |  78 +++++++++++
 .../evidence/src/handwritten/events.schema.spec.ts | 115 +++++++++++++++
 .../field/src/handwritten/events.schema.spec.ts    |  75 ++++++++++
 .../src/handwritten/events.schema.spec.ts          | 156 +++++++++++++++++++++
 .../src/handwritten/events.schema.spec.ts          |  44 ++++++
 8 files changed, 701 insertions(+)

```

## Anexo — diff

```diff
diff --git a/backend/domains/inf/ait/src/handwritten/events.schema.spec.ts b/backend/domains/inf/ait/src/handwritten/events.schema.spec.ts
new file mode 100644
index 0000000..628c85d
--- /dev/null
+++ b/backend/domains/inf/ait/src/handwritten/events.schema.spec.ts
@@ -0,0 +1,100 @@
+// CTG-0005 §9 adenda item 19 (C-5-25′, TASK-0012 iteração 3) — substitui a
+// aproximação recusada na delivery-review (envelopes literais em
+// tools/contracts/tests/schemas.test.mjs não provavam o que o código produz).
+// Aqui o envelope nasce do helper real de `./events.js`
+// (`AIT_EVENT_SCHEMAS`, os zod schemas manuscritos que descrevem os sete
+// `domainEvent` do grupo — CTG-0001 §6): cada candidato é validado por
+// `AIT_EVENT_SCHEMAS[<domainEvent>].parse(...)`, e só o resultado desse parse
+// (não o candidato) é conferido contra o schema JSON de
+// `docs/framework/schemas/events/<type>.schema.json` lido do disco, com o
+// validador mínimo de `tools/contracts/tests/helpers/mini-schema-validate.mjs`.
+// Nenhum schema é mockado; se um dos dois validadores recusar o outro, o
+// teste falha e vira divergência para o Architect (CTG-0005 §9 item 19).
+//
+// Ids de fixture (CTG-0005 §2.5): tenant `…a001`, agente `…b0000001`, AIT
+// `…f0000001`, reserva `…e6000001` (única entidade "conflito" com id
+// canônico — reusada como `conflictId` do ramo `SYNC_CONFLITO_RESOLVIDO`
+// publicado por este módulo, mesma convenção da versão anterior do teste).
+//
+// `type` cobertos por este spec: `ait.changed` (via `AIT_FINALIZADO`) e
+// `sync.conflict.resolved` (via `SYNC_CONFLITO_RESOLVIDO`, ramo
+// concurrency-review de `aitId`/`decision` — CTG-0001 §4.8).
+import { readFileSync } from 'node:fs';
+import { dirname, join, resolve } from 'node:path';
+import { fileURLToPath } from 'node:url';
+import { describe, expect, it } from 'vitest';
+
+import { validate } from '../../../../../../tools/contracts/tests/helpers/mini-schema-validate.mjs';
+import { AIT_EVENT_SCHEMAS } from './events.js';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
+const AIT_ID = '00000000-0000-7000-8000-0000f0000001';
+const CONFLICT_ID = '00000000-0000-7000-8000-0000e6000001';
+const NOW = '2026-09-14T12:00:00.000Z';
+
+const root = resolve(
+  dirname(fileURLToPath(import.meta.url)),
+  '../../../../../..',
+);
+const eventsSchemaDir = join(root, 'docs/framework/schemas/events');
+
+function loadEventSchema(type: string): unknown {
+  return JSON.parse(
+    readFileSync(join(eventsSchemaDir, `${type}.schema.json`), 'utf8'),
+  );
+}
+
+describe('C-5-25′ — inf/ait events.ts produz envelopes reais validáveis (types: ait.changed, sync.conflict.resolved)', () => {
+  it('dado um candidato AIT_FINALIZADO quando AIT_EVENT_SCHEMAS.AIT_FINALIZADO.parse produz o envelope então ait.changed.schema.json o valida', () => {
+    const envelope = AIT_EVENT_SCHEMAS.AIT_FINALIZADO.parse({
+      id: 'outbox-fixture-ait-finalizado',
+      type: 'ait.changed',
+      domainEvent: 'AIT_FINALIZADO',
+      version: 1,
+      occurredAt: NOW,
+      tenantId: TENANT_ID,
+      actor: { kind: 'user', id: AGENT_ID, role: 'field-agent' },
+      correlationId: AIT_ID,
+      aggregate: { kind: 'ait', id: AIT_ID, version: 1 },
+      data: {
+        aitId: AIT_ID,
+        aitNumber: '000001',
+        series: 'A',
+        fromState: 'RASCUNHO_OFFLINE',
+        toState: 'FINALIZADO_LOCAL',
+        contentHash: 'sha256:fixture-ait-finalizado',
+        finalizedAt: NOW,
+      },
+    });
+
+    const schema = loadEventSchema('ait.changed');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+
+  it('dado um candidato SYNC_CONFLITO_RESOLVIDO (ramo concurrency-review) quando AIT_EVENT_SCHEMAS.SYNC_CONFLITO_RESOLVIDO.parse produz o envelope então sync.conflict.resolved.schema.json o valida', () => {
+    const envelope = AIT_EVENT_SCHEMAS.SYNC_CONFLITO_RESOLVIDO.parse({
+      id: 'outbox-fixture-sync-conflito-resolvido-ait',
+      type: 'sync.conflict.resolved',
+      domainEvent: 'SYNC_CONFLITO_RESOLVIDO',
+      version: 1,
+      occurredAt: NOW,
+      tenantId: TENANT_ID,
+      actor: { kind: 'user', id: AGENT_ID, role: 'field-agent' },
+      correlationId: CONFLICT_ID,
+      aggregate: { kind: 'sync-conflict', id: CONFLICT_ID, version: 1 },
+      data: {
+        conflictId: CONFLICT_ID,
+        conflictType: 'concurrency',
+        aitId: AIT_ID,
+        decision: 'release',
+        resolvedAt: NOW,
+      },
+    });
+
+    const schema = loadEventSchema('sync.conflict.resolved');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+});
diff --git a/backend/domains/inf/measures/src/handwritten/events.schema.spec.ts b/backend/domains/inf/measures/src/handwritten/events.schema.spec.ts
new file mode 100644
index 0000000..86fdca9
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/events.schema.spec.ts
@@ -0,0 +1,65 @@
+// CTG-0005 §9 adenda item 19 (C-5-25′, TASK-0012 iteração 3) — substitui a
+// aproximação recusada na delivery-review (envelopes literais em
+// tools/contracts/tests/schemas.test.mjs não provavam o que o código
+// produz). Aqui o envelope nasce do helper real de `./events.js`
+// (`measureStartedEvent`, que fecha sobre `measureEnvelope` de
+// `measure-runtime.ts` — CTG-0004 §9): nenhum campo do envelope é montado à
+// mão fora da função exportada; só o `scope`/`data` de entrada usam ids de
+// fixture. O resultado é validado contra o schema JSON de
+// `docs/framework/schemas/events/measure.changed.schema.json` lido do disco,
+// com o validador mínimo de
+// `tools/contracts/tests/helpers/mini-schema-validate.mjs`. Nenhum schema é
+// mockado.
+//
+// Ids de fixture (CTG-0005 §2.5): tenant `…a001`, agente `…b0000001`, medida
+// `…ed000001` (estado `RETIDO`, seed 28), tipo de medida `…ec000001`
+// (`retencao`, seed 28), AIT `…f0000001`. `currentStatus: 'RETIDO'` é o
+// token de destino de `start` na matriz 8×12 (CTG-0004 §1).
+//
+// `type` coberto por este spec: `measure.changed` (via `MEDIDA_INICIADA`).
+import { readFileSync } from 'node:fs';
+import { dirname, join, resolve } from 'node:path';
+import { fileURLToPath } from 'node:url';
+import { describe, expect, it } from 'vitest';
+
+import { validate } from '../../../../../../tools/contracts/tests/helpers/mini-schema-validate.mjs';
+import { measureStartedEvent } from './events.js';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
+const MEASURE_ID = '00000000-0000-7000-8000-0000ed000001';
+const MEASURE_TYPE_ID = '00000000-0000-7000-8000-0000ec000001';
+const AIT_ID = '00000000-0000-7000-8000-0000f0000001';
+const NOW = '2026-09-14T12:00:00.000Z';
+
+const root = resolve(
+  dirname(fileURLToPath(import.meta.url)),
+  '../../../../../..',
+);
+const eventsSchemaDir = join(root, 'docs/framework/schemas/events');
+
+function loadEventSchema(type: string): unknown {
+  return JSON.parse(
+    readFileSync(join(eventsSchemaDir, `${type}.schema.json`), 'utf8'),
+  );
+}
+
+describe('C-5-25′ — inf/measures events.ts produz envelopes reais validáveis (type: measure.changed)', () => {
+  it('dado o scope e os dados de MEDIDA_INICIADA quando measureStartedEvent produz o envelope então measure.changed.schema.json o valida', () => {
+    const envelope = measureStartedEvent(
+      { tenantId: TENANT_ID, actorId: AGENT_ID, occurredAt: NOW },
+      {
+        measureId: MEASURE_ID,
+        measureTypeId: MEASURE_TYPE_ID,
+        aitId: AIT_ID,
+        agentId: AGENT_ID,
+        currentStatus: 'RETIDO',
+        startedAt: NOW,
+      },
+    );
+
+    const schema = loadEventSchema('measure.changed');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+});
diff --git a/backend/domains/ops/evidence/src/handwritten/events.schema.spec.ts b/backend/domains/ops/evidence/src/handwritten/events.schema.spec.ts
new file mode 100644
index 0000000..4124b85
--- /dev/null
+++ b/backend/domains/ops/evidence/src/handwritten/events.schema.spec.ts
@@ -0,0 +1,115 @@
+// CTG-0005 §9 adenda item 19 (C-5-25′, TASK-0012 iteração 3) — substitui a
+// aproximação recusada na delivery-review (envelopes literais em
+// tools/contracts/tests/schemas.test.mjs não provavam o que o código
+// produz). Aqui os envelopes nascem dos helpers reais de `./events.js`
+// (`evidenceCapturedEvent`, `custodyRecordedEvent`, `accessDeliveredEvent`,
+// `probativePackageGeneratedEvent` — CTG-0003 §8, todos sobre `teatEnvelope`
+// de `@detran/ops-core`). Os resultados são validados contra os schemas JSON
+// correspondentes em `docs/framework/schemas/events/` lidos do disco, com o
+// validador mínimo de `tools/contracts/tests/helpers/mini-schema-validate.mjs`.
+// Nenhum schema é mockado.
+//
+// Ids de fixture (CTG-0005 §2.5): tenant `…a001`, agente `…b0000001`,
+// evidência bodycam `…ef000001` (seed 27), AIT `…f0000001`, evento de
+// custódia `…ef300001` (seed 27), pedido de acesso a evidência `…ef400001`
+// (seed 27). `eventType`/`requesterRole` usam os enums reais exportados por
+// `evidence-runtime.ts` (`CUSTODY_EVENT_TYPES`, `uploaded`;
+// `EVIDENCE_ACCESS_REQUESTER_ROLES`, `autoridade-policial`).
+//
+// `type` cobertos por este spec: `evidence.changed`, `custody.event`,
+// `evidence.access-request.changed`, `probative-package.generated`.
+import { readFileSync } from 'node:fs';
+import { dirname, join, resolve } from 'node:path';
+import { fileURLToPath } from 'node:url';
+import { describe, expect, it } from 'vitest';
+
+import { validate } from '../../../../../../tools/contracts/tests/helpers/mini-schema-validate.mjs';
+import {
+  accessDeliveredEvent,
+  custodyRecordedEvent,
+  evidenceCapturedEvent,
+  probativePackageGeneratedEvent,
+} from './events.js';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
+const EVIDENCE_ID = '00000000-0000-7000-8000-0000ef000001';
+const AIT_ID = '00000000-0000-7000-8000-0000f0000001';
+const CUSTODY_EVENT_ID = '00000000-0000-7000-8000-0000ef300001';
+const ACCESS_REQUEST_ID = '00000000-0000-7000-8000-0000ef400001';
+const NOW = '2026-09-14T12:00:00.000Z';
+
+const root = resolve(
+  dirname(fileURLToPath(import.meta.url)),
+  '../../../../../..',
+);
+const eventsSchemaDir = join(root, 'docs/framework/schemas/events');
+
+function loadEventSchema(type: string): unknown {
+  return JSON.parse(
+    readFileSync(join(eventsSchemaDir, `${type}.schema.json`), 'utf8'),
+  );
+}
+
+describe('C-5-25′ — ops/evidence events.ts produz envelopes reais validáveis (types: evidence.changed, custody.event, evidence.access-request.changed, probative-package.generated)', () => {
+  const scope = { tenantId: TENANT_ID, actorId: AGENT_ID, occurredAt: NOW };
+
+  it('dado o scope e os dados de EVIDENCIA_CAPTURADA quando evidenceCapturedEvent produz o envelope então evidence.changed.schema.json o valida', () => {
+    const envelope = evidenceCapturedEvent(scope, {
+      evidenceId: EVIDENCE_ID,
+      entityType: 'ait',
+      entityId: AIT_ID,
+      evidenceType: 'bodycam',
+      hashValue: 'sha256:fixture-evidence',
+      capturedAt: '2026-09-14T12:00:00-04:00',
+      uploadedAt: NOW,
+    });
+
+    const schema = loadEventSchema('evidence.changed');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+
+  it('dado o scope e os dados de CUSTODIA_EVENTO quando custodyRecordedEvent produz o envelope então custody.event.schema.json o valida', () => {
+    const envelope = custodyRecordedEvent(scope, {
+      evidenceId: EVIDENCE_ID,
+      custodyEventId: CUSTODY_EVENT_ID,
+      eventType: 'uploaded',
+      eventAt: NOW,
+    });
+
+    const schema = loadEventSchema('custody.event');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+
+  it('dado o scope e os dados de acesso entregue quando accessDeliveredEvent produz o envelope então evidence.access-request.changed.schema.json o valida', () => {
+    const envelope = accessDeliveredEvent(scope, {
+      evidenceId: EVIDENCE_ID,
+      accessRequestId: ACCESS_REQUEST_ID,
+      custodyEventId: CUSTODY_EVENT_ID,
+      eventType: 'access_delivered',
+      requesterRole: 'autoridade-policial',
+      eventAt: NOW,
+    });
+
+    const schema = loadEventSchema('evidence.access-request.changed');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+
+  it('dado o scope e os dados de PACOTE_PROBATORIO_GERADO quando probativePackageGeneratedEvent produz o envelope então probative-package.generated.schema.json o valida', () => {
+    const envelope = probativePackageGeneratedEvent(scope, {
+      packageId: EVIDENCE_ID,
+      entityType: 'ait',
+      entityId: AIT_ID,
+      purpose: 'processo-administrativo',
+      manifestHash: 'sha256:fixture-probative',
+      itemCount: 1,
+    });
+
+    const schema = loadEventSchema('probative-package.generated');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+});
diff --git a/backend/domains/ops/offline-sync/src/handwritten/events.schema.spec.ts b/backend/domains/ops/offline-sync/src/handwritten/events.schema.spec.ts
new file mode 100644
index 0000000..c015746
--- /dev/null
+++ b/backend/domains/ops/offline-sync/src/handwritten/events.schema.spec.ts
@@ -0,0 +1,156 @@
+// CTG-0005 §9 adenda item 19 (C-5-25′, TASK-0012 iteração 3) — substitui a
+// aproximação recusada na delivery-review (envelopes literais em
+// tools/contracts/tests/schemas.test.mjs não provavam o que o código
+// produz). Aqui os envelopes nascem dos helpers reais de `./events.js`
+// (`syncItemReceivedEvent`, `syncConflictOpenedEvent`,
+// `syncConflictResolvedEvent`, `numberingReservationChangedEvent`,
+// `aitReceivedEvent`, `aitConcurrencySuspectedEvent` — CTG-0002 §7, todos
+// sobre `teatEnvelope` de `@detran/ops-core`). Os resultados são validados
+// contra os schemas JSON correspondentes em
+// `docs/framework/schemas/events/` lidos do disco, com o validador mínimo de
+// `tools/contracts/tests/helpers/mini-schema-validate.mjs`. Nenhum schema é
+// mockado.
+//
+// Ids de fixture (CTG-0005 §2.5): tenant `…a001`, agente `…b0000001`, AIT
+// `…f0000001`, dispositivo `…e4000002`, faixa de numeração `…e5000001`,
+// reserva `reserved` `…e6000001` (única entidade "conflito"/"item de fila"
+// com id canônico — reusada como `conflictId`/`syncQueueItemId`/`itemId` de
+// exemplo, mesma convenção da versão anterior do teste), turno aberto
+// `…e3000001`.
+//
+// `type` cobertos por este spec: `sync.batch.received`,
+// `sync.conflict.opened`, `sync.conflict.resolved`,
+// `numbering.reservation.changed`, `ait.changed` (ramo `AIT_RECEBIDO`),
+// `ait.concurrency-suspected`.
+import { readFileSync } from 'node:fs';
+import { dirname, join, resolve } from 'node:path';
+import { fileURLToPath } from 'node:url';
+import { describe, expect, it } from 'vitest';
+
+import { validate } from '../../../../../../tools/contracts/tests/helpers/mini-schema-validate.mjs';
+import {
+  aitConcurrencySuspectedEvent,
+  aitReceivedEvent,
+  numberingReservationChangedEvent,
+  syncConflictOpenedEvent,
+  syncConflictResolvedEvent,
+  syncItemReceivedEvent,
+} from './events.js';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const AGENT_ID = '00000000-0000-4000-8000-0000b0000001';
+const AIT_ID = '00000000-0000-7000-8000-0000f0000001';
+const DEVICE_ID = '00000000-0000-7000-8000-0000e4000002';
+const NUMBERING_RANGE_ID = '00000000-0000-7000-8000-0000e5000001';
+const RESERVATION_ID = '00000000-0000-7000-8000-0000e6000001';
+const SHIFT_ID = '00000000-0000-7000-8000-0000e3000001';
+const NOW = '2026-09-14T12:00:00.000Z';
+
+const root = resolve(
+  dirname(fileURLToPath(import.meta.url)),
+  '../../../../../..',
+);
+const eventsSchemaDir = join(root, 'docs/framework/schemas/events');
+
+function loadEventSchema(type: string): unknown {
+  return JSON.parse(
+    readFileSync(join(eventsSchemaDir, `${type}.schema.json`), 'utf8'),
+  );
+}
+
+describe('C-5-25′ — ops/offline-sync events.ts produz envelopes reais validáveis (types: sync.batch.received, sync.conflict.opened, sync.conflict.resolved, numbering.reservation.changed, ait.changed, ait.concurrency-suspected)', () => {
+  const scope = { tenantId: TENANT_ID, actorId: AGENT_ID, occurredAt: NOW };
+
+  it('dado o scope e os dados de SYNC_ITEM_RECEBIDO quando syncItemReceivedEvent produz o envelope então sync.batch.received.schema.json o valida', () => {
+    const envelope = syncItemReceivedEvent(scope, {
+      batchId: null,
+      deviceBatchId: 'e2e-fixture',
+      batchSequence: null,
+      itemId: AIT_ID,
+      entityType: 'ait',
+      localEntityId: AIT_ID,
+      receiptStatus: 'applied',
+      errorCode: null,
+      serverEntityId: AIT_ID,
+    });
+
+    const schema = loadEventSchema('sync.batch.received');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+
+  it('dado o scope e os dados de SYNC_CONFLITO_ABERTO quando syncConflictOpenedEvent produz o envelope então sync.conflict.opened.schema.json o valida', () => {
+    const envelope = syncConflictOpenedEvent(scope, {
+      conflictId: RESERVATION_ID,
+      conflictType: 'concurrency',
+      syncQueueItemId: RESERVATION_ID,
+      reasonCode: 'TEAT.SYNC_ITEM_CONFLICT',
+      openedAt: NOW,
+    });
+
+    const schema = loadEventSchema('sync.conflict.opened');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+
+  it('dado o scope e os dados de SYNC_CONFLITO_RESOLVIDO (ramo supervisor) quando syncConflictResolvedEvent produz o envelope então sync.conflict.resolved.schema.json o valida', () => {
+    const envelope = syncConflictResolvedEvent(scope, {
+      conflictId: RESERVATION_ID,
+      conflictType: 'integrity',
+      resolutionAction: 'accept_server',
+      resolvedAt: NOW,
+    });
+
+    const schema = loadEventSchema('sync.conflict.resolved');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+
+  it('dado o scope e os dados de NUMERACAO_RESERVADA quando numberingReservationChangedEvent produz o envelope então numbering.reservation.changed.schema.json o valida', () => {
+    const envelope = numberingReservationChangedEvent(scope, {
+      reservationId: RESERVATION_ID,
+      rangeId: NUMBERING_RANGE_ID,
+      agentId: AGENT_ID,
+      deviceId: DEVICE_ID,
+      shiftId: SHIFT_ID,
+      startNumber: 1,
+      endNumber: 100,
+      validUntil: '2026-09-15T00:00:00.000Z',
+      status: 'reserved',
+      action: 'reserve',
+    });
+
+    const schema = loadEventSchema('numbering.reservation.changed');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+
+  it('dado o scope e os dados de AIT_RECEBIDO quando aitReceivedEvent produz o envelope então ait.changed.schema.json o valida', () => {
+    const envelope = aitReceivedEvent(scope, {
+      aitId: AIT_ID,
+      fromState: 'FINALIZADO_LOCAL',
+      receiptProtocol: 'PROTO-FIXTURE-0001',
+      receivedAt: NOW,
+    });
+
+    const schema = loadEventSchema('ait.changed');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+
+  it('dado o scope e os dados de AIT_SUSPEITO_CONCORRENCIA quando aitConcurrencySuspectedEvent produz o envelope então ait.concurrency-suspected.schema.json o valida', () => {
+    const envelope = aitConcurrencySuspectedEvent(scope, {
+      aitId: AIT_ID,
+      agentId: AGENT_ID,
+      deviceId: DEVICE_ID,
+      otherDeviceId: null,
+      windowStart: NOW,
+      windowEnd: '2026-09-14T12:05:00.000Z',
+      conflictId: null,
+    });
+
+    const schema = loadEventSchema('ait.concurrency-suspected');
+    const result = validate(schema, envelope);
+    expect(result.valid, result.errors.join('\n')).toBe(true);
+  });
+});
diff --git a/tools/contracts/tests/schemas.test.mjs b/tools/contracts/tests/schemas.test.mjs
new file mode 100644
index 0000000..39b886a
--- /dev/null
+++ b/tools/contracts/tests/schemas.test.mjs
@@ -0,0 +1,215 @@
+// Testes dos schemas JSON manuscritos de `docs/framework/schemas/` (TASK-0012,
+// iteração 3, WP-T3, CTG-0005 §5 e §7 C-5-23/24/25/26; adenda §9.16 e §9
+// item 19).
+//
+// `ajv` não está disponível na raiz do workspace (adenda §9.16); os testes usam
+// `tools/contracts/tests/helpers/mini-schema-validate.mjs`, um validador mínimo
+// local que cobre `type`/`required`/`properties`/`const`/`enum`/
+// `additionalProperties`/`items`/`oneOf`/`$ref` local — o subconjunto que estes
+// schemas realmente usam (nenhum deles tem `$ref` remoto, `if`/`then`/`else`
+// nem `patternProperties`).
+//
+// C-5-25 (versão original: envelopes "copiados dos *.spec.ts dos events.ts de
+// cada módulo") foi recusado na delivery-review do ciclo 2 — nenhum módulo
+// TEAT tem um `events*.spec.ts` com literais completos, e os envelopes
+// "aproximados" que este arquivo continha não provavam o que o código produz
+// (adenda §9 item 19). Critério substituto **C-5-25′**: cada um dos oito
+// módulos TEAT com `events.ts` manuscrito
+// (`inf/{ait,measures,alcohol,normative}`, `ops/{evidence,field,
+// offline-sync,snapshots}`) ganhou `src/handwritten/events.schema.spec.ts`
+// próprio, que importa os helpers reais de `./events.js`, produz um envelope
+// por `type` que o módulo emite e o valida contra o schema em disco com este
+// mesmo validador — a união dos oito specs cobre os dezesseis `type` de
+// §5.4. Este arquivo não afirma mais C-5-25 (produção do envelope real): só
+// confere que cada um dos dezesseis schemas é carregável e declara a forma
+// mínima de envelope (`properties.type.const` e `properties.data`).
+import assert from 'node:assert/strict';
+import { readFile, readdir } from 'node:fs/promises';
+import { dirname, join, resolve } from 'node:path';
+import { fileURLToPath } from 'node:url';
+import test from 'node:test';
+import { validate } from './helpers/mini-schema-validate.mjs';
+
+const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
+const schemasDir = join(root, 'docs/framework/schemas');
+const eventsDir = join(schemasDir, 'events');
+
+async function readJson(filePath) {
+  return JSON.parse(await readFile(filePath, 'utf8'));
+}
+
+test('C-5-23 — todo docs/framework/schemas/*.json e schemas/events/*.json faz JSON.parse sem erro e declara $schema draft 2020-12 e $id', async () => {
+  const topLevel = (await readdir(schemasDir)).filter(
+    (name) => name.endsWith('.json') && name !== 'events',
+  );
+  const eventFiles = (await readdir(eventsDir)).filter((name) =>
+    name.endsWith('.json'),
+  );
+  const files = [
+    ...topLevel.map((name) => join(schemasDir, name)),
+    ...eventFiles.map((name) => join(eventsDir, name)),
+  ];
+  assert.ok(
+    files.length >= 19,
+    `esperava ao menos 19 arquivos, achou ${files.length}`,
+  );
+  for (const filePath of files) {
+    const raw = await readFile(filePath, 'utf8');
+    let doc;
+    assert.doesNotThrow(() => {
+      doc = JSON.parse(raw);
+    }, `${filePath} não é JSON válido`);
+    assert.equal(
+      doc.$schema,
+      'https://json-schema.org/draft/2020-12/schema',
+      `${filePath}: $schema`,
+    );
+    assert.ok(
+      typeof doc.$id === 'string' && doc.$id.length > 0,
+      `${filePath}: $id ausente ou vazio`,
+    );
+  }
+});
+
+// CTG-0005 §5.4 — os dezesseis arquivos e o domainEvent(s)/aggregate.kind que
+// cada um cobre; não inclui os cinco `inf.infraction*`/`inf.timer*` (RAIT, de
+// rodada anterior, fora de WP-T3) que também vivem em schemas/events/.
+const EXPECTED_EVENT_FILES = [
+  'ait.changed',
+  'ait.concurrency-suspected',
+  'sync.batch.received',
+  'sync.conflict.opened',
+  'sync.conflict.resolved',
+  'numbering.reservation.changed',
+  'shift.changed',
+  'device.posture-changed',
+  'catalog.published',
+  'package.published',
+  'evidence.changed',
+  'custody.event',
+  'evidence.access-request.changed',
+  'probative-package.generated',
+  'measure.changed',
+  'alcohol.changed',
+];
+
+test('C-5-24 — os dezesseis events/<type>.schema.json de CTG-0005 §5.4 existem e o const de type é igual ao nome do arquivo', async () => {
+  assert.equal(EXPECTED_EVENT_FILES.length, 16);
+  for (const token of EXPECTED_EVENT_FILES) {
+    const filePath = join(eventsDir, `${token}.schema.json`);
+    const doc = await readJson(filePath);
+    assert.equal(doc.properties?.type?.const, token, filePath);
+  }
+});
+
+// Módulo TEAT que publica cada `type` de §5.4 (para conferência humana; a
+// prova de que o helper real do módulo produz um envelope válido está no
+// `events.schema.spec.ts` do próprio módulo, C-5-25′).
+const EVENT_TYPE_MODULES = {
+  'ait.changed': ['inf/ait', 'ops/offline-sync'],
+  'ait.concurrency-suspected': ['ops/offline-sync'],
+  'sync.batch.received': ['ops/offline-sync'],
+  'sync.conflict.opened': ['ops/offline-sync'],
+  'sync.conflict.resolved': ['ops/offline-sync', 'inf/ait'],
+  'numbering.reservation.changed': ['ops/offline-sync'],
+  'shift.changed': ['ops/field'],
+  'device.posture-changed': ['ops/field'],
+  'catalog.published': ['inf/normative'],
+  'package.published': ['inf/normative'],
+  'evidence.changed': ['ops/evidence'],
+  'custody.event': ['ops/evidence'],
+  'evidence.access-request.changed': ['ops/evidence'],
+  'probative-package.generated': ['ops/evidence'],
+  'measure.changed': ['inf/measures'],
+  'alcohol.changed': ['inf/alcohol'],
+};
+
+test('C-5-25 — cada events/<type>.schema.json de §5.4 é carregável e declara a forma mínima de envelope (properties.type.const e properties.data); a produção real do envelope é C-5-25′ (events.schema.spec.ts de cada módulo)', async () => {
+  assert.equal(
+    Object.keys(EVENT_TYPE_MODULES).length,
+    EXPECTED_EVENT_FILES.length,
+    'um módulo de origem por arquivo de §5.4',
+  );
+  for (const token of EXPECTED_EVENT_FILES) {
+    const doc = await readJson(join(eventsDir, `${token}.schema.json`));
+    assert.equal(
+      doc.properties?.type?.const,
+      token,
+      `${token}.schema.json: properties.type.const`,
+    );
+    assert.ok(
+      doc.properties?.data !== undefined,
+      `${token}.schema.json: properties.data ausente`,
+    );
+    assert.ok(
+      Array.isArray(EVENT_TYPE_MODULES[token]) &&
+        EVENT_TYPE_MODULES[token].length > 0,
+      `${token}: sem módulo de origem em EVENT_TYPE_MODULES`,
+    );
+  }
+});
+
+test('C-5-26 — teat-offline-sync-batch.schema.json valida o corpo do lote usado em backend/app/tests/e2e/teat-field-sync.e2e.spec.ts e recusa um item sem payload_hash', async () => {
+  const schema = await readJson(
+    join(schemasDir, 'teat-offline-sync-batch.schema.json'),
+  );
+
+  // Corpo copiado literalmente de `syncBatchBody()` em
+  // backend/app/tests/e2e/teat-field-sync.e2e.spec.ts:87-106 (ids fixos aqui
+  // no lugar de randomUUID()/Date.now() para o teste ser determinístico; a
+  // forma e os valores dos demais campos são os do arquivo).
+  const crashRecordPayload = { crash: { local_protocol: 'BOAT-0001' } };
+  const realE2eBody = {
+    traffic_agency_id: '00000000-0000-7000-8000-0000e2000001',
+    device_id: '00000000-0000-7000-8000-0000e4000002',
+    agent_id: '00000000-0000-4000-8000-0000b0000001',
+    device_batch_id: 'e2e-fixture01',
+    items: [
+      {
+        entity_type: 'crash-record',
+        local_entity_id: '00000000-0000-7000-8000-0000ea000001',
+        idempotency_key: 'e2e-item-fixture01',
+        created_locally_at: '2026-09-14T13:05:00.000Z',
+        payload_json: crashRecordPayload,
+        payload_hash: 'sha256:fixture-crash-record',
+      },
+    ],
+  };
+
+  // C-5-26 (CTG-0005 §7) pede que o schema valide o corpo real do e2e. Numa
+  // primeira leitura desta iteração, `items[].entity_type.enum` (§5.1) não
+  // incluía `"crash-record"` ("crash-record é do BOAT e não é aceito aqui"),
+  // enquanto o próprio e2e usa `entity_type: 'crash-record'` e o comenta como
+  // "reconhecido como suportado e não tem destino nesta rodada (§4.3)" — o
+  // comando montado aceita e responde 200. Ou seja, o schema recusava o mesmo
+  // corpo que o e2e prova válido em produção; reportado como achado e
+  // corrigido em paralelo pelo Engineer (TASK-0010) — o schema agora inclui
+  // `"crash-record"` com a nota "aceito na forma e rejeitado no destino". A
+  // asserção abaixo é a do critério (valid === true); mantém o corpo real do
+  // e2e como está para continuar provando a integração schema × e2e.
+  const realBodyResult = validate(schema, realE2eBody);
+  assert.equal(
+    realBodyResult.valid,
+    true,
+    `esperado pelo e2e real (backend/app/tests/e2e/teat-field-sync.e2e.spec.ts) ` +
+      `mas o schema recusa: ${realBodyResult.errors.join('; ')}`,
+  );
+
+  // Isolando o critério "recusa um item sem payload_hash" do achado acima:
+  // mesma forma, com um `entity_type` que o schema aceita hoje.
+  const schemaValidBody = JSON.parse(JSON.stringify(realE2eBody));
+  schemaValidBody.items[0].entity_type = 'ait';
+  const validResult = validate(schema, schemaValidBody);
+  assert.ok(
+    validResult.valid,
+    `corpo com entity_type do enum deveria validar: ${validResult.errors.join('; ')}`,
+  );
+
+  delete schemaValidBody.items[0].payload_hash;
+  const missingHashResult = validate(schema, schemaValidBody);
+  assert.equal(missingHashResult.valid, false);
+  assert.ok(
+    missingHashResult.errors.some((error) => error.includes('payload_hash')),
+    `esperava um erro citando payload_hash; obteve: ${missingHashResult.errors.join('; ')}`,
+  );
+});

```
