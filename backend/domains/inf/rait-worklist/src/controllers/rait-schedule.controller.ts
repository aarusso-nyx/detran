// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
import type { CreateRaitScheduleDto } from '../dto/create-rait-schedule.dto.js';
import { RaitScheduleService } from '../services/rait-schedule.service.js';

@Controller('v1/inf/rait/schedules')
@Resource('inf:rait-schedule')
export class RaitScheduleController {
  constructor(private readonly service: RaitScheduleService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_SCHEDULE_CREATE', entity: 'inf.rait_schedule' })
  create(@Body() dto: CreateRaitScheduleDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_SCHEDULE_UPDATE', entity: 'inf.rait_schedule' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitScheduleDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_SCHEDULE_DELETE', entity: 'inf.rait_schedule' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
