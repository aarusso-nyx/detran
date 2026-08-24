import { importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import type { EnvironmentProviders, Provider } from '@angular/core';
import { provideStynxDefaults } from '@stynx-nyx/angular';
import type {
  StynxAngularConfig,
  StynxTenancyConfig,
} from '@stynx-nyx/angular';
import { provideStynxAuth } from '@stynx-nyx/angular-auth';
import type { StynxAngularAuthModuleOptions } from '@stynx-nyx/angular-auth';
import { StynxI18nModule } from '@stynx-nyx/angular-i18n';
import type { StynxI18nModuleOptions } from '@stynx-nyx/angular-i18n';

export interface DetranAuthenticatedAppConfig {
  angular: StynxAngularConfig;
  oidc: StynxAngularAuthModuleOptions;
  tenancy?: StynxTenancyConfig;
  i18n?: Partial<StynxI18nModuleOptions>;
}

const PT_BR_FALLBACK_CATALOG = { 'detran.loading': 'Carregando…' };

/**
 * Standard authenticated bootstrap for DETRAN apps. It composes STYNX core,
 * OIDC/session exchange, tenant resolution, and pt-BR-first i18n in one place.
 */
export function provideDetranAuthenticatedApp(
  config: DetranAuthenticatedAppConfig,
): EnvironmentProviders {
  const i18n: StynxI18nModuleOptions = {
    defaultLocale: 'pt-BR',
    supportedLocales: ['pt-BR'],
    loadCatalog: async () => PT_BR_FALLBACK_CATALOG,
    ...config.i18n,
  };
  const providers: Array<Provider | EnvironmentProviders> = [
    provideStynxDefaults({
      angular: config.angular,
      tenancy: config.tenancy,
      auth: provideStynxAuth(config.oidc),
      i18n: importProvidersFrom(StynxI18nModule.forRoot(i18n)),
    }),
  ];
  return makeEnvironmentProviders(providers);
}
