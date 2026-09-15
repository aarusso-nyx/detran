// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
