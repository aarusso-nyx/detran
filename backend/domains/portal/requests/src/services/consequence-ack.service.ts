// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
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
