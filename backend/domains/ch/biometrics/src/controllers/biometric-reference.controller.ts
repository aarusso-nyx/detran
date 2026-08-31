// Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939
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
import type { CreateBiometricReferenceDto } from '../dto/create-biometric-reference.dto.js';
import { BiometricReferenceService } from '../services/biometric-reference.service.js';

@Controller('v1/ch/biometrics/references')
@Resource('ch:biometric')
export class BiometricReferenceController {
  constructor(private readonly service: BiometricReferenceService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
