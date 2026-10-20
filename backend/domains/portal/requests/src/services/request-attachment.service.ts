// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
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
