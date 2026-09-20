// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
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
import type { CreateRaitMinutesSignatureReceiptDto } from '../dto/create-rait-minutes-signature-receipt.dto.js';
import { RaitMinutesSignatureReceiptService } from '../services/rait-minutes-signature-receipt.service.js';

@Controller('v1/inf/rait/minutes-signature-receipts')
@Resource('inf:rait-minutes-signature-receipt')
export class RaitMinutesSignatureReceiptController {
  constructor(private readonly service: RaitMinutesSignatureReceiptService) {}
}
