// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
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
import type { CreateRaitVoteDto } from '../dto/create-rait-vote.dto.js';
import { RaitVoteService } from '../services/rait-vote.service.js';

@Controller('v1/inf/rait/votes')
@Resource('inf:rait-vote')
export class RaitVoteController {
  constructor(private readonly service: RaitVoteService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
