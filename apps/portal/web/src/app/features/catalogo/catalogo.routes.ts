// Módulo `catalogo` (portal-frontends.md §4; route-manifest.md): rotas derivadas do manifesto com
// caminhos completos; páginas placeholder até o CTG-0003, que troca os componentes por rota
// via `moduleRoutes('catalogo', { '<path>': { component, title } })`.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';

export const CATALOGO_ROUTES: Routes = moduleRoutes('catalogo');
