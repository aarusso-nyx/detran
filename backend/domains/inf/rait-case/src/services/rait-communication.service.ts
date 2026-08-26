// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:badca32b76e1022606203a012cf996ec5b175c2226d13b99d80123cb84352167
import { Injectable } from '@nestjs/common';
import { RaitCommunicationRepository } from '../repositories/rait-communication.repository.js';
import type { RaitCommunication } from '../entities/rait-communication.entity.js';
import type { CreateRaitCommunicationDto } from '../dto/create-rait-communication.dto.js';

@Injectable()
export class RaitCommunicationService {
  constructor(private readonly repository: RaitCommunicationRepository) {}
  findAll(): Promise<RaitCommunication[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitCommunication> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitCommunicationDto): Promise<RaitCommunication> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitCommunicationDto>,
  ): Promise<RaitCommunication> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
