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

import { RaitSessionCommandService } from './rait-session-command.service.js';

type Response = { setHeader(name: string, value: string): unknown };

@Controller('v1/inf/rait')
@Resource('inf:rait-session')
export class RaitSessionCommandsController {
  constructor(private readonly service: RaitSessionCommandService) {}

  @Post('sessions/:id/commands/close-agenda')
  @HttpCode(200)
  @Action('close-agenda')
  @Audit({
    action: 'INF_RAIT_SESSION_CLOSE_AGENDA',
    entity: 'inf.rait_session',
  })
  closeAgenda(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('close-agenda', id, payload, key, match, response);
  }

  @Post('sessions/:id/commands/open')
  @HttpCode(200)
  @Action('open')
  @Audit({ action: 'INF_RAIT_SESSION_OPEN', entity: 'inf.rait_session' })
  open(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('open', id, payload, key, match, response);
  }

  @Post('sessions/:id/commands/adjourn')
  @HttpCode(200)
  @Action('adjourn')
  @Audit({ action: 'INF_RAIT_SESSION_ADJOURN', entity: 'inf.rait_session' })
  adjourn(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('adjourn', id, payload, key, match, response);
  }

  @Post('sessions/:id/commands/convene-extraordinary')
  @HttpCode(200)
  @Action('convene-extraordinary')
  @Audit({
    action: 'INF_RAIT_SESSION_CONVENE_EXTRAORDINARY',
    entity: 'inf.rait_session',
  })
  conveneExtraordinary(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('convene-extraordinary', id, payload, key, match, response);
  }

  @Post('agenda-items/:id/commands/read')
  @HttpCode(200)
  @Resource('inf:rait-agenda-item')
  @Action('read')
  @Audit({
    action: 'INF_RAIT_AGENDA_ITEM_READ',
    entity: 'inf.rait_agenda_item',
  })
  read(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('read', id, payload, key, match, response);
  }

  @Post('agenda-items/:id/commands/view')
  @HttpCode(200)
  @Resource('inf:rait-agenda-item')
  @Action('view')
  @Audit({
    action: 'INF_RAIT_AGENDA_ITEM_VIEW',
    entity: 'inf.rait_agenda_item',
  })
  view(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('view', id, payload, key, match, response);
  }

  @Post('agenda-items/:id/commands/withdraw')
  @HttpCode(200)
  @Resource('inf:rait-agenda-item')
  @Action('withdraw')
  @Audit({
    action: 'INF_RAIT_AGENDA_ITEM_WITHDRAW',
    entity: 'inf.rait_agenda_item',
  })
  withdraw(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('withdraw', id, payload, key, match, response);
  }

  @Post('votes')
  @HttpCode(200)
  @Resource('inf:rait-vote')
  @Action('create')
  @Audit({ action: 'INF_RAIT_VOTE_CREATE', entity: 'inf.rait_vote' })
  createVote(
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run(
      'vote',
      String(payload.agenda_item_id ?? ''),
      payload,
      key,
      match,
      response,
    );
  }

  @Post('agenda-items/:id/commands/proclaim')
  @HttpCode(200)
  @Resource('inf:rait-agenda-item')
  @Action('proclaim')
  @Audit({
    action: 'INF_RAIT_AGENDA_ITEM_PROCLAIM',
    entity: 'inf.rait_agenda_item',
  })
  proclaim(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('proclaim', id, payload, key, match, response);
  }

  @Post('minutes')
  @HttpCode(201)
  @Resource('inf:rait-minutes')
  @Action('create')
  @Audit({ action: 'INF_RAIT_MINUTES_CREATE', entity: 'inf.rait_minutes' })
  createMinutes(
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run(
      'generate-minutes',
      String(payload.session_id ?? ''),
      payload,
      key,
      match,
      response,
    );
  }

  @Post('minutes/:id/commands/sign')
  @HttpCode(200)
  @Resource('inf:rait-minutes')
  @Action('sign')
  @Audit({ action: 'INF_RAIT_MINUTES_SIGN', entity: 'inf.rait_minutes' })
  signMinutes(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('sign-minutes', id, payload, key, match, response);
  }

  @Post('minutes/:id/commands/publish')
  @HttpCode(200)
  @Resource('inf:rait-minutes')
  @Action('publish')
  @Audit({ action: 'INF_RAIT_MINUTES_PUBLISH', entity: 'inf.rait_minutes' })
  publish(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('publish', id, payload, key, match, response);
  }

  private run(
    command: string,
    targetId: string,
    payload: Record<string, unknown>,
    key: string | undefined,
    match: string | undefined,
    response: Response,
  ) {
    return this.service
      .execute({
        command,
        targetId,
        payload,
        headers: { 'Idempotency-Key': key ?? '', 'If-Match': match ?? '' },
      })
      .then((result) => {
        response.setHeader('ETag', result.etag);
        return { data: result.data, events: result.events };
      });
  }
}
