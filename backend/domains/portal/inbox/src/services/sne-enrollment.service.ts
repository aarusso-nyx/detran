// Generated from BP-PORTAL-INBOX-001 v1.0.1 sha256:1ddffdafcda20768cbaa66e39e4ee4f5346513517e6bb95c6216878d42314ccd
import { Injectable } from '@nestjs/common';
import { SneEnrollmentRepository } from '../repositories/sne-enrollment.repository.js';
import type { SneEnrollment } from '../entities/sne-enrollment.entity.js';
import type { CreateSneEnrollmentDto } from '../dto/create-sne-enrollment.dto.js';

@Injectable()
export class SneEnrollmentService {
  constructor(private readonly repository: SneEnrollmentRepository) {}
  findAll(): Promise<SneEnrollment[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<SneEnrollment> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSneEnrollmentDto): Promise<SneEnrollment> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateSneEnrollmentDto>,
  ): Promise<SneEnrollment> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
