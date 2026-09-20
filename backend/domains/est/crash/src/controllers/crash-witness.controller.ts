// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
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
import type { CreateCrashWitnessDto } from '../dto/create-crash-witness.dto.js';
import { CrashWitnessService } from '../services/crash-witness.service.js';

@Controller('v1/est/crash/witnesses')
@Resource('est:crash-witness')
export class CrashWitnessController {
  constructor(private readonly service: CrashWitnessService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'EST_CRASH_WITNESS_CREATE', entity: 'est.crash_witness' })
  create(@Body() dto: CreateCrashWitnessDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'EST_CRASH_WITNESS_UPDATE', entity: 'est.crash_witness' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCrashWitnessDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'EST_CRASH_WITNESS_DELETE', entity: 'est.crash_witness' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
