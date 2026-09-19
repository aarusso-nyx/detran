// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:41cbbec5aa5c5c6aa56495204f1b421d456abe78852bb03fd76a03715cbde6b1
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
import type { CreateNormativeFramingDto } from '../dto/create-normative-framing.dto.js';
import { NormativeFramingService } from '../services/normative-framing.service.js';

@Controller('v1/inf/normative/framings')
@Resource('inf:framing')
export class NormativeFramingController {
  constructor(private readonly service: NormativeFramingService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_NORMATIVE_FRAMING_CREATE',
    entity: 'inf.normative_framing',
  })
  create(@Body() dto: CreateNormativeFramingDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_NORMATIVE_FRAMING_UPDATE',
    entity: 'inf.normative_framing',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateNormativeFramingDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_NORMATIVE_FRAMING_DELETE',
    entity: 'inf.normative_framing',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
