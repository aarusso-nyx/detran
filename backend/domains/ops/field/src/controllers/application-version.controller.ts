// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
import type { CreateApplicationVersionDto } from '../dto/create-application-version.dto.js';
import { ApplicationVersionService } from '../services/application-version.service.js';

@Controller('v1/ops/field/application-versions')
@Resource('ops:application-version')
export class ApplicationVersionController {
  constructor(private readonly service: ApplicationVersionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_OPS_APPLICATION_VERSION_CREATE',
    entity: 'ops.ops_application_version',
  })
  create(@Body() dto: CreateApplicationVersionDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_OPS_APPLICATION_VERSION_UPDATE',
    entity: 'ops.ops_application_version',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateApplicationVersionDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_OPS_APPLICATION_VERSION_DELETE',
    entity: 'ops.ops_application_version',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
