// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { RaitSessionMinutesSnapshotService } from '../services/rait-session-minutes-snapshot.service.js';

@Controller('v1/inf/rait/session-minutes-snapshots')
@Resource('inf:rait-session-minutes-snapshot')
export class RaitSessionMinutesSnapshotController {
  constructor(private readonly service: RaitSessionMinutesSnapshotService) {}
}
