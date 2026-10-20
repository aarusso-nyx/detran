// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
import { Injectable } from '@nestjs/common';
import { RequestRepository } from '../repositories/request.repository.js';
import type { Request } from '../entities/request.entity.js';
import type { CreateRequestDto } from '../dto/create-request.dto.js';

@Injectable()
export class RequestService {
  constructor(private readonly repository: RequestRepository) {}
  findAll(): Promise<Request[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Request> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRequestDto): Promise<Request> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRequestDto>): Promise<Request> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
