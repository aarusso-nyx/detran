// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
import type { CreateRaitScheduleDto } from '../dto/create-rait-schedule.dto.js';
import { RaitScheduleService } from '../services/rait-schedule.service.js';

@Controller('v1/inf/rait/schedules')
@Resource('inf:rait-schedule')
export class RaitScheduleController {
  constructor(private readonly service: RaitScheduleService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
