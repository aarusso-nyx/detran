import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  BodycamIndicator,
  TEAT_BODYCAM_STATE,
} from './core/bodycam-indicator.component.js';
import { FieldShellComponent } from './core/field-shell.component.js';

@Component({
  selector: 'teat-root',
  standalone: true,
  imports: [FieldShellComponent, BodycamIndicator, RouterOutlet],
  template: `
    <teat-field-shell>
      <teat-bodycam-indicator [state]="bodycamState()" />
      <router-outlet />
    </teat-field-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly bodycamState = inject(TEAT_BODYCAM_STATE).state;
}
