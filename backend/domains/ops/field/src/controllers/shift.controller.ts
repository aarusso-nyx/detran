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
import type { CreateShiftDto } from '../dto/create-shift.dto.js';
import { ShiftService } from '../services/shift.service.js';

@Controller('v1/ops/field/shifts')
@Resource('ops:shift')
export class ShiftController {
  constructor(private readonly service: ShiftService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'OPS_OPS_SHIFT_CREATE', entity: 'ops.ops_shift' })
  create(@Body() dto: CreateShiftDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'OPS_OPS_SHIFT_UPDATE', entity: 'ops.ops_shift' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateShiftDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'OPS_OPS_SHIFT_DELETE', entity: 'ops.ops_shift' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
