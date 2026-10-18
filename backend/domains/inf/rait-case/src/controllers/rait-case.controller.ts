// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
import type { CreateRaitCaseDto } from '../dto/create-rait-case.dto.js';
import { RaitCaseService } from '../services/rait-case.service.js';

@Controller('v1/inf/rait/cases')
@Resource('inf:rait-case')
export class RaitCaseController {
  constructor(private readonly service: RaitCaseService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_CASE_UPDATE', entity: 'inf.rait_case' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitCaseDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_CASE_DELETE', entity: 'inf.rait_case' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
