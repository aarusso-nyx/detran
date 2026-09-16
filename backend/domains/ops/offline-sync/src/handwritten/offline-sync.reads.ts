// CTG-0002 §5.13 (R-0008, TASK-0005) — leituras do protocolo: recibos por
// tenant, recuperação de ACK perdido por `idempotency_key`, fila e conflitos.
// O lookup de recibo é sempre por tenant (route contract §4.3): um `{tenantId}`
// diferente do principal é 404 `TEAT.TENANT_MISMATCH`, nunca uma leitura vazia.
import type { OpsRow } from '@detran/ops-core';
import { DetranError } from '@detran/shared';

import {
  ownedBy,
  storeOf,
  tenantMismatch,
  tenantScope,
  type OfflineSyncDeps,
} from './batch-protocol.js';

export interface SyncListFilters {
  device_id?: string;
  status?: string;
}

function matches(row: OpsRow, filters: SyncListFilters): boolean {
  if (filters.device_id && String(row.device_id) !== filters.device_id)
    return false;
  if (filters.status && String(row.status) !== filters.status) return false;
  return true;
}

function byCreatedAtDesc(left: OpsRow, right: OpsRow): number {
  return String(right.created_at ?? '').localeCompare(
    String(left.created_at ?? ''),
  );
}

export class SyncReceiptQuery {
  constructor(private readonly deps: OfflineSyncDeps) {}

  async findByIdempotencyKey(tenantId: string, key: string): Promise<OpsRow> {
    const rows = await this.receipts(tenantId);
    const receipt = rows.find((row) => String(row.idempotency_key) === key);
    if (!receipt)
      throw new DetranError('TEAT.SYNC_RECEIPT_NOT_FOUND', {
        status: 404,
        context: { idempotencyKey: key },
        message: 'Recibo inexistente para a chave informada.',
      });
    return receipt;
  }

  async list(
    tenantId: string,
    filters: SyncListFilters = {},
  ): Promise<{ receipts: OpsRow[] }> {
    const rows = await this.receipts(tenantId);
    return {
      receipts: rows
        .filter((row) => matches(row, filters))
        .sort(byCreatedAtDesc),
    };
  }

  private async receipts(tenantId: string): Promise<OpsRow[]> {
    const scope = tenantScope(this.deps);
    if (tenantId !== scope.tenantId) throw tenantMismatch();
    return ownedBy(await storeOf(this.deps, 'receipts').list(), scope.tenantId);
  }
}

export class SyncQueueItemQuery {
  constructor(private readonly deps: OfflineSyncDeps) {}

  async list(filters: SyncListFilters = {}): Promise<{ items: OpsRow[] }> {
    const scope = tenantScope(this.deps);
    const rows = ownedBy(
      await storeOf(this.deps, 'items').list(),
      scope.tenantId,
    );
    return { items: rows.filter((row) => matches(row, filters)) };
  }
}

export class SyncConflictQuery {
  constructor(private readonly deps: OfflineSyncDeps) {}

  async list(filters: SyncListFilters = {}): Promise<{ conflicts: OpsRow[] }> {
    const scope = tenantScope(this.deps);
    const rows = ownedBy(
      await storeOf(this.deps, 'conflicts').list(),
      scope.tenantId,
    );
    const items = filters.device_id
      ? ownedBy(await storeOf(this.deps, 'items').list(), scope.tenantId)
      : [];
    return {
      conflicts: rows.filter((row) => {
        if (filters.status && String(row.status) !== filters.status)
          return false;
        if (!filters.device_id) return true;
        const item = items.find(
          (candidate) =>
            String(candidate.id) === String(row.sync_queue_item_id),
        );
        return item ? String(item.device_id) === filters.device_id : false;
      }),
    };
  }
}
