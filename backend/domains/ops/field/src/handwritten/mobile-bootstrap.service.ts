// CTG-0002 §5.1–§5.3 e §6 (M9, R-0008, TASK-0005) — `GET /v1/ops/
// mobile-bootstrap`: o retrato que o coletor recebe antes de operar.
//
// Os campos de prazo do `snapshot` só recebem valor de uma linha tenant/TEAT
// vigente e completa do catálogo; qualquer outra condição falha fechada.
import { createHash } from 'node:crypto';
import type { OpsRow } from '@detran/ops-core';
import { DetranError } from '@detran/shared';

import {
  dateOf,
  isoOf,
  ownedBy,
  storeOf,
  tenantScope,
  todayOf,
  clockOf,
  type FieldDeps,
} from './field-runtime.js';

/** Constante da origem `mobile-bootstrap.service.ts`, preservada (§5.2). */
export const MOBILE_BOOTSTRAP_PROTOCOL_VERSION = 'teat-mobile-bootstrap.v1';
const SNAPSHOT_AUTHORITY = 'server-snapshot';
/** Chave do `parameter-catalogue.md` §TEAT (H.55). */
const HOMOLOGATION_BEHAVIOR_KEY = 'teat.homologation.expired_behavior';
const SNAPSHOT_MAX_AGE_KEY = 'teat.bootstrap.snapshot_max_age_seconds';

/** §5.3 — os dez bloqueadores saem exatamente nesta ordem. */
export const BLOCKER_ORDER = [
  'SESSION_NOT_EXCLUSIVE',
  'DEVICE_NOT_AUTHORIZED',
  'DEVICE_TAMPER_DETECTED',
  'DEVICE_NOT_HOMOLOGATED',
  'APP_VERSION_NOT_ALLOWED',
  'NORMATIVE_PACKAGE_MISSING',
  'NUMBERING_RESERVATION_REQUIRED',
  'AGENT_NOT_ACTIVE',
  'AGENT_NOT_IN_UNIT',
  'SHIFT_ALREADY_OPEN_ELSEWHERE',
] as const;

export interface MobileBootstrapQuery {
  device_id: string;
  installation_id?: string;
  app_version: string;
  protocol_version?: string;
}

export interface BootstrapWorld {
  device: OpsRow;
  agent?: OpsRow;
  agencyId: string;
  homologations: OpsRow[];
  appVersions: OpsRow[];
  packages: OpsRow[];
  reservations: OpsRow[];
  numberingRanges: OpsRow[];
  shifts: OpsRow[];
  handoffs: OpsRow[];
}

export function scopeMismatch(): DetranError {
  return new DetranError('TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH', {
    status: 403,
    message: 'Dispositivo fora do escopo do principal.',
  });
}

export class MobileBootstrapService {
  constructor(private readonly deps: FieldDeps) {}

