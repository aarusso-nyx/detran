// Generated from BP-INF-AIT-001 v1.1.0 sha256:de3a429b81e860fb45d3abba728570d01cdfd3b886f55ff770273d4d6fff365f
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
import type { CreateAitVehicleDto } from '../dto/create-ait-vehicle.dto.js';
import { AitVehicleService } from '../services/ait-vehicle.service.js';

@Controller('v1/inf/ait/vehicles')
@Resource('inf:ait-vehicle')
export class AitVehicleController {
  constructor(private readonly service: AitVehicleService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_AIT_VEHICLE_CREATE', entity: 'inf.ait_vehicle' })
  create(@Body() dto: CreateAitVehicleDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_AIT_VEHICLE_UPDATE', entity: 'inf.ait_vehicle' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateAitVehicleDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_AIT_VEHICLE_DELETE', entity: 'inf.ait_vehicle' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
