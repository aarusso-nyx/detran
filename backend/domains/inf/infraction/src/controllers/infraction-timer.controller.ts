// Generated from BP-INF-INFRACTION-001 v1.1.2 sha256:59e421dbbb90b291b45408217601e9d6a86b992d9c75c00e5f73b17c5b2e21dd
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
import type { CreateInfractionTimerDto } from '../dto/create-infraction-timer.dto.js';
import { InfractionTimerService } from '../services/infraction-timer.service.js';

@Controller('v1/inf/infraction/timers')
@Resource('inf:infraction-timer')
export class InfractionTimerController {
  constructor(private readonly service: InfractionTimerService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_INFRACTION_TIMER_CREATE',
    entity: 'inf.infraction_timer',
  })
  create(@Body() dto: CreateInfractionTimerDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_INFRACTION_TIMER_UPDATE',
    entity: 'inf.infraction_timer',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateInfractionTimerDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_INFRACTION_TIMER_DELETE',
    entity: 'inf.infraction_timer',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
