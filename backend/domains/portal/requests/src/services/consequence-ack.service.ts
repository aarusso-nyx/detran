// Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904
import { Injectable } from '@nestjs/common';
import { ConsequenceAckRepository } from '../repositories/consequence-ack.repository.js';
import type { ConsequenceAck } from '../entities/consequence-ack.entity.js';
import type { CreateConsequenceAckDto } from '../dto/create-consequence-ack.dto.js';

@Injectable()
export class ConsequenceAckService {
  constructor(private readonly repository: ConsequenceAckRepository) {}
  findAll(): Promise<ConsequenceAck[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ConsequenceAck> {
    return this.repository.findOne(id);
  }
  create(dto: CreateConsequenceAckDto): Promise<ConsequenceAck> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateConsequenceAckDto>,
  ): Promise<ConsequenceAck> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
