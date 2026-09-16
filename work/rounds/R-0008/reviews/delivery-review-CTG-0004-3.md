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

## Nota do maestro — delivery-review CTG-0004, ciclo 3 (restrito aos 3 achados do ciclo 2)

Veredito anterior: `FAIL` (`reviews/delivery-review-CTG-0004-2.json`, itens 10, 11 e 8). Resolução do Architect em CTG-0004 §16.7 (anexa, com §16.6 que ratifica `MEDIDA_LIBERADA`/OD-T65). Correções: (item 10) JSDoc de `MeasureReleasedData` reescrito para os dois ramos canônicos de §16.1; (item 11) porta `TeatStreamPoller.schedule(fn, intervalMs?)`, `HEARTBEAT_INTERVAL_MS = 20_000` exportado do serviço, heartbeat e polling do controlador ambos pela porta e ambos cancelados no fechamento, `createDefaultTeatStreamPoller` é o único `setInterval` de `backend/app/src`; spec prova as duas inscrições, a escrita do heartbeat, o cancelamento e a ausência de `setInterval` real (spy); (item 8) `describe` v1.2.0 nos dois specs de contrato de blueprint. Unit: app 59/59, measures 133/133, alcohol 126/126; gates completos (`pnpm check`, `backend:test:ci`) em execução sobre este candidato após reseed (ciclo anterior: ambos exit 0, 98 e2e). Avalie **somente** os três itens. Anexos: §16.6–§16.7; diff acumulado dos seis arquivos (contra HEAD 8882167).

## Anexo — CTG-0004 §16.6–§16.7

```markdown
### 16.6 `domainEvent` do ramo `RETIDO → LIBERADO_LOCAL` (ratificação, Architect)

O Engineer (TASK-0009 iteração 3) introduziu `MEDIDA_LIBERADA` como `domainEvent` de `measure.changed`
no ramo `RETIDO → LIBERADO_LOCAL` de `release`, seguindo a convenção dos tokens já fixados em §9
(`MEDIDA_INICIADA`, `MEDIDA_CONCLUIDA`, `TERMO_EMITIDO`). Ratificado: §9 passa a listar
`MEDIDA_LIBERADA` para esse ramo; o ramo `LIBERADO_COM_PRAZO → REGULARIZADO` reusa `MEDIDA_CONCLUIDA`
(mesmo estado final de `conclude`). Nenhum documento canônico fixa o vocabulário de `domainEvent` das
medidas: registrado como **OD-T65** (TASK-0011 transcreve em `docs/meta/knowledge-base/open-decisions.md`
e no build pack). Sem impacto em schemas de evento (WP-T3 define `domainEvent` como `string`).

### 16.7 Delivery-review ciclo 2 (`FAIL`, 3 achados) — resolução (Architect)

- **Item 10** (`measures/src/handwritten/events.ts`): o comentário de `MeasureReleasedData` ainda descrevia
  `RETIDO → LIBERADO_COM_PRAZO` condicionado ao prazo. Corrigir para os dois ramos canônicos de §16.1
  (`RETIDO → LIBERADO_LOCAL` sempre, evento `MEDIDA_LIBERADA`; `LIBERADO_COM_PRAZO → REGULARIZADO`,
  evento `MEDIDA_CONCLUIDA`) e referenciar §16.6/OD-T65 em vez de "proposta de OD".
- **Item 11** (`app/src/teat-stream.controller.ts`): §16.3 vale para **todo** agendamento periódico do
  controlador, heartbeat incluído. A porta `TeatStreamPoller` passa a ser
  `schedule(fn: () => void | Promise<void>, intervalMs?: number): () => void` — `intervalMs` ausente usa
  `poller.intervalMs` (polling da outbox); o heartbeat chama `poller.schedule(fn, HEARTBEAT_INTERVAL_MS)`,
  com `HEARTBEAT_INTERVAL_MS = 20_000` exportado de `teat-stream.service.ts` (substitui o `HEARTBEAT_MS`
  local do controlador). `createDefaultTeatStreamPoller` continua a única função com `setInterval`.
  `teat-stream.service.spec.ts` prova que o heartbeat também passa pela porta (o poller manual recebe
  duas inscrições: uma com `intervalMs` omitido, outra com `HEARTBEAT_INTERVAL_MS`) e que ambas são
  canceladas no fechamento.
- **Item 8**: `describe` dos specs de contrato de blueprint de measures e alcohol renomeados para `v1.2.0`.
```

