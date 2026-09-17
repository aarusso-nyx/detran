// Generated from BP-PORTAL-INBOX-001 v1.0.2 sha256:c04ef2d9c11828696abb081206e353636a01f9f86c39e28acfc0ada5addf53da
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import type { CreatePushSubscriptionDto } from '../dto/create-push-subscription.dto.js';
import { PushSubscriptionService } from '../services/push-subscription.service.js';

@Controller('v1/portal/inbox/push-subscriptions')
@Resource('portal:push-subscription')
export class PushSubscriptionController {
  constructor(private readonly service: PushSubscriptionService) {}
}
