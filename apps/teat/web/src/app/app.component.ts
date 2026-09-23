import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ErrorOutletComponent } from './core/error-boundary/error-outlet.component.js';

@Component({
  selector: 'teat-root',
  imports: [RouterOutlet, ErrorOutletComponent],
  template: '<teat-error-outlet><router-outlet /></teat-error-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
