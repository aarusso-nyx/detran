// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
import { Injectable } from '@nestjs/common';
import { RaitIncidentRepository } from '../repositories/rait-incident.repository.js';
import type { RaitIncident } from '../entities/rait-incident.entity.js';
import type { CreateRaitIncidentDto } from '../dto/create-rait-incident.dto.js';

@Injectable()
export class RaitIncidentService {
  constructor(private readonly repository: RaitIncidentRepository) {}
  findAll(): Promise<RaitIncident[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitIncident> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitIncidentDto): Promise<RaitIncident> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitIncidentDto>,
  ): Promise<RaitIncident> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
