// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
import { Injectable } from '@nestjs/common';
import { ProvisioningGrantReservationBindingRepository } from '../repositories/provisioning-grant-reservation-binding.repository.js';
import type { ProvisioningGrantReservationBinding } from '../entities/provisioning-grant-reservation-binding.entity.js';
import type { CreateProvisioningGrantReservationBindingDto } from '../dto/create-provisioning-grant-reservation-binding.dto.js';

@Injectable()
export class ProvisioningGrantReservationBindingService {
  constructor(
    private readonly repository: ProvisioningGrantReservationBindingRepository,
  ) {}
  findAll(): Promise<ProvisioningGrantReservationBinding[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ProvisioningGrantReservationBinding> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateProvisioningGrantReservationBindingDto,
  ): Promise<ProvisioningGrantReservationBinding> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProvisioningGrantReservationBindingDto>,
  ): Promise<ProvisioningGrantReservationBinding> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
