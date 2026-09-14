// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
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
import type { CreateHomologationDto } from '../dto/create-homologation.dto.js';
import { HomologationService } from '../services/homologation.service.js';

@Controller('v1/ops/field/homologations')
@Resource('ops:homologation')
export class HomologationController {
  constructor(private readonly service: HomologationService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_OPS_HOMOLOGATION_CREATE',
    entity: 'ops.ops_homologation',
  })
  create(@Body() dto: CreateHomologationDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_OPS_HOMOLOGATION_UPDATE',
    entity: 'ops.ops_homologation',
  })
  update(@Param('id') id: string, @Body() dto: Partial<CreateHomologationDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_OPS_HOMOLOGATION_DELETE',
    entity: 'ops.ops_homologation',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
