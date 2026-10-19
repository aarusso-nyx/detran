// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
import type { CreateRaitPoolDto } from '../dto/create-rait-pool.dto.js';
import { RaitPoolService } from '../services/rait-pool.service.js';

@Controller('v1/inf/rait/pools')
@Resource('inf:rait-pool')
export class RaitPoolController {
  constructor(private readonly service: RaitPoolService) {}
}
