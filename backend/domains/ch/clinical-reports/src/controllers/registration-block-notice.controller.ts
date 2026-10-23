// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
import { Controller, Get, Param } from '@nestjs/common';
import { Action, Resource } from '@detran/shared';
import { RegistrationBlockNoticeService } from '../services/registration-block-notice.service.js';

@Controller('v1/ch/registration-block-notices')
@Resource('ch:registration-block-notice')
export class RegistrationBlockNoticeController {
  constructor(private readonly service: RegistrationBlockNoticeService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
