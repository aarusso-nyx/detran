import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const STREAM_URL = '/v1/ops/stream';
const POLLING_INTERVAL_MS = 15_000;

export interface SseStreamOptions {
  readonly topics?: readonly string[];
  readonly fallbackUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class SseService {
  private readonly http = inject(HttpClient);

  stream(options: SseStreamOptions = {}): Observable<unknown> {
    return new Observable<unknown>((observer) => {
      const topics = options.topics ?? [];
      const streamUrl =
        topics.length === 0
          ? STREAM_URL
          : `${STREAM_URL}?topics=${encodeURIComponent(topics.join(','))}`;
      const fallbackUrl = options.fallbackUrl ?? STREAM_URL;
      let fallbackStarted = false;
      let pollingSubscription: Readonly<{ unsubscribe(): void }> | undefined;
      const startPolling = (): void => {
        if (fallbackStarted) return;
        fallbackStarted = true;
        pollingSubscription = timer(POLLING_INTERVAL_MS, POLLING_INTERVAL_MS)
          .pipe(
            switchMap(() =>
              this.http.get(fallbackUrl).pipe(catchError(() => EMPTY)),
            ),
          )
          .subscribe(observer);
      };

      if (typeof EventSource === 'undefined') {
        startPolling();
        return () => pollingSubscription?.unsubscribe();
      }

      const source = new EventSource(streamUrl);
      const receive = (event: Event): void => {
        const data = (event as MessageEvent<string>).data;
        try {
          observer.next(JSON.parse(data) as unknown);
        } catch {
          observer.next(data);
        }
      };
      if (topics.length === 0) source.onmessage = receive;
      else topics.forEach((topic) => source.addEventListener(topic, receive));
      source.onerror = startPolling;

      return () => {
        topics.forEach((topic) => source.removeEventListener(topic, receive));
        source.close();
        pollingSubscription?.unsubscribe();
      };
    });
  }
}
