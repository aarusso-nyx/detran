// Módulo `colegiado` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e
// CTG-0002b §6.1 linhas 27–37): rotas derivadas do manifesto — guardas, `title` e `data` vêm da
// fábrica (`moduleRoutes`); a raiz `colegiado/:orgao` continua redirect e as 11 páginas L2 são
// ligadas por `path`.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { AgendaBuilderPageComponent } from './pages/agenda-builder.page';
import { BatchDetailPageComponent } from './pages/batch-detail.page';
import { BatchesPageComponent } from './pages/batches.page';
import { BenchPageComponent } from './pages/bench.page';
import { ExtraordinaryPageComponent } from './pages/extraordinary.page';
import { LiveSessionPageComponent } from './pages/live-session.page';
import { MinutesPageComponent } from './pages/minutes.page';
import { OpinionPageComponent } from './pages/opinion.page';
import { RapporteurCasesPageComponent } from './pages/rapporteur-cases.page';
import { SessionsPageComponent } from './pages/sessions.page';
import { ViewsPageComponent } from './pages/views.page';

export const COLEGIADO_ROUTES: Routes = moduleRoutes('colegiado', {
  'colegiado/:orgao/distribuicao': { component: BatchesPageComponent },
  'colegiado/:orgao/distribuicao/:loteId': {
    component: BatchDetailPageComponent,
  },
  'colegiado/:orgao/relatoria': { component: RapporteurCasesPageComponent },
  'colegiado/:orgao/relatoria/:caseId/voto': {
    component: OpinionPageComponent,
  },
  'colegiado/:orgao/pauta': { component: AgendaBuilderPageComponent },
  'colegiado/:orgao/sessoes': { component: SessionsPageComponent },
  'colegiado/:orgao/sessoes/:id': { component: LiveSessionPageComponent },
  'colegiado/:orgao/sessoes/:id/banca': { component: BenchPageComponent },
  'colegiado/:orgao/sessoes/:id/ata': { component: MinutesPageComponent },
  'colegiado/:orgao/vistas': { component: ViewsPageComponent },
  'colegiado/:orgao/extraordinaria': { component: ExtraordinaryPageComponent },
});
