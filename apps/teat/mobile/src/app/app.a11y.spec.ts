import { TestBed } from '@angular/core/testing';
import type { Type } from '@angular/core';
import { provideRouter } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';
import { createBoatExtension } from '@detran/boat-mobile';
import { expect, it } from 'vitest';
import { AitClient } from './data/api/ait.client';
import { AlcoholClient } from './data/api/alcohol.client';
import { MeasuresClient } from './data/api/measures.client';
import { MobileBootstrapClient } from './data/api/mobile-bootstrap.client';
import { OfflineSyncClient } from './data/api/offline-sync.client';
import { OpsSnapshotsClient } from './data/api/ops-snapshots.client';
import { ProvisioningClient } from './data/api/provisioning.client';
import { LocalActStore } from './data/local/local-act.store';
import { AuthBootstrapCoordinator } from './core/bootstrap.store';
import {
  BOAT_ROUTE_PATHS,
  D05_ROUTE_PATH,
  TEAT_ROUTE_FIXTURE,
  type TeatRouteFixture,
} from '../testing/route-contract.fixture';
import { expectTeatA11yState } from '../testing/a11y-state.spec-helper';
import { loadConcreteRoutes } from '../testing/concrete-routes';
import { TEAT_BOAT_EXTENSION } from './navigation/guards/readiness.guard';

const FORM_SCREENS = new Set([
  'open-shift',
  'ait-vehicle',
  'ait-driver',
  'ait-frame',
  'ait-location',
  'ait-evidence',
  'ait-signature',
  'ait-review',
  'ait-cancel-request',
  'alcohol-device',
  'alcohol-result',
  'alcohol-refusal',
  'measure-term',
  'sync-conflict',
]);

const STORE_BACKED_SCREENS = new Set([
  'ait-start',
  'ait-vehicle',
  'ait-driver',
  'ait-frame',
  'ait-frame-detail',
  'ait-location',
  'ait-notes',
  'ait-validations',
  'ait-evidence',
  'ait-measures',
  'ait-signature',
  'ait-review',
  'ait-done',
  'ait-print',
  'ait-shift-detail',
  'ait-cancel-request',
  'ait-speed-measurement',
  'removal',
  'inventory',
  'transshipment',
  'measure-term',
  'measure-done',
  'alcohol-device',
  'alcohol-result',
  'alcohol-refusal',
  'alcohol-signs',
  'alcohol-forward',
  'alcohol-links',
  'alcohol-term',
  'sync',
  'sync-item',
  'diagnostics',
  'approach-no-ait',
  'document-check',
  'special-inspection',
]);

const CLIENT_TOKENS: Readonly<Record<string, Type<object>>> = {
  MobileBootstrapClient,
  OpsSnapshotsClient,
  OfflineSyncClient,
  AitClient,
  MeasuresClient,
  AlcoholClient,
};

for (const expected of TEAT_ROUTE_FIXTURE) {
  if (expected.path === D05_ROUTE_PATH) {
    it('dada D-05 indisponível quando renderizada então anuncia a indisponibilidade sem carregar a feature', async () => {
      const route = (await loadConcreteRoutes()).find(
        (candidate) => candidate.path === expected.path,
      );
      expect(route?.data).toMatchObject({
        featureEnabled: false,
        state: 'unavailable',
      });
      expect(route?.loadComponent).toBeUndefined();
    });
  } else if (BOAT_ROUTE_PATHS.includes(expected.path)) {
    it(`dada /${expected.path} BOAT quando montada pelo boundary real então mantém invariantes a11y e axe`, async () => {
      const route = (await loadConcreteRoutes()).find(
        (candidate) => candidate.path === expected.path,
      );
      expect(route?.data).toMatchObject({ boatExtension: true });
      expect(route?.loadComponent).toBeTypeOf('function');
      const component = (await route?.loadComponent?.()) as Type<unknown>;
      const fixture = TestBed.configureTestingModule({
        imports: [component],
        providers: [
          { provide: TEAT_BOAT_EXTENSION, useFactory: createBoatExtension },
        ],
      }).createComponent(component);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      await expectTeatA11yState(fixture.nativeElement as HTMLElement);
    });
  } else {
    it(`dada /${expected.path} quando renderizada então mantém invariantes a11y e axe`, async () => {
      const route = (await loadConcreteRoutes()).find(
        (candidate) => candidate.path === expected.path,
      );
      expect(
        route?.loadComponent,
        `componente ausente: /${expected.path}`,
      ).toBeTypeOf('function');
      const component = (await route?.loadComponent?.()) as Type<unknown>;
      const fixture = TestBed.configureTestingModule({
        imports: [component],
        providers: [
          provideRouter([]),
          {
            provide: StynxSessionService,
            useValue: {
              login: async () => undefined,
              completeLogin: async () => undefined,
            },
          },
          {
            provide: AuthBootstrapCoordinator,
            useValue: { start: async () => ({ status: 'blocked' }) },
          },
          { provide: LocalActStore, useValue: { pending: async () => [] } },
          {
            provide: StynxI18nService,
            useValue: {
              initialize: async () => undefined,
              translate: (key: string) => key,
            },
          },
          ...[
            MobileBootstrapClient,
            OpsSnapshotsClient,
            OfflineSyncClient,
            AitClient,
            MeasuresClient,
            AlcoholClient,
            ProvisioningClient,
          ].map((provide) => ({ provide, useValue: {} })),
        ],
      }).createComponent(component);
      fixture.detectChanges();
      await fixture.whenStable();
      const page = fixture.componentInstance as {
        contract?: { clientId?: string };
        integration?: {
          client?: unknown;
          schema?: unknown;
          store?: unknown;
          load?: unknown;
        };
      };
      const integration = page.integration;
      expect(integration).toEqual(expect.any(Object));
      expect(integration?.load).toBeTypeOf('function');
      if (STORE_BACKED_SCREENS.has(expected.path)) {
        expect(integration?.store).toEqual(expect.any(Object));
      } else {
        expect(integration?.store).toBeUndefined();
      }
      const expectedClientId = (expected as TeatRouteFixture).clientId;
      expect(page.contract?.clientId).toBe(expectedClientId);
      if (expectedClientId === undefined) {
        expect(integration?.client).toBeUndefined();
      } else {
        expect(CLIENT_TOKENS[expectedClientId]).toBeDefined();
        expect(integration?.client).toBe(
          TestBed.inject(CLIENT_TOKENS[expectedClientId]),
        );
      }
      if (FORM_SCREENS.has(expected.path)) {
        expect(integration?.schema).toMatchObject({
          safeParse: expect.any(Function),
        });
      }
      await expectTeatA11yState(fixture.nativeElement as HTMLElement);
    });
  }
}
