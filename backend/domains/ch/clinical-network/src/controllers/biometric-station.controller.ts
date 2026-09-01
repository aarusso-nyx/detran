// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:82e75f24c423a323e597e8da9f59db8f0ac0c54ce3edd34ae7e02895d71a176e
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
import type { CreateBiometricStationDto } from '../dto/create-biometric-station.dto.js';
import { BiometricStationService } from '../services/biometric-station.service.js';

@Controller('v1/ch/clinical-network/biometric-stations')
@Resource('ch:biometric-station')
export class BiometricStationController {
  constructor(private readonly service: BiometricStationService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'CH_BIOMETRIC_STATION_CREATE',
    entity: 'ch.biometric_station',
  })
  create(@Body() dto: CreateBiometricStationDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'CH_BIOMETRIC_STATION_UPDATE',
    entity: 'ch.biometric_station',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateBiometricStationDto>,
  ) {
    return this.service.update(id, dto);
  }
}
