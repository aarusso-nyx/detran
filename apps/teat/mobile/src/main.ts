import { HttpClient, provideHttpClient } from '@angular/common/http';
import { ErrorHandler, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideDetranAuthenticatedApp } from '@detran/ui';
import { AppComponent } from './app/app.component';
import { TEAT_ROUTES } from './app/app.routes';
import {
  AuthBootstrapCoordinator,
  BootstrapStore,
  createTeatGuardContext,
  TEAT_GUARD_CONTEXT,
} from './app/core/bootstrap.store';
import {
  TeatErrorBoundaryState,
  TeatErrorHandler,
} from './app/core/field-shell.component';
import { ReadinessGateService } from './app/core/readiness-gate.service';
import { readRuntimeConfig } from './app/core/runtime-config';
import { MobileBootstrapClient } from './app/data/api/mobile-bootstrap.client';
import { OpsSnapshotsClient } from './app/data/api/ops-snapshots.client';
import { OfflineSyncClient } from './app/data/api/offline-sync.client';
import { AitClient } from './app/data/api/ait.client';
import { MeasuresClient } from './app/data/api/measures.client';
import { AlcoholClient } from './app/data/api/alcohol.client';
import { ProvisioningClient } from './app/data/api/provisioning.client';
import { NormativeClient } from './app/data/api/normative.client';
import {
  LocalActStore,
  TEAT_MOBILE_ENCRYPTED_STORE,
} from './app/data/local/local-act.store';
import { BrowserEncryptedStoreAdapter } from './app/data/local/local-act.store';
import { SyncWorker, TEAT_MOBILE_ID } from './app/data/sync/sync.worker';
import { NormativePackageService } from './app/data/normative/normative-package.service';
import {
  PrinterDialog,
  TEAT_MOBILE_PRINTER,
} from './app/shared/mobile-printer.port';

const runtime = readRuntimeConfig();
const origin = window.location.origin;

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(TEAT_ROUTES),
    provideDetranAuthenticatedApp({
      angular: { apiBaseUrl: '', sessionMode: 'bearer' },
      oidc: {
        oidc: {
          authority: runtime.oidcAuthority,
          clientId: runtime.clientId,
          redirectUrl: `${origin}/auth-mfa`,
          postLogoutRedirectUri: `${origin}/`,
        },
        loginRedirectRoute: '/auth-login',
      },
      tenancy: { defaultTenantResolver: () => runtime.tenantId },
      i18n: {
        loadCatalog: () =>
          import('./app/i18n/teat.pt-BR.json').then((module) => module.default),
      },
    }),
    {
      provide: MobileBootstrapClient,
      useFactory: () => new MobileBootstrapClient(inject(HttpClient)),
    },
    {
      provide: OpsSnapshotsClient,
      useFactory: () => new OpsSnapshotsClient(inject(HttpClient)),
    },
    {
      provide: OfflineSyncClient,
      useFactory: () => new OfflineSyncClient(inject(HttpClient)),
    },
    {
      provide: AitClient,
      useFactory: () => new AitClient(inject(HttpClient)),
    },
    {
      provide: MeasuresClient,
      useFactory: () => new MeasuresClient(inject(HttpClient)),
    },
    {
      provide: AlcoholClient,
      useFactory: () => new AlcoholClient(inject(HttpClient)),
    },
    {
      provide: ProvisioningClient,
      useFactory: () => new ProvisioningClient(inject(HttpClient)),
    },
    {
      provide: NormativeClient,
      useFactory: () => new NormativeClient(inject(HttpClient)),
    },
    BootstrapStore,
    AuthBootstrapCoordinator,
    ReadinessGateService,
    TeatErrorBoundaryState,
    TeatErrorHandler,
    { provide: ErrorHandler, useExisting: TeatErrorHandler },
    {
      provide: TEAT_MOBILE_ENCRYPTED_STORE,
      useFactory: () => new BrowserEncryptedStoreAdapter(),
    },
    {
      provide: LocalActStore,
      useFactory: () => new LocalActStore(inject(TEAT_MOBILE_ENCRYPTED_STORE)),
    },
    {
      provide: SyncWorker,
      useFactory: () =>
        new SyncWorker(
          inject(LocalActStore),
          inject(OfflineSyncClient),
          inject(BootstrapStore),
          inject(TEAT_MOBILE_ID),
        ),
    },
    {
      provide: NormativePackageService,
      useFactory: () =>
        new NormativePackageService(
          inject(TEAT_MOBILE_ENCRYPTED_STORE),
          inject(NormativeClient),
          inject(BootstrapStore),
        ),
    },
    {
      provide: PrinterDialog,
      useFactory: () =>
        new PrinterDialog(
          inject(TEAT_MOBILE_PRINTER),
          inject(AitClient),
          inject(LocalActStore),
        ),
    },
    { provide: TEAT_GUARD_CONTEXT, useFactory: createTeatGuardContext },
  ],
}).catch((error: unknown) => console.error(error));
