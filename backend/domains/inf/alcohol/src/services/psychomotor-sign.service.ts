// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
import { Injectable } from '@nestjs/common';
import { PsychomotorSignRepository } from '../repositories/psychomotor-sign.repository.js';
import type { PsychomotorSign } from '../entities/psychomotor-sign.entity.js';
import type { CreatePsychomotorSignDto } from '../dto/create-psychomotor-sign.dto.js';

@Injectable()
export class PsychomotorSignService {
  constructor(private readonly repository: PsychomotorSignRepository) {}
  findAll(): Promise<PsychomotorSign[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<PsychomotorSign> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePsychomotorSignDto): Promise<PsychomotorSign> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreatePsychomotorSignDto>,
  ): Promise<PsychomotorSign> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
