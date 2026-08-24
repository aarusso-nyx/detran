import { Body, Controller, Get, Post } from '@nestjs/common';
import { Audit, Action, Resource } from '@detran/shared';
import { FrozenSnapshotService } from './index.js';
@Controller('ops/snapshots')
export class FrozenSnapshotController {
  constructor(private readonly service: FrozenSnapshotService) {}
  @Get('people') @Resource('ops:snapshot-person') @Action('read') people() {
    return this.service.list('people');
  }
  @Post('people')
  @Resource('ops:snapshot-person')
  @Action('create')
  @Audit({
    action: 'OPS_SNAPSHOT_PERSON_CREATE',
    entity: 'ops.snapshots_person',
  })
  createPerson(@Body() dto: Record<string, unknown>) {
    return this.service.create('people', dto);
  }
  @Get('vehicles')
  @Resource('ops:snapshot-vehicle')
  @Action('read')
  vehicles() {
    return this.service.list('vehicles');
  }
  @Post('vehicles')
  @Resource('ops:snapshot-vehicle')
  @Action('create')
  @Audit({
    action: 'OPS_SNAPSHOT_VEHICLE_CREATE',
    entity: 'ops.snapshots_vehicle',
  })
  createVehicle(@Body() dto: Record<string, unknown>) {
    return this.service.create('vehicles', dto);
  }
  @Post('external-queries')
  @Resource('ops:external-query')
  @Action('create')
  @Audit({
    action: 'OPS_EXTERNAL_QUERY_RECORD',
    entity: 'ops.snapshots_external_query',
  })
  createExternalQuery(@Body() dto: Record<string, unknown>) {
    return this.service.create('external-queries', dto);
  }
}
