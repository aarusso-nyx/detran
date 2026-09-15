// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
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
import type { CreateRaitHolidayDto } from '../dto/create-rait-holiday.dto.js';
import { RaitHolidayService } from '../services/rait-holiday.service.js';

@Controller('v1/inf/rait/holidays')
@Resource('inf:rait-holiday')
export class RaitHolidayController {
  constructor(private readonly service: RaitHolidayService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_RAIT_HOLIDAY_CREATE', entity: 'inf.rait_holiday' })
  create(@Body() dto: CreateRaitHolidayDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_RAIT_HOLIDAY_UPDATE', entity: 'inf.rait_holiday' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRaitHolidayDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_RAIT_HOLIDAY_DELETE', entity: 'inf.rait_holiday' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
