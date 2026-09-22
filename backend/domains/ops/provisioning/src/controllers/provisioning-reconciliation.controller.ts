// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
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
import type { CreateProvisioningReconciliationDto } from '../dto/create-provisioning-reconciliation.dto.js';
import { ProvisioningReconciliationService } from '../services/provisioning-reconciliation.service.js';

@Controller('v1/ops/provisioning/reconciliations')
@Resource('ops:reconciliation')
export class ProvisioningReconciliationController {
  constructor(private readonly service: ProvisioningReconciliationService) {}
}