  async read(query: MobileBootstrapQuery): Promise<Record<string, unknown>> {
    const requested =
      query.protocol_version ?? MOBILE_BOOTSTRAP_PROTOCOL_VERSION;
    if (requested !== MOBILE_BOOTSTRAP_PROTOCOL_VERSION)
      throw new DetranError('TEAT.PROTOCOL_VERSION_UNSUPPORTED', {
        status: 426,
        context: { supported: [MOBILE_BOOTSTRAP_PROTOCOL_VERSION] },
        message: 'Versão de protocolo do bootstrap não suportada.',
      });
    const world = await this.world(query);
    const today = todayOf(this.deps);
    const now = clockOf(this.deps).now();
    const blockers = this.blockers(world, query, today, now);
    const warnings = await this.warnings(world, today);
    const capabilities = this.capabilities(world, blockers, query);
    const normativePackage = publishedPackage(world.packages);
    const snapshot = await this.snapshot(now);
    return {
      protocolVersion: MOBILE_BOOTSTRAP_PROTOCOL_VERSION,
      requestedProtocolVersion: requested,
      snapshot: {
        capturedAt: now,
        validUntil: snapshot.validUntil,
        maxAgeSeconds: snapshot.maxAgeSeconds,
        authority: SNAPSHOT_AUTHORITY,
      },
      context: {
        tenantId: tenantScope(this.deps).tenantId,
        trafficAgencyId: world.agencyId,
        agent: world.agent
          ? {
              id: String(world.agent.id),
              operationalUnitId: world.agent.operational_unit_id ?? null,
              status: world.agent.functional_status ?? null,
            }
          : null,
        device: {
          id: String(world.device.id),
          status: world.device.status ?? null,
          homologated:
            activeHomologations(world.homologations).length > 0 &&
            allowedVersions(world.appVersions, query.app_version, today)
              .length > 0,
          tamperDetected: world.device.tamper_flag === true,
          appVersion: query.app_version,
        },
        activeShift: this.activeShift(world, query),
        session: this.session(world, query),
      },
      catalog: await this.catalog(world),
      normativePackage: normativePackage
        ? {
            id: String(normativePackage.id),
            catalogId: normativePackage.catalog_id ?? null,
            version: normativePackage.package_version ?? null,
            manifestHash: normativePackage.manifest_hash ?? null,
            status: normativePackage.status ?? null,
            publishedAt: isoOf(normativePackage.published_at),
            validUntil: dateOf(normativePackage.valid_until),
            contentPath: `/v1/inf/normative/mobile-packages/${String(normativePackage.id)}/content`,
          }
        : null,
      numberingReservations: validReservations(world, query, now).map((row) => {
        const range = authoritativeRange(world, row);
        if (!range) throw new Error('authoritative-numbering-range-required');
        return {
          id: String(row.id),
          rangeId: row.range_id ?? null,
          shiftId: row.shift_id ?? null,
          series: String(range.series).trim(),
          startNumber: Number(row.start_number),
          endNumber: Number(row.end_number),
          validUntil: isoOf(row.valid_until),
          status: row.status ?? null,
        };
      }),
      readiness: {
        preShiftReady: capabilities.canOpenShift,
        offlineReady: capabilities.canOperateOffline,
        blockers,
        warnings,
      },
      capabilities,
    };
  }

  /** §5.2 — escopo e identidade: nunca 404, para não revelar existência. */
  private async world(query: MobileBootstrapQuery): Promise<BootstrapWorld> {
    const { tenantId, actorId } = tenantScope(this.deps);
    const devices = ownedBy(
      await storeOf(this.deps, 'devices').list(),
      tenantId,
    );
    const device = devices.find(
      (row) => String(row.id) === String(query.device_id),
    );
    if (!device) throw scopeMismatch();
    if (query.installation_id) {
      const digest = `sha256:${createHash('sha256').update(String(query.installation_id)).digest('hex')}`;
      if (String(device.hardware_identifier_hash) !== digest)
        throw scopeMismatch();
    }
    const agencyId = String(device.traffic_agency_id);
    const agents = ownedBy(await storeOf(this.deps, 'agents').list(), tenantId);
    const agent =
      agents.find((row) => String(row.user_ref) === actorId) ??
      agents.find((row) => String(row.id) === actorId);
    const ofAgency = (rows: OpsRow[]): OpsRow[] =>
      rows.filter(
        (row) =>
          !row.traffic_agency_id || String(row.traffic_agency_id) === agencyId,
      );
    return {
      device,
      agent,
      agencyId,
      homologations: ofAgency(
        ownedBy(await storeOf(this.deps, 'homologations').list(), tenantId),
      ),
      appVersions: ownedBy(
        await storeOf(this.deps, 'appVersions').list(),
        tenantId,
      ),
      packages: ofAgency(
        ownedBy(await storeOf(this.deps, 'packages').list(), tenantId),
      ),
      reservations: ownedBy(
        await storeOf(this.deps, 'reservations').list(),
        tenantId,
      ),
      numberingRanges: ofAgency(
        ownedBy(await storeOf(this.deps, 'numberingRanges').list(), tenantId),
      ),
      shifts: ownedBy(await storeOf(this.deps, 'shifts').list(), tenantId),
      handoffs: ownedBy(await storeOf(this.deps, 'handoffs').list(), tenantId),
    };
  }

