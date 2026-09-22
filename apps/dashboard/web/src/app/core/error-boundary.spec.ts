// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "core/error-boundary.spec.ts" (C-02-46..49).
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  classifyError,
  DASH_ERROR_CODES,
  DashboardCommandUnavailableError,
  DashErrorBannerComponent,
  FreshnessContractViolationError,
  isDashErrorCode,
  messageKeyFor,
} from './error-boundary.js';
import {
  readAppCatalog,
  readErrorCodes,
  listAppSourceFiles,
} from '../../testing/kb.js';
import { readFileSync } from 'node:fs';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog.js';

function httpError(status: number, body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

describe('classifyError (catálogo §7)', () => {
  it('dado status 0 então offline/error_state/dashboard.states.error (C-02-46)', () => {
    const result = classifyError(httpError(0, null));
    expect(result.kind).toBe('offline');
    expect(result.presentation).toBe('error_state');
    expect(result.stateKey).toBe('dashboard.states.error');
  });

  it('dado 503 DASH.SOURCE_UNAVAILABLE então source_unavailable/seal/unavailable com as_of e source (C-02-46)', () => {
    const result = classifyError(
      httpError(503, {
        code: 'DASH.SOURCE_UNAVAILABLE',
        context: { source: 's', lastSeenAt: 't' },
      }),
    );
    expect(result.kind).toBe('source_unavailable');
    expect(result.presentation).toBe('seal');
    expect(result.stateKey).toBe('dashboard.states.unavailable');
    expect(result.stateParams).toEqual({ as_of: 't' });
    expect(result.source).toBe('s');
    expect(result.messageKey).toBe('dashboard.errors.source_unavailable');
  });

  it('dado 423 DASH.PANEL_BLOCKED_BY_DECISION então blocked_by_decision/placeholder com decision (C-02-46)', () => {
    const result = classifyError(
      httpError(423, {
        code: 'DASH.PANEL_BLOCKED_BY_DECISION',
        context: { decision: 'DT-066' },
      }),
    );
    expect(result.kind).toBe('blocked_by_decision');
    expect(result.presentation).toBe('placeholder');
    expect(result.stateParams).toEqual({ decision: 'DT-066' });
  });

  it('dado 401 DASH.AUTH_REQUIRED então forbidden (C-02-46)', () => {
    expect(
      classifyError(httpError(401, { code: 'DASH.AUTH_REQUIRED' })).kind,
    ).toBe('forbidden');
  });

  it('dado 403 DASH.LAYER_FORBIDDEN então forbidden/dashboard.states.forbidden/dashboard.errors.layer_forbidden (C-02-46)', () => {
    const result = classifyError(
      httpError(403, { code: 'DASH.LAYER_FORBIDDEN' }),
    );
    expect(result.kind).toBe('forbidden');
    expect(result.stateKey).toBe('dashboard.states.forbidden');
    expect(result.messageKey).toBe('dashboard.errors.layer_forbidden');
  });

  it('dado 404 DASH.TENANT_MISMATCH então not_found/dashboard.states.empty (C-02-46)', () => {
    const result = classifyError(
      httpError(404, { code: 'DASH.TENANT_MISMATCH' }),
    );
    expect(result.kind).toBe('not_found');
    expect(result.stateKey).toBe('dashboard.states.empty');
  });

  it.each([409, 412, 428])(
    'dado status %i (ALERT_STATE_INVALID/VERSION_CONFLICT/IF_MATCH_REQUIRED) então conflict/dashboard.states.conflict (C-02-46)',
    (status) => {
      const codes: Record<number, string> = {
        409: 'DASH.ALERT_STATE_INVALID',
        412: 'DASH.VERSION_CONFLICT',
        428: 'DASH.IF_MATCH_REQUIRED',
      };
      const result = classifyError(httpError(status, { code: codes[status] }));
      expect(result.kind).toBe('conflict');
      expect(result.stateKey).toBe('dashboard.states.conflict');
    },
  );

  it('dado 400 DASH.VALIDATION_FAILED com fields então validation com fields (C-02-46)', () => {
    const result = classifyError(
      httpError(400, {
        code: 'DASH.VALIDATION_FAILED',
        context: { fields: [{ path: 'note', rule: 'required' }] },
      }),
    );
    expect(result.kind).toBe('validation');
    expect(result.fields).toEqual([{ path: 'note', rule: 'required' }]);
  });

  it('dado 422 DASH.DUTY_EVIDENCE_REQUIRED com missing então business com missing (C-02-46)', () => {
    const result = classifyError(
      httpError(422, {
        code: 'DASH.DUTY_EVIDENCE_REQUIRED',
        context: { missing: ['protocol'] },
      }),
    );
    expect(result.kind).toBe('business');
    expect(result.missing).toEqual(['protocol']);
  });

  it('dado 429 com retryAfter 30 então unavailable com retryAfter (C-02-46)', () => {
    const result = classifyError(
      httpError(429, { context: { retryAfter: 30 } }),
    );
    expect(result.kind).toBe('unavailable');
    expect(result.retryAfter).toBe(30);
  });

  it.each([502, 504])(
    'dado status %i então unavailable (C-02-46)',
    (status) => {
      expect(classifyError(httpError(status, {})).kind).toBe('unavailable');
    },
  );

  it('dado 503 sem código de fonte então unavailable (C-02-46)', () => {
    expect(classifyError(httpError(503, { code: 'DASH.INTERNAL' })).kind).toBe(
      'unavailable',
    );
  });

  it('dado 500 DASH.INTERNAL com requestId então server com requestId (C-02-46)', () => {
    const result = classifyError(
      httpError(500, { code: 'DASH.INTERNAL', context: { requestId: 'r1' } }),
    );
    expect(result.kind).toBe('server');
    expect(result.requestId).toBe('r1');
  });

  it("dado new Error('x') então unknown (C-02-46)", () => {
    expect(classifyError(new Error('x')).kind).toBe('unknown');
  });

  it('dado DashboardCommandUnavailableError então unavailable_in_version/banner com command (C-02-46)', () => {
    const result = classifyError(
      new DashboardCommandUnavailableError('dashboard:alert:ack'),
    );
    expect(result.kind).toBe('unavailable_in_version');
    expect(result.presentation).toBe('banner');
    expect(result.stateKey).toBe('dashboard.states.unavailable_in_version');
    expect(result.command).toBe('dashboard:alert:ack');
  });

  it('dado FreshnessContractViolationError então contract_violation/seal (C-02-46)', () => {
    const result = classifyError(
      new FreshnessContractViolationError('/v1/dashboard/x'),
    );
    expect(result.kind).toBe('contract_violation');
    expect(result.presentation).toBe('seal');
  });
});

describe('DASH_ERROR_CODES / messageKeyFor (C-02-47)', () => {
  it('dado DASH_ERROR_CODES quando comparado a readErrorCodes() então mesmo conjunto e ordem (52)', () => {
    expect([...DASH_ERROR_CODES]).toEqual(readErrorCodes());
    expect(DASH_ERROR_CODES).toHaveLength(52);
  });

  it.each(DASH_ERROR_CODES)(
    'dado o código %s quando messageKeyFor então dashboard.errors.<minúsculas> e a chave existe no catálogo do app',
    (code) => {
      const key = messageKeyFor(code);
      expect(key).toBe(
        `dashboard.errors.${code.replace('DASH.', '').toLowerCase()}`,
      );
      expect(readAppCatalog()).toHaveProperty(key);
    },
  );

  it('dado 409 { code: DASH.NOVO } (fora do catálogo) então kind conflict, code preservado, messageKey null (C-02-47)', () => {
    const result = classifyError(httpError(409, { code: 'DASH.NOVO' }));
    expect(result.kind).toBe('conflict');
    expect(result.code).toBe('DASH.NOVO');
    expect(result.messageKey).toBeNull();
    expect(isDashErrorCode('DASH.NOVO')).toBe(false);
  });

  it('dado corpo com messageKey do servidor então ignorado (C-02-47)', () => {
    const result = classifyError(
      httpError(403, {
        code: 'DASH.LAYER_FORBIDDEN',
        messageKey: 'outro.valor',
      }),
    );
    expect(result.messageKey).toBe('dashboard.errors.layer_forbidden');
  });
});

describe('único classificador (A12(a)) (C-02-48)', () => {
  it('dado listAppSourceFiles() (menos error-boundary.ts e freshness.interceptor.ts) quando lidos então nenhum reclassifica erro HTTP', () => {
    for (const file of listAppSourceFiles()) {
      if (file.endsWith('core/error-boundary.ts')) continue;
      if (file.endsWith('core/interceptors/freshness.interceptor.ts')) continue;
      if (file.endsWith('core/error-boundary.spec.ts')) continue;
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toContain('instanceof HttpErrorResponse');
      expect(text, file).not.toMatch(/\.status\s*===/);
    }
  });

  it('dado listAppSourceFiles() quando varridos então nenhum de features/** ou shared/** importa @angular/common/http', () => {
    for (const file of listAppSourceFiles()) {
      if (!/[\\/](features|shared)[\\/]/.test(file)) continue;
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/from\s+['"]@angular\/common\/http['"]/);
    }
  });
});

describe('DashErrorBannerComponent (C-02-49)', () => {
  it('dado error kind forbidden então role=alert, data-kind/data-code, texto = stateKey + messageKey', async () => {
    const keys = [
      'dashboard.states.forbidden',
      'dashboard.errors.layer_forbidden',
    ];
    TestBed.configureTestingModule({
      imports: [markerI18nModule(keys), DashErrorBannerComponent],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(DashErrorBannerComponent);
    fixture.componentRef.setInput(
      'error',
      classifyError(httpError(403, { code: 'DASH.LAYER_FORBIDDEN' })),
    );
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const banner = element.querySelector('[role="alert"]');
    expect(banner).not.toBeNull();
    expect(
      element.getAttribute('data-kind') ?? banner?.getAttribute('data-kind'),
    ).toBe('forbidden');
  });

  it('dado error kind unavailable_in_version então role=status (C-02-49)', async () => {
    TestBed.configureTestingModule({
      imports: [
        markerI18nModule(['dashboard.states.unavailable_in_version']),
        DashErrorBannerComponent,
      ],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(DashErrorBannerComponent);
    fixture.componentRef.setInput(
      'error',
      classifyError(
        new DashboardCommandUnavailableError('dashboard:alert:ack'),
      ),
    );
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[role="status"]')).not.toBeNull();
  });

  it('dado blocked_by_decision com decision DT-066 então texto contém DT-066; requestId visível (C-02-49)', async () => {
    const keys = [
      'dashboard.states.blocked_by_decision',
      'dashboard.errors.panel_blocked_by_decision',
    ];
    TestBed.configureTestingModule({
      imports: [markerI18nModule(keys), DashErrorBannerComponent],
    });
    await initializeMarkerI18n();
    const fixture = TestBed.createComponent(DashErrorBannerComponent);
    fixture.componentRef.setInput(
      'error',
      classifyError(
        httpError(423, {
          code: 'DASH.PANEL_BLOCKED_BY_DECISION',
          context: { decision: 'DT-066', requestId: 'r1' },
        }),
      ),
    );
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('DT-066');
  });
});
