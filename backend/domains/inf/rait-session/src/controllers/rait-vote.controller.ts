// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
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

@Controller('v1/inf/raitvotes')
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
