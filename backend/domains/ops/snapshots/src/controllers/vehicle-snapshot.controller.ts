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
import type { CreateVehicleSnapshotDto } from '../dto/create-vehicle-snapshot.dto.js';
import { VehicleSnapshotService } from '../services/vehicle-snapshot.service.js';

@Controller('v1/ops/snapshots/vehicle-snapshots')
@Resource('ops:vehicle-snapshot')
export class VehicleSnapshotController {
  constructor(private readonly service: VehicleSnapshotService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_SNAPSHOTS_VEHICLE_SNAPSHOT_CREATE',
    entity: 'ops.snapshots_vehicle_snapshot',
  })
  create(@Body() dto: CreateVehicleSnapshotDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_SNAPSHOTS_VEHICLE_SNAPSHOT_UPDATE',
    entity: 'ops.snapshots_vehicle_snapshot',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateVehicleSnapshotDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_SNAPSHOTS_VEHICLE_SNAPSHOT_DELETE',
    entity: 'ops.snapshots_vehicle_snapshot',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
