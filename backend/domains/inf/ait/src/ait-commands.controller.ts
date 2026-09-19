import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  Action,
  Audit,
  Resource,
  assertIfMatch,
  etagOf,
  getPrincipalFromRequest,
  type RequestLike,
} from '@detran/shared';

import type { CreateAitCorrectionDto } from './dto/create-ait-correction.dto.js';
import type { CreateAitPersonDto } from './dto/create-ait-person.dto.js';
import type { CreateAitPrintEventDto } from './dto/create-ait-print-event.dto.js';
import type { CreateAitSignatureDto } from './dto/create-ait-signature.dto.js';
import type { CreateAitVehicleDto } from './dto/create-ait-vehicle.dto.js';
import { AitLifecycleService } from './ait-lifecycle.service.js';

/** Minimal response shape needed for `ETag` — avoids a direct `express`
 * dependency in this package (CTG-0001 §9 layout lists none). */
interface ResponseLike {
  setHeader(name: string, value: string): unknown;
  status(code: number): unknown;
}

/** `If-Match` (M2, CTG-0001 §1/§4): pre-fetches `ait_ait.version`, asserts
 * the header against it, then lets `work()` run the actual command — every
 * transition bumps `version` by exactly 1, except `accept` (+2). */
async function withIfMatch<T>(
  lifecycle: AitLifecycleService,
  id: string,
  ifMatch: string | string[] | undefined,
  res: ResponseLike,
  status: number,
  bump: number,
  work: () => Promise<T>,
): Promise<T> {
  const currentVersion = await lifecycle.getVersion(id);
  assertIfMatch(ifMatch, currentVersion, 'TEAT');
  const result = await work();
  res.status(status);
  res.setHeader('ETag', etagOf(currentVersion + bump));
  return result;
}

@Controller('v1/inf/ait/aits')
@Resource('inf:ait')
export class AitCommandsController {
  constructor(private readonly lifecycle: AitLifecycleService) {}

