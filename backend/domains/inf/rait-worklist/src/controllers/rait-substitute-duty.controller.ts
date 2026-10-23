// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { RaitSubstituteDutyService } from '../services/rait-substitute-duty.service.js';

@Controller('v1/inf/rait/substitute-duties')
@Resource('inf:rait-substitute-duty')
export class RaitSubstituteDutyController {
  constructor(private readonly service: RaitSubstituteDutyService) {}
}
