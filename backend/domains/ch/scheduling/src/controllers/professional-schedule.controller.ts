// Generated from BP-CH-SCHEDULING-001 v1.0.0 sha256:fdbac09747b1d01ea1aa90821a792d537064443364d6a193ca6df5575d591513
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
import type { CreateProfessionalScheduleDto } from '../dto/create-professional-schedule.dto.js';
import { ProfessionalScheduleService } from '../services/professional-schedule.service.js';

@Controller('v1/ch/scheduling/professional-schedules')
@Resource('ch:schedule')
export class ProfessionalScheduleController {
  constructor(private readonly service: ProfessionalScheduleService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'CH_PROFESSIONAL_SCHEDULE_CREATE',
    entity: 'ch.professional_schedule',
  })
  create(@Body() dto: CreateProfessionalScheduleDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'CH_PROFESSIONAL_SCHEDULE_UPDATE',
    entity: 'ch.professional_schedule',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProfessionalScheduleDto>,
  ) {
    return this.service.update(id, dto);
  }
}
