// R-0012 TASK-0005 (Inspector). Stub de `RaitStreamTransport` (contrato `CTG-0002a.md` §6,
// arquivo de produção `core/stream-transport.ts` ainda inexistente — TASK-0006). `open()` cria
// um novo `Subject<RaitStreamFrame>` a cada chamada; os specs de `core/sse.service.spec.ts`
// disparam frames com `.next()`, encerram com `.complete()` e simulam falha com `.error()`.
// Padrão `apps/portal/web/src/testing/portal-stream-transport.stub.ts`.
import { Subject } from 'rxjs';
import { vi, type Mock } from 'vitest';
import type {
  RaitStreamFrame,
  RaitStreamOpenOptions,
} from '../app/core/stream-transport';

export interface StreamTransportStub {
  readonly open: Mock<
    (url: string, options: RaitStreamOpenOptions) => Subject<RaitStreamFrame>
  >;
  /** `Subject` da chamada mais recente a `open()` (`undefined` antes da primeira chamada). */
  current(): Subject<RaitStreamFrame> | undefined;
  /** Todos os `options` de cada chamada a `open()`, na ordem. */
  calls(): readonly RaitStreamOpenOptions[];
}

export function createStreamTransportStub(): StreamTransportStub {
  const subjects: Subject<RaitStreamFrame>[] = [];
  const optionsCalls: RaitStreamOpenOptions[] = [];
  const open = vi.fn((_url: string, options: RaitStreamOpenOptions) => {
    const subject = new Subject<RaitStreamFrame>();
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

/** `id:`/`event:`/`data:` já montados como o parser incremental do serviço os produziria. */
export function streamFrame(
  id: string | null,
  event: string | null,
  data: unknown,
): RaitStreamFrame {
  return { id, event, data: data === undefined ? '' : JSON.stringify(data) };
}
