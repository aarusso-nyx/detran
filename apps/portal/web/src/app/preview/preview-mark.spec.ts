// C-03, fixed mark and labelled controls; D-01/D-02 document navigation.
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import { PORTAL_ROUTE_MANIFEST } from '../app.route-manifest';
import {
  DETRAN_PREVIEW_MARK_ATTR,
  DETRAN_PREVIEW_MARK_VALUE,
  PREVIEW_MARK_KEY,
  PREVIEW_NOT_FUNCTIONAL_KEY,
} from './preview-mark';
import { PreviewRootComponent } from './preview-root.component';
import {
  PREVIEW_SCREEN_STATES,
  PreviewStateService,
} from './preview-state.service';
import {
  configurePreview,
  concretePath,
  expectNoNetwork,
  personaFor,
  previewSpecContext,
  setPreviewDocument,
} from './preview.spec-helper';

afterEach(() => window.history.replaceState(null, '', '/'));
describe('C-03 — visible preview mark', () => {
  it('uses the literal cross-app marker and Portal keys', () => {
    expect(DETRAN_PREVIEW_MARK_ATTR).toBe('data-detran-preview-mark');
    expect(DETRAN_PREVIEW_MARK_VALUE).toBe('DETRAN_PREVIEW_MARK');
    expect(PREVIEW_MARK_KEY).toBe('portal.states.preview_mark');
    expect(PREVIEW_NOT_FUNCTIONAL_KEY).toBe(
      'portal.states.preview_not_functional',
    );
    expect(PREVIEW_SCREEN_STATES).toEqual([
      'loaded',
      'empty',
      'loading',
      'error',
      'forbidden',
    ]);
  });
  for (const entry of PORTAL_ROUTE_MANIFEST) {
    it(`keeps mark on /${entry.path}`, async () => {
      const url = setPreviewDocument(concretePath(entry), personaFor(entry));
      await configurePreview();
      const fixture = TestBed.createComponent(PreviewRootComponent);
      fixture.autoDetectChanges();
      await TestBed.inject(Router).navigateByUrl(url);
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      const mark = root.querySelector(
        '[data-detran-preview-mark="DETRAN_PREVIEW_MARK"]',
      );
      expect(mark).not.toBeNull();
      expect(mark?.textContent).toContain('PRÉVIA — DADOS FICTÍCIOS');
      expect(root.querySelector('portal-preview-bar')).not.toBeNull();
      expectNoNetwork();
    });
  }
  it('reads query params and labelled selectors request document navigation', async () => {
    setPreviewDocument('/autos', 'simples', 'empty');
    const context = previewSpecContext();
    await configurePreview(context.providers);
    const fixture = TestBed.createComponent(PreviewRootComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const state = TestBed.inject(PreviewStateService);
    expect(state.state()).toBe('empty');
    expect(state.role()).toBe('simples');
    const controls = [
      ...(
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLSelectElement>('portal-preview-bar select'),
    ];
    expect(controls).toHaveLength(2);
    for (const select of controls)
      expect(
        [...(select.labels ?? [])].some((label) => !!label.textContent?.trim()),
      ).toBe(true);
    const states = controls.find((select) =>
      [...select.options].some((option) => option.value === 'loaded'),
    )!;
    expect([...states.options].map((option) => option.value)).toEqual(
      PREVIEW_SCREEN_STATES,
    );
    states.value = 'error';
    states.dispatchEvent(new Event('change', { bubbles: true }));
    expect(context.navigate).toHaveBeenCalled();
    const url = new URL(
      context.navigate.mock.calls.at(-1)![0],
      window.location.origin,
    );
    expect(url.searchParams.get('pv_estado')).toBe('error');
    expect(url.searchParams.get('pv_papel')).toBe('simples');
  });
});
