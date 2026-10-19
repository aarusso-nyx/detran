// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
