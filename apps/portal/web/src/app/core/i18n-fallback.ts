// Fallback de i18n para injetores de rota (plan.md M9): o `StynxTranslatePipe` exige o
// `StynxI18nService`, que só `StynxI18nModule.forRoot` (dentro de `provideDetranAuthenticatedApp`)
// fornece. Nas rotas, estes providers delegam ao serviço do injetor pai quando ele existe (o
// caso do bootstrap real: mesma instância, mesmo catálogo) e só criam um serviço vazio quando
// não existe (harness `provideRouter(PORTAL_ROUTES)` dos specs): as chaves são exibidas cruas,
// nada quebra. Nunca registrar `StynxI18nModule.forRoot` aqui (detran-ui-guide.md §1).
import { inject, type Provider } from '@angular/core';
import {
  STYNX_I18N_OPTIONS,
  StynxI18nService,
  type StynxI18nModuleOptions,
} from '@stynx-nyx/angular-i18n';

const EMPTY_OPTIONS: StynxI18nModuleOptions = {
  defaultLocale: 'pt-BR',
  supportedLocales: ['pt-BR'],
  loadCatalog: async () => ({}),
};

export function providePortalI18nFallback(): Provider[] {
  return [
    {
      provide: STYNX_I18N_OPTIONS,
      useFactory: () =>
        inject(STYNX_I18N_OPTIONS, { skipSelf: true, optional: true }) ??
        EMPTY_OPTIONS,
    },
    {
      provide: StynxI18nService,
      useFactory: () =>
        inject(StynxI18nService, { skipSelf: true, optional: true }) ??
        new StynxI18nService(),
    },
  ];
}
