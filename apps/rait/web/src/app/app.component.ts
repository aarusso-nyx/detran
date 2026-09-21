// Raiz do app (spec §5.1; contrato CTG-0002a §5): monta o `RaitShellComponent`, que envolve o
// `DetranAppShellComponent` do kit (com o `router-outlet`).
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RaitShellComponent } from './core/rait-shell.component';

@Component({
  selector: 'rait-root',
  imports: [RaitShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<rait-shell />`,
})
export class AppComponent {}
