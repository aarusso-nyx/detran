// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:9553391da82dfaf5acf236128822deb730f18b660ab5416e12bdbb0014ca1c7f
import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository.js';
import type { Payment } from '../entities/payment.entity.js';
import type { CreatePaymentDto } from '../dto/create-payment.dto.js';

@Injectable()
export class PaymentService {
  constructor(private readonly repository: PaymentRepository) {}
  findAll(): Promise<Payment[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Payment> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePaymentDto): Promise<Payment> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreatePaymentDto>): Promise<Payment> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
