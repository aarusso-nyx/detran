import type { BOAT_PORTS } from '../ports.js';

/** Nome de uma das seis portas de `ports.ts` (CTG-0002 §Erro de máquina comum). */
export type BoatPortName = (typeof BOAT_PORTS)[number];

/** Tokens provisórios, `source_pending:OD-R28-004`. */
export type BoatPortErrorCode =
  | 'permission-denied'
  | 'unavailable'
  | 'timeout'
  | 'cancelled'
  | 'invalid-input'
  | 'integrity-failure'
  | 'unattested';

export const BOAT_PORT_ERROR_CODES: readonly BoatPortErrorCode[] =
  Object.freeze([
    'permission-denied',
    'unavailable',
    'timeout',
    'cancelled',
    'invalid-input',
    'integrity-failure',
    'unattested',
  ] as const);

/** Erro de máquina das portas de homologação; `message` é o próprio token. */
export class BoatPortError extends Error {
  override readonly name = 'BoatPortError' as const;
  readonly port: BoatPortName;
  readonly code: BoatPortErrorCode;

  constructor(
    port: BoatPortName,
    code: BoatPortErrorCode,
    options?: { cause?: unknown },
  ) {
    super(code, options);
    this.port = port;
    this.code = code;
  }
}

export function isBoatPortError(value: unknown): value is BoatPortError {
  return value instanceof BoatPortError;
}

/** Selo comum dos adaptadores web de homologação (OD-R28-001). */
export interface BoatHomologationAdapter {
  readonly adapterName: string;
  readonly mode: 'homologacao';
  readonly securityLevel: string;
}

function exceptionName(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const name = (error as { readonly name?: unknown }).name;
  return typeof name === 'string' ? name : undefined;
}

/**
 * Mapeamento uniforme de `DOMException.name` (CTG-0002): permissão →
 * `permission-denied`; ausência de recurso → `unavailable`; `AbortError` →
 * `cancelled`; qualquer outra exceção → `unavailable`, sempre com `cause`.
 */
export function boatPortErrorFrom(
  port: BoatPortName,
  error: unknown,
): BoatPortError {
  if (isBoatPortError(error)) return error;
  switch (exceptionName(error)) {
    case 'NotAllowedError':
    case 'SecurityError':
      return new BoatPortError(port, 'permission-denied', { cause: error });
    case 'AbortError':
      return new BoatPortError(port, 'cancelled', { cause: error });
    default:
      return new BoatPortError(port, 'unavailable', { cause: error });
  }
}
