// Catálogo do console nos injetores de rota (CTG-0002.md §10; padrão
// `apps/portal/web/src/app/core/i18n-fallback.ts`): o `StynxTranslatePipe` exige o
// `StynxI18nService`, que só `StynxI18nModule.forRoot` (dentro de
// `provideDetranAuthenticatedApp`) fornece. Nas rotas, estes providers delegam ao serviço do
// injetor pai quando ele existe (bootstrap real: mesma instância, mesmo catálogo) e só criam um
// serviço próprio quando não existe (harness `provideRouter(DASHBOARD_ROUTES)` dos specs), com a
// MESMA cópia da semente que o `main.ts` carrega. `dashboardI18nResolver` garante que o catálogo
// esteja carregado antes de a tela renderizar — nunca uma tela com chaves cruas.
import { inject, type Provider } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import {
  STYNX_I18N_OPTIONS,
  StynxI18nService,
  type StynxI18nModuleOptions,
} from '@stynx-nyx/angular-i18n';

export const DASHBOARD_I18N_OPTIONS: StynxI18nModuleOptions = {
  defaultLocale: 'pt-BR',
  supportedLocales: ['pt-BR'],
  loadCatalog: () =>
    import('../i18n/dashboard.pt-BR.json').then((module) => module.default),
};

export function provideDashboardI18nFallback(): Provider[] {
  return [
    {
      provide: STYNX_I18N_OPTIONS,
      useFactory: () =>
        inject(STYNX_I18N_OPTIONS, { skipSelf: true, optional: true }) ??
        DASHBOARD_I18N_OPTIONS,
    },
    {
      provide: StynxI18nService,
      useFactory: () =>
        inject(StynxI18nService, { skipSelf: true, optional: true }) ??
        new StynxI18nService(),
    },
  ];
}

/** Resolve antes da ativação: o catálogo já está em memória quando a página é criada. */
export const dashboardI18nResolver: ResolveFn<boolean> = () => {
  const i18n = inject(StynxI18nService);
  if (Object.keys(i18n.catalog()).length > 0) return true;
  return i18n.initialize().then(() => true);
};
