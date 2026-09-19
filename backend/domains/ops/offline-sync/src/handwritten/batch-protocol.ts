// CTG-0002 §4.3 e §4.4 (R-0008, TASK-0005) — vocabulário fechado do protocolo
// de sincronização e as dependências comuns dos comandos manuscritos de
// `@detran/ops-offline-sync`.
import type {
  OpsClock,
  OpsRow,
  OpsRowStore,
  SyncEntityApplier,
} from '@detran/ops-core';
import { systemOpsClock } from '@detran/ops-core';
import { DetranError, type TeatEventOutbox } from '@detran/shared';

/** §4.3: os cinco tipos com destino previsto mais `crash-record` (BOAT). */
export const SUPPORTED_ENTITY_TYPES: readonly string[] = [
  'ait',
  'administrative-measure',
  'alcohol-signs-term',
  'ait-cancel-request',
  'ait-cancel-posfinal-request',
  'crash-record',
];

export type ReceiptStatus = 'received' | 'applied' | 'conflict' | 'rejected';
export type ConflictType = 'integrity' | 'domain' | 'concurrency';

export interface ItemOutcome {
  status: ReceiptStatus;
  conflictType?: ConflictType;
}

/**
 * §4.4 — recibo × `error_code` × conflito. Um código fora desta tabela é falha
 * de domínio não classificada: recibo `rejected`, sem conflito (o item volta
 * pelo reenvio, não pela mesa do supervisor).
 */
const OUTCOME_BY_CODE: Readonly<Record<string, ItemOutcome>> = {
  'TEAT.SYNC_LEGACY_ITEM_NOT_APPLIED': { status: 'received' },
  'TEAT.SYNC_DESTINATION_NOT_WIRED': { status: 'received' },
  'TEAT.SYNC_UNSUPPORTED_ENTITY_TYPE': { status: 'rejected' },
  'TEAT.SYNC_INTEGRITY_ERROR': {
    status: 'rejected',
    conflictType: 'integrity',
  },
  'TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT': {
    status: 'rejected',
    conflictType: 'domain',
  },
  'TEAT.NUMBERING_NUMBER_ALREADY_APPLIED': {
    status: 'rejected',
    conflictType: 'domain',
  },
  'TEAT.NUMBERING_RESERVATION_EXPIRED': {
    status: 'conflict',
    conflictType: 'domain',
  },
  'TEAT.SYNC_ITEM_CONFLICT': { status: 'conflict', conflictType: 'domain' },
  // The BOAT natural-key collision remains recoverable by retransmission,
  // but it does not open the TEAT supervisor queue: there is no BOAT-side
  // resolution command for it in CTG-0002.
  'BOAT.SYNC_DUPLICATE_NATURAL_KEY': { status: 'conflict' },
  'TEAT.SYNC_CONCURRENCY_SUSPECT': {
    status: 'conflict',
    conflictType: 'concurrency',
  },
};

export function outcomeFor(code: string): ItemOutcome {
  return OUTCOME_BY_CODE[code] ?? { status: 'rejected' };
}

/** Ações admitidas por tipo de conflito (§4.7 e §5.13). */
export const ALLOWED_RESOLUTION_ACTIONS: Readonly<
  Record<ConflictType, readonly string[]>
> = {
  integrity: ['accept_server', 'reject', 'retry_after_correction'],
  domain: ['accept_server', 'reject', 'retry_after_correction'],
  concurrency: ['manual_review'],
};

export const CONFLICT_DESCRIPTION: Readonly<Record<ConflictType, string>> = {
  integrity: 'Divergência de integridade do item requer análise.',
  domain: 'Divergência de negócio requer análise.',
  concurrency:
    'Mesmo agente com atos em dispositivos distintos na mesma janela.',
};

export interface DatabasePort {
  tx<T>(work: (transaction: unknown) => Promise<T>): Promise<T>;
}

export interface RequestContextPort {
  hasActiveContext(): boolean;
  snapshot(): { tenantId?: string; actorId?: string };
}

export interface ParameterRow {
  value_json?: unknown;
  source_pending?: boolean;
}

export interface ParameterPort {
  get(key: string, options?: Record<string, unknown>): Promise<ParameterRow>;
}

export interface OfflineSyncDeps {
  database: DatabasePort;
  requestContext: RequestContextPort;
  repositories: Partial<Record<string, OpsRowStore>>;
  appliers?: readonly SyncEntityApplier[];
  parameters?: ParameterPort;
  outbox?: TeatEventOutbox;
  clock?: OpsClock;
}

export function clockOf(deps: OfflineSyncDeps): OpsClock {
  return deps.clock ?? systemOpsClock;
}

export function storeOf(deps: OfflineSyncDeps, name: string): OpsRowStore {
  const store = deps.repositories[name];
  if (!store) throw new Error(`Unbound ops row store: ${name}`);
  return store;
}

export function tenantScope(deps: OfflineSyncDeps): {
  tenantId: string;
  actorId: string;
} {
  if (!deps.requestContext.hasActiveContext())
    throw new Error('Active tenant context is required');
  const snapshot = deps.requestContext.snapshot();
  if (!snapshot.tenantId) throw new Error('Active tenant context is required');
  return { tenantId: snapshot.tenantId, actorId: snapshot.actorId ?? '' };
}

/** Linhas do tenant corrente: a RLS já filtra no SQL; aqui só a defesa. */
export function ownedBy(rows: OpsRow[], tenantId: string): OpsRow[] {
  return rows.filter(
    (row) => !row.tenant_id || String(row.tenant_id) === tenantId,
  );
}

export function tenantMismatch(): DetranError {
  return new DetranError('TEAT.TENANT_MISMATCH', {
    status: 404,
    message: 'Recurso não pertence ao tenant da requisição.',
  });
}

export function validationFailed(
  fields: ReadonlyArray<Record<string, unknown>>,
): DetranError {
  return new DetranError('TEAT.VALIDATION_FAILED', {
    status: 422,
    context: { fields },
    message: 'Dados inválidos para o comando.',
  });
}

/** `bigint` chega do Postgres como string: converter antes de somar (§5.10). */
export function numberOf(value: unknown): number {
  return typeof value === 'number' ? value : Number(value);
}

export function isoOf(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
