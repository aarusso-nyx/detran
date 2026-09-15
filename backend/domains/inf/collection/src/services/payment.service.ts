// Generated from BP-INF-COLLECTION-001 v1.0.1 sha256:eb2537783873c7670d66ebe362abad2fe79a9d8e834a0fd30145389f995741d6
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
