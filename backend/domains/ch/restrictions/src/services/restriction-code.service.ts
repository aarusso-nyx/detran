// Generated from BP-CH-RESTRICTIONS-001 v1.0.0 sha256:05527c0aea012ece64e79955246e666899d444700b824e484f1800ff151769bf
import { Injectable } from '@nestjs/common';
import { RestrictionCodeRepository } from '../repositories/restriction-code.repository.js';
import type { RestrictionCode } from '../entities/restriction-code.entity.js';
import type { CreateRestrictionCodeDto } from '../dto/create-restriction-code.dto.js';

@Injectable()
export class RestrictionCodeService {
  constructor(private readonly repository: RestrictionCodeRepository) {}
  findAll(): Promise<RestrictionCode[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RestrictionCode> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRestrictionCodeDto): Promise<RestrictionCode> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRestrictionCodeDto>,
  ): Promise<RestrictionCode> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
