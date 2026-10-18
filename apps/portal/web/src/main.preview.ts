// R-0033 TASK-0007: isolated preview entry, frontend-preview-mode.md §10.
import { bootstrapApplication } from '@angular/platform-browser';
import { PreviewRootComponent } from './app/preview/preview-root.component';
import { providePreviewMode } from './app/preview/preview.providers';

bootstrapApplication(PreviewRootComponent, {
  providers: providePreviewMode(),
}).catch((error: unknown) => console.error(error));
