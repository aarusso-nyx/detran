import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import { RaitInquiryCommandService } from './rait-inquiry-command.service.js';

type Response = { setHeader(name: string, value: string): unknown };

@Controller('v1/inf/rait')
@Resource('inf:rait-inquiry')
export class RaitInquiryCommandsController {
  constructor(private readonly service: RaitInquiryCommandService) {}
  private run(
    command: string,
    id: string,
    body: Record<string, unknown>,
    match: string | undefined,
    key: string | undefined,
    response: Response,
  ) {
    return this.service
      .execute({
        command,
        targetId: id,
        payload: body,
        headers: { 'If-Match': match ?? '', 'Idempotency-Key': key ?? '' },
      })
      .then((result) => {
        response.setHeader('ETag', result.etag);
        return { data: result.data, events: result.events };
      });
  }
  @Post('inquiries/:id/commands/answer')
  @HttpCode(200)
  @Resource('inf:rait-case')
  @Action('answer-inquiry')
  @Audit({ action: 'INF_RAIT_INQUIRY_ANSWER', entity: 'inf.rait_inquiry' })
  answer(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('answer', id, body, match, key, response);
  }
  @Post('inquiries/:id/commands/extend')
  @HttpCode(200)
  @Resource('inf:rait-case')
  @Action('extend-inquiry')
  @Audit({ action: 'INF_RAIT_INQUIRY_EXTEND', entity: 'inf.rait_inquiry' })
  extend(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('extend', id, body, match, key, response);
  }
  @Post('inquiries/:id/commands/expire')
  @HttpCode(200)
  @Action('expire')
  @Audit({ action: 'INF_RAIT_INQUIRY_EXPIRE', entity: 'inf.rait_inquiry' })
  expire(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('expire', id, body, match, key, response);
  }
}
