// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
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
import type { CreateOperationDto } from '../dto/create-operation.dto.js';
import { OperationService } from '../services/operation.service.js';

@Controller('v1/ops/field/operations')
@Resource('ops:operation')
export class OperationController {
  constructor(private readonly service: OperationService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'OPS_OPS_OPERATION_CREATE', entity: 'ops.ops_operation' })
  create(@Body() dto: CreateOperationDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'OPS_OPS_OPERATION_UPDATE', entity: 'ops.ops_operation' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateOperationDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'OPS_OPS_OPERATION_DELETE', entity: 'ops.ops_operation' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
