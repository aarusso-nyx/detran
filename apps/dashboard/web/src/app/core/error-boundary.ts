// ErrorBoundary do console (CTG-0002.md §7): ÚNICO classificador de erro do app (A12(a)).
// Nenhum outro arquivo lê `status` de resposta HTTP nem reconhece `HttpErrorResponse` — as
// páginas e os componentes recebem um `ClassifiedError` e só traduzem. Indisponibilidade de
// fonte não é erro: vira selo (catálogo §7 linha 1).
import {
  DASH_ERROR_CODES,
  DASH_ERROR_PREFIX,
  isDashErrorCode,
  messageKeyFor,
  type DashErrorCode,
} from './error-codes';

export {
  DASH_ERROR_CODES,
  DASH_ERROR_PREFIX,
  isDashErrorCode,
  messageKeyFor,
  type DashErrorCode,
};
export { DashErrorBannerComponent } from './error-banner.component';

/** L0 (§Decisões 6): comando sem cliente gerado — nunca um POST silencioso. */
export class DashboardCommandUnavailableError extends Error {
  override readonly name = 'DashboardCommandUnavailableError';
  readonly command: string;

  constructor(command: string) {
    super(`comando indisponível nesta versão: ${command}`);
    this.command = command;
  }
}

/** §6 (a): resposta 2xx de leitura sem `meta.freshness` (§2 invariante 1). */
export class FreshnessContractViolationError extends Error {
  override readonly name = 'FreshnessContractViolationError';
  readonly url: string;

  constructor(url: string) {
    super(`resposta sem meta.freshness: ${url}`);
    this.url = url;
  }
}

export type ErrorKind =
  | 'forbidden'
  | 'conflict'
  | 'validation'
  | 'business'
  | 'not_found'
  | 'blocked_by_decision'
  | 'source_unavailable'
  | 'unavailable'
  | 'offline'
  | 'server'
  | 'unavailable_in_version'
  | 'contract_violation'
  | 'unknown';

/** Catálogo §7: `seal` = selo de frescor; `placeholder` = bloqueado por decisão. */
export type ErrorPresentation =
  'error_state' | 'seal' | 'placeholder' | 'banner';

export interface ErrorField {
  readonly path: string;
  readonly rule: string;
  readonly params?: unknown;
}

export interface ClassifiedError {
  readonly kind: ErrorKind;
  readonly presentation: ErrorPresentation;
  readonly code: string | null;
  readonly messageKey: string | null;
  readonly stateKey: string;
  readonly stateParams: Readonly<Record<string, string>>;
  readonly status: number | null;
  readonly requestId: string | null;
  readonly fields: readonly ErrorField[];
  readonly missing: readonly string[];
  readonly retryAfter: number | string | null;
  readonly source: string | null;
  readonly command: string | null;
  readonly context: Readonly<Record<string, unknown>>;
}

export const GENERIC_STATE_KEY = 'dashboard.states.error';
const FORBIDDEN_STATE_KEY = 'dashboard.states.forbidden';
const CONFLICT_STATE_KEY = 'dashboard.states.conflict';
/** Sem chave própria para "não encontrado" e "offline" até OD-D16-012. */
const EMPTY_STATE_KEY = 'dashboard.states.empty';
const UNAVAILABLE_STATE_KEY = 'dashboard.states.unavailable';
const BLOCKED_STATE_KEY = 'dashboard.states.blocked_by_decision';
const UNAVAILABLE_IN_VERSION_STATE_KEY =
  'dashboard.states.unavailable_in_version';

const SOURCE_UNAVAILABLE_CODE = `${DASH_ERROR_PREFIX}SOURCE_UNAVAILABLE`;
const PANEL_BLOCKED_CODE = `${DASH_ERROR_PREFIX}PANEL_BLOCKED_BY_DECISION`;

const CONFLICT_STATUSES: readonly number[] = [409, 412, 428];
const UNAVAILABLE_STATUSES: readonly number[] = [429, 502, 503, 504];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function fieldsOf(context: Record<string, unknown>): readonly ErrorField[] {
  const raw = context['fields'];
  if (!Array.isArray(raw)) return [];
  const fields: ErrorField[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const path = stringOrNull(item['path']);
    const rule = stringOrNull(item['rule']);
    if (path === null || rule === null) continue;
    fields.push(
      item['params'] === undefined
        ? { path, rule }
        : { path, rule, params: item['params'] },
    );
  }
  return fields;
}

function missingOf(context: Record<string, unknown>): readonly string[] {
  const raw = context['missing'];
  return Array.isArray(raw)
    ? raw.filter((item): item is string => typeof item === 'string')
    : [];
}

interface HttpLike {
  readonly status: number;
  readonly body: Record<string, unknown>;
}

