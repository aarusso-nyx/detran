// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
import type { CreateRaitCasePoolScopeRecordDto } from '../dto/create-rait-case-pool-scope-record.dto.js';
import { RaitCasePoolScopeRecordService } from '../services/rait-case-pool-scope-record.service.js';

@Controller('v1/inf/rait/internal/case-pool-scope')
@Resource('inf:rait-case-pool-scope')
export class RaitCasePoolScopeRecordController {
  constructor(private readonly service: RaitCasePoolScopeRecordService) {}
}
