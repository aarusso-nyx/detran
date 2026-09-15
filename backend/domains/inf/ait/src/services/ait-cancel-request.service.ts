// Generated from BP-INF-AIT-001 v1.1.0 sha256:de3a429b81e860fb45d3abba728570d01cdfd3b886f55ff770273d4d6fff365f
import { Injectable } from '@nestjs/common';
import { AitCancelRequestRepository } from '../repositories/ait-cancel-request.repository.js';
import type { AitCancelRequest } from '../entities/ait-cancel-request.entity.js';
import type { CreateAitCancelRequestDto } from '../dto/create-ait-cancel-request.dto.js';

@Injectable()
export class AitCancelRequestService {
  constructor(private readonly repository: AitCancelRequestRepository) {}
  findAll(): Promise<AitCancelRequest[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AitCancelRequest> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAitCancelRequestDto): Promise<AitCancelRequest> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAitCancelRequestDto>,
  ): Promise<AitCancelRequest> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
