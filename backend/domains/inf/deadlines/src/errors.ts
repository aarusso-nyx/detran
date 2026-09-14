// Erro do motor de prazos. O `code` vem de
// docs/framework/arch/rait-error-catalog.md (§3.9 e §3.12) e o envelope segue as
// regras da §1: `code`, `status`, `messageKey` e `context` só com ids, tokens e
// números. O pacote é uma biblioteca sem dependências (ADR-0016 §2), por isso
// estende `Error` e não `StynxError` — quem serializa é o módulo que a consome
// (CTG-0001 §5).

/** Deriva `rait.errors.<motivo>` de `RAIT.<MOTIVO>` (catálogo §1 regra 3). */
function messageKeyOf(code: string): string {
  return `rait.errors.${code.replace(/^RAIT\./, '').toLowerCase()}`;
}

export interface DeadlineErrorOptions {
  status: number;
  context?: Record<string, unknown>;
  message?: string;
  cause?: unknown;
}

export class DeadlineError extends Error {
  readonly code: string;
  readonly status: number;
  readonly context: Record<string, unknown>;
  readonly messageKey: string;

  constructor(code: string, options: DeadlineErrorOptions) {
    super(options.message ?? code, { cause: options.cause });
    this.name = 'DeadlineError';
    this.code = code;
    this.status = options.status;
    this.context = options.context ?? {};
    this.messageKey = messageKeyOf(code);
  }
}
