// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
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
import type { CreateRaitJetonLineDto } from '../dto/create-rait-jeton-line.dto.js';
import { RaitJetonLineService } from '../services/rait-jeton-line.service.js';

@Controller('v1/inf/rait/jeton-lines')
@Resource('inf:rait-jeton-line')
export class RaitJetonLineController {
  constructor(private readonly service: RaitJetonLineService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_JETON_LINE_CREATE',
    entity: 'inf.rait_jeton_line',
  })
  create(@Body() dto: CreateRaitJetonLineDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_JETON_LINE_UPDATE',
    entity: 'inf.rait_jeton_line',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitJetonLineDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_JETON_LINE_DELETE',
    entity: 'inf.rait_jeton_line',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
