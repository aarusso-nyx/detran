// Módulo `caso` (rait-web-frontend.md §4; route-manifest.md; contrato CTG-0002a §3 e CTG-0002b
// §6.1 linhas 6–17): rotas derivadas do manifesto — guardas, `title` e `data` vêm da fábrica
// (`moduleRoutes`); o layout `casos/:id` recebe o `CaseLayoutPageComponent` (CaseHeader +
// abas + router-outlet, guia §3.2) e as 11 abas as páginas L2, ligadas por `path`.
import type { Routes } from '@angular/router';
import { moduleRoutes } from '../../core/manifest-routes';
import { CaseDecisionPageComponent } from './pages/case-decision.page';
import { CaseLayoutPageComponent } from './pages/case-layout.page';
import { CaseSummaryPageComponent } from './pages/case-summary.page';
import { CommunicationsPageComponent } from './pages/communications.page';
import { DeadlinesPageComponent } from './pages/deadlines.page';
import { DossierPageComponent } from './pages/dossier.page';
import { DraftPageComponent } from './pages/draft.page';
import { HistoryPageComponent } from './pages/history.page';
import { ImpedimentsPageComponent } from './pages/impediments.page';
import { InquiriesPageComponent } from './pages/inquiries.page';
import { PartiesPageComponent } from './pages/parties.page';
import { TriagePageComponent } from './pages/triage.page';

export const CASO_ROUTES: Routes = moduleRoutes('caso', {
  'casos/:id': { component: CaseLayoutPageComponent },
  'casos/:id/resumo': { component: CaseSummaryPageComponent },
  'casos/:id/triagem': { component: TriagePageComponent },
  'casos/:id/dossie': { component: DossierPageComponent },
  'casos/:id/diligencias': { component: InquiriesPageComponent },
  'casos/:id/minuta': { component: DraftPageComponent },
  'casos/:id/decisao': { component: CaseDecisionPageComponent },
  'casos/:id/prazos': { component: DeadlinesPageComponent },
  'casos/:id/partes': { component: PartiesPageComponent },
  'casos/:id/comunicacoes': { component: CommunicationsPageComponent },
  'casos/:id/impedimentos': { component: ImpedimentsPageComponent },
  'casos/:id/historico': { component: HistoryPageComponent },
});
