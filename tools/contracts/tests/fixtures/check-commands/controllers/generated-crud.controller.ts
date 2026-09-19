import { Controller, Post } from '@nestjs/common';

/**
 * Fixture controller under a `controllers/` directory (CRUD gerado, podado
 * por `check-commands.mjs` §3.2 regra 3), for
 * `tools/contracts/tests/check-commands.test.mjs` (C-5-13). If this file were
 * scanned, its route would have no matching operation and the gate would
 * report `missing-operation`.
 */
@Controller('v1/demo/items')
export class GeneratedCrudController {
  @Post(':id/never-scanned-controllers-dir')
  neverScanned(): { id: string } {
    return { id: 'fixture' };
  }
}
