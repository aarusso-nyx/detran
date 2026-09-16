import { Controller, Post } from '@nestjs/common';

/**
 * Fixture controller whose filename contains `.spec.` (excluded by
 * `check-commands.mjs` §3.2 regra 2 — "não contém `.spec.`"), for
 * `tools/contracts/tests/check-commands.test.mjs` (C-5-13). If this file were
 * scanned, its route would have no matching operation and the gate would
 * report `missing-operation`.
 */
@Controller('v1/demo/items')
export class DemoItemsSpecController {
  @Post(':id/never-scanned-spec-file')
  neverScanned(): { id: string } {
    return { id: 'fixture' };
  }
}
