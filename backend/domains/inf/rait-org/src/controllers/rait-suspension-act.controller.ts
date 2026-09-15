// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
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
import type { CreateRaitSuspensionActDto } from '../dto/create-rait-suspension-act.dto.js';
import { RaitSuspensionActService } from '../services/rait-suspension-act.service.js';

@Controller('v1/inf/rait/suspension-acts')
@Resource('inf:rait-suspension-act')
export class RaitSuspensionActController {
  constructor(private readonly service: RaitSuspensionActService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_SUSPENSION_ACT_CREATE',
    entity: 'inf.rait_suspension_act',
  })
  create(@Body() dto: CreateRaitSuspensionActDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_SUSPENSION_ACT_UPDATE',
    entity: 'inf.rait_suspension_act',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitSuspensionActDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_SUSPENSION_ACT_DELETE',
    entity: 'inf.rait_suspension_act',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
