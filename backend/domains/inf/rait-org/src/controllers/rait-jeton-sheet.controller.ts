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
