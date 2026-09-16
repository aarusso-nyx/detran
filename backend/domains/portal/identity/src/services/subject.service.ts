// Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c
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
