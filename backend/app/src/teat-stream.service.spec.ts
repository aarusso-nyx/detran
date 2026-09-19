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
