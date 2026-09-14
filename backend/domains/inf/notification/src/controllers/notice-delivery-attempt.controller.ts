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
import type { CreateNoticeDeliveryAttemptDto } from '../dto/create-notice-delivery-attempt.dto.js';
import { NoticeDeliveryAttemptService } from '../services/notice-delivery-attempt.service.js';

@Controller('v1/inf/notification/delivery-attempts')
@Resource('inf:notice-delivery-attempt')
export class NoticeDeliveryAttemptController {
  constructor(private readonly service: NoticeDeliveryAttemptService) {}
  @Get() @Action('read') list() {
    return this.service.findAll();
  }
  @Get(':id') @Action('read') get(@Param('id') id: string) {
    return this.service.findOne(id);
  }
  @Post()
  @Action('create')
  @Audit({
    action: 'INF_NOTICE_DELIVERY_ATTEMPT_CREATE',
    entity: 'inf.notice_delivery_attempt',
  })
  create(@Body() dto: CreateNoticeDeliveryAttemptDto) {
    return this.service.create(dto);
  }
}
