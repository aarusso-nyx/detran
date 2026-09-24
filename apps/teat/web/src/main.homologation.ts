/** UI/workflow homologation entry. All backend and remote HTTP is blocked. */
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  inject,
  mergeApplicationConfig,
  provideAppInitializer,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';

import { AppComponent } from './app/app.component.js';
import { createTeatWebAppConfig } from './app/app.config.js';
import { TEAT_HOMOLOGATION_ROUTES } from './app/app.homologation.routes.js';
import { provideTeatWebHomologationContext } from './app/shared/homologation-context.js';
import {
  createTeatWebHomologationPersona,
  TEAT_WEB_HOMOLOGATION_PERSONA,
} from './app/shared/homologation-persona.port.js';
import {
  createTeatWebHomologationEvents,
  TEAT_WEB_HOMOLOGATION_EVENTS,
} from './app/shared/homologation-events.port.js';
import {
  TEAT_WEB_HOMOLOGATION,
  webHomologationHttpBlockInterceptor,
} from './app/shared/homologation-http.interceptor.js';
import {
  createTeatWebHomologationScenario,
  TEAT_WEB_HOMOLOGATION_SCENARIO,
} from './app/shared/homologation-scenario.port.js';
import {
  createTeatWebHomologationAitAccept,
  TEAT_WEB_HOMOLOGATION_AIT_ACCEPT,
} from './app/shared/homologation-ait-accept.port.js';

const homologationConfig = mergeApplicationConfig(
  createTeatWebAppConfig(TEAT_HOMOLOGATION_ROUTES),
  {
    providers: [
      provideHttpClient(
        withInterceptors([webHomologationHttpBlockInterceptor]),
        withInterceptorsFromDi(),
      ),
      { provide: TEAT_WEB_HOMOLOGATION, useValue: true },
      {
        provide: TEAT_WEB_HOMOLOGATION_PERSONA,
        useFactory: createTeatWebHomologationPersona,
      },
      {
        provide: TEAT_WEB_HOMOLOGATION_EVENTS,
        useFactory: createTeatWebHomologationEvents,
      },
      {
        provide: TEAT_WEB_HOMOLOGATION_SCENARIO,
        useFactory: createTeatWebHomologationScenario,
      },
      {
        provide: TEAT_WEB_HOMOLOGATION_AIT_ACCEPT,
        useFactory: createTeatWebHomologationAitAccept,
      },
      ...provideTeatWebHomologationContext(),
      provideAppInitializer(() => inject(StynxI18nService).initialize()),
    ],
  },
);

bootstrapApplication(AppComponent, homologationConfig).catch((error: unknown) =>
  console.error(error),
);
