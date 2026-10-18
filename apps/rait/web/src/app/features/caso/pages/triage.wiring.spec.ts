// TASK25: routed UI through real guard/facade/client/HTTP. Fixture responses do not replace commands.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { STYNX_I18N_OPTIONS, StynxI18nService } from '@stynx-nyx/angular-i18n';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FIXTURES_PATH, readAppCatalog } from '../../../../testing/kb';
import { CASE_IDS, fixtureCase } from '../../../../testing/http-fixtures';
import { pageProviders } from '../../../../testing/facade.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import { raitAuthGuard } from '../../../core/guards/auth.guard';
import { roleGuard } from '../../../core/guards/role.guard';
import { caseAccessGuard } from '../../../core/guards/case-access.guard';
import { CaseFacade } from '../../../data/facades/case.facade';
import { TriagePageComponent } from './triage.page';
const CASE = CASE_IDS.PROTOCOLADO;
const CRITERIA = ['legitimidade', 'assinatura', 'pedido_compativel'] as const;
const raw = JSON.parse(readFileSync(FIXTURES_PATH, 'utf8'));
const sourceTimely = raw.admissibility.find(
  (row: { criterion: string; verdict: boolean }) =>
    row.criterion === 'tempestividade' && row.verdict === true,
);
// Counterfactual case state and the engine response reuse canonical IDs/values; no deadline is computed here.
const timely = {
  id: sourceTimely.id,
  tenant_id: raw.tenant.id,
  case_id: CASE,
  criterion: 'tempestividade',
  verdict: sourceTimely.verdict,
  reason: sourceTimely.reason,
  evaluated_by: sourceTimely.evaluatedBy,
};
async function mount(
  state: 'PROTOCOLADO' | 'TRIAGEM_ADMISSIBILIDADE' = 'TRIAGEM_ADMISSIBILIDADE',
) {
  TestBed.configureTestingModule({
    providers: [
      ...pageProviders('rait-analyst'),
      StynxI18nService,
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: STYNX_I18N_OPTIONS,
        useValue: {
          defaultLocale: 'pt-BR',
          loadCatalog: async () => readAppCatalog(),
        },
      },
      provideRouter([
        {
          path: 'casos/:id/triagem',
          component: TriagePageComponent,
          canActivate: [
            raitAuthGuard,
            roleGuard(['rait-analyst', 'rait-secretary']),
            caseAccessGuard,
          ],
          data: { screen: 'T-03' },
        },
      ]),
    ],
  });
  await TestBed.inject(StynxI18nService).initialize();
  const http = TestBed.inject(HttpTestingController);
  const harness = await RouterTestingHarness.create();
  let current = { ...fixtureCase(CASE), state, version: 1 };
  let rows = state === 'PROTOCOLADO' ? [] : [timely];
  const readCounts = { caso: 0, admissibility: 0 };
  function reads() {
    for (const req of http.match((request) => request.method === 'GET')) {
      if (req.request.url === `/v1/inf/rait/cases/${CASE}`) {
        readCounts.caso++;
        req.flush(current, { headers: { ETag: `"${current.version}"` } });
      } else if (req.request.url.endsWith('/admissibility')) {
        readCounts.admissibility++;
        req.flush(rows);
      } else req.flush([]);
    }
  }
  const navigation = harness.navigateByUrl(`/casos/${CASE}/triagem`);
  for (let tick = 0; tick < 10; tick++) {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    reads();
    harness.detectChanges();
  }
  await navigation;
  const root = harness.routeNativeElement as HTMLElement;
  expect(root.querySelector('h1')).not.toBeNull();
  return {
    http,
    harness,
    root,
    reads,
    async refreshed(
      version: number,
      before: { caso: number; admissibility: number },
    ) {
      await vi.waitFor(() => {
        reads();
        harness.detectChanges();
        expect(readCounts.caso).toBeGreaterThan(before.caso);
        expect(readCounts.admissibility).toBeGreaterThan(before.admissibility);
        expect(TestBed.inject(CaseFacade).caso.value()?.version).toBe(version);
        expect(TestBed.inject(CaseFacade).caso.status()).toBe('ready');
        expect(TestBed.inject(CaseFacade).admissibilidade.status()).toBe(
          'ready',
        );
      });
    },
    readCounts,
    update(version: number) {
      current = { ...current, state: 'TRIAGEM_ADMISSIBILIDADE', version };
      rows = [timely];
    },
  };
}
function fill(root: HTMLElement) {
  for (const criterion of CRITERIA) {
    const region = root.querySelector(`li[data-criterion="${criterion}"]`)!;
    const input = region.querySelector<HTMLInputElement>(
      'input[type="radio"][value="true"]',
    )!;
    expect(input).not.toBeNull();
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    const reason = region.querySelector<HTMLTextAreaElement>('textarea')!;
    reason.value = 'Conferência da fixture.';
    reason.dispatchEvent(new Event('input'));
  }
}
afterEach(() => TestBed.inject(HttpTestingController).verify());
describe('TASK25 direct PROTOCOLADO admissibility UI', () => {
  it('separates F01 initiation from checklist save; no automatic state change on visit', async () => {
    const { http, root, refreshed, readCounts, update } =
      await mount('PROTOCOLADO');
    const before = { ...readCounts };
    http.expectNone((request) => request.method === 'POST');
    const button = root.querySelector<HTMLButtonElement>(
      '[data-action="start-triage"]',
    );
    expect(button).not.toBeNull();
    button!.click();
    const req = await vi.waitFor(() =>
      http.expectOne(`/v1/inf/rait/cases/${CASE}/commands/triage`),
    );
    expect(req.request.body).toEqual({});
    expect(req.request.headers.get('If-Match')).toBe('"1"');
    update(2);
    req.flush(
      {
        data: {
          ...fixtureCase(CASE),
          state: 'TRIAGEM_ADMISSIBILIDADE',
          version: 2,
        },
        events: [],
      },
      { headers: { ETag: '"2"' } },
    );
    await refreshed(2, before);
    expect(root.querySelector('[data-action="start-triage"]')).toBeNull();
    expect(root.querySelector('input[name="tempestividade"]')).toBeNull();
    http.expectNone((request) => request.method === 'POST');
  });
  it('saves exactly three human criteria sequentially with newest case ETag, never timeliness/actor/time', async () => {
    const { http, harness, root, refreshed, readCounts, update } =
      await mount();
    const before = { ...readCounts };
    fill(root);
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('[data-action="triage"]')!.click();
    for (const [index, criterion] of CRITERIA.entries()) {
      const req = await vi.waitFor(() =>
        http.expectOne('/v1/inf/rait/admissibility'),
      );
      expect(req.request.body).toMatchObject({
        case_id: CASE,
        criterion,
        verdict: true,
      });
      expect(Object.keys(req.request.body).sort()).toEqual([
        'case_id',
        'criterion',
        'reason',
        'verdict',
      ]);
      expect(req.request.headers.get('If-Match')).toBe(`"${index + 1}"`);
      http.expectNone((request) => request.method === 'POST');
      update(index + 2);
      req.flush(
        { data: { ...req.request.body, id: sourceTimely.id }, events: [] },
        { headers: { ETag: `"${index + 2}"` } },
      );
    }
    await refreshed(4, before);
    http.expectNone((request) => request.method === 'POST');
    await expectA11yStateInvariants(root);
  });
  it('a failed second save stops the sequence and exposes the error without simulated completion', async () => {
    const { http, harness, root, reads, update } = await mount();
    fill(root);
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('[data-action="triage"]')!.click();
    const first = await vi.waitFor(() =>
      http.expectOne('/v1/inf/rait/admissibility'),
    );
    update(2);
    first.flush(
      { data: { ...first.request.body, id: sourceTimely.id }, events: [] },
      { headers: { ETag: '"2"' } },
    );
    const second = await vi.waitFor(() =>
      http.expectOne('/v1/inf/rait/admissibility'),
    );
    second.flush(
      { code: 'RAIT.VERSION_CONFLICT' },
      { status: 412, statusText: 'Rejected' },
    );
    await vi.waitFor(() => {
      reads();
      harness.detectChanges();
      expect(root.querySelector('rait-error-banner')).not.toBeNull();
    });
    http.expectNone((request) => request.method === 'POST');
  });
  it('reject sends canonical reason and human-entered grounds only after confirmation', async () => {
    const { http, harness, root } = await mount();
    fill(root);
    const denied = root.querySelector<HTMLInputElement>(
      'li[data-criterion="assinatura"] input[value="false"]',
    )!;
    denied.checked = true;
    denied.dispatchEvent(new Event('change'));
    const reason = root.querySelector<HTMLSelectElement>(
      '[formControlName="nonAdmissionReason"]',
    )!;
    reason.value = 'sem_assinatura';
    reason.dispatchEvent(new Event('change'));
    const grounds = root.querySelector<HTMLTextAreaElement>(
      '[formControlName="nonAdmissionGrounds"]',
    );
    expect(grounds).not.toBeNull();
    grounds!.value =
      'Resolução CONTRAN 900 art. 4º III — fundamento do operador.';
    grounds!.dispatchEvent(new Event('input'));
    harness.detectChanges();
    root.querySelector<HTMLButtonElement>('[data-action="reject"]')!.click();
    harness.detectChanges();
    http.expectNone((request) => request.method === 'POST');
    const dialog = harness.fixture.debugElement.query(
      By.directive(StynxConfirmDialogComponent),
    ).componentInstance as StynxConfirmDialogComponent;
    dialog.confirm.emit();
    harness.detectChanges();
    const req = await vi.waitFor(() =>
      http.expectOne(`/v1/inf/rait/cases/${CASE}/commands/non-admission`),
    );
    expect(req.request.body).toEqual({
      reason: 'sem_assinatura',
      legalBasis: grounds!.value,
    });
    req.flush(
      { code: 'RAIT.TRIAGE_INCOMPLETE' },
      { status: 422, statusText: 'Rejected' },
    );
  });
});
