// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
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
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_VOTE_CREATE', entity: 'inf.rait_vote' })
  create(@Body() dto: CreateRaitVoteDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_VOTE_UPDATE', entity: 'inf.rait_vote' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitVoteDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_VOTE_DELETE', entity: 'inf.rait_vote' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
