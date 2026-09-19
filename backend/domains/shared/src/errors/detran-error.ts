import { StynxError } from '@stynx-nyx/core';

export type DetranErrorContext = Record<string, unknown>;

/** Stable error envelope serialized directly by the STYNX error filter. */
export class DetranError extends StynxError {
  readonly code: string;
  readonly status: number;
  readonly messageKey: string;
  readonly context: DetranErrorContext;
  readonly requestId?: string;

  constructor(
    code: string,
    options: {
      status: number;
      messageKey: string;
      message: string;
      context?: DetranErrorContext;
      requestId?: string;
    },
  ) {
    const context = options.context ?? {};
    super(options.message, {
      code,
      status: options.status,
      context,
      messageKey: options.messageKey,
    });
    this.name = 'DetranError';
    this.code = code;
    this.status = options.status;
    this.messageKey = options.messageKey;
    this.context = context;
    this.requestId = options.requestId;
  }
}
