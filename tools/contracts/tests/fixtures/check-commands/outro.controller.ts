import { Controller, Get } from '@nestjs/common';

/**
 * Fixture controller WITHOUT the `teat-` prefix, for
 * `tools/contracts/tests/check-commands.test.mjs` (C-5-14): when
 * `controllerRoots` resolves to `backend/app/src`, `check-commands.mjs` §3.2
 * rule 4 only scans files whose basename starts with `teat-` — this file
 * must be ignored, even though it is a `.controller.ts` under the same root.
 */
@Controller('v1/demo/app')
export class OutroController {
  @Get('outro-only-route')
  outroOnly(): { ok: boolean } {
    return { ok: true };
  }
}
