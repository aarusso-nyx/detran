// Erro de domínio do agregado da infração. `code` existe em
// docs/framework/arch/rait-error-catalog.md (§3.9 e §3.12), `status` segue a
// família da §2 e `context` carrega só ids, tokens canônicos e números (§1 regra
// 4; CODESTYLE §Backend). `StynxError` é exportado por `@stynx-nyx/core` 1.3.1
// (`dist/core/src/errors.d.ts`), então o envelope do `StynxErrorFilter` do
// kernel serializa `RaitError` sem código novo.
import { StynxError } from '@stynx-nyx/core';

/** `rait.errors.<motivo>` a partir de `RAIT.<MOTIVO>` (catálogo §1 regra 3). */
function messageKeyOf(code: string): string {
  return `rait.errors.${code.replace(/^RAIT\./, '').toLowerCase()}`;
}

export interface RaitErrorOptions {
  status: number;
  context?: Record<string, unknown>;
  /** Texto de fallback em pt-BR (catálogo §1 regra 3). */
  message?: string;
  cause?: unknown;
}

export class RaitError extends StynxError {
  declare readonly context: Record<string, unknown>;

  constructor(code: string, options: RaitErrorOptions) {
    super(options.message ?? code, {
      code,
      status: options.status,
      context: options.context ?? {},
      messageKey: messageKeyOf(code),
      cause: options.cause,
    });
    this.name = 'RaitError';
  }
}