/** Erro "tipo HTTP": resposta do `HttpClient` ou envelope equivalente do transporte SSE. */
function httpLike(error: unknown): HttpLike | null {
  if (typeof error !== 'object' || error === null) return null;
  const candidate = error as { status?: unknown; error?: unknown };
  if (typeof candidate.status !== 'number') return null;
  return {
    status: candidate.status,
    body: isRecord(candidate.error) ? candidate.error : {},
  };
}

interface KindDecision {
  readonly kind: ErrorKind;
  readonly presentation: ErrorPresentation;
  readonly stateKey: string;
}

function decideByStatus(status: number): KindDecision {
  if (status === 0) {
    return {
      kind: 'offline',
      presentation: 'error_state',
      stateKey: GENERIC_STATE_KEY,
    };
  }
  if (status === 401 || status === 403) {
    return {
      kind: 'forbidden',
      presentation: 'error_state',
      stateKey: FORBIDDEN_STATE_KEY,
    };
  }
  if (status === 404) {
    return {
      kind: 'not_found',
      presentation: 'error_state',
      stateKey: EMPTY_STATE_KEY,
    };
  }
  if (CONFLICT_STATUSES.includes(status)) {
    return {
      kind: 'conflict',
      presentation: 'error_state',
      stateKey: CONFLICT_STATE_KEY,
    };
  }
  if (status === 400) {
    return {
      kind: 'validation',
      presentation: 'error_state',
      stateKey: GENERIC_STATE_KEY,
    };
  }
  if (status === 422) {
    return {
      kind: 'business',
      presentation: 'error_state',
      stateKey: GENERIC_STATE_KEY,
    };
  }
  if (UNAVAILABLE_STATUSES.includes(status)) {
    return {
      kind: 'unavailable',
      presentation: 'error_state',
      stateKey: GENERIC_STATE_KEY,
    };
  }
  if (status === 500) {
    return {
      kind: 'server',
      presentation: 'error_state',
      stateKey: GENERIC_STATE_KEY,
    };
  }
  return {
    kind: 'unknown',
    presentation: 'error_state',
    stateKey: GENERIC_STATE_KEY,
  };
}

function unknownError(): ClassifiedError {
  return {
    kind: 'unknown',
    presentation: 'error_state',
    code: null,
    messageKey: null,
    stateKey: GENERIC_STATE_KEY,
    stateParams: {},
    status: null,
    requestId: null,
    fields: [],
    missing: [],
    retryAfter: null,
    source: null,
    command: null,
    context: {},
  };
}

/**
 * Tabela única do §7, avaliada de cima para baixo. O `messageKey` enviado pelo servidor é
 * ignorado: a chave vem da fórmula de M5 sobre o `code` catalogado.
 */
export function classifyError(error: unknown): ClassifiedError {
  if (error instanceof DashboardCommandUnavailableError) {
    return {
      ...unknownError(),
      kind: 'unavailable_in_version',
      presentation: 'banner',
      stateKey: UNAVAILABLE_IN_VERSION_STATE_KEY,
      command: error.command,
    };
  }
  if (error instanceof FreshnessContractViolationError) {
    return {
      ...unknownError(),
      kind: 'contract_violation',
      presentation: 'seal',
      stateKey: UNAVAILABLE_STATE_KEY,
    };
  }
  const http = httpLike(error);
  if (!http) return unknownError();

  const body = http.body;
  const code = stringOrNull(body['code']);
  const context = isRecord(body['context']) ? body['context'] : {};
  const messageKey = isDashErrorCode(code) ? messageKeyFor(code) : null;
  const requestId =
    stringOrNull(body['requestId']) ?? stringOrNull(context['requestId']);
  const retryAfterRaw = context['retryAfter'] ?? body['retryAfter'];
  const retryAfter =
    typeof retryAfterRaw === 'number' || typeof retryAfterRaw === 'string'
      ? retryAfterRaw
      : null;
  const base: ClassifiedError = {
    ...unknownError(),
    code,
    messageKey,
    status: http.status,
    requestId,
    fields: fieldsOf(context),
    missing: missingOf(context),
    retryAfter,
    source: stringOrNull(context['source']),
    context,
  };

  if (http.status === 503 && code === SOURCE_UNAVAILABLE_CODE) {
    const lastSeenAt = stringOrNull(context['lastSeenAt']);
    return {
      ...base,
      kind: 'source_unavailable',
      presentation: 'seal',
      stateKey: UNAVAILABLE_STATE_KEY,
      stateParams: lastSeenAt === null ? {} : { as_of: lastSeenAt },
    };
  }
  if (http.status === 423 && code === PANEL_BLOCKED_CODE) {
    return {
      ...base,
      kind: 'blocked_by_decision',
      presentation: 'placeholder',
      stateKey: BLOCKED_STATE_KEY,
      stateParams: { decision: stringOrNull(context['decision']) ?? '' },
    };
  }
  const decision = decideByStatus(http.status);
  return { ...base, ...decision };
}
