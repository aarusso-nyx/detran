import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TeatTranslatePipe } from './teat-translate.pipe.js';

@Component({
  selector: 'teat-page-header',
  standalone: true,
  imports: [TeatTranslatePipe],
  template: `<h1>{{ titleKey() | teatTranslate }}</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly titleKey = input('teat.navigation.home');
}
