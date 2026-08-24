/** Shared DETRAN application-shell, bootstrap, theme, and UI primitive surface. */
export * from './lib/bootstrap.js';
export * from './lib/detran-shell.component.js';
export * from './lib/detran-breadcrumbs.component.js';
export * from './lib/detran-feedback.component.js';
export * from './lib/theme.js';
export {
  EmptyStateComponent,
  StynxBannerComponent,
  StynxLoadingSpinnerComponent,
  StynxPaginationComponent,
  StynxTableComponent,
  StynxToastContainerComponent,
  StynxToastService,
} from '@stynx-nyx/angular-ui';
export {
  StynxIntlCurrencyPipe,
  StynxIntlDatePipe,
  StynxIntlNumberPipe,
  StynxI18nService,
  StynxI18nModule,
  StynxTranslatePipe,
  type StynxCatalog,
  type StynxI18nModuleOptions,
} from '@stynx-nyx/angular-i18n';
