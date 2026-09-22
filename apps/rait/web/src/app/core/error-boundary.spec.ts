// R-0012 TASK-0005 (Inspector). Critérios C-2A-46…50 do contrato `CTG-0002a.md` §11/§8 sobre
// `core/error-boundary.ts`, `core/error-codes.ts`, `core/error-banner.component.ts`. Falha
// esperada nesta entrega: esses arquivos de produção ainda não existem (TASK-0006).
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  readErrorCodes,
  readAppCatalog,
  listAppSourceFiles,
  APP_SRC_ROOT,
} from '../../testing/kb';
import { readFileSync } from 'node:fs';
import {
  markerI18nModule,
  initializeMarkerI18n,
  buildTestCatalog,
} from '../../testing/i18n-test-catalog';
import { expectNoSeriousA11yViolations } from '../../testing/axe.spec-helper';
// Produção (TASK-0006): ainda não existe.
import {
  classifyError,
  RaitCommandUnavailableError,
  RaitErrorBannerComponent,
  type ClassifiedError,
} from './error-boundary';
import { RAIT_ERROR_CODES, messageKeyFor } from './error-codes';

function httpError(
  status: number,
  code?: string,
  context: Record<string, unknown> = {},
  headers?: Record<string, string>,
): HttpErrorResponse {
  return new HttpErrorResponse({
    status,
    error: code ? { code, context } : undefined,
    headers: headers as never,
  });
}

describe('C-2A-46 — tabela de classificação do §8', () => {
  it('dado 403 RAIT.FORBIDDEN_ACTION quando classifyError então forbidden/rait.errors.forbidden (code preservado)', () => {
    const result = classifyError(httpError(403, 'RAIT.FORBIDDEN_ACTION'));
    expect(result.kind).toBe('forbidden');
    expect(result.messageKey).toBe('rait.errors.forbidden');
    expect(result.code).toBe('RAIT.FORBIDDEN_ACTION');
  });

  it('dado 401 RAIT.AUTH_REQUIRED quando classifyError então forbidden/rait.errors.auth_required', () => {
    const result = classifyError(httpError(401, 'RAIT.AUTH_REQUIRED'));
    expect(result.kind).toBe('forbidden');
    expect(result.messageKey).toBe('rait.errors.auth_required');
  });

  it('dado 404 RAIT.TENANT_MISMATCH quando classifyError então not_found', () => {
    const result = classifyError(httpError(404, 'RAIT.TENANT_MISMATCH'));
    expect(result.kind).toBe('not_found');
  });

  it('dado 409 RAIT.CASE_STATE_INVALID quando classifyError então conflict/rait.errors.case_state_invalid', () => {
    const result = classifyError(httpError(409, 'RAIT.CASE_STATE_INVALID'));
    expect(result.kind).toBe('conflict');
    expect(result.messageKey).toBe('rait.errors.case_state_invalid');
  });

  it('dado 412 RAIT.VERSION_CONFLICT quando classifyError então conflict', () => {
    expect(classifyError(httpError(412, 'RAIT.VERSION_CONFLICT')).kind).toBe(
      'conflict',
    );
  });

  it('dado 428 RAIT.IF_MATCH_REQUIRED quando classifyError então conflict', () => {
    expect(classifyError(httpError(428, 'RAIT.IF_MATCH_REQUIRED')).kind).toBe(
      'conflict',
    );
  });

  it('dado 400 RAIT.VALIDATION_FAILED com fields quando classifyError então validation com fields', () => {
    const result = classifyError(
      httpError(400, 'RAIT.VALIDATION_FAILED', {
        fields: [{ path: 'facts', rule: 'required' }],
      }),
    );
    expect(result.kind).toBe('validation');
    expect(result.fields).toEqual([{ path: 'facts', rule: 'required' }]);
  });

  it('dado 422 RAIT.DECISION_JURISDICTION com legalBasis quando classifyError então business com legalBasis', () => {
    const result = classifyError(
      httpError(422, 'RAIT.DECISION_JURISDICTION', {
        legalBasis: 'CTB art. 285',
      }),
    );
    expect(result.kind).toBe('business');
    expect(result.legalBasis).toBe('CTB art. 285');
  });

  it('dado 429 quando classifyError então unavailable', () => {
    expect(classifyError(httpError(429, 'RAIT.RATE_LIMIT')).kind).toBe(
      'unavailable',
    );
  });

  it('dado 503 RAIT.UPSTREAM_RENAINF_UNAVAILABLE com retryAfter 30 quando classifyError então unavailable com retryAfter 30', () => {
    const result = classifyError(
      httpError(503, 'RAIT.UPSTREAM_RENAINF_UNAVAILABLE', { retryAfter: 30 }),
    );
    expect(result.kind).toBe('unavailable');
    expect(result.retryAfter).toBe(30);
  });

  it('dado 500 RAIT.INTERNAL com requestId "r1" quando classifyError então server com requestId', () => {
    const result = classifyError(
      new HttpErrorResponse({
        status: 500,
        error: { code: 'RAIT.INTERNAL', requestId: 'r1' },
      }),
    );
    expect(result.kind).toBe('server');
    expect(result.requestId).toBe('r1');
  });

  it('dado status 0 (rede) quando classifyError então offline/rait.errors.offline', () => {
    const result = classifyError(new HttpErrorResponse({ status: 0 }));
    expect(result.kind).toBe('offline');
    expect(result.messageKey).toBe('rait.errors.offline');
  });

  it('dado new Error("x") quando classifyError então unknown/rait.errors.unknown', () => {
    const result = classifyError(new Error('x'));
    expect(result.kind).toBe('unknown');
    expect(result.messageKey).toBe('rait.errors.unknown');
  });

  it('dado new RaitCommandUnavailableError("rait-case:admit") quando classifyError então unavailable/rait.common.unavailable com command', () => {
    const result = classifyError(
      new RaitCommandUnavailableError('rait-case:admit'),
    );
    expect(result.kind).toBe('unavailable');
    expect(result.messageKey).toBe('rait.common.unavailable');
    expect(result.command).toBe('rait-case:admit');
  });
});

