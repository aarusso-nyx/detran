// Módulo `fila` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3): rotas
// derivadas do manifesto com caminhos completos — guardas, `title` e `data` vêm da fábrica
// (`moduleRoutes`); sem componentes reais nesta CTG (placeholders; o CTG-0002b passa as páginas).
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';

export const FILA_ROUTES: Routes = moduleRoutes('fila');
