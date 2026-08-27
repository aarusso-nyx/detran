// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:2297f42351909b6ac68f4a18e7c8b535508fa219dfdaa0f9b087f1ca3b745234
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
import type { CreateRaitPoolMemberDto } from '../dto/create-rait-pool-member.dto.js';
import { RaitPoolMemberService } from '../services/rait-pool-member.service.js';

@Controller('v1/inf/raitpool-members')
@Resource('inf:rait-pool-member')
export class RaitPoolMemberController {
  constructor(private readonly service: RaitPoolMemberService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_POOL_MEMBER_CREATE',
    entity: 'inf.rait_pool_member',
  })
  create(@Body() dto: CreateRaitPoolMemberDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_POOL_MEMBER_UPDATE',
    entity: 'inf.rait_pool_member',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitPoolMemberDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_POOL_MEMBER_DELETE',
    entity: 'inf.rait_pool_member',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
