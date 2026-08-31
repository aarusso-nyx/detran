// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:17207db7ca179e913375c7645edcf4c43c3e309891634856e04a72dd4a4d8f54
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
import type { CreateClinicDto } from '../dto/create-clinic.dto.js';
import { ClinicService } from '../services/clinic.service.js';

@Controller('v1/ch/clinical-network/clinics')
@Resource('ch:clinic')
export class ClinicController {
  constructor(private readonly service: ClinicService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'CH_CLINIC_CREATE', entity: 'ch.clinic' })
  create(@Body() dto: CreateClinicDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'CH_CLINIC_UPDATE', entity: 'ch.clinic' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateClinicDto>) {
    return this.service.update(id, dto);
  }
}
