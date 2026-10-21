// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
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
