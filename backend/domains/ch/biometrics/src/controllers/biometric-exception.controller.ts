// Generated from BP-CH-BIOMETRICS-001 v1.0.0 sha256:918eef902a9909e28862909f968b34aade0b443ebe3741b3823b9b1761d3cdbb
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
import type { CreateBiometricExceptionDto } from '../dto/create-biometric-exception.dto.js';
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
