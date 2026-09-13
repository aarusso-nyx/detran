// Generated from BP-CH-JUNTAS-001 v1.0.0 sha256:5c7e357c88ac5886f460c789a7607211ada27acd49d6f9fd47df0da89ad064f2
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
import type { CreateJuntaBoardDto } from '../dto/create-junta-board.dto.js';
import { JuntaBoardService } from '../services/junta-board.service.js';

@Controller('v1/ch/juntas/boards')
@Resource('ch:junta')
export class JuntaBoardController {
  constructor(private readonly service: JuntaBoardService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
