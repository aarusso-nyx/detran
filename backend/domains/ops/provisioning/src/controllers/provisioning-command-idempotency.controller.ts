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
import type { CreateProvisioningCommandIdempotencyDto } from '../dto/create-provisioning-command-idempotency.dto.js';
import { ProvisioningCommandIdempotencyService } from '../services/provisioning-command-idempotency.service.js';

@Controller('v1/ops/provisioning/command-idempotencies')
@Resource('ops:command-idempotency')
export class ProvisioningCommandIdempotencyController {
  constructor(
    private readonly service: ProvisioningCommandIdempotencyService,
  ) {}
}
