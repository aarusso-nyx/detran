// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
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
