// CTG-0001 §1 (M1) — `DetranError`, the shared domain error for TEAT/RAIT
// commands. Mirrors `backend/domains/inf/infraction/src/handwritten/errors.ts`
// (`RaitError`, R-0006): same `StynxError` (`@stynx-nyx/core` 1.3.1) shape,
// same pt-BR fallback-message convention. `messageKey` is derived by regex —
// never a literal table per code (CTG-0001 §1 regra de derivação).
import { StynxError } from '@stynx-nyx/core';

/**
 * `<prefixo minúsculo>.errors.<código sem prefixo, minúsculo>` —
 * `TEAT.AIT_STATE_INVALID` -> `teat.errors.ait_state_invalid`;
 * `RAIT.CASE_STATE_INVALID` -> `rait.errors.case_state_invalid`. Works for any
 * all-caps dotted prefix, not just TEAT/RAIT: `code.replace(/^[A-Z]+\./, '')`.
 */
function messageKeyOf(code: string): string {
  const prefixMatch = /^([A-Z]+)\./u.exec(code);
  const prefix = prefixMatch ? prefixMatch[1]!.toLowerCase() : '';
  const reason = code.replace(/^[A-Z]+\./u, '').toLowerCase();
  return prefix ? `${prefix}.errors.${reason}` : `errors.${reason}`;
}

export interface DetranErrorOptions {
  status: number;
  /** Only ids, canonical tokens and numbers (CTG-0001 §1 regra 4). */
  context?: Record<string, unknown>;
  /** pt-BR fallback message; defaults to the code itself. */
  message?: string;
  cause?: unknown;
}

export class DetranError extends StynxError {
  declare readonly context: Record<string, unknown>;

  constructor(code: string, options: DetranErrorOptions) {
    super(options.message ?? code, {
      code,
      status: options.status,
      context: options.context ?? {},
      messageKey: messageKeyOf(code),
      cause: options.cause,
    });
    this.name = 'DetranError';
  }
}

export { assertIfMatch, etagOf } from './if-match.js';
