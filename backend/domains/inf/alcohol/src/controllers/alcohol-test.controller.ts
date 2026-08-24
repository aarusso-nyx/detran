// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
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
import type { CreateAlcoholTestDto } from '../dto/create-alcohol-test.dto.js';
import { AlcoholTestService } from '../services/alcohol-test.service.js';

@Controller('v1/inf/alcoholtests')
@Resource('inf:alcohol-test')
export class AlcoholTestController {
  constructor(private readonly service: AlcoholTestService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_ALCOHOL_TEST_CREATE', entity: 'inf.alcohol_test' })
  create(@Body() dto: CreateAlcoholTestDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_ALCOHOL_TEST_UPDATE', entity: 'inf.alcohol_test' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateAlcoholTestDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_ALCOHOL_TEST_DELETE', entity: 'inf.alcohol_test' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
