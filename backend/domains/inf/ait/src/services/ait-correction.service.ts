// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
import { Injectable } from '@nestjs/common';
import { AitCorrectionRepository } from '../repositories/ait-correction.repository.js';
import type { AitCorrection } from '../entities/ait-correction.entity.js';
import type { CreateAitCorrectionDto } from '../dto/create-ait-correction.dto.js';

@Injectable()
export class AitCorrectionService {
  constructor(private readonly repository: AitCorrectionRepository) {}
  findAll(): Promise<AitCorrection[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AitCorrection> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAitCorrectionDto): Promise<AitCorrection> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAitCorrectionDto>,
  ): Promise<AitCorrection> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
