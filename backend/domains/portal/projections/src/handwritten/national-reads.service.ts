// Cache das leituras nacionais (work/rounds/R-0009/contracts/CTG-0002.md §8;
// plan R-0009 M17; ADR-0003, ADR-0020 §5). As portas chegam pelo token
// `PORTAL_NATIONAL_READ_PORTS` — fatias ESTRUTURAIS de `CdtPort`, `RenachPort`
// e `WsdenatranReadPort` (`packages/senatran-adapter/src/ports.ts`), compostas
// no app com `createSenatranAdapter().ports` (padrão de
// `teat-snapshots.providers.ts`): nenhum `fetch` próprio, nenhuma dependência
// do pacote do adapter aqui. TTL = parâmetro `portal.read_cache_ttl_minutes`
// lido pelo `OpsParameterService` (token `PORTAL_PARAMETER_READER`, fatia
// `get(key)`), nunca literal; resposta SEMPRE com `cachedAt` (RN-PORTAL-117 C).
import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  PortalClock,
  PortalError,
  type PortalClockLike,
  type PortalSqlTransaction,
  type PortalSubjectRecord,
} from '@detran/portal-identity';

import type { PortalParameterReader } from './projection-contract.js';

export type { PortalParameterReader } from './projection-contract.js';

// ---------------------------------------------------------------------------
// tokens e fatias (§8)
// ---------------------------------------------------------------------------

export const PORTAL_NATIONAL_READ_PORTS = Symbol('PORTAL_NATIONAL_READ_PORTS');
export const PORTAL_PARAMETER_READER = Symbol('PORTAL_PARAMETER_READER');

/** `Pick<CdtPort, 'getCitizenLicense' | 'listCitizenVehicles' | 'getPaymentQuote'>`, estrutural. */
export interface CdtReadSlice {
  getCitizenLicense(cpf: string): Promise<unknown>;
  listCitizenVehicles(cpf: string): Promise<unknown>;
  getPaymentQuote(aitNumber: string): Promise<unknown>;
}

/** `Pick<RenachPort, 'findDriverByCpf'>`, estrutural (OD-P35: sem rota nesta rodada). */
export interface RenachReadSlice {
  findDriverByCpf(cpf: string): Promise<unknown>;
}

/** `Pick<WsdenatranReadPort, 'findVehicleByPlate' | 'findVehicleByRenavam'>`, estrutural. */
export interface WsdenatranReadSlice {
  findVehicleByPlate(plate: string): Promise<unknown>;
  findVehicleByRenavam(renavam: string): Promise<unknown>;
}

export interface PortalNationalReadPorts {
  cdt: CdtReadSlice;
  renach: RenachReadSlice;
  wsdenatranRead: WsdenatranReadSlice;
}

/** Chave do catálogo (H.54; OD-P11) — aparece UMA vez, aqui (verify:parameter-catalogue). */
export const PORTAL_READ_CACHE_TTL_PARAMETER = 'portal.read_cache_ttl_minutes';

export const NATIONAL_READ_KINDS = ['cnh', 'vehicles', 'clearance'] as const;
export type NationalReadKind = (typeof NATIONAL_READ_KINDS)[number];

export interface NationalReadResult<T = unknown> {
  payload: T;
  /** ISO 8601 — a data-hora da consulta é sempre visível (RN-PORTAL-117 C). */
  cachedAt: string;
}

// ---------------------------------------------------------------------------
// SQL (subconjunto de tests/support/fake-sql.ts)
// ---------------------------------------------------------------------------

/** `target_id` nulo é comparado pelo uuid nulo (índice único do DDL 65). */
const NIL_TARGET = '00000000-0000-0000-0000-000000000000';

const CACHE_FOR_UPDATE_SQL = `select id, payload_json, cached_at
     from portal.national_read_cache
    where subject_id = $1 and kind = $2
      and coalesce(target_id, $4::uuid) = coalesce($3::uuid, $4::uuid)
    for update`;

/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 65). */
const INSERT_CACHE_SQL = `insert into portal.national_read_cache
      (subject_id, kind, target_id, payload_json, cached_at, created_at)
    values ($1, $2, $3, $4::jsonb, $5, $5)`;

const UPDATE_CACHE_SQL = `update portal.national_read_cache
      set payload_json = $2::jsonb, cached_at = $3, updated_at = $3
    where id = $1`;

interface CacheRow extends Record<string, unknown> {
  id: string;
  payload_json: unknown;
  cached_at: Date | string;
}

const MS_PER_MINUTE = 60_000;
const SECONDS_PER_MINUTE = 60;

function iso(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

@Injectable()
export class PortalNationalReadsService {
  private readonly clock: PortalClockLike;

  constructor(
    @Inject(PORTAL_PARAMETER_READER)
    private readonly parameters: PortalParameterReader,
    @Optional() clock?: PortalClock,
  ) {
    this.clock = clock ?? new PortalClock();
  }

  /** TTL em minutos, lido do catálogo do tenant; ausente → defeito de configuração. */
  async ttlMinutes(): Promise<number> {
    let value: unknown;
    try {
      value = (await this.parameters.get(PORTAL_READ_CACHE_TTL_PARAMETER))
        .value_json;
    } catch {
      throw new PortalError('PORTAL.INTERNAL', {
        status: 500,
        context: { parameterKey: PORTAL_READ_CACHE_TTL_PARAMETER },
      });
    }
    const minutes = Number(value);
    if (!Number.isFinite(minutes) || minutes < 0) {
      throw new PortalError('PORTAL.INTERNAL', {
        status: 500,
        context: { parameterKey: PORTAL_READ_CACHE_TTL_PARAMETER },
      });
    }
    return minutes;
  }

  /** §8 algoritmo `read(tx, subject, kind, targetId, fetch)`. */
  async read<T = unknown>(
    tx: PortalSqlTransaction,
    subject: PortalSubjectRecord,
    kind: NationalReadKind,
    targetId: string | null,
    fetch: () => Promise<T>,
  ): Promise<NationalReadResult<T>> {
    const ttlMinutes = await this.ttlMinutes();
    const now = this.clock.now();
    const cache = (
      await tx.query<CacheRow>(CACHE_FOR_UPDATE_SQL, [
        subject.subjectId,
        kind,
        targetId,
        NIL_TARGET,
      ])
    ).rows[0];
    if (cache) {
      const cachedAt = new Date(iso(cache.cached_at));
      if (now.getTime() - cachedAt.getTime() <= ttlMinutes * MS_PER_MINUTE) {
        return { payload: cache.payload_json as T, cachedAt: iso(cachedAt) };
      }
    }
    let payload: T;
    try {
      payload = await fetch();
    } catch {
      if (cache) {
        // fonte indisponível com cache → 200 com cachedAt antigo (RN-PORTAL-117 C)
        return {
          payload: cache.payload_json as T,
          cachedAt: iso(cache.cached_at),
        };
      }
      throw new PortalError('PORTAL.NATIONAL_READ_UNAVAILABLE', {
        status: 503,
        context: {
          cachedAt: null,
          retryAfter: ttlMinutes * SECONDS_PER_MINUTE,
        },
      });
    }
    const serialized = JSON.stringify(payload ?? null);
    if (cache) {
      await tx.query(UPDATE_CACHE_SQL, [cache.id, serialized, now]);
    } else {
      await tx.query(INSERT_CACHE_SQL, [
        subject.subjectId,
        kind,
        targetId,
        serialized,
        now,
      ]);
    }
    return { payload, cachedAt: now.toISOString() };
  }
}
