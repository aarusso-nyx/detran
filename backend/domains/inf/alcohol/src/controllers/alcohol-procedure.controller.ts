// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
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
import type { CreateAlcoholProcedureDto } from '../dto/create-alcohol-procedure.dto.js';
import { AlcoholProcedureService } from '../services/alcohol-procedure.service.js';

@Controller('v1/inf/alcohol/procedures')
@Resource('inf:alcohol-procedure')
export class AlcoholProcedureController {
  constructor(private readonly service: AlcoholProcedureService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_ALCOHOL_PROCEDURE_CREATE',
    entity: 'inf.alcohol_procedure',
  })
  create(@Body() dto: CreateAlcoholProcedureDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_ALCOHOL_PROCEDURE_UPDATE',
    entity: 'inf.alcohol_procedure',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAlcoholProcedureDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_ALCOHOL_PROCEDURE_DELETE',
    entity: 'inf.alcohol_procedure',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
