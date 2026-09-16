// CTG-0002 §11 (R-0008, TASK-0005) — wiring dos comandos de campo dentro do
// módulo gerado, para que o pacote continue testável isolado.
import type { Provider } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import {
  OpsTenantRepository,
  systemOpsClock,
  type OpsRow,
  type OpsRowStore,
} from '@detran/ops-core';
import { MobileNormativePackageRepository } from '@detran/inf-normative';
import { OpsParameterService } from '@detran/ops-parameter';
import { SqlTeatEventOutbox } from '@detran/shared';

import { FieldCommands } from './field-commands.js';
import type { FieldDeps, ParameterPort } from './field-runtime.js';

const OPS_TABLES = {
  devices: 'ops.ops_operational_device',
  agents: 'ops.ops_agent_profile',
  homologations: 'ops.ops_homologation',
  appVersions: 'ops.ops_application_version',
  shifts: 'ops.ops_shift',
  handoffs: 'ops.ops_session_handoff',
  reservations: 'ops.numbering_reservation',
  units: 'ops.agency_unit',
  teams: 'ops.ops_team',
  patrolVehicles: 'ops.ops_patrol_vehicle',
  operations: 'ops.ops_operation',
  measurementInstruments: 'ops.ops_measurement_instrument',
  deviceEvents: 'ops.ops_device_event',
} as const;

export function fieldDeps(
  database: Database,
  requestContext: RequestContext,
  parameters: ParameterPort,
): FieldDeps {
  return {
    database,
    requestContext,
    repositories: {
      ...Object.fromEntries(
        Object.entries(OPS_TABLES).map(([name, table]) => [
          name,
          new OpsTenantRepository(database, requestContext, table),
        ]),
      ),
      // O bootstrap só **lê** o pacote normativo publicado (§6): o domínio
      // normativo é o dono da tabela (ADR-0001) e entra pelo repositório dele.
      packages: readOnlyStore(
        new MobileNormativePackageRepository(database, requestContext),
      ),
    },
    parameters,
    outbox: new SqlTeatEventOutbox(),
    clock: systemOpsClock,
  };
}

/**
 * Adapta um repositório gerado (`findAll`/`findOne`) à porta de leitura que os
 * comandos de campo usam. A escrita não é oferecida: o bootstrap não escreve
 * em domínio de terceiro.
 */
function readOnlyStore(repository: {
  findAll(): Promise<unknown[]>;
  findOne(id: string): Promise<unknown>;
}): OpsRowStore {
  return {
    list: async () => (await repository.findAll()) as OpsRow[],
    find: async (id: string) =>
      (await repository.findOne(id).catch(() => undefined)) as
        OpsRow | undefined,
    create: () => {
      throw new Error('ops/field does not write normative packages');
    },
    update: () => {
      throw new Error('ops/field does not write normative packages');
    },
  };
}

export const MOBILE_BOOTSTRAP_PROVIDER: Provider = {
  provide: FieldCommands,
  inject: [Database, RequestContext, OpsParameterService],
  useFactory: (
    database: Database,
    requestContext: RequestContext,
    parameters: OpsParameterService,
  ) =>
    new FieldCommands(
      fieldDeps(
        database,
        requestContext,
        parameters as unknown as ParameterPort,
      ),
    ),
};
