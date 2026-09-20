// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
import { Injectable } from '@nestjs/common';
import { RaitMinutesSignatureReceiptRepository } from '../repositories/rait-minutes-signature-receipt.repository.js';
import type { RaitMinutesSignatureReceipt } from '../entities/rait-minutes-signature-receipt.entity.js';
import type { CreateRaitMinutesSignatureReceiptDto } from '../dto/create-rait-minutes-signature-receipt.dto.js';

@Injectable()
export class RaitMinutesSignatureReceiptService {
  constructor(
    private readonly repository: RaitMinutesSignatureReceiptRepository,
  ) {}
  findAll(): Promise<RaitMinutesSignatureReceipt[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitMinutesSignatureReceipt> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateRaitMinutesSignatureReceiptDto,
  ): Promise<RaitMinutesSignatureReceipt> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitMinutesSignatureReceiptDto>,
  ): Promise<RaitMinutesSignatureReceipt> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
