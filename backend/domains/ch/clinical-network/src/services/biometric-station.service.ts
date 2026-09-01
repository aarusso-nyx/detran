// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:82e75f24c423a323e597e8da9f59db8f0ac0c54ce3edd34ae7e02895d71a176e
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
