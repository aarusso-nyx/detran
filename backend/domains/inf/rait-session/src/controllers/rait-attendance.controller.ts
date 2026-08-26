// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
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

@Controller('v1/inf/raitattendance')
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
