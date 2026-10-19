// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
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
import type { CreateRaitDecisionDto } from '../dto/create-rait-decision.dto.js';
import { RaitDecisionService } from '../services/rait-decision.service.js';

@Controller('v1/inf/rait/decisions')
@Resource('inf:rait-decision')
export class RaitDecisionController {
  constructor(private readonly service: RaitDecisionService) {}
}
