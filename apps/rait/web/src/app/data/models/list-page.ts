// Envelope de lista do app (build-pack §0.1) e consulta de lista (spec §4 `?q=&ordem=&filtro=`;
// guia §3.1 `&pagina=`, `pageSize ≤ 50`). Contrato CTG-0002b §2 / §3.1: os `list*` gerados não
// aceitam query nem devolvem envelope (OD-R12-018), então o estreitamento e a paginação são
// feitos no cliente por `applyListQuery` (`data/list-query.ts`), NUNCA reordenando
// ([RN-RAIT-141]). `LIST_SERVER_CAP` é informativo (contratos: "capped at 500").

export interface ListPage<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface ListQuery {
  readonly q?: string;
  /** Só `'padrao'` = ordem recebida do servidor ([RN-RAIT-141]). */
  readonly ordem?: 'padrao';
  readonly filtro?: Readonly<Record<string, string>>;
  readonly page?: number;
  readonly pageSize?: number;
}

/** Guia §3.1 "pageSize ≤ 50". */
export const LIST_PAGE_SIZE_MAX = 50;
/** = máximo (OD-R12-020). */
export const LIST_PAGE_SIZE_DEFAULT = 50;
/** Spec §8 / contratos gerados "capped at 500" (informativo; OD-R12-018). */
export const LIST_SERVER_CAP = 500;

export function emptyPage<T>(query: ListQuery = {}): ListPage<T> {
  return {
    items: [],
    total: 0,
    page: query.page ?? 1,
    pageSize: query.pageSize ?? LIST_PAGE_SIZE_DEFAULT,
  };
}
