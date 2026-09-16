// CTG-0002 §4.8 (R-0008, TASK-0005) — o applier `ait` como provider do próprio
// `AitModule`; a lista `SYNC_ENTITY_APPLIERS` é montada pelo app
// (`backend/app/src/teat-sync.providers.ts`).
import type { Provider } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import { systemOpsClock } from '@detran/ops-core';
import { SqlTeatEventOutbox } from '@detran/shared';

import { AitSyncApplier } from './sync-applier.js';

export const AIT_SYNC_APPLIER_PROVIDER: Provider = {
  provide: AitSyncApplier,
  inject: [Database, RequestContext],
  useFactory: (database: Database, requestContext: RequestContext) =>
    new AitSyncApplier({
      database,
      requestContext,
      outbox: new SqlTeatEventOutbox(),
      clock: systemOpsClock,
    }),
};
