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
import type { CreateRaitDeadlineDto } from '../dto/create-rait-deadline.dto.js';
import { RaitDeadlineService } from '../services/rait-deadline.service.js';

@Controller('v1/inf/rait/deadlines')
@Resource('inf:rait-deadline')
export class RaitDeadlineController {
  constructor(private readonly service: RaitDeadlineService) {}
}
