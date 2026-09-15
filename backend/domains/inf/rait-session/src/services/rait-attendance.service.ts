// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
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
