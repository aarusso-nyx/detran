// Generated from BP-INF-NOTIFICATION-001 v1.1.1 sha256:4c103efb85b586bbe1d79e0fc7367ae2e566e53d551fa0e41fd4635207283be6
import { Injectable } from '@nestjs/common';
import { NoticeRepository } from '../repositories/notice.repository.js';
import type { Notice } from '../entities/notice.entity.js';
import type { CreateNoticeDto } from '../dto/create-notice.dto.js';

@Injectable()
export class NoticeService {
  constructor(private readonly repository: NoticeRepository) {}
  findAll(): Promise<Notice[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Notice> {
    return this.repository.findOne(id);
  }
  create(dto: CreateNoticeDto): Promise<Notice> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateNoticeDto>): Promise<Notice> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
