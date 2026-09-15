// Generated from BP-INF-COLLECTION-001 v1.0.1 sha256:eb2537783873c7670d66ebe362abad2fe79a9d8e834a0fd30145389f995741d6
import { Injectable } from '@nestjs/common';
import { RefundOrderRepository } from '../repositories/refund-order.repository.js';
import type { RefundOrder } from '../entities/refund-order.entity.js';
import type { CreateRefundOrderDto } from '../dto/create-refund-order.dto.js';

@Injectable()
export class RefundOrderService {
  constructor(private readonly repository: RefundOrderRepository) {}
  findAll(): Promise<RefundOrder[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RefundOrder> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRefundOrderDto): Promise<RefundOrder> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRefundOrderDto>): Promise<RefundOrder> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
