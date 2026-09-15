// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
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
import type { CreatePatrolVehicleDto } from '../dto/create-patrol-vehicle.dto.js';
import { PatrolVehicleService } from '../services/patrol-vehicle.service.js';

@Controller('v1/ops/field/patrol-vehicles')
@Resource('ops:patrol-vehicle')
export class PatrolVehicleController {
  constructor(private readonly service: PatrolVehicleService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_OPS_PATROL_VEHICLE_CREATE',
    entity: 'ops.ops_patrol_vehicle',
  })
  create(@Body() dto: CreatePatrolVehicleDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_OPS_PATROL_VEHICLE_UPDATE',
    entity: 'ops.ops_patrol_vehicle',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePatrolVehicleDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_OPS_PATROL_VEHICLE_DELETE',
    entity: 'ops.ops_patrol_vehicle',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
