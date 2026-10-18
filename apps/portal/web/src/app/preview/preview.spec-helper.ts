// R-0033 TASK-0009 — Inspector. Sources: frontend-preview-mode.md §10; Portal manifest and
// src/testing/http-fixtures*.ts. No HTTP response simulation and no replacement of app guards.
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import {
  ApplicationInitStatus,
  type Provider,
  type EnvironmentProviders,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { expect, vi } from 'vitest';
import * as base from '../../testing/http-fixtures';
import * as reads from '../../testing/http-fixtures-reads';
import * as pair3 from '../../testing/http-fixtures-pair3';
import {
  PORTAL_ROUTE_MANIFEST,
  type RouteManifestEntry,
} from '../app.route-manifest';
import { PREVIEW_FIXTURE_LOADER } from './preview-fixtures';
import { providePreviewMode } from './preview.providers';
import {
  PREVIEW_DOCUMENT_NAVIGATE,
  PREVIEW_ROLE_PARAM,
  PREVIEW_STATE_PARAM,
  PreviewStateService,
  type PreviewScreenState,
} from './preview-state.service';

export type PreviewProviders = Array<Provider | EnvironmentProviders>;
export type PreviewPersona = 'anonimo' | 'simples' | 'avancada' | 'qualificada';
/** Export names are preserved so the Engineer transcribes source bodies without inferred fields. */
export const CANONICAL_FIXTURES = JSON.parse(
  JSON.stringify({ ...base, ...reads, ...pair3 }),
) as Record<string, unknown>;
export const JOURNEY = PORTAL_ROUTE_MANIFEST.filter((entry) =>
  entry.journeys.includes('JRN-PORTAL-001'),
);
export const PARAMS: Readonly<Record<string, string>> = {
  aitId: base.AIT_ID,
  requestId: reads.REQUEST_EM_ANDAMENTO_ID,
  diligenceId: reads.DILIGENCE_ID_FIXTURE,
  vehicleId: pair3.VEHICLE_ID,
  crashId: pair3.CRASH_ID,
  examId: pair3.EXAM_ID,
  manifestationId: pair3.MANIFESTATION_EM_ANALISE_ID,
  serviceKey: 'consulta_multas',
};
export function concretePath(entry: Pick<RouteManifestEntry, 'path'>): string {
  return (
    '/' +
    entry.path.replace(/:([A-Za-z]+)/g, (_, key: string) => {
      if (!PARAMS[key]) throw new Error(`Unmapped canonical parameter ${key}`);
      return PARAMS[key];
    })
  );
}
export function personaFor(
  entry: Pick<RouteManifestEntry, 'path'>,
): PreviewPersona {
  return entry.path === 'assinatura/elevacao' ? 'simples' : 'avancada';
}
export function setPreviewDocument(
  path: string,
  role: PreviewPersona = 'avancada',
  state: PreviewScreenState = 'loaded',
): string {
  const separator = path.includes('?') ? '&' : '?';
  const url = `${path}${separator}${new URLSearchParams({ [PREVIEW_ROLE_PARAM]: role, [PREVIEW_STATE_PARAM]: state })}`;
  window.history.replaceState(null, '', url);
  return url;
}
export function previewSpecContext(extra: PreviewProviders = []) {
  const navigate = vi.fn<(url: string) => void>();
  return {
    navigate,
    providers: [
      provideHttpClientTesting(),
      {
        provide: PREVIEW_FIXTURE_LOADER,
        useValue: () => Promise.resolve(CANONICAL_FIXTURES),
      },
      { provide: PREVIEW_DOCUMENT_NAVIGATE, useValue: navigate },
      ...extra,
    ] as PreviewProviders,
  };
}
export async function configurePreview(
  extra: PreviewProviders = [],
): Promise<void> {
  TestBed.configureTestingModule({
    providers: [
      ...providePreviewMode(),
      provideLocationMocks(),
      ...previewSpecContext(extra).providers,
    ],
  });
  await TestBed.inject(ApplicationInitStatus).donePromise;
}
export async function createPreviewHarness(
  extra: PreviewProviders = [],
): Promise<RouterTestingHarness> {
  await configurePreview(extra);
  return RouterTestingHarness.create();
}
export function expectNoNetwork(): void {
  const controller = TestBed.inject(HttpTestingController);
  controller.expectNone(() => true);
  controller.verify();
}
export async function settle(
  harness: RouterTestingHarness,
): Promise<HTMLElement> {
  await vi.waitFor(() => {
    harness.detectChanges();
    expect(harness.routeNativeElement).not.toBeNull();
    expect(harness.routeNativeElement?.querySelector('h1')).not.toBeNull();
  });
  // Resolve the chained in-memory reads (entitlement, session, page and wizard).
  for (let tick = 0; tick < 5; tick++) {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    harness.detectChanges();
  }
  return harness.routeNativeElement as HTMLElement;
}
export async function openScreen(
  entry: RouteManifestEntry,
  state: PreviewScreenState = 'loaded',
) {
  const url = setPreviewDocument(concretePath(entry), personaFor(entry), state);
  const harness = await createPreviewHarness();
  await harness.navigateByUrl(url);
  const root = await settle(harness);
  const unavailable = entry.serviceKey === 'junta_medica';
  expect(TestBed.inject(Router).url).toBe(
    unavailable ? '/servico-indisponivel/junta_medica' : url,
  );
  expect(root.getAttribute('data-screen')).toBe(
    unavailable ? '' : (entry.screen ?? ''),
  );
  expect(TestBed.inject(PreviewStateService).state()).toBe(state);
  return { harness, root, url };
}
/** Existing Portal has no forbidden ReadStatus: the classified 403 renders its error banner. */
export async function expectJourneyScenario(
  root: HTMLElement,
  state: PreviewScreenState,
  entry: RouteManifestEntry,
): Promise<void> {
  if (entry.path === 'assinatura/elevacao') {
    // T-27 is an action page: its readless initial context remains visible. Commands are tested separately.
    expect(root.querySelector('portal-assurance-explainer')).not.toBeNull();
    return;
  }
  await vi.waitFor(() => {
    if (state === 'loading')
      expect(root.getAttribute('data-status')).toBe('loading');
    if (state === 'error' || state === 'forbidden')
      expect(root.querySelector('portal-error-banner')).not.toBeNull();
    if (state === 'empty' && entry.path === 'autos')
      expect(root.getAttribute('data-status')).toBe('empty');
    if (state === 'loaded' || state === 'empty')
      expect(root.querySelector('h1')?.textContent?.trim()).not.toBe('');
  });
}
