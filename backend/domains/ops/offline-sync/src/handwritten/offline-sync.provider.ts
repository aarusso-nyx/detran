// CTG-0002 §4.8 e §11 (R-0008, TASK-0005) — wiring do protocolo dentro do
// próprio módulo gerado (o pacote continua testável isolado).
//
// A lista de appliers é opcional: sem ela **todo** tipo suportado cai em
// `TEAT.SYNC_DESTINATION_NOT_WIRED` e nenhum item é aplicado, que é o
// comportamento que M5 pede para falha de implantação. O app monta a lista em
// `backend/app/src/teat-sync.providers.ts`.
import type { Provider } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import {
  OpsTenantRepository,
  SYNC_ENTITY_APPLIERS,
  systemOpsClock,
  type SyncEntityApplier,
} from '@detran/ops-core';
import { OpsParameterService } from '@detran/ops-parameter';
import { SqlTeatEventOutbox } from '@detran/shared';

import type { OfflineSyncDeps, ParameterPort } from './batch-protocol.js';
import { OfflineSyncCommands } from './offline-sync.commands.js';

export {
  SyncConflictQuery,
  SyncQueueItemQuery,
  SyncReceiptQuery,
} from './offline-sync.reads.js';
export { OfflineSyncCommands } from './offline-sync.commands.js';

const TABLES = {
  batches: 'ops.sync_batch',
  items: 'ops.sync_queue_item',
  receipts: 'ops.sync_receipt',
  conflicts: 'ops.sync_conflict',
  ranges: 'ops.ait_numbering_range',
  reservations: 'ops.numbering_reservation',
  consumptions: 'ops.numbering_consumption',
  handoffs: 'ops.ops_session_handoff',
} as const;

export function offlineSyncDeps(
  database: Database,
  requestContext: RequestContext,
  parameters: ParameterPort,
  appliers?: readonly SyncEntityApplier[],
): OfflineSyncDeps {
  return {
    database,
    requestContext,
    repositories: Object.fromEntries(
      Object.entries(TABLES).map(([name, table]) => [
        name,
        new OpsTenantRepository(database, requestContext, table),
      ]),
    ),
    appliers: appliers ?? [],
    parameters,
    outbox: new SqlTeatEventOutbox(),
    clock: systemOpsClock,
  };
}

export const OFFLINE_SYNC_PROVIDER: Provider = {
  provide: OfflineSyncCommands,
  inject: [
    Database,
    RequestContext,
    OpsParameterService,
    { token: SYNC_ENTITY_APPLIERS, optional: true },
  ],
  useFactory: (
    database: Database,
    requestContext: RequestContext,
    parameters: OpsParameterService,
    appliers?: readonly SyncEntityApplier[],
  ) =>
    new OfflineSyncCommands(
      offlineSyncDeps(
        database,
        requestContext,
        parameters as unknown as ParameterPort,
        appliers,
      ),
    ),
};
