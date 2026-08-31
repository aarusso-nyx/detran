// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:9e9bbc2f438a9fcb8207678f2c0927e3013d7ec0f104563fbebaf3ac446c8f7a
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
import type { CreateProfessionalDto } from '../dto/create-professional.dto.js';
import { ProfessionalService } from '../services/professional.service.js';

@Controller('v1/ch/clinical-network/professionals')
@Resource('ch:professional')
export class ProfessionalController {
  constructor(private readonly service: ProfessionalService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'CH_PROFESSIONAL_CREATE', entity: 'ch.professional' })
  create(@Body() dto: CreateProfessionalDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'CH_PROFESSIONAL_UPDATE', entity: 'ch.professional' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateProfessionalDto>) {
    return this.service.update(id, dto);
  }
}
