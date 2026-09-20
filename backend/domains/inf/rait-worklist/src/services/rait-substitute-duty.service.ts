// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
