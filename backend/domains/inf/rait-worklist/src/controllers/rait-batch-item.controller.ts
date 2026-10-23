// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { RaitBatchItemService } from '../services/rait-batch-item.service.js';

@Controller('v1/inf/rait/batch-items')
@Resource('inf:rait-batch-item')
export class RaitBatchItemController {
  constructor(private readonly service: RaitBatchItemService) {}
}
