// R-0033 TASK-0007. fixtures/portal-fixtures.json transcribes named JSON exports from:
// src/testing/http-fixtures.ts (seed 70-fixtures-portal.sql, CTG-0003a),
// src/testing/http-fixtures-reads.ts (generated examples + CTG-0003b),
// src/testing/http-fixtures-pair3.ts (seed + CTG-0003c).
// ME_PAIR3_FIXTURE and ME_PAIR3_WITH_DATA_FIXTURE are omitted: their plaintext CPF has no
// canonical seed source. Identity reads use ME_RESPONSE_FIXTURE, without invented identity fields.
import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export const PREVIEW_FIXTURE_LOADER = new InjectionToken<
  () => Promise<Record<string, unknown>>
>('PREVIEW_FIXTURE_LOADER', {
  providedIn: 'root',
  factory: () => {
    const http = inject(HttpClient);
    return () =>
      firstValueFrom(
        http.get<Record<string, unknown>>(
          'assets/preview/portal-fixtures.json',
        ),
      );
  },
});

@Injectable({ providedIn: 'root' })
export class PreviewFixtures {
  private readonly load = inject(PREVIEW_FIXTURE_LOADER);
  private fixture: Promise<Record<string, unknown>> | null = null;

  async read<T>(name: string): Promise<T> {
    this.fixture ??= this.load();
    const values = await this.fixture;
    if (!Object.hasOwn(values, name))
      throw new Error(`source_pending: ${name}`);
    return structuredClone(values[name]) as T;
  }
}
