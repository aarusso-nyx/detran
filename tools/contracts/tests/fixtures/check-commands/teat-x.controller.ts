import { Controller, Get } from '@nestjs/common';

/**
 * Fixture controller named with the `teat-` prefix, for
 * `tools/contracts/tests/check-commands.test.mjs` (C-5-14): when
 * `controllerRoots` resolves to `backend/app/src` (CLI `cwd` trick, see
 * `appSrcCliScenario` in the test file), `check-commands.mjs` §3.2 rule 4
 * only scans `backend/app/src/teat-*.controller.ts` — this file must be
 * scanned.
 */
@Controller('v1/demo/app')
export class TeatXController {
  @Get('teat-only-route')
  teatOnly(): { ok: boolean } {
    return { ok: true };
  }
}
