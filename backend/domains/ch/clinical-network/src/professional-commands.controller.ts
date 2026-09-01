import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import type { CreateProfessionalDto } from './dto/create-professional.dto.js';
import { ProfessionalLifecycleService } from './professional-lifecycle.service.js';

@Controller('v1/ch/clinical-network/professionals')
@Resource('ch:professional')
export class ProfessionalCommandsController {
  constructor(private readonly professionals: ProfessionalLifecycleService) {}

  @Post()
  @Action('create')
  @Audit({ action: 'CH_PROFESSIONAL_CREATE', entity: 'ch.professional' })
  create(@Body() input: CreateProfessionalDto) {
    return this.professionals.create(input);
  }

  @Patch(':id')
  @Action('update')
  @Audit({ action: 'CH_PROFESSIONAL_UPDATE', entity: 'ch.professional' })
  update(
    @Param('id') id: string,
    @Body() input: Partial<CreateProfessionalDto>,
  ) {
    return this.professionals.update(id, input);
  }
}
