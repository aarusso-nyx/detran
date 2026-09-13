// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
import { Injectable } from '@nestjs/common';
import { RegistrationBlockNoticeRepository } from '../repositories/registration-block-notice.repository.js';
import type { RegistrationBlockNotice } from '../entities/registration-block-notice.entity.js';
import type { CreateRegistrationBlockNoticeDto } from '../dto/create-registration-block-notice.dto.js';

@Injectable()
export class RegistrationBlockNoticeService {
  constructor(private readonly repository: RegistrationBlockNoticeRepository) {}
  findAll(): Promise<RegistrationBlockNotice[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RegistrationBlockNotice> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateRegistrationBlockNoticeDto,
  ): Promise<RegistrationBlockNotice> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRegistrationBlockNoticeDto>,
  ): Promise<RegistrationBlockNotice> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
