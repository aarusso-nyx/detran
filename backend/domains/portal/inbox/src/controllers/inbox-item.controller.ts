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
import type { CreateInboxItemDto } from '../dto/create-inbox-item.dto.js';
import { InboxItemService } from '../services/inbox-item.service.js';

@Controller('v1/portal/inbox/items')
@Resource('portal:inbox-item')
export class InboxItemController {
  constructor(private readonly service: InboxItemService) {}
}
