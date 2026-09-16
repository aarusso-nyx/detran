// Generated from BP-PORTAL-INBOX-001 v1.0.1 sha256:1ddffdafcda20768cbaa66e39e4ee4f5346513517e6bb95c6216878d42314ccd
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
