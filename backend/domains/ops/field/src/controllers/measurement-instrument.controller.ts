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
import type { CreateMeasurementInstrumentDto } from '../dto/create-measurement-instrument.dto.js';
import { MeasurementInstrumentService } from '../services/measurement-instrument.service.js';

@Controller('v1/ops/field/measurement-instruments')
@Resource('ops:measurement-instrument')
export class MeasurementInstrumentController {
  constructor(private readonly service: MeasurementInstrumentService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'OPS_OPS_MEASUREMENT_INSTRUMENT_CREATE',
    entity: 'ops.ops_measurement_instrument',
  })
  create(@Body() dto: CreateMeasurementInstrumentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'OPS_OPS_MEASUREMENT_INSTRUMENT_UPDATE',
    entity: 'ops.ops_measurement_instrument',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateMeasurementInstrumentDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'OPS_OPS_MEASUREMENT_INSTRUMENT_DELETE',
    entity: 'ops.ops_measurement_instrument',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
