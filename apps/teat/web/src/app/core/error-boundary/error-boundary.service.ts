import { Injectable } from '@angular/core';

import catalog from '../../i18n/teat.pt-BR.json';

export interface TeatClassifiedError {
  readonly code: string;
  readonly messageKey: string;
}

@Injectable({ providedIn: 'root' })
export class ErrorBoundary {
  classify(error: unknown): TeatClassifiedError {
    const code = this.readCode(error);
    const candidate = `teat.errors.${code.replace(/^TEAT\./, '').toLowerCase()}`;
    return {
      code,
      messageKey:
        candidate in (catalog as Readonly<Record<string, string>>)
          ? candidate
          : 'teat.errors.internal',
    };
  }

  private readCode(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
    ) {
      return error.code;
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof error.error === 'object' &&
      error.error !== null &&
      'code' in error.error &&
      typeof error.error.code === 'string'
    ) {
      return error.error.code;
    }
    return 'TEAT.INTERNAL';
  }
}
