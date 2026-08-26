// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:a4378f112c84361ebe923b17329c2848218c3f266f9811c1b18090d9c79f0ee1
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
import type { CreateRaitImpedimentDto } from '../dto/create-rait-impediment.dto.js';
import { RaitImpedimentService } from '../services/rait-impediment.service.js';

@Controller('v1/inf/raitimpediments')
@Resource('inf:rait-impediment')
export class RaitImpedimentController {
  constructor(private readonly service: RaitImpedimentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_IMPEDIMENT_CREATE',
    entity: 'inf.rait_impediment',
  })
  create(@Body() dto: CreateRaitImpedimentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_IMPEDIMENT_UPDATE',
    entity: 'inf.rait_impediment',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitImpedimentDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_IMPEDIMENT_DELETE',
    entity: 'inf.rait_impediment',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
