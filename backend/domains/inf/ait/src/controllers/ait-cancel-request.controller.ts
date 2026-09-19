// Generated from BP-INF-AIT-001 v1.2.0 sha256:a92e771e8f034647144a60080673e25e807fdbc93a27c59a1da0fc32710fd2ea
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
import type { CreateAitCancelRequestDto } from '../dto/create-ait-cancel-request.dto.js';
import { AitCancelRequestService } from '../services/ait-cancel-request.service.js';

@Controller('v1/inf/ait/cancel-requests')
@Resource('inf:ait-cancel-request')
export class AitCancelRequestController {
  constructor(private readonly service: AitCancelRequestService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
