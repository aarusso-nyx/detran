// LegalBasisTag (CTG-0002.md §8 item 6): a citação legal é dado do backend, não token — vai
// literal em `<cite>`. Nenhum número aparece sem a base ao lado (D-03 §9).
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'dash-legal-basis-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-legal-basis]': 'legalBasis()' },
  template: `<cite>{{ legalBasis() }}</cite>`,
})
export class LegalBasisTagComponent {
  readonly legalBasis = input.required<string>();
}
