// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
import { Injectable } from '@nestjs/common';
import { RaitClaimLegacyQualificationRepository } from '../repositories/rait-claim-legacy-qualification.repository.js';
import type { RaitClaimLegacyQualification } from '../entities/rait-claim-legacy-qualification.entity.js';
import type { CreateRaitClaimLegacyQualificationDto } from '../dto/create-rait-claim-legacy-qualification.dto.js';

@Injectable()
export class RaitClaimLegacyQualificationService {
  constructor(
    private readonly repository: RaitClaimLegacyQualificationRepository,
  ) {}
  findAll(): Promise<RaitClaimLegacyQualification[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitClaimLegacyQualification> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateRaitClaimLegacyQualificationDto,
  ): Promise<RaitClaimLegacyQualification> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitClaimLegacyQualificationDto>,
  ): Promise<RaitClaimLegacyQualification> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
