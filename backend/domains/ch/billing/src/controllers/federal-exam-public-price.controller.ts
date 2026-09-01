// Generated from BP-CH-BILLING-001 v1.0.0 sha256:8814fad00febff6787905872dd30b4f54fe6c33ab4b750bd471093d1e6186fe4
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
import type { CreateFederalExamPublicPriceDto } from '../dto/create-federal-exam-public-price.dto.js';
import { FederalExamPublicPriceService } from '../services/federal-exam-public-price.service.js';

@Controller('v1/ch/billing/exam-prices')
@Resource('ch:billing-event')
export class FederalExamPublicPriceController {
  constructor(private readonly service: FederalExamPublicPriceService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
