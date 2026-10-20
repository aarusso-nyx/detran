// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
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
