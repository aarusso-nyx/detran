// Generated from BP-CH-CLINICAL-CONTROLS-001 v1.0.0 sha256:0fc842b8a5a36fe3ca506127d7341f9c7bf183f2956d1c77485c5e3f6a8db18c
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
import type { CreateClinicalControlEventDto } from '../dto/create-clinical-control-event.dto.js';
import { ClinicalControlEventService } from '../services/clinical-control-event.service.js';

@Controller('v1/ch/clinical-controls/events')
@Resource('ch:clinical-control-event')
export class ClinicalControlEventController {
  constructor(private readonly service: ClinicalControlEventService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
