// CTG-0002 §5.6 (M10, D-01/AC-TEAT-012-4) — `POST /v1/ops/mobile-bootstrap/
// sessions/handoff`.
//
// O `reason` é a **declaração de incidente** que distingue a troca autorizada
// da anomalia de sessão: sem ela, dois dispositivos do mesmo agente são
// concorrência ([RN-TEAT-111]); com ela, a retaguarda reconhece a troca. O
// evento não é publicado: o route contract §8 não tem token para o handoff
// (§11.8/OD-T21); o efeito observável é a linha de `ops_session_handoff`, que é
// o que o detector de concorrência lê.
import type { OpsRow } from '@detran/ops-core';
import { DetranError } from '@detran/shared';

import {
  clockOf,
  ownedBy,
  storeOf,
  tenantScope,
  validationFailed,
  type FieldDeps,
} from './field-runtime.js';

export interface HandoffSessionInput {
  failed_device_id: string;
  reason?: string;
  new_device_id?: string;
  location_json?: Record<string, unknown>;
}

export interface HandoffSessionResponse {
  handoff_id: string;
  shift_id: string;
  failed_device_id: string;
  new_device_id: string | null;
  cancelled_reservations: string[];
  handed_off_at: string;
}

export class HandoffSessionCommand {
  constructor(private readonly deps: FieldDeps) {}

  async execute(input: HandoffSessionInput): Promise<HandoffSessionResponse> {
    const { tenantId, actorId } = tenantScope(this.deps);
    const now = clockOf(this.deps).now();
    if (!input.reason || String(input.reason).trim() === '')
      throw validationFailed([{ path: 'reason', rule: 'required' }]);
    const failedDeviceId = String(input.failed_device_id);

    const agents = ownedBy(await storeOf(this.deps, 'agents').list(), tenantId);
    const agent =
      agents.find((row) => String(row.user_ref) === actorId) ??
      agents.find((row) => String(row.id) === actorId);
    const agentId = agent ? String(agent.id) : actorId;

    const shifts = storeOf(this.deps, 'shifts');
    const shift = ownedBy(await shifts.list(), tenantId).find(
      (row) =>
        String(row.status) === 'open' &&
        String(row.device_id) === failedDeviceId &&
        String(row.agent_id) === agentId,
    );
    if (!shift)
      throw new DetranError('TEAT.SHIFT_NOT_OPEN', {
        status: 409,
        context: { deviceId: failedDeviceId },
        message: 'Nenhum turno aberto do agente no dispositivo informado.',
      });

    const newDeviceId = input.new_device_id
      ? String(input.new_device_id)
      : null;
    if (newDeviceId) await this.assertUsable(tenantId, newDeviceId);

    const handoff = await storeOf(this.deps, 'handoffs').create({
      shift_id: String(shift.id),
      from_agent_id: agentId,
      to_agent_id: agentId,
      handed_off_at: now,
      details_json: {
        failed_device_id: failedDeviceId,
        reason: String(input.reason),
        new_device_id: newDeviceId,
        location_json: input.location_json ?? null,
      },
    });
    await storeOf(this.deps, 'deviceEvents').create({
      device_id: failedDeviceId,
      agent_id: agentId,
      event_type: 'handoff',
      event_at: now,
      location_json: input.location_json ?? null,
      details_json: {
        shiftId: String(shift.id),
        newDeviceId,
        reason: String(input.reason),
      },
    });

    // [RN-TEAT-111]: dois dispositivos aptos a emitir nunca coexistem.
    const reservations = storeOf(this.deps, 'reservations');
    const cancelled: string[] = [];
    for (const row of ownedBy(await reservations.list(), tenantId)) {
      if (
        String(row.status) !== 'reserved' ||
        String(row.device_id) !== failedDeviceId
      )
        continue;
      await reservations.update(String(row.id), { status: 'cancelled' });
      cancelled.push(String(row.id));
    }
    if (newDeviceId)
      await shifts.update(String(shift.id), { device_id: newDeviceId });

    return {
      handoff_id: String(handoff.id),
      shift_id: String(shift.id),
      failed_device_id: failedDeviceId,
      new_device_id: newDeviceId,
      cancelled_reservations: cancelled,
      handed_off_at: now,
    };
  }

  private async assertUsable(
    tenantId: string,
    deviceId: string,
  ): Promise<OpsRow> {
    const device = ownedBy(
      await storeOf(this.deps, 'devices').list(),
      tenantId,
    ).find((row) => String(row.id) === deviceId);
    if (!device)
      throw new DetranError('TEAT.DEVICE_NOT_AUTHORIZED', {
        status: 403,
        context: { deviceId, status: null },
        message: 'Dispositivo de destino não autorizado.',
      });
    if (device.tamper_flag === true)
      throw new DetranError('TEAT.DEVICE_TAMPER_DETECTED', {
        status: 403,
        context: { deviceId, status: device.status ?? null },
        message: 'Dispositivo de destino com indício de adulteração.',
      });
    if (String(device.status) !== 'authorized')
      throw new DetranError('TEAT.DEVICE_NOT_AUTHORIZED', {
        status: 403,
        context: { deviceId, status: device.status ?? null },
        message: 'Dispositivo de destino não autorizado.',
      });
    return device;
  }
}
