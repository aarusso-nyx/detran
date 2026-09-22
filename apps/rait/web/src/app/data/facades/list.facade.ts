// Leitura de lista genérica (contrato CTG-0002b §4.1; L1 e listas L2) sobre `createReadStore`:
// chave de cache = JSON canônico da query (`canonicalJson`, M17); `setQuery` mescla a query
// (a página volta a 1 quando `q`/`filtro` mudam) e carrega. `items()` = `value()?.items ?? []`,
// sempre na ordem recebida ([RN-RAIT-141]). `emptyWhen = total === 0` (§4.1; A10 j): lista
// vazia → `status 'empty'`.
import { computed, signal, type Signal } from '@angular/core';
import type { RaitClock } from '../clock';
import { canonicalJson } from '../idempotency-key';
import type { ListPage, ListQuery } from '../models/list-page';
import { createReadStore, type ReadSlot } from './read-store';

export interface ListFacade<T> extends ReadSlot<ListPage<T>> {
  readonly query: Signal<ListQuery>;
  readonly items: Signal<readonly T[]>;
  load(query?: ListQuery): Promise<void>;
  setQuery(patch: Partial<ListQuery>): Promise<void>;
  refresh(): Promise<void>;
  /** Invalida a chave atual (qualquer query): o próximo `load` ignora o TTL. */
  invalidate(): void;
}

function narrowingChanged(
  current: ListQuery,
  patch: Partial<ListQuery>,
): boolean {
  return (
    ('q' in patch && patch.q !== current.q) ||
    ('filtro' in patch &&
      canonicalJson(patch.filtro ?? null) !==
        canonicalJson(current.filtro ?? null))
  );
}

export function createListFacade<T>(
  loader: (query: ListQuery) => Promise<ListPage<T>>,
  clock: RaitClock,
): ListFacade<T> {
  const store = createReadStore<ListPage<T>>(clock);
  const query = signal<ListQuery>({});

  async function load(next: ListQuery = query()): Promise<void> {
    query.set(next);
    await store.load(canonicalJson(next), () => loader(next), {
      emptyWhen: (page) => page.total === 0,
    });
  }

  return {
    status: store.status,
    error: store.error,
    value: store.value,
    key: store.key,
    loadedAt: store.loadedAt,
    query: computed(() => query()),
    items: computed(() => store.value()?.items ?? []),
    load,
    async setQuery(patch: Partial<ListQuery>): Promise<void> {
      const current = query();
      const merged: ListQuery = {
        ...current,
        ...patch,
        ...(narrowingChanged(current, patch) && patch.page === undefined
          ? { page: 1 }
          : {}),
      };
      await load(merged);
    },
    refresh: () => store.refresh(),
    invalidate: () => store.invalidate(),
  };
}
