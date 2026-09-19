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
import type { CreateRaitSubstituteDutyDto } from '../dto/create-rait-substitute-duty.dto.js';
import { RaitSubstituteDutyService } from '../services/rait-substitute-duty.service.js';

@Controller('v1/inf/rait/substitute-duties')
@Resource('inf:rait-substitute-duty')
export class RaitSubstituteDutyController {
  constructor(private readonly service: RaitSubstituteDutyService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
