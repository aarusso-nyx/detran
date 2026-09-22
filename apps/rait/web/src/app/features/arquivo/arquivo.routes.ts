// Módulo `arquivo` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
// CTG-0002b §6.1 linhas 55–57): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
// fábrica (`moduleRoutes`); a raiz `arquivo` continua redirect; as páginas L2 são ligadas por `path`.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { ArchiveSearchPageComponent } from './pages/archive-search.page';
import { RetentionQueuePageComponent } from './pages/retention-queue.page';
import { SealedDossierPageComponent } from './pages/sealed-dossier.page';

export const ARQUIVO_ROUTES: Routes = moduleRoutes('arquivo', {
  'arquivo/busca': { component: ArchiveSearchPageComponent },
  'arquivo/casos/:id': { component: SealedDossierPageComponent },
  'arquivo/retencao': { component: RetentionQueuePageComponent },
});