  @Post(':id/vehicles')
  @Action('update')
  @Audit({ action: 'INF_AIT_VEHICLE_ADD', entity: 'inf.ait_vehicle' })
  vehicle(
    @Param('id') id: string,
    @Body() dto: Omit<CreateAitVehicleDto, 'ait_id'>,
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 201, 1, () =>
      this.lifecycle.addVehicle(id, dto),
    );
  }
  @Post(':id/people')
  @Action('update')
  @Audit({ action: 'INF_AIT_PERSON_ADD', entity: 'inf.ait_person' })
  person(
    @Param('id') id: string,
    @Body() dto: Omit<CreateAitPersonDto, 'ait_id'>,
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 201, 1, () =>
      this.lifecycle.addPerson(id, dto),
    );
  }
  @Post(':id/science')
  @Action('science')
  @Audit({ action: 'INF_AIT_SCIENCE', entity: 'inf.ait_signature' })
  science(
    @Param('id') id: string,
    @Body() dto: Omit<CreateAitSignatureDto, 'ait_id'>,
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 201, 1, () =>
      this.lifecycle.recordScience(id, dto),
    );
  }
  @Post(':id/print-events')
  @Action('update')
  @Audit({ action: 'INF_AIT_PRINT', entity: 'inf.ait_print_event' })
  print(
    @Param('id') id: string,
    @Body() dto: Omit<CreateAitPrintEventDto, 'ait_id'>,
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 201, 1, () =>
      this.lifecycle.recordPrint(id, dto),
    );
  }
  @Post(':id/finalize')
  @Action('finalize')
  @Audit({ action: 'INF_AIT_FINALIZE', entity: 'inf.ait_ait' })
  finalize(
    @Param('id') id: string,
    @Body() body: { user_ref?: string },
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
      this.lifecycle.finalize(id, body.user_ref),
    );
  }
  @Post(':id/queue-transmission')
  @Action('queue-transmission')
  @Audit({ action: 'INF_AIT_QUEUE', entity: 'inf.ait_ait' })
  queue(
    @Param('id') id: string,
    @Body() body: { user_ref?: string },
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
      this.lifecycle.queueTransmission(id, body.user_ref),
    );
  }
  @Post(':id/receive-protocol')
  @Action('receive-protocol')
  @Audit({ action: 'INF_AIT_PROTOCOL', entity: 'inf.ait_ait' })
  protocol(
    @Param('id') id: string,
    @Body() body: { receipt_protocol: string; user_ref?: string },
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
      this.lifecycle.receiveProtocol(id, body.receipt_protocol, body.user_ref),
    );
  }
  @Post(':id/concurrency-review')
  @Action('review-concurrency')
  @Audit({ action: 'INF_AIT_CONCURRENCY_REVIEW', entity: 'inf.ait_ait' })
  reviewConcurrency(
    @Param('id') id: string,
    @Body()
    body: {
      decision: 'release' | 'reject';
      reason: string;
      legal_basis?: string;
      user_ref?: string;
    },
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, async () => {
      const ait = await this.lifecycle.reviewConcurrency(
        id,
        body.decision,
        body.reason,
        body.user_ref,
      );
      return {
        id: ait.id,
        current_status: ait.current_status,
        version: (ait as { version?: number }).version,
        conflict_id: ait.context.conflictId,
        conflict_status: 'resolved',
      };
    });
  }
  @Post(':id/request-correction')
  @Action('request-correction')
  @Audit({ action: 'INF_AIT_CORRECTION_REQUEST', entity: 'inf.ait_ait' })
  requestCorrection(
    @Param('id') id: string,
    @Body() body: { reason: string; user_ref?: string },
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
      this.lifecycle.requestCorrection(id, body.reason, body.user_ref),
    );
  }
  @Post(':id/corrections')
  @Action('update')
  @Audit({ action: 'INF_AIT_CORRECTION_ADD', entity: 'inf.ait_correction' })
  correction(
    @Param('id') id: string,
    @Body() dto: Omit<CreateAitCorrectionDto, 'ait_id'>,
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 201, 1, () =>
      this.lifecycle.addCorrection(id, dto),
    );
  }
  @Post(':id/corrections/:correctionId/approve')
  @Action('approve-correction')
  @Audit({ action: 'INF_AIT_CORRECTION_APPROVE', entity: 'inf.ait_correction' })
  approve(
    @Param('id') id: string,
    @Param('correctionId') correctionId: string,
    @Body() body: { approved_by_user_ref: string },
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
      this.lifecycle.approveCorrection(
        id,
        correctionId,
        body.approved_by_user_ref,
      ),
    );
  }
  @Post(':id/accept')
  @Action('accept')
  @Audit({ action: 'INF_AIT_ACCEPT', entity: 'inf.ait_ait' })
  accept(
    @Param('id') id: string,
    @Body() body: { user_ref?: string },
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 2, () =>
      this.lifecycle.accept(id, body.user_ref),
    );
  }
  @Post(':id/reject')
  @Action('reject')
  @Audit({ action: 'INF_AIT_REJECT', entity: 'inf.ait_ait' })
  reject(
    @Param('id') id: string,
    @Body() body: { reason: string; user_ref?: string },
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
      this.lifecycle.reject(id, body.reason, body.user_ref),
    );
  }
  @Post(':id/archive')
  @Action('archive')
  @Audit({ action: 'INF_AIT_ARCHIVE', entity: 'inf.ait_ait' })
  archive(
    @Param('id') id: string,
    @Body() body: { reason: string; legal_basis?: string; user_ref?: string },
    @Headers('if-match') ifMatch: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
    @Req() req: RequestLike,
  ) {
    const principal = getPrincipalFromRequest(req);
    return withIfMatch(this.lifecycle, id, ifMatch, res, 200, 1, () =>
      this.lifecycle.archive(id, body.reason, body.user_ref ?? principal?.id),
    );
  }
}
