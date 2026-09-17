// ErrorBoundary (portal-frontends.md §5.1; portal-error-catalog.md §8; contrato CTG-0003a §3):
// classifica a resposta de erro (`classifyError`) e decide a apresentação (`presentError`):
// chave i18n `portal.errors.<code minúsculo>` (a UI só traduz), severidade, próximo passo e
// rota, canal alternativo, campos inválidos. Tokens (`code`, `context.*`) nunca viram texto.
// Nunca navega para `context.resumeRoute` do servidor ([DIVERGE-8]): a rota de retomada é a
// do app (`options.resumeRoute`). Sem lógica de prazo ou de nível aqui.
import { HttpErrorResponse } from '@angular/common/http';
import { DefaultUrlSerializer, type Params } from '@angular/router';
import type { EntitlementKind, PortalErrorBody } from '../data/portal.client';
import { ELEVATION_ROUTE } from './guards/assurance.guard';
import { RESUME_QUERY_PARAM } from './guards/auth.guard';
import { ENTITLEMENT_MISSING_ROUTE } from './guards/entitlement.guard';
import { SERVICE_UNAVAILABLE_ROUTE } from './guards/service-availability.guard';

export const PORTAL_ERROR_PREFIX = 'PORTAL.';
export const PORTAL_ERRORS_NAMESPACE = 'portal.errors';

/** Estados transversais (spec §5.1) usados quando o erro está fora do catálogo. */
export const GENERIC_ERROR_KEY = 'portal.states.error';
export const OFFLINE_KEY = 'portal.states.offline';

/** Rotas do manifesto alvo dos passos `existing_request`, `enrollment`, `representation`, `login`. */
export const PROCESS_ROUTE = '/processos';
export const ENROLLMENT_ROUTE = '/sne';
export const ACCOUNT_ROUTE = '/conta';
export const LOGIN_ROUTE = '/';

export interface ClassifiedError {
  /** Código canônico (`PORTAL.NOT_FOUND`), ou `null` quando a resposta não é do catálogo. */
  readonly code: string | null;
  /** 0 = rede/offline. */
  readonly status: number;
  /** Chave i18n (`portal.errors.not_found`), ou `null` quando não há código catalogado. */
  readonly messageKey: string | null;
  readonly requestId?: string;
  /** `context` do corpo, `{}` quando ausente. */
  readonly context: Readonly<Record<string, unknown>>;
  /** `context.fields[]` (400/422) ou `context.missing[]` (SNE_CONTACT_REQUIRED) ou `[]`. */
  readonly fields: readonly string[];
  /** `context.retryAfter` (503; tipo source_pending) ou `null`. */
  readonly retryAfter: number | string | null;
}

export type ErrorSeverity = 'error' | 'warning' | 'info';

export type NextStep =
  | 'login'
  | 'reauth'
  | 'elevation'
  | 'entitlement_help'
  | 'service_unavailable'
  | 'ineligible'
  | 'retry'
  | 'reload'
  | 'inline_fields'
  | 'support'
  | 'existing_request'
  | 'payment'
  | 'enrollment'
  | 'representation'
  | 'none';

export interface ErrorPresentation {
  readonly code: PortalErrorCode | null;
  readonly status: number;
  /** Sempre existente no catálogo. */
  readonly messageKey: string;
  readonly messageParams: Readonly<Record<string, string>>;
  readonly severity: ErrorSeverity;
  readonly nextStep: NextStep;
  /** UrlTree serializada, quando o passo é navegação. */
  readonly nextStepRoute: string | null;
  /** Renderiza `AlternativeChannelNote`. */
  readonly alternativeChannel: boolean;
  readonly fields: readonly string[];
  readonly retryAfter: number | string | null;
  readonly context: Readonly<Record<string, unknown>>;
  readonly requestId: string | null;
}

export interface PresentErrorOptions {
  /** `state.url` do ato (para `elevation`, `login`, `reauth`). */
  readonly resumeRoute?: string;
  /** Para `service_unavailable`. */
  readonly serviceKey?: string;
  /** Para `entitlement_help`. */
  readonly entitlement?: {
    readonly kind: EntitlementKind;
    readonly id: string;
  };
}

