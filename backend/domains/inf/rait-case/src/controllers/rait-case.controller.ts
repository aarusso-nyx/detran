// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
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

@Controller('v1/inf/raitcases')
@Resource('inf:rait-case')
export class RaitCaseController {
  constructor(private readonly service: RaitCaseService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_CASE_CREATE', entity: 'inf.rait_case' })
  create(@Body() dto: CreateRaitCaseDto) {
    return this.service.create(dto);
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
