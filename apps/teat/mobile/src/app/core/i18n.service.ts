import { Inject, Injectable } from '@angular/core';
import { StynxI18nService } from '@stynx-nyx/angular-i18n';
import { TEAT_I18N } from './i18n-catalog.js';

const namespaces = [
  'teat.shell.',
  'teat.common.',
  'teat.states.',
  'teat.errors.',
  'teat.screens.',
  'teat.forms.',
  'teat.legal.',
  'teat.sync.',
  'teat.readiness.',
  'teat.navigation.',
  'teat.a11y.',
  'teat.provisioning.',
];
const knownKeys = new Set(Object.keys(TEAT_I18N));

interface StynxTranslator {
  translate(
    key: string,
    params?: Readonly<Record<string, string | number>>,
  ): string;
}

@Injectable({ providedIn: 'root' })
export class TeatI18n {
  private readonly stynx: StynxTranslator;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(@Inject(StynxI18nService) runtime: StynxTranslator) {
    this.stynx = runtime;
  }

  translate(
    key: string,
    params: Readonly<Record<string, string | number>> = {},
  ): string {
    if (!namespaces.some((namespace) => key.startsWith(namespace))) {
      throw new Error('unknown-i18n-namespace');
    }
    if (!knownKeys.has(key)) throw new Error('unknown-i18n-key');
    return this.stynx.translate(key, params);
  }
}
