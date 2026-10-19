// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
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
