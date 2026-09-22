// Módulo `protocolo` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
// CTG-0002b §6.1 linhas 18–23): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
// fábrica (`moduleRoutes`); as páginas L2 são ligadas por `path`.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { IntakeListPageComponent } from './pages/intake-list.page';
import { IntakeNewPageComponent } from './pages/intake-new.page';
import { PendingContentPageComponent } from './pages/pending-content.page';
import { RedirectsPageComponent } from './pages/redirects.page';
import { RemittancesPageComponent } from './pages/remittances.page';
import { WithdrawalsPageComponent } from './pages/withdrawals.page';

export const PROTOCOLO_ROUTES: Routes = moduleRoutes('protocolo', {
  protocolo: { component: IntakeListPageComponent },
  'protocolo/novo': { component: IntakeNewPageComponent },
  'protocolo/pendencias': { component: PendingContentPageComponent },
  'protocolo/remessas': { component: RemittancesPageComponent },
  'protocolo/redirecionamentos': { component: RedirectsPageComponent },
  'protocolo/desistencias': { component: WithdrawalsPageComponent },
});
