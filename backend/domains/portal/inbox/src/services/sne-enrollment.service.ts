// Generated from BP-PORTAL-INBOX-001 v1.0.2 sha256:c04ef2d9c11828696abb081206e353636a01f9f86c39e28acfc0ada5addf53da
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
