import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { EMPTY, type Observable } from 'rxjs';

export type ResourceState<T> =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'ready'; value: T }>
  | Readonly<{ status: 'error'; error: unknown }>;

@Injectable({ providedIn: 'root' })
export class WebResourceFacade<T = unknown> {
  private readonly http = inject(HttpClient, { optional: true });
  readonly state = signal<ResourceState<T>>({ status: 'idle' });

  query(url: string): Observable<T> {
    return this.http?.get<T>(url) ?? EMPTY;
  }

  load(request: Observable<T>): void {
    this.state.set({ status: 'loading' });
    request.subscribe({
      next: (value) => this.state.set({ status: 'ready', value }),
      error: (error: unknown) => this.state.set({ status: 'error', error }),
    });
  }
}
