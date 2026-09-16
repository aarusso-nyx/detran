// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
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
import type { CreateVehicleInventoryDto } from '../dto/create-vehicle-inventory.dto.js';
import { VehicleInventoryService } from '../services/vehicle-inventory.service.js';

@Controller('v1/inf/measures/vehicle-inventories')
@Resource('inf:vehicle-inventory')
export class VehicleInventoryController {
  constructor(private readonly service: VehicleInventoryService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_VEHICLE_INVENTORY_CREATE',
    entity: 'inf.vehicle_inventory',
  })
  create(@Body() dto: CreateVehicleInventoryDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_VEHICLE_INVENTORY_UPDATE',
    entity: 'inf.vehicle_inventory',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateVehicleInventoryDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_VEHICLE_INVENTORY_DELETE',
    entity: 'inf.vehicle_inventory',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
