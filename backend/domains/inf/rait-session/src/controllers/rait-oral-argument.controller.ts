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
import type { CreateRaitOralArgumentDto } from '../dto/create-rait-oral-argument.dto.js';
import { RaitOralArgumentService } from '../services/rait-oral-argument.service.js';

@Controller('v1/inf/raitoral-arguments')
@Resource('inf:rait-oral-argument')
export class RaitOralArgumentController {
  constructor(private readonly service: RaitOralArgumentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_ORAL_ARGUMENT_CREATE',
    entity: 'inf.rait_oral_argument',
  })
  create(@Body() dto: CreateRaitOralArgumentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_ORAL_ARGUMENT_UPDATE',
    entity: 'inf.rait_oral_argument',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitOralArgumentDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_ORAL_ARGUMENT_DELETE',
    entity: 'inf.rait_oral_argument',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
