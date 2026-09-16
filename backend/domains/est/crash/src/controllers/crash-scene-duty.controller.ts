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
import type { CreateCrashSceneDutyDto } from '../dto/create-crash-scene-duty.dto.js';
import { CrashSceneDutyService } from '../services/crash-scene-duty.service.js';

@Controller('v1/est/crash/scene-duties')
@Resource('est:crash-scene-duty')
export class CrashSceneDutyController {
  constructor(private readonly service: CrashSceneDutyService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'EST_CRASH_SCENE_DUTY_CREATE',
    entity: 'est.crash_scene_duty',
  })
  create(@Body() dto: CreateCrashSceneDutyDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'EST_CRASH_SCENE_DUTY_UPDATE',
    entity: 'est.crash_scene_duty',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCrashSceneDutyDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'EST_CRASH_SCENE_DUTY_DELETE',
    entity: 'est.crash_scene_duty',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
