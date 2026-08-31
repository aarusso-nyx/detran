// Generated from BP-CH-ENCOUNTERS-001 v1.2.0 sha256:91731d0164806f1b137025d46dbb65f5fc8ac203fbc84cf8c9affcf81be9a4b5
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
import type { CreateAppointmentDto } from '../dto/create-appointment.dto.js';
import { AppointmentService } from '../services/appointment.service.js';

@Controller('v1/ch/appointments')
@Resource('ch:appointment')
export class AppointmentController {
  constructor(private readonly service: AppointmentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
