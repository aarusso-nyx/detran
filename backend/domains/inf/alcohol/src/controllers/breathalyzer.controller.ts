// Generated from BP-INF-ALCOHOL-001 v1.2.0 sha256:f54fa6e2f04e73d65b7b187ded6fe373d6b14c80f840688310d1f09b9420e20f
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
import type { CreateBreathalyzerDto } from '../dto/create-breathalyzer.dto.js';
import { BreathalyzerService } from '../services/breathalyzer.service.js';

@Controller('v1/inf/alcohol/breathalyzers')
@Resource('inf:breathalyzer')
export class BreathalyzerController {
  constructor(private readonly service: BreathalyzerService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_ALCOHOL_BREATHALYZER_CREATE',
    entity: 'inf.alcohol_breathalyzer',
  })
  create(@Body() dto: CreateBreathalyzerDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_ALCOHOL_BREATHALYZER_UPDATE',
    entity: 'inf.alcohol_breathalyzer',
  })
  update(@Param('id') id: string, @Body() dto: Partial<CreateBreathalyzerDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_ALCOHOL_BREATHALYZER_DELETE',
    entity: 'inf.alcohol_breathalyzer',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
