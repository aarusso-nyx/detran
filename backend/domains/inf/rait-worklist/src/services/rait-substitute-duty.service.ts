// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
import { Injectable } from '@nestjs/common';
import { RaitSubstituteDutyRepository } from '../repositories/rait-substitute-duty.repository.js';
import type { RaitSubstituteDuty } from '../entities/rait-substitute-duty.entity.js';
import type { CreateRaitSubstituteDutyDto } from '../dto/create-rait-substitute-duty.dto.js';

@Injectable()
export class RaitSubstituteDutyService {
  constructor(private readonly repository: RaitSubstituteDutyRepository) {}
  findAll(): Promise<RaitSubstituteDuty[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitSubstituteDuty> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitSubstituteDutyDto): Promise<RaitSubstituteDuty> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitSubstituteDutyDto>,
  ): Promise<RaitSubstituteDuty> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
