// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
import { Injectable } from '@nestjs/common';
import { RaitPartyRepository } from '../repositories/rait-party.repository.js';
import type { RaitParty } from '../entities/rait-party.entity.js';
import type { CreateRaitPartyDto } from '../dto/create-rait-party.dto.js';

@Injectable()
export class RaitPartyService {
  constructor(private readonly repository: RaitPartyRepository) {}
  findAll(): Promise<RaitParty[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitParty> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitPartyDto): Promise<RaitParty> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitPartyDto>): Promise<RaitParty> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
