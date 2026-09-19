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
import type { CreateCrashVictimDto } from '../dto/create-crash-victim.dto.js';
import { CrashVictimService } from '../services/crash-victim.service.js';

@Controller('v1/est/crash/victims')
@Resource('est:crash-victim')
export class CrashVictimController {
  constructor(private readonly service: CrashVictimService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'EST_CRASH_VICTIM_CREATE', entity: 'est.crash_victim' })
  create(@Body() dto: CreateCrashVictimDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'EST_CRASH_VICTIM_UPDATE', entity: 'est.crash_victim' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCrashVictimDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'EST_CRASH_VICTIM_DELETE', entity: 'est.crash_victim' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
