// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { RaitDraftService } from '../services/rait-draft.service.js';

@Controller('v1/inf/rait/drafts')
@Resource('inf:rait-draft')
export class RaitDraftController {
  constructor(private readonly service: RaitDraftService) {}
}
