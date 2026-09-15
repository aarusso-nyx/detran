// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
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
