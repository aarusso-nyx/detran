// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
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
import type { CreateRaitAttendanceDto } from '../dto/create-rait-attendance.dto.js';
import { RaitAttendanceService } from '../services/rait-attendance.service.js';

@Controller('v1/inf/rait/attendance')
@Resource('inf:rait-attendance')
export class RaitAttendanceController {
  constructor(private readonly service: RaitAttendanceService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_RAIT_ATTENDANCE_CREATE',
    entity: 'inf.rait_attendance',
  })
  create(@Body() dto: CreateRaitAttendanceDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'INF_RAIT_ATTENDANCE_UPDATE',
    entity: 'inf.rait_attendance',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateRaitAttendanceDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'INF_RAIT_ATTENDANCE_DELETE',
    entity: 'inf.rait_attendance',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
