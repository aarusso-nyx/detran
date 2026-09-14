// Generated from BP-OPS-SNAPSHOTS-001 v1.0.0 sha256:bebc10f45ae4f8887acc821ee7211894780dd9bd4b5a67d1edfbd371f54a21c4
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
import type { CreateVehicleDto } from '../dto/create-vehicle.dto.js';
import { VehicleService } from '../services/vehicle.service.js';

@Controller('v1/ops/snapshots/vehicles')
@Resource('ops:vehicle')
export class VehicleController {
  constructor(private readonly service: VehicleService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_SNAPSHOTS_VEHICLE_CREATE',
    entity: 'ops.snapshots_vehicle',
  })
  create(@Body() dto: CreateVehicleDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_SNAPSHOTS_VEHICLE_UPDATE',
    entity: 'ops.snapshots_vehicle',
  })
  update(@Param('id') id: string, @Body() dto: Partial<CreateVehicleDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_SNAPSHOTS_VEHICLE_DELETE',
    entity: 'ops.snapshots_vehicle',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
