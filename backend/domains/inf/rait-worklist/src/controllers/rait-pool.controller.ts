// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
