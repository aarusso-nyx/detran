// CTG-0004 §7, §12, §16.3 e §16.7 item 11 (R-0008, TASK-0008, adenda do
// maestro pós delivery-review ciclos 1 e 2) — porta `TeatStreamPoller`
// (`{ intervalMs, schedule(fn, intervalMs?) → unsubscribe }`), provida ao
// app com default 1000 ms; `TeatStreamController` nunca chama `setInterval`
// diretamente para **nenhum** agendamento periódico, heartbeat incluído
// (§16.7 item 11 estende §16.3 a todo agendamento do controlador).
//
// Leitura direta de `backend/app/src/teat-stream.controller.ts` e
// `teat-stream.service.ts` (2026-09-16, já com o ajuste do Engineer):
// o construtor recebe `(service: TeatStreamService, poller: TeatStreamPoller)`;
// `stream()` faz duas inscrições na porta — `this.poller.schedule(fn,
// HEARTBEAT_INTERVAL_MS)` para o heartbeat e `this.poller.schedule(fn)` (sem
// `intervalMs`, usa `poller.intervalMs`) para o polling da outbox — e cancela
// as duas no fechamento da conexão. `HEARTBEAT_INTERVAL_MS` (20 000) é
// exportado por `teat-stream.service.ts`; `createDefaultTeatStreamPoller`
// continua a única função com `setInterval` real.
//
// Construção via `import()` dinâmico e `new Controller(service, poller)` sem
// depender estaticamente da assinatura (mesmo padrão dos demais specs desta
// rodada).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const importModule = (specifier: string): Promise<unknown> =>
  import(/* @vite-ignore */ specifier);

interface OutboxRow {
  id: string;
  created_at: string;
  payload: Record<string, unknown>;
}

function fakeService(rowsByCall: OutboxRow[][]) {
  let call = 0;
  return {
    now: vi.fn(async () => '2026-09-14T15:00:00.000Z'),
    findById: vi.fn(async () => undefined),
    listSince: vi.fn(async () => {
      const rows = rowsByCall[call] ?? [];
      call += 1;
      return rows;
    }),
  };
}

interface ManualPollerSubscription {
  fn: () => void | Promise<void>;
  intervalMs: number | undefined;
  unsubscribe: ReturnType<typeof vi.fn>;
}

/**
 * `TeatStreamPoller` manual (§16.3/§16.7 item 11): cada chamada a
 * `schedule(fn, intervalMs?)` empilha uma inscrição própria (com o
 * `intervalMs` explícito recebido, ou `undefined` quando omitido — caso do
 * polling, que usa `port.intervalMs`) e devolve seu próprio `unsubscribe`.
 * Nada dispara sozinho: só quando o teste chama `firePolling()`/
 * `fireHeartbeat()`.
 */
function manualPoller(intervalMs = 1000) {
  const subscriptions: ManualPollerSubscription[] = [];
  const schedule = vi.fn(
    (fn: () => void | Promise<void>, explicitIntervalMs?: number) => {
      const unsubscribe = vi.fn();
      subscriptions.push({ fn, intervalMs: explicitIntervalMs, unsubscribe });
      return unsubscribe;
    },
  );
  return {
    port: { intervalMs, schedule },
    subscriptions,
    /** Dispara a inscrição de polling (schedule sem `intervalMs` explícito). */
    firePolling: () =>
      subscriptions.find((sub) => sub.intervalMs === undefined)?.fn(),
    /** Dispara a inscrição de heartbeat (schedule com `intervalMs` explícito). */
    fireHeartbeat: () =>
      subscriptions.find((sub) => sub.intervalMs !== undefined)?.fn(),
  };
}

function fakeReqRes() {
  const written: string[] = [];
  const req = {
    principal: { id: 'actor-1', roles: ['field-agent'], permissions: [] },
    on: vi.fn(),
  };
  const res = {
    statusCode: 0,
    setHeader: vi.fn(),
    write: vi.fn((chunk: string) => {
      written.push(chunk);
      return true;
    }),
    end: vi.fn(),
    on: vi.fn(),
  };
  return { req, res, written };
}

type StreamController = new (...args: unknown[]) => {
  stream: (...args: unknown[]) => Promise<void>;
};

/** Carrega o controlador e a constante do heartbeat, ambos via `import()`
 * dinâmico (mesma técnica do módulo, sem acoplar a assinatura estaticamente). */
