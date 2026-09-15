// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
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
import type { CreateRaitQualitySampleDto } from '../dto/create-rait-quality-sample.dto.js';
import { RaitQualitySampleService } from '../services/rait-quality-sample.service.js';

@Controller('v1/inf/rait/quality-samples')
@Resource('inf:rait-quality-sample')
export class RaitQualitySampleController {
  constructor(private readonly service: RaitQualitySampleService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_QUALITY_SAMPLE_CREATE',
    entity: 'inf.rait_quality_sample',
  })
  create(@Body() dto: CreateRaitQualitySampleDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_QUALITY_SAMPLE_UPDATE',
    entity: 'inf.rait_quality_sample',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitQualitySampleDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_QUALITY_SAMPLE_DELETE',
    entity: 'inf.rait_quality_sample',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
