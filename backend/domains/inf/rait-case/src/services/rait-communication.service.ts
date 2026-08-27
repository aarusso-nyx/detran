// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
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
