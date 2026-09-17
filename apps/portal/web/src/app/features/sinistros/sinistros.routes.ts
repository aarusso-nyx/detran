// Módulo `sinistros` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
// via `moduleRoutes('sinistros', { '<path>': { component, title } })`.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';

export const SINISTROS_ROUTES: Routes = moduleRoutes('sinistros');
