// Generated from BP-PORTAL-INBOX-001 v1.0.2 sha256:c04ef2d9c11828696abb081206e353636a01f9f86c39e28acfc0ada5addf53da
import { Injectable } from '@nestjs/common';
import { PushSubscriptionRepository } from '../repositories/push-subscription.repository.js';
import type { PushSubscription } from '../entities/push-subscription.entity.js';
import type { CreatePushSubscriptionDto } from '../dto/create-push-subscription.dto.js';

@Injectable()
export class PushSubscriptionService {
  constructor(private readonly repository: PushSubscriptionRepository) {}
  findAll(): Promise<PushSubscription[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<PushSubscription> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePushSubscriptionDto): Promise<PushSubscription> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreatePushSubscriptionDto>,
  ): Promise<PushSubscription> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
