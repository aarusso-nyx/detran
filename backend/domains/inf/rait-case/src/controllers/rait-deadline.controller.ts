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
import type { CreateRaitDeadlineDto } from '../dto/create-rait-deadline.dto.js';
import { RaitDeadlineService } from '../services/rait-deadline.service.js';

@Controller('v1/inf/rait/deadlines')
@Resource('inf:rait-deadline')
export class RaitDeadlineController {
  constructor(private readonly service: RaitDeadlineService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_DEADLINE_CREATE', entity: 'inf.rait_deadline' })
  create(@Body() dto: CreateRaitDeadlineDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_DEADLINE_UPDATE', entity: 'inf.rait_deadline' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitDeadlineDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_DEADLINE_DELETE', entity: 'inf.rait_deadline' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
