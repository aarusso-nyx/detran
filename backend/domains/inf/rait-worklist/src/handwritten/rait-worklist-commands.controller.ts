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

import { RaitWorklistCommandService } from './rait-worklist-command.service.js';

type Response = { setHeader(name: string, value: string): unknown };

@Controller('v1/inf/rait')
@Resource('inf:rait-batch')
export class RaitWorklistCommandsController {
  constructor(private readonly service: RaitWorklistCommandService) {}

  @Post('schedules')
  @HttpCode(201)
  @Resource('inf:rait-schedule')
  @Action('create')
  @Audit({ action: 'INF_RAIT_SCHEDULE_CREATE', entity: 'inf.rait_schedule' })
  createSchedule(
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run(
      'create-schedule',
      'schedule',
      payload,
      key,
      undefined,
      response,
    );
  }

  @Post('schedules/:id/publish')
  @HttpCode(200)
  @Resource('inf:rait-schedule')
  @Action('publish')
  @Audit({ action: 'INF_RAIT_SCHEDULE_PUBLISH', entity: 'inf.rait_schedule' })
  publishSchedule(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('publish-schedule', id, payload, key, match, response);
  }

  @Post('batches')
  @HttpCode(201)
  @Resource('inf:rait-batch')
  @Action('create')
  @Audit({ action: 'INF_RAIT_BATCH_CREATE', entity: 'inf.rait_batch' })
  createBatch(
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('create-batch', 'batch', payload, key, undefined, response);
  }

  @Post('batches/:id/approve')
  @HttpCode(200)
  @Resource('inf:rait-batch')
  @Action('approve')
  @Audit({ action: 'INF_RAIT_BATCH_APPROVE', entity: 'inf.rait_batch' })
  approveBatch(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('approve-batch', id, payload, key, match, response);
  }

  @Post('batches/:id/items/:caseId/accept')
  @HttpCode(200)
  @Resource('inf:rait-batch-item')
  @Action('accept')
  @Audit({
    action: 'INF_RAIT_BATCH_ITEM_ACCEPT',
    entity: 'inf.rait_batch_item',
  })
  acceptBatchItem(
    @Param('id') id: string,
    @Param('caseId') caseId: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run(
      'accept-batch-item',
      id,
      { ...payload, caseId },
      key,
      match,
      response,
    );
  }

  @Post('batches/:id/items/:caseId/impediment')
  @HttpCode(200)
  @Resource('inf:rait-batch-item')
  @Action('impediment')
  @Audit({
    action: 'INF_RAIT_BATCH_ITEM_IMPEDIMENT',
    entity: 'inf.rait_batch_item',
  })
  declareBatchItemImpediment(
    @Param('id') id: string,
    @Param('caseId') caseId: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run(
      'declare-batch-item-impediment',
      id,
      { ...payload, caseId },
      key,
      match,
      response,
    );
  }

  @Post('batches/:id/commands/draw')
  @HttpCode(200)
  @Action('draw')
  @Audit({ action: 'INF_RAIT_BATCH_DRAW', entity: 'inf.rait_batch' })
  draw(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('draw', id, payload, key, undefined, response);
  }

  @Post('assignments/:id/commands/reassign')
  @HttpCode(200)
  @Resource('inf:rait-assignment')
  @Action('reassign')
  @Audit({
    action: 'INF_RAIT_ASSIGNMENT_REASSIGN',
    entity: 'inf.rait_assignment',
  })
  reassign(
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') key: string | undefined,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.run('reassign', id, payload, key, match, response);
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
