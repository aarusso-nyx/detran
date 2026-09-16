// CTG-0003 §6 e §11 (R-0008, TASK-0007) — composição de
// `NormativeCommandsService` no módulo gerado.
//
// `repositories` fica vazio: em produção a leitura do manifesto e a escrita
// acontecem por SQL parametrizado sob `withTenantContext` (role `app`, RLS na
// volta). A porta de repositório existe para os dublês dos tiers `unit` e
// `integration`.
import { SqlTeatEventOutbox } from '@detran/shared';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';

import { NormativeCommandsService } from './normative-commands.service.js';
import { LocalPackageSigner, PACKAGE_SIGNER_PORT } from './package-signer.js';
import type { NormativeOutbox, PackageSigner } from './normative-runtime.js';

const systemClock = {
  now: (): string => new Date().toISOString(),
  today: (): string => new Date().toISOString().slice(0, 10),
};

export const NORMATIVE_COMMANDS_PROVIDER = {
  provide: NormativeCommandsService,
  inject: [
    Database,
    RequestContext,
    { token: PACKAGE_SIGNER_PORT, optional: true },
  ],
  useFactory: (
    database: Database,
    requestContext: RequestContext,
    packageSigner?: PackageSigner,
  ): NormativeCommandsService =>
    new NormativeCommandsService({
      database,
      requestContext,
      repositories: {},
      packageSigner: packageSigner ?? new LocalPackageSigner(),
      outbox: new SqlTeatEventOutbox() as unknown as NormativeOutbox,
      clock: systemClock,
    }),
};
