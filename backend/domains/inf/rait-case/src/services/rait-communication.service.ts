// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
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
