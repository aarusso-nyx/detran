import { Body, Controller, Headers, HttpCode, Post, Res } from '@nestjs/common';
import { Action, Audit, NoIdempotent, Resource } from '@detran/shared';
import { RaitAdmissibilityCommandService } from './rait-admissibility-command.service.js';

type Response = { setHeader(name: string, value: string): unknown };

@Controller('v1/inf/rait/admissibility')
@Resource('inf:rait-admissibility')
export class RaitAdmissibilityCommandsController {
  constructor(private readonly service: RaitAdmissibilityCommandService) {}

  @Post()
  @HttpCode(200)
  @Action('create')
  @NoIdempotent()
  @Audit({
    transactional: true,
    action: 'INF_RAIT_ADMISSIBILITY_CREATE',
    entity: 'inf.rait_admissibility',
  })
  create(
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.service
      .execute({
        payload: body,
        headers: { 'If-Match': match ?? '', 'Idempotency-Key': key ?? '' },
      })
      .then((result) => {
        response.setHeader('ETag', result.etag);
        return { data: result.data, events: result.events };
      });
  }
}
