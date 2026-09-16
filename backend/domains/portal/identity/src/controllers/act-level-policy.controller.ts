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
import type { CreateActLevelPolicyDto } from '../dto/create-act-level-policy.dto.js';
import { ActLevelPolicyService } from '../services/act-level-policy.service.js';

@Controller('v1/portal/identity/act-level-policies')
@Resource('portal:act-level-policy')
export class ActLevelPolicyController {
  constructor(private readonly service: ActLevelPolicyService) {}
}
