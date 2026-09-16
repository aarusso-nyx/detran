// Generated from BP-INF-AIT-001 v1.2.0 sha256:a92e771e8f034647144a60080673e25e807fdbc93a27c59a1da0fc32710fd2ea
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
import type { CreateAitDto } from '../dto/create-ait.dto.js';
import { AitService } from '../services/ait.service.js';

@Controller('v1/inf/ait/aits')
@Resource('inf:ait')
export class AitController {
  constructor(private readonly service: AitService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_AIT_AIT_CREATE', entity: 'inf.ait_ait' })
  create(@Body() dto: CreateAitDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_AIT_AIT_UPDATE', entity: 'inf.ait_ait' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateAitDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_AIT_AIT_DELETE', entity: 'inf.ait_ait' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
