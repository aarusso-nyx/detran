// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:4768197f351ea702628ed5198543624eb79b54621bfc8fb4c6383ecc414b17b9
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
import type { CreatePsychInstrumentDto } from '../dto/create-psych-instrument.dto.js';
import { PsychInstrumentService } from '../services/psych-instrument.service.js';

@Controller('v1/ch/exams/psych-instruments')
@Resource('ch:psych-instrument')
export class PsychInstrumentController {
  constructor(private readonly service: PsychInstrumentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'CH_PSYCH_INSTRUMENT_CREATE',
    entity: 'ch.psych_instrument',
  })
  create(@Body() dto: CreatePsychInstrumentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'CH_PSYCH_INSTRUMENT_UPDATE',
    entity: 'ch.psych_instrument',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePsychInstrumentDto>,
  ) {
    return this.service.update(id, dto);
  }
}
