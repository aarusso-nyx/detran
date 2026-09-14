import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import { OpsTenantRepository } from '@detran/ops-core';
import { FieldOperationsService } from './field-operations.service.js';

const surfaces = {
  agents: 'ops.ops_agent_profile',
  devices: 'ops.ops_operational_device',
  teams: 'ops.ops_team',
  shifts: 'ops.ops_shift',
  homologations: 'ops.ops_homologation',
  'app-versions': 'ops.ops_application_version',
} as const;

export const FIELD_OPERATIONS_PROVIDER = {
  provide: FieldOperationsService,
  inject: [Database, RequestContext],
  useFactory: (database: Database, requestContext: RequestContext) =>
    new FieldOperationsService(
      Object.fromEntries(
        Object.entries(surfaces).map(([name, table]) => [
          name,
          new OpsTenantRepository(database, requestContext, table),
        ]),
      ),
    ),
};
