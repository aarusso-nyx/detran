// Generated from BP-PORTAL-IDENTITY-001 v1.0.2 sha256:bbfa6f4431768ff2ab5f9af097062b47775c79afb1a954ff7fb21b2c7743e4ea
import { Injectable } from '@nestjs/common';
import { SubjectRepository } from '../repositories/subject.repository.js';
import type { Subject } from '../entities/subject.entity.js';
import type { CreateSubjectDto } from '../dto/create-subject.dto.js';

@Injectable()
export class SubjectService {
  constructor(private readonly repository: SubjectRepository) {}
  findAll(): Promise<Subject[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Subject> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSubjectDto): Promise<Subject> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateSubjectDto>): Promise<Subject> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
