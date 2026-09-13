// Generated from BP-PORTAL-COMPLAINTS-001 v1.0.0 sha256:8c3bc3ce59e94126c71a50e9fad090538fbbb36536ce8c56fca3e2c64e93b60c
import { Injectable } from '@nestjs/common';
import { ComplaintRepository } from '../repositories/complaint.repository.js';
import type { Complaint } from '../entities/complaint.entity.js';
import type { CreateComplaintDto } from '../dto/create-complaint.dto.js';

@Injectable()
export class ComplaintService {
  constructor(private readonly repository: ComplaintRepository) {}
  findAll(): Promise<Complaint[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Complaint> {
    return this.repository.findOne(id);
  }
  create(dto: CreateComplaintDto): Promise<Complaint> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateComplaintDto>): Promise<Complaint> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
