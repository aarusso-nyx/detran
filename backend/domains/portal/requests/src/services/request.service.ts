// Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904
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