async function loadStreamModules(): Promise<{
  Controller: StreamController;
  HEARTBEAT_INTERVAL_MS: number;
}> {
  let controllerModule: Record<string, unknown>;
  let serviceModule: Record<string, unknown>;
  try {
    [controllerModule, serviceModule] = (await Promise.all([
      importModule('./teat-stream.controller.js'),
      importModule('./teat-stream.service.js'),
    ])) as [Record<string, unknown>, Record<string, unknown>];
  } catch (cause) {
    throw new Error(
      'backend/app/src/teat-stream.controller.ts ou teat-stream.service.ts não puderam ser carregados (TASK-0009)',
      { cause },
    );
  }
  const ControllerExport =
    (controllerModule.TeatStreamController as unknown) ??
    Object.values(controllerModule).find(
      (value) => typeof value === 'function',
    );
  if (typeof ControllerExport !== 'function') {
    throw new Error(
      'teat-stream.controller.ts não exporta TeatStreamController',
    );
  }
  const heartbeatIntervalMs = serviceModule.HEARTBEAT_INTERVAL_MS;
  if (typeof heartbeatIntervalMs !== 'number') {
    throw new Error(
      'teat-stream.service.ts não exporta HEARTBEAT_INTERVAL_MS (CTG-0004 §16.7 item 11)',
    );
  }
  return {
    Controller: ControllerExport as StreamController,
    HEARTBEAT_INTERVAL_MS: heartbeatIntervalMs,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('CTG-0004 §7/§16.3/§16.7 item 11 — TeatStreamController: poller injetável (polling e heartbeat), nunca setInterval direto', () => {
  it('§16.3 — dado um TeatStreamPoller manual então a outbox só é consultada de novo quando a inscrição de polling dispara', async () => {
    const { Controller } = await loadStreamModules();

    const service = fakeService([[], []]);
    const poller = manualPoller(1000);
    const controller = new Controller(service, poller.port);
    const { req, res } = fakeReqRes();

    await controller.stream(req, res, undefined, undefined);

    // Uma consulta inicial (tick imediato do §7.1); o polling da outbox só
    // avança quando a inscrição de polling (sem `intervalMs` explícito)
    // dispara.
    expect(service.listSince).toHaveBeenCalledTimes(1);

    poller.firePolling();
    await vi.waitFor(() => {
      expect(service.listSince).toHaveBeenCalledTimes(2);
    });
  });

  it('§16.7 item 11(a) — dado o controlador quando conectado então faz duas inscrições na porta: polling (sem intervalMs) e heartbeat (com HEARTBEAT_INTERVAL_MS)', async () => {
    const { Controller, HEARTBEAT_INTERVAL_MS } = await loadStreamModules();
    expect(HEARTBEAT_INTERVAL_MS).toBe(20_000);

    const service = fakeService([[]]);
    const poller = manualPoller(1000);
    const controller = new Controller(service, poller.port);
    const { req, res } = fakeReqRes();

    await controller.stream(req, res, undefined, undefined);

    expect(poller.port.schedule).toHaveBeenCalledTimes(2);
    expect(poller.subscriptions).toHaveLength(2);

    const polling = poller.subscriptions.find(
      (sub) => sub.intervalMs === undefined,
    );
    const heartbeat = poller.subscriptions.find(
      (sub) => sub.intervalMs === HEARTBEAT_INTERVAL_MS,
    );
    expect(polling).toBeDefined();
    expect(heartbeat).toBeDefined();
  });

  it('§16.7 item 11(b) — dado a inscrição de heartbeat quando ela dispara então escreve ": heartbeat\\n\\n" na resposta', async () => {
    const { Controller } = await loadStreamModules();

    const service = fakeService([[]]);
    const poller = manualPoller(1000);
    const controller = new Controller(service, poller.port);
    const { req, res, written } = fakeReqRes();

    await controller.stream(req, res, undefined, undefined);
    poller.fireHeartbeat();

    expect(written).toContain(': heartbeat\n\n');
  });

  it('§16.7 item 11(c) — dado as duas inscrições quando a conexão fecha então ambas são canceladas', async () => {
    const { Controller } = await loadStreamModules();

    const service = fakeService([[]]);
    const poller = manualPoller(1000);
    const controller = new Controller(service, poller.port);
    const { req, res } = fakeReqRes();

    let closeHandler: (() => void) | undefined;
    (req.on as ReturnType<typeof vi.fn>).mockImplementation(
      (_event: string, listener: () => void) => {
        closeHandler = listener;
      },
    );

    await controller.stream(req, res, undefined, undefined);
    expect(poller.subscriptions).toHaveLength(2);

    closeHandler?.();

    for (const subscription of poller.subscriptions) {
      expect(subscription.unsubscribe).toHaveBeenCalledOnce();
    }
  });

  it('§16.7 item 11(d) — dado o controlador quando conectado então nunca chama um setInterval real, nem para polling nem para heartbeat', async () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const { Controller } = await loadStreamModules();

    const service = fakeService([[]]);
    const poller = manualPoller(1000);
    const controller = new Controller(service, poller.port);
    const { req, res } = fakeReqRes();

    await controller.stream(req, res, undefined, undefined);

    expect(setIntervalSpy).not.toHaveBeenCalled();
  });
});

describe('approved topic-before-limit SQL and controller argument contract', () => {
  for (const [label, topics, expected] of [
    ['default', undefined, undefined],
    [
      'filtered',
      ' ait.changed,ait.concurrency-suspected,ait.changed ',
      ['ait.changed', 'ait.concurrency-suspected'],
    ],
    ['explicit empty', '   ', []],
  ] as const)
    it(`controller ${label} forwards exact optional topic intent`, async () => {
      const { Controller } = await loadStreamModules();
      const service = fakeService([[]]);
      const poller = manualPoller();
      const { req, res } = fakeReqRes();
      await new Controller(service, poller.port).stream(
        req,
        res,
        undefined,
        topics,
      );
      expect(service.listSince).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ id: null }),
        undefined,
        expected,
      );
    });
  for (const [label, id, topics] of [
    ['default tuple', '00000000-0000-4000-8000-000000000001', undefined],
    ['default instant', null, undefined],
    ['filtered tuple', '00000000-0000-4000-8000-000000000001', ['ait.changed']],
    ['empty instant', null, []],
  ] as const)
    it(`actual service ${label} keeps tuple/order/default200 and binds topic predicates before limit`, async () => {
      const module = (await importModule('./teat-stream.service.js')) as {
        TeatStreamService: new (...args: unknown[]) => {
          listSince: (
            cursor: unknown,
            limit?: number,
            topics?: readonly string[],
          ) => Promise<unknown>;
        };
      };
      const rows = [
        {
          id: 'sentinel',
          created_at: '2026-10-21T10:00:00Z',
          payload: { type: 'ait.changed' },
        },
      ];
      const query = vi.fn(async () => ({ rows }));
      const tx = vi.fn(
        async (work: (q: unknown) => Promise<unknown>, options: unknown) => {
          expect(options).toEqual({ role: 'app' });
          return work({ query });
        },
      );
      const service = new module.TeatStreamService(
        { tx },
        {
          hasActiveContext: () => true,
          snapshot: () => ({ tenantId: 'tenant', actorId: 'actor' }),
        },
      );
      const cursor = { createdAt: '2026-10-21T09:00:00Z', id };
      expect(await service.listSince(cursor, undefined, topics)).toBe(rows);
      const [sql, args] = query.mock.calls[0] as unknown as [string, unknown[]];
      const base = id ? [cursor.createdAt, id, 200] : [cursor.createdAt, 200];
      expect(args).toEqual(
        topics === undefined ? base : [...base, [...topics]],
      );
      const normalized = sql.replace(/\s+/g, ' ').trim();
      if (topics === undefined)
        expect(normalized).toBe(
          id
            ? 'select id, created_at::text as created_at, payload from integration.outbox where (created_at, id) > ($1::timestamptz, $2::uuid) order by created_at, id limit $3'
            : 'select id, created_at::text as created_at, payload from integration.outbox where created_at > $1::timestamptz order by created_at, id limit $2',
        );
      else {
        expect(normalized).toContain("jsonb_typeof(payload->'type')='string'");
        expect(normalized).toContain(
          `payload->>'type'=any($${base.length + 1}::text[])`,
        );
        expect(normalized.indexOf('any(')).toBeLessThan(
          normalized.indexOf(' limit '),
        );
      }
      expect(query).toHaveBeenCalledOnce();
      expect(tx).toHaveBeenCalledOnce();
    });
});