/** Os 67 códigos do catálogo (§1–§7), com prefixo, na ordem do catálogo. */
export const PORTAL_ERROR_CODES = [
  // §1 sessão, identidade e nível
  'PORTAL.AUTH_REQUIRED',
  'PORTAL.IDENTITY_NOT_CITIZEN',
  'PORTAL.ASSURANCE_NOT_VERIFIED',
  'PORTAL.ASSURANCE_INSUFFICIENT',
  'PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED',
  'PORTAL.REPRESENTATION_REFUSED',
  'PORTAL.REPRESENTATION_EXPIRED',
  'PORTAL.TENANT_UNRESOLVED',
  'PORTAL.SESSION_TENANT_MISMATCH',
  // §2 vínculo e elegibilidade
  'PORTAL.NOT_FOUND',
  'PORTAL.ENTITLEMENT_REQUIRED',
  'PORTAL.INELIGIBLE',
  'PORTAL.SERVICE_UNAVAILABLE',
  'PORTAL.SERVICE_PARTIALLY_AVAILABLE',
  // §3 pedidos e atos
  'PORTAL.REQUEST_STATE_INVALID',
  'PORTAL.REQUEST_DRAFT_EXISTS',
  'PORTAL.REQUEST_ONE_PER_AIT',
  'PORTAL.REQUEST_SIGNATURE_REQUIRED',
  'PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED',
  'PORTAL.REQUEST_OUT_OF_DEADLINE',
  'PORTAL.APPEAL_CETRAN_WINDOW_CLOSED',
  'PORTAL.ATTACHMENT_INVALID',
  'PORTAL.ATTACHMENT_AGENCY_DOCUMENT',
  'PORTAL.WITHDRAWAL_AFTER_JUDGMENT',
  'PORTAL.DILIGENCE_NOT_OPEN',
  'PORTAL.DILIGENCE_ASKS_AGENCY_DOCUMENT',
  'PORTAL.INDICATION_DRIVER_INVALID',
  'PORTAL.INDICATION_SECOND_SIGNATURE_PENDING',
  'PORTAL.INDICATION_WINDOW_CLOSED',
  'PORTAL.DELEGATION_FAILED',
  'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY',
  'PORTAL.EVALUATION_NOT_OFFERED',
  // §4 pagamento e SNE
  'PORTAL.PAYMENT_TIER_NOT_AVAILABLE',
  'PORTAL.PAYMENT_SNE_TIER_REQUIRES_ENROLLMENT',
  'PORTAL.PAYMENT_WAIVER_ACK_REQUIRED',
  'PORTAL.PAYMENT_WAIVER_DISABLED',
  'PORTAL.PAYMENT_METHOD_UNAVAILABLE',
  'PORTAL.PAYMENT_ALREADY_PAID',
  'PORTAL.PAYMENT_PROVIDER_UNAVAILABLE',
  'PORTAL.SNE_CONTACT_REQUIRED',
  'PORTAL.SNE_ALREADY_ENROLLED',
  'PORTAL.SNE_NOT_ENROLLED',
  'PORTAL.SNE_UPSTREAM_UNAVAILABLE',
  // §5 documentos, veículos, sinistros e exames
  'PORTAL.CNH_NOT_FOUND',
  'PORTAL.CNH_NOT_VALID_FOR_DIGITAL',
  'PORTAL.CNH_CLEARANCE_PENDING',
  'PORTAL.CRLV_BLOCKED_BY_DEBT',
  'PORTAL.CRLV_BLOCKED_BY_RESTRICTION',
  'PORTAL.CRLV_SUSPENDED_ENFORCEABILITY_NOT_BLOCKING',
  'PORTAL.NATIONAL_READ_UNAVAILABLE',
  'PORTAL.CRASH_NOT_FINAL',
  'PORTAL.CRASH_THIRD_PARTY_DATA_RESTRICTED',
  'PORTAL.EXAM_PROCESSING',
  'PORTAL.BOARD_REQUEST_WINDOW_CLOSED',
  // §6 atendimento, avaliação e LGPD
  'PORTAL.MANIFESTATION_KIND_INVALID',
  'PORTAL.MANIFESTATION_STATE_INVALID',
  'PORTAL.MANIFESTATION_NEVER_REFUSED',
  'PORTAL.EVALUATION_ALREADY_SUBMITTED',
  'PORTAL.PRIVACY_SCOPE_REQUIRES_ASSURANCE',
  'PORTAL.PRIVACY_NO_DATA',
  'PORTAL.PRIVACY_CORRECTION_NOT_ALLOWED',
  // §7 genéricos
  'PORTAL.VALIDATION_FAILED',
  'PORTAL.ENUM_INVALID',
  'PORTAL.IF_MATCH_REQUIRED',
  'PORTAL.VERSION_CONFLICT',
  'PORTAL.RATE_LIMITED',
  'PORTAL.INTERNAL',
] as const;