  private blockers(
    world: BootstrapWorld,
    query: MobileBootstrapQuery,
    today: string,
    now: string,
  ): string[] {
    const blockers: string[] = [];
    const elsewhere = openShiftElsewhere(world, query);
    const covered = elsewhere ? hasHandoff(world, elsewhere) : false;
    if (elsewhere && !covered) blockers.push('SESSION_NOT_EXCLUSIVE');
    if (String(world.device.status) !== 'authorized')
      blockers.push('DEVICE_NOT_AUTHORIZED');
    if (world.device.tamper_flag === true)
      blockers.push('DEVICE_TAMPER_DETECTED');
    if (activeHomologations(world.homologations).length === 0)
      blockers.push('DEVICE_NOT_HOMOLOGATED');
    if (
      allowedVersions(world.appVersions, query.app_version, today).length === 0
    )
      blockers.push('APP_VERSION_NOT_ALLOWED');
    if (!publishedPackage(world.packages))
      blockers.push('NORMATIVE_PACKAGE_MISSING');
    const reservations = openShiftHere(world, query)
      ? validReservations(world, query, now)
      : reservableReservations(world, query, now);
    if (reservations.length === 0)
      blockers.push('NUMBERING_RESERVATION_REQUIRED');
    const agent = world.agent;
    const credential = dateOf(agent?.credential_valid_until);
    if (
      !agent ||
      String(agent.functional_status) !== 'active' ||
      (credential !== null && credential < today)
    )
      blockers.push('AGENT_NOT_ACTIVE');
    if (!agent || !agent.operational_unit_id)
      blockers.push('AGENT_NOT_IN_UNIT');
    if (elsewhere && covered) blockers.push('SHIFT_ALREADY_OPEN_ELSEWHERE');
    return blockers;
  }

  /** §5.3 — avisos nunca bloqueiam (E.29 e H.55). */
  private async warnings(
    world: BootstrapWorld,
    today: string,
  ): Promise<string[]> {
    const warnings: string[] = [];
    const normative = publishedPackage(world.packages);
    const validUntil = dateOf(normative?.valid_until);
    if (normative && validUntil !== null && validUntil < today)
      warnings.push('NORMATIVE_PACKAGE_EXPIRED');
    const expiring = activeHomologations(world.homologations).some((row) => {
      const laudo = dateOf(row.laudo_valido_ate);
      const valid = dateOf(row.valid_until);
      return (
        (laudo !== null && laudo < today) || (valid !== null && valid < today)
      );
    });
    if (expiring && (await this.expiredBehavior(world)) === 'warn')
      warnings.push('HOMOLOGATION_RENEWAL_DUE');
    return warnings;
  }

  private async expiredBehavior(world: BootstrapWorld): Promise<string | null> {
    const row = await this.deps.parameters
      ?.get(HOMOLOGATION_BEHAVIOR_KEY, { agencyId: world.agencyId })
      .catch(() => undefined);
    const value = row?.value_json;
    if (value === null || value === undefined) return null;
    return String(value).startsWith('warn') ? 'warn' : String(value);
  }

  private async snapshot(
    capturedAt: string,
  ): Promise<{ maxAgeSeconds: number | null; validUntil: string | null }> {
    let row:
      | Awaited<ReturnType<NonNullable<FieldDeps['parameters']>['get']>>
      | undefined;
    try {
      row = await this.deps.parameters?.get(SNAPSHOT_MAX_AGE_KEY, {
        on: capturedAt.slice(0, 10),
      });
    } catch {
      return { maxAgeSeconds: null, validUntil: null };
    }
    const tenantId = tenantScope(this.deps).tenantId;
    if (
      !row ||
      row.key !== SNAPSHOT_MAX_AGE_KEY ||
      row.tenant_id !== tenantId ||
      row.traffic_agency_id !== null ||
      row.scope !== 'tenant' ||
      row.surface !== 'teat' ||
      row.status !== 'vigente' ||
      row.source_pending !== false ||
      row.value_type !== 'int' ||
      typeof row.value_json !== 'number' ||
      !Number.isSafeInteger(row.value_json) ||
      row.value_json <= 0
    ) {
      return { maxAgeSeconds: null, validUntil: null };
    }
    const capturedAtMillis = Date.parse(capturedAt);
    const durationMillis = row.value_json * 1_000;
    if (
      !Number.isFinite(capturedAtMillis) ||
      !Number.isSafeInteger(durationMillis) ||
      !Number.isSafeInteger(capturedAtMillis + durationMillis)
    ) {
      return { maxAgeSeconds: null, validUntil: null };
    }
    const validUntil = new Date(capturedAtMillis + durationMillis);
    if (
      !Number.isFinite(validUntil.getTime()) ||
      validUntil.getTime() <= capturedAtMillis
    ) {
      return { maxAgeSeconds: null, validUntil: null };
    }
    return {
      maxAgeSeconds: row.value_json,
      validUntil: validUntil.toISOString(),
    };
  }

