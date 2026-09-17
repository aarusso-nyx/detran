// ErrorBoundary (portal-frontends.md §5.1; portal-error-catalog.md §8): mapeia o código
// `PORTAL.<CODE>` de uma resposta de erro para a chave i18n `portal.errors.<code minúsculo>`.
// Só o mapeamento nesta entrega — o catálogo de mensagens (`portal.errors.*`) é transcrito no
// CTG-0002 (TASK-0006). Nenhuma mensagem é montada aqui: a UI só traduz a chave.
import { HttpErrorResponse } from '@angular/common/http';
import type { PortalErrorBody } from '../data/portal.client';

export const PORTAL_ERROR_PREFIX = 'PORTAL.';
export const PORTAL_ERRORS_NAMESPACE = 'portal.errors';

export interface ClassifiedError {
  /** Código canônico (`PORTAL.NOT_FOUND`), ou `null` quando a resposta não é do catálogo. */
  readonly code: string | null;
  readonly status: number;
  /** Chave i18n (`portal.errors.not_found`), ou `null` quando não há código catalogado. */
  readonly messageKey: string | null;
  readonly requestId?: string;
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

/** Extrai o corpo de erro do domínio `portal`, se a resposta o carrega. */
export function portalErrorBody(error: unknown): PortalErrorBody | null {
  if (error instanceof HttpErrorResponse && isPortalErrorBody(error.error)) {
    return error.error;
  }
  return null;
}

export function classifyError(error: unknown): ClassifiedError {
  const body = portalErrorBody(error);
  const status = error instanceof HttpErrorResponse ? error.status : 0;
  if (!body) return { code: null, status, messageKey: null };
  return {
    code: body.code,
    status: body.status || status,
    messageKey: body.messageKey ?? messageKeyFor(body.code),
    requestId: body.requestId,
  };
}
