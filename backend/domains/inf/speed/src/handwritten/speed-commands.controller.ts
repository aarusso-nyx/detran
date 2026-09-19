// CTG-0004 §6 (R-0008, TASK-0009) — `POST /v1/inf/speed/measurements`.
// Módulo só monta atrás de `teat.speed_meters` (app.module.ts); a política
// já cobre a superfície CRUD de `inf:speed-measurement:create`
// (`INF_SURFACE_RULES`, CTG-0004 §6).
import { Body, Controller, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';

import {
  CreateMeasurementCommand,
  type CreateSpeedMeasurementInput,
} from './create-measurement.command.js';

@Controller('v1/inf/speed/measurements')
@Resource('inf:speed-measurement')
export class SpeedCommandsController {
  private readonly command: CreateMeasurementCommand;

  constructor(database: Database, requestContext: RequestContext) {
    this.command = new CreateMeasurementCommand({
      database,
      requestContext,
      repositories: {},
      clock: { now: () => new Date().toISOString() },
    });
  }

  @Post()
  @Action('create')
  @Audit({
    action: 'INF_SPEED_MEASUREMENT_CREATE',
    entity: 'inf.speed_measurement',
  })
  create(@Body() body: CreateSpeedMeasurementInput) {
    return this.command.execute(body);
  }
}
