// DASHBOARD_ROUTES (CTG-0002.md §3): árvore derivada de `DASHBOARD_ROUTE_MANIFEST`. Todas as
// rotas vivem sob `/monitoramento`; os 10 módulos de feature são lazy (`canMatch` pelo primeiro
// segmento, caminhos completos dentro do chunk) e o `core` entra no bootstrap. A coringa `**` é
// técnica: leva a `/monitoramento/sem-permissao` sem `de`.
import type { Routes } from '@angular/router';
import {
  dashboardI18nResolver,
  provideDashboardI18nFallback,
} from './core/i18n-fallback';
import {
  FORBIDDEN_ROUTE,
  FEATURE_SEGMENTS,
  MONITORAMENTO_SEGMENT,
  moduleRoutes,
  ownsFirstSegment,
  type ManifestRouteOptions,
} from './core/manifest-routes';
import { AuthCallbackPageComponent } from './core/pages/auth-callback.page';
import { ForbiddenPageComponent } from './core/pages/forbidden.page';

/** Páginas do `core` por caminho do manifesto (§3). */
const CORE_PAGES: Readonly<Record<string, ManifestRouteOptions>> = {
  '/monitoramento/sem-permissao': { component: ForbiddenPageComponent },
  '/monitoramento/auth/callback': { component: AuthCallbackPageComponent },
};

/** Montagens lazy dos 10 módulos de feature, na ordem de §Decisões 1. */
const FEATURE_MOUNTS: Routes = [
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.triage)],
    loadChildren: () =>
      import('./features/triage/triage.routes').then((m) => m.TRIAGE_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.radar)],
    loadChildren: () =>
      import('./features/radar/radar.routes').then((m) => m.RADAR_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.integrations)],
    loadChildren: () =>
      import('./features/integrations/integrations.routes').then(
        (m) => m.INTEGRATIONS_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.duties)],
    loadChildren: () =>
      import('./features/duties/duties.routes').then((m) => m.DUTIES_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.comparison)],
    loadChildren: () =>
      import('./features/comparison/comparison.routes').then(
        (m) => m.COMPARISON_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.audit)],
    loadChildren: () =>
      import('./features/audit/audit.routes').then((m) => m.AUDIT_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.transparency)],
    loadChildren: () =>
      import('./features/transparency/transparency.routes').then(
        (m) => m.TRANSPARENCY_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.crashes)],
    loadChildren: () =>
      import('./features/crashes/crashes.routes').then((m) => m.CRASHES_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.catalogue)],
    loadChildren: () =>
      import('./features/catalogue/catalogue.routes').then(
        (m) => m.CATALOGUE_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.reports)],
    loadChildren: () =>
      import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
  },
];

export const DASHBOARD_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: MONITORAMENTO_SEGMENT },
  {
    path: MONITORAMENTO_SEGMENT,
    // Catálogo do console disponível no injetor de rota e carregado antes da ativação.
    providers: provideDashboardI18nFallback(),
    resolve: { i18n: dashboardI18nResolver },
    children: [...FEATURE_MOUNTS, ...moduleRoutes('core', CORE_PAGES)],
  },
  { path: '**', redirectTo: FORBIDDEN_ROUTE },
];
