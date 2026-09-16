// CTG-0002 §2, §3 e §5.10–§5.12 (M8, R-0008, TASK-0005) — utilidades SQL dos
// comandos de numeração. A alocação de números é atômica por definição
// (`select … for update` na faixa antes de qualquer aritmética), então estes
// comandos falam SQL dentro de **uma** transação, e não pela porta de
// repositório, que abre transação por instrução.
import { asQueryable, type SqlQueryable } from '@detran/ops-core';
import type { Transaction } from '@stynx-nyx/data';

import type { OfflineSyncDeps } from './batch-protocol.js';

export interface SqlScope {
  query: SqlQueryable['query'];
  transaction: Transaction;
}

export function inTransaction<T>(
  deps: OfflineSyncDeps,
  work: (scope: SqlScope) => Promise<T>,
): Promise<T> {
  return deps.database.tx(async (tx) => {
    const queryable = asQueryable(tx);
    if (!queryable)
      throw new Error('Numbering commands require a SQL transaction');
    return work({
      query: queryable.query.bind(queryable),
      transaction: tx as Transaction,
    });
  });
}

/** `bigint` chega como string do Postgres; a aritmética é sempre em número. */
export function bigintOf(value: unknown): number {
  return Number(value);
}
