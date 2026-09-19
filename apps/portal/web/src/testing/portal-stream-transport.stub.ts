// R-0014 TASK-0017 (Inspector). Stub de `PortalStreamTransport` (contrato CTG-0003c §4.1 —
// `core/realtime.service.ts`, arquivo ainda inexistente): em vez de importar o token abstrato de
// um módulo que ainda não existe (o que acoplaria todo consumidor a essa falha específica), este
// arquivo declara localmente a forma mínima do frame (`StreamFrame`, transcrita do contrato) e
// devolve um objeto com `open` (`vi.fn`) que os specs conectam ao provider real
// (`{ provide: PortalStreamTransport, useValue: stub.transport }`) na própria spec que já importa
// `core/realtime.service.ts` (e já falha por módulo ausente, como esperado pelo §9). Cada chamada
// a `open()` cria um novo `Subject<StreamFrame>`; os specs disparam frames com `emit()`, encerram
// com `complete()` e simulam queda com `error()`.
import { Subject } from 'rxjs';
import { vi, type Mock } from 'vitest';

export interface StreamFrame {
  readonly id: string | null;
  readonly event: string | null;
  readonly data: string;
}

export interface PortalStreamTransportStub {
  /** `vi.fn` compatível com `PortalStreamTransport.open(url, { lastEventId, topics })`. */
  readonly open: Mock<
    (
      url: string,
      options: {
        readonly lastEventId: string | null;
        readonly topics: readonly string[];
      },
    ) => Subject<StreamFrame>
  >;
  /** Subject da chamada mais recente a `open()` (undefined antes da primeira chamada). */
  current(): Subject<StreamFrame> | undefined;
  /** Todos os argumentos `options` de cada chamada, na ordem. */
  calls(): readonly {
    readonly lastEventId: string | null;
    readonly topics: readonly string[];
  }[];
}

export function createPortalStreamTransportStub(): PortalStreamTransportStub {
  const subjects: Subject<StreamFrame>[] = [];
  const optionsCalls: {
    readonly lastEventId: string | null;
    readonly topics: readonly string[];
  }[] = [];
  const open = vi.fn(
    (
      _url: string,
      options: {
        readonly lastEventId: string | null;
        readonly topics: readonly string[];
      },
    ) => {
      const subject = new Subject<StreamFrame>();
      subjects.push(subject);
      optionsCalls.push(options);
      return subject;
    },
  );
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
): StreamFrame {
  return { id, event, data: JSON.stringify(data) };
}
