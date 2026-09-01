// Generated from BP-CH-TELEHEALTH-001 v1.0.0 sha256:1702fef12182de18153031eed0b113c29e2eaa1406ccd4477fea59340ea96206
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
import type { CreateTelehealthSessionDto } from '../dto/create-telehealth-session.dto.js';
import { TelehealthSessionService } from '../services/telehealth-session.service.js';

@Controller('v1/ch/telehealth/sessions')
@Resource('ch:telehealth-session')
export class TelehealthSessionController {
  constructor(private readonly service: TelehealthSessionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
