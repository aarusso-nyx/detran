// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
import { Injectable } from '@nestjs/common';
import { FeedbackRequestRepository } from '../repositories/feedback-request.repository.js';
import type { FeedbackRequest } from '../entities/feedback-request.entity.js';
import type { CreateFeedbackRequestDto } from '../dto/create-feedback-request.dto.js';

@Injectable()
export class FeedbackRequestService {
  constructor(private readonly repository: FeedbackRequestRepository) {}
  findAll(): Promise<FeedbackRequest[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<FeedbackRequest> {
    return this.repository.findOne(id);
  }
  create(dto: CreateFeedbackRequestDto): Promise<FeedbackRequest> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateFeedbackRequestDto>,
  ): Promise<FeedbackRequest> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
