// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:9e9bbc2f438a9fcb8207678f2c0927e3013d7ec0f104563fbebaf3ac446c8f7a
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
