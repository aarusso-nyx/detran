// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
