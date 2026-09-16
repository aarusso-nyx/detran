// Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904
import { Injectable } from '@nestjs/common';
import { ProtocolRepository } from '../repositories/protocol.repository.js';
import type { Protocol } from '../entities/protocol.entity.js';
import type { CreateProtocolDto } from '../dto/create-protocol.dto.js';

@Injectable()
export class ProtocolService {
  constructor(private readonly repository: ProtocolRepository) {}
  findAll(): Promise<Protocol[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Protocol> {
    return this.repository.findOne(id);
  }
  create(dto: CreateProtocolDto): Promise<Protocol> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateProtocolDto>): Promise<Protocol> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
