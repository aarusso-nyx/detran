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
import type { CreateRaitClockDto } from '../dto/create-rait-clock.dto.js';
import { RaitClockService } from '../services/rait-clock.service.js';

@Controller('v1/inf/rait/clocks')
@Resource('inf:rait-clock')
export class RaitClockController {
  constructor(private readonly service: RaitClockService) {}
}
