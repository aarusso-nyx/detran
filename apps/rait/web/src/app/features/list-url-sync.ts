// Sincronização URL ↔ `ListFacade` das páginas de lista (contrato CTG-0002b §6 "listas"; spec §4
// `?q=&ordem=&filtro=`; guia §3.1 `&pagina=`; OD-R12-020): `parseListQuery(route.queryParamMap)`
// na criação e a cada mudança → `load(query)` da página (que delega ao `load*` da facade, §6.1
// coluna "facade · leitura"); `setQuery(patch)` → `router.navigate` com `listQueryToParams` e
// `queryParamsHandling: 'merge'` (chave ausente vira `null` para que o merge a remova);
// `pageChange` da `StynxPaginationComponent` (índice 0-based) → `setQuery({ page })`. Nenhuma
// ordenação nem prazo aqui ([RN-RAIT-141], [RN-RAIT-005]). Fica em `features/` porque só as
// páginas o usam (a fronteira desta CTG não toca `shared/**`/`core/**`).
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  Router,
  type NavigationExtras,
  type Params,
} from '@angular/router';
import { listQueryToParams, parseListQuery } from '../data/list-query';
import type { ListQuery } from '../data/models';

/** Parâmetros de URL da lista (spec §4; guia §3.1; OD-R12-020). */
const LIST_PARAMS = ['q', 'ordem', 'filtro', 'pagina', 'tamanho'] as const;

export interface ListUrlSyncOptions {
  /** Dispara a leitura da facade com a consulta lida da URL. */
  readonly load: (query: ListQuery) => Promise<void>;
}

export interface ListUrlSync {
  /** Última consulta lida da URL (base de `setQuery`; nunca o filtro interno da facade). */
  readonly query: () => ListQuery;
  readonly setQuery: (patch: Partial<ListQuery>) => void;
  /** `pageChange` do kit: `pageIndex` 0-based → `page` 1-based. */
  readonly onPageChange: (change: { pageIndex: number }) => void;
  readonly onSearch: (event: Event) => void;
}

/** A URL trouxe alguma consulta? */
export function hasListQuery(query: ListQuery): boolean {
  return Object.keys(query).length > 0;
}

/**
 * Consulta da URL sobre a consulta que a facade já fixou no slot (`load*(orgao)` sem parâmetro de
 * consulta, §4.3): `filtro` é mesclado (o recorte da facade permanece), o resto vem da URL.
 */
export function mergeListQuery(base: ListQuery, patch: ListQuery): ListQuery {
  return {
    ...base,
    ...patch,
    ...(base.filtro !== undefined || patch.filtro !== undefined
      ? { filtro: { ...(base.filtro ?? {}), ...(patch.filtro ?? {}) } }
      : {}),
  };
}

/** `listQueryToParams` com `null` explícito nas chaves ausentes (o merge as remove). */
export function listQueryToMergeParams(query: ListQuery): Params {
  const params = listQueryToParams(query);
  const merged: Params = {};
  for (const key of LIST_PARAMS) merged[key] = params[key] ?? null;
  return merged;
}

/** Só em contexto de injeção (construtor da página). */
export function connectListToUrl(options: ListUrlSyncOptions): ListUrlSync {
  const route = inject(ActivatedRoute);
  const router = inject(Router);
  const destroyRef = inject(DestroyRef);

  let current: ListQuery = {};

  route.queryParamMap
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe((params) => {
      current = parseListQuery(params);
      void options.load(current);
    });

  const setQuery = (patch: Partial<ListQuery>): void => {
    const changesNarrowing = 'q' in patch || 'filtro' in patch;
    const next: ListQuery = {
      ...current,
      ...patch,
      ...(changesNarrowing && patch.page === undefined ? { page: 1 } : {}),
    };
    const extras: NavigationExtras = {
      relativeTo: route,
      queryParams: listQueryToMergeParams(next),
      queryParamsHandling: 'merge',
    };
    void router.navigate([], extras);
  };

  return {
    query: () => current,
    setQuery,
    onPageChange: (change) => setQuery({ page: change.pageIndex + 1 }),
    onSearch: (event: Event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement | null;
      const input = form?.elements.namedItem('q');
      const q = input instanceof HTMLInputElement ? input.value.trim() : '';
      setQuery({ q: q.length > 0 ? q : undefined });
    },
  };
}
