// R-0016 TASK-0004 (Inspector). Stub de `DashboardStreamTransport` (`CTG-0002.md` §6), forma de
// `apps/portal/web/src/testing/portal-stream-transport.stub.ts`: cada chamada a `open()` cria um
// novo `Subject<DashboardStreamFrame>`; os specs de `SseService` (`core/sse/sse.service.spec.ts`)
// disparam frames com `.next()`, encerram com `.complete()` e simulam queda com `.error()`.
import { Subject } from 'rxjs';
import { vi, type Mock } from 'vitest';
import type {
  DashboardStreamFrame,
  DashboardStreamOpenOptions,
} from '../app/core/sse/stream-transport.js';

export interface DashboardStreamTransportStub {
  readonly open: Mock<
    (
      url: string,
      options: DashboardStreamOpenOptions,
    ) => Subject<DashboardStreamFrame>
  >;
  /** Subject da chamada mais recente a `open()` (undefined antes da primeira chamada). */
  current(): Subject<DashboardStreamFrame> | undefined;
  /** Todos os `options` de cada chamada, na ordem. */
  calls(): readonly DashboardStreamOpenOptions[];
}

export function createStreamTransportStub(): DashboardStreamTransportStub {
  const subjects: Subject<DashboardStreamFrame>[] = [];
  const optionsCalls: DashboardStreamOpenOptions[] = [];
  const open = vi.fn((_url: string, options: DashboardStreamOpenOptions) => {
    const subject = new Subject<DashboardStreamFrame>();
    subjects.push(subject);
    optionsCalls.push(options);
    return subject;
  });
  return {
    open,
    current: () => subjects[subjects.length - 1],
    calls: () => optionsCalls,
  };
}
