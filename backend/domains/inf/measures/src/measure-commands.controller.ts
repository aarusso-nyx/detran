import { Body, Controller, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import { MeasureLifecycleService } from './measure-lifecycle.service.js';

@Controller('v1/inf/measures/administrative-measures')
@Resource('inf:administrative-measure')
export class MeasureCommandsController {
  constructor(private readonly lifecycle: MeasureLifecycleService) {}
  @Post(':id/start')
  @Action('start')
  @Audit({ action: 'INF_MEASURE_START', entity: 'inf.administrative_measure' })
  start(@Param('id') id: string, @Body() body: { user_ref?: string }) {
    return this.lifecycle.start(id, body.user_ref);
  }
  @Post(':id/terms')
  @Action('apply-term')
  @Audit({ action: 'INF_MEASURE_TERM', entity: 'inf.administrative_term' })
  term(
    @Param('id') id: string,
    @Body() body: Parameters<MeasureLifecycleService['issueTerm']>[1],
  ) {
    return this.lifecycle.issueTerm(id, body);
  }
  @Post(':id/retentions')
  @Action('register-retention')
  @Audit({ action: 'INF_MEASURE_RETENTION', entity: 'inf.measure_retention' })
  retention(
    @Param('id') id: string,
    @Body() body: Parameters<MeasureLifecycleService['recordRetention']>[1],
  ) {
    return this.lifecycle.recordRetention(id, body);
  }
  @Post(':id/removals')
  @Action('register-removal')
  @Audit({ action: 'INF_MEASURE_REMOVAL', entity: 'inf.measure_removal' })
  removal(
    @Param('id') id: string,
    @Body() body: Parameters<MeasureLifecycleService['recordRemoval']>[1],
  ) {
    return this.lifecycle.recordRemoval(id, body);
  }
  @Post(':id/inventories')
  @Action('inventory-vehicle')
  @Audit({ action: 'INF_MEASURE_INVENTORY', entity: 'inf.vehicle_inventory' })
  inventory(
    @Param('id') id: string,
    @Body() body: Parameters<MeasureLifecycleService['recordInventory']>[1],
  ) {
    return this.lifecycle.recordInventory(id, body);
  }
  @Post('retentions/:id/release')
  @Action('release')
  @Audit({ action: 'INF_MEASURE_RELEASE', entity: 'inf.measure_retention' })
  release(@Param('id') id: string, @Body() body: { user_ref?: string }) {
    return this.lifecycle.release(id, body.user_ref);
  }
  @Post(':id/conclude')
  @Action('conclude')
  @Audit({
    action: 'INF_MEASURE_CONCLUDE',
    entity: 'inf.administrative_measure',
  })
  conclude(@Param('id') id: string, @Body() body: { user_ref?: string }) {
    return this.lifecycle.conclude(id, body.user_ref);
  }
  @Post(':id/cancel')
  @Action('cancel')
  @Audit({ action: 'INF_MEASURE_CANCEL', entity: 'inf.administrative_measure' })
  cancel(
    @Param('id') id: string,
    @Body() body: { reason: string; user_ref?: string },
  ) {
    return this.lifecycle.cancel(id, body.reason, body.user_ref);
  }
}
