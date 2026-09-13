// Generated from BP-CH-TOXICOLOGY-001 v1.0.0 sha256:9bd4b4e46865f6ee6a771bb9c561b1dddfdf2c684b8dc7b2d45a1fb3fbcb5062
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
import type { CreateToxicologySuspensionDto } from '../dto/create-toxicology-suspension.dto.js';
import { ToxicologySuspensionService } from '../services/toxicology-suspension.service.js';

@Controller('v1/ch/toxicology/suspensions')
@Resource('ch:tox')
export class ToxicologySuspensionController {
  constructor(private readonly service: ToxicologySuspensionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
