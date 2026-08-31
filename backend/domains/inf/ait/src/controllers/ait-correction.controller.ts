// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
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
import type { CreateAitCorrectionDto } from '../dto/create-ait-correction.dto.js';
import { AitCorrectionService } from '../services/ait-correction.service.js';

@Controller('v1/inf/ait/corrections')
@Resource('inf:ait-correction')
export class AitCorrectionController {
  constructor(private readonly service: AitCorrectionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_AIT_CORRECTION_CREATE', entity: 'inf.ait_correction' })
  create(@Body() dto: CreateAitCorrectionDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_AIT_CORRECTION_UPDATE', entity: 'inf.ait_correction' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAitCorrectionDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_AIT_CORRECTION_DELETE', entity: 'inf.ait_correction' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
