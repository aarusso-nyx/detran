// Generated from BP-OPS-PARAMETER-001 v1.0.0 sha256:3259251ebb1dfaccd776e889a446ca45db209b824d7760cc132d20c015e3e39e
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
import type { CreateParameterDto } from '../dto/create-parameter.dto.js';
import { ParameterService } from '../services/parameter.service.js';

@Controller('v1/ops/parameters')
@Resource('ops:parameter')
export class ParameterController {
  constructor(private readonly service: ParameterService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
