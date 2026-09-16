// CTG-0003 §4 e §11 (R-0008, TASK-0007) — composição de `EvidenceCommandsService`
// no módulo gerado.
//
// `repositories` fica vazio de propósito: no caminho de produção toda leitura
// e toda escrita acontecem **na transação do comando** (SQL parametrizado sob
// `withTenantContext`, role `app`, RLS na volta), que é o que o invariante
// "mesma transação" da §4.2 exige. A porta `EvidenceRowStore` existe para os
// dublês dos tiers `unit` e `integration`, que provam a guarda sem abrir uma
// transação de domínio.
import {
  APPLIED_ENTITY_PORTS,
  EVIDENCE_STORAGE_PORT,
  systemOpsClock,
  type AppliedEntityPort,
  type EvidenceStoragePort,
} from '@detran/ops-core';
import { SqlTeatEventOutbox } from '@detran/shared';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';

import { EvidenceCommandsService } from './evidence-commands.service.js';

export const EVIDENCE_COMMANDS_PROVIDER = {
  provide: EvidenceCommandsService,
  inject: [
    Database,
    RequestContext,
    { token: APPLIED_ENTITY_PORTS, optional: true },
    { token: EVIDENCE_STORAGE_PORT, optional: true },
  ],
  useFactory: (
    database: Database,
    requestContext: RequestContext,
    appliedEntityPorts?: readonly AppliedEntityPort[],
    evidenceStorage?: EvidenceStoragePort,
  ): EvidenceCommandsService =>
    new EvidenceCommandsService({
      database,
      requestContext,
      repositories: {},
      appliedEntityPorts: appliedEntityPorts ?? [],
      evidenceStorage,
      outbox: new SqlTeatEventOutbox(),
      clock: systemOpsClock,
    }),
};