export type PortalErrorCode = (typeof PORTAL_ERROR_CODES)[number];

type PresentationRule = Pick<
  ErrorPresentation,
  'severity' | 'nextStep' | 'alternativeChannel'
>;

const error = (
  nextStep: NextStep,
  alternativeChannel = true,
): PresentationRule => ({ severity: 'error', nextStep, alternativeChannel });
const warning: PresentationRule = {
  severity: 'warning',
  nextStep: 'none',
  alternativeChannel: false,
};
const info: PresentationRule = {
  severity: 'info',
  nextStep: 'none',
  alternativeChannel: false,
};

/** Tabela código → apresentação (contrato §3.3; catálogo §8). */
export const ERROR_PRESENTATION: Readonly<
  Record<PortalErrorCode, PresentationRule>
> = {
  'PORTAL.AUTH_REQUIRED': error('login'),
  'PORTAL.IDENTITY_NOT_CITIZEN': error('none'),
  'PORTAL.ASSURANCE_NOT_VERIFIED': error('reauth'),
  'PORTAL.ASSURANCE_INSUFFICIENT': error('elevation'),
  'PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED': error('support'),
  'PORTAL.REPRESENTATION_REFUSED': error('retry'),
  'PORTAL.REPRESENTATION_EXPIRED': error('representation'),
  'PORTAL.TENANT_UNRESOLVED': error('none'),
  'PORTAL.SESSION_TENANT_MISMATCH': error('reauth'),
  'PORTAL.NOT_FOUND': error('entitlement_help'),
  'PORTAL.ENTITLEMENT_REQUIRED': error('entitlement_help'),
  'PORTAL.INELIGIBLE': error('ineligible'),
  'PORTAL.SERVICE_UNAVAILABLE': error('service_unavailable'),
  'PORTAL.SERVICE_PARTIALLY_AVAILABLE': warning,
  'PORTAL.REQUEST_STATE_INVALID': error('reload'),
  'PORTAL.REQUEST_DRAFT_EXISTS': error('existing_request'),
  'PORTAL.REQUEST_ONE_PER_AIT': error('existing_request'),
  'PORTAL.REQUEST_SIGNATURE_REQUIRED': error('none'),
  'PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED': error('none'),
  'PORTAL.REQUEST_OUT_OF_DEADLINE': warning,
  'PORTAL.APPEAL_CETRAN_WINDOW_CLOSED': error('none'),
  'PORTAL.ATTACHMENT_INVALID': error('inline_fields'),
  'PORTAL.ATTACHMENT_AGENCY_DOCUMENT': error('none'),
  'PORTAL.WITHDRAWAL_AFTER_JUDGMENT': error('none'),
  'PORTAL.DILIGENCE_NOT_OPEN': error('reload'),
  'PORTAL.DILIGENCE_ASKS_AGENCY_DOCUMENT': error('support'),
  'PORTAL.INDICATION_DRIVER_INVALID': error('inline_fields'),
  'PORTAL.INDICATION_SECOND_SIGNATURE_PENDING': info,
  'PORTAL.INDICATION_WINDOW_CLOSED': error('none'),
  'PORTAL.DELEGATION_FAILED': warning,
  'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY': error('reload'),
  'PORTAL.EVALUATION_NOT_OFFERED': error('none'),
  'PORTAL.PAYMENT_TIER_NOT_AVAILABLE': error('none'),
  'PORTAL.PAYMENT_SNE_TIER_REQUIRES_ENROLLMENT': error('enrollment'),
  'PORTAL.PAYMENT_WAIVER_ACK_REQUIRED': error('none'),
  'PORTAL.PAYMENT_WAIVER_DISABLED': error('none'),
  'PORTAL.PAYMENT_METHOD_UNAVAILABLE': error('none'),
  'PORTAL.PAYMENT_ALREADY_PAID': error('none'),
  'PORTAL.PAYMENT_PROVIDER_UNAVAILABLE': error('retry'),
  'PORTAL.SNE_CONTACT_REQUIRED': error('inline_fields'),
  'PORTAL.SNE_ALREADY_ENROLLED': error('none'),
  'PORTAL.SNE_NOT_ENROLLED': error('enrollment'),
  'PORTAL.SNE_UPSTREAM_UNAVAILABLE': error('retry'),
  'PORTAL.CNH_NOT_FOUND': error('none'),
  'PORTAL.CNH_NOT_VALID_FOR_DIGITAL': error('none'),
  'PORTAL.CNH_CLEARANCE_PENDING': error('payment'),
  'PORTAL.CRLV_BLOCKED_BY_DEBT': error('payment'),
  'PORTAL.CRLV_BLOCKED_BY_RESTRICTION': error('none'),
  'PORTAL.CRLV_SUSPENDED_ENFORCEABILITY_NOT_BLOCKING': info,
  'PORTAL.NATIONAL_READ_UNAVAILABLE': error('retry'),
  'PORTAL.CRASH_NOT_FINAL': error('none'),
  'PORTAL.CRASH_THIRD_PARTY_DATA_RESTRICTED': info,
  'PORTAL.EXAM_PROCESSING': info,
  'PORTAL.BOARD_REQUEST_WINDOW_CLOSED': error('none'),
  'PORTAL.MANIFESTATION_KIND_INVALID': error('inline_fields'),
  'PORTAL.MANIFESTATION_STATE_INVALID': error('reload'),
  'PORTAL.MANIFESTATION_NEVER_REFUSED': error('support'),
  'PORTAL.EVALUATION_ALREADY_SUBMITTED': error('none'),
  'PORTAL.PRIVACY_SCOPE_REQUIRES_ASSURANCE': error('elevation'),
  'PORTAL.PRIVACY_NO_DATA': info,
  'PORTAL.PRIVACY_CORRECTION_NOT_ALLOWED': error('none'),
  'PORTAL.VALIDATION_FAILED': error('inline_fields'),
  'PORTAL.ENUM_INVALID': error('inline_fields'),
  'PORTAL.IF_MATCH_REQUIRED': error('reload'),
  'PORTAL.VERSION_CONFLICT': error('reload'),
  'PORTAL.RATE_LIMITED': error('retry'),
  'PORTAL.INTERNAL': error('support'),
};

