// Generated from BP-INF-AIT-001 v1.2.0 sha256:7501ee3ae148ed392c384119fcce2158f0accb353d0ce4c4406b3863321a28ea
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
