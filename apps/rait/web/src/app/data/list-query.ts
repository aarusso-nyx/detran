// Estreitamento e paginação de listas NO CLIENTE (contrato CTG-0002b §3.1–§3.2; OD-R12-018): os
// `list*` gerados de `@detran/api-clients` não aceitam query e respondem array plano ("most recent
// first, capped at 500"). `applyListQuery` é pura: (1) `filtro` por igualdade em campos
// declarados na `ListQuerySpec` (campo fora da spec é ignorado); (2) `q` por substring
// case-insensitive nos campos `spec.q`; (3) `ordem` — só `'padrao'` = a ordem recebida; qualquer
// outro valor é ignorado e NUNCA se reordena ([RN-RAIT-141]); (4) fatia por `page`/`pageSize`
// (≤ `LIST_PAGE_SIZE_MAX`). `parseListQuery`/`listQueryToParams` traduzem a forma de URL
// `?q=&ordem=&filtro=campo:valor;campo:valor&pagina=&tamanho=` (OD-R12-020). Nenhuma ordenação
// neste arquivo.
import type { ParamMap, Params } from '@angular/router';
import {
  LIST_PAGE_SIZE_DEFAULT,
  LIST_PAGE_SIZE_MAX,
  type ListPage,
  type ListQuery,
} from './models/list-page';

export interface ListQuerySpec<T> {
  /** Campos pesquisados por `q` (substring, case-insensitive). */
  readonly q: readonly (keyof T & string)[];
  /** Campos admitidos em `filtro` (igualdade por `String(valor)`). */
  readonly filtro: readonly (keyof T & string)[];
}

const QUERY_PARAM = 'q';
const ORDER_PARAM = 'ordem';
const FILTER_PARAM = 'filtro';
const PAGE_PARAM = 'pagina';
const PAGE_SIZE_PARAM = 'tamanho';
const DEFAULT_ORDER = 'padrao';
const FILTER_PAIR_SEPARATOR = ';';
const FILTER_KEY_SEPARATOR = ':';

function fieldText<T>(item: T, field: keyof T & string): string {
  const value = (item as Record<string, unknown>)[field];
  return value === null || value === undefined ? '' : String(value);
}

function narrowByFilter<T>(
  items: readonly T[],
  filtro: Readonly<Record<string, string>> | undefined,
  spec: ListQuerySpec<T>,
): readonly T[] {
  if (!filtro) return items;
  let result = items;
  for (const [field, expected] of Object.entries(filtro)) {
    if (!spec.filtro.includes(field as keyof T & string)) continue;
    result = result.filter(
      (item) => fieldText(item, field as keyof T & string) === expected,
    );
  }
  return result;
}

function narrowByQ<T>(
  items: readonly T[],
  q: string | undefined,
  spec: ListQuerySpec<T>,
): readonly T[] {
  const needle = (q ?? '').trim().toLocaleLowerCase();
  if (needle.length === 0) return items;
  return items.filter((item) =>
    spec.q.some((field) =>
      fieldText(item, field).toLocaleLowerCase().includes(needle),
    ),
  );
}

function clampPage(page: number | undefined): number {
  return Math.max(1, Math.trunc(page ?? 1));
}

function clampPageSize(pageSize: number | undefined): number {
  return Math.min(
    LIST_PAGE_SIZE_MAX,
    Math.max(1, Math.trunc(pageSize ?? LIST_PAGE_SIZE_DEFAULT)),
  );
}

/** Pura; nunca muta nem reordena a entrada. */
export function applyListQuery<T>(
  items: readonly T[],
  query: ListQuery,
  spec: ListQuerySpec<T>,
): ListPage<T> {
  const narrowed = narrowByQ(
    narrowByFilter(items, query.filtro, spec),
    query.q,
    spec,
  );
  const page = clampPage(query.page);
  const pageSize = clampPageSize(query.pageSize);
  const start = (page - 1) * pageSize;
  return {
    items: narrowed.slice(start, start + pageSize),
    total: narrowed.length,
    page,
    pageSize,
  };
}

function parseFilter(
  raw: string | null,
): Readonly<Record<string, string>> | null {
  if (raw === null || raw.length === 0) return null;
  const entries: [string, string][] = [];
  for (const pair of raw.split(FILTER_PAIR_SEPARATOR)) {
    const separator = pair.indexOf(FILTER_KEY_SEPARATOR);
    if (separator <= 0) continue;
    entries.push([pair.slice(0, separator), pair.slice(separator + 1)]);
  }
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

function parsePositiveInteger(raw: string | null): number | null {
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return value >= 1 ? value : null;
}

/** `?q=&ordem=&filtro=&pagina=&tamanho=` → `ListQuery` (chaves inválidas ficam ausentes). */
export function parseListQuery(params: ParamMap): ListQuery {
  const q = params.get(QUERY_PARAM);
  const ordem = params.get(ORDER_PARAM);
  const filtro = parseFilter(params.get(FILTER_PARAM));
  const page = parsePositiveInteger(params.get(PAGE_PARAM));
  const pageSize = parsePositiveInteger(params.get(PAGE_SIZE_PARAM));
  return {
    ...(q !== null && q.length > 0 ? { q } : {}),
    ...(ordem === DEFAULT_ORDER ? { ordem: DEFAULT_ORDER } : {}),
    ...(filtro !== null ? { filtro } : {}),
    ...(page !== null ? { page } : {}),
    ...(pageSize !== null ? { pageSize } : {}),
  };
}

/** Inverso de `parseListQuery`: chaves ausentes omitidas; `page` 1 omitida. */
export function listQueryToParams(query: ListQuery): Params {
  const params: Params = {};
  if (query.q !== undefined && query.q.length > 0)
    params[QUERY_PARAM] = query.q;
  if (query.ordem === DEFAULT_ORDER) params[ORDER_PARAM] = DEFAULT_ORDER;
  if (query.filtro !== undefined) {
    const pairs = Object.entries(query.filtro).map(
      ([field, value]) => `${field}${FILTER_KEY_SEPARATOR}${value}`,
    );
    if (pairs.length > 0)
      params[FILTER_PARAM] = pairs.join(FILTER_PAIR_SEPARATOR);
  }
  if (query.page !== undefined && query.page > 1) {
    params[PAGE_PARAM] = String(query.page);
  }
  if (query.pageSize !== undefined) {
    params[PAGE_SIZE_PARAM] = String(query.pageSize);
  }
  return params;
}
