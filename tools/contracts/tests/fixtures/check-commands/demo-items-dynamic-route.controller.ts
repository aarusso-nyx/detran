import { Controller, Post } from '@nestjs/common';

const DYNAMIC_ROUTE = ':id/dynamic';

/**
 * Fixture controller whose route decorator argument is not a string literal,
 * for `tools/contracts/tests/check-commands.test.mjs` (C-5-15):
 * `check-commands.mjs` §3.2 must fail-closed with an `invalid-json` problem
 * citing the class and method, instead of silently skipping the route.
 */
@Controller('v1/demo/items')
export class DemoItemsDynamicRouteController {
  @Post(DYNAMIC_ROUTE)
  dynamic(): { id: string } {
    return { id: 'fixture' };
  }
}
