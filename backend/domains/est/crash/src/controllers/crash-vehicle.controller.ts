// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
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
import type { CreateCrashVehicleDto } from '../dto/create-crash-vehicle.dto.js';
import { CrashVehicleService } from '../services/crash-vehicle.service.js';

@Controller('v1/est/crash/vehicles')
@Resource('est:crash-vehicle')
export class CrashVehicleController {
  constructor(private readonly service: CrashVehicleService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'EST_CRASH_VEHICLE_CREATE', entity: 'est.crash_vehicle' })
  create(@Body() dto: CreateCrashVehicleDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'EST_CRASH_VEHICLE_UPDATE', entity: 'est.crash_vehicle' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCrashVehicleDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'EST_CRASH_VEHICLE_DELETE', entity: 'est.crash_vehicle' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
