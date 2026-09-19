// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:1861cc41e71895a553a106b4be9f7f02958d1829af65885904d1c8f6a9aeb07c
import { Injectable } from '@nestjs/common';
import { RequestAttachmentRepository } from '../repositories/request-attachment.repository.js';
import type { RequestAttachment } from '../entities/request-attachment.entity.js';
import type { CreateRequestAttachmentDto } from '../dto/create-request-attachment.dto.js';

@Injectable()
export class RequestAttachmentService {
  constructor(private readonly repository: RequestAttachmentRepository) {}
  findAll(): Promise<RequestAttachment[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RequestAttachment> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRequestAttachmentDto): Promise<RequestAttachment> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRequestAttachmentDto>,
  ): Promise<RequestAttachment> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
