import { Body, Controller, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import { AlcoholLifecycleService } from './alcohol-lifecycle.service.js';

@Controller('v1/inf/alcohol/procedures')
@Resource('inf:alcohol-procedure')
export class AlcoholCommandsController {
  constructor(private readonly lifecycle: AlcoholLifecycleService) {}
  @Post(':id/start')
  @Action('start')
  @Audit({ action: 'INF_ALCOHOL_START', entity: 'inf.alcohol_procedure' })
  start(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.lifecycle.start(id, body.reason);
  }
  @Post(':id/tests')
  @Action('record-test')
  @Audit({ action: 'INF_ALCOHOL_TEST', entity: 'inf.alcohol_test' })
  test(
    @Param('id') id: string,
    @Body() body: Parameters<AlcoholLifecycleService['recordTest']>[1],
  ) {
    return this.lifecycle.recordTest(id, body);
  }
  @Post(':id/refusals')
  @Action('record-refusal')
  @Audit({ action: 'INF_ALCOHOL_REFUSAL', entity: 'inf.alcohol_refusal' })
  refusal(
    @Param('id') id: string,
    @Body() body: Parameters<AlcoholLifecycleService['recordRefusal']>[1],
  ) {
    return this.lifecycle.recordRefusal(id, body);
  }
  @Post(':id/psychomotor-signs')
  @Action('record-psychomotor-signs')
  @Audit({
    action: 'INF_ALCOHOL_SIGNS',
    entity: 'inf.alcohol_psychomotor_sign',
  })
  signs(
    @Param('id') id: string,
    @Body()
    body: { signs: Parameters<AlcoholLifecycleService['recordSigns']>[1] },
  ) {
    return this.lifecycle.recordSigns(id, body.signs);
  }
  @Post(':id/forward')
  @Action('forward')
  @Audit({ action: 'INF_ALCOHOL_FORWARD', entity: 'inf.alcohol_forwarding' })
  forward(
    @Param('id') id: string,
    @Body() body: Parameters<AlcoholLifecycleService['forward']>[1],
  ) {
    return this.lifecycle.forward(id, body);
  }
  @Post(':id/close')
  @Action('close')
  @Audit({ action: 'INF_ALCOHOL_CLOSE', entity: 'inf.alcohol_procedure' })
  close(@Param('id') id: string, @Body() body: { outcome?: string }) {
    return this.lifecycle.close(id, body.outcome);
  }
}
