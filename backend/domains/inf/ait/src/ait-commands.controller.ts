import { Body, Controller, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import type { CreateAitCorrectionDto } from './dto/create-ait-correction.dto.js';
import type { CreateAitPersonDto } from './dto/create-ait-person.dto.js';
import type { CreateAitPrintEventDto } from './dto/create-ait-print-event.dto.js';
import type { CreateAitSignatureDto } from './dto/create-ait-signature.dto.js';
import type { CreateAitVehicleDto } from './dto/create-ait-vehicle.dto.js';
import { AitLifecycleService } from './ait-lifecycle.service.js';

@Controller('v1/inf/ait/aits')
@Resource('inf:ait')
export class AitCommandsController {
  constructor(private readonly lifecycle: AitLifecycleService) {}

  @Post(':id/vehicles')
  @Action('update')
  @Audit({ action: 'INF_AIT_VEHICLE_ADD', entity: 'inf.ait_vehicle' })
  vehicle(
    @Param('id') id: string,
    @Body() dto: Omit<CreateAitVehicleDto, 'ait_id'>,
  ) {
    return this.lifecycle.addVehicle(id, dto);
  }
  @Post(':id/people')
  @Action('update')
  @Audit({ action: 'INF_AIT_PERSON_ADD', entity: 'inf.ait_person' })
  person(
    @Param('id') id: string,
    @Body() dto: Omit<CreateAitPersonDto, 'ait_id'>,
  ) {
    return this.lifecycle.addPerson(id, dto);
  }
  @Post(':id/science')
  @Action('science')
  @Audit({ action: 'INF_AIT_SCIENCE', entity: 'inf.ait_signature' })
  science(
    @Param('id') id: string,
    @Body() dto: Omit<CreateAitSignatureDto, 'ait_id'>,
  ) {
    return this.lifecycle.recordScience(id, dto);
  }
  @Post(':id/print-events')
  @Action('update')
  @Audit({ action: 'INF_AIT_PRINT', entity: 'inf.ait_print_event' })
  print(
    @Param('id') id: string,
    @Body() dto: Omit<CreateAitPrintEventDto, 'ait_id'>,
  ) {
    return this.lifecycle.recordPrint(id, dto);
  }
  @Post(':id/finalize')
  @Action('finalize')
  @Audit({ action: 'INF_AIT_FINALIZE', entity: 'inf.ait_ait' })
  finalize(@Param('id') id: string, @Body() body: { user_ref?: string }) {
    return this.lifecycle.finalize(id, body.user_ref);
  }
  @Post(':id/queue-transmission')
  @Action('queue-transmission')
  @Audit({ action: 'INF_AIT_QUEUE', entity: 'inf.ait_ait' })
  queue(@Param('id') id: string, @Body() body: { user_ref?: string }) {
    return this.lifecycle.queueTransmission(id, body.user_ref);
  }
  @Post(':id/receive-protocol')
  @Action('receive-protocol')
  @Audit({ action: 'INF_AIT_PROTOCOL', entity: 'inf.ait_ait' })
  protocol(
    @Param('id') id: string,
    @Body() body: { receipt_protocol: string; user_ref?: string },
  ) {
    return this.lifecycle.receiveProtocol(
      id,
      body.receipt_protocol,
      body.user_ref,
    );
  }
  @Post(':id/request-correction')
  @Action('request-correction')
  @Audit({ action: 'INF_AIT_CORRECTION_REQUEST', entity: 'inf.ait_ait' })
  requestCorrection(
    @Param('id') id: string,
    @Body() body: { reason: string; user_ref?: string },
  ) {
    return this.lifecycle.requestCorrection(id, body.reason, body.user_ref);
  }
  @Post(':id/corrections')
  @Action('update')
  @Audit({ action: 'INF_AIT_CORRECTION_ADD', entity: 'inf.ait_correction' })
  correction(
    @Param('id') id: string,
    @Body() dto: Omit<CreateAitCorrectionDto, 'ait_id'>,
  ) {
    return this.lifecycle.addCorrection(id, dto);
  }
  @Post(':id/corrections/:correctionId/approve')
  @Action('approve-correction')
  @Audit({ action: 'INF_AIT_CORRECTION_APPROVE', entity: 'inf.ait_correction' })
  approve(
    @Param('id') id: string,
    @Param('correctionId') correctionId: string,
    @Body() body: { approved_by_user_ref: string },
  ) {
    return this.lifecycle.approveCorrection(
      id,
      correctionId,
      body.approved_by_user_ref,
    );
  }
  @Post(':id/accept')
  @Action('accept')
  @Audit({ action: 'INF_AIT_ACCEPT', entity: 'inf.ait_ait' })
  accept(@Param('id') id: string, @Body() body: { user_ref?: string }) {
    return this.lifecycle.accept(id, body.user_ref);
  }
  @Post(':id/reject')
  @Action('reject')
  @Audit({ action: 'INF_AIT_REJECT', entity: 'inf.ait_ait' })
  reject(
    @Param('id') id: string,
    @Body() body: { reason: string; user_ref?: string },
  ) {
    return this.lifecycle.reject(id, body.reason, body.user_ref);
  }
}
