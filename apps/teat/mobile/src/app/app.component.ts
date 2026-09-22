import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  BodycamIndicator,
  type BodycamState,
} from './core/bodycam-indicator.component.js';
import { FieldShellComponent } from './core/field-shell.component.js';

@Component({
  selector: 'teat-root',
  standalone: true,
  imports: [FieldShellComponent, BodycamIndicator, RouterOutlet],
  template: `
    <teat-field-shell>
      <teat-bodycam-indicator [state]="bodycamState" />
      <router-outlet />
    </teat-field-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly bodycamState: BodycamState = 'failure';
}
