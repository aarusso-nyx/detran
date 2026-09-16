import { Controller } from '@nestjs/common';

/**
 * Fixture controller with no route handlers, for
 * `tools/contracts/tests/check-commands.test.mjs` (cases that must isolate a
 * single problem kind by contributing zero scanned routes).
 */
@Controller('v1/demo/items')
export class DemoItemsEmptyController {}
