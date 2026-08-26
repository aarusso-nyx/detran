// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
import { Injectable } from '@nestjs/common';
import { RaitAttendanceRepository } from '../repositories/rait-attendance.repository.js';
import type { RaitAttendance } from '../entities/rait-attendance.entity.js';
import type { CreateRaitAttendanceDto } from '../dto/create-rait-attendance.dto.js';

@Injectable()
export class RaitAttendanceService {
  constructor(private readonly repository: RaitAttendanceRepository) {}
  findAll(): Promise<RaitAttendance[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitAttendance> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitAttendanceDto): Promise<RaitAttendance> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitAttendanceDto>,
  ): Promise<RaitAttendance> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
