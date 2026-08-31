// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:6257f652f4d63bb50c213e96f5977765a32de34bf9f211bea0c1d69d6f2a54db
import { Injectable } from '@nestjs/common';
import { BiometricStationRepository } from '../repositories/biometric-station.repository.js';
import type { BiometricStation } from '../entities/biometric-station.entity.js';
import type { CreateBiometricStationDto } from '../dto/create-biometric-station.dto.js';

@Injectable()
export class BiometricStationService {
  constructor(private readonly repository: BiometricStationRepository) {}
  findAll(): Promise<BiometricStation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<BiometricStation> {
    return this.repository.findOne(id);
  }
  create(dto: CreateBiometricStationDto): Promise<BiometricStation> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateBiometricStationDto>,
  ): Promise<BiometricStation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
