// CTG-0002 §5.3 e §5.4 (M9/M10) — a mesma prontidão do bootstrap, aplicada
// como guarda de abertura de turno. Os bloqueadores 1…6 e 8…10 barram; o 7
// (reserva de numeração) não (§5.4 pré-condições).
import { DetranError } from '@detran/shared';

import { dateOf, type SqlScope } from './field-runtime.js';

export interface ShiftReadinessInput {
  tenantId: string;
  agencyId: string;
  agentId: string;
  deviceId: string;
  appVersion: string;
  today: string;
}

interface DeviceRow extends Record<string, unknown> {
  id: string;
  traffic_agency_id: string;
  status: string;
  tamper_flag: boolean;
}

interface AgentRow extends Record<string, unknown> {
  id: string;
  functional_status: string;
  operational_unit_id: string | null;
  credential_valid_until: string | null;
}

export async function loadDevice(
  scope: SqlScope,
  tenantId: string,
  deviceId: string,
): Promise<DeviceRow> {
  const result = await scope.query<DeviceRow>(
    `select * from ops.ops_operational_device where tenant_id = $1 and id = $2`,
    [tenantId, deviceId],
  );
  const device = result.rows[0];
  if (!device)
    throw new DetranError('TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH', {
      status: 403,
      message: 'Dispositivo fora do escopo do principal.',
    });
  return device;
}

export async function loadAgent(
  scope: SqlScope,
  tenantId: string,
  actorId: string,
): Promise<AgentRow | undefined> {
  const result = await scope.query<AgentRow>(
    `select * from ops.ops_agent_profile
      where tenant_id = $1 and (user_ref = $2 or id = $2) limit 1`,
    [tenantId, actorId],
  );
  return result.rows[0];
}

export async function assertShiftReadiness(
  scope: SqlScope,
  device: DeviceRow,
  agent: AgentRow | undefined,
  input: ShiftReadinessInput,
): Promise<void> {
  if (String(device.status) !== 'authorized')
    throw new DetranError('TEAT.DEVICE_NOT_AUTHORIZED', {
      status: 403,
      context: { deviceId: input.deviceId, status: device.status },
      message: 'Dispositivo não autorizado.',
    });
  if (device.tamper_flag === true)
    throw new DetranError('TEAT.DEVICE_TAMPER_DETECTED', {
      status: 403,
      context: { deviceId: input.deviceId, status: device.status },
      message: 'Dispositivo com indício de adulteração.',
    });
  const homologation = await scope.query<{ id: string }>(
    `select id from ops.ops_homologation
      where tenant_id = $1 and traffic_agency_id = $2 and status = 'active'
      limit 1`,
    [input.tenantId, input.agencyId],
  );
  if (!homologation.rows[0])
    throw new DetranError('TEAT.DEVICE_NOT_HOMOLOGATED', {
      status: 403,
      context: { homologationId: null, appVersion: input.appVersion },
      message: 'Órgão sem homologação vigente.',
    });
  const version = await scope.query<{ id: string }>(
    `select id from ops.ops_application_version
      where tenant_id = $1 and version = $2 and status = 'active'
        and valid_from <= $3::date
        and (valid_to is null or valid_to >= $3::date)
      limit 1`,
    [input.tenantId, input.appVersion, input.today],
  );
  if (!version.rows[0])
    throw new DetranError('TEAT.APP_VERSION_NOT_ALLOWED', {
      status: 403,
      context: {
        homologationId: homologation.rows[0].id,
        appVersion: input.appVersion,
      },
      message: 'Versão do aplicativo não permitida.',
    });
  const normative = await scope.query<{ id: string }>(
    `select id from inf.normative_mobile_package
      where tenant_id = $1 and traffic_agency_id = $2 and status = 'published'
      limit 1`,
    [input.tenantId, input.agencyId],
  );
  if (!normative.rows[0])
    throw new DetranError('TEAT.NORMATIVE_PACKAGE_MISSING', {
      status: 422,
      context: { packageId: null, manifestHash: null },
      message: 'Órgão sem pacote normativo publicado.',
    });
  const credential = dateOf(agent?.credential_valid_until);
  if (!agent || String(agent.functional_status) !== 'active')
    throw new DetranError('TEAT.AGENT_NOT_ACTIVE', {
      status: 403,
      context: { agentId: agent ? agent.id : null },
      message: 'Agente sem situação funcional ativa.',
    });
  if (credential !== null && credential < input.today)
    throw new DetranError('TEAT.AGENT_CREDENTIAL_EXPIRED', {
      status: 403,
      context: { agentId: agent.id },
      message: 'Credencial do agente vencida.',
    });
  if (!agent.operational_unit_id)
    throw new DetranError('TEAT.AGENT_NOT_IN_UNIT', {
      status: 403,
      context: { agentId: agent.id },
      message: 'Agente sem unidade operacional.',
    });
}
