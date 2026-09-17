// Paginação das listas cidadãs (work/rounds/R-0009/contracts/CTG-0002.md §0):
// `page` 1-based (default 1), `pageSize` default 20 e máximo 100 — convenção
// de API, não parâmetro de produto —, importada por todos os pacotes do
// Portal. Resposta das listas: `{ items, total, page, pageSize }`.
import { PortalError } from './errors.js';

export const PORTAL_PAGE_SIZE = 20;
export const PORTAL_MAX_PAGE_SIZE = 100;

export interface PortalPage {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
}

export interface PortalPagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

function positiveInteger(
  raw: string | string[] | undefined,
  field: string,
): number | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined || value === '') return undefined;
  if (!/^\d+$/.test(value) || Number(value) < 1) {
    throw new PortalError('PORTAL.VALIDATION_FAILED', {
      status: 400,
      context: { fields: [field] },
    });
  }
  return Number(value);
}

/** `page`/`pageSize` da query; fora da forma → 400 `PORTAL.VALIDATION_FAILED`. */
export function parsePage(
  query: Record<string, string | string[] | undefined> | undefined,
): PortalPage {
  const page = positiveInteger(query?.page, 'page') ?? 1;
  const requested =
    positiveInteger(query?.pageSize, 'pageSize') ?? PORTAL_PAGE_SIZE;
  const pageSize = Math.min(requested, PORTAL_MAX_PAGE_SIZE);
  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
}
