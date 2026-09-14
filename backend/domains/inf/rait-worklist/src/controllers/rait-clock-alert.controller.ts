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
import type { CreateRaitClockAlertDto } from '../dto/create-rait-clock-alert.dto.js';
import { RaitClockAlertService } from '../services/rait-clock-alert.service.js';

@Controller('v1/inf/rait/clock-alerts')
@Resource('inf:rait-clock-alert')
export class RaitClockAlertController {
  constructor(private readonly service: RaitClockAlertService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_CLOCK_ALERT_CREATE',
    entity: 'inf.rait_clock_alert',
  })
  create(@Body() dto: CreateRaitClockAlertDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_CLOCK_ALERT_UPDATE',
    entity: 'inf.rait_clock_alert',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitClockAlertDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_CLOCK_ALERT_DELETE',
    entity: 'inf.rait_clock_alert',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
