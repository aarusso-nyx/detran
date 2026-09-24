/** Deterministic, in-memory event stream for UI demonstration only. */
import { InjectionToken } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';

export interface TeatWebHomologationEvents {
  stream(options?: {
    readonly topics?: readonly string[];
  }): Observable<unknown>;
  fallback?(options?: {
    readonly topics?: readonly string[];
  }): Observable<unknown>;
  simulateOutage?(): void;
}

export const TEAT_WEB_HOMOLOGATION_EVENTS =
  new InjectionToken<TeatWebHomologationEvents>('TEAT_WEB_HOMOLOGATION_EVENTS');

export function createTeatWebHomologationEvents(): TeatWebHomologationEvents {
  const outages = new Subject<void>();
  let unavailable = false;
  return {
    stream: (options) =>
      new Observable<unknown>((observer) => {
        if (unavailable) {
          observer.error(new Error('demo-stream-unavailable'));
          return;
        }
        const topics = options?.topics?.length
          ? options.topics
          : ['homologation.refresh'];
        for (const type of topics) observer.next({ type, synthetic: true });
        const subscription = outages.subscribe(() =>
          observer.error(new Error('demo-stream-unavailable')),
        );
        return () => subscription.unsubscribe();
      }),
    fallback: (options) =>
      from(
        (options?.topics?.length
          ? options.topics
          : ['homologation.refresh']
        ).map((type) => ({ type, synthetic: true, fallback: true })),
      ),
    simulateOutage: () => {
      unavailable = true;
      outages.next();
    },
  };
}
