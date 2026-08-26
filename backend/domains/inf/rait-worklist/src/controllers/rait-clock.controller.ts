// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:a4378f112c84361ebe923b17329c2848218c3f266f9811c1b18090d9c79f0ee1
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
import type { CreateRaitClockDto } from '../dto/create-rait-clock.dto.js';
import { RaitClockService } from '../services/rait-clock.service.js';

@Controller('v1/inf/raitclocks')
@Resource('inf:rait-clock')
export class RaitClockController {
  constructor(private readonly service: RaitClockService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_CLOCK_CREATE', entity: 'inf.rait_clock' })
  create(@Body() dto: CreateRaitClockDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_CLOCK_UPDATE', entity: 'inf.rait_clock' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitClockDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_CLOCK_DELETE', entity: 'inf.rait_clock' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
