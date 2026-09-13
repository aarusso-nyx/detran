// Generated from BP-CH-OPERATIONAL-CONTROLS-001 v1.0.0 sha256:41855aeaa3c52f966b5c30807e1fe3d821258e6c626a32b72238986d291880da
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
import type { CreateOperationalRecordDto } from '../dto/create-operational-record.dto.js';
import { OperationalRecordService } from '../services/operational-record.service.js';

@Controller('v1/ch/operational-controls/records')
@Resource('ch:operational-control')
export class OperationalRecordController {
  constructor(private readonly service: OperationalRecordService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
