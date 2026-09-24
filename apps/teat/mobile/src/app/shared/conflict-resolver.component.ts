import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'teat-conflict-resolver',
  standalone: true,
  template: `<section>
    <h2>{{ title() }}</h2>
    @for (choice of choices(); track choice) {
      <button type="button" (click)="resolved.emit(choice)">
        {{ choice }}
      </button>
    }
  </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConflictResolver {
  readonly title = input.required<string>();
  readonly choices = input.required<readonly string[]>();
  readonly resolved = output<string>();
}