  private capabilities(
    world: BootstrapWorld,
    blockers: readonly string[],
    query: MobileBootstrapQuery,
  ): Record<string, boolean> {
    const canOpenShift = blockers.every(
      (token) => token === 'NUMBERING_RESERVATION_REQUIRED',
    );
    const canOperateOffline = blockers.length === 0;
    return {
      canOpenShift,
      canOperateOffline,
      canReserveNumbering:
        canOpenShift && openShiftHere(world, query) !== undefined,
    };
  }

  private activeShift(
    world: BootstrapWorld,
    query: MobileBootstrapQuery,
  ): Record<string, unknown> | null {
    const shift = openShiftHere(world, query);
    if (!shift) return null;
    return {
      id: String(shift.id),
      operationalUnitId: shift.operational_unit_id ?? null,
      teamId: shift.team_id ?? null,
      patrolVehicleId: shift.patrol_vehicle_id ?? null,
      operationId: shift.operation_id ?? null,
      startedAt: isoOf(shift.started_at),
      status: shift.status ?? null,
    };
  }

  /**
   * §11.14 — não há tabela de sessão: a sessão exclusiva é o turno aberto do
   * agente neste dispositivo.
   */
  private session(
    world: BootstrapWorld,
    query: MobileBootstrapQuery,
  ): Record<string, unknown> | null {
    const shift = openShiftHere(world, query);
    const elsewhere = openShiftElsewhere(world, query);
    if (!shift) return null;
    return {
      id: String(shift.id),
      startedAt: isoOf(shift.started_at),
      exclusive: !elsewhere || hasHandoff(world, elsewhere),
    };
  }

  private async catalog(
    world: BootstrapWorld,
  ): Promise<Record<string, unknown>> {
    const { tenantId } = tenantScope(this.deps);
    const ofAgency = (rows: OpsRow[]): OpsRow[] =>
      rows.filter(
        (row) =>
          !row.traffic_agency_id ||
          String(row.traffic_agency_id) === world.agencyId,
      );
    const read = async (name: string): Promise<OpsRow[]> => {
      const store = this.deps.repositories[name];
      return store ? ofAgency(ownedBy(await store.list(), tenantId)) : [];
    };
    const today = todayOf(this.deps);
    const instruments = await read('measurementInstruments');
    return {
      operationalUnits: (await read('units')).map((row) => ({
        id: String(row.id),
        label: row.name ?? null,
      })),
      teams: (await read('teams'))
        .filter((row) => String(row.status) === 'active')
        .map((row) => ({ id: String(row.id), label: row.name ?? null })),
      patrolVehicles: (await read('patrolVehicles'))
        .filter((row) => String(row.status) === 'active')
        .map((row) => ({
          id: String(row.id),
          label: `${String(row.prefix ?? '')} - ${String(row.plate ?? '')}`,
        })),
      operations: (await read('operations'))
        .filter((row) => ['planned', 'active'].includes(String(row.status)))
        .map((row) => ({ id: String(row.id), label: row.name ?? null })),
      measurementInstruments: instruments.map((row) => {
        const validUntil = dateOf(row.verification_valid_until);
        return {
          id: String(row.id),
          instrumentType: row.instrument_type ?? null,
          serialNumber: row.serial_number ?? null,
          brand: row.brand ?? null,
          model: row.model ?? null,
          inmetroModelApproval: row.inmetro_model_approval ?? null,
          verificationValidUntil: validUntil,
          verificationValid: validUntil !== null && validUntil >= today,
          status: row.status ?? null,
        };
      }),
    };
  }
}

