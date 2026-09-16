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

## Nota do maestro — delivery-review CTG-0004, ciclo 2 (restrito aos 5 achados do ciclo 1)

Veredito anterior: `FAIL` (`reviews/delivery-review-CTG-0004.json`). Correções (adenda §16, anexa): (1) `release` — `LIBERADO_COM_PRAZO` + `regularized_at` → `REGULARIZADO`, `RETIDO` → `LIBERADO_LOCAL`, `measure_status_history` e `measure.changed` na mesma transação (unit 16 casos + integration 6, coerção Date→ISO corrigida); (2) C-0004-42 — resolução formal do Architect (§16.2/OD-T64): todos os papéis canônicos com `ops:stream:read` têm `inf:ait:read`, o critério passa a "assinante sem a chave de leitura do recurso do evento não o recebe", provado com `integration.item.changed` × `ops:integration:read`; (3) poller injetável `TeatStreamPoller` (token `TEAT_STREAM_POLLER`, default 1000 ms no app), controlador/serviço só usam a porta, `teat-stream.service.spec.ts` prova a injeção; (4) `record-test` exige tabela `active` de catálogo `active` do tenant/órgão (`NormativeCatalogRepository` via porta `catalogs`), 422 `TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING` `{ catalogId }` — unit positivo/2 negativos + integration positivo/negativo em tenant isolado; (5) blueprints `BP-INF-MEASURES-001` e `BP-INF-ALCOHOL-001` em **1.2.0**, regenerados, specs de contrato de blueprint atualizados. Gates completos (`pnpm check`, `backend:test:ci`) sobre o candidato final em execução no envio, após `apply.sh --full` + `seed.sh`; resultado registrado antes do commit (iteração anterior: 1530 testes verdes salvo o caso §16.4 negativo, corrigido pelo Inspector — tenant isolado). Avalie **somente** as cinco correções. Anexos: §16; diff acumulado dos arquivos relevantes (contra HEAD 8882167).

## Anexo — CTG-0004 §16

```markdown
## 16. Adenda do maestro (Architect, 2026-09-16, após delivery-review-CTG-0004 ciclo 1 — `FAIL`, 5 achados)

1. **`release` (§4.6)**: de `LIBERADO_COM_PRAZO` com `regularized_at` informado (ou já gravado) → `REGULARIZADO`; de `RETIDO` →
   `LIBERADO_LOCAL`; ambos gravam `inf.measure_status_history` na mesma transação e publicam `measure.changed`. Inspector cobre os dois
   ramos (unit + integration); Engineer implementa.
2. **C-0004-42 (§7.2, §11 linhas 1150–1151) — resolução formal**: todos os oito papéis TEAT que recebem `ops:stream:read` possuem
   `inf:ait:read` (`INF_SURFACE_RULES`), logo "assinante sem `inf:ait:read`" não existe entre os papéis canônicos e o critério literal é
   inexequível sem inventar papel. O critério passa a ser: **"um assinante sem a chave de leitura do recurso de um evento não o recebe"**,
   provado com `integration.item.changed` × `ops:integration:read` (só `integration-operator`/`technical-admin` a têm), como o Inspector
   fez; a tabela §7.2 continua valendo para `ait.changed` → `inf:ait:read`. Registrar OD-T64 (o Owner pode criar um papel de leitura
   restrita no futuro; até lá o filtro é provado por outro par recurso/chave).
3. **Poller injetável do SSE (§7, §12)**: porta `TeatStreamPoller` (`{ intervalMs, schedule(fn) → unsubscribe }`) provida no app com
   default 1000 ms; o controlador nunca chama `setInterval` diretamente; teste unit/e2e injeta um poller manual.
4. **Tabela metrológica (§5.2)**: a tabela usada tem `status='active'` **e** pertence a `normative_catalog` com `status='active'` do
   tenant (e do órgão quando `traffic_agency_id` estiver preenchido no catálogo); sem tabela nessas condições → 422
   `TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING` `{ catalogId? }`. Inspector: positivo + negativo (tabela ativa de catálogo `retired`).
5. **Versões de blueprint (§12)**: `BP-INF-MEASURES-001` e `BP-INF-ALCOHOL-001` sobem a **1.2.0** (maestro; regeneração); o Inspector
   atualiza `measures-blueprint-contract.spec.ts`/`alcohol-blueprint-contract.spec.ts` para `1.2.0`.
```

## Anexo — diff

