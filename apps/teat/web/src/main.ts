import {
  inject,
  mergeApplicationConfig,
  provideAppInitializer,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';

import { AppComponent } from './app/app.component.js';
import { appConfig, teatAuthenticatedProvider } from './app/app.config.js';

const productionConfig = mergeApplicationConfig(appConfig, {
  providers: [
    teatAuthenticatedProvider,
    provideAppInitializer(() => inject(StynxI18nService).initialize()),
  ],
});

bootstrapApplication(AppComponent, productionConfig).catch((error: unknown) =>
  console.error(error),
);
