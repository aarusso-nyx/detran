// Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939
import { Controller, Get, Param } from '@nestjs/common';
import { Action, Resource } from '@detran/shared';
import { BiometricExceptionService } from '../services/biometric-exception.service.js';

@Controller('v1/ch/biometrics/exceptions')
@Resource('ch:biometric-exception')
export class BiometricExceptionController {
  constructor(private readonly service: BiometricExceptionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
