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
import type { CreateNoticeAcknowledgementDto } from '../dto/create-notice-acknowledgement.dto.js';
import { NoticeAcknowledgementService } from '../services/notice-acknowledgement.service.js';

@Controller('v1/inf/notification/acknowledgements')
@Resource('inf:notice-acknowledgement')
export class NoticeAcknowledgementController {
  constructor(private readonly service: NoticeAcknowledgementService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_NOTICE_ACKNOWLEDGEMENT_CREATE',
    entity: 'inf.notice_acknowledgement',
  })
  create(@Body() dto: CreateNoticeAcknowledgementDto) {
    return this.service.create(dto);
  }
}
