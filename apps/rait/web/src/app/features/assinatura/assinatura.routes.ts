// Módulo `assinatura` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
// CTG-0002b §6.1 linhas 24–25): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
// fábrica (`moduleRoutes`); as páginas L2 são ligadas por `path`.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { SigningDecisionPageComponent } from './pages/signing-decision.page';
import { SigningQueuePageComponent } from './pages/signing-queue.page';

export const ASSINATURA_ROUTES: Routes = moduleRoutes('assinatura', {
  assinatura: { component: SigningQueuePageComponent },
  'assinatura/:caseId': { component: SigningDecisionPageComponent },
});
