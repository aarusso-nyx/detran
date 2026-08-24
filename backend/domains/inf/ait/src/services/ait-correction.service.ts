// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
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
