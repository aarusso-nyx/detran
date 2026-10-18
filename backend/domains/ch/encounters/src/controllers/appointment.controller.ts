// Generated from BP-CH-ENCOUNTERS-001 v1.2.1 sha256:0eae9fa8ccfb086eba21de22f3a9d379e0256092be9e903b2c7feea4c664ec92
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
