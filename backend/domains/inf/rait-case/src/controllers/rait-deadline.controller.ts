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
import type { CreateRaitDeadlineDto } from '../dto/create-rait-deadline.dto.js';
import { RaitDeadlineService } from '../services/rait-deadline.service.js';

@Controller('v1/inf/rait/deadlines')
@Resource('inf:rait-deadline')
export class RaitDeadlineController {
  constructor(private readonly service: RaitDeadlineService) {}
}
