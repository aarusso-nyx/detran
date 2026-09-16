// Generated from BP-PORTAL-INBOX-001 v1.0.1 sha256:1ddffdafcda20768cbaa66e39e4ee4f5346513517e6bb95c6216878d42314ccd
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
