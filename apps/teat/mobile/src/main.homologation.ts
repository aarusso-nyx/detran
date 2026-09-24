/** UI/workflow homologation build. No backend request or official act is allowed. */
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { ErrorHandler, inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';
import { AppComponent } from './app/app.component';
import { TEAT_HOMOLOGATION_ROUTES } from './app/app.homologation.routes';
import {
  AuthBootstrapCoordinator,
  BootstrapStore,
  TEAT_GUARD_CONTEXT,
} from './app/core/bootstrap.store';
import {
  TeatErrorBoundaryState,
  TeatErrorHandler,
} from './app/core/field-shell.component';
import { ReadinessGateService } from './app/core/readiness-gate.service';
import { AitClient } from './app/data/api/ait.client';
import { AlcoholClient } from './app/data/api/alcohol.client';
import { MeasuresClient } from './app/data/api/measures.client';
import { MobileBootstrapClient } from './app/data/api/mobile-bootstrap.client';
import { NormativeClient } from './app/data/api/normative.client';
import { OfflineSyncClient } from './app/data/api/offline-sync.client';
import { OpsSnapshotsClient } from './app/data/api/ops-snapshots.client';
import { ProvisioningClient } from './app/data/api/provisioning.client';
import {
  BrowserEncryptedStoreAdapter,
  LocalActStore,
  TEAT_MOBILE_ENCRYPTED_STORE,
} from './app/data/local/local-act.store';
import { NormativePackageService } from './app/data/normative/normative-package.service';
import { SyncWorker, TEAT_MOBILE_ID } from './app/data/sync/sync.worker';
import {
  createHomologationAitScenario,
  TEAT_HOMOLOGATION_AIT,
} from './app/shared/homologation-ait.port';
import {
  createHomologationGuardContext,
  provideTeatMobileHomologationSession,
} from './app/shared/homologation-guard-context';
import { homologationHttpBlockInterceptor } from './app/shared/homologation-http.interceptor';
import {
  createTeatMobileHomologationPersona,
  TEAT_MOBILE_HOMOLOGATION_PERSONA,
} from './app/shared/homologation-persona.port';
import {
  createTeatMobileHomologationSync,
  TEAT_MOBILE_HOMOLOGATION_SYNC,
} from './app/shared/homologation-sync.port';
import {
  createTeatMobileHomologationShift,
  TEAT_MOBILE_HOMOLOGATION_SHIFT,
} from './app/shared/homologation-shift.port';
import {
  PrinterDialog,
  TEAT_MOBILE_PRINTER,
} from './app/shared/mobile-printer.port';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([homologationHttpBlockInterceptor])),
    provideRouter(TEAT_HOMOLOGATION_ROUTES),
    ...provideTeatMobileHomologationSession(),
    {
      provide: TEAT_MOBILE_HOMOLOGATION_PERSONA,
      useFactory: createTeatMobileHomologationPersona,
    },
    provideAppInitializer(() => inject(StynxI18nService).initialize()),
    {
      provide: TEAT_HOMOLOGATION_AIT,
      useFactory: createHomologationAitScenario,
    },
    {
      provide: TEAT_MOBILE_HOMOLOGATION_SYNC,
      useFactory: createTeatMobileHomologationSync,
    },
    {
      provide: TEAT_MOBILE_HOMOLOGATION_SHIFT,
      useFactory: createTeatMobileHomologationShift,
    },
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
      useFactory: () =>
        new BrowserEncryptedStoreAdapter('detran-teat-mobile-homologation'),
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
    { provide: TEAT_GUARD_CONTEXT, useFactory: createHomologationGuardContext },
  ],
}).catch((error: unknown) => console.error(error));
