// Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904
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