export function activeHomologations(rows: readonly OpsRow[]): OpsRow[] {
  return rows.filter((row) => String(row.status) === 'active');
}

export function allowedVersions(
  rows: readonly OpsRow[],
  appVersion: string,
  today: string,
): OpsRow[] {
  return rows.filter((row) => {
    if (String(row.version) !== String(appVersion)) return false;
    if (String(row.status) !== 'active') return false;
    const from = dateOf(row.valid_from);
    const to = dateOf(row.valid_to);
    if (from !== null && from > today) return false;
    return to === null || to >= today;
  });
}

export function publishedPackage(rows: readonly OpsRow[]): OpsRow | undefined {
  return rows.find((row) => String(row.status) === 'published');
}

export function validReservations(
  world: BootstrapWorld,
  query: MobileBootstrapQuery,
  now: string,
): OpsRow[] {
  const shift = openShiftHere(world, query);
  if (!shift) return [];
  return reservableReservations(world, query, now).filter(
    (row) =>
      typeof row.shift_id === 'string' &&
      row.shift_id.trim().length > 0 &&
      String(row.shift_id) === String(shift.id),
  );
}

function reservableReservations(
  world: BootstrapWorld,
  query: MobileBootstrapQuery,
  now: string,
): OpsRow[] {
  const agentId = world.agent ? String(world.agent.id) : null;
  return world.reservations.filter((row) => {
    if (String(row.status) !== 'reserved') return false;
    if (String(row.device_id) !== String(query.device_id)) return false;
    if (agentId && String(row.agent_id) !== agentId) return false;
    const validUntil = isoOf(row.valid_until);
    const validUntilTimestamp = Date.parse(validUntil ?? '');
    const nowTimestamp = Date.parse(now);
    if (
      !Number.isFinite(validUntilTimestamp) ||
      !Number.isFinite(nowTimestamp) ||
      validUntilTimestamp <= nowTimestamp
    )
      return false;
    return authoritativeRange(world, row) !== undefined;
  });
}

function authoritativeRange(
  world: BootstrapWorld,
  reservation: OpsRow,
): OpsRow | undefined {
  if (
    typeof reservation.range_id !== 'string' ||
    reservation.range_id.trim().length === 0 ||
    typeof reservation.traffic_agency_id !== 'string' ||
    String(reservation.traffic_agency_id) !== world.agencyId
  ) {
    return undefined;
  }
  const reservationStart = Number(reservation.start_number);
  const reservationEnd = Number(reservation.end_number);
  return world.numberingRanges.find((range) => {
    const rangeStart = Number(range.start_number);
    const rangeEnd = Number(range.end_number);
    return (
      typeof range.id === 'string' &&
      range.id.trim().length > 0 &&
      String(range.id) === String(reservation.range_id) &&
      typeof range.traffic_agency_id === 'string' &&
      String(range.traffic_agency_id) === world.agencyId &&
      typeof range.series === 'string' &&
      range.series.trim().length > 0 &&
      Number.isSafeInteger(reservationStart) &&
      Number.isSafeInteger(reservationEnd) &&
      Number.isSafeInteger(rangeStart) &&
      Number.isSafeInteger(rangeEnd) &&
      reservationStart <= reservationEnd &&
      reservationStart >= rangeStart &&
      reservationEnd <= rangeEnd
    );
  });
}

export function openShiftHere(
  world: BootstrapWorld,
  query: MobileBootstrapQuery,
): OpsRow | undefined {
  return world.shifts.find(
    (row) =>
      String(row.status) === 'open' &&
      String(row.device_id) === String(query.device_id) &&
      (!world.agent || String(row.agent_id) === String(world.agent.id)),
  );
}

export function openShiftElsewhere(
  world: BootstrapWorld,
  query: MobileBootstrapQuery,
): OpsRow | undefined {
  return world.shifts.find(
    (row) =>
      String(row.status) === 'open' &&
      String(row.device_id) !== String(query.device_id) &&
      (!world.agent || String(row.agent_id) === String(world.agent.id)),
  );
}

export function hasHandoff(world: BootstrapWorld, shift: OpsRow): boolean {
  return world.handoffs.some(
    (row) => String(row.shift_id) === String(shift.id),
  );
}
