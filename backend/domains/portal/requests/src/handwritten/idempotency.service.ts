// Idempotência M9 das rotas do Portal (work/rounds/R-0009/contracts/CTG-0002.md
// §4; plan R-0009 M9 e adenda A4(a)). As rotas M9 anulam o interceptor do
// kernel (`@NoIdempotent()`) e o handler chama `begin` dentro da transação do
// comando: cabeçalho ausente → 400 `PORTAL.VALIDATION_FAILED { fields:
// ['Idempotency-Key'] }`; registro igual (rota + impressão do corpo) → replay
// do status e do corpo gravados; registro divergente → 409
// `PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY { key }`. A chave persistida em
// `portal.idempotency_record` (DDL 62) é `${scope}:${header}` — escopo por
// sujeito (ou `public`), nunca por ator STYNX. Quem grava é o comando, e só
// quando persistiu estado (2xx e o 502 `DELEGATION_FAILED`).
import { createHash } from 'node:crypto';
import { Injectable, Optional } from '@nestjs/common';
import {
  PortalClock,
  PortalError,
  type PortalClockLike,
  type PortalSqlTransaction,
} from '@detran/portal-identity';

/** Nome do cabeçalho como o Node o entrega (minúsculas). */
export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';

/** Escopo da chave persistida nas rotas públicas (`POST manifestations` anônimo). */
export const PUBLIC_IDEMPOTENCY_SCOPE = 'public';

/**
 * JSON canônico (§4 "fingerprint"): chaves ordenadas recursivamente por
 * `localeCompare`, arrays na ordem, sem espaços, `null`/`undefined` → `null`.
 * Mesma regra do `stableStringify` do kernel; reutilizado no recibo (§3.3) e
 * na evidência de ciência (§6.1).
 */
export function canonicalJson(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}

/** sha256 hex minúsculo (64 caracteres — checks dos DDLs 62/63). */
export function sha256Hex(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export interface IdempotencyBeginInput {
  /** `subject.id` nas rotas autenticadas; `public` no manifest anônimo. */
  scope: string;
  /** Valor bruto do cabeçalho `Idempotency-Key` (pode faltar). */
  header: string | string[] | undefined;
  /** `${METHOD} ${template}` — ex.: `POST /v1/portal/requests/{id}/submit`. */
  route: string;
  body: unknown;
}

export interface IdempotencyReplay {
  status: number;
  body: unknown;
}

export type IdempotencyRecorder = (
  status: number,
  body: unknown,
) => Promise<void>;

export type IdempotencyBegin =
  | { replay: IdempotencyReplay; record?: undefined }
  | { replay?: undefined; record: IdempotencyRecorder };

interface RecordRow extends Record<string, unknown> {
  route: string;
  body_sha256: string;
  response_json: unknown;
  status: number;
}

const SELECT_RECORD_SQL = `select route, body_sha256, response_json, status
     from portal.idempotency_record
    where key = $1
    for update`;

/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 62). */
const INSERT_RECORD_SQL = `insert into portal.idempotency_record
      (key, subject_id, route, body_sha256, response_json, status, created_at)
    values ($1, $2, $3, $4, $5::jsonb, $6, $7)`;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lê o cabeçalho como o Node o entrega; vazio ou ausente → `undefined`. */
export function idempotencyKeyOf(
  headers: Record<string, string | string[] | undefined> | undefined,
): string | undefined {
  const raw = headers?.[IDEMPOTENCY_KEY_HEADER];
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

@Injectable()
export class PortalIdempotencyService {
  private readonly clock: PortalClockLike;

  constructor(@Optional() clock?: PortalClock) {
    this.clock = clock ?? new PortalClock();
  }

  /** §4 algoritmo `begin(tx, { scope, header, route, body })`. */
  async begin(
    tx: PortalSqlTransaction,
    input: IdempotencyBeginInput,
  ): Promise<IdempotencyBegin> {
    const header = idempotencyKeyOf({ [IDEMPOTENCY_KEY_HEADER]: input.header });
    if (!header) {
      throw new PortalError('PORTAL.VALIDATION_FAILED', {
        status: 400,
        context: { fields: ['Idempotency-Key'] },
      });
    }
    const key = `${input.scope}:${header}`;
    const fingerprint = sha256Hex(canonicalJson(input.body));
    const existing = await tx.query<RecordRow>(SELECT_RECORD_SQL, [key]);
    const row = existing.rows[0];
    if (row) {
      if (row.route === input.route && row.body_sha256 === fingerprint) {
        return {
          replay: { status: Number(row.status), body: row.response_json },
        };
      }
      throw new PortalError('PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY', {
        status: 409,
        context: { key: header },
      });
    }
    const subjectId = UUID_RE.test(input.scope) ? input.scope : null;
    const record: IdempotencyRecorder = async (status, body) => {
      await tx.query(INSERT_RECORD_SQL, [
        key,
        subjectId,
        input.route,
        fingerprint,
        JSON.stringify(body ?? null),
        status,
        this.clock.now(),
      ]);
    };
    return { record };
  }
}
