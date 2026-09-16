// CTG-0003 §5.1 e §5.2 (R-0008, TASK-0007) — `external-queries` sob
// `v1/ops/snapshots`. `people`/`vehicles` continuam CRUD gerado de
// `BP-OPS-SNAPSHOTS-001` (`ops:person`, `ops:vehicle`): as rotas manuscritas
// que declaravam `ops:snapshot-person`/`ops:snapshot-vehicle` saíram com as
// regras correspondentes de `policy.ts` (§7).
import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  ExternalQueryCommand,
  type CreateExternalQueryInput,
  type ExternalQueryListFilters,
} from './external-query.command.js';

@Controller('v1/ops/snapshots')
@Resource('ops:external-query')
export class FrozenSnapshotController {
  constructor(private readonly externalQuery: ExternalQueryCommand) {}

  @Get('external-queries') @Action('read') list(
    @Query() filters: ExternalQueryListFilters,
  ) {
    return this.externalQuery.list(filters ?? {});
  }

  @Post('external-queries')
  @HttpCode(200)
  @Action('create')
  @Audit({
    action: 'OPS_EXTERNAL_QUERY_RECORD',
    entity: 'ops.snapshots_external_query',
  })
  create(@Body() body: CreateExternalQueryInput) {
    return this.externalQuery.execute(body);
  }
}
