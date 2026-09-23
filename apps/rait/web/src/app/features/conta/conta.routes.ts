// Módulo `conta` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e CTG-0002b
// §6.1 linha 63): rota derivada do manifesto — guardas, `title` e `data` vêm da fábrica
// (`moduleRoutes`); a página L2 é ligada por `path`.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { AccountPageComponent } from './pages/account.page';

export const CONTA_ROUTES: Routes = moduleRoutes('conta', {
  conta: { component: AccountPageComponent },
});
