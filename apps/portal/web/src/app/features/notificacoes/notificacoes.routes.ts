// Módulo `notificacoes` (portal-frontends.md §4; route-manifest.md; contrato CTG-0003c §1): rotas
// derivadas do manifesto com caminhos completos — guardas e `data.screen` vêm da fábrica
// (`moduleRoutes`), a página e o título de cada caminho são fixados aqui (T-12, preferências, T-09).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { InboxPageComponent } from './pages/inbox.page';
import { PreferencesPageComponent } from './pages/preferences.page';
import { SnePageComponent } from './pages/sne.page';

export const NOTIFICACOES_ROUTES: Routes = moduleRoutes('notificacoes', {
  notificacoes: {
    component: InboxPageComponent,
    title: 'portal.screens.t12.title',
  },
  'notificacoes/preferencias': {
    component: PreferencesPageComponent,
    title: 'portal.notifications.preferences.title',
  },
  sne: { component: SnePageComponent, title: 'portal.screens.t09.title' },
});
