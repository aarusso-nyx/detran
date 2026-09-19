// Generated from BP-INF-SPEED-001 v1.1.0 sha256:a7576a43ce5eca2a2e93dd79ac603a578aa6e7b0127a6dc276c749cd38b02411
import { Injectable } from '@nestjs/common';
import { SpeedMeterCertificateRepository } from '../repositories/speed-meter-certificate.repository.js';
import type { SpeedMeterCertificate } from '../entities/speed-meter-certificate.entity.js';
import type { CreateSpeedMeterCertificateDto } from '../dto/create-speed-meter-certificate.dto.js';

@Injectable()
export class SpeedMeterCertificateService {
  constructor(private readonly repository: SpeedMeterCertificateRepository) {}
  findAll(): Promise<SpeedMeterCertificate[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<SpeedMeterCertificate> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSpeedMeterCertificateDto): Promise<SpeedMeterCertificate> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateSpeedMeterCertificateDto>,
  ): Promise<SpeedMeterCertificate> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
