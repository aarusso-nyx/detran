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
import type { CreateRaitAssignmentDto } from '../dto/create-rait-assignment.dto.js';
import { RaitAssignmentService } from '../services/rait-assignment.service.js';

@Controller('v1/inf/raitassignments')
@Resource('inf:rait-assignment')
export class RaitAssignmentController {
  constructor(private readonly service: RaitAssignmentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_ASSIGNMENT_CREATE',
    entity: 'inf.rait_assignment',
  })
  create(@Body() dto: CreateRaitAssignmentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_ASSIGNMENT_UPDATE',
    entity: 'inf.rait_assignment',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitAssignmentDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_ASSIGNMENT_DELETE',
    entity: 'inf.rait_assignment',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
