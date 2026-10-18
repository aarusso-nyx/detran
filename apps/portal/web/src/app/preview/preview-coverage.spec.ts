// C-02/C-06, frontend-preview-mode.md §1/§3/§10. All manifest entries, real route guards.
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PORTAL_ROUTE_MANIFEST } from '../app.route-manifest';
import { EntitlementFacade } from '../core/entitlement.facade';
import { ServiceCatalogFacade } from '../core/service-catalog.facade';
import { SESSION_FACADE_PRESETS } from '../../testing/session-facade.stub';
import { PREVIEW_SCREEN_STATES } from './preview-state.service';
import {
  concretePath,
  createPreviewHarness,
  expectJourneyScenario,
  expectNoNetwork,
  JOURNEY,
  openScreen,
  setPreviewDocument,
  settle,
} from './preview.spec-helper';

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});
describe('C-02 — Portal manifest under real guards, zero HTTP', () => {
  for (const entry of PORTAL_ROUTE_MANIFEST) {
    it(`renders /${entry.path} with its real screen and requested final URL`, async () => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { root } = await openScreen(entry);
      expect(root.querySelectorAll('h1')).toHaveLength(1);
      expectNoNetwork();
      expect(errors).not.toHaveBeenCalled();
    });
  }
});
describe('C-02 — JRN-PORTAL-001, five representative states', () => {
  expect(JOURNEY).toHaveLength(8);
  for (const entry of JOURNEY)
    for (const state of PREVIEW_SCREEN_STATES) {
      it(`/${entry.path}: ${state} is observable without redirect or HTTP`, async () => {
        const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { root } = await openScreen(entry, state);
        await expectJourneyScenario(root, state, entry);
        expectNoNetwork();
        expect(errors).not.toHaveBeenCalled();
      });
    }
});
describe('C-02 — guard counterexamples remain effective', () => {
  it('anonymous /autos returns to public entry preserving the requested URL', async () => {
    expect(Object.keys(SESSION_FACADE_PRESETS)).toEqual([
      'anonimo',
      'simples',
      'avancada',
      'qualificada',
    ]);
    const url = setPreviewDocument('/autos', 'anonimo');
    const harness = await createPreviewHarness();
    await harness.navigateByUrl(url);
    await settle(harness);
    const router = TestBed.inject(Router);
    expect(router.parseUrl(router.url).queryParams['retomar']).toBe(url);
    expect(router.url.split('?')[0]).toBe('/');
    expectNoNetwork();
  });
  it('simples persona cannot open the advanced defense route', async () => {
    const entry = PORTAL_ROUTE_MANIFEST.find(
      (row) => row.path === 'autos/:aitId/defesa/nova',
    )!;
    const url = setPreviewDocument(concretePath(entry), 'simples');
    const harness = await createPreviewHarness();
    await harness.navigateByUrl(url);
    await settle(harness);
    expect(TestBed.inject(Router).url.split('?')[0]).toBe(
      '/assinatura/elevacao',
    );
    expectNoNetwork();
  });
  it('unavailable service is redirected by the existing availability guard', async () => {
    const entry = PORTAL_ROUTE_MANIFEST.find(
      (row) => row.path === 'autos/:aitId/defesa/nova',
    )!;
    const url = setPreviewDocument(concretePath(entry));
    const harness = await createPreviewHarness();
    const catalog = TestBed.inject(ServiceCatalogFacade);
    const availability = vi.spyOn(catalog, 'availability').mockResolvedValue({
      status: 'unavailable',
      reason: 'delegacao_indisponivel_r0007',
      alternativeChannelNote: undefined,
    });
    await harness.navigateByUrl(url);
    await settle(harness);
    expect(availability).toHaveBeenCalledWith('defesa_previa');
    expect(TestBed.inject(Router).url.split('?')[0]).toBe(
      '/servico-indisponivel/defesa_previa',
    );
    expectNoNetwork();
  });
  it('a denied canonical resource follows the existing entitlement guard', async () => {
    const entry = PORTAL_ROUTE_MANIFEST.find(
      (row) => row.path === 'autos/:aitId',
    )!;
    const url = setPreviewDocument(concretePath(entry));
    const harness = await createPreviewHarness();
    const check = vi
      .spyOn(TestBed.inject(EntitlementFacade), 'check')
      .mockResolvedValue(false);
    await harness.navigateByUrl(url);
    await settle(harness);
    expect(check).toHaveBeenCalled();
    expect(TestBed.inject(Router).url.split('?')[0]).toBe(
      '/vinculo/por-que-nao-vejo',
    );
    expectNoNetwork();
  });
});
