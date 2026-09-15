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
import type { CreateRaitSubstituteDutyDto } from '../dto/create-rait-substitute-duty.dto.js';
import { RaitSubstituteDutyService } from '../services/rait-substitute-duty.service.js';

@Controller('v1/inf/rait/substitute-duties')
@Resource('inf:rait-substitute-duty')
export class RaitSubstituteDutyController {
  constructor(private readonly service: RaitSubstituteDutyService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_SUBSTITUTE_DUTY_CREATE',
    entity: 'inf.rait_substitute_duty',
  })
  create(@Body() dto: CreateRaitSubstituteDutyDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_SUBSTITUTE_DUTY_UPDATE',
    entity: 'inf.rait_substitute_duty',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitSubstituteDutyDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_SUBSTITUTE_DUTY_DELETE',
    entity: 'inf.rait_substitute_duty',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
