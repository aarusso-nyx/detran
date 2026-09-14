// Generated from BP-INF-NOTIFICATION-001 v1.1.1 sha256:4c103efb85b586bbe1d79e0fc7367ae2e566e53d551fa0e41fd4635207283be6
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
import type { CreateNoticeDto } from '../dto/create-notice.dto.js';
import { NoticeService } from '../services/notice.service.js';

@Controller('v1/inf/notification/notices')
@Resource('inf:notice')
export class NoticeController {
  constructor(private readonly service: NoticeService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({ action: 'INF_NOTICE_CREATE', entity: 'inf.notice' })
  create(@Body() dto: CreateNoticeDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Action('update')
  @Audit({ action: 'INF_NOTICE_UPDATE', entity: 'inf.notice' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateNoticeDto>) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Action('delete')
  @Audit({ action: 'INF_NOTICE_DELETE', entity: 'inf.notice' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
