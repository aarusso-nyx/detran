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
import type { CreateApproachDto } from '../dto/create-approach.dto.js';
import { ApproachService } from '../services/approach.service.js';

@Controller('v1/ops/field/approaches')
@Resource('ops:approach')
export class ApproachController {
  constructor(private readonly service: ApproachService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'OPS_OPS_APPROACH_CREATE', entity: 'ops.ops_approach' })
  create(@Body() dto: CreateApproachDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'OPS_OPS_APPROACH_UPDATE', entity: 'ops.ops_approach' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateApproachDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'OPS_OPS_APPROACH_DELETE', entity: 'ops.ops_approach' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
