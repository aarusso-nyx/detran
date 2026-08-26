// Generated from BP-INF-SPEED-001 v1.0.0 sha256:621c9dd37f71bc7fbb14a32b3df72d186e5f6f5d513de297d5559c3ac37ae44e
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
