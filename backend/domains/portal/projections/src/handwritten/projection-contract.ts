// Contrato comum dos projetores do Portal (work/rounds/R-0009/contracts/
// CTG-0002.md §7.1; plan R-0009 M16; ADR-0020): envelope consumido
// (permissivo — o produtor real fixa o schema estrito, OD-P28), resultado de
// uma aplicação e a forma de um projetor. Vive num módulo próprio porque
// `projectors.service.ts` importa os cinco `*.projection.ts` e estes só
// precisam dos tipos.
import { z } from 'zod';
import type { PortalSqlTransaction } from '@detran/portal-identity';

/** Envelope de rait-events-sse-contract.md §1 como o `integration.outbox.payload` o guarda. */
export const PORTAL_CONSUMED_ENVELOPE = z
  .object({
    id: z.uuid(),
    type: z.string(),
    domainEvent: z.string().optional(),
    version: z.int().min(1),
    occurredAt: z.iso.datetime(),
    tenantId: z.uuid(),
    aggregate: z.object({
      kind: z.string(),
      id: z.string(),
      version: z.int().min(0),
    }),
    data: z.record(z.string(), z.unknown()),
  })
  .passthrough();

export type PortalConsumedEvent = z.infer<typeof PORTAL_CONSUMED_ENVELOPE>;

export const PORTAL_PROJECTIONS = [
  'infraction_view',
  'process_timeline',
  'points_view',
  'crash_view',
  'exam_view',
] as const;
export type PortalProjectionName = (typeof PORTAL_PROJECTIONS)[number];

export interface ApplyOutcome {
  projection: string;
  applied: boolean;
  skipped?: 'already_applied' | 'not_consumed' | 'stale_version';
  error?: string;
}

/** Resultado de `Projector.apply` — só o serviço grava `projection_applied_event`. */
export type ProjectionResult =
  | { kind: 'applied' }
  | { kind: 'skipped'; reason: 'not_consumed' | 'stale_version' }
  | { kind: 'error'; error: string };

/** Fatia do leitor de parâmetros (`OpsParameterService.get`; CTG-0002 §14). */
export interface PortalParameterReader {
  get(key: string): Promise<{ value_json: unknown }>;
}

export interface ProjectionContext {
  tx: PortalSqlTransaction;
  /** Instante do relógio injetado (`PortalClock`). */
  now: Date;
  /** Data civil no fuso do tenant da transação (A3(e)). */
  today: string;
  tenantTz: string;
  parameters: PortalParameterReader;
}

export interface Projector {
  readonly projection: PortalProjectionName;
  /** Cabeçalho `// Source events:` do arquivo, como dados (ADR-0020 §4). */
  readonly sourceEvents: readonly string[];
  apply(
    event: PortalConsumedEvent,
    context: ProjectionContext,
  ): Promise<ProjectionResult>;
  /**
   * `rebuild` (A5(a)): desfaz só o que a janela reaplicada produziu — linhas
   * cujo `last_event_id` está na janela; linhas nunca projetadas (sentinela
   * D10) são preservadas.
   */
  reset(
    context: ProjectionContext,
    windowEventIds: readonly string[],
  ): Promise<void>;
}

/** `last_event_id` das linhas nunca projetadas (fixtures D10). */
export const PROJECTION_SENTINEL_EVENT_ID =
  '00000000-0000-0000-0000-000000000000';

/** Prefixo dos códigos de `last_error` (`PORTAL.INTERNAL:<motivo>:<id>`). */
export const PROJECTION_ERROR_PREFIX = 'PORTAL.INTERNAL';

export function projectionError(reason: string, id: string): ProjectionResult {
  return { kind: 'error', error: `${PROJECTION_ERROR_PREFIX}:${reason}:${id}` };
}

export function primitiveData(
  data: Record<string, unknown>,
): Record<string, string | number | boolean | null> {
  const entries = Object.entries(data).filter(
    (entry): entry is [string, string | number | boolean | null] =>
      entry[1] === null ||
      typeof entry[1] === 'string' ||
      typeof entry[1] === 'number' ||
      typeof entry[1] === 'boolean',
  );
  return Object.fromEntries(entries);
}

export function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function asObject(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
