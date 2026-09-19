// Generated from BP-EST-CRASH-001 v1.0.0 sha256:b47af7c82f17c4a1fa3e3eefb69f476ee022559780b97f30285d2582d18c8231
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
