// R-0033 TASK-0007, frontend-preview-mode.md §10. Same authenticated kit bootstrap;
// only data, synthetic session, clock and stream boundaries are replaced. Real guards remain.
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import type { EnvironmentProviders, Provider } from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
} from '@angular/router';
import { provideDetranAuthenticatedApp } from '@detran/ui';
import { STYNX_AUTH_PROVIDER } from '@stynx-nyx/angular';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { PORTAL_ROUTES } from '../app.routes';
import { PortalClock } from '../core/clock';
import { PortalStreamTransport } from '../core/realtime.service';
import { readRuntimeConfig } from '../core/runtime-config';
import { SessionFacade } from '../core/session.facade';
import { PortalTitleStrategy } from '../core/title.strategy';
import { PortalClient } from '../data/portal.client';
import appCatalog from '../i18n/portal.pt-BR.json';
import { PreviewPortalClient } from './adapters/portal.client';
import { PreviewClock } from './preview-clock';
import { previewHttpBlockInterceptor } from './preview-http-block.interceptor';
import {
  PreviewSessionFacade,
  PreviewStynxSessionService,
} from './preview-session';
import { PreviewStreamTransport } from './preview-stream-transport';
import overlay from './preview.pt-BR.json';

export function providePreviewMode(): Array<Provider | EnvironmentProviders> {
  const runtime = readRuntimeConfig();
  const origin = window.location.origin;
  return [
    provideHttpClient(
      withInterceptors([previewHttpBlockInterceptor]),
      withInterceptorsFromDi(),
    ),
    provideRouter(PORTAL_ROUTES, withComponentInputBinding()),
    provideDetranAuthenticatedApp({
      angular: { apiBaseUrl: '', sessionMode: 'bearer' },
      oidc: {
        oidc: {
          authority: runtime.oidcAuthority,
          clientId: runtime.clientId,
          redirectUrl: `${origin}/auth/callback`,
          postLogoutRedirectUri: `${origin}/`,
        },
        loginRedirectRoute: '/',
      },
      tenancy: { defaultTenantResolver: () => runtime.tenantId || null },
      i18n: {
        loadCatalog: () => Promise.resolve({ ...appCatalog, ...overlay }),
      },
    }),
    { provide: STYNX_AUTH_PROVIDER, useValue: null },
    { provide: StynxSessionService, useClass: PreviewStynxSessionService },
    { provide: SessionFacade, useClass: PreviewSessionFacade },
    { provide: PortalClient, useClass: PreviewPortalClient },
    { provide: PortalClock, useClass: PreviewClock },
    { provide: PortalStreamTransport, useClass: PreviewStreamTransport },
    { provide: TitleStrategy, useClass: PortalTitleStrategy },
  ];
}
