import { Controller, Post } from '@nestjs/common';

/**
 * Fixture controller with two route handlers, for
 * `tools/contracts/tests/check-commands.test.mjs` (duplicate-operation-id
 * case: both routes must resolve so the only problem left is the id clash).
 */
@Controller('v1/demo/items')
export class DemoItemsTwoRoutesController {
  @Post(':id/finalize')
  finalize(): { id: string } {
    return { id: 'fixture' };
  }

  @Post(':id/other')
  other(): { id: string } {
    return { id: 'fixture' };
  }
}
