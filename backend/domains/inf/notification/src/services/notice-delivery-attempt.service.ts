// Generated from BP-INF-NOTIFICATION-001 v1.1.1 sha256:4c103efb85b586bbe1d79e0fc7367ae2e566e53d551fa0e41fd4635207283be6
import { Injectable } from '@nestjs/common';
import { NoticeDeliveryAttemptRepository } from '../repositories/notice-delivery-attempt.repository.js';
import type { NoticeDeliveryAttempt } from '../entities/notice-delivery-attempt.entity.js';
import type { CreateNoticeDeliveryAttemptDto } from '../dto/create-notice-delivery-attempt.dto.js';

@Injectable()
export class NoticeDeliveryAttemptService {
  constructor(private readonly repository: NoticeDeliveryAttemptRepository) {}
  findAll(): Promise<NoticeDeliveryAttempt[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<NoticeDeliveryAttempt> {
    return this.repository.findOne(id);
  }
  create(dto: CreateNoticeDeliveryAttemptDto): Promise<NoticeDeliveryAttempt> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateNoticeDeliveryAttemptDto>,
  ): Promise<NoticeDeliveryAttempt> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
