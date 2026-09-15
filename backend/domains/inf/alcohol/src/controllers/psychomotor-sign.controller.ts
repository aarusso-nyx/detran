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
import type { CreatePsychomotorSignDto } from '../dto/create-psychomotor-sign.dto.js';
import { PsychomotorSignService } from '../services/psychomotor-sign.service.js';

@Controller('v1/inf/alcohol/psychomotor-signs')
@Resource('inf:psychomotor-sign')
export class PsychomotorSignController {
  constructor(private readonly service: PsychomotorSignService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_ALCOHOL_PSYCHOMOTOR_SIGN_CREATE',
    entity: 'inf.alcohol_psychomotor_sign',
  })
  create(@Body() dto: CreatePsychomotorSignDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_ALCOHOL_PSYCHOMOTOR_SIGN_UPDATE',
    entity: 'inf.alcohol_psychomotor_sign',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePsychomotorSignDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_ALCOHOL_PSYCHOMOTOR_SIGN_DELETE',
    entity: 'inf.alcohol_psychomotor_sign',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
