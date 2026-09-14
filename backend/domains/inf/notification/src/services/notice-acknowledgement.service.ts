// Generated from BP-INF-NOTIFICATION-001 v1.1.1 sha256:4c103efb85b586bbe1d79e0fc7367ae2e566e53d551fa0e41fd4635207283be6
import { Injectable } from '@nestjs/common';
import { NoticeAcknowledgementRepository } from '../repositories/notice-acknowledgement.repository.js';
import type { NoticeAcknowledgement } from '../entities/notice-acknowledgement.entity.js';
import type { CreateNoticeAcknowledgementDto } from '../dto/create-notice-acknowledgement.dto.js';

@Injectable()
export class NoticeAcknowledgementService {
  constructor(private readonly repository: NoticeAcknowledgementRepository) {}
  findAll(): Promise<NoticeAcknowledgement[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<NoticeAcknowledgement> {
    return this.repository.findOne(id);
  }
  create(dto: CreateNoticeAcknowledgementDto): Promise<NoticeAcknowledgement> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateNoticeAcknowledgementDto>,
  ): Promise<NoticeAcknowledgement> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
