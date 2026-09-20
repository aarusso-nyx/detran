import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import { RaitCaseCommandService } from './rait-case-command.service.js';

type Response = { setHeader(name: string, value: string): unknown };
type AuthenticatedRequest = {
  principal?: {
    id: string;
    roles: string[];
    permissions: string[];
    tenants: string[];
  };
};
type Args = [
  string,
  Record<string, unknown>,
  string | undefined,
  string | undefined,
  Response,
];

@Controller('v1/inf/rait')
@Resource('inf:rait-case')
export class RaitCaseCommandsController {
  constructor(private readonly service: RaitCaseCommandService) {}

  @Post('cases')
  @HttpCode(200)
  @Action('protocol')
  @Audit({ action: 'INF_RAIT_CASE_PROTOCOL', entity: 'inf.rait_case' })
  protocol(
    @Body() body: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service
      .protocol({
        payload: body,
        headers: { 'Idempotency-Key': key ?? '' },
        principal: request.principal,
      })
      .then((result) => {
        response.setHeader('ETag', result.etag);
        return { data: result.data, events: result.events };
      });
  }

  private run(command: string, [id, body, match, key, response]: Args) {
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
  @Post('cases/:id/commands/admit')
  @HttpCode(200)
  @Action('admit')
  @Audit({ action: 'INF_RAIT_CASE_ADMIT', entity: 'inf.rait_case' })
  admit(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('admit', [id, body, match, key, response]);
  }
  @Post('cases/:id/commands/non-admission')
  @HttpCode(200)
  @Action('reject')
  @Audit({ action: 'INF_RAIT_CASE_REJECT', entity: 'inf.rait_case' })
  nonAdmission(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('non-admission', [id, body, match, key, response]);
  }
  @Post('cases/:id/commands/remit')
  @HttpCode(200)
  @Action('remit-jari')
  @Audit({ action: 'INF_RAIT_CASE_REMIT', entity: 'inf.rait_case' })
  remit(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('remit', [id, body, match, key, response]);
  }
  @Post('cases/:id/commands/receive')
  @HttpCode(200)
  @Action('receive-judging-body')
  @Audit({ action: 'INF_RAIT_CASE_RECEIVE', entity: 'inf.rait_case' })
  receive(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('receive', [id, body, match, key, response]);
  }
  @Post('cases/:id/commands/ready')
  @HttpCode(200)
  @Action('submit-draft')
  @Audit({ action: 'INF_RAIT_CASE_READY', entity: 'inf.rait_case' })
  ready(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('ready', [id, body, match, key, response]);
  }
  @Post('cases/:id/commands/decide')
  @HttpCode(200)
  @Resource('inf:rait-decision')
  @Action('sign')
  @Audit({ action: 'INF_RAIT_DECISION_SIGN', entity: 'inf.rait_decision' })
  decide(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('decide', [id, body, match, key, response]);
  }
  @Post('cases/:id/commands/return-draft')
  @HttpCode(200)
  @Resource('inf:rait-decision')
  @Action('return-draft')
  @Audit({ action: 'INF_RAIT_DECISION_RETURN_DRAFT', entity: 'inf.rait_draft' })
  returnDraft(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('return-draft', [id, body, match, key, response]);
  }
  @Post('cases/:id/commands/withdraw')
  @HttpCode(200)
  @Action('withdraw')
  @Audit({ action: 'INF_RAIT_CASE_WITHDRAW', entity: 'inf.rait_case' })
  withdraw(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('withdraw', [id, body, match, key, response]);
  }
  @Post('cases/:id/commands/redirect')
  @HttpCode(200)
  @Action('redirect')
  @Audit({ action: 'INF_RAIT_CASE_REDIRECT', entity: 'inf.rait_redirect' })
  redirect(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('redirect', [id, body, match, key, response]);
  }
  @Post('cases/:id/commands/resolve-pending')
  @HttpCode(200)
  @Action('resolve-pending-content')
  @Audit({
    action: 'INF_RAIT_CASE_RESOLVE_PENDING_CONTENT',
    entity: 'inf.rait_pending_content',
  })
  resolvePending(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('resolve-pending', [id, body, match, key, response]);
  }
  @Post('pools/:id/claim-next')
  @HttpCode(200)
  @Action('claim-next')
  @Audit({ action: 'INF_RAIT_CASE_CLAIM_NEXT', entity: 'inf.rait_case' })
  claimNext(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('if-match') match: string | undefined,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('claim-next', [id, body, match, key, response]);
  }
}
