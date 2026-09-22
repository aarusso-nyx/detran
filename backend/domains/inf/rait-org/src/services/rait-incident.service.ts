// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
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
