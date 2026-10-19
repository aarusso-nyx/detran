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
import type { CreateRaitCaseReadScopeDto } from '../dto/create-rait-case-read-scope.dto.js';
import { RaitCaseReadScopeService } from '../services/rait-case-read-scope.service.js';

@Controller('v1/inf/rait/internal/case-read-scope')
@Resource('inf:rait-case-read-scope')
export class RaitCaseReadScopeController {
  constructor(private readonly service: RaitCaseReadScopeService) {}
}
