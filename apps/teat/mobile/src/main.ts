import { HttpClient, provideHttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideDetranAuthenticatedApp } from '@detran/ui';
import { AppComponent } from './app/app.component';
import { TEAT_ROUTES } from './app/app.routes';
import {
  createTeatGuardContext,
  TEAT_GUARD_CONTEXT,
} from './app/core/bootstrap.store';
import { readRuntimeConfig } from './app/core/runtime-config';
import { MobileBootstrapClient } from './app/data/api/mobile-bootstrap.client';
import { OpsSnapshotsClient } from './app/data/api/ops-snapshots.client';
import { OfflineSyncClient } from './app/data/api/offline-sync.client';
import { AitClient } from './app/data/api/ait.client';
import { MeasuresClient } from './app/data/api/measures.client';
import { AlcoholClient } from './app/data/api/alcohol.client';
import { ProvisioningClient } from './app/data/api/provisioning.client';

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
          redirectUrl: `${origin}/auth-login`,
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
    { provide: TEAT_GUARD_CONTEXT, useFactory: createTeatGuardContext },
  ],
}).catch((error: unknown) => console.error(error));
