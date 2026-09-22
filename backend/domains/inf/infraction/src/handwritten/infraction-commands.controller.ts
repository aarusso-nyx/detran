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

import {
  InfractionCommandService,
  type InfractionCommand,
} from './infraction-command.service.js';

type Response = { setHeader(name: string, value: string): unknown };
type Args = [
  string,
  Record<string, unknown>,
  string | undefined,
  string | undefined,
  Response,
];

@Controller('v1/inf/infraction/infractions')
@Resource('inf:rait-infraction')
export class InfractionCommandsController {
  constructor(private readonly service: InfractionCommandService) {}

  private run(
    command: InfractionCommand,
    [id, body, match, key, response]: Args,
  ) {
    return this.service
      .execute({
        command,
        infractionId: id,
        payload: body,
        ifMatch: match,
        idempotencyKey: key,
      })
      .then((result) => {
        response.setHeader('ETag', result.etag);
        return { data: result.data, events: result.events };
      });
  }

  @Post(':id/commands/issue-notice')
  @HttpCode(200)
  @Resource('inf:rait-notice')
  @Action('issue')
  @Audit({ action: 'INF_INFRACTION_ISSUE_NOTICE', entity: 'inf.infraction' })
  issueNotice(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('issue-notice', [id, body, match, key, response]);
  }

  @Post(':id/commands/indicate-driver')
  @HttpCode(200)
  @Action('indicate-driver')
  @Audit({ action: 'INF_INFRACTION_INDICATE_DRIVER', entity: 'inf.infraction' })
  indicateDriver(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('indicate-driver', [id, body, match, key, response]);
  }

  @Post(':id/commands/declare-extinction')
  @HttpCode(200)
  @Resource('inf:rait-extinction')
  @Action('declare')
  @Audit({
    action: 'INF_INFRACTION_DECLARE_EXTINCTION',
    entity: 'inf.infraction',
  })
  declareExtinction(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('declare-extinction', [id, body, match, key, response]);
  }

  @Post(':id/commands/authority-appeal')
  @HttpCode(200)
  @Resource('inf:rait-appeal')
  @Action('authority-decide')
  @Audit({
    action: 'INF_INFRACTION_AUTHORITY_APPEAL',
    entity: 'inf.infraction',
  })
  authorityAppeal(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('authority-appeal', [id, body, match, key, response]);
  }

  @Post(':id/commands/waive-appeal')
  @HttpCode(200)
  @Resource('inf:rait-appeal')
  @Action('waive')
  @Audit({ action: 'INF_INFRACTION_WAIVE_APPEAL', entity: 'inf.infraction' })
  waiveAppeal(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('waive-appeal', [id, body, match, key, response]);
  }
}
