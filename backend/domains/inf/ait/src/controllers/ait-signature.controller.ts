// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
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
import type { CreateAitSignatureDto } from '../dto/create-ait-signature.dto.js';
import { AitSignatureService } from '../services/ait-signature.service.js';

@Controller('v1/inf/ait/signatures')
@Resource('inf:ait-signature')
export class AitSignatureController {
  constructor(private readonly service: AitSignatureService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_AIT_SIGNATURE_CREATE', entity: 'inf.ait_signature' })
  create(@Body() dto: CreateAitSignatureDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_AIT_SIGNATURE_UPDATE', entity: 'inf.ait_signature' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateAitSignatureDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_AIT_SIGNATURE_DELETE', entity: 'inf.ait_signature' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
