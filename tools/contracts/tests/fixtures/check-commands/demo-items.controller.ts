import { Controller, Post } from '@nestjs/common';

/**
 * Fixture controller for `tools/contracts/tests/check-commands.test.mjs`.
 * Mirrors the shape of a real handwritten commands controller (one
 * `@Controller` base plus one `@Post` route) but is never imported at
 * runtime — `check-commands.mjs` only parses it as TypeScript source, the
 * same technique as `tools/verify-controller-decorators.ts`.
 */
@Controller('v1/demo/items')
export class DemoItemsCommandsController {
  @Post(':id/finalize')
  finalize(): { id: string } {
    return { id: 'fixture' };
  }
}
