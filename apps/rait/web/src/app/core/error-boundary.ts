// ErrorBoundary (spec §5.1; catálogo de erros §1, §2, §4, §5.3; plan.md M8; contrato CTG-0002a
// §8; `engineer-frontend.md` §Padrão 12): o único classificador de erro/offline do app.
// `classifyError` lê o envelope `StynxError` (`code`, `context`, `requestId`) e o status HTTP e
// devolve `ClassifiedError` com `kind` e `messageKey` — derivada pela fórmula do catálogo
// (`messageKeyFor`), nunca a `messageKey` enviada pelo servidor. Tokens de `context` nunca viram
// texto: a apresentação (banner/toast/diálogo/badge, catálogo §4) é do CTG-0002b sobre este
// resultado. `RaitCommandUnavailableError` (M8) é o erro dos comandos ainda não ligados ao
// backend → `unavailable` + `rait.common.unavailable`.
import { HttpErrorResponse } from '@angular/common/http';
import { isRaitErrorCode, messageKeyFor } from './error-codes';

// Apresentação mínima do `ClassifiedError` (contrato §8), reexportada aqui por ser a única
// saída visual do boundary nesta CTG.
export { RaitErrorBannerComponent } from './error-banner.component';

export const UNKNOWN_ERROR_KEY = 'rait.errors.unknown';
export const FORBIDDEN_ERROR_KEY = 'rait.errors.forbidden';
export const OFFLINE_ERROR_KEY = 'rait.errors.offline';
export const COMMAND_UNAVAILABLE_KEY = 'rait.common.unavailable';

const RETRY_AFTER_HEADER = 'Retry-After';

/** M8: comando cuja ligação ao cliente gerado fica para R-0007 CTG-0004. */
export class RaitCommandUnavailableError extends Error {
  override readonly name = 'RaitCommandUnavailableError';
  /** `<recurso>:<ação>` (ex.: `rait-case:admit`). */
  readonly command: string;

  constructor(command: string) {
    super(command);
    this.command = command;
  }
}

export type ErrorKind =
  | 'forbidden'
  | 'conflict'
  | 'validation'
  | 'business'
  | 'unavailable'
  | 'offline'
  | 'not_found'
  | 'server'
  | 'unknown';

/** Catálogo §1 regra 5: `context.fields[]` de um `400`. */
export interface ErrorField {
  readonly path: string;
  readonly rule: string;
  readonly params?: unknown;
}

export interface ClassifiedError {
  readonly kind: ErrorKind;
  /** `body.code` quando string (mesmo fora do catálogo). */
  readonly code?: string;
  /** Sempre existente no catálogo i18n. */
  readonly messageKey: string;
  /** Ausente para erros não HTTP. */
  readonly status?: number;
  readonly requestId?: string;
  /** `context.legalBasis` (422). */
  readonly legalBasis?: string;
  /** `context.fields[]` (400). */
  readonly fields?: readonly ErrorField[];
  /** `context.retryAfter` ou header `Retry-After` (429/503). */
  readonly retryAfter?: number | string;
  /** `RaitCommandUnavailableError.command`. */
  readonly command?: string;
  /** `{}` quando ausente; tokens nunca viram texto. */
  readonly context: Readonly<Record<string, unknown>>;
}

interface ErrorBody {
  readonly code: string;
  readonly requestId?: unknown;
  readonly context?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorBodyOf(response: HttpErrorResponse): ErrorBody | null {
  const body: unknown = response.error;
  return isRecord(body) && typeof body['code'] === 'string'
    ? (body as unknown as ErrorBody)
    : null;
}

function fieldsOf(context: Record<string, unknown>): readonly ErrorField[] {
  const fields = context['fields'];
  if (!Array.isArray(fields)) return [];
  return fields.filter(
    (field): field is ErrorField =>
      isRecord(field) &&
      typeof field['path'] === 'string' &&
      typeof field['rule'] === 'string',
  );
}

function retryAfterOf(
  context: Record<string, unknown>,
  response: HttpErrorResponse,
): number | string | undefined {
  const fromContext = context['retryAfter'];
  if (typeof fromContext === 'number' || typeof fromContext === 'string') {
    return fromContext;
  }
  const header = response.headers?.get(RETRY_AFTER_HEADER);
  return header ?? undefined;
}

const CONFLICT_STATUSES: ReadonlySet<number> = new Set([409, 412, 428]);
const UNAVAILABLE_STATUSES: ReadonlySet<number> = new Set([429, 502, 503, 504]);

/** Tabela do contrato §8 (famílias do catálogo §2), por status. */
function kindOf(status: number): ErrorKind {
  if (status === 0) return 'offline';
  if (status === 401 || status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (CONFLICT_STATUSES.has(status)) return 'conflict';
  if (status === 400) return 'validation';
  if (status === 422) return 'business';
  if (UNAVAILABLE_STATUSES.has(status)) return 'unavailable';
  if (status === 500) return 'server';
  return 'unknown';
}

/** `rait.errors.<code>` se catalogado, senão `rait.errors.unknown`; 403 sempre `forbidden`. */
function messageKeyOf(kind: ErrorKind, status: number, code?: string): string {
  if (kind === 'offline') return OFFLINE_ERROR_KEY;
  if (status === 403) return FORBIDDEN_ERROR_KEY;
  if (kind === 'unknown') return UNKNOWN_ERROR_KEY;
  return isRaitErrorCode(code) ? messageKeyFor(code) : UNKNOWN_ERROR_KEY;
}

function classifyHttp(response: HttpErrorResponse): ClassifiedError {
  const status = response.status;
  const body = errorBodyOf(response);
  const context = body && isRecord(body.context) ? body.context : {};
  const kind = kindOf(status);
  const code = body?.code;
  const requestId = body?.requestId;
  const legalBasis = context['legalBasis'];
  const fields = fieldsOf(context);
  const retryAfter = retryAfterOf(context, response);
  return {
    kind,
    ...(code !== undefined ? { code } : {}),
    messageKey: messageKeyOf(kind, status, code),
    status,
    ...(typeof requestId === 'string' ? { requestId } : {}),
    ...(typeof legalBasis === 'string' ? { legalBasis } : {}),
    ...(fields.length > 0 ? { fields } : {}),
    ...(retryAfter !== undefined ? { retryAfter } : {}),
    context,
  };
}

export function classifyError(error: unknown): ClassifiedError {
  if (error instanceof RaitCommandUnavailableError) {
    return {
      kind: 'unavailable',
      messageKey: COMMAND_UNAVAILABLE_KEY,
      command: error.command,
      context: {},
    };
  }
  if (error instanceof HttpErrorResponse) {
    return classifyHttp(error);
  }
  return { kind: 'unknown', messageKey: UNKNOWN_ERROR_KEY, context: {} };
}
