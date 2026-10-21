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
import type { CreateRaitBenchDto } from '../dto/create-rait-bench.dto.js';
import { RaitBenchService } from '../services/rait-bench.service.js';

@Controller('v1/inf/rait/benches')
@Resource('inf:rait-bench')
export class RaitBenchController {
  constructor(private readonly service: RaitBenchService) {}
}