const KNOWN_CODES: ReadonlySet<string> = new Set(PORTAL_ERROR_CODES);

export function isPortalErrorCode(value: unknown): value is PortalErrorCode {
  return typeof value === 'string' && KNOWN_CODES.has(value);
}

/** `PORTAL.REQUEST_OUT_OF_DEADLINE` → `portal.errors.request_out_of_deadline`. */
export function messageKeyFor(code: string): string {
  const bare = code.startsWith(PORTAL_ERROR_PREFIX)
    ? code.slice(PORTAL_ERROR_PREFIX.length)
    : code;
  return `${PORTAL_ERRORS_NAMESPACE}.${bare.toLowerCase()}`;
}

function isPortalErrorBody(value: unknown): value is PortalErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { code?: unknown }).code === 'string'
  );
}

/** Forma mínima de uma resposta HTTP de erro (`HttpErrorResponse` ou equivalente estrutural). */
interface HttpErrorLike {
  readonly status: number;
  readonly error?: unknown;
}

function isHttpErrorLike(value: unknown): value is HttpErrorLike {
  return (
    value instanceof HttpErrorResponse ||
    (typeof value === 'object' &&
      value !== null &&
      typeof (value as { status?: unknown }).status === 'number')
  );
}

/** Extrai o corpo de erro do domínio `portal`, se a resposta o carrega. */
export function portalErrorBody(error: unknown): PortalErrorBody | null {
  if (isHttpErrorLike(error) && isPortalErrorBody(error.error)) {
    return error.error;
  }
  return null;
}

