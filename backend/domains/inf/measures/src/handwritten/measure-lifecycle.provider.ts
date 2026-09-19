// CTG-0004 §12 (R-0008, TASK-0009) e §15.2 (adenda, iteração 2) — composição
// de `MeasureCommands` no módulo gerado.
//
// `repositories` fica vazio de propósito (mesmo padrão de
// `ops/evidence/src/handwritten/evidence-commands.provider.ts`, CTG-0003
// §4): no caminho de produção toda leitura e toda escrita acontecem na
// transação do comando (SQL parametrizado sob `withTenantContext`, role
// `app`, RLS na volta). A porta `MeasureRowStore` existe para os dublês dos
// tiers `unit`/`integration`.
//
// `featureFlags` é injetada pelo token `MEASURE_FEATURE_FLAGS`
// (`measure-runtime.ts`): o domínio nunca lê `process.env` (§15.2) — o app
// provê o valor real a partir de `detranFeatureFlagSet()`
// (`backend/app/src/teat-measures.providers.ts`). Sem o provider ligado
// (dublês/bootstraps que não montam o módulo de portas), a porta cai fechada
// (`isEnabled` sempre `false`) — nunca assume a flag ligada por padrão.
import type { Provider } from '@nestjs/common';
import { SqlTeatEventOutbox } from '@detran/shared';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';

import { CancelMeasureCommand } from './cancel-measure.command.js';
import { ConcludeMeasureCommand } from './conclude-measure.command.js';
import { createMeasureDeadlinesPort } from './deadlines.js';
import { IssueTermCommand } from './issue-term.command.js';
import {
  MEASURE_FEATURE_FLAGS,
  type MeasureDeps,
  type MeasureFeatureFlags,
} from './measure-runtime.js';
import { RecordInventoryCommand } from './record-inventory.command.js';
import { RecordRemovalCommand } from './record-removal.command.js';
import { RecordRetentionCommand } from './record-retention.command.js';
import { ReleaseRetentionCommand } from './release-retention.command.js';
import { StartMeasureCommand } from './start-measure.command.js';

const CLOSED_FEATURE_FLAGS: MeasureFeatureFlags = { isEnabled: () => false };

/** Bolsa dos oito comandos manuscritos de medidas (CTG-0004 §12). */
export class MeasureCommands {
  readonly start: StartMeasureCommand;
  readonly registerRetention: RecordRetentionCommand;
  readonly registerRemoval: RecordRemovalCommand;
  readonly inventoryVehicle: RecordInventoryCommand;
  readonly applyTerm: IssueTermCommand;
  readonly release: ReleaseRetentionCommand;
  readonly conclude: ConcludeMeasureCommand;
  readonly cancel: CancelMeasureCommand;

  constructor(deps: MeasureDeps) {
    this.start = new StartMeasureCommand(deps);
    this.registerRetention = new RecordRetentionCommand(deps);
    this.registerRemoval = new RecordRemovalCommand(deps);
    this.inventoryVehicle = new RecordInventoryCommand(deps);
    this.applyTerm = new IssueTermCommand(deps);
    this.release = new ReleaseRetentionCommand(deps);
    this.conclude = new ConcludeMeasureCommand(deps);
    this.cancel = new CancelMeasureCommand(deps);
  }
}

export const MEASURE_LIFECYCLE_PROVIDER: Provider = {
  provide: MeasureCommands,
  inject: [
    Database,
    RequestContext,
    { token: MEASURE_FEATURE_FLAGS, optional: true },
  ],
  useFactory: (
    database: Database,
    requestContext: RequestContext,
    featureFlags?: MeasureFeatureFlags,
  ) =>
    new MeasureCommands({
      database,
      requestContext,
      repositories: {},
      outbox: new SqlTeatEventOutbox(),
      clock: { now: () => new Date().toISOString() },
      deadlines: createMeasureDeadlinesPort(),
      featureFlags: featureFlags ?? CLOSED_FEATURE_FLAGS,
    }),
};
