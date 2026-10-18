// Raiz da prévia (R-0033 TASK-0003; `frontend-preview-mode.md` §2): a faixa de prévia acima da
// raiz do app, sem tocar `AppComponent` (`src/index.preview.html` monta `<portal-preview-root>`).
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { PreviewBarComponent } from './preview-bar.component';

@Component({
  selector: 'portal-preview-root',
  imports: [PreviewBarComponent, AppComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<portal-preview-bar /><portal-root />`,
})
export class PreviewRootComponent {}
