// Raiz provisória do scaffold (R-0012 M1): o Engineer do CTG-0002a monta aqui o RaitShellComponent.
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'rait-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<main></main>`,
})
export class AppComponent {}
