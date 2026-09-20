import { StynxError } from '@stynx-nyx/core';

export type DetranErrorContext = Record<string, unknown>;

function messageKeyOf(code: string): string {
  const prefixMatch = /^([A-Z]+)\./u.exec(code);
  const prefix = prefixMatch ? prefixMatch[1]!.toLowerCase() : '';
  const reason = code.replace(/^[A-Z]+\./u, '').toLowerCase();
  return prefix ? `${prefix}.errors.${reason}` : `errors.${reason}`;
}

export interface DetranErrorOptions {
  status: number;
  context?: DetranErrorContext;
  message?: string;
  messageKey?: string;
  requestId?: string;
  cause?: unknown;
}

/** Stable shared error envelope for TEAT, RAIT, BOAT and Portal commands. */
export class DetranError extends StynxError {
  readonly code: string;
  readonly status: number;
  readonly messageKey: string;
  declare readonly context: DetranErrorContext;
  readonly requestId?: string;

  constructor(code: string, options: DetranErrorOptions) {
    const context = options.context ?? {};
    const messageKey = options.messageKey ?? messageKeyOf(code);
    super(options.message ?? code, {
      code,
      status: options.status,
      context,
      messageKey,
      cause: options.cause,
    });
    this.name = 'DetranError';
    this.code = code;
    this.status = options.status;
    this.messageKey = messageKey;
    this.context = context;
    this.requestId = options.requestId;
  }
}

export { assertIfMatch, etagOf } from './if-match.js';
