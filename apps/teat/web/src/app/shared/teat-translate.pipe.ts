import { inject, Pipe, type PipeTransform } from '@angular/core';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';

@Pipe({ name: 'teatTranslate', standalone: true })
export class TeatTranslatePipe implements PipeTransform {
  private readonly i18n = inject(StynxI18nService, { optional: true });

  transform(key: string): string {
    return this.i18n?.translate(key) || key;
  }
}