describe('C-2A-47 — RAIT_ERROR_CODES × readErrorCodes()', () => {
  it('dado RAIT_ERROR_CODES quando comparado a readErrorCodes() então mesmo conjunto e ordem', () => {
    expect([...RAIT_ERROR_CODES]).toEqual([...readErrorCodes()]);
  });

  RAIT_ERROR_CODES.forEach((code) => {
    it(`dado o código ${code} quando messageKeyFor então "rait.errors." + minúsculas sem RAIT. e existe no catálogo do app`, () => {
      const expected = `rait.errors.${code.replace(/^RAIT\./, '').toLowerCase()}`;
      expect(messageKeyFor(code)).toBe(expected);
      const catalog = readAppCatalog();
      expect(Object.prototype.hasOwnProperty.call(catalog, expected)).toBe(
        true,
      );
    });
  });
});

describe('C-2A-48 — código fora do catálogo e messageKey do servidor ignorada', () => {
  it('dado 409 RAIT.NOVO_CODIGO (fora do catálogo) quando classifyError então conflict, code preservado, messageKey unknown', () => {
    const result = classifyError(httpError(409, 'RAIT.NOVO_CODIGO'));
    expect(result.kind).toBe('conflict');
    expect(result.code).toBe('RAIT.NOVO_CODIGO');
    expect(result.messageKey).toBe('rait.errors.unknown');
  });

  it('dado corpo com messageKey "portal.errors.x" quando classifyError então ignorado (messageKey derivado do code)', () => {
    const result = classifyError(
      new HttpErrorResponse({
        status: 409,
        error: {
          code: 'RAIT.CASE_STATE_INVALID',
          messageKey: 'portal.errors.x',
        },
      }),
    );
    expect(result.messageKey).toBe('rait.errors.case_state_invalid');
  });
});

describe('C-2A-49 — único classificador de erro (A12(a))', () => {
  it('dado listAppSourceFiles() menos core/error-boundary.ts quando lidos então nenhum contém "instanceof HttpErrorResponse" nem redefine classifyError( nem compara ".status ===" de resposta HTTP', () => {
    const errorBoundaryPath = `${APP_SRC_ROOT}/app/core/error-boundary.ts`;
    const files = listAppSourceFiles().filter(
      (file) => file !== errorBoundaryPath && !file.endsWith('.spec.ts'),
    );
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toContain('instanceof HttpErrorResponse');
      expect(text, file).not.toMatch(/function classifyError\(/);
      expect(text, file).not.toMatch(/\.status\s*===/);
    }
  });
});

describe('C-2A-50 — RaitErrorBannerComponent', () => {
  it('dado error kind "forbidden" quando renderizado então role alert, data-kind, data-code, texto = rait.errors.forbidden', async () => {
    TestBed.configureTestingModule({
      imports: [
        RaitErrorBannerComponent,
        markerI18nModule(['rait.errors.forbidden']),
      ],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(RaitErrorBannerComponent);
    const error: ClassifiedError = {
      kind: 'forbidden',
      code: 'RAIT.FORBIDDEN_ACTION',
      messageKey: 'rait.errors.forbidden',
      context: {},
    };
    fixture.componentRef.setInput('error', error);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('alert');
    expect(host.getAttribute('data-kind')).toBe('forbidden');
    expect(host.getAttribute('data-code')).toBe('RAIT.FORBIDDEN_ACTION');
    expect(host.textContent).toContain(
      buildTestCatalog(['rait.errors.forbidden'])['rait.errors.forbidden'],
    );
    await expectNoSeriousA11yViolations(host);
  });

  it('dado error kind "unavailable" quando renderizado então role status', async () => {
    TestBed.configureTestingModule({
      imports: [
        RaitErrorBannerComponent,
        markerI18nModule(['rait.common.unavailable']),
      ],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(RaitErrorBannerComponent);
    const error: ClassifiedError = {
      kind: 'unavailable',
      messageKey: 'rait.common.unavailable',
      context: {},
    };
    fixture.componentRef.setInput('error', error);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('role')).toBe('status');
  });

  it('dado error com requestId "r1" quando renderizado então "r1" visível', async () => {
    TestBed.configureTestingModule({
      imports: [
        RaitErrorBannerComponent,
        markerI18nModule(['rait.errors.unknown']),
      ],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(RaitErrorBannerComponent);
    const error: ClassifiedError = {
      kind: 'server',
      messageKey: 'rait.errors.unknown',
      requestId: 'r1',
      context: {},
    };
    fixture.componentRef.setInput('error', error);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('r1');
  });
});
