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
import type { CreateRaitScheduleSlotDto } from '../dto/create-rait-schedule-slot.dto.js';
import { RaitScheduleSlotService } from '../services/rait-schedule-slot.service.js';

@Controller('v1/inf/rait/schedule-slots')
@Resource('inf:rait-schedule-slot')
export class RaitScheduleSlotController {
  constructor(private readonly service: RaitScheduleSlotService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_SCHEDULE_SLOT_CREATE',
    entity: 'inf.rait_schedule_slot',
  })
  create(@Body() dto: CreateRaitScheduleSlotDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_SCHEDULE_SLOT_UPDATE',
    entity: 'inf.rait_schedule_slot',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitScheduleSlotDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_SCHEDULE_SLOT_DELETE',
    entity: 'inf.rait_schedule_slot',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