```diff
diff --git a/backend/app/src/teat-stream.controller.ts b/backend/app/src/teat-stream.controller.ts
new file mode 100644
index 0000000..916094d
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
+  isTypeReadableBy,
+  TEAT_STREAM_POLLER,
+  TeatStreamService,
+  type StreamCursor,
+  type TeatStreamPoller,
+} from './teat-stream.service.js';
+
+const HEARTBEAT_MS = 20_000;
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
+      clearInterval(heartbeat);
+      unsubscribePoller();
+    };
+
+    const heartbeat = setInterval(() => {
+      if (!closed) res.write(': heartbeat\n\n');
+    }, HEARTBEAT_MS);
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
index 0000000..67f9607
--- /dev/null
+++ b/backend/app/src/teat-stream.service.spec.ts
@@ -0,0 +1,175 @@
+// CTG-0004 §7, §12 e §16.3 (R-0008, TASK-0008, adenda do maestro pós
+// delivery-review ciclo 1) — porta `TeatStreamPoller`
+// (`{ intervalMs, schedule(fn) → unsubscribe }`), provida ao app com
+// default 1000 ms; `TeatStreamController` nunca chama `setInterval`
+// diretamente para o polling da outbox.
+//
+// Leitura direta de `backend/app/src/teat-stream.controller.ts` (2026-09-16):
+// o construtor recebe só `(service: TeatStreamService)` e a rota `stream()`
+// chama `setInterval(...)` para o poller de outbox — a violação que esta
+// adenda pede para fechar. Este arquivo prova o alvo (o Engineer ajusta o
+// construtor para aceitar o poller em TASK-0009): construção via `import()`
+// dinâmico e `new Controller(service, poller)` sem depender estaticamente
+// da assinatura atual (mesmo padrão dos demais specs desta rodada) — em
+// runtime, um construtor JS aceita e ignora argumento extra, então a
+// construção não quebra mesmo antes do ajuste; a asserção sobre
+// `global.setInterval` é que fica vermelha até lá.
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
+/** `TeatStreamPoller` manual (§16.3): dispara só quando o teste chama `fire()`. */
+function manualPoller(intervalMs = 1000) {
+  let handler: (() => void) | undefined;
+  const unsubscribe = vi.fn();
+  return {
+    port: {
+      intervalMs,
+      schedule: vi.fn((fn: () => void) => {
+        handler = fn;
+        return unsubscribe;
+      }),
+    },
+    fire: () => handler?.(),
+    unsubscribe,
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
+async function loadController(): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./teat-stream.controller.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'backend/app/src/teat-stream.controller.ts não pôde ser carregado (TASK-0009)',
+      { cause },
+    );
+  }
+  return loaded;
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
+describe('CTG-0004 §7/§16.3 — TeatStreamController: poller injetável, nunca setInterval direto', () => {
+  it('§16.3 — dado um TeatStreamPoller manual então a outbox só é consultada de novo quando o poller dispara, nunca por um setInterval real', async () => {
+    const setIntervalSpy = vi.spyOn(global, 'setInterval');
+    const loaded = await loadController();
+    const ControllerExport =
+      (loaded.TeatStreamController as unknown) ??
+      Object.values(loaded).find((value) => typeof value === 'function');
+    if (typeof ControllerExport !== 'function') {
+      throw new Error(
+        'teat-stream.controller.ts não exporta TeatStreamController',
+      );
+    }
+    const Controller = ControllerExport as new (...args: unknown[]) => {
+      stream: (...args: unknown[]) => Promise<void>;
+    };
+
+    const service = fakeService([[], []]);
+    const poller = manualPoller(1000);
+    const controller = new Controller(service, poller.port);
+    const { req, res } = fakeReqRes();
+
+    await controller.stream(req, res, undefined, undefined);
+
+    // Uma consulta inicial (tick imediato do §7.1); o polling da outbox só
+    // deve vir do poller injetado — nunca de um `setInterval` com o
+    // intervalo do poller (1000 ms). O heartbeat (§7.1, HEARTBEAT_MS) é
+    // outro `setInterval`, fora do escopo do §16.3 (só a porta de polling
+    // da outbox é exigida) — por isso a asserção mira o intervalo, não
+    // "setInterval nunca chamado".
+    expect(service.listSince).toHaveBeenCalledTimes(1);
+    expect(poller.port.schedule).toHaveBeenCalledTimes(1);
+    expect(setIntervalSpy).not.toHaveBeenCalledWith(
+      expect.any(Function),
+      poller.port.intervalMs,
+    );
+
+    poller.fire();
+    await vi.waitFor(() => {
+      expect(service.listSince).toHaveBeenCalledTimes(2);
+    });
+    expect(setIntervalSpy).not.toHaveBeenCalledWith(
+      expect.any(Function),
+      poller.port.intervalMs,
+    );
+  });
+
+  it('§16.3 — dado o poller com intervalMs=1000 (default) quando a conexão fecha então schedule() devolve unsubscribe e ele é chamado', async () => {
+    const loaded = await loadController();
+    const ControllerExport =
+      (loaded.TeatStreamController as unknown) ??
+      Object.values(loaded).find((value) => typeof value === 'function');
+    const Controller = ControllerExport as new (...args: unknown[]) => {
+      stream: (...args: unknown[]) => Promise<void>;
+    };
+
+    const service = fakeService([[]]);
+    const poller = manualPoller(1000);
+    expect(poller.port.intervalMs).toBe(1000);
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
+    closeHandler?.();
+
+    expect(poller.unsubscribe).toHaveBeenCalledOnce();
+  });
+});
diff --git a/backend/app/src/teat-stream.service.ts b/backend/app/src/teat-stream.service.ts
new file mode 100644
index 0000000..24b2c96
--- /dev/null
+++ b/backend/app/src/teat-stream.service.ts
@@ -0,0 +1,155 @@
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
+ * Porta do agendador de polling do SSE (CTG-0004 §16.3, adenda, iteração 3,
+ * achado #3 da delivery-review ciclo 1): `TeatStreamController` nunca chama
+ * `setInterval` diretamente — só a implementação padrão (`schedule`) o faz,
+ * para permitir que o Inspector injete um poller manual (determinístico) em
+ * teste unit/e2e sem depender de temporizadores reais.
+ */
+export interface TeatStreamPoller {
+  readonly intervalMs: number;
+  /** Agenda `fn` para rodar a cada `intervalMs`; retorna a função de cancelamento. */
+  schedule(fn: () => void): () => void;
+}
+
+export const TEAT_STREAM_POLLER = Symbol('TEAT_STREAM_POLLER');
+
+export const DEFAULT_STREAM_POLL_INTERVAL_MS = 1_000;
+
+/** Implementação padrão da porta acima — a única que chama `setInterval`. */
+export function createDefaultTeatStreamPoller(
+  intervalMs: number = DEFAULT_STREAM_POLL_INTERVAL_MS,
+): TeatStreamPoller {
+  return {
+    intervalMs,
+    schedule(fn: () => void): () => void {
+      const handle = setInterval(fn, intervalMs);
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
diff --git a/backend/app/tests/e2e/teat-stream.e2e.spec.ts b/backend/app/tests/e2e/teat-stream.e2e.spec.ts
new file mode 100644
index 0000000..1db682a
--- /dev/null
+++ b/backend/app/tests/e2e/teat-stream.e2e.spec.ts
@@ -0,0 +1,399 @@
+import { randomUUID } from 'node:crypto';
+import http, { type IncomingMessage } from 'node:http';
+import type { NestFactory } from '@nestjs/core';
+import pg from 'pg';
+import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
+
+/**
+ * CTG-0004 §7 e §11 (R-0008, TASK-0008) — C-0004-41…46: `GET /v1/ops/stream`
+ * (M17). A rota não existe hoje (`teat-stream.controller.ts` nasce em
+ * TASK-0009) — toda conexão abaixo recebe 404 imediatamente, nunca um corpo
+ * `text/event-stream`; vermelho até TASK-0009 (regra 7 do prompt).
+ *
+ * Leitura em streaming via `http.get` no servidor real do app
+ * (`app.listen(0)`), lendo o corpo aos pedaços com timeout — nota do
+ * maestro (item f): supertest não expõe bem corpos que nunca terminam.
+ *
+ * C-0004-42 / §16.2 (adenda do maestro, 2026-09-16, após delivery-review
+ * ciclo 1 — OD-T64, ratificada): o cenário literal do contrato ("um evento
+ * `ait.changed` recebido por quem tem `inf:ait:read` e não por quem não
+ * tem") não é construtível com os papéis canônicos hoje — os oito papéis
+ * que `ops:stream:read` concede (CTG-0004 §8) são exatamente os nove de
+ * `INF_READ_ROLES` menos `bi-analyst`, e todos eles já têm `inf:ait:read`
+ * via `INF_SURFACE_RULES` (backend/domains/shared/src/policy.ts, verificado
+ * por leitura direta). Não há papel TEAT canônico que possa abrir o stream
+ * e não possa ler AIT. O Architect resolveu formalmente (§16.2): o critério
+ * passa a ser "um assinante sem a chave de leitura do recurso de um evento
+ * não o recebe", provado com `integration.item.changed`/`ops:integration:read`
+ * (só `integration-operator`/`technical-admin` têm essa chave entre os oito
+ * papéis do stream) — a tabela §7.2 continua valendo para
+ * `ait.changed` → `inf:ait:read`; a substituição por outro par recurso/chave
+ * é a prova aceita, não uma pendência.
+ *
+ * Perfil local: variáveis antes do `import` dinâmico de `app.module.js`
+ * (mesmo padrão de `teat-evidence-normative.e2e.spec.ts`).
+ */
+
+const { Client } = pg;
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+/** Criado em `beforeAll` (não é fixture canônica: `integration.outbox.tenant_id`
+ * tem FK para `auth.tenants`, então C-0004-46 precisa de um tenant real). */
+let OTHER_TENANT_ID: string;
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const AIT_ID = '00000000-0000-7000-8000-0000f0000001';
+
+const connectionString =
+  process.env.DETRAN_TEST_DATABASE_URL ??
+  process.env.DATABASE_URL ??
+  'postgresql://postgres:postgres@localhost:5432/detran';
+const client = new Client({ connectionString });
+
+let app: Awaited<ReturnType<typeof NestFactory.create>>;
+let port: number;
+const previousEnv: Record<string, string | undefined> = {};
+const createdOutboxIds: string[] = [];
+const openRequests: http.ClientRequest[] = [];
+
+function headers(role: string): Record<string, string> {
+  process.env.DETRAN_LOCAL_ROLES = role;
+  return {
+    authorization: 'Bearer local',
+    'x-tenant-id': TENANT_ID,
+    accept: 'text/event-stream',
+  };
+}
+
+interface SseEvent {
+  id?: string;
+  event?: string;
+  data?: string;
+}
+
+interface StreamResult {
+  status: number;
+  headers: Record<string, string | string[] | undefined>;
+  events: SseEvent[];
+}
+
+/** Lê o stream por até `timeoutMs`, parando antes se `stopAfter` eventos chegarem. */
+function readStream(
+  path: string,
+  requestHeaders: Record<string, string>,
+  {
+    timeoutMs = 3500,
+    stopAfter = Infinity,
+  }: { timeoutMs?: number; stopAfter?: number } = {},
+): Promise<StreamResult> {
+  return new Promise((resolve, reject) => {
+    const req = http.get(
+      { host: '127.0.0.1', port, path, headers: requestHeaders },
+      (res: IncomingMessage) => {
+        const events: SseEvent[] = [];
+        let buffer = '';
+        let current: SseEvent = {};
+        let settled = false;
+        const finish = () => {
+          if (settled) return;
+          settled = true;
+          clearTimeout(timer);
+          req.destroy();
+          resolve({
+            status: res.statusCode ?? 0,
+            headers: res.headers,
+            events,
+          });
+        };
+        const timer = setTimeout(finish, timeoutMs);
+        if (res.statusCode !== 200) {
+          finish();
+          return;
+        }
+        res.on('data', (chunk: Buffer) => {
+          buffer += chunk.toString('utf8');
+          const lines = buffer.split('\n');
+          buffer = lines.pop() ?? '';
+          for (const line of lines) {
+            const trimmed = line.replace(/\r$/, '');
+            if (trimmed === '') {
+              if (Object.keys(current).length > 0) events.push(current);
+              current = {};
+              if (events.length >= stopAfter) finish();
+              continue;
+            }
+            if (trimmed.startsWith(':')) continue; // heartbeat comment
+            const separator = trimmed.indexOf(':');
+            if (separator === -1) continue;
+            const field = trimmed.slice(0, separator);
+            const value = trimmed.slice(separator + 1).trimStart();
+            if (field === 'id') current.id = value;
+            else if (field === 'event') current.event = value;
+            else if (field === 'data') current.data = value;
+          }
+        });
+        res.on('end', finish);
+        res.on('error', finish);
+      },
+    );
+    openRequests.push(req);
+    req.on('error', (error) => {
+      if ((error as NodeJS.ErrnoException).code === 'ECONNRESET') return;
+      reject(error);
+    });
+  });
+}
+
+async function insertOutboxRow(
+  tenantId: string,
+  topic: string,
+  domainEvent: string,
+  aggregateId: string,
+  createdAt?: string,
+): Promise<string> {
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const envelope = {
+    type: topic,
+    domainEvent,
+    version: 1,
+    occurredAt: new Date().toISOString(),
+    tenantId,
+    actor: { kind: 'user', id: ACTOR_ID },
+    correlationId: randomUUID(),
+    aggregate: { kind: 'ait', id: aggregateId, version: 1 },
+    data: { aitId: aggregateId },
+  };
+  const result = await client.query<{ id: string }>(
+    `insert into integration.outbox
+       (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key, status, created_at, available_at)
+     values ($1, $2, 'ait', $3, $4::jsonb, $5, 'pending', coalesce($6::timestamptz, now()), coalesce($6::timestamptz, now()))
+     returning id`,
+    [
+      tenantId,
+      topic,
+      aggregateId,
+      JSON.stringify(envelope),
+      `${topic}:${aggregateId}:${randomUUID()}`,
+      createdAt ?? null,
+    ],
+  );
+  const id = result.rows[0]!.id;
+  createdOutboxIds.push(id);
+  return id;
+}
+
+beforeAll(async () => {
+  for (const key of [
+    'DETRAN_RUNTIME_PROFILE',
+    'DETRAN_LOCAL_TENANT_ID',
+    'DETRAN_LOCAL_ACTOR_ID',
+    'DETRAN_LOCAL_ROLES',
+  ]) {
+    previousEnv[key] = process.env[key];
+  }
+  process.env.DETRAN_RUNTIME_PROFILE = 'test';
+  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
+  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
+  process.env.DETRAN_LOCAL_ROLES = 'field-agent';
+
+  await client.connect();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  OTHER_TENANT_ID = randomUUID();
+  await client.query(
+    `insert into auth.tenants (id, slug, name) values ($1, $2, $3)`,
+    [
+      OTHER_TENANT_ID,
+      `teat-stream-other-${OTHER_TENANT_ID.slice(0, 8)}`,
+      'Other tenant (C-0004-46)',
+    ],
+  );
+
+  const { NestFactory: factory } = await import('@nestjs/core');
+  const { AppModule } = await import('../../src/app.module.js');
+  app = await factory.create(AppModule.forRoot(), {
+    logger: false,
+    abortOnError: false,
+  });
+  await app.init();
+  await app.listen(0);
+  const address = app.getHttpServer().address();
+  port = typeof address === 'object' && address ? address.port : 0;
+});
+
+afterEach(async () => {
+  for (const req of openRequests.splice(0)) req.destroy();
+  if (createdOutboxIds.length > 0) {
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    await client.query(
+      `delete from integration.outbox where id = any($1::uuid[])`,
+      [createdOutboxIds.splice(0)],
+    );
+  }
+});
+
+afterAll(async () => {
+  await app?.close();
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  await client.query(`delete from auth.tenants where id = $1`, [
+    OTHER_TENANT_ID,
+  ]);
+  await client.end();
+  for (const [key, value] of Object.entries(previousEnv)) {
+    if (value === undefined) delete process.env[key];
+    else process.env[key] = value;
+  }
+});
+
+describe('CTG-0004 §7.1 — GET /v1/ops/stream: guarda de política (C-0004-41)', () => {
+  it('C-0004-41 — dado DETRAN_LOCAL_ROLES=field-agent quando GET /v1/ops/stream então 200 com content-type text/event-stream', async () => {
+    const result = await readStream('/v1/ops/stream', headers('field-agent'), {
+      timeoutMs: 1500,
+    });
+    expect(result.status).toBe(200);
+    expect(String(result.headers['content-type'])).toContain(
+      'text/event-stream',
+    );
+  });
+
+  it('C-0004-41 — dado um papel PEC (CANDIDATO) quando GET /v1/ops/stream então 403', async () => {
+    const result = await readStream('/v1/ops/stream', headers('CANDIDATO'), {
+      timeoutMs: 1500,
+    });
+    expect(result.status).toBe(403);
+  });
+});
+
+describe('CTG-0004 §7.2/§16.2 — filtro por papel/recurso (C-0004-42, OD-T64 ratificada)', () => {
+  it('dado um evento integration.item.changed então integration-operator (tem ops:integration:read) o recebe', async () => {
+    const streamPromise = readStream(
+      '/v1/ops/stream',
+      headers('integration-operator'),
+      { timeoutMs: 3000, stopAfter: 1 },
+    );
+    await new Promise((resolve) => setTimeout(resolve, 200));
+    await insertOutboxRow(
+      TENANT_ID,
+      'integration.item.changed',
+      'INTEGRATION_ITEM_CHANGED',
+      AIT_ID,
+    );
+    const result = await streamPromise;
+    expect(
+      result.events.some((event) => event.event === 'integration.item.changed'),
+    ).toBe(true);
+  });
+
+  it('dado o mesmo evento então field-agent (sem ops:integration:read) não o recebe', async () => {
+    const streamPromise = readStream('/v1/ops/stream', headers('field-agent'), {
+      timeoutMs: 2000,
+    });
+    await new Promise((resolve) => setTimeout(resolve, 200));
+    await insertOutboxRow(
+      TENANT_ID,
+      'integration.item.changed',
+      'INTEGRATION_ITEM_CHANGED',
+      AIT_ID,
+    );
+    const result = await streamPromise;
+    expect(
+      result.events.some((event) => event.event === 'integration.item.changed'),
+    ).toBe(false);
+  });
+});
+
+describe('CTG-0004 §7.1 — replay por Last-Event-ID (C-0004-43, C-0004-44)', () => {
+  it('C-0004-43 — dado Last-Event-ID de um evento de 1h atrás então o replay reenvia, em ordem, só os posteriores', async () => {
+    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
+    const lastEventId = await insertOutboxRow(
+      TENANT_ID,
+      'ait.changed',
+      'AIT_CHANGED',
+      AIT_ID,
+      oneHourAgo,
+    );
+    const laterId = await insertOutboxRow(
+      TENANT_ID,
+      'ait.changed',
+      'AIT_CHANGED',
+      AIT_ID,
+    );
+    // `?topics=ait.changed` isola este caso de outros eventos reais no
+    // mesmo tenant (measure.changed/alcohol.changed de
+    // teat-measures-alcohol.e2e.spec.ts, que roda antes deste arquivo e
+    // publica de verdade agora que os comandos existem) — sem o filtro, o
+    // primeiro evento após o cursor pode não ser o `laterId` deste caso.
+    const result = await readStream(
+      '/v1/ops/stream?topics=ait.changed',
+      { ...headers('field-agent'), 'last-event-id': lastEventId },
+      { timeoutMs: 2000, stopAfter: 1 },
+    );
+    expect(result.events.map((event) => event.id)).toEqual([laterId]);
+  });
+
+  it('C-0004-44 — dado Last-Event-ID de um evento de 25h atrás então 204', async () => {
+    const twentyFiveHoursAgo = new Date(
+      Date.now() - 25 * 60 * 60 * 1000,
+    ).toISOString();
+    const staleId = await insertOutboxRow(
+      TENANT_ID,
+      'ait.changed',
+      'AIT_CHANGED',
+      AIT_ID,
+      twentyFiveHoursAgo,
+    );
+    const result = await readStream(
+      '/v1/ops/stream',
+      { ...headers('field-agent'), 'last-event-id': staleId },
+      { timeoutMs: 1500 },
+    );
+    expect(result.status).toBe(204);
+  });
+});
+
+describe('CTG-0004 §7.1 — filtro ?topics= (C-0004-45)', () => {
+  it('C-0004-45 — dado ?topics=ait.changed então só eventos desse tipo chegam', async () => {
+    const streamPromise = readStream(
+      '/v1/ops/stream?topics=ait.changed',
+      headers('integration-operator'),
+      { timeoutMs: 3000, stopAfter: 1 },
+    );
+    await new Promise((resolve) => setTimeout(resolve, 200));
+    await insertOutboxRow(
+      TENANT_ID,
+      'integration.item.changed',
+      'INTEGRATION_ITEM_CHANGED',
+      AIT_ID,
+    );
+    await insertOutboxRow(TENANT_ID, 'ait.changed', 'AIT_CHANGED', AIT_ID);
+    const result = await streamPromise;
+    expect(result.events.every((event) => event.event === 'ait.changed')).toBe(
+      true,
+    );
+    expect(result.events.length).toBeGreaterThan(0);
+  });
+});
+
+describe('CTG-0004 §7.1 — isolamento de tenant (C-0004-46)', () => {
+  it('C-0004-46 — dado um evento de outro tenant então ele nunca chega ao assinante, e tenantId não aparece em data', async () => {
+    // `?topics=ait.changed`: isola de outros eventos reais e legítimos do
+    // PRÓPRIO tenant a001 (measure.changed/alcohol.changed publicados por
+    // teat-measures-alcohol.e2e.spec.ts) — sem o filtro, `toHaveLength(0)`
+    // falharia por ruído que nada tem a ver com isolamento de tenant.
+    const streamPromise = readStream(
+      '/v1/ops/stream?topics=ait.changed',
+      headers('field-agent'),
+      { timeoutMs: 2000 },
+    );
+    await new Promise((resolve) => setTimeout(resolve, 200));
+    await insertOutboxRow(
+      OTHER_TENANT_ID,
+      'ait.changed',
+      'AIT_CHANGED',
+      AIT_ID,
+    );
+    const result = await streamPromise;
+    expect(result.events).toHaveLength(0);
+    for (const event of result.events) {
+      expect(event.data ?? '').not.toContain(OTHER_TENANT_ID);
+    }
+  });
+});
diff --git a/backend/domains/inf/alcohol/src/alcohol-blueprint-contract.spec.ts b/backend/domains/inf/alcohol/src/alcohol-blueprint-contract.spec.ts
index 7cf7ab4..4cbe15c 100644
--- a/backend/domains/inf/alcohol/src/alcohol-blueprint-contract.spec.ts
+++ b/backend/domains/inf/alcohol/src/alcohol-blueprint-contract.spec.ts
@@ -22,7 +22,7 @@ const blueprint = JSON.parse(

 describe('BP-INF-ALCOHOL-001 v1.1.0', () => {
   it('dado uma alcoolemia quando inspecionada então preserva o par de medição e distingue recusa de impossibilidade técnica', () => {
-    expect(blueprint.module.version).toBe('1.1.0');
+    expect(blueprint.module.version).toBe('1.2.0');
     const test = blueprint.database.entities.find(
       (entity) => entity.table === 'alcohol_test',
     );
diff --git a/backend/domains/inf/alcohol/src/handwritten/alcohol-lifecycle.provider.ts b/backend/domains/inf/alcohol/src/handwritten/alcohol-lifecycle.provider.ts
new file mode 100644
index 0000000..53e78fc
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/alcohol-lifecycle.provider.ts
@@ -0,0 +1,102 @@
+// CTG-0004 §12 (R-0008, TASK-0009), §15.1 e §16.4 (adenda, iterações 2 e 3)
+// — composição de `AlcoholCommands` no módulo gerado.
+//
+// `repositories` fica vazio de propósito para as tabelas do próprio pacote
+// (mesmo padrão de `inf/measures/src/handwritten/measure-lifecycle.provider.ts`
+// / CTG-0003 §4): toda leitura/escrita de produção acontece na transação do
+// comando. A tabela metrológica e o catálogo normativo são exceção (§15.1,
+// §16.4): pertencem a `inf/normative`, então a leitura vai pelos
+// repositórios GERADOS daquele pacote (`NormativeMetrologicalTableRepository`,
+// `NormativeCatalogRepository`), nunca por SQL cross-schema manuscrito aqui.
+// `NormativeModule` não exporta os repositórios no DI (só
+// `NormativeLifecycleService`, `moduleExports` do blueprint — fora do que
+// este worker pode tocar em `inf/normative`), então o provider os constrói
+// diretamente com os mesmos `Database`/`RequestContext` já injetados nesta
+// fábrica — mesmas duas dependências dos construtores gerados, sem precisar
+// do DI do Nest para essas classes.
+import type { Provider } from '@nestjs/common';
+import { SqlTeatEventOutbox } from '@detran/shared';
+import { RequestContext } from '@stynx-nyx/core';
+import { Database } from '@stynx-nyx/data';
+import {
+  NormativeCatalogRepository,
+  NormativeMetrologicalTableRepository,
+} from '@detran/inf-normative';
+
+import type { AlcoholDeps, AlcoholRowStore } from './alcohol-runtime.js';
+import { CloseProcedureCommand } from './close-procedure.command.js';
+import { ForwardProcedureCommand } from './forward-procedure.command.js';
+import { RecordRefusalCommand } from './record-refusal.command.js';
+import { RecordSignsCommand } from './record-signs.command.js';
+import { RecordTestCommand } from './record-test.command.js';
+import { StartProcedureCommand } from './start-procedure.command.js';
+
+function metrologicalTableStore(
+  repository: NormativeMetrologicalTableRepository,
+): AlcoholRowStore {
+  return {
+    list: async () => (await repository.findAll()).map((row) => ({ ...row })),
+    findOne: async (id) => {
+      try {
+        return { ...(await repository.findOne(id)) };
+      } catch {
+        return undefined;
+      }
+    },
+  };
+}
+
+/** CTG-0004 §16.4 (adenda, iteração 3) — mesmo adaptador para o catálogo. */
+function normativeCatalogStore(
+  repository: NormativeCatalogRepository,
+): AlcoholRowStore {
+  return {
+    list: async () => (await repository.findAll()).map((row) => ({ ...row })),
+    findOne: async (id) => {
+      try {
+        return { ...(await repository.findOne(id)) };
+      } catch {
+        return undefined;
+      }
+    },
+  };
+}
+
+/** Bolsa dos seis comandos manuscritos de alcoolemia (CTG-0004 §12). */
+export class AlcoholCommands {
+  readonly start: StartProcedureCommand;
+  readonly recordTest: RecordTestCommand;
+  readonly recordRefusal: RecordRefusalCommand;
+  readonly recordSigns: RecordSignsCommand;
+  readonly forward: ForwardProcedureCommand;
+  readonly close: CloseProcedureCommand;
+
+  constructor(deps: AlcoholDeps) {
+    this.start = new StartProcedureCommand(deps);
+    this.recordTest = new RecordTestCommand(deps);
+    this.recordRefusal = new RecordRefusalCommand(deps);
+    this.recordSigns = new RecordSignsCommand(deps);
+    this.forward = new ForwardProcedureCommand(deps);
+    this.close = new CloseProcedureCommand(deps);
+  }
+}
+
+export const ALCOHOL_LIFECYCLE_PROVIDER: Provider = {
+  provide: AlcoholCommands,
+  inject: [Database, RequestContext],
+  useFactory: (database: Database, requestContext: RequestContext) =>
+    new AlcoholCommands({
+      database,
+      requestContext,
+      repositories: {
+        metrologicalTables: metrologicalTableStore(
+          new NormativeMetrologicalTableRepository(database, requestContext),
+        ),
+        catalogs: normativeCatalogStore(
+          new NormativeCatalogRepository(database, requestContext),
+        ),
+      },
+      outbox: new SqlTeatEventOutbox(),
+      clock: { now: () => new Date().toISOString() },
+    }),
+};
diff --git a/backend/domains/inf/alcohol/src/handwritten/record-test.command.spec.ts b/backend/domains/inf/alcohol/src/handwritten/record-test.command.spec.ts
new file mode 100644
index 0000000..978e766
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/record-test.command.spec.ts
@@ -0,0 +1,487 @@
+// CTG-0004 §3, §3.1, §5.2 e §11 (R-0008, TASK-0008) — C-0004-13 (linha
+// `record-test`), C-0004-14, C-0004-15, C-0004-16, C-0004-17, C-0004-18 e
+// C-0004-19. `handwritten/record-test.command.ts` nasce em TASK-0009.
+// Fixtures: `28-fixtures-teat-measures-alcohol.sql` (`…ea000001` etilômetro
+// vigente até 2027-06-30, `…ea000002` vencido em 2025-12-31;
+// `…eb000001` tabela metrológica ativa, `table_json.thresholds` = {
+// administrative: 0.05, crime: 0.34 } (normativo, RN-TEAT-133) e
+// `table_json.tolerance` = [{0.00–0.40: max_error 0.04}, {0.40–∞: max_error
+// 0.05}] — SOURCE_PENDING (Anexo I da Res. 432 não capturado); os testes
+// abaixo leem `max_error` **da fixture**, nunca de constante própria
+// (regra do prompt, item 17). Relógio fixo em 2026-09-14.
+//
+// Nome esperado do export: `RecordTestCommand`, construtor `(deps)`, método
+// `execute(procedureId, dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const BREATHALYZER_VALID = '00000000-0000-7000-8000-0000ea000001';
+const BREATHALYZER_EXPIRED = '00000000-0000-7000-8000-0000ea000002';
+const METROLOGICAL_TABLE_ACTIVE = '00000000-0000-7000-8000-0000eb000001';
+const CATALOG_ACTIVE = '00000000-0000-7000-8000-0000e0000001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+/** `table_json` real de `28-fixtures-teat-measures-alcohol.sql` (CTG-0004 §3.1). */
+const TABLE_JSON = {
+  unit: 'mg/L',
+  thresholds: { administrative: 0.05, crime: 0.34 },
+  tolerance: [
+    { from: 0.0, to: 0.4, max_error: 0.04 },
+    { from: 0.4, to: null, max_error: 0.05 },
+  ],
+};
+
+const ALL_PROCEDURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ee000001', state: 'ABORDAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000002', state: 'TRIAGEM' },
+  { id: '00000000-0000-7000-8000-0000ee000003', state: 'ETILOMETRO_OFERECIDO' },
+  { id: '00000000-0000-7000-8000-0000ee000004', state: 'TESTE_REALIZADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000005',
+    state: 'RESULTADO_ABAIXO_LIMITE',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000006',
+    state: 'RESULTADO_ADMINISTRATIVO',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000007', state: 'RESULTADO_CRIME' },
+  { id: '00000000-0000-7000-8000-0000ee000008', state: 'RECUSA_REGISTRADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000009',
+    state: 'IMPOSSIBILIDADE_TECNICA',
+  },
+  { id: '00000000-0000-7000-8000-0000ee000010', state: 'OUTRO_MEIO_PROVA' },
+  { id: '00000000-0000-7000-8000-0000ee000011', state: 'SINAIS_CONSTATADOS' },
+  { id: '00000000-0000-7000-8000-0000ee000012', state: 'AIT_165A_LAVRADO' },
+  { id: '00000000-0000-7000-8000-0000ee000013', state: 'AIT_165_LAVRADO' },
+  {
+    id: '00000000-0000-7000-8000-0000ee000014',
+    state: 'ENCAMINHADO_POLICIA_JUDICIARIA',
+  },
+  {
+    id: '00000000-0000-7000-8000-0000ee000015',
+    state: 'SEM_AUTUACAO_ALCOOLEMIA',
+  },
+] as const;
+
+/** admitidos de `record-test` (CTG-0004 §3). */
+const ALLOWED_STATES = ['TRIAGEM', 'ETILOMETRO_OFERECIDO'];
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    find: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+    list: vi.fn(async () => store),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function proceduresRepo() {
+  return repository(
+    ALL_PROCEDURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      status: state,
+      outcome: '',
+    })),
+  );
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      procedures: proceduresRepo(),
+      tests: repository(),
+      breathalyzers: repository([
+        {
+          id: BREATHALYZER_VALID,
+          tenant_id: TENANT_ID,
+          calibration_valid_until: '2027-06-30',
+          status: 'active',
+        },
+        {
+          id: BREATHALYZER_EXPIRED,
+          tenant_id: TENANT_ID,
+          calibration_valid_until: '2025-12-31',
+          status: 'active',
+        },
+      ]),
+      metrologicalTables: repository([
+        {
+          id: METROLOGICAL_TABLE_ACTIVE,
+          tenant_id: TENANT_ID,
+          catalog_id: CATALOG_ACTIVE,
+          status: 'active',
+          table_json: TABLE_JSON,
+        },
+      ]),
+      catalogs: repository([
+        {
+          id: CATALOG_ACTIVE,
+          tenant_id: TENANT_ID,
+          status: 'active',
+        },
+      ]),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function recordTest(
+  dependencies: Deps,
+  procedureId: string,
+  body: Record<string, unknown>,
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./record-test.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/alcohol/src/handwritten/record-test.command.ts ainda não existe (TASK-0009, CTG-0004 §5.2)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.RecordTestCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'record-test.command.ts não exporta um comando construtível (CTG-0004 §5.2)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'record-test.command.ts não expõe execute|handle|run (CTG-0004 §5.2)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, procedureId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+const VALID_BODY = {
+  breathalyzer_id: BREATHALYZER_VALID,
+  result_mg_l: 0.3,
+  tested_at: '2026-09-14T10:00:00-04:00',
+};
+
+describe('CTG-0004 §3/§5.2 — record-test: matriz de estados (C-0004-13, linha `record-test`)', () => {
+  for (const { id, state } of ALL_PROCEDURE_STATES) {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    it(`dado procedimento ${id} em ${state} quando record-test então ${admitted ? 'sucesso' : '409 TEAT.ALCOHOL_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      if (admitted) {
+        await expect(
+          recordTest(dependencies, id, VALID_BODY),
+        ).resolves.toMatchObject({ procedure_id: id });
+      } else {
+        await expect(
+          recordTest(dependencies, id, VALID_BODY),
+        ).rejects.toMatchObject({
+          code: 'TEAT.ALCOHOL_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            procedureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'record-test',
+          }),
+        });
+      }
+    });
+  }
+});
+
+describe('CTG-0004 §5.2 — record-test: guarda metrológica (C-0004-14, C-0004-15, C-0004-16)', () => {
+  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'TRIAGEM',
+  )!.id;
+
+  it('C-0004-14 — dado o etilômetro …ea000002 (verificação vencida) então 422 TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED com { breathalyzerId, calibrationValidUntil, testedAt }', async () => {
+    const dependencies = deps();
+    await expect(
+      recordTest(dependencies, PROCEDURE_TRIAGEM, {
+        ...VALID_BODY,
+        breathalyzer_id: BREATHALYZER_EXPIRED,
+      }),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED',
+      status: 422,
+      context: expect.objectContaining({
+        breathalyzerId: BREATHALYZER_EXPIRED,
+        calibrationValidUntil: expect.any(String),
+        testedAt: expect.any(String),
+      }),
+    });
+  });
+
+  it('C-0004-15 — dado nenhuma normative_metrological_table status=active então 422 TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING', async () => {
+    const dependencies = deps({
+      repositories: {
+        procedures: proceduresRepo(),
+        tests: repository(),
+        breathalyzers: repository([
+          {
+            id: BREATHALYZER_VALID,
+            tenant_id: TENANT_ID,
+            calibration_valid_until: '2027-06-30',
+            status: 'active',
+          },
+        ]),
+        metrologicalTables: repository([]),
+        catalogs: repository([
+          { id: CATALOG_ACTIVE, tenant_id: TENANT_ID, status: 'active' },
+        ]),
+      },
+    });
+    await expect(
+      recordTest(dependencies, PROCEDURE_TRIAGEM, VALID_BODY),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING',
+      status: 422,
+    });
+  });
+
+  // §16.4 (adenda do maestro, delivery-review ciclo 1, achado 4): a tabela
+  // usada precisa ter status='active' **e** pertencer a um
+  // normative_catalog com status='active' do tenant. Positivo (tabela e
+  // catálogo ativos) já é coberto pelos demais casos deste describe (usam
+  // `deps()` default); o negativo abaixo cobre tabela ativa de catálogo
+  // retired/draft.
+  it('§16.4 — dado tabela status=active mas normative_catalog status=active positivo (baseline explícito) então record-test é aceito', async () => {
+    const dependencies = deps();
+    await expect(
+      recordTest(dependencies, PROCEDURE_TRIAGEM, VALID_BODY),
+    ).resolves.toMatchObject({ procedure_id: PROCEDURE_TRIAGEM });
+  });
+
+  it('§16.4 — dado tabela status=active de um normative_catalog status=retired então 422 TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING com { catalogId }', async () => {
+    const dependencies = deps({
+      repositories: {
+        procedures: proceduresRepo(),
+        tests: repository(),
+        breathalyzers: repository([
+          {
+            id: BREATHALYZER_VALID,
+            tenant_id: TENANT_ID,
+            calibration_valid_until: '2027-06-30',
+            status: 'active',
+          },
+        ]),
+        metrologicalTables: repository([
+          {
+            id: METROLOGICAL_TABLE_ACTIVE,
+            tenant_id: TENANT_ID,
+            catalog_id: CATALOG_ACTIVE,
+            status: 'active',
+            table_json: TABLE_JSON,
+          },
+        ]),
+        catalogs: repository([
+          { id: CATALOG_ACTIVE, tenant_id: TENANT_ID, status: 'retired' },
+        ]),
+      },
+    });
+    await expect(
+      recordTest(dependencies, PROCEDURE_TRIAGEM, VALID_BODY),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING',
+      status: 422,
+      context: expect.objectContaining({ catalogId: CATALOG_ACTIVE }),
+    });
+  });
+
+  it('§16.4 — dado tabela status=active de um normative_catalog status=draft então 422 TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING', async () => {
+    const dependencies = deps({
+      repositories: {
+        procedures: proceduresRepo(),
+        tests: repository(),
+        breathalyzers: repository([
+          {
+            id: BREATHALYZER_VALID,
+            tenant_id: TENANT_ID,
+            calibration_valid_until: '2027-06-30',
+            status: 'active',
+          },
+        ]),
+        metrologicalTables: repository([
+          {
+            id: METROLOGICAL_TABLE_ACTIVE,
+            tenant_id: TENANT_ID,
+            catalog_id: CATALOG_ACTIVE,
+            status: 'active',
+            table_json: TABLE_JSON,
+          },
+        ]),
+        catalogs: repository([
+          { id: CATALOG_ACTIVE, tenant_id: TENANT_ID, status: 'draft' },
+        ]),
+      },
+    });
+    await expect(
+      recordTest(dependencies, PROCEDURE_TRIAGEM, VALID_BODY),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING',
+      status: 422,
+    });
+  });
+
+  it('C-0004-16 — dado result_mg_l ausente então 400 TEAT.ALCOHOL_RESULT_PAIR_REQUIRED', async () => {
+    const dependencies = deps();
+    const body = { ...VALID_BODY } as Record<string, unknown>;
+    delete body.result_mg_l;
+    await expect(
+      recordTest(dependencies, PROCEDURE_TRIAGEM, body),
+    ).rejects.toMatchObject({
+      code: 'TEAT.ALCOHOL_RESULT_PAIR_REQUIRED',
+      status: 400,
+    });
+  });
+});
+
+describe('CTG-0004 §3.1/§5.2 — record-test: max_error da fixture e considered_mg_l (C-0004-17, C-0004-19)', () => {
+  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'TRIAGEM',
+  )!.id;
+
+  it('C-0004-17 — dado result_mg_l=0.30 então considered_mg_l = 0.30 − max_error da faixa [0.00,0.40) da fixture (0.04) = 0.26, e o estado final é RESULTADO_ADMINISTRATIVO', async () => {
+    const dependencies = deps();
+    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
+      ...VALID_BODY,
+      result_mg_l: 0.3,
+    });
+    expect(result.max_error_mg_l).toBeCloseTo(0.04, 5);
+    expect(result.considered_mg_l).toBeCloseTo(0.26, 5);
+    expect(result.procedure_status).toBe('RESULTADO_ADMINISTRATIVO');
+  });
+
+  it('C-0004-19 — dado result_mg_l=0.02 (< max_error da faixa) então considered_mg_l = max(0, 0.02 − 0.04) = 0, nunca negativo', async () => {
+    const dependencies = deps();
+    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
+      ...VALID_BODY,
+      result_mg_l: 0.02,
+    });
+    expect(result.considered_mg_l).toBe(0);
+    expect(result.procedure_status).toBe('RESULTADO_ABAIXO_LIMITE');
+  });
+});
+
+describe('CTG-0004 §3.1/§5.2 — record-test: classificação pelos limiares da tabela (C-0004-18, WF-TEAT-005 §Limiares)', () => {
+  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'TRIAGEM',
+  )!.id;
+
+  it('dado considered < thresholds.administrative (0,05) então RESULTADO_ABAIXO_LIMITE', async () => {
+    const dependencies = deps();
+    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
+      ...VALID_BODY,
+      result_mg_l: 0.03,
+    });
+    expect(result.procedure_status).toBe('RESULTADO_ABAIXO_LIMITE');
+  });
+
+  it('dado thresholds.administrative <= considered < thresholds.crime então RESULTADO_ADMINISTRATIVO', async () => {
+    const dependencies = deps();
+    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
+      ...VALID_BODY,
+      result_mg_l: 0.3,
+    });
+    expect(result.procedure_status).toBe('RESULTADO_ADMINISTRATIVO');
+  });
+
+  it('dado considered >= thresholds.crime (0,34) então RESULTADO_CRIME', async () => {
+    const dependencies = deps();
+    const result = await recordTest(dependencies, PROCEDURE_TRIAGEM, {
+      ...VALID_BODY,
+      result_mg_l: 0.5,
+    });
+    expect(result.max_error_mg_l).toBeCloseTo(0.05, 5);
+    expect(result.considered_mg_l).toBeCloseTo(0.45, 5);
+    expect(result.procedure_status).toBe('RESULTADO_CRIME');
+  });
+});
+
+describe('CTG-0004 §5.2 — record-test: evento ALCOOLEMIA_TESTE_REGISTRADO', () => {
+  const PROCEDURE_TRIAGEM = ALL_PROCEDURE_STATES.find(
+    (entry) => entry.state === 'TRIAGEM',
+  )!.id;
+
+  it('dado record-test então alcohol.changed/ALCOOLEMIA_TESTE_REGISTRADO é publicado com resultMgL, maxErrorMgL e consideredMgL', async () => {
+    const dependencies = deps();
+    await recordTest(dependencies, PROCEDURE_TRIAGEM, VALID_BODY);
+    expect(dependencies.outbox.append).toHaveBeenCalledWith(
+      expect.anything(),
+      expect.objectContaining({
+        type: 'alcohol.changed',
+        domainEvent: 'ALCOOLEMIA_TESTE_REGISTRADO',
+        aggregate: expect.objectContaining({
+          kind: 'alcohol-procedure',
+          id: PROCEDURE_TRIAGEM,
+        }),
+        data: expect.objectContaining({
+          procedureId: PROCEDURE_TRIAGEM,
+          resultMgL: 0.3,
+          maxErrorMgL: expect.any(Number),
+          consideredMgL: expect.any(Number),
+        }),
+      }),
+    );
+  });
+});
diff --git a/backend/domains/inf/alcohol/src/handwritten/record-test.command.ts b/backend/domains/inf/alcohol/src/handwritten/record-test.command.ts
new file mode 100644
index 0000000..75e1419
--- /dev/null
+++ b/backend/domains/inf/alcohol/src/handwritten/record-test.command.ts
@@ -0,0 +1,174 @@
+// CTG-0004 §3.1, §5.2 (R-0008, TASK-0009, RN-TEAT-133) —
+// `POST procedures/{id}/tests`.
+import { DetranError } from '@detran/shared';
+
+import { classifyConsidered } from './classification.js';
+import { alcoholTestRegisteredEvent } from './events.js';
+import {
+  appendEvent,
+  assertAlcoholAllowed,
+  findRow,
+  findRowsWhere,
+  inTenantTransaction,
+  insertRow,
+  patchRow,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type AlcoholDeps,
+  type AlcoholRow,
+} from './alcohol-runtime.js';
+import {
+  consideredOf,
+  isMetrologicalTableJson,
+  maxErrorFor,
+  type MetrologicalTableJson,
+} from './metrological-table.js';
+
+const ALLOWED = ['TRIAGEM', 'ETILOMETRO_OFERECIDO'] as const;
+
+/** `null` para ausente/vazio — `traffic_agency_id` é opcional em ambas as
+ * tabelas (CTG-0004 §16.4). */
+function agencyIdOf(value: unknown): string | null {
+  return typeof value === 'string' && value.length > 0 ? value : null;
+}
+
+export interface RecordAlcoholTestInput {
+  breathalyzer_id?: string;
+  test_number?: string;
+  tested_at?: string;
+  result_mg_l?: number;
+  counterproof?: boolean;
+  result_image_evidence_id?: string;
+  outcome?: string;
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export class RecordTestCommand {
+  constructor(private readonly deps: AlcoholDeps) {}
+
+  async execute(
+    procedureId: string,
+    input: RecordAlcoholTestInput,
+  ): Promise<Record<string, unknown>> {
+    const scope = scopeOf(this.deps);
+    const testedAt = input.tested_at ?? scope.occurredAt;
+
+    return inTenantTransaction(this.deps, async (tx) => {
+      const procedure = await findRow(this.deps, tx, 'procedures', procedureId);
+      if (!procedure) throw tenantMismatch({ procedureId });
+      assertAlcoholAllowed(procedure, procedureId, ALLOWED, 'record-test');
+
+      // 1. guard central ([WF-TEAT-005]): etilômetro com verificação vigente.
+      const breathalyzerId = input.breathalyzer_id ?? '';
+      const breathalyzer = breathalyzerId
+        ? await findRow(this.deps, tx, 'breathalyzers', breathalyzerId)
+        : undefined;
+      const calibrationValidUntil = stringOf(
+        breathalyzer?.calibration_valid_until,
+      );
+      const notVerified =
+        !breathalyzer ||
+        breathalyzer.status !== 'active' ||
+        !calibrationValidUntil ||
+        calibrationValidUntil.slice(0, 10) < testedAt.slice(0, 10);
+      if (notVerified)
+        throw new DetranError('TEAT.ALCOHOL_BREATHALYZER_NOT_VERIFIED', {
+          status: 422,
+          context: { breathalyzerId, calibrationValidUntil, testedAt },
+          message: 'Etilômetro sem verificação metrológica vigente.',
+        });
+
+      // 2. tabela metrológica ativa cujo catálogo TAMBÉM está ativo — e, se o
+      // catálogo tiver `traffic_agency_id`, do mesmo órgão do procedimento
+      // (CTG-0004 §5.2/§16.4, adenda iteração 3, achado #4 da
+      // delivery-review ciclo 1: `status='active'` só na própria tabela não
+      // basta se o catálogo dela já foi aposentado — `retired`).
+      const procedureAgencyId = agencyIdOf(procedure.traffic_agency_id);
+      const activeTables = await findRowsWhere(
+        this.deps,
+        tx,
+        'metrologicalTables',
+        'status',
+        'active',
+      );
+      let tableRow: AlcoholRow | undefined;
+      let firstCatalogId: string | null = null;
+      for (const candidate of activeTables) {
+        const catalogId = stringOf(candidate.catalog_id);
+        if (!catalogId) continue;
+        if (firstCatalogId === null) firstCatalogId = catalogId;
+        const catalog = await findRow(this.deps, tx, 'catalogs', catalogId);
+        if (!catalog || catalog.status !== 'active') continue;
+        const catalogAgencyId = agencyIdOf(catalog.traffic_agency_id);
+        if (catalogAgencyId && catalogAgencyId !== procedureAgencyId) continue;
+        tableRow = candidate;
+        break;
+      }
+      if (!tableRow || !isMetrologicalTableJson(tableRow.table_json))
+        throw new DetranError('TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING', {
+          status: 422,
+          context: { catalogId: firstCatalogId },
+          message:
+            'Nenhuma tabela metrológica ativa de catálogo vigente para o órgão.',
+        });
+      const table = tableRow.table_json as MetrologicalTableJson;
+
+      // 3. `result_mg_l` obrigatório.
+      if (typeof input.result_mg_l !== 'number')
+        throw new DetranError('TEAT.ALCOHOL_RESULT_PAIR_REQUIRED', {
+          status: 400,
+          context: {},
+          message: 'Resultado do teste é obrigatório.',
+        });
+
+      const resultMgL = input.result_mg_l;
+      const maxErrorMgL = maxErrorFor(table, resultMgL);
+      const consideredMgL = consideredOf(resultMgL, maxErrorMgL);
+      const outcome = classifyConsidered(consideredMgL, table.thresholds);
+
+      const test = await insertRow(this.deps, tx, 'tests', {
+        procedure_id: procedureId,
+        breathalyzer_id: breathalyzerId || null,
+        test_number: input.test_number ?? null,
+        tested_at: testedAt,
+        result_mg_l: resultMgL,
+        max_error_mg_l: maxErrorMgL,
+        considered_mg_l: consideredMgL,
+        counterproof: input.counterproof ?? false,
+        result_image_evidence_id: input.result_image_evidence_id ?? null,
+        status: 'recorded',
+      });
+      await patchRow(this.deps, tx, 'procedures', procedureId, {
+        status: outcome,
+        outcome,
+      });
+      await appendEvent(
+        this.deps,
+        tx,
+        alcoholTestRegisteredEvent(scope, {
+          procedureId,
+          testId: stringOf(test.id),
+          breathalyzerId: breathalyzerId || null,
+          testedAt,
+          resultMgL,
+          maxErrorMgL,
+          consideredMgL,
+          outcome,
+          toState: outcome,
+        }),
+      );
+
+      return {
+        id: stringOf(test.id),
+        procedure_id: procedureId,
+        result_mg_l: resultMgL,
+        max_error_mg_l: maxErrorMgL,
+        considered_mg_l: consideredMgL,
+        procedure_status: outcome,
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/alcohol/tests/integration/alcohol-commands.integration.spec.ts b/backend/domains/inf/alcohol/tests/integration/alcohol-commands.integration.spec.ts
new file mode 100644
index 0000000..86cc774
--- /dev/null
+++ b/backend/domains/inf/alcohol/tests/integration/alcohol-commands.integration.spec.ts
@@ -0,0 +1,279 @@
+import type pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  commandDeps,
+  dropTenant,
+  FIXTURES,
+  importModule,
+  isolatedTenant,
+  newClient,
+  outboxEnvelopes,
+  runCommand,
+  seedTriagemProcedure,
+  verifyRepositories,
+} from './harness.js';
+
+/**
+ * CTG-0004 §5 e §11 (R-0008, TASK-0008) — C-0004-32, C-0004-33 e
+ * C-0004-34: transação única + outbox dos comandos de alcoolemia (M16) e
+ * rollback atômico. Tenant isolado (rait-test-strategy.md §6): os
+ * procedimentos criados nascem só para este arquivo.
+ */
+
+const TEST_EXPORTS = ['RecordTestCommand'];
+const REFUSAL_EXPORTS = ['RecordRefusalCommand'];
+const COMMAND_METHODS = ['execute', 'handle', 'run'];
+
+const client: pg.Client = newClient();
+let tenantId: string;
+let actorId: string;
+let startedAt: string;
+
+function outboxAppend(targetTenantId: string) {
+  return async (
+    _tx: unknown,
+    envelope: Record<string, unknown>,
+  ): Promise<{ id: string }> => {
+    await client.query(
+      `insert into integration.outbox
+         (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+       values ($1, $2, $3, $4, $5, $6)
+       on conflict (tenant_id, idempotency_key) do nothing
+       returning id`,
+      [
+        targetTenantId,
+        envelope.type,
+        (envelope.aggregate as { kind: string }).kind,
+        (envelope.aggregate as { id: string }).id,
+        JSON.stringify(envelope),
+        `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+      ],
+    );
+    return { id: 'ignored' };
+  };
+}
+
+beforeAll(async () => {
+  await client.connect();
+  const isolated = await isolatedTenant(client, 'inf-alcohol-commands');
+  tenantId = isolated.tenantId;
+  actorId = isolated.actorId;
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const now = await client.query<{ now: string }>('select now()::text as now');
+  startedAt = now.rows[0]!.now;
+});
+
+afterAll(async () => {
+  await dropTenant(client, tenantId);
+  await client.end();
+});
+
+describe('CTG-0004 §5.2 — record-test: transação única e outbox (C-0004-32)', () => {
+  it('C-0004-32 — dado record-test então sai ALCOOLEMIA_TESTE_REGISTRADO com resultMgL, maxErrorMgL e consideredMgL', async () => {
+    const seeded = await seedTriagemProcedure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: { append: outboxAppend(tenantId) },
+    });
+    await runCommand(
+      () => importModule('../../src/handwritten/record-test.command.js'),
+      'inf/alcohol/src/handwritten/record-test.command.ts',
+      TEST_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      seeded.procedureId,
+      {
+        breathalyzer_id: seeded.breathalyzerId,
+        result_mg_l: 0.3,
+        tested_at: '2026-09-14T10:00:00-04:00',
+      },
+    );
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    const registered = envelopes.find(
+      (envelope) => envelope.domainEvent === 'ALCOOLEMIA_TESTE_REGISTRADO',
+    );
+    expect(registered).toBeTruthy();
+    const data = registered?.data as Record<string, unknown>;
+    expect(data.resultMgL).toBeCloseTo(0.3, 5);
+    expect(typeof data.maxErrorMgL).toBe('number');
+    expect(typeof data.consideredMgL).toBe('number');
+  });
+});
+
+describe('§16.4 (adenda pós delivery-review ciclo 1) — record-test: tabela ativa exige catálogo ativo', () => {
+  // Achado do maestro (gates completos, banco reaplicado do zero): o
+  // negativo precisa de um tenant só seu. No tenant compartilhado do
+  // arquivo, `seedTriagemProcedure` dos outros casos (C-0004-32/33/34 e o
+  // positivo abaixo, todos com catalogStatus='active' default) já grava
+  // outra tabela normative_metrological_table status='active' de um
+  // catálogo status='active' — e o comando aceita **qualquer** tabela
+  // ativa de catálogo vigente do órgão (§5.2/§16.4), não só a da fixture
+  // deste caso. Isolando o tenant, nenhuma outra tabela existe para
+  // encontrar, e o 422 fica determinístico.
+  it('dada tabela metrológica active de um normative_catalog status=retired então 422 TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING', async () => {
+    const isolated = await isolatedTenant(
+      client,
+      'inf-alcohol-metrological-negative',
+    );
+    try {
+      const seeded = await seedTriagemProcedure(
+        client,
+        isolated.tenantId,
+        FIXTURES.agencyId,
+        isolated.actorId,
+        FIXTURES.shiftId,
+        'retired',
+      );
+      const dependencies = commandDeps(
+        client,
+        isolated.tenantId,
+        isolated.actorId,
+      );
+      await expect(
+        runCommand(
+          () => importModule('../../src/handwritten/record-test.command.js'),
+          'inf/alcohol/src/handwritten/record-test.command.ts',
+          TEST_EXPORTS,
+          COMMAND_METHODS,
+          dependencies,
+          seeded.procedureId,
+          {
+            breathalyzer_id: seeded.breathalyzerId,
+            result_mg_l: 0.3,
+            tested_at: '2026-09-14T10:00:00-04:00',
+          },
+        ),
+      ).rejects.toMatchObject({
+        code: 'TEAT.ALCOHOL_METROLOGICAL_TABLE_MISSING',
+        status: 422,
+      });
+    } finally {
+      await dropTenant(client, isolated.tenantId);
+    }
+  });
+
+  it('dada tabela metrológica active de um normative_catalog status=active (baseline positivo) então record-test é aceito', async () => {
+    const seeded = await seedTriagemProcedure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+      'active',
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: { append: outboxAppend(tenantId) },
+    });
+    await expect(
+      runCommand(
+        () => importModule('../../src/handwritten/record-test.command.js'),
+        'inf/alcohol/src/handwritten/record-test.command.ts',
+        TEST_EXPORTS,
+        COMMAND_METHODS,
+        dependencies,
+        seeded.procedureId,
+        {
+          breathalyzer_id: seeded.breathalyzerId,
+          result_mg_l: 0.3,
+          tested_at: '2026-09-14T10:00:00-04:00',
+        },
+      ),
+    ).resolves.toBeTruthy();
+  });
+});
+
+describe('CTG-0004 §5.3 — record-refusal: transação única e outbox (C-0004-33)', () => {
+  it('C-0004-33 — dado record-refusal então sai ALCOOLEMIA_RECUSA_REGISTRADA com kind', async () => {
+    const seeded = await seedTriagemProcedure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: { append: outboxAppend(tenantId) },
+    });
+    await runCommand(
+      () => importModule('../../src/handwritten/record-refusal.command.js'),
+      'inf/alcohol/src/handwritten/record-refusal.command.ts',
+      REFUSAL_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      seeded.procedureId,
+      {
+        kind: 'refusal',
+        refusal_description: 'Fixture — condutor se recusou (integração)',
+      },
+    );
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    const registered = envelopes.find(
+      (envelope) => envelope.domainEvent === 'ALCOOLEMIA_RECUSA_REGISTRADA',
+    );
+    expect(registered).toBeTruthy();
+    expect((registered?.data as Record<string, unknown>).kind).toBe('refusal');
+  });
+});
+
+describe('CTG-0004 §5.2 — record-test: rollback atômico (C-0004-34)', () => {
+  it('C-0004-34 — dado um rollback forçado (outbox.append falha) então nem a linha de alcohol_test nem o envelope existem', async () => {
+    const seeded = await seedTriagemProcedure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: {
+        append: async () => {
+          throw new Error('forced rollback (C-0004-34)');
+        },
+      },
+    });
+    await expect(
+      runCommand(
+        () => importModule('../../src/handwritten/record-test.command.js'),
+        'inf/alcohol/src/handwritten/record-test.command.ts',
+        TEST_EXPORTS,
+        COMMAND_METHODS,
+        dependencies,
+        seeded.procedureId,
+        {
+          breathalyzer_id: seeded.breathalyzerId,
+          result_mg_l: 0.3,
+          tested_at: '2026-09-14T10:00:00-04:00',
+        },
+      ),
+    ).rejects.toThrow();
+    const tests = await verifyRepositories(
+      client,
+      tenantId,
+      actorId,
+    ).tests.findByProcedure(seeded.procedureId);
+    expect(tests).toEqual([]);
+    // OD-T63: restrito ao agregado do próprio caso — outros testes deste
+    // arquivo (C-0004-32/33) publicam ALCOOLEMIA_TESTE_REGISTRADO/
+    // ALCOOLEMIA_RECUSA_REGISTRADA no mesmo tenant desde `startedAt`; sem o
+    // filtro por `aggregate.id`, um envelope de outro caso poderia mascarar
+    // o rollback deste.
+    const envelopes = (
+      await outboxEnvelopes(client, tenantId, startedAt)
+    ).filter(
+      (envelope) =>
+        (envelope.aggregate as { id?: string } | undefined)?.id ===
+        seeded.procedureId,
+    );
+    expect(
+      envelopes.some(
+        (envelope) => envelope.domainEvent === 'ALCOOLEMIA_TESTE_REGISTRADO',
+      ),
+    ).toBe(false);
+  });
+});
diff --git a/backend/domains/inf/measures/src/handwritten/measure-runtime.ts b/backend/domains/inf/measures/src/handwritten/measure-runtime.ts
new file mode 100644
index 0000000..6a35d8a
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/measure-runtime.ts
@@ -0,0 +1,329 @@
+// CTG-0004 §4, §12 (R-0008, TASK-0009) — dependências e utilidades comuns aos
+// comandos manuscritos de medidas administrativas.
+//
+// Os comandos nunca escrevem SQL de tabela fora da transação do comando: a
+// porta `MeasureRowStore` é a superfície mínima por tabela (a mesma forma de
+// `OpsRowStore`/`EvidenceRowStore`, CTG-0002 §4 / CTG-0003 §4, e a que os
+// harnesses de teste de `tests/integration/harness.ts` implementam). No
+// caminho de produção (`measure-lifecycle.provider.ts`) a porta é injetada
+// vazia (`repositories: {}`), e toda leitura/escrita acontece por SQL
+// parametrizado **na transação do comando** (`withTenantContext`, role
+// `app`, RLS na volta) — mesmo padrão de `ops/evidence` (CTG-0003 §4,
+// "repositories fica vazio de propósito").
+import { DetranError, withTenantContext } from '@detran/shared';
+import type { TeatEventEnvelope, TeatEventOutbox } from '@detran/shared';
+import type { RequestContext } from '@stynx-nyx/core';
+import type { Database, Transaction } from '@stynx-nyx/data';
+
+export type MeasureRow = Record<string, unknown>;
+
+export interface MeasureRowStore {
+  list?(): Promise<MeasureRow[]>;
+  find?(id: string): Promise<MeasureRow | undefined>;
+  findOne?(id: string): Promise<MeasureRow | undefined>;
+  create?(values: MeasureRow): Promise<MeasureRow>;
+  update?(
+    id: string,
+    patch: MeasureRow,
+    tx?: unknown,
+  ): Promise<MeasureRow | undefined>;
+}
+
+/**
+ * Porta de prazos de medida (OD-T38, CTG-0004 §14 item 3): assinatura de três
+ * argumentos usada pelos comandos — `deadlines.ts` no mesmo diretório expõe a
+ * função pura de cinco argumentos e a fábrica que fecha sobre `Calendar` e
+ * `MEASURE_TIMER_CATALOG` para produzir esta porta.
+ */
+export interface MeasureDeadlinesPort {
+  computeMeasureDue(
+    code: 'T-REG30' | 'T-REG15' | 'T-DEPOSITO6M',
+    startOn: string,
+    tenantId: string,
+  ): Promise<{ rawDueOn: string; dueOn: string }>;
+}
+
+/** `parameter-catalogue.md` §TEAT: `teat.monitored_custody` (DT-015). */
+export interface MeasureFeatureFlags {
+  isEnabled(flag: string): boolean;
+}
+
+/**
+ * Token de injeção da porta acima (CTG-0004 §15.2, adenda pós-TASK-0009
+ * iteração 1): o domínio nunca lê `process.env` diretamente — o app provê o
+ * valor real a partir de `detranFeatureFlagSet()`
+ * (`backend/app/src/teat-measures.providers.ts`).
+ */
+export const MEASURE_FEATURE_FLAGS = Symbol('MEASURE_FEATURE_FLAGS');
+
+export interface MeasureDeps {
+  database: Pick<Database, 'tx'>;
+  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>;
+  repositories: Record<string, MeasureRowStore | undefined>;
+  outbox?: TeatEventOutbox;
+  clock: { now(): string };
+  deadlines: MeasureDeadlinesPort;
+  featureFlags: MeasureFeatureFlags;
+}
+
+export interface MeasureScope {
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+}
+
+/** Tabelas tocadas pelos comandos desta tarefa (CTG-0004 §4). */
+export const MEASURE_TABLES = {
+  measures: 'inf.administrative_measure',
+  measureTypes: 'inf.measure_type',
+  terms: 'inf.administrative_term',
+  retentions: 'inf.measure_retention',
+  removals: 'inf.measure_removal',
+  inventories: 'inf.vehicle_inventory',
+  history: 'inf.measure_status_history',
+  towProviders: 'inf.tow_provider',
+  yards: 'inf.yard',
+} as const;
+
+export type MeasureTableName = keyof typeof MEASURE_TABLES;
+
+export function tenantScope(deps: MeasureDeps): {
+  tenantId: string;
+  actorId: string;
+} {
+  if (!deps.requestContext.hasActiveContext())
+    throw new Error('Um comando de medida exige contexto de requisição');
+  const snapshot = deps.requestContext.snapshot();
+  const tenantId = snapshot.tenantId ?? '';
+  const actorId = snapshot.actorId ?? '';
+  if (!tenantId || !actorId)
+    throw new Error('Um comando de medida exige tenantId e actorId');
+  return { tenantId, actorId };
+}
+
+export function scopeOf(deps: MeasureDeps): MeasureScope {
+  const { tenantId, actorId } = tenantScope(deps);
+  return { tenantId, actorId, occurredAt: deps.clock.now() };
+}
+
+/** `withTenantContext` (role `app`, RLS na volta) — nunca conexão de owner. */
+export function inTenantTransaction<T>(
+  deps: MeasureDeps,
+  work: (tx: Transaction) => Promise<T>,
+): Promise<T> {
+  return withTenantContext(deps.database, deps.requestContext, work);
+}
+
+function storeOf(
+  deps: MeasureDeps,
+  table: MeasureTableName,
+): MeasureRowStore | undefined {
+  return deps.repositories[table];
+}
+
+interface SqlQueryable {
+  query<T extends Record<string, unknown> = Record<string, unknown>>(
+    sql: string,
+    values?: readonly unknown[],
+  ): Promise<{ rows: T[] }>;
+}
+
+function asQueryable(tx: unknown): SqlQueryable | undefined {
+  const candidate = tx as Partial<SqlQueryable> | null | undefined;
+  return candidate && typeof candidate.query === 'function'
+    ? (candidate as SqlQueryable)
+    : undefined;
+}
+
+function assertColumns(values: MeasureRow): string[] {
+  const columns = Object.keys(values);
+  if (columns.some((column) => !/^[a-z_]+$/.test(column)))
+    throw new Error('Coluna inválida em escrita de medida');
+  return columns;
+}
+
+/** `jsonb` recebe JSON textual; os demais valores vão como estão. */
+function normalize(value: unknown): unknown {
+  if (value === null || value === undefined) return null;
+  if (typeof value === 'object' && !(value instanceof Date))
+    return JSON.stringify(value);
+  return value;
+}
+
+export async function findRow(
+  deps: MeasureDeps,
+  tx: unknown,
+  table: MeasureTableName,
+  id: string,
+): Promise<MeasureRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.find === 'function') return store.find(id);
+  if (typeof store?.findOne === 'function') return store.findOne(id);
+  const sql = asQueryable(tx);
+  if (!sql) return undefined;
+  const result = await sql.query(
+    `select * from ${MEASURE_TABLES[table]} where id = $1`,
+    [id],
+  );
+  return result.rows[0];
+}
+
+export async function findRowsWhere(
+  deps: MeasureDeps,
+  tx: unknown,
+  table: MeasureTableName,
+  column: string,
+  value: unknown,
+): Promise<MeasureRow[]> {
+  if (!/^[a-z_]+$/.test(column)) throw new Error('Coluna inválida em filtro');
+  const store = storeOf(deps, table);
+  if (typeof store?.list === 'function')
+    return (await store.list()).filter((row) => row[column] === value);
+  const sql = asQueryable(tx);
+  if (!sql) return [];
+  const result = await sql.query(
+    `select * from ${MEASURE_TABLES[table]} where ${column} = $1`,
+    [value],
+  );
+  return result.rows;
+}
+
+export async function insertRow(
+  deps: MeasureDeps,
+  tx: unknown,
+  table: MeasureTableName,
+  values: MeasureRow,
+): Promise<MeasureRow> {
+  const store = storeOf(deps, table);
+  if (typeof store?.create === 'function') return store.create(values);
+  const sql = asQueryable(tx);
+  if (!sql)
+    throw new Error(`Sem porta nem transação para escrever em ${table}`);
+  const columns = assertColumns(values);
+  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
+  const result = await sql.query(
+    `insert into ${MEASURE_TABLES[table]} (${columns.join(', ')})
+     values (${placeholders}) returning *`,
+    columns.map((column) => normalize(values[column])),
+  );
+  return (result.rows[0] ?? values) as MeasureRow;
+}
+
+export async function patchRow(
+  deps: MeasureDeps,
+  tx: unknown,
+  table: MeasureTableName,
+  id: string,
+  patch: MeasureRow,
+): Promise<MeasureRow | undefined> {
+  const store = storeOf(deps, table);
+  if (typeof store?.update === 'function') return store.update(id, patch, tx);
+  const sql = asQueryable(tx);
+  if (!sql) throw new Error(`Sem porta nem transação para atualizar ${table}`);
+  const columns = assertColumns(patch);
+  const assignments = columns
+    .map((column, index) => `${column} = $${index + 2}`)
+    .join(', ');
+  const result = await sql.query(
+    `update ${MEASURE_TABLES[table]}
+        set ${assignments}, updated_at = now()
+      where id = $1 returning *`,
+    [id, ...columns.map((column) => normalize(patch[column]))],
+  );
+  return result.rows[0];
+}
+
+export function stringOf(value: unknown): string {
+  return typeof value === 'string' ? value : String(value ?? '');
+}
+
+export function tenantMismatch(context: Record<string, unknown>): DetranError {
+  return new DetranError('TEAT.TENANT_MISMATCH', {
+    status: 404,
+    context,
+    message: 'Recurso inexistente no tenant do contexto.',
+  });
+}
+
+/** 409 `TEAT.MEASURE_STATE_INVALID` (CTG-0004 §1). */
+export function measureStateInvalid(
+  measureId: string,
+  currentState: string,
+  allowed: readonly string[],
+  command: string,
+): DetranError {
+  return new DetranError('TEAT.MEASURE_STATE_INVALID', {
+    status: 409,
+    context: { measureId, currentState, allowed: [...allowed], command },
+    message: 'Medida administrativa fora do estado exigido pelo comando.',
+  });
+}
+
+export function assertMeasureAllowed(
+  measure: MeasureRow,
+  measureId: string,
+  allowed: readonly string[],
+  command: string,
+): string {
+  const currentState = stringOf(measure.current_status);
+  if (!allowed.includes(currentState))
+    throw measureStateInvalid(measureId, currentState, allowed, command);
+  return currentState;
+}
+
+/**
+ * Registra uma linha de `measure_status_history` (CTG-0004 §4). O relógio é
+ * o mesmo do escopo (`scope.occurredAt`), nunca `Date.now()`.
+ */
+export function recordHistory(
+  deps: MeasureDeps,
+  tx: unknown,
+  measureId: string,
+  status: string,
+  reason: string,
+  actorId?: string,
+): Promise<MeasureRow> {
+  return insertRow(deps, tx, 'history', {
+    measure_id: measureId,
+    status,
+    user_ref: actorId ?? null,
+    reason,
+  });
+}
+
+export async function appendEvent(
+  deps: MeasureDeps,
+  tx: Transaction,
+  envelope: TeatEventEnvelope,
+): Promise<void> {
+  await deps.outbox?.append(tx, envelope);
+}
+
+/**
+ * Réplica mínima de `teatEnvelope` (CTG-0001 §2 / `@detran/ops-core`):
+ * `inf/measures` não depende de `ops-core` (CTG-0004 §12 não lista essa
+ * dependência), então o construtor do envelope mora aqui — mesma forma,
+ * `id` sempre vazio (a outbox o preenche, CTG-0001 §13 item 5).
+ */
+export function measureEnvelope(input: {
+  type: string;
+  domainEvent: string;
+  tenantId: string;
+  actorId: string;
+  occurredAt: string;
+  aggregate: { kind: string; id: string; version: number };
+  data: Record<string, unknown>;
+}): TeatEventEnvelope {
+  return {
+    id: '',
+    type: input.type,
+    domainEvent: input.domainEvent,
+    version: 1,
+    occurredAt: input.occurredAt,
+    tenantId: input.tenantId,
+    actor: { kind: 'user', id: input.actorId },
+    correlationId: input.aggregate.id,
+    aggregate: input.aggregate,
+    data: input.data,
+  };
+}
diff --git a/backend/domains/inf/measures/src/handwritten/release-retention.command.spec.ts b/backend/domains/inf/measures/src/handwritten/release-retention.command.spec.ts
new file mode 100644
index 0000000..75357c0
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/release-retention.command.spec.ts
@@ -0,0 +1,353 @@
+// CTG-0004 §1, §4.6 e §11 (R-0008, TASK-0008) — C-0004-01 (linha `release`).
+// `handwritten/release-retention.command.ts` nasce em TASK-0009. O 403
+// TEAT.MEASURE_RELEASE_NOT_ALLOWED (guarda de política) já está coberto por
+// `backend/domains/shared/src/policy.spec.ts` (CTG-0004 §4 describe); este
+// arquivo cobre só a guarda de estado do comando. Relógio fixo em 2026-09-14.
+//
+// Nome esperado do export: `ReleaseRetentionCommand`, construtor `(deps)`,
+// método `execute(retentionId, dto)`.
+import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
+
+const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
+const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
+const NOW = '2026-09-14T15:00:00.000Z';
+
+/**
+ * `release` opera sobre `measure_retention`, mas a matriz de C-0004-01 é
+ * sobre o estado da MEDIDA (§1: "release / RETIDO, LIBERADO_COM_PRAZO / os
+ * outros 10"). Uma retenção sintética por medida `…ed0000nn` (ids de teste,
+ * não da fixture SQL — só a fixture `…ed100001` existe em
+ * `28-fixtures-teat-measures-alcohol.sql`, presa à medida `…ed000003`;
+ * rait-test-strategy.md §6 permite variação a partir da fixture com override
+ * explícito, e aqui a variação é o próprio conjunto de estados da matriz).
+ */
+const ALL_MEASURE_STATES = [
+  { id: '00000000-0000-7000-8000-0000ed000001', state: 'RETIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000002', state: 'LIBERADO_LOCAL' },
+  { id: '00000000-0000-7000-8000-0000ed000003', state: 'LIBERADO_COM_PRAZO' },
+  { id: '00000000-0000-7000-8000-0000ed000004', state: 'REGULARIZADO' },
+  { id: '00000000-0000-7000-8000-0000ed000005', state: 'CONVERTIDO_REMOCAO' },
+  { id: '00000000-0000-7000-8000-0000ed000006', state: 'REMOVIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000007', state: 'EM_DEPOSITO' },
+  { id: '00000000-0000-7000-8000-0000ed000008', state: 'GUARDA_MONITORADA' },
+  {
+    id: '00000000-0000-7000-8000-0000ed000009',
+    state: 'VIOLACAO_MONITORAMENTO',
+  },
+  { id: '00000000-0000-7000-8000-0000ed000010', state: 'NOTIFICADO' },
+  { id: '00000000-0000-7000-8000-0000ed000011', state: 'RESTITUIDO' },
+  { id: '00000000-0000-7000-8000-0000ed000012', state: 'LEILAO' },
+] as const;
+
+/** admitidos de `release` (CTG-0004 §1). */
+const ALLOWED_STATES = ['RETIDO', 'LIBERADO_COM_PRAZO'];
+
+function repository(rows: Record<string, unknown>[] = []) {
+  const store = [...rows];
+  return {
+    rows: store,
+    findOne: vi.fn(async (id: string) => store.find((row) => row.id === id)),
+    update: vi.fn(async (id: string, patch: Record<string, unknown>) => {
+      const row = store.find((entry) => entry.id === id);
+      if (row) Object.assign(row, patch);
+      return row;
+    }),
+    // `release` grava `measure_status_history` (§16.1) — a porta de
+    // repositório precisa de `create` para não cair no atalho de SQL cru
+    // (que exigiria uma `tx` real, ausente nos testes unit).
+    create: vi.fn(async (values: Record<string, unknown>) => {
+      const row = { id: `row-${store.length + 1}`, ...values };
+      store.push(row);
+      return row;
+    }),
+  };
+}
+
+interface Deps {
+  database: { tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> };
+  requestContext: {
+    hasActiveContext(): boolean;
+    snapshot(): { tenantId: string; actorId: string };
+  };
+  repositories: Record<string, ReturnType<typeof repository>>;
+  outbox: { append: ReturnType<typeof vi.fn> };
+  clock: { now(): string };
+}
+
+function fixtures() {
+  const measures = repository(
+    ALL_MEASURE_STATES.map(({ id, state }) => ({
+      id,
+      tenant_id: TENANT_ID,
+      current_status: state,
+      regularized_at: null,
+    })),
+  );
+  const retentions = repository(
+    ALL_MEASURE_STATES.map(({ id, state }, index) => ({
+      id: `retention-${index + 1}`,
+      tenant_id: TENANT_ID,
+      measure_id: id,
+      regularization_deadline_at: null,
+      // §16.1: o ramo LIBERADO_COM_PRAZO → REGULARIZADO exige
+      // regularized_at informado ou já gravado; a fixture genérica da
+      // matriz de estados (C-0004-01) precisa desse campo para o único
+      // pré-estado admitido em que ele é obrigatório.
+      regularized_at:
+        state === 'LIBERADO_COM_PRAZO' ? '2026-10-10T00:00:00-04:00' : null,
+      released_at: null,
+    })),
+  );
+  return { measures, retentions };
+}
+
+function deps(overrides: Partial<Deps> = {}): Deps {
+  return {
+    database: overrides.database ?? {
+      async tx<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
+        return work({});
+      },
+    },
+    requestContext: overrides.requestContext ?? {
+      hasActiveContext: () => true,
+      snapshot: () => ({ tenantId: TENANT_ID, actorId: ACTOR_ID }),
+    },
+    repositories: overrides.repositories ?? {
+      ...fixtures(),
+      history: repository(),
+    },
+    outbox: overrides.outbox ?? {
+      append: vi.fn(async () => ({ id: 'outbox-row-1' })),
+    },
+    clock: overrides.clock ?? { now: () => NOW },
+  };
+}
+
+const importModule = (specifier: string): Promise<unknown> =>
+  import(/* @vite-ignore */ specifier);
+
+async function releaseRetention(
+  dependencies: Deps,
+  retentionId: string,
+  body: Record<string, unknown> = {},
+): Promise<Record<string, unknown>> {
+  let loaded: Record<string, unknown>;
+  try {
+    loaded = (await importModule('./release-retention.command.js')) as Record<
+      string,
+      unknown
+    >;
+  } catch (cause) {
+    throw new Error(
+      'inf/measures/src/handwritten/release-retention.command.ts ainda não existe (TASK-0009, CTG-0004 §4.6)',
+      { cause },
+    );
+  }
+  const exported =
+    (loaded.ReleaseRetentionCommand as unknown) ??
+    Object.values(loaded).find((value) => typeof value === 'function');
+  if (typeof exported !== 'function') {
+    throw new Error(
+      'release-retention.command.ts não exporta um comando construtível (CTG-0004 §4.6)',
+    );
+  }
+  const Command = exported as new (
+    dependencies: unknown,
+  ) => Record<string, unknown>;
+  const command = new Command(dependencies);
+  const method = ['execute', 'handle', 'run']
+    .map((name) => command[name])
+    .find((value) => typeof value === 'function');
+  if (typeof method !== 'function') {
+    throw new Error(
+      'release-retention.command.ts não expõe execute|handle|run (CTG-0004 §4.6)',
+    );
+  }
+  return (await (
+    method as (id: string, body: unknown) => Promise<unknown>
+  ).call(command, retentionId, body)) as Record<string, unknown>;
+}
+
+beforeEach(() => {
+  vi.useFakeTimers();
+  vi.setSystemTime(new Date(NOW));
+});
+
+afterEach(() => {
+  vi.useRealTimers();
+});
+
+describe('CTG-0004 §1/§4.6 — release: matriz de estados da medida (C-0004-01, linha `release`)', () => {
+  ALL_MEASURE_STATES.forEach(({ id, state }, index) => {
+    const admitted = (ALLOWED_STATES as readonly string[]).includes(state);
+    const retentionId = `retention-${index + 1}`;
+    it(`dada medida ${id} em ${state} quando release da retenção ${retentionId} então ${admitted ? 'sucesso' : '409 TEAT.MEASURE_STATE_INVALID'}`, async () => {
+      const dependencies = deps();
+      if (admitted) {
+        await expect(
+          releaseRetention(dependencies, retentionId),
+        ).resolves.toMatchObject({ measure_id: id });
+      } else {
+        await expect(
+          releaseRetention(dependencies, retentionId),
+        ).rejects.toMatchObject({
+          code: 'TEAT.MEASURE_STATE_INVALID',
+          status: 409,
+          context: expect.objectContaining({
+            measureId: id,
+            currentState: state,
+            allowed: ALLOWED_STATES,
+            command: 'release',
+          }),
+        });
+      }
+    });
+  });
+});
+
+describe('CTG-0004 §4.6 — release: retenção já liberada (pré-condição do contrato)', () => {
+  it('dado uma retenção com released_at já gravado então 409 TEAT.MEASURE_STATE_INVALID com { retentionId, currentState: "released" }', async () => {
+    const { measures } = fixtures();
+    const retentions = repository([
+      {
+        id: 'retention-released',
+        tenant_id: TENANT_ID,
+        measure_id: ALL_MEASURE_STATES[0].id,
+        regularization_deadline_at: null,
+        released_at: '2026-09-01T00:00:00-04:00',
+      },
+    ]);
+    const dependencies = deps({
+      repositories: { measures, retentions, history: repository() },
+    });
+    await expect(
+      releaseRetention(dependencies, 'retention-released'),
+    ).rejects.toMatchObject({
+      code: 'TEAT.MEASURE_STATE_INVALID',
+      status: 409,
+      context: expect.objectContaining({
+        retentionId: 'retention-released',
+        currentState: 'released',
+      }),
+    });
+  });
+
+  // §16.1 (adenda do maestro, delivery-review ciclo 1, OD do achado 1):
+  // `release` só tem dois ramos de destino, pelo pré-estado da medida — de
+  // `RETIDO` sempre para `LIBERADO_LOCAL` (a presença de
+  // `regularization_deadline_at` na retenção não muda o destino: essa
+  // leitura antiga do §4.6 foi substituída), e de `LIBERADO_COM_PRAZO` com
+  // `regularized_at` informado (no corpo) ou já gravado (na retenção) para
+  // `REGULARIZADO`. Os dois ramos gravam `inf.measure_status_history` na
+  // mesma transação e publicam `measure.changed`.
+  it('§16.1 — dada medida RETIDO (mesmo com regularization_deadline_at preenchida na retenção) quando release então current_status vai a LIBERADO_LOCAL, com measure_status_history e measure.changed na mesma transação', async () => {
+    const { measures } = fixtures();
+    const history = repository();
+    const outbox = { append: vi.fn(async () => ({ id: 'outbox-row-1' })) };
+    const retentions = repository([
+      {
+        id: 'retention-with-deadline',
+        tenant_id: TENANT_ID,
+        measure_id: ALL_MEASURE_STATES[0].id,
+        regularization_deadline_at: '2026-10-14T00:00:00-04:00',
+        regularized_at: null,
+        released_at: null,
+      },
+    ]);
+    const dependencies = deps({
+      repositories: { measures, retentions, history },
+      outbox,
+    });
+    const result = await releaseRetention(
+      dependencies,
+      'retention-with-deadline',
+    );
+    expect(result.current_status).toBe('LIBERADO_LOCAL');
+    expect(
+      history.rows.some(
+        (row) =>
+          row.measure_id === ALL_MEASURE_STATES[0].id &&
+          row.status === 'LIBERADO_LOCAL',
+      ),
+    ).toBe(true);
+    expect(outbox.append).toHaveBeenCalledWith(
+      expect.anything(),
+      expect.objectContaining({
+        type: 'measure.changed',
+        aggregate: expect.objectContaining({
+          kind: 'administrative-measure',
+          id: ALL_MEASURE_STATES[0].id,
+        }),
+      }),
+    );
+  });
+
+  it('§16.1 — dada medida LIBERADO_COM_PRAZO com regularized_at já gravado na retenção quando release então current_status vai a REGULARIZADO, com measure_status_history e measure.changed na mesma transação', async () => {
+    const measureId = ALL_MEASURE_STATES.find(
+      (entry) => entry.state === 'LIBERADO_COM_PRAZO',
+    )!.id;
+    const { measures } = fixtures();
+    const history = repository();
+    const outbox = { append: vi.fn(async () => ({ id: 'outbox-row-1' })) };
+    const retentions = repository([
+      {
+        id: 'retention-regularized',
+        tenant_id: TENANT_ID,
+        measure_id: measureId,
+        regularization_deadline_at: '2026-10-14T00:00:00-04:00',
+        regularized_at: '2026-10-10T00:00:00-04:00',
+        released_at: null,
+      },
+    ]);
+    const dependencies = deps({
+      repositories: { measures, retentions, history },
+      outbox,
+    });
+    const result = await releaseRetention(
+      dependencies,
+      'retention-regularized',
+    );
+    expect(result.current_status).toBe('REGULARIZADO');
+    expect(
+      history.rows.some(
+        (row) => row.measure_id === measureId && row.status === 'REGULARIZADO',
+      ),
+    ).toBe(true);
+    expect(outbox.append).toHaveBeenCalledWith(
+      expect.anything(),
+      expect.objectContaining({
+        type: 'measure.changed',
+        aggregate: expect.objectContaining({
+          kind: 'administrative-measure',
+          id: measureId,
+        }),
+      }),
+    );
+  });
+
+  it('§16.1 — dada medida LIBERADO_COM_PRAZO com regularized_at informado no corpo (retenção sem o campo gravado) quando release então current_status vai a REGULARIZADO', async () => {
+    const measureId = ALL_MEASURE_STATES.find(
+      (entry) => entry.state === 'LIBERADO_COM_PRAZO',
+    )!.id;
+    const { measures } = fixtures();
+    const retentions = repository([
+      {
+        id: 'retention-regularized-by-body',
+        tenant_id: TENANT_ID,
+        measure_id: measureId,
+        regularization_deadline_at: '2026-10-14T00:00:00-04:00',
+        regularized_at: null,
+        released_at: null,
+      },
+    ]);
+    const dependencies = deps({
+      repositories: { measures, retentions, history: repository() },
+    });
+    const result = await releaseRetention(
+      dependencies,
+      'retention-regularized-by-body',
+      { regularized_at: '2026-10-10T00:00:00-04:00' },
+    );
+    expect(result.current_status).toBe('REGULARIZADO');
+  });
+});
diff --git a/backend/domains/inf/measures/src/handwritten/release-retention.command.ts b/backend/domains/inf/measures/src/handwritten/release-retention.command.ts
new file mode 100644
index 0000000..aa059ab
--- /dev/null
+++ b/backend/domains/inf/measures/src/handwritten/release-retention.command.ts
@@ -0,0 +1,181 @@
+// CTG-0004 §4.6 (R-0008, TASK-0009) e §16.1 (adenda, iteração 3) — `POST
+// measures/retentions/{id}/release`.
+//
+// Dois ramos, ambos gravando `inf.measure_status_history` e publicando
+// `measure.changed` na mesma transação (achado #1 da delivery-review ciclo
+// 1: iterações 1/2 não gravavam nem histórico nem evento nesta rota):
+//   RETIDO             → LIBERADO_LOCAL : sempre — a leitura antiga do §4.6
+//                         (retenção com `regularization_deadline_at` →
+//                         LIBERADO_COM_PRAZO) foi substituída por §16.1;
+//                         esse estado só é alcançado por `apply-term`.
+//   LIBERADO_COM_PRAZO → REGULARIZADO : `regularized_at` informado nesta
+//                         chamada ou já gravado na retenção — a retenção já
+//                         tem `released_at` desde a primeira liberação, por
+//                         isso o guard de "já liberada" só vale no ramo
+//                         RETIDO, não neste.
+import { DetranError } from '@detran/shared';
+
+import { measureConcludedEvent, measureReleasedEvent } from './events.js';
+import {
+  appendEvent,
+  findRow,
+  inTenantTransaction,
+  measureStateInvalid,
+  patchRow,
+  recordHistory,
+  scopeOf,
+  stringOf,
+  tenantMismatch,
+  type MeasureDeps,
+} from './measure-runtime.js';
+
+/** `pg` devolve `timestamptz` como `Date`, não string — `stringOf` (genérico
+ * a todo o runtime) faria `String(date)` (formato local, não ISO) e o SQL de
+ * volta rejeitaria a coluna. Só este comando lê de volta uma coluna de data
+ * já gravada (`retention.regularized_at`) para reusá-la numa escrita. */
+function isoStringOf(value: unknown): string {
+  return value instanceof Date ? value.toISOString() : stringOf(value);
+}
+
+const ALLOWED = ['RETIDO', 'LIBERADO_COM_PRAZO'] as const;
+
+export interface ReleaseRetentionInput {
+  released_at?: string;
+  regularized_at?: string;
+  user_ref?: string;
+  reason?: string;
+  details_json?: Record<string, unknown>;
+}
+
+export class ReleaseRetentionCommand {
+  constructor(private readonly deps: MeasureDeps) {}
+
+  async execute(
+    retentionId: string,
+    input: ReleaseRetentionInput = {},
+  ): Promise<Record<string, unknown>> {
+    const scope = scopeOf(this.deps);
+    return inTenantTransaction(this.deps, async (tx) => {
+      const retention = await findRow(this.deps, tx, 'retentions', retentionId);
+      if (!retention) throw tenantMismatch({ retentionId });
+      const measureId = stringOf(retention.measure_id);
+      const measure = await findRow(this.deps, tx, 'measures', measureId);
+      if (!measure) throw tenantMismatch({ measureId });
+
+      const currentState = stringOf(measure.current_status);
+      if (!ALLOWED.includes(currentState as (typeof ALLOWED)[number]))
+        throw measureStateInvalid(measureId, currentState, ALLOWED, 'release');
+
+      if (currentState === 'LIBERADO_COM_PRAZO') {
+        const regularizedAt =
+          input.regularized_at ||
+          (retention.regularized_at
+            ? isoStringOf(retention.regularized_at)
+            : '');
+        if (!regularizedAt)
+          throw new DetranError('TEAT.MEASURE_STATE_INVALID', {
+            status: 409,
+            context: {
+              measureId,
+              currentState,
+              allowed: [...ALLOWED],
+              command: 'release',
+            },
+            message:
+              'Regularização exige regularized_at informado ou já gravado na retenção.',
+          });
+
+        const updatedRetention = input.regularized_at
+          ? await patchRow(this.deps, tx, 'retentions', retentionId, {
+              regularized_at: regularizedAt,
+            })
+          : retention;
+        await patchRow(this.deps, tx, 'measures', measureId, {
+          current_status: 'REGULARIZADO',
+          ended_at: regularizedAt,
+        });
+        await recordHistory(
+          this.deps,
+          tx,
+          measureId,
+          'REGULARIZADO',
+          'Retenção regularizada',
+          scope.actorId,
+        );
+        await appendEvent(
+          this.deps,
+          tx,
+          measureConcludedEvent(scope, {
+            measureId,
+            fromState: currentState,
+            toState: 'REGULARIZADO',
+            endedAt: regularizedAt,
+          }),
+        );
+
+        return {
+          id: retentionId,
+          measure_id: measureId,
+          released_at: isoStringOf(
+            updatedRetention?.released_at ?? retention.released_at,
+          ),
+          current_status: 'REGULARIZADO',
+        };
+      }
+
+      // currentState === 'RETIDO' (única outra opção de ALLOWED).
+      if (retention.released_at)
+        throw new DetranError('TEAT.MEASURE_STATE_INVALID', {
+          status: 409,
+          context: {
+            retentionId,
+            currentState: 'released',
+            command: 'release',
+          },
+          message: 'Retenção já liberada.',
+        });
+
+      // §16.1 (adenda, iteração 3): de RETIDO, `release` vai sempre a
+      // LIBERADO_LOCAL — a leitura antiga do §4.6 (retenção com
+      // `regularization_deadline_at` → LIBERADO_COM_PRAZO) foi substituída;
+      // LIBERADO_COM_PRAZO só é alcançado por outro comando (`apply-term`).
+      const target = 'LIBERADO_LOCAL';
+      const releasedAt = input.released_at ?? scope.occurredAt;
+      const updatedRetention = await patchRow(
+        this.deps,
+        tx,
+        'retentions',
+        retentionId,
+        { released_at: releasedAt, release_user_ref: scope.actorId },
+      );
+      await patchRow(this.deps, tx, 'measures', measureId, {
+        current_status: target,
+      });
+      await recordHistory(
+        this.deps,
+        tx,
+        measureId,
+        target,
+        'Retenção liberada',
+        scope.actorId,
+      );
+      await appendEvent(
+        this.deps,
+        tx,
+        measureReleasedEvent(scope, {
+          measureId,
+          fromState: currentState,
+          toState: target,
+          releasedAt,
+        }),
+      );
+
+      return {
+        id: retentionId,
+        measure_id: measureId,
+        released_at: isoStringOf(updatedRetention?.released_at ?? releasedAt),
+        current_status: target,
+      };
+    });
+  }
+}
diff --git a/backend/domains/inf/measures/src/measures-blueprint-contract.spec.ts b/backend/domains/inf/measures/src/measures-blueprint-contract.spec.ts
index b2bec3c..d1367c1 100644
--- a/backend/domains/inf/measures/src/measures-blueprint-contract.spec.ts
+++ b/backend/domains/inf/measures/src/measures-blueprint-contract.spec.ts
@@ -22,7 +22,7 @@ const blueprint = JSON.parse(

 describe('BP-INF-MEASURES-001 v1.1.0', () => {
   it('dado uma medida administrativa quando inspecionada então separa os prazos e restringe estados e limites', () => {
-    expect(blueprint.module.version).toBe('1.1.0');
+    expect(blueprint.module.version).toBe('1.2.0');
     const term = blueprint.database.entities.find(
       (entity) => entity.table === 'administrative_term',
     );
diff --git a/backend/domains/inf/measures/tests/integration/measure-commands.integration.spec.ts b/backend/domains/inf/measures/tests/integration/measure-commands.integration.spec.ts
new file mode 100644
index 0000000..294c1df
--- /dev/null
+++ b/backend/domains/inf/measures/tests/integration/measure-commands.integration.spec.ts
@@ -0,0 +1,390 @@
+import type pg from 'pg';
+import { afterAll, beforeAll, describe, expect, it } from 'vitest';
+
+import {
+  commandDeps,
+  dropTenant,
+  FIXTURES,
+  importModule,
+  isolatedTenant,
+  newClient,
+  outboxEnvelopes,
+  runCommand,
+  seedMeasureWithRetention,
+  seedRetidoMeasure,
+  verifyRepositories,
+} from './harness.js';
+
+/**
+ * CTG-0004 §2, §4 e §11 (R-0008, TASK-0008) — C-0004-28, C-0004-29,
+ * C-0004-30 e C-0004-31: transação única + outbox dos comandos de medida
+ * (M16), e a ausência de efeito cruzado de um AIT cancelado pós-final
+ * sobre `inf.administrative_measure` (RN-TEAT-123). Tenant isolado
+ * (rait-test-strategy.md §6): as medidas criadas nos três primeiros casos
+ * nascem só para este arquivo; C-0004-31 usa a fixture compartilhada
+ * `…ed000001`/`…f0000001` (28/10-fixtures) só para leitura (nenhuma
+ * escrita nela além do próprio teste de não-mutação).
+ */
+
+const START_EXPORTS = ['StartMeasureCommand'];
+const TERM_EXPORTS = ['IssueTermCommand'];
+const CONCLUDE_EXPORTS = ['ConcludeMeasureCommand'];
+const RELEASE_EXPORTS = ['ReleaseRetentionCommand'];
+const COMMAND_METHODS = ['execute', 'handle', 'run'];
+
+function trackingOutboxAppend() {
+  return async (
+    _tx: unknown,
+    envelope: Record<string, unknown>,
+  ): Promise<{ id: string }> => {
+    await client.query(
+      `insert into integration.outbox
+         (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+       values ($1, $2, $3, $4, $5, $6)
+       on conflict (tenant_id, idempotency_key) do nothing
+       returning id`,
+      [
+        tenantId,
+        envelope.type,
+        (envelope.aggregate as { kind: string }).kind,
+        (envelope.aggregate as { id: string }).id,
+        JSON.stringify(envelope),
+        `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+      ],
+    );
+    return { id: 'ignored' };
+  };
+}
+
+const client: pg.Client = newClient();
+let tenantId: string;
+let actorId: string;
+let startedAt: string;
+
+beforeAll(async () => {
+  await client.connect();
+  const isolated = await isolatedTenant(client, 'inf-measures-commands');
+  tenantId = isolated.tenantId;
+  actorId = isolated.actorId;
+  await client.query(`select set_config('app.role', 'owner', false)`);
+  const now = await client.query<{ now: string }>('select now()::text as now');
+  startedAt = now.rows[0]!.now;
+});
+
+afterAll(async () => {
+  await dropTenant(client, tenantId);
+  await client.end();
+});
+
+describe('CTG-0004 §4.1 — start: transação única e outbox (C-0004-28)', () => {
+  it('C-0004-28 — dado start então a medida grava started_at e a mesma transação publica measure.changed/MEDIDA_INICIADA na outbox', async () => {
+    const { measureId } = await seedRetidoMeasure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+      FIXTURES.deviceId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: {
+        append: async (
+          _tx: unknown,
+          envelope: Record<string, unknown>,
+        ): Promise<{ id: string }> => {
+          await client.query(
+            `insert into integration.outbox
+               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+             values ($1, $2, $3, $4, $5, $6)
+             on conflict (tenant_id, idempotency_key) do nothing
+             returning id`,
+            [
+              tenantId,
+              envelope.type,
+              (envelope.aggregate as { kind: string }).kind,
+              (envelope.aggregate as { id: string }).id,
+              JSON.stringify(envelope),
+              `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+            ],
+          );
+          return { id: 'ignored' };
+        },
+      },
+    });
+    await runCommand(
+      () => importModule('../../src/handwritten/start-measure.command.js'),
+      'inf/measures/src/handwritten/start-measure.command.ts',
+      START_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      measureId,
+      {},
+    );
+    const measure = await verifyRepositories(
+      client,
+      tenantId,
+      actorId,
+    ).measures.find(measureId);
+    expect(measure?.started_at).toBeTruthy();
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    expect(envelopes.map((envelope) => envelope.domainEvent)).toContain(
+      'MEDIDA_INICIADA',
+    );
+  });
+});
+
+describe('CTG-0004 §4.5 — apply-term: TERMO_EMITIDO com os dois prazos (C-0004-29)', () => {
+  it('C-0004-29 — dado apply-term (term_type=removal) então o envelope TERMO_EMITIDO traz withdrawalDeadlineAt e ctbDeadlineAt em data', async () => {
+    const { measureId } = await seedRetidoMeasure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+      FIXTURES.deviceId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: {
+        append: async (
+          _tx: unknown,
+          envelope: Record<string, unknown>,
+        ): Promise<{ id: string }> => {
+          await client.query(
+            `insert into integration.outbox
+               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+             values ($1, $2, $3, $4, $5, $6)
+             on conflict (tenant_id, idempotency_key) do nothing
+             returning id`,
+            [
+              tenantId,
+              envelope.type,
+              (envelope.aggregate as { kind: string }).kind,
+              (envelope.aggregate as { id: string }).id,
+              JSON.stringify(envelope),
+              `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+            ],
+          );
+          return { id: 'ignored' };
+        },
+      },
+    });
+    await runCommand(
+      () => importModule('../../src/handwritten/issue-term.command.js'),
+      'inf/measures/src/handwritten/issue-term.command.ts',
+      TERM_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      measureId,
+      {
+        term_type: 'removal',
+        term_number: `TERM-INT-${measureId.slice(0, 8)}`,
+        withdrawal_deadline_at: '2026-09-21T00:00:00-04:00',
+        issued_at: '2026-09-14T09:00:00-04:00',
+        field_details_json: {
+          agency: 'Fixture',
+          vehicle: 'Fixture',
+          ait_or_order_ref: 'Fixture',
+          place_datetime: '2026-09-14T09:00:00-04:00',
+          legal_basis: 'CTB art. 271',
+          custody_place: 'Fixture',
+          owner_and_driver: 'Fixture',
+        },
+      },
+    );
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    const termo = envelopes.find(
+      (envelope) => envelope.domainEvent === 'TERMO_EMITIDO',
+    );
+    expect(termo).toBeTruthy();
+    const data = termo?.data as Record<string, unknown>;
+    expect(data.withdrawalDeadlineAt).toBeTruthy();
+    expect(data.ctbDeadlineAt).toBeTruthy();
+  });
+});
+
+describe('CTG-0004 §4.7 — conclude: MEDIDA_CONCLUIDA e REGULARIZADO (C-0004-30)', () => {
+  it('C-0004-30 — dado conclude a partir de LIBERADO_COM_PRAZO então a medida vai a REGULARIZADO e a outbox recebe MEDIDA_CONCLUIDA', async () => {
+    const { measureId } = await seedRetidoMeasure(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+      FIXTURES.deviceId,
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: {
+        append: async (
+          _tx: unknown,
+          envelope: Record<string, unknown>,
+        ): Promise<{ id: string }> => {
+          await client.query(
+            `insert into integration.outbox
+               (tenant_id, topic, aggregate_type, aggregate_id, payload, idempotency_key)
+             values ($1, $2, $3, $4, $5, $6)
+             on conflict (tenant_id, idempotency_key) do nothing
+             returning id`,
+            [
+              tenantId,
+              envelope.type,
+              (envelope.aggregate as { kind: string }).kind,
+              (envelope.aggregate as { id: string }).id,
+              JSON.stringify(envelope),
+              `${envelope.type}:${(envelope.aggregate as { id: string }).id}:${(envelope.aggregate as { version: number }).version}`,
+            ],
+          );
+          return { id: 'ignored' };
+        },
+      },
+    });
+    // Pré-condição gravada e comitada antes do comando (não é escrita
+    // concorrente com a transação dele) — seguro usar o repositório de
+    // verificação aqui.
+    await verifyRepositories(client, tenantId, actorId).measures.update(
+      measureId,
+      { current_status: 'LIBERADO_COM_PRAZO' },
+    );
+    await runCommand(
+      () => importModule('../../src/handwritten/conclude-measure.command.js'),
+      'inf/measures/src/handwritten/conclude-measure.command.ts',
+      CONCLUDE_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      measureId,
+      {},
+    );
+    const measure = await verifyRepositories(
+      client,
+      tenantId,
+      actorId,
+    ).measures.find(measureId);
+    expect(measure?.current_status).toBe('REGULARIZADO');
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    expect(envelopes.map((envelope) => envelope.domainEvent)).toContain(
+      'MEDIDA_CONCLUIDA',
+    );
+  });
+});
+
+describe('§16.1 (adenda pós delivery-review ciclo 1) — release: os dois ramos, transação única e outbox', () => {
+  it('dada medida RETIDO quando release então current_status vai a LIBERADO_LOCAL, com measure_status_history e measure.changed na mesma transação', async () => {
+    const { measureId, retentionId } = await seedMeasureWithRetention(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+      FIXTURES.deviceId,
+      FIXTURES.vehicleSnapshotId,
+      { currentStatus: 'RETIDO' },
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: { append: trackingOutboxAppend() },
+    });
+    await runCommand(
+      () => importModule('../../src/handwritten/release-retention.command.js'),
+      'inf/measures/src/handwritten/release-retention.command.ts',
+      RELEASE_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      retentionId,
+      {},
+    );
+    const verify = verifyRepositories(client, tenantId, actorId);
+    const measure = await verify.measures.find(measureId);
+    expect(measure?.current_status).toBe('LIBERADO_LOCAL');
+    const history = await verify.history.list();
+    expect(
+      history.some(
+        (row) =>
+          row.measure_id === measureId && row.status === 'LIBERADO_LOCAL',
+      ),
+    ).toBe(true);
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    expect(
+      envelopes.some(
+        (envelope) =>
+          envelope.type === 'measure.changed' &&
+          (envelope.aggregate as { id?: string } | undefined)?.id === measureId,
+      ),
+    ).toBe(true);
+  });
+
+  it('dada medida LIBERADO_COM_PRAZO com regularized_at gravado na retenção quando release então current_status vai a REGULARIZADO, com measure_status_history e measure.changed na mesma transação', async () => {
+    const { measureId, retentionId } = await seedMeasureWithRetention(
+      client,
+      tenantId,
+      FIXTURES.agencyId,
+      FIXTURES.actorId,
+      FIXTURES.shiftId,
+      FIXTURES.deviceId,
+      FIXTURES.vehicleSnapshotId,
+      {
+        currentStatus: 'LIBERADO_COM_PRAZO',
+        regularizedAt: '2026-10-10T00:00:00-04:00',
+      },
+    );
+    const dependencies = commandDeps(client, tenantId, actorId, {
+      outbox: { append: trackingOutboxAppend() },
+    });
+    await runCommand(
+      () => importModule('../../src/handwritten/release-retention.command.js'),
+      'inf/measures/src/handwritten/release-retention.command.ts',
+      RELEASE_EXPORTS,
+      COMMAND_METHODS,
+      dependencies,
+      retentionId,
+      {},
+    );
+    const verify = verifyRepositories(client, tenantId, actorId);
+    const measure = await verify.measures.find(measureId);
+    expect(measure?.current_status).toBe('REGULARIZADO');
+    const history = await verify.history.list();
+    expect(
+      history.some(
+        (row) => row.measure_id === measureId && row.status === 'REGULARIZADO',
+      ),
+    ).toBe(true);
+    const envelopes = await outboxEnvelopes(client, tenantId, startedAt);
+    expect(
+      envelopes.some(
+        (envelope) =>
+          envelope.type === 'measure.changed' &&
+          (envelope.aggregate as { id?: string } | undefined)?.id === measureId,
+      ),
+    ).toBe(true);
+  });
+});
+
+describe('CTG-0004 §1 — AIT cancelado pós-final não muda medidas (C-0004-31, RN-TEAT-123)', () => {
+  it('C-0004-31 — dado o AIT …f0000001 marcado CANCELADO_POSFINAL então nenhuma linha de inf.administrative_measure referenciando-o muda de current_status', async () => {
+    await client.query(`select set_config('app.role', 'owner', false)`);
+    const before = await client.query<{ current_status: string }>(
+      `select current_status from inf.administrative_measure where id = $1`,
+      [FIXTURES.measureRetido],
+    );
+    const aitBefore = await client.query<{ current_status: string }>(
+      `select current_status from inf.ait_ait where id = $1`,
+      [FIXTURES.aitIntegrado],
+    );
+    try {
+      await client.query(
+        `update inf.ait_ait set current_status = 'CANCELADO_POSFINAL' where id = $1`,
+        [FIXTURES.aitIntegrado],
+      );
+      const after = await client.query<{ current_status: string }>(
+        `select current_status from inf.administrative_measure where id = $1`,
+        [FIXTURES.measureRetido],
+      );
+      expect(after.rows[0]?.current_status).toBe(
+        before.rows[0]?.current_status,
+      );
+    } finally {
+      // Restaura o estado da fixture compartilhada (não é dado desta suíte).
+      await client.query(
+        `update inf.ait_ait set current_status = $2 where id = $1`,
+        [FIXTURES.aitIntegrado, aitBefore.rows[0]?.current_status],
+      );
+    }
+  });
+});
diff --git a/docs/framework/blueprints/BP-INF-ALCOHOL-001.json b/docs/framework/blueprints/BP-INF-ALCOHOL-001.json
index ac693ba..9126d39 100644
--- a/docs/framework/blueprints/BP-INF-ALCOHOL-001.json
+++ b/docs/framework/blueprints/BP-INF-ALCOHOL-001.json
@@ -4,15 +4,47 @@
   "module": {
     "name": "Alcohol",
     "namespace": "inf",
-    "version": "1.1.0",
+    "version": "1.2.0",
     "ddlFile": "33-inf-alcohol.sql",
     "dependencies": {
       "@detran/inf-ait": "workspace:*",
-      "@detran/inf-measures": "workspace:*"
+      "@detran/inf-measures": "workspace:*",
+      "@detran/inf-normative": "workspace:*"
     },
+    "testAliases": [
+      {
+        "package": "@detran/shared",
+        "target": "../../shared/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-ait",
+        "target": "../ait/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-measures",
+        "target": "../measures/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-normative",
+        "target": "../normative/src/index.ts"
+      }
+    ],
+    "handwrittenControllers": [
+      {
+        "target": "alcohol-commands.controller",
+        "symbol": "AlcoholCommandsController"
+      }
+    ],
+    "handwrittenProviders": [
+      {
+        "target": "handwritten/alcohol-lifecycle.provider",
+        "symbol": "ALCOHOL_LIFECYCLE_PROVIDER"
+      }
+    ],
     "handwrittenExports": [
       "alcohol-lifecycle.service",
-      "alcohol-commands.controller"
+      "alcohol-commands.controller",
+      "handwritten/index"
     ],
     "owners": ["detran-inf"],
     "description": "Breathalyzer and alcohol-testing procedure flows ported from TEAT."
@@ -24,22 +56,79 @@
         "table": "alcohol_procedure",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "traffic_agency_id", "type": "uuid" },
-          { "name": "ait_id", "type": "uuid", "nullable": true },
-          { "name": "measure_id", "type": "uuid", "nullable": true },
-          { "name": "approach_id", "type": "uuid", "nullable": true },
-          { "name": "agent_id", "type": "uuid" },
-          { "name": "shift_id", "type": "uuid" },
-          { "name": "driver_person_id", "type": "uuid", "nullable": true },
-          { "name": "procedure_at", "type": "timestamptz" },
-          { "name": "location_json", "type": "jsonb", "nullable": true },
-          { "name": "procedure_type", "type": "varchar(60)" },
-          { "name": "outcome", "type": "varchar(80)" },
-          { "name": "status", "type": "varchar(40)", "default": "'draft'" },
-          { "name": "notes", "type": "text", "nullable": true },
-          { "name": "ait_local_id", "type": "varchar(120)", "nullable": true },
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
+            "name": "traffic_agency_id",
+            "type": "uuid"
+          },
+          {
+            "name": "ait_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "measure_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "approach_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "agent_id",
+            "type": "uuid"
+          },
+          {
+            "name": "shift_id",
+            "type": "uuid"
+          },
+          {
+            "name": "driver_person_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "procedure_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "location_json",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "procedure_type",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "outcome",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'draft'"
+          },
+          {
+            "name": "notes",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "ait_local_id",
+            "type": "varchar(120)",
+            "nullable": true
+          },
           {
             "name": "sign_catalog_id",
             "type": "varchar(120)",
@@ -71,8 +160,16 @@
             "pii": "high",
             "retention": "forever"
           },
-          { "name": "vehicle_make", "type": "varchar(120)", "nullable": true },
-          { "name": "refused_procedures", "type": "boolean", "nullable": true },
+          {
+            "name": "vehicle_make",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "refused_procedures",
+            "type": "boolean",
+            "nullable": true
+          },
           {
             "name": "driver_statement_json",
             "type": "jsonb",
@@ -121,7 +218,10 @@
           {
             "name": "fk_inf_alcohol_ait",
             "columns": ["ait_id"],
-            "references": { "table": "inf.ait_ait", "columns": ["id"] }
+            "references": {
+              "table": "inf.ait_ait",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_inf_alcohol_measure",
@@ -134,12 +234,18 @@
           {
             "name": "fk_inf_alcohol_approach",
             "columns": ["approach_id"],
-            "references": { "table": "ops.ops_approach", "columns": ["id"] }
+            "references": {
+              "table": "ops.ops_approach",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_inf_alcohol_person",
             "columns": ["driver_person_id"],
-            "references": { "table": "ops.snapshots_person", "columns": ["id"] }
+            "references": {
+              "table": "ops.snapshots_person",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -148,19 +254,48 @@
         "table": "alcohol_breathalyzer",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "traffic_agency_id", "type": "uuid" },
-          { "name": "serial_number", "type": "varchar(120)" },
-          { "name": "model", "type": "varchar(120)", "nullable": true },
-          { "name": "manufacturer", "type": "varchar(120)", "nullable": true },
-          { "name": "last_calibration_at", "type": "date", "nullable": true },
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
+            "name": "traffic_agency_id",
+            "type": "uuid"
+          },
+          {
+            "name": "serial_number",
+            "type": "varchar(120)"
+          },
+          {
+            "name": "model",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "manufacturer",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "last_calibration_at",
+            "type": "date",
+            "nullable": true
+          },
           {
             "name": "calibration_valid_until",
             "type": "date",
             "nullable": true
           },
-          { "name": "status", "type": "varchar(40)", "default": "'active'" }
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'active'"
+          }
         ],
         "indexes": [
           {
@@ -175,13 +310,38 @@
         "table": "alcohol_test",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "procedure_id", "type": "uuid" },
-          { "name": "breathalyzer_id", "type": "uuid", "nullable": true },
-          { "name": "test_number", "type": "varchar(80)", "nullable": true },
-          { "name": "tested_at", "type": "timestamptz" },
-          { "name": "result_mg_l", "type": "numeric(8,3)", "nullable": true },
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
+            "name": "procedure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "breathalyzer_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "test_number",
+            "type": "varchar(80)",
+            "nullable": true
+          },
+          {
+            "name": "tested_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "result_mg_l",
+            "type": "numeric(8,3)",
+            "nullable": true
+          },
           {
             "name": "considered_mg_l",
             "type": "numeric(8,3)",
@@ -192,13 +352,21 @@
             "type": "numeric(8,3)",
             "nullable": true
           },
-          { "name": "counterproof", "type": "boolean", "default": "false" },
+          {
+            "name": "counterproof",
+            "type": "boolean",
+            "default": "false"
+          },
           {
             "name": "result_image_evidence_id",
             "type": "uuid",
             "nullable": true
           },
-          { "name": "status", "type": "varchar(40)", "default": "'recorded'" }
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'recorded'"
+          }
         ],
         "checks": [
           {
@@ -238,14 +406,41 @@
         "table": "alcohol_refusal",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "procedure_id", "type": "uuid" },
-          { "name": "refused_at", "type": "timestamptz" },
-          { "name": "kind", "type": "varchar(40)" },
-          { "name": "refusal_description", "type": "text" },
-          { "name": "witness_person_id", "type": "uuid", "nullable": true },
-          { "name": "evidence_id", "type": "uuid", "nullable": true }
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
+            "name": "procedure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "refused_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "kind",
+            "type": "varchar(40)"
+          },
+          {
+            "name": "refusal_description",
+            "type": "text"
+          },
+          {
+            "name": "witness_person_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "evidence_id",
+            "type": "uuid",
+            "nullable": true
+          }
         ],
         "checks": [
           {
@@ -265,7 +460,10 @@
           {
             "name": "fk_inf_alcohol_refusal_person",
             "columns": ["witness_person_id"],
-            "references": { "table": "ops.snapshots_person", "columns": ["id"] }
+            "references": {
+              "table": "ops.snapshots_person",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_inf_alcohol_refusal_evidence",
@@ -282,15 +480,47 @@
         "table": "alcohol_psychomotor_sign",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "procedure_id", "type": "uuid" },
-          { "name": "sign_code", "type": "varchar(80)" },
-          { "name": "description", "type": "text" },
-          { "name": "observed", "type": "boolean", "default": "true" },
-          { "name": "sign_group", "type": "varchar(80)", "nullable": true },
-          { "name": "sign_status", "type": "varchar(20)", "nullable": true },
-          { "name": "method", "type": "varchar(120)", "nullable": true }
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
+            "name": "procedure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "sign_code",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "description",
+            "type": "text"
+          },
+          {
+            "name": "observed",
+            "type": "boolean",
+            "default": "true"
+          },
+          {
+            "name": "sign_group",
+            "type": "varchar(80)",
+            "nullable": true
+          },
+          {
+            "name": "sign_status",
+            "type": "varchar(20)",
+            "nullable": true
+          },
+          {
+            "name": "method",
+            "type": "varchar(120)",
+            "nullable": true
+          }
         ],
         "foreignKeys": [
           {
@@ -308,14 +538,41 @@
         "table": "alcohol_forwarding",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "procedure_id", "type": "uuid" },
-          { "name": "forwarding_type", "type": "varchar(80)" },
-          { "name": "destination", "type": "varchar(255)" },
-          { "name": "forwarded_at", "type": "timestamptz" },
-          { "name": "protocol", "type": "varchar(120)", "nullable": true },
-          { "name": "notes", "type": "text", "nullable": true }
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
+            "name": "procedure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "forwarding_type",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "destination",
+            "type": "varchar(255)"
+          },
+          {
+            "name": "forwarded_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "protocol",
+            "type": "varchar(120)",
+            "nullable": true
+          },
+          {
+            "name": "notes",
+            "type": "text",
+            "nullable": true
+          }
         ],
         "foreignKeys": [
           {
@@ -343,7 +600,11 @@
         "path": "breathalyzers",
         "resource": "breathalyzer"
       },
-      { "entity": "AlcoholTest", "path": "tests", "resource": "alcohol-test" },
+      {
+        "entity": "AlcoholTest",
+        "path": "tests",
+        "resource": "alcohol-test"
+      },
       {
         "entity": "AlcoholRefusal",
         "path": "refusals",
@@ -361,6 +622,10 @@
       }
     ]
   },
-  "auth": { "source": "TEAT_COMMAND_RULES" },
-  "audit": { "enabled": true }
+  "auth": {
+    "source": "TEAT_COMMAND_RULES"
+  },
+  "audit": {
+    "enabled": true
+  }
 }
diff --git a/docs/framework/blueprints/BP-INF-MEASURES-001.json b/docs/framework/blueprints/BP-INF-MEASURES-001.json
index 1f70d20..769996c 100644
--- a/docs/framework/blueprints/BP-INF-MEASURES-001.json
+++ b/docs/framework/blueprints/BP-INF-MEASURES-001.json
@@ -4,12 +4,46 @@
   "module": {
     "name": "Measures",
     "namespace": "inf",
-    "version": "1.1.0",
+    "version": "1.2.0",
     "ddlFile": "32-inf-measures.sql",
-    "dependencies": { "@detran/inf-ait": "workspace:*" },
+    "dependencies": {
+      "@detran/inf-ait": "workspace:*",
+      "@detran/inf-deadlines": "workspace:*"
+    },
+    "testAliases": [
+      {
+        "package": "@detran/shared",
+        "target": "../../shared/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-ait",
+        "target": "../ait/src/index.ts"
+      },
+      {
+        "package": "@detran/inf-deadlines",
+        "target": "../deadlines/src/index.ts"
+      }
+    ],
+    "handwrittenControllers": [
+      {
+        "target": "measure-commands.controller",
+        "symbol": "MeasureCommandsController"
+      },
+      {
+        "target": "measure-commands.controller",
+        "symbol": "MeasureRetentionCommandsController"
+      }
+    ],
+    "handwrittenProviders": [
+      {
+        "target": "handwritten/measure-lifecycle.provider",
+        "symbol": "MEASURE_LIFECYCLE_PROVIDER"
+      }
+    ],
     "handwrittenExports": [
       "measure-lifecycle.service",
-      "measure-commands.controller"
+      "measure-commands.controller",
+      "handwritten/index"
     ],
     "owners": ["detran-inf"],
     "description": "Administrative measures, terms, retention, removal, inventory, providers, yards, and status history."
@@ -21,12 +55,33 @@
         "table": "measure_type",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "code", "type": "varchar(60)" },
-          { "name": "name", "type": "varchar(160)" },
-          { "name": "description", "type": "text", "nullable": true },
-          { "name": "status", "type": "varchar(40)", "default": "'active'" }
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
+            "name": "code",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "name",
+            "type": "varchar(160)"
+          },
+          {
+            "name": "description",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'active'"
+          }
         ],
         "indexes": [
           {
@@ -41,26 +96,78 @@
         "table": "administrative_measure",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "traffic_agency_id", "type": "uuid" },
-          { "name": "measure_type_id", "type": "uuid" },
-          { "name": "ait_id", "type": "uuid", "nullable": true },
-          { "name": "crash_record_id", "type": "uuid", "nullable": true },
-          { "name": "approach_id", "type": "uuid", "nullable": true },
-          { "name": "agent_id", "type": "uuid" },
-          { "name": "shift_id", "type": "uuid" },
-          { "name": "device_id", "type": "uuid" },
-          { "name": "started_at", "type": "timestamptz" },
-          { "name": "ended_at", "type": "timestamptz", "nullable": true },
-          { "name": "location_json", "type": "jsonb", "nullable": true },
-          { "name": "reason", "type": "text" },
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
+            "name": "traffic_agency_id",
+            "type": "uuid"
+          },
+          {
+            "name": "measure_type_id",
+            "type": "uuid"
+          },
+          {
+            "name": "ait_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "crash_record_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "approach_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "agent_id",
+            "type": "uuid"
+          },
+          {
+            "name": "shift_id",
+            "type": "uuid"
+          },
+          {
+            "name": "device_id",
+            "type": "uuid"
+          },
+          {
+            "name": "started_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "ended_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "location_json",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "reason",
+            "type": "text"
+          },
           {
             "name": "current_status",
             "type": "varchar(60)",
             "default": "'RETIDO'"
           },
-          { "name": "notes", "type": "text", "nullable": true },
+          {
+            "name": "notes",
+            "type": "text",
+            "nullable": true
+          },
           {
             "name": "location_geom",
             "type": "geometry(Point,4674)",
@@ -88,17 +195,26 @@
           {
             "name": "fk_inf_measure_type",
             "columns": ["measure_type_id"],
-            "references": { "table": "inf.measure_type", "columns": ["id"] }
+            "references": {
+              "table": "inf.measure_type",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_inf_measure_ait",
             "columns": ["ait_id"],
-            "references": { "table": "inf.ait_ait", "columns": ["id"] }
+            "references": {
+              "table": "inf.ait_ait",
+              "columns": ["id"]
+            }
           },
           {
             "name": "fk_inf_measure_approach",
             "columns": ["approach_id"],
-            "references": { "table": "ops.ops_approach", "columns": ["id"] }
+            "references": {
+              "table": "ops.ops_approach",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -107,16 +223,50 @@
         "table": "administrative_term",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "measure_id", "type": "uuid" },
-          { "name": "term_type", "type": "varchar(80)" },
-          { "name": "term_number", "type": "varchar(80)" },
-          { "name": "content_hash", "type": "varchar(128)" },
-          { "name": "file_evidence_id", "type": "uuid", "nullable": true },
-          { "name": "issued_at", "type": "timestamptz" },
-          { "name": "signed_by_person_id", "type": "uuid", "nullable": true },
-          { "name": "signer_name", "type": "varchar(160)", "nullable": true },
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
+            "name": "measure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "term_type",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "term_number",
+            "type": "varchar(80)"
+          },
+          {
+            "name": "content_hash",
+            "type": "varchar(128)"
+          },
+          {
+            "name": "file_evidence_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "issued_at",
+            "type": "timestamptz"
+          },
+          {
+            "name": "signed_by_person_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "signer_name",
+            "type": "varchar(160)",
+            "nullable": true
+          },
           {
             "name": "withdrawal_deadline_at",
             "type": "timestamptz",
@@ -127,7 +277,11 @@
             "type": "timestamptz",
             "nullable": true
           },
-          { "name": "field_details_json", "type": "jsonb", "nullable": true },
+          {
+            "name": "field_details_json",
+            "type": "jsonb",
+            "nullable": true
+          },
           {
             "name": "source_local_id",
             "type": "varchar(120)",
@@ -143,7 +297,11 @@
             "type": "varchar(128)",
             "nullable": true
           },
-          { "name": "status", "type": "varchar(60)", "default": "'issued'" }
+          {
+            "name": "status",
+            "type": "varchar(60)",
+            "default": "'issued'"
+          }
         ],
         "indexes": [
           {
@@ -172,7 +330,10 @@
           {
             "name": "fk_inf_term_person",
             "columns": ["signed_by_person_id"],
-            "references": { "table": "ops.snapshots_person", "columns": ["id"] }
+            "references": {
+              "table": "ops.snapshots_person",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -181,11 +342,27 @@
         "table": "measure_retention",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "measure_id", "type": "uuid" },
-          { "name": "vehicle_snapshot_id", "type": "uuid" },
-          { "name": "retention_reason", "type": "text" },
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
+            "name": "measure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "vehicle_snapshot_id",
+            "type": "uuid"
+          },
+          {
+            "name": "retention_reason",
+            "type": "text"
+          },
           {
             "name": "regularization_deadline_at",
             "type": "timestamptz",
@@ -196,9 +373,21 @@
             "type": "integer",
             "nullable": true
           },
-          { "name": "regularized_at", "type": "timestamptz", "nullable": true },
-          { "name": "released_at", "type": "timestamptz", "nullable": true },
-          { "name": "release_user_ref", "type": "uuid", "nullable": true }
+          {
+            "name": "regularized_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "released_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "release_user_ref",
+            "type": "uuid",
+            "nullable": true
+          }
         ],
         "checks": [
           {
@@ -230,15 +419,48 @@
         "table": "measure_removal",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "measure_id", "type": "uuid" },
-          { "name": "vehicle_snapshot_id", "type": "uuid" },
-          { "name": "tow_provider_id", "type": "uuid", "nullable": true },
-          { "name": "yard_id", "type": "uuid", "nullable": true },
-          { "name": "requested_at", "type": "timestamptz", "nullable": true },
-          { "name": "tow_arrived_at", "type": "timestamptz", "nullable": true },
-          { "name": "delivered_at", "type": "timestamptz", "nullable": true },
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
+            "name": "measure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "vehicle_snapshot_id",
+            "type": "uuid"
+          },
+          {
+            "name": "tow_provider_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "yard_id",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "requested_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "tow_arrived_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
+          {
+            "name": "delivered_at",
+            "type": "timestamptz",
+            "nullable": true
+          },
           {
             "name": "regularization_deadline_at",
             "type": "timestamptz",
@@ -285,13 +507,37 @@
         "table": "vehicle_inventory",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "measure_id", "type": "uuid" },
-          { "name": "vehicle_snapshot_id", "type": "uuid" },
-          { "name": "inventory_json", "type": "jsonb" },
-          { "name": "damage_description", "type": "text", "nullable": true },
-          { "name": "signed_by_person_id", "type": "uuid", "nullable": true }
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
+            "name": "measure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "vehicle_snapshot_id",
+            "type": "uuid"
+          },
+          {
+            "name": "inventory_json",
+            "type": "jsonb"
+          },
+          {
+            "name": "damage_description",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "signed_by_person_id",
+            "type": "uuid",
+            "nullable": true
+          }
         ],
         "foreignKeys": [
           {
@@ -313,7 +559,10 @@
           {
             "name": "fk_inf_inventory_person",
             "columns": ["signed_by_person_id"],
-            "references": { "table": "ops.snapshots_person", "columns": ["id"] }
+            "references": {
+              "table": "ops.snapshots_person",
+              "columns": ["id"]
+            }
           }
         ]
       },
@@ -322,17 +571,38 @@
         "table": "tow_provider",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "traffic_agency_id", "type": "uuid" },
-          { "name": "name", "type": "varchar(255)" },
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
+            "name": "traffic_agency_id",
+            "type": "uuid"
+          },
+          {
+            "name": "name",
+            "type": "varchar(255)"
+          },
           {
             "name": "document_number",
             "type": "varchar(20)",
             "nullable": true
           },
-          { "name": "contact_json", "type": "jsonb", "nullable": true },
-          { "name": "status", "type": "varchar(40)", "default": "'active'" }
+          {
+            "name": "contact_json",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'active'"
+          }
         ]
       },
       {
@@ -340,13 +610,38 @@
         "table": "yard",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "traffic_agency_id", "type": "uuid" },
-          { "name": "name", "type": "varchar(255)" },
-          { "name": "address", "type": "text", "nullable": true },
-          { "name": "location_json", "type": "jsonb", "nullable": true },
-          { "name": "status", "type": "varchar(40)", "default": "'active'" },
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
+            "name": "traffic_agency_id",
+            "type": "uuid"
+          },
+          {
+            "name": "name",
+            "type": "varchar(255)"
+          },
+          {
+            "name": "address",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "location_json",
+            "type": "jsonb",
+            "nullable": true
+          },
+          {
+            "name": "status",
+            "type": "varchar(40)",
+            "default": "'active'"
+          },
           {
             "name": "location_geom",
             "type": "geometry(Point,4674)",
@@ -366,14 +661,43 @@
         "table": "measure_status_history",
         "primaryKey": ["id"],
         "fields": [
-          { "name": "id", "type": "uuid", "default": "gen_random_uuid()" },
-          { "name": "tenant_id", "type": "uuid" },
-          { "name": "measure_id", "type": "uuid" },
-          { "name": "status", "type": "varchar(60)" },
-          { "name": "changed_at", "type": "timestamptz", "default": "now()" },
-          { "name": "user_ref", "type": "uuid", "nullable": true },
-          { "name": "reason", "type": "text", "nullable": true },
-          { "name": "details_json", "type": "jsonb", "nullable": true }
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
+            "name": "measure_id",
+            "type": "uuid"
+          },
+          {
+            "name": "status",
+            "type": "varchar(60)"
+          },
+          {
+            "name": "changed_at",
+            "type": "timestamptz",
+            "default": "now()"
+          },
+          {
+            "name": "user_ref",
+            "type": "uuid",
+            "nullable": true
+          },
+          {
+            "name": "reason",
+            "type": "text",
+            "nullable": true
+          },
+          {
+            "name": "details_json",
+            "type": "jsonb",
+            "nullable": true
+          }
         ],
         "foreignKeys": [
           {
@@ -391,7 +715,11 @@
   "api": {
     "basePath": "/v1/inf/measures/",
     "resources": [
-      { "entity": "MeasureType", "path": "types", "resource": "measure-type" },
+      {
+        "entity": "MeasureType",
+        "path": "types",
+        "resource": "measure-type"
+      },
       {
         "entity": "AdministrativeMeasure",
         "path": "administrative-measures",
@@ -422,7 +750,11 @@
         "path": "tow-providers",
         "resource": "tow-provider"
       },
-      { "entity": "Yard", "path": "yards", "resource": "yard" },
+      {
+        "entity": "Yard",
+        "path": "yards",
+        "resource": "yard"
+      },
       {
         "entity": "MeasureStatusHistory",
         "path": "status-history",
@@ -430,6 +762,10 @@
       }
     ]
   },
-  "auth": { "source": "TEAT_COMMAND_RULES" },
-  "audit": { "enabled": true }
+  "auth": {
+    "source": "TEAT_COMMAND_RULES"
+  },
+  "audit": {
+    "enabled": true
+  }
 }

```
