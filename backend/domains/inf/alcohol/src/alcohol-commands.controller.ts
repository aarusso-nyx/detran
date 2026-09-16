// CTG-0004 §5, §12 (R-0008, TASK-0009) — controlador de comandos de
// alcoolemia. Delega aos comandos manuscritos via `AlcoholCommands`
// (`handwritten/alcohol-lifecycle.provider.ts`). `forward` muda de
// `/:id/forward` para `/:id/forwardings` (route contract §6);
// `psychomotor-signs` passa a receber o DTO inteiro (§12).
import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import { AlcoholCommands } from './handwritten/alcohol-lifecycle.provider.js';
import type { CloseAlcoholProcedureInput } from './handwritten/close-procedure.command.js';
import type { RecordAlcoholForwardingInput } from './handwritten/forward-procedure.command.js';
import type { RecordAlcoholRefusalInput } from './handwritten/record-refusal.command.js';
import type { RecordPsychomotorSignsInput } from './handwritten/record-signs.command.js';
import type { RecordAlcoholTestInput } from './handwritten/record-test.command.js';
import type { StartProcedureInput } from './handwritten/start-procedure.command.js';

@Controller('v1/inf/alcohol/procedures')
@Resource('inf:alcohol-procedure')
export class AlcoholCommandsController {
  constructor(private readonly commands: AlcoholCommands) {}

  @Post(':id/start')
  @HttpCode(200)
  @Action('start')
  @Audit({ action: 'INF_ALCOHOL_START', entity: 'inf.alcohol_procedure' })
  start(@Param('id') id: string, @Body() body: StartProcedureInput = {}) {
    return this.commands.start.execute(id, body);
  }

  @Post(':id/tests')
  @Action('record-test')
  @Audit({ action: 'INF_ALCOHOL_TEST', entity: 'inf.alcohol_test' })
  test(@Param('id') id: string, @Body() body: RecordAlcoholTestInput) {
    return this.commands.recordTest.execute(id, body);
  }

  @Post(':id/refusals')
  @Action('record-refusal')
  @Audit({ action: 'INF_ALCOHOL_REFUSAL', entity: 'inf.alcohol_refusal' })
  refusal(@Param('id') id: string, @Body() body: RecordAlcoholRefusalInput) {
    return this.commands.recordRefusal.execute(id, body);
  }

  @Post(':id/psychomotor-signs')
  @Action('record-psychomotor-signs')
  @Audit({
    action: 'INF_ALCOHOL_SIGNS',
    entity: 'inf.alcohol_psychomotor_sign',
  })
  signs(@Param('id') id: string, @Body() body: RecordPsychomotorSignsInput) {
    return this.commands.recordSigns.execute(id, body);
  }

  @Post(':id/forwardings')
  @Action('forward')
  @Audit({ action: 'INF_ALCOHOL_FORWARD', entity: 'inf.alcohol_forwarding' })
  forward(@Param('id') id: string, @Body() body: RecordAlcoholForwardingInput) {
    return this.commands.forward.execute(id, body);
  }

  @Post(':id/close')
  @HttpCode(200)
  @Action('close')
  @Audit({ action: 'INF_ALCOHOL_CLOSE', entity: 'inf.alcohol_procedure' })
  close(
    @Param('id') id: string,
    @Body() body: CloseAlcoholProcedureInput = {},
  ) {
    return this.commands.close.execute(id, body);
  }
}
