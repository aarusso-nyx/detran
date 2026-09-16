// Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c
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
import type { CreateEntitlementDto } from '../dto/create-entitlement.dto.js';
import { EntitlementService } from '../services/entitlement.service.js';

@Controller('v1/portal/identity/entitlements')
@Resource('portal:entitlement')
export class EntitlementController {
  constructor(private readonly service: EntitlementService) {}
}
