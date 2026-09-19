// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
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
import type { CreateCrashSubjectRequestDto } from '../dto/create-crash-subject-request.dto.js';
import { CrashSubjectRequestService } from '../services/crash-subject-request.service.js';

@Controller('v1/est/crash/subject-requests')
@Resource('est:crash-subject-request')
export class CrashSubjectRequestController {
  constructor(private readonly service: CrashSubjectRequestService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'EST_CRASH_SUBJECT_REQUEST_CREATE',
    entity: 'est.crash_subject_request',
  })
  create(@Body() dto: CreateCrashSubjectRequestDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'EST_CRASH_SUBJECT_REQUEST_UPDATE',
    entity: 'est.crash_subject_request',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCrashSubjectRequestDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'EST_CRASH_SUBJECT_REQUEST_DELETE',
    entity: 'est.crash_subject_request',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