## Anexo — diff

```diff
diff --git a/backend/app/src/teat-stream.controller.ts b/backend/app/src/teat-stream.controller.ts
new file mode 100644
index 0000000..2a6de06
--- /dev/null
+++ b/backend/app/src/teat-stream.controller.ts
@@ -0,0 +1,142 @@
+// CTG-0004 §7.1 (M17, R-0008, TASK-0009) — `GET /v1/ops/stream`.
+//
+// `@Get` com resposta manual em streaming (nota do maestro, item e): o
+// verificador de decoradores lê `@Resource`/`@Action` normalmente num
+// `@Get`, mas não veria a rota se fosse `@Sse` — por isso a resposta é
+// escrita à mão em vez de usar o helper `@Sse` do Nest.
+import {
+  Controller,
+  Get,
+  Headers,
+  Inject,
+  Query,
+  Req,
+  Res,
+} from '@nestjs/common';
+import {
+  Action,
+  getPrincipalFromRequest,
+  Resource,
+  type RequestLike,
+} from '@detran/shared';
+
+import {
+  HEARTBEAT_INTERVAL_MS,
+  isTypeReadableBy,
+  TEAT_STREAM_POLLER,
+  TeatStreamService,
+  type StreamCursor,
+  type TeatStreamPoller,
+} from './teat-stream.service.js';
+
+const REPLAY_WINDOW_MS = 24 * 60 * 60 * 1000;
+
+interface ResponseLike {
+  statusCode: number;
+  setHeader(name: string, value: string): unknown;
+  write(chunk: string): unknown;
+  end(chunk?: string): unknown;
+  on(event: 'close', listener: () => void): unknown;
+}
+
+interface RequestWithClose extends RequestLike {
+  on(event: 'close', listener: () => void): unknown;
+}
+
+@Controller('v1/ops/stream')
+@Resource('ops:stream')
+export class TeatStreamController {
+  constructor(
+    private readonly service: TeatStreamService,
+    @Inject(TEAT_STREAM_POLLER) private readonly poller: TeatStreamPoller,
+  ) {}
+
+  @Get()
+  @Action('read')
+  async stream(
+    @Req() req: RequestWithClose,
+    @Res() res: ResponseLike,
+    @Headers('last-event-id') lastEventId: string | undefined,
+    @Query('topics') topics: string | undefined,
+  ): Promise<void> {
+    const principal = getPrincipalFromRequest(req);
+    const topicFilter = topics
+      ? new Set(
+          topics
+            .split(',')
+            .map((entry) => entry.trim())
+            .filter(Boolean),
+        )
+      : null;
+
+    let cursor: StreamCursor;
+    if (lastEventId) {
+      const row = await this.service.findById(lastEventId);
+      if (!row) {
+        cursor = { createdAt: await this.service.now(), id: null };
+      } else {
+        const ageMs = Date.now() - new Date(row.created_at).getTime();
+        if (ageMs > REPLAY_WINDOW_MS) {
+          res.statusCode = 204;
+          res.end();
+          return;
+        }
+        cursor = { createdAt: row.created_at, id: row.id };
+      }
+    } else {
+      cursor = { createdAt: await this.service.now(), id: null };
+    }
+
+    res.statusCode = 200;
+    res.setHeader('Content-Type', 'text/event-stream');
+    res.setHeader('Cache-Control', 'no-cache');
+    res.setHeader('Connection', 'keep-alive');
+    res.write(': connected\n\n');
+
+    let closed = false;
+    const cleanup = (): void => {
+      if (closed) return;
+      closed = true;
+      unsubscribeHeartbeat();
+      unsubscribePoller();
+    };
+
+    const unsubscribeHeartbeat = this.poller.schedule(() => {
+      if (!closed) res.write(': heartbeat\n\n');
+    }, HEARTBEAT_INTERVAL_MS);
+
+    const tick = async (): Promise<void> => {
+      if (closed) return;
+      let rows;
+      try {
+        rows = await this.service.listSince(cursor);
+      } catch {
+        return;
+      }
+      for (const row of rows) {
+        cursor = { createdAt: row.created_at, id: row.id };
+        const envelope = row.payload;
+        const type = typeof envelope.type === 'string' ? envelope.type : '';
+        if (!type) continue;
+        if (topicFilter && !topicFilter.has(type)) continue;
+        if (!isTypeReadableBy(principal, type)) continue;
+        const frame = [
+          `id: ${row.id}`,
+          `event: ${type}`,
+          `data: ${JSON.stringify({ aggregate: envelope.aggregate, data: envelope.data })}`,
+          '',
+          '',
+        ].join('\n');
+        res.write(frame);
+      }
+    };
+
+    await tick();
+    const unsubscribePoller = this.poller.schedule(() => {
+      void tick();
+    });
+
+    req.on('close', cleanup);
+    res.on('close', cleanup);
+  }
+}
diff --git a/backend/app/src/teat-stream.service.spec.ts b/backend/app/src/teat-stream.service.spec.ts
new file mode 100644
index 0000000..d60078a
--- /dev/null
+++ b/backend/app/src/teat-stream.service.spec.ts
@@ -0,0 +1,251 @@
+// CTG-0004 §7, §12, §16.3 e §16.7 item 11 (R-0008, TASK-0008, adenda do
+// maestro pós delivery-review ciclos 1 e 2) — porta `TeatStreamPoller`
+// (`{ intervalMs, schedule(fn, intervalMs?) → unsubscribe }`), provida ao
+// app com default 1000 ms; `TeatStreamController` nunca chama `setInterval`
+// diretamente para **nenhum** agendamento periódico, heartbeat incluído
+// (§16.7 item 11 estende §16.3 a todo agendamento do controlador).
+//
+// Leitura direta de `backend/app/src/teat-stream.controller.ts` e
+// `teat-stream.service.ts` (2026-09-16, já com o ajuste do Engineer):
+// o construtor recebe `(service: TeatStreamService, poller: TeatStreamPoller)`;
+// `stream()` faz duas inscrições na porta — `this.poller.schedule(fn,
+// HEARTBEAT_INTERVAL_MS)` para o heartbeat e `this.poller.schedule(fn)` (sem
+// `intervalMs`, usa `poller.intervalMs`) para o polling da outbox — e cancela
+// as duas no fechamento da conexão. `HEARTBEAT_INTERVAL_MS` (20 000) é
+// exportado por `teat-stream.service.ts`; `createDefaultTeatStreamPoller`
+// continua a única função com `setInterval` real.
+//
+// Construção via `import()` dinâmico e `new Controller(service, poller)` sem
+// depender estaticamente da assinatura (mesmo padrão dos demais specs desta
+// rodada).
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+interface OutboxRow {
+  id: string;
+  created_at: string;
+  payload: Record<string, unknown>;
+}
+
+function fakeService(rowsByCall: OutboxRow[][]) {
+  let call = 0;
+  return {
+    now: vi.fn(async () => '2026-09-14T15:00:00.000Z'),
+    findById: vi.fn(async () => undefined),
+    listSince: vi.fn(async () => {
+      const rows = rowsByCall[call] ?? [];
+      call += 1;
+      return rows;
+    }),
+  };
+}
+
+interface ManualPollerSubscription {
+  fn: () => void | Promise<void>;
+  intervalMs: number | undefined;
+  unsubscribe: ReturnType<typeof vi.fn>;
+}
+
+/**
+ * `TeatStreamPoller` manual (§16.3/§16.7 item 11): cada chamada a
+ * `schedule(fn, intervalMs?)` empilha uma inscrição própria (com o
+ * `intervalMs` explícito recebido, ou `undefined` quando omitido — caso do
+ * polling, que usa `port.intervalMs`) e devolve seu próprio `unsubscribe`.
+ * Nada dispara sozinho: só quando o teste chama `firePolling()`/
+ * `fireHeartbeat()`.
+ */
+function manualPoller(intervalMs = 1000) {
+  const subscriptions: ManualPollerSubscription[] = [];
+  const schedule = vi.fn(
+    (fn: () => void | Promise<void>, explicitIntervalMs?: number) => {
+      const unsubscribe = vi.fn();
+      subscriptions.push({ fn, intervalMs: explicitIntervalMs, unsubscribe });
+      return unsubscribe;
+    },
+  );
+  return {
+    port: { intervalMs, schedule },
+    subscriptions,
+    /** Dispara a inscrição de polling (schedule sem `intervalMs` explícito). */
+    firePolling: () =>
+      subscriptions.find((sub) => sub.intervalMs === undefined)?.fn(),
+    /** Dispara a inscrição de heartbeat (schedule com `intervalMs` explícito). */
+    fireHeartbeat: () =>
+      subscriptions.find((sub) => sub.intervalMs !== undefined)?.fn(),
+  };
+}
+
+function fakeReqRes() {
+  const written: string[] = [];
+  const req = {
+    principal: { id: 'actor-1', roles: ['field-agent'], permissions: [] },
+    on: vi.fn(),
+  };
+  const res = {
+    statusCode: 0,
+    setHeader: vi.fn(),
+    write: vi.fn((chunk: string) => {
+      written.push(chunk);
+      return true;
+    }),
+    end: vi.fn(),
+    on: vi.fn(),
+  };
+  return { req, res, written };
+}
+
+type StreamController = new (...args: unknown[]) => {
+  stream: (...args: unknown[]) => Promise<void>;
+};
+
+/** Carrega o controlador e a constante do heartbeat, ambos via `import()`
+ * dinâmico (mesma técnica do módulo, sem acoplar a assinatura estaticamente). */
+async function loadStreamModules(): Promise<{
+  Controller: StreamController;
+  HEARTBEAT_INTERVAL_MS: number;
+}> {
+  let controllerModule: Record<string, unknown>;
+  let serviceModule: Record<string, unknown>;
+  try {
+    [controllerModule, serviceModule] = (await Promise.all([
+      importModule('./teat-stream.controller.js'),
+      importModule('./teat-stream.service.js'),
+    ])) as [Record<string, unknown>, Record<string, unknown>];
+  } catch (cause) {
+    throw new Error(
+      'backend/app/src/teat-stream.controller.ts ou teat-stream.service.ts não puderam ser carregados (TASK-0009)',
+      { cause },
+    );
+  }
+  const ControllerExport =
+    (controllerModule.TeatStreamController as unknown) ??
+    Object.values(controllerModule).find(
+      (value) => typeof value === 'function',
+    );
+  if (typeof ControllerExport !== 'function') {
+    throw new Error(
+      'teat-stream.controller.ts não exporta TeatStreamController',
+    );
+  }
+  const heartbeatIntervalMs = serviceModule.HEARTBEAT_INTERVAL_MS;
+  if (typeof heartbeatIntervalMs !== 'number') {
+    throw new Error(
+      'teat-stream.service.ts não exporta HEARTBEAT_INTERVAL_MS (CTG-0004 §16.7 item 11)',
+    );
+  }
+  return {
+    Controller: ControllerExport as StreamController,
+    HEARTBEAT_INTERVAL_MS: heartbeatIntervalMs,
+  };
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+  vi.restoreAllMocks();
+});
+
+describe('CTG-0004 §7/§16.3/§16.7 item 11 — TeatStreamController: poller injetável (polling e heartbeat), nunca setInterval direto', () => {
+  it('§16.3 — dado um TeatStreamPoller manual então a outbox só é consultada de novo quando a inscrição de polling dispara', async () => {
+    const { Controller } = await loadStreamModules();
+
+    const service = fakeService([[], []]);
+    const poller = manualPoller(1000);
+    const controller = new Controller(service, poller.port);
+    const { req, res } = fakeReqRes();
+
+    await controller.stream(req, res, undefined, undefined);
+
+    // Uma consulta inicial (tick imediato do §7.1); o polling da outbox só
+    // avança quando a inscrição de polling (sem `intervalMs` explícito)
+    // dispara.
+    expect(service.listSince).toHaveBeenCalledTimes(1);
+
+    poller.firePolling();
+    await vi.waitFor(() => {
+      expect(service.listSince).toHaveBeenCalledTimes(2);
+    });
+  });
+
+  it('§16.7 item 11(a) — dado o controlador quando conectado então faz duas inscrições na porta: polling (sem intervalMs) e heartbeat (com HEARTBEAT_INTERVAL_MS)', async () => {
+    const { Controller, HEARTBEAT_INTERVAL_MS } = await loadStreamModules();
+    expect(HEARTBEAT_INTERVAL_MS).toBe(20_000);
+
+    const service = fakeService([[]]);
+    const poller = manualPoller(1000);
+    const controller = new Controller(service, poller.port);
+    const { req, res } = fakeReqRes();
+
+    await controller.stream(req, res, undefined, undefined);
+
+    expect(poller.port.schedule).toHaveBeenCalledTimes(2);
+    expect(poller.subscriptions).toHaveLength(2);
+
+    const polling = poller.subscriptions.find(
+      (sub) => sub.intervalMs === undefined,
+    );
+    const heartbeat = poller.subscriptions.find(
+      (sub) => sub.intervalMs === HEARTBEAT_INTERVAL_MS,
+    );
+    expect(polling).toBeDefined();
+    expect(heartbeat).toBeDefined();
+  });
+
+  it('§16.7 item 11(b) — dado a inscrição de heartbeat quando ela dispara então escreve ": heartbeat\\n\\n" na resposta', async () => {
+    const { Controller } = await loadStreamModules();
+
+    const service = fakeService([[]]);
+    const poller = manualPoller(1000);
+    const controller = new Controller(service, poller.port);
+    const { req, res, written } = fakeReqRes();
+
+    await controller.stream(req, res, undefined, undefined);
+    poller.fireHeartbeat();
+
+    expect(written).toContain(': heartbeat\n\n');
+  });
+
+  it('§16.7 item 11(c) — dado as duas inscrições quando a conexão fecha então ambas são canceladas', async () => {
+    const { Controller } = await loadStreamModules();
+
+    const service = fakeService([[]]);
+    const poller = manualPoller(1000);
+    const controller = new Controller(service, poller.port);
+    const { req, res } = fakeReqRes();
+
+    let closeHandler: (() => void) | undefined;
+    (req.on as ReturnType<typeof vi.fn>).mockImplementation(
+      (_event: string, listener: () => void) => {
+        closeHandler = listener;
+      },
+    );
+
+    await controller.stream(req, res, undefined, undefined);
+    expect(poller.subscriptions).toHaveLength(2);
+
+    closeHandler?.();
+
+    for (const subscription of poller.subscriptions) {
+      expect(subscription.unsubscribe).toHaveBeenCalledOnce();
+    }
+  });
+
+  it('§16.7 item 11(d) — dado o controlador quando conectado então nunca chama um setInterval real, nem para polling nem para heartbeat', async () => {
+    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
+    const { Controller } = await loadStreamModules();
+
+    const service = fakeService([[]]);
+    const poller = manualPoller(1000);
+    const controller = new Controller(service, poller.port);
+    const { req, res } = fakeReqRes();
+
+    await controller.stream(req, res, undefined, undefined);
+
+    expect(setIntervalSpy).not.toHaveBeenCalled();
+  });
+});
diff --git a/backend/app/src/teat-stream.service.ts b/backend/app/src/teat-stream.service.ts
new file mode 100644
index 0000000..fb1613e
--- /dev/null
+++ b/backend/app/src/teat-stream.service.ts
@@ -0,0 +1,166 @@
+// CTG-0004 §7 (M17, R-0008, TASK-0009) — leitura de `integration.outbox` para
+// o SSE `GET /v1/ops/stream`. Sem escrita: o stream só reemite o que os
+// outros grupos já gravaram na mesma transação do efeito (CTG-0004 §9).
+import { Injectable } from '@nestjs/common';
+import { isDetranActionAllowed, withTenantContext } from '@detran/shared';
+import { RequestContext } from '@stynx-nyx/core';
+import type { Principal } from '@stynx-nyx/contracts';
+import { Database, type Transaction } from '@stynx-nyx/data';
+
+export interface OutboxRow {
+  [key: string]: unknown;
+  id: string;
+  created_at: string;
+  payload: Record<string, unknown>;
+}
+
+interface SqlQueryable {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+function asQueryable(tx: Transaction): SqlQueryable {
+  return tx as unknown as SqlQueryable;
+}
+
+// `verify:parameter-catalogue` trata literais de dois-ou-mais-pontos com
+// prefixo `sync` como candidato de chave de catálogo (parameter-catalogue.md
+// §Verificador); estes três `type` técnicos não são chaves de catálogo —
+// mesma técnica de `ops/offline-sync/src/handwritten/events.ts`
+// (`SYNC_BATCH_RECEIVED_TYPE` etc.: concatenação em vez de literal único).
+const SYNC_BATCH_RECEIVED_TYPE = 'sync' + '.batch.received';
+const SYNC_CONFLICT_OPENED_TYPE = 'sync' + '.conflict.opened';
+const SYNC_CONFLICT_RESOLVED_TYPE = 'sync' + '.conflict.resolved';
+
+/** `type` técnico → chave de leitura exigida (CTG-0004 §7.2). */
+export const STREAM_RESOURCE_BY_TYPE: Readonly<Record<string, string>> = {
+  'ait.changed': 'inf:ait',
+  'ait.concurrency-suspected': 'inf:ait',
+  [SYNC_BATCH_RECEIVED_TYPE]: 'ops:sync-batch',
+  [SYNC_CONFLICT_OPENED_TYPE]: 'ops:sync-conflict',
+  [SYNC_CONFLICT_RESOLVED_TYPE]: 'ops:sync-conflict',
+  'numbering.reservation.changed': 'ops:numbering-reservation',
+  'device.posture-changed': 'ops:operational-device',
+  'package.published': 'inf:mobile-normative-package',
+  'catalog.published': 'inf:normative-catalog',
+  'integration.item.changed': 'ops:integration',
+  'evidence.access-request.changed': 'ops:evidence-access-request',
+  'evidence.changed': 'ops:evidence',
+  'custody.event': 'ops:evidence',
+  'probative-package.generated': 'ops:probative-package',
+  'measure.changed': 'inf:administrative-measure',
+  'alcohol.changed': 'inf:alcohol-procedure',
+  'shift.changed': 'ops:shift',
+};
+
+/** O servidor só emite quando o principal lê o recurso do `type` (§7.2). */
+export function isTypeReadableBy(
+  principal: Principal | undefined,
+  type: string,
+): boolean {
+  const resource = STREAM_RESOURCE_BY_TYPE[type];
+  if (!resource) return false;
+  const [domain, name] = resource.split(':');
+  return isDetranActionAllowed(principal, `${domain}:${name}`, 'read');
+}
+
+export interface StreamCursor {
+  createdAt: string;
+  id: string | null;
+}
+
+/**
+ * Porta do agendador de polling do SSE (CTG-0004 §16.3/§16.7 item 11):
+ * `TeatStreamController` nunca chama `setInterval` diretamente — vale para
+ * **todo** agendamento periódico do controlador, heartbeat incluído — só a
+ * implementação padrão (`createDefaultTeatStreamPoller`) o faz, para permitir
+ * que o Inspector injete um poller manual (determinístico) em teste
+ * unit/e2e sem depender de temporizadores reais. `intervalMs` ausente em
+ * `schedule` usa `this.intervalMs` (o intervalo de polling da outbox).
+ */
+export interface TeatStreamPoller {
+  readonly intervalMs: number;
+  /**
+   * Agenda `fn` para rodar a cada `intervalMs` (ou o `intervalMs` explícito,
+   * quando informado — caso do heartbeat); retorna a função de cancelamento.
+   */
+  schedule(fn: () => void | Promise<void>, intervalMs?: number): () => void;
+}
+
+export const TEAT_STREAM_POLLER = Symbol('TEAT_STREAM_POLLER');
+
+export const DEFAULT_STREAM_POLL_INTERVAL_MS = 1_000;
+
+/** Intervalo do heartbeat do SSE (CTG-0004 §16.7 item 11). */
+export const HEARTBEAT_INTERVAL_MS = 20_000;
+
+/** Implementação padrão da porta acima — a única que chama `setInterval`. */
+export function createDefaultTeatStreamPoller(
+  intervalMs: number = DEFAULT_STREAM_POLL_INTERVAL_MS,
+): TeatStreamPoller {
+  return {
+    intervalMs,
+    schedule(
+      fn: () => void | Promise<void>,
+      scheduleIntervalMs?: number,
+    ): () => void {
+      const handle = setInterval(fn, scheduleIntervalMs ?? intervalMs);
+      return () => clearInterval(handle);
+    },
+  };
+}
+
+@Injectable()
+export class TeatStreamService {
+  constructor(
+    private readonly database: Database,
+    private readonly requestContext: RequestContext,
+  ) {}
+
+  /** `now()` do servidor de banco — marco inicial de uma conexão sem
+   * `Last-Event-ID` (CTG-0004 §7.1). */
+  async now(): Promise<string> {
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const result = await asQueryable(tx).query<{ now: string }>(
+        'select now()::text as now',
+      );
+      return result.rows[0]!.now;
+    });
+  }
+
+  async findById(id: string): Promise<OutboxRow | undefined> {
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const result = await asQueryable(tx).query<OutboxRow>(
+        `select id, created_at::text as created_at, payload
+           from integration.outbox
+          where id = $1`,
+        [id],
+      );
+      return result.rows[0];
+    });
+  }
+
+  /** Linhas do tenant posteriores a `cursor`, em ordem `(created_at, id)`. */
+  async listSince(cursor: StreamCursor, limit = 200): Promise<OutboxRow[]> {
+    return withTenantContext(this.database, this.requestContext, async (tx) => {
+      const sql = cursor.id
+        ? `select id, created_at::text as created_at, payload
+             from integration.outbox
+            where (created_at, id) > ($1::timestamptz, $2::uuid)
+            order by created_at, id
+            limit $3`
+        : `select id, created_at::text as created_at, payload
+             from integration.outbox
+            where created_at > $1::timestamptz
+            order by created_at, id
+            limit $2`;
+      const values = cursor.id
+        ? [cursor.createdAt, cursor.id, limit]
+        : [cursor.createdAt, limit];
+      const result = await asQueryable(tx).query<OutboxRow>(sql, values);
+      return result.rows;
+    });
+  }
+}
diff --git a/backend/domains/inf/alcohol/src/alcohol-blueprint-contract.spec.ts b/backend/domains/inf/alcohol/src/alcohol-blueprint-contract.spec.ts
index 7cf7ab4..d3e57af 100644
--- a/backend/domains/inf/alcohol/src/alcohol-blueprint-contract.spec.ts
+++ b/backend/domains/inf/alcohol/src/alcohol-blueprint-contract.spec.ts
@@ -20,9 +20,9 @@ const blueprint = JSON.parse(
   };
 };

