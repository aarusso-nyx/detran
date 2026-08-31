// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
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
import type { CreateRaitSessionDto } from '../dto/create-rait-session.dto.js';
import { RaitSessionService } from '../services/rait-session.service.js';

@Controller('v1/inf/rait/sessions')
@Resource('inf:rait-session')
export class RaitSessionController {
  constructor(private readonly service: RaitSessionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_SESSION_CREATE', entity: 'inf.rait_session' })
  create(@Body() dto: CreateRaitSessionDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_SESSION_UPDATE', entity: 'inf.rait_session' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitSessionDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_SESSION_DELETE', entity: 'inf.rait_session' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
