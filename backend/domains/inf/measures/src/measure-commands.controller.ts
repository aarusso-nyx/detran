// CTG-0004 §4, §12 (R-0008, TASK-0009) — controlador de comandos de medidas
// administrativas. Delega aos comandos manuscritos (`handwritten/*.command.ts`)
// via `MeasureCommands` (`handwritten/measure-lifecycle.provider.ts`).
import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import type { CancelMeasureInput } from './handwritten/cancel-measure.command.js';
import type { ConcludeMeasureInput } from './handwritten/conclude-measure.command.js';
import type { IssueTermInput } from './handwritten/issue-term.command.js';
import { MeasureCommands } from './handwritten/measure-lifecycle.provider.js';
import type { RecordInventoryInput } from './handwritten/record-inventory.command.js';
import type { RecordRemovalInput } from './handwritten/record-removal.command.js';
import type { RecordRetentionInput } from './handwritten/record-retention.command.js';
import type { ReleaseRetentionInput } from './handwritten/release-retention.command.js';
import type { StartMeasureInput } from './handwritten/start-measure.command.js';

@Controller('v1/inf/measures/administrative-measures')
@Resource('inf:administrative-measure')
export class MeasureCommandsController {
  constructor(private readonly commands: MeasureCommands) {}

  @Post(':id/start')
  @HttpCode(200)
  @Action('start')
  @Audit({ action: 'INF_MEASURE_START', entity: 'inf.administrative_measure' })
  start(@Param('id') id: string, @Body() body: StartMeasureInput = {}) {
    return this.commands.start.execute(id, body);
  }

  @Post(':id/retentions')
  @Action('register-retention')
  @Audit({ action: 'INF_MEASURE_RETENTION', entity: 'inf.measure_retention' })
  retention(@Param('id') id: string, @Body() body: RecordRetentionInput) {
    return this.commands.registerRetention.execute(id, body);
  }

  @Post(':id/removals')
  @Action('register-removal')
  @Audit({ action: 'INF_MEASURE_REMOVAL', entity: 'inf.measure_removal' })
  removal(@Param('id') id: string, @Body() body: RecordRemovalInput) {
    return this.commands.registerRemoval.execute(id, body);
  }

  @Post(':id/inventories')
  @Action('inventory-vehicle')
  @Audit({ action: 'INF_MEASURE_INVENTORY', entity: 'inf.vehicle_inventory' })
  inventory(@Param('id') id: string, @Body() body: RecordInventoryInput) {
    return this.commands.inventoryVehicle.execute(id, body);
  }

  @Post(':id/terms')
  @Action('apply-term')
  @Audit({ action: 'INF_MEASURE_TERM', entity: 'inf.administrative_term' })
  term(@Param('id') id: string, @Body() body: IssueTermInput) {
    return this.commands.applyTerm.execute(id, body);
  }

  @Post(':id/conclude')
  @HttpCode(200)
  @Action('conclude')
  @Audit({
    action: 'INF_MEASURE_CONCLUDE',
    entity: 'inf.administrative_measure',
  })
  conclude(@Param('id') id: string, @Body() body: ConcludeMeasureInput = {}) {
    return this.commands.conclude.execute(id, body);
  }

  @Post(':id/cancel')
  @Action('cancel')
  @Audit({ action: 'INF_MEASURE_CANCEL', entity: 'inf.administrative_measure' })
  cancel(@Param('id') id: string, @Body() body: CancelMeasureInput) {
    return this.commands.cancel.execute(id, body);
  }
}

/**
 * CTG-0004 §4.6: `POST /v1/inf/measures/retentions/{id}/release` tem base de
 * rota distinta (`retentions`, não `administrative-measures`) — controlador
 * próprio, senão o prefixo de classe de `MeasureCommandsController` monta
 * `.../administrative-measures/retentions/:id/release` (404 real, achado do
 * e2e `teat-measures-alcohol.e2e.spec.ts` C-0004-37).
 */
@Controller('v1/inf/measures/retentions')
@Resource('inf:administrative-measure')
export class MeasureRetentionCommandsController {
  constructor(private readonly commands: MeasureCommands) {}

  @Post(':id/release')
  @HttpCode(200)
  @Action('release')
  @Audit({ action: 'INF_MEASURE_RELEASE', entity: 'inf.measure_retention' })
  release(@Param('id') id: string, @Body() body: ReleaseRetentionInput = {}) {
    return this.commands.release.execute(id, body);
  }
}
