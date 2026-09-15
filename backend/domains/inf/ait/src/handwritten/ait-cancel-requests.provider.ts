import type { Provider } from '@nestjs/common';
import { SqlTeatEventOutbox, TEAT_EVENT_OUTBOX } from '@detran/shared';

/**
 * Registers the `TEAT_EVENT_OUTBOX` DI token in `AitModule` (CTG-0001 §9:
 * "não no AppModule, para que o pacote permaneça testável isolado"). Named
 * `AIT_CANCEL_REQUESTS_PROVIDER` per the blueprint's `handwrittenProviders`
 * entry (CTG-0001 §9); it is not specific to cancel requests — the AIT
 * aggregate as a whole publishes through it (M16) — but the symbol keeps the
 * name the contract fixed for this file.
 */
export const AIT_CANCEL_REQUESTS_PROVIDER: Provider = {
  provide: TEAT_EVENT_OUTBOX,
  useClass: SqlTeatEventOutbox,
};
