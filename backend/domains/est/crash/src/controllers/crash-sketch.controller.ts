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
import type { CreateCrashSketchDto } from '../dto/create-crash-sketch.dto.js';
import { CrashSketchService } from '../services/crash-sketch.service.js';

@Controller('v1/est/crash/sketches')
@Resource('est:crash-sketch')
export class CrashSketchController {
  constructor(private readonly service: CrashSketchService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'EST_CRASH_SKETCH_CREATE', entity: 'est.crash_sketch' })
  create(@Body() dto: CreateCrashSketchDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'EST_CRASH_SKETCH_UPDATE', entity: 'est.crash_sketch' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCrashSketchDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'EST_CRASH_SKETCH_DELETE', entity: 'est.crash_sketch' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
