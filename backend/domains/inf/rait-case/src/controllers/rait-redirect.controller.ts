// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
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
import type { CreateRaitRedirectDto } from '../dto/create-rait-redirect.dto.js';
import { RaitRedirectService } from '../services/rait-redirect.service.js';

@Controller('v1/inf/rait/redirects')
@Resource('inf:rait-redirect')
export class RaitRedirectController {
  constructor(private readonly service: RaitRedirectService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_REDIRECT_CREATE', entity: 'inf.rait_redirect' })
  create(@Body() dto: CreateRaitRedirectDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_REDIRECT_UPDATE', entity: 'inf.rait_redirect' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitRedirectDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_REDIRECT_DELETE', entity: 'inf.rait_redirect' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
