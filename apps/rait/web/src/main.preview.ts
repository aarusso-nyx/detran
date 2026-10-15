// Entrada do modo prévia (R-0033 TASK-0003; `frontend-preview-mode.md` §1 item 1, §2; ADR-0033
// como precedente: `apps/teat/web/src/main.homologation.ts`). Só a configuração `preview` do
// `angular.json` usa esta entrada; `production`/`development` partem de `src/main.ts` e não
// alcançam `src/app/preview/**` (gate de marca M4).
import { bootstrapApplication } from '@angular/platform-browser';
import { PreviewRootComponent } from './app/preview/preview-root.component';
import { providePreviewMode } from './app/preview/preview.providers';

bootstrapApplication(PreviewRootComponent, {
  providers: [...providePreviewMode()],
}).catch((error: unknown) => {
  console.error(error);
});
