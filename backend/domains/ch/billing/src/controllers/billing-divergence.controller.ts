// Generated from BP-CH-BILLING-001 v1.0.0 sha256:b93ad2da6d0162ec02bff11759374782a27b26980a522e4c2c681e2daa1d9d53
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
