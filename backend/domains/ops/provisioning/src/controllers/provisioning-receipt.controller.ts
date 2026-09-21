// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
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
import type { CreateProvisioningReceiptDto } from '../dto/create-provisioning-receipt.dto.js';
import { ProvisioningReceiptService } from '../services/provisioning-receipt.service.js';

@Controller('v1/ops/provisioning/receipts')
@Resource('ops:receipt')
export class ProvisioningReceiptController {
  constructor(private readonly service: ProvisioningReceiptService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
