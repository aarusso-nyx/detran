import type { RequestContext } from '@stynx-nyx/core';
import type { Database, Transaction } from '@stynx-nyx/data';
import type { TxOptions } from '@stynx-nyx/data';

export type TenantTransactionOptions = Omit<TxOptions, 'role'>;

/**
 * The only sanctioned request-path transaction entry point for DETRAN domains.
 * STYNX's pipeline must already have resolved tenant and actor context; this
 * helper asserts that invariant and can never select the owner connection.
 */
export async function withTenantContext<T>(
  database: Pick<Database, 'tx'>,
  requestContext: Pick<RequestContext, 'hasActiveContext' | 'snapshot'>,
  work: (transaction: Transaction) => Promise<T>,
  options: TenantTransactionOptions = {},
): Promise<T> {
  if (!requestContext.hasActiveContext()) {
    throw new Error(
      'DETRAN tenant transaction requires an active request context',
    );
  }
  const context = requestContext.snapshot();
  if (!context.tenantId || !context.actorId) {
    throw new Error('DETRAN tenant transaction requires tenantId and actorId');
  }
  return database.tx(work, { ...options, role: 'app' });
}
