// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
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
import type { CreateCrashRenaestSubmissionDto } from '../dto/create-crash-renaest-submission.dto.js';
import { CrashRenaestSubmissionService } from '../services/crash-renaest-submission.service.js';

@Controller('v1/est/crash/renaest-submissions')
@Resource('est:crash-renaest-submission')
export class CrashRenaestSubmissionController {
  constructor(private readonly service: CrashRenaestSubmissionService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'EST_CRASH_RENAEST_SUBMISSION_CREATE',
    entity: 'est.crash_renaest_submission',
  })
  create(@Body() dto: CreateCrashRenaestSubmissionDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({
    action: 'EST_CRASH_RENAEST_SUBMISSION_UPDATE',
    entity: 'est.crash_renaest_submission',
  })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCrashRenaestSubmissionDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({
    action: 'EST_CRASH_RENAEST_SUBMISSION_DELETE',
    entity: 'est.crash_renaest_submission',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
