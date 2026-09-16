// CTG-0002 §5.9 (M13, parte `ops`) — `block` · `unblock` · `wipe` do
// dispositivo operacional.
//
// `wipe` grava `status='blocked'` mais o recibo no `ops_device_event`: não
// existe token de status `wiped` em nenhuma fonte (§11.10/OD-T28) e não se
// inventa token. `unblock` não publica evento: o route contract §8 não tem
// token para ele (§11.8/OD-T21).
import { teatEventSink } from '@detran/ops-core';
import { DetranError } from '@detran/shared';

import { devicePostureChangedEvent } from './events.js';
import {
  clockOf,
  inTransaction,
  tenantMismatch,
  tenantScope,
  validationFailed,
  type FieldDeps,
} from './field-runtime.js';

export type PostureAction = 'block' | 'unblock' | 'wipe';

export interface DevicePostureInput {
  reason?: string;
}

const TARGET_STATUS: Readonly<Record<PostureAction, string>> = {
  block: 'blocked',
  unblock: 'authorized',
  wipe: 'blocked',
};

export class DevicePostureCommand {
  constructor(private readonly deps: FieldDeps) {}

  block(deviceId: string, input: DevicePostureInput) {
    return this.execute(deviceId, input, 'block');
  }

  unblock(deviceId: string, input: DevicePostureInput) {
    return this.execute(deviceId, input, 'unblock');
  }

  wipe(deviceId: string, input: DevicePostureInput) {
    return this.execute(deviceId, input, 'wipe');
  }

  async execute(
    deviceId: string,
    input: DevicePostureInput,
    action: PostureAction,
  ): Promise<Record<string, unknown>> {
    const { tenantId, actorId } = tenantScope(this.deps);
    const now = clockOf(this.deps).now();
    if (!input.reason || String(input.reason).trim() === '')
      throw validationFailed([{ path: 'reason', rule: 'required' }]);

    return inTransaction(this.deps, async (scope) => {
      const found = await scope.query<{ id: string; status: string }>(
        `select id, status from ops.ops_operational_device
          where tenant_id = $1 and id = $2 for update`,
        [tenantId, deviceId],
      );
      const device = found.rows[0];
      if (!device) throw tenantMismatch();
      const fromStatus = String(device.status);
      if (action === 'unblock' && fromStatus !== 'blocked')
        throw new DetranError('TEAT.DEVICE_BLOCKED', {
          status: 409,
          context: { deviceId, status: fromStatus },
          message: 'Dispositivo não está bloqueado.',
        });
      const toStatus = TARGET_STATUS[action];
      await scope.query(
        `update ops.ops_operational_device set status = $2, updated_at = now()
          where id = $1`,
        [deviceId, toStatus],
      );
      if (action === 'block' || action === 'wipe')
        await scope.query(
          `update ops.numbering_reservation set status = 'blocked', updated_at = now()
            where tenant_id = $1 and device_id = $2 and status = 'reserved'`,
          [tenantId, deviceId],
        );
      const event = await scope.query<{ id: string }>(
        `insert into ops.ops_device_event
           (id, device_id, agent_id, event_type, event_at, details_json)
         values (gen_random_uuid(), $1, null, $2, $3, '{}'::jsonb)
         returning id`,
        [deviceId, action, now],
      );
      const eventId = event.rows[0]!.id;
      await scope.query(
        `update ops.ops_device_event set details_json = $2::jsonb where id = $1`,
        [
          eventId,
          JSON.stringify({ reason: String(input.reason), receiptId: eventId }),
        ],
      );
      if (action !== 'unblock') {
        const posture = await scope.query<{ count: string }>(
          `select count(*)::text as count from ops.ops_device_event
            where tenant_id = $1 and device_id = $2`,
          [tenantId, deviceId],
        );
        await teatEventSink(this.deps.outbox).append(
          scope.transaction,
          devicePostureChangedEvent(
            { tenantId, actorId, occurredAt: now },
            {
              deviceId,
              agentId: null,
              fromStatus,
              toStatus,
              eventType: action,
            },
            Number(posture.rows[0]?.count ?? '1'),
          ),
        );
      }
      return { id: deviceId, status: toStatus, event_id: eventId };
    });
  }
}
