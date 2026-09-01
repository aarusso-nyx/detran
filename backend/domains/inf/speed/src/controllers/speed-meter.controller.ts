// Generated from BP-INF-SPEED-001 v1.0.0 sha256:621c9dd37f71bc7fbb14a32b3df72d186e5f6f5d513de297d5559c3ac37ae44e
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
import type { CreateSpeedMeterDto } from '../dto/create-speed-meter.dto.js';
import { SpeedMeterService } from '../services/speed-meter.service.js';

@Controller('v1/inf/speed/meters')
@Resource('inf:speed-meter')
export class SpeedMeterController {
  constructor(private readonly service: SpeedMeterService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_SPEED_METER_CREATE', entity: 'inf.speed_meter' })
  create(@Body() dto: CreateSpeedMeterDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_SPEED_METER_UPDATE', entity: 'inf.speed_meter' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateSpeedMeterDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_SPEED_METER_DELETE', entity: 'inf.speed_meter' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
