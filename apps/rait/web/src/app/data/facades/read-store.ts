// Slot de leitura com cache por chave e TTL curto (contrato CTG-0002b §4.1; M9). `load(key,
// loader)`: chave igual, status `ready`|`empty`, `clock.now() − loadedAt < CACHE_TTL_MS` e sem
// `force` → resolve sem requisição (cache hit); senão `loading` (o valor anterior é mantido —
// releitura em segundo plano), despacha o loader e, ao concluir, grava `value`/`loadedAt` ou
// classifica a falha por `classifyError` (único classificador — Padrão de app 12) e mapeia o
// `kind` ao `ReadStatus` por `readStatusFor` (catálogo §4; Portal `read-status.ts`). A promessa
// resolve quando a leitura conclui (os specs aguardam com `vi.waitFor`, Padrão 9). O tempo vem
// só de `RaitClock` (OD-R12-032). Nada aqui calcula prazo nem ordena ([RN-RAIT-005/141]).
import { computed, signal, type Signal } from '@angular/core';
import { classifyError, type ClassifiedError } from '../../core/error-boundary';
import { POLLING_INTERVAL_MS } from '../../core/sse.service';
import type { RaitClock } from '../clock';

export type ReadStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'empty'
  | 'error'
  | 'offline'
  | 'not_found'
  | 'forbidden'
  | 'unavailable';

/** `kind` do `ClassifiedError` → estado da tela (catálogo §4); demais → `'error'`. */
export function readStatusFor(error: ClassifiedError): ReadStatus {
  switch (error.kind) {
    case 'offline':
      return 'offline';
    case 'not_found':
      return 'not_found';
    case 'forbidden':
      return 'forbidden';
    case 'unavailable':
      return 'unavailable';
    default:
      return 'error';
  }
}

/** = `POLLING_INTERVAL_MS` (spec §8 "polling de 15 s"): validade do cache = cadência de
 * releitura (OD-R12-019). */
export const CACHE_TTL_MS = POLLING_INTERVAL_MS;

export interface ReadSlot<T> {
  readonly status: Signal<ReadStatus>;
  readonly error: Signal<ClassifiedError | null>;
  readonly value: Signal<T | null>;
  readonly key: Signal<string | null>;
  readonly loadedAt: Signal<number | null>;
}

export interface ReadLoadOptions<T> {
  readonly force?: boolean;
  readonly emptyWhen?: (value: T) => boolean;
}

export interface ReadStore<T> extends ReadSlot<T> {
  load(
    key: string,
    loader: () => Promise<T>,
    options?: ReadLoadOptions<T>,
  ): Promise<void>;
  /** `key` ausente → invalida qualquer chave; o próximo `load` ignora o TTL. */
  invalidate(key?: string): void;
  /** Reexecuta o último loader com `force` (no-op sem chave). */
  refresh(): Promise<void>;
  reset(): void;
}

const CACHED_STATUSES: ReadonlySet<ReadStatus> = new Set(['ready', 'empty']);

export function createReadStore<T>(clock: RaitClock): ReadStore<T> {
  const status = signal<ReadStatus>('idle');
  const error = signal<ClassifiedError | null>(null);
  const value = signal<T | null>(null);
  const key = signal<string | null>(null);
  const loadedAt = signal<number | null>(null);
  let invalidated = false;
  let lastLoader: (() => Promise<T>) | null = null;
  let lastOptions: ReadLoadOptions<T> = {};
  let sequence = 0;

  function isFresh(requested: string): boolean {
    const at = loadedAt();
    return (
      !invalidated &&
      key() === requested &&
      CACHED_STATUSES.has(status()) &&
      at !== null &&
      clock.now() - at < CACHE_TTL_MS
    );
  }

  async function load(
    requested: string,
    loader: () => Promise<T>,
    options: ReadLoadOptions<T> = {},
  ): Promise<void> {
    lastLoader = loader;
    lastOptions = options;
    if (!options.force && isFresh(requested)) return;
    invalidated = false;
    const ticket = ++sequence;
    key.set(requested);
    status.set('loading');
    try {
      const result = await loader();
      if (ticket !== sequence) return;
      value.set(result);
      loadedAt.set(clock.now());
      error.set(null);
      status.set(options.emptyWhen?.(result) ? 'empty' : 'ready');
    } catch (cause: unknown) {
      if (ticket !== sequence) return;
      const classified = classifyError(cause);
      error.set(classified);
      status.set(readStatusFor(classified));
    }
  }

  return {
    status: computed(() => status()),
    error: computed(() => error()),
    value: computed(() => value()),
    key: computed(() => key()),
    loadedAt: computed(() => loadedAt()),
    load,
    invalidate(target?: string): void {
      if (target === undefined || target === key()) invalidated = true;
    },
    async refresh(): Promise<void> {
      const current = key();
      if (current === null || lastLoader === null) return;
      await load(current, lastLoader, { ...lastOptions, force: true });
    },
    reset(): void {
      sequence += 1;
      invalidated = false;
      lastLoader = null;
      lastOptions = {};
      status.set('idle');
      error.set(null);
      value.set(null);
      key.set(null);
      loadedAt.set(null);
    },
  };
}
