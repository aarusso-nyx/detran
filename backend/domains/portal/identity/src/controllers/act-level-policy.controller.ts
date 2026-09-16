// Generated from BP-PORTAL-IDENTITY-001 v1.0.2 sha256:bbfa6f4431768ff2ab5f9af097062b47775c79afb1a954ff7fb21b2c7743e4ea
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
import type { CreateActLevelPolicyDto } from '../dto/create-act-level-policy.dto.js';
import { ActLevelPolicyService } from '../services/act-level-policy.service.js';

@Controller('v1/portal/identity/act-level-policies')
@Resource('portal:act-level-policy')
export class ActLevelPolicyController {
  constructor(private readonly service: ActLevelPolicyService) {}
}
