// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
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
import type { CreateAdministrativeTermDto } from '../dto/create-administrative-term.dto.js';
import { AdministrativeTermService } from '../services/administrative-term.service.js';

@Controller('v1/inf/measuresterms')
@Resource('inf:administrative-term')
export class AdministrativeTermController {
  constructor(private readonly service: AdministrativeTermService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_ADMINISTRATIVE_TERM_CREATE',
    entity: 'inf.administrative_term',
  })
  create(@Body() dto: CreateAdministrativeTermDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_ADMINISTRATIVE_TERM_UPDATE',
    entity: 'inf.administrative_term',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAdministrativeTermDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_ADMINISTRATIVE_TERM_DELETE',
    entity: 'inf.administrative_term',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
