import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import { OpsTenantRepository } from '@detran/ops-core';
import { FrozenSnapshotService } from './frozen-snapshot.service.js';

const surfaces = {
  people: 'ops.snapshots_person',
  vehicles: 'ops.snapshots_vehicle',
  'external-queries': 'ops.snapshots_external_query',
} as const;

export const FROZEN_SNAPSHOT_PROVIDER = {
  provide: FrozenSnapshotService,
  inject: [Database, RequestContext],
  useFactory: (database: Database, requestContext: RequestContext) =>
    new FrozenSnapshotService(
      Object.fromEntries(
        Object.entries(surfaces).map(([name, table]) => [
          name,
          new OpsTenantRepository(database, requestContext, table),
        ]),
      ),
    ),
};
