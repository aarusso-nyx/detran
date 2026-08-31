// Generated from BP-CH-PATIENTS-001 v1.0.0 sha256:fd85a6f24243cbbe4dc9776184762d2ce9698f1b3d0a6b3dad88bbc31ba43d65
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
import type { CreatePatientDto } from '../dto/create-patient.dto.js';
import { PatientService } from '../services/patient.service.js';

@Controller('v1/ch/patients')
@Resource('ch:patient')
export class PatientController {
  constructor(private readonly service: PatientService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'CH_PATIENT_CREATE', entity: 'ch.patient' })
  create(@Body() dto: CreatePatientDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'CH_PATIENT_UPDATE', entity: 'ch.patient' })
  update(@Param('id') id: string, @Body() dto: Partial<CreatePatientDto>) {
    return this.service.update(id, dto);
  }
}
