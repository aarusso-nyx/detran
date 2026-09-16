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
import type { CreateSpeedMeterCertificateDto } from '../dto/create-speed-meter-certificate.dto.js';
import { SpeedMeterCertificateService } from '../services/speed-meter-certificate.service.js';

@Controller('v1/inf/speed/certificates')
@Resource('inf:speed-meter-certificate')
export class SpeedMeterCertificateController {
  constructor(private readonly service: SpeedMeterCertificateService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_SPEED_METER_CERTIFICATE_CREATE',
    entity: 'inf.speed_meter_certificate',
  })
  create(@Body() dto: CreateSpeedMeterCertificateDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_SPEED_METER_CERTIFICATE_UPDATE',
    entity: 'inf.speed_meter_certificate',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateSpeedMeterCertificateDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_SPEED_METER_CERTIFICATE_DELETE',
    entity: 'inf.speed_meter_certificate',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
