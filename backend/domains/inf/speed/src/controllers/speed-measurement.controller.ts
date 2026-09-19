// Generated from BP-INF-SPEED-001 v1.1.0 sha256:a7576a43ce5eca2a2e93dd79ac603a578aa6e7b0127a6dc276c749cd38b02411
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
import type { CreateSpeedMeasurementDto } from '../dto/create-speed-measurement.dto.js';
import { SpeedMeasurementService } from '../services/speed-measurement.service.js';

@Controller('v1/inf/speed/measurements')
@Resource('inf:speed-measurement')
export class SpeedMeasurementController {
  constructor(private readonly service: SpeedMeasurementService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_SPEED_MEASUREMENT_CREATE',
    entity: 'inf.speed_measurement',
  })
  create(@Body() dto: CreateSpeedMeasurementDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_SPEED_MEASUREMENT_UPDATE',
    entity: 'inf.speed_measurement',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateSpeedMeasurementDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_SPEED_MEASUREMENT_DELETE',
    entity: 'inf.speed_measurement',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
