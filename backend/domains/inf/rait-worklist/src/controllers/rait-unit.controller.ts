// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
import type { CreateRaitUnitDto } from '../dto/create-rait-unit.dto.js';
import { RaitUnitService } from '../services/rait-unit.service.js';

@Controller('v1/inf/rait/units')
@Resource('inf:rait-unit')
export class RaitUnitController {
  constructor(private readonly service: RaitUnitService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_UNIT_CREATE', entity: 'inf.rait_unit' })
  create(@Body() dto: CreateRaitUnitDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_UNIT_UPDATE', entity: 'inf.rait_unit' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitUnitDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_UNIT_DELETE', entity: 'inf.rait_unit' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
