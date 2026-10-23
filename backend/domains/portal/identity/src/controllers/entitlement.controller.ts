// Generated from BP-PORTAL-IDENTITY-001 v1.0.2 sha256:bbfa6f4431768ff2ab5f9af097062b47775c79afb1a954ff7fb21b2c7743e4ea
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { EntitlementService } from '../services/entitlement.service.js';

@Controller('v1/portal/identity/entitlements')
@Resource('portal:entitlement')
export class EntitlementController {
  constructor(private readonly service: EntitlementService) {}
}
