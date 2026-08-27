// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
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
import type { CreateRaitCommunicationDto } from '../dto/create-rait-communication.dto.js';
import { RaitCommunicationService } from '../services/rait-communication.service.js';

@Controller('v1/inf/raitcommunications')
@Resource('inf:rait-communication')
export class RaitCommunicationController {
  constructor(private readonly service: RaitCommunicationService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_COMMUNICATION_CREATE',
    entity: 'inf.rait_communication',
  })
  create(@Body() dto: CreateRaitCommunicationDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_COMMUNICATION_UPDATE',
    entity: 'inf.rait_communication',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitCommunicationDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_COMMUNICATION_DELETE',
    entity: 'inf.rait_communication',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
