// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
import { Injectable } from '@nestjs/common';
import { AlcoholForwardingRepository } from '../repositories/alcohol-forwarding.repository.js';
import type { AlcoholForwarding } from '../entities/alcohol-forwarding.entity.js';
import type { CreateAlcoholForwardingDto } from '../dto/create-alcohol-forwarding.dto.js';

@Injectable()
export class AlcoholForwardingService {
  constructor(private readonly repository: AlcoholForwardingRepository) {}
  findAll(): Promise<AlcoholForwarding[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AlcoholForwarding> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAlcoholForwardingDto): Promise<AlcoholForwarding> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAlcoholForwardingDto>,
  ): Promise<AlcoholForwarding> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
