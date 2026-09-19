// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
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
import type { CreateCrashDamageDto } from '../dto/create-crash-damage.dto.js';
import { CrashDamageService } from '../services/crash-damage.service.js';

@Controller('v1/est/crash/damages')
@Resource('est:crash-damage')
export class CrashDamageController {
  constructor(private readonly service: CrashDamageService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'EST_CRASH_DAMAGE_CREATE', entity: 'est.crash_damage' })
  create(@Body() dto: CreateCrashDamageDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'EST_CRASH_DAMAGE_UPDATE', entity: 'est.crash_damage' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCrashDamageDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'EST_CRASH_DAMAGE_DELETE', entity: 'est.crash_damage' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
