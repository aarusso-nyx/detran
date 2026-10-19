// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
