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
import type { CreateYardDto } from '../dto/create-yard.dto.js';
import { YardService } from '../services/yard.service.js';

@Controller('v1/inf/measures/yards')
@Resource('inf:yard')
export class YardController {
  constructor(private readonly service: YardService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_YARD_CREATE', entity: 'inf.yard' })
  create(@Body() dto: CreateYardDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_YARD_UPDATE', entity: 'inf.yard' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateYardDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_YARD_DELETE', entity: 'inf.yard' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
