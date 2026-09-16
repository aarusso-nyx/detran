// CTG-0003 §5 e §11 (R-0008, TASK-0007) — composição do comando de consulta
// externa. `SNAPSHOT_QUERY_PORTS` é o token multi-provider de CTG-0002 §4.8;
// no app ele recebe `createSenatranAdapter().ports` (ADR-0003).
//
// `repositories` fica vazio: no caminho de produção a leitura de
// congelamento e a escrita acontecem por SQL parametrizado sob
// `withTenantContext`; a porta de repositório existe para os dublês de teste.
import { SNAPSHOT_QUERY_PORTS, systemOpsClock } from '@detran/ops-core';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';

import { ExternalQueryCommand } from './external-query.command.js';
import type { SnapshotQueryPorts } from './snapshots-runtime.js';

const UNBOUND_PORTS: SnapshotQueryPorts = {
  wsdenatranRead: {
    findVehicleByPlate: () => {
      throw new Error('SNAPSHOT_QUERY_PORTS não está ligado ao app');
    },
  },
  renach: {
    findDriverByCpf: () => {
      throw new Error('SNAPSHOT_QUERY_PORTS não está ligado ao app');
    },
    findDriverByLicense: () => {
      throw new Error('SNAPSHOT_QUERY_PORTS não está ligado ao app');
    },
  },
};

export const EXTERNAL_QUERY_PROVIDER = {
  provide: ExternalQueryCommand,
  inject: [
    Database,
    RequestContext,
    { token: SNAPSHOT_QUERY_PORTS, optional: true },
  ],
  useFactory: (
    database: Database,
    requestContext: RequestContext,
    ports?: SnapshotQueryPorts,
  ): ExternalQueryCommand =>
    new ExternalQueryCommand({
      database,
      requestContext,
      repositories: {},
      ports: ports ?? UNBOUND_PORTS,
      clock: systemOpsClock,
    }),
};