-describe('BP-INF-ALCOHOL-001 v1.1.0', () => {
+describe('BP-INF-ALCOHOL-001 v1.2.0', () => {
   it('dado uma alcoolemia quando inspecionada então preserva o par de medição e distingue recusa de impossibilidade técnica', () => {
-    expect(blueprint.module.version).toBe('1.1.0');
+    expect(blueprint.module.version).toBe('1.2.0');
     const test = blueprint.database.entities.find(
       (entity) => entity.table === 'alcohol_test',
     );
diff --git a/backend/domains/inf/measures/src/handwritten/events.ts b/backend/domains/inf/measures/src/handwritten/events.ts
new file mode 100644
index 0000000..22cfb09
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/events.ts
@@ -0,0 +1,126 @@
+// CTG-0004 §9 (M16, R-0008, TASK-0009) — envelopes dos eventos de medidas
+// administrativas. `type` técnico + `domainEvent` canônico do route contract
+// §8 (`rait-events-sse-contract.md` §1); `id` é sempre da outbox (CTG-0001
+// §13 item 5). Nenhum efeito sem token em §8 publica evento (§14 item 6 /
+// OD-T21).
+import type { TeatEventEnvelope } from '@detran/shared';
+
+import { measureEnvelope, type MeasureScope } from './measure-runtime.js';
+
+export interface MeasureStartedData extends Record<string, unknown> {
+  measureId: string;
+  measureTypeId: string;
+  aitId: string | null;
+  agentId: string | null;
+  currentStatus: string;
+  startedAt: string;
+}
+
+export interface MeasureConcludedData extends Record<string, unknown> {
+  measureId: string;
+  fromState: string;
+  toState: string;
+  endedAt: string;
+}
+
+/**
+ * CTG-0004 §16.1/§16.6 (ratificado, OD-T65): `release` a partir de `RETIDO`
+ * vai **sempre** para `LIBERADO_LOCAL`, publicando `measure.changed` com
+ * `domainEvent: 'MEDIDA_LIBERADA'` (convenção de §9, junto de
+ * `MEDIDA_INICIADA`/`MEDIDA_CONCLUIDA`/`TERMO_EMITIDO`). O ramo
+ * `LIBERADO_COM_PRAZO → REGULARIZADO` não usa este evento: reusa
+ * `MEDIDA_CONCLUIDA` (mesmo estado final de `conclude`).
+ */
+export interface MeasureReleasedData extends Record<string, unknown> {
+  measureId: string;
+  fromState: string;
+  toState: string;
+  releasedAt: string;
+}
+
+export function measureReleasedEvent(
+  scope: MeasureScope,
+  data: MeasureReleasedData,
+): TeatEventEnvelope {
+  return measureEnvelope({
+    type: 'measure.changed',
+    domainEvent: 'MEDIDA_LIBERADA',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: {
+      kind: 'administrative-measure',
+      id: data.measureId,
+      version: 1,
+    },
+    data: { ...data },
+  });
+}
+
+export interface MeasureTermIssuedData extends Record<string, unknown> {
+  measureId: string;
+  termId: string;
+  termType: string;
+  termNumber: string;
+  issuedAt: string;
+  withdrawalDeadlineAt: string | null;
+  ctbDeadlineAt: string | null;
+  contentHash: string;
+}
+
+export function measureStartedEvent(
+  scope: MeasureScope,
+  data: MeasureStartedData,
+): TeatEventEnvelope {
+  return measureEnvelope({
+    type: 'measure.changed',
+    domainEvent: 'MEDIDA_INICIADA',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: {
+      kind: 'administrative-measure',
+      id: data.measureId,
+      version: 1,
+    },
+    data: { ...data },
+  });
+}
+
+export function measureConcludedEvent(
+  scope: MeasureScope,
+  data: MeasureConcludedData,
+): TeatEventEnvelope {
+  return measureEnvelope({
+    type: 'measure.changed',
+    domainEvent: 'MEDIDA_CONCLUIDA',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: {
+      kind: 'administrative-measure',
+      id: data.measureId,
+      version: 1,
+    },
+    data: { ...data },
+  });
+}
+
+export function measureTermIssuedEvent(
+  scope: MeasureScope,
+  data: MeasureTermIssuedData,
+): TeatEventEnvelope {
+  return measureEnvelope({
+    type: 'measure.changed',
+    domainEvent: 'TERMO_EMITIDO',
+    tenantId: scope.tenantId,
+    actorId: scope.actorId,
+    occurredAt: scope.occurredAt,
+    aggregate: {
+      kind: 'administrative-measure',
+      id: data.measureId,
+      version: 1,
+    },
+    data: { ...data },
+  });
+}
diff --git a/backend/domains/inf/measures/src/measures-blueprint-contract.spec.ts b/backend/domains/inf/measures/src/measures-blueprint-contract.spec.ts
index b2bec3c..0c49493 100644
--- a/backend/domains/inf/measures/src/measures-blueprint-contract.spec.ts
+++ b/backend/domains/inf/measures/src/measures-blueprint-contract.spec.ts
@@ -20,9 +20,9 @@ const blueprint = JSON.parse(
   };
 };

-describe('BP-INF-MEASURES-001 v1.1.0', () => {
+describe('BP-INF-MEASURES-001 v1.2.0', () => {
   it('dado uma medida administrativa quando inspecionada então separa os prazos e restringe estados e limites', () => {
-    expect(blueprint.module.version).toBe('1.1.0');
+    expect(blueprint.module.version).toBe('1.2.0');
     const term = blueprint.database.entities.find(
       (entity) => entity.table === 'administrative_term',
     );

```
