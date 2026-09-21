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
import type { CreateProvisioningReconciliationDto } from '../dto/create-provisioning-reconciliation.dto.js';
import { ProvisioningReconciliationService } from '../services/provisioning-reconciliation.service.js';

@Controller('v1/ops/provisioning/reconciliations')
@Resource('ops:reconciliation')
export class ProvisioningReconciliationController {
  constructor(private readonly service: ProvisioningReconciliationService) {}
}
