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
import type { CreateRaitAdmissibilityDto } from '../dto/create-rait-admissibility.dto.js';
import { RaitAdmissibilityService } from '../services/rait-admissibility.service.js';

@Controller('v1/inf/raitadmissibility')
@Resource('inf:rait-admissibility')
export class RaitAdmissibilityController {
  constructor(private readonly service: RaitAdmissibilityService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_ADMISSIBILITY_CREATE',
    entity: 'inf.rait_admissibility',
  })
  create(@Body() dto: CreateRaitAdmissibilityDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_ADMISSIBILITY_UPDATE',
    entity: 'inf.rait_admissibility',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitAdmissibilityDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_ADMISSIBILITY_DELETE',
    entity: 'inf.rait_admissibility',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
