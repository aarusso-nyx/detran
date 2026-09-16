// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:c35fb9b7cf739cf06c18b8cc02b1ec4cd968c63916ffd149c79d29937faa2c67
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import type { CreateNumberingReservationDto } from '../dto/create-numbering-reservation.dto.js';
import { NumberingReservationService } from '../services/numbering-reservation.service.js';

@Controller('v1/ops/offline-sync/numbering-reservations')
@Resource('ops:numbering-reservation')
export class NumberingReservationController {
  constructor(private readonly service: NumberingReservationService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_NUMBERING_RESERVATION_CREATE',
    entity: 'ops.numbering_reservation',
  })
  create(@Body() dto: CreateNumberingReservationDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_NUMBERING_RESERVATION_UPDATE',
    entity: 'ops.numbering_reservation',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateNumberingReservationDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_NUMBERING_RESERVATION_DELETE',
    entity: 'ops.numbering_reservation',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
