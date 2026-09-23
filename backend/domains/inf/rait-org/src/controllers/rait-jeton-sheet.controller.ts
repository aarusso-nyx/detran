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
import type { CreateRaitJetonSheetDto } from '../dto/create-rait-jeton-sheet.dto.js';
import { RaitJetonSheetService } from '../services/rait-jeton-sheet.service.js';

@Controller('v1/inf/rait/jeton-sheets')
@Resource('inf:rait-jeton-sheet')
export class RaitJetonSheetController {
  constructor(private readonly service: RaitJetonSheetService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_JETON_SHEET_CREATE',
    entity: 'inf.rait_jeton_sheet',
  })
  create(@Body() dto: CreateRaitJetonSheetDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_JETON_SHEET_UPDATE',
    entity: 'inf.rait_jeton_sheet',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitJetonSheetDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_JETON_SHEET_DELETE',
    entity: 'inf.rait_jeton_sheet',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
