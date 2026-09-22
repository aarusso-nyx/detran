// Módulo `organizacao` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
// CTG-0002b §6.1 linhas 44–47): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
// fábrica (`moduleRoutes`); L1 (membros, pools) ligadas por `path`; `escala` e `jeton` continuam
// L0 (placeholder, M13).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { MembersPageComponent } from './pages/members.page';
import { PoolsPageComponent } from './pages/pools.page';

export const ORGANIZACAO_ROUTES: Routes = moduleRoutes('organizacao', {
  'organizacao/membros': { component: MembersPageComponent },
  'organizacao/pools': { component: PoolsPageComponent },
});