function stringList(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function fieldsOf(
  context: Readonly<Record<string, unknown>>,
): readonly string[] {
  const fields = stringList(context['fields']);
  return fields.length > 0 ? fields : stringList(context['missing']);
}

function retryAfterOf(
  context: Readonly<Record<string, unknown>>,
): number | string | null {
  const value = context['retryAfter'];
  return typeof value === 'number' || typeof value === 'string' ? value : null;
}

export function classifyError(error: unknown): ClassifiedError {
  const body = portalErrorBody(error);
  const status = isHttpErrorLike(error) ? error.status : 0;
  if (!body) {
    return {
      code: null,
      status,
      messageKey: null,
      context: {},
      fields: [],
      retryAfter: null,
    };
  }
  const context: Readonly<Record<string, unknown>> =
    typeof body.context === 'object' && body.context !== null
      ? body.context
      : {};
  const serverKey = body.messageKey;
  const messageKey =
    serverKey && serverKey.startsWith(`${PORTAL_ERRORS_NAMESPACE}.`)
      ? serverKey
      : messageKeyFor(body.code);
  return {
    code: body.code,
    status: body.status || status,
    messageKey,
    requestId: body.requestId,
    context,
    fields: fieldsOf(context),
    retryAfter: retryAfterOf(context),
  };
}

const urlSerializer = new DefaultUrlSerializer();

/** UrlTree serializada de `path` com `queryParams` (mesma codificação do `Router`). */
function routeWith(path: string, queryParams: Params): string {
  const tree = urlSerializer.parse(path);
  tree.queryParams = queryParams;
  return urlSerializer.serialize(tree);
}

function stringOf(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function nextStepRouteFor(
  nextStep: NextStep,
  context: Readonly<Record<string, unknown>>,
  options: PresentErrorOptions,
): string | null {
  switch (nextStep) {
    case 'login':
    case 'reauth':
      return options.resumeRoute
        ? routeWith(LOGIN_ROUTE, { [RESUME_QUERY_PARAM]: options.resumeRoute })
        : LOGIN_ROUTE;
    case 'elevation':
      return options.resumeRoute
        ? routeWith(ELEVATION_ROUTE, {
            [RESUME_QUERY_PARAM]: options.resumeRoute,
          })
        : ELEVATION_ROUTE;
    case 'entitlement_help':
      return options.entitlement
        ? routeWith(ENTITLEMENT_MISSING_ROUTE, {
            recurso: options.entitlement.kind,
            id: options.entitlement.id,
          })
        : ENTITLEMENT_MISSING_ROUTE;
    case 'service_unavailable': {
      const serviceKey = options.serviceKey ?? stringOf(context['serviceKey']);
      return serviceKey
        ? `${SERVICE_UNAVAILABLE_ROUTE}/${encodeURIComponent(serviceKey)}`
        : null;
    }
    case 'existing_request': {
      const requestId = stringOf(context['requestId']);
      return requestId
        ? `${PROCESS_ROUTE}/${encodeURIComponent(requestId)}`
        : null;
    }
    case 'payment':
      return stringOf(context['paymentRoute']);
    case 'enrollment':
      return ENROLLMENT_ROUTE;
    case 'representation':
      return ACCOUNT_ROUTE;
    default:
      return null;
  }
}

/** Apresentação de um erro fora do catálogo (400/422 sem `code`, rede, offline). */
function genericPresentation(classified: ClassifiedError): ErrorPresentation {
  const offline =
    classified.status === 0 &&
    typeof navigator !== 'undefined' &&
    navigator.onLine === false;
  return {
    code: null,
    status: classified.status,
    messageKey: offline ? OFFLINE_KEY : GENERIC_ERROR_KEY,
    messageParams: {},
    severity: 'error',
    nextStep: 'retry',
    nextStepRoute: null,
    alternativeChannel: true,
    fields: classified.fields,
    retryAfter: classified.retryAfter,
    context: classified.context,
    requestId: classified.requestId ?? null,
  };
}

export function presentError(
  error: unknown,
  options: PresentErrorOptions = {},
): ErrorPresentation {
  const classified = classifyError(error);
  if (!isPortalErrorCode(classified.code)) {
    return genericPresentation(classified);
  }
  const rule = ERROR_PRESENTATION[classified.code];
  return {
    code: classified.code,
    status: classified.status,
    messageKey: classified.messageKey ?? messageKeyFor(classified.code),
    messageParams: classified.requestId
      ? { requestId: classified.requestId }
      : {},
    severity: rule.severity,
    nextStep: rule.nextStep,
    nextStepRoute: nextStepRouteFor(rule.nextStep, classified.context, options),
    alternativeChannel: rule.alternativeChannel,
    fields: classified.fields,
    retryAfter: classified.retryAfter,
    context: classified.context,
    requestId: classified.requestId ?? null,
  };
}
