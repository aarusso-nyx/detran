// Generated from BP-CH-BILLING-001 v1.0.0 sha256:dbb379527f32d359e25dee36e8d7232af006c46466c5c86faef3d22de91db860
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
import type { CreateBillingDivergenceDto } from '../dto/create-billing-divergence.dto.js';
import { BillingDivergenceService } from '../services/billing-divergence.service.js';

@Controller('v1/ch/billing/divergences')
@Resource('ch:invoice')
export class BillingDivergenceController {
  constructor(private readonly service: BillingDivergenceService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
