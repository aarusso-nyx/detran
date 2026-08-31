// Generated from BP-CH-SCHEDULING-001 v1.0.0 sha256:fdbac09747b1d01ea1aa90821a792d537064443364d6a193ca6df5575d591513
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
import type { CreateAppointmentAssignmentDrawDto } from '../dto/create-appointment-assignment-draw.dto.js';
import { AppointmentAssignmentDrawService } from '../services/appointment-assignment-draw.service.js';

@Controller('v1/ch/scheduling/assignment-draws')
@Resource('ch:appointment-assignment')
export class AppointmentAssignmentDrawController {
  constructor(private readonly service: AppointmentAssignmentDrawService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
