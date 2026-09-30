// CTG-0002 §5.4 (M10) — `POST /v1/ops/mobile-bootstrap/shifts`.
import { teatEventSink } from '@detran/ops-core';
import { DetranError } from '@detran/shared';

import { shiftOpenedEvent } from './events.js';
import {
  clockOf,
  inTransaction,
  isoOf,
  tenantScope,
  todayOf,
  type FieldDeps,
  type SqlScope,
} from './field-runtime.js';
import { MOBILE_BOOTSTRAP_PROTOCOL_VERSION } from './mobile-bootstrap.service.js';
import {
  assertShiftReadiness,
  loadAgent,
  loadDevice,
} from './shift-readiness.js';

export interface OpenShiftInput {
  device_id: string;
  installation_id?: string;
  app_version: string;
  protocol_version?: string;
  operational_unit_id: string;
  team_id?: string;
  patrol_vehicle_id?: string;
  operation_id?: string;
  started_at: string;
  latitude?: number;
  longitude?: number;
  accuracy_m?: number;
}

async function assertNoOpenShift(
  scope: SqlScope,
  tenantId: string,
  agentId: string,
): Promise<void> {
  const open = await scope.query<{ id: string; device_id: string }>(
    `select id, device_id from ops.ops_shift
      where tenant_id = $1 and agent_id = $2 and status = 'open'
      limit 1`,
    [tenantId, agentId],
  );
  if (open.rows[0])
    throw new DetranError('TEAT.SHIFT_ALREADY_OPEN', {
      status: 409,
      context: {
        shiftId: open.rows[0].id,
        deviceId: open.rows[0].device_id,
      },
      message: 'Já existe turno aberto para o agente.',
    });
}

export class OpenShiftCommand {
  constructor(private readonly deps: FieldDeps) {}

  async execute(input: OpenShiftInput): Promise<Record<string, unknown>> {
    const { tenantId, actorId } = tenantScope(this.deps);
    const now = clockOf(this.deps).now();
    const today = todayOf(this.deps);
    if (
      input.protocol_version &&
      input.protocol_version !== MOBILE_BOOTSTRAP_PROTOCOL_VERSION
    )
      throw new DetranError('TEAT.PROTOCOL_VERSION_UNSUPPORTED', {
        status: 426,
        context: { supported: [MOBILE_BOOTSTRAP_PROTOCOL_VERSION] },
        message: 'Versão de protocolo do bootstrap não suportada.',
      });
    const deviceId = String(input.device_id);

    return inTransaction(this.deps, async (scope) => {
      const agent = await loadAgent(scope, tenantId, actorId);
      const device = await loadDevice(scope, tenantId, deviceId);
      const agencyId = String(device.traffic_agency_id);
      await assertNoOpenShift(scope, tenantId, agent ? agent.id : actorId);
      await assertShiftReadiness(scope, device, agent, {
        tenantId,
        agencyId,
        agentId: agent ? String(agent.id) : actorId,
        deviceId,
        appVersion: String(input.app_version),
        today,
      });

      const location =
        input.latitude === undefined && input.longitude === undefined
          ? null
          : {
              latitude: input.latitude ?? null,
              longitude: input.longitude ?? null,
              accuracy_m: input.accuracy_m ?? null,
            };
      // Um turno `open` por agente é garantido pelo índice único parcial
      // `ux_ops_shift_tenant_id_agent_id_open` (DDL 13): a abertura concorrente
      // espera a outra transação e, se ela confirmou, não insere nada e cai na
      // mesma recusa de negócio.
      const inserted = await scope.query<Record<string, unknown>>(
        `insert into ops.ops_shift
           (traffic_agency_id, agent_id, device_id, operational_unit_id, team_id,
            patrol_vehicle_id, operation_id, started_at, start_location_json,
            status, offline_periods_count)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open', 0)
         on conflict (tenant_id, agent_id) where status = 'open' do nothing
         returning *`,
        [
          agencyId,
          agent!.id,
          deviceId,
          input.operational_unit_id ?? null,
          input.team_id ?? null,
          input.patrol_vehicle_id ?? null,
          input.operation_id ?? null,
          input.started_at,
          location ? JSON.stringify(location) : null,
        ],
      );
      const shift = inserted.rows[0];
      if (!shift) {
        await assertNoOpenShift(scope, tenantId, String(agent!.id));
        throw new Error('Open shift conflict without a visible open shift');
      }
      await scope.query(
        `insert into ops.ops_device_event
           (device_id, agent_id, event_type, event_at, details_json)
         values ($1, $2, 'shift_open', $3, $4::jsonb)`,
        [
          deviceId,
          agent!.id,
          now,
          JSON.stringify({ shiftId: String(shift.id) }),
        ],
      );
      await teatEventSink(this.deps.outbox).append(
        scope.transaction,
        shiftOpenedEvent(
          { tenantId, actorId, occurredAt: now },
          {
            shiftId: String(shift.id),
            agentId: String(agent!.id),
            deviceId,
            operationalUnitId: input.operational_unit_id ?? null,
            startedAt: isoOf(shift.started_at) ?? String(input.started_at),
          },
        ),
      );
      return {
        id: String(shift.id),
        status: 'open',
        agent_id: String(agent!.id),
        device_id: deviceId,
        operational_unit_id: shift.operational_unit_id ?? null,
        team_id: shift.team_id ?? null,
        patrol_vehicle_id: shift.patrol_vehicle_id ?? null,
        operation_id: shift.operation_id ?? null,
        started_at: isoOf(shift.started_at),
      };
    });
  }
}
