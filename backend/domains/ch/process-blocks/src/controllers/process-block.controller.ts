// Generated from BP-CH-PROCESS-BLOCKS-001 v1.0.0 sha256:4e56ae0c6ab4db581d4cd4f3b88014f634c022cc45f8f991a54976b7da46feab
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
import type { CreateProcessBlockDto } from '../dto/create-process-block.dto.js';
import { ProcessBlockService } from '../services/process-block.service.js';

@Controller('v1/ch/process-blocks/records')
@Resource('ch:process-block')
export class ProcessBlockController {
  constructor(private readonly service: ProcessBlockService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
