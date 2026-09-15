// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
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
import type { CreateRaitMinutesDto } from '../dto/create-rait-minutes.dto.js';
import { RaitMinutesService } from '../services/rait-minutes.service.js';

@Controller('v1/inf/rait/minutes')
@Resource('inf:rait-minutes')
export class RaitMinutesController {
  constructor(private readonly service: RaitMinutesService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_MINUTES_CREATE', entity: 'inf.rait_minutes' })
  create(@Body() dto: CreateRaitMinutesDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_MINUTES_UPDATE', entity: 'inf.rait_minutes' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitMinutesDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_MINUTES_DELETE', entity: 'inf.rait_minutes' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
